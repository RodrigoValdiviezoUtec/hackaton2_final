import { http } from './http'
import type { LoginRequest, LoginResponse, User } from '../types/api'

/** GET /auth/me puede responder el User directo o envuelto en { user }. */
type MeResponse = User | { user: User }

function unwrapUser(data: MeResponse): User {
  return 'user' in data ? data.user : data
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/auth/login', payload)
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await http.get<MeResponse>('/auth/me')
  return unwrapUser(data)
}
