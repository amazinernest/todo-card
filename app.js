/**
 * Todo Card — App Logic
 * Handles: time-remaining, checkbox state, button actions
 */

(function () {
  'use strict';

  /* ─── Configuration ──────────────────────────────────────── */
  const DUE_DATE = new Date('2026-03-01T18:00:00Z');
  const UPDATE_INTERVAL_MS = 30_000; // 30 seconds

  /* ─── DOM References ─────────────────────────────────────── */
  const card          = document.querySelector('[data-testid="test-todo-card"]');
  const checkbox      = document.querySelector('[data-testid="test-todo-complete-toggle"]');
  const statusBadge   = document.querySelector('[data-testid="test-todo-status"]');
  const timeRemaining = document.getElementById('time-remaining');
  const editBtn       = document.getElementById('edit-btn');
  const deleteBtn     = document.getElementById('delete-btn');
  const statusDot     = statusBadge ? statusBadge.querySelector('.status-dot') : null;

  /* ─── Time Remaining ────────────────────────────────────── */
  function getTimeRemainingText() {
    const now       = Date.now();
    const diffMs    = DUE_DATE.getTime() - now;
    const diffSec   = Math.round(diffMs / 1_000);
    const diffMin   = Math.round(diffMs / 60_000);
    const diffHrs   = Math.round(diffMs / 3_600_000);
    const diffDays  = Math.round(diffMs / 86_400_000);

    if (diffMs < 0) {
      // Overdue
      const overdueSec = Math.abs(diffSec);
      if (overdueSec < 60)          return { text: 'Overdue by less than a minute', cls: 'overdue' };
      const overdueMin = Math.round(overdueSec / 60);
      if (overdueMin < 60)          return { text: `Overdue by ${overdueMin} minute${overdueMin !== 1 ? 's' : ''}`, cls: 'overdue' };
      const overdueHrs = Math.round(overdueMin / 60);
      if (overdueHrs < 24)          return { text: `Overdue by ${overdueHrs} hour${overdueHrs !== 1 ? 's' : ''}`, cls: 'overdue' };
      const overdueDays = Math.round(overdueHrs / 24);
                                    return { text: `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`, cls: 'overdue' };
    } else {
      // Upcoming
      if (diffMin < 1)              return { text: 'Due now!', cls: 'due-soon' };
      if (diffMin < 60)             return { text: `Due in ${diffMin} minute${diffMin !== 1 ? 's' : ''}`, cls: 'due-soon' };
      if (diffHrs < 24)             return { text: 'Due today', cls: 'due-soon' };
      if (diffDays === 1)           return { text: 'Due tomorrow', cls: 'due-soon' };
      if (diffDays <= 7)            return { text: `Due in ${diffDays} days`, cls: 'due-soon' };
                                    return { text: `Due in ${diffDays} days`, cls: 'on-track' };
    }
  }

  function renderTimeRemaining() {
    if (!timeRemaining) return;

    if (checkbox && checkbox.checked) {
      timeRemaining.textContent    = '✓ Completed';
      timeRemaining.className      = 'time-remaining done-status';
      timeRemaining.setAttribute('aria-label', 'Task completed');
      return;
    }

    const { text, cls } = getTimeRemainingText();
    timeRemaining.textContent = text;
    timeRemaining.className   = `time-remaining ${cls}`;
    timeRemaining.setAttribute('aria-label', text);
  }

  /* ─── Checkbox / Completion Toggle ──────────────────────── */
  function setStatusBadge(isDone) {
    if (!statusBadge) return;

    // Remove existing status modifiers
    statusBadge.classList.remove('badge--pending', 'badge--inprogress', 'badge--done');
    if (statusDot) {
      statusDot.style.background = '';
    }

    if (isDone) {
      statusBadge.classList.add('badge--done');
      statusBadge.innerHTML = `<span class="status-dot" aria-hidden="true" style="background:var(--status-done-dot)"></span>Done`;
      statusBadge.setAttribute('aria-label', 'Status: Done');
    } else {
      statusBadge.classList.add('badge--inprogress');
      statusBadge.innerHTML = `<span class="status-dot" aria-hidden="true" style="background:var(--status-inprogress-dot)"></span>In Progress`;
      statusBadge.setAttribute('aria-label', 'Status: In Progress');
    }
  }

  function onCheckboxChange() {
    const isDone = checkbox.checked;
    card.classList.toggle('is-done', isDone);
    setStatusBadge(isDone);
    renderTimeRemaining();
  }

  /* ─── Button Handlers ────────────────────────────────────── */
  function onEditClick() {
    console.log('edit clicked');
  }

  function onDeleteClick() {
    alert('Delete clicked');
  }

  /* ─── Initialise ─────────────────────────────────────────── */
  function init() {
    // Initial render
    renderTimeRemaining();

    // Auto-update every 30 s
    setInterval(renderTimeRemaining, UPDATE_INTERVAL_MS);

    // Listeners
    if (checkbox)  checkbox.addEventListener('change', onCheckboxChange);
    if (editBtn)   editBtn.addEventListener('click', onEditClick);
    if (deleteBtn) deleteBtn.addEventListener('click', onDeleteClick);
  }

  // Run after DOM is fully parsed (script is at end of body)
  document.addEventListener('DOMContentLoaded', init);
})();
