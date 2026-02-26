const express = require('express');

const { ROLE_OWNER, ROLE_STAFF } = require('../security/roles');
const { getPolicyFloorDefinition, evaluatePolicyFloorText } = require('../policy/floor');
const { evaluateTemplateRisk } = require('../risk/templateRisk');
const { createExecutionGateway } = require('../gateway/executionGateway');
const { getRuntimeProfile } = require('../agents/runtimeRegistry');
const { listCapabilities, listAgentBundles } = require('../capabilities/registry');
const {
  AGENTS,
  INTENTS,
  getOrchestratorRoadmap,
  runAdminOrchestration,
} = require('../orchestrator/adminOrchestrator');

function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

async function getTenantRuntimeConfig(tenantConfigStore, tenantId) {
  const tenantConfig = await tenantConfigStore.getTenantConfig(tenantId);
  return {
    tenantConfig,
    riskSensitivityModifier: Number(tenantConfig?.riskSensitivityModifier ?? 0) || 0,
    riskThresholdVersion:
      Number.parseInt(String(tenantConfig?.riskThresholdVersion ?? 1), 10) || 1,
  };
}

function createOrchestratorRouter({
  tenantConfigStore,
  authStore,
  requireAuth,
  requireRole,
  executionGateway = null,
}) {
  const router = express.Router();
  const gateway =
    executionGateway ||
    createExecutionGateway({
      buildVersion: process.env.npm_package_version || 'dev',
    });
  const adminRuntime = getRuntimeProfile('admin');

  router.get(
    '/orchestrator/meta',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      return res.json({
        agents: AGENTS,
        capabilityAgents: listAgentBundles(),
        capabilities: listCapabilities(),
        intents: INTENTS,
        policyFloor: getPolicyFloorDefinition(),
        runtime: adminRuntime,
        roadmap: getOrchestratorRoadmap(),
      });
    }
  );

  router.post(
    '/orchestrator/admin-run',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const prompt = normalizeText(req.body?.prompt);
        if (!prompt) {
          return res.status(400).json({ error: 'prompt krävs.' });
        }

        const correlationId =
          normalizeText(req.correlationId) || normalizeText(req.get('x-correlation-id')) || null;
        const idempotencyKey =
          normalizeText(req.get('x-idempotency-key')) ||
          normalizeText(req.body?.idempotencyKey) ||
          null;

        const tenantRuntime = await getTenantRuntimeConfig(
          tenantConfigStore,
          req.auth.tenantId
        );

        const gatewayResult = await gateway.run({
          context: {
            tenant_id: req.auth.tenantId,
            actor: {
              id: req.auth.userId,
              role: req.auth.role,
            },
            channel: 'admin',
            intent: 'orchestrator.admin_run',
            payload: {
              prompt,
              runtimeId: adminRuntime.id,
            },
            correlation_id: correlationId,
            idempotency_key: idempotencyKey,
          },
          handlers: {
            audit: async (event) => {
              await authStore.addAuditEvent({
                tenantId: req.auth.tenantId,
                actorUserId: req.auth.userId,
                action: event.action,
                outcome: event.outcome,
                targetType: 'gateway_run',
                targetId: String(event?.metadata?.runId || ''),
                metadata: event.metadata || {},
              });
            },
            inputRisk: async () =>
              evaluateTemplateRisk({
                scope: 'input',
                category: 'INTERNAL',
                content: prompt,
                tenantRiskModifier: tenantRuntime.riskSensitivityModifier,
                riskThresholdVersion: tenantRuntime.riskThresholdVersion,
              }),
            agentRun: async () => {
              const result = await runAdminOrchestration({
                prompt,
                role: req.auth.role,
                tenantId: req.auth.tenantId,
                tenantConfig: tenantRuntime.tenantConfig,
              });
              return {
                result,
              };
            },
            outputRisk: async ({ agentResult }) => {
              const outputText =
                normalizeText(agentResult?.result?.output?.text) ||
                JSON.stringify(agentResult?.result || {});
              return evaluateTemplateRisk({
                scope: 'output',
                category: 'INTERNAL',
                content: outputText,
                tenantRiskModifier: tenantRuntime.riskSensitivityModifier,
                riskThresholdVersion: tenantRuntime.riskThresholdVersion,
              });
            },
            policyFloor: async ({ agentResult }) => {
              const outputText =
                normalizeText(agentResult?.result?.output?.text) ||
                JSON.stringify(agentResult?.result || {});
              return evaluatePolicyFloorText({
                text: outputText,
                context: 'orchestrator',
              });
            },
            safeResponse: () => ({
              error:
                'Orchestrator-svaret blockerades av risk/policy. Granska ärendet i riskpanelen innan nytt försök.',
              runtime: {
                id: adminRuntime.id,
                domain: adminRuntime.domain,
              },
            }),
            response: ({ agentResult }) => ({
              ...(agentResult?.result || {}),
              runtime: {
                id: adminRuntime.id,
                domain: adminRuntime.domain,
                policyProfile: adminRuntime.policyProfile,
              },
            }),
          },
        });

        if (gatewayResult.decision === 'blocked' || gatewayResult.decision === 'critical_escalate') {
          await authStore.addAuditEvent({
            tenantId: req.auth.tenantId,
            actorUserId: req.auth.userId,
            action: 'orchestrator.admin_run',
            outcome: 'blocked',
            targetType: 'orchestration',
            targetId: req.auth.tenantId,
            metadata: {
              decision: gatewayResult.decision,
              policy: gatewayResult.policy_summary,
              risk: gatewayResult.risk_summary,
              runtimeId: adminRuntime.id,
            },
          });
          return res.status(403).json(
            gatewayResult.safe_response || {
              error:
                'Orchestrator-svaret blockerades av risk/policy. Granska ärendet i riskpanelen innan nytt försök.',
              runtime: {
                id: adminRuntime.id,
                domain: adminRuntime.domain,
              },
            }
          );
        }

        const payload = gatewayResult.response_payload || {};
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'orchestrator.admin_run',
          outcome: 'success',
          targetType: 'orchestration',
          targetId: req.auth.tenantId,
          metadata: {
            intent: payload.intent || null,
            confidence: payload.confidence || null,
            safetyAdjusted: payload.output?.safetyAdjusted === true,
            riskLevel: payload.output?.risk?.riskLevel || null,
            runtimeId: adminRuntime.id,
          },
        });

        return res.json(payload);
      } catch (error) {
        if (error?.message) {
          return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Kunde inte köra orchestrator.' });
      }
    }
  );

  return router;
}

module.exports = {
  createOrchestratorRouter,
};
