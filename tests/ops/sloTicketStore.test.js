const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createSloTicketStore } = require('../../src/ops/sloTicketStore');

test('slo ticket store upserts, lists and resolves tickets per tenant', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-slo-ticket-store-'));
  const filePath = path.join(tmpDir, 'slo-tickets.json');

  try {
    const store = await createSloTicketStore({
      filePath,
      maxTickets: 200,
    });

    const first = await store.upsertBreach({
      tenantId: 'tenant-a',
      signature: 'availability_http_breach',
      severity: 'critical',
      summary: 'HTTP availability breach',
      details: '5xx över tröskel',
      metadata: { sampledRequests: 120, serverErrors: 12 },
    });
    assert.equal(first.created, true);
    assert.equal(first.ticket.status, 'open');

    const second = await store.upsertBreach({
      tenantId: 'tenant-a',
      signature: 'availability_http_breach',
      severity: 'critical',
      summary: 'HTTP availability breach',
      details: 'fortfarande över tröskel',
      metadata: { sampledRequests: 150, serverErrors: 15 },
    });
    assert.equal(second.created, false);
    assert.equal(second.ticket.occurrences, 2);

    const listOpen = await store.listTickets({
      tenantId: 'tenant-a',
      status: 'open',
      limit: 20,
    });
    assert.equal(listOpen.count, 1);

    const summaryBefore = await store.summarize({ tenantId: 'tenant-a' });
    assert.equal(summaryBefore.totals.open, 1);
    assert.equal(summaryBefore.totals.openBreaches, 1);

    const resolved = await store.resolveTicket({
      tenantId: 'tenant-a',
      ticketId: second.ticket.id,
      resolvedBy: 'owner-1',
      note: 'mitigated',
    });
    assert.equal(resolved.status, 'resolved');

    const summaryAfter = await store.summarize({ tenantId: 'tenant-a' });
    assert.equal(summaryAfter.totals.open, 0);
    assert.equal(summaryAfter.totals.resolved, 1);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
