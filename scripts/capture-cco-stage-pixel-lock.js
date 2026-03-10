#!/usr/bin/env node
require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBaseUrl(value) {
  const input = normalizeText(value);
  if (!input) return 'http://localhost:3000';
  return input.replace(/\/+$/, '');
}

function sanitizeName(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function roundPx(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Number(numeric.toFixed(2));
}

function withinTolerance(value, target, tolerance = 1) {
  const numeric = Number(value);
  const expected = Number(target);
  if (!Number.isFinite(numeric) || !Number.isFinite(expected)) return false;
  return Math.abs(numeric - expected) <= tolerance;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fetchJson(baseUrl, routePath, { method = 'GET', body, token = '' } = {}) {
  const headers = {
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const detail =
      normalizeText(payload?.error) ||
      normalizeText(payload?.message) ||
      normalizeText(text).slice(0, 240) ||
      `${response.status} ${response.statusText}`;
    throw new Error(`${method} ${routePath} failed: ${detail}`);
  }
  return payload;
}

async function resolveBuildId(baseUrl) {
  const response = await fetch(`${baseUrl}/cco`, {
    redirect: 'follow',
  });
  const buildId = normalizeText(response.headers.get('x-arcana-ui-build'));
  await response.arrayBuffer();
  return buildId;
}

async function readMfaSecretFromStore({ email = '', authStorePath = './data/auth.json' } = {}) {
  const normalizedEmail = normalizeText(email).toLowerCase();
  if (!normalizedEmail) return '';
  const filePath = path.resolve(String(authStorePath || './data/auth.json'));
  try {
    const raw = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const users = raw && raw.users && typeof raw.users === 'object' ? Object.values(raw.users) : [];
    const user =
      users.find(
        (item) => normalizeText(item?.email).toLowerCase() === normalizedEmail
      ) || null;
    return normalizeText(user?.mfaSecret);
  } catch {
    return '';
  }
}

function decodeBase32(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = String(secret || '')
    .toUpperCase()
    .replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const ch of normalized) {
    const index = alphabet.indexOf(ch);
    if (index < 0) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function generateTotpCode(secret) {
  const key = decodeBase32(secret);
  if (!key.length) return '';
  const counter = Math.floor(Date.now() / 1000 / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1000000).padStart(6, '0');
}

async function resolveToken({
  baseUrl,
  email,
  password,
  tenantId = '',
  mfaCode = '',
  mfaSecret = '',
  mfaRecoveryCode = '',
  authStorePath = './data/auth.json',
}) {
  const loginResponse = await fetchJson(baseUrl, '/api/v1/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
      tenantId: tenantId || undefined,
    },
  });

  if (loginResponse?.token) {
    return {
      token: String(loginResponse.token),
      authTenantId: normalizeText(loginResponse?.tenantId) || tenantId,
    };
  }

  let authStep = loginResponse;
  if (authStep?.requiresMfa === true) {
    const providedCode = normalizeText(mfaCode);
    const providedRecoveryCode = normalizeText(mfaRecoveryCode);
    let resolvedMfaSecret = normalizeText(mfaSecret);
    if (!providedCode && !providedRecoveryCode && !resolvedMfaSecret) {
      resolvedMfaSecret = normalizeText(authStep?.mfa?.secret);
    }
    if (!providedCode && !providedRecoveryCode && !resolvedMfaSecret) {
      resolvedMfaSecret = await readMfaSecretFromStore({ email, authStorePath });
    }
    const verifyCode = providedCode || generateTotpCode(resolvedMfaSecret) || providedRecoveryCode;
    if (!verifyCode) {
      throw new Error('MFA krävs men saknar kod/secret/recovery code.');
    }
    const mfaTicket = normalizeText(authStep?.mfaTicket);
    if (!mfaTicket) {
      throw new Error('MFA krävs men mfaTicket saknas.');
    }
    authStep = await fetchJson(baseUrl, '/api/v1/auth/mfa/verify', {
      method: 'POST',
      body: {
        mfaTicket,
        code: verifyCode,
        tenantId: tenantId || undefined,
      },
    });
  }

  if (authStep?.token) {
    return {
      token: String(authStep.token),
      authTenantId: normalizeText(authStep?.tenantId) || tenantId,
    };
  }

  if (authStep?.requiresTenantSelection === true) {
    const loginTicket = normalizeText(authStep?.loginTicket);
    const tenants = Array.isArray(authStep?.tenants) ? authStep.tenants : [];
    const selectedTenantId =
      normalizeText(tenantId) || normalizeText(tenants?.[0]?.tenantId);
    if (!loginTicket || !selectedTenantId) {
      throw new Error('Tenant-val krävs men loginTicket/tenantId saknas.');
    }
    const tenantResponse = await fetchJson(baseUrl, '/api/v1/auth/select-tenant', {
      method: 'POST',
      body: {
        loginTicket,
        tenantId: selectedTenantId,
      },
    });
    if (!tenantResponse?.token) {
      throw new Error('Tenant-val slutfördes utan token.');
    }
    return {
      token: String(tenantResponse.token),
      authTenantId: normalizeText(tenantResponse?.tenantId) || selectedTenantId,
    };
  }

  throw new Error('Login gav ingen token.');
}

async function waitForCcoShell(page) {
  await page.waitForSelector('#ccoWorkspaceLayout', {
    state: 'visible',
    timeout: 45000,
  });
  await page.waitForFunction(() => {
    const workspace = document.getElementById('ccoWorkspaceLayout');
    const section = document.getElementById('ccoWorkspaceSection');
    if (!workspace || !section) return false;
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn && loginBtn.offsetParent !== null) return false;
    return section.offsetParent !== null;
  }, null, { timeout: 45000 });
}

