# todo-card

A single todo card component — plain HTML, CSS, and JS. No frameworks, no build step.

Built for the HNG frontend task. Focuses on semantic markup, accessibility, and test automation hooks.

## Usage

Clone and open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

That's it.

## Structure

```
index.html   — markup and data-testid attributes
style.css    — design tokens, layout, responsive styles
app.js       — time-remaining counter, checkbox logic, button handlers
```

## Test hooks

All interactive elements expose `data-testid` attributes:

```
test-todo-card
test-todo-title
test-todo-description
test-todo-priority
test-todo-due-date
test-todo-time-remaining
test-todo-status
test-todo-complete-toggle
test-todo-tags
test-todo-tag-work
test-todo-tag-urgent
test-todo-edit-button
test-todo-delete-button
```

## Notes

- Due date is hardcoded to `2026-03-01T18:00:00Z`. The time-remaining display recalculates every 30 seconds.
- Checking the box strikes through the title and flips the status badge to "Done".
- Edit logs to the console, delete triggers an alert.
- Tested at 320px, 768px, and 1200px.

## License

MIT
