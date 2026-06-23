import { http } from './http'
import type { Sector, SectorStoryResponse } from '../types/api'

export async function getSectors(): Promise<Sector[]> {
  const res = await http.get<Sector[]>('/sectors')
  return res.data
}

export async function getSectorStory(id: string): Promise<SectorStoryResponse> {
  const res = await http.get<SectorStoryResponse>(`/sectors/${id}/story`)
  return res.data
}