const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createCcoSettingsStore } = require('../../src/ops/ccoSettingsStore');

test('cco settings store preserves mailFoundation when generic settings are updated later', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-settings-store-'));
  try {
    const store = await createCcoSettingsStore({
      filePath: path.join(tempDir, 'settings.json'),
    });

    await store.saveTenantSettings({
      tenantId: 'tenant-a',
      settings: {
        theme: 'mist',
        mailFoundation: {
          defaults: {
            senderMailboxId: 'support@hairtpclinic.com',
            signatureProfileId: 'mailbox-signature:support@hairtpclinic.com',
          },
          customMailboxes: [
            {
              id: 'support@hairtpclinic.com',
              email: 'support@hairtpclinic.com',
              label: 'Support',
              signature: {
                label: 'Support',
                fullName: 'Hair TP Support',
                title: 'Supportteam',
              },
            },
          ],
        },
      },
    });

    await store.saveTenantSettings({
      tenantId: 'tenant-a',
      settings: {
        theme: 'ink',
        density: 'airy',
      },
    });

    const settings = await store.getTenantSettings({ tenantId: 'tenant-a' });
    assert.equal(settings.theme, 'ink');
    assert.equal(settings.density, 'airy');
    assert.equal(
      settings.mailFoundation.defaults.senderMailboxId,
      'support@hairtpclinic.com'
    );
    assert.equal(
      settings.mailFoundation.defaults.signatureProfileId,
      'mailbox-signature:support@hairtpclinic.com'
    );
    assert.equal(settings.mailFoundation.customMailboxes.length, 1);
    assert.equal(
      settings.mailFoundation.customMailboxes[0].email,
      'support@hairtpclinic.com'
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
