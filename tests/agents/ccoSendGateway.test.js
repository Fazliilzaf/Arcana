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
        return res.status(403).json({ error: 'Du saknar behorighet for detta.' });
      }
      return next();
    };
  }
  return { requireAuth, requireRole };
}

async function withSendEnv(run) {
  const prevEnabled = process.env.ARCANA_GRAPH_SEND_ENABLED;
  const prevAllowlist = process.env.ARCANA_GRAPH_SEND_ALLOWLIST;
  process.env.ARCANA_GRAPH_SEND_ENABLED = 'true';
  process.env.ARCANA_GRAPH_SEND_ALLOWLIST =
    'contact@hairtpclinic.com,owner@hairtpclinic.se,egzona@hairtpclinic.com,fazli@hairtpclinic.com,kons@hairtpclinic.com';
  try {
    await run();
  } finally {
    if (prevEnabled === undefined) delete process.env.ARCANA_GRAPH_SEND_ENABLED;
    else process.env.ARCANA_GRAPH_SEND_ENABLED = prevEnabled;
    if (prevAllowlist === undefined) delete process.env.ARCANA_GRAPH_SEND_ALLOWLIST;
    else process.env.ARCANA_GRAPH_SEND_ALLOWLIST = prevAllowlist;
  }
}

test('CCO send route uses gateway enforcement, writes audit, and idempotency prevents double send', async () => {
  await withSendEnv(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-send-'));
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

  let sendCalls = 0;
  let lastSendArgs = null;
  const graphSendConnector = {
    async sendReply({ mailboxId, sourceMailboxId, replyToMessageId, body, subject, to }) {
      sendCalls += 1;
      lastSendArgs = { mailboxId, sourceMailboxId, replyToMessageId, body, subject, to };
      return {
        provider: 'microsoft_graph',
        mailboxId,
        sourceMailboxId,
        replyToMessageId,
        subject,
        to,
        sentAt: new Date().toISOString(),
      };
    },
  };

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
      graphSendConnector,
    })
  );

  const longReplyToMessageId =
    'AAMkAGI2YzgzYTM1LTY3MjctNDE3Ny05MjI4LWFlY2Y4YjYzM2Y4YQBGAAAAAAAL1mSz9YxqQ7gkW6Hf4nV3BwD7z3U2F2F6R5Q8dWQ3n8fFAAAAgEMAAA' +
    'D7z3U2F2F6R5Q8dWQ3n8fFAAAAgENAAD__' +
    'x'.repeat(360);

  const payload = {
    channel: 'admin',
    mailboxId: 'owner@hairtpclinic.se',
    replyToMessageId: longReplyToMessageId,
    conversationId: 'conv-1',
    to: ['patient@example.com'],
    subject: 'Uppfoljning',
    body: 'Hej, tack for ditt meddelande. Vi aterkommer snarast.',
    idempotencyKey: 'send-1',
  };

  await withServer(app, async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/v1/cco/send`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': 'send-1',
      },
      body: JSON.stringify(payload),
    });
    assert.equal(first.status, 200);
    const firstBody = await first.json();
    assert.equal(firstBody.decision, 'allow');
    assert.equal(firstBody.send?.mode, 'manual');
    assert.equal(typeof firstBody.preview?.bodyHtml, 'string');
    assert.equal(String(firstBody.preview?.bodyHtml || '').includes('<img'), true);
    assert.equal(
      String(firstBody.preview?.bodyHtml || '').includes('hairtpclinic-mark-light.svg'),
      true
    );
    assert.equal(String(firstBody.preview?.bodyHtml || '').includes('<svg'), false);
    assert.equal(
      String(firstBody.preview?.bodyHtml || '').includes('signature-web-icon.svg'),
      false
    );
    assert.equal(String(firstBody.preview?.bodyHtml || '').includes('>Webb<'), true);
    assert.equal(String(firstBody.preview?.bodyHtml || '').includes('>Instagram<'), true);
    assert.equal(String(firstBody.preview?.bodyHtml || '').includes('>Facebook<'), true);

    const second = await fetch(`${baseUrl}/api/v1/cco/send`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': 'send-1',
      },
      body: JSON.stringify(payload),
    });
    assert.equal(second.status, 200);
    const secondBody = await second.json();
    assert.equal(secondBody.decision, 'allow');
  });

  assert.equal(sendCalls, 1);
  assert.equal(lastSendArgs.mailboxId, 'contact@hairtpclinic.com');
  assert.equal(lastSendArgs.sourceMailboxId, 'owner@hairtpclinic.se');
  assert.equal(lastSendArgs.replyToMessageId, longReplyToMessageId);
  assert.equal(String(lastSendArgs.body || '').includes('Bästa hälsningar'), true);
  assert.equal(String(lastSendArgs.body || '').includes('Hair TP Clinic'), true);
  assert.equal(String(lastSendArgs.body || '').includes('Patientservice'), true);
  assert.equal(String(lastSendArgs.body || '').includes('contact@hairtpclinic.com'), true);

  const entries = await analysisStore.list({
    tenantId: 'tenant-a',
    capabilityName: 'CCO.SendReply',
    limit: 20,
  });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].capability.persistStrategy, 'analysis');
  assert.equal(String(entries[0].output?.bodyPreview || '').includes('patient@example.com'), false);

  const audits = await authStore.listAuditEvents({
    tenantId: 'tenant-a',
    limit: 300,
  });
  const actions = new Set(audits.map((item) => item.action));
    assert.equal(actions.has('cco.send.requested'), true);
    assert.equal(actions.has('cco.send.sent'), true);
    assert.equal(actions.has('gateway.run.decision'), true);
  });
});

test('CCO send route allows same-mailbox reply without explicit to[]', async () => {
  await withSendEnv(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-send-inline-reply-'));
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

    let sendCalls = 0;
    let lastSendArgs = null;
    const graphSendConnector = {
      async sendReply(args) {
        sendCalls += 1;
        lastSendArgs = args;
        return {
          provider: 'microsoft_graph',
          mailboxId: args.mailboxId,
          sourceMailboxId: args.sourceMailboxId,
          replyToMessageId: args.replyToMessageId,
          subject: args.subject,
          to: args.to || [],
          sentAt: new Date().toISOString(),
          sendMode: 'reply',
        };
      },
    };

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
        graphSendConnector,
      })
    );

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/cco/send`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': 'send-inline-reply-1',
        },
        body: JSON.stringify({
          channel: 'admin',
          mailboxId: 'kons@hairtpclinic.com',
          senderMailboxId: 'kons@hairtpclinic.com',
          replyToMessageId: 'msg-inline-1',
          conversationId: 'conv-inline-1',
          subject: 'Re: Konsultation',
          body: 'Hej, tack for ditt meddelande. Vi svarar fran samma mailbox.',
          idempotencyKey: 'send-inline-reply-1',
        }),
      });
      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.equal(payload.decision, 'allow');
    });

    assert.equal(sendCalls, 1);
    assert.equal(lastSendArgs.mailboxId, 'kons@hairtpclinic.com');
    assert.equal(lastSendArgs.sourceMailboxId, 'kons@hairtpclinic.com');
    assert.deepEqual(lastSendArgs.to, []);
  });
});

