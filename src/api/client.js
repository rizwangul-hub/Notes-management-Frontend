const TOKEN_KEY = 'notes_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/** Base URL: empty string uses Vite dev proxy (see vite.config.js). Set VITE_API_URL for production. */
function baseUrl() {
  return import.meta.env.VITE_API_URL ?? ''
}

function authHeaders() {
  const t = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (t) headers.Authorization = `Bearer ${t}`
  return headers
}

/**
 * @param {string} path - e.g. `/api/auth/login`
 * @param {RequestInit} [options]
 */
export async function api(path, options = {}) {
  const url = `${baseUrl()}${path}`
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  })

  const data = await res.json().catch(() => ({}))

  if (res.status === 401 && getToken()) {
    setToken(null)
    if (!path.includes('/auth/login') && !path.includes('/auth/register')) {
      window.location.assign('/login')
    }
  }

  if (!res.ok) {
    const msg = data.message || res.statusText || 'Request failed'
    const err = new Error(msg)
    err.status = res.status
    err.body = data
    throw err
  }

  return data
}
