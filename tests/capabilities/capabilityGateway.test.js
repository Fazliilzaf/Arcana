const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const express = require('express');

const { createCapabilitiesRouter } = require('../../src/routes/capabilities');
const { createExecutionGateway } = require('../../src/gateway/executionGateway');
const { createAuthStore } = require('../../src/security/authStore');
const { createCapabilityAnalysisStore } = require('../../src/capabilities/analysisStore');

async function withServer(app, run) {
  const server = await new Promise((resolve) => {
    const started = app.listen(0, () => resolve(started));
  });
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

function createMockAuth(role = 'OWNER') {
  function requireAuth(req, _res, next) {
    req.auth = {
      tenantId: 'tenant-a',
      userId: 'owner-a',
      role,
    };
    next();
  }
  function requireRole(...roles) {
    const allowed = new Set(roles.map((item) => String(item || '').toUpperCase()));
    return (req, res, next) => {
      if (!allowed.has(String(req.auth?.role || '').toUpperCase())) {
        return res.status(403).json({ error: 'Du saknar behörighet för detta.' });
      }
      return next();
    };
  }
  return { requireAuth, requireRole };
}

test('capability run goes through gateway and writes capability + gateway audit trail', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-capability-gateway-'));
  const authStore = await createAuthStore({
    filePath: path.join(tempDir, 'auth.json'),
    sessionTtlMs: 12 * 60 * 60 * 1000,
    sessionIdleTtlMs: 3 * 60 * 60 * 1000,
    loginTicketTtlMs: 10 * 60 * 1000,
    auditAppendOnly: true,
    auditMaxEntries: 5000,
  });
  const analysisStore = await createCapabilityAnalysisStore({
    filePath: path.join(tempDir, 'capability-analysis.json'),
    maxEntries: 2000,
  });

  const app = express();
  app.use(express.json());
  const auth = createMockAuth('OWNER');
  app.use(
    '/api/v1',
    createCapabilitiesRouter({
      authStore,
      tenantConfigStore: {
        async getTenantConfig() {
          return {
            riskSensitivityModifier: 0,
            riskThresholdVersion: 1,
          };
        },
      },
      requireAuth: auth.requireAuth,
      requireRole: auth.requireRole,
      executionGateway: createExecutionGateway({ buildVersion: 'test-build' }),
      capabilityAnalysisStore: analysisStore,
      templateStore: null,
    })
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/capabilities/GenerateTaskPlan/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-correlation-id': 'corr-capability-1',
        'x-idempotency-key': 'idem-capability-1',
      },
      body: JSON.stringify({
        channel: 'admin',
        input: {
          openReviews: [{ id: 'rev-1', riskLevel: 5, decision: 'blocked' }],
          incidents: [{ id: 'inc-1', severity: 'L5', ownerDecision: 'escalate_to_owner' }],
          kpi: { sloBreaches: 1, openUnresolvedIncidents: 1, highCriticalOpenReviews: 1 },
          latestTemplateChanges: [{ templateId: 'tpl-1', updatedAt: '2026-02-01T10:00:00.000Z' }],
        },
      }),
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.capability.name, 'GenerateTaskPlan');
    assert.equal(payload.capability.persistStrategy, 'analysis');
    assert.equal(payload.decision, 'allow');
    assert.equal(Boolean(payload.riskSummary?.input), true);
    assert.equal(Boolean(payload.riskSummary?.output), true);
    assert.equal(payload.policySummary?.blocked, false);
    assert.equal(Array.isArray(payload.output?.data?.tasks), true);
    assert.equal(payload.output.data.tasks.length <= 5, true);
    assert.equal(payload.output?.metadata?.capability, 'GenerateTaskPlan');
  });

  const audits = await authStore.listAuditEvents({
    tenantId: 'tenant-a',
    limit: 200,
  });
  const actions = new Set(audits.map((item) => item.action));
  assert.equal(actions.has('capability.run.start'), true);
  assert.equal(actions.has('capability.run.decision'), true);
  assert.equal(actions.has('capability.run.persist'), true);
  assert.equal(actions.has('capability.run.complete'), true);
  assert.equal(actions.has('gateway.run.start'), true);
  assert.equal(actions.has('gateway.run.decision'), true);
  assert.equal(actions.has('gateway.run.persist'), true);
  assert.equal(actions.has('gateway.run.response'), true);

  const entries = await analysisStore.list({
    tenantId: 'tenant-a',
    capabilityName: 'GenerateTaskPlan',
    limit: 20,
  });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].capability.name, 'GenerateTaskPlan');
  assert.equal(entries[0].decision, 'allow');
});

