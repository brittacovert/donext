const protectedWorkflowTags = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const defaultWorkflowTags = [
  ...protectedWorkflowTags,
  "morning",
  "evening",
  "night",
  "opening",
  "closing",
  "free time",
  "event day",
  "show day",
  "travel prep",
];

const statuses = [
  "Current Habit",
  "Current Project",
  "Necessary Project",
  "Goal Habit",
  "Potential Project",
  "Delayed",
  "Unprioritized",
];

const statusLabels = {
  "Current Habit": "I do this regularly",
  "Current Project": "I’m working on getting this done",
  "Necessary Project": "I need to get this done",
  "Goal Habit": "I want to do this regularly",
  "Potential Project": "It would be good to get this done",
  "Delayed": "Delayed",
  "Unprioritized": "Unprioritized",
};

const defaultConditions = [
  "Business Hours",
  "Errand",
  "On Phone",
  "On Laptop",
  "On Any Computer",
  "On Foot",
  "At Home",
  "At Work",
  "Outside",
  "Joint Effort",
  "Adult Time",
];

const statusRank = new Map(statuses.map((status, index) => [status, index]));
const storageKey = "dayflow.tasks.v3";
const settingsStorageKey = "dayflow.settings.v1";
const orderStorageKey = "donext.orders.v1";
const viewStorageKey = "donext.view.v1";
const highlightsStorageKey = "batl.highlights.v1";
const pathsStorageKey = "batl.paths.v1";
const today = new Date();
const todayIso = toIsoDate(today);
const dayName = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
const initialSettings = loadSettings();
const initialTimeTag = initialSettings.workflowTags.includes(currentTimeTag())
  ? currentTimeTag()
  : initialSettings.workflowTags.find((tag) => !protectedWorkflowTags.includes(tag)) || "free time";
const initialView = loadViewState(initialSettings, initialTimeTag);
const initialFilters = initialView.filtersByMode[initialView.mode] || defaultFilterState(initialView.mode);

let state = {
  mode: initialView.mode,
  day: initialView.day,
  time: initialView.time,
  workflowTags: initialSettings.workflowTags,
  conditions: initialSettings.conditions,
  filtersByMode: initialView.filtersByMode,
  requiredConditions: new Set(initialFilters.requiredConditions),
  hiddenConditions: new Set(initialFilters.hiddenConditions),
  requiredWorkflows: new Set(initialFilters.requiredWorkflows),
  hiddenWorkflows: new Set(initialFilters.hiddenWorkflows),
  search: initialFilters.search,
  hideHandled: initialFilters.hideHandled,
  showBlocked: initialFilters.showBlocked,
  deadlineWindow: initialFilters.deadlineWindow,
  deadlineOnlyActionable: initialFilters.deadlineOnlyActionable,
  freeDayFilter: initialFilters.freeDayFilter,
  captureWorkflow: new Set([dayName, initialTimeTag]),
  captureConditions: new Set(),
  editingTaskId: null,
  reorderMode: false,
  reorderKey: "",
  draftOrder: [],
  freeTimePromptKey: "",
  pendingRoutineSwitch: null,
  showDetailsByMode: initialView.showDetailsByMode,
  selectMode: false,
  selectedTaskIds: new Set(),
  bulkWorkflows: new Set(),
  bulkConditions: new Set(),
  pendingDeleteTaskId: null,
  highlights: loadHighlights(),
  paths: loadPaths(),
  activePathId: "",
  pathNameMode: "create",
  pendingPathInsertIndex: 0,
  pendingPathId: "",
  savedOrders: loadSavedOrders(),
  tasks: loadTasks(),
};

if (refreshRecurringTasks(state.tasks) || resetHandledTasks(state.tasks)) saveTasks();

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  initializeControls();
  render();
});

function cacheElements() {
  [
    "todayLabel",
    "modeEyebrow",
    "viewTitle",
    "daySelect",
    "timeSelect",
    "routineSelectors",
    "manageWorkflows",
    "manageConditions",
    "freeDayFilterRow",
    "freeDayFilter",
    "workflowChips",
    "workflowFilterGroup",
    "conditionChips",
    "resetWorkflow",
    "clearConditions",
    "deadlineWindow",
    "deadlineWindowLabel",
    "deadlineOnlyActionable",
    "routineProgress",
    "progressMetric",
    "deadlineCount",
    "visibleCount",
    "deadlineBand",
    "deadlineList",
    "searchInput",
    "hideHandled",
    "showBlocked",
    "startReorder",
    "reorderActions",
    "cancelReorder",
    "saveReorder",
    "taskFeed",
    "openCapture",
    "captureDialog",
    "captureForm",
    "captureEyebrow",
    "captureTitle",
    "closeCapture",
    "cancelCapture",
    "saveTask",
    "taskInput",
    "statusInput",
    "deadlineInput",
    "advancedSettings",
    "recurrenceInput",
    "recurrenceBehavior",
    "stackMissedInput",
    "blockedByInput",
    "blockingInput",
    "showLastWorkedOnInput",
    "workflowInput",
    "conditionInput",
    "tagDialog",
    "closeTagDialog",
    "workflowManagerSection",
    "conditionManagerSection",
    "addWorkflowForm",
    "addConditionForm",
    "newWorkflowInput",
    "newConditionInput",
    "workflowManagerList",
    "conditionManagerList",
    "routineDialog",
    "routinePromptTitle",
    "routinePromptBody",
    "keepRoutine",
    "switchRoutine",
    "workflowPanel",
    "conditionPanel",
    "deadlinePanel",
    "highlightShortcut",
    "showDetails",
    "startSelect",
    "bulkBar",
    "selectionCount",
    "bulkTags",
    "bulkHighlight",
    "bulkPath",
    "bulkDelete",
    "cancelSelect",
    "highlightsView",
    "highlightNote",
    "highlightSaved",
    "refreshHighlights",
    "highlightFeed",
    "pathsView",
    "pathSelect",
    "newPath",
    "renamePath",
    "deletePath",
    "pathCanvas",
    "recurringDeleteDialog",
    "cancelRecurringDelete",
    "completeOccurrence",
    "deleteSeries",
    "bulkTagsDialog",
    "bulkTagsForm",
    "closeBulkTags",
    "cancelBulkTags",
    "bulkWorkflowInput",
    "bulkConditionInput",
    "mobileFiltersToggle",
    "pathNameDialog",
    "pathNameForm",
    "pathNameTitle",
    "pathNameInput",
    "cancelPathName",
    "pathChooserDialog",
    "pathChooserForm",
    "pathChooserSelect",
    "pathChooserNewName",
    "cancelPathChooser",
    "pathTaskDialog",
    "pathTaskForm",
    "pathTaskInput",
    "cancelPathTask",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function initializeControls() {
  els.todayLabel.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  protectedWorkflowTags.forEach((day) => {
    const option = document.createElement("option");
    option.value = day;
    option.textContent = titleCase(day);
    els.daySelect.append(option);
  });
  renderWorkflowSelect();
  els.daySelect.value = state.day;
  els.timeSelect.value = state.time;

  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = statusLabel(status);
    els.statusInput.append(option);
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      rememberModeFilters();
      state.mode = button.dataset.mode;
      if (["routine", "free", "all", "delayed"].includes(state.mode)) applyModeFilters();
      endSelection();
      state.pendingRoutineSwitch = null;
      if (state.mode === "highlights") maybePromptHighlightRefresh();
      render();
    });
  });

  els.daySelect.addEventListener("change", () => {
    rememberModeFilters();
    state.day = els.daySelect.value;
    state.mode = "routine";
    applyModeFilters();
    state.pendingRoutineSwitch = null;
    state.captureWorkflow = new Set([state.day, state.time].filter(Boolean));
    render();
  });

  els.timeSelect.addEventListener("change", () => {
    rememberModeFilters();
    state.time = els.timeSelect.value;
    state.mode = "routine";
    applyModeFilters();
    state.pendingRoutineSwitch = null;
    state.captureWorkflow = new Set([state.day, state.time].filter(Boolean));
    render();
  });

  els.freeDayFilter.addEventListener("change", () => {
    state.freeDayFilter = els.freeDayFilter.checked;
    render();
  });

  els.recurrenceInput.addEventListener("change", syncRecurrenceInput);
  els.manageWorkflows.addEventListener("click", () => openTagManager("workflow"));
  els.manageConditions.addEventListener("click", () => openTagManager("condition"));
  els.closeTagDialog.addEventListener("click", () => els.tagDialog.close());
  els.addWorkflowForm.addEventListener("submit", addWorkflow);
  els.addConditionForm.addEventListener("submit", addCondition);
  els.keepRoutine.addEventListener("click", keepCurrentRoutine);
  els.switchRoutine.addEventListener("click", acceptRoutineSwitch);

  els.resetWorkflow.addEventListener("click", () => {
    rememberModeFilters();
    state.day = dayName;
    state.time = state.workflowTags.includes(currentTimeTag())
      ? currentTimeTag()
      : state.workflowTags.find((tag) => !protectedWorkflowTags.includes(tag)) || "free time";
    els.daySelect.value = state.day;
    els.timeSelect.value = state.time;
    state.mode = "routine";
    applyModeFilters();
    saveViewState();
    render();
  });

  els.clearConditions.addEventListener("click", () => {
    state.requiredConditions.clear();
    state.hiddenConditions.clear();
    state.requiredWorkflows.clear();
    state.hiddenWorkflows.clear();
    render();
  });

  els.deadlineWindow.addEventListener("input", () => {
    state.deadlineWindow = Number(els.deadlineWindow.value);
    render();
  });

  els.deadlineOnlyActionable.addEventListener("change", () => {
    state.deadlineOnlyActionable = els.deadlineOnlyActionable.checked;
    render();
  });

  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value.trim().toLowerCase();
    render();
  });

  els.hideHandled.addEventListener("change", () => {
    state.hideHandled = els.hideHandled.checked;
    render();
  });

  els.showBlocked.addEventListener("change", () => {
    state.showBlocked = els.showBlocked.checked;
    render();
  });
  els.showDetails.addEventListener("change", () => {
    state.showDetailsByMode[state.mode] = els.showDetails.checked;
    render();
  });
  els.highlightShortcut.addEventListener("click", () => {
    rememberModeFilters();
    state.mode = "highlights";
    endSelection();
    maybePromptHighlightRefresh();
    render();
  });
  els.startSelect.addEventListener("click", () => {
    state.selectMode = true;
    state.selectedTaskIds.clear();
    render();
  });
  els.cancelSelect.addEventListener("click", () => {
    endSelection();
    render();
  });
  els.bulkDelete.addEventListener("click", bulkDeleteSelected);
  els.bulkHighlight.addEventListener("click", addSelectedToHighlights);
  els.bulkPath.addEventListener("click", addSelectedToPath);
  els.bulkTags.addEventListener("click", openBulkTags);
  els.closeBulkTags.addEventListener("click", () => els.bulkTagsDialog.close());
  els.cancelBulkTags.addEventListener("click", () => els.bulkTagsDialog.close());
  els.bulkTagsForm.addEventListener("submit", applyBulkTags);
  els.startReorder.addEventListener("click", startReorder);
  els.cancelReorder.addEventListener("click", cancelReorder);
  els.saveReorder.addEventListener("click", saveReorder);

  els.openCapture.addEventListener("click", () => openCapture());
  els.closeCapture.addEventListener("click", closeCapture);
  els.cancelCapture.addEventListener("click", closeCapture);
  els.captureDialog.addEventListener("close", () => {
    state.editingTaskId = null;
  });
  els.captureForm.addEventListener("submit", saveCapturedTask);
  els.cancelRecurringDelete.addEventListener("click", closeRecurringDelete);
  els.completeOccurrence.addEventListener("click", completePendingOccurrence);
  els.deleteSeries.addEventListener("click", deletePendingSeries);
  els.highlightNote.addEventListener("input", () => {
    state.highlights.note = els.highlightNote.value;
    saveHighlights();
  });
  els.refreshHighlights.addEventListener("click", () => refreshHighlights(true));
  els.pathSelect.addEventListener("change", () => {
    state.activePathId = els.pathSelect.value;
    renderPaths();
  });
  els.newPath.addEventListener("click", createPath);
  els.renamePath.addEventListener("click", renameActivePath);
  els.deletePath.addEventListener("click", deleteActivePath);
  els.pathNameForm.addEventListener("submit", savePathName);
  els.cancelPathName.addEventListener("click", () => els.pathNameDialog.close());
  els.pathChooserForm.addEventListener("submit", confirmAddSelectedToPath);
  els.cancelPathChooser.addEventListener("click", () => els.pathChooserDialog.close());
  els.pathTaskForm.addEventListener("submit", saveInsertedPathTask);
  els.cancelPathTask.addEventListener("click", () => els.pathTaskDialog.close());
  els.mobileFiltersToggle.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("filters-open");
    els.mobileFiltersToggle.textContent = document.querySelector(".sidebar").classList.contains("filters-open") ? "Hide filters" : "Filters";
  });
  renderConditionControls();
  renderWorkflowFilterControls();
  renderCaptureChips();
  renderTagManager();
  maybePromptForRoutineSwitch();
}

