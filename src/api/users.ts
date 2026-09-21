import http from "../lib/http";
import type { User, UsersResponse } from "../types";

export interface UsersQuery {
  page?: number; // Số trang (mặc định: 1)
  limit?: number; // Số bản ghi mỗi trang (mặc định: 10, tối đa 100)
  search?: string; // Từ khóa tìm kiếm (Họ tên, Username, Email, Phòng ban)
  role?: "admin" | "employee"; // Lọc theo vai trò
  department?: // Lọc theo phòng ban
    "Engineering" | "Human Resources" | "Sales" | "Marketing" | "Finance" | "Design";
  status?: "active" | "inactive"; // Lọc theo trạng thái
  sort_by?: "name" | "username" | "salary" | "created_at" | "department"; // Trường sắp xếp (mặc định: created_at)
  order?: "asc" | "desc"; // Chiều sắp xếp (mặc định: desc)
}

// Khai báo kiểu dữ liệu khi tạo nhân viên
export interface CreateUserPayload {
  username: string;
  password: string;
  name: string;
  role?: "admin" | "employee";
  email?: string;
  phone?: string;
  department?: "Engineering" | "Human Resources" | "Sales" | "Marketing" | "Finance" | "Design";
  position?: string;
  salary?: number;
  status?: "active" | "inactive";
  avatar?: string;
}

export const usersApi = {
  getUsers: async (params: UsersQuery = {}) => {
    const { data } = await http.get<UsersResponse>("/users", { params });
    return data;
  },
  getUser: async (id: number) => {
    const { data } = await http.get<{ data: User }>(`/users/${id}`);
    return data.data; // Trả về object User luôn (bỏ lớp wrapper { data: ... })
  },
  // Thêm hàm gọi API POST /api/users
  createUser: async (payload: CreateUserPayload) => {
    const { data } = await http.post<{ data: User }>("/users", payload);
    return data.data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await http.post<{ data: { avatar: string } }>("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.avatar; // Trả về URL string của ảnh
  },
  deleteUser: async (id: number) => {
    const { data } = await http.delete<{ message: string }>(`/users/${id}`);
    return data;
  },
};