test('SummarizeIncidents run goes through gateway and persists analysis only', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-capability-summarize-'));
  const authStore = await createAuthStore({
    filePath: path.join(tempDir, 'auth.json'),
    sessionTtlMs: 12 * 60 * 60 * 1000,
    sessionIdleTtlMs: 3 * 60 * 60 * 1000,
    loginTicketTtlMs: 10 * 60 * 1000,
    auditAppendOnly: true,
    auditMaxEntries: 5000,
  });
  const analysisStore = await createCapabilityAnalysisStore({
    filePath: path.join(tempDir, 'capability-analysis.json'),
    maxEntries: 2000,
  });

  const app = express();
  app.use(express.json());
  const auth = createMockAuth('OWNER');
  app.use(
    '/api/v1',
    createCapabilitiesRouter({
      authStore,
      tenantConfigStore: {
        async getTenantConfig() {
          return {
            riskSensitivityModifier: 0,
            riskThresholdVersion: 1,
          };
        },
      },
      requireAuth: auth.requireAuth,
      requireRole: auth.requireRole,
      executionGateway: createExecutionGateway({ buildVersion: 'test-build' }),
      capabilityAnalysisStore: analysisStore,
      templateStore: {
        async listIncidents() {
          return [
            {
              id: 'inc-1',
              category: 'CONSULTATION',
              reasonCodes: ['DISCLOSURE_MISSING', 'DISCLOSURE_MISSING'],
              severity: 'L5',
              riskLevel: 5,
              status: 'open',
              ownerDecision: 'pending',
              openedAt: '2026-02-25T10:00:00.000Z',
              updatedAt: '2026-02-26T10:00:00.000Z',
              sla: { state: 'critical', breached: false, deadline: '2026-02-26T12:00:00.000Z' },
            },
            {
              id: 'inc-2',
              category: 'AFTERCARE',
              reasonCodes: ['DISCLAIMERS_MISSING'],
              severity: 'L4',
              riskLevel: 4,
              status: 'open',
              ownerDecision: 'pending',
              openedAt: '2026-02-24T09:00:00.000Z',
              updatedAt: '2026-02-26T09:00:00.000Z',
              sla: { state: 'warn', breached: false, deadline: '2026-02-26T14:00:00.000Z' },
            },
          ];
        },
        async summarizeIncidents() {
          return {
            bySlaState: { critical: 1, warn: 1, breached: 0 },
            generatedAt: '2026-02-26T10:05:00.000Z',
          };
        },
      },
    })
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/capabilities/SummarizeIncidents/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-correlation-id': 'corr-capability-sum-1',
        'x-idempotency-key': 'idem-capability-sum-1',
      },
      body: JSON.stringify({
        channel: 'admin',
        input: {
          includeClosed: false,
          timeframeDays: 14,
        },
      }),
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.capability.name, 'SummarizeIncidents');
    assert.equal(payload.capability.persistStrategy, 'analysis');
    assert.equal(payload.decision, 'allow');
    assert.equal(Boolean(payload.riskSummary?.input), true);
    assert.equal(Boolean(payload.riskSummary?.output), true);
    assert.equal(payload.policySummary?.blocked, false);
    assert.equal(typeof payload.output?.data?.summary, 'string');
    assert.equal(Array.isArray(payload.output?.data?.recommendations), true);
    assert.equal(payload.output.data.recommendations.length <= 5, true);
    assert.equal(payload.output?.metadata?.capability, 'SummarizeIncidents');
  });

  const entries = await analysisStore.list({
    tenantId: 'tenant-a',
    capabilityName: 'SummarizeIncidents',
    limit: 20,
  });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].capability.name, 'SummarizeIncidents');
  assert.equal(entries[0].capability.persistStrategy, 'analysis');
  assert.equal(Boolean(entries[0].metadata?.channel), true);

  const otherEntries = await analysisStore.list({
    tenantId: 'tenant-a',
    capabilityName: 'GenerateTaskPlan',
    limit: 20,
  });
  assert.equal(otherEntries.length, 0);
});

