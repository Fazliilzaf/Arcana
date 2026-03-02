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
  const list = asArray(values)
    .map((value) => toNumber(value, NaN))
    .filter((value) => Number.isFinite(value));
  if (!list.length) return 0;
  return list.reduce((acc, value) => acc + value, 0) / list.length;
}

function linearSlope(values = []) {
  const points = asArray(values)
    .map((value, index) => ({ x: index, y: toNumber(value, NaN) }))
    .filter((point) => Number.isFinite(point.y));
  if (points.length < 2) return 0;

  const meanX = average(points.map((point) => point.x));
  const meanY = average(points.map((point) => point.y));
  let numerator = 0;
  let denominator = 0;

  points.forEach((point) => {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += (point.x - meanX) ** 2;
  });

  if (denominator === 0) return 0;
  return numerator / denominator;
}

function normalizeSignals({ dailySignals = [], windowDays = 14, nowIso = new Date().toISOString() } = {}) {
  const safeWindowDays = Math.max(7, Math.min(60, Math.round(toNumber(windowDays, 14))));
  const nowMs = toTimestampMs(nowIso) || Date.now();
  const windowStartMs = nowMs - safeWindowDays * 24 * 60 * 60 * 1000;

  const series = asArray(dailySignals)
    .map((point) => {
      const unresolvedCount = Math.max(1, toNumber(point?.unresolvedCount, 0));
      return {
        tsMs: toTimestampMs(point?.ts || point?.date),
        complaintRate: clamp(
          point?.complaintRate !== undefined
            ? point.complaintRate
            : toNumber(point?.complaintCount, 0) / unresolvedCount,
          0,
          1,
          0
        ),
        bookingPressure: clamp(
          point?.bookingPressure !== undefined
            ? point.bookingPressure
            : toNumber(point?.bookingCount, 0) / unresolvedCount,
          0,
          1,
          0
        ),
        slaBreachRate: clamp(point?.slaBreachRate, 0, 1, 0),
        healthScore: clamp(point?.healthScore, 0, 100, 100),
      };
    })
    .filter((point) => Number.isFinite(point.tsMs))
    .filter((point) => point.tsMs >= windowStartMs && point.tsMs <= nowMs)
    .sort((left, right) => left.tsMs - right.tsMs);

  return {
    windowDays: safeWindowDays,
    series,
  };
}

function computeVolatilityIndex(healthSeries = []) {
  const values = asArray(healthSeries)
    .map((item) => toNumber(item, NaN))
    .filter((item) => Number.isFinite(item));
  if (values.length <= 1) return 0;

  const mean = average(values);
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return round(clamp(stdDev / 20, 0, 1), 3);
}

