const test = require('node:test');
const assert = require('node:assert/strict');

const { evaluateRiskStack } = require('../../src/intelligence/riskStackEngine');

test('riskStackEngine: SLA breach always forces miss-risk as dominant', () => {
  const result = evaluateRiskStack({
    slaStatus: 'breach',
    tone: 'positive',
    toneConfidence: 0.9,
    followUpSuggested: false,
    relationshipStatus: 'new',
  });

  assert.equal(result.dominantRisk, 'miss');
  assert.equal(result.weightedScore, 1);
  assert.equal(result.explanation.includes('SLA'), true);
});

test('riskStackEngine: tone-risk dominates when frustrated tone is strong', () => {
  const result = evaluateRiskStack({
    slaStatus: 'safe',
    tone: 'frustrated',
    toneConfidence: 0.95,
    followUpSuggested: false,
    relationshipStatus: 'new',
    isUnanswered: false,
  });

  assert.equal(result.dominantRisk, 'tone');
  assert.equal(result.weightedScore > 0.6, true);
});

test('riskStackEngine: follow-up risk dominates for stagnated follow-up case', () => {
  const result = evaluateRiskStack({
    slaStatus: 'safe',
    tone: 'neutral',
    followUpSuggested: true,
    stagnated: true,
    lifecycleState: 'FOLLOW_UP_PENDING',
    hoursSinceInbound: 72,
    relationshipStatus: 'new',
  });

  assert.equal(result.dominantRisk, 'follow_up');
  assert.equal(result.recommendedAction.toLowerCase().includes('uppfolj'), true);
});

test('riskStackEngine: relationship risk dominates for loyal anxious customer', () => {
  const result = evaluateRiskStack({
    slaStatus: 'safe',
    tone: 'anxious',
    toneConfidence: 0.3,
    followUpSuggested: false,
    relationshipStatus: 'loyal',
    interactionCount: 9,
    isUnanswered: false,
  });

  assert.equal(result.dominantRisk, 'relationship');
  assert.equal(result.explanation.toLowerCase().includes('relation'), true);
});

test('riskStackEngine: low combined signal resolves to neutral', () => {
  const result = evaluateRiskStack({
    slaStatus: 'safe',
    tone: 'positive',
    toneConfidence: 0.2,
    followUpSuggested: false,
    relationshipStatus: 'new',
    isUnanswered: false,
    hoursSinceInbound: 1,
  });

  assert.equal(result.dominantRisk, 'neutral');
  assert.equal(result.weightedScore < 0.2, true);
});
