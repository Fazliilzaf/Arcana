const express = require('express');

const { ROLE_OWNER, ROLE_STAFF } = require('../security/roles');
const { createExecutionGateway } = require('../gateway/executionGateway');
const { createCapabilityExecutor } = require('../capabilities/executionService');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function pickErrorStatus(errorCode = '') {
  const code = normalizeText(errorCode).toUpperCase();
  if (code === 'CAPABILITY_NOT_FOUND') return 404;
  if (code === 'CAPABILITY_AGENT_NOT_FOUND') return 404;
  if (code === 'CAPABILITY_ROLE_DENIED' || code === 'CAPABILITY_CHANNEL_DENIED') return 403;
  if (code === 'CAPABILITY_AGENT_ROLE_DENIED' || code === 'CAPABILITY_AGENT_CHANNEL_DENIED') {
    return 403;
  }
  if (code === 'CAPABILITY_AGENT_DEPENDENCY_BLOCKED') return 403;
  if (code === 'CAPABILITY_INPUT_INVALID' || code === 'CAPABILITY_OUTPUT_INVALID') return 422;
  if (code === 'CAPABILITY_AGENT_INPUT_INVALID' || code === 'CAPABILITY_AGENT_OUTPUT_INVALID') {
    return 422;
  }
  if (code === 'CAPABILITY_AGENT_NOT_IMPLEMENTED') return 400;
  if (code === 'CAPABILITY_INVALID_TENANT') return 400;
  return 500;
}

function toTemplateChangeSnapshot(template = {}) {
  return {
    templateId: normalizeText(template.id) || null,
    templateName: normalizeText(template.name) || null,
    category: normalizeText(template.category) || null,
    updatedAt: normalizeText(template.updatedAt) || null,
    currentActiveVersionId: normalizeText(template.currentActiveVersionId) || null,
  };
}

function toOpenReviewSnapshot(evaluation = {}) {
  return {
    id: normalizeText(evaluation.id) || null,
    templateId: normalizeText(evaluation.templateId) || null,
    templateVersionId: normalizeText(evaluation.templateVersionId) || null,
    category: normalizeText(evaluation.category) || null,
    decision: normalizeText(evaluation.decision) || null,
    ownerDecision: normalizeText(evaluation.ownerDecision) || null,
    riskLevel: Number(evaluation.riskLevel || 0),
    riskScore: Number(evaluation.riskScore || 0),
    evaluatedAt: normalizeText(evaluation.evaluatedAt) || null,
    reasonCodes: Array.isArray(evaluation.reasonCodes) ? evaluation.reasonCodes.slice(0, 6) : [],
  };
}

function toIncidentSnapshot(incident = {}) {
  return {
    id: normalizeText(incident.id) || null,
    category: normalizeText(incident.category) || null,
    riskLevel: Number(incident.riskLevel || 0),
    decision: normalizeText(incident.decision) || null,
    reasonCodes: Array.isArray(incident.reasonCodes) ? incident.reasonCodes.slice(0, 10) : [],
    severity: normalizeText(incident.severity) || null,
    status: normalizeText(incident.status) || null,
    ownerDecision: normalizeText(incident.ownerDecision) || null,
    openedAt: normalizeText(incident.openedAt) || null,
    updatedAt: normalizeText(incident.updatedAt) || null,
    sla:
      incident?.sla && typeof incident.sla === 'object'
        ? {
            state: normalizeText(incident.sla.state) || null,
            breached: incident.sla.breached === true,
            deadline: normalizeText(incident.sla.deadline) || null,
          }
        : null,
  };
}