function computeForwardOutlook({
  dailySignals = [],
  windowDays = 14,
  forecastDays = 7,
  nowIso = new Date().toISOString(),
} = {}) {
  const safeForecastDays = Math.max(3, Math.min(14, Math.round(toNumber(forecastDays, 7))));
  const normalized = normalizeSignals({ dailySignals, windowDays, nowIso });
  const series = normalized.series;

  if (!series.length) {
    return {
      windowDays: normalized.windowDays,
      forecastDays: safeForecastDays,
      riskForecast: {
        type: 'stable',
        probability: 0,
        summary: 'Otillracklig data for riskprognos.',
      },
      capacityForecast: {
        level: 'stable',
        projectedBookingPressure: 0,
        summary: 'Otillracklig data for kapacitetsprognos.',
      },
      recommendedPreparation: ['Samla minst 7 dagars signaldata for att aktivera prognos.'],
      volatilityIndex: 0,
      confidenceScore: 0,
      drivers: [],
      generatedAt: toIso(nowIso) || new Date().toISOString(),
    };
  }

  const complaintSeries = series.map((point) => point.complaintRate);
  const bookingSeries = series.map((point) => point.bookingPressure);
  const slaSeries = series.map((point) => point.slaBreachRate);
  const healthSeries = series.map((point) => point.healthScore);

  const complaintSlope = linearSlope(complaintSeries);
  const bookingSlope = linearSlope(bookingSeries);
  const slaSlope = linearSlope(slaSeries);
  const healthSlope = linearSlope(healthSeries);

  const lastComplaint = complaintSeries[complaintSeries.length - 1] || 0;
  const lastBooking = bookingSeries[bookingSeries.length - 1] || 0;
  const lastSla = slaSeries[slaSeries.length - 1] || 0;

  const projectedComplaint = clamp(lastComplaint + complaintSlope * safeForecastDays, 0, 1, lastComplaint);
  const projectedBooking = clamp(lastBooking + bookingSlope * safeForecastDays, 0, 1, lastBooking);
  const projectedSla = clamp(lastSla + slaSlope * safeForecastDays, 0, 1, lastSla);

  const volatilityIndex = computeVolatilityIndex(healthSeries);

  const complaintRiskProbability = clamp(
    projectedComplaint * 0.7 + Math.max(0, complaintSlope) * 4 + volatilityIndex * 0.2,
    0,
    1
  );
  const capacityRiskProbability = clamp(
    projectedBooking * 0.6 + projectedSla * 0.25 + Math.max(0, bookingSlope) * 3,
    0,
    1
  );

  const dominantRiskIsComplaint = complaintRiskProbability >= capacityRiskProbability;

  const riskForecast = dominantRiskIsComplaint
    ? {
        type: 'complaint_spike',
        probability: round(complaintRiskProbability, 2),
        summary: `Risk for complaint-uppgang under nasta ${safeForecastDays} dagar.`,
      }
    : {
        type: 'load_pressure',
        probability: round(capacityRiskProbability, 2),
        summary: `Risk for belastningsokning under nasta ${safeForecastDays} dagar.`,
      };

  const capacityLevel = (() => {
    if (capacityRiskProbability >= 0.7) return 'high';
    if (capacityRiskProbability >= 0.45) return 'medium';
    return 'stable';
  })();

  const capacityForecast = {
    level: capacityLevel,
    projectedBookingPressure: round(projectedBooking, 3),
    summary:
      capacityLevel === 'high'
        ? 'Booking-tryck forvantas oka tydligt, planera for extra svarskapacitet.'
        : capacityLevel === 'medium'
        ? 'Mattanligt booking-tryck forvantas, hall sprintdisciplin.'
        : 'Belastning forvantas vara stabil kommande vecka.',
  };

  const recommendedPreparation = [];
  if (riskForecast.type === 'complaint_spike') {
    recommendedPreparation.push('Forbered complaint-svarsmallar och prioritera hogrisktradar i 48h.');
  }
  if (capacityLevel !== 'stable') {
    recommendedPreparation.push('Sakra tillganglig reply-kapacitet i tidsfonster med hogst belastning.');
  }
  if (projectedSla >= 0.1) {
    recommendedPreparation.push('Skift fokus till SLA-kritiska arenden innan sekundara initiativ.');
  }
  if (!recommendedPreparation.length) {
    recommendedPreparation.push('Fortsatt monitorera signaler dagligen och behall nuvarande arbetsmodell.');
  }

  const confidenceScore = round(
    clamp(series.length / Math.max(1, normalized.windowDays), 0, 1) * 0.6 +
      clamp(1 - volatilityIndex, 0, 1) * 0.4,
    2
  );

  const drivers = [];
  if (complaintSlope > 0) drivers.push('complaint_momentum_up');
  if (bookingSlope > 0) drivers.push('booking_pressure_up');
  if (slaSlope > 0) drivers.push('sla_breach_momentum_up');
  if (healthSlope < 0) drivers.push('health_score_downtrend');
  if (volatilityIndex > 0.4) drivers.push('volatility_elevated');

  return {
    windowDays: normalized.windowDays,
    forecastDays: safeForecastDays,
    riskForecast,
    capacityForecast,
    recommendedPreparation,
    volatilityIndex,
    confidenceScore,
    drivers,
    generatedAt: toIso(nowIso) || new Date().toISOString(),
  };
}

module.exports = {
  computeForwardOutlook,
};
