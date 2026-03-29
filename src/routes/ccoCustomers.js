const express = require('express');

const { ROLE_OWNER, ROLE_STAFF } = require('../security/roles');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getIncomingCustomerState(body) {
  return body?.customerState && typeof body.customerState === 'object' ? body.customerState : null;
}

function createCcoCustomersRouter({
  customerStore,
  authStore,
  requireAuth,
  requireRole,
}) {
  const router = express.Router();

  router.get(
    '/cco/customers/state',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const customerState = await customerStore.getTenantCustomerState({
          tenantId: req.auth.tenantId,
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.read',
          outcome: 'success',
          targetType: 'cco_customers',
          targetId: req.auth.tenantId,
        });
        return res.json({ customerState });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Kunde inte läsa kundläget.' });
      }
    }
  );

  router.put(
    '/cco/customers/state',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const customerState = await customerStore.saveTenantCustomerState({
          tenantId: req.auth.tenantId,
          customerState: req.body?.customerState || req.body || {},
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.update',
          outcome: 'success',
          targetType: 'cco_customers',
          targetId: req.auth.tenantId,
          metadata: {
            directoryCount: Object.keys(customerState.directory || {}).length,
            mergedCount: Object.keys(customerState.mergedInto || {}).length,
          },
        });
        return res.json({ ok: true, customerState });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Kunde inte spara kundläget.' });
      }
    }
  );

  router.post(
    '/cco/customers/identity/suggestions',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const payload = await customerStore.previewTenantCustomerIdentity({
          tenantId: req.auth.tenantId,
          customerState: getIncomingCustomerState(req.body),
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.identity.suggestions',
          outcome: 'success',
          targetType: 'cco_customer_identity',
          targetId: req.auth.tenantId,
          metadata: {
            duplicateCount: Number(payload.duplicateCount || 0),
          },
        });
        return res.json({ ok: true, ...payload });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Kunde inte beräkna identitetsförslagen.' });
      }
    }
  );

  router.post(
    '/cco/customers/identity/merge',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const primaryKey = normalizeText(req.body?.primaryKey);
        const secondaryKeys = Array.isArray(req.body?.secondaryKeys) ? req.body.secondaryKeys : [];
        if (!primaryKey || secondaryKeys.length < 1) {
          return res.status(400).json({ error: 'Primär och sekundär kund krävs för merge.' });
        }
        const payload = await customerStore.mergeTenantCustomerProfiles({
          tenantId: req.auth.tenantId,
          customerState: getIncomingCustomerState(req.body),
          primaryKey,
          secondaryKeys,
          suggestionId: normalizeText(req.body?.suggestionId),
          options: req.body?.options && typeof req.body.options === 'object' ? req.body.options : {},
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.identity.merge',
          outcome: 'success',
          targetType: 'cco_customer_identity',
          targetId: req.auth.tenantId,
          metadata: {
            primaryKey,
            secondaryCount: secondaryKeys.length,
          },
        });
        return res.json({ ok: true, ...payload });
      } catch (error) {
        console.error(error);
        const message = normalizeText(error?.message) || 'Kunde inte slå ihop kundprofilerna.';
        return res.status(message.includes('krävs') ? 400 : 500).json({ error: message });
      }
    }
  );

  router.post(
    '/cco/customers/identity/split',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const customerKey = normalizeText(req.body?.customerKey);
        const email = normalizeText(req.body?.email);
        if (!customerKey || !email) {
          return res.status(400).json({ error: 'Kund och e-post krävs för split.' });
        }
        const payload = await customerStore.splitTenantCustomerProfile({
          tenantId: req.auth.tenantId,
          customerState: getIncomingCustomerState(req.body),
          customerKey,
          email,
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.identity.split',
          outcome: 'success',
          targetType: 'cco_customer_identity',
          targetId: req.auth.tenantId,
          metadata: {
            customerKey,
            email,
            newKey: payload.newKey,
          },
        });
        return res.json({ ok: true, ...payload });
      } catch (error) {
        console.error(error);
        const message = normalizeText(error?.message) || 'Kunde inte dela upp kundprofilen.';
        return res.status(message.includes('krävs') ? 400 : 500).json({ error: message });
      }
    }
  );

  router.post(
    '/cco/customers/identity/primary-email',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const customerKey = normalizeText(req.body?.customerKey);
        const email = normalizeText(req.body?.email);
        if (!customerKey || !email) {
          return res.status(400).json({ error: 'Kund och e-post krävs för primär adress.' });
        }
        const payload = await customerStore.setTenantCustomerPrimaryEmail({
          tenantId: req.auth.tenantId,
          customerState: getIncomingCustomerState(req.body),
          customerKey,
          email,
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.identity.primary_email',
          outcome: 'success',
          targetType: 'cco_customer_identity',
          targetId: req.auth.tenantId,
          metadata: {
            customerKey,
            email,
          },
        });
        return res.json({ ok: true, ...payload });
      } catch (error) {
        console.error(error);
        const message = normalizeText(error?.message) || 'Kunde inte sätta primär e-post.';
        return res.status(message.includes('krävs') ? 400 : 500).json({ error: message });
      }
    }
  );

  router.post(
    '/cco/customers/identity/dismiss',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const suggestionId = normalizeText(req.body?.suggestionId);
        if (!suggestionId) {
          return res.status(400).json({ error: 'Förslags-id krävs.' });
        }
        const payload = await customerStore.dismissTenantCustomerSuggestion({
          tenantId: req.auth.tenantId,
          customerState: getIncomingCustomerState(req.body),
          suggestionId,
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.identity.dismiss',
          outcome: 'success',
          targetType: 'cco_customer_identity',
          targetId: req.auth.tenantId,
          metadata: {
            suggestionId,
          },
        });
        return res.json({ ok: true, ...payload });
      } catch (error) {
        console.error(error);
        const message = normalizeText(error?.message) || 'Kunde inte markera förslaget.';
        return res.status(message.includes('krävs') ? 400 : 500).json({ error: message });
      }
    }
  );

  router.post(
    '/cco/customers/import/preview',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const importText = normalizeText(req.body?.text || req.body?.importText);
        const fileName = normalizeText(req.body?.fileName);
        const defaultMailboxId = normalizeText(req.body?.defaultMailboxId).toLowerCase();
        const binaryBase64 = normalizeText(req.body?.binaryBase64 || req.body?.fileBase64);
        const rows = Array.isArray(req.body?.rows) ? req.body.rows : null;
        if (!importText && !binaryBase64 && (!Array.isArray(rows) || !rows.length)) {
          return res.status(400).json({ error: 'Importkällan är tom.' });
        }
        const importSummary = await customerStore.previewTenantCustomerImport({
          tenantId: req.auth.tenantId,
          importText,
          rows,
          binaryBase64,
          fileName,
          defaultMailboxId,
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.import.preview',
          outcome: 'success',
          targetType: 'cco_customers_import',
          targetId: req.auth.tenantId,
          metadata: {
            fileName,
            defaultMailboxId,
            sourceMode: Array.isArray(rows) ? 'rows' : binaryBase64 ? 'binary' : 'text',
            totalRows: importSummary.totalRows,
            validRows: importSummary.validRows,
            created: importSummary.created,
            updated: importSummary.updated,
            merged: importSummary.merged,
            invalid: importSummary.invalid,
          },
        });
        return res.json({ ok: true, importSummary });
      } catch (error) {
        console.error(error);
        const message = normalizeText(error?.message);
        const statusCode =
          message === 'Importkällan är tom.' ||
          message.startsWith('CSV-importen måste innehålla') ||
          message.startsWith('Kalkylbladsfilen') ||
          message.includes('Unexpected token')
            ? 400
            : 500;
        return res.status(statusCode).json({
          error: statusCode === 400 ? message || 'Ogiltig importfil.' : 'Kunde inte förhandsgranska importen.',
        });
      }
    }
  );

  router.post(
    '/cco/customers/import/commit',
    requireAuth,
    requireRole(ROLE_OWNER, ROLE_STAFF),
    async (req, res) => {
      try {
        const importText = normalizeText(req.body?.text || req.body?.importText);
        const fileName = normalizeText(req.body?.fileName);
        const defaultMailboxId = normalizeText(req.body?.defaultMailboxId).toLowerCase();
        const binaryBase64 = normalizeText(req.body?.binaryBase64 || req.body?.fileBase64);
        const rows = Array.isArray(req.body?.rows) ? req.body.rows : null;
        if (!importText && !binaryBase64 && (!Array.isArray(rows) || !rows.length)) {
          return res.status(400).json({ error: 'Importkällan är tom.' });
        }
        const { customerState, importSummary } = await customerStore.commitTenantCustomerImport({
          tenantId: req.auth.tenantId,
          importText,
          rows,
          binaryBase64,
          fileName,
          defaultMailboxId,
        });
        await authStore.addAuditEvent({
          tenantId: req.auth.tenantId,
          actorUserId: req.auth.userId,
          action: 'cco.customers.import.commit',
          outcome: 'success',
          targetType: 'cco_customers_import',
          targetId: req.auth.tenantId,
          metadata: {
            fileName,
            defaultMailboxId,
            sourceMode: Array.isArray(rows) ? 'rows' : binaryBase64 ? 'binary' : 'text',
            totalRows: importSummary.totalRows,
            validRows: importSummary.validRows,
            created: importSummary.created,
            updated: importSummary.updated,
            merged: importSummary.merged,
            invalid: importSummary.invalid,
          },
        });
        return res.json({ ok: true, importSummary, customerState });
      } catch (error) {
        console.error(error);
        const message = normalizeText(error?.message);
        const statusCode =
          message === 'Importkällan är tom.' ||
          message.startsWith('CSV-importen måste innehålla') ||
          message.startsWith('Kalkylbladsfilen') ||
          message.includes('Unexpected token')
            ? 400
            : 500;
        return res.status(statusCode).json({
          error: statusCode === 400 ? message || 'Ogiltig importfil.' : 'Kunde inte importera kunderna.',
        });
      }
    }
  );

  return router;
}

module.exports = {
  createCcoCustomersRouter,
};
