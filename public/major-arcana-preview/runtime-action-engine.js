(() => {
  function createRuntimeActionEngine({
    applyFocusSection,
    applyStudioMode,
    buildIntelReadoutHref,
    buildReauthUrl,
    getSelectedRuntimeThread,
    handleRuntimeDeleteAction,
    handleRuntimeHandledAction,
    laterStatus,
    loadBootstrap,
    noteFeedback,
    openLaterDialog,
    prepareComposeStudioState,
    renderScheduleDraft,
    scheduleFeedback,
    sentStatus,
    setAppView,
    setAuxStatus,
    setContextCollapsed,
    setFeedback,
    setNoteModeOpen,
    setScheduleOpen,
    setStudioOpen,
    state,
    windowObject = window,
  }) {
    function loadOverlayBootstrap() {
      return Promise.resolve(
        loadBootstrap({
          preserveActiveDestination: true,
          applyWorkspacePrefs: false,
          quiet: true,
        })
      ).catch(() => {});
    }

    function openRuntimeStudio(mode = "reply") {
      const normalizedMode = String(mode || "").trim().toLowerCase() || "reply";
      if (normalizedMode === "compose" && typeof prepareComposeStudioState === "function") {
        prepareComposeStudioState(getSelectedRuntimeThread());
        setAppView("conversations");
      }
      applyStudioMode(mode);
      setStudioOpen(true);
      setContextCollapsed(false);
    }

    function openRuntimeNote() {
      return loadOverlayBootstrap().finally(() => {
        setFeedback(noteFeedback, "", "");
        setNoteModeOpen(true);
      });
    }

    function openRuntimeSchedule({ renderDraft = false } = {}) {
      return loadOverlayBootstrap().finally(() => {
        setFeedback(scheduleFeedback, "", "");
        if (renderDraft) {
          renderScheduleDraft();
        }
        setScheduleOpen(true);
      });
    }

    function openReadout(target) {
      const selectedThread = getSelectedRuntimeThread();
      if (state.runtime.authRequired && !selectedThread) {
        windowObject.open(buildReauthUrl("session_expired"), "_blank", "noopener");
        return Promise.resolve(true);
      }
      windowObject.open(buildIntelReadoutHref(target, selectedThread), "_blank", "noopener");
      return Promise.resolve(true);
    }

    function handleQuickAction(button) {
      if (!button) return false;

      const action = button.dataset.quickAction;
      if (!action) return false;

      if (action === "studio") {
        openRuntimeStudio(button.dataset.quickMode || "reply");
        return Promise.resolve(true);
      }

      if (action === "customer_history") {
        applyFocusSection("customer");
        return Promise.resolve(true);
      }

      if (action === "history") {
        applyFocusSection("history");
        return Promise.resolve(true);
      }

      if (action === "delete") {
        return Promise.resolve(
          handleRuntimeDeleteAction(
            button.closest(".queue-action-row")
              ? "major-arcana-queue-delete"
              : "major-arcana-focus-delete"
          )
        ).then(() => true);
      }

      if (action === "handled") {
        return Promise.resolve(handleRuntimeHandledAction()).then(() => true);
      }

      if (action === "later_feed") {
        setAppView("later");
        setAuxStatus(
          laterStatus,
          "Snoozade konversationer öppnades från arbetskön.",
          "success"
        );
        return Promise.resolve(true);
      }

      if (action === "sent_feed") {
        setAppView("sent");
        setAuxStatus(
          sentStatus,
          "Skickade meddelanden öppnades från arbetskön.",
          "success"
        );
        return Promise.resolve(true);
      }

      if (action === "later") {
        openLaterDialog();
        return Promise.resolve(true);
      }

      if (action === "schedule") {
        return openRuntimeSchedule().then(() => true);
      }

      if (action === "readout") {
        return openReadout(button.dataset.quickTarget).then(() => true);
      }

      return false;
    }

    return Object.freeze({
      openRuntimeNote,
      openRuntimeSchedule,
      openRuntimeStudio,
      handleQuickAction,
    });
  }

  window.MajorArcanaPreviewActionEngine = Object.freeze({
    createRuntimeActionEngine,
  });
})();