async function hydrateGenerateTaskPlanInput({
  tenantId,
  templateStore,
  input = {},
  systemStateSnapshot = {},
}) {
  const safeInput = asObject(input);
  const safeSnapshot = asObject(systemStateSnapshot);

  const inputSnapshotOverride = {
    openReviews: Array.isArray(safeInput.openReviews) ? safeInput.openReviews : null,
    incidents: Array.isArray(safeInput.incidents) ? safeInput.incidents : null,
    latestTemplateChanges: Array.isArray(safeInput.latestTemplateChanges)
      ? safeInput.latestTemplateChanges
      : null,
    kpi: asObject(safeInput.kpi),
  };
  const explicitSnapshotOverride = {
    openReviews: Array.isArray(safeSnapshot.openReviews) ? safeSnapshot.openReviews : null,
    incidents: Array.isArray(safeSnapshot.incidents) ? safeSnapshot.incidents : null,
    latestTemplateChanges: Array.isArray(safeSnapshot.latestTemplateChanges)
      ? safeSnapshot.latestTemplateChanges
      : null,
    kpi: asObject(safeSnapshot.kpi),
  };

  const normalizedInput = {};
  if (Number.isFinite(Number(safeInput.maxTasks))) {
    normalizedInput.maxTasks = Number(safeInput.maxTasks);
  }
  if (typeof safeInput.includeEvidence === 'boolean') {
    normalizedInput.includeEvidence = safeInput.includeEvidence;
  }

  if (!templateStore) {
    return {
      input: normalizedInput,
      systemStateSnapshot: {
        openReviews:
          explicitSnapshotOverride.openReviews || inputSnapshotOverride.openReviews || [],
        incidents:
          explicitSnapshotOverride.incidents || inputSnapshotOverride.incidents || [],
        kpi: Object.keys(explicitSnapshotOverride.kpi).length
          ? explicitSnapshotOverride.kpi
          : inputSnapshotOverride.kpi,
        latestTemplateChanges:
          explicitSnapshotOverride.latestTemplateChanges ||
          inputSnapshotOverride.latestTemplateChanges ||
          [],
      },
    };
  }

  const [
    defaultOpenReviews,
    defaultIncidents,
    riskSummary,
    incidentSummary,
    latestTemplates,
    activeSnapshots,
  ] = await Promise.all([
    typeof templateStore.listEvaluations === 'function'
      ? templateStore.listEvaluations({
          tenantId,
          state: 'open',
          limit: 80,
        })
      : [],
    typeof templateStore.listIncidents === 'function'
      ? templateStore.listIncidents({
          tenantId,
          status: 'open',
          limit: 80,
        })
      : [],
    typeof templateStore.summarizeRisk === 'function'
      ? templateStore.summarizeRisk({
          tenantId,
          minRiskLevel: 1,
        })
      : null,
    typeof templateStore.summarizeIncidents === 'function'
      ? templateStore.summarizeIncidents({
          tenantId,
        })
      : null,
    typeof templateStore.listTemplates === 'function'
      ? templateStore.listTemplates({
          tenantId,
        })
      : [],
    typeof templateStore.listActiveVersionSnapshots === 'function'
      ? templateStore.listActiveVersionSnapshots({
          tenantId,
        })
      : [],
  ]);

  const kpiDefault = {
    triggeredNoGoCount: Number(inputSnapshotOverride?.kpi?.triggeredNoGoCount || 0),
    sloBreaches: Number(inputSnapshotOverride?.kpi?.sloBreaches || 0),
    openUnresolvedIncidents: Number(incidentSummary?.totals?.openUnresolved || 0),
    highCriticalOpenReviews: Number(riskSummary?.totals?.highCriticalOpen || 0),
    readinessScore: Number(inputSnapshotOverride?.kpi?.readinessScore || 0),
    templatesTotal: Number(Array.isArray(latestTemplates) ? latestTemplates.length : 0),
    activeTemplates: Number(Array.isArray(activeSnapshots) ? activeSnapshots.length : 0),
  };

  return {
    input: normalizedInput,
    systemStateSnapshot: {
      openReviews:
      explicitSnapshotOverride.openReviews ||
      inputSnapshotOverride.openReviews ||
      (Array.isArray(defaultOpenReviews) ? defaultOpenReviews : []).map(toOpenReviewSnapshot),
      incidents:
      explicitSnapshotOverride.incidents ||
      inputSnapshotOverride.incidents ||
      (Array.isArray(defaultIncidents) ? defaultIncidents : []).map(toIncidentSnapshot),
      kpi:
      Object.keys(explicitSnapshotOverride.kpi).length > 0
        ? explicitSnapshotOverride.kpi
        : (Object.keys(inputSnapshotOverride.kpi).length > 0
          ? inputSnapshotOverride.kpi
          : kpiDefault),
      latestTemplateChanges:
      explicitSnapshotOverride.latestTemplateChanges ||
      inputSnapshotOverride.latestTemplateChanges ||
      (Array.isArray(latestTemplates) ? latestTemplates : [])
        .slice(0, 25)
        .map(toTemplateChangeSnapshot),
    },
  };
}