test('GenerateTaskPlan enforces output risk + policy evaluation before response', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-capability-risk-enforce-'));
  const authStore = await createAuthStore({
    filePath: path.join(tempDir, 'auth.json'),
    sessionTtlMs: 12 * 60 * 60 * 1000,
    sessionIdleTtlMs: 3 * 60 * 60 * 1000,
    loginTicketTtlMs: 10 * 60 * 1000,
    auditAppendOnly: true,
    auditMaxEntries: 5000,
  });
  const analysisStore = await createCapabilityAnalysisStore({
    filePath: path.join(tempDir, 'capability-analysis.json'),
    maxEntries: 2000,
  });

  const app = express();
  app.use(express.json());
  const auth = createMockAuth('OWNER');
  app.use(
    '/api/v1',
    createCapabilitiesRouter({
      authStore,
      tenantConfigStore: {
        async getTenantConfig() {
          return {
            riskSensitivityModifier: 2,
            riskThresholdVersion: 2,
          };
        },
      },
      requireAuth: auth.requireAuth,
      requireRole: auth.requireRole,
      executionGateway: createExecutionGateway({ buildVersion: 'test-build' }),
      capabilityAnalysisStore: analysisStore,
      templateStore: null,
    })
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/capabilities/GenerateTaskPlan/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'admin',
        input: {
          maxTasks: 3,
          openReviews: [{ id: 'rev-1', riskLevel: 5, decision: 'blocked' }],
          incidents: [{ id: 'inc-1', severity: 'L5', ownerDecision: 'escalate_to_owner' }],
          latestTemplateChanges: [{ templateId: 'tpl-1', updatedAt: '2026-02-01T10:00:00.000Z' }],
          kpi: { highCriticalOpenReviews: 2, sloBreaches: 1, openUnresolvedIncidents: 1 },
        },
      }),
    });

    assert.equal([200, 403].includes(response.status), true);
    const payload = await response.json();
    if (response.status === 200) {
      assert.equal(Boolean(payload.riskSummary?.output?.decision), true);
      assert.equal(Boolean(payload.riskSummary?.output?.versions?.ruleSetVersion), true);
      assert.equal(Boolean(payload.policySummary), true);
      assert.equal(payload.policySummary?.blocked, false);
      return;
    }
    assert.equal(typeof payload.error, 'string');
    assert.equal(payload.error.length > 0, true);
  });
});

test('SummarizeIncidents enforces output risk + policy evaluation before response', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-capability-summarize-enforce-'));
  const authStore = await createAuthStore({
    filePath: path.join(tempDir, 'auth.json'),
    sessionTtlMs: 12 * 60 * 60 * 1000,
    sessionIdleTtlMs: 3 * 60 * 60 * 1000,
    loginTicketTtlMs: 10 * 60 * 1000,
    auditAppendOnly: true,
    auditMaxEntries: 5000,
  });
  const analysisStore = await createCapabilityAnalysisStore({
    filePath: path.join(tempDir, 'capability-analysis.json'),
    maxEntries: 2000,
  });

  const app = express();
  app.use(express.json());
  const auth = createMockAuth('OWNER');
  app.use(
    '/api/v1',
    createCapabilitiesRouter({
      authStore,
      tenantConfigStore: {
        async getTenantConfig() {
          return {
            riskSensitivityModifier: 2,
            riskThresholdVersion: 2,
          };
        },
      },
      requireAuth: auth.requireAuth,
      requireRole: auth.requireRole,
      executionGateway: createExecutionGateway({ buildVersion: 'test-build' }),
      capabilityAnalysisStore: analysisStore,
      templateStore: null,
    })
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/capabilities/SummarizeIncidents/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'admin',
        input: {
          includeClosed: true,
          timeframeDays: 30,
        },
        systemStateSnapshot: {
          incidents: [
            {
              id: 'inc-1',
              category: 'CONSULTATION',
              reasonCodes: ['GUARANTEE_LANGUAGE', 'DIAGNOSIS_TONE'],
              severity: 'L5',
              riskLevel: 5,
              status: 'open',
              ownerDecision: 'pending',
              updatedAt: new Date().toISOString(),
              sla: { state: 'breached', breached: true },
            },
          ],
          timestamps: {
            capturedAt: new Date().toISOString(),
          },
        },
      }),
    });

    assert.equal([200, 403].includes(response.status), true);
    const payload = await response.json();
    if (response.status === 200) {
      assert.equal(Boolean(payload.riskSummary?.output?.decision), true);
      assert.equal(Boolean(payload.riskSummary?.output?.versions?.ruleSetVersion), true);
      assert.equal(Boolean(payload.policySummary), true);
      assert.equal(payload.policySummary?.blocked, false);
      return;
    }
    assert.equal(typeof payload.error, 'string');
    assert.equal(payload.error.length > 0, true);
  });
});

