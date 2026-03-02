function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max, fallback = min) {
  const numeric = toNumber(value, fallback);
  return Math.max(min, Math.min(max, numeric));
}

function round(value, precision = 2) {
  const factor = 10 ** Math.max(0, toNumber(precision, 2));
  return Math.round(toNumber(value, 0) * factor) / factor;
}

function toIso(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function toTimestampMs(value) {
  const iso = toIso(value);
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values = []) {
  const numeric = asArray(values)
    .map((value) => toNumber(value, NaN))
    .filter((value) => Number.isFinite(value));
  if (!numeric.length) return 0;
  const sum = numeric.reduce((acc, value) => acc + value, 0);
  return sum / numeric.length;
}

function trendPercent(current = 0, previous = 0) {
  const safeCurrent = toNumber(current, 0);
  const safePrevious = toNumber(previous, 0);
  if (safePrevious <= 0) {
    if (safeCurrent <= 0) return 0;
    return 100;
  }
  return ((safeCurrent - safePrevious) / safePrevious) * 100;
}

function extractMetric(point = {}, key, fallback = 0) {
  if (!point || typeof point !== 'object') return fallback;
  if (point[key] !== undefined) return toNumber(point[key], fallback);
  return fallback;
}

function toRiskBand(riskIndex = 0) {
  if (riskIndex >= 0.75) return 'critical';
  if (riskIndex >= 0.55) return 'high';
  if (riskIndex >= 0.35) return 'medium';
  return 'low';
}

function toRecommendations({ dominantDrivers = [], riskBand = 'low' } = {}) {
  const drivers = asArray(dominantDrivers).map((item) => normalizeText(item));
  const recommendations = [];

  const add = (value) => {
    const text = normalizeText(value);
    if (!text) return;
    if (!recommendations.includes(text)) recommendations.push(text);
  };

  drivers.forEach((driver) => {
    if (driver === 'sla_breach') add('Sakra SLA-disciplin med daglig triage for High/Critical.');
    if (driver === 'complaint_rate') add('Initiera root-cause analys for aterkommande complaints.');
    if (driver === 'conversion_drop') add('Forstark CTA och uppfoljning i booking/pricing dialoger.');
    if (driver === 'health_drop') add('Prioritera stabilisering innan nya initiativ startas.');
    if (driver === 'volatility') add('Minska parallella aktiviteter for att stabilisera variationen.');
  });

  if (!recommendations.length && riskBand === 'low') {
    add('Behall nuvarande arbetssatt och fortsatt monitorera trend varje vecka.');
  }

  return recommendations.slice(0, 5);
}

function positiveTrendRisk(percent = 0, denominator = 120) {
  const safePercent = toNumber(percent, 0);
  if (safePercent <= 0) return 0;
  return clamp(safePercent / Math.max(1, denominator), 0, 1);
}

function negativeTrendRisk(percent = 0, denominator = 80) {
  const safePercent = toNumber(percent, 0);
  if (safePercent >= 0) return 0;
  return clamp(Math.abs(safePercent) / Math.max(1, denominator), 0, 1);
}

function analyzeMonthlyRisk({
  dailySnapshots = [],
  windowDays = 30,
  nowIso = new Date().toISOString(),
} = {}) {
  const safeWindowDays = Math.max(7, Math.min(92, Math.round(toNumber(windowDays, 30))));
  const nowMs = toTimestampMs(nowIso) || Date.now();
  const windowStartMs = nowMs - safeWindowDays * 24 * 60 * 60 * 1000;

  const series = asArray(dailySnapshots)
    .map((point) => ({
      tsMs: toTimestampMs(point?.ts || point?.date),
      complaintRate: clamp(extractMetric(point, 'complaintRate', 0), 0, 1),
      slaBreachRate: clamp(extractMetric(point, 'slaBreachRate', 0), 0, 1),
      conversionSignal: clamp(extractMetric(point, 'conversionSignal', 0), 0, 1),
      healthScore: clamp(extractMetric(point, 'healthScore', 100), 0, 100),
      volatilityIndex: clamp(extractMetric(point, 'volatilityIndex', 0), 0, 1),
    }))
    .filter((point) => Number.isFinite(point.tsMs))
    .filter((point) => point.tsMs >= windowStartMs && point.tsMs <= nowMs)
    .sort((left, right) => left.tsMs - right.tsMs);

  if (!series.length) {
    return {
      windowDays: safeWindowDays,
      sampleSize: 0,
      riskBand: 'low',
      riskIndex: 0,
      averages: {
        complaintRate: 0,
        slaBreachRate: 0,
        conversionSignal: 0,
        healthScore: 0,
        volatilityIndex: 0,
      },
      trends: {
        complaintRatePercent: 0,
        slaBreachRatePercent: 0,
        conversionSignalPercent: 0,
        healthScoreDelta: 0,
      },
      dominantDrivers: [],
      recommendations: ['Ingen data tillganglig for manadsanalys.'],
      generatedAt: toIso(nowIso) || new Date().toISOString(),
    };
  }

  const midpoint = Math.max(1, Math.floor(series.length / 2));
  const previousWindow = series.slice(0, midpoint);
  const currentWindow = series.slice(midpoint);

  const averages = {
    complaintRate: round(average(series.map((item) => item.complaintRate)), 4),
    slaBreachRate: round(average(series.map((item) => item.slaBreachRate)), 4),
    conversionSignal: round(average(series.map((item) => item.conversionSignal)), 4),
    healthScore: round(average(series.map((item) => item.healthScore)), 2),
    volatilityIndex: round(average(series.map((item) => item.volatilityIndex)), 4),
  };

  const trends = {
    complaintRatePercent: round(
      trendPercent(
        average(currentWindow.map((item) => item.complaintRate)),
        average(previousWindow.map((item) => item.complaintRate))
      ),
      2
    ),
    slaBreachRatePercent: round(
      trendPercent(
        average(currentWindow.map((item) => item.slaBreachRate)),
        average(previousWindow.map((item) => item.slaBreachRate))
      ),
      2
    ),
    conversionSignalPercent: round(
      trendPercent(
        average(currentWindow.map((item) => item.conversionSignal)),
        average(previousWindow.map((item) => item.conversionSignal))
      ),
      2
    ),
    healthScoreDelta: round(
      average(currentWindow.map((item) => item.healthScore)) -
        average(previousWindow.map((item) => item.healthScore)),
      2
    ),
  };

  const riskContributions = {
    sla_breach: clamp(
      averages.slaBreachRate * 0.6 + positiveTrendRisk(trends.slaBreachRatePercent, 150) * 0.4,
      0,
      1
    ),
    complaint_rate: clamp(
      averages.complaintRate * 0.55 + positiveTrendRisk(trends.complaintRatePercent, 120) * 0.45,
      0,
      1
    ),
    conversion_drop: clamp(negativeTrendRisk(trends.conversionSignalPercent, 80), 0, 1),
    health_drop: clamp(
      trends.healthScoreDelta < 0 ? Math.abs(trends.healthScoreDelta) / 20 : 0,
      0,
      1
    ),
    volatility: clamp(averages.volatilityIndex, 0, 1),
  };

  const riskIndex = round(
    clamp(
      riskContributions.sla_breach * 0.35 +
        riskContributions.complaint_rate * 0.25 +
        riskContributions.conversion_drop * 0.15 +
        riskContributions.health_drop * 0.15 +
        riskContributions.volatility * 0.1,
      0,
      1
    ),
    3
  );

  const dominantDrivers = Object.entries(riskContributions)
    .sort((left, right) => right[1] - left[1])
    .filter(([, value]) => value >= 0.2)
    .map(([key]) => key)
    .slice(0, 3);

  const riskBand = toRiskBand(riskIndex);

  return {
    windowDays: safeWindowDays,
    sampleSize: series.length,
    riskBand,
    riskIndex,
    averages,
    trends,
    dominantDrivers,
    recommendations: toRecommendations({ dominantDrivers, riskBand }),
    generatedAt: toIso(nowIso) || new Date().toISOString(),
  };
}

module.exports = {
  analyzeMonthlyRisk,
};
