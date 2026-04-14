# Todo Card — Stage 1

A single todo card built with plain HTML, CSS, and vanilla JS. No frameworks, no build tools — just open `index.html` in a browser and it works.

---

## Running it locally

```bash
npx serve .
```

Or just double-click `index.html`. Either way works.

---

## What's in here

```
index.html   — the card markup and all testid hooks
style.css    — tokens, layout, visual states
app.js       — all the logic: editing, status, time, expand/collapse
```

---

## What changed from Stage 0

Stage 0 was mostly static — the checkbox toggled a done state, the time updated every 30 seconds, and the edit button logged to the console.

Stage 1 makes it actually interactive:

**Editing** — clicking "Edit task" drops an inline form into the card. You can change the title, description, priority, and due date. Save applies the changes, Cancel puts everything back exactly as it was (I snapshot the state on open, restore on cancel).

**Status control** — replaced the static status badge with a `<select>` dropdown. It syncs both ways with the checkbox: ticking the checkbox sets it to Done, manually picking Done ticks the checkbox, unchecking from Done reverts to Pending.

**Priority indicator** — added a coloured left-border bar on the card (red for high, amber for medium, green for low). More readable at a glance than a badge alone.

**Expand/collapse** — if the description is long (over ~160 characters), it collapses to about three lines with a fade and a "Show more" button. Clicking it again collapses. The toggle has `aria-expanded` and `aria-controls` wired up properly.

**Overdue logic** — there's now a separate overdue badge that only appears when the due date has passed. The time display got more granular too: "Due in 2 days", "Due in 3 hours", "Due in 45 minutes", "Overdue by 1 hour". When the task is marked Done, the time stops updating and just shows "✓ Completed".

---

## Testids

Everything from Stage 0 is still there. New ones added in Stage 1:

- `test-todo-edit-form` — the edit form container
- `test-todo-edit-title-input` — title input
- `test-todo-edit-description-input` — description textarea
- `test-todo-edit-priority-select` — priority dropdown inside the form
- `test-todo-edit-due-date-input` — due date/time picker
- `test-todo-save-button` — save
- `test-todo-cancel-button` — cancel
- `test-todo-status-control` — the interactive status dropdown on the card
- `test-todo-priority-indicator` — the coloured left bar
- `test-todo-expand-toggle` — the show more/less button
- `test-todo-collapsible-section` — the wrapper around the description
- `test-todo-overdue-indicator` — the overdue badge

---

## Accessibility

Edit form fields all have proper `<label for="">` elements. The status select has an `aria-label` that updates with the current value. The expand toggle uses `aria-expanded` and `aria-controls`. The time remaining and overdue badge both use `aria-live="polite"` so screen readers pick up changes without interrupting.

Focus trap in edit mode: Tab and Shift+Tab cycle inside the form, Escape cancels. When the form closes, focus returns to the Edit button.

Keyboard tab order: Checkbox → Status control → Expand toggle → Edit → Delete → (in edit mode) Title → Description → Priority → Due date → Save → Cancel.

---

## Known limitations

- State doesn't persist across page reloads — everything resets on refresh
- Due date is hardcoded in `app.js` (`state.dueDate`) — change it there if needed
- Delete just fades the card out, no undo
- `test-todo-status` (the original read-only badge) is still in the DOM for testid compatibility but visually hidden — the interactive one is `test-todo-status-control`

---

## Responsive

Tested at 320px, 768px, and 1024px. The edit form fields stack vertically on mobile. No layout breaking on long titles or wrapped tags.
