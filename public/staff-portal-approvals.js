/**
 * staff-portal-approvals.js — Approval Center (WP-010, DEL B).
 *
 * Additiv Owner/ledning-yta: listar PENDING approvals (OWNER_APPROVAL /
 * RELEASE_APPROVAL) som aktören får besluta om. Varje kort visar vem/agent/
 * action/repo/filer/diffstat och ger [Godkänn]/[Avvisa]. Ingen blind "Approve all".
 *
 * UI är INTE auktoritativ — all verifiering sker server-side i staffApprovals.js.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.ArcanaStaffApprovals = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var APPROVALS_URL = '/api/v1/staff/approvals';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Pure: renderar ett approval-kort.
  function renderApprovalCardHtml(approval) {
    var a = approval || {};
    var rel = relativeTime(a.requestedAt);
    // Filnamnet fetstilt, sökvägen dämpad. En lista med tre fulla sökvägar i
    // löpande text går inte att skumma; det är filnamnet ögat söker.
    var fileItems = (Array.isArray(a.changedFiles) ? a.changedFiles : [])
      .map(function (f) {
        var s = String(f || '');
        var i = s.lastIndexOf('/');
        var dir = i >= 0 ? s.slice(0, i + 1) : '';
        var name = i >= 0 ? s.slice(i + 1) : s;
        return (
          '<span class="approval-file">' +
          (dir ? '<span class="approval-file-dir">' + esc(dir) + '</span>' : '') +
          '<span class="approval-file-name">' +
          esc(name) +
          '</span>' +
          '</span>'
        );
      })
      .join('');
    return (
      // Portalens KANONISKA radmönster: .item-card > .item-icon + .item-body
      // + .item-actions, med statusklassen i vänsterkanten. Kortet byggdes
      // först som ett eget .approval-card vid sidan av — samma sak, egen
      // dialekt. Ett väntande godkännande ÄR precis det .item-card.pending
      // redan betyder, och portalen har elva sådana listor.
      '<div class="item-card pending approval-card ' +
      alderKlass(a.requestedAt) +
      '" data-approval-id="' +
      esc(a.id) +
      '" data-agent="' +
      esc(a.agent || '') +
      '">' +
      '<div class="item-icon">' +
      esc(monogram(a.agent)) +
      '</div>' +
      '<div class="item-body">' +
      // Sammanfattningen ÄR ärendet. Den låg i datan men renderades inte —
      // kortet visade repo, SHA och filnamn men aldrig vad ändringen gör.
      // Den som ska godkänna läste maskinens metadata i stället för saken.
      '<div class="item-title">' +
      esc(a.summary || a.action || 'Ändring utan sammanfattning') +
      '</div>' +
      '<div class="item-meta">' +
      esc(a.agent) +
      (a.actor ? ' · begärd av ' + esc(a.actor) : '') +
      (rel ? ' · ' + esc(rel) : '') +
      '</div>' +
      '<div class="approval-tags avstand-over">' +
      '<span class="pill">' +
      esc(a.action) +
      '</span>' +
      (a.actionLevel ? '<span class="pill amber">' + esc(a.actionLevel) + '</span>' : '') +
      // Godkännandeklassen tappades bort när kortet byggdes om till
      // .item-card — den satt förut som en egen etikett uppe till höger och
      // följde inte med i flytten. WP-010:s eget test fångade det. Klassen
      // avgör VEM som får godkänna, så den får inte tyst försvinna.
      (a.approvalClass ? '<span class="pill">' + esc(a.approvalClass) + '</span>' : '') +
      (a.testsBuildStatus ? '<span class="pill sage">' + esc(a.testsBuildStatus) + '</span>' : '') +
      '</div>' +
      // Teknisk härkomst — repo, SHA, filer, diffstat. Det är sant och
      // ibland nödvändigt, men det är inte det man beslutar på, så det
      // ligger hopfällt precis som portalens övriga telemetri (ORD-231).
      // Tekniken var en hög med råa strängar: "major-arcana @ e6a28b98",
      // tre sökvägar och "3 filer · +12 −9". Allt sant, inget förklarat —
      // man såg VÄRDENA men inte vad de var värden PÅ.
      //
      // Raderna har nu ledtexter. Sökvägarna står kvar oöversatta med
      // flit: att döpa om bookingReminderEmail.js till "Påminnelse före
      // besök" vore att gissa vad filen gör utifrån sitt namn, och den
      // sortens gissning är precis vad som gör ett gränssnitt opålitligt.
      // En riktig översättning kräver en beslutad ordlista, inte en regel
      // i en renderare.
      '<details class="approval-teknik avstand-over">' +
      '<summary>Teknisk information</summary>' +
      '<dl class="approval-fakta">' +
      '<dt>Kodbas</dt><dd>' +
      esc(a.repoId || 'okänd') +
      '</dd>' +
      '<dt>Utgår från version</dt><dd>' +
      esc(a.baseSha ? a.baseSha.slice(0, 8) : 'okänd') +
      '</dd>' +
      (a.diffstat ? '<dt>Omfattning</dt><dd>' + esc(a.diffstat) + '</dd>' : '') +
      '<dt>Berörda filer</dt>' +
      '<dd>' +
      (fileItems || '<span class="approval-file">Inga filer angivna</span>') +
      '</dd>' +
      '</dl>' +
      '</details>' +
      '</div>' +
      '<div class="item-actions">' +
      // Statuspillret bredvid knapparna, som i portalens övriga item-cards.
      // Utan det syns bara VAD man kan göra, aldrig var ärendet står.
      '<span class="pill ' +
      alderPill(a.requestedAt).ton +
      '">' +
      esc(alderPill(a.requestedAt).text) +
      '</span>' +
      '<button class="btn primary approval-approve" type="button">Godkänn</button>' +
      '<button class="btn approval-reject" type="button">Avvisa</button>' +
      '</div>' +
      '</div>'
    );
  }

  /**
   * Tiden som synlig axel (ORD-235 §1). Portalen har fyra åldersklasser som
   * styr kortets skuggfärg och värme — ett försenat ärende glöder rött, ett
   * färskt är neutralt. Godkännandekorten bar requestedAt men fick ingen
   * klass, så ett ärende som legat en vecka såg ut precis som ett från nyss.
   *
   * TRÖSKLARNA ÄR BUNDNA TILL TTL:n, inte valda på känsla. Första försöket
   * satte "väntat" vid 24 h och "försenad" vid 72 h — rimliga tal för en
   * inkorg, men fel för just den här listan. approvalRequestStore har en
   * TTL på 24 timmar (WP-011): ett PENDING-ärende äldre än så räknas som
   * expired och renderas aldrig. Båda mina lägen låg alltså utanför det
   * fönster som över huvud taget kan visas — jag såg det först när jag
   * backdaterade två ärenden och listan blev tom i stället för röd.
   *
   * Skalan ligger nu inuti dygnet, och det gör dessutom rödmarkeringen
   * sannare: den betyder "hinner förfalla", inte "har legat länge".
   *
   *   < 2 h    färskt
   *   2–8 h    i dag
   *   8–16 h   väntat
   *   ≥ 16 h   förfaller snart (8 h kvar av 24)
   *
   * KOPPLING: ändras ttlMs i src/security/approvalRequestStore.js måste
   * trösklarna här följa med. Frontend kan inte läsa serverns TTL.
   *
   * alder-forsenad räknas dessutom av sektionsrubriken, som då skriver
   * "Godkännanden 4 · 2 försenade" utan att något extra kopplas in.
   */
  var TTL_TIMMAR = 24; // speglar approvalRequestStore ttlMs
  function timmarSedan(iso) {
    var then = Date.parse(iso || '');
    if (!Number.isFinite(then)) return null;
    return (Date.now() - then) / 3600000;
  }

  function alderKlass(iso) {
    var h = timmarSedan(iso);
    if (h == null) return 'alder-fersk';
    if (h >= TTL_TIMMAR * 0.67) return 'alder-forsenad';
    if (h >= TTL_TIMMAR * 0.33) return 'alder-vantat';
    if (h >= 2) return 'alder-idag';
    return 'alder-fersk';
  }

  function alderPill(iso) {
    var h = timmarSedan(iso);
    if (h == null) return { ton: '', text: 'Väntar' };
    if (h >= TTL_TIMMAR * 0.67) {
      var kvar = Math.max(0, Math.round(TTL_TIMMAR - h));
      // Säg vad som faktiskt händer, inte att det "är sent". Ett ärende som
      // förfaller måste begäras om av agenten — det är konsekvensen personen
      // behöver känna till för att prioritera rätt.
      return { ton: 'danger', text: kvar > 0 ? 'Förfaller om ' + kvar + ' h' : 'Förfaller nu' };
    }
    if (h >= TTL_TIMMAR * 0.33) return { ton: 'amber', text: 'Väntar på svar' };
    return { ton: '', text: 'Väntar' };
  }

  // Agentens initialer. "CMO-agent" → "CMO". Ett monogram i agentens egen
  // kulör gör listan sökbar med ögat: man ser VEM som begär innan man läser.
  function monogram(agent) {
    var s = String(agent || '?').replace(/-agent$/i, '');
    return s.slice(0, 3).toUpperCase();
  }

  // Tiden som axel (ORD-235 §1) — "för 4 min sedan" säger mer om ett
  // väntande beslut än en ISO-tidsstämpel gör.
  function relativeTime(iso) {
    if (!iso) return '';
    var then = Date.parse(iso);
    if (!Number.isFinite(then)) return '';
    var min = Math.floor((Date.now() - then) / 60000);
    if (min < 1) return 'nyss';
    if (min < 60) return 'för ' + min + ' min sedan';
    var h = Math.floor(min / 60);
    if (h < 24) return 'för ' + h + ' h sedan';
    return 'för ' + Math.floor(h / 24) + ' d sedan';
  }

  function renderShellHtml(approvals) {
    var list = Array.isArray(approvals) ? approvals : [];
    if (!list.length) {
      // Portalens kanoniska tomläge: .live-note + texten måste börja med
      // "Inga/Inget/Ingen/Alla…" för att uppdateraSektioner ska känna igen
      // beskedet och sätta .tomt-tillstand (grön ✓-cirkel, ORD-235 §3).
      // Egen klass räckte inte — mekanismen letar efter live-note.
      return '<div class="live-note approvals-empty">Inga väntande godkännanden.</div>';
    }
    return list.map(renderApprovalCardHtml).join('');
  }

  function mount({ container, apiFetch, getToken, onChange } = {}) {
    if (!container || typeof apiFetch !== 'function' || typeof getToken !== 'function') return;

    function status(message, isError) {
      var el = container.querySelector('.approval-status');
      if (!el) return;
      el.textContent = message || '';
      el.className = 'approval-status' + (isError ? ' is-error' : '');
    }

    async function authFetch(url, opts = {}) {
      var headers = Object.assign({}, opts.headers || {});
      var token = getToken();
      if (token) headers.Authorization = 'Bearer ' + token;
      if (opts.body) headers['Content-Type'] = 'application/json';
      return apiFetch(url, Object.assign({}, opts, { headers }));
    }

    async function load() {
      var res = await authFetch(APPROVALS_URL);
      if (!res || res.status !== 200) {
        status('Kunde inte hämta godkännanden.', true);
        return;
      }
      var body = await res.json().catch(function () {
        return {};
      });
      container.querySelector('.approval-list').innerHTML = renderShellHtml(body.approvals || []);
      wire();
      if (onChange) onChange({ count: (body.approvals || []).length });
    }

    function wire() {
      container.querySelectorAll('.approval-card').forEach(function (card) {
        var id = card.getAttribute('data-approval-id');
        card.querySelector('.approval-approve').addEventListener('click', function () {
          decide(id, 'approve');
        });
        card.querySelector('.approval-reject').addEventListener('click', function () {
          decide(id, 'reject');
        });
      });
    }

    async function decide(id, kind) {
      status('Sparar…');
      var res = await authFetch(APPROVALS_URL + '/' + encodeURIComponent(id) + '/' + kind, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Avvisad i Approval Center.' }),
      });
      if (!res || (res.status !== 200 && res.status !== 201)) {
        var body = await res?.json().catch(function () {
          return {};
        });
        status(body?.error || 'Kunde inte spara beslut.', true);
        return;
      }
      status(kind === 'approve' ? 'Godkänt och exekverat.' : 'Avvisat.');
      await load();
    }

    if (container.querySelector('.approval-list')) load();
  }

  return {
    renderApprovalCardHtml: renderApprovalCardHtml,
    renderShellHtml: renderShellHtml,
    mount: mount,
  };
});