async function ensureQueueData(page) {
  await page.waitForFunction(() => {
    const queueRows = document.querySelectorAll('#ccoInboxWorklist .ccoConversationSelectBtn').length;
    const loading = document.getElementById('ccoCenterLoadingState');
    const loadingVisible =
      !!loading &&
      loading.offsetParent !== null &&
      getComputedStyle(loading).display !== 'none' &&
      !loading.hidden;
    return queueRows > 0 || !loadingVisible;
  }, null, { timeout: 20000 });

  let rowCount = await page.locator('#ccoInboxWorklist .ccoConversationSelectBtn').count();
  if (rowCount > 0) return rowCount;

  const runBriefBtn = page.locator('#runCcoInboxBtn');
  if ((await runBriefBtn.count()) > 0) {
    await runBriefBtn.click();
    await page.waitForFunction(
      () => document.querySelectorAll('#ccoInboxWorklist .ccoConversationSelectBtn').length > 0,
      null,
      { timeout: 45000 }
    );
  }
  rowCount = await page.locator('#ccoInboxWorklist .ccoConversationSelectBtn').count();
  if (rowCount === 0) {
    throw new Error('Kunde inte hitta några rader i Arbetskö.');
  }
  return rowCount;
}

async function ensureMailView(page, mode) {
  const button = page.locator(`#ccoInboxModeToggle button[data-cco-mail-view="${mode}"]`);
  if ((await button.count()) === 0) {
    throw new Error(`Saknar knapp för mail view: ${mode}`);
  }
  const isActive = await button.evaluate((node) => node.classList.contains('is-active'));
  if (!isActive) {
    await button.click();
  }
  await page.waitForFunction(
    (nextMode) => {
      const layout = document.getElementById('ccoWorkspaceLayout');
      return layout?.getAttribute('data-cco-mail-view') === nextMode;
    },
    mode,
    { timeout: 15000 }
  );
}

