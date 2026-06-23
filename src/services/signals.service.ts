import { http } from './http'
import type { Signal, SignalFeedFilters, SignalFeedResponse, SignalStatus } from '../types/api'

export async function getSignalFeed(
  params: SignalFeedFilters & { cursor?: string; limit?: number },
  signal?: AbortSignal,
): Promise<SignalFeedResponse> {
  const p: Record<string, string | number> = {}
  if (params.cursor) p.cursor = params.cursor
  if (params.limit) p.limit = params.limit
  if (params.signalType) p.signalType = params.signalType
  if (params.severity) p.severity = params.severity
  if (params.status) p.status = params.status
  if (params.q) p.q = params.q
  const res = await http.get<SignalFeedResponse>('/signals/feed', { params: p, signal })
  return res.data
}

export async function getSignalById(id: string): Promise<Signal> {
  const res = await http.get<Signal>(`/signals/${id}`)
  return res.data
}

export async function updateSignalStatus(id: string, status: SignalStatus): Promise<Signal> {
  const res = await http.patch<Signal>(`/signals/${id}/status`, { status })
  return res.data
}