import { createContext, useContext, useState } from "react";
import { authApi } from "../api/auth";
import type { User } from "../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: User | undefined;
  isLoadingUser: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("accessToken")));

  const queryClient = useQueryClient(); // Khởi tạo queryClient
  // Queries
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
  });

  const login = async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    // Nạp ngay lập tức dữ liệu User mới vào Cache (Admin sẽ hiện ngay 0ms, không bị chớp Employee cũ)
    queryClient.setQueryData(["me"], data.user);

    setIsAuthenticated(true);
  };
  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {});
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);

    // Xóa sạch toàn bộ Cache khi Đăng xuất (tránh rò rỉ dữ liệu sang tài khoản khác)
    queryClient.clear();
  };
  return (
    <AuthContext
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        isLoadingUser,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
