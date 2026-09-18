import { useNavigate, useSearchParams } from "react-router";
import {
  Button,
  Chip,
  Pagination,
  TableRoot,
  TableScrollContainer,
  TableContent,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalHeading,
  ModalFooter,
  useOverlayState,
} from "@heroui/react";
import { DEPARTMENTS, ROLES, STATUSES, SORT_OPTIONS } from "../../data/users";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usersApi } from "../../api/users";

const LIMIT = 10;

const inputCls =
  "border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-white transition-all";

export default function EmployeesPage() {
  const navigate = useNavigate();
  const createState = useOverlayState();
  const [searchParams, setSearchParams] = useSearchParams();
  // 1. Đọc số trang từ URL (vd: ?page=2). Nếu không có hoặc lỗi thì mặc định là 1
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data } = useQuery({
    queryKey: ["users", { page, limit: LIMIT }],
    queryFn: () => usersApi.getUsers({ page, limit: LIMIT }),
    // placeholderData: keepPreviousData,
  });
  const users = data?.data ?? [];
  const totalUsers = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;
  // Tính dải số bản ghi: vd "Hiển thị 1–10 của 32 nhân viên"
  const from = totalUsers > 0 ? (page - 1) * LIMIT + 1 : 0;
  const to = Math.min(page * LIMIT, totalUsers);

  // Format currency VNĐ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Nhân Sự</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng số: <span className="font-semibold text-slate-700">{totalUsers}</span> nhân viên trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm shadow-blue-500/20"
            onPress={createState.open}
          >
            + Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tìm kiếm</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Tìm theo Tên, Username, Email..."
                className="border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phòng ban</label>
            <select
              defaultValue=""
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white"
            >
              <option value="">Tất cả phòng ban</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Vai trò (Role)</label>
            <select
              defaultValue=""
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white"
            >
              <option value="">Tất cả vai trò</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Trạng thái</label>
            <select
              defaultValue=""
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Sắp xếp theo:</span>
            <select
              defaultValue="created_at"
              className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
              ↓ Giảm dần
            </Button>
          </div>
          <span className="text-xs text-slate-400">Bộ lọc tương thích với endpoint GET /api/users</span>
        </div>
      </div>

      {/* Employees Table */}
      <TableRoot className="bg-transparent">
        <TableScrollContainer>
          <TableContent
            aria-label="Employees table"
            className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs"
          >
            <TableHeader>
              <TableColumn id="employee" isRowHeader>
                NHÂN VIÊN
              </TableColumn>
              <TableColumn id="account">TÀI KHOẢN</TableColumn>
              <TableColumn id="department">PHÒNG BAN & VỊ TRÍ</TableColumn>
              <TableColumn id="role">VAI TRÒ</TableColumn>
              <TableColumn id="salary">MỨC LƯƠNG</TableColumn>
              <TableColumn id="status">TRẠNG THÁI</TableColumn>
              <TableColumn id="actions">THAO TÁC</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} id={user.id}>
                  {/* Name & Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div
                          className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                          onClick={() => navigate(`/employees/${user.id}`)}
                        >
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Username & Phone */}
                  <TableCell>
                    <div className="font-mono text-xs font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded w-fit">
                      @{user.username}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{user.phone || "—"}</div>
                  </TableCell>

                  {/* Department & Position */}
                  <TableCell>
                    <div className="font-medium text-slate-800 text-sm">{user.department}</div>
                    <div className="text-xs text-slate-500">{user.position}</div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Chip
                      color={user.role === "admin" ? "accent" : "default"}
                      size="sm"
                      variant="soft"
                      className="capitalize font-semibold text-xs"
                    >
                      {user.role}
                    </Chip>
                  </TableCell>

                  {/* Salary */}
                  <TableCell>
                    <span className="font-medium text-slate-900 text-sm">{formatCurrency(user.salary)}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      color={user.status === "active" ? "success" : "danger"}
                      size="sm"
                      variant="soft"
                      className="text-xs font-medium"
                    >
                      {user.status === "active" ? "Hoạt động" : "Tạm khóa"}
                    </Chip>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="secondary" onPress={() => navigate(`/employees/${user.id}`)}>
                        Chi tiết
                      </Button>
                      <Button
                        size="sm"
                        variant="danger-soft"
                        isDisabled={user.id === 1} // Không được xóa admin chính chủ
                        className={user.id === 1 ? "opacity-40 cursor-not-allowed" : ""}
                      >
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContent>
        </TableScrollContainer>
      </TableRoot>

      {/* Pagination Bar */}
      <div className="mt-6 bg-white p-3 rounded-xl border border-slate-200">
        <Pagination className="w-full">
          <Pagination.Summary>
            Hiển thị {from}–{to} của {totalUsers} nhân viên
          </Pagination.Summary>
          <Pagination.Content>
            {/* Nút lùi trang */}
            <Pagination.Item>
              <Pagination.Previous isDisabled={page <= 1} onPress={() => setSearchParams({ page: String(page - 1) })}>
                <Pagination.PreviousIcon />
                <span>Trước</span>
              </Pagination.Previous>
            </Pagination.Item>
            {/* Các số trang 1, 2, 3... */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Pagination.Item key={p}>
                <Pagination.Link isActive={p === page} onPress={() => setSearchParams({ page: String(p) })}>
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ))}
            {/* Nút tiến trang */}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page >= totalPages}
                onPress={() => setSearchParams({ page: String(page + 1) })}
              >
                <span>Sau</span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </div>

      {/* Create Employee Modal */}
      <ModalRoot state={createState}>
        <ModalBackdrop>
          <ModalContainer>
            <ModalDialog className="max-w-2xl">
              <ModalHeader>
                <ModalHeading className="text-lg font-bold text-slate-900">Thêm Nhân Viên Mới</ModalHeading>
                <p className="text-xs text-slate-500">
                  Tạo tài khoản và thông tin nhân viên theo schema POST /api/users
                </p>
              </ModalHeader>

              <ModalBody>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                      </label>
                      <input type="text" placeholder="vd: tran_van_c" className={inputCls} />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Mật khẩu ban đầu <span className="text-rose-500">*</span>
                      </label>
                      <input type="password" placeholder="Tối thiểu 6 ký tự" className={inputCls} />
                    </div>

                    {/* Full Name */}
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Họ và tên nhân viên <span className="text-rose-500">*</span>
                      </label>
                      <input type="text" placeholder="vd: Trần Văn C" className={inputCls} />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Địa chỉ Email <span className="text-rose-500">*</span>
                      </label>
                      <input type="email" placeholder="tranvanc@hrm.com" className={inputCls} />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
                      <input type="tel" placeholder="0987654321" className={inputCls} />
                    </div>

                    {/* Department */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Phòng ban</label>
                      <select defaultValue="Engineering" className={inputCls}>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Position */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Chức vụ / Vị trí</label>
                      <input type="text" placeholder="vd: Frontend Developer" className={inputCls} />
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Vai trò hệ thống (RBAC) <span className="text-rose-500">*</span>
                      </label>
                      <select defaultValue="employee" className={inputCls}>
                        <option value="employee">Nhân viên (Employee)</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                      </select>
                    </div>

                    {/* Salary */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Mức lương cơ bản (VNĐ)</label>
                      <input type="number" placeholder="20000000" className={inputCls} />
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Trạng thái hoạt động</label>
                      <select defaultValue="active" className={inputCls}>
                        <option value="active">Hoạt động (Active)</option>
                        <option value="inactive">Tạm khóa (Inactive)</option>
                      </select>
                    </div>

                    {/* Avatar Upload Preview Box */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Ảnh đại diện (Avatar)</label>
                      <input type="file" accept="image/*" className={inputCls} />
                    </div>
                  </div>
                </form>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" onPress={createState.close}>
                  Hủy bỏ
                </Button>
                <Button
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onPress={createState.close}
                >
                  Thêm mới nhân viên
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </ModalRoot>
    </div>
  );
}
