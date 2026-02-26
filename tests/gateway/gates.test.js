const test = require('node:test');
const assert = require('node:assert/strict');

const { inputRiskGate } = require('../../src/gateway/gates/inputRiskGate');
const { outputRiskGate } = require('../../src/gateway/gates/outputRiskGate');
const { policyFloorGate } = require('../../src/gateway/gates/policyFloorGate');

test('inputRiskGate returns allow for low risk', () => {
  const gate = inputRiskGate({
    evaluation: {
      riskLevel: 1,
      riskScore: 9,
      decision: 'allow',
      reasonCodes: [],
    },
  });
  assert.equal(gate.decision, 'allow');
  assert.equal(gate.blocked, false);
});

test('outputRiskGate returns blocked for blocked evaluation', () => {
  const gate = outputRiskGate({
    evaluation: {
      riskLevel: 4,
      riskScore: 75,
      decision: 'blocked',
      reasonCodes: ['NO_GUARANTEE_POLICY'],
    },
  });
  assert.equal(gate.decision, 'blocked');
  assert.equal(gate.blocked, true);
});

test('policyFloorGate blocks when policy floor is blocked', () => {
  const gate = policyFloorGate({
    evaluation: {
      blocked: true,
      maxFloor: 4,
      hits: [{ id: 'NO_DIAGNOSIS_POLICY' }],
    },
  });
  assert.equal(gate.decision, 'blocked');
  assert.equal(gate.blocked, true);
  assert.deepEqual(gate.reasonCodes, ['NO_DIAGNOSIS_POLICY']);
});