test('CCO send route allows compose mode without conversationId or replyToMessageId', async () => {
  await withSendEnv(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-send-compose-'));
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

    let sendCalls = 0;
    let lastSendArgs = null;
    const graphSendConnector = {
      async sendNewMessage(args) {
        sendCalls += 1;
        lastSendArgs = args;
        return {
          provider: 'microsoft_graph',
          mailboxId: args.mailboxId,
          sourceMailboxId: args.sourceMailboxId,
          replyToMessageId: null,
          subject: args.subject,
          to: args.to || [],
          sentAt: new Date().toISOString(),
          sendMode: 'send_mail',
        };
      },
    };

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
        graphSendConnector,
      })
    );

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/cco/send`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': 'send-compose-1',
        },
        body: JSON.stringify({
          channel: 'admin',
          mode: 'compose',
          mailboxId: 'kons@hairtpclinic.com',
          senderMailboxId: 'contact@hairtpclinic.com',
          to: ['patient@example.com'],
          subject: 'Ny kontakt',
          body: 'Hej, vi ville skicka ett helt nytt mejl från nya CCO.',
          idempotencyKey: 'send-compose-1',
        }),
      });
      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.equal(payload.decision, 'allow');
      assert.equal(payload.send?.composeMode, true);
    });

    assert.equal(sendCalls, 1);
    assert.equal(lastSendArgs.mailboxId, 'contact@hairtpclinic.com');
    assert.equal(lastSendArgs.sourceMailboxId, 'kons@hairtpclinic.com');
    assert.deepEqual(lastSendArgs.to, ['patient@example.com']);

    const entries = await analysisStore.list({
      tenantId: 'tenant-a',
      capabilityName: 'CCO.SendCompose',
      limit: 20,
    });
    assert.equal(entries.length, 1);
    assert.equal(entries[0].metadata?.composeMode, true);
  });
});

test('CCO send route uses explicit signature override mailbox when senderMailboxId is omitted', async () => {
  await withSendEnv(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-send-signature-override-'));
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

    let sendCalls = 0;
    let lastSendArgs = null;
    const graphSendConnector = {
      async sendReply(args) {
        sendCalls += 1;
        lastSendArgs = args;
        return {
          provider: 'microsoft_graph',
          mailboxId: args.mailboxId,
          sourceMailboxId: args.sourceMailboxId,
          replyToMessageId: args.replyToMessageId,
          subject: args.subject,
          to: args.to || [],
          sentAt: new Date().toISOString(),
          sendMode: 'reply',
        };
      },
    };

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
        graphSendConnector,
      })
    );

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/cco/send`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': 'send-signature-override-1',
        },
        body: JSON.stringify({
          channel: 'admin',
          mailboxId: 'contact@hairtpclinic.com',
          signatureProfile: 'fazli',
          replyToMessageId: 'msg-signature-override-1',
          conversationId: 'conv-signature-override-1',
          to: ['patient@example.com'],
          subject: 'Uppföljning',
          body: 'Hej, jag återkommer med en konkret tid inom kort.',
          idempotencyKey: 'send-signature-override-1',
        }),
      });
      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.equal(payload.decision, 'allow');
    });

    assert.equal(sendCalls, 1);
    assert.equal(lastSendArgs.mailboxId, 'fazli@hairtpclinic.com');
    assert.equal(lastSendArgs.sourceMailboxId, 'contact@hairtpclinic.com');
    assert.equal(String(lastSendArgs.body || '').includes('Fazli Krasniqi'), true);
    assert.equal(String(lastSendArgs.body || '').includes('fazli@hairtpclinic.com'), true);
  });
});

