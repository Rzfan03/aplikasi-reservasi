import { getSessionAccessToken } from './auth'
import type { InstansiData, LayananData, RequestData, StatsData, Status } from './types'

const API = import.meta.env.VITE_API_URL

export class UnauthorizedError extends Error {}

export function sseUrl(): string {
  return `${API}/api/requests/events`
}

export async function getToken(): Promise<string | null> {
  return getSessionAccessToken()
}

let _redirectCooldown = false

function redirectToLogin() {
  if (_redirectCooldown) return
  _redirectCooldown = true
  setTimeout(() => { _redirectCooldown = false }, 2000)
  console.error('[api] redirectToLogin triggered', new Error().stack)
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = async () => {
    const token = await getToken()
    if (!token) {
      console.error(`[api] no token for ${path}`)
      throw new UnauthorizedError('Tidak ada sesi')
    }
    return fetch(`${API}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    })
  }

  let res: Response
  try {
    res = await doFetch()
  } catch (e) {
    if (e instanceof UnauthorizedError) redirectToLogin()
    throw e
  }
  if (res.status === 401) {
    console.warn(`[api] 401 on ${path}, retrying once...`)
    try {
      res = await doFetch()
    } catch (e) {
      if (e instanceof UnauthorizedError) redirectToLogin()
      throw e
    }
  }
  if (res.status === 401) {
    console.error(`[api] 401 on ${path} after retry`)
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

export async function fetchStats(): Promise<StatsData> {
  return request<StatsData>('/api/requests/stats')
}

export async function fetchRequestsPaged(opts?: {
  status?: Status
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{ data: RequestData[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams()
  if (opts?.status) params.set('status', opts.status)
  if (opts?.dateFrom) params.set('dateFrom', opts.dateFrom)
  if (opts?.dateTo) params.set('dateTo', opts.dateTo)
  if (opts?.search) params.set('search', opts.search)
  if (opts?.page) params.set('page', String(opts.page))
  if (opts?.limit) params.set('limit', String(opts.limit))
  const qs = params.toString()
  return request(`/api/requests${qs ? `?${qs}` : ''}`)
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

export async function fetchInstansi(): Promise<InstansiData[]> {
  return request<InstansiData[]>('/api/instansi')
}

export async function createInstansi(nama: string): Promise<InstansiData> {
  return request<InstansiData>('/api/instansi', {
    method: 'POST',
    body: JSON.stringify({ nama }),
  })
}

export async function updateInstansi(id: string, data: { nama?: string }): Promise<InstansiData> {
  return request<InstansiData>(`/api/instansi/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteInstansi(id: string): Promise<void> {
  await request<void>(`/api/instansi/${id}`, { method: 'DELETE' })
}
