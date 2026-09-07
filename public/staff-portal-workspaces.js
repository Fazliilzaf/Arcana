/**
 * staff-portal-workspaces.js — "Mina arbetsytor" i Staffportalen (WP-002).
 *
 * Renderar ENDAST de business-agentarbetsytor som backend (entitlement-API)
 * uttryckligen grantat till den autentiserade användaren. Ingen hårdkodad
 * roll→agent-mappning här — agentåtkomsten kommer från entitlement-källan.
 *
 * - CM är INTE en portal (CFO intake) → finns aldrig i AGENT_WORKSPACES.
 * - CEO har ingen auth-bridge ännu → href=null, visas som "Kommer snart"
 *   (vi länkar ALDRIG till ett osäkert separat loginflöde).
 * - Navigation är UX, inte security — direkt URL-access kräver requireAgentEntitlement.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.ArcanaStaffWorkspaces = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var TOKEN_KEY = 'ARCANA_ADMIN_TOKEN';

  // Agent → workspace (v1). href=null => "Kommer snart" (disabled, ingen osäker länk).
  var AGENT_WORKSPACES = {
    CCO: { label: 'CCO — kommunikation & patientflöden', href: '/major-arcana-preview/' },
    CFO: { label: 'CFO — ekonomi', href: '/finance.html' },
    CMO: { label: 'CMO — marknad', href: '/admin.html' },
    CAO: { label: 'CAO — administration', href: '/admin.html' },
    COO: { label: 'COO — drift', href: '/admin.html' },
    CEO: { label: 'CEO — ledning', href: null },
  };

  var ORDER = ['CEO', 'CCO', 'CFO', 'CMO', 'CAO', 'COO'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /**
   * Pure: agents (array av godkända agent-ID) -> HTML-sträng. Testbar.
   * Okända agent-ID (och CM) renderas aldrig.
   */
  function renderWorkspacesHtml(agents) {
    var list = Array.isArray(agents) ? agents : [];
    var known = list.filter(function (a) {
      return Object.prototype.hasOwnProperty.call(AGENT_WORKSPACES, a);
    });
    if (!known.length) {
      // "Du har ännu inga…" började med Du och matchade inte portalens
      // TOMMONSTER (/^(inga |inget |ingen |alla |tomt|—|inte )/i), så
      // beskedet fick aldrig .tomt-tillstand. Formen på meningen är alltså
      // funktionell här, inte bara stilistisk.
      return '<div class="live-note workspaces-empty">Inga AI-arbetsytor är tilldelade ännu.</div>';
    }
    return ORDER.filter(function (a) {
      return known.indexOf(a) !== -1;
    })
      .map(function (a) {
        var ws = AGENT_WORKSPACES[a];
        if (!ws.href) {
          return (
            '<div class="workspace-card workspace-card--soon" data-agent="' +
            esc(a) +
            '">' +
            '<span class="workspace-label">' +
            esc(ws.label) +
            '</span>' +
            '<span class="workspace-soon">Kommer snart</span></div>'
          );
        }
        return (
          '<a class="workspace-card" data-agent="' +
          esc(a) +
          '" href="' +
          esc(ws.href) +
          '">' +
          '<span class="workspace-label">' +
          esc(ws.label) +
          '</span></a>'
        );
      })
      .join('');
  }

  function readToken() {
    // `root` var UMD-omslutningens parameter, inte fabrikens. Inuti den här
    // funktionen fanns namnet aldrig, så raden kastade ReferenceError vid
    // varje anrop — tyst uppäten av catch:en nedanför. Följden: token blev
    // alltid tom sträng, anropet till entitlement-API:t gick utan
    // x-auth-token, svarade 401, och panelen visade "Inga AI-arbetsytor"
    // oavsett vad ägaren faktiskt hade delat ut.
    //
    // Hittat av eslint (no-undef) när filen för första gången kom att
    // lintas — den och tre systerfiler låg i main utan att någon gång ha
    // passerat grinden, eftersom lint-staged bara lintar STAGED filer.
    try {
      var g = typeof window !== 'undefined' ? window : globalThis;
      if (g && g.localStorage) return g.localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      /* localStorage kan kasta i privat läge — tom token duger */
    }
    return '';
  }

  function loadWorkspaces(container) {
    if (!container) return;
    var token = readToken();
    var headers = {};
    if (token) headers['x-auth-token'] = token;
    fetch('/api/v1/staff/agent-entitlements/me', { headers: headers })
      .then(function (r) {
        if (!r.ok) {
          container.innerHTML = renderWorkspacesHtml([]);
          return null;
        }
        return r.json();
      })
      .then(function (body) {
        container.innerHTML = renderWorkspacesHtml(body && body.agents);
      })
      .catch(function () {
        container.innerHTML = renderWorkspacesHtml([]);
      });
  }

  return { AGENT_WORKSPACES, renderWorkspacesHtml, loadWorkspaces, readToken };
});