test('CCO send route honors explicit sourceMailboxId for cross-mailbox replies', async () => {
  await withSendEnv(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-send-cross-mailbox-'));
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

    let sendCalls = 0;
    let lastSendArgs = null;
    const graphSendConnector = {
      async sendReply(args) {
        sendCalls += 1;
        lastSendArgs = args;
        return {
          provider: 'microsoft_graph',
          mailboxId: args.mailboxId,
          sourceMailboxId: args.sourceMailboxId,
          replyToMessageId: args.replyToMessageId,
          subject: args.subject,
          to: args.to || [],
          sentAt: new Date().toISOString(),
          sendMode: 'send_mail',
        };
      },
    };

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
        graphSendConnector,
      })
    );

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/cco/send`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': 'send-cross-mailbox-1',
        },
        body: JSON.stringify({
          channel: 'admin',
          mailboxId: 'contact@hairtpclinic.com',
          sourceMailboxId: 'kons@hairtpclinic.com',
          signatureProfile: 'contact',
          replyToMessageId: 'msg-cross-mailbox-1',
          conversationId: 'conv-cross-mailbox-1',
          to: ['egzona@hairtpclinic.com'],
          subject: 'Uppföljning från contact',
          body: 'Hej, detta ska skickas från contact men svara på en tråd från kons.',
          idempotencyKey: 'send-cross-mailbox-1',
        }),
      });
      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.equal(payload.decision, 'allow');
    });

    assert.equal(sendCalls, 1);
    assert.equal(lastSendArgs.mailboxId, 'contact@hairtpclinic.com');
    assert.equal(lastSendArgs.sourceMailboxId, 'kons@hairtpclinic.com');
    assert.deepEqual(lastSendArgs.to, ['egzona@hairtpclinic.com']);
  });
});

test('CCO send route surfaces persist-stage Graph failures as transport errors', async () => {
  await withSendEnv(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-send-persist-error-'));
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

    const graphSendConnector = {
      async sendReply() {
        const error = new Error('Microsoft Graph createReply failed (503): mailbox move in progress');
        error.code = 'GRAPH_REQUEST_FAILED';
        error.status = 503;
        error.retryAfterSeconds = 10;
        throw error;
      },
    };

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
        graphSendConnector,
      })
    );

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/cco/send`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': 'send-persist-error-1',
        },
        body: JSON.stringify({
          channel: 'admin',
          mailboxId: 'kons@hairtpclinic.com',
          senderMailboxId: 'kons@hairtpclinic.com',
          replyToMessageId: 'msg-persist-error-1',
          conversationId: 'conv-persist-error-1',
          subject: 'Uppföljning',
          body: 'Hej, detta ska ge ett Graph-fel.',
          idempotencyKey: 'send-persist-error-1',
        }),
      });
      assert.equal(response.status, 503);
      const payload = await response.json();
      assert.equal(payload.code, 'GRAPH_REQUEST_FAILED');
      assert.equal(/createReply failed/i.test(String(payload.error || '')), true);
      assert.equal(payload.retryAfterSeconds, 10);
      assert.equal(payload.decision, 'blocked');
    });
  });
});

