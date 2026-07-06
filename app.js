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
const today = new Date();
const todayIso = toIsoDate(today);
const dayName = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
const initialSettings = loadSettings();
const initialTimeTag = initialSettings.workflowTags.includes(currentTimeTag())
  ? currentTimeTag()
  : initialSettings.workflowTags.find((tag) => !protectedWorkflowTags.includes(tag)) || "free time";

let state = {
  mode: "routine",
  day: dayName,
  time: initialTimeTag,
  workflowTags: initialSettings.workflowTags,
  conditions: initialSettings.conditions,
  requiredConditions: new Set(),
  hiddenConditions: new Set(),
  search: "",
  hideHandled: true,
  showBlocked: false,
  deadlineWindow: 5,
  deadlineOnlyActionable: true,
  freeDayFilter: false,
  captureWorkflow: new Set([dayName, initialTimeTag]),
  captureConditions: new Set(),
  editingTaskId: null,
  reorderMode: false,
  reorderKey: "",
  draftOrder: [],
  savedOrders: loadSavedOrders(),
  tasks: loadTasks(),
};

if (refreshRecurringTasks(state.tasks)) saveTasks();

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
    "manageWorkflows",
    "manageConditions",
    "freeDayFilterRow",
    "freeDayFilter",
    "conditionChips",
    "resetWorkflow",
    "clearConditions",
    "deadlineWindow",
    "deadlineWindowLabel",
    "deadlineOnlyActionable",
    "routineProgress",
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
      state.mode = button.dataset.mode;
      render();
    });
  });

  els.daySelect.addEventListener("change", () => {
    state.day = els.daySelect.value;
    state.captureWorkflow = new Set([state.day, state.time].filter(Boolean));
    render();
  });

  els.timeSelect.addEventListener("change", () => {
    state.time = els.timeSelect.value;
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

  els.resetWorkflow.addEventListener("click", () => {
    state.day = dayName;
    state.time = state.workflowTags.includes(currentTimeTag())
      ? currentTimeTag()
      : state.workflowTags.find((tag) => !protectedWorkflowTags.includes(tag)) || "free time";
    els.daySelect.value = state.day;
    els.timeSelect.value = state.time;
    state.mode = "routine";
    render();
  });

  els.clearConditions.addEventListener("click", () => {
    state.requiredConditions.clear();
    state.hiddenConditions.clear();
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
  renderConditionControls();
  renderCaptureChips();
  renderTagManager();
}

function render() {
  syncControlState();
  const routineTasks = getRoutineTasks({ includeHandled: true });
  const progressRoutineTasks = routineTasks.filter(isRoutineTaskVisible);
  const actionableRoutine = routineTasks.filter(isRoutineTaskActionable);
  if (state.mode === "routine" && actionableRoutine.length === 0) {
    state.mode = "free";
  }
  if (state.reorderMode && state.reorderKey !== currentOrderKey()) resetReorderState();

  document.querySelectorAll(".segment").forEach((button) => {
    const activeMode = state.mode === "free" ? "routine" : state.mode;
    button.classList.toggle("active", button.dataset.mode === activeMode);
  });

  const viewTasks = getVisibleTasks();
  const deadlineTasks = getDeadlineTasks(viewTasks);

  els.modeEyebrow.textContent = state.mode === "routine" ? "Routine Builder" : state.mode === "free" ? "Free Time Queue" : "Whole List";
  els.viewTitle.textContent = titleForMode();
  els.routineProgress.textContent = `${progressRoutineTasks.filter((task) => task.workedOn || task.delayed).length}/${progressRoutineTasks.length}`;
  els.deadlineCount.textContent = deadlineTasks.length;
  els.visibleCount.textContent = viewTasks.length;
  els.deadlineWindowLabel.textContent = `${state.deadlineWindow}d`;
  els.freeDayFilterRow.hidden = state.mode !== "free";
  els.startReorder.hidden = state.reorderMode;
  els.startReorder.disabled = viewTasks.length < 2;
  els.reorderActions.hidden = !state.reorderMode;

  renderDeadlineBand(deadlineTasks);
  renderTaskFeed(viewTasks);
  renderConditionControls();
}

function syncControlState() {
  els.daySelect.value = state.day;
  els.timeSelect.value = state.time;
  els.deadlineWindow.value = String(state.deadlineWindow);
  els.deadlineOnlyActionable.checked = state.deadlineOnlyActionable;
  els.hideHandled.checked = state.hideHandled;
  els.showBlocked.checked = state.showBlocked;
  els.freeDayFilter.checked = state.freeDayFilter;
}

function getVisibleTasks() {
  const base = state.mode === "routine" ? getRoutineTasks({ includeHandled: true }) : state.mode === "free" ? getFreeTimeTasks() : getAllTasks();
  const filtered = base
    .filter((task) => state.showBlocked || !task.blockedBy)
    .filter((task) => !state.hideHandled || (!task.workedOn && !task.delayed))
    .filter((task) => conditionMatch(task))
    .filter((task) => searchMatch(task));
  const sorted = state.mode === "routine" || state.mode === "free"
    ? sortWorkflowTasks(filtered)
    : filtered.sort(taskSort);
  const key = currentOrderKey();
  const order = state.reorderMode && state.reorderKey === key
    ? state.draftOrder
    : state.savedOrders[key] || [];
  return applyTaskOrder(sorted, order);
}

function getRoutineTasks({ includeHandled }) {
  return state.tasks.filter((task) => {
    const inWorkflow = task.workflow.includes(state.day) && task.workflow.includes(state.time);
    const visible = includeHandled || (!task.workedOn && !task.delayed);
    return inWorkflow && isCurrentOccurrence(task) && visible;
  });
}

function isRoutineTaskActionable(task) {
  return !task.workedOn
    && !task.delayed
    && isRoutineTaskVisible(task);
}

function isRoutineTaskVisible(task) {
  return (state.showBlocked || !task.blockedBy)
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
  return Number(a.delayed) - Number(b.delayed)
    || Number(a.workedOn) - Number(b.workedOn)
    || (statusRank.get(a.status) ?? 99) - (statusRank.get(b.status) ?? 99)
    || dateRank(a.deadline) - dateRank(b.deadline)
    || a.conditions.join(",").localeCompare(b.conditions.join(","));
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
  return Number(a.delayed) - Number(b.delayed)
    || Number(a.workedOn) - Number(b.workedOn)
    || dateRank(a.deadline) - dateRank(b.deadline)
    || a.conditions.join(",").localeCompare(b.conditions.join(","))
    || a.task.localeCompare(b.task);
}

function currentOrderKey() {
  if (state.mode === "all") return "all";
  if (state.mode === "free") return `free:${state.freeDayFilter ? state.day : "all"}`;
  return `routine:${state.day}:${state.time}`;
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
  const previous = state.savedOrders[state.reorderKey] || [];
  state.savedOrders[state.reorderKey] = [
    ...visibleOrder,
    ...previous.filter((id) => !visibleOrder.includes(id)),
  ];
  saveSavedOrders();
  resetReorderState();
  render();
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
  const source = state.deadlineOnlyActionable ? tasks : state.tasks.filter((task) => !task.blockedBy);
  return source
    .filter((task) => task.deadline)
    .map((task) => ({ ...task, daysLeft: daysUntil(task.deadline) }))
    .filter((task) => task.daysLeft >= 0 && task.daysLeft <= state.deadlineWindow)
    .filter((task) => !task.workedOn && !task.delayed)
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
    const card = document.createElement("article");
    const showStatusTag = state.mode === "all";
    card.className = `task-card status-${statusClass(task.status)}${task.workedOn ? " worked" : ""}${task.delayed ? " delayed" : ""}`;
    card.title = statusLabel(task.status);
    const checkControls = state.reorderMode
      ? `<div class="reorder-grip" aria-hidden="true">↕</div>`
      : `<button class="mini-toggle ${task.workedOn ? "active" : ""}" data-action="worked" title="Worked on" aria-label="Toggle worked on">✓</button>
        <button class="mini-toggle delay ${task.delayed ? "active" : ""}" data-action="delayed" title="Delayed" aria-label="Toggle delayed">!</button>`;
    const taskActions = state.reorderMode
      ? `<button class="icon-button" data-action="move-up" title="Move up" aria-label="Move ${escapeHtml(task.task)} up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button class="icon-button" data-action="move-down" title="Move down" aria-label="Move ${escapeHtml(task.task)} down" ${index === tasks.length - 1 ? "disabled" : ""}>↓</button>`
      : `<button class="icon-button" data-action="edit" title="Edit" aria-label="Edit ${escapeHtml(task.task)}">✎</button>
        <button class="icon-button" data-action="delete" title="Delete" aria-label="Delete">×</button>`;
    card.innerHTML = `
      <div class="task-checks">
        ${checkControls}
      </div>
      <div>
        <div class="task-title">${escapeHtml(task.task)}</div>
        <div class="task-meta">
          ${showStatusTag ? `<span class="pill status">${escapeHtml(statusLabel(task.status))}</span>` : ""}
          ${task.deadline ? `<span class="pill deadline">${deadlineLabel(task.deadline)}</span>` : ""}
          ${task.recurrence !== "none" ? `<span class="pill recurring">↻ ${recurrenceLabel(task)}</span>` : ""}
          ${task.blockedBy ? `<span class="pill blocked">Blocked</span>` : ""}
          ${task.conditions.map((condition) => `<span class="pill">${condition}</span>`).join("")}
          ${task.workflow.map((tag) => `<span class="pill workflow">${titleCase(tag)}</span>`).join("")}
        </div>
      </div>
      <div class="task-actions">
        ${taskActions}
      </div>
    `;
    if (state.reorderMode) {
      card.querySelector('[data-action="move-up"]').addEventListener("click", () => moveTaskInDraft(task.id, -1, tasks));
      card.querySelector('[data-action="move-down"]').addEventListener("click", () => moveTaskInDraft(task.id, 1, tasks));
    } else {
      card.querySelector('[data-action="worked"]').addEventListener("click", () => toggleTask(task.id, "workedOn"));
      card.querySelector('[data-action="delayed"]').addEventListener("click", () => toggleTask(task.id, "delayed"));
      card.querySelector('[data-action="edit"]').addEventListener("click", () => openTaskEditor(task.id));
      card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTask(task.id));
    }
    els.taskFeed.append(card);
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
  const captureDefaults = state.mode === "free" && state.workflowTags.includes("free time")
    ? ["free time"]
    : [state.day, state.time].filter(Boolean);
  state.captureWorkflow = new Set(captureDefaults);
  state.captureConditions = new Set();
  els.taskInput.value = "";
  els.statusInput.value = state.mode === "routine" ? "Current Habit" : "Current Project";
  els.deadlineInput.value = "";
  els.recurrenceInput.value = "none";
  els.stackMissedInput.checked = false;
  renderDependencyOptions("", "");
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
  renderDependencyOptions(task.blockedBy, task.blocking[0] || "");
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

function renderDependencyOptions(blockedById, blockingId) {
  const currentId = state.editingTaskId;
  const options = state.tasks
    .filter((task) => task.id !== currentId)
    .sort((a, b) => a.task.localeCompare(b.task));
  fillTaskSelect(els.blockedByInput, "Not blocked", options, blockedById);
  fillTaskSelect(els.blockingInput, "Not blocking", options, blockingId);
}

function fillTaskSelect(select, emptyLabel, tasks, selectedId) {
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = emptyLabel;
  select.append(empty);
  tasks.forEach((task) => {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = task.task;
    select.append(option);
  });
  select.value = selectedId || "";
}

function saveCapturedTask(event) {
  event.preventDefault();
  const existingTask = state.editingTaskId
    ? state.tasks.find((item) => item.id === state.editingTaskId)
    : null;
  const recurrence = els.recurrenceInput.value;
  const deadline = els.deadlineInput.value;
  const blockedById = els.blockedByInput.value;
  const blockingId = els.blockingInput.value;
  els.blockingInput.setCustomValidity(blockedById && blockedById === blockingId
    ? "A task cannot block and be blocked by the same task."
    : "");
  if (!els.captureForm.reportValidity()) return;
  const values = {
    task: els.taskInput.value.trim(),
    conditions: [...state.captureConditions],
    status: els.statusInput.value,
    deadline,
    recurrence,
    nextOccurrence: recurrence === "none" ? "" : deadline || existingTask?.nextOccurrence || todayIso,
    stackMissed: recurrence !== "none" && els.stackMissedInput.checked,
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
      blockedBy: "",
      blocking: [],
      lastCompleted: "",
      ...values,
    };
    state.tasks.push(savedTask);
  }
  syncTaskRelations(savedTask, blockedById, blockingId);
  saveTasks();
  els.captureDialog.close();
  render();
}

function toggleTask(id, key) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  if (key === "workedOn" && !task.workedOn && task.recurrence !== "none") {
    const start = task.nextOccurrence || todayIso;
    task.nextOccurrence = task.stackMissed
      ? addOccurrence(start, task.recurrence)
      : firstOccurrenceAfterToday(start, task.recurrence);
    task.deadline = task.nextOccurrence;
    task.workedOn = countDueOccurrences(task) === 0;
    task.delayed = false;
    task.lastCompleted = todayIso;
    saveTasks();
    render();
    return;
  }
  task[key] = !task[key];
  saveTasks();
  render();
}

function deleteTask(id) {
  state.tasks.forEach((task) => {
    task.blocking = task.blocking.filter((blockedId) => blockedId !== id);
    if (task.blockedBy === id) task.blockedBy = "";
  });
  state.tasks = state.tasks.filter((task) => task.id !== id);
  Object.keys(state.savedOrders).forEach((key) => {
    state.savedOrders[key] = state.savedOrders[key].filter((taskId) => taskId !== id);
  });
  saveSavedOrders();
  saveTasks();
  render();
}

function syncTaskRelations(task, blockedById, blockingId) {
  state.tasks.forEach((item) => {
    item.blocking = item.blocking.filter((blockedId) => blockedId !== task.id);
    if (item.blockedBy === task.id) item.blockedBy = "";
  });
  task.blockedBy = "";
  task.blocking = [];

  const blocker = state.tasks.find((item) => item.id === blockedById);
  if (blocker) {
    task.blockedBy = blocker.id;
    if (!blocker.blocking.includes(task.id)) blocker.blocking.push(task.id);
  }

  const blockedTask = state.tasks.find((item) => item.id === blockingId);
  if (blockedTask) {
    state.tasks.forEach((item) => {
      item.blocking = item.blocking.filter((blockedId) => blockedId !== blockedTask.id);
    });
    blockedTask.blockedBy = task.id;
    task.blocking.push(blockedTask.id);
  }
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
      remove.textContent = "×";
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
  saveSettings();
  saveTasks();
  renderCaptureChips();
  renderTagManager();
  render();
}

function notionTasks() {
  return notionTaskData.map((task) => ({
    ...task,
    conditions: [...task.conditions],
    workflow: [...task.workflow],
    blocking: [...task.blocking],
  }));
}

function makeTask(task, conditionsList, status, deadline, workflow, delayed = false) {
  return {
    id: crypto.randomUUID(),
    workedOn: false,
    delayed,
    task,
    conditions: conditionsList,
    status,
    deadline,
    blockedBy: "",
    blocking: [],
    workflow,
    recurrence: "none",
    nextOccurrence: "",
    lastCompleted: "",
    stackMissed: false,
  };
}

function normalizeTask(task) {
  return {
    ...task,
    conditions: Array.isArray(task.conditions) ? task.conditions : [],
    workflow: Array.isArray(task.workflow) ? task.workflow : [],
    blocking: Array.isArray(task.blocking) ? task.blocking : [],
    status: task.status || "Unprioritized",
    recurrence: task.recurrence || "none",
    nextOccurrence: task.nextOccurrence || "",
    deadline: task.deadline || (task.recurrence && task.recurrence !== "none" ? task.nextOccurrence || "" : ""),
    lastCompleted: task.lastCompleted || "",
    stackMissed: Boolean(task.stackMissed),
  };
}

function refreshRecurringTasks(tasks) {
  let changed = false;
  tasks.forEach((task) => {
    if (task.recurrence === "none" || !task.nextOccurrence || task.nextOccurrence > todayIso) return;
    if (task.workedOn || task.delayed) {
      task.workedOn = false;
      task.delayed = false;
      changed = true;
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
  if (hour < 12) return "morning";
  if (hour < 19) return "evening";
  return "night";
}

function titleForMode() {
  if (state.mode === "routine") return `${titleCase(state.time)} Routine`;
  if (state.mode === "free") return "Free Time Queue";
  if (state.mode === "all") return "All Tasks";
  return "All Tasks";
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

function hasValue(values, value) {
  return values.some((item) => item.toLowerCase() === value.toLowerCase());
}

function normalizeTag(value, lowercase) {
  const normalized = value.trim().replace(/\s+/g, " ");
  return lowercase ? normalized.toLowerCase() : normalized;
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
