(() => {
  function createQueueRenderers({
    dom = {},
    helpers = {},
    state,
    windowObject = window,
  }) {
    const {
      laterMetricValueNodes = {},
      sentMetricValueNodes = {},
      mailboxMenuGrid,
      mailboxTriggerLabel,
      mailFeedBulkButtons = [],
      mailFeedDensityButtons = [],
      mailFeedFilterButtons = [],
      mailFeedLists = [],
      mailFeedSelectAllButtons = [],
      mailFeedSelectionCountNodes = [],
      mailFeedUndoButtons = [],
      mailFeedViewButtons = [],
      ownerMenuGrid,
      ownerTriggerLabel,
      queueActiveLaneLabel,
      queueCollapsedList,
      queueContent,
      queueHistoryCount,
      queueHistoryHead,
      queueHistoryList,
      queueHistoryLoadMoreButton,
      queueHistoryMeta,
      queueHistoryPanel,
      queueHistoryToggle,
      queueLaneButtons = [],
      queueLaneCountNodes = [],
      queuePrimaryLaneTag,
      queueSummaryActNow,
      queueSummaryFocus,
      queueSummaryRisk,
      queueSummarySprint,
      queueTitle,
      threadContextRows = [],
    } = dom;

    const {
      MAIL_FEEDS = {},
      QUEUE_LANE_LABELS = {},
      asArray,
      asText,
      buildAvatarDataUri,
      compactRuntimeCopy,
      createPillIcon,
      decorateStaticPills,
      escapeHtml,
      getAvailableRuntimeMailboxes,
      getAvailableRuntimeOwners,
      getFilteredMailFeedItems,
      getFilteredRuntimeThreads,
      getMailFeedRuntimeState,
      getMailFeedSelectedKeys,
      getMailboxScopedRuntimeThreads,
      getOrderedQueueLaneIds,
      getQueueScopedRuntimeThreads,
      getSelectedRuntimeMailboxScopeIds,
      getSelectedRuntimeThread,
      isHandledRuntimeThread,
      isLaterRuntimeThread,
      isSentRuntimeThread,
      normalizeKey,
      normalizeMailboxId,
      threadContextDefinitions = {},
      toIso,
    } = helpers;

    function renderThreadContextRows() {
      const runtimeThread = getSelectedRuntimeThread();
      if (state.runtime.live && runtimeThread) {
        threadContextRows.forEach((row) => {
          row.innerHTML = "";
          [
            { tone: "mailbox", value: runtimeThread.mailboxLabel, icon: "mail" },
            { tone: "intent", value: runtimeThread.intentLabel, icon: "question" },
            {
              tone: "deadline",
              value: runtimeThread.followUpLabel || runtimeThread.nextActionLabel,
              icon: "clock",
            },
          ].forEach((item) => {
            const chip = document.createElement("span");
            chip.className = `thread-context-chip thread-context-chip--${item.tone}`;
            const icon = createPillIcon(item.icon);
            if (icon) chip.appendChild(icon);
            chip.appendChild(document.createTextNode(item.value));
            row.appendChild(chip);
          });
        });
        return;
      }

      threadContextRows.forEach((row) => {
        const key = normalizeKey(row.dataset.threadKey);
        const definition = threadContextDefinitions[key];
        if (!definition) {
          row.innerHTML = "";
          return;
        }

        row.innerHTML = "";

        [
          { tone: "mailbox", value: definition.mailbox, icon: "mail" },
          { tone: "intent", value: definition.intent, icon: "question" },
          { tone: "deadline", value: definition.deadline, icon: "clock" },
        ].forEach((item) => {
          const chip = document.createElement("span");
          chip.className = `thread-context-chip thread-context-chip--${item.tone}`;
          const icon = createPillIcon(item.icon);
          if (icon) chip.appendChild(icon);
          chip.appendChild(document.createTextNode(item.value));
          row.appendChild(chip);
        });
      });
    }

    function buildQueuePillMarkup(label, tone, iconKey) {
      const classes =
        tone === "green"
          ? "chip chip-green"
          : tone === "blue"
            ? "chip chip-blue"
            : tone === "urgent"
              ? "chip chip-urgent chip-urgent-deep"
              : "chip chip-neutral";
      return `<span class="${classes}" data-pill-icon="${escapeHtml(iconKey)}">${escapeHtml(label)}</span>`;
    }

    function buildThreadCardMarkup(thread, index, selected) {
      const variant = index === 0 ? "anna" : index === 1 ? "erik" : "maria";
      const tags = asArray(thread.tags);
      const queueTag = tags.includes("act-now")
        ? { label: "Agera nu", tone: "urgent", icon: "warning" }
        : tags.includes("sprint")
          ? { label: "Sprint", tone: "green", icon: "play" }
          : tags.includes("later")
            ? { label: "Senare", tone: "blue", icon: "history" }
            : { label: thread.statusLabel, tone: "blue", icon: "question" };
      const selectedStyle = selected
        ? ' style="border-color: rgba(230, 191, 207, 0.92); box-shadow: 0 16px 32px rgba(172, 128, 148, 0.18), inset 0 1px 0 rgba(255,255,255,0.95);"'
        : "";
      return `<article class="thread-card thread-card--${variant}" data-runtime-thread="${escapeHtml(thread.id)}"${selectedStyle}>
        <img class="avatar" src="${thread.avatar}" alt="${escapeHtml(thread.customerName)}" />
        <div class="thread-main">
          <div class="thread-meta">
            <div class="thread-heading">
              <h3>${escapeHtml(thread.customerName)}</h3>
              ${thread.isVIP ? `<span class="chip chip-vip"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m8 2.2 1.7 3.4 3.8.6-2.8 2.7.7 3.8L8 11l-3.4 1.7.7-3.8L2.5 6.2l3.8-.6Z" fill="currentColor" /></svg>VIP</span>` : ""}
            </div>
            <time datetime="${escapeHtml(thread.lastActivityAt || "")}">${escapeHtml(thread.lastActivityLabel)}</time>
          </div>
          <p class="subject">${escapeHtml(thread.subject)}</p>
          <p class="preview-text">${escapeHtml(thread.preview)}</p>
          <div class="chip-row">
            ${buildQueuePillMarkup(thread.mailboxLabel, "neutral", "mail")}
            ${buildQueuePillMarkup(thread.intentLabel, "blue", "question")}
            ${buildQueuePillMarkup(queueTag.label, queueTag.tone, queueTag.icon)}
            ${buildQueuePillMarkup(thread.followUpLabel || thread.nextActionLabel, "urgent", "clock")}
          </div>
        </div>
      </article>`;
    }

    function getQueueCount(tag, threads = getQueueScopedRuntimeThreads()) {
      return threads.filter((thread) => asArray(thread.tags).includes(tag)).length;
    }

    function renderRuntimeQueueLaneState() {
      const activeLaneId = normalizeKey(state.runtime.activeLaneId || "all");
      if (queueActiveLaneLabel) {
        queueActiveLaneLabel.textContent =
          QUEUE_LANE_LABELS[activeLaneId] || QUEUE_LANE_LABELS.all;
      }
      queueLaneButtons.forEach((button) => {
        const laneId = normalizeKey(button.dataset.queueLane || "all");
        const isActive = laneId === activeLaneId;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
        if (laneId !== "all") {
          button.setAttribute("draggable", "true");
        }
      });
      if (queueCollapsedList) {
        const rowsByLane = new Map(
          Array.from(queueCollapsedList.querySelectorAll("[data-queue-lane]")).map((row) => [
            normalizeKey(row.dataset.queueLane),
            row,
          ])
        );
        getOrderedQueueLaneIds().forEach((laneId) => {
          const row = rowsByLane.get(laneId);
          if (row) queueCollapsedList.appendChild(row);
        });
      }
    }

    function renderRuntimeQueueCounts() {
      const queueScopedThreads = getQueueScopedRuntimeThreads();
      const filteredThreads = getFilteredRuntimeThreads();
      const activeLaneId = normalizeKey(state.runtime.activeLaneId || "all");
      renderRuntimeQueueLaneState();
      if (queueTitle) {
        queueTitle.textContent = `Arbetslista (${filteredThreads.length})`;
      }
      if (queueSummaryFocus) {
        queueSummaryFocus.textContent = String(filteredThreads.length);
      }
      if (queueSummaryActNow) {
        queueSummaryActNow.textContent = String(getQueueCount("act-now", filteredThreads));
      }
      if (queueSummarySprint) {
        queueSummarySprint.textContent = String(getQueueCount("sprint", filteredThreads));
      }
      if (queueSummaryRisk) {
        queueSummaryRisk.textContent = `${getQueueCount("high-risk", filteredThreads)} hög risk`;
      }
      queueLaneCountNodes.forEach((node) => {
        const lane = normalizeKey(node.dataset.queueLaneCount);
        const count = lane === "all" ? filteredThreads.length : getQueueCount(lane, queueScopedThreads);
        node.textContent = String(count);
      });
      if (queueActiveLaneLabel) {
        queueActiveLaneLabel.textContent =
          QUEUE_LANE_LABELS[activeLaneId] || QUEUE_LANE_LABELS.all;
      }
    }

    function renderRuntimeMailboxMenu() {
      if (!mailboxMenuGrid || !mailboxTriggerLabel) return;
      const availableMailboxes = getAvailableRuntimeMailboxes();
      const selectedIds = new Set(state.runtime.selectedMailboxIds);
      mailboxMenuGrid.innerHTML = "";
      availableMailboxes.forEach((mailbox) => {
        const checked = selectedIds.has(mailbox.id);
        const label = document.createElement("label");
        label.className = `mailbox-option${mailbox.custom ? " mailbox-option-custom" : ""}`;
        label.innerHTML =
          `<input class="mailbox-option-input" type="checkbox" data-runtime-mailbox="${escapeHtml(mailbox.id)}"${checked ? " checked" : ""} />` +
          '<span class="mailbox-option-box" aria-hidden="true"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 8.4 6.6 11.2l5.8-6.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" /></svg></span>' +
          `<span class="mailbox-option-name">${escapeHtml(mailbox.label)}</span>`;
        mailboxMenuGrid.appendChild(label);
      });
      const addButton = document.createElement("button");
      addButton.className = "mailbox-option mailbox-option-add";
      addButton.type = "button";
      addButton.dataset.mailboxAdminOpen = "true";
      addButton.innerHTML =
        '<span class="mailbox-option-plus" aria-hidden="true"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.2v9.6M3.2 8h9.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" /></svg></span>' +
        '<span class="mailbox-option-name">Lägg till</span>';
      mailboxMenuGrid.appendChild(addButton);

      const selectedMailboxes = availableMailboxes.filter((mailbox) => selectedIds.has(mailbox.id));
      if (!availableMailboxes.length) {
        mailboxTriggerLabel.textContent = "Hair TP Clinic - Inga mailboxar";
      } else if (selectedMailboxes.length === availableMailboxes.length) {
        mailboxTriggerLabel.textContent = "Hair TP Clinic - Alla mailboxar";
      } else if (selectedMailboxes.length === 1) {
        mailboxTriggerLabel.textContent = `Hair TP Clinic - ${selectedMailboxes[0].label}`;
      } else if (selectedMailboxes.length > 1) {
        mailboxTriggerLabel.textContent = `Hair TP Clinic - ${selectedMailboxes[0].label} +${selectedMailboxes.length - 1}`;
      } else {
        mailboxTriggerLabel.textContent = "Hair TP Clinic - Inga mailboxar";
      }
    }

    function renderRuntimeOwnerMenu() {
      if (!ownerMenuGrid || !ownerTriggerLabel) return;
      const ownerOptions = getAvailableRuntimeOwners();
      ownerMenuGrid.innerHTML = "";
      ownerOptions.forEach((owner) => {
        const checked = normalizeKey(state.runtime.selectedOwnerKey || "all") === owner.id;
        const label = document.createElement("label");
        label.className = "mailbox-option";
        label.innerHTML =
          `<input class="mailbox-option-input" type="radio" name="runtime-owner-scope" data-runtime-owner="${escapeHtml(owner.id)}"${checked ? " checked" : ""} />` +
          '<span class="mailbox-option-box" aria-hidden="true"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 8.4 6.6 11.2l5.8-6.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" /></svg></span>' +
          `<span class="mailbox-option-name">${escapeHtml(owner.label)}</span>`;
        ownerMenuGrid.appendChild(label);
      });

      const selectedOwner = ownerOptions.find(
        (owner) => owner.id === normalizeKey(state.runtime.selectedOwnerKey || "all")
      );
      ownerTriggerLabel.textContent =
        !selectedOwner || selectedOwner.id === "all" ? "Ägarvy" : selectedOwner.label;
    }

    function renderRuntimeQueue() {
      if (!queueContent) return;
      renderRuntimeMailboxMenu();
      renderRuntimeOwnerMenu();
      renderRuntimeQueueCounts();

      if (state.runtime.loading) {
        queueContent.innerHTML = buildThreadCardMarkup(
          {
            id: "runtime-loading",
            avatar: buildAvatarDataUri("CCO"),
            customerName: "Laddar live-trådar",
            lastActivityAt: "",
            lastActivityLabel: "Nu",
            isVIP: false,
            subject: "Hämtar arbetskö",
            preview: "Läser Comms, Graph och live runtime för nya CCO.",
            mailboxLabel: "Live",
            intentLabel: "Synkar",
            statusLabel: "Laddar",
            followUpLabel: "",
            tags: [],
          },
          0,
          false
        );
        return;
      }

      if (state.runtime.error) {
        queueContent.innerHTML = buildThreadCardMarkup(
          {
            id: "runtime-error",
            avatar: buildAvatarDataUri("CCO"),
            customerName: state.runtime.authRequired ? "Inloggning krävs" : "Comms kunde inte läsas",
            lastActivityAt: "",
            lastActivityLabel: "Nu",
            isVIP: false,
            subject: state.runtime.authRequired
              ? "Öppna admin och logga in igen"
              : "Live runtime otillgänglig",
            preview: state.runtime.error,
            mailboxLabel: "CCO",
            intentLabel: state.runtime.offline ? "Offline" : "Runtime",
            statusLabel: "Otillgänglig",
            followUpLabel: "",
            tags: [],
          },
          0,
          false
        );
        return;
      }

      const queueScopedThreads = getQueueScopedRuntimeThreads();
      const filteredThreads = getFilteredRuntimeThreads();
      if (!filteredThreads.length) {
        const ownerFiltered =
          normalizeKey(state.runtime.selectedOwnerKey || "all") !== "all" &&
          getMailboxScopedRuntimeThreads().length > 0;
        const laneFiltered =
          normalizeKey(state.runtime.activeLaneId || "all") !== "all" &&
          queueScopedThreads.length > 0;
        const activeLaneLabel =
          QUEUE_LANE_LABELS[normalizeKey(state.runtime.activeLaneId || "all")] ||
          QUEUE_LANE_LABELS.all;
        queueContent.innerHTML = buildThreadCardMarkup(
          {
            id: "runtime-empty",
            avatar: buildAvatarDataUri("CCO"),
            customerName: "Inga trådar i urvalet",
            lastActivityAt: "",
            lastActivityLabel: "Nu",
            isVIP: false,
            subject: laneFiltered
              ? `${activeLaneLabel} har inga aktiva trådar`
              : ownerFiltered
                ? "Ägarfiltret gav inga aktiva trådar"
                : "Mailboxfiltret gav inga aktiva trådar",
            preview: laneFiltered
              ? "Byt kö i vänsterpanelen eller återgå till Alla trådar för att se fler konversationer."
              : ownerFiltered
                ? "Byt ägare eller återgå till Ägarvy för att se fler trådar."
                : "Välj fler mailboxar eller vänta på nästa inkommande konversation.",
            mailboxLabel: "Arbetskö",
            intentLabel: "Tom kö",
            statusLabel: "Ingen match",
            followUpLabel: "",
            tags: [],
          },
          0,
          false
        );
        return;
      }

      queueContent.innerHTML = filteredThreads
        .slice(0, 8)
        .map((thread, index) =>
          buildThreadCardMarkup(thread, index, thread.id === state.runtime.selectedThreadId)
        )
        .join("");
      decorateStaticPills();
    }

    function renderQueueHistoryList(items = []) {
      if (!queueHistoryList) return;
      queueHistoryList.innerHTML = "";
      items.forEach((item) => {
        const article = document.createElement("article");
        article.className = "thread-card queue-history-item";

        const avatar = document.createElement("span");
        avatar.className = "avatar queue-history-avatar";
        avatar.textContent = item.initials;

        const body = document.createElement("div");
        body.className = "thread-main queue-history-body";

        const head = document.createElement("div");
        head.className = "thread-meta queue-history-item-head";

        const heading = document.createElement("div");
        heading.className = "thread-heading queue-history-item-heading";

        const headingTitle = document.createElement("h3");
        headingTitle.textContent = item.counterpartyLabel;

        heading.appendChild(headingTitle);

        const stamp = document.createElement("time");
        stamp.className = "queue-history-item-time";
        stamp.dateTime = item.recordedAt || "";
        stamp.textContent = item.time;

        const subject = document.createElement("p");
        subject.className = "subject queue-history-item-subject";
        subject.textContent = item.title;

        const text = document.createElement("p");
        text.className = "preview-text queue-history-item-text";
        text.textContent = item.detail;

        const meta = document.createElement("div");
        meta.className = "queue-history-item-meta";

        const mailbox = document.createElement("span");
        mailbox.className = "queue-history-pill queue-history-pill--mailbox";
        mailbox.textContent = item.mailboxLabel;

        const direction = document.createElement("span");
        direction.className = "queue-history-pill queue-history-pill--direction";
        direction.textContent = item.direction;

        meta.append(mailbox, direction);
        head.append(heading, stamp);
        body.append(head, subject, text, meta);
        article.append(avatar, body);
        queueHistoryList.appendChild(article);
      });
    }

    function renderQueueHistorySection() {
      if (!queueHistoryPanel || !queueHistoryToggle) return;
      const setQueueHistoryMeta = (text = "") => {
        if (queueHistoryMeta) {
          queueHistoryMeta.textContent = text;
        }
        if (queueHistoryHead) {
          queueHistoryHead.hidden = !text;
        }
      };
      const historyState = state.runtime.queueHistory;
      const isOpen = Boolean(historyState.open);
      queueHistoryToggle.classList.toggle("is-active", isOpen);
      queueHistoryToggle.setAttribute("aria-expanded", String(isOpen));
      queueHistoryPanel.hidden = !isOpen;
      queueHistoryPanel.classList.toggle("is-open", isOpen);
      if (queuePrimaryLaneTag) queuePrimaryLaneTag.hidden = isOpen;
      if (queueContent) queueContent.hidden = isOpen;
      if (queueCollapsedList) queueCollapsedList.hidden = isOpen;

      if (queueHistoryCount) {
        const visibleCount = asArray(historyState.items).length;
        queueHistoryCount.textContent = String(visibleCount);
      }

      if (queueTitle && isOpen) {
        queueTitle.textContent = `Historik (${asArray(historyState.items).length})`;
      }

      if (!isOpen) return;

      if (historyState.loading) {
        setQueueHistoryMeta("Laddar äldre mejl…");
        renderQueueHistoryList([]);
        if (queueHistoryList) {
          queueHistoryList.innerHTML = '<div class="queue-history-empty">Laddar historik…</div>';
        }
        if (queueHistoryLoadMoreButton) queueHistoryLoadMoreButton.hidden = true;
        return;
      }

      if (historyState.error) {
        setQueueHistoryMeta("Historiken kunde inte laddas just nu.");
        if (queueHistoryList) {
          queueHistoryList.innerHTML = `<div class="queue-history-empty">${escapeHtml(
            historyState.error
          )}</div>`;
        }
        if (queueHistoryLoadMoreButton) queueHistoryLoadMoreButton.hidden = true;
        return;
      }

      setQueueHistoryMeta("");

      if (!asArray(historyState.items).length) {
        if (queueHistoryList) {
          queueHistoryList.innerHTML =
            '<div class="queue-history-empty">Ingen historik hittades i valt mailboxscope ännu.</div>';
        }
        if (queueHistoryLoadMoreButton) queueHistoryLoadMoreButton.hidden = true;
        return;
      }

      renderQueueHistoryList(historyState.items);
      if (queueHistoryLoadMoreButton) {
        queueHistoryLoadMoreButton.hidden = !historyState.hasMore;
      }
    }

    function renderMailFeedUndoState() {
      const pending = state.pendingMailFeedDelete;
      mailFeedUndoButtons.forEach((button) => {
        const isActive =
          pending.active &&
          normalizeKey(button.dataset.mailFeedUndo) === normalizeKey(pending.feed) &&
          !pending.committing;
        button.hidden = !isActive;
        button.disabled = pending.committing;
      });
    }

    function formatMailFeedResumeValue(value) {
      const iso = toIso(value);
      if (!iso) return "Ingen tid satt";
      return new windowObject.Intl.DateTimeFormat("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    }

    function getMailFeedRuntimeThreads(feedKey) {
      const normalizedFeed = normalizeKey(feedKey);
      const scopedThreads = getMailboxScopedRuntimeThreads();
      if (normalizedFeed === "later") {
        return scopedThreads.filter(isLaterRuntimeThread);
      }
      if (normalizedFeed === "sent") {
        return scopedThreads.filter(isSentRuntimeThread);
      }
      return [];
    }

    function getSelectedMailFeedThread(feedKey) {
      const threads = getMailFeedRuntimeThreads(feedKey);
      if (!threads.length) return null;
      const selectedKey = normalizeKey(state.selectedMailFeedKey[normalizeKey(feedKey)]);
      return threads.find((thread) => normalizeKey(thread.id) === selectedKey) || threads[0] || null;
    }

    function updateMailFeedMetrics(feedKey, threads) {
      const normalizedFeed = normalizeKey(feedKey);
      if (normalizedFeed === "later") {
        if (laterMetricValueNodes.count) {
          laterMetricValueNodes.count.textContent = String(threads.length);
        }
        if (laterMetricValueNodes.vip) {
          laterMetricValueNodes.vip.textContent = String(threads.filter((thread) => thread.isVIP).length);
        }
        const nextResumeIso = threads
          .map((thread) => toIso(thread?.raw?.followUpDueAt || thread?.raw?.followUpSuggestedAt || ""))
          .filter(Boolean)
          .sort()[0];
        if (laterMetricValueNodes.resume) {
          laterMetricValueNodes.resume.textContent = formatMailFeedResumeValue(nextResumeIso);
        }
        return;
      }
      if (normalizedFeed === "sent") {
        if (sentMetricValueNodes.count) {
          sentMetricValueNodes.count.textContent = String(threads.length);
        }
        if (sentMetricValueNodes.vip) {
          sentMetricValueNodes.vip.textContent = String(threads.filter((thread) => thread.isVIP).length);
        }
        if (sentMetricValueNodes.scope) {
          sentMetricValueNodes.scope.textContent = String(
            getSelectedRuntimeMailboxScopeIds().length || getAvailableRuntimeMailboxes().length || 0
          );
        }
      }
    }

    function getMailFeedItems(feedKey) {
      const normalizedFeed = normalizeKey(feedKey);
      const useRuntimeFeed =
        state.runtime.live || state.runtime.authRequired || Boolean(state.runtime.error);
      if (!useRuntimeFeed) {
        return (MAIL_FEEDS[normalizedFeed] || []).map((item) => ({
          ...item,
          ownerLabel: "Oägd",
          statusLabel: normalizedFeed === "later" ? "Parkerad" : "Skickad",
          waitingLabel: normalizedFeed === "later" ? "Ägaråtgärd" : "Inväntar svar",
          nextActionLabel: normalizedFeed === "later" ? "Återuppta senare" : "Öppna historik",
          lifecycleLabel: normalizedFeed === "later" ? "Vänteläge" : "Skickat spår",
          riskLabel: normalizedFeed === "later" ? "Bevaka" : "Låg risk",
          followUpLabel: normalizedFeed === "later" ? item.meta : "",
          isVIP: /vip/i.test(asText(item.title)) || /vip/i.test(asText(item.preview)),
          requiresAttention: normalizedFeed === "later",
          historyLabel: normalizedFeed === "sent" ? "1 händelse" : "0 händelser",
        }));
      }

      const threads = getMailFeedRuntimeThreads(normalizedFeed);
      updateMailFeedMetrics(normalizedFeed, threads);

      return threads.map((thread) => ({
        key: thread.id,
        id: thread.id,
        mailbox: thread.mailboxLabel,
        customerName: thread.customerName,
        meta:
          normalizedFeed === "later"
            ? thread.followUpLabel || thread.nextActionLabel
            : thread.lastActivityLabel,
        title: thread.subject,
        preview:
          normalizedFeed === "later"
            ? compactRuntimeCopy(
                thread.nextActionSummary || thread.whyInFocus,
                "Återuppta tråden vid rätt tidpunkt.",
                132
              )
            : compactRuntimeCopy(
                thread.preview || thread.nextActionSummary,
                "Skickat innehåll finns i historiken.",
                132
              ),
        ownerLabel: thread.ownerLabel,
        statusLabel: thread.statusLabel,
        waitingLabel: thread.waitingLabel,
        nextActionLabel: thread.nextActionLabel,
        lifecycleLabel: thread.lifecycleLabel,
        riskLabel: thread.riskLabel,
        followUpLabel: thread.followUpLabel,
        isVIP: thread.isVIP,
        requiresAttention:
          normalizedFeed === "later" ||
          normalizeKey(thread.riskLabel) === "hög risk" ||
          normalizeKey(thread.riskLabel) === "miss" ||
          normalizeKey(thread.statusLabel).includes("åtgärd"),
        historyLabel: `${Math.max(1, asArray(thread.historyEvents).length)} händelser`,
      }));
    }

    function getMailFeedEmptyState(feedKey) {
      const normalizedFeed = normalizeKey(feedKey);
      const mailboxScopeCount =
        getSelectedRuntimeMailboxScopeIds().length || getAvailableRuntimeMailboxes().length || 0;
      if (state.runtime.authRequired) {
        return {
          label: normalizedFeed === "later" ? "Senare" : "Skickade",
          title: "Inloggning krävs",
          meta: "CCO runtime",
          copy: "Logga in igen i admin för att läsa live-data i denna vy.",
          scope: `${mailboxScopeCount} mailboxar`,
          context: "Åtkomst krävs",
          hint: "Öppna admin och logga in igen.",
        };
      }
      if (state.runtime.error && !state.runtime.live) {
        return {
          label: normalizedFeed === "later" ? "Senare" : "Skickade",
          title: "Live runtime saknas",
          meta: "CCO runtime",
          copy: state.runtime.error,
          scope: `${mailboxScopeCount} mailboxar`,
          context: "Otillgänglig",
          hint: "Försök igen när live runtime är tillbaka.",
        };
      }
      return {
        label: normalizedFeed === "later" ? "Senare" : "Skickade",
        title:
          normalizedFeed === "later"
            ? "Det finns inga trådar i Senare just nu"
            : "Det finns inga skickade trådar i valt scope",
        meta: "Tom vy",
        copy:
          normalizedFeed === "later"
            ? "Snoozade eller parkerade konversationer dyker upp här när de lämnar arbetskön."
            : "Skickade trådar visas här när senaste aktiviteten i scope kommer från CCO.",
        scope: `${mailboxScopeCount} mailboxar`,
        context: "Live scope",
        hint:
          normalizedFeed === "later"
            ? "Ändra mailboxscope eller svara senare i studion för att fylla vyn."
            : "Ändra mailboxscope eller skicka från studion för att fylla vyn.",
      };
    }

    function renderMailFeeds() {
      mailFeedFilterButtons.forEach((button) => {
        const feedKey = normalizeKey(button.dataset.mailFeedFilter);
        const isActive =
          normalizeKey(button.dataset.mailFeedFilterValue) === getMailFeedRuntimeState(feedKey).filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      mailFeedViewButtons.forEach((button) => {
        const feedKey = normalizeKey(button.dataset.mailFeedView);
        const isActive =
          normalizeKey(button.dataset.mailFeedViewValue) === getMailFeedRuntimeState(feedKey).view;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      mailFeedDensityButtons.forEach((button) => {
        const feedKey = normalizeKey(button.dataset.mailFeedDensity);
        const isActive =
          normalizeKey(button.dataset.mailFeedDensityValue) ===
          getMailFeedRuntimeState(feedKey).density;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      mailFeedLists.forEach((container) => {
        const feedKey = normalizeKey(container.dataset.mailFeedList);
        const runtime = getMailFeedRuntimeState(feedKey);
        const allItems = getMailFeedItems(feedKey);
        const items = getFilteredMailFeedItems(feedKey);
        const availableSelectionKeys = new Set(
          allItems.map((item) => normalizeKey(item.key)).filter(Boolean)
        );
        runtime.selectedKeys = getMailFeedSelectedKeys(feedKey).filter((key) =>
          availableSelectionKeys.has(normalizeKey(key))
        );
        container.dataset.mailFeedView = runtime.view;
        container.dataset.mailFeedDensity = runtime.density;
        container.classList.toggle("is-list-view", runtime.view === "list");
        container.innerHTML = "";
        const selectionCountNode = mailFeedSelectionCountNodes.find(
          (node) => normalizeKey(node.dataset.mailFeedSelectionCount) === feedKey
        );
        if (selectionCountNode) {
          selectionCountNode.textContent = `${runtime.selectedKeys.length} markerade`;
        }
        const selectAllButton = mailFeedSelectAllButtons.find(
          (button) => normalizeKey(button.dataset.mailFeedSelectAll) === feedKey
        );
        if (selectAllButton) {
          const visibleKeys = items.map((item) => normalizeKey(item.key)).filter(Boolean);
          const allVisibleSelected =
            visibleKeys.length > 0 && visibleKeys.every((key) => runtime.selectedKeys.includes(key));
          selectAllButton.textContent =
            allVisibleSelected && visibleKeys.length ? "Avmarkera alla" : "Markera alla";
        }
        mailFeedBulkButtons
          .filter((button) => normalizeKey(button.dataset.mailFeedBulk) === feedKey)
          .forEach((button) => {
            button.disabled = runtime.selectedKeys.length === 0;
          });
        if (!items.length) {
          const emptyCard = document.createElement("article");
          emptyCard.className = "mail-feed-card";
          const emptyState = getMailFeedEmptyState(feedKey);
          emptyCard.innerHTML =
            `<span class="mail-feed-card-label">${escapeHtml(emptyState.label)}</span>` +
            `<div class="mail-feed-card-head"><strong>${escapeHtml(emptyState.title)}</strong><span>${escapeHtml(emptyState.meta)}</span></div>` +
            `<p>${escapeHtml(emptyState.copy)}</p>` +
            `<div class="mail-feed-meta-row"><span>${escapeHtml(emptyState.scope)}</span><span>${escapeHtml(emptyState.context)}</span></div>` +
            `<div class="mail-feed-card-foot"><span>${escapeHtml(emptyState.hint)}</span></div>`;
          container.append(emptyCard);
          return;
        }

        const selectedKey = normalizeKey(state.selectedMailFeedKey[feedKey]);
        if (!items.some((item) => normalizeKey(item.key) === selectedKey)) {
          state.selectedMailFeedKey[feedKey] = items[0]?.key || "";
        }

        items.forEach((item) => {
          const card = document.createElement("article");
          card.className = "mail-feed-card";
          if (runtime.density === "compact") {
            card.classList.add("is-compact");
          }
          if (item.requiresAttention) {
            card.classList.add("is-attention");
          }
          card.dataset.mailFeedItem = feedKey;
          card.dataset.mailFeedKey = item.key;
          const isPrimarySelected = state.selectedMailFeedKey[feedKey] === item.key;
          const isBatchSelected = runtime.selectedKeys.includes(normalizeKey(item.key));
          card.classList.toggle("is-selected", isPrimarySelected);
          card.classList.toggle("is-batch-selected", isBatchSelected);
          card.innerHTML =
            `<div class="mail-feed-card-topline"><label class="mail-feed-card-selection"><input type="checkbox" data-mail-feed-select="${escapeHtml(feedKey)}" data-mail-feed-select-key="${escapeHtml(item.key)}"${isBatchSelected ? " checked" : ""} /><span>Välj</span></label><span class="mail-feed-card-label">${escapeHtml(item.mailbox)}</span><span class="mail-feed-card-stamp">${escapeHtml(item.meta)}</span></div>` +
            `<div class="mail-feed-card-head"><strong>${escapeHtml(item.customerName)}</strong><span>${escapeHtml(item.title)}</span></div>` +
            `<p>${escapeHtml(item.preview)}</p>` +
            `<div class="mail-feed-card-detail-grid"><span><strong>Ägare</strong>${escapeHtml(item.ownerLabel || "Oägd")}</span><span><strong>Status</strong>${escapeHtml(item.statusLabel || "-")}</span><span><strong>Väntar på</strong>${escapeHtml(item.waitingLabel || "-")}</span><span><strong>Nästa steg</strong>${escapeHtml(item.nextActionLabel || "-")}</span><span><strong>Historik</strong>${escapeHtml(item.historyLabel || "0 händelser")}</span></div>` +
            `<div class="mail-feed-meta-row"><span>${escapeHtml(item.mailbox)}</span><span>${escapeHtml(item.customerName)}</span><span>${escapeHtml(item.lifecycleLabel || "-")}</span><span>${escapeHtml(item.riskLabel || "-")}</span>${item.isVIP ? "<span>VIP</span>" : ""}${item.followUpLabel ? `<span>${escapeHtml(item.followUpLabel)}</span>` : ""}</div>` +
            `<div class="mail-feed-card-foot"><span>${escapeHtml(item.meta || item.waitingLabel || item.preview)}</span><button type="button" data-mail-feed-open="${escapeHtml(feedKey)}">${escapeHtml(feedKey === "later" ? "Återuppta" : "Öppna historik")}</button></div>`;
          container.append(card);
        });
      });
    }

    return Object.freeze({
      getMailFeedItems,
      getMailFeedRuntimeThreads,
      getSelectedMailFeedThread,
      renderMailFeedUndoState,
      renderMailFeeds,
      renderQueueHistorySection,
      renderRuntimeQueue,
      renderThreadContextRows,
    });
  }

  window.MajorArcanaPreviewQueueRenderers = Object.freeze({
    createQueueRenderers,
  });
})();
