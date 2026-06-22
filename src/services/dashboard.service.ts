import { http } from './http'
import type { DashboardSummary } from '../types/api'

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await http.get<DashboardSummary>('/dashboard/summary')
  return data
}