function render() {
  if (resetHandledTasks(state.tasks)) saveTasks();
  syncControlState();
  const specialMode = state.mode === "highlights" || state.mode === "paths";
  const routineTasks = getRoutineTasks({ includeHandled: true });
  const progressRoutineTasks = routineTasks.filter(isRoutineTaskVisible);
  const actionableRoutine = routineTasks.filter(isRoutineTaskActionable);
  if (state.reorderMode && state.reorderKey !== currentOrderKey()) resetReorderState();

  document.querySelectorAll(".segment").forEach((button) => {
    const activeMode = state.mode === "free" ? "routine" : state.mode;
    button.classList.toggle("active", button.dataset.mode === activeMode);
  });

  const viewTasks = specialMode ? [] : getVisibleTasks();
  const deadlineTasks = specialMode ? [] : getDeadlineTasks(viewTasks);

  els.modeEyebrow.textContent = state.mode === "routine"
    ? "Routine Builder"
    : state.mode === "free"
      ? "Free Time Queue"
      : state.mode === "highlights"
        ? "Focus"
        : state.mode === "paths"
          ? "Dependencies"
      : state.mode === "delayed"
        ? "Review"
        : "Whole List";
  els.viewTitle.textContent = titleForMode();
  els.routineProgress.textContent = `${progressRoutineTasks.filter((task) => isTaskWorkedOn(task) || isTaskDelayed(task)).length}/${progressRoutineTasks.length}`;
  els.deadlineCount.textContent = deadlineTasks.length;
  els.visibleCount.textContent = viewTasks.length;
  els.deadlineWindowLabel.textContent = `${state.deadlineWindow}d`;
  els.routineSelectors.hidden = state.mode === "all" || state.mode === "delayed" || specialMode;
  els.daySelect.closest("label").hidden = state.mode === "routine" && isCustomWorkflow(state.time);
  els.workflowFilterGroup.hidden = state.mode === "routine" || state.mode === "free" || specialMode;
  els.progressMetric.hidden = state.mode === "all" || state.mode === "delayed" || specialMode;
  els.freeDayFilterRow.hidden = state.mode !== "free";
  els.workflowPanel.hidden = specialMode;
  els.conditionPanel.hidden = specialMode;
  els.deadlinePanel.hidden = specialMode;
  els.taskFeed.hidden = specialMode;
  els.highlightsView.hidden = state.mode !== "highlights";
  els.pathsView.hidden = state.mode !== "paths";
  els.statusStrip = els.statusStrip || document.querySelector(".status-strip");
  els.statusStrip.hidden = specialMode;
  els.deadlineBand.hidden = specialMode || deadlineTasks.length === 0;
  document.querySelector(".toolbar").hidden = specialMode;
  els.openCapture.hidden = state.mode === "paths";
  els.highlightShortcut.hidden = state.mode === "highlights";
  els.startReorder.hidden = state.reorderMode || state.selectMode;
  els.startReorder.disabled = viewTasks.length < 2;
  els.reorderActions.hidden = !state.reorderMode;
  els.startSelect.hidden = state.selectMode || state.reorderMode;
  els.bulkBar.hidden = !state.selectMode || specialMode;
  els.selectionCount.textContent = `${state.selectedTaskIds.size} selected`;
  els.showDetails.checked = Boolean(state.showDetailsByMode[state.mode]);

  if (!specialMode) {
    renderDeadlineBand(deadlineTasks);
    renderTaskFeed(viewTasks);
  }
  if (state.mode === "highlights") renderHighlights();
  if (state.mode === "paths") renderPaths();
  renderConditionControls();
  renderWorkflowFilterControls();
  if (!specialMode) maybePromptForFreeTime(progressRoutineTasks, actionableRoutine);
  if (["routine", "free", "all", "delayed"].includes(state.mode)) rememberModeFilters();
  saveViewState();
}

function syncControlState() {
  els.daySelect.value = state.day;
  els.timeSelect.value = state.time;
  els.deadlineWindow.value = String(state.deadlineWindow);
  els.deadlineOnlyActionable.checked = state.deadlineOnlyActionable;
  els.hideHandled.checked = state.hideHandled;
  els.showBlocked.checked = state.showBlocked;
  els.freeDayFilter.checked = state.freeDayFilter;
  els.searchInput.value = state.search;
}

function rememberModeFilters() {
  state.filtersByMode[state.mode] = {
    requiredConditions: [...state.requiredConditions],
    hiddenConditions: [...state.hiddenConditions],
    requiredWorkflows: [...state.requiredWorkflows],
    hiddenWorkflows: [...state.hiddenWorkflows],
    search: state.search,
    hideHandled: state.hideHandled,
    showBlocked: state.showBlocked,
    deadlineWindow: state.deadlineWindow,
    deadlineOnlyActionable: state.deadlineOnlyActionable,
    freeDayFilter: state.freeDayFilter,
  };
}

function applyModeFilters() {
  const filters = state.filtersByMode[state.mode] || defaultFilterState(state.mode);
  state.filtersByMode[state.mode] = filters;
  state.requiredConditions = new Set(filters.requiredConditions);
  state.hiddenConditions = new Set(filters.hiddenConditions);
  state.requiredWorkflows = new Set(filters.requiredWorkflows);
  state.hiddenWorkflows = new Set(filters.hiddenWorkflows);
  state.search = filters.search;
  state.hideHandled = filters.hideHandled;
  state.showBlocked = filters.showBlocked;
  state.deadlineWindow = filters.deadlineWindow;
  state.deadlineOnlyActionable = filters.deadlineOnlyActionable;
  state.freeDayFilter = filters.freeDayFilter;
}

function getVisibleTasks() {
  const base = state.mode === "routine"
    ? getRoutineTasks({ includeHandled: true })
    : state.mode === "free"
      ? getFreeTimeTasks()
      : state.mode === "delayed"
        ? getDelayedTasks()
        : getAllTasks();
  const filtered = base
    .filter((task) => state.mode === "delayed" || state.showBlocked || !isBlocked(task))
    .filter((task) => !state.hideHandled || (!isTaskWorkedOn(task) && !isTaskDelayed(task)) || shouldPromptCompletion(task))
    .filter((task) => workflowMatch(task))
    .filter((task) => conditionMatch(task))
    .filter((task) => searchMatch(task));
  const sorted = state.mode === "routine" || state.mode === "free"
    ? sortWorkflowTasks(filtered)
    : state.mode === "delayed"
      ? filtered.sort(delayedTaskSort)
      : filtered.sort(taskSort);
  const key = currentOrderKey();
  const order = state.reorderMode && state.reorderKey === key
    ? state.draftOrder
    : state.savedOrders[key] || [];
  const ordered = applyTaskOrder(sorted, order);
  return state.reorderMode ? ordered : moveHandledTasksToBottom(ordered);
}

function getRoutineTasks({ includeHandled }) {
  return state.tasks.filter((task) => {
    const inWorkflow = task.workflow.includes(state.time)
      && (isCustomWorkflow(state.time) || task.workflow.includes(state.day));
    const visible = includeHandled || (!isTaskWorkedOn(task) && !isTaskDelayed(task));
    return inWorkflow && isCurrentOccurrence(task) && visible;
  });
}

function isRoutineTaskActionable(task) {
  return !isTaskWorkedOn(task)
    && !isTaskDelayed(task)
    && isRoutineTaskVisible(task);
}

function isRoutineTaskVisible(task) {
  return (state.showBlocked || !isBlocked(task))
    && conditionMatch(task)
    && searchMatch(task);
}

function getFreeTimeTasks() {
  return state.tasks.filter((task) => {
    const isFreeTime = task.workflow.includes("free time");
    const matchesDay = !state.freeDayFilter || task.workflow.includes(state.day);
    return isFreeTime && matchesDay && isCurrentOccurrence(task);
  });
}

function getAllTasks() {
  return [...state.tasks];
}

function getDelayedTasks() {
  return state.tasks.filter((task) => {
    return needsReview(task) && !isReviewCleared(task);
  });
}

function needsReview(task) {
  return isBlockingLoopTask(task)
    || isLate(task)
    || isTaskDelayed(task)
    || latestHandlingAction(task) === "delayed"
    || reviewIssues(task).length > 0;
}

function reviewIssues(task) {
  const issues = [];
  const hasCustomWorkflow = task.workflow.some((tag) => isCustomWorkflow(tag));
  if (!hasCustomWorkflow && !task.workflow.some((tag) => protectedWorkflowTags.includes(tag))) issues.push("Needs day");
  if (!task.workflow.some((tag) => !protectedWorkflowTags.includes(tag))) issues.push("Needs workflow");
  if (!task.status || task.status === "Unprioritized" || task.status === "Delayed") issues.push("Needs priority");
  if (isBlockingLoopTask(task)) issues.push("Blocking loop");
  return issues;
}

function isReviewCleared(task) {
  return task.reviewClearedSignature === reviewSignature(task);
}

function reviewSignature(task) {
  return JSON.stringify({
    late: isLate(task),
    delayed: isTaskDelayed(task) || latestHandlingAction(task) === "delayed",
    blockingLoop: isBlockingLoopTask(task),
    issues: reviewIssues(task),
    status: task.status || "",
    workflow: [...task.workflow].sort(),
    deadline: task.deadline || "",
    blockedBy: blockedByIds(task).sort(),
    blocking: [...task.blocking].sort(),
  });
}

