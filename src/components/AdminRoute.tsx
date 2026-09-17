import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute() {
  const { user } = useAuth();

  // Nếu đã đăng nhập nhưng không phải admin -> chuyển hướng sang /profile
  if (user && user.role !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
