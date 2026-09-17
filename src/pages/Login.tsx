import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, Card } from "@heroui/react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsloading] = useState(false);
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder UI: điều hướng sau khi bạn gắn logic API đăng nhập
    if (isLoading) return;
    setIsloading(true);
    try {
      await login(username, password);
      navigate("/employees");
    } catch (error) {
      console.log(error);
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 mb-3">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">HRM & RBAC Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Hệ thống quản lý nhân sự & phân quyền tổ chức</p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border border-white/60 bg-white/90 backdrop-blur-xl">
        <Card.Header className="flex flex-col items-start gap-1 pb-0 px-6 pt-6">
          <h2 className="text-xl font-bold text-slate-800">Đăng nhập</h2>
          <p className="text-xs text-slate-500">Vui lòng nhập tài khoản và mật khẩu được cấp</p>
        </Card.Header>

        <Card.Content className="px-6 pb-6 pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tên đăng nhập / Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username (vd: admin, employee)"
                autoComplete="username"
                className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Mật khẩu / Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                autoComplete="current-password"
                className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20 py-2.5"
            >
              Đăng nhập vào hệ thống
            </Button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>🔑</span> Tài khoản thử nghiệm (Bun BE seed):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setUsername("admin");
                  setPassword("admin123");
                }}
                className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-blue-900">Admin</div>
                <div className="text-[11px] text-blue-700 mt-0.5">admin / admin123</div>
                <div className="text-[10px] text-blue-500 mt-1">Toàn quyền CRUD</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername("employee");
                  setPassword("user123");
                }}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Employee</div>
                <div className="text-[11px] text-slate-600 mt-0.5">employee / user123</div>
                <div className="text-[10px] text-slate-500 mt-1">Chỉ xem & sửa của mình</div>
              </button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
