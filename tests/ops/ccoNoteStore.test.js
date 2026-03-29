const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createCcoNoteStore } = require('../../src/ops/ccoNoteStore');

test('cco note store sparar, normaliserar och uppdaterar anteckningar per destination', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-note-store-'));
  const filePath = path.join(tempDir, 'cco-notes.json');

  try {
    const store = await createCcoNoteStore({ filePath });

    const created = await store.saveNote({
      tenantId: 'tenant-a',
      workspaceId: 'major-arcana-preview',
      conversationId: 'conv-1',
      customerId: 'Anna.Karlsson@Email.com',
      customerName: 'Anna Karlsson',
      destinationKey: 'Konversation',
      destinationLabel: 'Konversation',
      text: '  Kunden vill boka om nästa PRP-tid.  ',
      tags: [' Ombokning ', 'prp-serie', 'ombokning'],
      priority: 'Hög',
      visibility: 'Alla operatörer',
      templateKey: 'ombokning',
      actorUserId: 'owner-a',
    });

    assert.equal(created.destinationKey, 'konversation');
    assert.equal(created.customerId, 'anna.karlsson@email.com');
    assert.equal(created.priority, 'high');
    assert.equal(created.visibility, 'all_operators');
    assert.deepEqual(created.tags, ['ombokning', 'prp-serie']);

    const updated = await store.saveNote({
      tenantId: 'tenant-a',
      workspaceId: 'major-arcana-preview',
      conversationId: 'conv-1',
      customerId: 'anna.karlsson@email.com',
      customerName: 'Anna Karlsson',
      destinationKey: 'konversation',
      destinationLabel: 'Konversation',
      text: 'Uppdaterad anteckning',
      tags: ['uppföljning'],
      priority: 'Låg',
      visibility: 'Intern',
      templateKey: '',
      actorUserId: 'owner-a',
    });

    assert.equal(updated.noteId, created.noteId);
    assert.equal(updated.text, 'Uppdaterad anteckning');
    assert.equal(updated.priority, 'low');
    assert.equal(updated.visibility, 'internal');
    assert.deepEqual(updated.tags, ['uppföljning']);

    const notes = await store.getNotesByConversation({
      tenantId: 'tenant-a',
      workspaceId: 'major-arcana-preview',
      conversationId: 'conv-1',
      customerId: 'anna.karlsson@email.com',
    });

    assert.equal(notes.length, 1);
    assert.equal(notes[0].noteId, created.noteId);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
