const { maskInboxText } = require('../privacy/inboxMasking');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampInt(value, min, max, fallback) {
  const parsed = Math.floor(toNumber(value, fallback));
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

function toIso(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function toIsoFromMs(value) {
  if (!Number.isFinite(value)) return '';
  return toIso(new Date(value));
}

function compareIsoDesc(a = '', b = '') {
  return String(b || '').localeCompare(String(a || ''));
}

function trimTrailingSlash(value = '') {
  return String(value || '').replace(/\/+$/, '');
}

function requiredConfig(name, value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    throw new Error(`MicrosoftGraphReadConnector requires ${name}.`);
  }
  return normalized;
}

function parseGraphError(payload = {}, fallback = 'request_failed') {
  const graphError = payload && typeof payload.error === 'object' ? payload.error : {};
  return (
    normalizeText(graphError.message) ||
    normalizeText(payload?.error_description) ||
    normalizeText(payload?.message) ||
    fallback
  );
}

async function parseJsonResponse(response, label = 'request') {
  const payload = (await response.json()) || {};
  if (response?.ok) return payload;
  const status = Number(response?.status || 0);
  const message = parseGraphError(payload, 'graph_request_failed');
  throw new Error(`${label} failed (${status || 'n/a'}): ${message}`);
}

const RISK_WORD_DEFS = Object.freeze([
  { code: 'akut', pattern: /\bakut\b/i },
  { code: 'andningssvarigheter', pattern: /\bandningssvarigheter\b/i },
  { code: 'feber', pattern: /\bfeber\b/i },
  { code: 'infektion', pattern: /\binfektion\b/i },
  { code: 'smarta', pattern: /\bsmarta\b/i },
  { code: 'svullnad', pattern: /\bsvullnad\b/i },
]);

function extractRiskWords(text = '') {
  const source = normalizeText(text);
  if (!source) return [];
  const hits = [];
  for (const definition of RISK_WORD_DEFS) {
    if (!definition.pattern.test(source)) continue;
    hits.push(definition.code);
  }
  return hits;
}

function toNormalizedMessage(raw = {}) {
  const messageId = normalizeText(raw.id);
  if (!messageId) return null;
  const conversationId = normalizeText(raw.conversationId) || `message:${messageId}`;
  const subject = maskInboxText(raw.subject, 180) || '(utan amne)';
  const bodyPreview = maskInboxText(raw.bodyPreview, 360);
  const sentAt = toIso(raw.receivedDateTime || raw.sentDateTime) || null;
  const riskWords = extractRiskWords(`${subject}\n${bodyPreview}`);

  return {
    messageId,
    conversationId,
    subject,
    bodyPreview,
    sentAt,
    riskWords,
  };
}

function toConversationSnapshots(messages = []) {
  const map = new Map();
  for (const message of messages) {
    if (!message) continue;
    if (!map.has(message.conversationId)) {
      map.set(message.conversationId, {
        conversationId: message.conversationId,
        subject: message.subject,
        status: 'open',
        lastInboundAt: message.sentAt || null,
        messages: [],
        riskWords: [],
      });
    }
    const entry = map.get(message.conversationId);
    entry.messages.push({
      messageId: message.messageId,
      direction: 'inbound',
      sentAt: message.sentAt,
      bodyPreview: message.bodyPreview,
    });
    if (message.sentAt && compareIsoDesc(entry.lastInboundAt, message.sentAt) > 0) {
      entry.lastInboundAt = message.sentAt;
    }
    if (
      normalizeText(entry.subject) === '(utan amne)' &&
      normalizeText(message.subject) &&
      normalizeText(message.subject) !== '(utan amne)'
    ) {
      entry.subject = message.subject;
    }
    const riskWordSet = new Set([...(entry.riskWords || []), ...(message.riskWords || [])]);
    entry.riskWords = Array.from(riskWordSet).slice(0, 20);
  }

  const conversations = Array.from(map.values());
  for (const conversation of conversations) {
    conversation.messages.sort((a, b) => compareIsoDesc(a.sentAt, b.sentAt));
  }
  conversations.sort((a, b) => {
    const lastInboundComparison = compareIsoDesc(a.lastInboundAt, b.lastInboundAt);
    if (lastInboundComparison !== 0) return lastInboundComparison;
    return String(a.conversationId).localeCompare(String(b.conversationId));
  });
  return conversations;
}

function createMicrosoftGraphReadConnector(config = {}) {
  const tenantId = requiredConfig('tenantId', config.tenantId);
  const clientId = requiredConfig('clientId', config.clientId);
  const clientSecret = requiredConfig('clientSecret', config.clientSecret);
  const userId = requiredConfig('userId', config.userId);
  const fetchImpl = typeof config.fetchImpl === 'function' ? config.fetchImpl : global.fetch;
  if (typeof fetchImpl !== 'function') {
    throw new Error('MicrosoftGraphReadConnector requires fetch implementation.');
  }

  const authorityHost = trimTrailingSlash(
    normalizeText(config.authorityHost) || 'https://login.microsoftonline.com'
  );
  const graphBaseUrl = trimTrailingSlash(
    normalizeText(config.graphBaseUrl) || 'https://graph.microsoft.com/v1.0'
  );
  const scope = normalizeText(config.scope) || 'https://graph.microsoft.com/.default';
  const now = typeof config.now === 'function' ? config.now : () => Date.now();

  async function fetchAccessToken() {
    const tokenUrl = `${authorityHost}/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope,
      grant_type: 'client_credentials',
    });
    const response = await fetchImpl(tokenUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const payload = await parseJsonResponse(response, 'Microsoft Graph token request');
    const accessToken = normalizeText(payload.access_token);
    if (!accessToken) {
      throw new Error('Microsoft Graph token request succeeded but access_token is missing.');
    }
    return accessToken;
  }

  async function fetchInboxSnapshot(options = {}) {
    const nowMs = Number(now());
    if (!Number.isFinite(nowMs)) {
      throw new Error('MicrosoftGraphReadConnector now() must return a finite timestamp.');
    }

    const windowDays = clampInt(options.days, 1, 30, 14);
    const maxMessages = clampInt(options.maxMessages, 1, 200, 100);
    const includeReadMessages = options.includeRead === true;
    const receivedSinceIso = toIsoFromMs(nowMs - windowDays * 24 * 60 * 60 * 1000);
    const accessToken = await fetchAccessToken();

    const messagesUrl = new URL(
      `${graphBaseUrl}/users/${encodeURIComponent(userId)}/mailFolders/inbox/messages`
    );
    messagesUrl.searchParams.set('$top', String(maxMessages));
    messagesUrl.searchParams.set(
      '$select',
      'id,conversationId,subject,bodyPreview,receivedDateTime,sentDateTime,isRead'
    );
    messagesUrl.searchParams.set('$orderby', 'receivedDateTime desc');
    const filterParts = [`receivedDateTime ge ${receivedSinceIso}`];
    if (!includeReadMessages) filterParts.push('isRead eq false');
    messagesUrl.searchParams.set('$filter', filterParts.join(' and '));

    const messagesResponse = await fetchImpl(messagesUrl.toString(), {
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await parseJsonResponse(messagesResponse, 'Microsoft Graph inbox request');

    const normalizedMessages = Array.isArray(payload.value)
      ? payload.value.map(toNormalizedMessage).filter(Boolean)
      : [];
    const conversations = toConversationSnapshots(normalizedMessages);
    const capturedAt = toIsoFromMs(nowMs) || new Date(nowMs).toISOString();

    const snapshot = {
      snapshotVersion: 'graph.inbox.snapshot.v1',
      source: 'microsoft-graph',
      timestamps: {
        capturedAt,
        sourceGeneratedAt: capturedAt,
      },
      conversations,
      metadata: {
        connector: 'MicrosoftGraphReadConnector',
        windowDays,
        maxMessages,
        includeReadMessages,
        fetchedMessages: normalizedMessages.length,
      },
    };

    if (normalizeText(payload['@odata.nextLink'])) {
      snapshot.warnings = [
        'Graph inbox payload truncated: nextLink present. Pagination support pending.',
      ];
    }

    return snapshot;
  }

  return {
    fetchInboxSnapshot,
  };
}

module.exports = {
  createMicrosoftGraphReadConnector,
};
