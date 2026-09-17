import { NavLink, Outlet, useNavigate } from "react-router";
import { Button, Chip } from "@heroui/react";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <div
                onClick={() => navigate(user?.role === "admin" ? "/employees" : "/profile")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent block leading-tight">
                    HRM Portal
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium tracking-wide">Quản Lý Nhân Sự & RBAC</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center gap-1">
                {user?.role === "admin" && (
                  <NavLink
                    to="/employees"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    Nhân sự
                  </NavLink>
                )}
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Hồ sơ của tôi
                </NavLink>
              </nav>
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    AD
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</span>
                    <Chip
                      size="sm"
                      color="accent"
                      variant="soft"
                      className="text-[10px] font-bold uppercase py-0 px-1.5"
                    >
                      {user?.role}
                    </Chip>
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5 leading-none">{user?.email}</span>
                </div>
              </div>

              {/* Logout Button (Pure UI placeholder) */}
              <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Hệ thống HRM & Phân quyền RBAC • Bun.js + Hono RESTful API Backend
      </footer>
    </div>
  );
}
