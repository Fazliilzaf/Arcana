const test = require('node:test');
const assert = require('node:assert/strict');

const { analyzeBusinessThreats } = require('../../src/intelligence/businessThreatAnalyzer');

test('Business threat analyzer detects complaint cluster and SLA capacity pressure', () => {
  const result = analyzeBusinessThreats({
    conversationWorklist: [
      { intent: 'complaint', tone: 'frustrated', slaStatus: 'breach' },
      { intent: 'complaint', tone: 'anxious', slaStatus: 'warning' },
      { intent: 'complaint', tone: 'frustrated', slaStatus: 'safe' },
      { intent: 'booking_request', tone: 'neutral', slaStatus: 'breach' },
      { intent: 'booking_request', tone: 'neutral', slaStatus: 'warning' },
    ],
    usageMetrics: {
      slaBreachTrendPercent: 22,
      conversionTrendPercent: -14,
      volatilityIndex: 0.62,
      systemRecommendationFollowRate: 0.44,
    },
    monthlyRisk: {
      riskIndex: 0.7,
    },
  });

  const codes = result.threats.map((item) => item.code);
  assert.equal(codes.includes('complaint_cluster'), true);
  assert.equal(codes.includes('sla_capacity_pressure'), true);
  assert.equal(result.threatCount >= 2, true);
});

