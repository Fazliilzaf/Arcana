/**
 * SummarizeThread wiring — GET /api/v1/cco/runtime/conversation/:key/summary
 */
(() => {
  'use strict';

  function injectStyles() {
    if (document.getElementById('thread-ai-summary-styles')) return;
    const style = document.createElement('style');
    style.id = 'thread-ai-summary-styles';
    style.textContent = `
      .thread-ai-summary-panel {
        margin: 0;
        padding: 14px 16px;
        border-radius: var(--r-md, 14px);
        background: var(--press, linear-gradient(180deg, #fff, #f4eee8));
        border: 1px solid var(--panel-border, rgba(120, 105, 90, 0.16));
        box-shadow: var(--sh-sm, 0 1px 2px rgba(56, 40, 28, 0.06));
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .thread-ai-summary-head { display: flex; flex-direction: column; gap: 2px; }
      .thread-ai-summary-kicker {
        margin: 0;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--accent-studio, #bb4779);
      }
      .thread-ai-summary-title {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        line-height: 1.25;
        color: var(--ink, #1d1e24);
      }
      .thread-ai-summary-bullets,
      .thread-ai-summary-turns-list {
        margin: 0;
        padding-left: 18px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .thread-ai-summary-bullets li,
      .thread-ai-summary-turns-list li {
        font-size: 12px;
        line-height: 1.45;
        color: var(--body, #2a2b32);
      }
      .thread-ai-summary-turns-list strong {
        color: var(--ink, #1d1e24);
        font-weight: 700;
      }
      .thread-ai-summary-turns { display: flex; flex-direction: column; gap: 5px; }
      .thread-ai-summary-next,
      .thread-ai-summary-risk {
        margin: 0;
        font-size: 12px;
        line-height: 1.45;
        color: var(--body, #2a2b32);
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.6);
      }
      .thread-ai-summary-next strong,
      .thread-ai-summary-risk strong { color: var(--ink, #1d1e24); }
      .thread-ai-summary-risk { background: rgba(168, 56, 56, 0.06); }
    `;
    document.head.appendChild(style);
  }
  injectStyles();

  const SUMMARY_DEBOUNCE_MS = 450;
  const cache = new Map();
  const inflight = new Map();
  let debounceTimer = null;
  let lastRenderedKey = '';

  function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getAuthToken() {
    try {
      const local = normalizeText(window.localStorage.getItem('ARCANA_ADMIN_TOKEN'));
      if (local && local !== '__preview_local__') return local;
      const session = normalizeText(window.sessionStorage.getItem('ARCANA_ADMIN_TOKEN'));
      if (session && session !== '__preview_local__') return session;
    } catch {
      /* ignore */
    }
    return '';
  }

  function isSmartReplyEnabled() {
    const toggle = document.querySelector('[data-settings-toggle="smart_reply"]');
    if (toggle && !toggle.checked) return false;
    return true;
  }

  function buildHeuristicPreset(thread) {
    if (!thread) {
      return {
        templateKey: null,
        text: 'Välj en aktiv tråd i arbetskön innan du använder AI-läget.',
        tags: ['AI', 'Väntar på aktiv tråd'],
      };
    }
    return {
      templateKey: null,
      text: `AI-sammanfattning:\n- Kund: ${thread.customerName}\n- Nu i: ${thread.statusLabel}\n- Nästa steg: ${thread.nextActionLabel}\n- Fokus: ${thread.whyInFocus || 'Ingen fokusmotivering.'}`,
      tags: ['AI', 'Sammanfattning', thread.intentLabel || 'Signal'],
    };
  }

  function formatSummaryNoteText(summary, thread, fallbackText) {
    if (!summary) return fallbackText;
    const headline = normalizeText(summary.headline);
    const bullets = Array.isArray(summary.bullets) ? summary.bullets.filter(Boolean) : [];
    const nextStep = normalizeText(summary.nextStep);
    const risk = normalizeText(summary.risk);
    const lines = [];
    if (headline) lines.push(headline);
    bullets.forEach((bullet) => lines.push(`- ${bullet}`));
    if (nextStep) lines.push(`Nästa steg: ${nextStep}`);
    if (risk) lines.push(`Risk: ${risk}`);
    if (!lines.length) return fallbackText;
    return `AI-sammanfattning (${thread?.customerName || 'tråd'}):\n${lines.join('\n')}`;
  }

  async function apiRequest(path) {
    const token = getAuthToken();
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(path, { headers, credentials: 'same-origin' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `HTTP ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }
    return payload;
  }

  async function fetchSummary(conversationKey, { force = false } = {}) {
    const key = normalizeText(conversationKey);
    if (!key) return null;
    if (!force && cache.has(key)) return cache.get(key);
    if (inflight.has(key)) return inflight.get(key);
    const promise = apiRequest(
      `/api/v1/cco/runtime/conversation/${encodeURIComponent(key)}/summary`
    )
      .then((payload) => {
        const summary = payload?.summary || null;
        cache.set(key, summary);
        return summary;
      })
      .catch(() => null)
      .finally(() => {
        inflight.delete(key);
      });
    inflight.set(key, promise);
    return promise;
  }

  function scheduleFetch(conversationKey) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void fetchSummary(conversationKey).then((summary) => {
        if (normalizeText(lastRenderedKey) !== normalizeText(conversationKey)) return;
        renderSummaryPanel(conversationKey, summary);
        document.dispatchEvent(
          new CustomEvent('arcana-thread-summary-ready', {
            detail: { conversationKey, summary },
          })
        );
      });
    }, SUMMARY_DEBOUNCE_MS);
  }

  function ensureSummaryHost() {
    let host = document.querySelector('[data-thread-ai-summary-host]');
    if (host) return host;
    const workrail = document.querySelector('.focus-workrail');
    if (!workrail) return null;
    host = document.createElement('div');
    host.className = 'thread-ai-summary-host';
    host.setAttribute('data-thread-ai-summary-host', '');
    const nextHost = workrail.querySelector('[data-conversation-next-host]');
    if (nextHost?.parentElement) {
      nextHost.parentElement.insertBefore(host, nextHost.nextSibling);
    } else {
      workrail.prepend(host);
    }
    return host;
  }

  function renderSummaryPanel(conversationKey, summary) {
    const host = ensureSummaryHost();
    if (!host) return;
    if (!conversationKey) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }
    if (!summary) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }
    const headline = normalizeText(summary.headline) || 'AI-sammanfattning';
    const bullets = Array.isArray(summary.bullets) ? summary.bullets.filter(Boolean).slice(0, 5) : [];
    const turns = Array.isArray(summary.turns)
      ? summary.turns.filter((t) => t && normalizeText(t.said)).slice(0, 12)
      : [];
    const nextStep = normalizeText(summary.nextStep);
    const risk = normalizeText(summary.risk);
    host.hidden = false;
    host.innerHTML = `
      <section class="thread-ai-summary-panel" data-thread-ai-summary-panel aria-label="AI-trådsammanfattning">
        <header class="thread-ai-summary-head">
          <p class="thread-ai-summary-kicker">AI · tråd</p>
          <h4 class="thread-ai-summary-title">${escapeHtml(headline)}</h4>
        </header>
        ${
          bullets.length
            ? `<ul class="thread-ai-summary-bullets">${bullets
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join('')}</ul>`
            : ''
        }
        ${
          turns.length
            ? `<div class="thread-ai-summary-turns">
                <p class="thread-ai-summary-kicker">Vem sa vad</p>
                <ol class="thread-ai-summary-turns-list">${turns
                  .map(
                    (t) =>
                      `<li><strong>${escapeHtml(normalizeText(t.who) || '?')}</strong> — ${escapeHtml(
                        t.said
                      )}</li>`
                  )
                  .join('')}</ol>
              </div>`
            : ''
        }
        ${nextStep ? `<p class="thread-ai-summary-next"><strong>Nästa:</strong> ${escapeHtml(nextStep)}</p>` : ''}
        ${risk ? `<p class="thread-ai-summary-risk"><strong>Risk:</strong> ${escapeHtml(risk)}</p>` : ''}
      </section>`;
  }

  function buildNotePreset(thread, fallbackPreset) {
    const fallback = fallbackPreset || buildHeuristicPreset(thread);
    if (!thread || !isSmartReplyEnabled()) return fallback;
    const key = normalizeText(thread.id || thread.conversationKey);
    const cached = cache.get(key);
    if (cached) {
      return {
        templateKey: null,
        text: formatSummaryNoteText(cached, thread, fallback.text),
        tags: fallback.tags,
      };
    }
    scheduleFetch(key);
    return fallback;
  }

  function onThreadRendered(thread) {
    if (!thread || !isSmartReplyEnabled()) {
      lastRenderedKey = '';
      renderSummaryPanel('', null);
      return;
    }
    const key = normalizeText(thread.id || thread.conversationKey);
    lastRenderedKey = key;
    const cached = cache.get(key);
    if (cached) {
      renderSummaryPanel(key, cached);
      return;
    }
    renderSummaryPanel(key, null);
    scheduleFetch(key);
  }

  document.addEventListener('arcana-thread-summary-ready', (event) => {
    const detail = event.detail || {};
    const noteMode = document.querySelector('[data-note-mode-option="ai-summary"]');
    if (!noteMode?.classList.contains('is-active')) return;
    const noteText = document.getElementById('note-text');
    if (!noteText || !detail.summary) return;
    const thread = { customerName: document.querySelector('[data-intel-customer] h4')?.textContent };
    noteText.value = formatSummaryNoteText(detail.summary, thread, noteText.value);
  });

  window.ArcanaThreadAiSummary = Object.freeze({
    fetchSummary,
    buildNotePreset,
    onThreadRendered,
    buildHeuristicPreset,
    formatSummaryNoteText,
    clearCache: () => cache.clear(),
  });
})();
