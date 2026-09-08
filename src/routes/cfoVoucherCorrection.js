'use strict';

/**
 * ORD-168 · Rättelseverifikat via Fortnox API.
 *
 * Två endpoints:
 *   POST /api/v1/cco-cf/voucher-correction/dry-run  { spec }
 *   POST /api/v1/cco-cf/voucher-correction/run      { spec, dryRun?:false }
 *
 * Specen skickas in — modulen härleder ingenting. Validering (balans,
 * betalkonto överst, dubbla descriptions) körs alltid, även i dryRun.
 *
 * Skarp körning kräver:
 *   1. FINANCE_ROLES (RBAC)
 *   2. ARCANA_CFO_VOUCHER_CORRECTION_ENABLED=true ELLER override-fil
 *   3. Fortnox OAuth ansluten med bookkeeping-scope
 *   4. dryRun uttryckligen false
 */

const express = require('express');
const { createFortnoxClient } = require('../cfo/cfoFortnoxClient');
const { createCfoVoucherCorrection } = require('../cfo/cfoVoucherCorrection');
const { resolveConnectedFortnoxTenantId } = require('../cfo/cfoFortnoxTenantResolve');
const { requireAnyRole, FINANCE_ROLES } = require('../security/ccoRbac');

function createCfoVoucherCorrectionRouter({
  authStore,
  fortnoxStore = null,
  config = {},
  auditLog = null,
}) {
  const router = express.Router();
  const requireAuth = authStore.requireAuth;

  function audit(event, payload) {
    try {
      if (auditLog && typeof auditLog.append === 'function') {
        auditLog.append({ event, ...payload, at: new Date().toISOString() });
      }
    } catch {
      /* audit får aldrig fälla en körning */
    }
  }

  async function buildRunner() {
    let fortnoxClient = null;
    let connectionProbe = null;
    if (fortnoxStore) {
      const tenantId = await resolveConnectedFortnoxTenantId(
        fortnoxStore,
        config.defaultTenantId || ''
      );
      connectionProbe = { getConnection: () => fortnoxStore.getConnection({ tenantId }) };
      if (config.fortnoxClientId && config.fortnoxClientSecret) {
        fortnoxClient = createFortnoxClient({
          clientId: config.fortnoxClientId,
          clientSecret: config.fortnoxClientSecret,
          tenantId,
          getConnection: (input) => fortnoxStore.getConnection(input),
          saveConnection: (input) => fortnoxStore.saveConnection(input),
        });
      }
    }
    return createCfoVoucherCorrection({
      fortnoxClient,
      fortnoxStore: connectionProbe,
      audit,
    });
  }

  // Granskning. Validerar specen och bygger payloads. Skriver ingenting.
  router.post(
    '/cco-cf/voucher-correction/dry-run',
    requireAuth,
    requireAnyRole(FINANCE_ROLES),
    async (req, res) => {
      try {
        const runner = await buildRunner();
        const result = await runner.run({ spec: req.body?.spec, dryRun: true });
        return res.status(result.ok ? 200 : 400).json(result);
      } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
      }
    }
  );

  // Skarp körning. Fail-closed i cfoVoucherCorrection.
  let runInProgress = false;
  router.post(
    '/cco-cf/voucher-correction/run',
    requireAuth,
    requireAnyRole(FINANCE_ROLES),
    async (req, res) => {
      if (runInProgress) {
        return res
          .status(409)
          .json({ ok: false, error: 'run_in_progress — vänta tills pågående körning är klar' });
      }
      runInProgress = true;
      try {
        const runner = await buildRunner();
        const dryRun = req.body?.dryRun !== false; // default: torrt
        const result = await runner.run({ spec: req.body?.spec, dryRun });
        audit('cf.fortnox.voucher_correction_run', {
          dryRun,
          count: result.count || 0,
          created: result.created || 0,
          failed: result.failed || 0,
        });
        return res.status(result.ok ? 200 : 409).json(result);
      } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
      } finally {
        runInProgress = false;
      }
    }
  );

  return router;
}

module.exports = { createCfoVoucherCorrectionRouter };
