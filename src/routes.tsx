import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import EmployeesPage from "./pages/Employees/EmployeesPage";
import EmployeeDetailPage from "./pages/Employees/EmployeeDetailPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import AdminRoute from "./components/AdminRoute";
import { useAuth } from "./contexts/AuthContext";

// Component phân luồng mặc định khi vào trang chủ "/"
function RootRedirect() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/employees" replace />;
  }
  return <Navigate to="/profile" replace />;
}

const routes = createBrowserRouter([
  {
    Component: GuestRoute,
    children: [
      {
        path: "/login",
        Component: Login,
      },
    ],
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        Component: Layout,
        children: [
          {
            index: true,
            element: <RootRedirect />,
          },
          {
            path: "/profile",
            Component: ProfilePage,
          },
          {
            Component: AdminRoute,
            children: [
              {
                path: "/employees",
                Component: EmployeesPage,
              },
              {
                path: "/employees/:id",
                Component: EmployeeDetailPage,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default routes;