async function hydrateSummarizeIncidentsInput({
  tenantId,
  templateStore,
  input = {},
  systemStateSnapshot = {},
}) {
  const safeInput = asObject(input);
  const safeSnapshot = asObject(systemStateSnapshot);
  const normalizedInput = {
    includeClosed: safeInput.includeClosed === true,
    timeframeDays: Math.max(1, Math.min(90, toNumber(safeInput.timeframeDays, 14))),
  };

  const snapshotIncidents = Array.isArray(safeSnapshot.incidents)
    ? safeSnapshot.incidents
    : null;
  const snapshotSlaStatus =
    safeSnapshot.slaStatus && typeof safeSnapshot.slaStatus === 'object'
      ? safeSnapshot.slaStatus
      : null;
  const snapshotTimestamps =
    safeSnapshot.timestamps && typeof safeSnapshot.timestamps === 'object'
      ? safeSnapshot.timestamps
      : null;

  if (!templateStore || typeof templateStore.listIncidents !== 'function') {
    return {
      input: normalizedInput,
      systemStateSnapshot: {
        incidents: snapshotIncidents || [],
        slaStatus: snapshotSlaStatus || {},
        timestamps: {
          capturedAt: new Date().toISOString(),
          ...(snapshotTimestamps || {}),
        },
      },
    };
  }

  const [defaultIncidents, incidentSummary] = await Promise.all([
    templateStore.listIncidents({
      tenantId,
      status: normalizedInput.includeClosed ? 'all' : 'open',
      limit: 300,
      sinceDays: normalizedInput.timeframeDays,
    }),
    typeof templateStore.summarizeIncidents === 'function'
      ? templateStore.summarizeIncidents({ tenantId })
      : null,
  ]);

  return {
    input: normalizedInput,
    systemStateSnapshot: {
      incidents:
        snapshotIncidents ||
        (Array.isArray(defaultIncidents) ? defaultIncidents : []).map(toIncidentSnapshot),
      slaStatus:
        snapshotSlaStatus ||
        (incidentSummary?.bySlaState && typeof incidentSummary.bySlaState === 'object'
          ? incidentSummary.bySlaState
          : {}),
      timestamps: {
        capturedAt: new Date().toISOString(),
        sourceGeneratedAt: normalizeText(incidentSummary?.generatedAt) || null,
        ...(snapshotTimestamps || {}),
      },
    },
  };
}

async function maybeHydrateCapabilityPayload({
  capabilityName,
  tenantId,
  templateStore,
  input,
  systemStateSnapshot,
}) {
  const normalizedName = normalizeText(capabilityName).toLowerCase();
  if (normalizedName === 'generatetaskplan') {
    return hydrateGenerateTaskPlanInput({
      tenantId,
      templateStore,
      input,
      systemStateSnapshot,
    });
  }
  if (normalizedName === 'summarizeincidents') {
    return hydrateSummarizeIncidentsInput({
      tenantId,
      templateStore,
      input,
      systemStateSnapshot,
    });
  }
  return {
    input: asObject(input),
    systemStateSnapshot: asObject(systemStateSnapshot),
  };
}

