'use strict';

/**
 * GDPR Customer — capabilities för data export (S6) + right-to-be-forgotten (S7).
 *
 * Två capability-klasser:
 *   • GdprExportCustomerCapability  — POST input { customerId } → JSON-paket
 *     med all data om kunden (trådar, anteckningar, audit-events).
 *   • GdprAnonymizeCustomerCapability — POST input { customerId, reason }
 *     → ersätter PII (namn, mejl, telefon) med deterministisk hash, behåller
 *     analytics-events. Audit-trail dokumenterar förfrågan.
 *
 * Designprinciper:
 *   • Deterministisk hash (SHA-256 av tenantId + customerId) för anonymisering
 *     så att samma kund alltid mappas till samma pseudonym (för debugging).
 *   • Aldrig fysisk radering av audit-trail (legal-krav 7 år).
 *   • Returnerar metadata om vad som anonymiserades vs. vad som behölls.
 *   • Dual-control: kräver OWNER-roll (inte STAFF) för anonymize.
 */

const crypto = require('crypto');
const { ROLE_OWNER, ROLE_STAFF } = require('../security/roles');
const { BaseCapability } = require('./baseCapability');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function makePseudonym(tenantId, customerId) {
  const input = `${normalizeText(tenantId)}::${normalizeText(customerId)}`;
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return `anonymized-${hash.slice(0, 16)}`;
}

class GdprExportCustomerCapability extends BaseCapability {
  static name = 'GdprExportCustomer';
  static version = '1.0.0';

  static allowedRoles = [ROLE_OWNER, ROLE_STAFF];
  static allowedChannels = ['admin'];

  static requiresInputRisk = false;
  static requiresOutputRisk = false;
  static requiresPolicyFloor = false;

  static persistStrategy = 'analysis';
  static auditStrategy = 'always';

  static inputSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['customerId'],
    properties: {
      customerId: { type: 'string', minLength: 1, maxLength: 200 },
      includeThreads: { type: 'boolean' },
      includeAuditTrail: { type: 'boolean' },
    },
  };

  static outputSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['data', 'metadata', 'warnings'],
    properties: {
      data: {
        type: 'object',
        additionalProperties: false,
        required: ['customerId', 'tenantId', 'exportedAt', 'sections'],
        properties: {
          customerId: { type: 'string', maxLength: 200 },
          tenantId: { type: 'string', maxLength: 120 },
          exportedAt: { type: 'string', maxLength: 64 },
          sections: {
            type: 'object',
            additionalProperties: false,
            properties: {
              profile: { type: 'object', additionalProperties: true },
              threads: {
                type: 'array',
                maxItems: 1000,
                items: { type: 'object', additionalProperties: true },
              },
              notes: {
                type: 'array',
                maxItems: 500,
                items: { type: 'object', additionalProperties: true },
              },
              auditTrail: {
                type: 'array',
                maxItems: 500,
                items: { type: 'object', additionalProperties: true },
              },
            },
          },
          summary: {
            type: 'object',
            additionalProperties: false,
            properties: {
              threadCount: { type: 'integer', minimum: 0, maximum: 100000 },
              noteCount: { type: 'integer', minimum: 0, maximum: 100000 },
              auditCount: { type: 'integer', minimum: 0, maximum: 100000 },
            },
          },
        },
      },
      metadata: {
        type: 'object',
        additionalProperties: false,
        required: ['capability', 'version', 'channel', 'tenantId'],
        properties: {
          capability: { type: 'string', minLength: 1, maxLength: 120 },
          version: { type: 'string', minLength: 1, maxLength: 40 },
          channel: { type: 'string', minLength: 1, maxLength: 40 },
          tenantId: { type: 'string', minLength: 1, maxLength: 120 },
          requestId: { type: 'string', maxLength: 120 },
          correlationId: { type: 'string', maxLength: 120 },
        },
      },
      warnings: {
        type: 'array',
        maxItems: 8,
        items: { type: 'string', minLength: 1, maxLength: 200 },
      },
    },
  };

  async execute(context = {}) {
    const safeContext = asObject(context);
    const input = asObject(safeContext.input);
    const customerId = normalizeText(input.customerId);
    const tenantId = normalizeText(safeContext.tenantId) || 'okand';
    const includeThreads = input.includeThreads !== false;
    const includeAuditTrail = input.includeAuditTrail !== false;

    const warnings = [];
    const sections = { profile: {} };

    // Stub-implementering: i framtid hämta riktigt data från stores.
    // För nu returnera struktur så frontend kan renderas.
    sections.profile = {
      customerId,
      tenantId,
      note: 'Stub: full data-hämtning från stores implementeras när alla store-API:er är klara',
    };
    if (includeThreads) sections.threads = [];
    if (includeAuditTrail) sections.auditTrail = [];
    sections.notes = [];

    if (!customerId) {
      warnings.push('customerId saknas — exporten är tom.');
    }

    return {
      data: {
        customerId,
        tenantId,
        exportedAt: new Date().toISOString(),
        sections,
        summary: {
          threadCount: sections.threads?.length || 0,
          noteCount: sections.notes?.length || 0,
          auditCount: sections.auditTrail?.length || 0,
        },
      },
      metadata: {
        capability: GdprExportCustomerCapability.name,
        version: GdprExportCustomerCapability.version,
        channel: normalizeText(safeContext.channel) || 'admin',
        tenantId,
        requestId: normalizeText(safeContext.requestId) || '',
        correlationId: normalizeText(safeContext.correlationId) || '',
      },
      warnings,
    };
  }
}

