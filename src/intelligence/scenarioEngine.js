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

const DEFAULT_SCENARIOS = Object.freeze([
  'sla_spike',
  'complaint_cluster',
  'conversion_drop',
  'stabilization_push',
]);

const SCENARIO_DEFINITIONS = Object.freeze({
  sla_spike: {
    label: 'SLA pressure spike',
    confidence: 0.68,
    impactScope: 'high',
    apply: (baseline) => ({
      healthScore: clamp(baseline.healthScore - 12, 0, 100),
      slaBreachRate: clamp(baseline.slaBreachRate + 0.08, 0, 1),
      complaintRate: clamp(baseline.complaintRate + 0.03, 0, 1),
      conversionSignal: clamp(baseline.conversionSignal - 0.04, 0, 1),
      workloadMinutes: Math.round(clamp(baseline.workloadMinutes * 1.22, 0, 10000)),
      volatilityIndex: clamp(baseline.volatilityIndex + 0.12, 0, 1),
    }),
    recommendedAction: 'Prioritera SLA-breach och minska samtidiga tradar till max 3.',
  },
  complaint_cluster: {
    label: 'Complaint cluster growth',
    confidence: 0.66,
    impactScope: 'medium',
    apply: (baseline) => ({
      healthScore: clamp(baseline.healthScore - 9, 0, 100),
      slaBreachRate: clamp(baseline.slaBreachRate + 0.03, 0, 1),
      complaintRate: clamp(baseline.complaintRate + 0.09, 0, 1),
      conversionSignal: clamp(baseline.conversionSignal - 0.03, 0, 1),
      workloadMinutes: Math.round(clamp(baseline.workloadMinutes * 1.15, 0, 10000)),
      volatilityIndex: clamp(baseline.volatilityIndex + 0.1, 0, 1),
    }),
    recommendedAction: 'Anvand bekraftande svarsmall och eskalera complaint-pattern tidigt.',
  },
  conversion_drop: {
    label: 'Conversion decline',
    confidence: 0.64,
    impactScope: 'medium',
    apply: (baseline) => ({
      healthScore: clamp(baseline.healthScore - 7, 0, 100),
      slaBreachRate: clamp(baseline.slaBreachRate + 0.01, 0, 1),
      complaintRate: clamp(baseline.complaintRate + 0.02, 0, 1),
      conversionSignal: clamp(baseline.conversionSignal - 0.08, 0, 1),
      workloadMinutes: Math.round(clamp(baseline.workloadMinutes * 1.08, 0, 10000)),
      volatilityIndex: clamp(baseline.volatilityIndex + 0.06, 0, 1),
    }),
    recommendedAction: 'Forstark CTA och uppfoljning i booking/pricing dialoger.',
  },
  stabilization_push: {
    label: 'Stabilization push',
    confidence: 0.72,
    impactScope: 'positive',
    apply: (baseline) => ({
      healthScore: clamp(baseline.healthScore + 8, 0, 100),
      slaBreachRate: clamp(baseline.slaBreachRate - 0.04, 0, 1),
      complaintRate: clamp(baseline.complaintRate - 0.03, 0, 1),
      conversionSignal: clamp(baseline.conversionSignal + 0.04, 0, 1),
      workloadMinutes: Math.round(clamp(baseline.workloadMinutes * 0.9, 0, 10000)),
      volatilityIndex: clamp(baseline.volatilityIndex - 0.08, 0, 1),
    }),
    recommendedAction: 'Hall fokus pa triage, stabil svarstakt och strikt sprintgrans.',
  },
});

function normalizeScenarioIds(values = []) {
  const requested = asArray(values)
    .map((value) => normalizeText(value).toLowerCase())
    .filter(Boolean);
  const fallback = DEFAULT_SCENARIOS.slice();
  const selected = requested.length ? requested : fallback;

  return Array.from(
    new Set(
      selected.filter((id) => Object.prototype.hasOwnProperty.call(SCENARIO_DEFINITIONS, id))
    )
  );
}

function simulateScenarios({
  baseline = {},
  scenarios = [],
  nowIso = new Date().toISOString(),
} = {}) {
  const safeBaseline = asObject(baseline);
  const normalizedBaseline = {
    healthScore: clamp(safeBaseline.healthScore, 0, 100, 100),
    slaBreachRate: clamp(safeBaseline.slaBreachRate, 0, 1, 0),
    complaintRate: clamp(safeBaseline.complaintRate, 0, 1, 0),
    conversionSignal: clamp(safeBaseline.conversionSignal, 0, 1, 0),
    workloadMinutes: Math.round(clamp(safeBaseline.workloadMinutes, 0, 10000, 0)),
    volatilityIndex: clamp(safeBaseline.volatilityIndex, 0, 1, 0),
  };

  const scenarioIds = normalizeScenarioIds(scenarios);

  const results = scenarioIds.map((id) => {
    const definition = SCENARIO_DEFINITIONS[id];
    const projected = definition.apply(normalizedBaseline);
    return {
      id,
      label: definition.label,
      confidence: definition.confidence,
      impactScope: definition.impactScope,
      baseline: normalizedBaseline,
      projected,
      delta: {
        healthScore: round(projected.healthScore - normalizedBaseline.healthScore, 2),
        slaBreachRate: round(projected.slaBreachRate - normalizedBaseline.slaBreachRate, 4),
        complaintRate: round(projected.complaintRate - normalizedBaseline.complaintRate, 4),
        conversionSignal: round(projected.conversionSignal - normalizedBaseline.conversionSignal, 4),
        workloadMinutes: Math.round(projected.workloadMinutes - normalizedBaseline.workloadMinutes),
        volatilityIndex: round(projected.volatilityIndex - normalizedBaseline.volatilityIndex, 4),
      },
      recommendedAction: definition.recommendedAction,
    };
  });

  const sortedByHealthDrop = [...results].sort((left, right) => left.delta.healthScore - right.delta.healthScore);
  const worstCase = sortedByHealthDrop[0] || null;
  const bestCase = sortedByHealthDrop[sortedByHealthDrop.length - 1] || null;

  return {
    baseline: normalizedBaseline,
    scenarios: results,
    worstCase,
    bestCase,
    generatedAt: normalizeText(nowIso) || new Date().toISOString(),
  };
}

module.exports = {
  simulateScenarios,
};