async function maybeHydrateAgentPayload({
  agentName,
  tenantId,
  templateStore,
  input,
  systemStateSnapshot,
}) {
  const normalizedAgentName = normalizeText(agentName).toLowerCase();
  if (normalizedAgentName === 'coo') {
    const [incidentPayload, taskPlanPayload] = await Promise.all([
      hydrateSummarizeIncidentsInput({
        tenantId,
        templateStore,
        input,
        systemStateSnapshot,
      }),
      hydrateGenerateTaskPlanInput({
        tenantId,
        templateStore,
        input,
        systemStateSnapshot,
      }),
    ]);

    const incidentInput = asObject(incidentPayload.input);
    const taskPlanInput = asObject(taskPlanPayload.input);
    const incidentSnapshot = asObject(incidentPayload.systemStateSnapshot);
    const taskPlanSnapshot = asObject(taskPlanPayload.systemStateSnapshot);

    return {
      input: {
        includeClosed: incidentInput.includeClosed === true,
        timeframeDays: Math.max(1, Math.min(90, toNumber(incidentInput.timeframeDays, 14))),
        maxTasks: Math.max(1, Math.min(5, toNumber(taskPlanInput.maxTasks, 5))),
        includeEvidence: taskPlanInput.includeEvidence !== false,
      },
      systemStateSnapshot: {
        incidents: Array.isArray(incidentSnapshot.incidents) ? incidentSnapshot.incidents : [],
        slaStatus:
          incidentSnapshot.slaStatus && typeof incidentSnapshot.slaStatus === 'object'
            ? incidentSnapshot.slaStatus
            : {},
        timestamps:
          incidentSnapshot.timestamps && typeof incidentSnapshot.timestamps === 'object'
            ? incidentSnapshot.timestamps
            : { capturedAt: new Date().toISOString() },
        openReviews: Array.isArray(taskPlanSnapshot.openReviews) ? taskPlanSnapshot.openReviews : [],
        latestTemplateChanges: Array.isArray(taskPlanSnapshot.latestTemplateChanges)
          ? taskPlanSnapshot.latestTemplateChanges
          : [],
        kpi: taskPlanSnapshot.kpi && typeof taskPlanSnapshot.kpi === 'object'
          ? taskPlanSnapshot.kpi
          : {},
      },
    };
  }

  return {
    input: asObject(input),
    systemStateSnapshot: asObject(systemStateSnapshot),
  };
}

function toRequestMetadata(req) {
  return {
    path: req.path,
    method: req.method,
  };
}

function toChannel(req) {
  return normalizeText(req.body?.channel || 'admin') || 'admin';
}

function toCorrelationId(req) {
  return normalizeText(req.correlationId) || normalizeText(req.get('x-correlation-id')) || null;
}

function toIdempotencyKey(req) {
  return (
    normalizeText(req.get('x-idempotency-key')) ||
    normalizeText(req.body?.idempotencyKey) ||
    null
  );
}

function toActor(req) {
  return {
    id: req.auth.userId,
    role: req.auth.role,
  };
}

function toTenantId(req) {
  return req.auth.tenantId;
}

function toGatewayBlockedResponse(gatewayResult = {}) {
  return (
    gatewayResult.safe_response || {
      error:
        'Capability-resultatet blockerades av risk/policy. Granska körningen i riskpanelen.',
    }
  );
}

function toSuccessPayload(result = {}) {
  const gatewayResult = result.gatewayResult || {};
  return gatewayResult.response_payload || {};
}

function toErrorPayload(error) {
  return {
    error: error?.message || 'Kunde inte exekvera capability.',
    code: error?.code || 'CAPABILITY_RUN_FAILED',
    details: error?.details || null,
  };
}

