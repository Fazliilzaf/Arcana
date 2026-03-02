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

function round(value, precision = 2) {
  const factor = 10 ** Math.max(0, toNumber(precision, 2));
  return Math.round(toNumber(value, 0) * factor) / factor;
}

function clamp(value, min, max, fallback = min) {
  const numeric = toNumber(value, fallback);
  return Math.max(min, Math.min(max, numeric));
}

function signedPercent(value = 0, precision = 0) {
  const number = round(value, precision);
  if (number > 0) return `+${number}%`;
  return `${number}%`;
}

function uniqueList(values = []) {
  return Array.from(
    new Set(
      asArray(values)
        .map((value) => normalizeText(value))
        .filter(Boolean)
    )
  );
}

function toFocusRecommendations({ primaryDrivers = [], usageMetrics = {}, strategicFlags = [] } = {}) {
  const normalizedDrivers = uniqueList(primaryDrivers.map((item) => normalizeText(item).toLowerCase()));
  const recommendations = [];

  const include = (value) => {
    const text = normalizeText(value);
    if (!text) return;
    if (!recommendations.includes(text)) recommendations.push(text);
  };

  if (normalizedDrivers.includes('sla_breach')) {
    include('Prioritera High/Critical inom SLA kommande 48h.');
  }
  if (normalizedDrivers.includes('complaint_spike')) {
    include('Svara pa complaints med bekraftande ton och tydligt nasta steg.');
  }
  if (normalizedDrivers.includes('conversion_drop')) {
    include('Sakra tydlig CTA i booking- och pricing-konversationer.');
  }
  if (normalizedDrivers.includes('volatility')) {
    include('Hall sprinten till max 3 aktiva arenden tills volatiliteten minskar.');
  }
  if (normalizedDrivers.includes('health_drop')) {
    include('Flytta fokus till stabilisering och minska sekundara aktiviteter.');
  }

  const topFlagRecommendation = normalizeText(asArray(strategicFlags)[0]?.recommendedAction);
  if (topFlagRecommendation) include(topFlagRecommendation);

  if (!recommendations.length) {
    include('Fokusera pa stabilisering kommande 48h med tydlig prioritering av kritiska arenden.');
  }

  const complaintTrend = toNumber(usageMetrics.complaintTrendPercent, 0);
  if (recommendations.length < 3 && complaintTrend > 0) {
    include('Foelj upp oroliga kunder med professionell och lugnande ton samma dag.');
  }

  return recommendations.slice(0, 3);
}

function toNormalRecommendations({ usageMetrics = {}, strategicFlags = [], initiativeSummaries = [] } = {}) {
  const recommendations = [];
  const include = (value) => {
    const text = normalizeText(value);
    if (!text) return;
    if (!recommendations.includes(text)) recommendations.push(text);
  };

  const complaintTrend = toNumber(usageMetrics.complaintTrendPercent, 0);
  const slaTrend = toNumber(usageMetrics.slaBreachTrendPercent, 0);
  const conversionTrend = toNumber(usageMetrics.conversionTrendPercent, 0);
  const avgResponseTimeHours = toNumber(usageMetrics.avgResponseTimeHours, 0);

  if (complaintTrend > 5) include('Analysera complaint-root-cause och standardisera svarsmallar.');
  if (slaTrend > 5) include('Sakra SLA-disciplin i High/Critical-ko med tydlig sprintsekvens.');
  if (conversionTrend < -5) include('Forstark boknings-CTA i pricing och booking intents.');
  if (avgResponseTimeHours > 8) include('Kort ner svarstiden genom att batcha reply-arbejte i 2 pass per dag.');

  asArray(strategicFlags)
    .slice(0, 2)
    .forEach((flag) => include(flag?.recommendedAction));

  asArray(initiativeSummaries)
    .filter((item) => normalizeText(item?.status).toLowerCase() === 'stalled')
    .slice(0, 2)
    .forEach((item) => include(`Aterstarta initiativet "${normalizeText(item?.title) || 'okant'}" med tydlig owner.`));

  if (!recommendations.length) {
    include('Fortsatt med nuvarande arbetssatt och overvaaka SLA samt complaint-trend veckovis.');
  }

  return recommendations.slice(0, 5);
}