function workflowMatch(task) {
  const hasRequired = [...state.requiredWorkflows].every((tag) => task.workflow.includes(tag));
  const hasHidden = [...state.hiddenWorkflows].some((tag) => task.workflow.includes(tag));
  return hasRequired && !hasHidden;
}

function conditionMatch(task) {
  const hasRequired = [...state.requiredConditions].every((condition) => task.conditions.includes(condition));
  const hasHidden = [...state.hiddenConditions].some((condition) => task.conditions.includes(condition));
  return hasRequired && !hasHidden;
}

function searchMatch(task) {
  if (!state.search) return true;
  const haystack = [task.task, task.status, task.recurrence, ...task.conditions, ...task.workflow].join(" ").toLowerCase();
  return haystack.includes(state.search);
}

function taskSort(a, b) {
  return Number(isTaskHandled(a)) - Number(isTaskHandled(b))
    || (statusRank.get(a.status) ?? 99) - (statusRank.get(b.status) ?? 99)
    || dateRank(a.deadline) - dateRank(b.deadline)
    || a.conditions.join(",").localeCompare(b.conditions.join(","));
}

function delayedTaskSort(a, b) {
  return Number(!isBlockingLoopTask(a)) - Number(!isBlockingLoopTask(b))
    || Number(!isLate(a)) - Number(!isLate(b))
    || dateRank(a.deadline) - dateRank(b.deadline)
    || lastActionRank(b) - lastActionRank(a)
    || taskSort(a, b);
}

function sortWorkflowTasks(tasks) {
  const remaining = [...tasks].sort(workflowTieSort);
  const take = (predicate) => {
    const matches = [];
    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      if (predicate(remaining[index])) matches.unshift(...remaining.splice(index, 1));
    }
    return matches;
  };

  const currentHabits = take((task) => task.status === "Current Habit");
  const overdue = take((task) => task.deadline && daysUntil(task.deadline) < 0);
  const dueTodayOrTomorrow = take((task) => {
    if (!task.deadline) return false;
    const days = daysUntil(task.deadline);
    return days === 0 || days === 1;
  });
  const necessaryProjects = take((task) => task.status === "Necessary Project");
  const goalHabits = take((task) => task.status === "Goal Habit");
  const currentProjects = take((task) => task.status === "Current Project");
  const potentialProjects = take((task) => task.status === "Potential Project");

  return [
    ...currentHabits,
    ...overdue,
    ...dueTodayOrTomorrow,
    ...necessaryProjects,
    ...goalHabits.slice(0, 1),
    ...currentProjects,
    ...potentialProjects.slice(0, 1),
    ...goalHabits.slice(1),
    ...potentialProjects.slice(1),
    ...remaining,
  ];
}

function workflowTieSort(a, b) {
  return Number(isTaskHandled(a)) - Number(isTaskHandled(b))
    || Number(shouldPromptCompletion(a)) - Number(shouldPromptCompletion(b))
    || dateRank(a.deadline) - dateRank(b.deadline)
    || a.conditions.join(",").localeCompare(b.conditions.join(","))
    || a.task.localeCompare(b.task);
}

function currentOrderKey() {
  if (state.mode === "all") return "all";
  if (state.mode === "delayed") return "delayed";
  if (state.mode === "free") return `free:${state.freeDayFilter ? state.day : "all"}`;
  return handlingKey(state.day, state.time);
}

function applyTaskOrder(tasks, order) {
  if (!order.length) return tasks;
  const rank = new Map(order.map((id, index) => [id, index]));
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const aRank = rank.has(a.task.id) ? rank.get(a.task.id) : Number.MAX_SAFE_INTEGER;
      const bRank = rank.has(b.task.id) ? rank.get(b.task.id) : Number.MAX_SAFE_INTEGER;
      return aRank - bRank || a.index - b.index;
    })
    .map(({ task }) => task);
}

function startReorder() {
  const tasks = getVisibleTasks();
  if (tasks.length < 2) return;
  state.reorderMode = true;
  state.reorderKey = currentOrderKey();
  state.draftOrder = tasks.map((task) => task.id);
  render();
}

function cancelReorder() {
  resetReorderState();
  render();
}

function saveReorder() {
  if (!state.reorderMode) return;
  const visibleOrder = getVisibleTasks().map((task) => task.id);
  saveOrderForKey(state.reorderKey, visibleOrder);
  if (shouldOfferRoutineOrderCopy() && window.confirm(`Save for all ${titleCase(state.time)} workflows?`)) {
    saveOrderForAllRoutineDays(visibleOrder);
  }
  saveSavedOrders();
  resetReorderState();
  render();
}

function saveOrderForKey(key, visibleOrder) {
  const previous = state.savedOrders[key] || [];
  state.savedOrders[key] = [
    ...visibleOrder,
    ...previous.filter((id) => !visibleOrder.includes(id)),
  ];
}

function shouldOfferRoutineOrderCopy() {
  return state.reorderKey === currentOrderKey()
    && state.mode === "routine"
    && state.day
    && state.time
    && !isCustomWorkflow(state.time)
    && state.time !== "free time";
}

function saveOrderForAllRoutineDays(sourceOrder) {
  protectedWorkflowTags.forEach((day) => {
    const key = handlingKey(day, state.time);
    const matchingTaskIds = sourceOrder.filter((id) => {
      const task = state.tasks.find((item) => item.id === id);
      return task && task.workflow.includes(day) && task.workflow.includes(state.time);
    });
    if (matchingTaskIds.length > 0) saveOrderForKey(key, matchingTaskIds);
  });
}

function moveTaskInDraft(id, direction, visibleTasks) {
  visibleTasks.forEach((task) => {
    if (!state.draftOrder.includes(task.id)) state.draftOrder.push(task.id);
  });
  const visibleIds = visibleTasks.map((task) => task.id);
  const visibleIndex = visibleIds.indexOf(id);
  const targetId = visibleIds[visibleIndex + direction];
  if (!targetId) return;
  const from = state.draftOrder.indexOf(id);
  const to = state.draftOrder.indexOf(targetId);
  [state.draftOrder[from], state.draftOrder[to]] = [state.draftOrder[to], state.draftOrder[from]];
  render();
}

function resetReorderState() {
  state.reorderMode = false;
  state.reorderKey = "";
  state.draftOrder = [];
}

function getDeadlineTasks(tasks) {
  const source = state.deadlineOnlyActionable ? tasks : state.tasks.filter((task) => !isBlocked(task));
  return source
    .filter((task) => task.deadline)
    .map((task) => ({ ...task, daysLeft: daysUntil(task.deadline) }))
    .filter((task) => task.daysLeft >= 0 && task.daysLeft <= state.deadlineWindow)
    .filter((task) => !isTaskWorkedOn(task) && !isTaskDelayed(task))
    .sort((a, b) => a.daysLeft - b.daysLeft || (statusRank.get(a.status) ?? 99) - (statusRank.get(b.status) ?? 99));
}

function renderDeadlineBand(tasks) {
  els.deadlineBand.hidden = tasks.length === 0;
  els.deadlineList.innerHTML = "";
  tasks.slice(0, 5).forEach((task) => {
    const row = document.createElement("div");
    row.className = "deadline-item";
    row.innerHTML = `<strong>${escapeHtml(task.task)}</strong><span>${deadlineLabel(task.deadline)}</span>`;
    els.deadlineList.append(row);
  });
}

function renderTaskFeed(tasks) {
  els.taskFeed.innerHTML = "";
  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.tasks.length === 0
      ? "Add your first task to begin."
      : state.mode === "routine"
        ? "This routine is clear. Free time is ready when you are."
        : "Nothing matches this workflow right now.";
    els.taskFeed.append(empty);
    return;
  }

  tasks.forEach((task, index) => {
    els.taskFeed.append(buildTaskCard(task, index, tasks));
  });
}

function buildTaskCard(task, index, tasks) {
  const card = document.createElement("article");
  const showStatusTag = state.mode === "all" || state.mode === "delayed";
  const showDetails = Boolean(state.showDetailsByMode[state.mode]);
  const completionPrompt = shouldPromptCompletion(task);
  const selected = state.selectedTaskIds.has(task.id);
  card.className = `task-card status-${statusClass(task.status)}${isTaskWorkedOn(task) ? " worked" : ""}${isTaskDelayed(task) ? " delayed" : ""}${state.reorderMode ? " reorder-card" : ""}${state.selectMode ? " select-card" : ""}${selected ? " selected" : ""}${completionPrompt ? " completion-prompt" : ""}`;
  card.title = statusLabel(task.status);
  const checkControls = state.reorderMode
    ? `<div class="reorder-grip" aria-hidden="true">↕</div>`
    : state.selectMode
      ? `<label class="selection-check" title="Select ${escapeHtml(task.task)}"><input type="checkbox" data-action="select" ${selected ? "checked" : ""} /><span class="sr-only">Select ${escapeHtml(task.task)}</span></label>`
      : `<button class="mini-toggle labeled ${isTaskWorkedOn(task) ? "active" : ""}" data-action="worked" title="Worked on" aria-label="Toggle worked on"><span>✓</span><strong>Worked on</strong></button>
        <button class="mini-toggle labeled delay ${isTaskDelayed(task) ? "active" : ""}" data-action="delayed" title="Not today" aria-label="Toggle not today"><span>!</span><strong>Not today</strong></button>`;
  const taskActions = state.reorderMode
    ? `<button class="icon-button" data-action="move-up" title="Move up" aria-label="Move ${escapeHtml(task.task)} up" ${index === 0 ? "disabled" : ""}>↑</button>
      <button class="icon-button" data-action="move-down" title="Move down" aria-label="Move ${escapeHtml(task.task)} down" ${index === tasks.length - 1 ? "disabled" : ""}>↓</button>`
    : state.selectMode
      ? ""
      : `<button class="icon-button" data-action="edit" title="Edit" aria-label="Edit ${escapeHtml(task.task)}">✎</button>
        <button class="icon-button" data-action="delete" title="Delete" aria-label="Delete ${escapeHtml(task.task)}">🗑</button>`;
  const detailTags = showDetails
    ? `${showStatusTag ? `<span class="pill status">${escapeHtml(statusLabel(task.status))}</span>` : ""}
      ${task.conditions.map((condition) => `<span class="pill">${escapeHtml(condition)}</span>`).join("")}
      ${task.workflow.map((tag) => `<span class="pill workflow">${escapeHtml(titleCase(tag))}</span>`).join("")}`
    : "";
  card.innerHTML = `
    <div class="task-checks">${checkControls}</div>
    <div class="task-content">
      <div class="task-title">${escapeHtml(task.task)}</div>
      <div class="task-meta${showDetails ? " details-open" : ""}">
        ${task.deadline ? `<span class="pill deadline">${deadlineLabel(task.deadline)}</span>` : ""}
        ${task.recurrence !== "none" ? `<span class="pill recurring">↻ ${recurrenceLabel(task)}</span>` : ""}
        ${isBlocked(task) ? `<span class="pill blocked">Blocked</span>` : ""}
        ${state.mode === "delayed" ? reviewIssues(task).map((issue) => `<span class="pill review">${escapeHtml(issue)}</span>`).join("") : ""}
        ${task.showLastWorkedOn && lastWorkedOnDate(task) ? `<span class="pill last-worked">Last worked on: ${formatIsoDate(lastWorkedOnDate(task))}</span>` : ""}
        ${detailTags}
      </div>
      ${completionPrompt ? `<label class="complete-prompt"><input type="checkbox" data-action="complete-delete" /> <span>Complete and delete</span></label>` : ""}
      ${state.mode === "delayed" && !state.selectMode && !state.reorderMode ? `<button class="review-clear-button" data-action="review-clear">No changes needed</button>` : ""}
    </div>
    <div class="task-actions">${taskActions}</div>`;
  if (state.reorderMode) {
    card.querySelector('[data-action="move-up"]').addEventListener("click", () => moveTaskInDraft(task.id, -1, tasks));
    card.querySelector('[data-action="move-down"]').addEventListener("click", () => moveTaskInDraft(task.id, 1, tasks));
  } else if (state.selectMode) {
    card.querySelector('[data-action="select"]').addEventListener("change", (event) => toggleTaskSelection(task.id, event.target.checked));
    card.addEventListener("click", (event) => {
      if (event.target.closest("input, button, label")) return;
      toggleTaskSelection(task.id, !state.selectedTaskIds.has(task.id));
    });
  } else {
    card.querySelector('[data-action="worked"]').addEventListener("click", () => toggleTask(task.id, "workedOn"));
    card.querySelector('[data-action="delayed"]').addEventListener("click", () => toggleTask(task.id, "delayed"));
    if (completionPrompt) card.querySelector('[data-action="complete-delete"]').addEventListener("change", () => requestDeleteTask(task.id));
    if (state.mode === "delayed") card.querySelector('[data-action="review-clear"]').addEventListener("click", () => clearReview(task.id));
    card.querySelector('[data-action="edit"]').addEventListener("click", () => openTaskEditor(task.id));
    card.querySelector('[data-action="delete"]').addEventListener("click", () => requestDeleteTask(task.id));
  }
  return card;
}