test('capability run rejects disallowed channel before gateway execution', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-capability-channel-'));
  const authStore = await createAuthStore({
    filePath: path.join(tempDir, 'auth.json'),
    sessionTtlMs: 12 * 60 * 60 * 1000,
    sessionIdleTtlMs: 3 * 60 * 60 * 1000,
    loginTicketTtlMs: 10 * 60 * 1000,
    auditAppendOnly: true,
    auditMaxEntries: 2000,
  });
  const analysisStore = await createCapabilityAnalysisStore({
    filePath: path.join(tempDir, 'capability-analysis.json'),
    maxEntries: 2000,
  });

  const app = express();
  app.use(express.json());
  const auth = createMockAuth('OWNER');
  app.use(
    '/api/v1',
    createCapabilitiesRouter({
      authStore,
      tenantConfigStore: {
        async getTenantConfig() {
          return {};
        },
      },
      requireAuth: auth.requireAuth,
      requireRole: auth.requireRole,
      executionGateway: createExecutionGateway({ buildVersion: 'test-build' }),
      capabilityAnalysisStore: analysisStore,
      templateStore: null,
    })
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/capabilities/GenerateTaskPlan/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'patient',
        input: {
          openReviews: [],
          incidents: [],
          kpi: {},
          latestTemplateChanges: [],
        },
      }),
    });

    assert.equal(response.status, 403);
    const payload = await response.json();
    assert.equal(payload.code, 'CAPABILITY_CHANNEL_DENIED');
  });

  const entries = await analysisStore.list({
    tenantId: 'tenant-a',
    capabilityName: 'GenerateTaskPlan',
    limit: 20,
  });
  assert.equal(entries.length, 0);
});

test('capability meta exposes registry + agent bundles', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-capability-meta-'));
  const authStore = await createAuthStore({
    filePath: path.join(tempDir, 'auth.json'),
    sessionTtlMs: 12 * 60 * 60 * 1000,
    sessionIdleTtlMs: 3 * 60 * 60 * 1000,
    loginTicketTtlMs: 10 * 60 * 1000,
    auditAppendOnly: true,
    auditMaxEntries: 2000,
  });
  const analysisStore = await createCapabilityAnalysisStore({
    filePath: path.join(tempDir, 'capability-analysis.json'),
    maxEntries: 2000,
  });

  const app = express();
  app.use(express.json());
  const auth = createMockAuth('OWNER');
  app.use(
    '/api/v1',
    createCapabilitiesRouter({
      authStore,
      tenantConfigStore: {
        async getTenantConfig() {
          return {};
        },
      },
      requireAuth: auth.requireAuth,
      requireRole: auth.requireRole,
      executionGateway: createExecutionGateway({ buildVersion: 'test-build' }),
      capabilityAnalysisStore: analysisStore,
      templateStore: null,
    })
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/capabilities/meta`);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(Array.isArray(payload.capabilities), true);
    assert.equal(
      payload.capabilities.some((item) => item?.name === 'GenerateTaskPlan'),
      true
    );
    assert.equal(
      payload.capabilities.some((item) => item?.name === 'SummarizeIncidents'),
      true
    );
    assert.equal(Array.isArray(payload.agentBundles), true);
    assert.equal(payload.agentBundles.some((item) => item?.role === 'COO'), true);
    const coo = payload.agentBundles.find((item) => item?.role === 'COO');
    assert.equal(Array.isArray(coo?.capabilities), true);
    assert.equal(coo.capabilities.includes('SummarizeIncidents'), true);
  });
});
