---
version: 1
---

# Copilot Instructions (Repo-wide)

This file provides guidance for Copilot in this repository.

- Prioritize **React + Vite** solutions.
- Keep changes small and focused; avoid adding heavy dependencies.
- Preserve existing task manager workflows (add/edit/delete/complete) when enhancing features.
- Favor accessibility and semantic HTML in UI improvements.

## When asked to add features

- Prefer keeping logic in `src/App.jsx` unless a clear component split adds maintainability.
- Always keep styling in `src/style.css`.
