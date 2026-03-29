const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createCcoFollowUpStore } = require('../../src/ops/ccoFollowUpStore');

test('cco follow-up store skapar, listar och hittar konflikter', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-followup-store-'));
  const filePath = path.join(tempDir, 'cco-followups.json');

  try {
    const store = await createCcoFollowUpStore({ filePath });

    const created = await store.createFollowUp({
      tenantId: 'tenant-a',
      workspaceId: 'major-arcana-preview',
      conversationId: 'conv-1',
      customerId: 'anna.karlsson@email.com',
      customerName: 'Anna Karlsson',
      date: '2026-03-27',
      time: '10:30',
      doctorName: 'Dr. Eriksson',
      category: 'Ombokning',
      reminderLeadMinutes: 120,
      notes: 'PRP 2/3 - Ombokning.',
      actorUserId: 'owner-a',
    });

    assert.equal(created.category, 'Ombokning');
    assert.equal(created.reminderLeadMinutes, 120);
    assert.equal(created.scheduledForIso, '2026-03-27T10:30:00.000Z');

    const items = await store.listFollowUps({
      tenantId: 'tenant-a',
      workspaceId: 'major-arcana-preview',
      conversationId: 'conv-1',
    });

    assert.equal(items.length, 1);
    assert.equal(items[0].followUpId, created.followUpId);

    const conflict = await store.findConflict({
      tenantId: 'tenant-a',
      doctorName: 'Dr. Eriksson',
      scheduledForIso: '2026-03-27T10:30:00.000Z',
    });

    assert.equal(conflict.followUpId, created.followUpId);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
