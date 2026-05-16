import { useEffect, useState } from 'react'
import { api } from '../api/client'

const emptyForm = { title: '', content: '', category: '' }

export function NoteModal({ open, onClose, note, onSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    if (note) {
      setForm({
        title: note.title ?? '',
        content: note.content ?? '',
        category: note.category ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, note])

  if (!open) return null

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim() || undefined,
      }
      if (!body.title || !body.content) {
        setError('Title and content are required.')
        setSaving(false)
        return
      }

      if (note?._id) {
        await api(`/api/notes/${note._id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      } else {
        await api('/api/notes', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-[var(--shadow)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-[var(--text-h)]">{note ? 'Edit note' : 'New note'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-[var(--text)] hover:bg-[var(--code-bg)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error ? (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}

          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-h)]">
            Title
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] outline-none ring-[var(--accent)] focus:ring-2"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-h)]">
            Category
            <input
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              placeholder="Optional"
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-h)]">
            Content
            <textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              rows={8}
              className="resize-y rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] outline-none ring-[var(--accent)] focus:ring-2"
              required
            />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-h)] hover:bg-[var(--code-bg)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
