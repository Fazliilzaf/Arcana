/**
 * Major Arcana Preview — i18n Runtime (I1+I2+I3).
 *
 * Stödjer 4 språk: sv (default), en, de, dk.
 *
 * API:
 *   t('common.save', { fallback: 'Spara' })
 *   formatDate(iso, { style: 'short' })
 *   formatRelativeTime(iso)
 *   formatNumber(value)
 *   formatCurrency(value, { currency: 'SEK' })
 *   setLocale('en')
 *   getLocale()
 *
 * Auto-detect: navigator.language → sv om okänd.
 * Override via localStorage 'cco.locale' eller window.__CCO_LOCALE__.
 */
(() => {
  'use strict';

  const SUPPORTED = Object.freeze(['sv', 'en', 'de', 'dk']);
  const DEFAULT_LOCALE = 'sv';
  const STORAGE_KEY = 'cco.locale';

  const TRANSLATIONS = {
    sv: {
      'common.save': 'Spara',
      'common.cancel': 'Avbryt',
      'common.close': 'Stäng',
      'common.confirm': 'Bekräfta',
      'common.delete': 'Radera',
      'common.edit': 'Redigera',
      'common.loading': 'Laddar…',
      'common.error': 'Fel',
      'common.success': 'Klart',
      'common.search': 'Sök',
      'common.next': 'Nästa',
      'common.back': 'Tillbaka',
      'common.yes': 'Ja',
      'common.no': 'Nej',
      'common.help': 'Hjälp',
      'common.settings': 'Inställningar',

      'cmdk.placeholder': 'Hoppa till lane, vy, action eller inställning…',
      'cmdk.empty': 'Inga matchningar',
      'cmdk.hint': 'esc stänger',
      'cmdk.group.navigation': 'Navigering',
      'cmdk.group.lanes': 'Lanes',
      'cmdk.group.actions': 'Snabbåtgärder',
      'cmdk.group.search': 'Sökning',
      'cmdk.group.savedViews': 'Sparade vyer',
      'cmdk.group.help': 'Hjälp',
      'cmdk.group.ai': 'AI',
      'cmdk.group.focus': 'Fokus',

      'queue.lane.all': 'Alla',
      'queue.lane.actNow': 'Agera nu',
      'queue.lane.sprint': 'Sprint',
      'queue.lane.later': 'Senare',
      'queue.lane.admin': 'Admin',
      'queue.lane.review': 'Granska',
      'queue.lane.unclear': 'Oklart',
      'queue.lane.bookable': 'Bokning',
      'queue.lane.medical': 'Medicinsk',

      'followup.label': 'Uppföljn.',
      'followup.all': 'Alla',
      'followup.overdue': 'Försenade',
      'followup.today': 'Idag',
      'followup.tomorrow': 'Imorgon',
      'followup.waiting': 'Väntar svar',

      'thread.summary.title': 'Sammanfattning',
      'thread.summary.button': 'Sammanfatta',
      'thread.summary.source.heuristic': 'Heuristisk',
      'thread.summary.source.openai': 'AI · OpenAI',
      'thread.summary.verified': 'Verifierad',
      'thread.summary.unverified': 'Ej verifierad',
      'thread.summary.sinceLast': 'Sedan senast',
      'thread.summary.nbaLabel': 'Föreslagen åtgärd',

      'sentiment.positive': 'Positiv',
      'sentiment.neutral': 'Neutral',
      'sentiment.negative': 'Negativ',
      'sentiment.anxious': 'Orolig',
      'sentiment.urgent': 'Akut',

      'session.lockTitle': 'Sessionen är låst',
      'session.unlockBtn': 'Lås upp',
      'session.timeoutMsg': 'Sessionen har överskridit max-tiden.',

      'softBreak.title': 'Hantera avbrott',
      'softBreak.pause': 'Pausa fokus',
      'softBreak.replace': 'Byt ut fokus-tråd',
      'softBreak.end': 'Avsluta fokus',

      'pwa.install': 'Installera CCO',
      'pwa.update': 'Ny version tillgänglig — ladda om för att uppdatera.',
      'pwa.offline': 'Offline-läge: åtgärder köas och synkas när du är online.',

      'wizard.title.brand': 'Brand & namn',
      'wizard.title.mailbox': 'Mailbox-koppling',
      'wizard.title.identity': 'Writing-identity',
      'wizard.title.review': 'Granska och slutför',
      'wizard.create': 'Skapa tenant',

      'feedback.registered': 'Feedback registrerad — bidrar till bättre utkast.',

      'help.faq.title': 'Vanliga frågor',
      'help.shortcuts.title': 'Snabbgenvägar',
      'help.contact.title': 'Behöver du mer hjälp?',

      // Nav + huvud-UI (I5)
      'nav.conversations': 'Konversationer',
      'nav.customers': 'Kunder',
      'nav.automation': 'Automatisering',
      'nav.analytics': 'Analys',
      'nav.more': 'Mer',
      'nav.newMail': 'Nytt mejl',
      'nav.sprint': 'Sprint',
      'header.title': 'CCO',
      'header.refresh': 'Uppdatera',
      'header.signOut': 'Logga ut',
      'header.changeClinic': 'Byt klinik',
      'header.languagePicker': 'Språk',

      // Empty states
      'empty.inbox.title': 'Allt klart!',
      'empty.inbox.message': 'Inga öppna trådar i kön just nu.',
      'empty.search.title': 'Inga träffar',
      'empty.search.message': 'Försök med en annan sökterm.',
      'empty.firstRun.title': 'Välkommen!',
      'empty.firstRun.message': 'Inga mail har lästs in ännu. Synkroniseringen är på gång.',

      // Toast titlar
      'toast.success.saved': 'Sparat',
      'toast.error.failed': 'Något gick fel',
      'toast.info.processing': 'Bearbetar…',
      'toast.warning.attention': 'Obs',
    },

    en: {
      'common.save': 'Save', 'common.cancel': 'Cancel', 'common.close': 'Close',
      'common.confirm': 'Confirm', 'common.delete': 'Delete', 'common.edit': 'Edit',
      'common.loading': 'Loading…', 'common.error': 'Error', 'common.success': 'Done',
      'common.search': 'Search', 'common.next': 'Next', 'common.back': 'Back',
      'common.yes': 'Yes', 'common.no': 'No', 'common.help': 'Help', 'common.settings': 'Settings',
      'cmdk.placeholder': 'Jump to lane, view, action or setting…',
      'cmdk.empty': 'No matches', 'cmdk.hint': 'esc closes',
      'cmdk.group.navigation': 'Navigation', 'cmdk.group.lanes': 'Lanes',
      'cmdk.group.actions': 'Quick actions', 'cmdk.group.search': 'Search',
      'cmdk.group.savedViews': 'Saved views', 'cmdk.group.help': 'Help',
      'cmdk.group.ai': 'AI', 'cmdk.group.focus': 'Focus',
      'queue.lane.all': 'All', 'queue.lane.actNow': 'Act now', 'queue.lane.sprint': 'Sprint',
      'queue.lane.later': 'Later', 'queue.lane.admin': 'Admin', 'queue.lane.review': 'Review',
      'queue.lane.unclear': 'Unclear', 'queue.lane.bookable': 'Booking', 'queue.lane.medical': 'Medical',
      'followup.label': 'Follow-up', 'followup.all': 'All', 'followup.overdue': 'Overdue',
      'followup.today': 'Today', 'followup.tomorrow': 'Tomorrow', 'followup.waiting': 'Waiting reply',
      'thread.summary.title': 'Summary', 'thread.summary.button': 'Summarize',
      'thread.summary.source.heuristic': 'Heuristic', 'thread.summary.source.openai': 'AI · OpenAI',
      'thread.summary.verified': 'Verified', 'thread.summary.unverified': 'Unverified',
      'thread.summary.sinceLast': 'Since last visit', 'thread.summary.nbaLabel': 'Suggested action',
      'sentiment.positive': 'Positive', 'sentiment.neutral': 'Neutral', 'sentiment.negative': 'Negative',
      'sentiment.anxious': 'Anxious', 'sentiment.urgent': 'Urgent',
      'session.lockTitle': 'Session locked', 'session.unlockBtn': 'Unlock',
      'session.timeoutMsg': 'Session has exceeded the maximum time.',
      'softBreak.title': 'Handle interruption', 'softBreak.pause': 'Pause focus',
      'softBreak.replace': 'Replace focus thread', 'softBreak.end': 'End focus',
      'pwa.install': 'Install CCO',
      'pwa.update': 'New version available — reload to update.',
      'pwa.offline': 'Offline mode: actions queued and synced when back online.',
      'wizard.title.brand': 'Brand & name', 'wizard.title.mailbox': 'Mailbox connection',
      'wizard.title.identity': 'Writing identity', 'wizard.title.review': 'Review and finish',
      'wizard.create': 'Create tenant',
      'feedback.registered': 'Feedback recorded — improves future drafts.',
      'help.faq.title': 'FAQ', 'help.shortcuts.title': 'Shortcuts',
      'help.contact.title': 'Need more help?',
      'nav.conversations': 'Conversations', 'nav.customers': 'Customers',
      'nav.automation': 'Automation', 'nav.analytics': 'Analytics', 'nav.more': 'More',
      'nav.newMail': 'New mail', 'nav.sprint': 'Sprint',
      'header.title': 'CCO', 'header.refresh': 'Refresh', 'header.signOut': 'Sign out',
      'header.changeClinic': 'Switch clinic', 'header.languagePicker': 'Language',
      'empty.inbox.title': 'All clear!', 'empty.inbox.message': 'No open threads in the queue.',
      'empty.search.title': 'No results', 'empty.search.message': 'Try a different search term.',
      'empty.firstRun.title': 'Welcome!', 'empty.firstRun.message': 'No mail loaded yet. Sync in progress.',
      'toast.success.saved': 'Saved', 'toast.error.failed': 'Something went wrong',
      'toast.info.processing': 'Processing…', 'toast.warning.attention': 'Heads up',
    },

    de: {
      'common.save': 'Speichern', 'common.cancel': 'Abbrechen', 'common.close': 'Schließen',
      'common.confirm': 'Bestätigen', 'common.delete': 'Löschen', 'common.edit': 'Bearbeiten',
      'common.loading': 'Lädt…', 'common.error': 'Fehler', 'common.success': 'Fertig',
      'common.search': 'Suchen', 'common.next': 'Weiter', 'common.back': 'Zurück',
      'common.yes': 'Ja', 'common.no': 'Nein', 'common.help': 'Hilfe', 'common.settings': 'Einstellungen',
      'cmdk.placeholder': 'Springe zu Lane, Ansicht, Aktion oder Einstellung…',
      'cmdk.empty': 'Keine Treffer', 'cmdk.hint': 'esc schließt',
      'cmdk.group.navigation': 'Navigation', 'cmdk.group.lanes': 'Lanes',
      'cmdk.group.actions': 'Schnellaktionen', 'cmdk.group.search': 'Suche',
      'cmdk.group.savedViews': 'Gespeicherte Ansichten', 'cmdk.group.help': 'Hilfe',
      'cmdk.group.ai': 'KI', 'cmdk.group.focus': 'Fokus',
      'queue.lane.all': 'Alle', 'queue.lane.actNow': 'Jetzt handeln', 'queue.lane.sprint': 'Sprint',
      'queue.lane.later': 'Später', 'queue.lane.admin': 'Admin', 'queue.lane.review': 'Prüfen',
      'queue.lane.unclear': 'Unklar', 'queue.lane.bookable': 'Buchung', 'queue.lane.medical': 'Medizinisch',
      'followup.label': 'Follow-up', 'followup.all': 'Alle', 'followup.overdue': 'Überfällig',
      'followup.today': 'Heute', 'followup.tomorrow': 'Morgen', 'followup.waiting': 'Wartet auf Antwort',
      'thread.summary.title': 'Zusammenfassung', 'thread.summary.button': 'Zusammenfassen',
      'thread.summary.source.heuristic': 'Heuristisch', 'thread.summary.source.openai': 'KI · OpenAI',
      'thread.summary.verified': 'Verifiziert', 'thread.summary.unverified': 'Nicht verifiziert',
      'thread.summary.sinceLast': 'Seit letztem Besuch', 'thread.summary.nbaLabel': 'Vorgeschlagene Aktion',
      'sentiment.positive': 'Positiv', 'sentiment.neutral': 'Neutral', 'sentiment.negative': 'Negativ',
      'sentiment.anxious': 'Besorgt', 'sentiment.urgent': 'Dringend',
      'session.lockTitle': 'Sitzung gesperrt', 'session.unlockBtn': 'Entsperren',
      'session.timeoutMsg': 'Sitzung hat das Zeitlimit überschritten.',
      'softBreak.title': 'Unterbrechung handhaben', 'softBreak.pause': 'Fokus pausieren',
      'softBreak.replace': 'Fokus-Thread ersetzen', 'softBreak.end': 'Fokus beenden',
      'pwa.install': 'CCO installieren',
      'pwa.update': 'Neue Version verfügbar — bitte neu laden.',
      'pwa.offline': 'Offline-Modus: Aktionen werden synchronisiert wenn online.',
      'wizard.title.brand': 'Marke & Name', 'wizard.title.mailbox': 'Mailbox-Verbindung',
      'wizard.title.identity': 'Schreib-Identität', 'wizard.title.review': 'Prüfen & abschließen',
      'wizard.create': 'Tenant erstellen',
      'feedback.registered': 'Feedback gespeichert — verbessert zukünftige Entwürfe.',
      'help.faq.title': 'Häufige Fragen', 'help.shortcuts.title': 'Tastenkürzel',
      'help.contact.title': 'Brauchst du mehr Hilfe?',
      'nav.conversations': 'Konversationen', 'nav.customers': 'Kunden',
      'nav.automation': 'Automatisierung', 'nav.analytics': 'Analyse', 'nav.more': 'Mehr',
      'nav.newMail': 'Neue Mail', 'nav.sprint': 'Sprint',
      'header.title': 'CCO', 'header.refresh': 'Aktualisieren', 'header.signOut': 'Abmelden',
      'header.changeClinic': 'Klinik wechseln', 'header.languagePicker': 'Sprache',
      'empty.inbox.title': 'Alles erledigt!', 'empty.inbox.message': 'Keine offenen Threads in der Warteschlange.',
      'empty.search.title': 'Keine Treffer', 'empty.search.message': 'Versuche einen anderen Suchbegriff.',
      'empty.firstRun.title': 'Willkommen!', 'empty.firstRun.message': 'Noch keine Mails geladen. Synchronisierung läuft.',
      'toast.success.saved': 'Gespeichert', 'toast.error.failed': 'Etwas ist schiefgelaufen',
      'toast.info.processing': 'Verarbeite…', 'toast.warning.attention': 'Achtung',
    },

    dk: {
      'common.save': 'Gem', 'common.cancel': 'Annullér', 'common.close': 'Luk',
      'common.confirm': 'Bekræft', 'common.delete': 'Slet', 'common.edit': 'Rediger',
      'common.loading': 'Indlæser…', 'common.error': 'Fejl', 'common.success': 'Færdig',
      'common.search': 'Søg', 'common.next': 'Næste', 'common.back': 'Tilbage',
      'common.yes': 'Ja', 'common.no': 'Nej', 'common.help': 'Hjælp', 'common.settings': 'Indstillinger',
      'cmdk.placeholder': 'Hop til lane, visning, handling eller indstilling…',
      'cmdk.empty': 'Ingen resultater', 'cmdk.hint': 'esc lukker',
      'cmdk.group.navigation': 'Navigation', 'cmdk.group.lanes': 'Lanes',
      'cmdk.group.actions': 'Hurtighandlinger', 'cmdk.group.search': 'Søgning',
      'cmdk.group.savedViews': 'Gemte visninger', 'cmdk.group.help': 'Hjælp',
      'cmdk.group.ai': 'AI', 'cmdk.group.focus': 'Fokus',
      'queue.lane.all': 'Alle', 'queue.lane.actNow': 'Handl nu', 'queue.lane.sprint': 'Sprint',
      'queue.lane.later': 'Senere', 'queue.lane.admin': 'Admin', 'queue.lane.review': 'Gennemgå',
      'queue.lane.unclear': 'Uklart', 'queue.lane.bookable': 'Booking', 'queue.lane.medical': 'Medicinsk',
      'followup.label': 'Follow-up', 'followup.all': 'Alle', 'followup.overdue': 'Forsinkede',
      'followup.today': 'I dag', 'followup.tomorrow': 'I morgen', 'followup.waiting': 'Venter på svar',
      'thread.summary.title': 'Resumé', 'thread.summary.button': 'Resumér',
      'thread.summary.source.heuristic': 'Heuristisk', 'thread.summary.source.openai': 'AI · OpenAI',
      'thread.summary.verified': 'Verificeret', 'thread.summary.unverified': 'Ikke verificeret',
      'thread.summary.sinceLast': 'Siden sidst', 'thread.summary.nbaLabel': 'Foreslået handling',
      'sentiment.positive': 'Positiv', 'sentiment.neutral': 'Neutral', 'sentiment.negative': 'Negativ',
      'sentiment.anxious': 'Bekymret', 'sentiment.urgent': 'Akut',
      'session.lockTitle': 'Session låst', 'session.unlockBtn': 'Lås op',
      'session.timeoutMsg': 'Session har overskredet maks-tiden.',
      'softBreak.title': 'Håndtér afbrydelse', 'softBreak.pause': 'Pausér fokus',
      'softBreak.replace': 'Erstat fokus-tråd', 'softBreak.end': 'Afslut fokus',
      'pwa.install': 'Installer CCO',
      'pwa.update': 'Ny version tilgængelig — genindlæs for at opdatere.',
      'pwa.offline': 'Offline-tilstand: handlinger synkroniseres når online.',
      'wizard.title.brand': 'Brand & navn', 'wizard.title.mailbox': 'Mailbox-forbindelse',
      'wizard.title.identity': 'Skrive-identitet', 'wizard.title.review': 'Gennemgå og afslut',
      'wizard.create': 'Opret tenant',
      'feedback.registered': 'Feedback registreret — forbedrer fremtidige udkast.',
      'help.faq.title': 'Ofte stillede spørgsmål', 'help.shortcuts.title': 'Genveje',
      'help.contact.title': 'Brug for mere hjælp?',
      'nav.conversations': 'Konversationer', 'nav.customers': 'Kunder',
      'nav.automation': 'Automatisering', 'nav.analytics': 'Analyse', 'nav.more': 'Mere',
      'nav.newMail': 'Ny mail', 'nav.sprint': 'Sprint',
      'header.title': 'CCO', 'header.refresh': 'Opdater', 'header.signOut': 'Log ud',
      'header.changeClinic': 'Skift klinik', 'header.languagePicker': 'Sprog',
      'empty.inbox.title': 'Alt klar!', 'empty.inbox.message': 'Ingen åbne tråde i køen lige nu.',
      'empty.search.title': 'Ingen resultater', 'empty.search.message': 'Prøv en anden søgeterm.',
      'empty.firstRun.title': 'Velkommen!', 'empty.firstRun.message': 'Ingen mails indlæst endnu. Synkronisering i gang.',
      'toast.success.saved': 'Gemt', 'toast.error.failed': 'Noget gik galt',
      'toast.info.processing': 'Behandler…', 'toast.warning.attention': 'Bemærk',
    },
  };

  function detectLocale() {
    try {
      const stored = window.localStorage?.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch (_e) {}
    if (typeof window !== 'undefined' && window.__CCO_LOCALE__) {
      const o = String(window.__CCO_LOCALE__).toLowerCase();
      if (SUPPORTED.includes(o)) return o;
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      const lang = navigator.language.toLowerCase().split('-')[0];
      const norm = lang === 'da' ? 'dk' : lang;
      if (SUPPORTED.includes(norm)) return norm;
    }
    return DEFAULT_LOCALE;
  }

  let currentLocale = detectLocale();

  function setLocale(locale) {
    const safe = String(locale || '').toLowerCase();
    if (!SUPPORTED.includes(safe)) return;
    currentLocale = safe;
    try { window.localStorage?.setItem(STORAGE_KEY, safe); } catch (_e) {}
    document.documentElement.setAttribute('lang', safe === 'dk' ? 'da' : safe);
    document.documentElement.setAttribute('data-cco-locale', safe);
    if (typeof window.MajorArcanaPreviewI18n?._notifyListeners === 'function') {
      window.MajorArcanaPreviewI18n._notifyListeners(safe);
    }
  }

  function getLocale() { return currentLocale; }

  function t(key, options = {}) {
    const fallback = options?.fallback != null ? String(options.fallback) : key;
    const dict = TRANSLATIONS[currentLocale] || TRANSLATIONS[DEFAULT_LOCALE];
    const result = dict?.[key];
    if (result == null) {
      // Fallback till sv om aktuell locale saknar nyckeln
      return TRANSLATIONS[DEFAULT_LOCALE]?.[key] || fallback;
    }
    return result;
  }

  function intlLocale() {
    return currentLocale === 'dk' ? 'da-DK'
      : currentLocale === 'sv' ? 'sv-SE'
      : currentLocale === 'de' ? 'de-DE'
      : 'en-US';
  }

  function formatDate(iso, options = {}) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const style = options.style || 'short';
    const fmt = new Intl.DateTimeFormat(intlLocale(), {
      dateStyle: style === 'long' ? 'long' : style === 'medium' ? 'medium' : 'short',
      timeStyle: options.includeTime ? 'short' : undefined,
    });
    return fmt.format(date);
  }

  function formatRelativeTime(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
    const fmt = new Intl.RelativeTimeFormat(intlLocale(), { numeric: 'auto' });
    const abs = Math.abs(diffSec);
    if (abs < 60) return fmt.format(diffSec, 'second');
    if (abs < 3600) return fmt.format(Math.round(diffSec / 60), 'minute');
    if (abs < 86400) return fmt.format(Math.round(diffSec / 3600), 'hour');
    if (abs < 86400 * 7) return fmt.format(Math.round(diffSec / 86400), 'day');
    return formatDate(iso, { style: 'short' });
  }

  function formatNumber(value, options = {}) {
    if (value == null || value === '') return '';
    return new Intl.NumberFormat(intlLocale(), options).format(Number(value) || 0);
  }

  function formatCurrency(value, options = {}) {
    if (value == null || value === '') return '';
    const currency = options.currency || (currentLocale === 'dk' ? 'DKK' : currentLocale === 'de' ? 'EUR' : currentLocale === 'en' ? 'GBP' : 'SEK');
    return new Intl.NumberFormat(intlLocale(), { style: 'currency', currency }).format(Number(value) || 0);
  }

  // Listeners för locale-change
  const listeners = [];
  function onLocaleChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }
  function _notifyListeners(locale) {
    for (const fn of listeners.slice()) {
      try { fn(locale); } catch (_e) {}
    }
  }

  // I4: DOM auto-translate.
  // Mark element with data-i18n="key" → text content blir översatt.
  // Mark med data-i18n-attr-placeholder="key" → attributet placeholder översätts.
  // Mark med data-i18n-attr-aria-label="key" → aria-label översätts. Etc.
  function translateElement(el) {
    if (!el || !el.getAttribute) return;
    const textKey = el.getAttribute('data-i18n');
    if (textKey) {
      const value = t(textKey);
      // Bevara children om de har egen i18n; annars sätt text
      if (el.children.length === 0) {
        el.textContent = value;
      } else {
        // Hitta första text-noden och uppdatera den
        let textNode = null;
        for (const node of el.childNodes) {
          if (node.nodeType === 3 && node.textContent.trim()) {
            textNode = node;
            break;
          }
        }
        if (textNode) textNode.textContent = value;
        else el.insertBefore(document.createTextNode(value), el.firstChild);
      }
    }
    // Attribut-översättningar via data-i18n-attr-*
    for (const attr of Array.from(el.attributes || [])) {
      if (attr.name.startsWith('data-i18n-attr-')) {
        const targetAttr = attr.name.replace('data-i18n-attr-', '');
        const key = attr.value;
        if (targetAttr && key) el.setAttribute(targetAttr, t(key));
      }
    }
  }

  function translateDom(root = document) {
    if (!root || !root.querySelectorAll) return 0;
    let count = 0;
    const all = root.querySelectorAll('[data-i18n], [data-i18n-attr-placeholder], [data-i18n-attr-aria-label], [data-i18n-attr-title], [data-i18n-attr-alt]');
    for (const el of all) {
      translateElement(el);
      count += 1;
    }
    return count;
  }

  function setupMutationObserver() {
    if (typeof MutationObserver === 'undefined') return;
    if (window.__cco_i18n_observer) return;
    const observer = new MutationObserver((mutations) => {
      const seen = new Set();
      for (const m of mutations) {
        if (m.type === 'childList') {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1 && !seen.has(node)) {
              seen.add(node);
              translateElement(node);
              if (typeof node.querySelectorAll === 'function') {
                for (const child of node.querySelectorAll('[data-i18n], [data-i18n-attr-placeholder], [data-i18n-attr-aria-label], [data-i18n-attr-title], [data-i18n-attr-alt]')) {
                  translateElement(child);
                }
              }
            }
          }
        } else if (m.type === 'attributes' && m.attributeName && m.attributeName.startsWith('data-i18n')) {
          translateElement(m.target);
        }
      }
    });
    try {
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-i18n'],
      });
      window.__cco_i18n_observer = observer;
    } catch (_e) {}
  }

  function mount() {
    document.documentElement.setAttribute('lang', currentLocale === 'dk' ? 'da' : currentLocale);
    document.documentElement.setAttribute('data-cco-locale', currentLocale);
    // Initial pass över befintlig DOM
    if (document.body) translateDom(document);
    else document.addEventListener('DOMContentLoaded', () => translateDom(document), { once: true });
    setupMutationObserver();
    // Re-translate vid locale-change
    onLocaleChange(() => {
      try { translateDom(document); } catch (_e) {}
    });
  }

  if (typeof window !== 'undefined') {
    window.MajorArcanaPreviewI18n = Object.freeze({
      mount,
      t,
      setLocale,
      getLocale,
      formatDate,
      formatRelativeTime,
      formatNumber,
      formatCurrency,
      onLocaleChange,
      translateDom,
      translateElement,
      _notifyListeners,
      SUPPORTED,
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount, { once: true });
    } else {
      mount();
    }
  }
})();
