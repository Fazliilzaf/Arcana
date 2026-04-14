const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildClientoPartnerBaseUrl,
  buildClientoHeaders,
  normalizeCsvParam,
  createClientoApi,
} = require('../../src/infra/clientoApi');

test('clientoApi bygger partner-base-url korrekt', () => {
  assert.equal(
    buildClientoPartnerBaseUrl({
      apiBaseUrl: 'https://cliento.com/api/v2/partner/cliento',
      partnerId: '1650',
    }),
    'https://cliento.com/api/v2/partner/cliento/1650/'
  );
});

test('clientoApi bygger auth-header endast när apiKey finns', () => {
  assert.deepEqual(buildClientoHeaders({}), {
    Accept: 'application/json',
  });

  assert.deepEqual(
    buildClientoHeaders({
      apiKey: 'secret-token',
      authHeader: 'Authorization',
      authScheme: 'Bearer',
    }),
    {
      Accept: 'application/json',
      Authorization: 'Bearer secret-token',
    }
  );
});

test('clientoApi normaliserar csv-parametrar från strängar och arrayer', () => {
  assert.equal(normalizeCsvParam('1, 2,3'), '1,2,3');
  assert.equal(normalizeCsvParam(['1', '2, 3', '', null]), '1,2,3');
});

test('clientoApi skickar slots-request med query-parametrar och auth-header', async () => {
  let capturedUrl = null;
  let capturedHeaders = null;

  const api = createClientoApi(
    {
      partnerId: '1650',
      apiKey: 'secret-token',
      authHeader: 'Authorization',
      authScheme: 'Bearer',
      timeoutMs: 1000,
    },
    {
      fetchImpl: async (url, options) => {
        capturedUrl = String(url);
        capturedHeaders = options.headers;
        return {
          ok: true,
          text: async () => JSON.stringify({ ok: true }),
        };
      },
    }
  );

  const payload = await api.getSlots({
    fromDate: '2026-05-01',
    toDate: '2026-05-07',
    resIds: ['4575'],
    srvIds: ['28232'],
  });

  assert.deepEqual(payload, { ok: true });
  assert.equal(
    capturedUrl,
    'https://cliento.com/api/v2/partner/cliento/1650/resources/slots?fromDate=2026-05-01&toDate=2026-05-07&resIds=4575&srvIds=28232'
  );
  assert.deepEqual(capturedHeaders, {
    Accept: 'application/json',
    Authorization: 'Bearer secret-token',
  });
});

test('clientoApi ytar upp vendor-fel med statuskod och payload', async () => {
  const api = createClientoApi(
    {
      partnerId: '1650',
      timeoutMs: 1000,
    },
    {
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Unauthorized' }),
      }),
    }
  );

  await assert.rejects(
    () => api.getSettings(),
    (error) =>
      error &&
      error.statusCode === 401 &&
      error.details &&
      error.details.message === 'Unauthorized'
  );
});