function composeWeeklyBrief({
  focusContext = {},
  usageMetrics = {},
  strategicFlags = [],
  systemImprovementProposal = null,
  initiativeSummaries = [],
  windowDays = 7,
  nowIso = new Date().toISOString(),
} = {}) {
  const safeFocusContext = asObject(focusContext);
  const safeUsageMetrics = asObject(usageMetrics);
  const safeWindowDays = Math.max(1, Math.min(28, Math.round(toNumber(windowDays, 7))));

  const focusActive = safeFocusContext.isActive === true;
  const primaryDrivers = uniqueList(asArray(safeFocusContext.primaryDrivers).map((item) => normalizeText(item).toLowerCase()));
  const severity = normalizeText(safeFocusContext.severity).toLowerCase() || 'none';

  const slaTrend = toNumber(safeUsageMetrics.slaBreachTrendPercent, 0);
  const complaintTrend = toNumber(safeUsageMetrics.complaintTrendPercent, 0);
  const conversionTrend = toNumber(safeUsageMetrics.conversionTrendPercent, 0);
  const avgResponseTimeHours = round(toNumber(safeUsageMetrics.avgResponseTimeHours, 0), 1);

  const focusSections = [
    {
      key: 'stabilization',
      title: 'Stabiliseringsatgarder',
      content: `Kommande 48h bor fokus ligga pa stabilisering av operativt flode (${severity || 'normal'} niva).`,
    },
    {
      key: 'affected_kpi',
      title: 'Paverkade KPI',
      content: `SLA-trend ${signedPercent(slaTrend)} | Complaint-trend ${signedPercent(complaintTrend)} | Conversion-trend ${signedPercent(conversionTrend)}.`,
    },
    {
      key: 'risk_drivers',
      title: 'Riskdrivare',
      content: primaryDrivers.length
        ? primaryDrivers.join(', ')
        : 'Inga explicita riskdrivare markerade.',
    },
    {
      key: 'secondary',
      title: 'Sekundara forbattringar',
      content: 'Dampa icke-kritiska initiativ tills stabilisering ar uppnadd.',
    },
  ];

  const normalSections = [
    {
      key: 'strategic_signals',
      title: 'Strategiska signaler',
      content: `SLA ${signedPercent(slaTrend)} | Complaints ${signedPercent(complaintTrend)} | Conversion ${signedPercent(conversionTrend)} over senaste ${safeWindowDays} dagar.`,
    },
    {
      key: 'operational_improvements',
      title: 'Operativa forbattringar',
      content: `Genomsnittlig svarstid ${avgResponseTimeHours}h med fokus pa effektivare triage och reply-flow.`,
    },
    {
      key: 'effect_metrics',
      title: 'Effektmatt',
      content: `Rekommendationsfolojsamhet ${Math.round(clamp(safeUsageMetrics.systemRecommendationFollowRate, 0, 1) * 100)}% och CCO-anvandning ${Math.round(clamp(safeUsageMetrics.ccoUsageRate, 0, 1) * 100)}%.`,
    },
    {
      key: 'long_term',
      title: 'Langsiktig trend',
      content: `Volatilitet ${round(toNumber(safeUsageMetrics.volatilityIndex, 0), 2)} och belastning over tid styr kommande prioritering.`,
    },
  ];

  const proposal = asObject(systemImprovementProposal);
  const proposalTitle = normalizeText(proposal.proposalTitle || proposal.title);
  if (proposalTitle) {
    const proposalSection = {
      key: 'improvement_proposal',
      title: 'Forbattringsforslag',
      content: `${proposalTitle}${normalizeText(proposal.rootCauseHypothesis) ? `: ${normalizeText(proposal.rootCauseHypothesis)}` : ''}`,
    };
    if (focusActive) focusSections.push(proposalSection);
    else normalSections.push(proposalSection);
  }

  const recommendations = focusActive
    ? toFocusRecommendations({
        primaryDrivers,
        usageMetrics: safeUsageMetrics,
        strategicFlags,
      })
    : toNormalRecommendations({
        usageMetrics: safeUsageMetrics,
        strategicFlags,
        initiativeSummaries,
      });

  return {
    mode: focusActive ? 'focus' : 'normal',
    windowDays: safeWindowDays,
    headline: focusActive
      ? 'Focus Weekly: stabilisering prioriteras.'
      : 'Weekly Brief: strategiska signaler och operativ riktning.',
    sections: focusActive ? focusSections : normalSections,
    recommendations,
    priorityOrder: focusActive
      ? ['stabilization', 'affected_kpi', 'risk_drivers', 'secondary']
      : ['strategic_signals', 'operational_improvements', 'effect_metrics', 'long_term'],
    generatedAt: normalizeText(nowIso) || new Date().toISOString(),
  };
}

module.exports = {
  composeWeeklyBrief,
};
