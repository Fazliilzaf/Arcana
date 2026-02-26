const test = require('node:test');
const assert = require('node:assert/strict');

const { createMicrosoftGraphReadConnector } = require('../../src/infra/microsoftGraphReadConnector');

function createJsonResponse({ status = 200, body = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
  };
}

test('MicrosoftGraphReadConnector fetches 14-day inbox snapshot using read-only graph request', async () => {
  const fixedNowMs = Date.parse('2026-02-26T18:00:00.000Z');
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (String(url).includes('/oauth2/v2.0/token')) {
      return createJsonResponse({
        body: {
          access_token: 'token-abc',
          expires_in: 3600,
          token_type: 'Bearer',
        },
      });
    }
    if (String(url).includes('/mailFolders/inbox/messages')) {
      return createJsonResponse({
        body: {
          value: [
            {
              id: 'msg-1',
              conversationId: 'conv-1',
              subject: 'Akut fraga efter behandling',
              bodyPreview:
                'Kontakta mig pa 0701234567 eller patient@example.com. Se https://example.com.',
              receivedDateTime: '2026-02-26T16:00:00.000Z',
              isRead: false,
            },
          ],
        },
      });
    }
    throw new Error(`Unexpected URL: ${url}`);
  };

  const connector = createMicrosoftGraphReadConnector({
    tenantId: 'tenant-id-1',
    clientId: 'client-id-1',
    clientSecret: 'client-secret-1',
    userId: 'mailbox@hairtpclinic.se',
    fetchImpl,
    now: () => fixedNowMs,
  });

  const snapshot = await connector.fetchInboxSnapshot();

  assert.equal(calls.length, 2);
  assert.deepEqual(
    calls.map((item) => item.options?.method),
    ['POST', 'GET']
  );

  const tokenRequest = calls[0];
  assert.equal(
    tokenRequest.url.includes('https://login.microsoftonline.com/tenant-id-1/oauth2/v2.0/token'),
    true
  );
  const tokenBody = new URLSearchParams(String(tokenRequest.options?.body || ''));
  assert.equal(tokenBody.get('grant_type'), 'client_credentials');
  assert.equal(tokenBody.get('scope'), 'https://graph.microsoft.com/.default');
  assert.equal(tokenBody.get('client_id'), 'client-id-1');
  assert.equal(tokenBody.get('client_secret'), 'client-secret-1');

  const inboxRequest = calls[1];
  const inboxUrl = new URL(inboxRequest.url);
  assert.equal(inboxUrl.searchParams.get('$top'), '100');
  assert.equal(inboxUrl.searchParams.get('$orderby'), 'receivedDateTime desc');
  assert.equal(
    inboxUrl.searchParams.get('$filter'),
    'receivedDateTime ge 2026-02-12T18:00:00.000Z and isRead eq false'
  );
  assert.equal(
    String(inboxRequest.options?.headers?.authorization || '').startsWith('Bearer '),
    true
  );

  assert.equal(snapshot.snapshotVersion, 'graph.inbox.snapshot.v1');
  assert.equal(snapshot.source, 'microsoft-graph');
  assert.equal(snapshot.timestamps.capturedAt, '2026-02-26T18:00:00.000Z');
  assert.equal(snapshot.metadata.windowDays, 14);
  assert.equal(snapshot.metadata.fetchedMessages, 1);
  assert.equal(snapshot.conversations.length, 1);

  const conversation = snapshot.conversations[0];
  assert.equal(conversation.conversationId, 'conv-1');
  assert.equal(conversation.status, 'open');
  assert.equal(conversation.messages.length, 1);
  const bodyPreview = String(conversation.messages[0].bodyPreview);
  assert.equal(bodyPreview.includes('[telefon]'), true);
  assert.equal(bodyPreview.includes('[email]'), true);
  assert.equal(bodyPreview.includes('[lank]'), true);
  assert.equal(bodyPreview.includes('0701234567'), false);
  assert.equal(bodyPreview.includes('patient@example.com'), false);
  assert.equal(bodyPreview.includes('https://example.com'), false);
  assert.equal(Array.isArray(conversation.riskWords), true);
  assert.equal(conversation.riskWords.includes('akut'), true);
});

test('MicrosoftGraphReadConnector supports custom window and includeRead=true filter', async () => {
  const fixedNowMs = Date.parse('2026-02-26T18:00:00.000Z');
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (String(url).includes('/oauth2/v2.0/token')) {
      return createJsonResponse({
        body: {
          access_token: 'token-xyz',
        },
      });
    }
    return createJsonResponse({
      body: {
        value: [],
      },
    });
  };

  const connector = createMicrosoftGraphReadConnector({
    tenantId: 'tenant-id-2',
    clientId: 'client-id-2',
    clientSecret: 'client-secret-2',
    userId: 'mailbox@hairtpclinic.se',
    fetchImpl,
    now: () => fixedNowMs,
  });

  const snapshot = await connector.fetchInboxSnapshot({
    days: 7,
    maxMessages: 5,
    includeRead: true,
  });

  const inboxUrl = new URL(calls[1].url);
  assert.equal(inboxUrl.searchParams.get('$top'), '5');
  assert.equal(inboxUrl.searchParams.get('$filter'), 'receivedDateTime ge 2026-02-19T18:00:00.000Z');
  assert.equal(snapshot.metadata.windowDays, 7);
  assert.equal(snapshot.metadata.maxMessages, 5);
  assert.equal(snapshot.metadata.includeReadMessages, true);
});
