import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { NoteModal } from '../components/NoteModal'

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return ''
  }
}

export function DashboardPage() {
  const { profile, logout } = useAuth()
  const [notes, setNotes] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const loadNotes = useCallback(async () => {
    setError('')
    setBusy(true)
    try {
      if (debouncedSearch) {
        const r = await api(`/api/notes/search?search=${encodeURIComponent(debouncedSearch)}`)
        setNotes(r.data || [])
        setPagination(null)
      } else {
        const r = await api(`/api/notes?page=${page}&limit=12&sort=${sort}`)
        console.log('Notes received from API:', r.data)
        setNotes(r.data || [])
        setPagination(r.pagination || null)
      }
    } catch (e) {
      setError(e.message || 'Failed to load notes')
    } finally {
      setBusy(false)
    }
  }, [page, sort, debouncedSearch])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  async function handleArchive(note) {
    if (!window.confirm(`Archive "${note.title}"? It will disappear from this list.`)) return
    try {
      await api(`/api/notes/${note._id}/archive`, { method: 'PATCH' })
      setNotes((list) => list.filter((n) => n._id !== note._id))
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleDelete(note) {
    if (!window.confirm(`Delete "${note.title}" permanently?`)) return
    try {
      await api(`/api/notes/${note._id}`, { method: 'DELETE' })
      setNotes((list) => list.filter((n) => n._id !== note._id))
    } catch (e) {
      alert(e.message)
    }
  }

  function openCreate() {
    setEditingNote(null)
    setModalOpen(true)
  }

  function openEdit(note) {
    setEditingNote(note)
    setModalOpen(true)
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-[var(--border)] bg-[var(--code-bg)]/30 px-6 py-8 md:w-64 md:border-b-0 md:border-r">
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Notes</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-h)]">{profile?.name || 'User'}</p>
          <p className="truncate text-sm text-[var(--text)]">{profile?.email}</p>
          {profile?.role ? (
            <p className="mt-1 text-xs text-[var(--text)]">Role: {profile.role}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          New note
        </button>
        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--border)] pt-6">
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-left text-sm font-medium text-[var(--text-h)] hover:bg-[var(--bg)]"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col gap-6 px-4 py-8 md:px-8">
        <header className="flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-h)]">Your notes</h1>
            <p className="mt-1 text-sm text-[var(--text)]">Synced with your backend at <code className="text-xs">/api/notes</code>.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              disabled={Boolean(debouncedSearch)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-h)] outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-50"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-[var(--text-h)] outline-none ring-[var(--accent)] focus:ring-2 sm:max-w-md"
          />
          {debouncedSearch ? (
            <span className="text-sm text-[var(--text)]">Search results</span>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        {busy ? (
          <p className="text-left text-[var(--text)]">Loading notes…</p>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--code-bg)]/20 px-6 py-16 text-center text-[var(--text)]">
            <p className="text-lg font-medium text-[var(--text-h)]">No notes yet</p>
            <p className="mt-2 text-sm">Create your first note or adjust your search.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-6 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              New note
            </button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <li
                key={note._id}
                className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 text-left shadow-sm transition hover:shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="line-clamp-2 font-semibold text-[var(--text-h)]">{note.title}</h2>
                  {note.category ? (
                    <span className="shrink-0 rounded-full bg-[var(--accent-bg)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                      {note.category}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-4 flex-1 text-sm text-[var(--text)]">{note.content}</p>
                <p className="mt-3 text-xs text-[var(--text)]">{formatDate(note.updatedAt || note.createdAt)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(note)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-h)] hover:bg-[var(--code-bg)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArchive(note)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-h)] hover:bg-[var(--code-bg)]"
                  >
                    Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note)}
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {pagination && pagination.pages > 1 && !debouncedSearch ? (
          <nav className="flex items-center justify-center gap-2 pt-4" aria-label="Pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--text)]">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        ) : null}
      </main>

      <NoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        note={editingNote}
        onSaved={loadNotes}
      />
    </div>
  )
}
