import { http } from './http'
import type { Sector } from '../types/api'

export async function getSectors(): Promise<Sector[]> {
  const res = await http.get<Sector[]>('/sectors')
  return res.data
}