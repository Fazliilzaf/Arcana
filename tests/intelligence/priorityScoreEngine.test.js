const test = require('node:test');
const assert = require('node:assert/strict');

const { computePriorityScore, mapPriorityLevel } = require('../../src/intelligence/priorityScoreEngine');

test('PriorityScore engine maps high weighted signal mix to Critical', () => {
  const result = computePriorityScore({
    hoursSinceInbound: 80,
    intent: 'complaint',
    tone: 'frustrated',
    customerContext: {
      openCommitments: true,
      repeatCustomer: true,
      estimatedRevenueBand: 'high',
    },
  });

  assert.equal(result.priorityScore, 100);
  assert.equal(result.priorityLevel, 'Critical');
  assert.equal(result.priorityReasons.includes('SLA_AGE:+40'), true);
  assert.equal(result.priorityReasons.includes('INTENT_COMPLAINT:+25'), true);
  assert.equal(result.priorityReasons.includes('TONE_FRUSTRATED:+20'), true);
  assert.equal(result.priorityReasons.includes('CUSTOMER_OPEN_COMMITMENTS:+15'), true);
});

test('PriorityScore engine yields Medium for mixed medium factors', () => {
  const result = computePriorityScore({
    hoursSinceInbound: 30,
    intent: 'follow_up',
    tone: 'anxious',
    customerContext: {
      repeatCustomer: true,
    },
  });

  assert.equal(result.priorityScore, 48);
  assert.equal(result.priorityLevel, 'Medium');
  assert.equal(result.priorityReasons.includes('INTENT_FOLLOW_UP:+8'), true);
  assert.equal(result.priorityReasons.includes('TONE_ANXIOUS:+15'), true);
  assert.equal(result.priorityReasons.includes('CUSTOMER_REPEAT:+5'), true);
});

test('PriorityScore engine yields Low for fresh low-risk pricing question', () => {
  const result = computePriorityScore({
    hoursSinceInbound: 8,
    intent: 'pricing_question',
    tone: 'neutral',
  });

  assert.equal(result.priorityScore, 15);
  assert.equal(result.priorityLevel, 'Low');
  assert.deepEqual(result.priorityReasons, ['SLA_AGE:+5', 'INTENT_PRICING_QUESTION:+10']);
});

test('PriorityScore engine handles missing or unknown factors with fail-safe behavior', () => {
  const result = computePriorityScore({
    hoursSinceInbound: 'not-a-number',
    intent: 'unknown_intent',
    tone: 'unknown_tone',
    customerContext: null,
  });

  assert.equal(result.priorityScore, 10);
  assert.equal(result.priorityLevel, 'Low');
  assert.equal(result.priorityReasons.includes('SLA_AGE:+5'), true);
  assert.equal(result.priorityReasons.includes('INTENT_UNCLEAR:+5'), true);
  assert.equal(mapPriorityLevel(result.priorityScore), 'Low');
});

test('PriorityScore engine adds explainable history weights for repeat multi-mailbox contact', () => {
  const result = computePriorityScore({
    hoursSinceInbound: 26,
    intent: 'booking_request',
    tone: 'neutral',
    historySignals: {
      pattern: 'reschedule',
      mailboxCount: 2,
      recentMessageCount: 5,
    },
  });

  assert.equal(result.priorityScore, 54);
  assert.equal(result.priorityReasons.includes('HISTORY_PATTERN_RESCHEDULE:+8'), true);
  assert.equal(result.priorityReasons.includes('HISTORY_MULTI_MAILBOX:+6'), true);
  assert.equal(result.priorityReasons.includes('HISTORY_RECENT_ACTIVITY:+5'), true);
});

test('PriorityScore engine adds explainable outcome weights for no-response history', () => {
  const result = computePriorityScore({
    hoursSinceInbound: 26,
    intent: 'follow_up',
    tone: 'neutral',
    historySignals: {
      outcomeCode: 'no_response',
    },
  });

  assert.equal(result.priorityReasons.includes('HISTORY_OUTCOME_NO_RESPONSE:+6'), true);
});

test('PriorityScore engine adds calibration weights for repeated negative outcomes', () => {
  const result = computePriorityScore({
    hoursSinceInbound: 26,
    intent: 'follow_up',
    tone: 'neutral',
    historySignals: {
      negativeOutcomeCount: 3,
      dominantFailureOutcome: 'no_response',
      dominantFailureRisk: 'relationship',
    },
  });

  assert.equal(result.priorityReasons.includes('HISTORY_CALIBRATION_REPEAT_NEGATIVE:+4'), true);
  assert.equal(result.priorityReasons.includes('HISTORY_CALIBRATION_NO_RESPONSE:+4'), true);
  assert.equal(result.priorityReasons.includes('HISTORY_CALIBRATION_RELATIONSHIP:+4'), true);
});
