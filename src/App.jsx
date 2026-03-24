import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'task-manager.tasks'

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const DARK_MODE_KEY = 'task-manager.darkMode'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [draft, setDraft] = useState('')
  const [draftPriority, setDraftPriority] = useState('medium')
  const [draftTags, setDraftTags] = useState('')
  const [filter, setFilter] = useState('all')
  const [darkMode, setDarkMode] = useState(false)
  const [editing, setEditing] = useState({
    id: null,
    text: '',
    priority: 'medium',
    tags: '',
  })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setTasks(parsed)
      } catch {
        // Ignore malformed state
      }
    }

    const savedDark = localStorage.getItem(DARK_MODE_KEY)
    if (savedDark) {
      setDarkMode(savedDark === 'true')
    } else if (window.matchMedia) {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem(DARK_MODE_KEY, darkMode.toString())
  }, [darkMode])

  const incompleteCount = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks]
  )

  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.completed)
    if (filter === 'completed') return tasks.filter((t) => t.completed)
    return tasks
  }, [tasks, filter])

  const addTask = () => {
    const trimmed = draft.trim()
    if (!trimmed) return

    const tags = draftTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setTasks((prev) => [
      {
        id: generateId(),
        text: trimmed,
        completed: false,
        priority: draftPriority,
        tags,
      },
      ...prev,
    ])

    setDraft('')
    setDraftTags('')
    setDraftPriority('medium')
  }

  const toggle = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const remove = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (editing.id === id) setEditing({ id: null, text: '' })
  }

  const startEdit = (task) => {
    setEditing({
      id: task.id,
      text: task.text,
      priority: task.priority ?? 'medium',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
    })
  }

  const saveEdit = () => {
    const trimmed = editing.text.trim()
    if (!trimmed) return

    const tags = editing.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setTasks((prev) =>
      prev.map((t) =>
        t.id === editing.id
          ? { ...t, text: trimmed, priority: editing.priority, tags }
          : t
      )
    )

    setEditing({ id: null, text: '', priority: 'medium', tags: '' })
  }

  const cancelEdit = () => {
    setEditing({ id: null, text: '', priority: 'medium', tags: '' })
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>Task Manager</h1>
          <p>
            Add tasks, mark them complete, and delete when you're done. ({incompleteCount}{' '}
            left)
          </p>
        </div>

        <button
          className="theme-toggle"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-pressed={darkMode}
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <section className="task-input">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask()
          }}
          placeholder="What needs to be done?"
          aria-label="New task"
        />

        <select
          value={draftPriority}
          onChange={(e) => setDraftPriority(e.target.value)}
          aria-label="Priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          value={draftTags}
          onChange={(e) => setDraftTags(e.target.value)}
          placeholder="Tags (comma separated)"
          aria-label="Tags"
        />

        <button onClick={addTask} disabled={!draft.trim()}>
          Add
        </button>
      </section>

      <section className="task-filter">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
        ].map((f) => (
          <button
            key={f.key}
            className={f.key === filter ? 'active' : ''}
            onClick={() => setFilter(f.key)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </section>

      <section className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty">
            {tasks.length === 0
              ? 'No tasks yet — add one above.'
              : 'No tasks match this filter.'}
          </div>
        ) : (
          <ul>
            {filteredTasks.map((task) => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                <div className="task-main">
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggle(task.id)}
                    />
                    {editing.id === task.id ? (
                    <div className="edit-row">
                      <input
                        className="edit-input"
                        value={editing.text}
                        onChange={(e) =>
                          setEditing((prev) => ({ ...prev, text: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        autoFocus
                      />

                      <select
                        className="edit-select"
                        value={editing.priority}
                        onChange={(e) =>
                          setEditing((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                        aria-label="Priority"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>

                      <input
                        className="edit-input"
                        value={editing.tags}
                        onChange={(e) =>
                          setEditing((prev) => ({ ...prev, tags: e.target.value }))
                        }
                        placeholder="Tags (comma separated)"
                        aria-label="Tags"
                      />

                      <div className="edit-actions">
                        <button className="secondary" onClick={saveEdit}>
                          Save
                        </button>
                        <button className="secondary" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="task-text">{task.text}</span>
                      <span className={`priority ${task.priority}`}> {task.priority}</span>
                      {Array.isArray(task.tags) && task.tags.length > 0 && (
                        <span className="tags">
                          {task.tags.map((tag) => (
                            <span key={tag} className="tag">
                              {tag}
                            </span>
                          ))}
                        </span>
                      )}
                    </>
                  )}
                </label>

                {! (editing.id === task.id) && (
                  <div className="task-actions">
                    <button
                      className="secondary"
                      onClick={() => toggle(task.id)}
                    >
                      {task.completed ? 'Mark active' : 'Mark complete'}
                    </button>
                    <button
                      className="secondary"
                      onClick={() => startEdit(task)}
                    >
                      Edit
                    </button>
                    <button className="delete" onClick={() => remove(task.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">
        Built with React + Vite — edit <code>src/App.jsx</code> to try things out.
      </footer>
    </div>
  )
}