test('CCO send route blocks when mailbox is not in allowlist and does not call Graph send', async () => {
  await withSendEnv(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-send-allowlist-'));
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

  let sendCalls = 0;
  const graphSendConnector = {
    async sendReply() {
      sendCalls += 1;
      throw new Error('send should not be called');
    },
  };

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
      graphSendConnector,
    })
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/cco/send`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': 'send-allowlist-deny-1',
      },
      body: JSON.stringify({
        channel: 'admin',
        mailboxId: 'not-allowed@hairtpclinic.se',
        senderMailboxId: 'not-allowed@hairtpclinic.se',
        replyToMessageId: 'msg-1',
        conversationId: 'conv-1',
        to: ['patient@example.com'],
        subject: 'Uppfoljning',
        body: 'Hej, detta ska blockeras.',
        idempotencyKey: 'send-allowlist-deny-1',
      }),
    });
    assert.equal(response.status, 403);
    const payload = await response.json();
    assert.equal(payload.code, 'CCO_SEND_ALLOWLIST_BLOCKED');
  });

    assert.equal(sendCalls, 0);
  });
});

test('CCO send route fail-closes when policy/risk blocks unsafe body', async () => {
  await withSendEnv(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-send-policy-'));
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

  let sendCalls = 0;
  const graphSendConnector = {
    async sendReply() {
      sendCalls += 1;
      return {
        provider: 'microsoft_graph',
        sentAt: new Date().toISOString(),
      };
    },
  };

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
      graphSendConnector,
    })
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/cco/send`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': 'send-policy-deny-1',
      },
      body: JSON.stringify({
        channel: 'admin',
        mailboxId: 'owner@hairtpclinic.se',
        replyToMessageId: 'msg-1',
        conversationId: 'conv-1',
        to: ['patient@example.com'],
        subject: 'Svar',
        body: 'Vi garanterar 100% resultat och detta ar en diagnos.',
        idempotencyKey: 'send-policy-deny-1',
      }),
    });
    assert.equal(response.status, 403);
    const payload = await response.json();
    assert.equal(typeof payload.error, 'string');
    assert.equal(payload.error.length > 0, true);
  });

    assert.equal(sendCalls, 0);
    const audits = await authStore.listAuditEvents({
      tenantId: 'tenant-a',
      limit: 300,
    });
    const actions = new Set(audits.map((item) => item.action));
    assert.equal(actions.has('cco.send.blocked'), true);
  });
});
