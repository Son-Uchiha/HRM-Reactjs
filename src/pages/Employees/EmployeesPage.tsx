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
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type CreateUserPayload, type UsersQuery } from "../../api/users";
import { useRef, useState } from "react";

const LIMIT = 10;

const inputCls =
  "border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-white transition-all";

export default function EmployeesPage() {
  const queryClient = useQueryClient();

  // Form state khởi tạo
  const initialForm: CreateUserPayload = {
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    position: "",
    role: "employee",
    salary: 0,
    status: "active",
  };
  const [form, setForm] = useState<CreateUserPayload>(initialForm);
  const navigate = useNavigate();
  const createState = useOverlayState();
  const [searchParams, setSearchParams] = useSearchParams();
  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      return next;
    });
  };
  // 1. Đọc số trang từ URL (vd: ?page=2). Nếu không có hoặc lỗi thì mặc định là 1
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const searchFromUrl = searchParams.get("search") || "";
  // 2. State input và Ref debounce
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Filter department, role, status từ URL
  const department = (searchParams.get("department") ?? "") as UsersQuery["department"];
  const role = (searchParams.get("role") || "") as UsersQuery["role"];
  const status = (searchParams.get("status") || "") as UsersQuery["status"];
  // (mặc định sort theo ngày tạo mới nhất created_at desc)
  const sortBy = (searchParams.get("sort_by") || "created_at") as UsersQuery["sort_by"];
  const order = (searchParams.get("order") || "desc") as UsersQuery["order"];

  const { data } = useQuery({
    queryKey: ["users", { page, limit: LIMIT, search: searchFromUrl, department, role, status, sortBy, order }],
    queryFn: () =>
      usersApi.getUsers({
        page,
        limit: LIMIT,
        search: searchFromUrl,
        department,
        role,
        status,
        sort_by: sortBy,
        order,
      }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      // 1. Tự động load lại danh sách nhân viên mới nhất trên bảng
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // 2. Đóng Modal
      createState.close();
      // 3. Xóa trắng form về mặc định
      resetForm();
    },
    onError: (err: any) => {
      const errorMsg =
        err.response?.data?.error ||
        Object.values(err.response?.data?.errors || {})[0] ||
        "Có lỗi xảy ra khi tạo nhân viên!";
      alert(errorMsg);
    },
  });

  const handleCreateSubmit = () => {
    createMutation.mutate(form);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      // Nếu là ô number (như lương) thì tự ép sang Number, còn lại giữ string
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
  };
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
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    pages.push(1);
    if (page > 3) {
      pages.push("ellipsis");
    }
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }
    pages.push(totalPages);
    return pages;
  };

  // 3. Hàm xử lý onChange của bạn
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      updateParams({ page: "1", search: value });
    }, 500);
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
                value={searchInput}
                onChange={handleSearchInputChange}
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
              value={department}
              onChange={(e) => updateParams({ department: e.target.value, page: "1" })}
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
              value={role}
              onChange={(e) => updateParams({ role: e.target.value, page: "1" })}
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
              value={status}
              onChange={(e) => updateParams({ status: e.target.value, page: "1" })}
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
              value={sortBy}
              onChange={(e) => updateParams({ sort_by: e.target.value, page: "1" })}
              defaultValue="created_at"
              className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2"
              onPress={() =>
                updateParams({
                  order: order === "desc" ? "asc" : "desc",
                  page: "1",
                })
              }
            >
              {order === "desc" ? "↓ Giảm dần" : "↑ Tăng dần"}
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
              <Pagination.Previous isDisabled={page <= 1} onPress={() => updateParams({ page: String(page - 1) })}>
                <Pagination.PreviousIcon />
                <span>Trước</span>
              </Pagination.Previous>
            </Pagination.Item>
            {/* Các số trang 1, 2, 3... */}
            {getPageNumbers().map((p, i) =>
              p === "ellipsis" ? (
                <Pagination.Item key={`ellipsis-${i}`}>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              ) : (
                <Pagination.Item key={p}>
                  <Pagination.Link isActive={p === page} onPress={() => updateParams({ page: String(p) })}>
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ),
            )}
            {/* Nút tiến trang */}
            <Pagination.Item>
              <Pagination.Next isDisabled={page >= totalPages} onPress={() => updateParams({ page: String(page + 1) })}>
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
                      <input
                        name="username"
                        type="text"
                        placeholder="vd: tran_van_c"
                        className={inputCls}
                        value={form.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Mật khẩu ban đầu <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="password"
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
                        className={inputCls}
                        value={form.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Full Name */}
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Họ và tên nhân viên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="name"
                        type="text"
                        placeholder="vd: Trần Văn C"
                        className={inputCls}
                        value={form.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Địa chỉ Email</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="tranvanc@hrm.com"
                        className={inputCls}
                        value={form.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="0987654321"
                        className={inputCls}
                        value={form.phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Department */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Phòng ban</label>
                      <select
                        defaultValue="Engineering"
                        className={inputCls}
                        value={form.department}
                        onChange={handleInputChange}
                      >
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
                      <input
                        name="position"
                        type="text"
                        placeholder="vd: Frontend Developer"
                        className={inputCls}
                        value={form.position}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Vai trò hệ thống (RBAC) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        defaultValue="employee"
                        className={inputCls}
                        value={form.role}
                        onChange={handleInputChange}
                      >
                        <option value="employee">Nhân viên (Employee)</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                      </select>
                    </div>

                    {/* Salary */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Mức lương cơ bản (VNĐ)</label>
                      <input
                        name="salary"
                        type="number"
                        placeholder="20000000"
                        className={inputCls}
                        value={form.salary}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Trạng thái hoạt động</label>
                      <select
                        defaultValue="active"
                        className={inputCls}
                        value={form.status}
                        onChange={handleInputChange}
                      >
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
                <Button
                  variant="ghost"
                  onPress={() => {
                    createState.close();
                    resetForm();
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  isDisabled={createMutation.isPending}
                  onPress={handleCreateSubmit}
                >
                  {createMutation.isPending ? "Đang tạo..." : "Thêm mới nhân viên"}
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </ModalRoot>
    </div>
  );
}
