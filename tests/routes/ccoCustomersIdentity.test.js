const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const express = require('express');

const { createCcoCustomersRouter } = require('../../src/routes/ccoCustomers');
const { createCcoCustomerStore } = require('../../src/ops/ccoCustomerStore');
const { createCcoHistoryStore } = require('../../src/ops/ccoHistoryStore');

async function withServer(app, run) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function createFixture({ withHistory = false } = {}) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-customers-identity-'));
  const historyStore = withHistory
    ? await createCcoHistoryStore({
        filePath: path.join(tempDir, 'history.json'),
      })
    : null;
  const customerStore = await createCcoCustomerStore({
    filePath: path.join(tempDir, 'customers.json'),
    historyStore,
  });
  const auditEvents = [];

  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.auth = {
      tenantId: 'tenant-a',
      userId: 'owner-1',
      role: 'owner',
    };
    next();
  });
  app.use(
    '/api/v1',
    createCcoCustomersRouter({
      customerStore,
      authStore: {
        async addAuditEvent(event) {
          auditEvents.push(event);
          return true;
        },
      },
      requireAuth(_req, _res, next) {
        next();
      },
      requireRole() {
        return (_req, _res, next) => next();
      },
    })
  );

  return {
    app,
    tempDir,
    customerStore,
    historyStore,
    auditEvents,
  };
}

async function seedCrossMailboxState(customerStore) {
  await customerStore.saveTenantCustomerState({
    tenantId: 'tenant-a',
    customerState: {
      directory: {
        anna_main: {
          name: 'Anna Karlsson',
          vip: false,
          emailCoverage: 1,
          duplicateCandidate: false,
          profileCount: 1,
          customerValue: 0,
          totalConversations: 3,
          totalMessages: 8,
        },
        anna_alt: {
          name: 'Anna Karlsson',
          vip: true,
          emailCoverage: 1,
          duplicateCandidate: false,
          profileCount: 1,
          customerValue: 0,
          totalConversations: 2,
          totalMessages: 4,
        },
      },
      details: {
        anna_main: {
          emails: ['anna.one@example.com'],
          phone: '0701234567',
          mailboxes: ['kons'],
        },
        anna_alt: {
          emails: ['anna.one+vip@gmail.com'],
          phone: '0701234567',
          mailboxes: ['contact'],
        },
      },
      profileCounts: {
        anna_main: 1,
        anna_alt: 1,
      },
      primaryEmailByKey: {
        anna_main: 'anna.one@example.com',
        anna_alt: 'anna.one+vip@gmail.com',
      },
    },
  });
}

test('cco customer identity suggestions hittar samma kund over flera inboxar och mejladresser', async () => {
  const fixture = await createFixture();

  try {
    await seedCrossMailboxState(fixture.customerStore);

    await withServer(fixture.app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/cco/customers/identity/suggestions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.equal(payload.duplicateCount, 1);
      assert.equal(Array.isArray(payload.suggestionGroups.anna_main), true);
      assert.equal(payload.suggestionGroups.anna_main.length, 1);
      assert.equal(payload.suggestionGroups.anna_main[0].id, 'anna_alt::anna_main');
      assert.equal(
        payload.suggestionGroups.anna_main[0].reasons.some((reason) =>
          /telefonnummer|inboxar|kundnamn/i.test(reason)
        ),
        true
      );
    });

    assert.equal(
      fixture.auditEvents.some((event) => event.action === 'cco.customers.identity.suggestions'),
      true
    );
  } finally {
    await fs.rm(fixture.tempDir, { recursive: true, force: true });
  }
});

