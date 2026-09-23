import { useNavigate, useParams } from "react-router";
import {
  Button,
  Card,
  Chip,
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
import { DEPARTMENTS, ROLES, STATUSES } from "../../data/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UpdateUserPayload } from "../../api/users";
import { useEffect, useRef, useState } from "react";

const inputCls =
  "border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-white transition-all";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteState = useOverlayState(); // Điều khiển mở/đóng Modal xóa

  //  Mutation gọi API xóa nhân viên
  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      // Xóa thành công → refresh cache danh sách & chuyển về trang danh sách
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/employees"); // Quay về danh sách vì nhân viên này đã bị xóa
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error || "Có lỗi xảy ra khi xóa nhân viên!";
      alert(errorMsg);
    },
  });
  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    name: "",
    email: "",
    phone: "",
    password: "",
    department: "Engineering",
    position: "",
    salary: 0,
    role: "employee",
    status: "active",
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // 🆕 State quản lý avatar upload (pattern giống EmployeesPage)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl); // 🧹 Giải phóng RAM khi đổi/xóa file
    };
  }, [avatarFile]);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", Number(id)], // Cache key riêng cho mỗi nhân viên
    queryFn: () => usersApi.getUser(Number(id)),
    enabled: !!id, // Chỉ gọi API khi có id
  });
  // Khi data user load xong từ API → Đổ vào editForm
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "", // Luôn để trống — chỉ điền khi muốn đổi mật khẩu
        department: user.department as UpdateUserPayload["department"],
        position: user.position || "",
        salary: user.salary || 0,
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Handler khi user gõ/chọn thay đổi trên form
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Handler khi chọn file avatar mới
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
  };

  // Handler bấm xóa ảnh preview
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Mutation gọi API cập nhật nhân viên
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.updateUser(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", Number(id)] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      // Reset avatar state sau khi lưu thành công
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // 🆕 Bật Toast thông báo và tự động tắt sau 3 giây
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    },
    onError: (err: any) => {
      const errors = err.response?.data?.errors;
      if (errors) {
        const messages = Object.values(errors).join("\n");
        alert("Lỗi validation:\n" + messages);
      } else {
        const errorMsg = err.response?.data?.error || "Có lỗi xảy ra khi cập nhật!";
        alert(errorMsg);
      }
    },
  });

  // 🆕 Hàm xử lý khi bấm "Lưu thay đổi" — ASYNC vì có thể upload avatar trước
  const handleUpdateSubmit = async () => {
    const payload: UpdateUserPayload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      department: editForm.department,
      position: editForm.position,
      salary: editForm.salary,
      role: editForm.role,
      status: editForm.status,
    };

    // Chỉ gửi password nếu user đã điền (không trống)
    if (editForm.password && editForm.password.length > 0) {
      payload.password = editForm.password;
    }

    // 🆕 Nếu có chọn ảnh mới → Upload trước để lấy URL, rồi gắn vào payload
    if (avatarFile) {
      try {
        setIsUploading(true);
        const avatarUrl = await usersApi.uploadAvatar(avatarFile);
        payload.avatar = avatarUrl; // Gắn URL ảnh mới vào payload
      } catch (err) {
        alert("Upload ảnh thất bại! Vui lòng thử lại.");
        return; // Dừng lại, không gọi PUT nếu upload lỗi
      } finally {
        setIsUploading(false);
      }
    }

    updateMutation.mutate(payload);
  };
  // Xử lý trạng thái Loading
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
            onPress={deleteState.open}
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

            {/* ✅ MỚI — có handler + preview + nút xóa */}
            <div className="flex items-center gap-2 shrink-0 sm:pb-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
                  📷 Thay đổi avatar
                </span>
              </label>

              {/* 🆕 Hiển thị preview ảnh mới (nếu đã chọn file) */}
              {avatarPreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-10 h-10 rounded-lg object-cover ring-2 ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors border border-rose-200"
                  >
                    ✕ Hủy
                  </button>
                </div>
              )}
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
                  <input
                    name="name"
                    type="text"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Email liên hệ</label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
                  <input
                    name="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Mật khẩu mới (Để trống nếu giữ nguyên)</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Nhập mật khẩu mới (để trống = giữ nguyên)"
                    value={editForm.password}
                    onChange={handleEditChange}
                    className={inputCls}
                  />
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
                  <select
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    className={inputCls}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Vị trí / Chức danh</label>
                  <input
                    name="position"
                    type="text"
                    value={editForm.position}
                    onChange={handleEditChange}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Mức lương (VNĐ)</label>
                  <input
                    name="salary"
                    type="number"
                    value={editForm.salary}
                    onChange={handleEditChange}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Vai trò hệ thống</label>
                  <select name="role" value={editForm.role} onChange={handleEditChange} className={inputCls}>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Trạng thái tài khoản</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} className={inputCls}>
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
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                isDisabled={updateMutation.isPending || isUploading}
                onPress={handleUpdateSubmit}
              >
                {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* 🆕 Delete Confirmation Modal */}
      <ModalRoot state={deleteState}>
        <ModalBackdrop>
          <ModalContainer>
            <ModalDialog className="max-w-md">
              <ModalHeader className="flex flex-col items-center text-center pt-6">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-2xl mb-2">
                  ⚠️
                </div>
                <ModalHeading className="text-lg font-bold text-slate-900">Xác nhận xóa nhân viên</ModalHeading>
              </ModalHeader>

              <ModalBody className="text-center px-6 py-2">
                <p className="text-sm text-slate-600">
                  Bạn có chắc chắn muốn xóa nhân viên{" "}
                  <strong className="text-slate-900 font-semibold">"{user?.name}"</strong> khỏi hệ thống?
                </p>
                <p className="text-xs text-rose-500 mt-2 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  ⚠️ Lưu ý: Hành động này không thể hoàn tác. Dữ liệu liên quan đến nhân viên này sẽ bị xóa vĩnh viễn.
                </p>
              </ModalBody>

              <ModalFooter className="flex justify-end gap-3 pb-6 px-6">
                <Button variant="ghost" isDisabled={deleteMutation.isPending} onPress={deleteState.close}>
                  Hủy bỏ
                </Button>
                <Button
                  variant="danger"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
                  isDisabled={deleteMutation.isPending}
                  onPress={() => {
                    if (user) {
                      deleteMutation.mutate(user.id);
                    }
                  }}
                >
                  {deleteMutation.isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </ModalRoot>
      {/* 🆕 Component Toast thông báo cập nhật thành công */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-white border border-emerald-200 text-slate-800 px-4 py-3 rounded-xl shadow-xl shadow-emerald-500/10 transition-all duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            {/* Icon tick xanh lá SVG */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Cập nhật thành công!</p>
            <p className="text-xs text-slate-500">Thông tin nhân viên đã được lưu vào hệ thống.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessToast(false)}
            className="ml-3 text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
