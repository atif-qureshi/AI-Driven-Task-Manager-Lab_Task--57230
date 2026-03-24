# Task Manager App — Instructions

## Running the app

1. Install dependencies (once):
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the app:
   - Visit **http://localhost:5173/** in your browser

---

## Features included

- Add tasks (with **priority** and **tags**)
- Mark tasks **completed**
- Delete tasks
- Edit tasks (text, priority, tags)
- Filter tasks by **All / Active / Completed**
- Task list is persisted in **localStorage** (survives reload)

---

## Project structure

- `src/main.jsx` — app entry point
- `src/App.jsx` — task logic + UI
- `src/style.css` — app styles
- `.vscode/copilot-instructions.md` — Copilot behavior guidance
- `copilot-agents.json` — custom Copilot agent definition