function renderWorkflowFilterControls() {
  els.workflowChips.innerHTML = "";
  state.workflowTags.forEach((tag) => {
    const chip = document.createElement("button");
    const required = state.requiredWorkflows.has(tag);
    const hidden = state.hiddenWorkflows.has(tag);
    chip.className = `chip${required ? " active" : ""}${hidden ? " warn" : ""}`;
    chip.textContent = hidden ? `Hide ${titleCase(tag)}` : required ? `Need ${titleCase(tag)}` : titleCase(tag);
    chip.addEventListener("click", () => rotateWorkflow(tag));
    els.workflowChips.append(chip);
  });
}

function renderConditionControls() {
  els.conditionChips.innerHTML = "";
  state.conditions.forEach((condition) => {
    const chip = document.createElement("button");
    const required = state.requiredConditions.has(condition);
    const hidden = state.hiddenConditions.has(condition);
    chip.className = `chip${required ? " active" : ""}${hidden ? " warn" : ""}`;
    chip.textContent = hidden ? `Hide ${condition}` : required ? `Need ${condition}` : condition;
    chip.addEventListener("click", () => rotateCondition(condition));
    els.conditionChips.append(chip);
  });
}

function renderCaptureChips() {
  els.workflowInput.innerHTML = "";
  state.workflowTags.forEach((tag) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `chip${state.captureWorkflow.has(tag) ? " active" : ""}`;
    chip.textContent = titleCase(tag);
    chip.addEventListener("click", () => {
      toggleSet(state.captureWorkflow, tag);
      renderCaptureChips();
    });
    els.workflowInput.append(chip);
  });

  els.conditionInput.innerHTML = "";
  state.conditions.forEach((condition) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `chip${state.captureConditions.has(condition) ? " active" : ""}`;
    chip.textContent = condition;
    chip.addEventListener("click", () => {
      toggleSet(state.captureConditions, condition);
      renderCaptureChips();
    });
    els.conditionInput.append(chip);
  });
}

function rotateWorkflow(tag) {
  if (!state.requiredWorkflows.has(tag) && !state.hiddenWorkflows.has(tag)) {
    state.requiredWorkflows.add(tag);
  } else if (state.requiredWorkflows.has(tag)) {
    state.requiredWorkflows.delete(tag);
    state.hiddenWorkflows.add(tag);
  } else {
    state.hiddenWorkflows.delete(tag);
  }
  render();
}

function rotateCondition(condition) {
  if (!state.requiredConditions.has(condition) && !state.hiddenConditions.has(condition)) {
    state.requiredConditions.add(condition);
  } else if (state.requiredConditions.has(condition)) {
    state.requiredConditions.delete(condition);
    state.hiddenConditions.add(condition);
  } else {
    state.hiddenConditions.delete(condition);
  }
  render();
}

function openCapture() {
  state.editingTaskId = null;
  const captureDefaults = [...protectedWorkflowTags, "free time"].filter((tag) => state.workflowTags.includes(tag));
  state.captureWorkflow = new Set(captureDefaults);
  state.captureConditions = new Set();
  els.taskInput.value = "";
  els.statusInput.value = state.mode === "routine" ? "Current Habit" : "Current Project";
  els.deadlineInput.value = "";
  els.recurrenceInput.value = "none";
  els.stackMissedInput.checked = false;
  els.showLastWorkedOnInput.checked = false;
  renderDependencyOptions([], []);
  els.advancedSettings.open = false;
  syncRecurrenceInput();
  els.captureEyebrow.textContent = "Quick Capture";
  els.captureTitle.textContent = "Put it down, then get back out.";
  els.saveTask.textContent = "Save task";
  renderCaptureChips();
  els.captureDialog.showModal();
  els.taskInput.focus();
}

function openTaskEditor(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  state.editingTaskId = id;
  state.captureWorkflow = new Set(task.workflow);
  state.captureConditions = new Set(task.conditions);
  els.taskInput.value = task.task;
  els.statusInput.value = task.status;
  els.deadlineInput.value = task.deadline || task.nextOccurrence;
  els.recurrenceInput.value = task.recurrence;
  els.stackMissedInput.checked = task.stackMissed;
  els.showLastWorkedOnInput.checked = Boolean(task.showLastWorkedOn);
  renderDependencyOptions(blockedByIds(task), task.blocking);
  els.advancedSettings.open = false;
  syncRecurrenceInput();
  els.captureEyebrow.textContent = "Edit Task";
  els.captureTitle.textContent = "Adjust what belongs in your flow.";
  els.saveTask.textContent = "Save changes";
  renderCaptureChips();
  els.captureDialog.showModal();
  els.taskInput.focus();
}

function closeCapture() {
  els.captureDialog.close();
}

function syncRecurrenceInput() {
  const repeats = els.recurrenceInput.value !== "none";
  els.recurrenceBehavior.hidden = !repeats;
  els.deadlineInput.required = repeats;
  if (!repeats) {
    els.stackMissedInput.checked = false;
  }
}

function renderDependencyOptions(blockedByIdsValue, blockingIdsValue) {
  const currentId = state.editingTaskId;
  const options = state.tasks
    .filter((task) => task.id !== currentId)
    .sort((a, b) => a.task.localeCompare(b.task));
  fillTaskSelect(els.blockedByInput, options, blockedByIdsValue);
  fillTaskSelect(els.blockingInput, options, blockingIdsValue);
}

function fillTaskSelect(select, tasks, selectedIds) {
  const selected = new Set(selectedIds || []);
  select.innerHTML = "";
  tasks.forEach((task) => {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = task.task;
    option.selected = selected.has(task.id);
    select.append(option);
  });
}

function selectedValues(select) {
  return [...select.selectedOptions].map((option) => option.value).filter(Boolean);
}

function saveCapturedTask(event) {
  event.preventDefault();
  const existingTask = state.editingTaskId
    ? state.tasks.find((item) => item.id === state.editingTaskId)
    : null;
  const recurrence = els.recurrenceInput.value;
  const deadline = els.deadlineInput.value;
  const blockedByIdsValue = selectedValues(els.blockedByInput);
  const blockingIdsValue = selectedValues(els.blockingInput);
  const overlap = blockedByIdsValue.some((id) => blockingIdsValue.includes(id));
  els.blockingInput.setCustomValidity(overlap ? "A task cannot block and be blocked by the same task." : "");
  if (!els.captureForm.reportValidity()) return;
  const values = {
    task: els.taskInput.value.trim(),
    conditions: [...state.captureConditions],
    status: els.statusInput.value,
    deadline,
    recurrence,
    nextOccurrence: recurrence === "none" ? "" : deadline || existingTask?.nextOccurrence || todayIso,
    stackMissed: recurrence !== "none" && els.stackMissedInput.checked,
    showLastWorkedOn: els.showLastWorkedOnInput.checked,
    workflow: [...state.captureWorkflow],
  };
  if (!values.task) return;
  let savedTask;
  if (state.editingTaskId) {
    if (!existingTask) return;
    Object.assign(existingTask, values);
    savedTask = existingTask;
  } else {
    savedTask = {
      id: crypto.randomUUID(),
      workedOn: false,
      delayed: false,
      blockedBy: [],
      blocking: [],
      lastCompleted: "",
      ...values,
    };
    state.tasks.push(savedTask);
  }
  syncTaskRelations(savedTask, blockedByIdsValue, blockingIdsValue);
  state.paths.filter((path) => path.taskIds.includes(savedTask.id)).forEach(rebuildPathChain);
  savePaths();
  saveTasks();
  els.captureDialog.close();
  render();
}

function toggleTask(id, key) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  if (key === "workedOn" && !isTaskWorkedOn(task) && task.recurrence !== "none") {
    const start = task.nextOccurrence || todayIso;
    task.nextOccurrence = task.stackMissed
      ? addOccurrence(start, task.recurrence)
      : firstOccurrenceAfterToday(start, task.recurrence);
    task.deadline = task.nextOccurrence;
    setHandlingState(task, "workedOn", countDueOccurrences(task) === 0);
    setHandlingState(task, "delayed", false);
    task.lastCompleted = todayIso;
    saveTasks();
    render();
    return;
  }
  const nextValue = key === "workedOn" ? !isTaskWorkedOn(task) : !isTaskDelayed(task);
  setHandlingState(task, key, nextValue);
  if (key === "workedOn" && nextValue) setHandlingState(task, "delayed", false);
  if (key === "delayed" && nextValue) setHandlingState(task, "workedOn", false);
  saveTasks();
  render();
}

function requestDeleteTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  if (task.recurrence === "none") {
    deleteTask(id);
    return;
  }
  state.pendingDeleteTaskId = id;
  els.recurringDeleteDialog.showModal();
}

function closeRecurringDelete() {
  state.pendingDeleteTaskId = null;
  els.recurringDeleteDialog.close();
}

function completePendingOccurrence() {
  const task = state.tasks.find((item) => item.id === state.pendingDeleteTaskId);
  if (task) completeRecurringOccurrence(task);
  closeRecurringDelete();
  render();
}

function deletePendingSeries() {
  const id = state.pendingDeleteTaskId;
  closeRecurringDelete();
  if (id) deleteTask(id);
}