async function ensureDensityMode(page, mode) {
  const button = page.locator(`#ccoInboxDensityFilters button[data-cco-density-mode="${mode}"]`);
  if ((await button.count()) === 0) {
    throw new Error(`Saknar knapp för density mode: ${mode}`);
  }
  const isActive = await button.evaluate((node) => node.classList.contains('is-active'));
  if (!isActive) {
    await button.click();
  }
  await page.waitForFunction(
    (nextMode) => {
      const layout = document.getElementById('ccoWorkspaceLayout');
      return layout?.getAttribute('data-cco-density-mode') === nextMode;
    },
    mode,
    { timeout: 15000 }
  );
}

async function clearSearch(page) {
  const input = page.locator('#ccoInboxSearchInput');
  if ((await input.count()) === 0) return;
  await input.fill('');
  await page.waitForTimeout(250);
}

async function selectFirstQueueThread(page) {
  await ensureMailView(page, 'queue');
  await ensureDensityMode(page, 'work');
  await clearSearch(page);
  await ensureQueueData(page);
  const row = page.locator('#ccoInboxWorklist .ccoConversationSelectBtn').first();
  await row.click();
  await page.waitForFunction(() => {
    const replyColumn = document.getElementById('ccoReplyColumn');
    const composeStudio = document.getElementById('ccoComposeStudio');
    const draft = document.getElementById('ccoDraftBodyInput');
    return (
      replyColumn?.classList.contains('is-compose') === true &&
      draft &&
      draft.disabled === false &&
      composeStudio &&
      composeStudio.offsetParent !== null
    );
  }, null, { timeout: 20000 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.getElementById('ccoInboxWorklist')?.scrollTo(0, 0);
    document.getElementById('ccoConversationColumn')?.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

async function selectFirstFeedItem(page, mode) {
  await ensureMailView(page, mode);
  await clearSearch(page);
  await page.waitForFunction(
    () =>
      document.querySelectorAll('#ccoInboxFeedList .ccoFeedSelectBtn').length > 0 ||
      document.getElementById('ccoCenterColumn')?.classList.contains('is-empty') === true,
    null,
    { timeout: 20000 }
  );
  const count = await page.locator('#ccoInboxFeedList .ccoFeedSelectBtn').count();
  if (count === 0) {
    throw new Error(`Kunde inte hitta någon read-only-rad i vyn ${mode}.`);
  }
  await page.locator('#ccoInboxFeedList .ccoFeedSelectBtn').first().click();
  await page.waitForFunction(() => {
    const replyColumn = document.getElementById('ccoReplyColumn');
    const banner = document.getElementById('ccoReplyReadOnlyBanner');
    return (
      replyColumn?.classList.contains('is-readonly') === true &&
      banner &&
      banner.hidden === false &&
      banner.offsetParent !== null
    );
  }, null, { timeout: 20000 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.getElementById('ccoConversationColumn')?.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

async function captureEmptyFilterState(page) {
  await ensureMailView(page, 'queue');
  await ensureDensityMode(page, 'work');
  await selectFirstQueueThread(page);
  const input = page.locator('#ccoInboxSearchInput');
  await input.fill('zzzz-no-visible-thread-match-cco-pixel-lock');
  await page.waitForFunction(() => {
    const centerColumn = document.getElementById('ccoCenterColumn');
    const replyColumn = document.getElementById('ccoReplyColumn');
    const centerMeta = document.getElementById('ccoCenterEmptyStateMeta');
    const replyEmpty = document.getElementById('ccoReplyEmptyState');
    return (
      centerColumn?.classList.contains('is-empty') === true &&
      replyColumn?.classList.contains('is-empty') === true &&
      centerMeta &&
      centerMeta.offsetParent !== null &&
      replyEmpty &&
      replyEmpty.offsetParent !== null
    );
  }, null, { timeout: 20000 });
  await page.waitForTimeout(300);
  const state = await page.evaluate(() => ({
    centerMessage: String(document.getElementById('ccoCenterEmptyStateMeta')?.textContent || '').trim(),
    replyMessage: String(
      document.querySelector('#ccoReplyEmptyState .mini.muted')?.textContent || ''
    ).trim(),
  }));
  return state;
}

async function resetFromEmptyFilter(page) {
  await clearSearch(page);
  await page.waitForFunction(
    () => document.querySelectorAll('#ccoInboxWorklist .ccoConversationSelectBtn').length > 0,
    null,
    { timeout: 20000 }
  );
  await selectFirstQueueThread(page);
}

async function setHistoryCollapsed(page, collapsed) {
  try {
    await page.waitForSelector('#ccoHistoryCollapseBtn', {
      state: 'attached',
      timeout: 10000,
    });
  } catch {
    const debugInfo = await page.evaluate(() => ({
      replyClasses: document.getElementById('ccoReplyColumn')?.className || null,
      workspaceView: document.getElementById('ccoWorkspaceLayout')?.getAttribute('data-cco-mail-view') || null,
      workspaceDensity:
        document.getElementById('ccoWorkspaceLayout')?.getAttribute('data-cco-density-mode') || null,
      bodyHasHistoryButtonText: document.body.innerHTML.includes('ccoHistoryCollapseBtn'),
      replyTitle: String(document.getElementById('ccoReplyColumnTitle')?.textContent || '').trim(),
      composeVisible: document.getElementById('ccoComposeStudio')?.offsetParent !== null,
      conversationVisible: document.getElementById('ccoConversationColumn')?.offsetParent !== null,
    }));
    throw new Error(`Saknar historik-knapp. Debug=${JSON.stringify(debugInfo)}`);
  }
  const button = page.locator('#ccoHistoryCollapseBtn');
  const currentExpanded = await button.getAttribute('aria-expanded');
  const shouldExpand = collapsed ? 'false' : 'true';
  if (currentExpanded !== shouldExpand) {
    await button.click();
  }
  await page.waitForFunction(
    (nextCollapsed) => {
      const reply = document.getElementById('ccoReplyColumn');
      if (!reply) return false;
      return reply.classList.contains('is-history-collapsed') === nextCollapsed;
    },
    collapsed,
    { timeout: 10000 }
  );
  await page.waitForTimeout(200);
}

async function collectQueueMetrics(page) {
  return page.evaluate(() => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const list = document.getElementById('ccoCenterColumn');
    const reply = document.getElementById('ccoReplyColumn');
    const history = document.getElementById('ccoConversationColumn');
    const compose = document.getElementById('ccoComposeStudio');
    const editor = document.getElementById('ccoDraftBodyInput');
    const rowButtons = Array.from(
      document.querySelectorAll('#ccoInboxWorklist .ccoConversationSelectBtn')
    );
    const firstRowRect = rowButtons[0]?.getBoundingClientRect?.() || null;
    const visibleRowCount = rowButtons.filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < viewportHeight;
    }).length;
    const selectedRow = document.querySelector('#ccoInboxWorklist .cco-thread.active .cco-thread-btn');
    const normalRow = rowButtons.find(
      (node) => !node.closest('.cco-thread')?.classList.contains('active')
    );
    return {
      topBudget: round(firstRowRect?.top || 0),
      listWidth: round(list?.getBoundingClientRect?.().width || 0),
      replyWidth: round(reply?.getBoundingClientRect?.().width || 0),
      historyWidth: round(history?.getBoundingClientRect?.().width || 0),
      composeWidth: round(compose?.getBoundingClientRect?.().width || 0),
      editorHeight: round(editor?.getBoundingClientRect?.().height || 0),
      visibleRowCount,
      selectedRowHeight: round(selectedRow?.getBoundingClientRect?.().height || 0),
      normalRowHeight: round(normalRow?.getBoundingClientRect?.().height || 0),
      historyGap:
        history && compose
          ? round(compose.getBoundingClientRect().left - history.getBoundingClientRect().right)
          : 0,
      totalMainWidth:
        list && reply
          ? round(reply.getBoundingClientRect().right - list.getBoundingClientRect().left)
          : 0,
    };

    function round(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return 0;
      return Number(numeric.toFixed(2));
    }
  });
}

async function collectReadOnlyMetrics(page) {
  return page.evaluate(() => {
    const reply = document.getElementById('ccoReplyColumn');
    const history = document.getElementById('ccoConversationColumn');
    const banner = document.getElementById('ccoReplyReadOnlyBanner');
    const compose = document.getElementById('ccoComposeStudio');
    return {
      isReadOnly: reply?.classList.contains('is-readonly') === true,
      bannerVisible: !!banner && banner.hidden === false && banner.offsetParent !== null,
      conversationWidth: round(history?.getBoundingClientRect?.().width || 0),
      composeVisible: !!compose && compose.offsetParent !== null,
    };

    function round(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return 0;
      return Number(numeric.toFixed(2));
    }
  });
}

function validateQueueMetrics({ viewport, metrics }) {
  const failures = [];
  if (viewport.width === 1440 && metrics.topBudget > 152) {
    failures.push(`Top budget ${metrics.topBudget}px överstiger 152px på 1440x900.`);
  }
  if (viewport.width === 1536 && metrics.topBudget > 164) {
    failures.push(`Top budget ${metrics.topBudget}px överstiger 164px på 1536x960.`);
  }
  if (viewport.width === 1440 && metrics.visibleRowCount < 9) {
    failures.push(`Endast ${metrics.visibleRowCount} synliga rader på 1440x900.`);
  }
  if (viewport.width === 1536 && metrics.visibleRowCount < 10) {
    failures.push(`Endast ${metrics.visibleRowCount} synliga rader på 1536x960.`);
  }
  if (metrics.historyWidth < 260) {
    failures.push(`Historikbredd ${metrics.historyWidth}px understiger 260px.`);
  }
  if (!withinTolerance(metrics.historyGap, 12, 1)) {
    failures.push(`Gap mellan historik och studio är ${metrics.historyGap}px i stället för 12px.`);
  }
  if (!withinTolerance(metrics.normalRowHeight, 64, 1)) {
    failures.push(`Normal mailrad är ${metrics.normalRowHeight}px i stället för 64px.`);
  }
  if (!withinTolerance(metrics.selectedRowHeight, 72, 1)) {
    failures.push(`Vald mailrad är ${metrics.selectedRowHeight}px i stället för 72px.`);
  }
  return failures;
}

async function captureQueueViewport(browser, options) {
  const { baseUrl, token, authTenantId, viewport, outputPath } = options;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'sv-SE',
  });
  await context.addInitScript(
    ({ injectedToken, injectedTenantId }) => {
      try {
        localStorage.setItem('ARCANA_ADMIN_TOKEN', injectedToken);
        if (injectedTenantId) {
          localStorage.setItem('ARCANA_ADMIN_TENANT_ID', injectedTenantId);
        }
      } catch {}
    },
    { injectedToken: token, injectedTenantId: authTenantId }
  );
  const page = await context.newPage();
  await page.goto(`${baseUrl}/cco`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await waitForCcoShell(page);
  await selectFirstQueueThread(page);
  const metrics = await collectQueueMetrics(page);
  await page.screenshot({ path: outputPath, fullPage: false });
  await context.close();
  return metrics;
}

async function captureScenarioPage(browser, options, callback) {
  const { baseUrl, token, authTenantId, viewport } = options;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'sv-SE',
  });
  await context.addInitScript(
    ({ injectedToken, injectedTenantId }) => {
      try {
        localStorage.setItem('ARCANA_ADMIN_TOKEN', injectedToken);
        if (injectedTenantId) {
          localStorage.setItem('ARCANA_ADMIN_TENANT_ID', injectedTenantId);
        }
      } catch {}
    },
    { injectedToken: token, injectedTenantId: authTenantId }
  );
  const page = await context.newPage();
  await page.goto(`${baseUrl}/cco`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await waitForCcoShell(page);
  await callback(page);
  await context.close();
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.env.BASE_URL);
  const outputDir = path.resolve(
    process.env.OUTPUT_DIR || `./artifacts/cco-pixel-lock-${Date.now()}`
  );
  const screenshotsDir = path.join(outputDir, 'screenshots');
  const expectedBuildId = normalizeText(process.env.EXPECTED_BUILD_ID);
  const email = normalizeText(process.env.ARCANA_OWNER_EMAIL);
  const password = normalizeText(process.env.ARCANA_OWNER_PASSWORD);
  const tenantId = normalizeText(process.env.ARCANA_DEFAULT_TENANT);
  const mfaCode = normalizeText(process.env.ARCANA_OWNER_MFA_CODE);
  const mfaSecret = normalizeText(process.env.ARCANA_OWNER_MFA_SECRET);
  const mfaRecoveryCode = normalizeText(process.env.ARCANA_OWNER_MFA_RECOVERY_CODE);
  const authStorePath = normalizeText(process.env.AUTH_STORE_PATH) || './data/auth.json';

  if (!email || !password) {
    throw new Error('ARCANA_OWNER_EMAIL och ARCANA_OWNER_PASSWORD krävs.');
  }

  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (error) {
    throw new Error(`playwright saknas: ${error.message}`);
  }

  await ensureDir(screenshotsDir);

  const auth = await resolveToken({
    baseUrl,
    email,
    password,
    tenantId,
    mfaCode,
    mfaSecret,
    mfaRecoveryCode,
    authStorePath,
  });

  const buildId = await resolveBuildId(baseUrl);
  if (expectedBuildId && buildId && expectedBuildId !== buildId) {
    throw new Error(
      `Build mismatch. Expected ${expectedBuildId}, got ${buildId || 'missing build header'}.`
    );
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const queue1440Path = path.join(screenshotsDir, 'queue-1440x900.png');
  const queue1536Path = path.join(screenshotsDir, 'queue-1536x960.png');
  const inboundPath = path.join(screenshotsDir, 'inbound-readonly-1536x960.png');
  const sentPath = path.join(screenshotsDir, 'sent-readonly-1536x960.png');
  const emptyPath = path.join(screenshotsDir, 'empty-filter-1536x960.png');
  const historyExpandedPath = path.join(screenshotsDir, 'history-expanded-1728x1117.png');
  const historyCollapsedPath = path.join(screenshotsDir, 'history-collapsed-1728x1117.png');

  const queue1440Viewport = { width: 1440, height: 900 };
  const queue1536Viewport = { width: 1536, height: 960 };
  const queue1728Viewport = { width: 1728, height: 1117 };

  const queue1440 = await captureQueueViewport(browser, {
    baseUrl,
    token: auth.token,
    authTenantId: auth.authTenantId,
    viewport: queue1440Viewport,
    outputPath: queue1440Path,
  });
  const queue1536 = await captureQueueViewport(browser, {
    baseUrl,
    token: auth.token,
    authTenantId: auth.authTenantId,
    viewport: queue1536Viewport,
    outputPath: queue1536Path,
  });

  const extra = {
    readOnlyInbound: null,
    readOnlySent: null,
    emptyFilter: null,
    historyExpanded: null,
    historyCollapsed: null,
    queue1728: null,
  };

  await captureScenarioPage(
    browser,
    {
      baseUrl,
      token: auth.token,
      authTenantId: auth.authTenantId,
      viewport: queue1536Viewport,
    },
    async (page) => {
      await selectFirstFeedItem(page, 'inbound');
      extra.readOnlyInbound = await collectReadOnlyMetrics(page);
      await page.screenshot({ path: inboundPath, fullPage: false });
    }
  );

  await captureScenarioPage(
    browser,
    {
      baseUrl,
      token: auth.token,
      authTenantId: auth.authTenantId,
      viewport: queue1536Viewport,
    },
    async (page) => {
      await selectFirstFeedItem(page, 'sent');
      extra.readOnlySent = await collectReadOnlyMetrics(page);
      await page.screenshot({ path: sentPath, fullPage: false });
    }
  );

  await captureScenarioPage(
    browser,
    {
      baseUrl,
      token: auth.token,
      authTenantId: auth.authTenantId,
      viewport: queue1536Viewport,
    },
    async (page) => {
      extra.emptyFilter = await captureEmptyFilterState(page);
      await page.screenshot({ path: emptyPath, fullPage: false });
    }
  );

  await captureScenarioPage(
    browser,
    {
      baseUrl,
      token: auth.token,
      authTenantId: auth.authTenantId,
      viewport: queue1728Viewport,
    },
    async (page) => {
      await selectFirstQueueThread(page);
      await setHistoryCollapsed(page, false);
      extra.queue1728 = await collectQueueMetrics(page);
      extra.historyExpanded = {
        ...extra.queue1728,
      };
      await page.screenshot({ path: historyExpandedPath, fullPage: false });
      await setHistoryCollapsed(page, true);
      extra.historyCollapsed = await collectQueueMetrics(page);
      await page.screenshot({ path: historyCollapsedPath, fullPage: false });
    }
  );

  await browser.close();

  const failures = [
    ...validateQueueMetrics({ viewport: queue1440Viewport, metrics: queue1440 }),
    ...validateQueueMetrics({ viewport: queue1536Viewport, metrics: queue1536 }),
  ];

  if (extra.readOnlyInbound?.isReadOnly !== true || extra.readOnlyInbound?.bannerVisible !== true) {
    failures.push('Alla inkomna är inte verifierat read-only med synlig banner.');
  }
  if (extra.readOnlySent?.isReadOnly !== true || extra.readOnlySent?.bannerVisible !== true) {
    failures.push('Skickat är inte verifierat read-only med synlig banner.');
  }
  if (extra.emptyFilter?.replyMessage !== extra.emptyFilter?.centerMessage) {
    failures.push('Tomt filterläge speglar inte samma förklarande tommeddelande i högerytan.');
  }
  if (!withinTolerance(extra.historyCollapsed?.historyWidth, 44, 1)) {
    failures.push(
      `Historikens kollapsade bredd är ${roundPx(extra.historyCollapsed?.historyWidth)}px i stället för 44px.`
    );
  }

  const manifest = {
    capturedAt: new Date().toISOString(),
    baseUrl,
    buildId,
    expectedBuildId: expectedBuildId || null,
    tenantId: auth.authTenantId || tenantId || null,
    queue: {
      '1440x900': queue1440,
      '1536x960': queue1536,
      '1728x1117': extra.queue1728,
    },
    readOnly: {
      inbound: extra.readOnlyInbound,
      sent: extra.readOnlySent,
    },
    emptyFilter: extra.emptyFilter,
    history: {
      expanded: extra.historyExpanded,
      collapsed: extra.historyCollapsed,
    },
    screenshots: {
      queue1440x900: path.relative(outputDir, queue1440Path),
      queue1536x960: path.relative(outputDir, queue1536Path),
      inboundReadOnly: path.relative(outputDir, inboundPath),
      sentReadOnly: path.relative(outputDir, sentPath),
      emptyFilter: path.relative(outputDir, emptyPath),
      historyExpanded: path.relative(outputDir, historyExpandedPath),
      historyCollapsed: path.relative(outputDir, historyCollapsedPath),
    },
    validations: {
      passed: failures.length === 0,
      failures,
    },
  };

  const metricsPath = path.join(outputDir, 'metrics.json');
  await fs.writeFile(metricsPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify(manifest, null, 2));

  if (failures.length) {
    throw new Error(failures.join(' | '));
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