test('cco customer identity merge sparar canonical pair id och slar ihop mailboxhistorik', async () => {
  const fixture = await createFixture();

  try {
    await seedCrossMailboxState(fixture.customerStore);

    await withServer(fixture.app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/cco/customers/identity/merge`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          primaryKey: 'anna_main',
          secondaryKeys: ['anna_alt'],
          suggestionId: 'anna_main::anna_alt',
        }),
      });

      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.equal(payload.customerState.mergedInto.anna_alt, 'anna_main');
      assert.equal(payload.customerState.acceptedSuggestionIds.includes('anna_alt::anna_main'), true);
      assert.deepEqual(payload.customerState.details.anna_main.emails.sort(), [
        'anna.one+vip@gmail.com',
        'anna.one@example.com',
      ]);
      assert.deepEqual(payload.customerState.details.anna_main.mailboxes.sort(), ['contact', 'kons']);
    });
  } finally {
    await fs.rm(fixture.tempDir, { recursive: true, force: true });
  }
});

test('cco customer identity split och primary email kan persisteras via backend', async () => {
  const fixture = await createFixture();

  try {
    await fixture.customerStore.saveTenantCustomerState({
      tenantId: 'tenant-a',
      customerState: {
        directory: {
          anna_main: {
            name: 'Anna Karlsson',
            vip: false,
            emailCoverage: 2,
            duplicateCandidate: true,
            profileCount: 2,
            customerValue: 0,
            totalConversations: 4,
            totalMessages: 9,
          },
        },
        details: {
          anna_main: {
            emails: ['anna.one@example.com', 'anna.one+vip@gmail.com'],
            phone: '0701234567',
            mailboxes: ['kons', 'contact'],
          },
        },
        profileCounts: {
          anna_main: 2,
        },
        primaryEmailByKey: {
          anna_main: 'anna.one@example.com',
        },
      },
    });

    await withServer(fixture.app, async (baseUrl) => {
      const primaryResponse = await fetch(`${baseUrl}/cco/customers/identity/primary-email`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          customerKey: 'anna_main',
          email: 'anna.one+vip@gmail.com',
        }),
      });

      assert.equal(primaryResponse.status, 200);
      const primaryPayload = await primaryResponse.json();
      assert.equal(primaryPayload.customerState.primaryEmailByKey.anna_main, 'anna.one+vip@gmail.com');

      const splitResponse = await fetch(`${baseUrl}/cco/customers/identity/split`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          customerKey: 'anna_main',
          email: 'anna.one@example.com',
        }),
      });

      assert.equal(splitResponse.status, 200);
      const splitPayload = await splitResponse.json();
      assert.ok(splitPayload.newKey);
      assert.deepEqual(splitPayload.customerState.details.anna_main.emails, ['anna.one+vip@gmail.com']);
      assert.deepEqual(splitPayload.customerState.details[splitPayload.newKey].emails, ['anna.one@example.com']);
    });
  } finally {
    await fs.rm(fixture.tempDir, { recursive: true, force: true });
  }
});

test('cco customer state materialiserar backfillad historik och kan mergea live-profiler', async () => {
  const fixture = await createFixture({ withHistory: true });

  try {
    await fixture.historyStore.upsertMailboxWindow({
      tenantId: 'tenant-a',
      mailboxId: 'kons@hairtpclinic.com',
      windowStartIso: '2026-03-20T00:00:00.000Z',
      windowEndIso: '2026-03-21T00:00:00.000Z',
      messages: [
        {
          messageId: 'msg-1',
          conversationId: 'conv-1',
          customerEmail: 'anna.one@example.com',
          senderEmail: 'anna.one@example.com',
          senderName: 'Anna Karlsson',
          sentAt: '2026-03-20T09:00:00.000Z',
          subject: 'Hej från Anna',
          bodyPreview: 'Första mejlet.',
          direction: 'inbound',
          mailboxAddress: 'kons@hairtpclinic.com',
        },
      ],
    });

    await fixture.historyStore.upsertMailboxWindow({
      tenantId: 'tenant-a',
      mailboxId: 'contact@hairtpclinic.com',
      windowStartIso: '2026-03-20T00:00:00.000Z',
      windowEndIso: '2026-03-21T00:00:00.000Z',
      messages: [
        {
          messageId: 'msg-2',
          conversationId: 'conv-2',
          customerEmail: 'anna.one+vip@gmail.com',
          senderEmail: 'anna.one+vip@gmail.com',
          senderName: 'Anna Karlsson',
          sentAt: '2026-03-20T10:00:00.000Z',
          subject: 'Hej igen',
          bodyPreview: 'Andra mejlet.',
          direction: 'inbound',
          mailboxAddress: 'contact@hairtpclinic.com',
        },
      ],
    });

    await withServer(fixture.app, async (baseUrl) => {
      const stateResponse = await fetch(`${baseUrl}/cco/customers/state`);
      assert.equal(stateResponse.status, 200);
      const statePayload = await stateResponse.json();

      const detailEntries = Object.entries(statePayload.customerState.details);
      const annaMainEntry = detailEntries.find(([, value]) =>
        Array.isArray(value.emails) ? value.emails.includes('anna.one@example.com') : false
      );
      const annaAltEntry = detailEntries.find(([, value]) =>
        Array.isArray(value.emails) ? value.emails.includes('anna.one+vip@gmail.com') : false
      );

      assert.ok(annaMainEntry);
      assert.ok(annaAltEntry);
      assert.notEqual(annaMainEntry[0], annaAltEntry[0]);

      const primaryKey = annaMainEntry[0];
      const secondaryKey = annaAltEntry[0];

      const mergeResponse = await fetch(`${baseUrl}/cco/customers/identity/merge`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          primaryKey,
          secondaryKeys: [secondaryKey],
          suggestionId: `${primaryKey}::${secondaryKey}`,
        }),
      });
      assert.equal(mergeResponse.status, 200);
      const mergePayload = await mergeResponse.json();
      assert.equal(mergePayload.customerState.mergedInto[secondaryKey], primaryKey);
      assert.deepEqual(mergePayload.customerState.details[primaryKey].emails.sort(), [
        'anna.one+vip@gmail.com',
        'anna.one@example.com',
      ]);
      assert.deepEqual(mergePayload.customerState.details[primaryKey].mailboxes.sort(), [
        'contact',
        'kons',
      ]);
    });
  } finally {
    await fs.rm(fixture.tempDir, { recursive: true, force: true });
  }
});
