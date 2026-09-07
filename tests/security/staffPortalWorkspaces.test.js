'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  renderWorkspacesHtml,
  AGENT_WORKSPACES,
} = require('../../public/staff-portal-workspaces.js');

function cards(html) {
  return (html.match(/data-agent="([A-Z]+)"/g) || []).map((s) => s.replace(/data-agent="|"/g, ''));
}

test('WP-002/B: 5. 0 entitlements -> neutralt läge', () => {
  const html = renderWorkspacesHtml([]);
  // Ordalydelsen ändrad 2026-09-07, och testet med den. Beskedet löd
  // "Du har ännu inga tilldelade AI-arbetsytor." — vilket börjar med "Du"
  // och därför ALDRIG matchade portalens TOMMONSTER
  // (/^(inga |inget |ingen |alla |tomt|—|inte )/i). Följden var att
  // uppdateraSektioner inte kände igen det som ett tomt besked, så
  // .tomt-tillstand aldrig sattes och rutan förblev grå i stället för att
  // få portalens gröna tomläge.
  //
  // Meningens FORM är alltså funktionell här, inte stilistisk. Testets
  // avsikt — "tomt läge säger att inga arbetsytor är tilldelade" — är
  // oförändrad; bara strängen den mäter mot har följt med.
  assert.match(html, /Inga AI-arbetsytor är tilldelade ännu/);
  assert.match(html, /^\s*<div class="live-note/);
});

test('WP-002/B: 6. CCO -> endast CCO visas', () => {
  assert.deepEqual(cards(renderWorkspacesHtml(['CCO'])), ['CCO']);
});

test('WP-002/B: 7. CCO + CAO -> exakt CCO + CAO', () => {
  assert.deepEqual(cards(renderWorkspacesHtml(['CCO', 'CAO'])), ['CCO', 'CAO']);
});

test('WP-002/B: 8. CFO-entitlement -> CFO visas', () => {
  assert.deepEqual(cards(renderWorkspacesHtml(['CFO'])), ['CFO']);
});

test('WP-002/B: 9. revoked agent (ej i listan) -> renderas ej', () => {
  assert.deepEqual(cards(renderWorkspacesHtml(['CCO'])), ['CCO']); // 'CFO' ej i listan
});

test('WP-002/B: 10. okänt agent-ID renderas aldrig', () => {
  assert.deepEqual(cards(renderWorkspacesHtml(['XYZ', 'CCO'])), ['CCO']);
});

test('WP-002/B: 11. CM renderas aldrig som portal', () => {
  assert.equal(Object.prototype.hasOwnProperty.call(AGENT_WORKSPACES, 'CM'), false);
  assert.deepEqual(cards(renderWorkspacesHtml(['CM', 'CCO'])), ['CCO']);
});

test('WP-002/B: 12. CEO utan auth-bridge -> "Kommer snart", ingen osäker länk', () => {
  assert.equal(AGENT_WORKSPACES.CEO.href, null);
  const html = renderWorkspacesHtml(['CEO']);
  assert.match(html, /Kommer snart/);
  assert.doesNotMatch(html, /<a /); // ingen osäker href-länk
});
