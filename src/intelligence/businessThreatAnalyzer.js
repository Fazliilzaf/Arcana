function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
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

function severityWeight(level = '') {
  const normalized = normalizeText(level).toLowerCase();
  if (normalized === 'critical') return 4;
  if (normalized === 'high') return 3;
  if (normalized === 'medium') return 2;
  return 1;
}

function createThreat({
  code = '',
  title = '',
  severity = 'medium',
  confidence = 0.5,
  impactScope = 'medium',
  evidence = [],
  recommendedAction = '',
} = {}) {
  return {
    code: normalizeText(code),
    title: normalizeText(title),
    severity: normalizeText(severity) || 'medium',
    confidence: round(clamp(confidence, 0, 1, 0.5), 2),
    impactScope: normalizeText(impactScope) || 'medium',
    evidence: asArray(evidence).map((item) => normalizeText(item)).filter(Boolean).slice(0, 4),
    recommendedAction: normalizeText(recommendedAction),
  };
}

function analyzeBusinessThreats({
  conversationWorklist = [],
  usageMetrics = {},
  strategicFlags = [],
  monthlyRisk = {},
  nowIso = new Date().toISOString(),
} = {}) {
  const worklist = asArray(conversationWorklist);
  const safeUsage = asObject(usageMetrics);
  const safeMonthlyRisk = asObject(monthlyRisk);
  const flags = asArray(strategicFlags);

  const openCount = worklist.length;
  const complaintRows = worklist.filter((row) => normalizeText(row?.intent).toLowerCase() === 'complaint');
  const bookingRows = worklist.filter((row) => normalizeText(row?.intent).toLowerCase() === 'booking_request');
  const frustratedRows = worklist.filter((row) => {
    const tone = normalizeText(row?.tone).toLowerCase();
    return tone === 'frustrated' || tone === 'anxious';
  });
  const breachRows = worklist.filter((row) => normalizeText(row?.slaStatus).toLowerCase() === 'breach');

  const complaintShare = openCount ? complaintRows.length / openCount : 0;
  const breachRate = openCount ? breachRows.length / openCount : 0;

  const threats = [];

  if (complaintRows.length >= 3 || complaintShare >= 0.2) {
    threats.push(
      createThreat({
        code: 'complaint_cluster',
        title: 'Complaint-kluster riskerar varumarke och retention',
        severity: complaintRows.length >= 5 ? 'high' : 'medium',
        confidence: clamp(0.55 + complaintShare, 0, 0.92),
        impactScope: 'customer_experience',
        evidence: [
          `${complaintRows.length} complaint-konversationer i aktiv ko`,
          `Complaint-andel ${Math.round(complaintShare * 100)}%`,
        ],
        recommendedAction: 'Initiera root-cause genomgang och svara complaint-tradar inom samma arbetsdag.',
      })
    );
  }

  if (breachRate >= 0.1 || toNumber(safeUsage.slaBreachTrendPercent, 0) > 15) {
    threats.push(
      createThreat({
        code: 'sla_capacity_pressure',
        title: 'SLA-tryck indikerar kapacitetsrisk',
        severity: breachRate >= 0.2 ? 'critical' : 'high',
        confidence: clamp(0.58 + breachRate, 0, 0.95),
        impactScope: 'operations',
        evidence: [
          `${breachRows.length} tradar med SLA-breach`,
          `SLA-trend ${round(toNumber(safeUsage.slaBreachTrendPercent, 0), 1)}%`,
        ],
        recommendedAction: 'Prioritera High/Critical i sprint och reducera parallella arbetsobjekt.',
      })
    );
  }

  if (
    toNumber(safeUsage.conversionTrendPercent, 0) < -10 ||
    (bookingRows.length >= 4 && toNumber(safeUsage.systemRecommendationFollowRate, 1) < 0.5)
  ) {
    threats.push(
      createThreat({
        code: 'conversion_leakage',
        title: 'Booking-flode tappar konvertering',
        severity: 'high',
        confidence: clamp(0.55 + Math.abs(toNumber(safeUsage.conversionTrendPercent, 0)) / 100, 0, 0.9),
        impactScope: 'revenue',
        evidence: [
          `Conversion-trend ${round(toNumber(safeUsage.conversionTrendPercent, 0), 1)}%`,
          `${bookingRows.length} booking-tradar i aktiv ko`,
        ],
        recommendedAction: 'Skapa tydligare booking-CTA och folj upp pricing/booking inom 24h.',
      })
    );
  }

  if (
    toNumber(safeMonthlyRisk.riskIndex, 0) >= 0.65 ||
    toNumber(safeUsage.volatilityIndex, 0) >= 0.6 ||
    frustratedRows.length >= 4
  ) {
    threats.push(
      createThreat({
        code: 'relationship_volatility',
        title: 'Forhojd relationsvolatilitet',
        severity: toNumber(safeMonthlyRisk.riskIndex, 0) >= 0.8 ? 'critical' : 'medium',
        confidence: clamp(0.52 + toNumber(safeUsage.volatilityIndex, 0), 0, 0.93),
        impactScope: 'retention',
        evidence: [
          `${frustratedRows.length} tradar med anxious/frustrated tone`,
          `Volatility ${round(toNumber(safeUsage.volatilityIndex, 0), 2)}`,
        ],
        recommendedAction: 'Anvand lugn tonalitet och korta responscykler tills tonen stabiliserats.',
      })
    );
  }

  flags
    .filter((flag) => flag?.isActive === true || normalizeText(flag?.triggerType))
    .forEach((flag, index) => {
      if (index > 1) return;
      const title = normalizeText(flag?.title) || 'Strategiskt riskmonster upptackt';
      threats.push(
        createThreat({
          code: normalizeText(flag?.code) || `strategic_flag_${index + 1}`,
          title,
          severity: normalizeText(flag?.severity) || 'medium',
          confidence: clamp(toNumber(flag?.confidence, 0.65), 0, 1, 0.65),
          impactScope: normalizeText(flag?.impactScope) || 'strategic',
          evidence: asArray(flag?.drivers || flag?.primaryDrivers).slice(0, 3),
          recommendedAction: normalizeText(flag?.recommendedAction) || 'Granska strategisk signal och satt tydlig owner.',
        })
      );
    });

  const deduplicated = [];
  const seenCodes = new Set();
  for (const threat of threats) {
    const code = normalizeText(threat.code).toLowerCase();
    if (!code || seenCodes.has(code)) continue;
    seenCodes.add(code);
    deduplicated.push(threat);
  }

  deduplicated.sort((left, right) => {
    const severityDelta = severityWeight(right.severity) - severityWeight(left.severity);
    if (severityDelta !== 0) return severityDelta;
    return toNumber(right.confidence, 0) - toNumber(left.confidence, 0);
  });

  return {
    threats: deduplicated,
    threatCount: deduplicated.length,
    highestSeverity: deduplicated.length ? deduplicated[0].severity : 'none',
    generatedAt: normalizeText(nowIso) || new Date().toISOString(),
  };
}

module.exports = {
  analyzeBusinessThreats,
};
