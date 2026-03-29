(() => {
  function createFocusIntelRenderers({
    dom = {},
    helpers = {},
    state,
    windowObject = window,
  }) {
    const {
      focusBadgeRow,
      focusConversationSection,
      focusCustomerGrid,
      focusCustomerHero,
      focusCustomerHistoryCount,
      focusCustomerHistoryDescription,
      focusCustomerHistoryList,
      focusCustomerHistoryMeta,
      focusCustomerHistoryReadoutButton,
      focusCustomerHistoryTitle,
      focusCustomerStats,
      focusCustomerSummary,
      focusHistoryCount,
      focusHistoryDeleteButton,
      focusHistoryDescription,
      focusHistoryList,
      focusHistoryMailboxRow,
      focusHistoryMeta,
      focusHistoryRangeRow,
      focusHistoryReadoutButton,
      focusHistoryScope,
      focusHistorySearchInput,
      focusHistoryTitle,
      focusHistoryTypeRow,
      focusNotesCount,
      focusNotesEmpty,
      focusNotesList,
      focusStatusLine,
      focusTitle,
      focusIntelTitle,
      intelCustomer,
      intelDateButton,
      intelGrid,
      intelPanelActions,
      intelPanelAi,
      intelPanelMedicine,
      intelPanelOverview,
      intelPanelTeam,
      intelReasonCopy,
    } = dom;

    const {
      asArray,
      asNumber,
      asText,
      buildCustomerHistoryEvents,
      buildCustomerSummaryCards,
      buildFocusHistoryScopeCards,
      buildIntelHelperConversation,
      buildRuntimeSummaryCards,
      compactRuntimeCopy,
      decorateStaticPills,
      escapeHtml,
      filterHistoryEvents,
      formatConversationTime,
      formatHistoryTimestamp,
      getCustomerHistoryMailboxOptions,
      getRelatedCustomerThreads,
      getScopedActivityNotes,
      getSelectedRuntimeThread,
      getStudioSignatureProfile,
      getThreadHistoryMailboxOptions,
      humanizeCode,
      initialsForName,
      joinReadableList,
      normalizeKey,
      normalizeText,
      pillIconSvgs,
      renderFocusSummaryCards,
      renderHistoryEventsList,
      renderHistoryFilterRow,
      resetRuntimeHistoryFilters,
      setButtonBusy,
    } = helpers;

    function renderFocusHistorySection(thread) {
      if (!focusHistoryList) return;
      if (!thread) {
        focusHistoryList.innerHTML = "";
        if (focusHistoryTitle) focusHistoryTitle.textContent = "Aktivitetshistorik";
        if (focusHistoryDescription) {
          focusHistoryDescription.textContent =
            "Fullständig logg över kommunikation och viktiga händelser för den här kunden.";
        }
        renderFocusSummaryCards(focusHistoryScope, [], "history");
        if (focusHistorySearchInput) {
          focusHistorySearchInput.value = state.runtime.historySearch || "";
        }
        if (focusHistoryCount) {
          focusHistoryCount.textContent = "Visar 0 av 0 händelser";
        }
        if (focusHistoryMeta) {
          focusHistoryMeta.textContent = state.runtime.authRequired
            ? "Logga in igen för att läsa live historik"
            : "Ingen live historik tillgänglig";
        }
        if (focusHistoryReadoutButton) {
          focusHistoryReadoutButton.disabled = true;
        }
        if (focusHistoryDeleteButton) {
          setButtonBusy(focusHistoryDeleteButton, false, "Radera", "Raderar…");
          focusHistoryDeleteButton.disabled = true;
        }
        renderHistoryFilterRow(
          focusHistoryMailboxRow,
          [{ id: "all", label: "Alla" }],
          "all",
          "focusHistoryMailbox"
        );
        renderHistoryFilterRow(
          focusHistoryTypeRow,
          [
            { id: "all", label: "Allt" },
            { id: "message", label: "Mail" },
            { id: "action", label: "Åtgärder" },
            { id: "outcome", label: "Utfall" },
          ],
          state.runtime.historyResultTypeFilter,
          "focusHistoryType"
        );
        renderHistoryFilterRow(
          focusHistoryRangeRow,
          [
            { id: "all", label: "All tid" },
            { id: "30", label: "30d" },
            { id: "90", label: "90d" },
            { id: "365", label: "365d" },
          ],
          state.runtime.historyRangeFilter,
          "focusHistoryRange"
        );
        renderHistoryEventsList(
          focusHistoryList,
          [],
          "",
          {
            title: "Ingen live historik tillgänglig",
            text: state.runtime.authRequired
              ? "Logga in igen för att läsa aktivitetshistorik."
              : "Välj en live-tråd i arbetskön för att läsa historik.",
            chip: "Historik",
          }
        );
        return;
      }

      if (focusHistoryReadoutButton) {
        focusHistoryReadoutButton.disabled = false;
      }
      if (focusHistoryDeleteButton) {
        setButtonBusy(
          focusHistoryDeleteButton,
          state.runtime.historyDeleting,
          "Radera",
          "Raderar…"
        );
        focusHistoryDeleteButton.disabled =
          state.runtime.historyDeleting || !state.runtime.deleteEnabled;
      }

      if (state.runtime.historyContextThreadId !== thread.id) {
        state.runtime.historyContextThreadId = thread.id;
        resetRuntimeHistoryFilters();
      }

      const historyMailboxOptions = getThreadHistoryMailboxOptions(thread);
      const validMailboxIds = new Set(["all", ...historyMailboxOptions.map((option) => option.id)]);
      if (!validMailboxIds.has(normalizeKey(state.runtime.historyMailboxFilter))) {
        state.runtime.historyMailboxFilter = "all";
      }

      if (focusHistorySearchInput) {
        focusHistorySearchInput.value = state.runtime.historySearch || "";
      }

      renderHistoryFilterRow(
        focusHistoryMailboxRow,
        [{ id: "all", label: "Alla" }, ...historyMailboxOptions],
        normalizeKey(state.runtime.historyMailboxFilter || "all"),
        "focusHistoryMailbox"
      );
      renderHistoryFilterRow(
        focusHistoryTypeRow,
        [
          { id: "all", label: "Allt" },
          { id: "message", label: "Mail" },
          { id: "action", label: "Åtgärder" },
          { id: "outcome", label: "Utfall" },
        ],
        normalizeKey(state.runtime.historyResultTypeFilter || "all"),
        "focusHistoryType"
      );
      renderHistoryFilterRow(
        focusHistoryRangeRow,
        [
          { id: "all", label: "All tid" },
          { id: "30", label: "30d" },
          { id: "90", label: "90d" },
          { id: "365", label: "365d" },
        ],
        normalizeKey(state.runtime.historyRangeFilter || "all"),
        "focusHistoryRange"
      );

      const allEvents = helpers.buildThreadHistoryEvents(thread);
      const filteredEvents = filterHistoryEvents(allEvents, {
        search: state.runtime.historySearch,
        mailboxFilter: state.runtime.historyMailboxFilter,
        resultTypeFilter: state.runtime.historyResultTypeFilter,
        rangeFilter: state.runtime.historyRangeFilter,
      });
      if (focusHistoryTitle) {
        focusHistoryTitle.textContent = "Historik i tråden";
      }
      if (focusHistoryDescription) {
        focusHistoryDescription.textContent = `${thread.customerName} · ${thread.mailboxLabel} · ${compactRuntimeCopy(
          thread.subject,
          "Aktiv konversation",
          72
        )}`;
      }
      renderFocusSummaryCards(
        focusHistoryScope,
        buildFocusHistoryScopeCards(thread, allEvents),
        "history"
      );

      if (focusHistoryCount) {
        focusHistoryCount.textContent = `Visar ${filteredEvents.length} av ${allEvents.length} händelser i tråden`;
      }

      if (focusHistoryMeta) {
        const latestStamp = allEvents[0]?.recordedAt
          ? formatHistoryTimestamp(allEvents[0].recordedAt)
          : thread.lastActivityLabel;
        focusHistoryMeta.textContent = `${historyMailboxOptions.length || 1} mailbox · senaste aktivitet ${latestStamp}`;
      }

      renderHistoryEventsList(focusHistoryList, filteredEvents, thread.id, {
        title: normalizeText(state.runtime.historySearch)
          ? `Ingen historik matchar "${normalizeText(state.runtime.historySearch)}"`
          : "Ingen historik i valt urval",
        text:
          normalizeKey(state.runtime.historyMailboxFilter) !== "all"
            ? "Byt mailboxfilter eller återgå till Alla för att läsa fler händelser."
            : "Byt filter eller tidsintervall för att läsa fler händelser.",
        chip: "Historik",
      });
    }

    function renderFocusNotesSection() {
      if (!focusNotesList || !focusNotesEmpty) return;
      const thread = getSelectedRuntimeThread();
      const notes = [...getScopedActivityNotes(thread)].sort((a, b) =>
        String(b.updatedAt || b.createdAt || "").localeCompare(
          String(a.updatedAt || a.createdAt || "")
        )
      );

      if (focusNotesCount) {
        focusNotesCount.textContent = `${notes.length} anteckningar kopplade till kunden och tråden.`;
      }

      focusNotesList.innerHTML = "";

      if (!notes.length) {
        focusNotesEmpty.hidden = false;
        focusNotesList.hidden = true;
        return;
      }

      focusNotesEmpty.hidden = true;
      focusNotesList.hidden = false;

      notes.forEach((note) => {
        const article = document.createElement("article");
        article.className = "focus-notes-entry";

        const head = document.createElement("div");
        head.className = "focus-notes-entry-head";

        const copy = document.createElement("div");

        const label = document.createElement("span");
        label.className = "focus-notes-entry-label";
        label.textContent = note.destinationLabel || note.destinationKey || "Anteckning";

        const title = document.createElement("h4");
        title.className = "focus-notes-entry-title";
        title.textContent = note.destinationLabel || "Anteckning";

        const text = document.createElement("p");
        text.className = "focus-notes-entry-text";
        text.textContent = note.text;

        copy.append(label, title, text);

        const stamp = document.createElement("time");
        stamp.className = "focus-notes-entry-time";
        stamp.dateTime = note.updatedAt || note.createdAt || "";
        stamp.textContent = formatHistoryTimestamp(note.updatedAt || note.createdAt);

        head.append(copy, stamp);
        article.append(head);

        const meta = document.createElement("div");
        meta.className = "focus-notes-meta-row";

        const priority = document.createElement("span");
        priority.className = "focus-notes-type-pill";
        priority.textContent =
          note.priority === "high"
            ? "Hög prioritet"
            : note.priority === "low"
              ? "Låg prioritet"
              : "Medel";

        const visibility = document.createElement("span");
        visibility.className = "focus-notes-type-pill";
        visibility.textContent =
          note.visibility === "internal"
            ? "Intern"
            : note.visibility === "all_operators"
              ? "Alla operatörer"
              : "Team";

        meta.append(priority, visibility);
        article.append(meta);

        if (Array.isArray(note.tags) && note.tags.length) {
          const tagRow = document.createElement("div");
          tagRow.className = "focus-note-tag-row";
          note.tags.forEach((tagValue) => {
            const chip = document.createElement("span");
            chip.className = "focus-note-tag";
            chip.textContent = tagValue;
            tagRow.appendChild(chip);
          });
          article.append(tagRow);
        }

        focusNotesList.appendChild(article);
      });
    }

    function renderRuntimeFocusConversation(thread) {
      if (!focusConversationSection || !focusStatusLine || !focusTitle || !focusBadgeRow) return;
      if (!thread) {
        const emptyTitle = state.runtime.authRequired
          ? "Logga in igen för att läsa live-trådar"
          : "Ingen aktiv live-konversation tillgänglig";
        const emptyBody =
          state.runtime.error || "När live runtime är tillgänglig visas den valda tråden här.";
        const reauthMarkup = state.runtime.authRequired
          ? `<button class="conversation-next-button" type="button" data-runtime-reauth>Öppna admin och logga in igen</button>`
          : "";
        focusTitle.textContent = state.runtime.authRequired ? "Inloggning krävs" : "Comms kunde inte läsas";
        focusStatusLine.textContent = state.runtime.error || "Live runtime saknas just nu.";
        focusBadgeRow.innerHTML = "";
        focusConversationSection.innerHTML = `
          <article class="conversation-entry conversation-entry-empty">
            <div class="conversation-empty-card">
              <div class="conversation-empty-meta-row">
                <span class="conversation-state-pill">${escapeHtml(
                  state.runtime.authRequired ? "Admin-session saknas" : "Live runtime saknas"
                )}</span>
              </div>
              <h4 class="conversation-empty-title">${escapeHtml(emptyTitle)}</h4>
              <p class="conversation-empty-text">${escapeHtml(emptyBody)}</p>
              ${reauthMarkup}
            </div>
          </article>`;
        return;
      }

      focusTitle.textContent = thread.subject;
      focusStatusLine.innerHTML = `${escapeHtml(thread.statusLabel)} · ${escapeHtml(
        thread.waitingLabel
      )}<span class="focus-status-alert"> · ${escapeHtml(thread.riskLabel)} · ${escapeHtml(
        thread.followUpLabel || thread.nextActionLabel
      )}</span>`;
      focusBadgeRow.innerHTML = [
        { tone: "gold", icon: "calendar", label: thread.nextActionLabel },
        { tone: "blue", icon: "calendar", label: thread.followUpLabel || thread.lastActivityLabel },
        { tone: "green", icon: "history", label: thread.lifecycleLabel },
      ]
        .map(
          (item) =>
            `<span class="focus-badge focus-badge-${item.tone}" data-pill-icon="${item.icon}">${escapeHtml(item.label)}</span>`
        )
        .join("");

      const latestMessage = thread.messages[0] || {
        author: thread.customerName,
        time: thread.lastActivityLabel,
        body: thread.preview,
        role: "customer",
      };
      const olderMessages = thread.messages.slice(1, 3);
      const olderHistoryMarkup = olderMessages.length
        ? `
        <button class="conversation-collapse" type="button" aria-expanded="${
          state.runtime.historyExpanded ? "true" : "false"
        }" aria-controls="focus-conversation-history" data-runtime-conversation-collapse>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 9.8 8 6.7l3 3.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" /></svg>
          <span class="conversation-collapse-label">${
            state.runtime.historyExpanded
              ? `Dölj ${olderMessages.length} äldre meddelanden`
              : `Visa ${olderMessages.length} äldre meddelanden`
          }</span>
        </button>
        <div class="conversation-history${state.runtime.historyExpanded ? "" : " is-collapsed"}" id="focus-conversation-history">
          ${olderMessages
            .map(
              (message) => `
                <article class="conversation-entry conversation-entry-history">
                  ${
                    message.role === "customer"
                      ? `<img class="conversation-avatar" src="${thread.avatar}" alt="${escapeHtml(
                          thread.customerName
                        )}" />`
                      : `<div class="conversation-avatar conversation-avatar-initials" aria-hidden="true">${escapeHtml(
                          initialsForName(thread.ownerLabel)
                        )}</div>`
                  }
                  <div class="conversation-history-body">
                    <div class="conversation-history-meta">
                      <span class="conversation-author">${escapeHtml(message.author)}</span>
                      <time class="conversation-time" datetime="${escapeHtml(
                        message.recordedAt || ""
                      )}">${escapeHtml(message.time || "")}</time>
                    </div>
                    <p class="conversation-history-text">${escapeHtml(message.body || "")}</p>
                  </div>
                </article>`
            )
            .join("")}
        </div>`
        : "";
      focusConversationSection.innerHTML = `
        <article class="conversation-entry conversation-entry-latest">
          ${
            latestMessage.role === "customer"
              ? `<img class="conversation-avatar" src="${thread.avatar}" alt="${escapeHtml(
                  thread.customerName
                )}" />`
              : `<div class="conversation-avatar conversation-avatar-initials" aria-hidden="true">${escapeHtml(
                  initialsForName(thread.ownerLabel)
                )}</div>`
          }
          <div class="conversation-body">
            <div class="conversation-header">
              <div class="conversation-meta">
                <span class="conversation-author">${escapeHtml(latestMessage.author)}</span>
                <time class="conversation-time" datetime="${escapeHtml(
                  latestMessage.recordedAt || ""
                )}">${escapeHtml(latestMessage.time || thread.lastActivityLabel)}</time>
                <span class="conversation-state-pill">Senaste</span>
              </div>
              <button class="conversation-more" type="button" aria-label="Fler val">
                <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="4" cy="8" r="1.1" fill="currentColor" /><circle cx="8" cy="8" r="1.1" fill="currentColor" /><circle cx="12" cy="8" r="1.1" fill="currentColor" /></svg>
              </button>
            </div>
            <div class="conversation-bubble">${escapeHtml(latestMessage.body || thread.preview)}</div>
          </div>
        </article>
        ${olderHistoryMarkup}
        <div class="conversation-next-step">
          <div class="conversation-next-copy">
            <div class="conversation-next-icons" aria-label="Snabbverktyg">
              <button class="conversation-next-icon-button conversation-next-icon-button-calendar" type="button" data-runtime-schedule-open aria-controls="schedule-shell" aria-label="Schemalägg uppföljning">
                <svg viewBox="0 0 16 16"><rect x="2.8" y="3.6" width="10.4" height="9.2" rx="2" fill="none" stroke="currentColor" stroke-width="1.3" /><path d="M5.2 2.7v2M10.8 2.7v2M2.9 6.1h10.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.3" /></svg>
              </button>
              <button class="conversation-next-icon-button conversation-next-icon-button-note" type="button" data-runtime-note-open aria-controls="note-shell" aria-label="Öppna Smart anteckning">
                <svg viewBox="0 0 16 16"><path d="M4 2.7h6.5L13 5.2v7.1a1.1 1.1 0 0 1-1.1 1.1H4A1.1 1.1 0 0 1 2.9 12.3V3.8A1.1 1.1 0 0 1 4 2.7Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.2" /><path d="M10.5 2.8v2.6H13M5.2 7.4h5.2M5.2 9.6h4.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.2" /></svg>
              </button>
            </div>
            <span class="conversation-next-label">NÄSTA ARBETSSTEG:</span>
            <span class="conversation-next-text">${escapeHtml(thread.nextActionSummary)}</span>
          </div>
          <button class="conversation-next-button" type="button" data-runtime-studio-open aria-controls="studio-shell">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.2v9.6M3.2 8h9.6M5 5l6 6M11 5 5 11" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" /></svg>
            Svarstudio
          </button>
        </div>`;
      decorateStaticPills();
    }

    function renderRuntimeCustomerPanel(thread) {
      if (!focusCustomerHero || !focusCustomerStats || !focusCustomerGrid) return;
      if (!thread) {
        renderFocusSummaryCards(focusCustomerSummary, [], "customer");
        if (focusCustomerHistoryTitle) {
          focusCustomerHistoryTitle.textContent = "Kundhistorik över mailboxar";
        }
        if (focusCustomerHistoryDescription) {
          focusCustomerHistoryDescription.textContent =
            "Samlad aktivitet för kunden över valda mailboxar.";
        }
        const customerErrorTitle = state.runtime.authRequired ? "Inloggning krävs" : "Kundkontext saknas";
        const customerErrorBody =
          state.runtime.error || "Logga in igen för att läsa live kunddata i nya CCO.";
        const reauthMarkup = state.runtime.authRequired
          ? `<button class="conversation-next-button" type="button" data-runtime-reauth>Öppna admin och logga in igen</button>`
          : "";
        focusCustomerHero.innerHTML = `
          <div class="focus-customer-hero-main">
            <div class="focus-customer-avatar">CCO</div>
            <div class="focus-customer-copy">
              <h3>${escapeHtml(customerErrorTitle)}</h3>
              <div class="focus-customer-contact-line">
                <span>${escapeHtml(customerErrorBody)}</span>
              </div>
              <div class="focus-customer-chip-row">
                <span class="focus-customer-chip focus-customer-chip--violet">${escapeHtml(
                  state.runtime.authRequired ? "Admin-session saknas" : "Live runtime saknas"
                )}</span>
              </div>
              ${reauthMarkup}
            </div>
          </div>`;
        focusCustomerStats.innerHTML = `
          <article class="focus-customer-stat-card"><span class="focus-customer-stat-label">ÄRENDEN</span><strong>-</strong><p>logga in för live data</p></article>
          <article class="focus-customer-stat-card"><span class="focus-customer-stat-label">LTV</span><strong>-</strong><p>ingen aktiv session</p></article>
          <article class="focus-customer-stat-card"><span class="focus-customer-stat-label">STATUS</span><strong>${escapeHtml(
            state.runtime.authRequired ? "Inloggning krävs" : "Otillgänglig"
          )}</strong><p>runtime krävs</p></article>`;
        focusCustomerGrid.innerHTML = `
          <article class="focus-customer-data-card"><h4>Mailhistorik</h4><dl>
            <div><dt>Mailboxar</dt><dd>-</dd></div>
            <div><dt>Första mail</dt><dd>-</dd></div>
            <div><dt>Senaste mail</dt><dd>-</dd></div>
            <div><dt>Mail</dt><dd>-</dd></div>
          </dl></article>
          <article class="focus-customer-data-card"><h4>Kundprofil</h4><dl>
            <div><dt>Kund</dt><dd>${escapeHtml(customerErrorTitle)}</dd></div>
            <div><dt>Mailbox</dt><dd>-</dd></div>
            <div><dt>Livscykel</dt><dd>-</dd></div>
          </dl></article>
          <article class="focus-customer-data-card"><h4>Konversationsläge</h4><dl>
            <div><dt>Prioritet</dt><dd>-</dd></div>
            <div><dt>Väntar på</dt><dd>-</dd></div>
            <div><dt>Nästa steg</dt><dd>${escapeHtml(
              state.runtime.authRequired ? "Logga in igen" : "Live runtime saknas"
            )}</dd></div>
          </dl></article>
          <article class="focus-customer-data-card"><h4>Risk &amp; uppföljning</h4><dl>
            <div><dt>SLA</dt><dd>-</dd></div>
            <div><dt>Risk</dt><dd>-</dd></div>
            <div><dt>Föreslagen uppföljning</dt><dd>-</dd></div>
          </dl></article>`;
        if (focusCustomerHistoryCount) {
          focusCustomerHistoryCount.textContent = "Visar 0 händelser";
        }
        if (focusCustomerHistoryMeta) {
          focusCustomerHistoryMeta.textContent = "Ingen live kundhistorik tillgänglig";
        }
        if (focusCustomerHistoryReadoutButton) {
          focusCustomerHistoryReadoutButton.disabled = true;
        }
        if (focusCustomerHistoryList) {
          focusCustomerHistoryList.innerHTML = `
            <article class="focus-history-entry">
              <div class="focus-history-entry-head">
                <div>
                  <div class="focus-history-meta-row">
                    <span class="focus-history-type-pill">Kundhistorik</span>
                  </div>
                  <p class="focus-history-entry-title">${escapeHtml(customerErrorTitle)}</p>
                  <p class="focus-history-entry-text">${escapeHtml(customerErrorBody)}</p>
                </div>
              </div>
            </article>`;
        }
        return;
      }
      const customerEvents = buildCustomerHistoryEvents(thread);
      const relatedThreads = getRelatedCustomerThreads(thread);
      const customerMailboxOptions = getCustomerHistoryMailboxOptions(thread);
      const firstEvent = customerEvents[customerEvents.length - 1];
      const latestEvent = customerEvents[0];
      const caseCount = Math.max(
        relatedThreads.length,
        asNumber(thread.raw?.customerSummary?.caseCount, 0),
        1
      );
      const customerSummary = thread.raw?.customerSummary || {};
      const primaryMailboxList = customerMailboxOptions.map((item) => item.label);
      focusCustomerHero.innerHTML = `
        <div class="focus-customer-hero-main">
          <div class="focus-customer-avatar">${escapeHtml(initialsForName(thread.customerName))}</div>
          <div class="focus-customer-copy">
            <h3>${escapeHtml(thread.customerName)}</h3>
            <div class="focus-customer-contact-line">
              <span>${escapeHtml(thread.customerEmail || "Ingen e-post")}</span>
              <span>·</span>
              <span>${escapeHtml(
                customerMailboxOptions.map((item) => item.label).join(", ") || thread.mailboxesLabel
              )}</span>
            </div>
            <div class="focus-customer-chip-row">
              <span class="focus-customer-chip focus-customer-chip--blue">${escapeHtml(
                firstEvent?.recordedAt
                  ? `Sedan ${new Date(firstEvent.recordedAt).getUTCFullYear()}`
                  : "Ny kund"
              )}</span>
              <span class="focus-customer-chip focus-customer-chip--violet">${escapeHtml(
                thread.lifecycleLabel
              )}</span>
              <span class="focus-customer-chip focus-customer-chip--gold">${escapeHtml(
                `${thread.riskLabel} · ${thread.waitingLabel}`
              )}</span>
            </div>
          </div>
        </div>`;

      renderFocusSummaryCards(
        focusCustomerSummary,
        buildCustomerSummaryCards(thread, customerEvents, relatedThreads, customerMailboxOptions),
        "customer"
      );

      focusCustomerStats.innerHTML = `
        <article class="focus-customer-stat-card"><span class="focus-customer-stat-label">MAILBOXAR</span><strong>${escapeHtml(
          String(customerMailboxOptions.length || 1)
        )}</strong><p>${escapeHtml(
          joinReadableList(primaryMailboxList.length ? primaryMailboxList : [thread.mailboxLabel], 2) ||
            thread.mailboxLabel
        )}</p></article>
        <article class="focus-customer-stat-card"><span class="focus-customer-stat-label">TRÅDAR</span><strong>${escapeHtml(
          String(caseCount)
        )}</strong><p>${escapeHtml(
          asText(customerSummary.historySignalSummary, "Kopplade spår för kunden")
        )}</p></article>
        <article class="focus-customer-stat-card"><span class="focus-customer-stat-label">SENASTE AKTIVITET</span><strong>${escapeHtml(
          latestEvent?.time || thread.lastActivityLabel
        )}</strong><p>${escapeHtml(
          compactRuntimeCopy(latestEvent?.description || thread.subject, thread.subject, 54)
        )}</p></article>`;

      focusCustomerGrid.innerHTML = `
        <article class="focus-customer-data-card"><h4>Mailhistorik</h4><dl>
          <div><dt>Mailboxar</dt><dd>${escapeHtml(
            joinReadableList(primaryMailboxList.length ? primaryMailboxList : [thread.mailboxLabel], 4) ||
              thread.mailboxesLabel
          )}</dd></div>
          <div><dt>Första mail</dt><dd>${escapeHtml(
            firstEvent ? formatConversationTime(firstEvent.recordedAt) : "-"
          )}</dd></div>
          <div><dt>Senaste mail</dt><dd>${escapeHtml(
            latestEvent ? formatConversationTime(latestEvent.recordedAt) : thread.lastActivityLabel
          )}</dd></div>
          <div><dt>Mail</dt><dd>${escapeHtml(
            `${customerEvents.length} händelser · ${relatedThreads.length} trådar`
          )}</dd></div>
        </dl></article>
        <article class="focus-customer-data-card"><h4>Kundprofil</h4><dl>
          <div><dt>Kund</dt><dd>${escapeHtml(thread.customerName)}</dd></div>
          <div><dt>Mailbox</dt><dd>${escapeHtml(thread.mailboxLabel)}</dd></div>
          <div><dt>Livscykel</dt><dd>${escapeHtml(thread.lifecycleLabel)}</dd></div>
          <div><dt>Relation</dt><dd>${escapeHtml(thread.engagementLabel)}</dd></div>
        </dl></article>
        <article class="focus-customer-data-card"><h4>Konversationsläge</h4><dl>
          <div><dt>Prioritet</dt><dd>${escapeHtml(
            thread.tags.includes("sprint") ? "Sprint" : "Normal"
          )}</dd></div>
          <div><dt>Status</dt><dd>${escapeHtml(thread.statusLabel)}</dd></div>
          <div><dt>Väntar på</dt><dd>${escapeHtml(thread.waitingLabel)}</dd></div>
          <div><dt>Nästa steg</dt><dd>${escapeHtml(thread.nextActionLabel)}</dd></div>
        </dl></article>
        <article class="focus-customer-data-card"><h4>Risk &amp; uppföljning</h4><dl>
          <div><dt>SLA</dt><dd>${escapeHtml(humanizeCode(thread.raw?.slaStatus, "Stabil"))}</dd></div>
          <div><dt>Risk</dt><dd>${escapeHtml(thread.riskReason)}</dd></div>
          <div><dt>Föreslagen uppföljning</dt><dd>${escapeHtml(thread.followUpLabel || "-")}</dd></div>
          <div><dt>Nästa drag</dt><dd>${escapeHtml(
            compactRuntimeCopy(thread.nextActionSummary, "Ingen planerad uppföljning ännu.", 72)
          )}</dd></div>
        </dl></article>`;

      if (focusCustomerHistoryTitle) {
        focusCustomerHistoryTitle.textContent = `Kundhistorik över ${
          customerMailboxOptions.length || 1
        } mailboxar`;
      }
      if (focusCustomerHistoryDescription) {
        focusCustomerHistoryDescription.textContent = `Samlad aktivitet för ${thread.customerName} över ${caseCount} spår i valt scope.`;
      }
      if (focusCustomerHistoryCount) {
        focusCustomerHistoryCount.textContent = `Visar ${customerEvents.length} händelser`;
      }
      if (focusCustomerHistoryMeta) {
        const latestLabel = latestEvent?.time || thread.lastActivityLabel;
        focusCustomerHistoryMeta.textContent = `${customerMailboxOptions.length || 1} mailboxar · ${relatedThreads.length} trådar · senaste ${latestLabel}`;
      }
      if (focusCustomerHistoryReadoutButton) {
        focusCustomerHistoryReadoutButton.disabled = false;
      }
      if (focusCustomerHistoryList) {
        if (!customerEvents.length) {
          focusCustomerHistoryList.innerHTML = `
            <article class="focus-history-entry">
              <div class="focus-history-entry-head">
                <div>
                  <div class="focus-history-meta-row">
                    <span class="focus-history-type-pill">Kundhistorik</span>
                  </div>
                  <p class="focus-history-entry-title">Ingen kundhistorik i valt urval</p>
                  <p class="focus-history-entry-text">Byt mailboxscope för att läsa fler trådar över kunden.</p>
                </div>
              </div>
            </article>`;
        } else {
          renderHistoryEventsList(focusCustomerHistoryList, customerEvents.slice(0, 8), thread.id);
        }
      }
    }

    function renderIntelCardGroup(container, cards) {
      if (!container) return;
      container.innerHTML = cards.map((card) => renderIntelCardMarkup(card)).join("");
    }

    function renderIntelCardMarkup(card) {
      const safeCard = card && typeof card === "object" ? card : {};
      const toneClass =
        safeCard.tone === "blue"
          ? "intel-card-chip-blue"
          : safeCard.tone === "green"
            ? "intel-card-chip-green"
            : "intel-card-chip-violet";
      const helperLines = asArray(safeCard.lines).filter(
        (line) => line && typeof line === "object" && (asText(line.label) || asText(line.value))
      );
      const simpleLines = asArray(safeCard.lines).filter((line) => typeof line === "string");
      const badges = asArray(safeCard.badges).filter(
        (badge) => badge && typeof badge === "object" && asText(badge.label)
      );
      const timeline = asArray(safeCard.timeline).filter(
        (item) => item && typeof item === "object" && asText(item.label)
      );
      const title = asText(safeCard.title);
      const detail = asText(safeCard.detail);
      const note = asText(safeCard.note);

      if (title || detail || note || helperLines.length || badges.length || timeline.length) {
        return `<article class="intel-card intel-card-detail-shell">
          ${title ? `<h4 class="intel-card-heading">${escapeHtml(title)}</h4>` : ""}
          ${detail ? `<p class="intel-card-detail">${escapeHtml(detail)}</p>` : ""}
          ${note ? `<p class="intel-card-note">${escapeHtml(note)}</p>` : ""}
          ${
            helperLines.length
              ? `<dl class="intel-card-lines">
                  ${helperLines
                    .map(
                      (line) => `<div class="intel-card-line">
                        <dt class="intel-card-line-label">${escapeHtml(asText(line.label, "Info"))}</dt>
                        <dd class="intel-card-line-value">${escapeHtml(asText(line.value, "-"))}</dd>
                      </div>`
                    )
                    .join("")}
                </dl>`
              : ""
          }
          ${
            timeline.length
              ? `<div class="intel-card-timeline">
                  ${timeline
                    .map((item) => {
                      const toneModifier =
                        normalizeKey(item.tone) === "danger"
                          ? " intel-card-timeline-item-danger"
                          : normalizeKey(item.tone) === "warn"
                            ? " intel-card-timeline-item-warn"
                            : normalizeKey(item.tone) === "success"
                              ? " intel-card-timeline-item-success"
                              : "";
                      return `<div class="intel-card-timeline-item${toneModifier}">
                        <span class="intel-card-timeline-icon">${pillIconSvgs.send}</span>
                        <div class="intel-card-timeline-copy">
                          <strong>${escapeHtml(asText(item.label, "Händelse"))}</strong>
                          <span class="intel-card-timeline-meta">${escapeHtml(
                            [asText(item.date), asText(item.note)].filter(Boolean).join(" · ") || "-"
                          )}</span>
                        </div>
                      </div>`;
                    })
                    .join("")}
                </div>`
              : ""
          }
          ${
            badges.length
              ? `<div class="intel-card-badges">
                  ${badges
                    .map((badge) => {
                      const badgeTone =
                        normalizeKey(badge.tone) === "danger"
                          ? "intel-card-badge-danger"
                          : normalizeKey(badge.tone) === "warn"
                            ? "intel-card-badge-warn"
                            : normalizeKey(badge.tone) === "success"
                              ? "intel-card-badge-success"
                              : normalizeKey(badge.tone) === "info"
                                ? "intel-card-badge-info"
                                : "intel-card-badge-neutral";
                      return `<span class="intel-card-badge ${badgeTone}">${escapeHtml(
                        asText(badge.label)
                      )}</span>`;
                    })
                    .join("")}
                </div>`
              : ""
          }
        </article>`;
      }

      return `<article class="intel-card intel-card-overview">
        <span class="intel-card-chip ${toneClass}">${escapeHtml(
          asText(safeCard.chip, "Signal")
        )}</span>
        ${simpleLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </article>`;
    }

    function buildIntelSummaryCard(thread) {
      return {
        title: "Sammanfattning",
        detail: compactRuntimeCopy(thread?.whyInFocus, "Ingen sammanfattning tillgänglig.", 110),
        note: compactRuntimeCopy(
          thread?.nextActionSummary,
          "Nästa steg behöver tydliggöras.",
          110
        ),
        lines: [
          { label: "Nästa steg", value: asText(thread?.nextActionLabel, "Granska tråden") },
          { label: "Status", value: asText(thread?.statusLabel, "Aktiv") },
          { label: "Ägare", value: asText(thread?.ownerLabel, "Oägd") },
        ],
      };
    }

    function buildIntelAiGuidanceCard(thread) {
      return {
        title: "AI-beslutsläge",
        detail: asText(thread?.nextActionLabel, "Granska tråden"),
        note: compactRuntimeCopy(
          thread?.nextActionSummary,
          "Gör nästa steg tydligt i svaret.",
          110
        ),
        lines: [
          { label: "SLA", value: humanizeCode(thread?.raw?.slaStatus, "Stabil") },
          { label: "Risk", value: asText(thread?.riskLabel, "Bevaka") },
          { label: "Väntar på", value: asText(thread?.waitingLabel, "Ägaråtgärd") },
        ],
        badges: [
          {
            label: asArray(thread?.tags).includes("act-now")
              ? "Agera nu"
              : asArray(thread?.tags).includes("sprint")
                ? "Sprint"
                : "Normal",
            tone: asArray(thread?.tags).includes("high-risk") ? "warn" : "info",
          },
        ],
      };
    }

    function buildIntelActionPlanCard(thread) {
      return {
        title: "Operativ riktning",
        detail: asText(thread?.nextActionLabel, "Nästa steg saknas"),
        note: compactRuntimeCopy(
          thread?.nextActionSummary,
          "Ta nästa tydliga steg i samma tråd.",
          110
        ),
        lines: [
          { label: "Uppföljning", value: asText(thread?.followUpLabel, "Ingen planerad") },
          { label: "Mailbox", value: asText(thread?.mailboxLabel, "Okänd") },
          { label: "Ägare", value: asText(thread?.ownerLabel, "Oägd") },
        ],
      };
    }

    function buildRuntimeIntelPanelCards(thread) {
      const helperConversation = buildIntelHelperConversation(thread);
      const customerHelper =
        windowObject.ArcanaCcoNextCustomerIntelligence &&
        typeof windowObject.ArcanaCcoNextCustomerIntelligence.buildModel === "function"
          ? windowObject.ArcanaCcoNextCustomerIntelligence.buildModel(helperConversation)
          : null;
      const actorLabel = asText(
        getStudioSignatureProfile(state.runtime.defaultSignatureProfile).fullName ||
          thread?.ownerLabel,
        thread?.ownerLabel || "Team"
      );
      const collaborationHelper =
        windowObject.ArcanaCcoNextCollaboration &&
        typeof windowObject.ArcanaCcoNextCollaboration.buildModel === "function"
          ? windowObject.ArcanaCcoNextCollaboration.buildModel(helperConversation, { actorLabel })
          : null;
      const baseCards = thread?.cards || buildRuntimeSummaryCards(thread?.raw || {}, thread);
      const collaborationNotice = collaborationHelper?.notice
        ? {
            title: asText(collaborationHelper.notice.title, "Teamnotis"),
            detail: asText(collaborationHelper.notice.note, "Ingen extra teamnotis just nu."),
            badges: [
              {
                label:
                  asText(collaborationHelper.notice.tone, "neutral") === "warn"
                    ? "Krockrisk"
                    : "Teamläge",
                tone: asText(collaborationHelper.notice.tone, "neutral"),
              },
            ],
          }
        : null;

      return {
        overview: [
          customerHelper?.relationshipCard || null,
          customerHelper?.identityCard || null,
          customerHelper?.journeyCard || null,
          ...asArray(baseCards.overview),
          buildIntelSummaryCard(thread),
        ].filter(Boolean),
        ai: [...asArray(baseCards.ai), buildIntelAiGuidanceCard(thread)].filter(Boolean),
        medicine: [customerHelper?.treatmentCard || null, ...asArray(baseCards.medicine)].filter(Boolean),
        team: [
          collaborationNotice,
          collaborationHelper?.presenceCard || null,
          collaborationHelper?.handoffCard || null,
          collaborationHelper?.draftCard || null,
          ...asArray(baseCards.team),
        ].filter(Boolean),
        actions: [...asArray(baseCards.actions), buildIntelActionPlanCard(thread)].filter(Boolean),
      };
    }

    function renderRuntimeIntel(thread) {
      if (!focusIntelTitle || !intelDateButton || !intelCustomer || !intelGrid || !intelReasonCopy) {
        return;
      }
      if (!thread) {
        focusIntelTitle.textContent = "Beslutsstöd";
        intelDateButton.innerHTML = `<span>${escapeHtml(
          state.runtime.authRequired ? "admin-session saknas" : "live runtime saknas"
        )}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.3 6.5 8 9.2l2.7-2.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" /></svg>`;
        intelCustomer.innerHTML = `
          <div class="focus-intel-monogram">CCO</div>
          <div class="focus-intel-customer-copy">
            <div class="focus-intel-name-row">
              <h4>${escapeHtml(
                state.runtime.authRequired ? "Inloggning krävs" : "Live runtime saknas"
              )}</h4>
              <span class="focus-intel-queue-pill" data-pill-icon="bolt">${escapeHtml(
                state.runtime.authRequired ? "Logga in" : "Otillgänglig"
              )}</span>
            </div>
            <p>${escapeHtml(state.runtime.error || "Ingen live kundkontext tillgänglig.")}</p>
          </div>`;
        intelGrid.innerHTML = `
          <div class="focus-intel-item"><span class="focus-intel-label">LIVSCYKEL</span><strong>-</strong></div>
          <div class="focus-intel-item"><span class="focus-intel-label">VÄNTAR PÅ</span><strong>-</strong></div>
          <div class="focus-intel-item"><span class="focus-intel-label">UPPFÖLJNING</span><strong>-</strong></div>
          <div class="focus-intel-item"><span class="focus-intel-label">STATUS</span><strong>${escapeHtml(
            state.runtime.authRequired ? "Inloggning krävs" : "Otillgänglig"
          )}</strong></div>
          <div class="focus-intel-item"><span class="focus-intel-label">ÄGARE</span><strong>-</strong></div>
          <div class="focus-intel-item"><span class="focus-intel-label">RISK</span><strong>-</strong></div>`;
        intelReasonCopy.textContent = state.runtime.error || "Ingen live kundkontext tillgänglig.";
        renderIntelCardGroup(intelPanelOverview, [
          {
            chip: state.runtime.authRequired ? "Åtkomst krävs" : "Runtime",
            tone: "violet",
            lines: [
              state.runtime.authRequired
                ? "Logga in igen i admin för att läsa live kundhistorik och beslutsstöd."
                : "Live runtime är tillfälligt otillgänglig i nya CCO.",
            ],
          },
        ]);
        renderIntelCardGroup(intelPanelAi, []);
        renderIntelCardGroup(intelPanelMedicine, []);
        renderIntelCardGroup(intelPanelTeam, []);
        renderIntelCardGroup(
          intelPanelActions,
          state.runtime.authRequired
            ? [
                {
                  chip: "Nästa steg",
                  tone: "blue",
                  lines: ["Öppna admin och logga in igen för att återställa live-läget."],
                },
              ]
            : []
        );
        decorateStaticPills();
        return;
      }
      focusIntelTitle.textContent = "Beslutsstöd";
      intelDateButton.innerHTML = `<span>live ${escapeHtml(
        formatConversationTime(state.runtime.lastSyncAt || new Date().toISOString())
      )}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.3 6.5 8 9.2l2.7-2.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" /></svg>`;
      intelCustomer.innerHTML = `
        <div class="focus-intel-monogram">${escapeHtml(initialsForName(thread.customerName))}</div>
        <div class="focus-intel-customer-copy">
          <div class="focus-intel-name-row">
            <h4>${escapeHtml(thread.customerName)}</h4>
            <span class="focus-intel-queue-pill" data-pill-icon="bolt">${escapeHtml(
              thread.tags.includes("act-now")
                ? "Agera nu"
                : thread.tags.includes("sprint")
                  ? "Sprint"
                  : thread.statusLabel
            )}</span>
          </div>
          <p>${escapeHtml(thread.engagementLabel)} · ${escapeHtml(thread.ownerLabel)}</p>
        </div>`;
      intelGrid.innerHTML = `
        <div class="focus-intel-item"><span class="focus-intel-label">LIVSCYKEL</span><strong>${escapeHtml(
          thread.lifecycleLabel
        )}</strong></div>
        <div class="focus-intel-item"><span class="focus-intel-label">VÄNTAR PÅ</span><strong>${escapeHtml(
          thread.waitingLabel
        )}</strong></div>
        <div class="focus-intel-item"><span class="focus-intel-label">UPPFÖLJNING</span><strong>${escapeHtml(
          thread.followUpLabel || "-"
        )}</strong></div>
        <div class="focus-intel-item"><span class="focus-intel-label">STATUS</span><strong>${escapeHtml(
          thread.statusLabel
        )}</strong></div>
        <div class="focus-intel-item"><span class="focus-intel-label">ÄGARE</span><strong>${escapeHtml(
          thread.ownerLabel
        )}</strong></div>
        <div class="focus-intel-item"><span class="focus-intel-label">RISK</span><strong>${escapeHtml(
          thread.riskLabel
        )}</strong></div>`;
      intelReasonCopy.textContent = thread.whyInFocus;
      const intelPanels = buildRuntimeIntelPanelCards(thread);
      renderIntelCardGroup(intelPanelOverview, intelPanels.overview);
      renderIntelCardGroup(intelPanelAi, intelPanels.ai);
      renderIntelCardGroup(intelPanelMedicine, intelPanels.medicine);
      renderIntelCardGroup(intelPanelTeam, intelPanels.team);
      renderIntelCardGroup(intelPanelActions, intelPanels.actions);
      decorateStaticPills();
    }

    return Object.freeze({
      renderFocusHistorySection,
      renderFocusNotesSection,
      renderRuntimeCustomerPanel,
      renderRuntimeFocusConversation,
      renderRuntimeIntel,
    });
  }

  window.MajorArcanaPreviewFocusIntelRenderers = Object.freeze({
    createFocusIntelRenderers,
  });
})();
