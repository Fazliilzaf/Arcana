const test = require('node:test');
const assert = require('node:assert/strict');

const { summarizeIncidentsCapability } = require('../../src/capabilities/summarizeIncidents');
const { validateJsonSchema } = require('../../src/capabilities/schemaValidator');

test('SummarizeIncidents returns schema-valid structured output with max 5 recommendations', async () => {
  const output = await new summarizeIncidentsCapability().execute({
    tenantId: 'tenant-a',
    actor: { id: 'owner-a', role: 'OWNER' },
    channel: 'admin',
    requestId: 'req-inc-1',
    correlationId: 'corr-inc-1',
    input: {
      includeClosed: false,
      timeframeDays: 14,
    },
    systemStateSnapshot: {
      incidents: [
        {
          id: 'inc-1',
          category: 'CONSULTATION',
          reasonCodes: ['DISCLOSURE_MISSING', 'DISCLOSURE_MISSING'],
          severity: 'L5',
          riskLevel: 5,
          status: 'open',
          ownerDecision: 'pending',
          updatedAt: new Date().toISOString(),
          sla: { state: 'critical', breached: false },
        },
        {
          id: 'inc-2',
          category: 'CONSULTATION',
          reasonCodes: ['DISCLOSURE_MISSING'],
          severity: 'L4',
          riskLevel: 4,
          status: 'escalated',
          ownerDecision: 'escalated',
          updatedAt: new Date().toISOString(),
          sla: { state: 'breached', breached: true },
        },
        {
          id: 'inc-3',
          category: 'AFTERCARE',
          reasonCodes: ['DISCLAIMERS_MISSING'],
          severity: 'L3',
          riskLevel: 3,
          status: 'open',
          ownerDecision: 'pending',
          updatedAt: new Date().toISOString(),
          sla: { state: 'warn', breached: false },
        },
      ],
      slaStatus: { critical: 1, breached: 1 },
      timestamps: { capturedAt: new Date().toISOString() },
    },
  });

  const validation = validateJsonSchema({
    schema: summarizeIncidentsCapability.outputSchema,
    value: output,
    rootPath: 'capability.output',
  });

  assert.equal(validation.ok, true, `schema validation errors: ${JSON.stringify(validation.errors)}`);
  assert.equal(typeof output.data.summary, 'string');
  assert.equal(typeof output.data.severityBreakdown, 'object');
  assert.equal(Array.isArray(output.data.recurringPatterns), true);
  assert.equal(typeof output.data.escalationRisk, 'string');
  assert.equal(Array.isArray(output.data.recommendations), true);
  assert.equal(output.data.recommendations.length > 0, true);
  assert.equal(output.data.recommendations.length <= 5, true);
  assert.equal(output.metadata.capability, 'SummarizeIncidents');
  assert.equal(Array.isArray(output.warnings), true);
});

test('SummarizeIncidents creates fallback recommendation when incident list is empty', async () => {
  const output = await new summarizeIncidentsCapability().execute({
    tenantId: 'tenant-a',
    actor: { id: 'staff-a', role: 'STAFF' },
    channel: 'admin',
    requestId: 'req-inc-2',
    correlationId: 'corr-inc-2',
    input: {
      includeClosed: true,
      timeframeDays: 30,
    },
    systemStateSnapshot: {
      incidents: [],
      slaStatus: {},
      timestamps: {},
    },
  });

  assert.equal(output.data.recommendations.length, 1);
  assert.equal(output.data.recommendations[0].includes('daglig incidenttriage'), true);
  assert.equal(output.data.severityBreakdown.L3, 0);
  assert.equal(output.data.severityBreakdown.L4, 0);
  assert.equal(output.data.severityBreakdown.L5, 0);
});
