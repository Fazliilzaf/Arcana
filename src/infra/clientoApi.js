const DEFAULT_CLIENTO_API_BASE_URL = 'https://cliento.com/api/v2/partner/cliento';

function trimTrailingSlash(value) {
  return String(value ?? '').replace(/\/+$/, '');
}

function buildClientoPartnerBaseUrl({ apiBaseUrl = DEFAULT_CLIENTO_API_BASE_URL, partnerId }) {
  const normalizedPartnerId = String(partnerId ?? '').trim();
  if (!normalizedPartnerId) {
    throw new Error('Cliento partnerId saknas.');
  }

  const normalizedBaseUrl = trimTrailingSlash(apiBaseUrl) || DEFAULT_CLIENTO_API_BASE_URL;
  return `${normalizedBaseUrl}/${encodeURIComponent(normalizedPartnerId)}/`;
}

function buildClientoHeaders({ apiKey = '', authHeader = 'Authorization', authScheme = 'Bearer' } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  const normalizedKey = String(apiKey ?? '').trim();
  if (!normalizedKey) {
    return headers;
  }

  const normalizedHeader = String(authHeader ?? '').trim() || 'Authorization';
  const normalizedScheme = String(authScheme ?? '').trim();
  headers[normalizedHeader] = normalizedScheme ? `${normalizedScheme} ${normalizedKey}` : normalizedKey;
  return headers;
}

function normalizeCsvParam(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item ?? '').split(','))
      .map((item) => item.trim())
      .filter(Boolean)
      .join(',');
  }
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',');
}

function appendSearchParams(url, params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(params)) {
    if (rawValue === undefined || rawValue === null) continue;
    const value = typeof rawValue === 'number' ? String(rawValue) : String(rawValue).trim();
    if (!value) continue;
    searchParams.set(key, value);
  }
  url.search = searchParams.toString();
  return url;
}

function createClientoApi(
  {
    partnerId,
    apiBaseUrl = DEFAULT_CLIENTO_API_BASE_URL,
    apiKey = '',
    authHeader = 'Authorization',
    authScheme = 'Bearer',
    timeoutMs = 10000,
  } = {},
  { fetchImpl = global.fetch } = {}
) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('Global fetch saknas för Cliento API.');
  }

  const baseUrl = buildClientoPartnerBaseUrl({ apiBaseUrl, partnerId });
  const headers = buildClientoHeaders({ apiKey, authHeader, authScheme });

  async function requestJson(pathname, params = {}) {
    const url = appendSearchParams(new URL(String(pathname).replace(/^\//, ''), baseUrl), params);
    const response = await fetchImpl(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });

    const rawText = await response.text();
    let payload = null;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      payload = rawText;
    }

    if (!response.ok) {
      const error = new Error(`Cliento request misslyckades (${response.status})`);
      error.statusCode = response.status;
      error.details = payload;
      throw error;
    }

    return payload;
  }

  return {
    getSettings() {
      return requestJson('/settings/');
    },
    getRefData() {
      return requestJson('/ref-data/');
    },
    getSlots({ fromDate, toDate, resIds, srvIds }) {
      return requestJson('/resources/slots', {
        fromDate,
        toDate,
        resIds: normalizeCsvParam(resIds),
        srvIds: normalizeCsvParam(srvIds),
      });
    },
    getReviews({ offset = 0, limit = 10, stars = '' } = {}) {
      return requestJson('/reviews/', {
        offset,
        limit,
        stars: normalizeCsvParam(stars),
      });
    },
  };
}

module.exports = {
  DEFAULT_CLIENTO_API_BASE_URL,
  buildClientoPartnerBaseUrl,
  buildClientoHeaders,
  normalizeCsvParam,
  createClientoApi,
};