function isBlockedDecision(gatewayResult = {}) {
  return (
    gatewayResult.decision === 'blocked' || gatewayResult.decision === 'critical_escalate'
  );
}

function isRoleAllowed(req) {
  return Boolean(req?.auth?.role);
}

function ensureRoleContext(req, res) {
  if (isRoleAllowed(req)) return true;
  res.status(401).json({ error: 'Ingen auth context.' });
  return false;
}

function toCapabilityName(req) {
  return normalizeText(req.params?.capabilityName);
}

function validateCapabilityName(capabilityName, res) {
  if (capabilityName) return true;
  res.status(400).json({ error: 'capabilityName krävs.' });
  return false;
}

function toAgentName(req) {
  return normalizeText(req.params?.agentName);
}

function validateAgentName(agentName, res) {
  if (agentName) return true;
  res.status(400).json({ error: 'agentName kravs.' });
  return false;
}

function toMetaPayload(executor) {
  return {
    capabilities: executor.listCapabilities(),
    agentBundles: executor.listAgentBundles(),
  };
}

function toAnalysisQuery(req) {
  return {
    capabilityName: normalizeText(req.query?.capability),
    agentName: normalizeText(req.query?.agent),
    limit: Math.max(1, Math.min(500, Number(req.query?.limit || 50) || 50)),
  };
}

function resolveAnalysisCapabilityName(query = {}) {
  const capabilityName = normalizeText(query?.capabilityName);
  if (capabilityName) return capabilityName;
  const agentName = normalizeText(query?.agentName).toUpperCase();
  if (!agentName) return '';
  if (agentName === 'COO') return 'COO.DailyBrief';
  return `${agentName}.DailyBrief`;
}

function toAnalysisPayload(entries = [], capabilityName = '', agentName = '') {
  return {
    entries,
    count: entries.length,
    capability: capabilityName || null,
    agent: agentName || null,
  };
}

function toAnalysisUnavailable(res) {
  return res.status(503).json({ error: 'Capability analysis store är inte konfigurerad.' });
}

function toAnalysisError(res) {
  return res.status(500).json({ error: 'Kunde inte läsa capability analysis.' });
}

function toCapabilityRunError(res, error) {
  const status = pickErrorStatus(error?.code);
  return res.status(status).json(toErrorPayload(error));
}

function toCapabilityRunBlocked(res, result = {}) {
  return res.status(403).json(toGatewayBlockedResponse(result.gatewayResult || {}));
}

function toCapabilityRunSuccess(res, result = {}) {
  return res.json(toSuccessPayload(result));
}

function toRoleGuardedHandler(handler) {
  return async (req, res) => {
    if (!ensureRoleContext(req, res)) return;
    return handler(req, res);
  };
}

async function runCapabilityHandler({
  req,
  res,
  executor,
  capabilityName,
  templateStore,
}) {
  const payload = await maybeHydrateCapabilityPayload({
    capabilityName,
    tenantId: toTenantId(req),
    templateStore,
    input: req.body?.input,
    systemStateSnapshot: req.body?.systemStateSnapshot,
  });

  const result = await executor.runCapability({
    tenantId: toTenantId(req),
    actor: toActor(req),
    channel: toChannel(req),
    capabilityName,
    input: payload.input,
    systemStateSnapshot: payload.systemStateSnapshot,
    correlationId: toCorrelationId(req),
    idempotencyKey: toIdempotencyKey(req),
    requestMetadata: toRequestMetadata(req),
  });

  if (isBlockedDecision(result.gatewayResult || {})) {
    return toCapabilityRunBlocked(res, result);
  }
  return toCapabilityRunSuccess(res, result);
}

