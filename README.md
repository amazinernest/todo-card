# Todo Card

A clean, accessible, and testable Todo/Task Card component built with plain HTML, CSS, and JavaScript.

## Preview

![Todo Card](https://github.com/amazinernest/todo-card/raw/main/preview.png)

## Features

- ✅ All required `data-testid` attributes for test automation
- ♿ Accessible — WCAG AA contrast, `aria-live`, keyboard navigable
- ⏳ Live time-remaining counter (updates every 30 seconds)
- 📱 Responsive from 320px to 1200px
- 🎨 Clean light-mode design — no frameworks, no dependencies

## Tech Stack

| Layer | Choice |
|-------|--------|
| Markup | Semantic HTML5 |
| Styling | Vanilla CSS (custom properties) |
| Logic | Vanilla JavaScript (IIFE, no build step) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |

## Getting Started

No build step required. Just open the file in your browser:

```bash
# Clone the repo
git clone https://github.com/amazinernest/todo-card.git
cd todo-card

# Open directly
open index.html
```

Or serve it locally:

```bash
npx serve .
```

## File Structure

```
todo-card/
├── index.html   # Semantic HTML structure & data-testid attributes
├── style.css    # Design system & responsive layout
└── app.js       # Time-remaining logic, checkbox state, button handlers
```

## data-testid Reference

| Element | `data-testid` |
|---------|--------------|
| Root card | `test-todo-card` |
| Title | `test-todo-title` |
| Description | `test-todo-description` |
| Priority badge | `test-todo-priority` |
| Due date | `test-todo-due-date` |
| Time remaining | `test-todo-time-remaining` |
| Status badge | `test-todo-status` |
| Checkbox | `test-todo-complete-toggle` |
| Tags container | `test-todo-tags` |
| Work tag | `test-todo-tag-work` |
| Urgent tag | `test-todo-tag-urgent` |
| Edit button | `test-todo-edit-button` |
| Delete button | `test-todo-delete-button` |

## Behaviour

- **Checkbox** — toggles task completion; strikes through the title and updates the status badge to "Done"
- **Time remaining** — calculates the gap between `Date.now()` and the fixed due date (Mar 1, 2026 · 18:00 UTC); refreshes every 30 s
- **Edit** — logs `"edit clicked"` to the console
- **Delete** — triggers a browser `alert`

## License

MIT
