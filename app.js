/**
 * Todo Card — Stage 1 App Logic
 * Handles: editing mode, status transitions, priority changes,
 *          expand/collapse, overdue indicator, time-remaining
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     INITIAL STATE
     ───────────────────────────────────────────────────────────── */
  const COLLAPSE_THRESHOLD = 160; // characters — collapse if longer
  const UPDATE_INTERVAL_MS = 30_000; // 30 s

  const state = {
    title:       'Design landing page',
    description: 'Create wireframes and high-fidelity mockups for the product landing page, covering mobile, tablet, and desktop breakpoints. Share with the dev team for hand-off. Include component specifications, spacing guidelines, and colour tokens to ensure pixel-perfect implementation. Coordinate with the copy team for final text content before the design is frozen.',
    priority:    'High',     // 'Low' | 'Medium' | 'High'
    status:      'In Progress', // 'Pending' | 'In Progress' | 'Done'
    dueDate:     new Date('2026-04-16T18:00:00+01:00'),
    expanded:    false,
    inEditMode:  false,
    // Snapshot used for Cancel
    _snapshot:   null,
  };

  /* ─────────────────────────────────────────────────────────────
     DOM REFERENCES
     ───────────────────────────────────────────────────────────── */
  const card              = document.querySelector('[data-testid="test-todo-card"]');
  const checkbox          = document.querySelector('[data-testid="test-todo-complete-toggle"]');
  const titleEl           = document.querySelector('[data-testid="test-todo-title"]');
  const descriptionEl     = document.querySelector('[data-testid="test-todo-description"]');
  const priorityBadge     = document.querySelector('[data-testid="test-todo-priority"]');
  const priorityIndicator = document.querySelector('[data-testid="test-todo-priority-indicator"]');
  const statusBadge       = document.querySelector('[data-testid="test-todo-status"]');
  const statusControl     = document.querySelector('[data-testid="test-todo-status-control"]');
  const dueDateEl         = document.querySelector('[data-testid="test-todo-due-date"]');
  const timeRemainingEl   = document.querySelector('[data-testid="test-todo-time-remaining"]');
  const overdueIndicator  = document.querySelector('[data-testid="test-todo-overdue-indicator"]');
  const collapsible       = document.querySelector('[data-testid="test-todo-collapsible-section"]');
  const expandToggle      = document.querySelector('[data-testid="test-todo-expand-toggle"]');
  const expandToggleText  = expandToggle?.querySelector('.expand-toggle-text');
  const editFormContainer = document.querySelector('[data-testid="test-todo-edit-form"]');
  const editTitleInput    = document.querySelector('[data-testid="test-todo-edit-title-input"]');
  const editDescInput     = document.querySelector('[data-testid="test-todo-edit-description-input"]');
  const editPrioritySelect= document.querySelector('[data-testid="test-todo-edit-priority-select"]');
  const editDueDateInput  = document.querySelector('[data-testid="test-todo-edit-due-date-input"]');
  const editBtn           = document.getElementById('edit-btn');
  const deleteBtn         = document.getElementById('delete-btn');
  const saveBtn           = document.querySelector('[data-testid="test-todo-save-button"]');
  const cancelBtn         = document.querySelector('[data-testid="test-todo-cancel-button"]');
  const cardFooter        = document.getElementById('card-footer');

  /* ─────────────────────────────────────────────────────────────
     TIME HELPERS
     ───────────────────────────────────────────────────────────── */
  function getTimeInfo() {
    const now    = Date.now();
    const diffMs = state.dueDate.getTime() - now;
    const abs    = Math.abs(diffMs);

    const sec  = Math.round(abs / 1000);
    const min  = Math.round(abs / 60_000);
    const hrs  = Math.round(abs / 3_600_000);
    const days = Math.round(abs / 86_400_000);

    if (diffMs < 0) {
      // Overdue
      if (sec < 60)   return { text: 'Overdue by less than a minute', cls: 'overdue', isOverdue: true };
      if (min < 60)   return { text: `Overdue by ${min} minute${min !== 1 ? 's' : ''}`, cls: 'overdue', isOverdue: true };
      if (hrs < 24)   return { text: `Overdue by ${hrs} hour${hrs !== 1 ? 's' : ''}`, cls: 'overdue', isOverdue: true };
                      return { text: `Overdue by ${days} day${days !== 1 ? 's' : ''}`, cls: 'overdue', isOverdue: true };
    }

    // Upcoming
    if (min < 1)      return { text: 'Due now!', cls: 'due-soon', isOverdue: false };
    if (min < 60)     return { text: `Due in ${min} minute${min !== 1 ? 's' : ''}`, cls: 'due-soon', isOverdue: false };
    if (hrs < 24)     return { text: `Due in ${hrs} hour${hrs !== 1 ? 's' : ''}`, cls: 'due-soon', isOverdue: false };
    if (days === 1)   return { text: 'Due tomorrow', cls: 'due-soon', isOverdue: false };
    if (days <= 7)    return { text: `Due in ${days} days`, cls: 'due-soon', isOverdue: false };
                      return { text: `Due in ${days} days`, cls: 'on-track', isOverdue: false };
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER HELPERS
     ───────────────────────────────────────────────────────────── */

  /** Priority badge + left-bar indicator */
  function renderPriority() {
    const p = state.priority;

    // Left bar indicator
    if (priorityIndicator) {
      priorityIndicator.className = 'priority-indicator';
      priorityIndicator.classList.add(`pri-${p.toLowerCase()}`);
      priorityIndicator.setAttribute('aria-label', `Priority: ${p}`);
    }

    // Priority badge
    if (priorityBadge) {
      const map = {
        High:   { cls: 'badge--high',   dot: 'var(--p-high-dot)',   label: 'High priority' },
        Medium: { cls: 'badge--medium', dot: 'var(--p-medium-dot)', label: 'Medium priority' },
        Low:    { cls: 'badge--low',    dot: 'var(--p-low-dot)',     label: 'Low priority' },
      };
      const cfg = map[p] || map.Low;

      priorityBadge.className = `badge ${cfg.cls}`;
      priorityBadge.setAttribute('aria-label', `Priority: ${p}`);
      priorityBadge.innerHTML = `<span class="badge-dot" style="background:${cfg.dot}" aria-hidden="true"></span>${cfg.label}`;
    }
  }

  /** Status badge (read-only, hidden visually but kept for testid) + status-select */
  function renderStatus() {
    const s = state.status;

    const map = {
      'Pending':     { cls: 'badge--pending',     dot: 'var(--s-pending-ink)',     label: 'Pending' },
      'In Progress': { cls: 'badge--inprogress',  dot: 'var(--s-inprogress-ink)',  label: 'In Progress' },
      'Done':        { cls: 'badge--done',         dot: 'var(--s-done-ink)',        label: 'Done' },
    };
    const cfg = map[s] || map['Pending'];

    // Read-only badge (testid for compat)
    if (statusBadge) {
      statusBadge.className = `badge ${cfg.cls} status-display`;
      statusBadge.setAttribute('aria-label', `Status: ${s}`);
      statusBadge.innerHTML = `<span class="badge-dot" style="background:${cfg.dot}" aria-hidden="true"></span>${cfg.label}`;
    }

    // Interactive select
    if (statusControl) {
      statusControl.className = `status-select badge ${cfg.cls}`;
      statusControl.value = s;
      statusControl.setAttribute('aria-label', `Change task status, current: ${s}`);
    }
  }

  /** Title display */
  function renderTitle() {
    if (titleEl) {
      titleEl.textContent = state.title;
    }
    if (editBtn) {
      editBtn.setAttribute('aria-label', `Edit task: ${state.title}`);
    }
    if (deleteBtn) {
      deleteBtn.setAttribute('aria-label', `Delete task: ${state.title}`);
    }
  }

  /** Description display */
  function renderDescription() {
    if (descriptionEl) {
      descriptionEl.textContent = state.description;
    }
    updateExpandToggle();
  }

  /** Time remaining + overdue indicator */
  function renderTimeRemaining() {
    if (!timeRemainingEl) return;

    const isDone = state.status === 'Done';

    if (isDone) {
      timeRemainingEl.textContent = '✓ Completed';
      timeRemainingEl.className   = 'time-remaining done-status';
      timeRemainingEl.setAttribute('aria-label', 'Task completed');

      // Clear overdue state when done
      if (overdueIndicator) overdueIndicator.hidden = true;
      card.classList.remove('is-overdue');
      return;
    }

    const { text, cls, isOverdue } = getTimeInfo();
    timeRemainingEl.textContent = text;
    timeRemainingEl.className   = `time-remaining ${cls}`;
    timeRemainingEl.setAttribute('aria-label', text);

    // Overdue indicator
    if (overdueIndicator) {
      overdueIndicator.hidden = !isOverdue;
    }
    card.classList.toggle('is-overdue', isOverdue);
  }

  /** Due date display */
  function renderDueDate() {
    if (!dueDateEl) return;
    const d = state.dueDate;
    const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' · '
      + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    dueDateEl.textContent = formatted;
    dueDateEl.setAttribute('datetime', d.toISOString());
  }

  /** Done / in-progress card class */
  function renderCardState() {
    const isDone = state.status === 'Done';
    card.classList.toggle('is-done', isDone);
    checkbox.checked = isDone;
  }

  /** Full initial render */
  function renderAll() {
    renderTitle();
    renderDescription();
    renderPriority();
    renderStatus();
    renderDueDate();
    renderTimeRemaining();
    renderCardState();
  }

  /* ─────────────────────────────────────────────────────────────
     EXPAND / COLLAPSE
     ───────────────────────────────────────────────────────────── */
  function updateExpandToggle() {
    if (!collapsible || !expandToggle) return;

    const isLong = state.description.length > COLLAPSE_THRESHOLD;
    if (!isLong) {
      // Short: always expanded, no toggle
      collapsible.className = 'todo-collapsible is-expanded';
      expandToggle.classList.add('is-hidden');
      return;
    }

    expandToggle.classList.remove('is-hidden');

    if (state.expanded) {
      collapsible.className = 'todo-collapsible is-expanded';
      expandToggle.setAttribute('aria-expanded', 'true');
      if (expandToggleText) expandToggleText.textContent = 'Show less';
    } else {
      collapsible.className = 'todo-collapsible is-collapsed';
      expandToggle.setAttribute('aria-expanded', 'false');
      if (expandToggleText) expandToggleText.textContent = 'Show more';
    }
  }

  function onExpandToggle() {
    state.expanded = !state.expanded;
    updateExpandToggle();
  }

  /* ─────────────────────────────────────────────────────────────
     CHECKBOX / STATUS SYNC
     ───────────────────────────────────────────────────────────── */
  function setStatus(newStatus) {
    state.status = newStatus;
    renderStatus();
    renderCardState();
    renderTimeRemaining();
  }

  function onCheckboxChange() {
    if (checkbox.checked) {
      setStatus('Done');
    } else {
      // Unchecking from Done → revert to Pending
      setStatus('Pending');
    }
  }

  function onStatusControlChange() {
    const newStatus = statusControl.value;
    setStatus(newStatus);
  }

  /* ─────────────────────────────────────────────────────────────
     EDIT MODE
     ───────────────────────────────────────────────────────────── */
  function toLocalDatetimeString(date) {
    // Returns YYYY-MM-DDTHH:MM for datetime-local input
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function enterEditMode() {
    if (state.inEditMode) return;
    state.inEditMode = true;

    // Snapshot current values for cancel
    state._snapshot = {
      title:       state.title,
      description: state.description,
      priority:    state.priority,
      dueDate:     new Date(state.dueDate),
    };

    // Populate form
    editTitleInput.value         = state.title;
    editDescInput.value          = state.description;
    editPrioritySelect.value     = state.priority;
    editDueDateInput.value       = toLocalDatetimeString(state.dueDate);

    // Show form, hide footer
    editFormContainer.hidden = false;
    cardFooter.hidden        = true;

    // Focus first input
    editTitleInput.focus();

    card.setAttribute('data-editing', 'true');
  }

  function exitEditMode(saved) {
    if (!state.inEditMode) return;
    state.inEditMode = false;

    if (!saved && state._snapshot) {
      // Restore snapshot
      state.title       = state._snapshot.title;
      state.description = state._snapshot.description;
      state.priority    = state._snapshot.priority;
      state.dueDate     = state._snapshot.dueDate;
    }

    state._snapshot = null;

    // Re-render with (possibly restored) values
    renderAll();

    // Hide form, show footer
    editFormContainer.hidden = true;
    cardFooter.hidden        = false;

    card.removeAttribute('data-editing');

    // Return focus to edit button
    if (editBtn) editBtn.focus();
  }

  function onSave() {
    // Read values from form
    const newTitle = editTitleInput.value.trim();
    const newDesc  = editDescInput.value.trim();
    const newPri   = editPrioritySelect.value;
    const newDate  = editDueDateInput.value ? new Date(editDueDateInput.value) : state.dueDate;

    // Basic validation
    if (!newTitle) {
      editTitleInput.focus();
      editTitleInput.setCustomValidity('Title is required');
      editTitleInput.reportValidity();
      return;
    }
    editTitleInput.setCustomValidity('');

    state.title       = newTitle;
    state.description = newDesc;
    state.priority    = newPri;
    state.dueDate     = newDate;

    exitEditMode(true);
  }

  function onCancel() {
    exitEditMode(false);
  }

  function onEditClick() {
    enterEditMode();
  }

  /* ─────────────────────────────────────────────────────────────
     FOCUS TRAP (basic, optional bonus)
     ───────────────────────────────────────────────────────────── */
  function trapFocus(e) {
    if (!state.inEditMode) return;
    const focusable = editFormContainer.querySelectorAll(
      'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      onCancel();
    }
  }

  /* ─────────────────────────────────────────────────────────────
     DELETE
     ───────────────────────────────────────────────────────────── */
  function onDeleteClick() {
    // Animate removal
    card.style.transition = 'opacity 300ms ease, transform 300ms ease';
    card.style.opacity    = '0';
    card.style.transform  = 'scale(0.96)';
    setTimeout(() => {
      card.style.display = 'none';
    }, 320);
  }

  /* ─────────────────────────────────────────────────────────────
     INITIALISE
     ───────────────────────────────────────────────────────────── */
  function init() {
    // Initial render
    renderAll();

    // Default: collapse if description is long
    const isLong = state.description.length > COLLAPSE_THRESHOLD;
    if (isLong) {
      state.expanded = false;
    }
    updateExpandToggle();

    // Start time tick
    setInterval(renderTimeRemaining, UPDATE_INTERVAL_MS);

    // Event listeners
    if (checkbox)      checkbox.addEventListener('change', onCheckboxChange);
    if (statusControl) statusControl.addEventListener('change', onStatusControlChange);
    if (expandToggle)  expandToggle.addEventListener('click', onExpandToggle);
    if (editBtn)       editBtn.addEventListener('click', onEditClick);
    if (deleteBtn)     deleteBtn.addEventListener('click', onDeleteClick);
    if (saveBtn)       saveBtn.addEventListener('click', onSave);
    if (cancelBtn)     cancelBtn.addEventListener('click', onCancel);

    // Keyboard handling (focus trap + Escape)
    document.addEventListener('keydown', trapFocus);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
