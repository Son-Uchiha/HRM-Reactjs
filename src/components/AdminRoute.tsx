import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute() {
  const { user, isLoadingUser } = useAuth();

  // 1. Nếu đang tải thì hiển thị vòng xoay chờ, TUYỆT ĐỐI KHÔNG chuyển hướng vội
  if (isLoadingUser) {
    return <div className="p-10 text-center text-slate-500">Đang xác thực quyền hạn...</div>;
  }
  // Nếu đã đăng nhập nhưng không phải admin -> chuyển hướng sang /profile
  if (user && user.role !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
