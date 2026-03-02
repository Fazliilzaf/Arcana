const test = require('node:test');
const assert = require('node:assert/strict');

const { evaluateCustomerTemperature } = require('../../src/intelligence/customerTemperatureEngine');

test('Customer temperature engine marks at_risk for complaint + breach + frustrated tone', () => {
  const result = evaluateCustomerTemperature({
    lifecycleStatus: 'returning',
    toneHistory: ['frustrated'],
    slaStatus: 'breach',
    complaintCount: 2,
    engagementScore: 0.71,
    recencyDays: 1,
  });

  assert.equal(result.temperature, 'at_risk');
  assert.equal(result.drivers.includes('sla_breach'), true);
  assert.equal(result.drivers.includes('complaint_pattern'), true);
});

test('Customer temperature engine marks stable for active but stable signals', () => {
  const result = evaluateCustomerTemperature({
    lifecycleStatus: 'active_dialogue',
    toneHistory: ['neutral'],
    slaStatus: 'safe',
    complaintCount: 0,
    engagementScore: 0.66,
    recencyDays: 2,
  });

  assert.equal(result.temperature, 'stable');
});

test('Customer temperature engine marks cool for low engagement dormant profile', () => {
  const result = evaluateCustomerTemperature({
    lifecycleStatus: 'dormant',
    toneHistory: ['neutral'],
    slaStatus: 'safe',
    complaintCount: 0,
    engagementScore: 0.1,
    recencyDays: 40,
  });

  assert.equal(result.temperature, 'cool');
});

test('Customer temperature engine applies relationship boost for loyal over new', () => {
  const loyal = evaluateCustomerTemperature({
    lifecycleStatus: 'loyal',
    toneHistory: ['neutral'],
    slaStatus: 'safe',
    complaintCount: 0,
    engagementScore: 0.4,
    recencyDays: 5,
  });
  const newcomer = evaluateCustomerTemperature({
    lifecycleStatus: 'new',
    toneHistory: ['neutral'],
    slaStatus: 'safe',
    complaintCount: 0,
    engagementScore: 0.4,
    recencyDays: 5,
  });

  assert.equal(loyal.score > newcomer.score, true);
  assert.equal(loyal.drivers.includes('relationship_boost'), true);
});

test('Customer temperature engine applies cooling for dormant compared to returning', () => {
  const dormant = evaluateCustomerTemperature({
    lifecycleStatus: 'dormant',
    toneHistory: ['neutral'],
    slaStatus: 'safe',
    complaintCount: 0,
    engagementScore: 0.5,
    recencyDays: 20,
  });
  const returning = evaluateCustomerTemperature({
    lifecycleStatus: 'returning',
    toneHistory: ['neutral'],
    slaStatus: 'safe',
    complaintCount: 0,
    engagementScore: 0.5,
    recencyDays: 20,
  });

  assert.equal(dormant.score < returning.score, true);
  assert.equal(dormant.drivers.includes('relationship_cooling'), true);
});
