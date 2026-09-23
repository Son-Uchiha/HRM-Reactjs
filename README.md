# 🏢 HRM & RBAC Portal — Frontend (React 19)

Hệ thống Quản lý Nhân sự & Phân quyền người dùng (HRM & Role-Based Access Control) xây dựng trên nền tảng **React 19**, **TypeScript**, **Vite**, **TanStack Query (React Query v5)**, **HeroUI** và **Tailwind CSS v4**.

Frontend kết nối trực tiếp với RESTful API Backend (**Bun.js + Hono + SQLite**), hỗ trợ đầy đủ các tính năng xác thực, phân quyền, quản lý dữ liệu bất đồng bộ và tải ảnh đại diện.

---

## 🛠️ Tech Stack & Thư viện sử dụng

- **Core Framework**: [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Server State Management**: [TanStack Query v5](https://tanstack.com/query/latest) (`@tanstack/react-query`)
- **Routing & Guards**: [React Router v7](https://reactrouter.com/)
- **UI Components**: [HeroUI](https://heroui.com/) (`@heroui/react`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **HTTP Client**: [Axios](https://axios-http.com/) (Tích hợp Request/Response Interceptors)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

---

## 💡 Các Kỹ năng & Kỹ thuật Frontend thực chiến (Key Technical Skills)

Dự án áp dụng các kiến trúc và kỹ thuật tiêu chuẩn của lập trình Frontend hiện đại:

### 1. Quản lý Server State với TanStack Query (React Query v5)
- **Tách biệt Cache theo Query Keys**: Phân tầng cache rõ ràng (`["users", params]`, `["user", id]`, `["me"]`).
- **Data Mutations**: Sử dụng `useMutation` xử lý bất đồng bộ cho các thao tác Thêm (`POST`), Sửa (`PUT`), Xóa (`DELETE`).
- **Cache Invalidation thông minh**: Sử dụng `queryClient.invalidateQueries` để tự động làm mới tức thì bảng danh sách, trang chi tiết và Header ngay sau khi cập nhật thông tin thành công mà không cần F5 trình duyệt.
- **Cache Pre-population & Cleanup**: Nạp sẵn thông tin tài khoản vào cache khi Đăng nhập (`setQueryData`) và dọn sạch toàn bộ cache khi Đăng xuất (`queryClient.clear()`) để bảo mật.

### 2. Tối ưu hiệu năng & Trải nghiệm người dùng (Performance & UX)
- **Debounce Search Input (500ms)**: Kết hợp `setTimeout` và `useRef` để trì hoãn việc gửi request, tự động hủy bỏ timer cũ (`clearTimeout`) khi người dùng đang gõ phím liên tục. Giúp giảm hơn 80% request thừa lên server.
- **URL-Driven State (Đồng bộ bộ lọc với URL)**: Sử dụng `useSearchParams` để đồng bộ toàn bộ trạng thái tìm kiếm, phân trang, lọc phòng ban/vai trò/trạng thái và sắp xếp lên URL. Người dùng có thể bookmark, refresh hoặc share link mà không bị mất bộ lọc.
- **Quản lý bộ nhớ RAM khi Upload Ảnh (Prevent Memory Leak)**:
  - Sử dụng `URL.createObjectURL(file)` để tạo preview ảnh tức thì trên trình duyệt.
  - Sử dụng hàm dọn dẹp (cleanup function) trong `useEffect` để giải phóng RAM (`URL.revokeObjectURL`) ngay khi người dùng chọn ảnh khác, xóa ảnh hoặc chuyển trang.
- **Controlled Forms Pattern**: Chuyển đổi toàn bộ các form sang controlled inputs (`value` + `onChange`), kiểm soát dữ liệu chặt chẽ và tương thích với API payload.
- **Custom Toast Notification**: Hệ thống thông báo thành công dạng popup nổi ở góc màn hình, tự động ẩn sau 3 giây thay thế hoàn toàn `alert()` mặc định của trình duyệt.

### 3. Bảo mật & Phân quyền người dùng (Security & RBAC)
- **Silent Refresh Token Rotation với Request Queue**:
  - Tự động bắt mã lỗi `401 Unauthorized` tại Axios Response Interceptor khi Access Token hết hạn.
  - Gọi ngầm `POST /api/auth/refresh` để nhận cặp Token mới và lưu vào `localStorage`.
  - Tự động đưa các request phát sinh trong lúc đang refresh vào hàng đợi (Queue), sau đó tự động retry lại các request này mà người dùng không nhận thấy gián đoạn.
- **Hệ thống Route Guards đa lớp**:
  - `ProtectedRoute`: Yêu cầu phải đăng nhập mới được vào các màn hình nội bộ.
  - `GuestRoute`: Chặn người dùng đã đăng nhập truy cập lại trang Login.
  - `AdminRoute`: Bảo vệ các trang quản trị (`/employees`), kết hợp cờ `isLoadingUser` để ngăn chặn hiện tượng bị "đá văng nhầm" khi người dùng F5 trang.
  - `RootRedirect`: Tự động phân luồng trang chủ dựa theo quyền: `admin` chuyển tới `/employees`, `employee` chuyển tới `/profile`.

### 4. UI/UX Design & Component Architecture
- Tích hợp bộ thư viện **HeroUI**: Sử dụng Modal Dialogs xác nhận xóa an toàn, Backdrop, Buttons đa trạng thái (Loading, Disabled, Hover), Chips phân loại trạng thái.
- Giao diện đáp ứng (Responsive Design) hoàn chỉnh trên cả Desktop, Tablet và Mobile.

---

## 📁 Cấu trúc thư mục nguồn (`src/`)

```text
src/
├── api/                   # Tầng gọi API Backend (Axios requests)
│   ├── auth.ts            # API Đăng nhập, Đăng xuất, GetMe, Refresh Token
│   └── users.ts           # API CRUD Nhân viên, Upload Avatar
├── components/            # Các component dùng chung & Route Guards
│   ├── AdminRoute.tsx     # Guard bảo vệ trang quản trị dành riêng cho Admin
│   ├── GuestRoute.tsx     # Guard dành riêng cho khách chưa đăng nhập
│   ├── ProtectedRoute.tsx # Guard bảo vệ yêu cầu xác thực
│   └── Layout.tsx         # Khung giao diện chính (Header, User Pill, Nav, Outlet)
├── contexts/              # React Context chia sẻ trạng thái
│   └── AuthContext.tsx    # Quản lý phiên đăng nhập, user hiện tại & token
├── data/                  # Hằng số hệ thống (DEPARTMENTS, ROLES, STATUSES, SORT_OPTIONS)
│   └── users.ts
├── lib/                   # Thư viện & cấu hình tiện ích
│   └── http.ts            # Cấu hình Axios Client + Interceptor xử lý Refresh Token
├── pages/                 # Các trang giao diện chính của ứng dụng
│   ├── Login.tsx          # Trang đăng nhập kèm tài khoản demo
│   ├── Employees/
│   │   ├── EmployeesPage.tsx       # Bảng nhân viên, phân trang, lọc, tìm kiếm, modal tạo & xóa
│   │   └── EmployeeDetailPage.tsx  # Xem chi tiết, cập nhật thông tin, đổi avatar & xóa nhân viên
│   └── Profile/
│       └── ProfilePage.tsx         # Trang hồ sơ cá nhân của người dùng đăng nhập
├── types/                 # Định nghĩa TypeScript interfaces & types
│   └── index.ts           # User, Role, Department, UserStatus, API Responses
├── routes.tsx             # Cấu hình Router cây phân cấp (React Router v7)
├── App.tsx                # Thiết lập QueryClientProvider, AuthProvider & RouterProvider
├── main.tsx               # Entry point của ứng dụng React
└── index.css              # Cấu hình Tailwind CSS v4
```

---

## 🚀 Cài đặt & Khởi chạy

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Khởi chạy môi trường phát triển (Dev server)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:5173`

### 3. Kiểm tra TypeScript & Build dự án
```bash
# Kiểm tra lỗi type (Type-check)
npx tsc --noEmit

# Đóng gói sản phẩm (Production build)
npm run build
```

---

## 🔐 Tài khoản Demo dùng thử

Hệ thống có sẵn các tài khoản thử nghiệm tương thích với Backend:

| Tài khoản | Mật khẩu | Vai trò | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | **Quản trị viên (Admin)** | Toàn quyền CRUD nhân viên, quản lý lương, phòng ban, đổi vai trò, xóa tài khoản. |
| **`employee`** | `user123` | **Nhân viên (Employee)** | Xem hồ sơ cá nhân, chỉ được sửa thông tin cá nhân của chính mình. |
