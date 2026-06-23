import { http } from './http'
import type { Sector, SectorStoryResponse } from '../types/api'

// El contrato documenta GET /sectors como { items: Sector[] }.
// Toleramos tambien un array plano por si el backend lo devuelve asi.
type SectorsResponse = { items: Sector[] } | Sector[]

export async function getSectors(): Promise<Sector[]> {
  const res = await http.get<SectorsResponse>('/sectors')
  return Array.isArray(res.data) ? res.data : res.data.items
}

export async function getSectorStory(id: string): Promise<SectorStoryResponse> {
  const res = await http.get<SectorStoryResponse>(`/sectors/${id}/story`)
  return res.data
}