function completeRecurringOccurrence(task) {
  const start = task.nextOccurrence || task.deadline || todayIso;
  task.nextOccurrence = task.stackMissed
    ? addOccurrence(start, task.recurrence)
    : firstOccurrenceAfterToday(start, task.recurrence);
  task.deadline = task.nextOccurrence;
  task.lastCompleted = todayIso;
  task.handledStates = {};
  task.workedOn = false;
  task.delayed = false;
  task.lastCheckboxAction = "";
  task.lastCheckboxAt = "";
  saveTasks();
}

function deleteTask(id) {
  state.tasks.forEach((task) => {
    task.blocking = task.blocking.filter((blockedId) => blockedId !== id);
    task.blockedBy = blockedByIds(task).filter((blockedId) => blockedId !== id);
  });
  state.tasks = state.tasks.filter((task) => task.id !== id);
  state.highlights.taskIds = state.highlights.taskIds.filter((taskId) => taskId !== id);
  state.paths.forEach((path) => {
    path.taskIds = path.taskIds.filter((taskId) => taskId !== id);
    path.managedEdges = (path.managedEdges || []).filter((edge) => !edge.split(">").includes(id));
    rebuildPathChain(path);
  });
  Object.keys(state.savedOrders).forEach((key) => {
    state.savedOrders[key] = state.savedOrders[key].filter((taskId) => taskId !== id);
  });
  saveSavedOrders();
  saveHighlights();
  savePaths();
  saveTasks();
  render();
}

function endSelection() {
  state.selectMode = false;
  state.selectedTaskIds.clear();
}

function toggleTaskSelection(id, selected) {
  if (selected) state.selectedTaskIds.add(id);
  else state.selectedTaskIds.delete(id);
  render();
}

function selectedTasks() {
  return state.tasks.filter((task) => state.selectedTaskIds.has(task.id));
}

function bulkDeleteSelected() {
  const tasks = selectedTasks();
  if (!tasks.length || !window.confirm(`Delete ${tasks.length} selected task${tasks.length === 1 ? "" : "s"}? Recurring series will be deleted in full.`)) return;
  const ids = new Set(tasks.map((task) => task.id));
  [...ids].forEach((id) => deleteTaskWithoutRender(id));
  endSelection();
  saveSavedOrders();
  saveHighlights();
  savePaths();
  saveTasks();
  render();
}

function deleteTaskWithoutRender(id) {
  state.tasks.forEach((task) => {
    task.blocking = task.blocking.filter((blockedId) => blockedId !== id);
    task.blockedBy = blockedByIds(task).filter((blockedId) => blockedId !== id);
  });
  state.tasks = state.tasks.filter((task) => task.id !== id);
  state.highlights.taskIds = state.highlights.taskIds.filter((taskId) => taskId !== id);
  state.paths.forEach((path) => {
    path.taskIds = path.taskIds.filter((taskId) => taskId !== id);
    path.managedEdges = (path.managedEdges || []).filter((edge) => !edge.split(">").includes(id));
    rebuildPathChain(path);
  });
  Object.keys(state.savedOrders).forEach((key) => {
    state.savedOrders[key] = state.savedOrders[key].filter((taskId) => taskId !== id);
  });
}

function openBulkTags() {
  if (!state.selectedTaskIds.size) return;
  state.bulkWorkflows.clear();
  state.bulkConditions.clear();
  renderBulkTagChoices();
  els.bulkTagsDialog.showModal();
}

function renderBulkTagChoices() {
  renderBulkChoices(els.bulkWorkflowInput, state.workflowTags, state.bulkWorkflows, true);
  renderBulkChoices(els.bulkConditionInput, state.conditions, state.bulkConditions, false);
}

