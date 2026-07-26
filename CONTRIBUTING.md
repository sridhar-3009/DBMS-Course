# Contributing to DBMS Illustrated

Thanks for contributing. This project is intentionally simple to run and edit: it is a static site built with vanilla HTML, CSS, and JavaScript.

## Development Setup

1. Fork the repository on GitHub.
2. Clone your fork locally.

```bash
git clone https://github.com/<your-username>/DBMS-Course.git
cd DBMS-Course
python3 -m http.server 8080
```

3. Open `http://localhost:8080` in your browser.
4. Test both the home page and the topic page you changed before opening a pull request.

There is no npm install step, build step, or framework-specific tooling.

## Project Conventions

- Use vanilla HTML, CSS, and JavaScript only.
- Do not add npm, bundlers, or frontend frameworks.
- Keep the writing style beginner-friendly and explanation-first.
- Avoid emojis in HTML and canvas drawing code. If you need a symbol, use an ASCII or Unicode codepoint directly.
- Keep demos theme-aware so they still work in both light and dark modes.

## Canvas and Interaction Rules

- New canvas demos should follow the existing `mkCanvas()` helper pattern in [`js/demos.js`](js/demos.js).
- All canvas work should keep HiDPI support by respecting `devicePixelRatio`. The existing helpers already do this.
- Use the shared theme color helpers instead of hard-coding large new color systems.
- If you add interactive behavior outside the demos, keep it aligned with the patterns already used in [`js/main.js`](js/main.js).

## Adding a New SVG Diagram

Several topic pages include animated inline SVG diagrams. Follow the existing `.diagram-box` and `.pkt` pattern:

1. Wrap the SVG in a container with the `.diagram-box` class.
2. Use `.pkt` circles for animated packets or moving markers.
3. Reuse the same structure as the topic pages that already animate diagram packets, such as:
   - [`topics/01-intro.html`](topics/01-intro.html)
   - [`topics/02-relational-model.html`](topics/02-relational-model.html)
   - [`topics/08-concurrency.html`](topics/08-concurrency.html)
4. Keep the SVG responsive and readable on smaller screens.

If you introduce a new diagram style, match the spacing, line weights, and color restraint already used across the course.

## File Guide

- [`index.html`](index.html): landing page, course grid, and hero layout
- [`css/style.css`](css/style.css): shared design system and component styles
- [`js/main.js`](js/main.js): theme toggle, hero behavior, SVG packet animation, and page-level interactions
- [`js/demos.js`](js/demos.js): reusable canvas helpers and interactive topic demos
- [`topics/`](topics): one topic page per lesson

## Pull Request Checklist

Before opening a pull request:

1. Confirm the site still runs locally with `python3 -m http.server 8080`.
2. Check the page you changed on desktop and a narrow mobile viewport.
3. Keep the change focused. Avoid mixing unrelated copy, style, and demo work in one PR.
4. Include screenshots or a short screen recording for visible UI or demo changes.
5. Link the related issue when one exists.

## Issue Labels

Current labels are used to keep contributions scoped:

- `content`: explanation, copy, and learning-flow improvements
- `demo`: interactive demo behavior or canvas changes
- `documentation`: repo docs such as README or contributor guidance
- `accessibility`: keyboard, contrast, semantics, or screen-reader improvements
- `bug`: broken behavior or regressions
- `enhancement`: new feature work
- `good first issue`: beginner-friendly tasks with clear scope
- `help wanted`: tasks where outside contributions are especially useful
- `question`: clarification requests

If a task does not fit neatly, describe the scope clearly in the issue or PR and the maintainer can adjust labels.
