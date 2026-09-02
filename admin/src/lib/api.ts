import { getJWTToken } from './auth'
import type { LayananData, RequestData, Status } from './types'

const API = import.meta.env.VITE_API_URL

export class UnauthorizedError extends Error {}

export async function getToken(): Promise<string | null> {
  return (await getJWTToken()) ?? null
}

export function sseUrl(): string {
  return `${API}/api/requests/events`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = async () => {
    const token = await getToken()
    if (!token) throw new UnauthorizedError('Tidak ada sesi')
    return fetch(`${API}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    })
  }

  let res
  try {
    res = await doFetch()
  } catch (e) {
    if (e instanceof UnauthorizedError) redirectToLogin()
    throw e
  }
  if (res.status === 401) {
    // JWT short-lived (15 mnt); token bisa kedaluwarsa di tab yang lama.
    // Ambil token segar sekali lalu ulangi permintaan.
    try {
      res = await doFetch()
    } catch (e) {
      if (e instanceof UnauthorizedError) redirectToLogin()
      throw e
    }
  }
  if (res.status === 401) {
    redirectToLogin()
    throw new UnauthorizedError(res.statusText)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Request gagal (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export async function fetchRequests(status?: Status): Promise<RequestData[]> {
  const qs = status ? `?status=${status}` : ''
  return request<RequestData[]>(`/api/requests${qs}`)
}

export async function updateStatus(id: string, status: Status): Promise<RequestData> {
  return request<RequestData>(`/api/requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export async function fetchLayanan(): Promise<LayananData[]> {
  return request<LayananData[]>('/api/layanan')
}

export async function createLayanan(nama: string, urutan: number): Promise<LayananData> {
  return request<LayananData>('/api/layanan', {
    method: 'POST',
    body: JSON.stringify({ nama, urutan }),
  })
}

export async function updateLayanan(
  id: string,
  data: { nama?: string; urutan?: number },
): Promise<LayananData> {
  return request<LayananData>(`/api/layanan/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteLayanan(id: string): Promise<void> {
  await request<void>(`/api/layanan/${id}`, { method: 'DELETE' })
}