function renderBulkChoices(container, values, selected, titleCaseLabels) {
  container.innerHTML = "";
  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${selected.has(value) ? " active" : ""}`;
    button.textContent = titleCaseLabels ? titleCase(value) : value;
    button.addEventListener("click", () => {
      toggleSet(selected, value);
      renderBulkTagChoices();
    });
    container.append(button);
  });
}

function applyBulkTags(event) {
  event.preventDefault();
  selectedTasks().forEach((task) => {
    task.workflow = uniqueValues([...task.workflow, ...state.bulkWorkflows]);
    task.conditions = uniqueValues([...task.conditions, ...state.bulkConditions]);
  });
  saveTasks();
  els.bulkTagsDialog.close();
  endSelection();
  render();
}

function addSelectedToHighlights() {
  if (!state.selectedTaskIds.size) return;
  state.highlights.taskIds = uniqueValues([...state.highlights.taskIds, ...state.selectedTaskIds]);
  saveHighlights();
  endSelection();
  state.mode = "highlights";
  render();
}

function clearReview(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  task.reviewClearedSignature = reviewSignature(task);
  task.reviewClearedAt = new Date().toISOString();
  saveTasks();
  render();
}

function currentHandlingKey() {
  if (state.mode === "routine" || state.mode === "free") return handlingKey(state.day, state.time);
  return "global";
}

function handlingKey(day, time) {
  return `routine:${isCustomWorkflow(time) ? "all" : day}:${time}`;
}

function handlingRecord(task, key = currentHandlingKey()) {
  const records = task.handledStates && typeof task.handledStates === "object" ? task.handledStates : {};
  if (key === "global") return latestHandlingRecord(task);
  return records[key] || null;
}

function latestHandlingRecord(task) {
  const records = Object.values(task.handledStates || {});
  if (!records.length) {
    if (!task.workedOn && !task.delayed) return null;
    return {
      workedOn: Boolean(task.workedOn),
      delayed: Boolean(task.delayed),
      action: task.lastCheckboxAction || (task.delayed ? "delayed" : "workedOn"),
      at: task.lastCheckboxAt || "",
    };
  }
  return records
    .filter((record) => record && (record.workedOn || record.delayed))
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))[0] || null;
}

function isTaskWorkedOn(task) {
  return Boolean(handlingRecord(task)?.workedOn);
}

function isTaskDelayed(task) {
  return Boolean(handlingRecord(task)?.delayed);
}

function isTaskHandled(task) {
  return isTaskWorkedOn(task) || isTaskDelayed(task);
}

function latestHandlingAction(task) {
  return latestHandlingRecord(task)?.action || "";
}

function blockedByIds(task) {
  if (Array.isArray(task.blockedBy)) return task.blockedBy.filter(Boolean);
  return task.blockedBy ? [task.blockedBy] : [];
}

function isBlocked(task) {
  return blockedByIds(task).length > 0;
}

function isBlockingLoopTask(task) {
  return blockedByIds(task).some((blockerId) => reachesTask(blockerId, task.id, new Set([task.id])));
}

function reachesTask(currentId, targetId, seen) {
  if (currentId === targetId) return true;
  if (seen.has(currentId)) return false;
  seen.add(currentId);
  const current = state.tasks.find((task) => task.id === currentId);
  if (!current) return false;
  return blockedByIds(current).some((nextId) => reachesTask(nextId, targetId, seen));
}

function lastWorkedOnDate(task) {
  const workedRecords = Object.values(task.handledStates || {})
    .filter((record) => record?.workedOn && record.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at));
  if (workedRecords.length) return workedRecords[0].at.slice(0, 10);
  if (task.lastCheckboxAction === "workedOn" && task.lastCheckboxAt) return task.lastCheckboxAt.slice(0, 10);
  if (task.lastCompleted) return task.lastCompleted;
  return "";
}

function setHandlingState(task, key, value) {
  if (!task.handledStates || typeof task.handledStates !== "object" || Array.isArray(task.handledStates)) {
    task.handledStates = {};
  }
  const recordKey = currentHandlingKey();
  const record = task.handledStates[recordKey] || {};
  const now = new Date().toISOString();
  record.workedOn = key === "workedOn" ? value : Boolean(record.workedOn);
  record.delayed = key === "delayed" ? value : Boolean(record.delayed);
  if (value) {
    record.action = keyToAction(key);
    record.at = now;
  } else if (!record.workedOn && !record.delayed) {
    record.action = "";
    record.at = record.at || now;
  }
  if (!record.workedOn && !record.delayed) {
    delete task.handledStates[recordKey];
  } else {
    task.handledStates[recordKey] = record;
  }
  task.workedOn = Boolean(latestHandlingRecord(task)?.workedOn);
  task.delayed = Boolean(latestHandlingRecord(task)?.delayed);
  task.lastCheckboxAction = latestHandlingRecord(task)?.action || "";
  task.lastCheckboxAt = latestHandlingRecord(task)?.at || "";
}

function syncTaskRelations(task, blockedByIdsValue, blockingIdsValue) {
  const blockedBySet = new Set(blockedByIdsValue);
  const blockingSet = new Set(blockingIdsValue);
  state.tasks.forEach((item) => {
    item.blocking = item.blocking.filter((blockedId) => blockedId !== task.id);
    item.blockedBy = blockedByIds(item).filter((blockedId) => blockedId !== task.id);
  });
  task.blockedBy = [];
  task.blocking = [];

  blockedBySet.forEach((id) => {
    const blocker = state.tasks.find((item) => item.id === id);
    if (!blocker) return;
    if (!task.blockedBy.includes(blocker.id)) task.blockedBy.push(blocker.id);
    if (!blocker.blocking.includes(task.id)) blocker.blocking.push(task.id);
  });

  blockingSet.forEach((id) => {
    const blockedTask = state.tasks.find((item) => item.id === id);
    if (!blockedTask) return;
    blockedTask.blockedBy = uniqueValues([...blockedByIds(blockedTask), task.id]);
    if (!task.blocking.includes(blockedTask.id)) task.blocking.push(blockedTask.id);
  });
}

function loadHighlights() {
  const cycle = highlightCycleKey();
  try {
    const saved = JSON.parse(localStorage.getItem(highlightsStorageKey));
    if (saved && typeof saved === "object") {
      return {
        note: typeof saved.note === "string" ? saved.note : "",
        taskIds: Array.isArray(saved.taskIds) ? saved.taskIds : [],
        lastPromptCycle: saved.lastPromptCycle || cycle,
      };
    }
  } catch {
    // Use a clean highlights panel.
  }
  return { note: "", taskIds: [], lastPromptCycle: cycle };
}

function saveHighlights() {
  localStorage.setItem(highlightsStorageKey, JSON.stringify(state.highlights));
}

function highlightCycleKey() {
  const now = new Date();
  const boundary = new Date(now);
  boundary.setHours(5, 0, 0, 0);
  if (now < boundary) boundary.setDate(boundary.getDate() - 1);
  return toIsoDate(boundary);
}

function maybePromptHighlightRefresh() {
  const cycle = highlightCycleKey();
  if (state.highlights.lastPromptCycle === cycle) return;
  const hasContent = state.highlights.note.trim() || state.highlights.taskIds.length;
  state.highlights.lastPromptCycle = cycle;
  if (hasContent && window.confirm("It is a new highlights day. Clear the note and attached tasks for a fresh start?")) {
    state.highlights.note = "";
    state.highlights.taskIds = [];
  }
  saveHighlights();
}

function refreshHighlights(manual) {
  if (manual && (state.highlights.note.trim() || state.highlights.taskIds.length)
    && !window.confirm("Clear all highlight notes and attached tasks?")) return;
  state.highlights.note = "";
  state.highlights.taskIds = [];
  state.highlights.lastPromptCycle = highlightCycleKey();
  saveHighlights();
  render();
}

function renderHighlights() {
  if (document.activeElement !== els.highlightNote) els.highlightNote.value = state.highlights.note;
  state.highlights.taskIds = state.highlights.taskIds.filter((id) => state.tasks.some((task) => task.id === id));
  els.highlightFeed.innerHTML = "";
  const tasks = state.highlights.taskIds.map((id) => state.tasks.find((task) => task.id === id)).filter(Boolean);
  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Select tasks from Routine, All, or Review to keep them here.";
    els.highlightFeed.append(empty);
    return;
  }
  tasks.forEach((task, index) => {
    const card = document.createElement("article");
    card.className = `task-card highlight-card status-${statusClass(task.status)}${isTaskWorkedOn(task) ? " worked" : ""}${isTaskDelayed(task) ? " delayed" : ""}`;
    card.draggable = true;
    card.dataset.taskId = task.id;
    card.innerHTML = `
      <div class="task-checks">
        <button class="mini-toggle labeled ${isTaskWorkedOn(task) ? "active" : ""}" data-action="worked"><span>✓</span><strong>Worked on</strong></button>
        <button class="mini-toggle labeled delay ${isTaskDelayed(task) ? "active" : ""}" data-action="delayed"><span>!</span><strong>Not today</strong></button>
      </div>
      <div class="task-content"><div class="task-title">${escapeHtml(task.task)}</div>${task.deadline ? `<div class="task-meta"><span class="pill deadline">${deadlineLabel(task.deadline)}</span></div>` : ""}</div>
      <div class="task-actions">
        <button class="icon-button" data-action="up" aria-label="Move up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button class="icon-button" data-action="down" aria-label="Move down" ${index === tasks.length - 1 ? "disabled" : ""}>↓</button>
        <button class="ghost-button compact-button" data-action="drop">Remove</button>
      </div>`;
    card.querySelector('[data-action="worked"]').addEventListener("click", () => toggleTask(task.id, "workedOn"));
    card.querySelector('[data-action="delayed"]').addEventListener("click", () => toggleTask(task.id, "delayed"));
    card.querySelector('[data-action="up"]').addEventListener("click", () => moveHighlightTask(task.id, -1));
    card.querySelector('[data-action="down"]').addEventListener("click", () => moveHighlightTask(task.id, 1));
    card.querySelector('[data-action="drop"]').addEventListener("click", () => dropHighlightTask(task.id));
    card.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", task.id));
    card.addEventListener("dragover", (event) => event.preventDefault());
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      moveHighlightTaskBefore(event.dataTransfer.getData("text/plain"), task.id);
    });
    els.highlightFeed.append(card);
  });
}

function moveHighlightTask(id, direction) {
  const from = state.highlights.taskIds.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= state.highlights.taskIds.length) return;
  [state.highlights.taskIds[from], state.highlights.taskIds[to]] = [state.highlights.taskIds[to], state.highlights.taskIds[from]];
  saveHighlights();
  renderHighlights();
}

function moveHighlightTaskBefore(draggedId, targetId) {
  if (!draggedId || draggedId === targetId) return;
  const ids = state.highlights.taskIds.filter((id) => id !== draggedId);
  const target = ids.indexOf(targetId);
  if (target < 0) return;
  ids.splice(target, 0, draggedId);
  state.highlights.taskIds = ids;
  saveHighlights();
  renderHighlights();
}

function dropHighlightTask(id) {
  state.highlights.taskIds = state.highlights.taskIds.filter((taskId) => taskId !== id);
  saveHighlights();
  renderHighlights();
}

function loadPaths() {
  try {
    const saved = JSON.parse(localStorage.getItem(pathsStorageKey));
    if (!Array.isArray(saved)) return [];
    return saved.map((path) => ({
      id: path.id || crypto.randomUUID(),
      name: path.name || "Untitled path",
      taskIds: Array.isArray(path.taskIds) ? path.taskIds : [],
      managedEdges: Array.isArray(path.managedEdges) ? path.managedEdges : [],
    }));
  } catch {
    return [];
  }
}

function savePaths() {
  localStorage.setItem(pathsStorageKey, JSON.stringify(state.paths));
}

function activePath() {
  return state.paths.find((path) => path.id === state.activePathId) || state.paths[0] || null;
}

function createPath() {
  state.pathNameMode = "create";
  els.pathNameTitle.textContent = "New path";
  els.pathNameInput.value = "";
  els.pathNameDialog.showModal();
  els.pathNameInput.focus();
}

function renameActivePath() {
  const path = activePath();
  if (!path) return;
  state.pathNameMode = "rename";
  els.pathNameTitle.textContent = "Rename path";
  els.pathNameInput.value = path.name;
  els.pathNameDialog.showModal();
  els.pathNameInput.focus();
}

function savePathName(event) {
  event.preventDefault();
  const name = els.pathNameInput.value.trim();
  if (!name) return;
  if (state.pathNameMode === "rename") {
    const path = activePath();
    if (path) path.name = name;
  } else {
    const path = { id: crypto.randomUUID(), name, taskIds: [], managedEdges: [] };
    state.paths.push(path);
    state.activePathId = path.id;
  }
  savePaths();
  els.pathNameDialog.close();
  renderPaths();
}

function deleteActivePath() {
  const path = activePath();
  if (!path || !window.confirm(`Delete the path “${path.name}”? The tasks themselves will stay in your list.`)) return;
  removeManagedEdges(path);
  state.paths = state.paths.filter((item) => item.id !== path.id);
  state.activePathId = state.paths[0]?.id || "";
  savePaths();
  saveTasks();
  renderPaths();
}

function addSelectedToPath() {
  if (!state.selectedTaskIds.size) return;
  els.pathChooserSelect.innerHTML = "";
  if (!state.paths.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No paths yet";
    els.pathChooserSelect.append(option);
  } else {
    state.paths.forEach((path) => {
      const option = document.createElement("option");
      option.value = path.id;
      option.textContent = path.name;
      els.pathChooserSelect.append(option);
    });
  }
  els.pathChooserNewName.value = "";
  els.pathChooserDialog.showModal();
}

function confirmAddSelectedToPath(event) {
  event.preventDefault();
  const newName = els.pathChooserNewName.value.trim();
  let path = newName
    ? { id: crypto.randomUUID(), name: newName, taskIds: [], managedEdges: [] }
    : state.paths.find((item) => item.id === els.pathChooserSelect.value);
  if (newName) state.paths.push(path);
  if (!path) return;
  path.taskIds = uniqueValues([...path.taskIds, ...state.selectedTaskIds]);
  rebuildPathChain(path);
  savePaths();
  saveTasks();
  endSelection();
  state.activePathId = path.id;
  state.mode = "paths";
  els.pathChooserDialog.close();
  render();
}

function renderPaths() {
  if (!state.activePathId && state.paths[0]) state.activePathId = state.paths[0].id;
  els.pathSelect.innerHTML = "";
  state.paths.forEach((path) => {
    const option = document.createElement("option");
    option.value = path.id;
    option.textContent = path.name;
    els.pathSelect.append(option);
  });
  els.pathSelect.value = state.activePathId;
  const path = activePath();
  els.renamePath.disabled = !path;
  els.deletePath.disabled = !path;
  els.pathCanvas.innerHTML = "";
  if (!path) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Create a path, then add selected tasks or make new steps directly here.";
    els.pathCanvas.append(empty);
    return;
  }
  path.taskIds = path.taskIds.filter((id) => state.tasks.some((task) => task.id === id));
  renderPathInsert(path, 0);
  path.taskIds.forEach((id, index) => {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;
    const node = document.createElement("article");
    node.className = `path-node status-${statusClass(task.status)}`;
    node.draggable = true;
    const blockers = blockedByIds(task).map((blockerId) => state.tasks.find((item) => item.id === blockerId)?.task).filter(Boolean);
    node.innerHTML = `<div class="path-node-grip">↕</div><div><strong>${escapeHtml(task.task)}</strong>${blockers.length ? `<small>Blocked by: ${blockers.map(escapeHtml).join(", ")}</small>` : ""}</div><div class="path-node-actions"><button class="icon-button" data-action="edit" aria-label="Edit">✎</button><button class="ghost-button compact-button" data-action="remove">Remove</button></div>`;
    node.querySelector('[data-action="edit"]').addEventListener("click", () => openTaskEditor(task.id));
    node.querySelector('[data-action="remove"]').addEventListener("click", () => removeTaskFromPath(path, task.id));
    node.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", task.id));
    node.addEventListener("dragover", (event) => event.preventDefault());
    node.addEventListener("drop", (event) => {
      event.preventDefault();
      movePathTaskBefore(path, event.dataTransfer.getData("text/plain"), task.id);
    });
    els.pathCanvas.append(node);
    renderPathInsert(path, index + 1);
  });
}

function renderPathInsert(path, index) {
  const row = document.createElement("div");
  row.className = "path-insert";
  row.innerHTML = `<span aria-hidden="true">↓</span><button class="text-button" type="button">+ Add a new task here</button>`;
  row.querySelector("button").addEventListener("click", () => insertTaskInPath(path, index));
  els.pathCanvas.append(row);
}

function insertTaskInPath(path, index) {
  state.pendingPathId = path.id;
  state.pendingPathInsertIndex = index;
  els.pathTaskInput.value = "";
  els.pathTaskDialog.showModal();
  els.pathTaskInput.focus();
}

function saveInsertedPathTask(event) {
  event.preventDefault();
  const path = state.paths.find((item) => item.id === state.pendingPathId);
  const title = els.pathTaskInput.value.trim();
  if (!path || !title) return;
  const task = normalizeTask({
    id: crypto.randomUUID(),
    task: title,
    status: "Current Project",
    conditions: [],
    workflow: [...protectedWorkflowTags, "free time"].filter((tag) => state.workflowTags.includes(tag)),
    deadline: "",
    recurrence: "none",
    blockedBy: [],
    blocking: [],
  });
  state.tasks.push(task);
  path.taskIds.splice(state.pendingPathInsertIndex, 0, task.id);
  rebuildPathChain(path);
  saveTasks();
  savePaths();
  els.pathTaskDialog.close();
  renderPaths();
}

function removeTaskFromPath(path, id) {
  path.taskIds = path.taskIds.filter((taskId) => taskId !== id);
  rebuildPathChain(path);
  saveTasks();
  savePaths();
  renderPaths();
}

function movePathTaskBefore(path, draggedId, targetId) {
  if (!draggedId || draggedId === targetId || !path.taskIds.includes(draggedId)) return;
  const ids = path.taskIds.filter((id) => id !== draggedId);
  const target = ids.indexOf(targetId);
  if (target < 0) return;
  ids.splice(target, 0, draggedId);
  path.taskIds = ids;
  rebuildPathChain(path);
  saveTasks();
  savePaths();
  renderPaths();
}

function rebuildPathChain(path) {
  removeManagedEdges(path);
  path.managedEdges = [];
  for (let index = 0; index < path.taskIds.length - 1; index += 1) {
    const blockerId = path.taskIds[index];
    const blockedId = path.taskIds[index + 1];
    addDependency(blockerId, blockedId);
    path.managedEdges.push(`${blockerId}>${blockedId}`);
  }
}

function removeManagedEdges(path) {
  (path.managedEdges || []).forEach((edge) => {
    if (state.paths.some((other) => other.id !== path.id && (other.managedEdges || []).includes(edge))) return;
    const [blockerId, blockedId] = edge.split(">");
    removeDependency(blockerId, blockedId);
  });
}

function addDependency(blockerId, blockedId) {
  const blocker = state.tasks.find((task) => task.id === blockerId);
  const blocked = state.tasks.find((task) => task.id === blockedId);
  if (!blocker || !blocked || blockerId === blockedId) return;
  blocker.blocking = uniqueValues([...blocker.blocking, blockedId]);
  blocked.blockedBy = uniqueValues([...blockedByIds(blocked), blockerId]);
}

function removeDependency(blockerId, blockedId) {
  const blocker = state.tasks.find((task) => task.id === blockerId);
  const blocked = state.tasks.find((task) => task.id === blockedId);
  if (blocker) blocker.blocking = blocker.blocking.filter((id) => id !== blockedId);
  if (blocked) blocked.blockedBy = blockedByIds(blocked).filter((id) => id !== blockerId);
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) ? saved.map(normalizeTask) : notionTasks();
  } catch {
    return notionTasks();
  }
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(state.tasks));
}

function loadSavedOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem(orderStorageKey));
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(
      Object.entries(saved).filter(([, ids]) => Array.isArray(ids)),
    );
  } catch {
    return {};
  }
}

function loadViewState(settings, fallbackTime) {
  const defaultFilters = defaultFiltersByMode();
  const fallback = {
    mode: "routine",
    day: dayName,
    time: fallbackTime,
    filtersByMode: defaultFilters,
    showDetailsByMode: normalizeDetailsByMode(),
  };
  try {
    const saved = JSON.parse(localStorage.getItem(viewStorageKey));
    if (!saved || typeof saved !== "object") return fallback;
    const mode = ["routine", "free", "all", "delayed", "highlights", "paths"].includes(saved.mode) ? saved.mode : fallback.mode;
    return {
      ...fallback,
      mode,
      day: protectedWorkflowTags.includes(saved.day) ? saved.day : fallback.day,
      time: settings.workflowTags.includes(saved.time) ? saved.time : fallback.time,
      filtersByMode: loadFiltersByMode(saved, settings, mode, defaultFilters),
      showDetailsByMode: normalizeDetailsByMode(saved.showDetailsByMode),
    };
  } catch {
    return fallback;
  }
}

function defaultFiltersByMode() {
  return {
    routine: defaultFilterState("routine"),
    free: defaultFilterState("free"),
    all: defaultFilterState("all"),
    delayed: defaultFilterState("delayed"),
  };
}

function defaultFilterState(mode) {
  const showEverything = mode === "all" || mode === "delayed";
  return {
    requiredConditions: [],
    hiddenConditions: [],
    requiredWorkflows: [],
    hiddenWorkflows: [],
    search: "",
    hideHandled: !showEverything,
    showBlocked: showEverything,
    deadlineWindow: 5,
    deadlineOnlyActionable: true,
    freeDayFilter: false,
  };
}

function loadFiltersByMode(saved, settings, activeMode, defaults) {
  const loaded = { ...defaults };
  if (saved.filtersByMode && typeof saved.filtersByMode === "object" && !Array.isArray(saved.filtersByMode)) {
    ["routine", "free", "all", "delayed"].forEach((mode) => {
      loaded[mode] = normalizeFilterState(saved.filtersByMode[mode], settings, defaults[mode]);
    });
    return loaded;
  }
  const filterMode = ["routine", "free", "all", "delayed"].includes(activeMode) ? activeMode : "routine";
  loaded[filterMode] = normalizeFilterState(saved, settings, defaults[filterMode]);
  if (filterMode === "all") loaded.all = defaultFilterState("all");
  return loaded;
}

function normalizeFilterState(value, settings, fallback) {
  if (!value || typeof value !== "object") return { ...fallback };
  return {
    requiredConditions: filterKnown(value.requiredConditions, settings.conditions),
    hiddenConditions: filterKnown(value.hiddenConditions, settings.conditions),
    requiredWorkflows: filterKnown(value.requiredWorkflows, settings.workflowTags),
    hiddenWorkflows: filterKnown(value.hiddenWorkflows, settings.workflowTags),
    search: typeof value.search === "string" ? value.search : fallback.search,
    hideHandled: typeof value.hideHandled === "boolean" ? value.hideHandled : fallback.hideHandled,
    showBlocked: typeof value.showBlocked === "boolean" ? value.showBlocked : fallback.showBlocked,
    deadlineWindow: Number.isFinite(value.deadlineWindow) ? value.deadlineWindow : fallback.deadlineWindow,
    deadlineOnlyActionable: typeof value.deadlineOnlyActionable === "boolean" ? value.deadlineOnlyActionable : fallback.deadlineOnlyActionable,
    freeDayFilter: typeof value.freeDayFilter === "boolean" ? value.freeDayFilter : fallback.freeDayFilter,
  };
}

function saveViewState() {
  localStorage.setItem(viewStorageKey, JSON.stringify({
    mode: state.mode,
    day: state.day,
    time: state.time,
    filtersByMode: state.filtersByMode,
    showDetailsByMode: state.showDetailsByMode,
  }));
}

function normalizeDetailsByMode(value) {
  const defaults = { routine: false, free: false, all: false, delayed: false, highlights: false, paths: false };
  if (!value || typeof value !== "object") return defaults;
  Object.keys(defaults).forEach((mode) => {
    defaults[mode] = Boolean(value[mode]);
  });
  return defaults;
}

function saveSavedOrders() {
  localStorage.setItem(orderStorageKey, JSON.stringify(state.savedOrders));
}

function loadSettings() {
  const importedWorkflows = notionTaskData.flatMap((task) => task.workflow || []);
  const importedConditions = notionTaskData.flatMap((task) => task.conditions || []);
  try {
    const saved = JSON.parse(localStorage.getItem(settingsStorageKey));
    if (Array.isArray(saved?.workflowTags) && Array.isArray(saved?.conditions)) {
      return {
        workflowTags: uniqueValues([...protectedWorkflowTags, ...saved.workflowTags]),
        conditions: uniqueValues(saved.conditions),
      };
    }
  } catch {
    // Fall through to defaults.
  }
  return {
    workflowTags: uniqueValues([...defaultWorkflowTags, ...importedWorkflows]),
    conditions: uniqueValues([...defaultConditions, ...importedConditions]),
  };
}

function saveSettings() {
  localStorage.setItem(settingsStorageKey, JSON.stringify({
    workflowTags: state.workflowTags,
    conditions: state.conditions,
  }));
}

function renderWorkflowSelect() {
  const selectable = state.workflowTags.filter((tag) => !protectedWorkflowTags.includes(tag));
  if (!selectable.includes(state.time)) state.time = selectable[0] || "";
  els.timeSelect.innerHTML = "";
  if (selectable.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No workflow";
    els.timeSelect.append(option);
    return;
  }
  selectable.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = titleCase(tag);
    els.timeSelect.append(option);
  });
  els.timeSelect.value = state.time;
}

function openTagManager(kind) {
  renderTagManager();
  els.tagDialog.showModal();
  const target = kind === "workflow" ? els.newWorkflowInput : els.newConditionInput;
  target.focus();
}

function renderTagManager() {
  renderManagedTags(els.workflowManagerList, state.workflowTags, "workflow");
  renderManagedTags(els.conditionManagerList, state.conditions, "condition");
}

function renderManagedTags(container, values, kind) {
  container.innerHTML = "";
  values.forEach((value) => {
    const row = document.createElement("div");
    row.className = "managed-tag";
    const name = document.createElement("span");
    name.textContent = kind === "workflow" ? titleCase(value) : value;
    row.append(name);
    if (kind === "workflow" && protectedWorkflowTags.includes(value)) {
      const protectedLabel = document.createElement("span");
      protectedLabel.className = "protected-label";
      protectedLabel.textContent = "Day";
      row.append(protectedLabel);
    } else {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "icon-button small";
      remove.textContent = "🗑";
      remove.title = `Delete ${value}`;
      remove.setAttribute("aria-label", `Delete ${value}`);
      remove.addEventListener("click", () => deleteManagedTag(kind, value));
      row.append(remove);
    }
    container.append(row);
  });
}

function addWorkflow(event) {
  event.preventDefault();
  const value = normalizeTag(els.newWorkflowInput.value, true);
  if (!value || hasValue(state.workflowTags, value)) return;
  state.workflowTags.push(value);
  els.newWorkflowInput.value = "";
  saveSettings();
  renderWorkflowSelect();
  renderWorkflowFilterControls();
  renderCaptureChips();
  renderTagManager();
}

function addCondition(event) {
  event.preventDefault();
  const value = normalizeTag(els.newConditionInput.value, false);
  if (!value || hasValue(state.conditions, value)) return;
  state.conditions.push(value);
  els.newConditionInput.value = "";
  saveSettings();
  renderConditionControls();
  renderWorkflowFilterControls();
  renderCaptureChips();
  renderTagManager();
}

function deleteManagedTag(kind, value) {
  if (!window.confirm(`Delete “${value}” from all tasks?`)) return;
  if (kind === "workflow") {
    state.workflowTags = state.workflowTags.filter((tag) => tag !== value);
    state.tasks.forEach((task) => {
      task.workflow = task.workflow.filter((tag) => tag !== value);
    });
    state.captureWorkflow.delete(value);
    renderWorkflowSelect();
  } else {
    state.conditions = state.conditions.filter((condition) => condition !== value);
    state.tasks.forEach((task) => {
      task.conditions = task.conditions.filter((condition) => condition !== value);
    });
    state.captureConditions.delete(value);
    state.requiredConditions.delete(value);
    state.hiddenConditions.delete(value);
  }
  state.requiredWorkflows.delete(value);
  state.hiddenWorkflows.delete(value);
  removeTagFromSavedFilters(kind, value);
  saveSettings();
  saveTasks();
  renderCaptureChips();
  renderTagManager();
  render();
}

function removeTagFromSavedFilters(kind, value) {
  Object.values(state.filtersByMode).forEach((filters) => {
    if (kind === "workflow") {
      filters.requiredWorkflows = filters.requiredWorkflows.filter((tag) => tag !== value);
      filters.hiddenWorkflows = filters.hiddenWorkflows.filter((tag) => tag !== value);
    } else {
      filters.requiredConditions = filters.requiredConditions.filter((condition) => condition !== value);
      filters.hiddenConditions = filters.hiddenConditions.filter((condition) => condition !== value);
    }
  });
}

function notionTasks() {
  return notionTaskData.map((task) => normalizeTask({
    ...task,
    conditions: Array.isArray(task.conditions) ? [...task.conditions] : [],
    workflow: Array.isArray(task.workflow) ? [...task.workflow] : [],
    blocking: Array.isArray(task.blocking) ? [...task.blocking] : [],
  }));
}

function makeTask(task, conditionsList, status, deadline, workflow, delayed = false) {
  return {
    id: crypto.randomUUID(),
    workedOn: false,
    delayed,
    lastCheckboxAction: "",
    lastCheckboxAt: "",
    handledStates: {},
    reviewClearedAt: "",
    reviewClearedSignature: "",
    task,
    conditions: conditionsList,
    status,
    deadline,
    blockedBy: [],
    blocking: [],
    workflow,
    recurrence: "none",
    nextOccurrence: "",
    lastCompleted: "",
    stackMissed: false,
  };
}

function normalizeTask(task) {
  const handledStates = normalizeHandledStates(task);
  return {
    ...task,
    conditions: Array.isArray(task.conditions) ? task.conditions : [],
    workflow: Array.isArray(task.workflow) ? task.workflow : [],
    blockedBy: blockedByIds(task),
    blocking: Array.isArray(task.blocking) ? task.blocking : [],
    status: task.status || "Unprioritized",
    recurrence: task.recurrence || "none",
    nextOccurrence: task.nextOccurrence || "",
    deadline: task.deadline || (task.recurrence && task.recurrence !== "none" ? task.nextOccurrence || "" : ""),
    lastCompleted: task.lastCompleted || "",
    lastCheckboxAction: task.lastCheckboxAction || (task.delayed ? "delayed" : task.workedOn ? "workedOn" : ""),
    lastCheckboxAt: task.lastCheckboxAt || "",
    handledStates,
    reviewClearedAt: task.reviewClearedAt || "",
    reviewClearedSignature: task.reviewClearedSignature || "",
    showLastWorkedOn: Boolean(task.showLastWorkedOn),
    stackMissed: Boolean(task.stackMissed),
  };
}

function normalizeHandledStates(task) {
  if (task.handledStates && typeof task.handledStates === "object" && !Array.isArray(task.handledStates)) {
    return Object.fromEntries(
      Object.entries(task.handledStates)
        .filter(([key, record]) => key && record && typeof record === "object")
        .map(([key, record]) => [key, {
          workedOn: Boolean(record.workedOn),
          delayed: Boolean(record.delayed),
          action: record.action || (record.delayed ? "delayed" : record.workedOn ? "workedOn" : ""),
          at: record.at || task.lastCheckboxAt || "",
        }])
        .filter(([, record]) => record.workedOn || record.delayed),
    );
  }
  if (!task.workedOn && !task.delayed) return {};
  const action = task.delayed ? "delayed" : "workedOn";
  return {
    [handlingKey(initialView.day, initialView.time)]: {
      workedOn: Boolean(task.workedOn),
      delayed: Boolean(task.delayed),
      action: task.lastCheckboxAction || action,
      at: task.lastCheckboxAt || new Date().toISOString(),
    },
  };
}

function refreshRecurringTasks(tasks) {
  let changed = false;
  tasks.forEach((task) => {
    if (task.recurrence === "none" || !task.nextOccurrence || task.nextOccurrence > todayIso) return;
    if (task.workedOn || task.delayed) {
      task.workedOn = false;
      task.delayed = false;
      task.lastCheckboxAction = "";
      task.lastCheckboxAt = "";
      task.handledStates = {};
      changed = true;
    }
  });
  return changed;
}

function resetHandledTasks(tasks) {
  let changed = false;
  const now = new Date();
  tasks.forEach((task) => {
    if (task.recurrence !== "none") return;
    let taskChanged = false;
    Object.entries(task.handledStates || {}).forEach(([key, record]) => {
      if (!record?.at || (!record.workedOn && !record.delayed)) return;
      const resetAt = resetTimeForKey(key, record.at);
      if (resetAt && now >= resetAt) {
        delete task.handledStates[key];
        taskChanged = true;
        changed = true;
      }
    });
    if (taskChanged) {
      const latest = latestHandlingRecord(task);
      task.workedOn = Boolean(latest?.workedOn);
      task.delayed = Boolean(latest?.delayed);
      task.lastCheckboxAction = latest?.action || "";
      task.lastCheckboxAt = latest?.at || "";
    }
  });
  return changed;
}

function isCurrentOccurrence(task) {
  if (task.recurrence === "none") return true;
  return !task.nextOccurrence || task.nextOccurrence <= todayIso || task.lastCompleted === todayIso;
}

function addOccurrence(value, recurrence) {
  const date = new Date(`${value}T12:00:00`);
  if (recurrence === "daily") date.setDate(date.getDate() + 1);
  if (recurrence === "weekly") date.setDate(date.getDate() + 7);
  if (recurrence === "monthly") {
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
  }
  return toIsoDate(date);
}

function firstOccurrenceAfterToday(value, recurrence) {
  let next = value;
  do {
    next = addOccurrence(next, recurrence);
  } while (next <= todayIso);
  return next;
}

function countDueOccurrences(task) {
  if (task.recurrence === "none" || !task.nextOccurrence || task.nextOccurrence > todayIso) return 0;
  if (!task.stackMissed) return 1;
  let count = 0;
  let occurrence = task.nextOccurrence;
  while (occurrence <= todayIso && count < 10000) {
    count += 1;
    occurrence = addOccurrence(occurrence, task.recurrence);
  }
  return count;
}

function currentTimeTag() {
  const hour = today.getHours();
  if (hour >= 4 && hour < 12) return "morning";
  if (hour >= 12 && hour < 16) return "free time";
  if (hour >= 16 && hour < 20) return "evening";
  return "night";
}

function titleForMode() {
  if (state.mode === "routine") return `${titleCase(state.time)} Routine`;
  if (state.mode === "free") return "Free Time Queue";
  if (state.mode === "highlights") return "Highlights";
  if (state.mode === "paths") return "Paths";
  if (state.mode === "delayed") return "Review";
  if (state.mode === "all") return "All Tasks";
  return "All Tasks";
}

function maybePromptForRoutineSwitch() {
  const recommended = currentTimeTag();
  if (!state.workflowTags.includes(recommended) || state.time === recommended) return;
  state.pendingRoutineSwitch = { type: "time", time: recommended };
  els.routinePromptTitle.textContent = `Switch to ${titleCase(recommended)}?`;
  els.routinePromptBody.textContent = `You last had ${titleCase(state.time)} open. It looks like ${titleCase(recommended)} now.`;
  els.switchRoutine.textContent = "Switch";
  els.routineDialog.showModal();
}

function maybePromptForFreeTime(progressRoutineTasks, actionableRoutine) {
  if (state.mode !== "routine" || state.time === "free time") return;
  if (!state.workflowTags.includes("free time")) return;
  if (progressRoutineTasks.length === 0 || actionableRoutine.length > 0) return;
  const promptKey = `${state.day}:${state.time}:${progressRoutineTasks.map((task) => task.id).join("|")}`;
  if (state.freeTimePromptKey === promptKey || els.routineDialog.open) return;
  state.freeTimePromptKey = promptKey;
  state.pendingRoutineSwitch = { type: "free", time: "free time" };
  els.routinePromptTitle.textContent = "Free time?";
  els.routinePromptBody.textContent = "It looks like this routine is wrapped. Do you want to switch to your free time projects?";
  els.switchRoutine.textContent = "Switch";
  els.routineDialog.showModal();
}

function keepCurrentRoutine() {
  state.pendingRoutineSwitch = null;
  els.routineDialog.close();
}

function acceptRoutineSwitch() {
  const pending = state.pendingRoutineSwitch;
  if (!pending) {
    els.routineDialog.close();
    return;
  }
  state.day = pending.type === "time" ? dayName : state.day;
  state.time = pending.time;
  state.mode = pending.type === "free" ? "free" : "routine";
  state.pendingRoutineSwitch = null;
  state.captureWorkflow = new Set(state.mode === "free" ? ["free time"] : [state.day, state.time].filter(Boolean));
  els.routineDialog.close();
  render();
}

function shouldPromptCompletion(task) {
  return isTaskWorkedOn(task) && task.recurrence === "none" && !["Current Habit", "Goal Habit"].includes(task.status);
}

function moveHandledTasksToBottom(tasks) {
  return [
    ...tasks.filter((task) => !isTaskHandled(task)),
    ...tasks.filter(isTaskHandled),
  ];
}

function isLate(task) {
  return Boolean(task.deadline && daysUntil(task.deadline) < 0);
}

function lastActionRank(task) {
  return task.lastCheckboxAt ? new Date(task.lastCheckboxAt).getTime() : 0;
}

function keyToAction(key) {
  return key === "delayed" ? "delayed" : "workedOn";
}

function resetTimeForKey(key, handledAt) {
  const workflowEndHours = {
    morning: 12,
    "free time": 16,
    evening: 20,
    night: 4,
  };
  const [, day, time] = key.split(":");
  if (protectedWorkflowTags.includes(day) && Object.prototype.hasOwnProperty.call(workflowEndHours, time)) {
    return nextResetAfterHandled(handledAt, day, workflowEndHours[time]);
  }
  return addWeekdays(new Date(handledAt), 2);
}

function nextResetAfterHandled(handledAt, day, endHour) {
  const handled = new Date(handledAt);
  const end = nextRoutineEndAfter(handled, day, endHour);
  end.setDate(end.getDate() + 1);
  return end;
}

function nextRoutineEndAfter(handled, day, endHour) {
  const end = new Date(handled);
  end.setHours(12, 0, 0, 0);
  while (dayNameForDate(end) !== day) end.setDate(end.getDate() + 1);
  end.setHours(endHour, 0, 0, 0);
  if (endHour <= 4) end.setDate(end.getDate() + 1);
  if (end <= handled) end.setDate(end.getDate() + 7);
  return end;
}

function dayNameForDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

function addWeekdays(date, count) {
  const result = new Date(date);
  let remaining = count;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  result.setHours(0, 0, 0, 0);
  return result;
}

function toggleSet(set, value) {
  if (set.has(value)) set.delete(value);
  else set.add(value);
}

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusLabel(status) {
  return statusLabels[status] || status || statusLabels.Unprioritized;
}

function statusClass(status) {
  return String(status || "Unprioritized").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function uniqueValues(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = String(value).toLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterKnown(values, knownValues) {
  return Array.isArray(values) ? values.filter((value) => knownValues.includes(value)) : [];
}

function hasValue(values, value) {
  return values.some((item) => item.toLowerCase() === value.toLowerCase());
}

function normalizeTag(value, lowercase) {
  const normalized = value.trim().replace(/\s+/g, " ");
  return lowercase ? normalized.toLowerCase() : normalized;
}

function isCustomWorkflow(tag) {
  return Boolean(tag) && !protectedWorkflowTags.includes(tag) && !defaultWorkflowTags.includes(tag);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function offsetDate(days) {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function dateRank(value) {
  return value ? new Date(`${value}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
}

function daysUntil(value) {
  const deadline = new Date(`${value}T00:00:00`);
  const start = new Date(`${todayIso}T00:00:00`);
  return Math.ceil((deadline - start) / 86400000);
}

function deadlineLabel(value) {
  const days = daysUntil(value);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `${days} days`;
}

function formatIsoDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function occurrenceLabel(value) {
  if (!value) return "due now";
  const days = daysUntil(value);
  if (days < 0) return "due now";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function recurrenceLabel(task) {
  const due = countDueOccurrences(task);
  if (task.stackMissed && due > 1) return `${titleCase(task.recurrence)} · ${due} due`;
  return `${titleCase(task.recurrence)} · ${occurrenceLabel(task.nextOccurrence)}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./service-worker.js");
}
