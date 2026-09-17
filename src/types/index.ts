export type Role = 'admin' | 'employee'

export type Department =
  | 'Engineering'
  | 'Human Resources'
  | 'Sales'
  | 'Marketing'
  | 'Finance'
  | 'Design'

export type UserStatus = 'active' | 'inactive'

export interface User {
  id: number
  username: string
  role: Role
  name: string
  email: string
  phone: string
  avatar: string | null
  department: Department | string
  position: string
  salary: number
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthResponse {
  message: string
  accessToken: string
  refreshToken: string
  user: User
}

export interface UsersResponse {
  data: User[]
  pagination: Pagination
}
