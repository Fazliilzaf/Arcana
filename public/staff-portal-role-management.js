/**
 * P0-004 B-4 — OWNER Role Management UI (Staff Portal).
 *
 * En självständig modul (som staff-portal-session.js) som ger OWNER en minimal
 * arbetsyta för att:
 *   - bjuda in staff med explicit kanonisk roll (KONSULT/PERSONAL/FINANCE/
 *     REVISOR; OPERATOR endast explicit för legacy-migration)
 *   - byta en befintlig staff-medlems roll
 *
 * UI är INTE auktoritativ: all auth sker i backend (OWNER-only + fail-closed).
 * Roll-/tilläggsdata hämtas från backend (/api/v1/staff/me, /api/v1/users/staff).
 * Ingen demo-roll-sanning.
 */
(function (root) {
  'use strict';

  const ROLE_LABELS = {
    OWNER: 'Ägare',
    KONSULT: 'Läkare / Konsult',
    PERSONAL: 'Personal / Sjuksköterska',
    FINANCE: 'Ekonomi',
    REVISOR: 'Revisor',
    OPERATOR: 'Legacy / Operatör',
  };

  // Roller en owner får välja vid invite/rollbyte. OPERATOR bara för explicit
  // legacy-migration — aldrig default.
  const ASSIGNABLE_ROLES = ['KONSULT', 'PERSONAL', 'FINANCE', 'REVISOR', 'OPERATOR'];

  function normalizeRoleChoice(value) {
    if (typeof value !== 'string') return '';
    const upper = value.trim().toUpperCase();
    return ASSIGNABLE_ROLES.includes(upper) ? upper : '';
  }

  /**
   * Bygger invite-payload. Saknad/ogiltig roll → null (UI-förhindrad + backend
   * fail-closed). Returnerar canonical role (uppercase) som backend kräver.
   */
  function buildInvitePayload({ email, password, role } = {}) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPassword = typeof password === 'string' ? password : '';
    const normalizedRole = normalizeRoleChoice(role);
    if (!normalizedEmail || !normalizedPassword || !normalizedRole) return null;
    return { email: normalizedEmail, password: normalizedPassword, role: normalizedRole };
  }

  function esc(value) {
    return String(value ?? '').replace(
      /[&<>"']/g,
      (ch) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[ch]
    );
  }

  function roleOptions(selected) {
    return ASSIGNABLE_ROLES.map((r) => {
      const sel = r === selected ? ' selected' : '';
      const legacyNote = r === 'OPERATOR' ? ' (legacy)' : '';
      return `<option value="${esc(r)}"${sel}>${esc(ROLE_LABELS[r] || r)}${legacyNote}</option>`;
    }).join('');
  }

  /**
   * Monterar rollhanteringen i `container`. `deps`:
   *   - apiFetch(url, opts) → Response-liknande (status + json())
   *   - getToken() → bearer-token
   *   - onChange()  → valfri, anropas när ägarläget ändras
   */
  function mount({ container, apiFetch, getToken, onChange, agentAccess } = {}) {
    if (!container || typeof apiFetch !== 'function' || typeof getToken !== 'function') return;

    // WP-008b — valfri integration mot staff-portal-agent-access.js. Ger OWNER
    // en agent-entitlement-panel per staff-rad (selection→load→grant/revoke).
    // Detta är entitlement-ADMINISTRATION, inte approval-center.
    const hasAgentAccess =
      agentAccess &&
      typeof agentAccess.renderAgentAccessHtml === 'function' &&
      typeof agentAccess.buildDiff === 'function';
    let _entitlements = []; // tenant-wide cache från /staff/agent-entitlements

    function status(message, isError) {
      if (!container.querySelector('.rm-status')) return;
      const el = container.querySelector('.rm-status');
      el.textContent = message || '';
      el.className = 'rm-status' + (isError ? ' is-error' : '');
    }

    async function authFetch(url, opts = {}) {
      const headers = Object.assign({}, opts.headers || {});
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      if (opts.body) headers['Content-Type'] = 'application/json';
      return apiFetch(url, Object.assign({}, opts, { headers }));
    }

    async function loadEntitlements() {
      if (!hasAgentAccess) return;
      const res = await authFetch('/api/v1/staff/agent-entitlements');
      if (!res || res.status !== 200) return;
      const body = await res.json().catch(() => ({}));
      _entitlements = Array.isArray(body?.entitlements) ? body.entitlements : [];
    }

    function activeAgentsFor(email) {
      const key = String(email || '')
        .trim()
        .toLowerCase();
      return _entitlements
        .filter(
          (e) =>
            String(e?.userId || '')
              .trim()
              .toLowerCase() === key && e?.status === 'active'
        )
        .map((e) => e.agent)
        .sort();
    }

    async function loadStaffList() {
      const res = await authFetch('/api/v1/users/staff');
      if (!res || res.status === 401 || res.status === 403) {
        // Sessionen kan ha ogiltigförklarats (rollbyte). Maskera inte det.
        status('Saknar behörighet — ladda om för att hämta aktuell session.', true);
        return;
      }
      if (hasAgentAccess) await loadEntitlements();
      const body = await res.json().catch(() => ({}));
      renderStaffList(Array.isArray(body) ? body : body?.members || body?.users || []);
    }

    function renderStaffList(members) {
      const list = container.querySelector('.rm-staff-list');
      if (!list) return;
      if (!members.length) {
        // .live-note ger portalens kanoniska tomläge. Texten börjar med
        // "Ingen" och matchar TOMMONSTER, så uppdateraSektioner sätter
        // .tomt-tillstand själv.
        list.innerHTML =
          '<p class="live-note rm-empty">Ingen personal är upplagd ännu. Bjud in första kollegan ovan.</p>';
        return;
      }
      list.innerHTML = members
        .map((m) => {
          const membership = m?.membership || m || {};
          const user = m?.user || m || {};
          // Entitlement-nyckel = auth user UUID (matchar context-tokenets user_id).
          const userId = membership.userId || user.id || '';
          const email = user.email || membership.email || '';
          const role = String(membership.role || '').toUpperCase();
          const id = membership.id || membership.membershipId || '';
          const accessHtml =
            hasAgentAccess && userId
              ? agentAccess.renderAgentAccessHtml(userId, activeAgentsFor(userId), email)
              : '';
          // Portalens kanoniska PERSONKORT är .doc-row: initialer, namn,
          // och rollen som ett pill längst ut (renderKollegaKort i
          // staff-portal.html). Tre element.
          //
          // Raden byggdes först som ett .item-card med sex alltid-öppna
          // kryssrutor och två fullbreda kontroller staplade under — runt
          // 500 px per person mot Kollegors 50, och rollen syntes inte alls
          // eftersom den låg inne i en <select>. Man såg vad man kunde GÖRA
          // med personen, aldrig vem hen var.
          //
          // Nu: identitet och nuvarande roll är kortet. Att ändra roll och
          // dela ut arbetsytor är handlingar man fäller ut när man vill dem.
          const initialer = String(email || '?')
            .replace(/@.*$/, '')
            .slice(0, 2)
            .toUpperCase();
          // ROLE_LABELS finns sedan tidigare i den här filen och används av
          // roleOptions. Jag skrev först ROLLETIKETT — ett nytt namn för en
          // karta som redan fanns tre rader bort.
          const rollEtikett = ROLE_LABELS[role] || role || 'Okänd roll';
          const aktiva = activeAgentsFor(userId);
          // De tilldelade arbetsytorna som piller på kortet. De låg gömda
          // bakom en utfällning — men det är just det som ÄR sant om en
          // person: vad hen har tillgång till. Samma grepp som
          // godkännandekortets COMMIT/WRITE-rad: en rad korta piller som
          // säger vad saken är innan man behöver klicka någonstans.
          const ytPiller = aktiva.length
            ? aktiva
                .map((a) => `<span class="pill rm-ytpill" data-agent="${esc(a)}">${esc(a)}</span>`)
                .join('')
            : '<span class="pill rm-ytpill rm-ytpill--tom">Inga arbetsytor</span>';
          return (
            `<div class="item-card rm-row" data-membership-id="${esc(id)}" data-roll="${esc(role)}">` +
            `<div class="item-icon rm-monogram">${esc(initialer)}</div>` +
            `<div class="item-body">` +
            `<div class="item-title rm-email">${esc(email)}</div>` +
            // Rollen stod först både som metarad och som pill — samma ord
            // två gånger med tre raders mellanrum. Metaraden bär i stället
            // det pillret inte kan säga: hur många av sex ytor som delats ut.
            `<div class="item-meta">${aktiva.length} av 6 AI-arbetsytor</div>` +
            `<div class="rm-piller avstand-over">${ytPiller}</div>` +
            `<details class="rm-andra avstand-over">` +
            `<summary>Ändra roll och arbetsytor</summary>` +
            `<div class="rm-styr">` +
            `<select class="rm-role-select">${roleOptions(role)}</select>` +
            `<button class="btn rm-save" type="button">Spara roll</button>` +
            `</div>` +
            accessHtml +
            `</details>` +
            `</div>` +
            `<div class="item-actions">` +
            `<span class="pill rm-rollpill">${esc(rollEtikett)}</span>` +
            `</div>` +
            `</div>`
          );
        })
        .join('');

      list.querySelectorAll('.rm-row').forEach((row) => {
        const membershipId = row.getAttribute('data-membership-id');
        row.querySelector('.rm-save').addEventListener('click', async () => {
          const role = normalizeRoleChoice(row.querySelector('.rm-role-select').value);
          if (!role) {
            status('Välj en roll.', true);
            return;
          }
          status('Sparar…');
          const res = await authFetch(`/api/v1/users/staff/${encodeURIComponent(membershipId)}`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
          });
          if (!res || res.status !== 200) {
            const body = await res?.json().catch(() => ({}));
            status(body?.error || 'Kunde inte spara roll.', true);
            return;
          }
          status('Roll uppdaterad.');
          await loadStaffList();
        });
      });

      // WP-008b/009 — agent-entitlement grant/revoke per staff-rad (OWNER).
      // Nyckeln (data-user) är auth user UUID, matchar tokenets user_id.
      list.querySelectorAll('.agent-access-panel').forEach((panel) => {
        const userId = panel.getAttribute('data-user');
        panel.querySelectorAll('.agent-access-check').forEach((box) => {
          box.addEventListener('change', async () => {
            const next = [];
            panel
              .querySelectorAll('.agent-access-check:checked')
              .forEach((c) => next.push(c.value));
            const diff = agentAccess.buildDiff(activeAgentsFor(userId), next);
            status('Sparar behörigheter…');
            let failed = false;
            for (const agent of diff.grant) {
              const r = await authFetch('/api/v1/staff/agent-entitlements/grant', {
                method: 'POST',
                body: JSON.stringify({ userId, agent }),
              });
              if (!r || (r.status !== 200 && r.status !== 201)) failed = true;
            }
            for (const agent of diff.revoke) {
              const r = await authFetch('/api/v1/staff/agent-entitlements/revoke', {
                method: 'POST',
                body: JSON.stringify({ userId, agent }),
              });
              if (!r || (r.status !== 200 && r.status !== 201)) failed = true;
            }
            if (failed) {
              status('Kunde inte spara behörighet.', true);
              await loadStaffList(); // återställ checkboxar till server-sanning
            } else {
              await loadEntitlements(); // håll _entitlements i synk med server
              status('Behörigheter sparade.');
            }
          });
        });
      });
    }

    async function init() {
      const me = await authFetch('/api/v1/staff/me');
      if (!me || me.status !== 200) {
        container.hidden = true;
        if (onChange) onChange({ role: null, isOwner: false });
        return;
      }
      const body = await me.json().catch(() => ({}));
      const role = String(body?.role || '').toLowerCase();
      const isOwner = role === 'owner';
      container.hidden = !isOwner;
      if (onChange) onChange({ role, isOwner });
      if (!isOwner) return;
      await loadStaffList();
    }

    // Formulär-wiring
    const form = container.querySelector('.rm-invite-form');
    if (form) {
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const email = form.querySelector('.rm-email-input')?.value || '';
        const password = form.querySelector('.rm-password-input')?.value || '';
        const role = form.querySelector('.rm-role-input')?.value || '';
        const payload = buildInvitePayload({ email, password, role });
        if (!payload) {
          status('E-post, lösenord och roll krävs.', true);
          return;
        }
        status('Bjuder in…');
        const res = await authFetch('/api/v1/users/staff', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (!res || (res.status !== 200 && res.status !== 201)) {
          const body = await res?.json().catch(() => ({}));
          status(body?.error || 'Kunde inte bjuda in.', true);
          return;
        }
        status('Inbjuden.');
        form.reset();
        await loadStaffList();
      });
    }

    init();
  }

  const api = { ROLE_LABELS, ASSIGNABLE_ROLES, normalizeRoleChoice, buildInvitePayload, mount };
  root.ArcanaStaffRoleManagement = api;
  // Undantaget som stod här behövs inte längre: public/staff-portal-*.js har
  // fått en egen regel i eslint.config.js med browser- och commonjs-globaler.
  // Ett kvarglömt eslint-disable är värre än inget — det döljer nästa fel.
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
