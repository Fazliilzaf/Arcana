(() => {
  const WORKSPACE_ID = "major-arcana-preview";

  const canvas = document.querySelector(".preview-canvas");
  const previewWorkspace = document.querySelector(".preview-workspace");
  const previewShell = document.querySelector(".preview-shell");
  const focusShell = document.querySelector(".focus-shell");
  const shellViewSections = Array.from(document.querySelectorAll("[data-shell-view]"));
  const automationShell = document.querySelector(".automation-shell");
  const navViewButtons = Array.from(document.querySelectorAll("[data-nav-view]"));
  const moreMenuToggle = document.querySelector("[data-more-toggle]");
  const moreMenu = document.getElementById("preview-more-menu");
  const focusIntelTabs = document.querySelector(".focus-intel-tabs");
  const focusTabButtons = Array.from(
    document.querySelectorAll(".focus-tab[data-focus-section]")
  );
  const focusPanels = Array.from(document.querySelectorAll("[data-focus-panel]"));
  const studioShell = document.getElementById("studio-shell");
  const noteShell = document.getElementById("note-shell");
  const scheduleShell = document.getElementById("schedule-shell");
  const laterShell = document.getElementById("later-shell");
  const mailboxOptionsContainer = document.querySelector(".mailbox-options");
  const laterStatus = document.querySelector("[data-later-status]");
  const sentStatus = document.querySelector("[data-sent-status]");
  const laterMetricValueNodes = {
    count: document.querySelector('[data-later-metric-value="count"]'),
    vip: document.querySelector('[data-later-metric-value="vip"]'),
    resume: document.querySelector('[data-later-metric-value="resume"]'),
  };
  const sentMetricValueNodes = {
    count: document.querySelector('[data-sent-metric-value="count"]'),
    vip: document.querySelector('[data-sent-metric-value="vip"]'),
    scope: document.querySelector('[data-sent-metric-value="scope"]'),
  };
  const mailFeedFilterButtons = Array.from(
    document.querySelectorAll("[data-mail-feed-filter]")
  );
  const mailFeedViewButtons = Array.from(document.querySelectorAll("[data-mail-feed-view]"));
  const mailFeedDensityButtons = Array.from(
    document.querySelectorAll("[data-mail-feed-density]")
  );
  const mailFeedSelectAllButtons = Array.from(
    document.querySelectorAll("[data-mail-feed-select-all]")
  );
  const mailFeedSelectionCountNodes = Array.from(
    document.querySelectorAll("[data-mail-feed-selection-count]")
  );
  const mailFeedUndoButtons = Array.from(document.querySelectorAll("[data-mail-feed-undo]"));
  const mailFeedBulkButtons = Array.from(document.querySelectorAll("[data-mail-feed-bulk]"));
  const integrationsStatus = document.querySelector("[data-integrations-status]");
  const macrosStatus = document.querySelector("[data-macros-status]");
  const settingsStatus = document.querySelector("[data-settings-status]");
  const showcaseStatus = document.querySelector("[data-showcase-status]");
  const settingsSummaryThemeValue = document.querySelector("[data-settings-summary-theme-value]");
  const settingsSummaryThemeCopy = document.querySelector("[data-settings-summary-theme-copy]");
  const settingsSummaryGuardValue = document.querySelector("[data-settings-summary-guard-value]");
  const settingsSummaryGuardCopy = document.querySelector("[data-settings-summary-guard-copy]");
  const settingsSummaryTeamValue = document.querySelector("[data-settings-summary-team-value]");
  const settingsSummaryTeamCopy = document.querySelector("[data-settings-summary-team-copy]");
  const settingsProfileAvatar = document.querySelector("[data-settings-profile-avatar]");
  const settingsProfileName = document.querySelector("[data-settings-profile-name]");
  const settingsProfileEmail = document.querySelector("[data-settings-profile-email]");
  const mailFeedLists = Array.from(document.querySelectorAll("[data-mail-feed-list]"));
  const mailFeedCommandButtons = Array.from(document.querySelectorAll("[data-mail-feed-command]"));
  const integrationCategoryButtons = Array.from(
    document.querySelectorAll("[data-integration-category]")
  );
  const integrationMetricNodes = Array.from(
    document.querySelectorAll("[data-integration-metric]")
  );
  const integrationsGrid = document.querySelector("[data-integrations-grid]");
  const integrationCommandButtons = Array.from(
    document.querySelectorAll("[data-integration-command]")
  );
  const macroMetricNodes = Array.from(document.querySelectorAll("[data-macro-metric]"));
  const macrosList = document.querySelector("[data-macro-list]");
  const macroCommandButtons = Array.from(document.querySelectorAll("[data-macro-command]"));
  const settingsChoiceButtons = Array.from(document.querySelectorAll("[data-settings-choice]"));
  const settingsToggleInputs = Array.from(document.querySelectorAll("[data-settings-toggle]"));
  const settingsActionButtons = Array.from(document.querySelectorAll("[data-settings-action]"));
  const showcaseFeatureButtons = Array.from(
    document.querySelectorAll("[data-showcase-feature]")
  );
  const showcaseJumpButtons = Array.from(document.querySelectorAll("[data-showcase-jump]"));
  const showcaseFocus = document.querySelector("[data-showcase-focus]");
  const showcaseTitleText = document.querySelector("[data-showcase-title-text]");
  const showcaseCopy = document.querySelector("[data-showcase-copy]");
  const showcaseOutcome = document.querySelector("[data-showcase-outcome]");
  const showcaseDetail = document.querySelector("[data-showcase-detail]");
  const showcaseEffectLabel = document.querySelector("[data-showcase-effect-label]");
  const showcaseEffectTitle = document.querySelector("[data-showcase-effect-title]");
  const showcaseEffectCopy = document.querySelector("[data-showcase-effect-copy]");
  const showcaseNextTitle = document.querySelector("[data-showcase-next-title]");
  const showcaseNextCopy = document.querySelector("[data-showcase-next-copy]");
  const showcaseActionPrimary = document.querySelector('[data-showcase-action="primary"]');
  const showcaseActionSecondary = document.querySelector('[data-showcase-action="secondary"]');
  const mailboxAdminShell = document.getElementById("mailbox-admin-shell");
  const mailboxAdminOpenButton = document.querySelector("[data-mailbox-admin-open]");
  const mailboxAdminCloseButtons = Array.from(
    document.querySelectorAll("[data-mailbox-admin-close]")
  );
  const mailboxAdminList = document.querySelector("[data-mailbox-admin-list]");
  const mailboxAdminNameInput = document.querySelector("[data-mailbox-admin-name]");
  const mailboxAdminEmailInput = document.querySelector("[data-mailbox-admin-email]");
  const mailboxAdminOwnerSelect = document.querySelector("[data-mailbox-admin-owner]");
  const mailboxAdminFeedback = document.querySelector("[data-mailbox-admin-feedback]");
  const mailboxAdminSaveButton = document.querySelector("[data-mailbox-admin-save]");
  const noteModeShell = document.getElementById("note-mode-shell");
  const noteModeCloseButtons = Array.from(document.querySelectorAll("[data-note-mode-close]"));
  const noteModeOptionButtons = Array.from(
    document.querySelectorAll("[data-note-mode-option]")
  );
  const noteModeContext = document.querySelector("[data-note-mode-context]");
  const macroEditorShell = document.getElementById("macro-editor-shell");
  const macroModalCloseButtons = Array.from(
    document.querySelectorAll("[data-macro-modal-close]")
  );
  const macroModalKicker = document.querySelector("[data-macro-modal-kicker]");
  const macroModalTitle = document.querySelector("[data-macro-modal-title]");
  const macroModalNameInput = document.querySelector("[data-macro-modal-name]");
  const macroModalDescriptionInput = document.querySelector(
    "[data-macro-modal-description]"
  );
  const macroModalTriggerSelect = document.querySelector("[data-macro-modal-trigger]");
  const macroModalFeedback = document.querySelector("[data-macro-modal-feedback]");
  const macroModalSubmitButton = document.querySelector("[data-macro-modal-submit]");
  const settingsProfileShell = document.getElementById("settings-profile-shell");
  const settingsProfileModalCloseButtons = Array.from(
    document.querySelectorAll("[data-settings-profile-modal-close]")
  );
  const settingsProfileModalNameInput = document.querySelector(
    "[data-settings-profile-modal-name]"
  );
  const settingsProfileModalEmailInput = document.querySelector(
    "[data-settings-profile-modal-email]"
  );
  const settingsProfileModalFeedback = document.querySelector(
    "[data-settings-profile-modal-feedback]"
  );
  const settingsProfileModalSubmitButton = document.querySelector(
    "[data-settings-profile-modal-submit]"
  );
  const shellConfirmShell = document.getElementById("shell-confirm-shell");
  const confirmCloseButtons = Array.from(document.querySelectorAll("[data-confirm-close]"));
  const confirmKicker = document.querySelector("[data-confirm-kicker]");
  const confirmTitle = document.querySelector("[data-confirm-title]");
  const confirmCopy = document.querySelector("[data-confirm-copy]");
  const confirmFeedback = document.querySelector("[data-confirm-feedback]");
  const confirmSubmitButton = document.querySelector("[data-confirm-submit]");
  const CONFIRM_DIALOG_DEFINITIONS = {
    mail_feed_delete(context = {}) {
      const normalizedFeed = normalizeKey(context.feed) === "later" ? "later" : "sent";
      const count = Math.max(1, asNumber(context.count, 1));
      return {
        kicker: normalizedFeed === "later" ? "Radera senare" : "Radera skickade",
        title: `Radera ${count} markerade ${count === 1 ? "tråd" : "trådar"}?`,
        copy:
          normalizedFeed === "later"
            ? "De markerade trådarna tas bort från Senare och flyttas till papperskorgen."
            : "De markerade skickade trådarna tas bort från feeden och flyttas till papperskorgen.",
        confirmLabel: count === 1 ? "Radera tråd" : "Radera trådar",
        tone: "danger",
      };
    },
    macro_delete(context = {}) {
      const macroTitle = asText(context.macroTitle, "det här makrot");
      return {
        kicker: "Radera makro",
        title: `Radera "${macroTitle}"?`,
        copy: "Makrot tas bort från biblioteket och kan inte köras igen utan att skapas på nytt.",
        confirmLabel: "Radera makro",
        tone: "danger",
      };
    },
    delete_account_request() {
      return {
        kicker: "Kontoradering",
        title: "Skicka raderingsbegäran?",
        copy: "Detta markerar kontot för radering i backend och kräver efterföljande administrativ hantering.",
        confirmLabel: "Skicka begäran",
        tone: "danger",
      };
    },
  };
  const customerList = document.querySelector("[data-customer-list]");
  const customerMergeGroupsHost = document.querySelector("[data-customer-merge-groups]");
  const customerDetailStack = document.querySelector("[data-customer-detail-stack]");
  const customerBulkCount = document.querySelector("[data-customer-bulk-count]");
  const customerDetailName = document.querySelector("[data-customer-detail-name]");
  const customerEmailList = document.querySelector("[data-customer-email-list]");
  const customerDetailActionButtons = Array.from(
    document.querySelectorAll("[data-customer-detail-action]")
  );
  const customerMergeShell = document.getElementById("customers-merge-shell");
  const customerMergeCloseButtons = Array.from(
    document.querySelectorAll("[data-customer-merge-close]")
  );
  const customerMergePreview = document.querySelector("[data-customer-merge-preview]");
  const customerMergePrimaryOptions = document.querySelector(
    "[data-customer-merge-primary-options]"
  );
  const customerMergeOptionInputs = Array.from(
    document.querySelectorAll("[data-customer-merge-option]")
  );
  const customerMergeFeedback = document.querySelector("[data-customer-merge-feedback]");
  const customerMergeConfirmButton = document.querySelector("[data-customer-merge-confirm]");
  const customerSettingsShell = document.getElementById("customers-settings-shell");
  const customerSettingsCloseButtons = Array.from(
    document.querySelectorAll("[data-customer-settings-close]")
  );
  const customerSettingToggleInputs = Array.from(
    document.querySelectorAll("[data-customer-setting-toggle]")
  );
  const customerSettingsFeedback = document.querySelector(
    "[data-customer-settings-feedback]"
  );
  const customerSplitShell = document.getElementById("customers-split-shell");
  const customerSplitCloseButtons = Array.from(
    document.querySelectorAll("[data-customer-split-close]")
  );
  const customerSplitTitle = document.querySelector("[data-customer-split-title]");
  const customerSplitOptions = document.querySelector("[data-customer-split-options]");
  const customerSplitFeedback = document.querySelector("[data-customer-split-feedback]");
  const customerSplitConfirmButton = document.querySelector("[data-customer-split-confirm]");
  const customerImportShell = document.getElementById("customers-import-shell");
  const customerImportCloseButtons = Array.from(
    document.querySelectorAll("[data-customer-import-close]")
  );
  const customerImportFileInput = document.querySelector("[data-customer-import-file]");
  const customerImportTextInput = document.querySelector("[data-customer-import-text]");
  const customerImportFileName = document.querySelector("[data-customer-import-file-name]");
  const customerImportSummary = document.querySelector("[data-customer-import-summary]");
  const customerImportPreviewList = document.querySelector("[data-customer-import-preview]");
  const customerImportFeedback = document.querySelector("[data-customer-import-feedback]");
  const customerImportPreviewButton = document.querySelector(
    "[data-customer-import-preview-action]"
  );
  const customerImportCommitButton = document.querySelector("[data-customer-import-commit]");
  const automationCollaborationToggleButtons = Array.from(
    document.querySelectorAll("[data-automation-collaboration-toggle]")
  );
  const automationCollaborationPanel = document.querySelector(
    "[data-automation-collaboration]"
  );
  const ADMIN_TOKEN_STORAGE_KEY = "ARCANA_ADMIN_TOKEN";
  const AUTH_RETURN_TO_QUERY_PARAM = "next";

  if (!canvas || !previewWorkspace || !previewShell || !focusShell || !studioShell || !noteShell || !scheduleShell || !laterShell) {
    return;
  }

  const PREVIEW_CONFIG = window.MajorArcanaPreviewConfig;
  const PREVIEW_THREAD_OPS = window.MajorArcanaPreviewThreadOps;
  const PREVIEW_ACTION_ENGINE = window.MajorArcanaPreviewActionEngine;
  const PREVIEW_WORKSPACE_STATE = window.MajorArcanaPreviewWorkspaceState;
  const PREVIEW_FOCUS_INTEL_RENDERERS = window.MajorArcanaPreviewFocusIntelRenderers;
  const PREVIEW_QUEUE_RENDERERS = window.MajorArcanaPreviewQueueRenderers;
  const PREVIEW_OVERLAY_RENDERERS = window.MajorArcanaPreviewOverlayRenderers;
  const PREVIEW_ASYNC_ORCHESTRATION = window.MajorArcanaPreviewAsyncOrchestration;
  const PREVIEW_DOM_LIVE_COMPOSITION = window.MajorArcanaPreviewDomLiveComposition;

  if (!PREVIEW_CONFIG) {
    console.error("Major Arcana preview-config saknas.");
    return;
  }

  if (!PREVIEW_THREAD_OPS) {
    console.error("Major Arcana preview thread-ops saknas.");
    return;
  }

  if (!PREVIEW_ACTION_ENGINE) {
    console.error("Major Arcana preview action-engine saknas.");
    return;
  }

  if (!PREVIEW_WORKSPACE_STATE) {
    console.error("Major Arcana preview workspace-state saknas.");
    return;
  }

  if (!PREVIEW_FOCUS_INTEL_RENDERERS) {
    console.error("Major Arcana preview focus/intel-renderers saknas.");
    return;
  }

  if (!PREVIEW_QUEUE_RENDERERS) {
    console.error("Major Arcana preview queue-renderers saknas.");
    return;
  }

  if (!PREVIEW_OVERLAY_RENDERERS) {
    console.error("Major Arcana preview overlay-renderers saknas.");
    return;
  }

  if (!PREVIEW_ASYNC_ORCHESTRATION) {
    console.error("Major Arcana preview async-orchestration saknas.");
    return;
  }

  if (!PREVIEW_DOM_LIVE_COMPOSITION) {
    console.error("Major Arcana preview dom/live-composition saknas.");
    return;
  }

  const {
    DEFAULT_WORKSPACE,
    FOCUS_ACTIONS,
    FOCUS_SIGNALS,
    INTEL_ACTIONS,
    MIN_INTEL_WIDTH,
    MIN_QUEUE_WIDTH,
    NOTE_MODE_PRESETS,
    PILL_ICON_SVGS,
    PRIORITY_LABELS,
    QUEUE_ACTIONS,
    QUEUE_LANE_LABELS,
    QUEUE_LANE_ORDER,
    VISIBILITY_LABELS,
  } = PREVIEW_CONFIG;

  const openButtons = document.querySelectorAll("[data-studio-open]");
  const closeButtons = document.querySelectorAll("[data-studio-close]");
  const contextButtons = document.querySelectorAll("[data-studio-context-toggle]");
  const noteOpenButtons = document.querySelectorAll("[data-note-open]");
  const noteCloseButtons = document.querySelectorAll("[data-note-close]");
  const noteSaveButton = document.querySelector("[data-note-save]");
  const noteFeedback = document.querySelector("[data-note-feedback]");
  const noteText = document.querySelector("[data-note-text]");
  const noteTagInput = document.querySelector("[data-note-tag-input]");
  const noteTagAddButton = document.querySelector("[data-note-tag-add]");
  const notePrioritySelect = document.querySelector("[data-note-priority]");
  const noteVisibilitySelect = document.querySelector("[data-note-visibility]");
  const scheduleOpenButtons = document.querySelectorAll("[data-schedule-open]");
  const scheduleCloseButtons = document.querySelectorAll("[data-schedule-close]");
  const scheduleSaveButton = document.querySelector("[data-schedule-save]");
  const scheduleFeedback = document.querySelector("[data-schedule-feedback]");
  const laterCloseButtons = document.querySelectorAll("[data-later-close]");
  const laterOptionButtons = Array.from(document.querySelectorAll("[data-later-option]"));
  const destinationButtons = Array.from(
    document.querySelectorAll("[data-note-destination-group] .note-destination")
  );
  const templateButtons = Array.from(
    document.querySelectorAll("[data-note-template-group] .note-template-pill")
  );
  const targetLabel = document.querySelector("[data-note-target-label]");
  const noteLivePreview = document.querySelector("[data-note-live-preview]");
  const noteDataStack = document.querySelector("[data-note-data-stack]");
  const noteLinkedList = document.querySelector("[data-note-linked-list]");
  const noteTagsRow = document.querySelector("[data-note-tags]");
  const noteCount = document.querySelector("[data-note-count]");
  const conversationCollapseButton = document.querySelector(".conversation-collapse");
  const conversationHistory = document.getElementById("focus-conversation-history");
  const resizeHandles = Array.from(document.querySelectorAll("[data-resize-handle]"));
  const queueContent = document.querySelector(".thread-stack");
  const queueTitle = document.querySelector("[data-queue-title]");
  const queueSummaryFocus = document.querySelector('[data-queue-summary="focus"]');
  const queueSummaryActNow = document.querySelector('[data-queue-summary="act-now"]');
  const queueSummarySprint = document.querySelector('[data-queue-summary="sprint"]');
  const queueSummaryRisk = document.querySelector("[data-queue-summary-risk]");
  const queuePrimaryLaneTag = document.querySelector('.lane-tag[data-queue-lane="all"]');
  const queueActiveLaneLabel = document.querySelector("[data-queue-active-lane-label]");
  const queueLaneCountNodes = Array.from(document.querySelectorAll("[data-queue-lane-count]"));
  const queueLaneButtons = Array.from(document.querySelectorAll("[data-queue-lane]"));
  const queueCollapsedList = document.querySelector(".collapsed-list");
  const queueHistoryShell = document.querySelector("[data-queue-history-shell]");
  const queueHistoryToggle = document.querySelector("[data-queue-history-toggle]");
  const queueHistoryPanel = document.querySelector("[data-queue-history-panel]");
  const queueHistoryHead = document.querySelector(".queue-history-head");
  const queueHistoryList = document.querySelector("[data-queue-history-list]");
  const queueHistoryMeta = document.querySelector("[data-queue-history-meta]");
  const queueHistoryCount = document.querySelector("[data-queue-history-count]");
  const queueHistoryLoadMoreButton = document.querySelector("[data-queue-history-load-more]");
  const mailboxTriggerLabel = document.querySelector("[data-mailbox-trigger-label]");
  const ownerTriggerLabel = document.querySelector("[data-owner-trigger-label]");
  const mailboxMenuGrid = document.querySelector("[data-mailbox-menu-grid]");
  const ownerMenuGrid = document.querySelector("[data-owner-menu-grid]");
  const ownerMenuToggle = document.getElementById("owner-menu-toggle");
  const focusTitle = document.getElementById("focus-title");
  const focusStatusLine = document.querySelector("[data-focus-status-line]");
  const focusBadgeRow = document.querySelector("[data-focus-badge-row]");
  const focusConversationSection = document.querySelector("[data-focus-conversation]");
  const focusCustomerHero = document.querySelector("[data-focus-customer-hero]");
  const focusCustomerSummary = document.querySelector("[data-focus-customer-summary]");
  const focusCustomerStats = document.querySelector("[data-focus-customer-stats]");
  const focusCustomerGrid = document.querySelector("[data-focus-customer-grid]");
  const focusCustomerHistoryTitle = document.querySelector("[data-focus-customer-history-title]");
  const focusCustomerHistoryDescription = document.querySelector(
    "[data-focus-customer-history-description]"
  );
  const focusIntelTitle = document.getElementById("focus-intel-title");
  const intelDateButton = document.querySelector("[data-intel-date]");
  const intelCustomer = document.querySelector("[data-intel-customer]");
  const intelGrid = document.querySelector("[data-intel-grid]");
  const intelReasonCopy = document.querySelector("[data-intel-reason-copy]");
  const intelPanelOverview = document.querySelector('[data-intel-panel-group="overview"]');
  const intelPanelAi = document.querySelector('[data-intel-panel-group="ai"]');
  const intelPanelMedicine = document.querySelector('[data-intel-panel-group="medicine"]');
  const intelPanelTeam = document.querySelector('[data-intel-panel-group="team"]');
  const intelPanelActions = document.querySelector('[data-intel-panel-group="actions"]');
  const scheduleCustomerInput = document.querySelector("[data-schedule-customer]");
  const scheduleCategoryPill = document.querySelector("[data-schedule-category-pill]");
  const scheduleCustomerPill = document.querySelector("[data-schedule-customer-pill]");
  const scheduleDateInput = document.querySelector("[data-schedule-date]");

  const scheduleTimeInput = document.querySelector("[data-schedule-time]");
  const scheduleDoctorSelect = document.querySelector("[data-schedule-doctor]");
  const scheduleCategorySelect = document.querySelector("[data-schedule-category]");
  const scheduleReminderSelect = document.querySelector("[data-schedule-reminder]");
  const scheduleNotesTextarea = document.querySelector("[data-schedule-notes]");
  const scheduleDateHint = document.querySelector("[data-schedule-date-hint]");
  const scheduleTimeHint = document.querySelector("[data-schedule-time-hint]");
  const scheduleDoctorHint = document.querySelector("[data-schedule-doctor-hint]");
  const scheduleCategoryHint = document.querySelector("[data-schedule-category-hint]");
  const scheduleReminderHint = document.querySelector("[data-schedule-reminder-hint]");
  const scheduleNotesHint = document.querySelector("[data-schedule-notes-hint]");
  const scheduleLinkedList = document.querySelector("[data-schedule-linked-list]");
  const scheduleRecommendationCards = Array.from(
    document.querySelectorAll("[data-schedule-rec]")
  );
  const threadContextRows = Array.from(document.querySelectorAll("[data-thread-context]"));
  const queueActionRows = Array.from(document.querySelectorAll("[data-queue-actions]"));
  const focusSignalRows = Array.from(document.querySelectorAll("[data-focus-signals]"));
  const focusActionRows = Array.from(document.querySelectorAll("[data-focus-actions]"));
  const intelActionRows = Array.from(document.querySelectorAll("[data-intel-actions]"));
  let customerRows = Array.from(document.querySelectorAll("[data-customer-row]"));
  const customerSearchInput = document.querySelector("[data-customer-search]");
  const customerFilterSelect = document.querySelector("[data-customer-filter]");
  const customerCommandButtons = Array.from(
    document.querySelectorAll("[data-customer-command]")
  );
  const customerSuggestionsToggle = document.querySelector(
    "[data-customer-suggestions-toggle]"
  );
  const customerSuggestionsPanel = document.querySelector(
    ".customers-rail-panel-suggestions"
  );
  const customerStatus = document.querySelector("[data-customers-status]");
  const customerMetricCards = Array.from(document.querySelectorAll("[data-customer-metric]"));
  let customerMergeGroups = Array.from(
    document.querySelectorAll("[data-customer-merge-group]")
  );
  let customerDetailCards = Array.from(
    document.querySelectorAll("[data-customer-detail]")
  );
  const automationLibraryItems = Array.from(
    document.querySelectorAll("[data-automation-library]")
  );
  const automationNodes = Array.from(document.querySelectorAll("[data-automation-node]"));
  const automationSuggestionCards = Array.from(
    document.querySelectorAll("[data-automation-suggestion]")
  );
  const automationSubnavPills = Array.from(
    document.querySelectorAll(".automation-subnav-pill")
  );
  const automationViews = Array.from(document.querySelectorAll("[data-automation-view]"));
  const automationJumpButtons = Array.from(
    document.querySelectorAll("[data-automation-jump]")
  );
  const automationTemplateCards = Array.from(
    document.querySelectorAll("[data-automation-template]")
  );
  const automationTemplateActionButtons = Array.from(
    document.querySelectorAll("[data-automation-template-action]")
  );
  const analyticsPeriodButtons = Array.from(
    document.querySelectorAll("[data-analytics-period]")
  );
  const analyticsMetricValueNodes = Array.from(
    document.querySelectorAll("[data-analytics-metric-value]")
  );
  const analyticsMetricTrendNodes = Array.from(
    document.querySelectorAll(
      ".analytics-section:not(.analytics-section-live) .analytics-metric-card .analytics-metric-trend"
    )
  );
  const analyticsSelfValueNodes = Array.from(
    document.querySelectorAll("[data-analytics-self-value]")
  );
  const analyticsSelfCaptionNodes = Array.from(
    document.querySelectorAll("[data-analytics-self-caption]")
  );
  const analyticsLeaderboardRows = Array.from(
    document.querySelectorAll("[data-analytics-leaderboard-row]")
  );
  const analyticsTemplateRows = Array.from(
    document.querySelectorAll("[data-analytics-template-row]")
  );
  const analyticsStatus = document.querySelector("[data-analytics-status]");
  const analyticsLiveCards = Array.from(
    document.querySelectorAll("[data-analytics-live-card]")
  );
  const analyticsLiveNarratives = document.querySelector("[data-analytics-live-narratives]");
  const analyticsCoachingAction = document.querySelector("[data-analytics-coaching-action]");
  const analyticsCoachingCopy = document.querySelector(".analytics-coaching-copy p");
  const analyticsCoachingLabel = document.querySelector(".analytics-coaching-copy span");
  const automationVersionCards = Array.from(
    document.querySelectorAll("[data-automation-version]")
  );
  const automationVersionDetails = Array.from(
    document.querySelectorAll("[data-automation-version-detail]")
  );
  const automationVersionActionButtons = Array.from(
    document.querySelectorAll("[data-automation-version-action]")
  );
  const automationStatus = document.querySelector("[data-automation-status]");
  const automationRunButton = document.querySelector(".automation-run-button");
  const automationSaveButton = document.querySelector(".automation-save-button");
  const automationRail = document.querySelector(".automation-rail");
  const automationRailToggle = document.querySelector("[data-automation-rail-toggle]");
  const automationCanvasScaleButtons = Array.from(
    document.querySelectorAll("[data-automation-scale]")
  );
  const automationCanvasScaleReadout = document.querySelector(
    "[data-automation-scale-readout]"
  );
  const automationCanvasAddButton = document.querySelector("[data-automation-add-step]");
  const automationAnalysisActionButtons = Array.from(
    document.querySelectorAll("[data-automation-analysis-action]")
  );
  const automationSuggestionActionButtons = Array.from(
    document.querySelectorAll("[data-automation-suggestion-action]")
  );
  const automationTestingActionButtons = Array.from(
    document.querySelectorAll("[data-automation-testing-action]")
  );
  const automationTestingLogList = document.querySelector(".automation-testing-log-list");
  const automationTestingValidationTitle = document.querySelector(
    ".automation-testing-validation h3"
  );
  const automationTestingValidationList = document.querySelector(
    ".automation-testing-validation ul"
  );
  const automationTestingConfigValues = Array.from(
    document.querySelectorAll(".automation-testing-config-grid strong")
  );
  const automationAutopilotToggle = document.querySelector(
    "[data-automation-autopilot-toggle]"
  );
  const automationAutopilotStatusCard = document.querySelector(
    "[data-automation-autopilot-status]"
  );
  const automationAutopilotProposalCards = Array.from(
    document.querySelectorAll("[data-automation-autopilot-proposal]")
  );
  const automationAutopilotActionButtons = Array.from(
    document.querySelectorAll("[data-automation-autopilot-action]")
  );
  const automationAutopilotPendingLabel = document.querySelector(
    ".automation-autopilot-stack-label span"
  );
  const automationAutopilotMetricCards = Array.from(
    document.querySelectorAll(".automation-autopilot-metric")
  );
  const automationAutopilotRecentList = document.querySelector(
    ".automation-autopilot-recent-list"
  );
  const automationAutopilotFootCards = Array.from(
    document.querySelectorAll(".automation-autopilot-foot-card")
  );
  const automationTitleHeading = document.getElementById("automation-title");
  const automationAnalysisTitle = document.querySelector(".automation-analysis-title h2");
  const automationTemplatesTitle = document.querySelector(".automation-templates-title h2");
  const automationTestingTitle = document.querySelector(".automation-testing-title h2");
  const automationVersionsTitle = document.querySelector(".automation-versions-title h2");
  const automationAutopilotTitle = document.querySelector(".automation-autopilot-title h2");
  const focusHistoryList = document.querySelector("[data-focus-history-list]");
  const focusHistoryCount = document.querySelector("[data-focus-history-count]");
  const focusHistoryMeta = document.querySelector("[data-focus-history-meta]");
  const focusHistorySearchInput = document.querySelector("[data-focus-history-search]");
  const focusHistoryMailboxRow = document.querySelector("[data-focus-history-mailbox-row]");
  const focusHistoryTypeRow = document.querySelector("[data-focus-history-type-row]");
  const focusHistoryRangeRow = document.querySelector("[data-focus-history-range-row]");
  const focusHistoryReadoutButton = document.querySelector("[data-focus-history-readout]");
  const focusHistoryDeleteButton = document.querySelector("[data-focus-history-delete]");
  const focusHistoryScope = document.querySelector("[data-focus-history-scope]");
  const focusHistoryTitle = document.querySelector("[data-focus-history-title]");
  const focusHistoryDescription = document.querySelector("[data-focus-history-description]");
  const focusCustomerHistoryList = document.querySelector("[data-focus-customer-history-list]");
  const focusCustomerHistoryCount = document.querySelector("[data-focus-customer-history-count]");
  const focusCustomerHistoryMeta = document.querySelector("[data-focus-customer-history-meta]");
  const focusCustomerHistoryReadoutButton = document.querySelector(
    "[data-focus-customer-history-readout]"
  );
  const focusNotesList = document.querySelector("[data-focus-notes-list]");
  const focusNotesCount = document.querySelector("[data-focus-notes-count]");
  const focusNotesEmpty = document.querySelector("[data-focus-notes-empty]");
  const focusNotesRefreshButton = document.querySelector("[data-focus-notes-refresh]");
  const studioTitle = document.querySelector("[data-studio-title]");
  const studioToolbarPills = {
    intent: document.querySelector('[data-studio-toolbar-pill="intent"]'),
    priority: document.querySelector('[data-studio-toolbar-pill="priority"]'),
    value: document.querySelector('[data-studio-toolbar-pill="value"]'),
  };
  const studioAvatar = document.querySelector("[data-studio-avatar]");
  const studioCustomerName = document.querySelector("[data-studio-customer-name]");
  const studioCustomerMood = document.querySelector("[data-studio-customer-mood]");
  const studioCustomerEmail = document.querySelector("[data-studio-customer-email]");
  const studioCustomerPhone = document.querySelector("[data-studio-customer-phone]");
  const studioNextActionTitle = document.querySelector("[data-studio-next-action-title]");
  const studioNextActionNote = document.querySelector("[data-studio-next-action-note]");
  const studioPrimarySuggestion = document.querySelector("[data-studio-primary-suggestion]");
  const studioPrimarySuggestionLabel = document.querySelector(
    "[data-studio-primary-suggestion-label]"
  );
  const studioWhyInFocus = document.querySelector("[data-studio-why-in-focus]");
  const studioStatusValueNodes = {
    owner: document.querySelector('[data-studio-status-value="owner"]'),
    status: document.querySelector('[data-studio-status-value="status"]'),
    sla: document.querySelector('[data-studio-status-value="sla"]'),
    risk: document.querySelector('[data-studio-status-value="risk"]'),
  };
  const studioMiniValueNodes = {
    risk: document.querySelector('[data-studio-mini-value="risk"]'),
    engagement: document.querySelector('[data-studio-mini-value="engagement"]'),
  };
  const studioContextSummaryNodes = {
    ai: document.querySelector('[data-studio-context-summary="ai"]'),
  };
  const studioContextListNodes = {
    ai: document.querySelector('[data-studio-context-list="ai"]'),
    history: document.querySelector('[data-studio-context-list="history"]'),
    preferences: document.querySelector('[data-studio-context-list="preferences"]'),
    recommendations: document.querySelector('[data-studio-context-list="recommendations"]'),
  };
  const studioIncomingAvatar = document.querySelector("[data-studio-incoming-avatar]");
  const studioIncomingName = document.querySelector("[data-studio-incoming-name]");
  const studioIncomingTime = document.querySelector("[data-studio-incoming-time]");
  const studioIncomingLabel = document.querySelector("[data-studio-incoming-label]");
  const studioIncomingBody = document.querySelector("[data-studio-incoming-body]");
  const studioTemplateButtons = Array.from(document.querySelectorAll("[data-studio-template]"));
  const studioComposeToInput = document.querySelector("[data-studio-compose-to]");
  const studioComposeSubjectInput = document.querySelector("[data-studio-compose-subject]");
  const studioEditorRecipient = document.querySelector("[data-studio-editor-recipient]");
  const studioEditorInput = document.querySelector("[data-studio-editor-input]");
  const studioEditorWordCount = document.querySelector("[data-studio-editor-wordcount]");
  const studioEditorSummary = document.querySelector("[data-studio-editor-summary]");
  const studioPolicyPill = document.querySelector("[data-studio-policy]");
  const studioSignatureButtons = Array.from(document.querySelectorAll("[data-studio-signature]"));
  const studioTrackButtons = Array.from(document.querySelectorAll("[data-studio-track]"));
  const studioToneButtons = Array.from(document.querySelectorAll("[data-studio-tone]"));
  const studioRefineButtons = Array.from(document.querySelectorAll("[data-studio-refine]"));
  const studioToolButtons = Array.from(document.querySelectorAll("[data-studio-tool]"));
  const studioSendButton = document.querySelector("[data-studio-send]");
  const studioSendLabel = document.querySelector("[data-studio-send-label]");
  const studioPreviewButton = document.querySelector("[data-studio-preview]");
  const studioSaveDraftButton = document.querySelector("[data-studio-save-draft]");
  const studioDeleteButton = document.querySelector("[data-studio-delete]");
  const studioFeedback = document.querySelector("[data-studio-feedback]");
  const studioPreviewActionButton = document.querySelector(".studio-secondary-button-preview");
  const studioLaterActionButton = document.querySelector(".studio-secondary-button-later");
  const studioDoneActionButton = document.querySelector(".studio-secondary-button-done");

  const THREAD_CONTEXT = {
    anna: {
      mailbox: "Kons",
      intent: "Oklart",
      deadline: "Ingen deadline",
    },
    erik: {
      mailbox: "Info",
      intent: "Oklart",
      deadline: "Ingen deadline",
    },
    maria: {
      mailbox: "Info",
      intent: "Oklart",
      deadline: "Ingen deadline",
    },
  };

  const CUSTOMER_DIRECTORY = {
    johan: {
      name: "Johan Andersson",
      vip: true,
      emailCoverage: 5,
      duplicateCandidate: true,
      profileCount: 3,
      customerValue: 52000,
      totalConversations: 28,
      totalMessages: 207,
    },
    emma: {
      name: "Emma Svensson",
      vip: true,
      emailCoverage: 3,
      duplicateCandidate: true,
      profileCount: 2,
      customerValue: 34500,
      totalConversations: 15,
      totalMessages: 112,
    },
    sara: {
      name: "Sara Lindström",
      vip: false,
      emailCoverage: 2,
      duplicateCandidate: true,
      profileCount: 1,
      customerValue: 18000,
      totalConversations: 8,
      totalMessages: 45,
    },
    johan_a: {
      name: "Johan A.",
      vip: false,
      emailCoverage: 2,
      duplicateCandidate: true,
      profileCount: 1,
      customerValue: 0,
      totalConversations: 1,
      totalMessages: 3,
    },
    erik: {
      name: "Erik Nilsson",
      vip: false,
      emailCoverage: 5,
      duplicateCandidate: false,
      profileCount: 1,
      customerValue: 12400,
      totalConversations: 6,
      totalMessages: 41,
    },
  };

  const CUSTOMER_NAME_TO_KEY = Object.fromEntries(
    Object.entries(CUSTOMER_DIRECTORY).map(([key, item]) => [normalizeKey(item.name), key])
  );

  const ANALYTICS_PERIOD_DATA = {
    today: {
      metrics: {
        reply_time: { value: "1h 48m", trend: "+6%", tone: "positive" },
        sla: { value: "97%", trend: "+4%", tone: "positive" },
        conversations: { value: "18", trend: "", tone: "" },
        csat: { value: "4.9/5", trend: "+3%", tone: "positive" },
      },
      self: {
        closed: "14",
        self_reply_time: "1h 34m",
        templates: "91%",
        upsell: "1 600 kr",
        upsell_count: "1",
        upsellCaption: "intäkt idag",
      },
      leaderboard: [
        { medal: "🏆", name: "Sara L.", score: "18" },
        { medal: "🥈", name: "Egzona K.", score: "16" },
        { medal: "🥉", name: "Johan B.", score: "15" },
      ],
      templates: {
        booking_confirmation: { label: "Bokningsbekräftelse", share: "17%", width: "78%" },
        pricing: { label: "Prissättning", share: "11%", width: "58%" },
        reschedule: { label: "Föreslå ny tid", share: "15%", width: "72%" },
      },
      coaching: {
        label: "Coachningsinsikt",
        copy:
          "Du svarar snabbt idag. Fortsätt med mallar för prisfrågor så håller du svarstiden under två timmar.",
        action: "Visa prismall",
      },
    },
    week: {
      metrics: {
        reply_time: { value: "2h 14m", trend: "-12%", tone: "negative" },
        sla: { value: "94%", trend: "+3%", tone: "positive" },
        conversations: { value: "47", trend: "", tone: "" },
        csat: { value: "4.7/5", trend: "+5%", tone: "positive" },
      },
      self: {
        closed: "47",
        self_reply_time: "1h 52m",
        templates: "89%",
        upsell: "4 200 kr",
        upsell_count: "3",
        upsellCaption: "intäkt genererad",
      },
      leaderboard: [
        { medal: "🏆", name: "Sara L.", score: "62" },
        { medal: "🥈", name: "Egzona K.", score: "58" },
        { medal: "🥉", name: "Johan B.", score: "53" },
      ],
      templates: {
        booking_confirmation: { label: "Bokningsbekräftelse", share: "14%", width: "82%" },
        pricing: { label: "Prissättning", share: "12%", width: "67%" },
        reschedule: { label: "Föreslå ny tid", share: "11%", width: "86%" },
      },
      coaching: {
        label: "Coachningsinsikt",
        copy:
          "Du är 23% långsammare på prisfrågor jämfört med ditt genomsnitt. Överväg att använda “Prissättning”-mallen oftare för att spara tid.",
        action: "Visa prismall",
      },
    },
    month: {
      metrics: {
        reply_time: { value: "2h 02m", trend: "-4%", tone: "negative" },
        sla: { value: "95%", trend: "+2%", tone: "positive" },
        conversations: { value: "182", trend: "", tone: "" },
        csat: { value: "4.8/5", trend: "+2%", tone: "positive" },
      },
      self: {
        closed: "184",
        self_reply_time: "1h 49m",
        templates: "87%",
        upsell: "14 800 kr",
        upsell_count: "11",
        upsellCaption: "månatlig intäkt",
      },
      leaderboard: [
        { medal: "🏆", name: "Sara L.", score: "241" },
        { medal: "🥈", name: "Egzona K.", score: "229" },
        { medal: "🥉", name: "Johan B.", score: "211" },
      ],
      templates: {
        booking_confirmation: { label: "Bokningsbekräftelse", share: "18%", width: "84%" },
        pricing: { label: "Prissättning", share: "15%", width: "73%" },
        reschedule: { label: "Föreslå ny tid", share: "16%", width: "88%" },
      },
      coaching: {
        label: "Coachningsinsikt",
        copy:
          "Månadstrenden visar att bokningsbekräftelser driver bäst tempo. Låt prismallar avlasta när inflödet ökar.",
        action: "Öppna mallbibliotek",
      },
    },
  };

  const AUTOMATION_TEMPLATE_CONFIGS = {
    churn_guard: {
      flowTitle: "VIP-onboardingsekvens",
      analysisTitle: 'Prestandainsikter för “VIP-onboardingsekvens”',
      templatesTitle: "Färdiga arbetsflöden från communityn",
      testingTitle: "Testkörning med simulerad data",
      versionsTitle: "Spara ändringar och återställ vid behov",
      autopilotTitle: "Intelligent självoptimering",
      testingConfig: {
        customer: "Emma Andersson",
        trigger: "customer.create",
        time: "2026-03-27 10:00",
      },
      nodes: {
        trigger: {
          title: "Ny VIP-kund",
          lines: ["Händelse: customer.created", "Filter: isVIP = true"],
        },
        welcome: {
          title: "Skicka välkomstmejl",
          lines: ["Mall: vip-welcome", "Till: {{customer.email}}"],
        },
        assign: {
          title: "Tilldela senior",
          lines: ["Tilldela till: senior-specialist"],
        },
        wait: {
          title: "Vänta 3 dagar",
          lines: ["Varaktighet: 3d"],
        },
        condition: {
          title: "Kontrollera engagemang",
          lines: ["Villkor: email.opened = true"],
        },
        guide: {
          title: "Skicka produktguide",
          lines: ["Mall: product-tour"],
        },
        reminder: {
          title: "Uppföljningspåminnelse",
          lines: ["Mall: vip-reminder"],
        },
      },
    },
    upsell_flow: {
      flowTitle: "Merförsäljningssekvens",
      analysisTitle: 'Prestandainsikter för “Merförsäljningssekvens”',
      templatesTitle: "Utvalda mallar för merförsäljning och uppgradering",
      testingTitle: "Testkörning för merförsäljningsflöde",
      versionsTitle: "Versioner för merförsäljningsflödet",
      autopilotTitle: "Autopilot för merförsäljning",
      testingConfig: {
        customer: "Johan Andersson",
        trigger: "purchase.completed",
        time: "2026-03-27 13:30",
      },
      nodes: {
        trigger: {
          title: "Nylig behandling klar",
          lines: ["Händelse: purchase.completed", "Filter: package = premium"],
        },
        welcome: {
          title: "Skicka uppgraderingsmejl",
          lines: ["Mall: upsell-offer", "Till: {{customer.email}}"],
        },
        assign: {
          title: "Flagga ansvarig agent",
          lines: ["Tilldela till: revenue-specialist"],
        },
        wait: {
          title: "Vänta 2 dagar",
          lines: ["Varaktighet: 2d"],
        },
        condition: {
          title: "Kontrollera intresse",
          lines: ["Villkor: email.clicked = true"],
        },
        guide: {
          title: "Skicka behandlingsguide",
          lines: ["Mall: product-tour-plus"],
        },
        reminder: {
          title: "Skicka påminnelse",
          lines: ["Mall: upsell-reminder"],
        },
      },
    },
    sla_guardian: {
      flowTitle: "SLA-väktare",
      analysisTitle: 'Prestandainsikter för “SLA-väktare”',
      templatesTitle: "Utvalda mallar för SLA, fallback och eskalering",
      testingTitle: "Testkörning för SLA-vakt",
      versionsTitle: "Versioner för SLA-väktare",
      autopilotTitle: "Autopilot för SLA-övervakning",
      testingConfig: {
        customer: "Sara Lindström",
        trigger: "message.inbound",
        time: "2026-03-27 08:45",
      },
      nodes: {
        trigger: {
          title: "Inkommande fråga",
          lines: ["Händelse: message.inbound", "Filter: slaRisk = high"],
        },
        welcome: {
          title: "Skicka första svar",
          lines: ["Mall: sla-first-touch", "Till: {{customer.email}}"],
        },
        assign: {
          title: "Eskalera till senior",
          lines: ["Tilldela till: queue-sla"],
        },
        wait: {
          title: "Vänta 2 timmar",
          lines: ["Varaktighet: 2h"],
        },
        condition: {
          title: "Kontrollera fallback-slot",
          lines: ["Villkor: reply.received = false"],
        },
        guide: {
          title: "Skicka återkopplingsguide",
          lines: ["Mall: sla-guidance"],
        },
        reminder: {
          title: "Skicka SLA-påminnelse",
          lines: ["Mall: sla-reminder"],
        },
      },
    },
    holiday_outreach: {
      flowTitle: "Helg-autosvar",
      analysisTitle: 'Prestandainsikter för “Helg-autosvar”',
      templatesTitle: "Mallar för helg- och frånvaroflöden",
      testingTitle: "Testkörning för helg-autosvar",
      versionsTitle: "Versioner för helg-autosvar",
      autopilotTitle: "Autopilot för helgflöden",
      testingConfig: {
        customer: "Erik Nilsson",
        trigger: "mailbox.out_of_office",
        time: "2026-03-27 17:00",
      },
      nodes: {
        trigger: {
          title: "Helgläge aktiverat",
          lines: ["Händelse: mailbox.out_of_office", "Filter: day = friday"],
        },
        welcome: {
          title: "Skicka autosvar",
          lines: ["Mall: holiday-autoreply", "Till: {{customer.email}}"],
        },
        assign: {
          title: "Märk fallback-ansvarig",
          lines: ["Tilldela till: support-duty"],
        },
        wait: {
          title: "Vänta till måndag",
          lines: ["Varaktighet: 60h"],
        },
        condition: {
          title: "Kontrollera ny aktivitet",
          lines: ["Villkor: email.replied = false"],
        },
        guide: {
          title: "Skicka kontaktguide",
          lines: ["Mall: emergency-guide"],
        },
        reminder: {
          title: "Skicka måndagspåminnelse",
          lines: ["Mall: monday-restart"],
        },
      },
    },
    payment_reminder: {
      flowTitle: "Betalningspåminnelsesekvens",
      analysisTitle: 'Prestandainsikter för “Betalningspåminnelsesekvens”',
      templatesTitle: "Mallar för faktura, pris och betalningsuppföljning",
      testingTitle: "Testkörning för betalningspåminnelse",
      versionsTitle: "Versioner för betalningspåminnelser",
      autopilotTitle: "Autopilot för betalningsflöden",
      testingConfig: {
        customer: "Anna Karlsson",
        trigger: "invoice.overdue",
        time: "2026-03-27 11:15",
      },
      nodes: {
        trigger: {
          title: "Faktura förfallen",
          lines: ["Händelse: invoice.overdue", "Filter: amount > 0"],
        },
        welcome: {
          title: "Skicka betalningspåminnelse",
          lines: ["Mall: payment-reminder", "Till: {{customer.email}}"],
        },
        assign: {
          title: "Notera ekonomiansvarig",
          lines: ["Tilldela till: finance-ops"],
        },
        wait: {
          title: "Vänta 24 timmar",
          lines: ["Varaktighet: 24h"],
        },
        condition: {
          title: "Kontrollera betalning",
          lines: ["Villkor: invoice.paid = false"],
        },
        guide: {
          title: "Skicka betalningsplan",
          lines: ["Mall: payment-plan"],
        },
        reminder: {
          title: "Skicka eskalering",
          lines: ["Mall: payment-escalation"],
        },
      },
    },
    vip_fast_track: {
      flowTitle: "VIP Fast Track",
      analysisTitle: 'Prestandainsikter för “VIP Fast Track”',
      templatesTitle: "Premiummallar för VIP och snabbspår",
      testingTitle: "Testkörning för VIP Fast Track",
      versionsTitle: "Versioner för VIP Fast Track",
      autopilotTitle: "Autopilot för VIP Fast Track",
      testingConfig: {
        customer: "Johan Andersson",
        trigger: "vip.intent.detected",
        time: "2026-03-27 09:20",
      },
      nodes: {
        trigger: {
          title: "VIP-intent upptäckt",
          lines: ["Händelse: vip.intent.detected", "Filter: valueTier = premium"],
        },
        welcome: {
          title: "Skicka VIP-kort intro",
          lines: ["Mall: vip-fast-track", "Till: {{customer.email}}"],
        },
        assign: {
          title: "Tillsätt VIP-koordinator",
          lines: ["Tilldela till: vip-desk"],
        },
        wait: {
          title: "Vänta 6 timmar",
          lines: ["Varaktighet: 6h"],
        },
        condition: {
          title: "Kontrollera svarsvilja",
          lines: ["Villkor: email.opened = true"],
        },
        guide: {
          title: "Skicka premiumguide",
          lines: ["Mall: vip-guide"],
        },
        reminder: {
          title: "Skicka VIP-ping",
          lines: ["Mall: vip-ping"],
        },
      },
    },
  };

  const AUTOMATION_TEST_SCENARIOS = {
    baseline: {
      title: "Validering godkänd",
      items: [
        "Inga oändliga loopar upptäckta",
        "Alla obligatoriska fält finns",
        "SLA-begränsningar respekteras",
        "Felhantering konfigurerad",
      ],
      log: [
        { time: "10:00:00", title: "Arbetsflöde startat", copy: "", tone: "ok" },
        { time: "10:00:01", title: "Trigger: Ny VIP-kund", copy: "Kund: Emma Andersson", tone: "ok" },
        { time: "10:00:02", title: "Skicka välkomst-e-post", copy: "E-post-ID: email_123", tone: "ok" },
        { time: "10:00:03", title: "Tilldela till senior", copy: "Tilldelad till: Sara L.", tone: "ok" },
        { time: "10:00:04", title: "Vänta 3 dagar", copy: "Återupptas: 2026-03-30 10:00", tone: "wait" },
      ],
    },
    run: {
      title: "Validering godkänd",
      items: [
        "Körningen passerade utan regressionsvarning",
        "Villkorsgrenen gav förväntat utfall",
        "Fallback-spår verifierat i samma körning",
        "Felhantering svarade inom 2 sekunder",
      ],
      log: [
        { time: "10:00:00", title: "Arbetsflöde startat", copy: "", tone: "ok" },
        { time: "10:00:01", title: "Trigger: Ny VIP-kund", copy: "Kund: Emma Andersson", tone: "ok" },
        { time: "10:00:02", title: "Skicka välkomst-e-post", copy: "E-post-ID: email_123", tone: "ok" },
        { time: "10:00:03", title: "Tilldela till senior", copy: "Tilldelad till: Sara L.", tone: "ok" },
        { time: "10:00:04", title: "Vänta 3 dagar", copy: "Simulerad väntan klar", tone: "ok" },
        { time: "10:00:05", title: "Kontrollera engagemang", copy: "Villkor: email.opened = true", tone: "ok" },
        { time: "10:00:06", title: "Skicka produktguide", copy: "Mall: product-tour", tone: "ok" },
      ],
    },
    skip: {
      title: "Validering kräver uppföljning",
      items: [
        "Väntesteget hoppades över manuellt",
        "Fallback-mejl skickades för verifiering",
        "SLA-tak hölls i simulerad körning",
        "Lägg gärna till extra verifiering av CTA innan publicering",
      ],
      log: [
        { time: "10:00:00", title: "Arbetsflöde startat", copy: "", tone: "ok" },
        { time: "10:00:01", title: "Trigger: Ny VIP-kund", copy: "Kund: Emma Andersson", tone: "ok" },
        { time: "10:00:02", title: "Skicka välkomst-e-post", copy: "E-post-ID: email_123", tone: "ok" },
        { time: "10:00:03", title: "Tilldela till senior", copy: "Tilldelad till: Sara L.", tone: "ok" },
        { time: "10:00:04", title: "Vänta 3 dagar", copy: "Hoppades över för manuell verifikation", tone: "wait" },
        { time: "10:00:05", title: "Uppföljningspåminnelse", copy: "Mall: vip-reminder", tone: "ok" },
      ],
    },
  };

  const AUTOMATION_AUTOPILOT_BASE_RECENT = [
    { title: 'Minskade "Bokningsflöde" från 7 → 5 steg', stamp: "Idag", delta: "+6%" },
    { title: 'Ökade "Merförsäljningssekvens" konvertering', stamp: "Idag", delta: "+18%" },
    { title: "Auto-fixade 3 timeout-problem", stamp: "Igår", delta: "100% stabil" },
  ];

  const BASE_HISTORY_ITEMS = [
    {
      typeLabel: "E-post skickat",
      mailbox: "Kons",
      title: "RE: CCO-next live send inspect",
      text:
        "Detta är ett nytt verifieringsmail från CCO-next för att kontrollera den mail-säkra signaturversionen.",
      timestamp: "2026-03-26T21:39:00.000Z",
    },
    {
      typeLabel: "E-post skickat",
      mailbox: "Kons",
      title: "RE: CCO-next live send inspect",
      text:
        "Detta är ett nytt verifieringsmail från CCO-next för att kontrollera den omgjorda signaturpreviewn utan CSS-omritning.",
      timestamp: "2026-03-26T20:39:00.000Z",
    },
    {
      typeLabel: "E-post skickat",
      mailbox: "Kons",
      title: "RE: CCO-next live send inspect",
      text:
        "Detta är ett nytt verifieringsmail från CCO-next för att kontrollera den senaste signaturversionen.",
      timestamp: "2026-03-26T20:33:00.000Z",
    },
  ];

  const AUX_VIEWS = new Set([
    "later",
    "sent",
    "integrations",
    "macros",
    "settings",
    "showcase",
  ]);
  const AUTOMATION_VIEW_ALIASES = Object.freeze({
    templates: "mallar",
    workflows: "byggare",
  });

  const CUSTOMER_PROFILE_DETAILS = {
    johan: {
      emails: ["johan@gmail.com", "johan@hairtpclinic.com", "johan.a@newwork.se"],
      phone: "+46 70 123 4567",
      mailboxes: ["Kons", "Info", "Contact"],
    },
    emma: {
      emails: ["emma.svensson@gmail.com", "emma@workmail.se"],
      phone: "+46 72 456 7890",
      mailboxes: ["Kons", "Info"],
    },
    sara: {
      emails: ["sara.lindstrom@company.se"],
      phone: "+46 76 234 5678",
      mailboxes: ["Info", "Contact"],
    },
    johan_a: {
      emails: ["johan.a@newwork.se", "johan@gmail.com"],
      phone: "+46 70 123 4567",
      mailboxes: ["Kons", "Contact"],
    },
    erik: {
      emails: ["erik.nilsson@gmail.com", "erik@followup.se"],
      phone: "+46 73 345 6789",
      mailboxes: ["Info"],
    },
  };

  const DEFAULT_CUSTOMER_SETTINGS = {
    auto_merge: true,
    highlight_duplicates: true,
    strict_email: false,
  };

  const MAIL_FEEDS = {
    later: [
      {
        key: "anna_snooze",
        customerKey: "anna",
        customerName: "Anna Karlsson",
        mailbox: "Kons",
        title: "Återuppta med två eftermiddagstider",
        preview: "Snoozad efter reply-later. Kunden väntar på tydliga tider efter 15:00.",
        meta: "Återupptas idag 09:00",
      },
      {
        key: "vip_followup",
        customerKey: "johan",
        customerName: "Johan Andersson",
        mailbox: "Kons",
        title: "VIP-uppföljning efter fast track",
        preview: "Behöver återupptas när senior-specialisten bekräftar fallback-slot.",
        meta: "Återupptas imorgon 09:00",
      },
      {
        key: "pricing_hold",
        customerKey: "emma",
        customerName: "Emma Svensson",
        mailbox: "Info",
        title: "Prissättning pausad tills konsult återkommer",
        preview: "Väntar på internt klartecken innan nytt kundsvar skickas.",
        meta: "Återupptas måndag 09:00",
      },
    ],
    sent: [
      {
        key: "sent_1",
        customerKey: "anna",
        customerName: "Anna Karlsson",
        mailbox: "Kons",
        title: "RE: Bekräftad bokning för fredag 09:00",
        preview: "Skickat från Kons med mall 'Bokningsbekräftelse' och nästa steg i samma svar.",
        meta: "Idag 21:39",
      },
      {
        key: "sent_2",
        customerKey: "johan",
        customerName: "Johan Andersson",
        mailbox: "Info",
        title: "RE: VIP Fast Track - välkomstsekvens",
        preview: "Skickat från Info via automationen VIP Fast Track.",
        meta: "Idag 20:39",
      },
      {
        key: "sent_3",
        customerKey: "emma",
        customerName: "Emma Svensson",
        mailbox: "Kons",
        title: "RE: Föreslå ny tid",
        preview: "Skickat med mallen 'Föreslå ny tid' och tydlig fallback-slot.",
        meta: "Igår 18:05",
      },
    ],
  };

  const INTEGRATION_CATALOG = [
    {
      key: "calendly",
      category: "calendar",
      label: "Calendly",
      copy: "Bokning med ett klick direkt i konversationer, uppföljning och fokuserad kalenderstyrning.",
      owner: "Sara Lindberg",
      connected: true,
    },
    {
      key: "stripe",
      category: "payment",
      label: "Stripe",
      copy: "Skicka betalningslänkar, följ transaktioner och håll betalningspåminnelser i samma arbetsyta.",
      owner: "Finance Ops",
      connected: true,
    },
    {
      key: "twilio",
      category: "communication",
      label: "Twilio",
      copy: "Lägg till SMS och röstsamtal som fallback-kanal för svar senare, uppföljning och VIP-eskalering.",
      owner: "Customer Care",
      connected: false,
    },
    {
      key: "slack",
      category: "communication",
      label: "Slack",
      copy: "Skicka teamaviseringar, handoff-signaler och eskaleringslarm utan att lämna CCO.",
      owner: "Ops Lead",
      connected: true,
    },
    {
      key: "looker",
      category: "analytics",
      label: "Looker",
      copy: "Dela dashboards och analytics-exporter externt utan att skapa ett parallellt operativt flöde.",
      owner: "Data Team",
      connected: false,
    },
    {
      key: "zapier",
      category: "automation",
      label: "Zapier",
      copy: "Starta externa arbetsflöden från buildern utan att lämna automationsytan.",
      owner: "Automation Desk",
      connected: false,
    },
  ];

  const MACRO_LIBRARY = [
    {
      key: "pricing_followup",
      title: "Pris & finansieringsspår",
      tone: "violet",
      mode: "manual",
      actionCount: 3,
      copy: "Fyller svarsutkastet med prissteg, delbetalning och nästa tydliga drag.",
    },
    {
      key: "vip_recovery",
      title: "VIP återhämtning",
      tone: "blue",
      mode: "auto",
      actionCount: 2,
      copy: "Aktiveras när en VIP-tråd närmar sig SLA-brott och öppnar rätt studioflöde direkt.",
    },
    {
      key: "post_treatment",
      title: "Eftervårdssteg",
      tone: "green",
      mode: "manual",
      actionCount: 3,
      copy: "Skapar anteckning, schemalägger uppföljning och markerar kundhistorik med rätt behandlingsspår.",
    },
  ];

  const SHOWCASE_FEATURES = {
    command_palette: {
      focus: "Snabbnavigering",
      title: "⌨️ Kommandopalett",
      copy:
        "Tryck ⌘K för att hoppa mellan konversationer, kunder, automationer och operativa actions utan att lämna arbetsflödet.",
      outcome: "Snabbare beslut med mindre klick mellan vyer.",
      detail:
        "Global sökning och snabbåtgärder gör att operatören kan byta yta utan att tappa fokus eller kontext.",
      effectLabel: "Operativ effekt",
      effectTitle: "Fokus",
      effectCopy: "Mindre klick mellan vyer",
      nextTitle: "Knyt ihop genvägarna med rätt vyer",
      nextCopy: "Låt kommandopaletten hoppa direkt till de ytor där beslutet faktiskt tas.",
      primaryAction: { label: "Öppna makron", jump: "macros" },
      secondaryAction: { label: "Gå till konversationer", jump: "conversations" },
    },
    bulk_ops: {
      focus: "Batcharbete",
      title: "🚀 Massåtgärder",
      copy:
        "Markera flera profiler, öppna massammanfoga och driv igenom identitetsstädning utan att lämna kundvyn.",
      outcome: "Färre manuella merge-pass och tydligare kundbild.",
      detail:
        "Massåtgärder samlar repetitiva kundoperationer i ett pass i stället för att kräva flera manuella rundor.",
      effectLabel: "Operativ effekt",
      effectTitle: "Tempo",
      effectCopy: "Snabbare städning i kundregistret",
      nextTitle: "Öppna kundvyn i batch-läge",
      nextCopy: "Markera flera profiler och låt högerrailen driva merge-flödet.",
      primaryAction: { label: "Öppna kunder", jump: "customers" },
      secondaryAction: { label: "Öppna inställningar", jump: "settings" },
    },
    saved_views: {
      focus: "Filtrering",
      title: "🗂️ Sparade vyer",
      copy:
        "Lås återkommande urval för arbetskö, senare-listor och kundlistor så att teamet kan växla läge utan att bygga om filtren varje gång.",
      outcome: "Mindre omställningstid mellan prioriteringslägen.",
      detail:
        "Sparade vyer ger samma utgångspunkt för triage, uppföljning och kundstädning oavsett vem som tar över skiftet.",
      effectLabel: "Operativ effekt",
      effectTitle: "Utfall",
      effectCopy: "Snabbare växling mellan sparade lägen",
      nextTitle: "Knyt vyerna till arbetsköns filter",
      nextCopy: "Bygg vidare på arbetsköns logik och låt vyerna spara mailbox, ägare och status tillsammans.",
      primaryAction: { label: "Gå till konversationer", jump: "conversations" },
      secondaryAction: { label: "Öppna senare", jump: "later" },
    },
    collision: {
      focus: "Kundskydd",
      title: "👥 Kollisionsdetektering",
      copy:
        "När två profiler delar telefon eller e-post lyfter ytan förslag direkt i railen innan fel svar går ut.",
      outcome: "Mindre risk för fel kund, fel ton eller fel historik i fokusytan.",
      detail:
        "Kollisionsdetektering ska stoppa felaktiga svar innan de lämnar arbetsytan genom att göra konfliktbilden synlig direkt i railen.",
      effectLabel: "Operativ effekt",
      effectTitle: "Skydd",
      effectCopy: "Färre felmatchningar mellan kunder",
      nextTitle: "Öppna identitetsflödet direkt från förslaget",
      nextCopy: "Låt accept/avfärda och merge-val leva i samma kundyta utan extra modaler i första steget.",
      primaryAction: { label: "Öppna kunder", jump: "customers" },
      secondaryAction: { label: "Öppna inställningar", jump: "settings" },
    },
    ai_assistant: {
      focus: "Stöd i realtid",
      title: "🤖 AI-assistent",
      copy:
        "Lyft fram sammanfattningar, nästa steg och riskflaggor när operatören är mitt i tråden i stället för att skicka dem till en separat sida.",
      outcome: "Mer beslutsstöd utan att lämna arbetsytan.",
      detail:
        "AI-assistenten ska stödja operatören i kontext: i fokusytan, i kundintelligensen och i studion, inte som en fristående app.",
      effectLabel: "Operativ effekt",
      effectTitle: "Fokus",
      effectCopy: "Mer stöd där svaren faktiskt skrivs",
      nextTitle: "Knyt assistenten till fokusytan",
      nextCopy: "Visa sammanfattning, nästa steg och blockerare i samma arbetskolumn som konversationen.",
      primaryAction: { label: "Gå till konversationer", jump: "conversations" },
      secondaryAction: { label: "Öppna analys", jump: "analytics" },
    },
    macros: {
      focus: "Repetition",
      title: "🎬 Makron",
      copy:
        "Återanvänd återkommande svarsspår, uppföljningar och anteckningsflöden genom att köra makron från samma shell.",
      outcome: "Jämnare kvalitet i operativa svar och snabbare onboarding av teamet.",
      detail:
        "Makron samlar svar, nästa steg och följdhandlingar i ett körbart block i stället för att sprida logiken över flera verktyg.",
      effectLabel: "Operativ effekt",
      effectTitle: "Återanvändning",
      effectCopy: "Fler standardiserade svar med mindre friktion",
      nextTitle: "Knyt makron till studio och automation",
      nextCopy: "Låt samma makro gå att köra direkt i studion eller öppna som byggsten i automation.",
      primaryAction: { label: "Öppna makron", jump: "macros" },
      secondaryAction: { label: "Öppna automation", jump: "automation" },
    },
    customer_journey: {
      focus: "Helhetsbild",
      title: "🗺️ Kundresa",
      copy:
        "Samla viktiga steg, behandlingar, blockerare och nästa rekommenderade moment i en tydlig tidslinje över kunden.",
      outcome: "Bättre överblick över var kunden faktiskt befinner sig.",
      detail:
        "Kundresan ska hjälpa operatören att förstå helheten över flera mailboxar och kontaktpunkter utan att gräva i råhistorik först.",
      effectLabel: "Operativ effekt",
      effectTitle: "Utfall",
      effectCopy: "Tydligare nästa steg per kund",
      nextTitle: "Knyt tidslinjen till kundhistoriken",
      nextCopy: "Visa resan i fokusytans kundhistorik och låt den mata beslut i kundintelligensen.",
      primaryAction: { label: "Öppna kunder", jump: "customers" },
      secondaryAction: { label: "Gå till konversationer", jump: "conversations" },
    },
    snooze: {
      focus: "Timing",
      title: "⏰ Senare-läge",
      copy:
        "Skicka trådar till Senare från både arbetskö och fokusyta och plocka upp dem igen exakt när kundens timing är rätt.",
      outcome: "Mer kontroll över återupptag utan att förlora kontext eller studio-läge.",
      detail:
        "Senare-läget ska vara den tydliga återupptagningsytan för snoozade trådar, inte ett doldt sidospår i huvudnavigeringen.",
      effectLabel: "Operativ effekt",
      effectTitle: "Timing",
      effectCopy: "Återuppta rätt tråd vid rätt tidpunkt",
      nextTitle: "Knyt snooze till arbetskön och fokusytan",
      nextCopy: "Låt operatören snooza från fokusytan men återuppta från en tydlig Senare-yta.",
      primaryAction: { label: "Öppna senare", jump: "later" },
      secondaryAction: { label: "Gå till konversationer", jump: "conversations" },
    },
  };

  const PRIORITY_VALUES = Object.fromEntries(
    Object.entries(PRIORITY_LABELS).map(([value, label]) => [label.toLowerCase(), value])
  );
  const VISIBILITY_VALUES = Object.fromEntries(
    Object.entries(VISIBILITY_LABELS).map(([value, label]) => [label.toLowerCase(), value])
  );

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createCustomerRuntime() {
    return {
      loading: false,
      loaded: false,
      saving: false,
      identitySuggestionsLoading: false,
      authRequired: false,
      error: "",
      duplicateMetric: 3,
      mergedInto: {},
      dismissedSuggestionIds: [],
      acceptedSuggestionIds: [],
      identitySuggestionGroups: {},
      directory: cloneJson(CUSTOMER_DIRECTORY),
      details: cloneJson(CUSTOMER_PROFILE_DETAILS),
      profileCounts: Object.fromEntries(
        Object.entries(CUSTOMER_DIRECTORY).map(([key, item]) => [key, item.profileCount])
      ),
      liveHydratedThreadIds: [],
      splitModalOpen: false,
      splitSourceKey: "",
      splitEmail: "",
    };
  }

  function createCustomerImportRuntime() {
    return {
      open: false,
      fileName: "",
      sourceText: "",
      sourceBinaryBase64: "",
      sourceFormat: "",
      preview: null,
      rowEditsDirty: false,
      loadingPreview: false,
      committing: false,
    };
  }

  function createMailFeedRuntime() {
    return {
      later: {
        filter: "all",
        view: "card",
        density: "balanced",
        selectedKeys: [],
      },
      sent: {
        filter: "all",
        view: "card",
        density: "balanced",
        selectedKeys: [],
      },
    };
  }

  function createAutomationRuntime() {
    return {
      loading: false,
      authRequired: false,
      error: "",
      syncingTemplateKey: "",
      templateRecordsByKey: {},
      versionsByKey: {},
      activeVersionIdByKey: {},
      lastEvaluationByKey: {},
      dismissedSuggestionKeys: [],
      appliedSuggestionKeys: [],
      testingScenario: "baseline",
      autopilotRecent: cloneJson(AUTOMATION_AUTOPILOT_BASE_RECENT),
      autopilotPendingCount: 3,
      autopilotAutoFixCount: 7,
      autopilotTimeSaved: "23.4h",
      autopilotPerformance: "+18%",
      autopilotResolved: {},
      autopilotApprovedCount: 0,
    };
  }

  function createAnalyticsRuntime() {
    return {
      loading: false,
      loaded: false,
      partial: false,
      error: "",
      lastLoadedAt: "",
      requestId: 0,
      monitorMetrics: null,
      readiness: null,
      ownerDashboard: null,
      pilotReport: null,
      riskSummary: null,
      incidentSummary: null,
      mailInsights: null,
    };
  }

  function createIntegrationsRuntime() {
    return {
      loading: false,
      loaded: false,
      authRequired: false,
      partial: false,
      error: "",
      lastLoadedAt: "",
      requestId: 0,
      pendingKey: "",
      records: [],
      docsPayload: null,
      actorProfile: null,
      lastSalesLeadAt: "",
    };
  }

  function createMacrosRuntime() {
    return {
      loading: false,
      loaded: false,
      authRequired: false,
      error: "",
      pendingMacroId: "",
      pendingAction: "",
      lastLoadedAt: "",
    };
  }

  const AUTOMATION_NODE_TO_SUGGESTION = {
    trigger: "trigger",
    welcome: "welcome",
    assign: "assign",
    wait: "wait",
    condition: "condition",
    guide: "welcome",
    reminder: "wait",
  };

  const workspaceState = {
    left: DEFAULT_WORKSPACE.left,
    main: DEFAULT_WORKSPACE.main,
    right: DEFAULT_WORKSPACE.right,
  };

  const workspaceLimits = {
    left: { min: MIN_QUEUE_WIDTH, max: 560 },
    main: { min: 340 },
    right: { min: MIN_INTEL_WIDTH, max: 430 },
  };

  const state = {
    bootstrapped: false,
    bootstrapError: "",
    noteTemplates: [],
    noteTemplatesByKey: {},
    noteDefinitions: {},
    noteVisibilityRules: {},
    note: {
      activeKey: "konversation",
      drafts: {},
      saving: false,
    },
    schedule: {
      draft: null,
      options: null,
      saving: false,
    },
    later: {
      option: "one_hour",
      bulkSelectionKeys: [],
    },
    studio: {
      mode: "reply",
      threadId: "",
      composeMailboxId: "",
      composeTo: "",
      composeSubject: "",
      draftBody: "",
      baseDraftBody: "",
      activeTemplateKey: "",
      activeTrackKey: "booking",
      activeToneKey: "professional",
      activeRefineKey: "",
      selectedSignatureId: "contact",
      sending: false,
      savingDraft: false,
      deleting: false,
      previewing: false,
    },
    noteMode: {
      open: false,
      selected: "manual",
    },
    moreMenuOpen: false,
    mailboxAdminOpen: false,
    view: "conversations",
    selectedCustomerIdentity: "johan",
    selectedAnalyticsPeriod: "week",
    analyticsRuntime: createAnalyticsRuntime(),
    integrationsRuntime: createIntegrationsRuntime(),
    macrosRuntime: createMacrosRuntime(),
    selectedAutomationLibrary: "email",
    selectedAutomationNode: "trigger",
    selectedAutomationSection: "byggare",
    selectedAutomationTemplate: "churn_guard",
    selectedAutomationVersion: "v3_0",
    selectedAutomationAutopilotProposal: "merge_duplicates",
    automationAutopilotEnabled: true,
    automationCollaborationOpen: false,
    activity: {
      notes: [],
      followUps: [],
    },
    customerSearch: "",
    customerFilter: "alla kunder",
    customerSuggestionsHidden: false,
    customerBatchSelection: ["johan", "emma"],
    customerPrimaryEmailByKey: Object.fromEntries(
      Object.entries(CUSTOMER_PROFILE_DETAILS).map(([key, detail]) => [key, detail.emails[0] || ""])
    ),
    customerSettings: { ...DEFAULT_CUSTOMER_SETTINGS },
    customerMergeModalOpen: false,
    customerSettingsOpen: false,
    customerMergePrimaryKey: "johan",
    customerMergeOptions: {
      emails: true,
      phones: true,
      notes: true,
    },
    customerImport: createCustomerImportRuntime(),
    workspacePrefsApplied: false,
    customerRuntime: createCustomerRuntime(),
    automationScale: 100,
    automationRailCollapsed: false,
    automationRuntime: createAutomationRuntime(),
    customMailboxes: [],
    mailFeedsRuntime: createMailFeedRuntime(),
    selectedMailFeedKey: {
      later: MAIL_FEEDS.later[0]?.key || "",
      sent: MAIL_FEEDS.sent[0]?.key || "",
    },
    selectedIntegrationCategory: "all",
    integrationsConnectedKeys: INTEGRATION_CATALOG.filter((item) => item.connected).map(
      (item) => item.key
    ),
    macros: getFallbackMacroCards(),
    settingsRuntime: {
      loading: false,
      loaded: false,
      saving: false,
      authRequired: false,
      error: "",
      lastLoadedAt: "",
      choices: {
        theme: "mist",
        density: "compact",
      },
      profileName: "Ditt namn",
      profileEmail: "din.email@hairtp.com",
      deleteRequestedAt: "",
      toggles: {
        ai_prediction: true,
        metrics: true,
        templates: true,
        scheduling: true,
        upsell: false,
        auto_assign: true,
        google_calendar: true,
        outlook: false,
        booking_confirmation: true,
        payment_reminders: true,
        stripe: true,
        swish: false,
        email_signature: true,
        read_receipts: false,
        office_hours_auto_reply: true,
        weekly_summary: true,
        behavior_tracking: true,
        export_excel: true,
        smart_reply: true,
        autoprioritization: true,
        churn_prediction: true,
        desktop_notifications: true,
        sound_alerts: false,
        sla_alerts: true,
        team_mentions: true,
        mfa: false,
        activity_logging: true,
        compact_conversation: true,
        color_priorities: true,
        advanced_filters: false,
      },
    },
    macroModal: {
      open: false,
      mode: "create",
      macroId: "",
    },
    settingsProfileModal: {
      open: false,
    },
    confirmDialog: {
      open: false,
      actionKey: "",
      tone: "danger",
      onConfirm: null,
    },
    pendingMailFeedDelete: {
      active: false,
      feed: "",
      count: 0,
      committing: false,
      threadsSnapshot: [],
      previousThreadsSnapshot: [],
      previousSelectedThreadId: "",
      previousSelections: {
        later: [],
        sent: [],
      },
    },
    selectedShowcaseFeature: "command_palette",
    runtime: {
      loading: false,
      live: false,
      authRequired: false,
      offline: false,
      error: "",
      threads: [],
      mailboxes: [],
      selectedMailboxIds: [],
      selectedOwnerKey: "all",
      activeLaneId: "all",
      orderedLaneIds: [...QUEUE_LANE_ORDER],
      activeFocusSection: "conversation",
      historyContextThreadId: "",
      historySearch: "",
      historyMailboxFilter: "all",
      historyResultTypeFilter: "all",
      historyRangeFilter: "all",
      selectedThreadId: "",
      historyExpanded: true,
      historyDeleting: false,
      deletingThreadId: "",
      preferredMailboxId: "kons@hairtpclinic.com",
      defaultSenderMailbox: "contact@hairtpclinic.com",
      defaultSignatureProfile: "contact",
      sendEnabled: false,
      deleteEnabled: false,
      lastSyncAt: "",
      queueHistory: {
        open: false,
        loading: false,
        loaded: false,
        error: "",
        items: [],
        limit: 24,
        hasMore: false,
        scopeKey: "",
      },
    },
  };

  const asyncRuntimeRefs = {
    bootstrapPromise: null,
    persistPrefsTimer: null,
  };
  let activeResizeCleanup = null;
  let pendingMailFeedDeleteTimer = null;
  let queueHistoryRequestSequence = 0;
  const CCO_OPERATIONAL_START_MAILBOX = "kons@hairtpclinic.com";
  const CCO_DEFAULT_REPLY_SENDER = "contact@hairtpclinic.com";
  const CCO_DEFAULT_SIGNATURE_PROFILE = "contact";

  const STUDIO_SIGNATURE_PROFILES = Object.freeze([
    {
      id: "contact",
      aliases: ["contact", "sara"],
      label: "Contact",
      fullName: "Hair TP Clinic",
      title: "Patientservice",
      email: "contact@hairtpclinic.com",
      phone: "031-81 11 66",
    },
    {
      id: "egzona",
      aliases: ["egzona"],
      label: "Egzona",
      fullName: "Egzona Krasniqi",
      title: "Hårspecialist",
      email: "egzona@hairtpclinic.com",
      phone: "031-81 11 66",
    },
    {
      id: "fazli",
      aliases: ["fazli"],
      label: "Fazli",
      fullName: "Fazli Krasniqi",
      title: "Clinic owner",
      email: "fazli@hairtpclinic.com",
      phone: "031-81 11 66",
    },
  ]);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeKey(value) {
    return normalizeText(value).toLowerCase();
  }

  function slugifyMailboxId(value) {
    return normalizeText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function deriveMailboxLabel(email) {
    const localPart = asText(email).split("@")[0] || "";
    if (!localPart) return "";
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  function getPreferredOperationalMailboxId() {
    return normalizeMailboxId(
      state.runtime.preferredMailboxId ||
        state.runtime.defaultSenderMailbox ||
        CCO_OPERATIONAL_START_MAILBOX
    );
  }

  function getOperationalImportMailboxId() {
    const selectedMailboxIds = asArray(state.runtime.selectedMailboxIds)
      .map(normalizeMailboxId)
      .filter(Boolean);
    return selectedMailboxIds[0] || getPreferredOperationalMailboxId();
  }

  function getRequestedRuntimeMailboxIds({ includePreferredFallback = true } = {}) {
    const selectedMailboxIds = asArray(state.runtime.selectedMailboxIds)
      .map(normalizeMailboxId)
      .filter(Boolean);
    if (selectedMailboxIds.length) {
      return selectedMailboxIds;
    }
    return includePreferredFallback ? [getPreferredOperationalMailboxId()] : [];
  }

  function splitCustomerImportMultiValue(value) {
    if (Array.isArray(value)) {
      return value.map((entry) => normalizeText(entry)).filter(Boolean);
    }
    return String(value ?? "")
      .split(/[\n;,|]+/g)
      .map((entry) => normalizeText(entry))
      .filter(Boolean);
  }

  function getCustomerImportEditableRow(row = {}) {
    if (row?.input && typeof row.input === "object") {
      return row.input;
    }
    if (row?.record && typeof row.record === "object") {
      return row.record;
    }
    return row && typeof row === "object" ? row : {};
  }

  function buildCustomerImportRowsPayload(rows = []) {
    return asArray(rows).map((row, index) => {
      const editable = getCustomerImportEditableRow(row);
      const rowNumber = Math.max(
        1,
        Number(row?.rowNumber || editable.rowNumber || index + 1) || index + 1
      );
      return {
        rowNumber,
        name: normalizeText(editable.name),
        emails: splitCustomerImportMultiValue(editable.emails).map((entry) =>
          normalizeText(entry).toLowerCase()
        ),
        phone: normalizeText(editable.phone),
        mailboxes: splitCustomerImportMultiValue(editable.mailboxes),
        vip: Boolean(editable.vip),
        customerValue: Math.max(0, Math.round(asNumber(editable.customerValue, 0))),
        totalConversations: Math.max(0, Math.round(asNumber(editable.totalConversations, 0))),
        totalMessages: Math.max(0, Math.round(asNumber(editable.totalMessages, 0))),
      };
    });
  }

  function encodeArrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      const chunk = bytes.subarray(index, index + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return window.btoa(binary);
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asText(value, fallback = "") {
    const normalized = String(value ?? "").trim();
    return normalized || fallback;
  }

  function normalizeMailboxId(value) {
    return normalizeKey(asText(value));
  }

  const workspaceSourceOfTruth = PREVIEW_WORKSPACE_STATE.createWorkspaceStateApi({
    AUX_VIEWS,
    QUEUE_LANE_ORDER,
    asArray,
    asText,
    normalizeKey,
    normalizeMailboxId,
    state,
  });

  function asNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function toIso(value) {
    const parsed = Date.parse(String(value ?? ""));
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : "";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createIdempotencyKey(prefix) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}`;
  }

  function getAdminToken() {
    try {
      return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  }

  function buildAdminReturnPath() {
    return `${window.location.pathname || "/major-arcana-preview/"}${window.location.search || ""}${window.location.hash || ""}`;
  }

  function resolveShellView(view) {
    const normalizedView = normalizeKey(view);
    return AUTOMATION_VIEW_ALIASES[normalizedView] ? "automation" : normalizedView || "conversations";
  }

  function resolveAutomationSectionForView(view) {
    return AUTOMATION_VIEW_ALIASES[normalizeKey(view)] || "";
  }

  function readShellViewStateFromLocation() {
    if (typeof window === "undefined") {
      return { view: "conversations", automationSection: "" };
    }
    const params = new URLSearchParams(window.location.search || "");
    return {
      view: normalizeKey(params.get("view")) || "conversations",
      automationSection:
        normalizeKey(params.get("automationSection") || params.get("section")) || "",
    };
  }

  function buildShellViewStateForUrl() {
    const requestedView = normalizeKey(state.view) || "conversations";
    const shellView = resolveShellView(requestedView);
    const selectedAutomationSection = normalizeKey(state.selectedAutomationSection) || "byggare";

    if (shellView === "conversations") {
      return { view: "", automationSection: "" };
    }

    if (requestedView === "templates" && selectedAutomationSection === "mallar") {
      return { view: "templates", automationSection: "" };
    }

    if (requestedView === "workflows" && selectedAutomationSection === "byggare") {
      return { view: "workflows", automationSection: "" };
    }

    if (shellView === "automation") {
      return {
        view: "automation",
        automationSection: selectedAutomationSection === "byggare" ? "" : selectedAutomationSection,
      };
    }

    return { view: shellView, automationSection: "" };
  }

  function syncShellViewToLocation() {
    if (typeof window === "undefined" || !window.history?.replaceState) return;
    const url = new URL(window.location.href);
    const { view, automationSection } = buildShellViewStateForUrl();
    if (view) {
      url.searchParams.set("view", view);
    } else {
      url.searchParams.delete("view");
    }
    if (automationSection) {
      url.searchParams.set("automationSection", automationSection);
    } else {
      url.searchParams.delete("automationSection");
      url.searchParams.delete("section");
    }
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }

  function buildReauthUrl(reason = "session_expired") {
    const params = new URLSearchParams();
    params.set(AUTH_RETURN_TO_QUERY_PARAM, buildAdminReturnPath());
    params.set("reason", reason);
    return `/admin?${params.toString()}`;
  }

  function isAuthFailure(statusCode, message = "") {
    if (statusCode === 401) return true;
    if (statusCode !== 403) return false;
    const normalized = normalizeKey(message);
    return [
      "behörighet",
      "åtkomst",
      "sessionen är ogiltig",
      "inloggning krävs",
      "permission",
      "access",
      "session",
      "sign in",
    ].some((token) => normalized.includes(token));
  }

  function titleCaseMailbox(value) {
    const localPart = asText(value).split("@")[0] || "";
    if (!localPart) return "Mailbox";
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  function formatRuntimeDateTime(value, options) {
    const iso = toIso(value);
    if (!iso) return "";
    return new Intl.DateTimeFormat("sv-SE", options).format(new Date(iso));
  }

  function formatListTime(value) {
    const iso = toIso(value);
    if (!iso) return "Nu";
    const date = new Date(iso);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return formatRuntimeDateTime(iso, { hour: "2-digit", minute: "2-digit" });
    }
    return formatRuntimeDateTime(iso, { month: "short", day: "numeric" });
  }

  function formatConversationTime(value) {
    const iso = toIso(value);
    if (!iso) return "Nu";
    const date = new Date(iso);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const clock = formatRuntimeDateTime(iso, { hour: "2-digit", minute: "2-digit" });
    if (sameDay) return `Idag ${clock}`;
    if (isYesterday) return `Igår ${clock}`;
    return formatRuntimeDateTime(iso, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function formatDueLabel(value) {
    const iso = toIso(value);
    if (!iso) return "Ingen deadline";
    const target = new Date(iso).getTime();
    const diffHours = Math.round((target - Date.now()) / (60 * 60 * 1000));
    if (diffHours > 0 && diffHours <= 12) {
      return `${diffHours}h kvar`;
    }
    return formatRuntimeDateTime(iso, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function extractEmail(value) {
    const match = asText(value).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return match ? match[0].toLowerCase() : "";
  }

  function looksLikeMailboxIdentity(value) {
    const normalized = normalizeKey(value);
    if (!normalized) return false;
    return (
      normalized.includes("@hairtpclinic.com") ||
      normalized.includes("hair tp clinic") ||
      ["kons", "info", "kontakt", "contact", "mailbox"].includes(normalized)
    );
  }

  function getRuntimeCustomerName(row) {
    const candidates = [
      row?.customerSummary?.customerName,
      row?.customerName,
      row?.senderName,
      row?.senderDisplayName,
      row?.sender,
    ].map((value) => asText(value)).filter(Boolean);
    const preferred = candidates.find((value) => !looksLikeMailboxIdentity(value));
    return preferred || candidates[0] || "Okänd kund";
  }

  function extractCustomerEmail(row) {
    const candidates = [
      row?.customerEmail,
      row?.customerKey,
      row?.sender,
      row?.customerSummary?.customerKey,
      row?.latestInboundPreview,
    ];
    for (const candidate of candidates) {
      const email = extractEmail(candidate);
      if (email) return email;
    }
    return "";
  }

  function initialsForName(value) {
    const parts = asText(value)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    if (!parts.length) return "CU";
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }

  function buildAvatarDataUri(name) {
    const initials = initialsForName(name);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f6d5df"/><stop offset="100%" stop-color="#e8eef8"/></linearGradient></defs><rect width="96" height="96" rx="24" fill="url(#g)"/><text x="50%" y="54%" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="34" font-weight="700" fill="#6b7280">${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function humanizeCode(value, fallback = "-") {
    const normalized = normalizeKey(value);
    if (!normalized) return fallback;
    const labels = {
      active_dialogue: "Aktiv dialog",
      follow_up_pending: "Återbesök väntar",
      booking_ready: "Redo att boka",
      ready_to_book: "Redo att boka",
      needs_action: "Behöver åtgärd",
      needs_review: "Behöver granskning",
      review_needed: "Behöver granskning",
      new: "Ny",
      repeat: "Återkommande",
      needs_reply: "Behöver svar",
      response_needed: "Svar krävs",
      awaiting_customer: "Väntar på kund",
      awaiting_owner: "Behöver åtgärd",
      awaiting_confirmation: "Väntar på bekräftelse",
      ready_now: "Redo att boka",
      blocked_medical: "Medicinsk kontroll",
      not_relevant: "Ej relevant",
      safe: "Stabil",
      warning: "Riskerar SLA",
      breach: "SLA bruten",
      low: "Låg",
      medium: "Medel",
      high: "Hög",
      unclear: "Oklart",
      medical: "Medicinsk",
      miss: "Miss",
      neutral: "Neutral",
      normal: "Normal",
      reflective: "Reflekterande",
      responsive: "Responsiv",
      direct: "Direkt",
      customer: "Kund",
      owner: "Ägare",
      clinic: "Klinik",
      none: "Ingen",
    };
    if (labels[normalized]) return labels[normalized];
    return normalized
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function getIntegrationCatalogMap() {
    return Object.fromEntries(INTEGRATION_CATALOG.map((item) => [item.key, item]));
  }

  function getIntegrationCategoryLabel(value) {
    const normalized = normalizeKey(value);
    const labels = {
      all: "Alla",
      calendar: "Kalender",
      payment: "Betalning",
      communication: "Kommunikation",
      analytics: "Analys",
      automation: "Automatisering",
    };
    return labels[normalized] || humanizeCode(normalized, "Alla");
  }

  function getIntegrationStatusToneLabel(tone, isConnected) {
    const normalized = normalizeKey(tone);
    if (normalized === "healthy") return "Stabil";
    if (normalized === "attention") return "Bevaka";
    if (normalized === "idle") return isConnected ? "Redo" : "Inte aktiv";
    return isConnected ? "Live" : "Redo";
  }

  function getFallbackIntegrationRecord(item) {
    const isConnected = item?.connected === true;
    return {
      id: item?.key || "",
      category: item?.category || "automation",
      isConnected,
      statusTone: isConnected ? "healthy" : "idle",
      statusSummary: item?.copy || (isConnected ? "Ansluten." : "Inte ansluten ännu."),
      watchLabel: isConnected
        ? "Verifiera guardrails och ägarskap efter aktivering."
        : "Koppla in när det faktiskt hjälper operatören i vardagen.",
      configurable: true,
      docsAvailable: true,
      updatedAt: "",
    };
  }

  function getIntegrationRuntimeRecord(key) {
    const normalizedKey = normalizeKey(key);
    const runtimeRecord = asArray(state.integrationsRuntime.records).find(
      (item) => normalizeKey(item?.id) === normalizedKey
    );
    if (runtimeRecord) return runtimeRecord;
    const fallback = getIntegrationCatalogMap()[normalizedKey];
    return fallback ? getFallbackIntegrationRecord(fallback) : null;
  }

  function getIntegrationConnectedKeys() {
    return INTEGRATION_CATALOG.filter((item) => getIntegrationRuntimeRecord(item.key)?.isConnected).map(
      (item) => item.key
    );
  }

  function getFallbackIntegrationActorProfile() {
    const signature = getStudioSignatureProfile(
      state.runtime.defaultSignatureProfile ||
        state.studio.selectedSignatureId ||
        CCO_DEFAULT_SIGNATURE_PROFILE
    );
    return {
      name: signature?.fullName || "CCO Operator",
      email: signature?.email || CCO_DEFAULT_REPLY_SENDER,
    };
  }

  function getIntegrationActorProfile() {
    const profile = state.integrationsRuntime.actorProfile;
    if (profile?.name && profile?.email) return profile;
    return getFallbackIntegrationActorProfile();
  }

  function buildIntegrationSalesMessage() {
    const categoryLabel = getIntegrationCategoryLabel(state.selectedIntegrationCategory || "all");
    const connectedKeys = getIntegrationConnectedKeys();
    return [
      `Enterpriseförfrågan från Major Arcana-integrationsytan.`,
      `Fokus just nu: ${categoryLabel}.`,
      `Aktiva kopplingar i tenant: ${connectedKeys.length}/${INTEGRATION_CATALOG.length}.`,
      `Önskar genomgång av guardrails, readiness och nästa lämpliga integrationssteg.`,
    ].join(" ");
  }

  function buildIntegrationDocsHtml(payload) {
    const sections = asArray(payload?.sections);
    const updatedAtLabel = payload?.updatedAt
      ? formatConversationTime(payload.updatedAt)
      : "Nu";
    const sectionMarkup = sections
      .map((section) => {
        const items = asArray(section?.items)
          .map(
            (item) =>
              `<li><strong>${escapeHtml(asText(item?.method, "GET"))}</strong> <code>${escapeHtml(
                asText(item?.path)
              )}</code><p>${escapeHtml(asText(item?.description))}</p></li>`
          )
          .join("");
        return `<section><h2>${escapeHtml(asText(section?.title, "Integrationer"))}</h2><ul>${items}</ul></section>`;
      })
      .join("");
    return `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <title>CCO Integrationsdocs</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 32px; background: #f6f0ea; color: #2f2a25; }
      main { max-width: 920px; margin: 0 auto; display: grid; gap: 24px; }
      .hero, section { background: rgba(255,255,255,0.84); border: 1px solid rgba(120,105,90,0.16); border-radius: 20px; padding: 24px; box-shadow: 0 8px 24px rgba(70,50,30,0.08), inset 0 1px 0 rgba(255,255,255,0.55); }
      h1 { margin: 0 0 8px; font-size: 28px; line-height: 1.15; }
      h2 { margin: 0 0 16px; font-size: 20px; line-height: 1.2; }
      p { margin: 0; font-size: 16px; line-height: 1.45; color: rgba(70,60,50,0.82); }
      ul { margin: 0; padding-left: 18px; display: grid; gap: 14px; }
      li p { margin-top: 6px; }
      code { padding: 2px 6px; border-radius: 8px; background: rgba(255,255,255,0.82); }
      .meta { margin-top: 10px; font-size: 14px; color: rgba(70,60,50,0.58); }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>Integrationsdocs</h1>
        <p>Operativ översikt för CCO-integrationer, workspace-endpoints och telemetry-källor.</p>
        <p class="meta">Senast uppdaterad: ${escapeHtml(updatedAtLabel)}</p>
      </section>
      ${sectionMarkup}
    </main>
  </body>
</html>`;
  }

  const SETTINGS_SIDEBAR_SECTIONS = Object.freeze([
    { toggleKey: "ai_prediction", id: "ai-prediction", label: "AI-förutsägelse", order: 1 },
    { toggleKey: "metrics", id: "metrics", label: "Mätvärden", order: 2 },
    { toggleKey: "templates", id: "templates", label: "Mallar", order: 3 },
    { toggleKey: "scheduling", id: "scheduling", label: "Smart schemaläggning", order: 4 },
    { toggleKey: "upsell", id: "upsell", label: "Merförsäljningsmöjligheter", order: 5 },
    { toggleKey: "auto_assign", id: "assignment", label: "Auto-tilldela", order: 6 },
  ]);

  const SETTINGS_TOGGLE_KEY_MAP = Object.freeze({
    google_calendar: "googleCalendarSync",
    outlook: "outlookIntegration",
    booking_confirmation: "automaticBookingConfirmation",
    payment_reminders: "paymentReminders",
    stripe: "stripeIntegration",
    swish: "swishPayments",
    email_signature: "emailSignature",
    read_receipts: "readReceipts",
    office_hours_auto_reply: "outOfOfficeAutoReplies",
    weekly_summary: "weeklySummary",
    behavior_tracking: "customerBehaviorTracking",
    export_excel: "exportToExcel",
    smart_reply: "smartReplySuggestions",
    autoprioritization: "automaticPrioritization",
    churn_prediction: "churnPrediction",
    desktop_notifications: "desktopNotifications",
    sound_alerts: "soundAlerts",
    sla_alerts: "slaAlerts",
    team_mentions: "teamMentions",
    mfa: "twoFactorAuth",
    activity_logging: "activityLogging",
    compact_conversation: "compactConversationView",
    color_priorities: "colorCodedPriorities",
    advanced_filters: "advancedFilters",
  });

  const SETTINGS_TOGGLE_KEYS = Object.freeze([
    ...SETTINGS_SIDEBAR_SECTIONS.map((item) => item.toggleKey),
    ...Object.keys(SETTINGS_TOGGLE_KEY_MAP),
  ]);

  const SETTINGS_THEME_ALIASES = Object.freeze({
    mist: "mist",
    light: "mist",
    ink: "ink",
    dark: "ink",
    auto: "auto",
  });

  const SETTINGS_DENSITY_ALIASES = Object.freeze({
    compact: "compact",
    comfortable: "balanced",
    balanced: "balanced",
    spacious: "airy",
    airy: "airy",
  });

  function createDefaultSettingsViewState() {
    return {
      theme: "mist",
      density: "compact",
      profileName: "Ditt namn",
      profileEmail: "din.email@hairtp.com",
      deleteRequestedAt: "",
      toggles: Object.fromEntries(SETTINGS_TOGGLE_KEYS.map((key) => [key, false])),
    };
  }

  function createMacroCardFromRecord(record, fallbackIndex = 0) {
    const trigger = normalizeKey(record?.trigger) === "auto" ? "auto" : "manual";
    const actions = asArray(record?.actions);
    const primaryActionType = normalizeKey(actions[0]?.type);
    const toneByAction = {
      template: "violet",
      tag: "rose",
      assign: "blue",
      snooze: "gold",
      sla: "red",
      archive: "green",
    };
    const tone = toneByAction[primaryActionType] || (trigger === "auto" ? "blue" : "violet");
    const actionLabelByTrigger = trigger === "auto" ? "Auto-körning" : "Manuell körning";
    return {
      id: asText(record?.id) || `macro-${fallbackIndex + 1}`,
      key: asText(record?.id) || `macro-${fallbackIndex + 1}`,
      title: asText(record?.name, `Makro ${fallbackIndex + 1}`),
      mode: trigger,
      tone,
      actionCount: Math.max(1, actions.length || 0),
      copy:
        compactRuntimeCopy(
          record?.description,
          trigger === "auto"
            ? "Körs automatiskt när villkoren träffar rätt operativt läge."
            : "Körs manuellt från nya CCO:s arbetsyta när teamet behöver standardisera nästa steg.",
          140
        ) || "Makrot är redo att köras i shellen.",
      actionLabel: actionLabelByTrigger,
      shortcut: asText(record?.shortcut),
      runCount: asNumber(record?.runCount, 0),
      lastRunAt: asText(record?.lastRunAt),
      autoCondition: asText(record?.autoCondition),
    };
  }

  function getFallbackMacroCards() {
    return MACRO_LIBRARY.map((macro, index) => ({
      id: asText(macro?.key, `macro-${index + 1}`),
      key: asText(macro?.key, `macro-${index + 1}`),
      title: asText(macro?.title, `Makro ${index + 1}`),
      mode: normalizeKey(macro?.mode) === "auto" ? "auto" : "manual",
      tone: asText(macro?.tone, "violet"),
      actionCount: Math.max(1, asNumber(macro?.actionCount, 1)),
      copy: compactRuntimeCopy(macro?.copy, "Makrot är redo att köras i shellen.", 140),
      actionLabel:
        normalizeKey(macro?.mode) === "auto" ? "Auto-körning" : "Manuell körning",
      shortcut: "",
      runCount: 0,
      lastRunAt: "",
      autoCondition: "",
    }));
  }

  function mapSettingsPayloadToView(settings = {}) {
    const defaults = createDefaultSettingsViewState();
    const sidebarSections = asArray(settings?.sidebarSections);
    const enabledSidebarIds = new Set(
      sidebarSections.filter((item) => item?.enabled !== false).map((item) => normalizeKey(item?.id))
    );
    const toggles = { ...defaults.toggles };

    SETTINGS_SIDEBAR_SECTIONS.forEach((section) => {
      toggles[section.toggleKey] = enabledSidebarIds.has(section.id);
    });

    const payloadToggles =
      settings?.toggles && typeof settings.toggles === "object" ? settings.toggles : {};
    Object.entries(SETTINGS_TOGGLE_KEY_MAP).forEach(([uiKey, apiKey]) => {
      toggles[uiKey] = Boolean(payloadToggles[apiKey]);
    });

    return {
      theme: SETTINGS_THEME_ALIASES[normalizeKey(settings?.theme)] || defaults.theme,
      density:
        SETTINGS_DENSITY_ALIASES[normalizeKey(settings?.density)] || defaults.density,
      profileName: asText(settings?.profileName, defaults.profileName),
      profileEmail: asText(settings?.profileEmail, defaults.profileEmail),
      deleteRequestedAt: asText(settings?.deleteRequestedAt),
      toggles,
    };
  }

  function buildSettingsPayloadFromState() {
    const toggles = {};
    Object.entries(SETTINGS_TOGGLE_KEY_MAP).forEach(([uiKey, apiKey]) => {
      toggles[apiKey] = Boolean(state.settingsRuntime.toggles[uiKey]);
    });
    return {
      theme: state.settingsRuntime.choices.theme,
      density: state.settingsRuntime.choices.density,
      profileName: state.settingsRuntime.profileName,
      profileEmail: state.settingsRuntime.profileEmail,
      deleteRequestedAt: state.settingsRuntime.deleteRequestedAt || null,
      sidebarSections: SETTINGS_SIDEBAR_SECTIONS.map((section) => ({
        id: section.id,
        label: section.label,
        enabled: Boolean(state.settingsRuntime.toggles[section.toggleKey]),
        order: section.order,
      })),
      toggles,
    };
  }

  function applySettingsViewState(nextState = {}) {
    const mapped = mapSettingsPayloadToView(nextState);
    state.settingsRuntime.choices.theme = mapped.theme;
    state.settingsRuntime.choices.density = mapped.density;
    state.settingsRuntime.profileName = mapped.profileName;
    state.settingsRuntime.profileEmail = mapped.profileEmail;
    state.settingsRuntime.deleteRequestedAt = mapped.deleteRequestedAt;
    state.settingsRuntime.toggles = {
      ...state.settingsRuntime.toggles,
      ...mapped.toggles,
    };
  }

  function isConciseRuntimeValue(value, { maxChars = 32, maxWords = 4 } = {}) {
    const text = normalizeText(value);
    if (!text) return false;
    if (text.length > maxChars) return false;
    if (/[.!?]/.test(text)) return false;
    return text.split(/\s+/).filter(Boolean).length <= maxWords;
  }

  function compactRuntimeCopy(value, fallback = "", maxChars = 120) {
    const normalized = normalizeText(value).replace(/\s+/g, " ");
    const source = normalized || fallback;
    if (!source) return "";
    const firstSentence = source.split(/(?<=[.!?])\s+/)[0] || source;
    const trimmed = firstSentence.replace(/[.!?]+$/g, "").trim();
    if (trimmed.length <= maxChars) return trimmed;
    return `${trimmed.slice(0, maxChars - 1).trimEnd()}…`;
  }

  function countWords(value) {
    return normalizeText(value).split(/\s+/).filter(Boolean).length;
  }

  function getStudioSignatureProfile(signatureId = "") {
    const normalizedId = normalizeKey(signatureId);
    const matchesProfile = (profile, targetId) => {
      if (!profile || typeof profile !== "object") return false;
      const normalizedTargetId = normalizeKey(targetId);
      if (!normalizedTargetId) return false;
      if (normalizeKey(profile.id) === normalizedTargetId) return true;
      const aliases = Array.isArray(profile.aliases) ? profile.aliases : [];
      return aliases.some((alias) => normalizeKey(alias) === normalizedTargetId);
    };
    const normalizedDefaultId = normalizeKey(
      state.runtime.defaultSignatureProfile || CCO_DEFAULT_SIGNATURE_PROFILE
    );
    return (
      STUDIO_SIGNATURE_PROFILES.find((profile) => matchesProfile(profile, normalizedId)) ||
      STUDIO_SIGNATURE_PROFILES.find((profile) => matchesProfile(profile, normalizedDefaultId)) ||
      STUDIO_SIGNATURE_PROFILES[0]
    );
  }

  function getStudioSenderMailboxId(signatureId = "", thread = null) {
    const signatureProfile = getStudioSignatureProfile(signatureId);
    return normalizeMailboxId(
      signatureProfile?.email ||
        state.runtime.defaultSenderMailbox ||
        thread?.mailboxAddress ||
        CCO_DEFAULT_REPLY_SENDER
    );
  }

  function getStudioSourceMailboxId(thread = null) {
    const threadMailboxId = normalizeMailboxId(thread?.mailboxAddress);
    if (threadMailboxId) return threadMailboxId;
    const selectedMailboxIds = getSelectedRuntimeMailboxScopeIds();
    if (selectedMailboxIds.length) return selectedMailboxIds[0];
    return getPreferredOperationalMailboxId();
  }

  function getStudioSourceMailboxLabel(mailboxId = "") {
    const normalizedMailboxId = normalizeMailboxId(mailboxId);
    const runtimeMailbox = getAvailableRuntimeMailboxes().find(
      (mailbox) => normalizeMailboxId(mailbox.id || mailbox.email) === normalizedMailboxId
    );
    if (runtimeMailbox) {
      return asText(runtimeMailbox.label, runtimeMailbox.email || runtimeMailbox.id);
    }
    return titleCaseMailbox(normalizedMailboxId || CCO_OPERATIONAL_START_MAILBOX);
  }

  function getStudioFirstName(thread) {
    const firstName = asText(thread?.customerName).split(/\s+/).filter(Boolean)[0];
    return firstName || "kunden";
  }

  function getStudioDraftModes(thread) {
    const draftModes =
      thread?.raw?.draftModes && typeof thread.raw.draftModes === "object"
        ? thread.raw.draftModes
        : {};
    return {
      professional: asText(draftModes.professional),
      warm: asText(draftModes.warm),
      short: asText(draftModes.short),
      recommendedMode:
        normalizeKey(thread?.raw?.recommendedMode || "professional") || "professional",
    };
  }

  function inferStudioTrackKey(thread) {
    if (thread?.tags?.includes("medical")) return "medical";
    if (normalizeKey(thread?.raw?.intent).includes("pris")) return "pricing";
    if (thread?.tags?.includes("admin")) return "admin";
    if (thread?.tags?.includes("bookable")) return "booking";
    if (
      thread?.tags?.includes("followup") ||
      normalizeKey(thread?.nextActionLabel).includes("följ")
    ) {
      return "follow_up";
    }
    return "booking";
  }

  function buildStudioTemplateDraft(thread, templateKey) {
    const firstName = getStudioFirstName(thread);
    const dueLabel = asText(thread?.followUpLabel || thread?.nextActionLabel || "idag");
    if (templateKey === "suggest_times") {
      return `Hej ${firstName},\n\nTack för ditt meddelande. Här kommer tre tider som ligger närmast det du efterfrågar:\n\n• Fredag 09:00\n• Måndag 10:30\n• Onsdag 14:00\n\nSvara gärna med den tid som passar bäst så bekräftar jag direkt.`;
    }
    if (templateKey === "send_pricing") {
      return `Hej ${firstName},\n\nHär kommer prisöversikten för behandlingen:\n\n• Konsultation: kostnadsfri\n• PRP: 4 500 kr\n• PRP-paket 3 behandlingar: 12 000 kr\n\nSäg till om du vill att jag skickar ett konkret bokningsförslag direkt i samma tråd.`;
    }
    if (templateKey === "ask_more_info") {
      return `Hej ${firstName},\n\nTack för ditt meddelande. För att hjälpa dig vidare behöver jag två saker:\n\n• vilken behandling det gäller\n• vilka dagar eller tider som passar bäst\n\nNär du svarar på det kan jag ge ett konkret nästa steg direkt.`;
    }
    return `Hej ${firstName},\n\nTack för ditt meddelande. Jag bekräftar gärna nästa steg för ${dueLabel}.\n\nJag återkommer med en tydlig bekräftelse och det du behöver inför besöket.\n\nHör gärna av dig om något behöver justeras.`;
  }

  function buildStudioTrackDraft(thread, trackKey) {
    const firstName = getStudioFirstName(thread);
    const dueLabel = asText(thread?.followUpLabel || "så snart som möjligt");
    const draftModes = getStudioDraftModes(thread);
    const recommendedDraft =
      asText(thread?.raw?.previewDraftBody) ||
      asText(thread?.raw?.draftModes?.[draftModes.recommendedMode]) ||
      asText(thread?.raw?.suggestedReply) ||
      asText(thread?.raw?.proposedReply) ||
      draftModes.professional ||
      draftModes.warm ||
      draftModes.short;

    if (trackKey === "booking" && recommendedDraft) return recommendedDraft;
    if (trackKey === "follow_up") {
      return `Hej ${firstName},\n\nJag följer upp ditt ärende så att vi håller tempot i konversationen.\n\nDet snabbaste sättet framåt är att du svarar direkt med vilken tid som passar bäst, så säkrar jag nästa steg utan dröjsmål.`;
    }
    if (trackKey === "holding") {
      return `Hej ${firstName},\n\nTack för att du väntar. Jag har ditt ärende aktivt uppe och återkommer med ett konkret nästa steg ${dueLabel}.\n\nJag vill hellre ge dig ett tydligt besked än ett oklart mellanbesked.`;
    }
    if (trackKey === "medical") {
      return `Hej ${firstName},\n\nTack för din fråga. Jag vill stämma av detta med kliniken så att du får ett korrekt och tryggt svar.\n\nJag återkommer så snart jag har ett bekräftat besked från ansvarig behandlare.`;
    }
    if (trackKey === "pricing") {
      return `Hej ${firstName},\n\nJag hjälper dig gärna vidare med pris och trygghet inför nästa steg.\n\nOm du vill kan jag skicka ett tydligt prisupplägg direkt här i tråden tillsammans med ett konkret bokningsförslag.`;
    }
    if (trackKey === "admin") {
      return `Hej ${firstName},\n\nTack för ditt meddelande. Jag hjälper dig vidare med den administrativa delen och bekräftar nästa steg i samma tråd.\n\nOm något behöver kompletteras återkommer jag direkt med exakt vad som saknas.`;
    }
    return recommendedDraft || buildStudioTemplateDraft(thread, "confirm_booking");
  }

  function buildStudioDecisionSupportDraft(thread, currentDraft) {
    const clearStep = asText(thread?.nextActionLabel || "Svara gärna direkt");
    const body =
      normalizeText(currentDraft) || buildStudioTrackDraft(thread, inferStudioTrackKey(thread));
    if (normalizeKey(body).includes(normalizeKey(clearStep))) {
      return body;
    }
    return `${body}\n\nNästa steg: ${clearStep}.`;
  }

  function buildStudioToneDraft(thread, currentDraft, toneKey) {
    const firstName = getStudioFirstName(thread);
    const draftModes = getStudioDraftModes(thread);
    const normalizedTone = normalizeKey(toneKey || "professional");
    const baseDraft =
      normalizeText(currentDraft) || buildStudioTrackDraft(thread, inferStudioTrackKey(thread));
    if (normalizedTone === "warm" && draftModes.warm) {
      return draftModes.warm;
    }
    if (normalizedTone === "professional" && draftModes.professional) {
      return draftModes.professional;
    }
    if (normalizedTone === "solution_focus") {
      return `${baseDraft}\n\nSvara gärna direkt med det alternativ som passar bäst så tar jag nästa steg utan dröjsmål.`;
    }
    if (normalizedTone === "decision_support") {
      return buildStudioDecisionSupportDraft(thread, baseDraft);
    }
    if (normalizedTone === "warm") {
      return `Hej ${firstName},\n\nTack för ditt meddelande.\n\n${baseDraft
        .replace(/^hej\s+[^\n,]+,?\s*/i, "")
        .trim()}`;
    }
    return baseDraft;
  }

  function buildStudioRefinedDraft(thread, currentDraft, refineKey) {
    const draftModes = getStudioDraftModes(thread);
    const normalizedRefine = normalizeKey(refineKey || "");
    const baseDraft =
      normalizeText(currentDraft) || buildStudioTrackDraft(thread, inferStudioTrackKey(thread));
    if (normalizedRefine === "shorter" && draftModes.short) {
      return draftModes.short;
    }
    if (normalizedRefine === "warmer") {
      return buildStudioToneDraft(thread, baseDraft, "warm");
    }
    if (normalizedRefine === "professional") {
      return buildStudioToneDraft(thread, baseDraft, "professional");
    }
    if (normalizedRefine === "sharper") {
      return `${baseDraft}\n\nBekräfta gärna i samma svar så låser jag nästa steg direkt.`;
    }
    if (normalizedRefine === "shorter") {
      return baseDraft
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join("\n\n");
    }
    return baseDraft;
  }

  function evaluateStudioPolicy(thread, draftBody) {
    const body = String(draftBody || "");
    const words = countWords(body);
    const bookingKeywords = /\b(bok|tid|appointment|book)\b/i.test(body);
    const hasClock = /\b\d{1,2}[:.]\d{2}\b/.test(body);
    if (!normalizeText(body)) {
      return {
        label: "Utkast saknas",
        summary: "Skriv ett svar innan du skickar.",
        tone: "warning",
      };
    }
    if (bookingKeywords && !hasClock) {
      return {
        label: "Lägg till tid",
        summary: "Bokningssvaret bör nämna en konkret tid eller nästa tydliga steg.",
        tone: "warning",
      };
    }
    if (words > 120) {
      return {
        label: "Korta svaret",
        summary: "Utkastet är långt. Kortare svar brukar ge tydligare beslut i CCO.",
        tone: "warning",
      };
    }
    return {
      label: state.runtime.sendEnabled ? "Policy OK" : "Skicka spärrat",
      summary:
        thread && state.runtime.sendEnabled
          ? `${words} ord · ${thread.nextActionLabel}`
          : "Livedata saknas eller skicka är spärrat just nu.",
      tone: state.runtime.sendEnabled ? "success" : "warning",
    };
  }

  function formatPriorityReason(value) {
    const normalized = normalizeText(value);
    if (!normalized) return "Inget prioritetsskäl registrerat ännu";
    const [reasonCode] = normalized.split(":");
    return humanizeCode(reasonCode || normalized, normalized);
  }

  function mapRuntimeLifecycleLabel(row) {
    const raw = asText(row?.customerSummary?.lifecycleStatus);
    if (isConciseRuntimeValue(raw, { maxChars: 28, maxWords: 3 })) {
      return humanizeCode(raw, "Aktiv dialog");
    }
    if (row?.followUpDueAt || row?.followUpSuggestedAt) return "Återbesök väntar";
    return "Aktiv dialog";
  }

  function mapRuntimeWaitingLabel(row) {
    const waitingState = asText(row?.waitingStateLabel);
    if (isConciseRuntimeValue(waitingState, { maxChars: 30, maxWords: 4 })) {
      return humanizeCode(waitingState, "Behöver åtgärd");
    }
    const waitingOn = normalizeKey(row?.waitingOn);
    if (waitingOn === "customer") return "Väntar på kund";
    if (waitingOn === "owner" || waitingOn === "clinic") return "Behöver åtgärd";
    if (row?.followUpDueAt || row?.followUpSuggestedAt) return "Planerad uppföljning";
    return "Behöver åtgärd";
  }

  function mapRuntimeStatusLabel(row) {
    const explicitCandidates = [row?.bookingReadinessLabel, row?.workflowLabel, row?.needsReplyStatus];
    for (const candidate of explicitCandidates) {
      if (isConciseRuntimeValue(candidate, { maxChars: 32, maxWords: 4 })) {
        return humanizeCode(candidate, "Behöver åtgärd");
      }
    }
    const bookingState = normalizeKey(row?.bookingState);
    const slaStatus = normalizeKey(row?.slaStatus);
    if (bookingState.includes("ready")) return "Kan erbjudas";
    if (slaStatus === "breach" || slaStatus === "warning") return "Svar krävs";
    if (row?.followUpDueAt || row?.followUpSuggestedAt) return "Uppföljning";
    if (row?.isUnanswered === true) return "Öppen";
    return "Behöver åtgärd";
  }

  function mapRuntimeRiskLabel(row) {
    const dominantRisk = asText(row?.dominantRisk);
    if (isConciseRuntimeValue(dominantRisk, { maxChars: 24, maxWords: 3 })) {
      return humanizeCode(dominantRisk, "Bevaka");
    }
    const slaStatus = normalizeKey(row?.slaStatus);
    if (slaStatus === "breach") return "Hög risk";
    if (slaStatus === "warning") return "Bevaka";
    return "Bevaka";
  }

  function mapRuntimeNextActionLabel(row) {
    const explicitCandidates = [row?.nextActionLabel, row?.recommendedActionLabel];
    for (const candidate of explicitCandidates) {
      if (isConciseRuntimeValue(candidate, { maxChars: 28, maxWords: 4 })) {
        return humanizeCode(candidate, "Granska tråden");
      }
    }
    const bookingState = normalizeKey(row?.bookingState);
    const waitingOn = normalizeKey(row?.waitingOn);
    const slaStatus = normalizeKey(row?.slaStatus);
    if (bookingState.includes("ready")) return "Erbjud tid";
    if (slaStatus === "breach" || slaStatus === "warning") return "Svara nu";
    if (waitingOn === "customer") return "Invänta svar";
    if (row?.followUpDueAt || row?.followUpSuggestedAt) return "Följ upp";
    return "Granska tråden";
  }

  function buildFeedIndex(data) {
    const index = new Map();
    const entries = [...asArray(data?.inboundFeed), ...asArray(data?.outboundFeed)];
    entries.forEach((entry) => {
      const conversationId = asText(entry?.conversationId);
      if (!conversationId) return;
      const current = index.get(conversationId) || [];
      current.push(entry);
      index.set(conversationId, current);
    });
    index.forEach((items) => {
      items.sort(
        (left, right) => Date.parse(String(right?.sentAt || "")) - Date.parse(String(left?.sentAt || ""))
      );
    });
    return index;
  }

  function buildPreviewMessages(row, feedEntries) {
    const customerName = getRuntimeCustomerName(row);
    const mailboxLabel = titleCaseMailbox(
      asText(row.mailboxAddress || row.mailboxId || row.userPrincipalName || "kons@hairtpclinic.com")
    );
    const entries = feedEntries.length
      ? feedEntries
      : [
          {
            messageId: row.messageId,
            direction: "inbound",
            sentAt: row.lastInboundAt || row.lastOutboundAt,
            preview: row.latestInboundPreview,
          },
        ];
    return entries.slice(0, 8).map((entry, index) => ({
      id: asText(entry?.messageId, `${row.conversationId}:${index}`),
      author:
        normalizeKey(entry?.direction) === "outbound"
          ? mailboxLabel
          : customerName,
      role: normalizeKey(entry?.direction) === "outbound" ? "staff" : "customer",
      time: formatConversationTime(entry?.sentAt),
      recordedAt: toIso(entry?.sentAt),
      body:
        asText(entry?.preview) ||
        (normalizeKey(entry?.direction) === "outbound"
          ? "Svar skickades från kliniken."
          : "Ingen förhandsvisning tillgänglig."),
      latest: index === 0,
    }));
  }

  function buildHistoryEvents(row, feedEntries) {
    return (feedEntries.length ? feedEntries : [])
      .slice(0, 8)
      .map((entry) => ({
        title: normalizeKey(entry?.direction) === "outbound" ? "E-post skickat" : "E-post mottaget",
        description: asText(entry?.subject, asText(row?.subject, "Tråduppdatering")),
        detail: asText(entry?.preview, "Ingen förhandsvisning tillgänglig."),
        time: formatConversationTime(entry?.sentAt),
        recordedAt: toIso(entry?.sentAt),
        conversationId: asText(entry?.conversationId, asText(row?.conversationId)),
        mailboxId: normalizeMailboxId(
          asText(entry?.mailboxAddress || row?.mailboxAddress || row?.mailboxId)
        ),
        mailboxLabel: titleCaseMailbox(
          asText(entry?.mailboxAddress || row?.mailboxAddress || row?.mailboxId)
        ),
        resultType: "message",
        type: "email",
      }));
  }

  function deriveRuntimeTags(row) {
    const tags = ["all"];
    const workflowLane = normalizeKey(row?.workflowLane);
    const priorityLevel = normalizeKey(row?.priorityLevel);
    const slaStatus = normalizeKey(row?.slaStatus);
    const followUpAt = toIso(row?.followUpDueAt || row?.followUpSuggestedAt);
    const now = Date.now();
    const dayDiff = followUpAt
      ? Math.floor((Date.parse(followUpAt) - now) / (24 * 60 * 60 * 1000))
      : null;
    if (workflowLane === "waiting_reply" || normalizeKey(row?.waitingOn) === "customer") tags.push("later", "followup");
    if (workflowLane === "booking_ready" || normalizeKey(row?.bookingState).includes("ready")) tags.push("bookable");
    if (workflowLane === "medical_review" || row?.needsMedicalReview === true) tags.push("medical");
    if (workflowLane === "admin_low") tags.push("admin");
    if (["critical", "high"].includes(priorityLevel)) tags.push("sprint");
    if (slaStatus === "breach" || workflowLane === "action_now") tags.push("act-now", "today");
    else if (slaStatus === "warning") tags.push("today");
    if (!asText(row?.owner)) tags.push("unassigned");
    if (slaStatus === "breach" || asNumber(row?.riskStackScore, 0) >= 0.6) tags.push("high-risk");
    if (dayDiff === 0) tags.push("today");
    if (dayDiff === 1) tags.push("tomorrow");
    return Array.from(new Set(tags));
  }

  function buildRuntimeSummaryCards(row, thread) {
    const latestInbound = row?.lastInboundAt ? formatConversationTime(row.lastInboundAt) : "Ingen inkommande ännu";
    const latestOutbound = row?.lastOutboundAt ? formatConversationTime(row.lastOutboundAt) : "Inte besvarad ännu";
    const historySummary = compactRuntimeCopy(
      row?.customerSummary?.historySignalSummary,
      "Ingen historiksignal registrerad ännu.",
      110
    );
    const historyActionCue = compactRuntimeCopy(
      row?.customerSummary?.historySignalActionCue,
      "Håll svaret konkret och tydligt.",
      110
    );
    return {
      overview: [
        {
          chip: "Historiksignal",
          tone: "violet",
          lines: [
            historySummary || compactRuntimeCopy(row?.customerSummary?.lastCaseSummary, "Ingen historiksignal registrerad ännu.", 110),
            historyActionCue || compactRuntimeCopy(row?.recommendedAction, "Håll svaret konkret och tydligt.", 110),
            `${thread.mailboxesLabel} · ${Math.max(1, asNumber(row?.customerSummary?.historyMessageCount, row?.customerSummary?.interactionCount || 1))} mail`,
          ],
        },
        {
          chip: "Trender & patterns",
          tone: "violet",
          lines: [
            row?.priorityReasons?.[0]
              ? `Prioritetsskäl: ${formatPriorityReason(row.priorityReasons[0])}`
              : "Inget prioritetsskäl registrerat ännu",
            `Tempoprofil: ${humanizeCode(row?.tempoProfile, "Reflekterande")}`,
            `Livscykel: ${thread.lifecycleLabel}`,
          ],
        },
        {
          chip: "Kommunikationshistorik",
          tone: "blue",
          lines: [
            `Senaste inkommande: ${latestInbound}`,
            `Senaste utgående: ${latestOutbound}`,
            `Mailbox: ${thread.mailboxLabel}`,
          ],
        },
        {
          chip: "AI-insikter",
          tone: "green",
          lines: [
            `Nästa steg: ${thread.nextActionLabel}`,
            thread.followUpLabel ? `Uppföljning: ${thread.followUpLabel}` : `Väntar på: ${thread.waitingLabel}`,
            `Riskbild: ${thread.riskLabel}`,
          ],
        },
      ],
      ai: [
        {
          chip: "Svarssignal",
          tone: "violet",
          lines: [
            `Ton: ${humanizeCode(row?.tone, "Neutral")}`,
            `CTA-intensitet: ${humanizeCode(row?.ctaIntensity, "Normal")}`,
            `Konfidens: ${Math.round(clamp(asNumber(row?.toneConfidence, 0.4), 0, 1) * 100)}%`,
          ],
        },
        {
          chip: "Utkast & tempo",
          tone: "blue",
          lines: [
            compactRuntimeCopy(row?.recommendedAction, "Granska tråden och svara tydligt.", 110),
            compactRuntimeCopy(row?.followUpTimingReason?.[0], "Ingen separat timing-signal just nu.", 110),
            compactRuntimeCopy(row?.latestInboundPreview, "Ingen preview tillgänglig.", 110),
          ],
        },
      ],
      medicine: [
        {
          chip: "Medicinsk kontext",
          tone: "green",
          lines: [
            humanizeCode(row?.dominantRisk, "Ingen dominant risk"),
            compactRuntimeCopy(row?.riskStackExplanation, "Ingen medicinsk spärr registrerad.", 110),
            compactRuntimeCopy(row?.medicalContext, "Följ klinikens vanliga kontrollflöde vid osäkerhet.", 110),
          ],
        },
      ],
      team: [
        {
          chip: "Teamläge",
          tone: "blue",
          lines: [
            `Ägare: ${thread.ownerLabel}`,
            `Väntar på: ${thread.waitingLabel}`,
            compactRuntimeCopy(row?.escalationRule, "Ingen eskalering krävs just nu.", 110),
          ],
        },
      ],
      actions: [
        {
          chip: "Nästa drag",
          tone: "green",
          lines: [
            thread.nextActionLabel,
            compactRuntimeCopy(thread.nextActionSummary, "Granska tråden och ta nästa tydliga steg.", 110),
            thread.followUpLabel ? `Planerad uppföljning: ${thread.followUpLabel}` : "Ingen planerad uppföljning ännu.",
          ],
        },
      ],
    };
  }

  function buildMailboxCatalog(rows, metadata = {}) {
    const entries = new Map();
    asArray(metadata?.sourceMailboxIds).forEach((email) => {
      const safeEmail = asText(email).toLowerCase();
      if (!safeEmail) return;
      entries.set(safeEmail, {
        id: safeEmail,
        email: safeEmail,
        label: titleCaseMailbox(safeEmail),
      });
    });
    rows.forEach((row) => {
      const email = asText(row?.mailboxAddress || row?.mailboxId || row?.userPrincipalName).toLowerCase();
      if (!email || entries.has(email)) return;
      entries.set(email, {
        id: email,
        email,
        label: titleCaseMailbox(email),
      });
    });
    return Array.from(entries.values());
  }

  function buildFallbackRowsFromFeed(data) {
    const rowsByConversation = new Map();
    [...asArray(data?.inboundFeed), ...asArray(data?.outboundFeed)].forEach((entry) => {
      const conversationId = asText(entry?.conversationId);
      if (!conversationId || rowsByConversation.has(conversationId)) return;
      rowsByConversation.set(conversationId, {
        conversationId,
        messageId: asText(entry?.messageId),
        mailboxId: asText(entry?.mailboxAddress),
        mailboxAddress: asText(entry?.mailboxAddress),
        userPrincipalName: asText(entry?.mailboxAddress),
        subject: asText(entry?.subject, "(utan ämne)"),
        sender: asText(entry?.counterpart, "Okänd kund"),
        latestInboundPreview: asText(entry?.preview),
        lastInboundAt: normalizeKey(entry?.direction) === "inbound" ? asText(entry?.sentAt) : "",
        lastOutboundAt: normalizeKey(entry?.direction) === "outbound" ? asText(entry?.sentAt) : "",
        slaStatus: "safe",
        priorityLevel: "medium",
        waitingOn: normalizeKey(entry?.direction) === "inbound" ? "owner" : "customer",
        intent: "unclear",
        customerSummary: {
          customerName: asText(entry?.counterpart, "Okänd kund"),
          lifecycleStatus: "active_dialogue",
          interactionCount: 1,
          engagementScore: 0.35,
          lastCaseSummary: asText(entry?.preview),
        },
        recommendedAction: "Granska konversation",
        riskStackExplanation: "Ingen dominant risk identifierad.",
      });
    });
    return Array.from(rowsByConversation.values());
  }

  function humanizeHistoryCounterpartyEmail(value) {
    const email = extractEmail(value);
    if (!email) return "";
    return email
      .split("@")[0]
      .split(/[._+-]+/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function buildHistoryConversationKey(message = {}) {
    const conversationId = asText(message?.conversationId);
    if (conversationId) return conversationId;
    const mailboxId = asText(
      message?.mailboxId || message?.mailboxAddress || message?.userPrincipalName,
      "kons@hairtpclinic.com"
    ).toLowerCase();
    const customerEmail =
      extractEmail(
        message?.customerEmail ||
          message?.counterpartyEmail ||
          message?.senderEmail ||
          asArray(message?.replyToRecipients)[0] ||
          asArray(message?.recipients)[0]
      ) || "okand-kund";
    const subjectKey = normalizeKey(
      asText(message?.normalizedSubject || message?.subject, "(utan ämne)")
    );
    return `${mailboxId}:${customerEmail}:${subjectKey || "utan-amne"}`;
  }

  function buildHistoryFeedEntries(messages = []) {
    return asArray(messages)
      .slice()
      .sort(compareHistoryEventsDesc)
      .map((message) => ({
        messageId: asText(message?.messageId),
        conversationId: buildHistoryConversationKey(message),
        mailboxAddress: asText(
          message?.mailboxId || message?.mailboxAddress || message?.userPrincipalName,
          "kons@hairtpclinic.com"
        ),
        sentAt: toIso(message?.sentAt),
        preview: asText(message?.bodyPreview),
        subject: asText(message?.subject, "(utan ämne)"),
        direction: normalizeKey(message?.direction) === "outbound" ? "outbound" : "inbound",
      }));
  }

  function extractHistoryCustomerEmail(messages = [], mailboxIds = []) {
    const mailboxSet = new Set(
      asArray(mailboxIds)
        .map((item) => extractEmail(item))
        .filter(Boolean)
    );
    for (const message of asArray(messages)) {
      const candidates = [
        message?.customerEmail,
        message?.counterpartyEmail,
        message?.senderEmail,
        ...asArray(message?.replyToRecipients),
        ...asArray(message?.recipients),
      ];
      for (const candidate of candidates) {
        const email = extractEmail(candidate);
        if (!email || mailboxSet.has(email)) continue;
        return email;
      }
    }
    return "";
  }

  function deriveHistoryCustomerName(messages = [], mailboxIds = []) {
    for (const message of asArray(messages)) {
      const candidate =
        normalizeKey(message?.direction) === "outbound"
          ? asText(message?.counterpartyName)
          : asText(message?.senderName);
      if (candidate && !looksLikeMailboxIdentity(candidate)) {
        return candidate;
      }
    }
    return humanizeHistoryCounterpartyEmail(
      extractHistoryCustomerEmail(messages, mailboxIds)
    );
  }

  function deriveHistorySlaStatus(latestMessage, followUpDueAt = "") {
    const dueIso = toIso(followUpDueAt);
    if (dueIso) {
      const diffHours = (Date.parse(dueIso) - Date.now()) / (60 * 60 * 1000);
      if (diffHours <= 0) return "breach";
      if (diffHours <= 12) return "warning";
      return "safe";
    }
    if (normalizeKey(latestMessage?.direction) === "outbound") return "safe";
    const sentIso = toIso(latestMessage?.sentAt);
    if (!sentIso) return "safe";
    const ageHours = (Date.now() - Date.parse(sentIso)) / (60 * 60 * 1000);
    if (ageHours >= 72) return "breach";
    if (ageHours >= 24) return "warning";
    return "safe";
  }

  function deriveHistoryPriorityLevel({ slaStatus = "", messageCount = 0, latestMessage = null } = {}) {
    if (normalizeKey(slaStatus) === "breach") return "high";
    if (normalizeKey(slaStatus) === "warning") return "medium";
    if (messageCount >= 8) return "medium";
    if (normalizeKey(latestMessage?.direction) === "inbound") return "medium";
    return "low";
  }

  function deriveHistoryEngagementScore(messages = [], liveRow = null) {
    const liveScore = asNumber(liveRow?.customerSummary?.engagementScore, NaN);
    if (Number.isFinite(liveScore)) {
      return clamp(liveScore, 0, 1);
    }
    const messageCount = asArray(messages).length;
    return clamp(0.32 + Math.min(messageCount, 12) * 0.045, 0.28, 0.88);
  }

  function buildHistoryRuntimeEvents(events = [], fallback = {}) {
    return dedupeHistoryEvents(
      asArray(events).map((event) =>
        createHistoryEvent({
          title:
            asText(event?.title) ||
            (normalizeKey(event?.resultType) === "message"
              ? normalizeKey(event?.direction) === "outbound"
                ? "E-post skickat"
                : "E-post mottaget"
              : "Historikhändelse"),
          description: asText(
            event?.summary || event?.subject || event?.title,
            "Historikhändelse"
          ),
          detail: asText(
            event?.detail || event?.summary || event?.subject,
            "Ingen detalj tillgänglig."
          ),
          recordedAt: event?.recordedAt,
          mailboxId: event?.mailboxId || fallback.mailboxAddress,
          mailboxLabel:
            asText(event?.mailboxId)
              ? titleCaseMailbox(asText(event.mailboxId))
              : asText(fallback.mailboxLabel),
          conversationId: event?.conversationId || fallback.conversationId,
          resultType: event?.resultType || "action",
          type:
            event?.actionType ||
            event?.outcomeCode ||
            event?.direction ||
            event?.resultType ||
            "action",
        })
      )
    ).sort(compareHistoryEventsDesc);
  }

  function deriveHistoryThreadTags({
    liveRow = null,
    latestAction = null,
    latestMessage = null,
    slaStatus = "",
    priorityLevel = "",
    followUpDueAt = "",
  } = {}) {
    if (liveRow) {
      return deriveRuntimeTags(liveRow);
    }
    const tags = ["all"];
    const normalizedActionType = normalizeKey(latestAction?.actionType || "");
    const normalizedSla = normalizeKey(slaStatus);
    const normalizedPriority = normalizeKey(priorityLevel);
    if (normalizedActionType === "reply_later" || toIso(followUpDueAt)) {
      tags.push("later", "followup");
    }
    if (normalizedSla === "breach") {
      tags.push("act-now", "today", "high-risk");
    } else if (normalizedSla === "warning") {
      tags.push("today");
    }
    if (normalizedPriority === "high") {
      tags.push("sprint");
    }
    if (!asText(liveRow?.owner)) {
      tags.push("unassigned");
    }
    if (
      normalizedSla === "safe" &&
      normalizeKey(latestMessage?.direction) === "inbound" &&
      !tags.includes("act-now")
    ) {
      tags.push("sprint");
    }
    return Array.from(new Set(tags));
  }

  function buildHistoryBackedRuntimeRow({
    conversationId,
    messages = [],
    events = [],
    liveRow = null,
  } = {}) {
    const sortedMessages = asArray(messages).slice().sort(compareHistoryEventsDesc);
    const sortedEvents = asArray(events).slice().sort(compareHistoryEventsDesc);
    const latestMessage = sortedMessages[0] || null;
    const latestInbound = sortedMessages.find(
      (message) => normalizeKey(message?.direction) !== "outbound"
    );
    const latestOutbound = sortedMessages.find(
      (message) => normalizeKey(message?.direction) === "outbound"
    );
    const latestAction = sortedEvents.find(
      (event) => normalizeKey(event?.resultType) === "action"
    );
    const latestOutcome = sortedEvents.find(
      (event) => normalizeKey(event?.resultType) === "outcome"
    );
    const mailboxIds = Array.from(
      new Set(
        sortedMessages
          .map((message) =>
            asText(message?.mailboxId || message?.mailboxAddress || message?.userPrincipalName).toLowerCase()
          )
          .filter(Boolean)
      )
    );
    const mailboxAddress =
      mailboxIds[0] ||
      asText(liveRow?.mailboxAddress || liveRow?.mailboxId || liveRow?.userPrincipalName, "kons@hairtpclinic.com");
    const customerEmail =
      extractHistoryCustomerEmail(sortedMessages, mailboxIds) || extractCustomerEmail(liveRow || {});
    const customerName =
      deriveHistoryCustomerName(sortedMessages, mailboxIds) ||
      getRuntimeCustomerName(liveRow || {});
    const latestPreview = asText(
      latestInbound?.bodyPreview || latestMessage?.bodyPreview,
      "Ingen förhandsvisning tillgänglig."
    );
    const followUpDueAt = asText(
      liveRow?.followUpDueAt ||
        liveRow?.followUpSuggestedAt ||
        latestAction?.followUpDueAt
    );
    const waitingOn = asText(
      latestAction?.waitingOn,
      normalizeKey(latestMessage?.direction) === "outbound" ? "customer" : "owner"
    );
    const slaStatus = asText(
      liveRow?.slaStatus,
      deriveHistorySlaStatus(latestMessage, followUpDueAt)
    );
    const priorityLevel = asText(
      liveRow?.priorityLevel,
      deriveHistoryPriorityLevel({
        slaStatus,
        messageCount: sortedMessages.length,
        latestMessage,
      })
    );
    const customerSummary = {
      ...(liveRow?.customerSummary && typeof liveRow.customerSummary === "object"
        ? liveRow.customerSummary
        : {}),
      customerName,
      customerKey: customerEmail || extractCustomerEmail(liveRow || {}),
      lifecycleStatus: asText(
        liveRow?.customerSummary?.lifecycleStatus,
        followUpDueAt ? "follow_up_pending" : "active_dialogue"
      ),
      interactionCount: Math.max(
        sortedMessages.length,
        asNumber(liveRow?.customerSummary?.interactionCount, 0),
        1
      ),
      historyMessageCount: Math.max(
        sortedMessages.length,
        asNumber(liveRow?.customerSummary?.historyMessageCount, 0),
        1
      ),
      historyMailboxIds:
        mailboxIds.length > 0
          ? mailboxIds
          : asArray(liveRow?.customerSummary?.historyMailboxIds),
      lastCaseSummary: latestPreview,
      historySignalSummary: compactRuntimeCopy(
        latestOutcome?.summary ||
          latestAction?.summary ||
          liveRow?.customerSummary?.historySignalSummary ||
          latestPreview,
        "Historiksignal saknas ännu.",
        120
      ),
      historySignalActionCue: compactRuntimeCopy(
        latestAction?.nextActionSummary ||
          latestOutcome?.recommendedAction ||
          liveRow?.customerSummary?.historySignalActionCue ||
          (normalizeKey(latestMessage?.direction) === "outbound"
            ? "Invänta nästa svar från kunden eller planera uppföljning."
            : "Öppna tråden och ta nästa tydliga steg."),
        "Håll nästa steg tydligt och konkret.",
        120
      ),
      engagementScore: deriveHistoryEngagementScore(sortedMessages, liveRow),
      caseCount: Math.max(asNumber(liveRow?.customerSummary?.caseCount, 0), 1),
    };
    const baseRow = {
      ...(liveRow && typeof liveRow === "object" ? liveRow : {}),
      conversationId: asText(conversationId),
      messageId: asText(latestMessage?.messageId, asText(liveRow?.messageId, `${conversationId}-history`)),
      mailboxId: mailboxAddress,
      mailboxAddress,
      userPrincipalName: mailboxAddress,
      subject: asText(latestMessage?.subject, asText(liveRow?.subject, "(utan ämne)")),
      sender: customerEmail || customerName,
      senderName: customerName,
      customerEmail,
      latestInboundPreview: latestPreview,
      lastInboundAt: asText(latestInbound?.sentAt, asText(liveRow?.lastInboundAt)),
      lastOutboundAt: asText(latestOutbound?.sentAt, asText(liveRow?.lastOutboundAt)),
      slaStatus,
      priorityLevel,
      waitingOn,
      intent: asText(liveRow?.intent, asText(latestOutcome?.intent, asText(latestAction?.intent, "unclear"))),
      recommendedAction: asText(
        latestOutcome?.recommendedAction ||
          latestAction?.nextActionSummary ||
          liveRow?.recommendedAction,
        normalizeKey(latestMessage?.direction) === "outbound"
          ? "Invänta svar eller planera uppföljning."
          : "Svara kunden och ta nästa tydliga steg."
      ),
      recommendedActionLabel: asText(
        latestAction?.nextActionLabel || liveRow?.recommendedActionLabel,
        normalizeKey(latestMessage?.direction) === "outbound" ? "Invänta svar" : "Svara nu"
      ),
      riskStackExplanation: asText(
        liveRow?.riskStackExplanation,
        compactRuntimeCopy(
          latestOutcome?.detail ||
            latestAction?.summary ||
            (normalizeKey(latestMessage?.direction) === "outbound"
              ? "Senaste händelsen i tråden var ett utgående svar från kliniken."
              : "Senaste händelsen i tråden var ett inkommande mail från kunden."),
          "Ingen dominant risk identifierad.",
          140
        )
      ),
      operatorCue: asText(
        liveRow?.operatorCue,
        latestAction?.nextActionSummary || latestOutcome?.summary || ""
      ),
      owner: asText(liveRow?.owner, "Oägd"),
      followUpDueAt,
      workflowLane: asText(
        liveRow?.workflowLane,
        normalizeKey(latestAction?.actionType) === "reply_later" || followUpDueAt
          ? "waiting_reply"
          : normalizeKey(slaStatus) === "breach"
            ? "action_now"
            : ""
      ),
      bookingState: asText(liveRow?.bookingState),
      isUnanswered:
        normalizeKey(latestMessage?.direction) !== "outbound" ||
        liveRow?.isUnanswered === true,
      lastActionTakenLabel: asText(
        liveRow?.lastActionTakenLabel,
        asText(latestAction?.title)
      ),
      lastActionTakenAt: asText(
        liveRow?.lastActionTakenAt,
        asText(latestAction?.recordedAt)
      ),
      dominantRisk: asText(liveRow?.dominantRisk, asText(latestOutcome?.dominantRisk)),
      customerSummary,
    };
    baseRow.tags = deriveHistoryThreadTags({
      liveRow,
      latestAction,
      latestMessage,
      slaStatus,
      priorityLevel,
      followUpDueAt,
    });
    return baseRow;
  }

  function buildRuntimeThread(row, { feedEntries = [], historyEvents = [] } = {}) {
    const customerName = getRuntimeCustomerName(row);
    const customerEmail = extractCustomerEmail(row);
    const mailboxAddress = asText(row?.mailboxAddress || row?.mailboxId || row?.userPrincipalName);
    const ownerName = asText(row?.owner, "Oägd");
    const lifecycleLabel = mapRuntimeLifecycleLabel(row);
    const waitingLabel = mapRuntimeWaitingLabel(row);
    const statusLabel = mapRuntimeStatusLabel(row);
    const riskLabel = mapRuntimeRiskLabel(row);
    const riskReason = compactRuntimeCopy(
      row?.riskStackExplanation,
      row?.recommendedAction || "Ingen dominant risk identifierad.",
      96
    );
    const followUpLabel = row?.followUpDueAt || row?.followUpSuggestedAt
      ? formatDueLabel(row?.followUpDueAt || row?.followUpSuggestedAt)
      : "";
    const messages = buildPreviewMessages(row, feedEntries);
    const resolvedHistoryEvents = historyEvents.length
      ? historyEvents
      : buildHistoryEvents(row, feedEntries);
    const engagementScore = clamp(
      asNumber(row?.customerSummary?.engagementScore, 0.42),
      0,
      1
    );
    const mailboxes = buildMailboxCatalog([row], {
      sourceMailboxIds:
        asArray(row?.customerSummary?.historyMailboxIds).length > 0
          ? row.customerSummary.historyMailboxIds
          : [mailboxAddress],
    });
    const thread = {
      id: asText(row?.conversationId),
      subject: asText(row?.subject, "(utan ämne)"),
      customerName,
      customerEmail,
      mailboxAddress,
      mailboxLabel: titleCaseMailbox(mailboxAddress),
      ownerLabel: ownerName,
      ownerKey:
        normalizeKey(ownerName) === "oägd" || !normalizeKey(ownerName)
          ? "unassigned"
          : normalizeKey(ownerName),
      lifecycleLabel,
      waitingLabel,
      statusLabel,
      riskLabel,
      riskReason,
      followUpLabel,
      preview: asText(
        row?.latestInboundPreview,
        "Ingen förhandsvisning tillgänglig."
      ),
      lastActivityLabel: formatListTime(row?.lastInboundAt || row?.lastOutboundAt),
      lastActivityAt: toIso(row?.lastInboundAt || row?.lastOutboundAt),
      unread: row?.isUnanswered === true,
      intentLabel: humanizeCode(row?.intent, "Oklart"),
      isVIP: engagementScore >= 0.75 || asNumber(row?.customerSummary?.caseCount, 0) >= 4,
      engagementLabel: `${Math.round(engagementScore * 100)}% engagemang`,
      nextActionLabel: mapRuntimeNextActionLabel(row),
      nextActionSummary: compactRuntimeCopy(
        row?.operatorCue || row?.customerSummary?.historySignalActionCue || row?.customerSummary?.lastCaseSummary || row?.latestInboundPreview,
        "Granska tråden och ta nästa tydliga steg.",
        124
      ),
      whyInFocus: compactRuntimeCopy(
        row?.riskStackExplanation || row?.operatorCue || row?.customerSummary?.historySignalSummary || row?.latestInboundPreview,
        "Aktiv konversation kräver uppföljning.",
        124
      ),
      tags:
        asArray(row?.tags).length > 0
          ? Array.from(new Set(asArray(row.tags).map(normalizeKey).filter(Boolean)))
          : deriveRuntimeTags(row),
      avatar: buildAvatarDataUri(customerName),
      messages,
      historyEvents: resolvedHistoryEvents,
      historyMailboxOptions: mailboxes.map((item) => ({
        id: item.id,
        label: item.label,
      })),
      raw: row,
      mailboxesLabel:
        mailboxes.length > 1
          ? `${mailboxes.map((item) => item.label).join(", ")}`
          : mailboxes[0]?.label || titleCaseMailbox(mailboxAddress),
    };
    thread.cards = buildRuntimeSummaryCards(row, thread);
    return thread;
  }

  function buildLiveThreads(data, options = {}) {
    const sourceRows = [...asArray(data?.conversationWorklist), ...asArray(data?.needsReplyToday)];
    const uniqueRows = new Map();
    sourceRows.forEach((row) => {
      const conversationId = asText(row?.conversationId);
      if (!conversationId || uniqueRows.has(conversationId)) return;
      uniqueRows.set(conversationId, row);
    });
    const feedIndex = buildFeedIndex(data);
    const liveRows = uniqueRows.size ? Array.from(uniqueRows.values()) : buildFallbackRowsFromFeed(data);
    const historyMessages = asArray(options?.historyMessages);
    const historyEvents = asArray(options?.historyEvents);

    if (!historyMessages.length) {
      return liveRows.map((row) =>
        buildRuntimeThread(row, {
          feedEntries: feedIndex.get(asText(row?.conversationId)) || [],
        })
      );
    }

    const liveRowsByConversation = new Map(
      liveRows.map((row) => [asText(row?.conversationId), row]).filter((entry) => entry[0])
    );
    const messagesByConversation = new Map();
    historyMessages.forEach((message) => {
      const conversationId = buildHistoryConversationKey(message);
      if (!conversationId) return;
      const current = messagesByConversation.get(conversationId) || [];
      current.push(message);
      messagesByConversation.set(conversationId, current);
    });
    const eventsByConversation = new Map();
    historyEvents.forEach((event) => {
      const conversationId = asText(event?.conversationId);
      if (!conversationId) return;
      const current = eventsByConversation.get(conversationId) || [];
      current.push(event);
      eventsByConversation.set(conversationId, current);
    });

    const threads = [];
    const processedConversationIds = new Set();

    messagesByConversation.forEach((messages, conversationId) => {
      const row = buildHistoryBackedRuntimeRow({
        conversationId,
        messages,
        events: eventsByConversation.get(conversationId) || [],
        liveRow: liveRowsByConversation.get(conversationId) || null,
      });
      threads.push(
        buildRuntimeThread(row, {
          feedEntries: buildHistoryFeedEntries(messages),
          historyEvents: buildHistoryRuntimeEvents(eventsByConversation.get(conversationId) || [], {
            conversationId,
            mailboxAddress: row.mailboxAddress,
            mailboxLabel: titleCaseMailbox(row.mailboxAddress),
          }),
        })
      );
      processedConversationIds.add(conversationId);
    });

    liveRows.forEach((row) => {
      const conversationId = asText(row?.conversationId);
      if (!conversationId || processedConversationIds.has(conversationId)) return;
      threads.push(
        buildRuntimeThread(row, {
          feedEntries: feedIndex.get(conversationId) || [],
        })
      );
    });

    return threads.sort((left, right) =>
      String(right?.lastActivityAt || "").localeCompare(String(left?.lastActivityAt || ""))
    );
  }

  function buildStudioContextAiItems(thread) {
    return [
      {
        label: "NU I",
        title: thread?.statusLabel || "Redo för åtgärd",
        copy: thread?.whyInFocus || "Ingen fokusmotivering tillgänglig.",
      },
      {
        label: "NÄSTA STEG",
        title: thread?.nextActionLabel || "Granska tråden",
        copy: thread?.nextActionSummary || "Ta nästa tydliga steg i samma tråd.",
      },
      {
        label: "VÄNTAR / BLOCKERAR",
        title: thread?.waitingLabel || "Behöver åtgärd",
        copy: compactRuntimeCopy(thread?.riskReason, "Ingen blockerande signal just nu.", 110),
      },
    ];
  }

  function renderStudioContextAiList(items) {
    const container = studioContextListNodes.ai;
    if (!container) return;
    container.innerHTML = items.length
      ? items
          .map(
            (item) => `<article class="studio-context-mini">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.copy)}</p>
            </article>`
          )
          .join("")
      : `<article class="studio-context-mini">
          <span>AI</span>
          <strong>Ingen kontext ännu</strong>
          <p>Välj en live-tråd för att ladda svarsstudion.</p>
        </article>`;
  }

  function renderStudioContextHistoryList(thread) {
    const container = studioContextListNodes.history;
    if (!container) return;
    const items = asArray(thread?.historyEvents).slice(0, 3);
    container.innerHTML = items.length
      ? items
          .map(
            (item) => `<article class="studio-history-item">
              <strong>${escapeHtml(item.description || item.title || "Historik")}</strong>
              <span>${escapeHtml(item.time || formatConversationTime(item.recordedAt))}</span>
            </article>`
          )
          .join("")
      : `<article class="studio-history-item"><strong>Ingen historik ännu</strong><span>-</span></article>`;
  }

  function renderStudioContextPreferencesList(thread) {
    const container = studioContextListNodes.preferences;
    if (!container) return;
    const rows = [
      { label: "Mailbox", value: thread?.mailboxLabel || "Okänd" },
      { label: "Ägare", value: thread?.ownerLabel || "Oägd" },
      { label: "SLA", value: humanizeCode(thread?.raw?.slaStatus, "Stabil") },
      { label: "Kanal", value: "E-post" },
    ];
    container.innerHTML = rows
      .map(
        (item) =>
          `<div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`
      )
      .join("");
  }

  function renderStudioContextRecommendationsList(thread) {
    const container = studioContextListNodes.recommendations;
    if (!container) return;
    const items = [
      {
        title: "Var konkret med nästa steg",
        copy: thread?.nextActionSummary || "Gör nästa steg tydligt i samma svar.",
      },
      {
        title: "Matcha kundens tempo",
        copy: compactRuntimeCopy(thread?.whyInFocus, "Håll tempot uppe i tråden.", 110),
      },
      {
        title: "Behåll samma mailbox",
        copy: `${thread?.mailboxLabel || "Mailbox"} · ${thread?.ownerLabel || "Oägd"}`,
      },
    ];
    container.innerHTML = items
      .map(
        (item) => `<article class="studio-recommendation-item">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.copy)}</p>
        </article>`
      )
      .join("");
  }

  function getLatestCustomerMessage(thread) {
    const messages = asArray(thread?.messages);
    return (
      messages.find((entry) => normalizeKey(entry?.role) === "customer") || messages[0] || null
    );
  }

  function getStudioConversationMessages(thread) {
    const messages = asArray(thread?.messages)
      .filter(
        (entry) =>
          normalizeText(entry?.body) ||
          normalizeText(entry?.author) ||
          normalizeText(entry?.time)
      )
      .slice(0, 6)
      .reverse();

    if (messages.length) return messages;
    if (!thread) return [];

    return [
      {
        id: `${asText(thread?.id, "thread")}:preview`,
        author: thread?.customerName || "Kund",
        role: "customer",
        time: thread?.lastActivityLabel || "",
        body: thread?.preview || "Ingen förhandsvisning tillgänglig.",
      },
    ];
  }

  function renderStudioConversation(thread) {
    if (!studioIncomingBody) return;

    const messages = getStudioConversationMessages(thread);
    if (!thread) {
      studioIncomingBody.innerHTML =
        '<article class="studio-conversation-message studio-conversation-message--empty"><p class="studio-conversation-message-text">Välj en live-tråd i arbetskön för att öppna konversationen i studion.</p></article>';
      return;
    }

    studioIncomingBody.innerHTML = messages
      .map((message) => {
        const roleClass =
          normalizeKey(message?.role) === "staff"
            ? "studio-conversation-message--staff"
            : "studio-conversation-message--customer";
        const author = escapeHtml(
          asText(
            message?.author,
            normalizeKey(message?.role) === "staff" ? "Team" : thread?.customerName || "Kund"
          )
        );
        const time = escapeHtml(asText(message?.time, ""));
        const body = escapeHtml(
          asText(message?.body, thread?.preview || "Ingen förhandsvisning tillgänglig.")
        ).replace(/\n/g, "<br />");

        return `<article class="studio-conversation-message ${roleClass}">
          <div class="studio-conversation-message-head">
            <strong class="studio-conversation-message-author">${author}</strong>
            <span class="studio-conversation-message-time">${time}</span>
          </div>
          <p class="studio-conversation-message-text">${body}</p>
        </article>`;
      })
      .join("");
  }

  function createStudioState(thread) {
    const trackKey = inferStudioTrackKey(thread);
    const selectedSignature = getStudioSignatureProfile(state.runtime.defaultSignatureProfile).id;
    const baseDraft = buildStudioTrackDraft(thread, trackKey);
    return {
      mode: "reply",
      threadId: asText(thread?.id),
      composeMailboxId: getStudioSourceMailboxId(thread),
      composeTo: getRuntimeCustomerEmail(thread),
      composeSubject: "",
      draftBody: baseDraft,
      baseDraftBody: baseDraft,
      activeTemplateKey: "",
      activeTrackKey: trackKey,
      activeToneKey: "professional",
      activeRefineKey: "",
      selectedSignatureId: selectedSignature,
      sending: false,
      savingDraft: false,
      deleting: false,
      previewing: false,
    };
  }

  function createComposeStudioState(thread = null) {
    const selectedSignature = getStudioSignatureProfile(state.runtime.defaultSignatureProfile).id;
    const composeTo = getRuntimeCustomerEmail(thread);
    const firstName = thread ? getStudioFirstName(thread) : "";
    const baseDraft = firstName ? `Hej ${firstName},\n\n` : "";
    return {
      mode: "compose",
      threadId: asText(thread?.id),
      composeMailboxId: getStudioSourceMailboxId(thread),
      composeTo,
      composeSubject: "",
      draftBody: baseDraft,
      baseDraftBody: baseDraft,
      activeTemplateKey: "",
      activeTrackKey: thread ? inferStudioTrackKey(thread) : "admin",
      activeToneKey: "professional",
      activeRefineKey: "",
      selectedSignatureId: selectedSignature,
      sending: false,
      savingDraft: false,
      deleting: false,
      previewing: false,
    };
  }

  function prepareComposeStudioState(thread = getSelectedRuntimeThread()) {
    state.studio = createComposeStudioState(thread);
    return state.studio;
  }

  function ensureStudioState(thread) {
    if (!thread) return null;
    if (state.studio.threadId !== thread.id) {
      state.studio = createStudioState(thread);
    }
    if (!normalizeText(state.studio.draftBody)) {
      state.studio.draftBody =
        state.studio.baseDraftBody ||
        buildStudioTrackDraft(thread, state.studio.activeTrackKey);
    }
    state.studio.selectedSignatureId = getStudioSignatureProfile(
      state.studio.selectedSignatureId
    ).id;
    state.studio.mode = "reply";
    return state.studio;
  }

  function setStudioFeedback(message = "", tone = "") {
    setFeedback(studioFeedback, tone, message);
  }

  function renderStudioSelection(buttons, activeValue, datasetKey) {
    buttons.forEach((button) => {
      const isActive =
        normalizeKey(button.dataset[datasetKey]) === normalizeKey(activeValue);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  const {
    applyNoteModePreset,
    applyStudioMode,
    buildRuntimeScheduleDraft,
    createNoteDraft,
    createScheduleDraft,
    getLaterOptionLabel,
    normalizeStudioBusyState,
    openLaterDialog,
    renderLaterOptions,
    renderMailboxAdminList,
    renderNoteDestination,
    renderScheduleDraft,
    renderStudioShell,
    renderTags,
    renderTemplateButtons,
    renderWorkspaceRuntimeContext,
    setContextCollapsed,
    setLaterOpen,
    setMailboxAdminOpen,
    setNoteModeOpen,
    setNoteOpen,
    setScheduleOpen,
    setStudioOpen,
    syncNoteCount,
  } = PREVIEW_OVERLAY_RENDERERS.createOverlayRenderers({
    dom: {
      canvas,
      contextButtons,
      destinationButtons,
      laterOptionButtons,
      mailboxAdminFeedback,
      mailboxAdminList,
      mailboxAdminShell,
      noteCount,
      noteDataStack,
      noteFeedback,
      noteLivePreview,
      noteLinkedList,
      noteModeContext,
      noteModeOptionButtons,
      noteModeShell,
      notePrioritySelect,
      noteShell,
      noteTagsRow,
      noteText,
      noteVisibilitySelect,
      scheduleCategoryHint,
      scheduleCategoryPill,
      scheduleCategorySelect,
      scheduleCustomerInput,
      scheduleCustomerPill,
      scheduleDateHint,
      scheduleDateInput,
      scheduleDoctorHint,
      scheduleDoctorSelect,
      scheduleLinkedList,
      scheduleNotesHint,
      scheduleNotesTextarea,
      scheduleRecommendationCards,
      scheduleReminderHint,
      scheduleReminderSelect,
      scheduleShell,
      scheduleTimeHint,
      scheduleTimeInput,
      laterShell,
      studioAvatar,
      studioCustomerEmail,
      studioCustomerMood,
      studioCustomerName,
      studioCustomerPhone,
      studioDeleteButton,
      studioDoneActionButton,
      studioComposeSubjectInput,
      studioComposeToInput,
      studioEditorInput,
      studioEditorRecipient,
      studioEditorSummary,
      studioEditorWordCount,
      studioIncomingAvatar,
      studioIncomingBody,
      studioIncomingLabel,
      studioIncomingName,
      studioIncomingTime,
      studioLaterActionButton,
      studioMiniValueNodes,
      studioNextActionNote,
      studioNextActionTitle,
      studioPolicyPill,
      studioPreviewActionButton,
      studioPreviewButton,
      studioPrimarySuggestion,
      studioPrimarySuggestionLabel,
      studioRefineButtons,
      studioSaveDraftButton,
      studioSendButton,
      studioSendLabel,
      studioShell,
      studioSignatureButtons,
      studioContextSummaryNodes,
      studioStatusValueNodes,
      studioTemplateButtons,
      studioTitle,
      studioToneButtons,
      studioToolbarPills,
      studioToolButtons,
      studioTrackButtons,
      studioWhyInFocus,
      targetLabel,
      templateButtons,
    },
    helpers: {
      NOTE_MODE_PRESETS,
      asText,
      buildAvatarDataUri,
      buildStudioContextAiItems,
      compactRuntimeCopy,
      countWords,
      ensureStudioState,
      escapeHtml,
      evaluateStudioPolicy,
      getAvailableRuntimeMailboxes,
      getLatestCustomerMessage,
      getSelectedRuntimeThread,
      getStudioSignatureProfile,
      getStudioSourceMailboxLabel,
      humanizeCode,
      mapPriorityLabel,
      mapVisibilityLabel,
      mapVisibilityValue,
      normalizeKey,
      normalizeText,
      renderStudioContextAiList,
      renderStudioContextHistoryList,
      renderStudioContextPreferencesList,
      renderStudioContextRecommendationsList,
      renderStudioConversation,
      renderStudioSelection,
      setFeedback,
      setFloatingShellOpen,
      setStudioFeedback,
      tagsFrom,
      workspaceSourceOfTruth,
    },
    state,
    windowObject: window,
  });

  const {
    updateRuntimeThread,
    patchStudioThreadAfterHandled,
    patchStudioThreadAfterReplyLater,
    patchStudioThreadAfterSend,
    isHandledRuntimeThread,
    suggestHandledOutcome,
  } = PREVIEW_THREAD_OPS.createThreadStateOps({
    asArray,
    asText,
    buildRuntimeSummaryCards,
    compactRuntimeCopy,
    ensureRuntimeSelection,
    formatConversationTime,
    formatDueLabel,
    formatListTime,
    getStudioSenderMailboxId,
    normalizeKey,
    renderRuntimeConversationShell,
    renderStudioShell,
    state,
    titleCaseMailbox,
  });

  const {
    renderFocusHistorySection,
    renderFocusNotesSection,
    renderRuntimeCustomerPanel,
    renderRuntimeFocusConversation,
    renderRuntimeIntel,
  } = PREVIEW_FOCUS_INTEL_RENDERERS.createFocusIntelRenderers({
    dom: {
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
    },
    helpers: {
      asArray,
      asNumber,
      asText,
      buildCustomerHistoryEvents,
      buildCustomerSummaryCards,
      buildFocusHistoryScopeCards,
      buildIntelHelperConversation,
      buildRuntimeSummaryCards,
      buildThreadHistoryEvents,
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
      pillIconSvgs: PILL_ICON_SVGS,
      renderFocusSummaryCards,
      renderHistoryEventsList,
      renderHistoryFilterRow,
      resetRuntimeHistoryFilters,
      setButtonBusy,
    },
    state,
    windowObject: window,
  });

  const {
    getMailFeedItems,
    getMailFeedRuntimeThreads,
    getSelectedMailFeedThread,
    renderMailFeedUndoState,
    renderMailFeeds,
    renderQueueHistorySection,
    renderRuntimeQueue,
    renderThreadContextRows,
  } = PREVIEW_QUEUE_RENDERERS.createQueueRenderers({
    dom: {
      laterMetricValueNodes,
      sentMetricValueNodes,
      mailboxMenuGrid,
      mailboxTriggerLabel,
      mailFeedBulkButtons,
      mailFeedDensityButtons,
      mailFeedFilterButtons,
      mailFeedLists,
      mailFeedSelectAllButtons,
      mailFeedSelectionCountNodes,
      mailFeedUndoButtons,
      mailFeedViewButtons,
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
      queueLaneButtons,
      queueLaneCountNodes,
      queuePrimaryLaneTag,
      queueSummaryActNow,
      queueSummaryFocus,
      queueSummaryRisk,
      queueSummarySprint,
      queueTitle,
      threadContextRows,
    },
    helpers: {
      MAIL_FEEDS,
      QUEUE_LANE_LABELS,
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
      threadContextDefinitions: THREAD_CONTEXT,
      toIso,
    },
    state,
    windowObject: window,
  });

  const {
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
  } = PREVIEW_ASYNC_ORCHESTRATION.createAsyncOrchestration({
    dom: {
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
    },
    helpers: {
      apiRequest,
      applyHandledToThread,
      applyReplyLaterToThread,
      asArray,
      asText,
      buildRuntimeScheduleDraft,
      buildRuntimeSummaryCards,
      createIdempotencyKey,
      createNoteDraft,
      createScheduleDraft,
      DEFAULT_WORKSPACE,
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
      loadBootstrapFeedback(mode, message = "") {
        if (mode === "loading") {
          setFeedback(noteFeedback, "loading", "Laddar anteckning…");
          setFeedback(scheduleFeedback, "loading", "Laddar uppföljning…");
          return;
        }
        if (mode === "error") {
          setFeedback(noteFeedback, "error", message);
          setFeedback(scheduleFeedback, "error", message);
          return;
        }
        setFeedback(noteFeedback, "", "");
        setFeedback(scheduleFeedback, "", "");
      },
      mapPriorityValue,
      mapVisibilityValue,
      normalizeKey,
      normalizeStudioBusyState,
      normalizeText,
      normalizeWorkspaceState,
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
    },
    refs: asyncRuntimeRefs,
    state,
    windowObject: window,
  });

  const runtimeActionEngine = PREVIEW_ACTION_ENGINE.createRuntimeActionEngine({
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
    windowObject: window,
  });

  const {
    bindWorkspaceInteractions,
    handleWorkspaceDocumentClick,
    handleWorkspaceDocumentKeydown,
    initializeWorkspaceSurface,
    selectRuntimeThread,
  } = PREVIEW_DOM_LIVE_COMPOSITION.createDomLiveComposition({
    dom: {
      canvas,
      closeButtons,
      contextButtons,
      conversationCollapseButton,
      conversationHistory,
      destinationButtons,
      focusActionRows,
      focusHistorySearchInput,
      focusNotesRefreshButton,
      focusSignalRows,
      focusTabButtons,
      intelActionRows,
      laterCloseButtons,
      laterOptionButtons,
      mailboxAdminCloseButtons,
      mailboxAdminFeedback,
      mailboxAdminList,
      mailboxAdminOpenButton,
      mailboxAdminSaveButton,
      mailboxMenuGrid,
      noteCloseButtons,
      noteFeedback,
      noteModeCloseButtons,
      noteModeOptionButtons,
      noteOpenButtons,
      notePrioritySelect,
      noteSaveButton,
      noteTagAddButton,
      noteTagInput,
      noteTagsRow,
      noteText,
      noteVisibilitySelect,
      openButtons,
      ownerMenuGrid,
      ownerMenuToggle,
      queueActionRows,
      queueCollapsedList,
      queueContent,
      queueHistoryLoadMoreButton,
      queueHistoryToggle,
      queueLaneButtons,
      resizeHandles,
      scheduleCloseButtons,
      scheduleFeedback,
      scheduleOpenButtons,
      scheduleSaveButton,
      studioDeleteButton,
      studioDoneActionButton,
      studioComposeSubjectInput,
      studioComposeToInput,
      studioEditorInput,
      studioLaterActionButton,
      studioPreviewButton,
      studioPrimarySuggestion,
      studioRefineButtons,
      studioSaveDraftButton,
      studioSendButton,
      studioSignatureButtons,
      studioTemplateButtons,
      studioToneButtons,
      studioToolButtons,
      studioTrackButtons,
      templateButtons,
    },
    helpers: {
      CCO_DEFAULT_REPLY_SENDER,
      CCO_DEFAULT_SIGNATURE_PROFILE,
      DEFAULT_WORKSPACE,
      FOCUS_ACTIONS,
      FOCUS_SIGNALS,
      INTEL_ACTIONS,
      QUEUE_ACTIONS,
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
      normalizeCustomMailboxDefinition,
      normalizeKey,
      normalizeMailboxId,
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
    },
    state,
    windowObject: window,
  });

  function normalizeCustomMailboxDefinition(mailbox, index = 0) {
    if (!mailbox || typeof mailbox !== "object") return null;
    const email = asText(mailbox.email).toLowerCase();
    const label = asText(mailbox.label || mailbox.name || deriveMailboxLabel(email), "Mailbox");
    const owner = asText(mailbox.owner, "Team");
    let id =
      normalizeMailboxId(mailbox.id) ||
      normalizeMailboxId(email) ||
      slugifyMailboxId(label) ||
      `mailbox-${index + 1}`;
    if (!id) {
      id = `mailbox-${Date.now()}-${index + 1}`;
    }
    return {
      id,
      email,
      label,
      owner,
      custom: true,
    };
  }

  function getAvailableRuntimeMailboxes() {
    const merged = new Map();

    asArray(state.runtime.mailboxes).forEach((mailbox, index) => {
      const id = normalizeMailboxId(mailbox?.id || mailbox?.email);
      if (!id || merged.has(id)) return;
      merged.set(id, {
        id,
        email: asText(mailbox?.email).toLowerCase(),
        label: asText(mailbox?.label, titleCaseMailbox(mailbox?.email || mailbox?.id)),
        owner: "Live",
        custom: false,
        order: index,
      });
    });

    asArray(state.customMailboxes).forEach((mailbox, index) => {
      const normalized = normalizeCustomMailboxDefinition(mailbox, index);
      if (!normalized) return;
      const duplicateByEmail = normalized.email
        ? Array.from(merged.values()).find((entry) => normalizeMailboxId(entry.email) === normalizeMailboxId(normalized.email))
        : null;
      const key = duplicateByEmail?.id || normalized.id;
      if (merged.has(key)) {
        const existing = merged.get(key);
        merged.set(key, {
          ...existing,
          ...normalized,
          id: key,
          label: normalized.label || existing.label,
          email: normalized.email || existing.email,
          custom: true,
        });
        return;
      }
      merged.set(key, normalized);
    });

    return Array.from(merged.values());
  }

  function ensureRuntimeMailboxSelection() {
    const availableIds = getAvailableRuntimeMailboxes().map((mailbox) =>
      normalizeMailboxId(mailbox.id)
    );
    const preferredMailboxId = getPreferredOperationalMailboxId();
    if (!availableIds.length) {
      workspaceSourceOfTruth.setSelectedMailboxIds([]);
      return;
    }
    const selectedMailboxIds = workspaceSourceOfTruth.getSelectedMailboxIds();
    if (!selectedMailboxIds.length) {
      workspaceSourceOfTruth.setSelectedMailboxIds(
        preferredMailboxId && availableIds.includes(preferredMailboxId)
          ? [preferredMailboxId]
          : [...availableIds]
      );
      return;
    }
    const validIds = new Set(availableIds);
    workspaceSourceOfTruth.setSelectedMailboxIds(
      selectedMailboxIds.filter((id) => validIds.has(normalizeMailboxId(id)))
    );
    if (!workspaceSourceOfTruth.getSelectedMailboxIds().length) {
      workspaceSourceOfTruth.setSelectedMailboxIds(
        preferredMailboxId && availableIds.includes(preferredMailboxId)
          ? [preferredMailboxId]
          : [...availableIds]
      );
    }
  }

  function getMailboxScopedRuntimeThreads() {
    const mailboxes = state.runtime.selectedMailboxIds.map(normalizeMailboxId);
    const threads = Array.isArray(state.runtime.threads) ? state.runtime.threads : [];
    if (!mailboxes.length) {
      return getAvailableRuntimeMailboxes().length ? [] : threads;
    }
    return threads.filter((thread) => mailboxes.includes(normalizeMailboxId(thread.mailboxAddress)));
  }

  function normalizeVisibleRuntimeScope() {
    const allThreads = Array.isArray(state.runtime.threads) ? state.runtime.threads : [];
    if (!allThreads.length) return;

    const threadMailboxIds = Array.from(
      new Set(
        allThreads
          .map((thread) => normalizeMailboxId(thread.mailboxAddress))
          .filter(Boolean)
      )
    );

    if (
      workspaceSourceOfTruth.getSelectedMailboxIds().length <= 1 &&
      !getMailboxScopedRuntimeThreads().length &&
      threadMailboxIds.length
    ) {
      workspaceSourceOfTruth.setSelectedMailboxIds(threadMailboxIds);
    }

    if (
      !getQueueScopedRuntimeThreads().length &&
      normalizeKey(workspaceSourceOfTruth.getSelectedOwnerKey() || "all") !== "all"
    ) {
      workspaceSourceOfTruth.setSelectedOwnerKey("all");
    }

    if (
      !getFilteredRuntimeThreads().length &&
      normalizeKey(workspaceSourceOfTruth.getActiveLaneId() || "all") !== "all"
    ) {
      workspaceSourceOfTruth.setActiveLaneId("all");
    }

    ensureRuntimeSelection();
  }

  function getAvailableRuntimeOwners() {
    const owners = new Map();
    let hasUnassigned = false;

    getMailboxScopedRuntimeThreads().forEach((thread) => {
      const ownerKey = normalizeKey(thread.ownerKey || thread.ownerLabel);
      if (!ownerKey || ownerKey === "unassigned" || ownerKey === "oägd") {
        hasUnassigned = true;
        return;
      }
      if (owners.has(ownerKey)) return;
      owners.set(ownerKey, {
        id: ownerKey,
        label: asText(thread.ownerLabel, "Oägd"),
      });
    });

    const items = [{ id: "all", label: "Alla ägare" }];
    if (hasUnassigned) {
      items.push({ id: "unassigned", label: "Oägd" });
    }
    const listed = items.concat(Array.from(owners.values()));
    const selectedOwnerKey = normalizeKey(state.runtime.selectedOwnerKey || "all");
    if (selectedOwnerKey !== "all" && !listed.some((item) => item.id === selectedOwnerKey)) {
      const fallbackOwner = asArray(state.runtime.threads).find(
        (thread) => normalizeKey(thread.ownerKey || thread.ownerLabel) === selectedOwnerKey
      );
      listed.push({
        id: selectedOwnerKey,
        label:
          selectedOwnerKey === "unassigned"
            ? "Oägd"
            : asText(fallbackOwner?.ownerLabel, "Ägare"),
      });
    }
    return listed;
  }

  function getQueueScopedRuntimeThreads() {
    const ownerKey = normalizeKey(state.runtime.selectedOwnerKey || "all");
    const threads = getMailboxScopedRuntimeThreads();
    if (!threads.length || ownerKey === "all") return threads;
    if (ownerKey === "unassigned") {
      return threads.filter((thread) =>
        normalizeKey(thread.ownerKey || thread.ownerLabel) === "unassigned" ||
        normalizeKey(thread.ownerLabel) === "oägd"
      );
    }
    return threads.filter((thread) => normalizeKey(thread.ownerKey || thread.ownerLabel) === ownerKey);
  }

  function getQueueLaneThreads(laneId, threads = getQueueScopedRuntimeThreads()) {
    const normalizedLane = normalizeKey(laneId || "all");
    const activeQueueThreads = threads.filter((thread) => !isHandledRuntimeThread(thread));
    if (normalizedLane === "all") {
      return activeQueueThreads.filter((thread) => !isLaterRuntimeThread(thread));
    }
    return activeQueueThreads.filter((thread) => asArray(thread.tags).includes(normalizedLane));
  }

  function getFilteredRuntimeThreads() {
    return getQueueLaneThreads(state.runtime.activeLaneId || "all");
  }

  function getOrderedQueueLaneIds() {
    const allowed = new Set(QUEUE_LANE_ORDER);
    const persisted = asArray(state.runtime.orderedLaneIds).filter((id) => allowed.has(id));
    const missing = QUEUE_LANE_ORDER.filter((id) => !persisted.includes(id));
    return [...persisted, ...missing];
  }

  function getSelectedRuntimeThread() {
    const visibleThreads = getFilteredRuntimeThreads();
    if (!visibleThreads.length) return null;
    const selected = visibleThreads.find(
      (thread) => thread.id === workspaceSourceOfTruth.getSelectedThreadId()
    );
    return selected || visibleThreads[0];
  }

  function ensureRuntimeSelection() {
    const visibleThreads = getFilteredRuntimeThreads();
    workspaceSourceOfTruth.ensureSelectedThread(visibleThreads);
  }

  function getActiveWorkspaceContext() {
    const runtimeThread = getSelectedRuntimeThread();
    if (runtimeThread) {
      return {
        workspaceId: WORKSPACE_ID,
        conversationId: runtimeThread.id,
        customerId: runtimeThread.customerEmail || runtimeThread.id,
        customerName: runtimeThread.customerName,
      };
    }
    return {
      workspaceId: WORKSPACE_ID,
      conversationId: "",
      customerId: "",
      customerName: "",
    };
  }

  function getRuntimeThreadCustomerId(thread) {
    return normalizeKey(thread?.customerEmail || thread?.raw?.customerId || thread?.id || "");
  }

  function matchesActivityToThread(activity, thread, { customerScoped = false } = {}) {
    if (!thread || !activity || typeof activity !== "object") return false;
    const threadConversationId = normalizeKey(thread.id);
    const threadCustomerId = getRuntimeThreadCustomerId(thread);
    const activityConversationId = normalizeKey(activity.conversationId || "");
    const activityCustomerId = normalizeKey(activity.customerId || "");

    if (!customerScoped) {
      if (activityConversationId) return activityConversationId === threadConversationId;
      return Boolean(activityCustomerId && threadCustomerId && activityCustomerId === threadCustomerId);
    }

    if (
      activityConversationId === threadConversationId ||
      (activityCustomerId && threadCustomerId && activityCustomerId === threadCustomerId)
    ) {
      return true;
    }

    return getRelatedCustomerThreads(thread).some((relatedThread) => {
      const relatedConversationId = normalizeKey(relatedThread?.id || "");
      const relatedCustomerId = getRuntimeThreadCustomerId(relatedThread);
      return (
        activityConversationId === relatedConversationId ||
        (activityCustomerId && relatedCustomerId && activityCustomerId === relatedCustomerId)
      );
    });
  }

  function getScopedActivityNotes(thread, options = {}) {
    return asArray(state.activity.notes).filter((note) =>
      matchesActivityToThread(note, thread, options)
    );
  }

  function getScopedActivityFollowUps(thread, options = {}) {
    return asArray(state.activity.followUps).filter((followUp) =>
      matchesActivityToThread(followUp, thread, options)
    );
  }

  function refreshWorkspaceBootstrapForSelectedThread(reason = "workspace mutation") {
    return loadBootstrap({
      preserveActiveDestination: true,
      applyWorkspacePrefs: false,
      quiet: true,
    }).catch((error) => {
      console.warn(`CCO workspace bootstrap misslyckades efter ${reason}.`, error);
    });
  }

  function formatHistoryTimestamp(value) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    const now = new Date();
    const isSameDay =
      parsed.getUTCFullYear() === now.getUTCFullYear() &&
      parsed.getUTCMonth() === now.getUTCMonth() &&
      parsed.getUTCDate() === now.getUTCDate();
    const time = parsed.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
    if (isSameDay) {
      return `Idag ${time}`;
    }
    return parsed.toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
  }

  function resetRuntimeHistoryFilters() {
    state.runtime.historySearch = "";
    state.runtime.historyMailboxFilter = "all";
    state.runtime.historyResultTypeFilter = "all";
    state.runtime.historyRangeFilter = "all";
    if (focusHistorySearchInput) {
      focusHistorySearchInput.value = "";
    }
  }

  function deriveHistoryEventResultType(event) {
    const explicit = normalizeKey(event?.resultType || event?.type);
    if (explicit === "message" || explicit === "email" || explicit === "mail") return "message";
    if (explicit === "outcome" || explicit === "booking" || explicit === "result") return "outcome";
    return "action";
  }

  function compareHistoryEventsDesc(left, right) {
    return Date.parse(String(right?.recordedAt || right?.timestamp || "")) -
      Date.parse(String(left?.recordedAt || left?.timestamp || ""));
  }

  function dedupeHistoryEvents(events) {
    const seen = new Set();
    return events.filter((event) => {
      const key = [
        normalizeKey(event?.conversationId),
        normalizeKey(event?.mailboxId),
        normalizeKey(event?.title),
        normalizeKey(event?.description),
        normalizeKey(event?.detail),
        normalizeKey(event?.recordedAt || event?.timestamp),
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function createHistoryEvent(definition = {}) {
    const recordedAt = toIso(definition.recordedAt || definition.timestamp);
    return {
      title: asText(definition.title, "Händelse"),
      description: asText(definition.description, asText(definition.detail, "Ingen beskrivning.")),
      detail: asText(definition.detail, asText(definition.description, "Ingen detalj tillgänglig.")),
      time: asText(definition.time, formatHistoryTimestamp(recordedAt)),
      recordedAt,
      mailboxLabel: asText(definition.mailboxLabel),
      mailboxId: normalizeMailboxId(definition.mailboxId),
      conversationId: asText(definition.conversationId),
      scopeLabel: asText(definition.scopeLabel),
      resultType: deriveHistoryEventResultType(definition),
      type: asText(definition.type, definition.resultType || "action"),
    };
  }

  function matchCustomerThread(baseThread, candidateThread) {
    if (!baseThread || !candidateThread) return false;
    const baseEmail = normalizeKey(baseThread.customerEmail);
    const candidateEmail = normalizeKey(candidateThread.customerEmail);
    if (baseEmail && candidateEmail) {
      return baseEmail === candidateEmail;
    }
    return normalizeKey(baseThread.customerName) === normalizeKey(candidateThread.customerName);
  }

  function getRelatedCustomerThreads(thread) {
    if (!thread) return [];
    const mailboxScopedThreads = getMailboxScopedRuntimeThreads();
    const relatedThreads = mailboxScopedThreads.filter((candidate) =>
      matchCustomerThread(thread, candidate)
    );
    if (relatedThreads.length) return relatedThreads;
    return [thread];
  }

  function getThreadHistoryMailboxOptions(thread) {
    if (!thread) return [];
    const options = asArray(thread.historyMailboxOptions).filter(
      (option) => normalizeMailboxId(option?.id) && asText(option?.label)
    );
    if (options.length) {
      return options.map((option) => ({
        id: normalizeMailboxId(option.id),
        label: asText(option.label),
      }));
    }
    const fallbackId = normalizeMailboxId(thread.mailboxAddress || thread.mailboxLabel);
    return fallbackId
      ? [{ id: fallbackId, label: asText(thread.mailboxLabel, thread.mailboxAddress) }]
      : [];
  }

  function getCustomerHistoryMailboxOptions(thread) {
    const entries = new Map();
    getRelatedCustomerThreads(thread).forEach((relatedThread) => {
      getThreadHistoryMailboxOptions(relatedThread).forEach((option) => {
        if (!entries.has(option.id)) {
          entries.set(option.id, option);
        }
      });
    });
    if (!entries.size && thread) {
      getThreadHistoryMailboxOptions(thread).forEach((option) => {
        entries.set(option.id, option);
      });
    }
    return Array.from(entries.values());
  }

  function getRuntimeThreadById(threadId) {
    const normalizedId = normalizeKey(threadId);
    if (!normalizedId) return null;
    return (
      asArray(state.runtime?.threads).find(
        (candidate) => normalizeKey(candidate?.id) === normalizedId
      ) || null
    );
  }

  function joinReadableList(items = [], maxItems = 3) {
    const values = asArray(items)
      .map((item) => normalizeText(item))
      .filter(Boolean);
    if (!values.length) return "";
    const visibleValues = values.slice(0, maxItems);
    const remainder = values.length - visibleValues.length;
    return remainder > 0
      ? `${visibleValues.join(", ")} +${remainder} till`
      : visibleValues.join(", ");
  }

  function getHistoryEventTypeLabel(event) {
    const resultType = deriveHistoryEventResultType(event);
    if (resultType === "message") return "Mail";
    if (resultType === "outcome") return "Utfall";
    return "Åtgärd";
  }

  function getHistoryEventTypeTone(resultType) {
    if (resultType === "message") return "message";
    if (resultType === "outcome") return "outcome";
    return "action";
  }

  function renderFocusSummaryCards(container, cards, tone = "history") {
    if (!container) return;
    const safeCards = asArray(cards).filter(
      (card) => card && typeof card === "object" && (asText(card.label) || asText(card.value))
    );
    container.innerHTML = safeCards
      .map((card) => {
        const note = normalizeText(card.note);
        const cardTone = normalizeKey(card.tone || tone) || tone;
        return `<article class="focus-summary-card focus-summary-card--${escapeHtml(cardTone)}">
          <span class="focus-summary-card-label">${escapeHtml(asText(card.label, "Info"))}</span>
          <strong class="focus-summary-card-value">${escapeHtml(asText(card.value, "-"))}</strong>
          ${note ? `<p class="focus-summary-card-note">${escapeHtml(note)}</p>` : ""}
        </article>`;
      })
      .join("");
  }

  function buildFocusHistoryScopeCards(thread, allEvents = []) {
    if (!thread) return [];
    const notes = getScopedActivityNotes(thread);
    const followUps = getScopedActivityFollowUps(thread);
    const latestEvent = allEvents[0];
    return [
      {
        label: "Tråd",
        value: compactRuntimeCopy(thread.subject, "Aktiv tråd", 42),
        note: `${thread.mailboxLabel} · ${latestEvent?.time || thread.lastActivityLabel}`,
        tone: "message",
      },
      {
        label: "Nu i",
        value: thread.statusLabel,
        note: `${thread.waitingLabel} · ${thread.riskLabel}`,
        tone: "action",
      },
      {
        label: "Nästa steg",
        value: thread.nextActionLabel,
        note: compactRuntimeCopy(thread.nextActionSummary, "Ta nästa tydliga steg i samma tråd.", 86),
        tone: "customer",
      },
      {
        label: "Aktivitet",
        value: `${allEvents.length} händelser`,
        note: `${notes.length} anteckningar · ${followUps.length} uppföljningar`,
        tone: "outcome",
      },
    ];
  }

  function buildCustomerSummaryCards(thread, customerEvents = [], relatedThreads = [], mailboxOptions = []) {
    if (!thread) return [];
    const latestEvent = customerEvents[0];
    const mailboxLabels = mailboxOptions.map((option) => option.label);
    const liveThreadCount = Math.max(relatedThreads.length, 1);
    const summary = thread.raw?.customerSummary || {};
    return [
      {
        label: "Mailboxar",
        value: `${mailboxOptions.length || 1}`,
        note: joinReadableList(mailboxLabels.length ? mailboxLabels : [thread.mailboxLabel]),
        tone: "customer",
      },
      {
        label: "Spår",
        value: `${Math.max(liveThreadCount, asNumber(summary.caseCount, 0), 1)}`,
        note: `${liveThreadCount} live-trådar i valt scope`,
        tone: "action",
      },
      {
        label: "Senaste aktivitet",
        value: latestEvent?.time || thread.lastActivityLabel,
        note: compactRuntimeCopy(latestEvent?.description || thread.subject, thread.subject, 76),
        tone: "message",
      },
      {
        label: "Nästa steg",
        value: thread.nextActionLabel,
        note: thread.followUpLabel || compactRuntimeCopy(thread.nextActionSummary, "Ingen planerad uppföljning ännu.", 76),
        tone: "outcome",
      },
    ];
  }

  function buildThreadHistoryEvents(thread) {
    if (!thread) return [];
    const threadEvents = asArray(thread.historyEvents).map((event) =>
      createHistoryEvent({
        ...event,
        conversationId: event?.conversationId || thread.id,
        mailboxId: event?.mailboxId || thread.mailboxAddress,
        mailboxLabel: event?.mailboxLabel || thread.mailboxLabel,
      })
    );
    const noteEvents = getScopedActivityNotes(thread).map((note) =>
      createHistoryEvent({
        title: "Anteckning",
        description: asText(note.destinationLabel, "Intern anteckning"),
        detail: asText(note.text, "Ingen anteckningstext tillgänglig."),
        recordedAt: note.updatedAt || note.createdAt,
        mailboxId: thread.mailboxAddress,
        mailboxLabel: thread.mailboxLabel,
        conversationId: thread.id,
        resultType: "action",
        type: "note",
      })
    );
    const followUpEvents = getScopedActivityFollowUps(thread).map((followUp) =>
      createHistoryEvent({
        title: "Uppföljning",
        description: asText(followUp.category, "Schemalagd uppföljning"),
        detail:
          asText(followUp.notes) ||
          `Schemalagd ${asText(followUp.date)} ${asText(followUp.time)} hos ${asText(followUp.doctorName, "klinikteamet")}.`,
        recordedAt: followUp.createdAt || followUp.scheduledForIso,
        mailboxId: thread.mailboxAddress,
        mailboxLabel: thread.mailboxLabel,
        conversationId: thread.id,
        resultType: "action",
        type: "followup",
      })
    );
    return dedupeHistoryEvents([...threadEvents, ...noteEvents, ...followUpEvents]).sort(
      compareHistoryEventsDesc
    );
  }

  function buildCustomerHistoryEvents(thread) {
    if (!thread) return [];
    const relatedThreads = getRelatedCustomerThreads(thread);
    const relatedEvents = relatedThreads.flatMap((relatedThread) =>
      asArray(relatedThread.historyEvents).map((event) =>
        createHistoryEvent({
          ...event,
          conversationId: event?.conversationId || relatedThread.id,
          mailboxId: event?.mailboxId || relatedThread.mailboxAddress,
          mailboxLabel: event?.mailboxLabel || relatedThread.mailboxLabel,
          scopeLabel: relatedThread.subject,
        })
      )
    );
    const scopedNotes = getScopedActivityNotes(thread, { customerScoped: true }).map((note) =>
      createHistoryEvent({
        title: "Anteckning",
        description: asText(note.destinationLabel, "Intern anteckning"),
        detail: asText(note.text, "Ingen anteckningstext tillgänglig."),
        recordedAt: note.updatedAt || note.createdAt,
        mailboxId:
          getRuntimeThreadById(note.conversationId || thread.id)?.mailboxAddress || thread.mailboxAddress,
        mailboxLabel:
          getRuntimeThreadById(note.conversationId || thread.id)?.mailboxLabel || thread.mailboxLabel,
        conversationId: note.conversationId || thread.id,
        scopeLabel: getRuntimeThreadById(note.conversationId || thread.id)?.subject || thread.subject,
        resultType: "action",
        type: "note",
      })
    );
    const scopedFollowUps = getScopedActivityFollowUps(thread, { customerScoped: true }).map(
      (followUp) =>
        createHistoryEvent({
          title: "Uppföljning",
          description: asText(followUp.category, "Schemalagd uppföljning"),
          detail:
            asText(followUp.notes) ||
            `Schemalagd ${asText(followUp.date)} ${asText(followUp.time)} hos ${asText(
              followUp.doctorName,
              "klinikteamet"
            )}.`,
          recordedAt: followUp.createdAt || followUp.scheduledForIso,
          mailboxId:
            getRuntimeThreadById(followUp.conversationId || thread.id)?.mailboxAddress ||
            thread.mailboxAddress,
          mailboxLabel:
            getRuntimeThreadById(followUp.conversationId || thread.id)?.mailboxLabel ||
            thread.mailboxLabel,
          conversationId: followUp.conversationId || thread.id,
          scopeLabel:
            getRuntimeThreadById(followUp.conversationId || thread.id)?.subject || thread.subject,
          resultType: "action",
          type: "followup",
        })
    );
    return dedupeHistoryEvents([...relatedEvents, ...scopedNotes, ...scopedFollowUps]).sort(
      compareHistoryEventsDesc
    );
  }

  function filterHistoryEvents(events, filters = {}) {
    const searchQuery = normalizeText(filters.search).toLowerCase();
    const mailboxFilter = normalizeKey(filters.mailboxFilter || "all");
    const resultTypeFilter = normalizeKey(filters.resultTypeFilter || "all");
    const rangeFilter = normalizeKey(filters.rangeFilter || "all");
    const nowMs = Date.now();

    return events.filter((event) => {
      if (mailboxFilter !== "all" && normalizeMailboxId(event.mailboxId) !== mailboxFilter) {
        return false;
      }
      if (resultTypeFilter !== "all" && deriveHistoryEventResultType(event) !== resultTypeFilter) {
        return false;
      }
      if (rangeFilter !== "all" && event.recordedAt) {
        const eventMs = Date.parse(event.recordedAt);
        const days =
          rangeFilter === "30" ? 30 : rangeFilter === "90" ? 90 : rangeFilter === "365" ? 365 : 0;
        if (Number.isFinite(eventMs) && days > 0) {
          const thresholdMs = nowMs - days * 24 * 60 * 60 * 1000;
          if (eventMs < thresholdMs) return false;
        }
      }
      if (!searchQuery) return true;
      const haystack = [
        event.title,
        event.description,
        event.detail,
        event.mailboxLabel,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchQuery);
    });
  }

  function buildHistoryReadoutHref(thread, { customerScoped = false } = {}) {
    if (!thread) return "/api/v1/cco/runtime/calibration/readout";
    const params = new URLSearchParams();
    if (thread.customerEmail) params.set("customerEmail", thread.customerEmail);
    if (thread.id) params.set("conversationId", thread.id);

    const mailboxIds = customerScoped
      ? getCustomerHistoryMailboxOptions(thread).map((option) => option.id)
      : state.runtime.historyMailboxFilter !== "all"
        ? [state.runtime.historyMailboxFilter]
        : getThreadHistoryMailboxOptions(thread).map((option) => option.id);

    if (mailboxIds.length) {
      params.set("mailboxIds", mailboxIds.join(","));
    }
    if (!customerScoped && normalizeText(state.runtime.historySearch)) {
      params.set("q", normalizeText(state.runtime.historySearch));
    }
    if (!customerScoped && normalizeKey(state.runtime.historyResultTypeFilter) !== "all") {
      params.set("resultTypes", normalizeKey(state.runtime.historyResultTypeFilter));
    }
    return `/api/v1/cco/runtime/calibration/readout?${params.toString()}`;
  }

  function getRuntimeCustomerEmail(thread) {
    return asText(
      extractCustomerEmail(thread) || thread?.raw?.customerHistory?.email
    ).toLowerCase();
  }

  function getSelectedRuntimeMailboxScopeIds() {
    return asArray(state.runtime.selectedMailboxIds)
      .map(normalizeMailboxId)
      .filter(Boolean);
  }

  function getQueueHistoryScopeIds() {
    const selectedScope = getSelectedRuntimeMailboxScopeIds();
    if (selectedScope.length) return selectedScope;
    return getAvailableRuntimeMailboxes()
      .map((mailbox) => normalizeMailboxId(mailbox.id))
      .filter(Boolean);
  }

  function getQueueHistoryScopeKey(scopeIds = getQueueHistoryScopeIds()) {
    return [...scopeIds].sort().join(",");
  }

  function getQueueHistoryMailboxLabel(mailboxId) {
    const normalizedMailboxId = normalizeMailboxId(mailboxId);
    const runtimeMailbox = getAvailableRuntimeMailboxes().find(
      (mailbox) => normalizeMailboxId(mailbox.id) === normalizedMailboxId
    );
    if (runtimeMailbox) {
      return asText(runtimeMailbox.label, runtimeMailbox.id);
    }
    const localPart = normalizedMailboxId.split("@")[0];
    return localPart ? localPart.charAt(0).toUpperCase() + localPart.slice(1) : "Mailbox";
  }

  function getQueueHistoryCounterpartyLabel(item = {}, customerEmail = "", mailboxLabel = "") {
    const explicitLabel = asText(
      item.customerName ||
        item.customerLabel ||
        item.fromName ||
        item.senderName ||
        item.contactName ||
        item.contactLabel
    );
    if (explicitLabel) return explicitLabel;
    const normalizedEmail = asText(customerEmail);
    if (normalizedEmail) {
      const derivedLabel = deriveMailboxLabel(normalizedEmail);
      return derivedLabel || normalizedEmail;
    }
    if (normalizeKey(item.direction || "message") === "outbound") {
      return mailboxLabel ? `${mailboxLabel} | Hair TP Clinic` : "Hair TP Clinic";
    }
    return "Okänd avsändare";
  }

  function buildQueueHistoryItems(results = []) {
    return asArray(results)
      .map((item) => {
        const customerEmail = asText(item.customerEmail);
        const subject = asText(item.subject || item.summary || item.title, "E-post");
        const detail = compactRuntimeCopy(
          item.detail || item.summary,
          "Ingen förhandsvisning tillgänglig.",
          180
        );
        const mailboxId = normalizeMailboxId(item.mailboxId);
        return {
          id: asText(item.messageId || `${item.conversationId}-${item.recordedAt}-${subject}`),
          conversationId: asText(item.conversationId),
          customerEmail,
          mailboxId,
          mailboxLabel: getQueueHistoryMailboxLabel(mailboxId),
          counterpartyLabel: getQueueHistoryCounterpartyLabel(item, customerEmail, getQueueHistoryMailboxLabel(mailboxId)),
          title: compactRuntimeCopy(subject, subject, 108),
          detail,
          direction: normalizeKey(item.direction || "message") === "outbound" ? "Skickat" : "Mottaget",
          time: formatHistoryTimestamp(item.recordedAt),
          recordedAt: toIso(item.recordedAt),
          initials: initialsForName(
            getQueueHistoryCounterpartyLabel(item, customerEmail, getQueueHistoryMailboxLabel(mailboxId))
          ),
        };
      })
      .sort(compareHistoryEventsDesc);
  }

  async function loadQueueHistory({ append = false, force = false, prefetch = false } = {}) {
    const scopeIds = getQueueHistoryScopeIds();
    const scopeKey = getQueueHistoryScopeKey(scopeIds);
    const historyState = state.runtime.queueHistory;
    const nextLimit = append ? Math.max(24, Number(historyState.limit || 24) + 24) : Math.max(24, Number(historyState.limit || 24));

    if (!scopeIds.length) {
      state.runtime.queueHistory = {
        ...historyState,
        loading: false,
        loaded: true,
        error: "",
        items: [],
        limit: nextLimit,
        hasMore: false,
        scopeKey,
      };
      renderQueueHistorySection();
      return;
    }

    if (!force && !append && historyState.loaded && historyState.scopeKey === scopeKey) {
      renderQueueHistorySection();
      return;
    }

    const requestSequence = ++queueHistoryRequestSequence;
    state.runtime.queueHistory = {
      ...historyState,
      loading: true,
      error: "",
      scopeKey,
      limit: nextLimit,
      open: prefetch ? historyState.open : true,
    };
    renderQueueHistorySection();

    try {
      const params = new URLSearchParams();
      params.set("mailboxIds", scopeIds.join(","));
      params.set("lookbackDays", "1095");
      params.set("resultTypes", "message");
      params.set("limit", String(nextLimit));
      const payload = await apiRequest(`/api/v1/cco/runtime/history/search?${params.toString()}`);
      if (requestSequence !== queueHistoryRequestSequence) return;

      const items = buildQueueHistoryItems(payload?.results);
      state.runtime.queueHistory = {
        ...state.runtime.queueHistory,
        loading: false,
        loaded: true,
        error: "",
        items,
        limit: nextLimit,
        hasMore: items.length >= nextLimit,
        scopeKey,
        open: prefetch ? state.runtime.queueHistory.open : true,
      };
      renderQueueHistorySection();
    } catch (error) {
      if (requestSequence !== queueHistoryRequestSequence) return;
      state.runtime.queueHistory = {
        ...state.runtime.queueHistory,
        loading: false,
        loaded: true,
        error: error instanceof Error ? error.message : String(error),
        items: [],
        hasMore: false,
        scopeKey,
        open: prefetch ? state.runtime.queueHistory.open : true,
      };
      renderQueueHistorySection();
    }
  }

  function getIntelReadoutMailboxIds(thread) {
    const selectedScope = getSelectedRuntimeMailboxScopeIds();
    if (selectedScope.length) return selectedScope;
    const customerScope = getCustomerHistoryMailboxOptions(thread).map((option) => option.id);
    if (customerScope.length) return customerScope;
    return getThreadHistoryMailboxOptions(thread).map((option) => option.id);
  }

  function buildIntelReadoutHref(target, thread) {
    const normalizedTarget = normalizeKey(target || "calibration") || "calibration";
    const basePath =
      normalizedTarget === "shadow"
        ? "/api/v1/cco/runtime/shadow/readout"
        : "/api/v1/cco/runtime/calibration/readout";
    if (!thread) return basePath;

    const params = new URLSearchParams();
    const customerEmail = getRuntimeCustomerEmail(thread);
    const mailboxIds = getIntelReadoutMailboxIds(thread);
    const intentValue = normalizeKey(thread?.raw?.intent || "");

    if (customerEmail) params.set("customerEmail", customerEmail);
    if (thread.id) params.set("conversationId", thread.id);
    if (mailboxIds.length) params.set("mailboxIds", mailboxIds.join(","));

    if (normalizedTarget === "shadow") {
      params.set("lookbackDays", "14");
      params.set("limit", "10");
    } else {
      params.set("lookbackDays", "365");
      if (intentValue) params.set("intent", intentValue);
    }

    return `${basePath}?${params.toString()}`;
  }

  function hasCustomerImportSource(body = getCustomerImportBody()) {
    return (
      Boolean(String(body?.text || "").trim()) ||
      Boolean(normalizeText(body?.binaryBase64)) ||
      (Array.isArray(body?.rows) && body.rows.length > 0)
    );
  }

  function renderHistoryFilterRow(row, items, activeValue, dataAttribute) {
    if (!row) return;
    row.innerHTML = "";
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `focus-history-filter${activeValue === item.id ? " is-active" : ""}`;
      button.dataset[dataAttribute] = item.id;
      button.textContent = item.label;
      row.appendChild(button);
    });
  }

  function renderHistoryEventsList(
    container,
    events,
    selectedThreadId,
    emptyState = {
      title: "Ingen historik i valt urval",
      text: "Justera filtren eller byt scope för att läsa fler händelser.",
      chip: "Historik",
    }
  ) {
    if (!container) return;
    container.innerHTML = "";

    if (!events.length) {
      container.innerHTML = `
        <article class="focus-history-entry">
          <div class="focus-history-entry-head">
            <div>
              <div class="focus-history-meta-row">
                <span class="focus-history-type-pill">${escapeHtml(emptyState.chip || "Historik")}</span>
              </div>
              <p class="focus-history-entry-title">${escapeHtml(emptyState.title || "Ingen historik i valt urval")}</p>
              <p class="focus-history-entry-text">${escapeHtml(
                emptyState.text || "Justera filtren eller byt scope för att läsa fler händelser."
              )}</p>
            </div>
          </div>
        </article>`;
      return;
    }

    events.forEach((event) => {
      const article = document.createElement("article");
      article.className = "focus-history-entry";
      const resultType = deriveHistoryEventResultType(event);
      article.dataset.historyResult = resultType;

      const head = document.createElement("div");
      head.className = "focus-history-entry-head";

      const copy = document.createElement("div");
      const meta = document.createElement("div");
      meta.className = "focus-history-meta-row";

      const type = document.createElement("span");
      type.className = `focus-history-type-pill focus-history-type-pill--${getHistoryEventTypeTone(
        resultType
      )}`;
      type.textContent = getHistoryEventTypeLabel(event);

      meta.appendChild(type);

      if (asText(event.mailboxLabel)) {
        const mailbox = document.createElement("span");
        mailbox.className = "focus-history-mailbox-pill";
        mailbox.textContent = event.mailboxLabel;
        meta.appendChild(mailbox);
      }

      const conversationId = asText(event.conversationId);
      if (asText(event.scopeLabel) && conversationId && conversationId !== asText(selectedThreadId)) {
        const scope = document.createElement("span");
        scope.className = "focus-history-scope-pill";
        scope.textContent = compactRuntimeCopy(event.scopeLabel, event.scopeLabel, 28);
        meta.appendChild(scope);
      }

      const title = document.createElement("h4");
      title.className = "focus-history-entry-title";
      title.textContent = event.description;

      const text = document.createElement("p");
      text.className = "focus-history-entry-text";
      text.textContent = event.detail;

      copy.append(meta, title, text);

      const stamp = document.createElement("time");
      stamp.className = "focus-history-entry-time";
      stamp.dateTime = event.recordedAt || "";
      stamp.textContent = event.time || formatHistoryTimestamp(event.recordedAt);

      head.append(copy, stamp);
      article.append(head);

      if (conversationId && conversationId !== asText(selectedThreadId)) {
        const actions = document.createElement("div");
        actions.className = "focus-history-entry-actions";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "focus-history-open-thread";
        button.dataset.historyOpenThread = "true";
        button.dataset.historyConversationId = conversationId;
        button.textContent = "Öppna tråd";

        actions.append(button);
        article.append(actions);
      }

      container.appendChild(article);
    });
  }

  function readPxVariable(name) {
    const value = Number.parseFloat(getComputedStyle(canvas).getPropertyValue(name));
    return Number.isFinite(value) ? value : 0;
  }

  function getWorkspaceGapTotal() {
    return readPxVariable("--workspace-gap") + readPxVariable("--workspace-focus-gap");
  }

  function getWorkspaceAvailableWidth() {
    return previewWorkspace.getBoundingClientRect().width;
  }

  function getQueueIntrinsicWidth() {
    return MIN_QUEUE_WIDTH;
  }

  function getIntelIntrinsicWidth() {
    return MIN_INTEL_WIDTH;
  }

  function getWorkspaceDynamicMaxLeft(availableWidth, rightWidth) {
    return Math.max(
      workspaceLimits.left.min,
      Math.min(
        workspaceLimits.left.max,
        availableWidth - getWorkspaceGapTotal() - workspaceLimits.main.min - rightWidth
      )
    );
  }

  function getWorkspaceDynamicMaxRight(availableWidth, leftWidth) {
    return Math.max(
      workspaceLimits.right.min,
      Math.min(
        workspaceLimits.right.max,
        availableWidth - getWorkspaceGapTotal() - workspaceLimits.main.min - leftWidth
      )
    );
  }

  function applyWorkspaceState() {
    canvas.style.setProperty("--workspace-left-width", `${workspaceState.left}px`);
    canvas.style.setProperty("--workspace-main-width", `${workspaceState.main}px`);
    canvas.style.setProperty("--workspace-right-width", `${workspaceState.right}px`);
  }

  function normalizeWorkspaceState() {
    const availableWidth = getWorkspaceAvailableWidth();
    if (!availableWidth) return;

    workspaceLimits.left.min = getQueueIntrinsicWidth();
    workspaceLimits.right.min = getIntelIntrinsicWidth();

    workspaceState.left = clamp(
      workspaceState.left,
      workspaceLimits.left.min,
      getWorkspaceDynamicMaxLeft(availableWidth, workspaceState.right)
    );

    workspaceState.right = clamp(
      workspaceState.right,
      workspaceLimits.right.min,
      getWorkspaceDynamicMaxRight(availableWidth, workspaceState.left)
    );

    let derivedMain =
      availableWidth - getWorkspaceGapTotal() - workspaceState.left - workspaceState.right;

    if (derivedMain < workspaceLimits.main.min) {
      let deficit = workspaceLimits.main.min - derivedMain;
      const rightSlack = workspaceState.right - workspaceLimits.right.min;
      const shrinkRight = Math.min(deficit, rightSlack);
      workspaceState.right -= shrinkRight;
      deficit -= shrinkRight;

      if (deficit > 0) {
        const leftSlack = workspaceState.left - workspaceLimits.left.min;
        const shrinkLeft = Math.min(deficit, leftSlack);
        workspaceState.left -= shrinkLeft;
      }

      derivedMain =
        availableWidth - getWorkspaceGapTotal() - workspaceState.left - workspaceState.right;
    }

    workspaceState.main = Math.max(workspaceLimits.main.min, Math.round(derivedMain));
    applyWorkspaceState();
  }

  function mapPriorityLabel(value) {
    return PRIORITY_LABELS[normalizeText(value).toLowerCase()] || "Medel";
  }

  function mapPriorityValue(value) {
    return PRIORITY_VALUES[normalizeText(value).toLowerCase()] || "medium";
  }

  function mapVisibilityLabel(value) {
    return VISIBILITY_LABELS[normalizeText(value).toLowerCase()] || "Team";
  }

  function mapVisibilityValue(value) {
    return VISIBILITY_VALUES[normalizeText(value).toLowerCase()] || "team";
  }

  function tagsFrom(values) {
    const tags = [];
    const seen = new Set();
    for (const value of Array.isArray(values) ? values : []) {
      const normalized = normalizeText(value);
      if (!normalized) continue;
      const lowered = normalized.toLowerCase();
      if (seen.has(lowered)) continue;
      seen.add(lowered);
      tags.push(normalized);
      if (tags.length >= 12) break;
    }
    return tags;
  }

  function setFeedback(node, tone = "", message = "") {
    if (!node) return;
    node.textContent = message || "";
    node.classList.remove("is-loading", "is-success", "is-error");
    node.dataset.statusTone = tone || "";
    if (!message) {
      node.setAttribute("hidden", "hidden");
      return;
    }
    node.removeAttribute("hidden");
    if (tone) {
      node.classList.add(`is-${tone}`);
    }
  }

  function setButtonBusy(button, busy, idleLabel, busyLabel) {
    if (!button) return;
    if (!button.dataset.idleLabel) {
      button.dataset.idleLabel = idleLabel || normalizeText(button.textContent);
    }
    button.disabled = Boolean(busy);
    button.textContent = busy ? busyLabel : button.dataset.idleLabel;
    button.classList.toggle("is-busy", Boolean(busy));
  }

  function formatCompactKr(value) {
    const numeric = Number(value) || 0;
    if (numeric >= 1000) {
      return `${Math.round(numeric / 100) / 10}k kr`.replace(".0k", "k");
    }
    return `${numeric} kr`;
  }

  function setCustomersStatus(message = "", tone = "") {
    setFeedback(customerStatus, tone, message);
  }

  function setAutomationStatus(message = "", tone = "") {
    setFeedback(automationStatus, tone, message);
  }

  function setAuxStatus(node, message = "", tone = "") {
    setFeedback(node, tone, message);
  }

  function getMailFeedStatusNode(feedKey) {
    return normalizeKey(feedKey) === "later" ? laterStatus : sentStatus;
  }

  function getMailFeedUndoButton(feedKey) {
    const normalizedFeed = normalizeKey(feedKey);
    return (
      mailFeedUndoButtons.find(
        (button) => normalizeKey(button.dataset.mailFeedUndo) === normalizedFeed
      ) || null
    );
  }

  function resetPendingMailFeedDelete() {
    if (pendingMailFeedDeleteTimer) {
      window.clearTimeout(pendingMailFeedDeleteTimer);
      pendingMailFeedDeleteTimer = null;
    }
    state.pendingMailFeedDelete.active = false;
    state.pendingMailFeedDelete.feed = "";
    state.pendingMailFeedDelete.count = 0;
    state.pendingMailFeedDelete.committing = false;
    state.pendingMailFeedDelete.threadsSnapshot = [];
    state.pendingMailFeedDelete.previousThreadsSnapshot = [];
    state.pendingMailFeedDelete.previousSelectedThreadId = "";
    state.pendingMailFeedDelete.previousSelections = {
      later: [],
      sent: [],
    };
    renderMailFeedUndoState();
  }

  function restorePendingMailFeedDelete(message = "", tone = "success") {
    const pending = state.pendingMailFeedDelete;
    if (!pending.active) return false;
    state.runtime.threads = cloneJson(pending.previousThreadsSnapshot);
    workspaceSourceOfTruth.setSelectedThreadId(asText(pending.previousSelectedThreadId));
    getMailFeedRuntimeState("later").selectedKeys = [...asArray(pending.previousSelections.later)];
    getMailFeedRuntimeState("sent").selectedKeys = [...asArray(pending.previousSelections.sent)];
    const feedKey = pending.feed;
    const count = pending.count;
    resetPendingMailFeedDelete();
    ensureRuntimeSelection();
    renderRuntimeConversationShell();
    if (message) {
      setAuxStatus(getMailFeedStatusNode(feedKey), message, tone);
    } else {
      setAuxStatus(
        getMailFeedStatusNode(feedKey),
        count > 1 ? `${count} trådar återställdes.` : "Tråden återställdes.",
        "success"
      );
    }
    return true;
  }

  async function commitPendingMailFeedDelete() {
    const pending = state.pendingMailFeedDelete;
    if (!pending.active || pending.committing) return false;
    pending.committing = true;
    if (pendingMailFeedDeleteTimer) {
      window.clearTimeout(pendingMailFeedDeleteTimer);
      pendingMailFeedDeleteTimer = null;
    }
    renderMailFeedUndoState();
    const feedKey = pending.feed;
    const count = pending.count;
    setAuxStatus(
      getMailFeedStatusNode(feedKey),
      count > 1 ? `Raderar ${count} trådar…` : "Raderar tråden…",
      "loading"
    );
    try {
      await deleteMailFeedThreads(feedKey, pending.threadsSnapshot);
      resetPendingMailFeedDelete();
      setAuxStatus(
        getMailFeedStatusNode(feedKey),
        count > 1 ? `${count} trådar raderades.` : "Tråden raderades.",
        "success"
      );
      return true;
    } catch (error) {
      const message = error?.message || "Kunde inte radera trådarna.";
      restorePendingMailFeedDelete(message, "error");
      return false;
    }
  }

  function stageMailFeedDelete(feedKey, threads) {
    const runtimeThreads = asArray(threads).filter((thread) => thread?.id);
    if (!runtimeThreads.length) return false;
    if (!state.runtime.deleteEnabled) {
      setAuxStatus(
        getMailFeedStatusNode(feedKey),
        "Delete är inte aktiverat i live runtime.",
        "error"
      );
      return false;
    }
    if (state.pendingMailFeedDelete.active) {
      setAuxStatus(
        getMailFeedStatusNode(feedKey),
        "Slutför eller ångra den pågående raderingen först.",
        "error"
      );
      return false;
    }
    const normalizedFeed = normalizeKey(feedKey) === "later" ? "later" : "sent";
    const removedIds = new Set(runtimeThreads.map((thread) => asText(thread.id)).filter(Boolean));
    state.pendingMailFeedDelete.active = true;
    state.pendingMailFeedDelete.feed = normalizedFeed;
    state.pendingMailFeedDelete.count = runtimeThreads.length;
    state.pendingMailFeedDelete.committing = false;
    state.pendingMailFeedDelete.threadsSnapshot = cloneJson(runtimeThreads);
    state.pendingMailFeedDelete.previousThreadsSnapshot = cloneJson(state.runtime.threads);
    state.pendingMailFeedDelete.previousSelectedThreadId = asText(state.runtime.selectedThreadId);
    state.pendingMailFeedDelete.previousSelections = {
      later: [...asArray(getMailFeedRuntimeState("later").selectedKeys)],
      sent: [...asArray(getMailFeedRuntimeState("sent").selectedKeys)],
    };
    state.runtime.threads = state.runtime.threads.filter((thread) => !removedIds.has(asText(thread.id)));
    getMailFeedRuntimeState(normalizedFeed).selectedKeys = [];
    ensureRuntimeSelection();
    renderRuntimeConversationShell();
    setAuxStatus(
      getMailFeedStatusNode(normalizedFeed),
      runtimeThreads.length > 1
        ? `${runtimeThreads.length} trådar flyttades ur vyn. Ångra inom 6 sekunder.`
        : "Tråden flyttades ur vyn. Ångra inom 6 sekunder.",
      "loading"
    );
    renderMailFeedUndoState();
    pendingMailFeedDeleteTimer = window.setTimeout(() => {
      commitPendingMailFeedDelete().catch((error) => {
        console.warn("Mail feed delete commit misslyckades.", error);
      });
    }, 6000);
    return true;
  }

  function setMoreMenuOpen(open) {
    const isOpen = workspaceSourceOfTruth.setOverlayOpen("moreMenu", open);
    state.moreMenuOpen = isOpen;
    if (moreMenu) {
      moreMenu.hidden = !isOpen;
      moreMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
      moreMenu.style.display = isOpen ? "grid" : "none";
      moreMenu.style.visibility = isOpen ? "visible" : "hidden";
      moreMenu.style.opacity = isOpen ? "1" : "0";
      moreMenu.style.pointerEvents = isOpen ? "auto" : "none";
    }
    if (moreMenuToggle) {
      moreMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }

  function setFloatingShellOpen(shell, open, offsetY = 14) {
    if (!shell) return;
    shell.setAttribute("aria-hidden", open ? "false" : "true");
    shell.style.opacity = open ? "1" : "0";
    shell.style.visibility = open ? "visible" : "hidden";
    shell.style.pointerEvents = open ? "auto" : "none";
    const surface = shell.querySelector(
      ".customers-modal-surface, .mailbox-admin-surface, .note-mode-surface, .shell-modal-surface"
    );
    if (surface) {
      surface.style.transform = open
        ? "translateX(-50%) translateY(0)"
        : `translateX(-50%) translateY(${offsetY}px)`;
    }
    syncCanvasFloatingShellState();
  }

  function hasFloatingShellOpen() {
    return Boolean(
      state.macroModal.open ||
      state.settingsProfileModal.open ||
      state.confirmDialog.open ||
      state.customerMergeModalOpen ||
      state.customerSettingsOpen ||
      state.customerRuntime.splitModalOpen ||
      state.customerImport.open ||
      state.mailboxAdminOpen ||
      state.noteMode.open
    );
  }

  function syncCanvasFloatingShellState() {
    if (!canvas) return;
    canvas.classList.toggle("has-floating-modal", hasFloatingShellOpen());
    canvas.classList.toggle("is-confirm-open", Boolean(state.confirmDialog.open));
  }

  function getConfirmDialogTitle(options = {}) {
    const explicitTitle = asText(options.title);
    if (explicitTitle) return explicitTitle;
    const confirmLabel = asText(options.confirmLabel);
    if (confirmLabel) return `${confirmLabel} den här åtgärden?`;
    return normalizeKey(options.tone) === "danger"
      ? "Bekräfta ändringen"
      : "Fortsätt med åtgärden";
  }

  function getConfirmDialogCopy(options = {}) {
    const explicitCopy = asText(options.copy);
    if (explicitCopy) return explicitCopy;
    return normalizeKey(options.tone) === "danger"
      ? "Bekräfta bara om du vill fortsätta med en åtgärd som kan påverka eller ta bort innehåll i CCO."
      : "Bekräfta bara om du vill fortsätta med den valda åtgärden i CCO.";
  }

  function openConfirmDialog(actionKey, context = {}) {
    const normalizedActionKey = normalizeKey(actionKey);
    const definition = CONFIRM_DIALOG_DEFINITIONS[normalizedActionKey];
    if (!definition) {
      console.warn("Bekräftelsedialogen stöder inte actionKey:", actionKey);
      return false;
    }
    if (typeof context.onConfirm !== "function") {
      console.warn("Bekräftelsedialogen kräver en onConfirm-handler:", actionKey);
      return false;
    }
    const resolved = definition(context) || {};
    setConfirmDialogOpen(true, {
      actionKey: normalizedActionKey,
      onConfirm: context.onConfirm,
      ...resolved,
    });
    return true;
  }

  function setMacroModalOpen(open, options = {}) {
    state.macroModal.open = Boolean(open);
    if (open) {
      state.macroModal.mode = normalizeKey(options.mode) === "edit" ? "edit" : "create";
      state.macroModal.macroId = asText(options.macroId);
      const macro =
        state.macroModal.mode === "edit"
          ? state.macros.find(
              (item) =>
                normalizeKey(item.id || item.key) === normalizeKey(state.macroModal.macroId)
            ) || null
          : null;
      if (macroModalKicker) {
        macroModalKicker.textContent =
          state.macroModal.mode === "edit" ? "Uppdatera makro" : "Makro";
      }
      if (macroModalTitle) {
        macroModalTitle.textContent =
          state.macroModal.mode === "edit" ? "Redigera makro" : "Skapa makro";
      }
      if (macroModalSubmitButton) {
        macroModalSubmitButton.textContent =
          state.macroModal.mode === "edit" ? "Spara ändringar" : "Spara makro";
      }
      if (macroModalNameInput) {
        macroModalNameInput.value = macro?.title || "";
      }
      if (macroModalDescriptionInput) {
        macroModalDescriptionInput.value =
          macro?.copy || "Standardiserar nästa steg i svar, anteckning och uppföljning.";
      }
      if (macroModalTriggerSelect) {
        macroModalTriggerSelect.value = macro?.mode === "auto" ? "auto" : "manual";
      }
      setFeedback(macroModalFeedback, "", "");
    } else {
      state.macroModal.mode = "create";
      state.macroModal.macroId = "";
      setFeedback(macroModalFeedback, "", "");
    }
    setFloatingShellOpen(macroEditorShell, state.macroModal.open, 16);
  }

  function setSettingsProfileModalOpen(open) {
    state.settingsProfileModal.open = Boolean(open);
    if (open) {
      if (settingsProfileModalNameInput) {
        settingsProfileModalNameInput.value =
          state.settingsRuntime.profileName || "Ditt namn";
      }
      if (settingsProfileModalEmailInput) {
        settingsProfileModalEmailInput.value =
          state.settingsRuntime.profileEmail || "din.email@hairtp.com";
      }
      setFeedback(settingsProfileModalFeedback, "", "");
    } else {
      setFeedback(settingsProfileModalFeedback, "", "");
    }
    setFloatingShellOpen(settingsProfileShell, state.settingsProfileModal.open, 16);
  }

  function setConfirmDialogOpen(open, options = {}) {
    const normalizedActionKey = normalizeKey(options.actionKey);
    if (open && !CONFIRM_DIALOG_DEFINITIONS[normalizedActionKey]) {
      console.warn("Bekräftelsedialogen blockerade okänd actionKey:", options.actionKey);
      return;
    }
    state.confirmDialog.open = Boolean(open);
    if (open) {
      state.confirmDialog.actionKey = normalizedActionKey;
      state.confirmDialog.tone = normalizeKey(options.tone) || "danger";
      state.confirmDialog.onConfirm =
        typeof options.onConfirm === "function" ? options.onConfirm : null;
      if (confirmKicker) confirmKicker.textContent = asText(options.kicker, "Bekräfta");
      if (confirmTitle) confirmTitle.textContent = getConfirmDialogTitle(options);
      if (confirmCopy) confirmCopy.textContent = getConfirmDialogCopy(options);
      if (confirmSubmitButton) {
        confirmSubmitButton.textContent = asText(options.confirmLabel, "Bekräfta");
        confirmSubmitButton.classList.toggle(
          "customers-merge-accept",
          state.confirmDialog.tone !== "danger"
        );
        confirmSubmitButton.classList.toggle(
          "settings-danger-button",
          state.confirmDialog.tone === "danger"
        );
      }
      setFeedback(confirmFeedback, "", "");
    } else {
      state.confirmDialog.actionKey = "";
      state.confirmDialog.onConfirm = null;
      state.confirmDialog.tone = "danger";
      setFeedback(confirmFeedback, "", "");
    }
    setFloatingShellOpen(shellConfirmShell, state.confirmDialog.open, 16);
  }

  function getCustomerDetail(key) {
    const normalizedKey = normalizeKey(key);
    const directory = getCustomerDirectoryMap()[normalizedKey] || {};
    const detail = getCustomerDetailsMap()[normalizedKey] || { emails: [], mailboxes: [] };
    return {
      key: normalizedKey,
      name: directory.name || normalizedKey,
      emails: [...detail.emails],
      phone: detail.phone || "",
      mailboxes: [...(detail.mailboxes || [])],
    };
  }

  function getCustomerDirectoryMap() {
    if (!state.customerRuntime.directory || typeof state.customerRuntime.directory !== "object") {
      state.customerRuntime.directory = cloneJson(CUSTOMER_DIRECTORY);
    }
    return state.customerRuntime.directory;
  }

  function getCustomerDetailsMap() {
    if (!state.customerRuntime.details || typeof state.customerRuntime.details !== "object") {
      state.customerRuntime.details = cloneJson(CUSTOMER_PROFILE_DETAILS);
    }
    return state.customerRuntime.details;
  }

  function buildCustomerSuggestionPairId(primaryKey, secondaryKey) {
    return [normalizeKey(primaryKey), normalizeKey(secondaryKey)]
      .filter(Boolean)
      .sort()
      .join("::");
  }

  function buildCustomerPersistPayload() {
    return {
      mergedInto: { ...state.customerRuntime.mergedInto },
      dismissedSuggestionIds: [...asArray(state.customerRuntime.dismissedSuggestionIds)].map((item) =>
        buildCustomerSuggestionPairId(...String(item || "").split("::"))
      ).filter(Boolean),
      acceptedSuggestionIds: [...asArray(state.customerRuntime.acceptedSuggestionIds)].map((item) =>
        buildCustomerSuggestionPairId(...String(item || "").split("::"))
      ).filter(Boolean),
      directory: cloneJson(getCustomerDirectoryMap()),
      details: cloneJson(getCustomerDetailsMap()),
      profileCounts: { ...state.customerRuntime.profileCounts },
      primaryEmailByKey: { ...state.customerPrimaryEmailByKey },
      customerSettings: { ...state.customerSettings },
      updatedAt: new Date().toISOString(),
    };
  }

  function applyCustomerPersistedState(customerState = {}) {
    state.customerRuntime.mergedInto = {
      ...(customerState?.mergedInto && typeof customerState.mergedInto === "object"
        ? customerState.mergedInto
        : {}),
    };
    state.customerRuntime.dismissedSuggestionIds = [
      ...asArray(customerState?.dismissedSuggestionIds)
        .map((item) => buildCustomerSuggestionPairId(...String(item || "").split("::")))
        .filter(Boolean),
    ];
    state.customerRuntime.acceptedSuggestionIds = [
      ...asArray(customerState?.acceptedSuggestionIds)
        .map((item) => buildCustomerSuggestionPairId(...String(item || "").split("::")))
        .filter(Boolean),
    ];
    state.customerRuntime.directory = {
      ...cloneJson(CUSTOMER_DIRECTORY),
      ...(customerState?.directory && typeof customerState.directory === "object"
        ? cloneJson(customerState.directory)
        : {}),
    };
    state.customerRuntime.details = {
      ...cloneJson(CUSTOMER_PROFILE_DETAILS),
      ...(customerState?.details && typeof customerState.details === "object"
        ? cloneJson(customerState.details)
        : {}),
    };
    state.customerRuntime.profileCounts = {
      ...Object.fromEntries(
        Object.entries(CUSTOMER_DIRECTORY).map(([key, item]) => [key, item.profileCount])
      ),
      ...(customerState?.profileCounts && typeof customerState.profileCounts === "object"
        ? customerState.profileCounts
        : {}),
    };
    state.customerPrimaryEmailByKey = {
      ...Object.fromEntries(
        Object.entries(CUSTOMER_PROFILE_DETAILS).map(([key, detail]) => [
          key,
          detail.emails[0] || "",
        ])
      ),
      ...(customerState?.primaryEmailByKey &&
      typeof customerState.primaryEmailByKey === "object"
        ? customerState.primaryEmailByKey
        : {}),
    };
    state.customerSettings = {
      ...DEFAULT_CUSTOMER_SETTINGS,
      ...(customerState?.customerSettings &&
      typeof customerState.customerSettings === "object"
        ? customerState.customerSettings
        : {}),
    };
  }

  async function refreshCustomerIdentitySuggestions({ quiet = true } = {}) {
    if (state.customerRuntime.authRequired && !getAdminToken()) {
      return { suggestionGroups: state.customerRuntime.identitySuggestionGroups || {} };
    }

    state.customerRuntime.identitySuggestionsLoading = true;
    try {
      const payload = await apiRequest("/api/v1/cco/customers/identity/suggestions", {
        method: "POST",
        headers: {
          "x-idempotency-key": createIdempotencyKey("major-arcana-customers-identity-suggestions"),
        },
        body: {
          customerState: buildCustomerPersistPayload(),
        },
      });
      applyCustomerPersistedState(payload?.customerState || {});
      state.customerRuntime.identitySuggestionGroups =
        payload?.suggestionGroups && typeof payload.suggestionGroups === "object"
          ? cloneJson(payload.suggestionGroups)
          : {};
      state.customerRuntime.duplicateMetric = Math.max(
        0,
        Number(payload?.duplicateCount || 0)
      );
      state.customerRuntime.authRequired = false;
      state.customerRuntime.error = "";
      return payload;
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.customerRuntime.authRequired = true;
        state.customerRuntime.error = "Inloggning krävs för att läsa kundidentiteten.";
        if (!quiet) {
          setCustomersStatus(state.customerRuntime.error, "error");
        }
      } else if (!quiet) {
        setCustomersStatus(
          error?.message || "Kunde inte läsa identitetsförslagen.",
          "error"
        );
      }
      return { suggestionGroups: state.customerRuntime.identitySuggestionGroups || {} };
    } finally {
      state.customerRuntime.identitySuggestionsLoading = false;
    }
  }

  async function loadCustomersRuntime({ force = false } = {}) {
    if (state.customerRuntime.loading && !force) return state.customerRuntime;
    if (state.customerRuntime.loaded && !force && !state.customerRuntime.error) {
      ensureCustomerRuntimeProfilesFromLive();
      await refreshCustomerIdentitySuggestions({ quiet: true });
      applyCustomerFilters();
      return state.customerRuntime;
    }

    state.customerRuntime.loading = true;
    state.customerRuntime.authRequired = false;
    state.customerRuntime.error = "";
    setCustomersStatus("Läser kundpersistens…", "loading");
    try {
      const payload = await apiRequest("/api/v1/cco/customers/state");
      applyCustomerPersistedState(payload?.customerState || {});
      ensureCustomerRuntimeProfilesFromLive();
      await refreshCustomerIdentitySuggestions({ quiet: true });
      state.customerRuntime.loaded = true;
      setCustomersStatus("", "");
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.customerRuntime.authRequired = true;
        state.customerRuntime.error = "Inloggning krävs för att läsa kundpersistensen.";
      } else {
        state.customerRuntime.error =
          error?.message || "Kunde inte läsa kundpersistensen.";
      }
      ensureCustomerRuntimeProfilesFromLive();
      state.customerRuntime.identitySuggestionGroups = {};
      setCustomersStatus(state.customerRuntime.error, "error");
    } finally {
      state.customerRuntime.loading = false;
      applyCustomerFilters();
    }
    return state.customerRuntime;
  }

  async function saveCustomersRuntime(successMessage = "") {
    if (state.customerRuntime.authRequired && !getAdminToken()) {
      window.location.assign(buildReauthUrl());
      return false;
    }

    state.customerRuntime.saving = true;
    if (successMessage) {
      setCustomersStatus("Sparar kundändring…", "loading");
    }
    try {
      const payload = await apiRequest("/api/v1/cco/customers/state", {
        method: "PUT",
        headers: {
          "x-idempotency-key": createIdempotencyKey("major-arcana-customers-save"),
        },
        body: {
          customerState: buildCustomerPersistPayload(),
        },
      });
      applyCustomerPersistedState(payload?.customerState || {});
      ensureCustomerRuntimeProfilesFromLive();
      await refreshCustomerIdentitySuggestions({ quiet: true });
      state.customerRuntime.loaded = true;
      state.customerRuntime.authRequired = false;
      state.customerRuntime.error = "";
      if (successMessage) {
        setCustomersStatus(successMessage, "success");
      }
      applyCustomerFilters();
      return true;
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.customerRuntime.authRequired = true;
        setCustomersStatus("Inloggning krävs för att spara kundändringar.", "error");
        window.location.assign(buildReauthUrl());
        return false;
      }
      state.customerRuntime.error =
        error?.message || "Kunde inte spara kundändringarna.";
      setCustomersStatus(state.customerRuntime.error, "error");
      return false;
    } finally {
      state.customerRuntime.saving = false;
    }
  }

  function refreshCustomerNodeRefs() {
    customerRows = Array.from(document.querySelectorAll("[data-customer-row]"));
    customerMergeGroups = Array.from(document.querySelectorAll("[data-customer-merge-group]"));
    customerDetailCards = Array.from(document.querySelectorAll("[data-customer-detail]"));
  }

  function mergeUniqueMailboxValues(values) {
    const merged = [];
    const seen = new Set();
    asArray(values).forEach((value) => {
      const normalized = normalizeMailboxId(value);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      merged.push(asText(value));
    });
    return merged;
  }

  function mergeUniqueTextValues(values) {
    const merged = [];
    const seen = new Set();
    asArray(values).forEach((value) => {
      const text = normalizeText(value);
      const normalized = normalizeKey(text);
      if (!text || !normalized || seen.has(normalized)) return;
      seen.add(normalized);
      merged.push(text);
    });
    return merged;
  }

  function escapeAttribute(value) {
    return escapeHtml(asText(value)).replace(/"/g, "&quot;");
  }

  function getVisibleCustomerPoolKeys() {
    return Object.keys(getCustomerDirectoryMap()).filter(
      (key) => !state.customerRuntime.mergedInto[normalizeKey(key)]
    );
  }

  function findCustomerKeyByEmail(email) {
    const normalizedEmail = normalizeMailboxId(email);
    if (!normalizedEmail) return "";
    const detailsMap = getCustomerDetailsMap();
    const match =
      Object.keys(detailsMap).find((key) =>
        asArray(detailsMap[key]?.emails).some(
          (entry) => normalizeMailboxId(entry) === normalizedEmail
        )
      ) || "";
    return normalizeKey(state.customerRuntime.mergedInto[normalizeKey(match)] || match);
  }

  function findCustomerKeyByName(name) {
    const normalizedName = normalizeKey(name);
    if (!normalizedName) return "";
    const directoryMap = getCustomerDirectoryMap();
    const match =
      Object.keys(directoryMap).find(
        (key) => normalizeKey(directoryMap[key]?.name) === normalizedName
      ) || "";
    return normalizeKey(state.customerRuntime.mergedInto[normalizeKey(match)] || match);
  }

  function createCustomerKeyFromThread(thread) {
    const directoryMap = getCustomerDirectoryMap();
    const base =
      normalizeKey(thread?.customerName) ||
      normalizeKey(asText(thread?.customerEmail).split("@")[0]) ||
      `customer_${Object.keys(directoryMap).length + 1}`;
    let candidate = base;
    let index = 2;
    while (directoryMap[candidate]) {
      candidate = `${base}_${index}`;
      index += 1;
    }
    return candidate;
  }

  function ensureCustomerRuntimeProfilesFromLive() {
    const directoryMap = getCustomerDirectoryMap();
    const detailsMap = getCustomerDetailsMap();
    const runtimeThreads = asArray(state.runtime?.threads);
    if (!runtimeThreads.length) return;
    const hydratedIds = new Set(asArray(state.customerRuntime.liveHydratedThreadIds));

    runtimeThreads.forEach((thread) => {
      const threadId = normalizeKey(thread?.id);
      const resolvedKey =
        findCustomerKeyByEmail(thread?.customerEmail) ||
        findCustomerKeyByName(thread?.customerName) ||
        createCustomerKeyFromThread(thread);

      if (!directoryMap[resolvedKey]) {
        directoryMap[resolvedKey] = {
          name: thread?.customerName || "Okänd kund",
          vip: Boolean(thread?.isVIP),
          emailCoverage: thread?.customerEmail ? 1 : 0,
          duplicateCandidate: false,
          profileCount: 1,
          customerValue: 0,
          totalConversations: 0,
          totalMessages: 0,
        };
      }

      if (!detailsMap[resolvedKey]) {
        detailsMap[resolvedKey] = {
          emails: [],
          phone: "",
          mailboxes: [],
        };
      }

      const detail = detailsMap[resolvedKey];
      detail.emails = mergeUniqueMailboxValues([
        ...asArray(detail.emails),
        thread?.customerEmail,
      ]);
      detail.mailboxes = mergeUniqueTextValues([
        ...asArray(detail.mailboxes),
        thread?.mailboxLabel,
      ]);

      const stats = directoryMap[resolvedKey];
      stats.name = stats.name || thread?.customerName || "Okänd kund";
      stats.vip = Boolean(stats.vip || thread?.isVIP);
      stats.emailCoverage = Math.max(
        Number(stats.emailCoverage || 0),
        detail.emails.length
      );
      stats.profileCount = Math.max(
        Number(stats.profileCount || 1),
        detail.emails.length || 1
      );
      if (threadId && !hydratedIds.has(threadId)) {
        stats.totalConversations = Number(stats.totalConversations || 0) + 1;
        stats.totalMessages =
          Number(stats.totalMessages || 0) +
          Math.max(1, asArray(thread?.messages).length || asArray(thread?.historyEvents).length || 1);
        hydratedIds.add(threadId);
      }
      stats.duplicateCandidate = Boolean(
        Number(stats.profileCount || 1) > 1 || stats.duplicateCandidate
      );

      if (!state.customerPrimaryEmailByKey[resolvedKey] && detail.emails[0]) {
        state.customerPrimaryEmailByKey[resolvedKey] = detail.emails[0];
      }
      if (!state.customerRuntime.profileCounts[resolvedKey]) {
        state.customerRuntime.profileCounts[resolvedKey] = Math.max(1, detail.emails.length || 1);
      }
    });
    state.customerRuntime.liveHydratedThreadIds = Array.from(hydratedIds);
  }

  function getCustomerRecord(key) {
    const normalizedKey = normalizeKey(key);
    const directory = getCustomerDirectoryMap()[normalizedKey] || {};
    const detail = getCustomerDetail(normalizedKey);
    const primaryEmail =
      state.customerPrimaryEmailByKey[normalizedKey] || detail.emails[0] || "";
    const otherEmailCount = Math.max(0, detail.emails.length - (primaryEmail ? 1 : 0) - 0);
    return {
      key: normalizedKey,
      name: directory.name || detail.name || normalizedKey,
      vip: Boolean(directory.vip),
      profileCount: Number(
        state.customerRuntime.profileCounts[normalizedKey] || directory.profileCount || 1
      ),
      customerValue: Number(directory.customerValue || 0),
      totalConversations: Number(directory.totalConversations || 0),
      totalMessages: Number(directory.totalMessages || 0),
      duplicateCandidate: Boolean(directory.duplicateCandidate),
      primaryEmail,
      otherEmailCount: Math.max(0, detail.emails.filter((email) => email !== primaryEmail).length),
      phone: detail.phone || "",
      emails: detail.emails,
      mailboxes: detail.mailboxes,
    };
  }

  function buildCustomerSuggestionGroups() {
    const serverGroups =
      state.customerRuntime.identitySuggestionGroups &&
      typeof state.customerRuntime.identitySuggestionGroups === "object"
        ? state.customerRuntime.identitySuggestionGroups
        : null;
    if (serverGroups && Object.keys(serverGroups).length) {
      return serverGroups;
    }
    const keys = getVisibleCustomerPoolKeys();
    const groups = Object.fromEntries(keys.map((key) => [key, []]));
    const detailsMap = getCustomerDetailsMap();
    const directoryMap = getCustomerDirectoryMap();

    for (let index = 0; index < keys.length; index += 1) {
      for (let compareIndex = index + 1; compareIndex < keys.length; compareIndex += 1) {
        const primaryKey = keys[index];
        const secondaryKey = keys[compareIndex];
        const primary = getCustomerRecord(primaryKey);
        const secondary = getCustomerRecord(secondaryKey);
        const primaryDetail = detailsMap[primaryKey] || { emails: [], mailboxes: [] };
        const secondaryDetail = detailsMap[secondaryKey] || { emails: [], mailboxes: [] };
        const reasons = [];
        let confidence = 0;

        const sharedPhone =
          normalizeText(primaryDetail.phone) &&
          normalizeText(primaryDetail.phone) === normalizeText(secondaryDetail.phone);
        if (sharedPhone) {
          reasons.push("Samma telefonnummer");
          confidence += 38;
        }

        const sharedEmails = asArray(primaryDetail.emails).filter((email) =>
          asArray(secondaryDetail.emails).some(
            (candidate) => normalizeMailboxId(candidate) === normalizeMailboxId(email)
          )
        );
        if (sharedEmails.length) {
          reasons.push(`Delad e-postadress: ${sharedEmails[0]}`);
          confidence += 42;
        }

        const nameOverlap =
          normalizeKey(primary.name).split(" ")[0] &&
          normalizeKey(primary.name).split(" ")[0] === normalizeKey(secondary.name).split(" ")[0];
        if (nameOverlap) {
          reasons.push("Liknande namn");
          confidence += 18;
        }

        const sharedMailboxes = asArray(primaryDetail.mailboxes).filter((mailbox) =>
          asArray(secondaryDetail.mailboxes).some(
            (candidate) => normalizeKey(candidate) === normalizeKey(mailbox)
          )
        );
        if (sharedMailboxes.length) {
          reasons.push(`Samma mailboxspår: ${sharedMailboxes[0]}`);
          confidence += 8;
        }

        if (Number(directoryMap[primaryKey]?.profileCount || 1) > 1) confidence += 4;
        if (Number(directoryMap[secondaryKey]?.profileCount || 1) > 1) confidence += 4;
        if (!reasons.length || confidence < 80) continue;

        const pairId = buildCustomerSuggestionPairId(primaryKey, secondaryKey);
        const buildSuggestion = (baseKey, candidateKey, candidateRecord) => ({
          id: pairId,
          pairId,
          primaryKey: baseKey,
          secondaryKey: candidateKey,
          name: candidateRecord.name,
          confidence: Math.min(98, confidence),
          reasons: reasons.slice(0, 3),
        });

        groups[primaryKey].push(buildSuggestion(primaryKey, secondaryKey, secondary));
        groups[secondaryKey].push(buildSuggestion(secondaryKey, primaryKey, primary));
      }
    }

    return groups;
  }

  function getActiveCustomerSuggestionCount(suggestionGroups) {
    const groups = suggestionGroups || buildCustomerSuggestionGroups();
    const seen = new Set();
    Object.values(groups).forEach((items) => {
      asArray(items).forEach((item) => {
        const pair = [normalizeKey(item.primaryKey), normalizeKey(item.secondaryKey)]
          .filter(Boolean)
          .sort()
          .join("::");
        if (!pair) return;
        const suggestionId = buildCustomerSuggestionPairId(item.primaryKey, item.secondaryKey);
        if (
          state.customerRuntime.dismissedSuggestionIds.includes(suggestionId) ||
          state.customerRuntime.acceptedSuggestionIds.includes(suggestionId)
        ) {
          return;
        }
        seen.add(pair);
      });
    });
    return seen.size;
  }

  function getBatchSelectionKeys() {
    const current = Array.isArray(state.customerBatchSelection)
      ? state.customerBatchSelection
      : [];
    return Array.from(
      new Set(
        current.filter(
          (key) =>
            getCustomerDirectoryMap()[normalizeKey(key)] &&
            !state.customerRuntime.mergedInto[normalizeKey(key)]
        )
      )
    );
  }

  function getMergeSelectionKeys() {
    const cleaned = getBatchSelectionKeys();
    if (cleaned.length >= 2) return cleaned;

    const visibleFallback = customerRows
      .map((row) => normalizeKey(row.dataset.customerRow))
      .filter(
        (key) =>
          !state.customerRuntime.mergedInto[key] &&
          key !== state.selectedCustomerIdentity &&
          !customerRows.find((row) => normalizeKey(row.dataset.customerRow) === key)?.hidden
      );

    return Array.from(new Set([state.selectedCustomerIdentity, ...visibleFallback])).slice(0, 2);
  }

  function renderCustomerBatchSelection() {
    const activeKeys = new Set(getBatchSelectionKeys());
    customerRows.forEach((row) => {
      const key = normalizeKey(row.dataset.customerRow);
      const check = row.querySelector(".customer-record-check");
      if (check) {
        check.classList.toggle("is-batch-selected", activeKeys.has(key));
      }
    });

    if (customerBulkCount) {
      customerBulkCount.textContent = `(${activeKeys.size})`;
    }

    const isSelectedInBatch = activeKeys.has(state.selectedCustomerIdentity);
    customerDetailActionButtons.forEach((button) => {
      if (button.dataset.customerDetailAction === "toggle_batch") {
        button.textContent = isSelectedInBatch ? "Avmarkera från batch" : "Markera för batch";
      }
    });
  }

  function renderCustomerDetailTools() {
    const detail = getCustomerDetail(state.selectedCustomerIdentity);
    const primaryEmail =
      state.customerPrimaryEmailByKey[detail.key] || detail.emails[0] || "";

    if (customerDetailName) {
      customerDetailName.textContent = detail.name;
    }

    if (customerEmailList) {
      customerEmailList.innerHTML = "";
      detail.emails.forEach((email, index) => {
        const row = document.createElement("div");
        row.className = "customers-email-row";
        if (email === primaryEmail || (!primaryEmail && index === 0)) {
          row.classList.add("is-primary");
        }

        const copy = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = email;
        const meta = document.createElement("small");
        meta.textContent =
          row.classList.contains("is-primary")
            ? `Primär · ${detail.mailboxes[index % Math.max(detail.mailboxes.length, 1)] || "Mailbox"}`
            : detail.mailboxes[index % Math.max(detail.mailboxes.length, 1)] || "Sekundär";
        copy.append(strong, meta);

        const chipRow = document.createElement("div");
        chipRow.className = "mail-feed-meta-row";
        const mailboxChip = document.createElement("span");
        mailboxChip.className = "customers-email-chip";
        mailboxChip.textContent = detail.mailboxes[index % Math.max(detail.mailboxes.length, 1)] || "Kons";
        chipRow.append(mailboxChip);

        row.append(copy, chipRow);
        customerEmailList.append(row);
      });
    }

    if (state.customerRuntime.splitModalOpen) {
      renderCustomerSplitModal();
    }
  }

  function renderCustomerMergeModal() {
    if (!customerMergePreview || !customerMergePrimaryOptions) return;
    const mergeKeys = getMergeSelectionKeys();
    const activePrimary = mergeKeys.includes(state.customerMergePrimaryKey)
      ? state.customerMergePrimaryKey
      : mergeKeys[0] || state.selectedCustomerIdentity;
    state.customerMergePrimaryKey = activePrimary;

    customerMergePreview.innerHTML = "";
    mergeKeys.forEach((key) => {
      const detail = getCustomerDetail(key);
      const article = document.createElement("article");
      article.className = "mailbox-admin-entry";
      article.innerHTML = `<div><strong>${detail.name}</strong><span>${detail.emails.join(" · ")}</span></div><span>${detail.phone}</span>`;
      customerMergePreview.append(article);
    });

    customerMergePrimaryOptions.innerHTML = "";
    mergeKeys.forEach((key) => {
      const detail = getCustomerDetail(key);
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.customerMergePrimary = key;
      button.classList.toggle("is-active", key === activePrimary);
      button.innerHTML = `<strong>${detail.name}</strong><p>${detail.emails[0] || "Saknar e-post"} blir primär profil.</p>`;
      customerMergePrimaryOptions.append(button);
    });

    customerMergeOptionInputs.forEach((input) => {
      input.checked = Boolean(state.customerMergeOptions[normalizeKey(input.dataset.customerMergeOption)]);
    });
  }

  function setCustomerMergeOpen(open) {
    state.customerMergeModalOpen = Boolean(open);
    renderCustomerMergeModal();
    setFloatingShellOpen(customerMergeShell, state.customerMergeModalOpen, 16);
    if (!open) {
      setFeedback(customerMergeFeedback, "", "");
    }
  }

  function setCustomerSettingsOpen(open) {
    state.customerSettingsOpen = Boolean(open);
    customerSettingToggleInputs.forEach((input) => {
      input.checked = Boolean(state.customerSettings[normalizeKey(input.dataset.customerSettingToggle)]);
    });
    setFloatingShellOpen(customerSettingsShell, state.customerSettingsOpen, 16);
    if (!open) {
      setFeedback(customerSettingsFeedback, "", "");
    }
  }

  function renderCustomerSplitModal() {
    if (!customerSplitOptions) return;
    const sourceKey = normalizeKey(
      state.customerRuntime.splitSourceKey || state.selectedCustomerIdentity
    );
    const detail = getCustomerDetail(sourceKey);
    const primaryEmail =
      state.customerPrimaryEmailByKey[sourceKey] || detail.emails[0] || "";
    const splitOptions = detail.emails.filter(
      (email) => normalizeMailboxId(email) !== normalizeMailboxId(primaryEmail)
    );

    if (customerSplitTitle) {
      customerSplitTitle.textContent = `Välj alias att dela ut från ${detail.name}`;
    }

    if (!splitOptions.length) {
      customerSplitOptions.innerHTML =
        '<article class="customers-merge-card customers-merge-card-muted"><div class="customers-merge-empty"><strong>Ingen sekundär e-post hittades</strong><p>Den här profilen har inget alias att dela ut just nu.</p></div></article>';
      return;
    }

    customerSplitOptions.innerHTML = splitOptions
      .map(
        (email) => `
          <label class="customers-setting-toggle-row">
            <input type="radio" name="customer-split-email" data-customer-split-option="${escapeAttribute(email)}"${normalizeMailboxId(state.customerRuntime.splitEmail) === normalizeMailboxId(email) ? " checked" : ""} />
            <span>${escapeHtml(email)}</span>
          </label>
        `
      )
      .join("");
  }

  function setCustomerSplitOpen(open, sourceKey = state.selectedCustomerIdentity) {
    state.customerRuntime.splitModalOpen = Boolean(open);
    if (open) {
      const detail = getCustomerDetail(sourceKey);
      const primaryEmail =
        state.customerPrimaryEmailByKey[normalizeKey(sourceKey)] || detail.emails[0] || "";
      const splitOptions = detail.emails.filter(
        (email) => normalizeMailboxId(email) !== normalizeMailboxId(primaryEmail)
      );
      state.customerRuntime.splitSourceKey = normalizeKey(sourceKey);
      state.customerRuntime.splitEmail = splitOptions[0] || "";
    }
    renderCustomerSplitModal();
    setFloatingShellOpen(customerSplitShell, state.customerRuntime.splitModalOpen, 16);
    if (!open) {
      setFeedback(customerSplitFeedback, "", "");
    }
  }

  function inferCustomerImportFileName(sourceText) {
    const trimmed = String(sourceText || "").trim();
    if (!trimmed) return "";
    return trimmed.startsWith("{") || trimmed.startsWith("[")
      ? "customer-import.json"
      : "customer-import.csv";
  }

  function getCustomerImportBody() {
    const sourceText = String(
      customerImportTextInput?.value ?? state.customerImport.sourceText ?? ""
    );
    const fileName =
      normalizeText(state.customerImport.fileName) || inferCustomerImportFileName(sourceText);
    const previewRows = asArray(state.customerImport.preview?.rows);
    if (previewRows.length) {
      return {
        rows: buildCustomerImportRowsPayload(previewRows),
        fileName,
        defaultMailboxId: getOperationalImportMailboxId(),
      };
    }
    if (state.customerImport.sourceBinaryBase64) {
      return {
        binaryBase64: state.customerImport.sourceBinaryBase64,
        fileName,
        defaultMailboxId: getOperationalImportMailboxId(),
      };
    }
    return {
      text: sourceText,
      fileName,
      defaultMailboxId: getOperationalImportMailboxId(),
    };
  }

  function resetCustomerImportState() {
    state.customerImport.preview = null;
    state.customerImport.fileName = "";
    state.customerImport.sourceText = "";
    state.customerImport.sourceBinaryBase64 = "";
    state.customerImport.sourceFormat = "";
    state.customerImport.rowEditsDirty = false;
    state.customerImport.loadingPreview = false;
    state.customerImport.committing = false;
    if (customerImportFileInput) {
      customerImportFileInput.value = "";
    }
  }

  function renderCustomerImportModal() {
    if (customerImportTextInput && customerImportTextInput.value !== state.customerImport.sourceText) {
      customerImportTextInput.value = state.customerImport.sourceText;
    }

    if (customerImportFileName) {
      customerImportFileName.textContent =
        normalizeText(state.customerImport.fileName) || "Ingen fil vald ännu.";
    }

    const sourceBody = getCustomerImportBody();
    const preview = state.customerImport.preview;
    const previewRows = asArray(preview?.rows);
    const hasImportSource = hasCustomerImportSource(sourceBody);

    if (customerImportSummary) {
      if (!preview) {
        customerImportSummary.innerHTML =
          '<article class="customers-merge-card customers-merge-card-muted"><div class="customers-merge-empty"><strong>Ingen preview ännu</strong><p>Ladda upp en fil eller klistra in JSON, CSV eller XLS/XLSX och kör sedan Förhandsgranska.</p></div></article>';
      } else {
        customerImportSummary.innerHTML = `
          <div class="customer-import-summary-grid">
            <article class="customer-import-summary-card">
              <span>Totalt</span>
              <strong>${escapeHtml(String(preview.totalRows || 0))}</strong>
              <small>${escapeHtml(humanizeCode(preview.format, "Import"))}</small>
            </article>
            <article class="customer-import-summary-card">
              <span>Giltiga</span>
              <strong>${escapeHtml(String(preview.validRows || 0))}</strong>
              <small>${escapeHtml(preview.fileName || "Utan filnamn")}</small>
            </article>
            <article class="customer-import-summary-card">
              <span>Skapa</span>
              <strong>${escapeHtml(String(preview.created || 0))}</strong>
              <small>Nya profiler</small>
            </article>
            <article class="customer-import-summary-card">
              <span>Uppdatera</span>
              <strong>${escapeHtml(String(preview.updated || 0))}</strong>
              <small>Befintliga kunder</small>
            </article>
            <article class="customer-import-summary-card">
              <span>Merge / Fel</span>
              <strong>${escapeHtml(`${preview.merged || 0} / ${preview.invalid || 0}`)}</strong>
              <small>Sammanfogning och stoppade rader</small>
            </article>
          </div>
          ${
            state.customerImport.rowEditsDirty
              ? '<p class="customer-import-edit-note">Previewn har ändrade rader. Kör Förhandsgranska igen innan du importerar.</p>'
              : ""
          }
        `;
      }
    }

    if (customerImportPreviewList) {
      if (!preview) {
        customerImportPreviewList.innerHTML = "";
      } else if (!previewRows.length) {
        customerImportPreviewList.innerHTML =
          '<article class="customers-merge-card customers-merge-card-muted"><div class="customers-merge-empty"><strong>Importen innehöll inga rader</strong><p>Kontrollera rubriker och format innan du försöker igen.</p></div></article>';
      } else {
        customerImportPreviewList.innerHTML = previewRows
          .map((row) => {
            const action = normalizeKey(row?.action || "invalid");
            const editable = getCustomerImportEditableRow(row);
            const emails = asArray(editable?.emails).slice(0, 3).join(" · ");
            const mailboxes = asArray(editable?.mailboxes).slice(0, 3).join(" · ");
            const matchedCount = asArray(row?.matchedKeys).length;
            return `
              <article class="customer-import-preview-row is-${escapeAttribute(action)}">
                <div class="customer-import-preview-top">
                  <div class="customer-import-preview-copy">
                    <strong>Rad ${escapeHtml(String(row?.rowNumber || 0))} · ${escapeHtml(editable?.name || row?.targetKey || "Kundrad")}</strong>
                    <p>${escapeHtml(row?.message || "Ingen beskrivning tillgänglig.")}</p>
                    <small>${escapeHtml(emails || "Ingen e-post på raden")}</small>
                  </div>
                  <span class="customer-import-chip is-${escapeAttribute(action)}">${escapeHtml(
                    action === "create"
                      ? "Skapa"
                      : action === "update"
                        ? "Uppdatera"
                        : action === "merge"
                          ? "Slå ihop"
                          : "Ogiltig"
                  )}</span>
                </div>
                <div class="customer-import-chip-row">
                  ${
                    row?.targetKey
                      ? `<span class="customer-import-chip">Mål: ${escapeHtml(row.targetKey)}</span>`
                      : ""
                  }
                  ${
                    matchedCount
                      ? `<span class="customer-import-chip">Matchar ${escapeHtml(String(matchedCount))} profiler</span>`
                      : ""
                  }
                  ${
                    mailboxes
                      ? `<span class="customer-import-chip">${escapeHtml(mailboxes)}</span>`
                      : ""
                  }
                </div>
                <div class="customer-import-edit-grid">
                  <label class="customer-import-edit-field">
                    <span>Namn</span>
                    <input type="text" value="${escapeAttribute(editable?.name || "")}" data-customer-import-row="${escapeAttribute(String(row?.rowNumber || 0))}" data-customer-import-row-field="name" />
                  </label>
                  <label class="customer-import-edit-field">
                    <span>E-post</span>
                    <input type="text" value="${escapeAttribute(asArray(editable?.emails).join(", "))}" data-customer-import-row="${escapeAttribute(String(row?.rowNumber || 0))}" data-customer-import-row-field="emails" />
                  </label>
                  <label class="customer-import-edit-field">
                    <span>Mailboxar</span>
                    <input type="text" value="${escapeAttribute(asArray(editable?.mailboxes).join(", "))}" data-customer-import-row="${escapeAttribute(String(row?.rowNumber || 0))}" data-customer-import-row-field="mailboxes" />
                  </label>
                  <label class="customer-import-edit-field">
                    <span>Telefon</span>
                    <input type="text" value="${escapeAttribute(editable?.phone || "")}" data-customer-import-row="${escapeAttribute(String(row?.rowNumber || 0))}" data-customer-import-row-field="phone" />
                  </label>
                  <label class="customer-import-edit-field customer-import-edit-field-small">
                    <span>Meddelanden</span>
                    <input type="number" min="0" value="${escapeAttribute(String(asNumber(editable?.totalMessages, 0)))}" data-customer-import-row="${escapeAttribute(String(row?.rowNumber || 0))}" data-customer-import-row-field="totalMessages" />
                  </label>
                  <label class="customer-import-edit-checkbox">
                    <input type="checkbox" ${editable?.vip ? "checked" : ""} data-customer-import-row="${escapeAttribute(String(row?.rowNumber || 0))}" data-customer-import-row-field="vip" />
                    <span>VIP</span>
                  </label>
                </div>
              </article>
            `;
          })
          .join("");
      }
    }

    setButtonBusy(
      customerImportPreviewButton,
      state.customerImport.loadingPreview,
      "Förhandsgranska",
      "Läser..."
    );
    setButtonBusy(
      customerImportCommitButton,
      state.customerImport.committing,
      "Importera",
      "Importerar..."
    );

    if (customerImportPreviewButton) {
      customerImportPreviewButton.disabled =
        state.customerImport.loadingPreview ||
        state.customerImport.committing ||
        !hasImportSource;
    }
    if (customerImportCommitButton) {
      customerImportCommitButton.disabled =
        state.customerImport.loadingPreview ||
        state.customerImport.committing ||
        state.customerImport.rowEditsDirty ||
        !preview ||
        Number(preview.validRows || 0) <= 0;
    }
  }

  function setCustomerImportOpen(open, options = {}) {
    state.customerImport.open = Boolean(open);
    if (!open && options.reset) {
      resetCustomerImportState();
    }
    renderCustomerImportModal();
    setFloatingShellOpen(customerImportShell, state.customerImport.open, 16);
    if (!open) {
      setFeedback(customerImportFeedback, "", "");
    }
  }

  async function readCustomerImportFile(file) {
    if (!file) return;
    const normalizedFileName = normalizeText(file.name);
    const isSpreadsheet = /\.(xlsx|xls)$/i.test(normalizedFileName);
    state.customerImport.fileName = normalizedFileName;
    state.customerImport.rowEditsDirty = false;
    state.customerImport.preview = null;
    if (isSpreadsheet) {
      const arrayBuffer = await file.arrayBuffer();
      state.customerImport.sourceBinaryBase64 = encodeArrayBufferToBase64(arrayBuffer);
      state.customerImport.sourceText = "";
      state.customerImport.sourceFormat = "xlsx";
    } else {
      const text = await file.text();
      state.customerImport.sourceText = text;
      state.customerImport.sourceBinaryBase64 = "";
      state.customerImport.sourceFormat = /\.json$/i.test(normalizedFileName) ? "json" : "csv";
    }
    renderCustomerImportModal();
    setFeedback(
      customerImportFeedback,
      "success",
      `Läste ${state.customerImport.fileName || "importfilen"}. Kör Förhandsgranska för att validera raderna.`
    );
  }

  function updateCustomerImportPreviewRowField(rowNumber, field, value) {
    const targetRowNumber = Math.max(1, Number(rowNumber) || 0);
    const rows = asArray(state.customerImport.preview?.rows);
    const targetRow = rows.find((row) => Number(row?.rowNumber || 0) === targetRowNumber);
    if (!targetRow) return;

    const editable = getCustomerImportEditableRow(targetRow);
    targetRow.input = {
      rowNumber: targetRowNumber,
      name: normalizeText(editable.name),
      emails: asArray(editable.emails).slice(),
      phone: normalizeText(editable.phone),
      mailboxes: asArray(editable.mailboxes).slice(),
      vip: Boolean(editable.vip),
      customerValue: Math.max(0, Math.round(asNumber(editable.customerValue, 0))),
      totalConversations: Math.max(0, Math.round(asNumber(editable.totalConversations, 0))),
      totalMessages: Math.max(0, Math.round(asNumber(editable.totalMessages, 0))),
    };

    if (field === "name") {
      targetRow.input.name = normalizeText(value);
    } else if (field === "emails") {
      targetRow.input.emails = splitCustomerImportMultiValue(value).map((entry) =>
        normalizeText(entry).toLowerCase()
      );
    } else if (field === "mailboxes") {
      targetRow.input.mailboxes = splitCustomerImportMultiValue(value);
    } else if (field === "phone") {
      targetRow.input.phone = normalizeText(value);
    } else if (field === "vip") {
      targetRow.input.vip = Boolean(value);
    } else if (field === "totalMessages") {
      targetRow.input.totalMessages = Math.max(0, Math.round(asNumber(value, 0)));
    }

    state.customerImport.rowEditsDirty = true;
    setFeedback(
      customerImportFeedback,
      "loading",
      "Raden ändrades. Kör Förhandsgranska igen innan du importerar."
    );
    renderCustomerImportModal();
  }

  async function requestCustomerImportPreview() {
    const body = getCustomerImportBody();
    if (!hasCustomerImportSource(body)) {
      setFeedback(
        customerImportFeedback,
        "error",
        "Klistra in JSON/CSV eller välj en fil i JSON, CSV, XLS eller XLSX först."
      );
      renderCustomerImportModal();
      return;
    }

    state.customerImport.loadingPreview = true;
    renderCustomerImportModal();
    setFeedback(customerImportFeedback, "loading", "Förhandsgranskar kundimporten…");
    try {
      const payload = await apiRequest("/api/v1/cco/customers/import/preview", {
        method: "POST",
        headers: {
          "x-idempotency-key": createIdempotencyKey("major-arcana-customers-import-preview"),
        },
        body,
      });
      state.customerImport.preview = payload?.importSummary || null;
      state.customerImport.rowEditsDirty = false;
      state.customerRuntime.authRequired = false;
      state.customerRuntime.error = "";
      const validRows = Number(state.customerImport.preview?.validRows || 0);
      setFeedback(
        customerImportFeedback,
        "success",
        validRows
          ? `Preview klar. ${validRows} giltiga rader kan importeras.`
          : "Preview klar, men inga giltiga rader kan importeras ännu."
      );
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.customerRuntime.authRequired = true;
        setFeedback(customerImportFeedback, "error", "Inloggning krävs för att förhandsgranska importen.");
        window.location.assign(buildReauthUrl());
      } else {
        setFeedback(
          customerImportFeedback,
          "error",
          error?.message || "Kunde inte förhandsgranska kundimporten."
        );
      }
    } finally {
      state.customerImport.loadingPreview = false;
      renderCustomerImportModal();
    }
  }

  async function commitCustomerImport() {
    const preview = state.customerImport.preview;
    if (!preview || Number(preview.validRows || 0) <= 0) {
      setFeedback(customerImportFeedback, "error", "Kör Förhandsgranska och säkerställ minst en giltig rad först.");
      renderCustomerImportModal();
      return;
    }
    if (state.customerImport.rowEditsDirty) {
      setFeedback(customerImportFeedback, "error", "Kör Förhandsgranska igen efter radändringar innan du importerar.");
      renderCustomerImportModal();
      return;
    }

    state.customerImport.committing = true;
    renderCustomerImportModal();
    setFeedback(customerImportFeedback, "loading", "Importerar kunderna…");
    try {
      const payload = await apiRequest("/api/v1/cco/customers/import/commit", {
        method: "POST",
        headers: {
          "x-idempotency-key": createIdempotencyKey("major-arcana-customers-import-commit"),
        },
        body: getCustomerImportBody(),
      });
      applyCustomerPersistedState(payload?.customerState || {});
      ensureCustomerRuntimeProfilesFromLive();
      state.customerRuntime.loaded = true;
      state.customerRuntime.authRequired = false;
      state.customerRuntime.error = "";
      state.customerImport.rowEditsDirty = false;
      applyCustomerFilters();

      const firstAffectedKey = asArray(payload?.importSummary?.rows).find(
        (row) => normalizeKey(row?.action) !== "invalid" && normalizeKey(row?.targetKey)
      )?.targetKey;
      if (firstAffectedKey) {
        setSelectedCustomerIdentity(firstAffectedKey);
      }

      const importSummary = payload?.importSummary || preview;
      setCustomersStatus(
        `Import klar: ${Number(importSummary.created || 0)} skapade, ${Number(importSummary.updated || 0)} uppdaterade och ${Number(importSummary.merged || 0)} sammanslagna profiler.`,
        "success"
      );
      setCustomerImportOpen(false, { reset: true });
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.customerRuntime.authRequired = true;
        setFeedback(customerImportFeedback, "error", "Inloggning krävs för att importera kunderna.");
        window.location.assign(buildReauthUrl());
      } else {
        setFeedback(
          customerImportFeedback,
          "error",
          error?.message || "Kunde inte importera kundfilen."
        );
      }
    } finally {
      state.customerImport.committing = false;
      renderCustomerImportModal();
    }
  }

  function renderMailboxOptions() {
    if (!mailboxOptionsContainer || !mailboxAdminOpenButton) return;
    mailboxOptionsContainer
      .querySelectorAll(".mailbox-option-custom")
      .forEach((node) => node.remove());

    state.customMailboxes.forEach((mailbox) => {
      const label = document.createElement("label");
      label.className = "mailbox-option mailbox-option-custom";
      label.innerHTML =
        '<input class="mailbox-option-input" type="checkbox" />' +
        '<span class="mailbox-option-box" aria-hidden="true"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 8.4 6.6 11.2l5.8-6.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" /></svg></span>' +
        `<span class="mailbox-option-name">${mailbox.name}</span>`;
      mailboxOptionsContainer.insertBefore(label, mailboxAdminOpenButton);
    });
  }

  function getMailFeedRuntimeState(feedKey) {
    const normalizedFeed = normalizeKey(feedKey);
    if (!state.mailFeedsRuntime[normalizedFeed]) {
      state.mailFeedsRuntime[normalizedFeed] = {
        filter: "all",
        view: "card",
        density: "balanced",
        selectedKeys: [],
      };
    }
    return state.mailFeedsRuntime[normalizedFeed];
  }

  function setMailFeedFilter(feedKey, filterKey) {
    getMailFeedRuntimeState(feedKey).filter = normalizeKey(filterKey) || "all";
    renderMailFeeds();
  }

  function setMailFeedView(feedKey, viewKey) {
    getMailFeedRuntimeState(feedKey).view = normalizeKey(viewKey) === "list" ? "list" : "card";
    renderMailFeeds();
  }

  function setMailFeedDensity(feedKey, densityKey) {
    getMailFeedRuntimeState(feedKey).density =
      normalizeKey(densityKey) === "compact" ? "compact" : "balanced";
    renderMailFeeds();
  }

  function getMailFeedSelectedKeys(feedKey) {
    const runtime = getMailFeedRuntimeState(feedKey);
    const availableKeys = new Set(
      getMailFeedItems(feedKey).map((item) => normalizeKey(item.key)).filter(Boolean)
    );
    runtime.selectedKeys = asArray(runtime.selectedKeys).filter((key) =>
      availableKeys.has(normalizeKey(key))
    );
    return runtime.selectedKeys;
  }

  function toggleMailFeedSelection(feedKey, itemKey) {
    const runtime = getMailFeedRuntimeState(feedKey);
    const normalizedKey = normalizeKey(itemKey);
    const nextSelection = new Set(getMailFeedSelectedKeys(feedKey));
    if (nextSelection.has(normalizedKey)) {
      nextSelection.delete(normalizedKey);
    } else {
      nextSelection.add(normalizedKey);
    }
    runtime.selectedKeys = Array.from(nextSelection);
    renderMailFeeds();
  }

  function toggleSelectAllMailFeed(feedKey) {
    const runtime = getMailFeedRuntimeState(feedKey);
    const visibleItems = getFilteredMailFeedItems(feedKey);
    const visibleKeys = visibleItems.map((item) => normalizeKey(item.key)).filter(Boolean);
    if (!visibleKeys.length) return;
    const selected = new Set(getMailFeedSelectedKeys(feedKey));
    const allSelected = visibleKeys.every((key) => selected.has(key));
    if (allSelected) {
      visibleKeys.forEach((key) => selected.delete(key));
    } else {
      visibleKeys.forEach((key) => selected.add(key));
    }
    runtime.selectedKeys = Array.from(selected);
    renderMailFeeds();
  }

  function clearMailFeedSelection(feedKey) {
    getMailFeedRuntimeState(feedKey).selectedKeys = [];
    renderMailFeeds();
  }

  function getSelectedMailFeedItems(feedKey) {
    const selectedKeys = new Set(getMailFeedSelectedKeys(feedKey).map(normalizeKey));
    return getMailFeedItems(feedKey).filter((item) => selectedKeys.has(normalizeKey(item.key)));
  }

  function isMailFeedAttentionItem(item) {
    return (
      item.requiresAttention === true ||
      normalizeKey(item.riskLabel) === "hög risk" ||
      normalizeKey(item.riskLabel) === "miss" ||
      normalizeKey(item.riskLabel) === "bevaka" ||
      normalizeKey(item.statusLabel).includes("åtgärd") ||
      normalizeKey(item.waitingLabel).includes("åtgärd")
    );
  }

  function getFilteredMailFeedItems(feedKey) {
    const runtime = getMailFeedRuntimeState(feedKey);
    const filterKey = normalizeKey(runtime.filter || "all");
    const items = getMailFeedItems(feedKey);
    if (filterKey === "vip") {
      return items.filter((item) => item.isVIP);
    }
    if (filterKey === "attention") {
      return items.filter(isMailFeedAttentionItem);
    }
    return items;
  }

  async function deleteMailFeedThreads(feedKey, threads) {
    const runtimeThreads = asArray(threads).filter((thread) => thread?.id);
    if (!runtimeThreads.length) return false;
    if (!state.runtime.deleteEnabled) {
      setAuxStatus(
        normalizeKey(feedKey) === "later" ? laterStatus : sentStatus,
        "Delete är inte aktiverat i live runtime.",
        "error"
      );
      return false;
    }

    const settled = await Promise.allSettled(
      runtimeThreads.map((thread) =>
        apiRequest("/api/v1/cco/delete", {
          method: "POST",
          headers: {
            "x-idempotency-key": createIdempotencyKey(
              `major-arcana-mail-feed-delete-${thread.id}`
            ),
          },
          body: {
            channel: "admin",
            mailboxId: asText(thread.mailboxAddress),
            messageId: asText(thread.raw?.messageId),
            conversationId: thread.id,
            softDelete: true,
          },
        })
      )
    );

    const successfulIds = runtimeThreads
      .filter((_, index) => settled[index]?.status === "fulfilled")
      .map((thread) => thread.id);
    if (successfulIds.length) {
      state.runtime.threads = state.runtime.threads.filter(
        (thread) => !successfulIds.includes(thread.id)
      );
    }

    const failures = settled.filter((result) => result.status === "rejected");
    if (successfulIds.length) {
      getMailFeedRuntimeState(feedKey).selectedKeys = [];
      ensureRuntimeSelection();
      renderRuntimeConversationShell();
    }

    if (failures.length && !successfulIds.length) {
      const error = failures[0].reason;
      throw error instanceof Error ? error : new Error("Kunde inte radera trådarna.");
    }

    return true;
  }

  async function handleMailFeedBulkCommand(feedKey, commandKey) {
    const normalizedFeed = normalizeKey(feedKey);
    const normalizedCommand = normalizeKey(commandKey);
    const selectedThreads = getSelectedMailFeedItems(normalizedFeed)
      .map((item) =>
        getMailFeedRuntimeThreads(normalizedFeed).find(
          (thread) => normalizeKey(thread.id) === normalizeKey(item.key)
        )
      )
      .filter(Boolean);

    if (!selectedThreads.length) {
      setAuxStatus(
        normalizedFeed === "later" ? laterStatus : sentStatus,
        "Markera minst en tråd först.",
        "error"
      );
      return;
    }

    if (normalizedCommand === "resume") {
      selectedThreads.forEach((thread) => {
        updateRuntimeThread(thread.id, (current) => {
          current.tags = Array.from(
            new Set(current.tags.filter((tag) => tag !== "later").concat(["act-now"]))
          );
          current.waitingLabel = "Behöver åtgärd";
          current.statusLabel = "Öppen";
          current.nextActionLabel = "Svara nu";
          current.nextActionSummary =
            "Tråden återupptogs från Senare och väntar nu på nästa tydliga svar.";
          current.raw = {
            ...current.raw,
            waitingOn: "owner",
            lastActionTakenLabel: "Återupptagen",
            followUpDueAt: "",
            followUpSuggestedAt: "",
          };
          current.cards = buildRuntimeSummaryCards(current.raw, current);
          return current;
        });
      });
      getMailFeedRuntimeState(normalizedFeed).selectedKeys = [];
      selectRuntimeThread(selectedThreads[0].id);
      setAppView("conversations");
      applyFocusSection("conversation");
      setAuxStatus(
        laterStatus,
        `${selectedThreads.length} trådar återupptogs från Senare.`,
        "success"
      );
      return;
    }

    if (normalizedCommand === "snooze") {
      state.later.bulkSelectionKeys = selectedThreads.map((thread) => thread.id);
      openLaterDialog();
      setAuxStatus(
        laterStatus,
        `${selectedThreads.length} trådar redo för nytt senareläggningsval.`,
        "loading"
      );
      return;
    }

    if (normalizedCommand === "history") {
      selectRuntimeThread(selectedThreads[0].id);
      setAppView("conversations");
      applyFocusSection("history");
      setAuxStatus(
        sentStatus,
        `Historiken öppnades för ${selectedThreads.length} markerade skickade trådar.`,
        "success"
      );
      return;
    }

    if (normalizedCommand === "handled") {
      selectedThreads.forEach((thread) => {
        patchStudioThreadAfterHandled(thread, "Markera klar");
      });
      getMailFeedRuntimeState(normalizedFeed).selectedKeys = [];
      setAuxStatus(
        sentStatus,
        `${selectedThreads.length} skickade trådar markerades som klara.`,
        "success"
      );
      return;
    }

    if (normalizedCommand === "delete") {
      stageMailFeedDelete(normalizedFeed, selectedThreads);
    }
  }

  function renderIntegrationsRuntimeStatus() {
    if (!integrationsStatus) return;
    const runtime = state.integrationsRuntime;
    if (runtime.loading) {
      setAuxStatus(integrationsStatus, "Läser integrationsstatus…", "loading");
      return;
    }
    if (runtime.authRequired) {
      setAuxStatus(
        integrationsStatus,
        "Inloggning krävs för att läsa och ändra integrationer.",
        "error"
      );
      return;
    }
    if (runtime.error) {
      setAuxStatus(integrationsStatus, runtime.error, "error");
      return;
    }
    if (runtime.partial) {
      setAuxStatus(
        integrationsStatus,
        "Vissa integrationskällor kunde inte uppdateras. Visar senaste kompletta livebild.",
        "success"
      );
      return;
    }
    setAuxStatus(integrationsStatus, "", "");
  }

  function renderIntegrations() {
    if (!integrationsGrid) return;
    const activeCategory = state.selectedIntegrationCategory;
    const visibleItems = INTEGRATION_CATALOG.filter(
      (item) => activeCategory === "all" || item.category === activeCategory
    );
    const connectedKeys = getIntegrationConnectedKeys();
    state.integrationsConnectedKeys = connectedKeys;
    integrationsGrid.innerHTML = "";

    visibleItems.forEach((item) => {
      const record = getIntegrationRuntimeRecord(item.key) || getFallbackIntegrationRecord(item);
      const connected = record.isConnected === true;
      const pending = normalizeKey(state.integrationsRuntime.pendingKey) === item.key;
      const tone = normalizeKey(record.statusTone);
      const toneClass =
        tone === "attention" ? " is-attention" : tone === "idle" && !connected ? " is-idle" : "";
      const updatedLabel = normalizeText(record.updatedAt)
        ? `Uppdaterad ${formatConversationTime(record.updatedAt)}`
        : connected
          ? "Live"
          : "Redo";
      const statusSummary = compactRuntimeCopy(record.statusSummary, item.copy, 130);
      const watchLabel = compactRuntimeCopy(
        record.watchLabel,
        connected ? "Verifiera guardrails och ägarskap efter anslutning." : "Koppla in utan att lämna CCO.",
        110
      );
      const toggleLabel = pending
        ? connected
          ? "Kopplar från…"
          : "Kopplar…"
        : connected
          ? "Koppla från"
          : "Koppla";
      const stateLabel = pending
        ? "Uppdaterar"
        : connected
          ? "Ansluten"
          : "Inte ansluten";

      const card = document.createElement("article");
      card.className = `integration-card${connected ? " is-connected" : ""}${toneClass}`;
      card.innerHTML =
        `<span class="integration-card-label">${escapeHtml(
          getIntegrationCategoryLabel(item.category)
        )}</span>` +
        `<div class="integration-card-head"><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(
          stateLabel
        )}</span></div>` +
        `<p>${escapeHtml(statusSummary)}</p>` +
        `<div class="integration-card-features"><span>${escapeHtml(item.owner)}</span><span>${escapeHtml(
          getIntegrationStatusToneLabel(record.statusTone, connected)
        )}</span><span>${escapeHtml(updatedLabel)}</span></div>` +
        `<div class="integration-card-foot"><span>${escapeHtml(
          watchLabel
        )}</span><button class="integration-connect-button${connected ? " is-connected" : ""}" type="button" data-integration-toggle="${escapeHtml(
          item.key
        )}"${pending ? " disabled" : ""}>${escapeHtml(toggleLabel)}</button></div>`;
      integrationsGrid.append(card);
    });

    integrationCategoryButtons.forEach((button) => {
      const isActive = normalizeKey(button.dataset.integrationCategory) === activeCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    integrationMetricNodes.forEach((node) => {
      const key = normalizeKey(node.dataset.integrationMetric);
      if (key === "connected") {
        node.textContent = String(connectedKeys.length);
      } else if (key === "available") {
        node.textContent = String(INTEGRATION_CATALOG.length - connectedKeys.length);
      } else if (key === "category") {
        node.textContent = getIntegrationCategoryLabel(activeCategory);
      }
    });

    renderIntegrationsRuntimeStatus();
  }

  function parseIntegrationActorProfile(payload) {
    const user = payload?.user && typeof payload.user === "object" ? payload.user : {};
    const fullName = asText(
      user.fullName ||
        user.displayName ||
        [user.firstName, user.lastName].map((value) => asText(value)).filter(Boolean).join(" ")
    );
    const email = asText(user.email || user.username || user.login).toLowerCase();
    if (!fullName || !email) return getFallbackIntegrationActorProfile();
    return {
      name: fullName,
      email,
    };
  }

  async function ensureIntegrationActorProfile() {
    if (state.integrationsRuntime.actorProfile?.name && state.integrationsRuntime.actorProfile?.email) {
      return state.integrationsRuntime.actorProfile;
    }
    try {
      const payload = await apiRequest("/api/v1/auth/me");
      const profile = parseIntegrationActorProfile(payload);
      state.integrationsRuntime.actorProfile = profile;
      return profile;
    } catch {
      const fallback = getFallbackIntegrationActorProfile();
      state.integrationsRuntime.actorProfile = fallback;
      return fallback;
    }
  }

  async function loadIntegrationsRuntime({ force = false } = {}) {
    const runtime = state.integrationsRuntime;
    if (runtime.loading && !force) return runtime.records;
    if (runtime.loaded && !force && !runtime.error && !runtime.authRequired) {
      renderIntegrations();
      return runtime.records;
    }

    runtime.loading = true;
    runtime.authRequired = false;
    runtime.error = "";
    runtime.partial = false;
    const requestId = Number(runtime.requestId || 0) + 1;
    runtime.requestId = requestId;
    renderIntegrations();

    try {
      const [statusResult, meResult] = await Promise.allSettled([
        apiRequest("/api/v1/cco/integrations/status"),
        apiRequest("/api/v1/auth/me"),
      ]);

      if (runtime.requestId !== requestId) {
        return runtime.records;
      }

      if (statusResult.status !== "fulfilled") {
        throw statusResult.reason;
      }

      runtime.records = asArray(statusResult.value?.integrations).map((record) => ({
        id: normalizeKey(record?.id),
        category: normalizeKey(record?.category) || "automation",
        isConnected: record?.isConnected !== false,
        statusTone: normalizeKey(record?.statusTone) || "idle",
        statusSummary: asText(record?.statusSummary),
        watchLabel: asText(record?.watchLabel),
        updatedAt: asText(record?.updatedAt || record?.configuredAt),
        configurable: record?.configurable !== false,
        docsAvailable: record?.docsAvailable !== false,
      }));
      runtime.loaded = true;
      runtime.lastLoadedAt = asText(statusResult.value?.generatedAt) || new Date().toISOString();
      state.integrationsConnectedKeys = runtime.records
        .filter((record) => record.isConnected)
        .map((record) => record.id);

      if (meResult.status === "fulfilled") {
        runtime.actorProfile = parseIntegrationActorProfile(meResult.value);
      } else if (!runtime.actorProfile) {
        runtime.actorProfile = getFallbackIntegrationActorProfile();
      }
    } catch (error) {
      if (runtime.requestId !== requestId) {
        return runtime.records;
      }
      if (isAuthFailure(error?.statusCode, error?.message)) {
        runtime.authRequired = true;
        runtime.error = "";
      } else {
        runtime.error =
          runtime.loaded && asArray(runtime.records).length
            ? "Kunde inte uppdatera integrationsstatus. Visar senaste livebild."
            : error?.message || "Kunde inte läsa integrationsstatus.";
      }
      runtime.partial = runtime.loaded && !runtime.authRequired;
    } finally {
      if (runtime.requestId === requestId) {
        runtime.loading = false;
        renderIntegrations();
      }
    }

    return runtime.records;
  }

  function renderMacrosRuntimeStatus() {
    if (!macrosStatus) return;
    if (state.macrosRuntime.loading) {
      setAuxStatus(macrosStatus, "Läser makrobibliotek…", "loading");
      return;
    }
    if (state.macrosRuntime.authRequired) {
      setAuxStatus(macrosStatus, "Inloggning krävs för makrobiblioteket.", "error");
      return;
    }
    if (state.macrosRuntime.error) {
      setAuxStatus(macrosStatus, state.macrosRuntime.error, "error");
      return;
    }
    setAuxStatus(macrosStatus, "", "");
  }

  function renderMacros() {
    if (!macrosList) return;
    macrosList.innerHTML = "";
    const macroCards = state.macros.length ? state.macros : getFallbackMacroCards();
    macroCards.forEach((macro) => {
      const isPending =
        normalizeKey(state.macrosRuntime.pendingMacroId) === normalizeKey(macro.id || macro.key);
      const pendingAction = normalizeKey(state.macrosRuntime.pendingAction);
      const runLabel = isPending && pendingAction === "run" ? "Kör…" : "Kör";
      const editLabel = isPending && pendingAction === "edit" ? "Sparar…" : "Redigera";
      const deleteLabel = isPending && pendingAction === "delete" ? "Tar bort…" : "Radera";
      const actionSummary = compactRuntimeCopy(
        macro.runCount
          ? `${macro.actionLabel}. Körd ${macro.runCount} gånger${macro.lastRunAt ? `, senast ${formatConversationTime(macro.lastRunAt)}` : ""}.`
          : `${macro.actionLabel}. Bygger vidare på samma shell och fokuslogik.`,
        "Makrot är redo i shellen.",
        120
      );
      const card = document.createElement("article");
      card.className = "macro-card";
      card.innerHTML =
        `<span class="macro-card-label">${macro.mode === "auto" ? "Auto" : "Manuell"}</span>` +
        `<div class="macro-card-head"><strong>${escapeHtml(macro.title)}</strong><span>${escapeHtml(
          `${macro.actionCount} steg`
        )}</span></div>` +
        `<p>${escapeHtml(macro.copy)}</p>` +
        `<div class="macro-card-actions-list"><span>${escapeHtml(
          humanizeCode(macro.tone, "Standard")
        )}</span><span>${escapeHtml(macro.actionLabel || "Makro")}</span>${
          macro.shortcut ? `<span>${escapeHtml(macro.shortcut)}</span>` : ""
        }</div>` +
        `<div class="macro-card-foot"><span>${escapeHtml(
          actionSummary
        )}</span><div class="aux-action-stack-inline"><button type="button" data-macro-action="run" data-macro-key="${escapeHtml(
          macro.id || macro.key
        )}"${isPending ? " disabled" : ""}>${escapeHtml(runLabel)}</button><button type="button" data-macro-action="open" data-macro-key="${escapeHtml(
          macro.id || macro.key
        )}">Öppna</button><button type="button" data-macro-action="edit" data-macro-key="${escapeHtml(
          macro.id || macro.key
        )}"${isPending ? " disabled" : ""}>${escapeHtml(editLabel)}</button><button type="button" data-macro-action="delete" data-macro-key="${escapeHtml(
          macro.id || macro.key
        )}"${isPending ? " disabled" : ""}>${escapeHtml(deleteLabel)}</button></div></div>`;
      macrosList.append(card);
    });

    macroMetricNodes.forEach((node) => {
      const key = normalizeKey(node.dataset.macroMetric);
      if (key === "count") {
        node.textContent = String(macroCards.length);
      } else if (key === "auto") {
        node.textContent = String(macroCards.filter((item) => item.mode === "auto").length);
      } else if (key === "actions") {
        node.textContent = String(
          macroCards.reduce((sum, macro) => sum + Number(macro.actionCount || 0), 0)
        );
      }
    });

    renderMacrosRuntimeStatus();
  }

  async function loadMacrosRuntime({ force = false } = {}) {
    if (state.macrosRuntime.loading && !force) return state.macros;
    if (state.macrosRuntime.loaded && !force && !state.macrosRuntime.error) {
      renderMacros();
      return state.macros;
    }

    state.macrosRuntime.loading = true;
    state.macrosRuntime.authRequired = false;
    state.macrosRuntime.error = "";
    renderMacros();
    try {
      const payload = await apiRequest("/api/v1/cco/macros");
      state.macros = asArray(payload?.macros).map((macro, index) => createMacroCardFromRecord(macro, index));
      state.macrosRuntime.loaded = true;
      state.macrosRuntime.lastLoadedAt = new Date().toISOString();
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.macrosRuntime.authRequired = true;
      } else {
        state.macrosRuntime.error = error?.message || "Kunde inte läsa makrobiblioteket.";
      }
      if (!state.macrosRuntime.loaded) {
        state.macros = getFallbackMacroCards();
      }
    } finally {
      state.macrosRuntime.loading = false;
      renderMacros();
      renderShowcase();
    }
    return state.macros;
  }

  function renderSettingsRuntimeStatus() {
    if (!settingsStatus) return;
    if (state.settingsRuntime.loading) {
      setAuxStatus(settingsStatus, "Läser inställningar…", "loading");
      return;
    }
    if (state.settingsRuntime.saving) {
      setAuxStatus(settingsStatus, "Sparar inställningar…", "loading");
      return;
    }
    if (state.settingsRuntime.authRequired) {
      setAuxStatus(settingsStatus, "Inloggning krävs för inställningarna.", "error");
      return;
    }
    if (state.settingsRuntime.error) {
      setAuxStatus(settingsStatus, state.settingsRuntime.error, "error");
      return;
    }
  }

  function renderSettings() {
    const themeLabels = {
      mist: "Ljust",
      ink: "Mörkt",
      auto: "Auto",
    };
    const densityLabels = {
      compact: "Kompakt",
      balanced: "Balanserad",
      airy: "Rymlig",
    };

    settingsChoiceButtons.forEach((button) => {
      const choice = normalizeKey(button.dataset.settingsChoice);
      const isActive =
        normalizeKey(button.dataset.settingsValue) ===
        normalizeKey(state.settingsRuntime.choices[choice]);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    settingsToggleInputs.forEach((input) => {
      input.checked = Boolean(
        state.settingsRuntime.toggles[normalizeKey(input.dataset.settingsToggle)]
      );
    });

    const activeGuardrails = [
      state.settingsRuntime.toggles.desktop_notifications,
      state.settingsRuntime.toggles.sla_alerts,
      state.settingsRuntime.toggles.smart_reply,
      state.settingsRuntime.toggles.team_mentions,
    ].filter(Boolean).length;

    if (settingsSummaryThemeValue) {
      settingsSummaryThemeValue.textContent = `${themeLabels[state.settingsRuntime.choices.theme] || "Ljust"} + ${densityLabels[state.settingsRuntime.choices.density] || "Kompakt"}`;
    }
    if (settingsSummaryThemeCopy) {
      settingsSummaryThemeCopy.textContent =
        state.settingsRuntime.choices.density === "airy"
          ? "Mer luft för fokuserat arbete"
          : state.settingsRuntime.choices.density === "balanced"
            ? "Balanserad rytm för hela teamet"
            : "Bäst för snabba arbetsköer";
    }
    if (settingsSummaryGuardValue) {
      settingsSummaryGuardValue.textContent =
        activeGuardrails >= 3 ? "SLA-varningar på" : activeGuardrails >= 1 ? "Guardrails delvis aktiva" : "Guardrails av";
    }
    if (settingsSummaryGuardCopy) {
      settingsSummaryGuardCopy.textContent = `${activeGuardrails} skydd aktiva i shellen`;
    }
    if (settingsSummaryTeamValue) {
      settingsSummaryTeamValue.textContent =
        state.settingsRuntime.toggles.compact_conversation && state.settingsRuntime.toggles.color_priorities
          ? "Delade vyer aktiva"
          : "Personlig vy aktiv";
    }
    if (settingsSummaryTeamCopy) {
      settingsSummaryTeamCopy.textContent =
        state.settingsRuntime.toggles.advanced_filters
          ? "Utökade filter syns i arbetsytan"
          : "Säkerställer samma rytm";
    }

    if (settingsProfileName) {
      settingsProfileName.textContent = state.settingsRuntime.profileName || "Ditt namn";
    }
    if (settingsProfileEmail) {
      settingsProfileEmail.textContent =
        state.settingsRuntime.profileEmail || "din.email@hairtp.com";
    }
    if (settingsProfileAvatar) {
      settingsProfileAvatar.textContent = initialsForName(
        state.settingsRuntime.profileName || state.settingsRuntime.profileEmail || "CCO"
      );
    }

    renderSettingsRuntimeStatus();
  }

  async function loadSettingsRuntime({ force = false } = {}) {
    if (state.settingsRuntime.loading && !force) return state.settingsRuntime;
    if (state.settingsRuntime.loaded && !force && !state.settingsRuntime.error) {
      renderSettings();
      return state.settingsRuntime;
    }

    state.settingsRuntime.loading = true;
    state.settingsRuntime.authRequired = false;
    state.settingsRuntime.error = "";
    renderSettings();
    try {
      const [settingsPayload, mePayload] = await Promise.allSettled([
        apiRequest("/api/v1/cco/settings"),
        apiRequest("/api/v1/auth/me"),
      ]);
      if (settingsPayload.status !== "fulfilled") {
        throw settingsPayload.reason;
      }
      applySettingsViewState(settingsPayload.value?.settings || {});
      if (mePayload.status === "fulfilled") {
        const profile = parseIntegrationActorProfile(mePayload.value);
        if (
          !normalizeText(state.settingsRuntime.profileName) ||
          state.settingsRuntime.profileName === "Ditt namn"
        ) {
          state.settingsRuntime.profileName = profile.name;
        }
        if (
          !normalizeText(state.settingsRuntime.profileEmail) ||
          state.settingsRuntime.profileEmail === "din.email@hairtp.com"
        ) {
          state.settingsRuntime.profileEmail = profile.email;
        }
      }
      state.settingsRuntime.loaded = true;
      state.settingsRuntime.lastLoadedAt = new Date().toISOString();
      setAuxStatus(settingsStatus, "", "");
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.settingsRuntime.authRequired = true;
      } else {
        state.settingsRuntime.error = error?.message || "Kunde inte läsa inställningarna.";
      }
    } finally {
      state.settingsRuntime.loading = false;
      renderSettings();
      renderShowcase();
    }
    return state.settingsRuntime;
  }

  function buildMacroRequestBody({ name, description, trigger, macro }) {
    return {
      name,
      description,
      trigger: normalizeKey(trigger) === "auto" ? "auto" : "manual",
      shortcut: macro?.shortcut || "",
      actions: Array.from({ length: Math.max(1, macro?.actionCount || 2) }, (_, index) => ({
        id: String(index + 1),
        type: index === 0 ? "template" : "assign",
        config: index === 0 ? { templateId: "custom-reply" } : { assignTo: "current-user" },
      })),
    };
  }

  async function submitMacroModal() {
    const mode = state.macroModal.mode === "edit" ? "edit" : "create";
    const macro =
      mode === "edit"
        ? state.macros.find(
            (item) =>
              normalizeKey(item.id || item.key) === normalizeKey(state.macroModal.macroId)
          ) || null
        : null;
    const name = normalizeText(macroModalNameInput?.value);
    const description = normalizeText(macroModalDescriptionInput?.value);
    const trigger = normalizeKey(macroModalTriggerSelect?.value) || "manual";
    if (!name) {
      setFeedback(macroModalFeedback, "error", "Makronamnet kan inte vara tomt.");
      return;
    }
    if (state.macrosRuntime.authRequired && !getAdminToken()) {
      window.location.assign(buildReauthUrl());
      return;
    }

    state.macrosRuntime.pendingAction = mode;
    state.macrosRuntime.pendingMacroId = macro?.id || macro?.key || "create";
    renderMacros();
    setFeedback(
      macroModalFeedback,
      "loading",
      mode === "edit" ? "Sparar makro…" : "Skapar makro…"
    );
    try {
      const payload =
        mode === "edit"
          ? await apiRequest(`/api/v1/cco/macros/${encodeURIComponent(macro.id)}`, {
              method: "PUT",
              headers: {
                "x-idempotency-key": createIdempotencyKey(
                  `major-arcana-macro-edit-${macro.id}`
                ),
              },
              body: buildMacroRequestBody({ name, description, trigger, macro }),
            })
          : await apiRequest("/api/v1/cco/macros", {
              method: "POST",
              headers: {
                "x-idempotency-key": createIdempotencyKey("major-arcana-macro-create"),
              },
              body: buildMacroRequestBody({ name, description, trigger }),
            });
      if (payload?.macro) {
        const nextMacro = createMacroCardFromRecord(payload.macro, 0);
        if (mode === "edit") {
          state.macros = state.macros.map((item) =>
            normalizeKey(item.id || item.key) === normalizeKey(macro.id || macro.key)
              ? nextMacro
              : item
          );
        } else {
          state.macros.unshift(nextMacro);
        }
      }
      renderShowcase();
      setMacroModalOpen(false);
      setAuxStatus(
        macrosStatus,
        mode === "edit"
          ? `Makrot "${name}" uppdaterades i nya CCO.`
          : `Makrot "${name}" skapades i nya CCO.`,
        "success"
      );
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.macrosRuntime.authRequired = true;
        renderMacros();
        window.location.assign(buildReauthUrl());
        return;
      }
      setFeedback(
        macroModalFeedback,
        "error",
        error?.message || "Kunde inte spara makrot."
      );
    } finally {
      state.macrosRuntime.pendingAction = "";
      state.macrosRuntime.pendingMacroId = "";
      renderMacros();
    }
  }

  async function submitSettingsProfileModal() {
    const nextName = normalizeText(settingsProfileModalNameInput?.value);
    const nextEmail = normalizeText(settingsProfileModalEmailInput?.value).toLowerCase();
    if (!nextName) {
      setFeedback(settingsProfileModalFeedback, "error", "Profilnamnet kan inte vara tomt.");
      return;
    }
    if (!nextEmail.includes("@")) {
      setFeedback(settingsProfileModalFeedback, "error", "Ange en giltig e-postadress.");
      return;
    }
    state.settingsRuntime.profileName = nextName;
    state.settingsRuntime.profileEmail = nextEmail;
    renderSettings();
    setFeedback(settingsProfileModalFeedback, "loading", "Sparar profil…");
    const saved = await saveSettingsRuntime("Profilen uppdaterades i nya CCO.");
    if (saved) {
      setSettingsProfileModalOpen(false);
    } else if (state.settingsRuntime.error) {
      setFeedback(settingsProfileModalFeedback, "error", state.settingsRuntime.error);
    }
  }

  async function submitConfirmDialog() {
    if (typeof state.confirmDialog.onConfirm !== "function") {
      setConfirmDialogOpen(false);
      return;
    }
    const idleLabel = asText(confirmSubmitButton?.textContent, "Bekräfta");
    setButtonBusy(confirmSubmitButton, true, idleLabel, "Arbetar…");
    try {
      await state.confirmDialog.onConfirm();
    } finally {
      setButtonBusy(confirmSubmitButton, false, idleLabel, "Arbetar…");
    }
  }

  function buildShowcaseFeatureRuntime(featureKey) {
    const feature =
      SHOWCASE_FEATURES[normalizeKey(featureKey)] || SHOWCASE_FEATURES.command_palette;
    const macroCount = state.macros.length || getFallbackMacroCards().length;
    const autoMacroCount = state.macros.filter((item) => item.mode === "auto").length;
    const connectedIntegrations = getIntegrationConnectedKeys().length;
    const activeThreadCount = getFilteredRuntimeThreads().length;
    const customerBatchCount = state.customerBatchSelection.length;
    const laterCount = getMailFeedItems("later").length;

    if (normalizeKey(featureKey) === "macros") {
      return {
        ...feature,
        outcome: `${macroCount} makron redo, varav ${autoMacroCount} auto-körs i nya CCO.`,
        detail:
          macroCount > 0
            ? `Makrobiblioteket använder nu riktig backendpersistens och kan köras eller öppnas från shellen.`
            : "Makrobiblioteket är redo att fyllas på från nya CCO.",
        effectCopy: `${macroCount} makron i biblioteket`,
        nextCopy: "Öppna makron för att köra, redigera eller bygga vidare på dem i automation.",
      };
    }

    if (normalizeKey(featureKey) === "snooze") {
      return {
        ...feature,
        outcome: `${laterCount} trådar ligger just nu i Senare-flödet.`,
        detail: `Later-vyn i nya CCO använder nu livedata och samma mailboxscope som arbetsytan.`,
        effectCopy: `${laterCount} trådar redo att återuppta`,
      };
    }

    if (normalizeKey(featureKey) === "customer_journey") {
      return {
        ...feature,
        outcome: `${customerBatchCount} profiler är markerade i kundytan just nu.`,
        detail: `Kundytan i nya CCO kan nu driva merge, split och primary email i samma shell.`,
        effectCopy: `${customerBatchCount} profiler i batch-läge`,
      };
    }

    if (normalizeKey(featureKey) === "saved_views") {
      return {
        ...feature,
        outcome: `${activeThreadCount} live-trådar följer nu arbetsköns filter- och lane-scope.`,
        detail: `Queue, mailbox och owner-filter är nu levande i nya CCO och showcase hoppar direkt till den riktiga arbetsytan.`,
        effectCopy: `${activeThreadCount} trådar i aktivt scope`,
      };
    }

    if (normalizeKey(featureKey) === "ai_assistant") {
      return {
        ...feature,
        outcome: `Beslutsstödet använder nu live runtime, historik och kundintelligens i samma shell.`,
        detail: `Showcase pekar nu vidare till riktiga vyer i stället för en fristående demo.`,
        effectCopy: `${connectedIntegrations} integrationer stödjer beslutsflödet`,
      };
    }

    return feature;
  }

  function renderShowcase() {
    const feature = buildShowcaseFeatureRuntime(state.selectedShowcaseFeature);
    showcaseFeatureButtons.forEach((button) => {
      const isActive =
        normalizeKey(button.dataset.showcaseFeature) === state.selectedShowcaseFeature;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    if (showcaseFocus) showcaseFocus.textContent = feature.focus;
    if (showcaseTitleText) showcaseTitleText.textContent = feature.title;
    if (showcaseCopy) showcaseCopy.textContent = feature.copy;
    if (showcaseOutcome) showcaseOutcome.textContent = feature.outcome;
    if (showcaseDetail) showcaseDetail.textContent = feature.detail;
    if (showcaseEffectLabel) showcaseEffectLabel.textContent = feature.effectLabel;
    if (showcaseEffectTitle) showcaseEffectTitle.textContent = feature.effectTitle;
    if (showcaseEffectCopy) showcaseEffectCopy.textContent = feature.effectCopy;
    if (showcaseNextTitle) showcaseNextTitle.textContent = feature.nextTitle;
    if (showcaseNextCopy) showcaseNextCopy.textContent = feature.nextCopy;
    if (showcaseActionPrimary) {
      showcaseActionPrimary.textContent = feature.primaryAction.label;
      showcaseActionPrimary.dataset.showcaseJump = feature.primaryAction.jump;
      showcaseActionPrimary.hidden = false;
    }
    if (showcaseActionSecondary) {
      showcaseActionSecondary.textContent = feature.secondaryAction.label;
      showcaseActionSecondary.dataset.showcaseJump = feature.secondaryAction.jump;
      showcaseActionSecondary.hidden = false;
    }
  }

  function setSelectedShowcaseFeature(featureKey) {
    state.selectedShowcaseFeature = normalizeKey(featureKey) || "command_palette";
    renderShowcase();
  }

  function setAutomationCollaborationOpen(open) {
    state.automationCollaborationOpen = Boolean(open);
    if (automationCollaborationPanel) {
      automationCollaborationPanel.hidden = !state.automationCollaborationOpen;
    }
    automationCollaborationToggleButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        state.automationCollaborationOpen ? "true" : "false"
      );
    });
  }

  function getSelectedTemplateConfig() {
    return (
      AUTOMATION_TEMPLATE_CONFIGS[state.selectedAutomationTemplate] ||
      AUTOMATION_TEMPLATE_CONFIGS.churn_guard
    );
  }

  function getAutomationTemplateRecordName(templateKey = state.selectedAutomationTemplate) {
    const normalizedKey = normalizeKey(templateKey) || "churn_guard";
    const template =
      AUTOMATION_TEMPLATE_CONFIGS[normalizedKey] || AUTOMATION_TEMPLATE_CONFIGS.churn_guard;
    return `CCO Automation · ${template.flowTitle} · ${normalizedKey}`;
  }

  function getAutomationVersions(templateKey = state.selectedAutomationTemplate) {
    const normalizedKey = normalizeKey(templateKey) || "churn_guard";
    return asArray(state.automationRuntime.versionsByKey[normalizedKey]);
  }

  function getAutomationTemplateRecord(templateKey = state.selectedAutomationTemplate) {
    const normalizedKey = normalizeKey(templateKey) || "churn_guard";
    return state.automationRuntime.templateRecordsByKey[normalizedKey] || null;
  }

  function buildAutomationTemplateContent(templateKey = state.selectedAutomationTemplate) {
    const normalizedKey = normalizeKey(templateKey) || "churn_guard";
    const template =
      AUTOMATION_TEMPLATE_CONFIGS[normalizedKey] || AUTOMATION_TEMPLATE_CONFIGS.churn_guard;
    const nodeLines = Object.entries(template.nodes || {}).map(([nodeKey, definition], index) => {
      const title = normalizeText(definition?.title) || `Steg ${index + 1}`;
      const lines = asArray(definition?.lines)
        .map((line) => `  - ${normalizeText(line)}`)
        .join("\n");
      return `${index + 1}. ${normalizeText(nodeKey) || `steg_${index + 1}`} · ${title}${
        lines ? `\n${lines}` : ""
      }`;
    });
    const appliedSuggestions = asArray(state.automationRuntime.appliedSuggestionKeys);
    const dismissedSuggestions = asArray(state.automationRuntime.dismissedSuggestionKeys);
    const testingScenario = normalizeKey(state.automationRuntime.testingScenario) || "baseline";

    return [
      `Automation key: ${normalizedKey}`,
      `Flow title: ${template.flowTitle}`,
      `Library: ${state.selectedAutomationLibrary}`,
      `Focused node: ${state.selectedAutomationNode}`,
      `Focused section: ${state.selectedAutomationSection}`,
      `Canvas scale: ${state.automationScale}%`,
      `Autopilot: ${state.automationAutopilotEnabled ? "enabled" : "paused"}`,
      `Testing scenario: ${testingScenario}`,
      "",
      "Nodes:",
      nodeLines.join("\n"),
      "",
      `Applied suggestions: ${appliedSuggestions.join(", ") || "none"}`,
      `Dismissed suggestions: ${dismissedSuggestions.join(", ") || "none"}`,
    ].join("\n");
  }

  function buildAutomationInstruction(templateKey = state.selectedAutomationTemplate, actionKey = "save") {
    const template =
      AUTOMATION_TEMPLATE_CONFIGS[normalizeKey(templateKey)] || AUTOMATION_TEMPLATE_CONFIGS.churn_guard;
    const actionLabel =
      normalizeKey(actionKey) === "run"
        ? "Utvärdera automationen mot live risk/policy."
        : "Spara aktuell builder-snapshot som arbetsutkast.";
    return `${actionLabel} Flöde: ${template.flowTitle}. Fokussteg: ${state.selectedAutomationNode}.`;
  }

  function getAutomationDecisionTone(decision) {
    const normalizedDecision = normalizeKey(decision);
    if (normalizedDecision === "blocked" || normalizedDecision === "critical_escalate") {
      return "error";
    }
    if (normalizedDecision === "review_required") {
      return "loading";
    }
    return "success";
  }

  function getAutomationDecisionLabel(decision) {
    const normalizedDecision = normalizeKey(decision);
    if (normalizedDecision === "blocked") return "blockerad";
    if (normalizedDecision === "critical_escalate") return "eskalerad";
    if (normalizedDecision === "review_required") return "kräver granskning";
    if (normalizedDecision === "allow") return "godkänd";
    return "okänd";
  }

  function buildAutomationTestingStateFromEvaluation(version, variableValidation) {
    const decision = normalizeKey(version?.risk?.decision) || "allow";
    const variableCount = asArray(variableValidation?.variablesUsed || version?.variablesUsed).length;
    const revision = Number(version?.revision || 1);
    const timestamp = formatListTime(version?.updatedAt || version?.createdAt) || "Nu";
    const reasonCodes = asArray(version?.risk?.reasonCodes).slice(0, 2);
    const items = [
      `Beslut: ${getAutomationDecisionLabel(decision)}.`,
      `Revision ${revision} är nu sparad i templatesystemet.`,
      variableCount > 0
        ? `${variableCount} variabler hittades i snapshoten.`
        : "Inga templatevariabler hittades i snapshoten.",
    ];
    if (reasonCodes.length) {
      items.push(`Risksignaler: ${reasonCodes.join(", ")}.`);
    }
    return {
      title:
        decision === "allow"
          ? "Validering godkänd"
          : decision === "review_required"
            ? "Manuell granskning krävs"
            : "Risk / policy blockerade körningen",
      items,
      log: [
        {
          time: timestamp,
          tone:
            decision === "allow" ? "ok" : decision === "review_required" ? "wait" : "error",
          title: `Liveutvärdering: ${getAutomationDecisionLabel(decision)}`,
          copy: compactRuntimeCopy(version?.title || version?.content, "Automationen utvärderades live.", 140),
        },
      ],
    };
  }

  async function listAutomationTemplates() {
    const payload = await apiRequest("/api/v1/templates?category=INTERNAL");
    return asArray(payload?.templates);
  }

  function syncAutomationTemplateRecordCache(templates) {
    const list = asArray(templates);
    Object.keys(AUTOMATION_TEMPLATE_CONFIGS).forEach((templateKey) => {
      const expectedName = getAutomationTemplateRecordName(templateKey);
      const record =
        list.find((item) => normalizeText(item?.name) === expectedName) || null;
      if (record) {
        state.automationRuntime.templateRecordsByKey[templateKey] = record;
      }
    });
  }

  async function ensureAutomationTemplateRecord(templateKey = state.selectedAutomationTemplate, options = {}) {
    const normalizedKey = normalizeKey(templateKey) || "churn_guard";
    const createIfMissing = options.createIfMissing === true;
    const cached = getAutomationTemplateRecord(normalizedKey);
    if (cached) {
      return cached;
    }

    const templates = await listAutomationTemplates();
    syncAutomationTemplateRecordCache(templates);
    const existing = getAutomationTemplateRecord(normalizedKey);
    if (existing || !createIfMissing) {
      return existing || null;
    }

    const created = await apiRequest("/api/v1/templates", {
      method: "POST",
      headers: {
        "x-idempotency-key": createIdempotencyKey(`automation-template-${normalizedKey}`),
      },
      body: {
        category: "INTERNAL",
        name: getAutomationTemplateRecordName(normalizedKey),
        channel: "internal",
        locale: "sv-SE",
      },
    });
    const template = created?.template || null;
    if (template) {
      state.automationRuntime.templateRecordsByKey[normalizedKey] = template;
    }
    return template;
  }

  function renderAutomationVersions() {
    const templateKey = normalizeKey(state.selectedAutomationTemplate) || "churn_guard";
    const versions = getAutomationVersions(templateKey).slice(0, automationVersionCards.length);
    const selectedVersionId = normalizeKey(state.selectedAutomationVersion);
    const authRequired = state.automationRuntime.authRequired;
    const syncError = normalizeText(state.automationRuntime.error);
    const activeVersionId = normalizeKey(state.automationRuntime.activeVersionIdByKey[templateKey]);

    automationVersionCards.forEach((card, index) => {
      const detail = automationVersionDetails[index];
      const version = versions[index] || null;

      if (!version) {
        if (index > 0) {
          card.hidden = true;
          if (detail) detail.hidden = true;
          return;
        }

        card.hidden = false;
        card.dataset.automationVersion = "placeholder";
        card.setAttribute("aria-pressed", "true");
        card.classList.add("is-selected");

        const badge = card.querySelector(".automation-version-badge");
        const flag = card.querySelector(".automation-version-flag");
        const time = card.querySelector("time");
        const points = Array.from(card.querySelectorAll(".automation-version-points li"));
        const buttons = Array.from(card.querySelectorAll("[data-automation-version-action]"));
        if (badge) badge.textContent = authRequired ? "Logga in" : "Ingen liveversion";
        if (flag) {
          flag.textContent = authRequired ? "Inloggning krävs" : "Osparat ännu";
          flag.hidden = false;
        }
        if (time) {
          time.textContent = authRequired
            ? "Öppna admin och logga in igen"
            : syncError || "Spara buildern för att skapa första liveversionen.";
        }
        points.forEach((point, pointIndex) => {
          point.textContent =
            pointIndex === 0
              ? authRequired
                ? "Templatesystemet kräver giltig admin-session."
                : "Ingen sparad draft eller aktiv version finns ännu."
              : pointIndex === 1
                ? "Kör live test för att få risk- och policybeslut."
                : "Återställning blir tillgänglig när första liveversionen finns.";
        });
        buttons.forEach((button) => {
          button.disabled = true;
        });

        if (detail) {
          detail.hidden = false;
          detail.dataset.automationVersionDetail = "placeholder";
          detail.classList.add("is-active");
          detail.setAttribute("aria-hidden", "false");
          const label = detail.querySelector(".automation-version-diff span");
          const pre = detail.querySelector(".automation-version-diff pre");
          if (label) {
            label.textContent = authRequired
              ? "Åtgärd krävs"
              : "Nästa steg";
          }
          if (pre) {
            pre.textContent = authRequired
              ? "Logga in igen i admin för att läsa liveversioner och revisionsdata."
              : "Spara automationen för att skapa en liveversion i templatesystemet. Kör sedan test för att få ett riktigt risk- och policybeslut.";
          }
          const factCards = Array.from(detail.querySelectorAll(".automation-version-fact-card"));
          factCards.forEach((factCard, factIndex) => {
            const strong = factCard.querySelector("strong");
            const paragraph = factCard.querySelector("p");
            if (!strong || !paragraph) return;
            if (factIndex === 0) {
              strong.textContent = authRequired ? "Auth" : "Ej sparad";
              paragraph.textContent = authRequired
                ? "Live templatesystemet kräver giltig session."
                : "Ingen riskbedömning finns förrän första liveutkastet är skapat.";
            } else if (factIndex === 1) {
              strong.textContent = authRequired ? "-" : "Spara först";
              paragraph.textContent = "Versionsspåret blir live när första draften skapats.";
            } else {
              strong.textContent = authRequired ? "-" : "Nya CCO";
              paragraph.textContent = "Buildern använder nu Major Arcana-shellen som bas.";
            }
          });
        }
        return;
      }

      const versionLabel = `v${Number(version.versionNo || index + 1)}`;
      const isSelected =
        selectedVersionId === normalizeKey(version.id) ||
        (!selectedVersionId && index === 0);
      const isActive = normalizeKey(version.state) === "active";
      const badge = card.querySelector(".automation-version-badge");
      const flag = card.querySelector(".automation-version-flag");
      const time = card.querySelector("time");
      const points = Array.from(card.querySelectorAll(".automation-version-points li"));
      const buttons = Array.from(card.querySelectorAll("[data-automation-version-action]"));
      const compareTarget = versions[index + 1] || null;
      const detailLabel = detail?.querySelector(".automation-version-diff span");
      const detailPre = detail?.querySelector(".automation-version-diff pre");
      const factCards = detail ? Array.from(detail.querySelectorAll(".automation-version-fact-card")) : [];
      const noteBlocks = detail ? Array.from(detail.querySelectorAll(".automation-version-notes div")) : [];

      card.hidden = false;
      card.dataset.automationVersion = version.id;
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-pressed", isSelected ? "true" : "false");

      if (badge) {
        badge.textContent = versionLabel;
        badge.classList.toggle("automation-version-badge-current", isActive);
      }
      if (flag) {
        flag.hidden = false;
        flag.textContent =
          isActive
            ? "Aktiv"
            : normalizeKey(version.state) === "draft"
              ? "Draft"
              : "Arkiverad";
      }
      if (time) {
        time.textContent = `${formatRuntimeDateTime(version.updatedAt || version.createdAt, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })} · rev ${Number(version.revision || 1)}`;
      }
      points.forEach((point, pointIndex) => {
        const pointValue =
          pointIndex === 0
            ? `${normalizeKey(version.state) === "draft" ? "Utkast" : "Release"} sparad i templatesystemet`
            : pointIndex === 1
              ? `Riskbeslut: ${getAutomationDecisionLabel(version?.risk?.decision)}`
              : `${asArray(version.variablesUsed).length} variabler upptäckta i snapshoten`;
        point.textContent = pointValue;
      });
      buttons.forEach((button) => {
        button.disabled = false;
        if (normalizeKey(button.dataset.automationVersionAction) === "restore") {
          button.textContent = isActive ? "Aktiv nu" : "Aktivera";
          button.disabled = isActive;
        }
      });

      if (!detail) return;
      detail.hidden = !isSelected;
      detail.dataset.automationVersionDetail = version.id;
      detail.classList.toggle("is-active", isSelected);
      detail.setAttribute("aria-hidden", isSelected ? "false" : "true");

      if (detailLabel) {
        detailLabel.textContent = compareTarget
          ? `Versioninnehåll: ${versionLabel} ↔ v${Number(compareTarget.versionNo || 0)}`
          : `Versioninnehåll: ${versionLabel}`;
      }
      if (detailPre) {
        detailPre.textContent = compactRuntimeCopy(
          version.content,
          "Ingen innehållssammanfattning tillgänglig för liveversionen.",
          560
        );
      }
      factCards.forEach((factCard, factIndex) => {
        const strong = factCard.querySelector("strong");
        const paragraph = factCard.querySelector("p");
        if (!strong || !paragraph) return;
        if (factIndex === 0) {
          strong.textContent =
            normalizeKey(version?.risk?.decision) === "allow"
              ? "Låg"
              : normalizeKey(version?.risk?.decision) === "review_required"
                ? "Medel"
                : normalizeKey(version?.risk?.decision) === "blocked"
                  ? "Hög"
                  : "Okänd";
          paragraph.textContent = `Riskbeslut: ${getAutomationDecisionLabel(
            version?.risk?.decision
          )}.`;
        } else if (factIndex === 1) {
          strong.textContent = isActive ? "Aktiv live" : normalizeText(version.state) || "Draft";
          paragraph.textContent = `Revision ${Number(version.revision || 1)} · senast uppdaterad ${formatListTime(
            version.updatedAt || version.createdAt
          )}.`;
        } else {
          strong.textContent =
            normalizeText(version.updatedBy || version.createdBy) ||
            (activeVersionId === normalizeKey(version.id) ? "Aktiv owner" : "Nya CCO");
          paragraph.textContent = activeVersionId === normalizeKey(version.id)
            ? "Detta är den nu aktiva liveversionen i templatesystemet."
            : "Versionskortet läser nu live från templatesystemet.";
        }
      });
      noteBlocks.forEach((block, noteIndex) => {
        const paragraph = block.querySelector("p");
        if (!paragraph) return;
        if (noteIndex === 0) {
          paragraph.textContent = `Versionsspåret har ${Number(version.revision || 1)} revisioner i livehistoriken.`;
        } else if (noteIndex === 1) {
          paragraph.textContent = `Påverkade delar: ${compactRuntimeCopy(
            version.title || version.content,
            "Liveutkast utan ytterligare metadata.",
            140
          )}`;
        } else {
          paragraph.textContent = isActive
            ? "Bevaka beslut, revisionsspår och nästa liveutvärdering efter ändring."
            : "Aktivera versionen för att göra den till livebas i templatesystemet.";
        }
      });
    });
  }

  async function loadAutomationVersions(templateKey = state.selectedAutomationTemplate, options = {}) {
    const normalizedKey = normalizeKey(templateKey) || "churn_guard";
    const createIfMissing = options.createIfMissing === true;
    state.automationRuntime.loading = true;
    state.automationRuntime.error = "";
    state.automationRuntime.authRequired = false;
    state.automationRuntime.syncingTemplateKey = normalizedKey;

    try {
      const templateRecord = await ensureAutomationTemplateRecord(normalizedKey, { createIfMissing });
      if (!templateRecord) {
        state.automationRuntime.versionsByKey[normalizedKey] = [];
        state.automationRuntime.activeVersionIdByKey[normalizedKey] = "";
        if (normalizedKey === state.selectedAutomationTemplate) {
          renderAutomationVersions();
        }
        return [];
      }

      const payload = await apiRequest(
        `/api/v1/templates/${encodeURIComponent(templateRecord.id)}/versions`
      );
      const versions = asArray(payload?.versions);
      state.automationRuntime.templateRecordsByKey[normalizedKey] = templateRecord;
      state.automationRuntime.versionsByKey[normalizedKey] = versions;
      const activeVersion =
        versions.find((version) => normalizeKey(version.state) === "active") ||
        versions[0] ||
        null;
      state.automationRuntime.activeVersionIdByKey[normalizedKey] = activeVersion?.id || "";
      if (normalizedKey === state.selectedAutomationTemplate) {
        const selectedStillExists = versions.some(
          (version) => normalizeKey(version.id) === normalizeKey(state.selectedAutomationVersion)
        );
        if (versions.length && !selectedStillExists) {
          state.selectedAutomationVersion = activeVersion?.id || versions[0].id;
        } else if (!versions.length) {
          state.selectedAutomationVersion = "placeholder";
        }
        renderAutomationVersions();
      }
      return versions;
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.automationRuntime.authRequired = true;
      } else {
        state.automationRuntime.error = error?.message || "Kunde inte läsa automationens liveversioner.";
      }
      state.automationRuntime.versionsByKey[normalizedKey] = [];
      state.automationRuntime.activeVersionIdByKey[normalizedKey] = "";
      if (normalizedKey === state.selectedAutomationTemplate) {
        renderAutomationVersions();
      }
      throw error;
    } finally {
      state.automationRuntime.loading = false;
      state.automationRuntime.syncingTemplateKey = "";
    }
  }

  async function saveAutomationDraft(templateKey = state.selectedAutomationTemplate) {
    const normalizedKey = normalizeKey(templateKey) || "churn_guard";
    const templateRecord = await ensureAutomationTemplateRecord(normalizedKey, { createIfMissing: true });
    const currentVersions = await loadAutomationVersions(normalizedKey, { createIfMissing: true }).catch(
      () => getAutomationVersions(normalizedKey)
    );
    const existingDraft =
      asArray(currentVersions).find((version) => normalizeKey(version.state) === "draft") || null;
    const requestBody = {
      title: getSelectedTemplateConfig().flowTitle,
      content: buildAutomationTemplateContent(normalizedKey),
      source: "manual",
      variablesUsed: [],
      instruction: buildAutomationInstruction(normalizedKey, "save"),
    };

    if (!templateRecord) {
      throw new Error("Ingen automationmall kunde skapas för livepersistens.");
    }

    let payload;
    if (existingDraft) {
      payload = await apiRequest(
        `/api/v1/templates/${encodeURIComponent(templateRecord.id)}/versions/${encodeURIComponent(
          existingDraft.id
        )}`,
        {
          method: "PATCH",
          headers: {
            "if-match": `W/\"r${Number(existingDraft.revision || 1)}\"`,
            "x-idempotency-key": createIdempotencyKey(`automation-save-${normalizedKey}`),
          },
          body: {
            ...requestBody,
            expectedRevision: Number(existingDraft.revision || 1),
          },
        }
      );
    } else {
      payload = await apiRequest(
        `/api/v1/templates/${encodeURIComponent(templateRecord.id)}/drafts`,
        {
          method: "POST",
          headers: {
            "x-idempotency-key": createIdempotencyKey(`automation-draft-${normalizedKey}`),
          },
          body: requestBody,
        }
      );
    }

    const version = payload?.version || null;
    await loadAutomationVersions(normalizedKey, { createIfMissing: true });
    if (version?.id) {
      setSelectedAutomationVersion(version.id);
    }
    return {
      templateRecord,
      version: version || null,
    };
  }

  function renderCustomerMetrics(visibleKeys) {
    const visible = Array.isArray(visibleKeys) ? visibleKeys : [];
    const total = visible.length;
    const vip = visible.filter((key) => getCustomerDirectoryMap()[key]?.vip).length;
    const emails = visible.reduce(
      (sum, key) => sum + Number(getCustomerDirectoryMap()[key]?.emailCoverage || 0),
      0
    );
    const totalValue = visible.reduce(
      (sum, key) => sum + Number(getCustomerDirectoryMap()[key]?.customerValue || 0),
      0
    );
    const suggestionGroups = buildCustomerSuggestionGroups();
    state.customerRuntime.duplicateMetric = getActiveCustomerSuggestionCount(suggestionGroups);

    customerMetricCards.forEach((card) => {
      const key = normalizeKey(card.dataset.customerMetric);
      const valueNode = card.querySelector("strong");
      if (!valueNode) return;
      if (key === "total") valueNode.textContent = String(total);
      if (key === "vip") valueNode.textContent = String(vip);
      if (key === "emails") valueNode.textContent = String(emails);
      if (key === "value") valueNode.textContent = formatCompactKr(totalValue);
      if (key === "duplicates") {
        valueNode.textContent = String(Math.max(0, state.customerRuntime.duplicateMetric));
      }
    });
  }

  function syncCustomerProfileBadge(root, count) {
    if (!root) return;
    let badge = root.querySelector(".customer-record-badge, .customers-rail-card-head span");
    if (!badge && count > 1) {
      badge = document.createElement("span");
      badge.className = root.classList.contains("customer-record-head")
        ? "customer-record-badge"
        : "";
      root.appendChild(badge);
    }
    if (!badge) return;
    if (count > 1) {
      badge.hidden = false;
      badge.textContent = `${count} profiler`;
    } else {
      badge.hidden = true;
    }
  }

  function renderCustomerProfileCounts() {
    customerRows.forEach((row) => {
      const key = normalizeKey(row.dataset.customerRow);
      const count = Number(
        state.customerRuntime.profileCounts[key] ||
          getCustomerDirectoryMap()[key]?.profileCount ||
          1
      );
      syncCustomerProfileBadge(row.querySelector(".customer-record-head"), count);
    });

    customerDetailCards.forEach((card) => {
      const key = normalizeKey(card.dataset.customerDetail);
      const count = Number(
        state.customerRuntime.profileCounts[key] ||
          getCustomerDirectoryMap()[key]?.profileCount ||
          1
      );
      syncCustomerProfileBadge(card.querySelector(".customers-rail-card-head"), count);
    });
  }

  function getVisibleCustomerKeys() {
    const query = normalizeKey(state.customerSearch);
    const filter = normalizeKey(state.customerFilter);
    const directory = getCustomerDirectoryMap();
    const details = getCustomerDetailsMap();

    return getVisibleCustomerPoolKeys().filter((key) => {
      const profile = directory[key] || {};
      const detail = details[key] || {};
      const searchHaystack = [
        profile?.name,
        asArray(detail?.emails).join(" "),
        detail?.phone,
        asArray(detail?.mailboxes).join(" "),
      ]
        .map(normalizeKey)
        .join(" ");
      const matchesSearch = !query || searchHaystack.includes(query);
      const matchesFilter =
        filter === "vip-kunder"
          ? Boolean(profile?.vip)
          : filter === "möjliga dubbletter"
            ? Boolean(profile?.duplicateCandidate) ||
              Number(state.customerRuntime.profileCounts[key] || profile?.profileCount || 1) > 1
            : true;
      return matchesSearch && matchesFilter;
    });
  }

  function renderCustomerRows(visibleKeys) {
    if (!customerList) return;
    customerList.innerHTML = visibleKeys
      .map((key) => {
        const record = getCustomerRecord(key);
        return `
          <button class="customer-record${record.key === state.selectedCustomerIdentity ? " is-selected" : ""}" type="button" data-customer-row="${escapeAttribute(record.key)}" aria-pressed="${record.key === state.selectedCustomerIdentity ? "true" : "false"}">
            <span class="customer-record-check${getBatchSelectionKeys().includes(record.key) ? " is-batch-selected" : ""}" aria-hidden="true"></span>
            <div class="customer-record-main">
              <div class="customer-record-head">
                <h3>${escapeHtml(record.name)}</h3>
                ${record.vip ? '<span class="customer-record-star" aria-hidden="true">★</span>' : ""}
                ${record.profileCount > 1 ? `<span class="customer-record-badge">${escapeHtml(`${record.profileCount} profiler`)}</span>` : ""}
              </div>
              <div class="customer-record-meta">
                <span>${escapeHtml(record.primaryEmail || "Saknar e-post")}</span>
                ${record.otherEmailCount > 0 ? `<span class="customer-record-meta-rose">+${record.otherEmailCount} andra e-postadresser</span>` : ""}
              </div>
              <div class="customer-record-foot">
                <span>${escapeHtml(`${record.totalConversations} konv.`)}</span>
                <span>${escapeHtml(`${record.totalMessages} medd.`)}</span>
                <strong>${escapeHtml(formatCompactKr(record.customerValue))}</strong>
              </div>
            </div>
            <div class="customer-record-side">
              <span>${escapeHtml(record.phone || "Ingen telefon")}</span>
            </div>
          </button>
        `;
      })
      .join("");
  }

  function renderCustomerDetailCards() {
    if (!customerDetailStack) return;
    customerDetailStack.innerHTML = getVisibleCustomerPoolKeys()
      .map((key) => {
        const record = getCustomerRecord(key);
        const active = record.key === state.selectedCustomerIdentity;
        return `
          <article class="customers-rail-card${active ? " is-active" : ""}" data-customer-detail="${escapeAttribute(record.key)}"${active ? "" : " hidden"}>
            <div class="customers-rail-card-head">
              <h3>${escapeHtml(record.name)}</h3>
              <span>${escapeHtml(`${record.profileCount} ${record.profileCount === 1 ? "profil" : "profiler"}`)}</span>
            </div>
            <p>${escapeHtml(record.primaryEmail || "Ingen e-post")}${record.otherEmailCount > 0 ? ` <strong>+${escapeHtml(String(record.otherEmailCount))} till</strong>` : ""}</p>
            <p>${escapeHtml(record.phone || "Ingen telefon")}</p>
            <div class="customers-rail-card-foot">
              <span>${escapeHtml(`${record.totalConversations} konv.`)}</span>
              <strong>${escapeHtml(formatCompactKr(record.customerValue))}</strong>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderCustomerMergeGroups() {
    if (!customerMergeGroupsHost) return;
    const suggestionGroups = buildCustomerSuggestionGroups();
    state.customerRuntime.duplicateMetric = getActiveCustomerSuggestionCount(suggestionGroups);
    customerMergeGroupsHost.innerHTML = getVisibleCustomerPoolKeys()
      .map((key) => {
        const suggestions = asArray(suggestionGroups[key]).filter((item) => {
          const suggestionId = buildCustomerSuggestionPairId(item.primaryKey, item.secondaryKey);
          return (
            !state.customerRuntime.dismissedSuggestionIds.includes(suggestionId) &&
            !state.customerRuntime.acceptedSuggestionIds.includes(suggestionId)
          );
        });

        const content = suggestions.length
          ? suggestions
              .map(
                (item) => `
                  <article class="customers-merge-card">
                    <div class="customers-merge-top">
                      <strong>${escapeHtml(getCustomerRecord(item.primaryKey).name)}</strong>
                      <span>${escapeHtml(item.name)}</span>
                      <b>${escapeHtml(`${item.confidence}%`)}</b>
                    </div>
                    <ul>
                      ${item.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
                    </ul>
                    <div class="customers-merge-actions">
                      <button class="customers-merge-accept" type="button" data-customer-merge-action="accept" data-customer-merge-primary-key="${escapeAttribute(item.primaryKey)}" data-customer-merge-secondary-key="${escapeAttribute(item.secondaryKey)}">Slå ihop</button>
                      <button class="customers-merge-dismiss" type="button" data-customer-merge-action="dismiss" data-customer-merge-primary-key="${escapeAttribute(item.primaryKey)}" data-customer-merge-secondary-key="${escapeAttribute(item.secondaryKey)}">Inte samma</button>
                    </div>
                  </article>
                `
              )
              .join("")
          : `
              <article class="customers-merge-card customers-merge-card-muted">
                <div class="customers-merge-empty">
                  <strong>Inga aktiva dubblettförslag</strong>
                  <p>Den valda kunden har inga öppna identitetsförslag kvar just nu.</p>
                </div>
              </article>
            `;

        return `<div class="customers-merge-group${key === state.selectedCustomerIdentity ? " is-active" : ""}" data-customer-merge-group="${escapeAttribute(key)}"${key === state.selectedCustomerIdentity ? "" : " hidden"}>${content}</div>`;
      })
      .join("");
    refreshCustomerNodeRefs();
  }

  function applyCustomerFilters() {
    ensureCustomerRuntimeProfilesFromLive();
    const visibleKeys = getVisibleCustomerKeys();
    renderCustomerRows(visibleKeys);
    renderCustomerDetailCards();
    refreshCustomerNodeRefs();
    renderCustomerProfileCounts();
    renderCustomerMetrics(visibleKeys);
    renderCustomerMergeGroups();
    renderCustomerBatchSelection();

    if (!visibleKeys.length) {
      setCustomersStatus("Ingen kund matchar ditt urval just nu.", "error");
      return;
    }

    if (
      customerStatus &&
      customerStatus.dataset.statusTone === "error" &&
      normalizeText(customerStatus.textContent) === "Ingen kund matchar ditt urval just nu."
    ) {
      setCustomersStatus("", "");
    }

    if (!visibleKeys.includes(state.selectedCustomerIdentity)) {
      setSelectedCustomerIdentity(visibleKeys[0]);
      return;
    }

    setSelectedCustomerIdentity(state.selectedCustomerIdentity);
  }

  function getAnalyticsDaysForPeriod(periodKey = state.selectedAnalyticsPeriod) {
    const normalizedKey = normalizeKey(periodKey || "week");
    if (normalizedKey === "today") return 1;
    if (normalizedKey === "month") return 30;
    return 7;
  }

  function formatAnalyticsLatency(p95Ms) {
    const value = asNumber(p95Ms, 0);
    if (value <= 0) return "0 ms";
    if (value < 1000) return `${Math.round(value)} ms`;
    if (value < 60_000) {
      const seconds = value / 1000;
      return `${seconds >= 10 ? seconds.toFixed(0) : seconds.toFixed(1)} s`;
    }
    const minutes = Math.floor(value / 60_000);
    const seconds = Math.round((value % 60_000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  function getAnalyticsOwnerScopeLabel() {
    const selectedOwnerKey = normalizeKey(state.runtime.selectedOwnerKey || "all");
    if (selectedOwnerKey === "all") return "Alla ägare";
    if (selectedOwnerKey === "unassigned") return "Oägd";
    const owner = getAvailableRuntimeOwners().find((item) => item.id === selectedOwnerKey);
    return asText(owner?.label, "Ägare");
  }

  function buildAnalyticsLiveCards() {
    const analytics = state.analyticsRuntime;
    const readinessScore = asNumber(analytics.readiness?.score, 0);
    const readinessBand = humanizeCode(analytics.readiness?.band, "Okänt");
    const goAllowed = analytics.readiness?.goAllowed === true;
    const p95Ms = asNumber(analytics.monitorMetrics?.latency?.p95Ms, 0);
    const slowRequests = asNumber(analytics.monitorMetrics?.totals?.slowRequests, 0);
    const openIncidents = asNumber(
      analytics.incidentSummary?.totals?.openUnresolved ??
        analytics.ownerDashboard?.incidents?.summary?.totals?.openUnresolved,
      0
    );
    const breachedOpen = asNumber(
      analytics.incidentSummary?.totals?.breachedOpen ??
        analytics.ownerDashboard?.incidents?.summary?.totals?.breachedOpen,
      0
    );
    const riskOpen = asNumber(
      analytics.riskSummary?.totals?.highCriticalOpen ??
        analytics.ownerDashboard?.riskSummary?.totals?.highCriticalOpen,
      0
    );
    const ownerPending = asNumber(
      analytics.pilotReport?.kpis?.ownerDecisionPending ??
        analytics.ownerDashboard?.riskSummary?.totals?.ownerDecisionPending,
      0
    );
    const mailReady = analytics.mailInsights?.ready === true;
    const visibleThreads = getQueueScopedRuntimeThreads();
    const mailboxScopeCount =
      getSelectedRuntimeMailboxScopeIds().length || getAvailableRuntimeMailboxes().length || 0;

    return {
      readiness: {
        label: "Readiness-score",
        trend: readinessBand,
        trendTone: goAllowed ? "positive" : "negative",
        value: readinessScore ? readinessScore.toFixed(1) : "0.0",
        meta: goAllowed ? "Go/no-go tillåter körning." : "Åtgärd krävs innan go.",
      },
      latency: {
        label: "Runtime p95",
        trend: slowRequests > 0 ? `${slowRequests} långsamma` : "Stabil",
        trendTone: slowRequests > 0 ? "negative" : "positive",
        value: formatAnalyticsLatency(p95Ms),
        meta: "Monitor-latens från valt fönster.",
      },
      incidents: {
        label: "Öppna incidenter",
        trend: breachedOpen > 0 ? `${breachedOpen} över SLA` : "Inga brott",
        trendTone: breachedOpen > 0 ? "negative" : "positive",
        value: String(openIncidents),
        meta: "Operativt läge nu.",
      },
      mail: {
        label: "Mail insights",
        trend: asText(analytics.mailInsights?.brand, "Ingen brand"),
        trendTone: mailReady ? "positive" : "negative",
        value: mailReady ? "Redo" : "Väntar",
        meta: mailReady
          ? "Mail-insikter redo för shellen."
          : "Kör ingest för att fylla panelen.",
      },
      risk: {
        label: "Hög risk öppna",
        trend: ownerPending > 0 ? `${ownerPending} väntar` : "Ägarläge lugnt",
        trendTone: ownerPending > 0 || riskOpen > 0 ? "negative" : "positive",
        value: String(riskOpen),
        meta: "Behöver ägarbeslut eller riskuppföljning.",
      },
      scope: {
        label: "Synliga trådar",
        trend: `${mailboxScopeCount} mailboxar`,
        trendTone: "positive",
        value: String(visibleThreads.length),
        meta: `Ägarscope: ${getAnalyticsOwnerScopeLabel()}.`,
      },
    };
  }

  function buildAnalyticsLiveNarratives() {
    const analytics = state.analyticsRuntime;
    const pilot = analytics.pilotReport?.kpis || {};
    const ownerRisk = analytics.ownerDashboard?.riskSummary?.totals || {};
    const incidents = analytics.incidentSummary?.totals || {};
    const mailReady = analytics.mailInsights?.ready === true;
    const visibleThreads = getQueueScopedRuntimeThreads();
    const mailboxScopeCount =
      getSelectedRuntimeMailboxScopeIds().length || getAvailableRuntimeMailboxes().length || 0;

    return [
      {
        kicker: "Pilotrapport",
        body: `${asNumber(pilot.templatesTotal, 0)} mallar totalt, ${asNumber(
          pilot.templatesWithActiveVersion,
          0
        )} aktiva och ${asNumber(pilot.evaluationsTotal, 0)} utvärderingar i valt fönster.`,
      },
      {
        kicker: "Riskläge",
        body: `${asNumber(ownerRisk.highCriticalOpen, 0)} hög/kritisk öppna. ${asNumber(
          pilot.ownerDecisionPending,
          0
        )} väntar på owner-beslut.`,
      },
      {
        kicker: "Incidentspår",
        body: `${asNumber(incidents.openUnresolved, 0)} öppna incidenter, ${asNumber(
          incidents.breachedOpen,
          0
        )} över SLA. ${mailReady ? "Mail-insikter redo." : "Mail-insikter väntar på ingest."} ${visibleThreads.length} trådar i ${mailboxScopeCount} mailboxscope.`,
      },
    ];
  }

  function renderAnalyticsRuntime() {
    const analytics = state.analyticsRuntime;

    if (analyticsStatus) {
      if (analytics.loading) {
        setFeedback(analyticsStatus, "loading", "Laddar live analytics…");
      } else if (analytics.error) {
        setFeedback(analyticsStatus, "error", analytics.error);
      } else {
        setFeedback(analyticsStatus, "", "");
      }
    }

    const cards = buildAnalyticsLiveCards();
    analyticsLiveCards.forEach((card) => {
      const metricKey = normalizeKey(card.dataset.analyticsLiveCard);
      const metric = cards[metricKey];
      if (!metric) return;

      const labelNode = card.querySelector("[data-analytics-live-label]");
      const trendNode = card.querySelector("[data-analytics-live-trend]");
      const valueNode = card.querySelector("[data-analytics-live-value]");
      const metaNode = card.querySelector("[data-analytics-live-meta]");

      if (labelNode) labelNode.textContent = metric.label;
      if (trendNode) {
        trendNode.textContent = metric.trend;
        trendNode.classList.toggle(
          "analytics-metric-trend-positive",
          metric.trendTone === "positive"
        );
        trendNode.classList.toggle(
          "analytics-metric-trend-negative",
          metric.trendTone !== "positive"
        );
      }
      if (valueNode) valueNode.textContent = metric.value;
      if (metaNode) metaNode.textContent = metric.meta;
    });

    if (analyticsLiveNarratives) {
      analyticsLiveNarratives.innerHTML = buildAnalyticsLiveNarratives()
        .map(
          (item) => `
            <article class="analytics-live-story">
              <span class="analytics-live-story-kicker">${escapeHtml(item.kicker)}</span>
              <p class="analytics-live-story-body">${escapeHtml(item.body)}</p>
            </article>
          `
        )
        .join("");
    }
  }

  async function loadAnalyticsRuntime({ force = false } = {}) {
    if (!force && state.analyticsRuntime.loading) return;

    const requestId = state.analyticsRuntime.requestId + 1;
    state.analyticsRuntime.requestId = requestId;
    state.analyticsRuntime.loading = true;
    if (!state.analyticsRuntime.loaded) {
      state.analyticsRuntime.error = "";
    }
    renderAnalyticsRuntime();

    const days = getAnalyticsDaysForPeriod();
    const requests = [
      ["monitorMetrics", "/api/v1/monitor/metrics"],
      ["readiness", "/api/v1/monitor/readiness"],
      ["ownerDashboard", "/api/v1/dashboard/owner"],
      ["pilotReport", `/api/v1/reports/pilot?days=${days}`],
      ["riskSummary", "/api/v1/risk/summary"],
      ["incidentSummary", "/api/v1/incidents/summary"],
      ["mailInsights", "/api/v1/mail/insights"],
    ];

    const settled = await Promise.allSettled(
      requests.map(([, path]) => apiRequest(path))
    ).catch((error) => {
      throw error;
    });

    if (requestId !== state.analyticsRuntime.requestId) return;

    let successCount = 0;
    const nextValues = {};
    const failures = [];

    settled.forEach((result, index) => {
      const [key] = requests[index];
      if (result.status === "fulfilled") {
        nextValues[key] = result.value;
        successCount += 1;
        return;
      }
      nextValues[key] = state.analyticsRuntime[key] || null;
      failures.push(result.reason);
    });

    if (!successCount && !state.analyticsRuntime.loaded) {
      const firstFailure = failures[0];
      const message =
        firstFailure instanceof Error ? firstFailure.message : "Kunde inte läsa live analytics.";
      const statusCode = Number(firstFailure?.statusCode || firstFailure?.status || 0);
      state.analyticsRuntime.loading = false;
      state.analyticsRuntime.error = isAuthFailure(statusCode, message)
        ? "Inloggning krävs för analytics i nya CCO."
        : message;
      renderAnalyticsRuntime();
      return;
    }

    state.analyticsRuntime.loading = false;
    state.analyticsRuntime.loaded = true;
    state.analyticsRuntime.partial = failures.length > 0;
    state.analyticsRuntime.lastLoadedAt = new Date().toISOString();
    Object.assign(state.analyticsRuntime, nextValues);
    state.analyticsRuntime.error =
      failures.length > 0
        ? "Vissa analytics-källor kunde inte läsas. Visar senaste kompletta livebild."
        : "";
    renderAnalyticsRuntime();
  }

  function buildDerivedAnalyticsPeriodData(periodKey = state.selectedAnalyticsPeriod) {
    const fallback =
      ANALYTICS_PERIOD_DATA[normalizeKey(periodKey)] || ANALYTICS_PERIOD_DATA.week;
    if (!state.analyticsRuntime.loaded) return fallback;

    const visibleThreads = getQueueScopedRuntimeThreads();
    const conversationCount = Math.max(
      visibleThreads.length,
      asNumber(state.analyticsRuntime.pilotReport?.kpis?.evaluationsTotal, 0)
    );
    const totalMessages = visibleThreads.reduce(
      (sum, thread) =>
        sum +
        Math.max(
          1,
          asArray(thread?.messages).length || asArray(thread?.historyEvents).length || 1
        ),
      0
    );
    const vipCount = visibleThreads.filter((thread) => thread?.isVIP).length;
    const readinessScore = asNumber(state.analyticsRuntime.readiness?.score, 0);
    const p95Ms = asNumber(state.analyticsRuntime.monitorMetrics?.latency?.p95Ms, 0);
    const riskOpen =
      asNumber(state.analyticsRuntime.riskSummary?.totals?.highCriticalOpen, 0) ||
      asNumber(state.analyticsRuntime.ownerDashboard?.riskSummary?.totals?.highCriticalOpen, 0);
    const ownerPending =
      asNumber(state.analyticsRuntime.pilotReport?.kpis?.ownerDecisionPending, 0) ||
      asNumber(state.analyticsRuntime.ownerDashboard?.riskSummary?.totals?.ownerDecisionPending, 0);
    const incidentOpen =
      asNumber(state.analyticsRuntime.incidentSummary?.totals?.openUnresolved, 0) ||
      asNumber(state.analyticsRuntime.ownerDashboard?.incidents?.summary?.totals?.openUnresolved, 0);
    const macrosCount = state.macros.length || getFallbackMacroCards().length;
    const templateBase = Math.max(1, macrosCount * 5);
    const templateUsagePercent = Math.min(
      99,
      Math.max(42, Math.round((asNumber(state.analyticsRuntime.pilotReport?.kpis?.templatesWithActiveVersion, 0) / templateBase) * 100) || 0)
    );
    const replyMinutes = Math.max(18, Math.round((p95Ms || 6600000) / 60000));
    const replyHours = Math.floor(replyMinutes / 60);
    const replyRemainderMinutes = replyMinutes % 60;
    const replyTimeLabel = `${replyHours}h ${String(replyRemainderMinutes).padStart(2, "0")}m`;
    const slaValue = `${Math.min(99, Math.max(72, Math.round(readinessScore || 88)))}%`;
    const csatScore = (
      4 +
      Math.min(0.9, Math.max(0.1, readinessScore / 1000 + (vipCount ? 0.18 : 0.12)))
    ).toFixed(1);
    const upsellValue = Math.max(
      1200,
      vipCount * 1400 + ownerPending * 350 + Math.round(conversationCount * 45)
    );
    const bookingCount = visibleThreads.filter((thread) => {
      const text = normalizeKey(
        `${thread?.subject || ""} ${thread?.statusLabel || ""} ${thread?.nextActionLabel || ""}`
      );
      return text.includes("bok") || text.includes("tid") || text.includes("ready");
    }).length;
    const pricingCount = visibleThreads.filter((thread) => {
      const text = normalizeKey(
        `${thread?.subject || ""} ${thread?.preview || ""} ${thread?.nextActionSummary || ""}`
      );
      return text.includes("pris") || text.includes("price") || text.includes("kost");
    }).length;
    const rescheduleCount = visibleThreads.filter((thread) => {
      const text = normalizeKey(
        `${thread?.subject || ""} ${thread?.followUpLabel || ""} ${asArray(thread?.tags).join(" ")}`
      );
      return text.includes("ombok") || text.includes("later") || text.includes("followup");
    }).length;
    const templateCounts = {
      booking_confirmation: Math.max(1, bookingCount),
      pricing: Math.max(1, pricingCount),
      reschedule: Math.max(1, rescheduleCount),
    };
    const templateCountTotal = Object.values(templateCounts).reduce((sum, value) => sum + value, 0);
    const templateRows = Object.fromEntries(
      Object.entries(templateCounts).map(([key, count]) => {
        const fallbackRow = fallback.templates[key];
        const share = Math.round((count / Math.max(templateCountTotal, 1)) * 100);
        return [
          key,
          {
            label: fallbackRow.label,
            share: `${share}%`,
            width: `${Math.min(92, Math.max(26, share))}%`,
          },
        ];
      })
    );

    const medalByIndex = ["🏆", "🥈", "🥉"];
    const leaderboardCandidates = asArray(
      state.analyticsRuntime.ownerDashboard?.leaderboard ||
        state.analyticsRuntime.ownerDashboard?.owners ||
        state.analyticsRuntime.pilotReport?.leaderboard ||
        state.analyticsRuntime.pilotReport?.owners
    )
      .map((item) => ({
        name:
          asText(item?.name) ||
          asText(item?.ownerName) ||
          asText(item?.label) ||
          "Operatör",
        score:
          asNumber(item?.score, 0) ||
          asNumber(item?.resolvedCount, 0) ||
          asNumber(item?.conversationCount, 0) ||
          asNumber(item?.handled, 0),
      }))
      .filter((item) => normalizeText(item.name));
    const leaderboard = (leaderboardCandidates.length ? leaderboardCandidates : fallback.leaderboard)
      .slice(0, 3)
      .map((item, index) => ({
        medal: medalByIndex[index] || "•",
        name: item.name,
        score: String(item.score || item.score === 0 ? item.score : fallback.leaderboard[index]?.score || "0"),
      }));

    const coachingAction =
      ownerPending > 0
        ? "Öppna historik"
        : riskOpen > 0 || incidentOpen > 0
          ? "Visa riskläge"
          : "Öppna mallbibliotek";
    const coachingCopy =
      ownerPending > 0
        ? `${ownerPending} ärenden väntar på owner-beslut i live-läget. Prioritera tydliga nästa steg för att minska kötrycket.`
        : riskOpen > 0 || incidentOpen > 0
          ? `Live-datan visar ${riskOpen} riskärenden och ${incidentOpen} öppna incidenter. Fokusera på guardrails och svarstid i samma scope.`
          : `Readiness ligger på ${slaValue} och ${conversationCount} konversationer syns i aktivt scope. Använd mallar och makron för att hålla tempot stabilt.`;

    return {
      metrics: {
        reply_time: {
          value: replyTimeLabel,
          trend: p95Ms ? `${formatAnalyticsLatency(p95Ms)} p95` : fallback.metrics.reply_time.trend,
          tone: p95Ms && p95Ms <= 7200000 ? "positive" : "negative",
        },
        sla: {
          value: slaValue,
          trend:
            ownerPending > 0
              ? `${ownerPending} väntar`
              : incidentOpen > 0
                ? `${incidentOpen} incidenter`
                : "Stabil",
          tone: ownerPending > 0 || incidentOpen > 0 ? "negative" : "positive",
        },
        conversations: {
          value: String(conversationCount),
          trend: `${visibleThreads.length} live`,
          tone: "positive",
        },
        csat: {
          value: `${csatScore}/5`,
          trend: vipCount > 0 ? `${vipCount} VIP` : "Blandat inflöde",
          tone: "positive",
        },
      },
      self: {
        closed: String(Math.max(visibleThreads.length, conversationCount)),
        self_reply_time: replyTimeLabel,
        templates: `${templateUsagePercent}%`,
        upsell: `${upsellValue.toLocaleString("sv-SE")} kr`,
        upsell_count: String(Math.max(1, vipCount + Math.round(ownerPending / 2))),
        upsellCaption: ownerPending > 0 ? "möjlig intäkt i väntläge" : "live-potential i scope",
      },
      leaderboard,
      templates: templateRows,
      coaching: {
        label: ownerPending > 0 ? "Coachningsinsikt" : fallback.coaching.label,
        copy: coachingCopy,
        action: coachingAction,
      },
    };
  }

  function renderAnalyticsPeriod() {
    const periodData = buildDerivedAnalyticsPeriodData(state.selectedAnalyticsPeriod);

    analyticsMetricValueNodes.forEach((node) => {
      const metric = periodData.metrics[node.dataset.analyticsMetricValue];
      if (metric) {
        node.textContent = metric.value;
      }
    });

    analyticsMetricTrendNodes.forEach((node, index) => {
      const key = index === 0 ? "reply_time" : index === 1 ? "sla" : "csat";
      const metric = periodData.metrics[key];
      if (!metric || !metric.trend) {
        node.hidden = true;
        return;
      }
      node.hidden = false;
      node.textContent = metric.trend;
      node.classList.toggle("analytics-metric-trend-positive", metric.tone === "positive");
      node.classList.toggle("analytics-metric-trend-negative", metric.tone !== "positive");
    });

    analyticsSelfValueNodes.forEach((node) => {
      const key = node.dataset.analyticsSelfValue;
      const value = periodData.self[key];
      if (value !== undefined) {
        node.textContent = value;
      }
    });

    analyticsSelfCaptionNodes.forEach((node) => {
      const key = node.dataset.analyticsSelfCaption;
      const value = periodData.self[`${key}Caption`];
      if (value !== undefined) {
        node.textContent = value;
      }
    });

    analyticsLeaderboardRows.forEach((row) => {
      const item = periodData.leaderboard[Number(row.dataset.analyticsLeaderboardRow) || 0];
      if (!item) return;
      const badge = row.querySelector("div span");
      const name = row.querySelector("div strong");
      const score = row.querySelector("b");
      if (badge) badge.textContent = item.medal;
      if (name) name.textContent = item.name;
      if (score) score.textContent = item.score;
    });

    analyticsTemplateRows.forEach((row) => {
      const template = periodData.templates[row.dataset.analyticsTemplateRow];
      if (!template) return;
      const title = row.querySelector(".analytics-template-row-head strong");
      const share = row.querySelector(".analytics-template-row-head span");
      const bar = row.querySelector(".analytics-template-bar span");
      if (title) title.textContent = template.label;
      if (share) share.textContent = template.share;
      if (bar) bar.style.width = template.width;
    });

    if (analyticsCoachingLabel) {
      analyticsCoachingLabel.textContent = periodData.coaching.label;
    }
    if (analyticsCoachingCopy) {
      analyticsCoachingCopy.textContent = periodData.coaching.copy;
    }
    if (analyticsCoachingAction) {
      analyticsCoachingAction.textContent = periodData.coaching.action;
    }
  }

  function renderAutomationTemplateConfig() {
    const template = getSelectedTemplateConfig();
    if (automationTitleHeading) automationTitleHeading.textContent = template.flowTitle;
    if (automationAnalysisTitle) automationAnalysisTitle.textContent = template.analysisTitle;
    if (automationTemplatesTitle) automationTemplatesTitle.textContent = template.templatesTitle;
    if (automationTestingTitle) automationTestingTitle.textContent = template.testingTitle;
    if (automationVersionsTitle) automationVersionsTitle.textContent = template.versionsTitle;
    if (automationAutopilotTitle) automationAutopilotTitle.textContent = template.autopilotTitle;

    const configValues = [template.testingConfig.customer, template.testingConfig.trigger, template.testingConfig.time];
    automationTestingConfigValues.forEach((node, index) => {
      if (configValues[index]) {
        node.textContent = configValues[index];
      }
    });

    automationNodes.forEach((node) => {
      const definition = template.nodes[normalizeKey(node.dataset.automationNode)];
      if (!definition) return;
      const title = node.querySelector("strong");
      const lines = Array.from(node.querySelectorAll("p"));
      if (title) title.textContent = definition.title;
      lines.forEach((line, index) => {
        line.innerHTML = definition.lines[index]
          ? definition.lines[index].replace(/: ([^:]+)$/, ': <b>$1</b>')
          : "";
      });
    });
  }

  function renderAutomationTestingState() {
    const liveScenario =
      state.automationRuntime.lastEvaluationByKey[
        normalizeKey(state.selectedAutomationTemplate) || "churn_guard"
      ] || null;
    const scenario =
      liveScenario ||
      AUTOMATION_TEST_SCENARIOS[state.automationRuntime.testingScenario] ||
      AUTOMATION_TEST_SCENARIOS.baseline;

    if (automationTestingValidationTitle) {
      automationTestingValidationTitle.textContent = scenario.title;
    }
    if (automationTestingValidationList) {
      automationTestingValidationList.innerHTML = "";
      scenario.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        automationTestingValidationList.appendChild(li);
      });
    }
    if (automationTestingLogList) {
      automationTestingLogList.innerHTML = "";
      scenario.log.forEach((entry) => {
        const article = document.createElement("article");
        article.className = `automation-testing-log-row is-${entry.tone}`;
        article.innerHTML = `<span>${entry.time}</span><div><strong>${entry.title}</strong>${
          entry.copy ? `<p>${entry.copy}</p>` : ""
        }</div>`;
        automationTestingLogList.appendChild(article);
      });
    }
  }

  function renderAutomationSuggestions() {
    automationSuggestionCards.forEach((card) => {
      const key = normalizeKey(card.dataset.automationSuggestion);
      const dismissed = state.automationRuntime.dismissedSuggestionKeys.includes(key);
      card.hidden = dismissed;
      card.classList.toggle(
        "is-applied",
        state.automationRuntime.appliedSuggestionKeys.includes(key)
      );
    });
  }

  function renderAutomationAutopilot() {
    const pendingCount = Math.max(0, state.automationRuntime.autopilotPendingCount);
    if (automationAutopilotPendingLabel) {
      automationAutopilotPendingLabel.textContent = `Väntar på godkännande (${pendingCount})`;
    }

    automationAutopilotProposalCards.forEach((card) => {
      const key = normalizeKey(card.dataset.automationAutopilotProposal);
      const resolution = state.automationRuntime.autopilotResolved[key];
      const hidden = resolution === "approved" || resolution === "dismissed";
      card.hidden = hidden;
      card.classList.toggle("is-selected", !hidden && key === state.selectedAutomationAutopilotProposal);
      card
        .querySelectorAll("[data-automation-autopilot-action]")
        .forEach((button) => (button.disabled = !state.automationAutopilotEnabled));
    });

    if (automationAutopilotMetricCards[0]) {
      const node = automationAutopilotMetricCards[0].querySelector("strong");
      if (node) node.textContent = String(pendingCount);
    }
    if (automationAutopilotMetricCards[1]) {
      const node = automationAutopilotMetricCards[1].querySelector("strong");
      if (node) node.textContent = String(state.automationRuntime.autopilotAutoFixCount);
    }
    if (automationAutopilotMetricCards[2]) {
      const node = automationAutopilotMetricCards[2].querySelector("strong");
      if (node) node.textContent = state.automationRuntime.autopilotTimeSaved;
    }

    if (automationAutopilotRecentList) {
      automationAutopilotRecentList.innerHTML = "";
      state.automationRuntime.autopilotRecent.forEach((item) => {
        const article = document.createElement("article");
        article.className = "automation-autopilot-recent-item";
        article.innerHTML = `<div><strong>${item.title}</strong><p>${item.stamp}</p></div><span>${item.delta}</span>`;
        automationAutopilotRecentList.appendChild(article);
      });
    }

    if (automationAutopilotFootCards[0]) {
      automationAutopilotFootCards[0].querySelector("strong").textContent = String(
        47 + state.automationRuntime.autopilotApprovedCount
      );
    }
    if (automationAutopilotFootCards[1]) {
      automationAutopilotFootCards[1].querySelector("strong").textContent =
        state.automationRuntime.autopilotTimeSaved;
    }
    if (automationAutopilotFootCards[2]) {
      automationAutopilotFootCards[2].querySelector("strong").textContent =
        state.automationRuntime.autopilotPerformance;
    }
  }

  function applyCustomerMerge(primaryKey, secondaryKeys, options = {}) {
    const normalizedPrimaryKey = normalizeKey(primaryKey);
    const secondary = asArray(secondaryKeys)
      .map((key) => normalizeKey(key))
      .filter((key) => key && key !== normalizedPrimaryKey);
    if (!normalizedPrimaryKey || !secondary.length) return false;

    const directoryMap = getCustomerDirectoryMap();
    const detailsMap = getCustomerDetailsMap();
    const primaryRecord = directoryMap[normalizedPrimaryKey];
    const primaryDetail = detailsMap[normalizedPrimaryKey];
    if (!primaryRecord || !primaryDetail) return false;

    const keepEmails = options.keepAllEmails !== false;
    const keepPhones = options.keepAllPhones !== false;
    const combineNotes = options.combineNotes !== false;

    secondary.forEach((secondaryKey) => {
      const secondaryRecord = directoryMap[secondaryKey];
      const secondaryDetail = detailsMap[secondaryKey];
      if (!secondaryRecord || !secondaryDetail) return;

      if (keepEmails) {
        primaryDetail.emails = mergeUniqueMailboxValues([
          ...asArray(primaryDetail.emails),
          ...asArray(secondaryDetail.emails),
        ]);
      }
      if (keepPhones && !primaryDetail.phone && secondaryDetail.phone) {
        primaryDetail.phone = secondaryDetail.phone;
      }
      primaryDetail.mailboxes = mergeUniqueTextValues([
        ...asArray(primaryDetail.mailboxes),
        ...asArray(secondaryDetail.mailboxes),
      ]);

      primaryRecord.vip = Boolean(primaryRecord.vip || secondaryRecord.vip);
      primaryRecord.duplicateCandidate = false;
      primaryRecord.emailCoverage = Math.max(
        Number(primaryRecord.emailCoverage || 0),
        primaryDetail.emails.length
      );
      primaryRecord.profileCount =
        Number(primaryRecord.profileCount || 1) +
        Number(secondaryRecord.profileCount || 1);
      primaryRecord.customerValue =
        Number(primaryRecord.customerValue || 0) + Number(secondaryRecord.customerValue || 0);
      primaryRecord.totalConversations =
        Number(primaryRecord.totalConversations || 0) +
        Number(secondaryRecord.totalConversations || 0);
      primaryRecord.totalMessages =
        Number(primaryRecord.totalMessages || 0) + Number(secondaryRecord.totalMessages || 0);

      state.customerRuntime.profileCounts[normalizedPrimaryKey] = Number(
        primaryRecord.profileCount || primaryDetail.emails.length || 1
      );
      state.customerRuntime.mergedInto[secondaryKey] = normalizedPrimaryKey;

      if (keepEmails) {
        delete state.customerPrimaryEmailByKey[secondaryKey];
      }
      if (combineNotes) {
        primaryRecord.duplicateCandidate = false;
      }
    });

    const preferredPrimaryEmail =
      normalizeText(options.primaryEmail) ||
      state.customerPrimaryEmailByKey[normalizedPrimaryKey] ||
      primaryDetail.emails[0] ||
      "";
    if (preferredPrimaryEmail) {
      state.customerPrimaryEmailByKey[normalizedPrimaryKey] = preferredPrimaryEmail;
    }
    primaryRecord.name = normalizeText(options.primaryName) || primaryRecord.name;
    if (normalizeText(options.primaryPhone)) {
      primaryDetail.phone = normalizeText(options.primaryPhone);
    }

    return true;
  }

  function applyCustomerIdentityPayload(payload = {}) {
    applyCustomerPersistedState(payload?.customerState || {});
    state.customerRuntime.identitySuggestionGroups =
      payload?.suggestionGroups && typeof payload.suggestionGroups === "object"
        ? cloneJson(payload.suggestionGroups)
        : {};
    state.customerRuntime.duplicateMetric = Math.max(
      0,
      Number(payload?.duplicateCount || 0)
    );
    ensureCustomerRuntimeProfilesFromLive();
    state.customerRuntime.loaded = true;
    state.customerRuntime.authRequired = false;
    state.customerRuntime.error = "";
    applyCustomerFilters();
  }

  async function persistCustomerIdentityAction(path, body, successMessage) {
    const payload = await apiRequest(path, {
      method: "POST",
      headers: {
        "x-idempotency-key": createIdempotencyKey(path.replace(/[^a-z0-9]+/gi, "-")),
      },
      body: {
        ...body,
        customerState: buildCustomerPersistPayload(),
      },
    });
    applyCustomerIdentityPayload(payload || {});
    if (successMessage) {
      setCustomersStatus(successMessage, "success");
    }
    return payload;
  }

  function splitCustomerProfileLocally(customerKey, emailToSplit) {
    const normalizedKey = normalizeKey(customerKey);
    const normalizedEmail = normalizeMailboxId(emailToSplit);
    if (!normalizedKey || !normalizedEmail) return "";

    const directoryMap = getCustomerDirectoryMap();
    const detailsMap = getCustomerDetailsMap();
    const record = directoryMap[normalizedKey];
    const detail = detailsMap[normalizedKey];
    if (!record || !detail) return "";

    const emails = asArray(detail.emails);
    const splitAlias = emails.find((entry) => normalizeMailboxId(entry) === normalizedEmail);
    if (!splitAlias || emails.length < 2) return "";

    const remainingEmails = emails.filter((entry) => normalizeMailboxId(entry) !== normalizedEmail);
    const splitShare = Math.max(1, Math.round(Number(record.totalConversations || 1) / emails.length));
    const splitMessages = Math.max(1, Math.round(Number(record.totalMessages || 1) / emails.length));
    const splitLtv = Math.max(0, Math.round(Number(record.customerValue || 0) / emails.length));
    const rootName = splitAlias.split("@")[0] || record.name;
    const normalizedName = rootName
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    detail.emails = remainingEmails;
    state.customerPrimaryEmailByKey[normalizedKey] =
      state.customerPrimaryEmailByKey[normalizedKey] &&
      remainingEmails.some(
        (entry) =>
          normalizeMailboxId(entry) ===
          normalizeMailboxId(state.customerPrimaryEmailByKey[normalizedKey])
      )
        ? state.customerPrimaryEmailByKey[normalizedKey]
        : remainingEmails[0] || "";

    record.profileCount = Math.max(1, Number(record.profileCount || emails.length) - 1);
    record.emailCoverage = remainingEmails.length;
    record.totalConversations = Math.max(
      1,
      Number(record.totalConversations || 1) - splitShare
    );
    record.totalMessages = Math.max(1, Number(record.totalMessages || 1) - splitMessages);
    record.customerValue = Math.max(0, Number(record.customerValue || 0) - splitLtv);
    record.duplicateCandidate = remainingEmails.length > 1;
    state.customerRuntime.profileCounts[normalizedKey] = Number(record.profileCount || 1);

    const newKeyBase = normalizeKey(normalizedName) || `${normalizedKey}_split`;
    let newKey = newKeyBase;
    let index = 2;
    while (directoryMap[newKey]) {
      newKey = `${newKeyBase}_${index}`;
      index += 1;
    }

    directoryMap[newKey] = {
      name: normalizedName || splitAlias,
      vip: false,
      emailCoverage: 1,
      duplicateCandidate: false,
      profileCount: 1,
      customerValue: splitLtv,
      totalConversations: splitShare,
      totalMessages: splitMessages,
    };
    detailsMap[newKey] = {
      emails: [splitAlias],
      phone: "",
      mailboxes: asArray(detail.mailboxes).slice(0, 1),
    };
    state.customerPrimaryEmailByKey[newKey] = splitAlias;
    state.customerRuntime.profileCounts[newKey] = 1;

    return newKey;
  }

  function handleCustomerCommand(commandKey) {
    const key = normalizeKey(commandKey);
    if (key === "bulk_merge") {
      setCustomerMergeOpen(true);
      setCustomersStatus("Massammanfoga öppnades med markerade profiler.", "loading");
      return;
    }
    if (key === "export") {
      const payload = {
        generatedAt: new Date().toISOString(),
        customers: getVisibleCustomerPoolKeys().map((customerKey) => ({
          ...getCustomerRecord(customerKey),
          emails: [...getCustomerDetail(customerKey).emails],
          mailboxes: [...getCustomerDetail(customerKey).mailboxes],
        })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cco-kunder-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1200);
      setCustomersStatus("Exporterade aktuell kundbild från nya CCO.", "success");
      return;
    }
    if (key === "import") {
      renderCustomerImportModal();
      setCustomerImportOpen(true);
      setCustomersStatus("Importpanelen öppnades i nya CCO.", "success");
      return;
    }
    if (key === "settings") {
      setCustomerSettingsOpen(true);
      setCustomersStatus("Inställningar för matchningsregler är öppnade.", "success");
    }
  }

  function setCustomerSuggestionsHidden(hidden) {
    state.customerSuggestionsHidden = Boolean(hidden);
    if (customerSuggestionsPanel) {
      customerSuggestionsPanel.classList.toggle("is-collapsed", state.customerSuggestionsHidden);
    }
    if (customerSuggestionsToggle) {
      customerSuggestionsToggle.textContent = state.customerSuggestionsHidden
        ? "Visa förslag"
        : "Dölj förslag";
      customerSuggestionsToggle.setAttribute(
        "aria-pressed",
        state.customerSuggestionsHidden ? "true" : "false"
      );
    }
  }

  async function handleAutomationPrimaryAction(actionKey, button) {
    const key = normalizeKey(actionKey);
    if (!button || !key) return;

    const flowLabel = getSelectedTemplateConfig().flowTitle;
    const idleLabel = key === "run" ? "Testkör" : "Spara";
    const busyLabel = key === "run" ? "Kör..." : "Sparar...";

    setButtonBusy(button, true, idleLabel, busyLabel);

    try {
      if (key === "run") {
        const { templateRecord, version } = await saveAutomationDraft();
        const payload = await apiRequest(
          `/api/v1/templates/${encodeURIComponent(templateRecord.id)}/versions/${encodeURIComponent(
            version.id
          )}/evaluate`,
          {
            method: "POST",
            headers: {
              "x-idempotency-key": createIdempotencyKey(
                `automation-evaluate-${normalizeKey(state.selectedAutomationTemplate)}`
              ),
            },
            body: {
              instruction: buildAutomationInstruction(state.selectedAutomationTemplate, "run"),
            },
          }
        );
        state.automationRuntime.lastEvaluationByKey[
          normalizeKey(state.selectedAutomationTemplate) || "churn_guard"
        ] = buildAutomationTestingStateFromEvaluation(
          payload?.version,
          payload?.variableValidation
        );
        state.automationRuntime.testingScenario = "run";
        renderAutomationTestingState();
        setAutomationSubnav("testing");
        await loadAutomationVersions(state.selectedAutomationTemplate, { createIfMissing: true });
        if (payload?.version?.id) {
          setSelectedAutomationVersion(payload.version.id);
        }
        setAutomationStatus(
          `Testkörningen av "${flowLabel}" utvärderades live och blev ${getAutomationDecisionLabel(
            payload?.version?.risk?.decision
          )}.`,
          getAutomationDecisionTone(payload?.version?.risk?.decision)
        );
        return;
      }

      const { version } = await saveAutomationDraft();
      setAutomationStatus(
        `Ändringarna i "${flowLabel}" sparades live som version v${Number(
          version?.versionNo || 0
        )}.`,
        "success"
      );
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.automationRuntime.authRequired = true;
        setAutomationStatus("Logga in igen i admin för att spara eller testköra automationen.", "error");
      } else {
        setAutomationStatus(error?.message || "Automationen kunde inte sparas live.", "error");
      }
      renderAutomationVersions();
    } finally {
      setButtonBusy(button, false, idleLabel, busyLabel);
    }
  }

  function setAutomationCanvasScale(nextScale) {
    const clampedScale = Math.min(115, Math.max(85, Number(nextScale) || 100));
    state.automationScale = clampedScale;
    if (automationCanvasScaleReadout) {
      automationCanvasScaleReadout.textContent = `${clampedScale}%`;
    }
    if (automationShell) {
      automationShell.style.setProperty("--automation-flow-scale", String(clampedScale / 100));
    }
  }

  function setAutomationRailCollapsed(collapsed) {
    state.automationRailCollapsed = Boolean(collapsed);
    if (automationRail) {
      automationRail.classList.toggle("is-collapsed", state.automationRailCollapsed);
    }
    if (automationRailToggle) {
      automationRailToggle.textContent = state.automationRailCollapsed ? "+" : "×";
      automationRailToggle.setAttribute(
        "aria-label",
        state.automationRailCollapsed ? "Visa förslag" : "Stäng förslag"
      );
      automationRailToggle.setAttribute(
        "aria-pressed",
        state.automationRailCollapsed ? "true" : "false"
      );
    }
  }

  async function handleCustomerMergeAction(button, actionKey) {
    const primaryKey = normalizeKey(button.dataset.customerMergePrimaryKey);
    const secondaryKey = normalizeKey(button.dataset.customerMergeSecondaryKey);
    const cardId = buildCustomerSuggestionPairId(primaryKey, secondaryKey);
    if (!primaryKey || !secondaryKey) return;

    const normalizedAction = normalizeKey(actionKey);
    try {
      if (normalizedAction === "accept") {
        await persistCustomerIdentityAction(
          "/api/v1/cco/customers/identity/merge",
          {
            primaryKey,
            secondaryKeys: [secondaryKey],
            suggestionId: cardId,
          },
          "Profilerna sparades som sammanslagna i nya CCO."
        );
      } else {
        await persistCustomerIdentityAction(
          "/api/v1/cco/customers/identity/dismiss",
          {
            suggestionId: cardId,
          },
          "Förslaget markerades som inte samma och sparades."
        );
      }
      setSelectedCustomerIdentity(primaryKey);
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.customerRuntime.authRequired = true;
        window.location.assign(buildReauthUrl());
      } else {
        setCustomersStatus(
          error?.message || "Kunde inte uppdatera identitetsförslaget.",
          "error"
        );
      }
    }
  }

  function handleAnalyticsTemplateJump(targetTemplate) {
    setAppView("automation");
    setAutomationSubnav("mallar");
    if (targetTemplate) {
      setSelectedAutomationTemplate(targetTemplate);
    }
    setAutomationStatus("Öppnade mallbiblioteket från huvud-analys för att följa upp insikten.", "success");
  }

  function applyAutomationSuggestionAction(card, actionKey) {
    const key = normalizeKey(card?.dataset.automationSuggestion);
    if (!key) return;

    if (normalizeKey(actionKey) === "dismiss") {
      if (!state.automationRuntime.dismissedSuggestionKeys.includes(key)) {
        state.automationRuntime.dismissedSuggestionKeys.push(key);
      }
      renderAutomationSuggestions();
      setAutomationStatus("AI-förslaget avfärdades och builder-railen städades upp.", "success");
      return;
    }

    if (!state.automationRuntime.appliedSuggestionKeys.includes(key)) {
      state.automationRuntime.appliedSuggestionKeys.push(key);
    }

    if (key === "wait") {
      const waitNode = automationNodes.find(
        (node) => normalizeKey(node.dataset.automationNode) === "wait"
      );
      if (waitNode) {
        const title = waitNode.querySelector("strong");
        const line = waitNode.querySelector("p");
        if (title) title.textContent = "Vänta 2 dagar";
        if (line) line.innerHTML = "Varaktighet: <b>2d</b>";
      }
      setAutomationStatus("Väntesteget kortades till 2 dagar i buildern.", "success");
    } else if (key === "welcome") {
      setSelectedAutomationTemplate("vip_fast_track");
      setAutomationStatus("Förslaget kopplades till mallen VIP Fast Track.", "success");
    } else if (key === "assign") {
      setAutomationStatus("Felhantering markerades som nästa steg i automationens backlog.", "loading");
    } else if (key === "condition") {
      setAutomationStatus("Det dubbla e-poststeget markerades för sammanslagning i nästa save.", "success");
    }

    renderAutomationSuggestions();
  }

  function handleAutomationTestingAction(actionKey) {
    if (normalizeKey(actionKey) === "skip") {
      state.automationRuntime.testingScenario = "skip";
      renderAutomationTestingState();
      setAutomationStatus("Väntesteget hoppades över och fallback-spåret verifieras i testloggen.", "success");
      return;
    }

    const testingRunButton = automationTestingActionButtons.find(
      (button) => normalizeKey(button.dataset.automationTestingAction) === "run"
    );
    handleAutomationPrimaryAction("run", testingRunButton || automationRunButton).catch((error) => {
      console.warn("Automation testing-run misslyckades.", error);
    });
  }

  function handleAutomationAnalysisAction(actionKey) {
    const key = normalizeKey(actionKey);
    if (key === "optimize") {
      setAutomationSubnav("byggare");
      setSelectedAutomationNode("wait");
      setAutomationStatus("Flaskhals-steget är nu i fokus i byggaren för vidare optimering.", "success");
      return;
    }

    setAutomationSubnav("versioner");
    setSelectedAutomationVersion("v3_0");
    setAutomationStatus("Versionsytan öppnades för att visa mer release- och diffkontext.", "loading");
  }

  async function handleAutomationVersionAction(versionKey, actionKey) {
    setSelectedAutomationVersion(versionKey);
    const version = getAutomationVersions().find(
      (item) => normalizeKey(item.id) === normalizeKey(versionKey)
    );
    if (normalizeKey(actionKey) === "restore") {
      if (!version?.id) {
        setAutomationStatus("Ingen liveversion finns att aktivera ännu.", "error");
        return;
      }
      try {
        const templateRecord = await ensureAutomationTemplateRecord(state.selectedAutomationTemplate, {
          createIfMissing: false,
        });
        if (!templateRecord) {
          throw new Error("Automationmallen hittades inte i templatesystemet.");
        }
        const payload = await apiRequest(
          `/api/v1/templates/${encodeURIComponent(templateRecord.id)}/versions/${encodeURIComponent(
            version.id
          )}/activate`,
          {
            method: "POST",
            headers: {
              "x-idempotency-key": createIdempotencyKey(
                `automation-activate-${normalizeKey(state.selectedAutomationTemplate)}`
              ),
            },
            body: {},
          }
        );
        await loadAutomationVersions(state.selectedAutomationTemplate, { createIfMissing: true });
        if (payload?.version?.id) {
          setSelectedAutomationVersion(payload.version.id);
        }
        setAutomationStatus(
          `Version v${Number(payload?.version?.versionNo || version.versionNo || 0)} aktiverades live.`,
          "success"
        );
      } catch (error) {
        if (isAuthFailure(error?.statusCode, error?.message)) {
          state.automationRuntime.authRequired = true;
          setAutomationStatus("Logga in igen i admin för att aktivera en liveversion.", "error");
        } else {
          setAutomationStatus(error?.message || "Kunde inte aktivera liveversionen.", "error");
        }
        renderAutomationVersions();
      }
      return;
    }
    if (normalizeKey(actionKey) === "compare") {
      setAutomationStatus(
        `Versionsjämförelsen för v${Number(version?.versionNo || 0)} visas nu från livehistoriken.`,
        "loading"
      );
      return;
    }
    setAutomationStatus(
      `Innehållet för v${Number(version?.versionNo || 0)} visas nu i versionsdetaljen.`,
      "success"
    );
  }

  function handleAutomationAutopilotAction(card, actionKey) {
    const key = normalizeKey(card?.dataset.automationAutopilotProposal);
    if (!key) return;
    const title = normalizeText(card.querySelector("h3")?.textContent) || "Autopilot-förslag";

    if (normalizeKey(actionKey) === "approve") {
      state.automationRuntime.autopilotResolved[key] = "approved";
      state.automationRuntime.autopilotPendingCount = Math.max(
        0,
        state.automationRuntime.autopilotPendingCount - 1
      );
      state.automationRuntime.autopilotAutoFixCount += 1;
      state.automationRuntime.autopilotApprovedCount += 1;
      state.automationRuntime.autopilotRecent.unshift({
        title,
        stamp: "Nu",
        delta: key === "reduce_sla" ? "+4%" : key === "error_handling" ? "Stabiliserat" : "+6%",
      });
      state.automationRuntime.autopilotRecent = state.automationRuntime.autopilotRecent.slice(0, 3);
      setAutomationStatus("Autopilot-förslaget godkändes och flyttades till senaste optimeringar.", "success");
    } else {
      state.automationRuntime.autopilotResolved[key] = "dismissed";
      state.automationRuntime.autopilotPendingCount = Math.max(
        0,
        state.automationRuntime.autopilotPendingCount - 1
      );
      setAutomationStatus("Autopilot-förslaget avfärdades och togs bort från väntelistan.", "success");
    }

    renderAutomationAutopilot();
    const nextVisible = automationAutopilotProposalCards.find((proposal) => !proposal.hidden);
    if (nextVisible) {
      setSelectedAutomationAutopilotProposal(nextVisible.dataset.automationAutopilotProposal);
    }
  }

  function toggleCustomerBatchSelection(customerKey) {
    const normalizedKey = normalizeKey(customerKey);
    if (!normalizedKey) return;
    const nextSelection = new Set(state.customerBatchSelection);
    if (nextSelection.has(normalizedKey)) {
      nextSelection.delete(normalizedKey);
    } else {
      nextSelection.add(normalizedKey);
    }
    state.customerBatchSelection = Array.from(nextSelection);
    renderCustomerBatchSelection();
  }

  async function handleCustomerDetailAction(actionKey) {
    const key = normalizeKey(actionKey);
    const detail = getCustomerDetail(state.selectedCustomerIdentity);
    if (key === "primary_email") {
      const emails = detail.emails;
      if (!emails.length) return;
      const currentIndex = Math.max(
        0,
        emails.indexOf(state.customerPrimaryEmailByKey[detail.key] || emails[0])
      );
      const nextEmail = emails[(currentIndex + 1) % emails.length];
      try {
        await persistCustomerIdentityAction(
          "/api/v1/cco/customers/identity/primary-email",
          {
            customerKey: detail.key,
            email: nextEmail,
          },
          `Primär e-post för ${detail.name} sparades i nya CCO.`
        );
        renderCustomerDetailTools();
      } catch (error) {
        if (isAuthFailure(error?.statusCode, error?.message)) {
          state.customerRuntime.authRequired = true;
          window.location.assign(buildReauthUrl());
        } else {
          setCustomersStatus(
            error?.message || `Kunde inte sätta primär e-post för ${detail.name}.`,
            "error"
          );
        }
      }
      return;
    }

    if (key === "merge_settings") {
      setCustomerMergeOpen(true);
      setCustomersStatus("Merge-val öppnades för den valda kunden.", "loading");
      return;
    }

    if (key === "split_profile") {
      const primaryEmail =
        state.customerPrimaryEmailByKey[detail.key] || detail.emails[0] || "";
      const splitOptions = detail.emails.filter(
        (email) => normalizeMailboxId(email) !== normalizeMailboxId(primaryEmail)
      );
      if (!splitOptions.length) {
        setCustomersStatus(`Profilen ${detail.name} har inget alias att dela ut ännu.`, "error");
        return;
      }
      setCustomerSplitOpen(true, detail.key);
      setCustomersStatus(`Split-vyn öppnades för ${detail.name}.`, "loading");
      return;
    }

    if (key === "toggle_batch") {
      toggleCustomerBatchSelection(detail.key);
      setCustomersStatus(
        state.customerBatchSelection.includes(detail.key)
          ? `${detail.name} lades till i batchurvalet.`
          : `${detail.name} togs bort från batchurvalet.`,
        "success"
      );
    }
  }

  async function confirmCustomerMerge() {
    const mergeKeys = getMergeSelectionKeys();
    if (mergeKeys.length < 2) {
      setFeedback(customerMergeFeedback, "error", "Markera minst två profiler att slå ihop.");
      return;
    }

    const primaryKey = state.customerMergePrimaryKey || mergeKeys[0];
    const secondaryKeys = mergeKeys.filter((key) => key !== primaryKey);
    const mergedParts = customerMergeOptionInputs
      .filter((input) => input.checked)
      .map((input) => normalizeText(input.closest("label")?.textContent))
      .filter(Boolean);

    setFeedback(customerMergeFeedback, "loading", "Sparar sammanslagningen…");
    setCustomersStatus("Massammanfogningen är genomförd i nya CCO.", "loading");
    try {
      await persistCustomerIdentityAction(
        "/api/v1/cco/customers/identity/merge",
        {
          primaryKey,
          secondaryKeys,
          options: {
            keepAllEmails: customerMergeOptionInputs.some(
              (input) => normalizeKey(input.dataset.customerMergeOption) === "emails" && input.checked
            ),
            keepAllPhones: customerMergeOptionInputs.some(
              (input) => normalizeKey(input.dataset.customerMergeOption) === "phones" && input.checked
            ),
            combineNotes: customerMergeOptionInputs.some(
              (input) => normalizeKey(input.dataset.customerMergeOption) === "notes" && input.checked
            ),
          },
        },
        "Massammanfogningen sparades i backend."
      );
      state.customerBatchSelection = [primaryKey];
      setSelectedCustomerIdentity(primaryKey);
      setFeedback(
        customerMergeFeedback,
        "success",
        `Profilerna slogs ihop. Behöll ${mergedParts.join(", ").toLowerCase() || "vald data"}.`
      );
      window.setTimeout(() => setCustomerMergeOpen(false), 240);
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.customerRuntime.authRequired = true;
        window.location.assign(buildReauthUrl());
      } else {
        setFeedback(
          customerMergeFeedback,
          "error",
          error?.message || "Kunde inte spara sammanslagningen."
        );
      }
    }
  }

  async function confirmCustomerSplit() {
    const sourceKey = normalizeKey(state.customerRuntime.splitSourceKey || state.selectedCustomerIdentity);
    const splitEmail = normalizeText(state.customerRuntime.splitEmail);
    if (!sourceKey || !splitEmail) {
      setFeedback(customerSplitFeedback, "error", "Välj en e-postadress att dela ut.");
      return;
    }

    setFeedback(customerSplitFeedback, "loading", "Sparar uppdelningen…");
    setCustomersStatus(`Skapade en separat profil för ${splitEmail}.`, "loading");
    try {
      const payload = await persistCustomerIdentityAction(
        "/api/v1/cco/customers/identity/split",
        {
          customerKey: sourceKey,
          email: splitEmail,
        },
        `Profilen för ${splitEmail} sparades som egen kundpost.`
      );
      setSelectedCustomerIdentity(normalizeKey(payload?.newKey) || sourceKey);
      setFeedback(
        customerSplitFeedback,
        "success",
        `${splitEmail} delades ut till en egen profil.`
      );
      window.setTimeout(() => setCustomerSplitOpen(false), 240);
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.customerRuntime.authRequired = true;
        window.location.assign(buildReauthUrl());
      } else {
        setFeedback(
          customerSplitFeedback,
          "error",
          error?.message || "Kunde inte dela upp profilen."
        );
      }
    }
  }

  function handleMailboxAdminSave() {
    const mailboxName = normalizeText(mailboxAdminNameInput?.value);
    const mailboxEmail = normalizeText(mailboxAdminEmailInput?.value).toLowerCase();
    const ownerName = normalizeText(mailboxAdminOwnerSelect?.value) || "Team";
    const mailboxLabel = mailboxName || deriveMailboxLabel(mailboxEmail);
    if (!mailboxEmail || !mailboxEmail.includes("@")) {
      setFeedback(mailboxAdminFeedback, "error", "Ange en giltig mailboxadress.");
      return;
    }
    if (!mailboxLabel) {
      setFeedback(mailboxAdminFeedback, "error", "Ange ett namn för mailboxen.");
      return;
    }

    const existingMailboxes = getAvailableRuntimeMailboxes();
    if (
      existingMailboxes.some(
        (item) =>
          normalizeMailboxId(item.email) === normalizeMailboxId(mailboxEmail) ||
          normalizeKey(item.label) === normalizeKey(mailboxLabel)
      )
    ) {
      setFeedback(mailboxAdminFeedback, "error", "Mailboxen finns redan i listan.");
      return;
    }

    let mailboxId = slugifyMailboxId(mailboxLabel) || slugifyMailboxId(mailboxEmail) || `mailbox-${Date.now()}`;
    const existingIds = new Set(existingMailboxes.map((item) => normalizeMailboxId(item.id)));
    if (existingIds.has(mailboxId)) {
      let suffix = 2;
      let candidate = `${mailboxId}-${suffix}`;
      while (existingIds.has(candidate)) {
        suffix += 1;
        candidate = `${mailboxId}-${suffix}`;
      }
      mailboxId = candidate;
    }

    const mailbox = normalizeCustomMailboxDefinition({
      id: mailboxId,
      email: mailboxEmail,
      label: mailboxLabel,
      owner: ownerName,
    });
    state.customMailboxes.push(mailbox);
    if (!workspaceSourceOfTruth.getSelectedMailboxIds().includes(mailbox.id)) {
      workspaceSourceOfTruth.setSelectedMailboxIds(
        workspaceSourceOfTruth.getSelectedMailboxIds().concat(mailbox.id)
      );
    }
    if (mailboxAdminNameInput) mailboxAdminNameInput.value = "";
    if (mailboxAdminEmailInput) mailboxAdminEmailInput.value = "";
    ensureRuntimeMailboxSelection();
    ensureRuntimeSelection();
    renderMailboxAdminList();
    renderRuntimeConversationShell();
    setFeedback(mailboxAdminFeedback, "success", `Mailboxen ${mailbox.label} lades till.`);
  }

  function handleMailFeedCommand(commandKey) {
    const key = normalizeKey(commandKey);
    const activeFeedKey = state.view === "later" ? "later" : state.view === "sent" ? "sent" : "";
    const selectedFeedThread = activeFeedKey ? getSelectedMailFeedThread(activeFeedKey) : null;
    if (key === "resume") {
      if (selectedFeedThread?.id) {
        selectRuntimeThread(selectedFeedThread.id);
      }
      setAuxStatus(laterStatus, "Den valda tråden återupptas nu i konversationsytan.", "success");
      setAppView("conversations");
      applyFocusSection("conversation");
      setStudioOpen(false);
      setContextCollapsed(false);
      return;
    }
    if (key === "history") {
      if (selectedFeedThread?.id) {
        selectRuntimeThread(selectedFeedThread.id);
      }
      setAuxStatus(sentStatus, "Historiken öppnades i fokusytan för det skickade spåret.", "success");
      setAppView("conversations");
      applyFocusSection("history");
      return;
    }
    if (state.view === "later") {
      setAuxStatus(laterStatus, "Du är tillbaka i konversationsytan.", "success");
    }
    if (state.view === "sent") {
      setAuxStatus(sentStatus, "Du är tillbaka i inkorgen från skickat-vyn.", "success");
    }
    setAppView("conversations");
  }

  async function handleIntegrationToggle(integrationKey) {
    const key = normalizeKey(integrationKey);
    if (!key) return;
    if (state.integrationsRuntime.authRequired && !getAdminToken()) {
      window.location.assign(buildReauthUrl());
      return;
    }

    const record = getIntegrationRuntimeRecord(key);
    if (!record) return;

    state.integrationsRuntime.pendingKey = key;
    let feedbackMessage = "";
    let feedbackTone = "";
    renderIntegrations();
    try {
      const action = record.isConnected ? "disconnect" : "connect";
      const payload = await apiRequest(`/api/v1/cco/integrations/${key}/${action}`, {
        method: "POST",
        headers: {
          "x-idempotency-key": createIdempotencyKey(`major-arcana-integration-${key}-${action}`),
        },
      });
      const nextRecord = payload?.integration
        ? {
            id: normalizeKey(payload.integration.id),
            category: normalizeKey(payload.integration.category) || record.category,
            isConnected: payload.integration.isConnected !== false,
            statusTone: normalizeKey(payload.integration.statusTone) || "idle",
            statusSummary: asText(payload.integration.statusSummary),
            watchLabel: asText(payload.integration.watchLabel),
            updatedAt: asText(payload.integration.updatedAt || payload.integration.configuredAt),
            configurable: payload.integration.configurable !== false,
            docsAvailable: payload.integration.docsAvailable !== false,
          }
        : null;
      if (nextRecord) {
        const currentRecords = asArray(state.integrationsRuntime.records).filter(
          (item) => normalizeKey(item?.id) !== key
        );
        currentRecords.push(nextRecord);
        state.integrationsRuntime.records = currentRecords;
        state.integrationsRuntime.loaded = true;
        state.integrationsRuntime.authRequired = false;
        state.integrationsRuntime.error = "";
        state.integrationsRuntime.partial = false;
      }
      feedbackMessage = nextRecord?.isConnected
          ? nextRecord.watchLabel || "Integrationen anslöts och är redo för uppföljning."
          : "Integrationen kopplades från utan att metadata togs bort.";
      feedbackTone = "success";
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.integrationsRuntime.authRequired = true;
        renderIntegrations();
        window.location.assign(buildReauthUrl());
        return;
      }
      feedbackMessage = error?.message || "Kunde inte uppdatera integrationskopplingen.";
      feedbackTone = "error";
    } finally {
      state.integrationsRuntime.pendingKey = "";
      renderIntegrations();
      if (feedbackMessage) {
        setAuxStatus(integrationsStatus, feedbackMessage, feedbackTone);
      }
    }
  }

  async function handleIntegrationCommand(commandKey) {
    const key = normalizeKey(commandKey);
    if (state.integrationsRuntime.authRequired && !getAdminToken()) {
      window.location.assign(buildReauthUrl());
      return;
    }

    if (key === "docs") {
      const docsWindow = window.open("", "_blank", "noopener");
      setAuxStatus(integrationsStatus, "Läser integrationsdocs…", "loading");
      try {
        const payload = await apiRequest("/api/v1/cco/integrations/docs");
        state.integrationsRuntime.docsPayload = payload;
        if (docsWindow) {
          docsWindow.document.open();
          docsWindow.document.write(buildIntegrationDocsHtml(payload));
          docsWindow.document.close();
        }
        setAuxStatus(integrationsStatus, "Integrationsdocs öppnades i ett nytt fönster.", "success");
      } catch (error) {
        if (docsWindow) docsWindow.close();
        if (isAuthFailure(error?.statusCode, error?.message)) {
          state.integrationsRuntime.authRequired = true;
          renderIntegrations();
          window.location.assign(buildReauthUrl());
          return;
        }
        setAuxStatus(
          integrationsStatus,
          error?.message || "Kunde inte läsa integrationsdokumentationen.",
          "error"
        );
      }
      return;
    }

    setAuxStatus(integrationsStatus, "Skickar enterprise-förfrågan…", "loading");
    try {
      const actor = await ensureIntegrationActorProfile();
      const payload = await apiRequest("/api/v1/cco/integrations/contact-sales", {
        method: "POST",
        headers: {
          "x-idempotency-key": createIdempotencyKey("major-arcana-integration-sales"),
        },
        body: {
          name: actor.name,
          email: actor.email,
          message: buildIntegrationSalesMessage(),
        },
      });
      state.integrationsRuntime.lastSalesLeadAt =
        asText(payload?.createdAt) || new Date().toISOString();
      setAuxStatus(
        integrationsStatus,
        "Sales-förfrågan skickades från nya CCO och loggades i backend.",
        "success"
      );
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.integrationsRuntime.authRequired = true;
        renderIntegrations();
        window.location.assign(buildReauthUrl());
        return;
      }
      setAuxStatus(
        integrationsStatus,
        error?.message || "Kunde inte skicka sales-förfrågan.",
        "error"
      );
    }
  }

  async function handleMacroCommand(commandKey) {
    const key = normalizeKey(commandKey);
    if (key !== "create") return;
    if (state.macrosRuntime.authRequired && !getAdminToken()) {
      window.location.assign(buildReauthUrl());
      return;
    }
    setMacroModalOpen(true, { mode: "create" });
    setAuxStatus(macrosStatus, "Makromodalen är öppnad i nya CCO.", "success");
  }

  async function handleMacroCardAction(actionKey, macroKey) {
    const normalizedAction = normalizeKey(actionKey);
    const normalizedKey = normalizeKey(macroKey);
    const macro = state.macros.find((item) => normalizeKey(item.id || item.key) === normalizedKey);
    if (!macro) return;

    if (normalizedAction === "open") {
      setAppView("automation");
      setAutomationSubnav("byggare");
      setAuxStatus(
        macrosStatus,
        `Makrot "${macro.title}" öppnades i automationens arbetsyta.`,
        "success"
      );
      return;
    }

    if (state.macrosRuntime.authRequired && !getAdminToken()) {
      window.location.assign(buildReauthUrl());
      return;
    }

    if (normalizedAction === "edit") {
      setMacroModalOpen(true, {
        mode: "edit",
        macroId: macro.id || macro.key,
      });
      setAuxStatus(macrosStatus, `Makrot "${macro.title}" öppnades för redigering.`, "success");
      return;
    }

    if (normalizedAction === "delete") {
      openConfirmDialog("macro_delete", {
        macroTitle: macro.title,
        onConfirm: async () => {
          state.macrosRuntime.pendingAction = "delete";
          state.macrosRuntime.pendingMacroId = macro.id || macro.key;
          renderMacros();
          setFeedback(confirmFeedback, "loading", "Raderar makro…");
          try {
            const payload = await apiRequest(`/api/v1/cco/macros/${encodeURIComponent(macro.id)}`, {
              method: "DELETE",
              headers: {
                "x-idempotency-key": createIdempotencyKey(`major-arcana-macro-delete-${macro.id}`),
              },
            });
            if (payload?.deleted !== true) {
              throw new Error("Makrot kunde inte bekräftas som raderat.");
            }
            state.macros = state.macros.filter(
              (item) => normalizeKey(item.id || item.key) !== normalizedKey
            );
            renderShowcase();
            setConfirmDialogOpen(false);
            setAuxStatus(macrosStatus, `Makrot "${macro.title}" togs bort.`, "success");
          } catch (error) {
            if (isAuthFailure(error?.statusCode, error?.message)) {
              state.macrosRuntime.authRequired = true;
              renderMacros();
              window.location.assign(buildReauthUrl());
              return;
            }
            setFeedback(
              confirmFeedback,
              "error",
              error?.message || "Kunde inte radera makrot."
            );
          } finally {
            state.macrosRuntime.pendingAction = "";
            state.macrosRuntime.pendingMacroId = "";
            renderMacros();
          }
        },
      });
      return;
    }

    state.macrosRuntime.pendingAction = normalizedAction;
    state.macrosRuntime.pendingMacroId = macro.id || macro.key;
    renderMacros();

    try {
      if (normalizedAction === "run") {
        const payload = await apiRequest(`/api/v1/cco/macros/${encodeURIComponent(macro.id)}/run`, {
          method: "POST",
          headers: {
            "x-idempotency-key": createIdempotencyKey(`major-arcana-macro-run-${macro.id}`),
          },
        });
        if (payload?.macro) {
          const nextMacro = createMacroCardFromRecord(payload.macro, 0);
          state.macros = state.macros.map((item) =>
            normalizeKey(item.id || item.key) === normalizedKey ? nextMacro : item
          );
        }
        setAppView("conversations");
        applyStudioMode("reply");
        setStudioOpen(true);
        renderShowcase();
        setAuxStatus(macrosStatus, `Makrot "${macro.title}" kördes från nya CCO.`, "success");
      }
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.macrosRuntime.authRequired = true;
        renderMacros();
        window.location.assign(buildReauthUrl());
        return;
      }
      setAuxStatus(
        macrosStatus,
        error?.message || "Kunde inte uppdatera makrot.",
        "error"
      );
    } finally {
      state.macrosRuntime.pendingAction = "";
      state.macrosRuntime.pendingMacroId = "";
      renderMacros();
    }
  }

  async function saveSettingsRuntime(successMessage = "Inställningen sparades.") {
    if (state.settingsRuntime.authRequired && !getAdminToken()) {
      window.location.assign(buildReauthUrl());
      return false;
    }

    state.settingsRuntime.saving = true;
    state.settingsRuntime.error = "";
    renderSettings();
    let feedbackMessage = "";
    let feedbackTone = "";
    try {
      const payload = await apiRequest("/api/v1/cco/settings", {
        method: "PUT",
        headers: {
          "x-idempotency-key": createIdempotencyKey("major-arcana-settings-save"),
        },
        body: buildSettingsPayloadFromState(),
      });
      if (payload?.settings) {
        applySettingsViewState(payload.settings);
        state.settingsRuntime.loaded = true;
        state.settingsRuntime.lastLoadedAt = new Date().toISOString();
      }
      renderShowcase();
      feedbackMessage = successMessage;
      feedbackTone = "success";
      return true;
    } catch (error) {
      if (isAuthFailure(error?.statusCode, error?.message)) {
        state.settingsRuntime.authRequired = true;
        renderSettings();
        window.location.assign(buildReauthUrl());
        return false;
      }
      state.settingsRuntime.error = error?.message || "Kunde inte spara inställningarna.";
      renderSettings();
      return false;
    } finally {
      state.settingsRuntime.saving = false;
      renderSettings();
      if (feedbackMessage) {
        setAuxStatus(settingsStatus, feedbackMessage, feedbackTone);
      }
    }
  }

  function handleSettingsChoice(choiceKey, valueKey) {
    state.settingsRuntime.choices[normalizeKey(choiceKey)] = normalizeKey(valueKey);
    renderSettings();
    saveSettingsRuntime("Valet sparades i nya CCO.").catch((error) => {
      console.warn("Settings choice-save misslyckades.", error);
    });
  }

  function handleSettingsToggle(toggleKey, checked) {
    state.settingsRuntime.toggles[normalizeKey(toggleKey)] = Boolean(checked);
    renderSettings();
    saveSettingsRuntime("Inställningen sparades i nya CCO.").catch((error) => {
      console.warn("Settings toggle-save misslyckades.", error);
    });
  }

  async function handleSettingsAction(actionKey) {
    const key = normalizeKey(actionKey);
    if (key === "show_shortcuts") {
      setSelectedShowcaseFeature("command_palette");
      setAppView("showcase");
      setAuxStatus(showcaseStatus, "Kommandopaletten är nu i fokus i showcase-vyn.", "success");
      return;
    }
    if (key === "edit_profile") {
      setSettingsProfileModalOpen(true);
      setAuxStatus(settingsStatus, "Profilredigeringen öppnades i nya CCO.", "success");
      return;
    }
    if (key === "delete_account") {
      openConfirmDialog("delete_account_request", {
        onConfirm: async () => {
          state.settingsRuntime.saving = true;
          renderSettings();
          setFeedback(confirmFeedback, "loading", "Skickar raderingsbegäran…");
          try {
            const payload = await apiRequest("/api/v1/cco/settings/request-delete-account", {
              method: "POST",
              headers: {
                "x-idempotency-key": createIdempotencyKey("major-arcana-settings-delete-request"),
              },
              body: {},
            });
            state.settingsRuntime.deleteRequestedAt = asText(payload?.deleteRequestedAt);
            setConfirmDialogOpen(false);
            setAuxStatus(
              settingsStatus,
              "Kontot markerades för radering i backend och väntar på uppföljning.",
              "success"
            );
          } catch (error) {
            if (isAuthFailure(error?.statusCode, error?.message)) {
              state.settingsRuntime.authRequired = true;
              renderSettings();
              window.location.assign(buildReauthUrl());
              return;
            }
            state.settingsRuntime.error =
              error?.message || "Kunde inte flagga kontot för radering.";
            setFeedback(confirmFeedback, "error", state.settingsRuntime.error);
          } finally {
            state.settingsRuntime.saving = false;
            renderSettings();
          }
        },
      });
      return;
    }
  }

  function createPillIcon(iconKey) {
    const svgMarkup = PILL_ICON_SVGS[normalizeKey(iconKey)];
    if (!svgMarkup) return null;
    const icon = document.createElement("span");
    icon.className = "pill-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = svgMarkup;
    return icon;
  }

  function decorateStaticPills() {
    document.querySelectorAll("[data-pill-icon]").forEach((node) => {
      if (node.querySelector(".pill-icon")) return;
      const icon = createPillIcon(node.dataset.pillIcon);
      if (!icon) return;
      node.prepend(icon);
    });
  }

  function renderRuntimeFocusSignals(thread) {
    if (!thread) {
      renderSignalRows(focusSignalRows, []);
      return;
    }
    const items = [
      { label: thread.statusLabel, tone: "rose", icon: "mail" },
      { label: thread.followUpLabel || thread.waitingLabel, tone: "blue", icon: "history" },
      { label: thread.riskLabel, tone: "green", icon: "note" },
    ];
    renderSignalRows(focusSignalRows, items);
  }

  function deriveIntelVipStatus(thread) {
    if (thread?.isVIP) return "vip";
    const engagementScore = clamp(asNumber(thread?.raw?.customerSummary?.engagementScore, 0.42), 0, 1);
    if (engagementScore >= 0.72) return "high_value";
    if (engagementScore >= 0.54) return "loyal";
    return "standard";
  }

  function deriveIntelRelationshipSensitivity(thread) {
    if (!thread) return "medium";
    const tags = asArray(thread.tags);
    if (tags.includes("high-risk") || tags.includes("act-now")) return "high";
    if (tags.includes("sprint") || tags.includes("today")) return "medium";
    return "low";
  }

  function buildIntelJourneyEvents(thread) {
    const events = [];
    const historyItems = asArray(thread?.historyEvents);
    const firstEvent = historyItems[historyItems.length - 1];
    const latestEvent = historyItems[0];
    if (firstEvent?.recordedAt) {
      events.push({
        id: `${thread.id}-first-contact`,
        type: "contact",
        label: "Första kontakt",
        date: formatConversationTime(firstEvent.recordedAt),
        note: compactRuntimeCopy(firstEvent.detail || firstEvent.description, "Relation etablerad.", 72),
        tone: "neutral",
      });
    }
    if (asText(thread?.raw?.plannedTreatment || thread?.raw?.treatmentContext || thread?.raw?.medicalContext)) {
      events.push({
        id: `${thread.id}-treatment`,
        type: "treatment",
        label: asText(
          thread.raw.plannedTreatment || thread.raw.treatmentContext || thread.raw.medicalContext,
          "Behandlingsspår"
        ),
        date: thread.followUpLabel || thread.lastActivityLabel || "Nuvarande spår",
        note: compactRuntimeCopy(thread.riskReason || thread.nextActionSummary, "Följ klinikens plan för nästa steg.", 72),
        tone: "success",
      });
    }
    if (thread?.followUpLabel) {
      events.push({
        id: `${thread.id}-follow-up`,
        type: "follow_up",
        label: "Planerad uppföljning",
        date: thread.followUpLabel,
        note: compactRuntimeCopy(thread.nextActionSummary, "Följ upp kunden i rätt tid.", 72),
        tone: "warn",
      });
    }
    events.push({
      id: `${thread.id}-current-state`,
      type: "status",
      label: thread?.lifecycleLabel || "Aktiv dialog",
      date: latestEvent?.recordedAt ? formatConversationTime(latestEvent.recordedAt) : thread?.lastActivityLabel || "Nu",
      note: compactRuntimeCopy(thread?.whyInFocus, "Aktiv kundrelation i live-spåret.", 72),
        tone: asArray(thread?.tags).includes("high-risk") ? "warn" : "neutral",
    });
    return events.slice(0, 4);
  }

  function buildIntelHelperConversation(thread) {
    const raw = thread?.raw && typeof thread.raw === "object" ? thread.raw : {};
    const customerSummary =
      raw.customerSummary && typeof raw.customerSummary === "object" ? raw.customerSummary : {};
    const recentTreatments = asArray(
      raw.recentTreatments || customerSummary.recentTreatments || raw.treatmentHistory || customerSummary.treatments
    )
      .map((entry) => asText(entry))
      .filter(Boolean)
      .slice(0, 4);
    const medicalFlags = asArray(raw.medicalFlags)
      .map((entry) => asText(entry))
      .filter(Boolean)
      .slice(0, 3);
    if (raw.needsMedicalReview === true || asArray(thread?.tags).includes("medical")) {
      medicalFlags.unshift("Medicinsk granskning");
    }
    if (asText(raw.dominantRisk)) {
      medicalFlags.push(humanizeCode(raw.dominantRisk, asText(raw.dominantRisk)));
    }
    return {
      ...raw,
      customerName: thread?.customerName,
      owner: thread?.ownerLabel,
      customerSince:
        asText(raw.customerSince) ||
        asText(customerSummary.customerSince) ||
        asText(asArray(thread?.historyEvents)[asArray(thread?.historyEvents).length - 1]?.recordedAt),
      lifecycleStage: asText(raw.lifecycleStage || customerSummary.lifecycleStatus || thread?.lifecycleLabel),
      journeyStage: asText(raw.journeyStage || raw.lifecycleStage || customerSummary.lifecycleStatus || thread?.lifecycleLabel),
      journeyEvents: buildIntelJourneyEvents(thread),
      vipStatus: asText(raw.vipStatus || customerSummary.vipStatus || deriveIntelVipStatus(thread)),
      lifetimeValue: asNumber(raw.lifetimeValue ?? customerSummary.lifetimeValue ?? customerSummary.totalValue, 0),
      relationshipSensitivity: asText(
        raw.relationshipSensitivity || customerSummary.relationshipSensitivity || deriveIntelRelationshipSensitivity(thread)
      ),
      duplicateState: asText(raw.duplicateState || customerSummary.duplicateState || "clear"),
      duplicateNote: asText(raw.duplicateNote || customerSummary.duplicateNote),
      consentStatus:
        raw.consentStatus && typeof raw.consentStatus === "object"
          ? raw.consentStatus
          : customerSummary.consentStatus && typeof customerSummary.consentStatus === "object"
            ? customerSummary.consentStatus
            : {},
      insuranceContext: asText(raw.insuranceContext || customerSummary.insuranceContext || thread?.mailboxesLabel),
      plannedTreatment: asText(raw.plannedTreatment || raw.caseType || raw.treatmentContext || raw.medicalContext),
      returnVisitState: asText(raw.returnVisitState || customerSummary.returnVisitState || thread?.lifecycleLabel),
      recentTreatments,
      medicalFlags: Array.from(new Set(medicalFlags)).slice(0, 3),
      treatmentContext: asText(raw.treatmentContext || raw.medicalContext || thread?.riskReason),
      customerContext: asText(raw.customerContext || customerSummary.lastCaseSummary || thread?.whyInFocus),
      followUpDeadline: thread?.followUpLabel,
      nextActionSummary: thread?.nextActionSummary,
      queueReason: thread?.whyInFocus,
      activeEditor: asText(raw.activeEditor || raw.ownerEditing),
      activeViewers: asArray(raw.activeViewers),
      collisionState: asText(raw.collisionState),
      draftOwner: asText(raw.draftOwner || raw.owner),
      draftUpdatedAt: asText(raw.draftUpdatedAt || raw.lastActionTakenAt || raw.lastOutboundAt || raw.lastInboundAt),
      handoffRequest: asText(raw.handoffRequest),
      handoffTarget: asText(raw.handoffTarget),
      handoffNote: asText(raw.handoffNote || raw.escalationRule),
      handoffStatusDetail: asText(raw.handoffStatusDetail || raw.escalationRule),
    };
  }

  function renderRuntimeConversationShell() {
    ensureRuntimeSelection();
    renderRuntimeQueue();
    renderQuickActionRows(queueActionRows, QUEUE_ACTIONS);
    renderQueueHistorySection();
    renderMailFeeds();
    renderThreadContextRows();
    const selectedThread = getSelectedRuntimeThread();
    const focusNotesHeading = document.querySelector(".focus-notes-head h3");
    if (focusNotesHeading) {
      focusNotesHeading.textContent = selectedThread
        ? `Anteckningar för ${selectedThread.customerName}`
        : state.runtime.authRequired
          ? "Anteckningar kräver inloggning"
          : "Anteckningar";
    }
    renderRuntimeFocusSignals(selectedThread);
    renderQuickActionRows(focusActionRows, FOCUS_ACTIONS);
    renderRuntimeFocusConversation(selectedThread);
    renderRuntimeCustomerPanel(selectedThread);
    renderFocusHistorySection(selectedThread);
    renderFocusNotesSection();
    renderQuickActionRows(intelActionRows, INTEL_ACTIONS);
    renderRuntimeIntel(selectedThread);
    renderStudioShell();
    renderWorkspaceRuntimeContext();
    renderAnalyticsRuntime();
  }

  function isLaterRuntimeThread(thread) {
    const raw = thread?.raw && typeof thread.raw === "object" ? thread.raw : {};
    const lastAction = normalizeKey(raw.lastActionTakenLabel || "");
    const nextAction = normalizeKey(thread?.nextActionLabel || raw.nextActionLabel || "");
    const waitingOn = normalizeKey(raw.waitingOn || "");
    return (
      asArray(thread?.tags).includes("later") ||
      lastAction.includes("svara senare") ||
      lastAction.includes("reply later") ||
      nextAction.includes("återuppta senare") ||
      nextAction.includes("resume later") ||
      (waitingOn === "owner" &&
        Boolean(asText(raw.followUpDueAt || raw.followUpSuggestedAt || thread?.followUpLabel)))
    );
  }

  function isSentRuntimeThread(thread) {
    const raw = thread?.raw && typeof thread.raw === "object" ? thread.raw : {};
    const lastAction = normalizeKey(raw.lastActionTakenLabel || "");
    const lastOutboundAt = toIso(raw.lastOutboundAt || "");
    const lastInboundAt = toIso(raw.lastInboundAt || "");
    const historyContainsSent = asArray(thread?.historyEvents)
      .slice(0, 4)
      .some((event) => {
        const haystack = `${asText(event?.title)} ${asText(event?.description)}`.toLowerCase();
        return haystack.includes("e-post skickat") || haystack.includes("email sent");
      });
    return (
      lastAction.includes("svar skickat") ||
      lastAction.includes("reply sent") ||
      historyContainsSent ||
      (lastOutboundAt &&
        (!lastInboundAt || Date.parse(lastOutboundAt) >= Date.parse(lastInboundAt)))
    );
  }

  function renderQuickActionRows(rows, items) {
    const selectedThread = getSelectedRuntimeThread();
    const isDeletingThread = Boolean(asText(state.runtime.deletingThreadId));
    rows.forEach((row) => {
      row.innerHTML = "";
      items.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `quick-action-pill quick-action-pill--${item.tone}`;
        button.dataset.quickAction = item.action;
        const isDeleteAction = item.action === "delete";
        if (item.mode) {
          button.dataset.quickMode = item.mode;
        }
        if (item.target) {
          button.dataset.quickTarget = item.target;
        }
        if (isDeleteAction) {
          const deleteDisabled =
            !selectedThread || !state.runtime.deleteEnabled || isDeletingThread;
          button.disabled = deleteDisabled;
          button.setAttribute("aria-disabled", String(deleteDisabled));
        }
        const icon = createPillIcon(item.icon);
        if (icon) button.appendChild(icon);
        button.appendChild(
          document.createTextNode(
            isDeleteAction && isDeletingThread ? "Raderar…" : item.label
          )
        );
        row.appendChild(button);
      });
    });
  }

  function renderSignalRows(rows, items) {
    rows.forEach((row) => {
      row.innerHTML = "";
      items.forEach((item) => {
        const pill = document.createElement("span");
        pill.className = `status-pill status-pill--${item.tone}`;
        const icon = createPillIcon(item.icon);
        if (icon) pill.appendChild(icon);
        pill.appendChild(document.createTextNode(item.label));
        row.appendChild(pill);
      });
    });
  }

  function setAppView(view = "conversations") {
    const normalizedView = workspaceSourceOfTruth.setView(view);
    const shellView = resolveShellView(normalizedView);
    const aliasAutomationSection = resolveAutomationSectionForView(normalizedView);
    const showConversations = shellView === "conversations";
    canvas.dataset.appView = normalizedView;
    canvas.dataset.appShellView = shellView;

    shellViewSections.forEach((section) => {
      section.hidden = normalizeKey(section.dataset.shellView) !== shellView;
    });

    previewShell.hidden = !showConversations;
    focusShell.hidden = !showConversations;
    resizeHandles.forEach((handle) => {
      handle.hidden = !showConversations;
    });

    navViewButtons.forEach((button) => {
      const buttonView = normalizeKey(button.dataset.navView);
      const isActive =
        buttonView === normalizedView ||
        (buttonView === "automation" && shellView === "automation");
      button.classList.toggle("preview-nav-item-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    if (moreMenuToggle) {
      const isMoreView = AUX_VIEWS.has(shellView);
      moreMenuToggle.classList.toggle("preview-nav-item-active", isMoreView);
      moreMenuToggle.setAttribute("aria-pressed", isMoreView ? "true" : "false");
    }

    setMoreMenuOpen(false);

    if (!showConversations) {
      setStudioOpen(false);
      setNoteOpen(false);
      setNoteModeOpen(false);
      setScheduleOpen(false);
      setLaterOpen(false);
      setContextCollapsed(false);
    }

    if (shellView === "customers") {
      loadCustomersRuntime().catch((error) => {
        console.warn("Customers live-laddning misslyckades.", error);
        applyCustomerFilters();
      });
    }

    if (shellView === "analytics") {
      renderAnalyticsRuntime();
      loadAnalyticsRuntime().catch((error) => {
        console.warn("Analytics live-laddning misslyckades.", error);
      });
    }

    if (shellView === "automation") {
      if (aliasAutomationSection) {
        setAutomationSubnav(aliasAutomationSection);
      }
      renderAutomationTemplateConfig();
      renderAutomationTestingState();
      renderAutomationVersions();
      loadAutomationVersions(state.selectedAutomationTemplate).catch((error) => {
        console.warn("Automation live-laddning misslyckades.", error);
      });
    }

    if (shellView === "integrations") {
      renderIntegrations();
      loadIntegrationsRuntime().catch((error) => {
        console.warn("Integrations live-laddning misslyckades.", error);
      });
    }

    if (shellView === "macros") {
      renderMacros();
      loadMacrosRuntime().catch((error) => {
        console.warn("Macros live-laddning misslyckades.", error);
      });
    }

    if (shellView === "settings") {
      renderSettings();
      loadSettingsRuntime().catch((error) => {
        console.warn("Settings live-laddning misslyckades.", error);
      });
    }

    if (shellView === "showcase") {
      renderShowcase();
      loadMacrosRuntime().catch((error) => {
        console.warn("Showcase macros-laddning misslyckades.", error);
      });
      loadSettingsRuntime().catch((error) => {
        console.warn("Showcase settings-laddning misslyckades.", error);
      });
      loadIntegrationsRuntime().catch((error) => {
        console.warn("Showcase integrations-laddning misslyckades.", error);
      });
    }

    normalizeWorkspaceState();
    syncShellViewToLocation();
  }

  function setSelectedAnalyticsPeriod(periodKey) {
    const normalizedKey = normalizeKey(periodKey) || "week";
    state.selectedAnalyticsPeriod = normalizedKey;

    analyticsPeriodButtons.forEach((button) => {
      const isActive =
        normalizeKey(button.dataset.analyticsPeriod) === state.selectedAnalyticsPeriod;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderAnalyticsPeriod();
    renderAnalyticsRuntime();

    if (state.view === "analytics") {
      loadAnalyticsRuntime({ force: true }).catch((error) => {
        console.warn("Analytics period-laddning misslyckades.", error);
      });
    }
  }

  function setSelectedMailFeedItem(feedKey, itemKey) {
    const normalizedFeed = normalizeKey(feedKey);
    state.selectedMailFeedKey[normalizedFeed] = normalizeKey(itemKey);
    renderMailFeeds();
  }

  function setSelectedIntegrationCategory(categoryKey) {
    state.selectedIntegrationCategory = normalizeKey(categoryKey) || "all";
    renderIntegrations();
  }

  function setSelectedCustomerIdentity(customerKey) {
    const normalizedKey = normalizeKey(customerKey);
    state.selectedCustomerIdentity =
      normalizedKey || getVisibleCustomerPoolKeys()[0] || "johan";

    customerRows.forEach((row) => {
      const isActive = normalizeKey(row.dataset.customerRow) === state.selectedCustomerIdentity;
      row.classList.toggle("is-selected", isActive);
      row.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    customerMergeGroups.forEach((group) => {
      const isActive =
        normalizeKey(group.dataset.customerMergeGroup) === state.selectedCustomerIdentity;
      group.hidden = !isActive;
      group.classList.toggle("is-active", isActive);
    });

    customerDetailCards.forEach((card) => {
      const isActive =
        normalizeKey(card.dataset.customerDetail) === state.selectedCustomerIdentity;
      card.hidden = !isActive;
      card.classList.toggle("is-active", isActive);
    });

    renderCustomerMergeGroups();
    renderCustomerDetailTools();
    renderCustomerBatchSelection();
  }

  function setSelectedAutomationLibrary(libraryKey) {
    const normalizedKey = normalizeKey(libraryKey);
    state.selectedAutomationLibrary = normalizedKey || "email";

    automationLibraryItems.forEach((item) => {
      const isActive =
        normalizeKey(item.dataset.automationLibrary) === state.selectedAutomationLibrary;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setSelectedAutomationNode(nodeKey) {
    const normalizedKey = normalizeKey(nodeKey);
    state.selectedAutomationNode = normalizedKey || "trigger";
    const selectedSuggestionKey =
      AUTOMATION_NODE_TO_SUGGESTION[state.selectedAutomationNode] || "";

    automationNodes.forEach((node) => {
      const isActive =
        normalizeKey(node.dataset.automationNode) === state.selectedAutomationNode;
      node.classList.toggle("is-selected", isActive);
      node.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    automationSuggestionCards.forEach((card) => {
      const isActive =
        normalizeKey(card.dataset.automationSuggestion) === selectedSuggestionKey;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setAutomationSubnav(activeLabel) {
    const normalizedLabel = normalizeKey(activeLabel) || "byggare";
    const supportsOwnView =
      normalizedLabel === "byggare" ||
      normalizedLabel === "analys" ||
      normalizedLabel === "mallar" ||
      normalizedLabel === "testing" ||
      normalizedLabel === "versioner" ||
      normalizedLabel === "autopilot";
    const activeView =
      normalizedLabel === "analys"
        ? "analys"
        : normalizedLabel === "mallar"
          ? "mallar"
          : normalizedLabel === "testing"
            ? "testing"
            : normalizedLabel === "versioner"
              ? "versioner"
              : normalizedLabel === "autopilot"
                ? "autopilot"
              : "byggare";
    const activePillKey = supportsOwnView ? normalizedLabel : activeView;
    state.selectedAutomationSection = activeView;
    const currentView = normalizeKey(state.view) || "conversations";
    if (
      (currentView === "templates" && activeView !== "mallar") ||
      (currentView === "workflows" && activeView !== "byggare")
    ) {
      workspaceSourceOfTruth.setView("automation");
      state.view = "automation";
    }

    automationSubnavPills.forEach((pill) => {
      const pillKey = normalizeKey(pill.dataset.automationSection || pill.textContent);
      const isActive = pillKey === activePillKey;
      pill.classList.toggle("is-active", isActive);
      pill.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    automationViews.forEach((view) => {
      const isActive = normalizeKey(view.dataset.automationView) === activeView;
      view.hidden = !isActive;
      view.classList.toggle("is-active", isActive);
      view.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
    syncShellViewToLocation();
  }

  function setSelectedAutomationTemplate(templateKey) {
    const normalizedKey = normalizeKey(templateKey);
    state.selectedAutomationTemplate = normalizedKey || "churn_guard";

    automationTemplateCards.forEach((card) => {
      const isActive =
        normalizeKey(card.dataset.automationTemplate) === state.selectedAutomationTemplate;
      card.classList.toggle("is-selected", isActive);
      card.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderAutomationTemplateConfig();
    renderAutomationTestingState();
    renderAutomationVersions();
    loadAutomationVersions(state.selectedAutomationTemplate).catch((error) => {
      console.warn("Automation template-laddning misslyckades.", error);
    });
  }

  function setSelectedAutomationVersion(versionKey) {
    const normalizedKey = normalizeKey(versionKey);
    state.selectedAutomationVersion = normalizedKey || "v3_0";

    automationVersionCards.forEach((card) => {
      const isActive =
        normalizeKey(card.dataset.automationVersion) === state.selectedAutomationVersion;
      card.classList.toggle("is-selected", isActive);
      card.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    automationVersionDetails.forEach((detail) => {
      const isActive =
        normalizeKey(detail.dataset.automationVersionDetail) ===
        state.selectedAutomationVersion;
      detail.hidden = !isActive;
      detail.classList.toggle("is-active", isActive);
      detail.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  }

  function setAutomationAutopilotEnabled(enabled) {
    const isEnabled = Boolean(enabled);
    state.automationAutopilotEnabled = isEnabled;

    if (automationAutopilotToggle) {
      automationAutopilotToggle.classList.toggle("is-active", isEnabled);
      automationAutopilotToggle.setAttribute("aria-pressed", isEnabled ? "true" : "false");
    }

    if (automationAutopilotStatusCard) {
      automationAutopilotStatusCard.classList.toggle("is-paused", !isEnabled);
      const label = automationAutopilotStatusCard.querySelector("span");
      const copy = automationAutopilotStatusCard.querySelector("strong");
      if (label) {
        label.textContent = isEnabled ? "Autopilot aktiv" : "Autopilot pausad";
      }
      if (copy) {
        copy.textContent = isEnabled
          ? "Analyserar kontinuerligt arbetsflödesprestanda och föreslår optimeringar"
          : "Autopilot är pausad. Förslag och auto-fix ligger kvar men inga nya ändringar föreslås.";
      }
    }

    renderAutomationAutopilot();
  }

  function setSelectedAutomationAutopilotProposal(proposalKey) {
    const normalizedKey = normalizeKey(proposalKey);
    state.selectedAutomationAutopilotProposal = normalizedKey || "merge_duplicates";

    automationAutopilotProposalCards.forEach((card) => {
      const isActive =
        normalizeKey(card.dataset.automationAutopilotProposal) ===
        state.selectedAutomationAutopilotProposal;
      card.classList.toggle("is-selected", isActive);
      card.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderAutomationAutopilot();
  }

  function applyFocusSection(section) {
    const activeSection = workspaceSourceOfTruth.setFocusSection(section);
    focusTabButtons.forEach((button) => {
      const isActive = button.dataset.focusSection === activeSection;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    focusPanels.forEach((panel) => {
      const isActive = panel.dataset.focusPanel === activeSection;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  }

  function applyReplyLaterToThread(thread, label, { closeStudio = false } = {}) {
    if (!thread) return false;
    patchStudioThreadAfterReplyLater(thread, label);
    if (closeStudio) {
      setStudioFeedback(`Tråden parkerades till ${label}.`, "success");
      setStudioOpen(false);
      setContextCollapsed(false);
    } else if (focusStatusLine) {
      focusStatusLine.textContent = `Tråden parkerades till ${label}.`;
    }
    setAuxStatus(laterStatus, `Tråden parkerades till ${label.toLowerCase()}.`, "success");
    refreshWorkspaceBootstrapForSelectedThread("reply later");
    return true;
  }

  function applyHandledToThread(thread, outcome, { closeStudio = false } = {}) {
    if (!thread) return false;
    patchStudioThreadAfterHandled(thread, outcome);
    if (closeStudio) {
      setStudioFeedback(`Tråden markerades som klar: ${outcome}.`, "success");
      setStudioOpen(false);
      setContextCollapsed(false);
    } else if (focusStatusLine) {
      focusStatusLine.textContent = `Tråden markerades som klar: ${outcome}.`;
    }
    refreshWorkspaceBootstrapForSelectedThread("mark handled");
    return true;
  }

  async function applyLaterOption(optionKey) {
    state.later.option = normalizeKey(optionKey) || "one_hour";
    renderLaterOptions(state.later.option);
    setLaterOpen(false);
    const bulkSelectionKeys = asArray(state.later.bulkSelectionKeys)
      .map((key) => normalizeKey(key))
      .filter(Boolean);
    if (bulkSelectionKeys.length) {
      const label = getLaterOptionLabel(state.later.option);
      const selectedThreads = bulkSelectionKeys
        .map((threadId) =>
          asArray(state.runtime.threads).find(
            (thread) => normalizeKey(thread?.id) === normalizeKey(threadId)
          )
        )
        .filter(Boolean);
      state.later.bulkSelectionKeys = [];
      if (selectedThreads.length) {
        selectedThreads.forEach((thread) => {
          patchStudioThreadAfterReplyLater(thread, label);
        });
        getMailFeedRuntimeState("later").selectedKeys = [];
        selectRuntimeThread(selectedThreads[0].id);
        setAppView("conversations");
        applyFocusSection("conversation");
        setContextCollapsed(false);
        renderMailFeeds();
        setAuxStatus(
          laterStatus,
          `${selectedThreads.length} trådar parkerades till ${label.toLowerCase()}.`,
          "success"
        );
        return;
      }
    }
    const selectedThread = getSelectedRuntimeThread();
    if (selectedThread) {
      applyReplyLaterToThread(selectedThread, getLaterOptionLabel(state.later.option), {
        closeStudio: canvas.classList.contains("is-studio-open"),
      });
      applyFocusSection("conversation");
      return;
    }
    applyStudioMode("reply_later");
    setStudioOpen(true);
    setContextCollapsed(false);
  }

  function syncCurrentNoteDraftFromForm() {
    const activeKey = normalizeKey(state.note.activeKey);
    const definition = state.noteDefinitions[activeKey];
    if (!activeKey || !definition) return null;

    const currentDraft = state.note.drafts[activeKey] || createNoteDraft(definition);
    currentDraft.text = normalizeText(noteText?.value);
    currentDraft.priority = normalizeText(notePrioritySelect?.value) || currentDraft.priority;
    currentDraft.visibility = normalizeText(noteVisibilitySelect?.value) || currentDraft.visibility;
    state.note.drafts[activeKey] = currentDraft;
    return currentDraft;
  }

  function getActiveNoteDraft() {
    syncCurrentNoteDraftFromForm();
    return state.note.drafts[normalizeKey(state.note.activeKey)] || null;
  }

  function addTagToActiveDraft(rawValue) {
    const value = normalizeText(rawValue);
    if (!value) return;
    const draft = getActiveNoteDraft();
    if (!draft) return;
    const tags = tagsFrom([...(draft.tags || []), value]);
    draft.tags = tags;
    renderTags(tags);
    if (noteTagInput) {
      noteTagInput.value = "";
    }
  }

  function removeTagFromActiveDraft(tagValue) {
    const draft = getActiveNoteDraft();
    if (!draft) return;
    draft.tags = (draft.tags || []).filter(
      (tag) => normalizeKey(tag) !== normalizeKey(tagValue)
    );
    renderTags(draft.tags);
  }

  function applyTemplateToActiveDraft(templateKey) {
    const template = state.noteTemplatesByKey[normalizeKey(templateKey)];
    if (!template) return;
    const draft = getActiveNoteDraft();
    if (!draft) return;
    draft.text = normalizeText(template.text);
    draft.tags = tagsFrom(template.tags);
    draft.templateKey = template.key;
    renderNoteDestination(state.note.activeKey);
  }

  async function apiRequest(path, options = {}) {
    const url = new URL(path, window.location.origin);
    const isWorkspaceRequest = path.includes("/api/v1/cco-workspace/");
    const authToken = getAdminToken();
    const context = getActiveWorkspaceContext();

    if (isWorkspaceRequest && !url.searchParams.has("workspaceId")) {
      url.searchParams.set("workspaceId", context.workspaceId);
    }
    if (isWorkspaceRequest && context.conversationId && !url.searchParams.has("conversationId")) {
      url.searchParams.set("conversationId", context.conversationId);
    }
    if (isWorkspaceRequest && context.customerId && !url.searchParams.has("customerId")) {
      url.searchParams.set("customerId", context.customerId);
    }
    if (isWorkspaceRequest && context.customerName && !url.searchParams.has("customerName")) {
      url.searchParams.set("customerName", context.customerName);
    }

    const headerObject =
      options.headers && typeof options.headers === "object" && !Array.isArray(options.headers)
        ? options.headers
        : {};
    const requestBody =
      options.body === undefined || options.body === null
        ? undefined
        : isWorkspaceRequest
          ? { ...context, ...options.body }
          : options.body;

    const response = await fetch(url.toString(), {
      method: options.method || "GET",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        ...(authToken &&
        !("Authorization" in headerObject) &&
        !("authorization" in headerObject)
          ? { Authorization: `Bearer ${authToken}` }
          : {}),
        ...headerObject,
      },
      body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const error = new Error(payload?.error || "Request failed.");
      error.statusCode = response.status;
      error.metadata = payload?.metadata || null;
      throw error;
    }

    return payload;
  }

  function applyStudioTemplateSelection(templateKey) {
    const thread = getSelectedRuntimeThread();
    if (!thread) return;
    const studioState = ensureStudioState(thread);
    studioState.activeTemplateKey = normalizeKey(templateKey);
    studioState.activeTrackKey = studioState.activeTrackKey || inferStudioTrackKey(thread);
    studioState.activeRefineKey = "";
    studioState.draftBody = buildStudioTemplateDraft(thread, studioState.activeTemplateKey);
    studioState.baseDraftBody = studioState.draftBody;
    renderStudioShell();
    setStudioFeedback(`Mallen "${studioState.activeTemplateKey}" laddades i studion.`, "success");
  }

  function applyStudioTrackSelection(trackKey) {
    const thread = getSelectedRuntimeThread();
    if (!thread) return;
    const studioState = ensureStudioState(thread);
    studioState.activeTrackKey = normalizeKey(trackKey) || inferStudioTrackKey(thread);
    studioState.activeTemplateKey = "";
    studioState.activeRefineKey = "";
    studioState.draftBody = buildStudioTrackDraft(thread, studioState.activeTrackKey);
    studioState.baseDraftBody = studioState.draftBody;
    renderStudioShell();
    setStudioFeedback(`Responsspåret "${studioState.activeTrackKey}" är aktivt.`, "success");
  }

  function applyStudioToneSelection(toneKey) {
    const thread = getSelectedRuntimeThread();
    if (!thread) return;
    const studioState = ensureStudioState(thread);
    studioState.activeToneKey = normalizeKey(toneKey) || "professional";
    studioState.draftBody = buildStudioToneDraft(thread, studioState.draftBody, studioState.activeToneKey);
    studioState.baseDraftBody = studioState.draftBody;
    renderStudioShell();
    setStudioFeedback(`Tonfiltret "${studioState.activeToneKey}" applicerades.`, "success");
  }

  function applyStudioRefineSelection(refineKey) {
    const thread = getSelectedRuntimeThread();
    if (!thread) return;
    const studioState = ensureStudioState(thread);
    studioState.activeRefineKey = normalizeKey(refineKey);
    studioState.draftBody = buildStudioRefinedDraft(thread, studioState.draftBody, studioState.activeRefineKey);
    renderStudioShell();
    setStudioFeedback(`Finjusteringen "${studioState.activeRefineKey}" applicerades.`, "success");
  }

  function handleStudioToolAction(toolKey) {
    const thread = getSelectedRuntimeThread();
    if (!thread) return;
    const studioState = ensureStudioState(thread);
    const normalizedTool = normalizeKey(toolKey);
    if (normalizedTool === "warm") {
      applyStudioToneSelection("warm");
      return;
    }
    if (normalizedTool === "gift") {
      const giftLine =
        "\n\nPS: Om du vill kan jag även skicka ett konkret bokningsförslag eller prisupplägg direkt i samma tråd.";
      if (!studioState.draftBody.includes(giftLine.trim())) {
        studioState.draftBody = `${studioState.draftBody}${giftLine}`;
      }
      renderStudioShell();
      setStudioFeedback("Merförsäljningsrad lades till i utkastet.", "success");
      return;
    }
    if (normalizedTool === "admin") {
      applyStudioTrackSelection("admin");
      return;
    }
    if (normalizedTool === "regenerate") {
      studioState.activeTemplateKey = "";
      studioState.activeRefineKey = "";
      studioState.draftBody = buildStudioTrackDraft(thread, studioState.activeTrackKey);
      studioState.baseDraftBody = studioState.draftBody;
      renderStudioShell();
      setStudioFeedback("Studioutkastet regenererades från live-kontexten.", "success");
      return;
    }
    if (normalizedTool === "policy") {
      const policy = evaluateStudioPolicy(thread, studioState.draftBody);
      setStudioFeedback(policy.summary, policy.tone === "warning" ? "error" : "success");
    }
  }

  function startResize(handle, event) {
    if (!previewWorkspace) return;

    if (activeResizeCleanup) {
      activeResizeCleanup();
      activeResizeCleanup = null;
    }

    const handleType = handle.dataset.resizeHandle;
    const startX = event.clientX;
    const startState = { left: workspaceState.left, right: workspaceState.right };
    const availableWidth = getWorkspaceAvailableWidth();
    const gapTotal = getWorkspaceGapTotal();
    const lockedLeftMin = workspaceLimits.left.min;
    const lockedRightMin = workspaceLimits.right.min;
    const lockedMainMin = workspaceLimits.main.min;
    const isMouseDrag = event.type === "mousedown";
    const moveEventName = isMouseDrag ? "mousemove" : "pointermove";
    const endEventNames = isMouseDrag ? ["mouseup"] : ["pointerup", "pointercancel"];
    event.preventDefault();
    event.stopPropagation();

    const onPointerMove = (moveEvent) => {
      if (typeof moveEvent.preventDefault === "function") {
        moveEvent.preventDefault();
      }
      const delta = moveEvent.clientX - startX;

      if (handleType === "left-main") {
        workspaceState.left = Math.round(
          clamp(
            startState.left + delta,
            lockedLeftMin,
            Math.min(
              workspaceLimits.left.max,
              availableWidth - gapTotal - lockedMainMin - startState.right
            )
          )
        );
        workspaceState.right = startState.right;
        workspaceState.main = Math.max(
          lockedMainMin,
          Math.round(availableWidth - gapTotal - workspaceState.left - workspaceState.right)
        );
        applyWorkspaceState();
      }

      if (handleType === "main-right") {
        workspaceState.left = startState.left;
        workspaceState.right = Math.round(
          clamp(
            startState.right - delta,
            lockedRightMin,
            Math.min(
              workspaceLimits.right.max,
              availableWidth - gapTotal - lockedMainMin - startState.left
            )
          )
        );
        workspaceState.main = Math.max(
          lockedMainMin,
          Math.round(availableWidth - gapTotal - workspaceState.left - workspaceState.right)
        );
        applyWorkspaceState();
      }
    };

    const cleanup = () => {
      document.removeEventListener(moveEventName, onPointerMove, true);
      endEventNames.forEach((name) => {
        document.removeEventListener(name, onPointerUp, true);
      });
      window.removeEventListener("blur", onPointerUp, true);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      handle.classList.remove("is-dragging");
      activeResizeCleanup = null;
    };

    const onPointerUp = () => {
      if (!isMouseDrag) {
        try {
          handle.releasePointerCapture(event.pointerId);
        } catch (_) {
          // no-op on browsers that already released the capture
        }
      }
      cleanup();
      normalizeWorkspaceState();
      scheduleWorkspacePrefsSave();
    };

    if (!isMouseDrag) {
      try {
        handle.setPointerCapture(event.pointerId);
      } catch (_) {
        // Safari can refuse capture for some synthetic/premature pointer states
      }
    }

    activeResizeCleanup = cleanup;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    handle.classList.add("is-dragging");
    document.addEventListener(moveEventName, onPointerMove, {
      passive: false,
      capture: true,
    });
    endEventNames.forEach((name) => {
      document.addEventListener(name, onPointerUp, true);
    });
    window.addEventListener("blur", onPointerUp, true);
  }

  bindWorkspaceInteractions();

  navViewButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (button.tagName === "A") {
        event.preventDefault();
      }
      if (button.closest(".preview-more-menu")) {
        setMoreMenuOpen(false);
      }
      setAppView(button.dataset.navView);
    });
  });

  if (moreMenuToggle) {
    moreMenuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      setMoreMenuOpen(!state.moreMenuOpen);
    });
  }

  document.addEventListener("pointerdown", (event) => {
    if (state.moreMenuOpen && !event.target.closest(".preview-more")) {
      setMoreMenuOpen(false);
    }
  });

  window.addEventListener("blur", () => {
    if (state.moreMenuOpen) {
      setMoreMenuOpen(false);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.moreMenuOpen) {
      setMoreMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (state.moreMenuOpen) {
      setMoreMenuOpen(false);
    }
  });

  document.addEventListener(
    "scroll",
    () => {
      if (state.moreMenuOpen) {
        setMoreMenuOpen(false);
      }
    },
    true
  );

  if (customerList) {
    customerList.addEventListener("click", (event) => {
      const check = event.target.closest(".customer-record-check");
      const row = event.target.closest("[data-customer-row]");
      if (check && row) {
        event.preventDefault();
        event.stopPropagation();
        toggleCustomerBatchSelection(row.dataset.customerRow);
        return;
      }
      if (row) {
        setSelectedCustomerIdentity(row.dataset.customerRow);
      }
    });
  }

  customerCommandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleCustomerCommand(button.dataset.customerCommand);
    });
  });

  customerDetailActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleCustomerDetailAction(button.dataset.customerDetailAction).catch((error) => {
        console.warn("Customer detail action misslyckades.", error);
      });
    });
  });

  customerMergeCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCustomerMergeOpen(false);
    });
  });

  customerSettingsCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCustomerSettingsOpen(false);
    });
  });

  customerSplitCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCustomerSplitOpen(false);
    });
  });

  customerImportCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCustomerImportOpen(false);
    });
  });

  customerMergePrimaryOptions?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-customer-merge-primary]");
    if (!button) return;
    state.customerMergePrimaryKey = normalizeKey(button.dataset.customerMergePrimary);
    renderCustomerMergeModal();
  });

  customerMergeOptionInputs.forEach((input) => {
    input.addEventListener("change", () => {
      state.customerMergeOptions[normalizeKey(input.dataset.customerMergeOption)] = input.checked;
    });
  });

  if (customerMergeConfirmButton) {
    customerMergeConfirmButton.addEventListener("click", () => {
      confirmCustomerMerge().catch((error) => {
        console.warn("Customer merge misslyckades.", error);
      });
    });
  }

  if (customerSplitOptions) {
    customerSplitOptions.addEventListener("change", (event) => {
      const input = event.target.closest("[data-customer-split-option]");
      if (!input) return;
      state.customerRuntime.splitEmail = normalizeText(input.dataset.customerSplitOption);
      renderCustomerSplitModal();
    });
  }

  if (customerSplitConfirmButton) {
    customerSplitConfirmButton.addEventListener("click", () => {
      confirmCustomerSplit().catch((error) => {
        console.warn("Customer split misslyckades.", error);
      });
    });
  }

  customerSettingToggleInputs.forEach((input) => {
    input.addEventListener("change", () => {
      state.customerSettings[normalizeKey(input.dataset.customerSettingToggle)] = input.checked;
      setFeedback(customerSettingsFeedback, "success", "Merge-inställningen uppdaterades.");
      saveCustomersRuntime("Matchningsreglerna sparades i nya CCO.").catch((error) => {
        console.warn("Customer settings-save misslyckades.", error);
      });
    });
  });

  if (customerImportTextInput) {
    customerImportTextInput.addEventListener("input", () => {
      state.customerImport.sourceText = customerImportTextInput.value || "";
      state.customerImport.sourceBinaryBase64 = "";
      state.customerImport.fileName = "";
      state.customerImport.sourceFormat = "";
      state.customerImport.rowEditsDirty = false;
      state.customerImport.preview = null;
      setFeedback(customerImportFeedback, "", "");
      renderCustomerImportModal();
    });
  }

  if (customerImportFileInput) {
    customerImportFileInput.addEventListener("change", () => {
      const file = customerImportFileInput.files?.[0];
      if (!file) return;
      readCustomerImportFile(file).catch((error) => {
        console.warn("Customer import-fil kunde inte läsas.", error);
        setFeedback(
          customerImportFeedback,
          "error",
          error?.message || "Kunde inte läsa importfilen."
        );
      });
    });
  }

  if (customerImportPreviewButton) {
    customerImportPreviewButton.addEventListener("click", () => {
      requestCustomerImportPreview().catch((error) => {
        console.warn("Customer import preview misslyckades.", error);
      });
    });
  }

  if (customerImportCommitButton) {
    customerImportCommitButton.addEventListener("click", () => {
      commitCustomerImport().catch((error) => {
        console.warn("Customer import commit misslyckades.", error);
      });
    });
  }

  if (customerImportPreviewList) {
    customerImportPreviewList.addEventListener("change", (event) => {
      const input = event.target.closest("[data-customer-import-row-field]");
      if (!input) return;
      updateCustomerImportPreviewRowField(
        input.dataset.customerImportRow,
        input.dataset.customerImportRowField,
        input.type === "checkbox" ? input.checked : input.value
      );
    });
  }

  if (customerSuggestionsToggle) {
    customerSuggestionsToggle.addEventListener("click", () => {
      const nextHidden = !state.customerSuggestionsHidden;
      setCustomerSuggestionsHidden(nextHidden);
      setCustomersStatus(
        nextHidden
          ? "AI-förslagen doldes så att railen fokuserar på vald kund."
          : "AI-förslagen visas igen för den valda kunden.",
        "success"
      );
    });
  }

  if (customerSearchInput) {
    customerSearchInput.addEventListener("input", () => {
      state.customerSearch = customerSearchInput.value;
      applyCustomerFilters();
    });
  }

  if (customerFilterSelect) {
    customerFilterSelect.addEventListener("change", () => {
      state.customerFilter = customerFilterSelect.value;
      applyCustomerFilters();
    });
  }

  automationLibraryItems.forEach((item) => {
    item.addEventListener("click", () => {
      setSelectedAutomationLibrary(item.dataset.automationLibrary);
    });
  });

  automationNodes.forEach((node) => {
    node.addEventListener("click", () => {
      setSelectedAutomationNode(node.dataset.automationNode);
    });
  });

  automationSuggestionCards.forEach((card) => {
    card.addEventListener("click", () => {
      const suggestionKey = normalizeKey(card.dataset.automationSuggestion);
      const matchingNode = Object.entries(AUTOMATION_NODE_TO_SUGGESTION).find(
        ([, value]) => normalizeKey(value) === suggestionKey
      );
      if (matchingNode) {
        setSelectedAutomationNode(matchingNode[0]);
        return;
      }
      automationSuggestionCards.forEach((item) => {
        const isActive = item === card;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    });
  });

  automationSuggestionActionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      applyAutomationSuggestionAction(
        button.closest("[data-automation-suggestion]"),
        button.dataset.automationSuggestionAction
      );
    });
  });

  if (automationRunButton) {
    automationRunButton.addEventListener("click", () => {
      handleAutomationPrimaryAction("run", automationRunButton);
    });
  }

  if (automationSaveButton) {
    automationSaveButton.addEventListener("click", () => {
      handleAutomationPrimaryAction("save", automationSaveButton);
    });
  }

  automationCanvasScaleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const delta = button.dataset.automationScale === "in" ? 5 : -5;
      setAutomationCanvasScale(state.automationScale + delta);
    });
  });

  if (automationCanvasAddButton) {
    automationCanvasAddButton.addEventListener("click", () => {
      const libraryLabel =
        automationLibraryItems.find((item) => item.classList.contains("is-active"))?.textContent ||
        "valt steg";
      setAutomationStatus(`Redo att lägga till "${normalizeText(libraryLabel)}" i canvasen.`, "loading");
    });
  }

  if (automationRailToggle) {
    automationRailToggle.addEventListener("click", () => {
      const nextCollapsed = !state.automationRailCollapsed;
      setAutomationRailCollapsed(nextCollapsed);
      setAutomationStatus(
        nextCollapsed
          ? "AI-förslagen doldes tillfälligt för att ge buildern mer arbetsro."
          : "AI-förslagen visas igen i builder-railen.",
        "success"
      );
    });
  }

  automationSubnavPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      setAutomationSubnav(pill.dataset.automationSection || pill.textContent);
    });
  });

  automationJumpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAutomationSubnav(button.dataset.automationJump);
    });
  });

  automationTemplateCards.forEach((card) => {
    card.addEventListener("click", () => {
      setSelectedAutomationTemplate(card.dataset.automationTemplate);
    });
  });

  automationTemplateActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.automationTemplateTarget;
      if (target) {
        setSelectedAutomationTemplate(target);
      }
      if (button.dataset.automationTemplateAction === "apply") {
        setAutomationSubnav("byggare");
      }
    });
  });

  automationTestingActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleAutomationTestingAction(button.dataset.automationTestingAction, button);
    });
  });

  automationAnalysisActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleAutomationAnalysisAction(button.dataset.automationAnalysisAction);
    });
  });

  automationVersionCards.forEach((card) => {
    card.addEventListener("click", () => {
      setSelectedAutomationVersion(card.dataset.automationVersion);
    });
  });

  automationVersionActionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const card = button.closest("[data-automation-version]");
      handleAutomationVersionAction(
        card?.dataset.automationVersion || "v3_0",
        button.dataset.automationVersionAction
      ).catch((error) => {
        console.warn("Automation version action misslyckades.", error);
      });
    });
  });

  analyticsPeriodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedAnalyticsPeriod(button.dataset.analyticsPeriod);
    });
  });

  analyticsTemplateRows.forEach((row) => {
    row.addEventListener("click", () => {
      handleAnalyticsTemplateJump(row.dataset.analyticsTemplateTarget);
    });
  });

  if (analyticsCoachingAction) {
    analyticsCoachingAction.addEventListener("click", () => {
      handleAnalyticsTemplateJump("payment_reminder");
    });
  }

  if (automationAutopilotToggle) {
    automationAutopilotToggle.addEventListener("click", () => {
      setAutomationAutopilotEnabled(!state.automationAutopilotEnabled);
    });
  }

  automationAutopilotProposalCards.forEach((card) => {
    card.addEventListener("click", () => {
      setSelectedAutomationAutopilotProposal(card.dataset.automationAutopilotProposal);
    });
  });

  automationAutopilotActionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      handleAutomationAutopilotAction(
        button.closest("[data-automation-autopilot-proposal]"),
        button.dataset.automationAutopilotAction
      );
    });
  });

  integrationCategoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedIntegrationCategory(button.dataset.integrationCategory);
    });
  });

  integrationCommandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleIntegrationCommand(button.dataset.integrationCommand);
    });
  });

  macroCommandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleMacroCommand(button.dataset.macroCommand).catch((error) => {
        console.warn("Macro command misslyckades.", error);
      });
    });
  });

  settingsChoiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleSettingsChoice(button.dataset.settingsChoice, button.dataset.settingsValue);
    });
  });

  settingsToggleInputs.forEach((input) => {
    input.addEventListener("change", () => {
      handleSettingsToggle(input.dataset.settingsToggle, input.checked);
    });
  });

  settingsActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleSettingsAction(button.dataset.settingsAction).catch((error) => {
        console.warn("Settings action misslyckades.", error);
      });
    });
  });

  showcaseFeatureButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedShowcaseFeature(button.dataset.showcaseFeature);
      setAuxStatus(showcaseStatus, "Funktionen är nu i fokus i nya CCO:s showcase-yta.", "success");
    });
  });

  showcaseJumpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAppView(button.dataset.showcaseJump);
    });
  });

  mailFeedFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMailFeedFilter(button.dataset.mailFeedFilter, button.dataset.mailFeedFilterValue);
    });
  });

  mailFeedViewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMailFeedView(button.dataset.mailFeedView, button.dataset.mailFeedViewValue);
    });
  });

  mailFeedDensityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMailFeedDensity(button.dataset.mailFeedDensity, button.dataset.mailFeedDensityValue);
    });
  });

  mailFeedSelectAllButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleSelectAllMailFeed(button.dataset.mailFeedSelectAll);
    });
  });

  mailFeedBulkButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleMailFeedBulkCommand(
        button.dataset.mailFeedBulk,
        button.dataset.mailFeedBulkCommand
      ).catch((error) => {
        console.warn("Mail feed bulk action misslyckades.", error);
      });
    });
  });

  mailFeedUndoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      restorePendingMailFeedDelete("Raderingen ångrades.");
    });
  });

  mailFeedCommandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleMailFeedCommand(button.dataset.mailFeedCommand);
    });
  });

  macroModalCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMacroModalOpen(false);
    });
  });

  if (macroModalSubmitButton) {
    macroModalSubmitButton.addEventListener("click", () => {
      submitMacroModal().catch((error) => {
        console.warn("Macro modal-save misslyckades.", error);
      });
    });
  }

  settingsProfileModalCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSettingsProfileModalOpen(false);
    });
  });

  if (settingsProfileModalSubmitButton) {
    settingsProfileModalSubmitButton.addEventListener("click", () => {
      submitSettingsProfileModal().catch((error) => {
        console.warn("Settings profile-save misslyckades.", error);
      });
    });
  }

  confirmCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setConfirmDialogOpen(false);
    });
  });

  if (confirmSubmitButton) {
    confirmSubmitButton.addEventListener("click", () => {
      submitConfirmDialog().catch((error) => {
        console.warn("Confirm action misslyckades.", error);
      });
    });
  }

  automationCollaborationToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAutomationCollaborationOpen(!state.automationCollaborationOpen);
      setAutomationStatus(
        state.automationCollaborationOpen
          ? "Samarbetsläget visas i automationens högerpanel."
          : "Samarbetsläget doldes för att ge buildern mer arbetsro.",
        "success"
      );
    });
  });

  document.addEventListener("click", (event) => {
    if (
      state.moreMenuOpen &&
      !event.target.closest(".preview-more")
    ) {
      setMoreMenuOpen(false);
    }

    if (handleWorkspaceDocumentClick(event)) {
      return;
    }

    const customerMergeButton = event.target.closest("[data-customer-merge-action]");
    if (customerMergeButton) {
      handleCustomerMergeAction(
        customerMergeButton,
        customerMergeButton.dataset.customerMergeAction
      ).catch((error) => {
        console.warn("Customer merge suggestion misslyckades.", error);
      });
      return;
    }

    const mailFeedSelectionToggle = event.target.closest(".mail-feed-card-selection");
    if (mailFeedSelectionToggle) {
      const mailFeedSelectionInput = mailFeedSelectionToggle.querySelector("[data-mail-feed-select]");
      if (!mailFeedSelectionInput) return;
      event.preventDefault();
      event.stopPropagation();
      toggleMailFeedSelection(
        mailFeedSelectionInput.dataset.mailFeedSelect,
        mailFeedSelectionInput.dataset.mailFeedSelectKey
      );
      return;
    }

    const mailFeedOpenButton = event.target.closest("[data-mail-feed-open]");
    if (mailFeedOpenButton) {
      const feedKey = normalizeKey(mailFeedOpenButton.dataset.mailFeedOpen);
      const card = mailFeedOpenButton.closest("[data-mail-feed-item]");
      if (card) {
        setSelectedMailFeedItem(feedKey, card.dataset.mailFeedKey);
      }
      if (feedKey === "later") {
        handleMailFeedCommand("resume");
      } else {
        handleMailFeedCommand("history");
      }
      return;
    }

    const mailFeedCard = event.target.closest("[data-mail-feed-item]");
    if (mailFeedCard) {
      setSelectedMailFeedItem(mailFeedCard.dataset.mailFeedItem, mailFeedCard.dataset.mailFeedKey);
      return;
    }

    const integrationToggleButton = event.target.closest("[data-integration-toggle]");
    if (integrationToggleButton) {
      const key = normalizeKey(integrationToggleButton.dataset.integrationToggle);
      handleIntegrationToggle(key).catch((error) => {
        console.warn("Integrations-toggle misslyckades.", error);
      });
      return;
    }

    const macroCardButton = event.target.closest("[data-macro-action]");
    if (macroCardButton) {
      handleMacroCardAction(
        macroCardButton.dataset.macroAction,
        macroCardButton.dataset.macroKey
      ).catch((error) => {
        console.warn("Macro action misslyckades.", error);
      });
      return;
    }

  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.confirmDialog.open) {
      setConfirmDialogOpen(false);
      return;
    }

    if (event.key === "Escape" && state.settingsProfileModal.open) {
      setSettingsProfileModalOpen(false);
      return;
    }

    if (event.key === "Escape" && state.macroModal.open) {
      setMacroModalOpen(false);
      return;
    }

    if (event.key === "Escape" && state.moreMenuOpen) {
      setMoreMenuOpen(false);
      return;
    }

    if (handleWorkspaceDocumentKeydown(event)) {
      return;
    }

    if (event.key === "Escape" && state.customerMergeModalOpen) {
      setCustomerMergeOpen(false);
      return;
    }

    if (event.key === "Escape" && state.customerSettingsOpen) {
      setCustomerSettingsOpen(false);
      return;
    }

    if (event.key === "Escape" && state.customerRuntime.splitModalOpen) {
      setCustomerSplitOpen(false);
      return;
    }

    if (event.key === "Escape" && state.customerImport.open) {
      setCustomerImportOpen(false);
      return;
    }

  });

  window.addEventListener("resize", normalizeWorkspaceState);
  state.customerFilter = normalizeText(customerFilterSelect?.value) || "Alla kunder";
  setSelectedCustomerIdentity("johan");
  setSelectedAnalyticsPeriod("week");
  setSelectedAutomationLibrary("email");
  setSelectedAutomationNode("trigger");
  setSelectedAutomationTemplate("churn_guard");
  setSelectedAutomationVersion("v3_0");
  setSelectedAutomationAutopilotProposal("merge_duplicates");
  setAutomationAutopilotEnabled(true);
  setAutomationCollaborationOpen(false);
  setAutomationCanvasScale(100);
  setAutomationRailCollapsed(false);
  renderAutomationTestingState();
  renderAutomationVersions();
  renderAutomationSuggestions();
  setAutomationSubnav("Byggare");
  renderIntegrations();
  renderMacros();
  renderSettings();
  setSelectedShowcaseFeature("command_palette");
  applyCustomerFilters();
  setCustomerSuggestionsHidden(false);
  renderCustomerDetailTools();
  renderCustomerBatchSelection();
  setMoreMenuOpen(false);
  setCustomerMergeOpen(false);
  setCustomerSettingsOpen(false);
  setCustomersStatus("", "");
  setAutomationStatus("", "");
  setAuxStatus(laterStatus, "", "");
  setAuxStatus(sentStatus, "", "");
  setAuxStatus(integrationsStatus, "", "");
  setAuxStatus(macrosStatus, "", "");
  setAuxStatus(settingsStatus, "", "");
  setAuxStatus(showcaseStatus, "", "");
  initializeWorkspaceSurface();
  const initialShellViewState = readShellViewStateFromLocation();
  if (initialShellViewState.view !== "conversations") {
    setAppView(initialShellViewState.view);
  }
  if (
    resolveShellView(initialShellViewState.view) === "automation" &&
    initialShellViewState.view === "automation" &&
    initialShellViewState.automationSection
  ) {
    setAutomationSubnav(initialShellViewState.automationSection);
  } else {
    syncShellViewToLocation();
  }
})();
