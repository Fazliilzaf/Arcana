const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { pickReusableCycleId, loadReusableCycleId } = require('../../src/ops/releaseCycleSelection');

test('pickReusableCycleId prefers latest launched cycle for tenant', () => {
  const cycles = [
    {
      id: 'rel-old',
      tenantId: 'hair-tp-clinic',
      status: 'launched',
      launch: { launchedAt: '2026-02-20T10:00:00.000Z' },
      updatedAt: '2026-02-20T10:01:00.000Z',
    },
    {
      id: 'rel-new',
      tenantId: 'hair-tp-clinic',
      status: 'launched',
      launch: { launchedAt: '2026-02-25T10:00:00.000Z' },
      updatedAt: '2026-02-25T10:01:00.000Z',
    },
    {
      id: 'rel-other-tenant',
      tenantId: 'other',
      status: 'launched',
      launch: { launchedAt: '2026-02-26T10:00:00.000Z' },
      updatedAt: '2026-02-26T10:01:00.000Z',
    },
  ];

  assert.equal(pickReusableCycleId(cycles, 'hair-tp-clinic'), 'rel-new');
});

test('pickReusableCycleId falls back to latest launch_ready when launched is missing', () => {
  const cycles = [
    {
      id: 'rel-ready-old',
      tenantId: 'hair-tp-clinic',
      status: 'launch_ready',
      updatedAt: '2026-02-21T09:00:00.000Z',
    },
    {
      id: 'rel-ready-new',
      tenantId: 'hair-tp-clinic',
      status: 'launch_ready',
      updatedAt: '2026-02-23T09:00:00.000Z',
    },
  ];

  assert.equal(pickReusableCycleId(cycles, 'hair-tp-clinic'), 'rel-ready-new');
});

test('pickReusableCycleId returns empty string when no reusable cycle exists', () => {
  const cycles = [
    {
      id: 'rel-planning',
      tenantId: 'hair-tp-clinic',
      status: 'planning',
      updatedAt: '2026-02-21T09:00:00.000Z',
    },
    {
      id: 'rel-halted',
      tenantId: 'hair-tp-clinic',
      status: 'halted',
      updatedAt: '2026-02-23T09:00:00.000Z',
    },
  ];

  assert.equal(pickReusableCycleId(cycles, 'hair-tp-clinic'), '');
});

test('loadReusableCycleId supports object options', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cycle-select-'));
  const filePath = path.join(tempRoot, 'release-governance.json');
  await fs.writeFile(
    filePath,
    `${JSON.stringify(
      {
        cycles: [
          {
            id: 'rel-a',
            tenantId: 'hair-tp-clinic',
            status: 'launch_ready',
            updatedAt: '2026-02-21T10:00:00.000Z',
          },
          {
            id: 'rel-b',
            tenantId: 'hair-tp-clinic',
            status: 'launched',
            launch: { launchedAt: '2026-02-22T10:00:00.000Z' },
          },
        ],
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  const cycleId = await loadReusableCycleId({
    filePath,
    tenantId: 'hair-tp-clinic',
  });
  assert.equal(cycleId, 'rel-b');
});