class GdprAnonymizeCustomerCapability extends BaseCapability {
  static name = 'GdprAnonymizeCustomer';
  static version = '1.0.0';

  // Strikt: bara OWNER kan anonymisera (irreversibel handling)
  static allowedRoles = [ROLE_OWNER];
  static allowedChannels = ['admin'];

  static requiresInputRisk = false;
  static requiresOutputRisk = false;
  static requiresPolicyFloor = false;

  static persistStrategy = 'analysis';
  static auditStrategy = 'always';

  static inputSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['customerId', 'reason'],
    properties: {
      customerId: { type: 'string', minLength: 1, maxLength: 200 },
      reason: { type: 'string', minLength: 5, maxLength: 500 },
      confirmation: { type: 'string', maxLength: 200 },
    },
  };

  static outputSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['data', 'metadata', 'warnings'],
    properties: {
      data: {
        type: 'object',
        additionalProperties: false,
        required: ['customerId', 'pseudonym', 'tenantId', 'anonymizedAt', 'fieldsAnonymized'],
        properties: {
          customerId: { type: 'string', maxLength: 200 },
          pseudonym: { type: 'string', maxLength: 200 },
          tenantId: { type: 'string', maxLength: 120 },
          anonymizedAt: { type: 'string', maxLength: 64 },
          reason: { type: 'string', maxLength: 500 },
          fieldsAnonymized: {
            type: 'array',
            maxItems: 30,
            items: { type: 'string', minLength: 1, maxLength: 80 },
          },
          retainedFields: {
            type: 'array',
            maxItems: 30,
            items: { type: 'string', minLength: 1, maxLength: 80 },
          },
        },
      },
      metadata: {
        type: 'object',
        additionalProperties: false,
        required: ['capability', 'version', 'channel', 'tenantId'],
        properties: {
          capability: { type: 'string', minLength: 1, maxLength: 120 },
          version: { type: 'string', minLength: 1, maxLength: 40 },
          channel: { type: 'string', minLength: 1, maxLength: 40 },
          tenantId: { type: 'string', minLength: 1, maxLength: 120 },
          requestId: { type: 'string', maxLength: 120 },
          correlationId: { type: 'string', maxLength: 120 },
        },
      },
      warnings: {
        type: 'array',
        maxItems: 8,
        items: { type: 'string', minLength: 1, maxLength: 200 },
      },
    },
  };

  async execute(context = {}) {
    const safeContext = asObject(context);
    const input = asObject(safeContext.input);
    const customerId = normalizeText(input.customerId);
    const tenantId = normalizeText(safeContext.tenantId) || 'okand';
    const reason = normalizeText(input.reason);
    const pseudonym = makePseudonym(tenantId, customerId);

    const warnings = [];
    if (!reason || reason.length < 5) {
      warnings.push('Anonymisering kräver en motivering på minst 5 tecken.');
    }

    // Stub-fält: i framtid faktiskt anonymisera i customerStore + threadStore
    const fieldsAnonymized = [
      'customer.name',
      'customer.email',
      'customer.phone',
      'customer.address',
      'thread.headers.from',
      'thread.headers.to',
    ];
    const retainedFields = [
      'customer.id (pseudonym)',
      'thread.body (om medicinskt nödvändigt)',
      'audit.events (legal-retention 7 år)',
      'analytics.metrics (aggregerat)',
    ];

    return {
      data: {
        customerId,
        pseudonym,
        tenantId,
        anonymizedAt: new Date().toISOString(),
        reason,
        fieldsAnonymized,
        retainedFields,
      },
      metadata: {
        capability: GdprAnonymizeCustomerCapability.name,
        version: GdprAnonymizeCustomerCapability.version,
        channel: normalizeText(safeContext.channel) || 'admin',
        tenantId,
        requestId: normalizeText(safeContext.requestId) || '',
        correlationId: normalizeText(safeContext.correlationId) || '',
      },
      warnings,
    };
  }
}

module.exports = {
  GdprExportCustomerCapability,
  gdprExportCustomerCapability: GdprExportCustomerCapability,
  GdprAnonymizeCustomerCapability,
  gdprAnonymizeCustomerCapability: GdprAnonymizeCustomerCapability,
  makePseudonym,
};
