import { http } from './http'
import type { Tropel, TropelFilters, TropelPage } from '../types/api'

export async function getTropels(filters: Partial<TropelFilters>): Promise<TropelPage> {
  const params: Record<string, string | number> = {}
  if (filters.page !== undefined) params.page = filters.page
  if (filters.size !== undefined) params.size = filters.size
  if (filters.species) params.species = filters.species
  if (filters.vitalState) params.vitalState = filters.vitalState
  if (filters.sectorId) params.sectorId = filters.sectorId
  if (filters.q) params.q = filters.q
  if (filters.sort) params.sort = filters.sort
  const res = await http.get<TropelPage>('/tropels', { params })
  return res.data
}

export async function getTropelById(id: string): Promise<Tropel> {
  const res = await http.get<Tropel>(`/tropels/${id}`)
  return res.data
}