(() => {
  function createDomLiveComposition({
    dom = {},
    helpers = {},
    state,
    windowObject = window,
  }) {
    const {
      canvas,
      closeButtons = [],
      contextButtons = [],
      conversationCollapseButton,
      conversationHistory,
      destinationButtons = [],
      focusActionRows = [],
      focusHistorySearchInput,
      focusNotesRefreshButton,
      focusSignalRows = [],
      focusTabButtons = [],
      intelActionRows = [],
      laterCloseButtons = [],
      laterOptionButtons = [],
      mailboxAdminCloseButtons = [],
      mailboxAdminFeedback,
      mailboxAdminList,
      mailboxAdminOpenButton,
      mailboxAdminSaveButton,
      mailboxMenuGrid,
      noteCloseButtons = [],
      noteFeedback,
      noteModeCloseButtons = [],
      noteModeOptionButtons = [],
      noteOpenButtons = [],
      notePrioritySelect,
      noteSaveButton,
      noteTagAddButton,
      noteTagInput,
      noteTagsRow,
      noteText,
      noteVisibilitySelect,
      openButtons = [],
      ownerMenuGrid,
      ownerMenuToggle,
      queueActionRows = [],
      queueCollapsedList,
      queueContent,
      queueHistoryLoadMoreButton,
      queueHistoryToggle,
      queueLaneButtons = [],
      resizeHandles = [],
      scheduleCloseButtons = [],
      scheduleFeedback,
      scheduleOpenButtons = [],
      scheduleSaveButton,
      studioDeleteButton,
      studioDoneActionButton,
      studioComposeSubjectInput,
      studioComposeToInput,
      studioEditorInput,
      studioLaterActionButton,
      studioPreviewButton,
      studioPrimarySuggestion,
      studioRefineButtons = [],
      studioSaveDraftButton,
      studioSendButton,
      studioSignatureButtons = [],
      studioTemplateButtons = [],
      studioToneButtons = [],
      studioToolButtons = [],
      studioTrackButtons = [],
      templateButtons = [],
    } = dom;

    const {
      CCO_DEFAULT_REPLY_SENDER,
      CCO_DEFAULT_SIGNATURE_PROFILE,
      DEFAULT_WORKSPACE,
      FOCUS_ACTIONS = [],
      FOCUS_SIGNALS = [],
      INTEL_ACTIONS = [],
      QUEUE_ACTIONS = [],
      addTagToActiveDraft,
      apiRequest,
      applyFocusSection,
      applyLaterOption,
      applyNoteModePreset,
      applyStudioMode,
      applyStudioRefineSelection,
      applyStudioTemplateSelection,
      applyStudioToneSelection,
      applyStudioTrackSelection,
      applyTemplateToActiveDraft,
      asArray,
      asText,
      buildHistoryReadoutHref,
      buildLiveThreads,
      buildMailboxCatalog,
      buildReauthUrl,
      createIdempotencyKey,
      decorateStaticPills,
      ensureCustomerRuntimeProfilesFromLive,
      ensureRuntimeMailboxSelection,
      ensureRuntimeSelection,
      ensureStudioState,
      getFilteredRuntimeThreads,
      getMailboxScopedRuntimeThreads,
      getOrderedQueueLaneIds,
      getQueueHistoryScopeKey,
      getRequestedRuntimeMailboxIds,
      getSelectedRuntimeThread,
      getStudioSignatureProfile,
      handleFocusHistoryDelete,
      handleMailboxAdminSave,
      handleStudioDelete,
      handleStudioMarkHandled,
      handleStudioPreview,
      handleStudioSaveDraft,
      handleStudioSend,
      handleStudioToolAction,
      inferStudioTrackKey,
      isAuthFailure,
      loadBootstrap,
      loadQueueHistory,
      normalizeKey,
      normalizeMailboxId,
      normalizeCustomMailboxDefinition,
      normalizeText,
      normalizeVisibleRuntimeScope,
      normalizeWorkspaceState,
      openLaterDialog,
      readPxVariable,
      refreshCustomerIdentitySuggestions,
      removeTagFromActiveDraft,
      renderFocusHistorySection,
      renderMailFeeds,
      renderMailFeedUndoState,
      renderMailboxAdminList,
      renderMailboxOptions,
      renderLaterOptions,
      renderNoteDestination,
      renderQuickActionRows,
      renderRuntimeConversationShell,
      renderRuntimeFocusConversation,
      renderQueueHistorySection,
      renderScheduleDraft,
      renderSignalRows,
      renderStudioShell,
      renderTemplateButtons,
      renderThreadContextRows,
      resetRuntimeHistoryFilters,
      resetWorkspacePrefs,
      runtimeActionEngine,
      saveNote,
      saveSchedule,
      scheduleWorkspacePrefsSave,
      setAppView,
      setContextCollapsed,
      setFeedback,
      setLaterOpen,
      setMailboxAdminOpen,
      setNoteModeOpen,
      setNoteOpen,
      setScheduleOpen,
      setStudioFeedback,
      setStudioOpen,
      startResize,
      syncCurrentNoteDraftFromForm,
      syncNoteCount,
      workspaceLimits,
      workspaceSourceOfTruth,
      workspaceState,
    } = helpers;

    let interactionsBound = false;
    let draggedQueueLaneId = "";
    const FULL_MAILBOX_LOOKBACK_DAYS = 1095;

    function setActiveRuntimeLane(laneId) {
      workspaceSourceOfTruth.setActiveLaneId(laneId);
      ensureRuntimeSelection();
      renderRuntimeConversationShell();
      loadBootstrap({
        preserveActiveDestination: true,
        applyWorkspacePrefs: false,
        quiet: true,
      }).catch((error) => {
        console.warn("CCO workspace bootstrap misslyckades efter köbyte.", error);
      });
    }

    function selectRuntimeThread(threadId, { reloadBootstrap = true } = {}) {
      const currentThreadId = workspaceSourceOfTruth.getSelectedThreadId();
      const nextThreadId = workspaceSourceOfTruth.setSelectedThreadId(threadId);
      if (nextThreadId && nextThreadId !== currentThreadId) {
        state.runtime.historyContextThreadId = "";
        resetRuntimeHistoryFilters();
      }
      ensureRuntimeSelection();
      renderRuntimeConversationShell();
      if (reloadBootstrap) {
        loadBootstrap({
          preserveActiveDestination: true,
          applyWorkspacePrefs: false,
          quiet: true,
        }).catch((error) => {
          console.warn("CCO workspace bootstrap misslyckades för vald tråd.", error);
        });
      }
    }

    function setConversationHistoryOpen(open) {
      const collapseButton = conversationCollapseButton;
      const historyNode = conversationHistory;
      if (!collapseButton || !historyNode) return;
      collapseButton.setAttribute("aria-expanded", open ? "true" : "false");
      historyNode.classList.toggle("is-collapsed", !open);
      const label = collapseButton.querySelector(".conversation-collapse-label");
      if (label) {
        const olderCount = historyNode.querySelectorAll(".conversation-entry-history").length;
        label.textContent = open
          ? `Dölj ${olderCount} äldre meddelanden`
          : `Visa ${olderCount} äldre meddelanden`;
      }
    }

    async function loadLiveRuntime(options = {}) {
      const requestedMailboxIds = asArray(options.requestedMailboxIds)
        .map(normalizeMailboxId)
        .filter(Boolean);
      const runtimeMailboxIds = requestedMailboxIds.length
        ? requestedMailboxIds
        : getRequestedRuntimeMailboxIds();
      state.runtime.loading = true;
      state.runtime.error = "";
      state.runtime.authRequired = false;
      state.runtime.offline = false;
      renderRuntimeConversationShell();

      try {
        const status = await apiRequest("/api/v1/cco/runtime/status");
        if (status?.graph?.readEnabled !== true) {
          const error = new Error("Servern kör offline-läge. Starta live-servern för CCO.");
          error.statusCode = 503;
          throw error;
        }

        let historyStatus = null;
        try {
          const historyStatusParams = new URLSearchParams();
          historyStatusParams.set("mailboxIds", runtimeMailboxIds.join(","));
          historyStatusParams.set("lookbackDays", String(FULL_MAILBOX_LOOKBACK_DAYS));
          historyStatus = await apiRequest(
            `/api/v1/cco/runtime/history/status?${historyStatusParams.toString()}`
          );
        } catch (historyStatusError) {
          console.warn("CCO kunde inte läsa historikstatus för live-mailboxen.", historyStatusError);
        }

        if (
          historyStatus?.coverage?.complete !== true &&
          historyStatus?.graphReadEnabled === true
        ) {
          try {
            await apiRequest("/api/v1/cco/runtime/history/backfill", {
              method: "POST",
              headers: {
                "x-idempotency-key": createIdempotencyKey("major-arcana-history-backfill"),
              },
              body: {
                mailboxIds: runtimeMailboxIds,
                lookbackDays: FULL_MAILBOX_LOOKBACK_DAYS,
                refresh: false,
              },
            });
          } catch (historyBackfillError) {
            console.warn(
              "CCO kunde inte backfilla full mailboxhistorik inför live-laddning.",
              historyBackfillError
            );
          }
        }

        const analysisPayload = await apiRequest("/api/v1/capabilities/AnalyzeInbox/run", {
          method: "POST",
          headers: {
            "x-idempotency-key": createIdempotencyKey("major-arcana-runtime"),
          },
          body: {
            channel: "admin",
            input: {
              includeClosed: false,
              maxDrafts: 5,
              mailboxIds: runtimeMailboxIds,
            },
          },
        });

        const liveData =
          analysisPayload?.output && typeof analysisPayload.output === "object"
            ? analysisPayload.output.data
            : null;
        if (!liveData || typeof liveData !== "object") {
          throw new Error("AnalyzeInbox returnerade ingen live-data.");
        }

        let historyPayload = null;
        try {
          const historyParams = new URLSearchParams();
          historyParams.set("mailboxIds", runtimeMailboxIds.join(","));
          historyParams.set("lookbackDays", String(FULL_MAILBOX_LOOKBACK_DAYS));
          historyPayload = await apiRequest(
            `/api/v1/cco/runtime/history?${historyParams.toString()}`
          );
        } catch (historyLoadError) {
          console.warn("CCO kunde inte läsa full mailboxhistorik för live-vyn.", historyLoadError);
        }

        const threads = buildLiveThreads(liveData, {
          historyMessages: historyPayload?.messages,
          historyEvents: historyPayload?.events,
        });
        const metadata = analysisPayload?.output?.metadata || {};
        state.runtime.threads = threads;
        state.runtime.mailboxes = buildMailboxCatalog(
          threads.map((thread) => ({
            mailboxId: thread.mailboxAddress,
            mailboxAddress: thread.mailboxAddress,
            userPrincipalName: thread.mailboxAddress,
          })),
          {
            ...metadata,
            sourceMailboxIds: Array.from(
              new Set([
                ...runtimeMailboxIds,
                ...asArray(status?.graph?.allowlistMailboxIds),
                ...asArray(metadata?.sourceMailboxIds),
              ])
            ),
          }
        );
        state.runtime.defaultSenderMailbox = asText(metadata?.ccoDefaultSenderMailbox);
        if (!state.runtime.defaultSenderMailbox) {
          state.runtime.defaultSenderMailbox = CCO_DEFAULT_REPLY_SENDER;
        }
        state.runtime.defaultSignatureProfile = asText(
          metadata?.ccoDefaultSignatureProfile,
          CCO_DEFAULT_SIGNATURE_PROFILE
        );
        state.runtime.sendEnabled = status?.graph?.sendEnabled === true;
        state.runtime.deleteEnabled = status?.graph?.deleteEnabled === true;
        state.runtime.loading = false;
        state.runtime.live = true;
        state.runtime.lastSyncAt = new Date().toISOString();

        ensureRuntimeMailboxSelection();
        normalizeVisibleRuntimeScope();
        if (state.customerRuntime.loaded) {
          ensureCustomerRuntimeProfilesFromLive();
          await refreshCustomerIdentitySuggestions({ quiet: true });
        }
        renderRuntimeConversationShell();
        loadQueueHistory({ force: true, prefetch: true }).catch((queueHistoryError) => {
          console.warn("CCO queue-historik kunde inte förladdas.", queueHistoryError);
        });

        await loadBootstrap({
          preserveActiveDestination: true,
          applyWorkspacePrefs: false,
          quiet: true,
        }).catch((error) => {
          console.warn("CCO workspace bootstrap misslyckades efter live runtime.", error);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const statusCode = Number(error?.statusCode || error?.status || 0);
        state.runtime.loading = false;
        state.runtime.live = false;
        state.runtime.error = message;
        state.runtime.offline = normalizeKey(message).includes("offline");
        state.runtime.authRequired = isAuthFailure(statusCode, message);
        renderRuntimeConversationShell();
      }
    }

    function bindWorkspaceInteractions() {
      if (interactionsBound) return;
      interactionsBound = true;

      openButtons.forEach((button) => {
        button.addEventListener("click", () => {
          runtimeActionEngine.openRuntimeStudio(button.dataset.studioMode || "reply");
        });
      });

      closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setStudioOpen(false);
          setContextCollapsed(false);
        });
      });

      contextButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setContextCollapsed(!canvas.classList.contains("is-context-collapsed"));
        });
      });

      noteOpenButtons.forEach((button) => {
        button.addEventListener("click", () => {
          runtimeActionEngine.openRuntimeNote().catch(() => {});
        });
      });

      noteCloseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setNoteOpen(false);
        });
      });

      scheduleOpenButtons.forEach((button) => {
        button.addEventListener("click", () => {
          runtimeActionEngine.openRuntimeSchedule({ renderDraft: true }).catch(() => {});
        });
      });

      scheduleCloseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setScheduleOpen(false);
        });
      });

      laterCloseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setLaterOpen(false);
        });
      });

      laterOptionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          applyLaterOption(button.dataset.laterOption);
        });
      });

      if (studioLaterActionButton) {
        studioLaterActionButton.addEventListener("click", () => {
          openLaterDialog();
        });
      }

      if (studioPrimarySuggestion) {
        studioPrimarySuggestion.addEventListener("click", (event) => {
          event.stopPropagation();
          const thread = getSelectedRuntimeThread();
          if (!thread) return;
          if (thread.tags.includes("bookable")) {
            applyStudioTemplateSelection("confirm_booking");
            return;
          }
          applyStudioTrackSelection(state.studio.activeTrackKey || inferStudioTrackKey(thread));
        });
      }

      if (studioComposeToInput) {
        studioComposeToInput.addEventListener("input", (event) => {
          if (normalizeKey(state.studio.mode) !== "compose") return;
          state.studio.composeTo = event.target.value || "";
        });
      }

      if (studioComposeSubjectInput) {
        studioComposeSubjectInput.addEventListener("input", (event) => {
          if (normalizeKey(state.studio.mode) !== "compose") return;
          state.studio.composeSubject = event.target.value || "";
        });
      }

      if (studioEditorInput) {
        studioEditorInput.addEventListener("input", (event) => {
          if (normalizeKey(state.studio.mode) === "compose") {
            state.studio.draftBody = event.target.value || "";
            state.studio.activeTemplateKey = "";
            state.studio.activeRefineKey = "";
            renderStudioShell();
            return;
          }
          const thread = getSelectedRuntimeThread();
          if (!thread) return;
          const studioState = ensureStudioState(thread);
          studioState.draftBody = event.target.value || "";
          studioState.activeTemplateKey = "";
          studioState.activeRefineKey = "";
          renderStudioShell();
        });
      }

      studioTemplateButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          applyStudioTemplateSelection(button.dataset.studioTemplate);
        });
      });

      studioSignatureButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const signatureId = normalizeKey(button.dataset.studioSignature);
          if (signatureId === "edit") {
            void handleStudioPreview();
            return;
          }
          if (normalizeKey(state.studio.mode) === "compose") {
            state.studio.selectedSignatureId = getStudioSignatureProfile(signatureId).id;
            renderStudioShell();
            setStudioFeedback(`Signatur: ${getStudioSignatureProfile(signatureId).label}.`, "success");
            return;
          }
          const thread = getSelectedRuntimeThread();
          if (!thread) return;
          const studioState = ensureStudioState(thread);
          studioState.selectedSignatureId = getStudioSignatureProfile(signatureId).id;
          renderStudioShell();
          setStudioFeedback(`Signatur: ${getStudioSignatureProfile(signatureId).label}.`, "success");
        });
      });

      studioTrackButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          applyStudioTrackSelection(button.dataset.studioTrack);
        });
      });

      studioToneButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          applyStudioToneSelection(button.dataset.studioTone);
        });
      });

      studioRefineButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          applyStudioRefineSelection(button.dataset.studioRefine);
        });
      });

      studioToolButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          handleStudioToolAction(button.dataset.studioTool);
        });
      });

      if (studioSendButton) {
        studioSendButton.addEventListener("click", (event) => {
          event.stopPropagation();
          void handleStudioSend();
        });
      }

      if (studioPreviewButton) {
        studioPreviewButton.addEventListener("click", (event) => {
          event.stopPropagation();
          void handleStudioPreview();
        });
      }

      if (studioSaveDraftButton) {
        studioSaveDraftButton.addEventListener("click", (event) => {
          event.stopPropagation();
          void handleStudioSaveDraft();
        });
      }

      if (studioDoneActionButton) {
        studioDoneActionButton.addEventListener("click", (event) => {
          event.stopPropagation();
          void handleStudioMarkHandled();
        });
      }

      if (studioDeleteButton) {
        studioDeleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          void handleStudioDelete();
        });
      }

      destinationButtons.forEach((button) => {
        button.addEventListener("click", () => {
          syncCurrentNoteDraftFromForm();
          renderNoteDestination(button.dataset.noteKey);
        });
      });

      templateButtons.forEach((button) => {
        button.addEventListener("click", () => {
          applyTemplateToActiveDraft(button.dataset.noteTemplate);
        });
      });

      if (noteText) {
        noteText.addEventListener("input", () => {
          syncCurrentNoteDraftFromForm();
          syncNoteCount();
        });
      }

      if (notePrioritySelect) {
        notePrioritySelect.addEventListener("change", syncCurrentNoteDraftFromForm);
      }

      if (noteVisibilitySelect) {
        noteVisibilitySelect.addEventListener("change", syncCurrentNoteDraftFromForm);
      }

      if (noteTagAddButton) {
        noteTagAddButton.addEventListener("click", () => {
          addTagToActiveDraft(noteTagInput?.value);
        });
      }

      if (noteTagInput) {
        noteTagInput.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          addTagToActiveDraft(noteTagInput.value);
        });
      }

      if (noteTagsRow) {
        noteTagsRow.addEventListener("click", (event) => {
          const chip = event.target.closest("[data-note-tag]");
          if (!chip) return;
          removeTagFromActiveDraft(chip.dataset.noteTag);
        });
      }

      if (noteSaveButton) {
        noteSaveButton.addEventListener("click", () => {
          void saveNote();
        });
      }

      if (scheduleSaveButton) {
        scheduleSaveButton.addEventListener("click", () => {
          void saveSchedule();
        });
      }

      if (mailboxMenuGrid) {
        mailboxMenuGrid.addEventListener("change", (event) => {
          const input = event.target.closest("[data-runtime-mailbox]");
          if (!input) return;
          const mailboxId = normalizeKey(input.dataset.runtimeMailbox);
          const nextSelected = new Set(workspaceSourceOfTruth.getSelectedMailboxIds());
          if (input.checked) {
            nextSelected.add(mailboxId);
          } else {
            nextSelected.delete(mailboxId);
          }
          workspaceSourceOfTruth.setSelectedMailboxIds(Array.from(nextSelected));
          ensureRuntimeSelection();
          renderRuntimeConversationShell();
          if (!workspaceSourceOfTruth.getSelectedMailboxIds().length) {
            state.runtime.queueHistory = {
              ...state.runtime.queueHistory,
              loading: false,
              loaded: true,
              error: "",
              items: [],
              hasMore: false,
              scopeKey: "",
            };
            renderQueueHistorySection();
            loadBootstrap({
              preserveActiveDestination: true,
              applyWorkspacePrefs: false,
              quiet: true,
            }).catch((error) => {
              console.warn("CCO workspace bootstrap misslyckades efter tomt mailboxscope.", error);
            });
            return;
          }
          loadLiveRuntime({
            requestedMailboxIds: workspaceSourceOfTruth.getSelectedMailboxIds(),
          }).catch((error) => {
            console.warn("CCO live runtime misslyckades efter mailboxbyte.", error);
          });
        });
      }

      if (ownerMenuGrid) {
        ownerMenuGrid.addEventListener("change", (event) => {
          const input = event.target.closest("[data-runtime-owner]");
          if (!input) return;
          workspaceSourceOfTruth.setSelectedOwnerKey(input.dataset.runtimeOwner || "all");
          ensureRuntimeSelection();
          renderRuntimeConversationShell();
          loadBootstrap({
            preserveActiveDestination: true,
            applyWorkspacePrefs: false,
            quiet: true,
          }).catch((error) => {
            console.warn("CCO workspace bootstrap misslyckades efter ägarbyte.", error);
          });
          if (ownerMenuToggle) {
            ownerMenuToggle.checked = false;
          }
        });
      }

      queueLaneButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setActiveRuntimeLane(button.dataset.queueLane || "all");
        });
        button.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          setActiveRuntimeLane(button.dataset.queueLane || "all");
        });
      });

      if (queueHistoryToggle) {
        const toggleQueueHistory = () => {
          const nextOpen = !state.runtime.queueHistory.open;
          state.runtime.queueHistory.open = nextOpen;
          renderQueueHistorySection();
          if (!nextOpen) return;
          const nextScopeKey = getQueueHistoryScopeKey();
          loadQueueHistory({
            force:
              !state.runtime.queueHistory.loaded ||
              state.runtime.queueHistory.scopeKey !== nextScopeKey,
          }).catch((error) => {
            console.warn("CCO queue-historik kunde inte öppnas.", error);
          });
        };

        queueHistoryToggle.addEventListener("click", toggleQueueHistory);
        queueHistoryToggle.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          toggleQueueHistory();
        });
      }

      if (queueHistoryLoadMoreButton) {
        queueHistoryLoadMoreButton.addEventListener("click", () => {
          loadQueueHistory({ append: true, force: true }).catch((error) => {
            console.warn("CCO queue-historik kunde inte läsa fler mejl.", error);
          });
        });
      }

      if (queueCollapsedList) {
        queueCollapsedList.addEventListener("dragstart", (event) => {
          const row = event.target.closest("[data-queue-lane]");
          const laneId = normalizeKey(row?.dataset.queueLane);
          if (!row || !laneId || laneId === "all") return;
          draggedQueueLaneId = laneId;
          row.classList.add("is-dragging");
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", laneId);
          }
        });

        queueCollapsedList.addEventListener("dragover", (event) => {
          const row = event.target.closest("[data-queue-lane]");
          const overLaneId = normalizeKey(row?.dataset.queueLane);
          if (!row || !draggedQueueLaneId || !overLaneId || overLaneId === draggedQueueLaneId) {
            return;
          }
          event.preventDefault();
          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
          }
        });

        queueCollapsedList.addEventListener("drop", (event) => {
          const row = event.target.closest("[data-queue-lane]");
          const overLaneId = normalizeKey(row?.dataset.queueLane);
          if (!row || !draggedQueueLaneId || !overLaneId || overLaneId === draggedQueueLaneId) {
            return;
          }
          event.preventDefault();
          const current = getOrderedQueueLaneIds();
          const next = current.filter((laneId) => laneId !== draggedQueueLaneId);
          const targetIndex = next.findIndex((laneId) => laneId === overLaneId);
          if (targetIndex >= 0) {
            next.splice(targetIndex, 0, draggedQueueLaneId);
            state.runtime.orderedLaneIds = next;
            renderRuntimeConversationShell();
          }
        });

        queueCollapsedList.addEventListener("dragend", () => {
          draggedQueueLaneId = "";
          queueCollapsedList
            .querySelectorAll(".collapsed-row.is-dragging")
            .forEach((row) => row.classList.remove("is-dragging"));
        });
      }

      if (queueContent) {
        queueContent.addEventListener("click", (event) => {
          const card = event.target.closest("[data-runtime-thread]");
          if (!card) return;
          selectRuntimeThread(card.dataset.runtimeThread, { reloadBootstrap: true });
        });
      }

      resizeHandles.forEach((handle) => {
        handle.addEventListener("pointerdown", (event) => {
          if (event.pointerType === "mouse") return;
          startResize(handle, event);
        });
        handle.addEventListener("mousedown", (event) => {
          if (event.button !== 0) return;
          startResize(handle, event);
        });
        handle.addEventListener("dblclick", () => {
          void resetWorkspacePrefs();
        });
      });

      if (conversationCollapseButton) {
        conversationCollapseButton.addEventListener("click", () => {
          const isOpen = conversationCollapseButton.getAttribute("aria-expanded") !== "false";
          setConversationHistoryOpen(!isOpen);
        });
      }

      if (focusHistorySearchInput) {
        focusHistorySearchInput.addEventListener("input", (event) => {
          state.runtime.historySearch = event.target.value || "";
          renderFocusHistorySection(getSelectedRuntimeThread());
        });
      }

      focusTabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setAppView("conversations");
          applyFocusSection(button.dataset.focusSection);
        });
      });

      if (focusNotesRefreshButton) {
        focusNotesRefreshButton.addEventListener("click", () => {
          loadBootstrap({
            preserveActiveDestination: true,
            applyWorkspacePrefs: false,
            quiet: true,
          }).catch((error) => {
            console.warn("Kunde inte uppdatera anteckningar.", error);
          });
        });
      }

      if (mailboxAdminOpenButton) {
        mailboxAdminOpenButton.addEventListener("click", () => {
          setMailboxAdminOpen(true);
        });
      }

      mailboxAdminCloseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setMailboxAdminOpen(false);
        });
      });

      if (mailboxAdminSaveButton) {
        mailboxAdminSaveButton.addEventListener("click", () => {
          handleMailboxAdminSave();
        });
      }

      if (mailboxAdminList) {
        mailboxAdminList.addEventListener("click", (event) => {
          const removeButton = event.target.closest("[data-mailbox-admin-remove]");
          if (!removeButton) return;
          const mailboxId = normalizeMailboxId(removeButton.dataset.mailboxAdminRemove);
          if (!mailboxId) return;
          state.customMailboxes = state.customMailboxes.filter(
            (mailbox, index) =>
              normalizeCustomMailboxDefinition(mailbox, index)?.id !== mailboxId
          );
          workspaceSourceOfTruth.setSelectedMailboxIds(
            workspaceSourceOfTruth
              .getSelectedMailboxIds()
              .filter((id) => normalizeMailboxId(id) !== mailboxId)
          );
          ensureRuntimeMailboxSelection();
          ensureRuntimeSelection();
          renderMailboxAdminList();
          renderRuntimeConversationShell();
          setFeedback(mailboxAdminFeedback, "success", "Mailboxen togs bort.");
        });
      }

      noteModeCloseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setNoteModeOpen(false);
        });
      });

      noteModeOptionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          applyNoteModePreset(button.dataset.noteModeOption);
        });
      });
    }

    function handleWorkspaceDocumentClick(event) {
      const mailboxAdminOpenTrigger = event.target.closest("[data-mailbox-admin-open]");
      if (mailboxAdminOpenTrigger) {
        setMailboxAdminOpen(true);
        return true;
      }

      const runtimeStudioOpenButton = event.target.closest("[data-runtime-studio-open]");
      if (runtimeStudioOpenButton) {
        runtimeActionEngine.openRuntimeStudio("reply");
        return true;
      }

      const runtimeNoteOpenButton = event.target.closest("[data-runtime-note-open]");
      if (runtimeNoteOpenButton) {
        runtimeActionEngine.openRuntimeNote().catch((error) => {
          console.warn("Runtime-anteckning från snabbentry misslyckades.", error);
        });
        return true;
      }

      const runtimeScheduleOpenButton = event.target.closest("[data-runtime-schedule-open]");
      if (runtimeScheduleOpenButton) {
        runtimeActionEngine.openRuntimeSchedule({ renderDraft: true }).catch((error) => {
          console.warn("Runtime-schemaläggning från snabbentry misslyckades.", error);
        });
        return true;
      }

      const runtimeCollapseButton = event.target.closest("[data-runtime-conversation-collapse]");
      if (runtimeCollapseButton) {
        workspaceSourceOfTruth.toggleHistoryExpanded();
        renderRuntimeFocusConversation(getSelectedRuntimeThread());
        return true;
      }

      const runtimeReauthLink = event.target.closest("[data-runtime-reauth]");
      if (runtimeReauthLink) {
        event.preventDefault();
        windowObject.location.assign(buildReauthUrl());
        return true;
      }

      const quickActionButton = event.target.closest("[data-quick-action]");
      if (quickActionButton) {
        const action = quickActionButton.dataset.quickAction;
        const quickActionResult = runtimeActionEngine.handleQuickAction(quickActionButton);
        if (quickActionResult) {
          quickActionResult.catch((error) => {
            const warningByAction = {
              delete: "Runtime-radering från snabbactions misslyckades.",
              handled: "Runtime-klar från snabbactions misslyckades.",
              schedule: "Runtime-schemaläggning från snabbactions misslyckades.",
              readout: "Runtime-readout från snabbactions misslyckades.",
            };
            console.warn(
              warningByAction[action] || "Runtime-snabbaction misslyckades.",
              error
            );
          });
          return true;
        }
      }

      const historyMailboxButton = event.target.closest("[data-focus-history-mailbox]");
      if (historyMailboxButton) {
        state.runtime.historyMailboxFilter =
          normalizeKey(historyMailboxButton.dataset.focusHistoryMailbox) || "all";
        renderFocusHistorySection(getSelectedRuntimeThread());
        return true;
      }

      const historyTypeButton = event.target.closest("[data-focus-history-type]");
      if (historyTypeButton) {
        state.runtime.historyResultTypeFilter =
          normalizeKey(historyTypeButton.dataset.focusHistoryType) || "all";
        renderFocusHistorySection(getSelectedRuntimeThread());
        return true;
      }

      const historyRangeButton = event.target.closest("[data-focus-history-range]");
      if (historyRangeButton) {
        state.runtime.historyRangeFilter =
          normalizeKey(historyRangeButton.dataset.focusHistoryRange) || "all";
        renderFocusHistorySection(getSelectedRuntimeThread());
        return true;
      }

      const historyReadoutButton = event.target.closest("[data-focus-history-readout]");
      if (historyReadoutButton) {
        const selectedThread = getSelectedRuntimeThread();
        windowObject.open(buildHistoryReadoutHref(selectedThread), "_blank", "noopener");
        return true;
      }

      const historyDeleteButton = event.target.closest("[data-focus-history-delete]");
      if (historyDeleteButton) {
        handleFocusHistoryDelete().catch((error) => {
          console.warn("Fokusytans radering misslyckades.", error);
        });
        return true;
      }

      const customerHistoryReadoutButton = event.target.closest(
        "[data-focus-customer-history-readout]"
      );
      if (customerHistoryReadoutButton) {
        const selectedThread = getSelectedRuntimeThread();
        windowObject.open(
          buildHistoryReadoutHref(selectedThread, { customerScoped: true }),
          "_blank",
          "noopener"
        );
        return true;
      }

      const historyThreadButton = event.target.closest("[data-history-open-thread]");
      if (historyThreadButton) {
        const conversationId = asText(historyThreadButton.dataset.historyConversationId);
        if (conversationId) {
          const mailboxScopedTarget = getMailboxScopedRuntimeThreads().find(
            (thread) => thread.id === conversationId
          );
          if (
            mailboxScopedTarget &&
            normalizeKey(workspaceSourceOfTruth.getSelectedOwnerKey() || "all") !== "all"
          ) {
            workspaceSourceOfTruth.setSelectedOwnerKey("all");
          }
          if (
            normalizeKey(workspaceSourceOfTruth.getActiveLaneId() || "all") !== "all" &&
            !getFilteredRuntimeThreads().some((thread) => thread.id === conversationId)
          ) {
            workspaceSourceOfTruth.setActiveLaneId("all");
          }
          selectRuntimeThread(conversationId, { reloadBootstrap: true });
        }
        applyFocusSection("conversation");
        return true;
      }

      const studioChoice = event.target.closest("[data-choice-group] .studio-choice");
      if (studioChoice) {
        const group = studioChoice.closest("[data-choice-group]");
        if (!group) return false;
        const mode = group.dataset.choiceMode || "single";
        if (mode === "multiple") {
          studioChoice.classList.toggle("is-active");
          return true;
        }

        group.querySelectorAll(".studio-choice").forEach((item) => {
          item.classList.toggle("is-active", item === studioChoice);
        });
        return true;
      }

      return false;
    }

    function handleWorkspaceDocumentKeydown(event) {
      if (event.key !== "Escape") return false;

      if (state.mailboxAdminOpen) {
        setMailboxAdminOpen(false);
        return true;
      }

      if (state.noteMode.open) {
        setNoteModeOpen(false);
        return true;
      }

      if (canvas.classList.contains("is-later-open")) {
        setLaterOpen(false);
        return true;
      }

      if (canvas.classList.contains("is-schedule-open")) {
        setScheduleOpen(false);
        return true;
      }

      if (canvas.classList.contains("is-note-open")) {
        setNoteOpen(false);
        return true;
      }

      if (canvas.classList.contains("is-studio-open")) {
        setStudioOpen(false);
        setContextCollapsed(false);
        return true;
      }

      return false;
    }

    function initializeWorkspaceSurface() {
      bindWorkspaceInteractions();
      DEFAULT_WORKSPACE.left =
        Math.round(readPxVariable("--workspace-left-width")) || DEFAULT_WORKSPACE.left;
      DEFAULT_WORKSPACE.main =
        Math.round(readPxVariable("--workspace-main-width")) || DEFAULT_WORKSPACE.main;
      DEFAULT_WORKSPACE.right =
        Math.round(readPxVariable("--workspace-right-width")) || DEFAULT_WORKSPACE.right;
      workspaceState.left = DEFAULT_WORKSPACE.left;
      workspaceState.main = DEFAULT_WORKSPACE.main;
      workspaceState.right = DEFAULT_WORKSPACE.right;
      workspaceLimits.left.min = DEFAULT_WORKSPACE.left;
      workspaceLimits.right.min = DEFAULT_WORKSPACE.right;

      normalizeWorkspaceState();
      decorateStaticPills();
      renderThreadContextRows();
      renderQuickActionRows(queueActionRows, QUEUE_ACTIONS);
      renderSignalRows(focusSignalRows, FOCUS_SIGNALS);
      renderQuickActionRows(focusActionRows, FOCUS_ACTIONS);
      renderQuickActionRows(intelActionRows, INTEL_ACTIONS);
      setAppView("conversations");
      applyFocusSection("conversation");
      applyStudioMode("reply");
      renderLaterOptions(state.later.option);
      renderMailFeeds();
      renderMailFeedUndoState();
      setConversationHistoryOpen(true);
      renderMailboxOptions();
      renderMailboxAdminList();
      renderTemplateButtons();
      syncNoteCount();
      setMailboxAdminOpen(false);
      setNoteModeOpen(false);
      setFeedback(noteFeedback, "", "");
      setFeedback(scheduleFeedback, "", "");

      loadBootstrap({
        preserveActiveDestination: true,
        applyWorkspacePrefs: true,
        quiet: true,
      }).catch((error) => {
        console.warn("CCO workspace bootstrap misslyckades.", error);
      });

      loadLiveRuntime().catch((error) => {
        console.warn("CCO live runtime misslyckades.", error);
      });
    }

    return Object.freeze({
      bindWorkspaceInteractions,
      handleWorkspaceDocumentClick,
      handleWorkspaceDocumentKeydown,
      initializeWorkspaceSurface,
      loadLiveRuntime,
      selectRuntimeThread,
      setActiveRuntimeLane,
      setConversationHistoryOpen,
    });
  }

  window.MajorArcanaPreviewDomLiveComposition = Object.freeze({
    createDomLiveComposition,
  });
})();
