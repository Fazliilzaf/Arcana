(() => {
  function createAsyncOrchestration({
    dom = {},
    helpers = {},
    refs = {},
    state,
    windowObject = window,
  }) {
    const fetchImpl =
      typeof windowObject.fetch === "function" ? windowObject.fetch.bind(windowObject) : fetch;

    const {
      focusHistoryMeta,
      focusStatusLine,
      noteFeedback,
      noteSaveButton,
      scheduleFeedback,
      scheduleSaveButton,
      scheduleCategorySelect,
      scheduleCustomerInput,
      scheduleDateInput,
      scheduleDoctorSelect,
      scheduleNotesTextarea,
      scheduleReminderSelect,
      scheduleTimeInput,
      studioDeleteButton,
      studioComposeSubjectInput,
      studioComposeToInput,
      studioEditorInput,
      studioSaveDraftButton,
      targetLabel,
    } = dom;

    const {
      apiRequest,
      asArray,
      asText,
      buildRuntimeScheduleDraft,
      buildRuntimeSummaryCards,
      createIdempotencyKey,
      createNoteDraft,
      createScheduleDraft,
      ensureRuntimeSelection,
      ensureStudioState,
      formatDueLabel,
      getActiveNoteDraft,
      getAdminToken,
      getRuntimeCustomerEmail,
      getSelectedRuntimeThread,
      getStudioSenderMailboxId,
      getStudioSignatureProfile,
      getStudioSourceMailboxId,
      loadBootstrapFeedback,
      mapPriorityValue,
      mapVisibilityValue,
      normalizeKey,
      normalizeStudioBusyState,
      normalizeText,
      patchStudioThreadAfterSend,
      refreshWorkspaceBootstrapForSelectedThread,
      renderFocusHistorySection,
      renderFocusNotesSection,
      renderNoteDestination,
      renderRuntimeConversationShell,
      renderScheduleDraft,
      renderTemplateButtons,
      setButtonBusy,
      setContextCollapsed,
      setFeedback,
      setStudioFeedback,
      setStudioOpen,
      suggestHandledOutcome,
      toIso,
      updateRuntimeThread,
      workspaceState,
      DEFAULT_WORKSPACE,
      normalizeWorkspaceState,
      applyReplyLaterToThread,
      applyHandledToThread,
    } = helpers;

    function parseComposeRecipients(value = "") {
      return String(value || "")
        .split(/[;,]/)
        .map((item) => normalizeText(item).toLowerCase())
        .filter(Boolean)
        .slice(0, 20);
    }

    function loadBootstrap({
      preserveActiveDestination = true,
      applyWorkspacePrefs = false,
      quiet = false,
    } = {}) {
      if (refs.bootstrapPromise) {
        return refs.bootstrapPromise;
      }

      if (!quiet) {
        loadBootstrapFeedback("loading");
      }

      refs.bootstrapPromise = Promise.all([
        apiRequest("/api/v1/cco-workspace/bootstrap"),
        apiRequest("/api/v1/cco-workspace/follow-ups").catch(() => ({ followUps: [] })),
      ])
        .then(([payload, followUpPayload]) => {
          state.bootstrapped = true;
          state.bootstrapError = "";

          state.noteTemplates = Array.isArray(payload.noteTemplates) ? payload.noteTemplates : [];
          state.noteTemplatesByKey = Object.fromEntries(
            state.noteTemplates.map((template) => [normalizeKey(template.key), template])
          );
          state.noteDefinitions = payload.noteDefinitions || {};
          state.noteVisibilityRules = payload.visibilityRules || {};
          state.activity.notes = Array.isArray(payload.savedNotes) ? payload.savedNotes : [];
          state.activity.followUps = Array.isArray(followUpPayload?.followUps)
            ? followUpPayload.followUps
            : [];
          state.schedule.options = payload.scheduleOptions || {
            doctors: [],
            categories: [],
            reminders: [],
          };
          state.schedule.draft = createScheduleDraft(payload.scheduleDraft);

          const nextDrafts = {};
          for (const [key, definition] of Object.entries(state.noteDefinitions)) {
            nextDrafts[key] = createNoteDraft(definition);
          }
          state.note.drafts = nextDrafts;

          const requestedActiveKey =
            preserveActiveDestination && state.noteDefinitions[state.note.activeKey]
              ? state.note.activeKey
              : Object.keys(state.noteDefinitions)[0] || "konversation";

          renderTemplateButtons();
          renderNoteDestination(requestedActiveKey);
          renderScheduleDraft();
          renderFocusHistorySection(getSelectedRuntimeThread());
          renderFocusNotesSection();

          if (applyWorkspacePrefs) {
            workspaceState.left =
              Number.parseInt(
                String(payload.workspacePrefs?.leftWidth ?? DEFAULT_WORKSPACE.left),
                10
              ) || DEFAULT_WORKSPACE.left;
            workspaceState.right =
              Number.parseInt(
                String(payload.workspacePrefs?.rightWidth ?? DEFAULT_WORKSPACE.right),
                10
              ) || DEFAULT_WORKSPACE.right;
            normalizeWorkspaceState();
            state.workspacePrefsApplied = true;
          }

          if (!quiet) {
            loadBootstrapFeedback("idle");
          }

          return payload;
        })
        .catch((error) => {
          state.bootstrapError = error.message;
          loadBootstrapFeedback("error", error.message);
          throw error;
        })
        .finally(() => {
          refs.bootstrapPromise = null;
        });

      return refs.bootstrapPromise;
    }

    async function persistWorkspacePrefs() {
      if (!state.bootstrapped) return;
      try {
        await apiRequest("/api/v1/cco-workspace/preferences", {
          method: "PUT",
          body: {
            leftWidth: workspaceState.left,
            rightWidth: workspaceState.right,
          },
        });
      } catch (error) {
        console.warn("Kunde inte spara workspace-preferenser.", error);
      }
    }

    function scheduleWorkspacePrefsSave() {
      windowObject.clearTimeout(refs.persistPrefsTimer);
      refs.persistPrefsTimer = windowObject.setTimeout(() => {
        persistWorkspacePrefs();
      }, 120);
    }

    async function resetWorkspacePrefs() {
      try {
        await apiRequest("/api/v1/cco-workspace/preferences", {
          method: "DELETE",
        });
      } catch (error) {
        console.warn("Kunde inte återställa workspace-preferenser.", error);
      }

      workspaceState.left = DEFAULT_WORKSPACE.left;
      workspaceState.right = DEFAULT_WORKSPACE.right;
      normalizeWorkspaceState();
    }

    function collectScheduleDraftFromForm() {
      const reminderLabel = normalizeText(scheduleReminderSelect?.value) || "2 timmar innan";
      const reminderOption = (state.schedule.options?.reminders || []).find(
        (item) => item.label === reminderLabel
      );

      state.schedule.draft = buildRuntimeScheduleDraft({
        customerName: scheduleCustomerInput?.value,
        date: scheduleDateInput?.value,
        time: scheduleTimeInput?.value,
        doctorName: scheduleDoctorSelect?.value,
        category: scheduleCategorySelect?.value,
        reminderLeadMinutes: reminderOption?.minutes || 120,
        reminderLabel,
        notes: scheduleNotesTextarea?.value,
        recommendations: state.schedule.draft?.recommendations || {},
        linkedItems: state.schedule.draft?.linkedItems || [],
      });

      return state.schedule.draft;
    }

    function conflictMessageFrom(metadata) {
      const conflict = metadata?.conflict;
      if (!conflict) {
        return "Tiden krockar med en befintlig uppföljning.";
      }
      return `Tiden krockar med ${conflict.customerName || "en annan kund"} hos ${conflict.doctorName}.`;
    }

    async function saveNote() {
      const activeKey = normalizeText(state.note.activeKey).toLowerCase();
      const draft = getActiveNoteDraft();
      if (!activeKey || !draft) return;

      state.note.saving = true;
      setButtonBusy(noteSaveButton, true, "Spara anteckning", "Sparar…");
      setFeedback(noteFeedback, "loading", "Sparar anteckning…");

      try {
        await apiRequest("/api/v1/cco-workspace/notes/validate-visibility", {
          method: "POST",
          body: {
            destinationKey: activeKey,
            visibility: mapVisibilityValue(draft.visibility),
          },
        });

        const payload = await apiRequest("/api/v1/cco-workspace/notes", {
          method: "POST",
          body: {
            destinationKey: activeKey,
            destinationLabel: targetLabel?.textContent,
            text: draft.text,
            tags: draft.tags,
            priority: mapPriorityValue(draft.priority),
            visibility: mapVisibilityValue(draft.visibility),
            templateKey: draft.templateKey,
          },
        });

        setFeedback(noteFeedback, "success", payload.message || "Anteckningen sparades.");
        await loadBootstrap({
          preserveActiveDestination: true,
          applyWorkspacePrefs: false,
          quiet: true,
        });
        renderNoteDestination(activeKey);
      } catch (error) {
        setFeedback(noteFeedback, "error", error.message || "Kunde inte spara anteckning.");
      } finally {
        state.note.saving = false;
        setButtonBusy(noteSaveButton, false, "Spara anteckning", "Sparar…");
      }
    }

    async function saveSchedule() {
      const draft = collectScheduleDraftFromForm();
      if (!draft) return;

      state.schedule.saving = true;
      setButtonBusy(scheduleSaveButton, true, "Schemalägg uppföljning", "Schemalägger…");
      setFeedback(scheduleFeedback, "loading", "Schemalägger uppföljning…");

      try {
        const validation = await apiRequest("/api/v1/cco-workspace/follow-ups/validate-conflict", {
          method: "POST",
          body: {
            date: draft.date,
            time: draft.time,
            doctorName: draft.doctorName,
          },
        });

        if (!validation.ok) {
          throw new Error(conflictMessageFrom({ conflict: validation.conflict }));
        }

        const payload = await apiRequest("/api/v1/cco-workspace/follow-ups", {
          method: "POST",
          body: {
            date: draft.date,
            time: draft.time,
            doctorName: draft.doctorName,
            category: draft.category,
            reminderLeadMinutes: draft.reminderLeadMinutes,
            notes: draft.notes,
          },
        });

        state.schedule.draft = createScheduleDraft(payload.scheduleDraft || payload.followUp || draft);
        renderScheduleDraft();
        setFeedback(
          scheduleFeedback,
          "success",
          payload.message || "Uppföljningen schemalades."
        );
        await loadBootstrap({
          preserveActiveDestination: true,
          applyWorkspacePrefs: false,
          quiet: true,
        });
        const selectedThread = getSelectedRuntimeThread();
        if (selectedThread) {
          const followUpIso = toIso(
            payload?.followUp?.scheduledForIso || `${draft.date}T${draft.time}:00.000Z`
          );
          updateRuntimeThread(selectedThread.id, (current) => {
            const nextActionSummary = `Uppföljning schemalagd ${draft.date} ${draft.time} hos ${draft.doctorName}.`;
            current.followUpLabel = formatDueLabel(followUpIso);
            current.waitingLabel = "Ägaråtgärd";
            current.statusLabel = "Parkerad";
            current.nextActionLabel = "Återuppta senare";
            current.nextActionSummary = nextActionSummary;
            current.tags = Array.from(
              new Set(
                asArray(current.tags).concat(["followup", "later"]).filter((tag) => tag !== "act-now")
              )
            );
            current.raw = {
              ...current.raw,
              followUpDueAt: followUpIso,
              followUpSuggestedAt: followUpIso,
              nextActionLabel: "Återuppta senare",
              nextActionSummary,
              lastActionTakenLabel: "Uppföljning schemalagd",
              lastActionTakenAt: new Date().toISOString(),
            };
            current.cards = buildRuntimeSummaryCards(current.raw, current);
            return current;
          });
        }
        await refreshWorkspaceBootstrapForSelectedThread("follow-up save");
      } catch (error) {
        const message =
          Number(error.statusCode) === 409 && error.metadata
            ? conflictMessageFrom(error.metadata)
            : error.message || "Kunde inte schemalägga uppföljning.";
        setFeedback(scheduleFeedback, "error", message);
      } finally {
        state.schedule.saving = false;
        setButtonBusy(scheduleSaveButton, false, "Schemalägg uppföljning", "Schemalägger…");
      }
    }

    function buildStudioPreviewUrl(thread, draftBody, signatureId) {
      const params = new URLSearchParams();
      const selectedProfile = getStudioSignatureProfile(signatureId);
      params.set("profile", selectedProfile.id);
      params.set("senderMailboxId", asText(getStudioSenderMailboxId(selectedProfile.id, thread)));
      params.set("body", String(draftBody || ""));
      return `/api/v1/cco/signature-preview?${params.toString()}`;
    }

    async function handleStudioPreview() {
      const thread = getSelectedRuntimeThread();
      const isComposeMode = normalizeKey(state.studio.mode) === "compose";
      const studioState = isComposeMode ? state.studio : thread ? ensureStudioState(thread) : null;
      if (!studioState) return;
      try {
        const authToken = getAdminToken();
        const response = await fetchImpl(
          buildStudioPreviewUrl(thread, studioState.draftBody, studioState.selectedSignatureId),
          {
            method: "GET",
            credentials: "same-origin",
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          }
        );
        const html = await response.text();
        if (!response.ok) {
          throw new Error("Kunde inte läsa signaturförhandsvisningen.");
        }
        const previewWindow = windowObject.open("", "_blank", "noopener");
        if (!previewWindow) {
          throw new Error("Förhandsvisningen blockerades av webbläsaren.");
        }
        previewWindow.document.open();
        previewWindow.document.write(html);
        previewWindow.document.close();
        setStudioFeedback("Förhandsvisningen öppnades i ett nytt fönster.", "success");
      } catch (error) {
        setStudioFeedback(error.message || "Kunde inte öppna förhandsvisningen.", "error");
      }
    }

    async function handleStudioSaveDraft() {
      const thread = getSelectedRuntimeThread();
      const isComposeMode = normalizeKey(state.studio.mode) === "compose";
      const studioState = isComposeMode ? state.studio : thread ? ensureStudioState(thread) : null;
      if (!studioState) return;
      studioState.savingDraft = true;
      normalizeStudioBusyState();
      setButtonBusy(studioSaveDraftButton, true, "Spara utkast", "Sparar…");
      try {
        if (isComposeMode) {
          studioState.baseDraftBody = studioState.draftBody;
          setStudioFeedback("Compose-utkastet sparades lokalt i studion.", "success");
          return;
        }
        updateRuntimeThread(thread.id, (current) => {
          current.raw = {
            ...current.raw,
            previewDraftBody: studioState.draftBody,
            lastActionTakenLabel: "Utkast sparat",
            lastActionTakenAt: new Date().toISOString(),
          };
          return current;
        });
        studioState.baseDraftBody = studioState.draftBody;
        setStudioFeedback("Utkastet sparades i nya CCO.", "success");
        setStudioOpen(false);
        setContextCollapsed(false);
      } finally {
        studioState.savingDraft = false;
        setButtonBusy(studioSaveDraftButton, false, "Spara utkast", "Sparar…");
        normalizeStudioBusyState();
      }
    }

    async function handleStudioReplyLater(label) {
      const thread = getSelectedRuntimeThread();
      const studioState = thread ? ensureStudioState(thread) : null;
      if (!thread || !studioState) return;
      applyReplyLaterToThread(thread, label, { closeStudio: true });
    }

    async function handleStudioMarkHandled() {
      const thread = getSelectedRuntimeThread();
      const studioState = thread ? ensureStudioState(thread) : null;
      if (!thread || !studioState) return;
      const outcome = suggestHandledOutcome(thread, studioState);
      applyHandledToThread(thread, outcome, { closeStudio: true });
    }

    async function deleteRuntimeThread(thread, idempotencyScope = "major-arcana-delete") {
      if (!thread) return false;
      await apiRequest("/api/v1/cco/delete", {
        method: "POST",
        headers: {
          "x-idempotency-key": createIdempotencyKey(idempotencyScope),
        },
        body: {
          channel: "admin",
          mailboxId: asText(thread.mailboxAddress),
          messageId: asText(thread.raw?.messageId),
          conversationId: thread.id,
          softDelete: true,
        },
      });
      state.runtime.threads = state.runtime.threads.filter((item) => item.id !== thread.id);
      ensureRuntimeSelection();
      renderRuntimeConversationShell();
      await refreshWorkspaceBootstrapForSelectedThread("delete");
      return true;
    }

    async function handleStudioDelete() {
      const thread = getSelectedRuntimeThread();
      const studioState = thread ? ensureStudioState(thread) : null;
      if (!thread || !studioState) return;
      studioState.deleting = true;
      normalizeStudioBusyState();
      setButtonBusy(studioDeleteButton, true, "Radera", "Raderar…");
      try {
        await deleteRuntimeThread(thread, "major-arcana-delete");
        setStudioFeedback("Tråden flyttades till papperskorgen.", "success");
        setStudioOpen(false);
        setContextCollapsed(false);
      } catch (error) {
        setStudioFeedback(error.message || "Kunde inte radera tråden.", "error");
      } finally {
        studioState.deleting = false;
        setButtonBusy(studioDeleteButton, false, "Radera", "Raderar…");
        normalizeStudioBusyState();
      }
    }

    async function handleRuntimeDeleteAction(idempotencyScope = "major-arcana-delete") {
      const thread = getSelectedRuntimeThread();
      if (!thread || !state.runtime.deleteEnabled || asText(state.runtime.deletingThreadId)) return;
      state.runtime.deletingThreadId = asText(thread.id);
      renderRuntimeConversationShell();
      try {
        await deleteRuntimeThread(thread, idempotencyScope);
        if (focusStatusLine) {
          focusStatusLine.textContent = "Tråden flyttades till papperskorgen.";
        }
      } catch (error) {
        if (focusStatusLine) {
          focusStatusLine.textContent = error.message || "Kunde inte radera tråden.";
        }
      } finally {
        state.runtime.deletingThreadId = "";
        renderRuntimeConversationShell();
      }
    }

    async function handleRuntimeHandledAction() {
      const thread = getSelectedRuntimeThread();
      if (!thread) return;
      const studioState = ensureStudioState(thread);
      const outcome = suggestHandledOutcome(thread, studioState);
      applyHandledToThread(thread, outcome, { closeStudio: false });
    }

    async function handleFocusHistoryDelete() {
      const thread = getSelectedRuntimeThread();
      if (!thread || state.runtime.historyDeleting) return;
      state.runtime.historyDeleting = true;
      renderFocusHistorySection(thread);
      try {
        await deleteRuntimeThread(thread, "major-arcana-focus-delete");
      } catch (error) {
        const activeThread = getSelectedRuntimeThread();
        state.runtime.historyDeleting = false;
        if (focusHistoryMeta) {
          focusHistoryMeta.textContent = error.message || "Kunde inte radera tråden.";
        }
        renderFocusHistorySection(activeThread);
        return;
      }
      state.runtime.historyDeleting = false;
      renderFocusHistorySection(getSelectedRuntimeThread());
    }

    async function handleStudioSend() {
      const thread = getSelectedRuntimeThread();
      const isComposeMode = normalizeKey(state.studio.mode) === "compose";
      const studioState = isComposeMode ? state.studio : thread ? ensureStudioState(thread) : null;
      if (!studioState) return;
      if (!normalizeText(studioState.draftBody)) {
        setStudioFeedback("Utkastet är tomt. Skriv ett svar innan du skickar.", "error");
        return;
      }
      const composeRecipients = isComposeMode ? parseComposeRecipients(studioState.composeTo) : [];
      if (isComposeMode && !composeRecipients.length) {
        setStudioFeedback("Fyll i minst en giltig mottagare innan du skickar.", "error");
        return;
      }
      if (isComposeMode && !normalizeText(studioState.composeSubject)) {
        setStudioFeedback("Skriv en ämnesrad innan du skickar mejlet.", "error");
        return;
      }
      studioState.sending = true;
      normalizeStudioBusyState();
      try {
        await apiRequest("/api/v1/cco/send", {
          method: "POST",
          headers: {
            "x-idempotency-key": createIdempotencyKey(
              isComposeMode ? "major-arcana-compose-send" : "major-arcana-send"
            ),
          },
          body: {
            channel: "admin",
            mode: isComposeMode ? "compose" : "reply",
            mailboxId: isComposeMode
              ? asText(studioState.composeMailboxId || getStudioSourceMailboxId(thread))
              : asText(thread.mailboxAddress),
            sourceMailboxId: isComposeMode
              ? asText(studioState.composeMailboxId || getStudioSourceMailboxId(thread))
              : asText(thread.mailboxAddress),
            senderMailboxId: asText(getStudioSenderMailboxId(studioState.selectedSignatureId, thread)),
            signatureProfile: getStudioSignatureProfile(studioState.selectedSignatureId).id,
            replyToMessageId: isComposeMode ? "" : asText(thread.raw?.messageId),
            conversationId: isComposeMode ? "" : thread.id,
            to: isComposeMode
              ? composeRecipients
              : (() => {
                  const customerEmail = getRuntimeCustomerEmail(thread);
                  return customerEmail ? [customerEmail] : [];
                })(),
            subject: isComposeMode ? normalizeText(studioState.composeSubject) : asText(thread.subject),
            body: studioState.draftBody,
          },
        });
        if (isComposeMode) {
          studioState.baseDraftBody = "";
          studioState.draftBody = "";
          studioState.composeSubject = "";
          if (studioComposeSubjectInput) {
            studioComposeSubjectInput.value = "";
          }
          if (studioEditorInput) {
            studioEditorInput.value = "";
          }
          setStudioFeedback("Nytt mejl skickat från nya CCO.", "success");
          if (studioComposeToInput) {
            studioComposeToInput.focus();
          }
          normalizeStudioBusyState();
          return;
        }
        patchStudioThreadAfterSend(thread, studioState.draftBody);
        setStudioFeedback("Svar skickat från nya CCO.", "success");
        setStudioOpen(false);
        setContextCollapsed(false);
      } catch (error) {
        setStudioFeedback(error.message || "Kunde inte skicka svaret.", "error");
      } finally {
        studioState.sending = false;
        normalizeStudioBusyState();
      }
    }

    return Object.freeze({
      deleteRuntimeThread,
      handleFocusHistoryDelete,
      handleRuntimeDeleteAction,
      handleRuntimeHandledAction,
      handleStudioDelete,
      handleStudioMarkHandled,
      handleStudioPreview,
      handleStudioReplyLater,
      handleStudioSaveDraft,
      handleStudioSend,
      loadBootstrap,
      resetWorkspacePrefs,
      saveNote,
      saveSchedule,
      scheduleWorkspacePrefsSave,
    });
  }

  window.MajorArcanaPreviewAsyncOrchestration = Object.freeze({
    createAsyncOrchestration,
  });
})();
