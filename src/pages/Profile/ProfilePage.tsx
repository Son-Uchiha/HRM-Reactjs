import { Button, Card, Chip } from "@heroui/react";
import { useAuth } from "../../contexts/AuthContext";

const inputCls =
  "border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-white transition-all";

const readOnlyCls =
  "border border-slate-200 rounded-lg px-3.5 py-2 text-sm bg-slate-100/80 text-slate-600 cursor-not-allowed w-full select-none";

export default function ProfilePage() {
  const { user, isLoadingUser } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Khi đang tải dữ liệu từ API getMe, hiển thị màn hình chờ/skeleton
  if (isLoadingUser) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
        <p>Đang tải thông tin hồ sơ của bạn...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Summary */}
      <Card className="border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-28 sm:h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600" />
        <Card.Content className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar pulls up into the banner */}
              <div className="-mt-12 sm:-mt-14 shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl ring-4 ring-white shadow-md">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              {/* User text info stays inside the white content area */}
              <div className="pt-2 sm:pt-3 pb-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">{user?.name}</h1>
                  <Chip
                    color={user?.role === "admin" ? "accent" : "default"}
                    size="sm"
                    variant="soft"
                    className="uppercase text-[11px] font-bold"
                  >
                    {user?.role}
                  </Chip>
                  <Chip
                    color={user?.status === "active" ? "success" : "danger"}
                    size="sm"
                    variant="soft"
                    className="text-xs"
                  >
                    {user?.status === "active" ? "Hoạt động" : "Tạm khóa"}
                  </Chip>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  {user?.position || "Chưa có chức vụ"} • {user?.department || "Chưa có phòng ban"}
                </p>
              </div>
            </div>

            {/* Avatar Upload Action */}
            <div className="flex items-center gap-2 shrink-0 sm:pb-1">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" />
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors whitespace-nowrap">
                  📷 Đổi ảnh đại diện
                </span>
              </label>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Edit Form */}
      <Card className="border border-slate-200 shadow-xs">
        <Card.Header className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-slate-900">Hồ sơ cá nhân của tôi</h2>
          <p className="text-xs text-slate-500">
            Dữ liệu trả về từ GET /api/auth/me và cập nhật qua PUT /api/users/:id
          </p>
        </Card.Header>

        <Card.Content className="px-6 pb-6">
          {/* RBAC Notice */}
          <div className="mb-6 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5">
            <span className="text-base leading-none">ℹ️</span>
            <div>
              <span className="font-semibold">Cơ chế phân quyền cá nhân:</span> Nhân viên chỉ có thể cập nhật Họ tên, Số
              điện thoại, Mật khẩu và Ảnh đại diện. Các thông tin về Lương, Phòng ban, Chức vụ và Vai trò được khóa theo
              chính sách công ty.
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Editable Fields */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Thông tin có thể chỉnh sửa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" autoComplete="name" defaultValue={user?.name ?? ""} className={inputCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
                  <input type="tel" autoComplete="tel" defaultValue={user?.phone ?? ""} className={inputCls} />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Đổi mật khẩu mới (Bỏ trống nếu không thay đổi)
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Readonly Fields */}
            <div className="pt-5 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>🔒</span> Thông tin cố định (Do Admin quản lý)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Tên đăng nhập (Username)</label>
                  <input type="text" readOnly disabled value={user?.username ?? ""} className={readOnlyCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Email tài khoản</label>
                  <input type="email" readOnly disabled value={user?.email ?? ""} className={readOnlyCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Phòng ban</label>
                  <input type="text" readOnly disabled value={user?.department ?? ""} className={readOnlyCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Vị trí / Chức danh</label>
                  <input type="text" readOnly disabled value={user?.position ?? ""} className={readOnlyCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Mức lương hiện tại</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formatCurrency(user?.salary ?? 0)}
                    className={readOnlyCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Vai trò hệ thống (Role)</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={user?.role === "admin" ? "Quản trị viên (Admin)" : "Nhân viên (Employee)"}
                    className={readOnlyCls}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm shadow-blue-500/20"
              >
                Lưu hồ sơ cá nhân
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
