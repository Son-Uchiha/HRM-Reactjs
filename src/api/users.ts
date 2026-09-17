import http from "../lib/http";
import type { UsersResponse } from "../types";

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

export const usersApi = {
  getUsers: async (params: UsersQuery = {}) => {
    const { data } = await http.get<UsersResponse>("/users", { params });
    return data;
  },
};
