import { useNavigate, useParams } from "react-router";
import { Button, Card, Chip } from "@heroui/react";
import { DEPARTMENTS, ROLES, STATUSES } from "../../data/users";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../../api/users";

const inputCls =
  "border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-white transition-all";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", Number(id)], // Cache key riêng cho mỗi nhân viên
    queryFn: () => usersApi.getUser(Number(id)),
    enabled: !!id, // Chỉ gọi API khi có id
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // 🆕 Xử lý trạng thái Loading
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Đang tải thông tin nhân viên...</p>
      </div>
    );
  }

  // 🆕 Xử lý trạng thái Loading
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Đang tải thông tin nhân viên...</p>
      </div>
    );
  }

  // 🆕 Xử lý trạng thái Error hoặc không tìm thấy
  if (isError || !user) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-4xl mb-3">😵</p>
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy nhân viên</h2>
        <p className="text-sm text-slate-500 mt-1">Nhân viên với ID #{id} không tồn tại hoặc đã bị xóa.</p>
        <Button
          variant="primary"
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          onPress={() => navigate("/employees")}
        >
          ← Quay lại danh sách
        </Button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-slate-900"
          onPress={() => navigate("/employees")}
        >
          ← Quay lại danh sách nhân sự
        </Button>
        <div className="flex gap-2">
          <Button
            variant="danger-soft"
            size="sm"
            isDisabled={user?.id === 1}
            className={user?.id === 1 ? "opacity-40 cursor-not-allowed" : ""}
          >
            Xóa nhân viên
          </Button>
        </div>
      </div>

      {/* Header Profile Summary Card */}
      <Card className="border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-28 sm:h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800" />
        <Card.Content className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar pulls up into the banner */}
              <div className="-mt-12 sm:-mt-14 shrink-0">
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl ring-4 ring-white shadow-md">
                    {user?.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* user? Details stay cleanly inside the white card */}
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
                  {user?.position} • {user?.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 sm:pb-1">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
                  📷 Thay đổi avatar
                </span>
              </label>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-sm">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Tài khoản:</span>
              <span className="font-mono font-medium text-slate-800">@{user?.username}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Mức lương:</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(user?.salary || 0)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Ngày gia nhập:</span>
              <span className="text-slate-700">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Mã nhân viên:</span>
              <span className="text-slate-700">#{user?.id.toString().padStart(4, "0")}</span>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Main Details & Edit Form */}
      <Card className="border border-slate-200 shadow-xs">
        <Card.Header className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-slate-900">Chỉnh sửa thông tin nhân viên</h2>
          <p className="text-xs text-slate-500">
            Cập nhật dữ liệu người dùng tương ứng với endpoint PUT /api/users/:id
          </p>
        </Card.Header>

        <Card.Content className="px-6 pb-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Section 1: Thông tin nhân viên tự sửa được */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  1. Thông tin cá nhân (Nhân viên & Admin đều có quyền sửa)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Họ và tên</label>
                  <input type="text" defaultValue={user?.name} className={inputCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Email liên hệ</label>
                  <input type="email" defaultValue={user?.email} className={inputCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
                  <input type="tel" defaultValue={user?.phone} className={inputCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Mật khẩu mới (Để trống nếu giữ nguyên)</label>
                  <input type="password" placeholder="Nhập mật khẩu mới" className={inputCls} />
                </div>
              </div>
            </div>

            {/* Section 2: Thông tin chỉ Admin mới có quyền sửa */}
            <div className="pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    2. Thông tin công việc & Đãi ngộ
                  </h3>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                  🔒 Quyền Quản trị viên (Admin only)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Phòng ban</label>
                  <select defaultValue={user?.department} className={inputCls}>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Vị trí / Chức danh</label>
                  <input type="text" defaultValue={user?.position} className={inputCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Mức lương (VNĐ)</label>
                  <input type="number" defaultValue={user?.salary} className={inputCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Vai trò hệ thống</label>
                  <select defaultValue={user?.role} className={inputCls}>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Trạng thái tài khoản</label>
                  <select defaultValue={user?.status} className={inputCls}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-3">
              <Button variant="ghost" onPress={() => navigate("/employees")}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