async function runAgentHandler({
  req,
  res,
  executor,
  agentName,
  templateStore,
}) {
  const payload = await maybeHydrateAgentPayload({
    agentName,
    tenantId: toTenantId(req),
    templateStore,
    input: req.body?.input,
    systemStateSnapshot: req.body?.systemStateSnapshot,
  });

  const result = await executor.runAgent({
    tenantId: toTenantId(req),
    actor: toActor(req),
    channel: toChannel(req),
    agentName,
    input: payload.input,
    systemStateSnapshot: payload.systemStateSnapshot,
    correlationId: toCorrelationId(req),
    idempotencyKey: toIdempotencyKey(req),
    requestMetadata: toRequestMetadata(req),
  });

  if (isBlockedDecision(result.gatewayResult || {})) {
    return toCapabilityRunBlocked(res, result);
  }
  return toCapabilityRunSuccess(res, result);
}

async function readAnalysisHandler({ req, res, capabilityAnalysisStore }) {
  if (!capabilityAnalysisStore || typeof capabilityAnalysisStore.list !== 'function') {
    return toAnalysisUnavailable(res);
  }
  const query = toAnalysisQuery(req);
  const resolvedCapabilityName = resolveAnalysisCapabilityName(query);
  const entries = await capabilityAnalysisStore.list({
    tenantId: toTenantId(req),
    capabilityName: resolvedCapabilityName,
    limit: query.limit,
  });
  return res.json(toAnalysisPayload(entries, resolvedCapabilityName, query.agentName));
}

function toMetaHandler({ executor }) {
  return async (_req, res) => res.json(toMetaPayload(executor));
}

function toCapabilityRunHandler({ executor, templateStore }) {
  return async (req, res) => {
    const capabilityName = toCapabilityName(req);
    if (!validateCapabilityName(capabilityName, res)) return;
    try {
      return await runCapabilityHandler({
        req,
        res,
        executor,
        capabilityName,
        templateStore,
      });
    } catch (error) {
      return toCapabilityRunError(res, error);
    }
  };
}

function toAgentRunHandler({ executor, templateStore }) {
  return async (req, res) => {
    const agentName = toAgentName(req);
    if (!validateAgentName(agentName, res)) return;
    try {
      return await runAgentHandler({
        req,
        res,
        executor,
        agentName,
        templateStore,
      });
    } catch (error) {
      return toCapabilityRunError(res, error);
    }
  };
}

function toAnalysisHandler({ capabilityAnalysisStore }) {
  return async (req, res) => {
    try {
      return await readAnalysisHandler({ req, res, capabilityAnalysisStore });
    } catch (error) {
      console.error(error);
      return toAnalysisError(res);
    }
  };
}

function createCapabilitiesRouter({
  authStore,
  tenantConfigStore,
  requireAuth,
  requireRole,
  executionGateway = null,
  capabilityAnalysisStore = null,
  templateStore = null,
}) {
  const router = express.Router();
  const gateway =
    executionGateway ||
    createExecutionGateway({
      buildVersion: process.env.npm_package_version || 'dev',
    });
  const executor = createCapabilityExecutor({
    executionGateway: gateway,
    authStore,
    tenantConfigStore,
    capabilityAnalysisStore,
    buildVersion: process.env.npm_package_version || 'dev',
  });

  router.get(
    '/capabilities/meta',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    toRoleGuardedHandler(toMetaHandler({ executor }))
  );

  router.get(
    '/agents/meta',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    toRoleGuardedHandler(toMetaHandler({ executor }))
  );

  router.get(
    '/capabilities/analysis',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    toRoleGuardedHandler(toAnalysisHandler({ capabilityAnalysisStore }))
  );

  router.get(
    '/agents/analysis',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    toRoleGuardedHandler(toAnalysisHandler({ capabilityAnalysisStore }))
  );

  router.post(
    '/capabilities/:capabilityName/run',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    toRoleGuardedHandler(toCapabilityRunHandler({ executor, templateStore }))
  );

  router.post(
    '/agents/:agentName/run',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    toRoleGuardedHandler(toAgentRunHandler({ executor, templateStore }))
  );

  return router;
}

module.exports = {
  createCapabilitiesRouter,
};
