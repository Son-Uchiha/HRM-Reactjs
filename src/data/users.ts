import type { Department, Role, User, UserStatus } from '../types'

export const DEPARTMENTS: Department[] = [
  'Engineering',
  'Human Resources',
  'Sales',
  'Marketing',
  'Finance',
  'Design'
]

export const ROLES: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Quản trị viên (Admin)' },
  { value: 'employee', label: 'Nhân viên (Employee)' }
]

export const STATUSES: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Hoạt động (Active)' },
  { value: 'inactive', label: 'Tạm khóa (Inactive)' }
]

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Ngày tạo' },
  { value: 'name', label: 'Họ và tên' },
  { value: 'username', label: 'Tên tài khoản' },
  { value: 'salary', label: 'Mức lương' },
  { value: 'department', label: 'Phòng ban' }
]

export const mockCurrentUser: User = {
  id: 1,
  username: 'admin',
  role: 'admin',
  name: 'Quản Trị Viên (Admin)',
  email: 'admin@hrm.com',
  phone: '0901234567',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  department: 'Management',
  position: 'System Administrator',
  salary: 50000000,
  status: 'active',
  created_at: '2025-01-01T08:00:00.000Z',
  updated_at: '2025-01-15T10:30:00.000Z'
}

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 2,
    username: 'employee',
    role: 'employee',
    name: 'Nguyễn Văn A',
    email: 'employee@hrm.com',
    phone: '0912345678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Engineering',
    position: 'Frontend Developer',
    salary: 22000000,
    status: 'active',
    created_at: '2025-01-10T09:00:00.000Z',
    updated_at: '2025-02-01T14:20:00.000Z'
  },
  {
    id: 3,
    username: 'tran_thi_b',
    role: 'employee',
    name: 'Trần Thị B',
    email: 'tranthib@hrm.com',
    phone: '0923456789',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'Human Resources',
    position: 'HR Specialist',
    salary: 18000000,
    status: 'active',
    created_at: '2025-01-12T11:15:00.000Z',
    updated_at: '2025-01-12T11:15:00.000Z'
  },
  {
    id: 4,
    username: 'le_van_c',
    role: 'employee',
    name: 'Lê Văn C',
    email: 'levanc@hrm.com',
    phone: '0934567890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    position: 'Backend Developer (Bun/Node)',
    salary: 28000000,
    status: 'active',
    created_at: '2025-01-15T08:45:00.000Z',
    updated_at: '2025-02-10T16:00:00.000Z'
  },
  {
    id: 5,
    username: 'pham_minh_d',
    role: 'employee',
    name: 'Phạm Minh D',
    email: 'phamminhd@hrm.com',
    phone: '0945678901',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    department: 'Design',
    position: 'UI/UX Designer',
    salary: 24000000,
    status: 'active',
    created_at: '2025-01-18T10:00:00.000Z',
    updated_at: '2025-01-18T10:00:00.000Z'
  },
  {
    id: 6,
    username: 'hoang_thu_e',
    role: 'employee',
    name: 'Hoàng Thu E',
    email: 'hoangthue@hrm.com',
    phone: '0956789012',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    department: 'Marketing',
    position: 'Marketing Lead',
    salary: 26000000,
    status: 'active',
    created_at: '2025-01-20T14:30:00.000Z',
    updated_at: '2025-02-05T09:10:00.000Z'
  },
  {
    id: 7,
    username: 'vu_dinh_f',
    role: 'employee',
    name: 'Vũ Đình F',
    email: 'vudinhf@hrm.com',
    phone: '0967890123',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    department: 'Sales',
    position: 'Sales Executive',
    salary: 16000000,
    status: 'active',
    created_at: '2025-01-22T09:20:00.000Z',
    updated_at: '2025-01-22T09:20:00.000Z'
  },
  {
    id: 8,
    username: 'ngo_bao_g',
    role: 'employee',
    name: 'Ngô Bảo G',
    email: 'ngobaog@hrm.com',
    phone: '0978901234',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    department: 'Finance',
    position: 'Financial Analyst',
    salary: 25000000,
    status: 'active',
    created_at: '2025-01-25T15:00:00.000Z',
    updated_at: '2025-01-25T15:00:00.000Z'
  },
  {
    id: 9,
    username: 'dang_quang_h',
    role: 'employee',
    name: 'Đặng Quang H',
    email: 'dangquangh@hrm.com',
    phone: '0989012345',
    avatar: null,
    department: 'Engineering',
    position: 'DevOps Engineer',
    salary: 32000000,
    status: 'inactive',
    created_at: '2025-02-01T13:40:00.000Z',
    updated_at: '2025-02-15T11:00:00.000Z'
  },
  {
    id: 10,
    username: 'bui_kim_k',
    role: 'employee',
    name: 'Bùi Kim K',
    email: 'buikimk@hrm.com',
    phone: '0990123456',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    department: 'Human Resources',
    position: 'Recruiter',
    salary: 17000000,
    status: 'active',
    created_at: '2025-02-05T10:10:00.000Z',
    updated_at: '2025-02-05T10:10:00.000Z'
  }
]
