# HRM & RBAC Frontend Template (React 19 + HeroUI + Tailwind CSS v4)

Giao diện quản lý nhân sự và phân quyền (HRM & RBAC) được xây dựng bằng **React 19**, **Vite**, **TypeScript**, **HeroUI** và **Tailwind CSS v4**.

Template này được thiết kế sẵn toàn bộ **giao diện người dùng (UI)** và **mock data** tương thích 100% với **Bun.js RESTful API Backend** (Hono + SQLite), sẵn sàng để bạn tự tích hợp các luồng xử lý logic (gọi API, quản lý State, Authentication, Authorization RBAC).

---

## 🛠️ Công nghệ sử dụng

- **Core**: [React 19](https://react.dev/), [Vite 7](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **UI Components**: [HeroUI](https://heroui.com/) (`@heroui/react`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Cài đặt & Khởi chạy

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy môi trường phát triển (Dev server)
npm run dev

# 3. Kiểm tra TypeScript & Build dự án
npm run build

# 4. Xem trước bản build
npm run preview
```

Ứng dụng mặc định chạy tại: `http://localhost:5173`

---

## 📁 Cấu trúc thư mục

```text
react-products-template/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── routes.tsx                 # Cấu hình định tuyến React Router v7
    ├── components/
    │   └── Layout.tsx             # Khung giao diện chung (Header, User Pill, Nav, Outlet)
    ├── data/
    │   └── users.ts               # Mock data nhân sự & hằng số lọc (Phòng ban, Role, v.v.)
    ├── pages/
    │   ├── Login.tsx              # Trang đăng nhập kèm tài khoản demo
    │   ├── Employees/
    │   │   ├── EmployeesPage.tsx  # Danh sách nhân viên, bộ lọc & Modal thêm mới
    │   │   └── EmployeeDetailPage.tsx # Chi tiết & cập nhật thông tin nhân viên
    │   └── Profile/
    │       └── ProfilePage.tsx    # Hồ sơ cá nhân của tôi (Dành cho role Employee)
    └── types/
        └── index.ts               # Khai báo TypeScript types (User, Role, Department, v.v.)
```

---

## 🖥️ Các màn hình & Tính năng giao diện (UI Ready)

### 1. Trang Đăng nhập (`/login`)
- Form nhập `username` & `password`.
- Thẻ ghi nhớ nhanh thông tin tài khoản demo của Backend Bun:
  - **Admin**: `admin` / `admin123`
  - **Employee**: `employee` / `user123`

### 2. Khung điều hướng chung (`Layout.tsx`)
- Thanh điều hướng trên cùng (Sticky Header) với logo HRM Portal.
- Menu chuyển đổi giữa **Nhân sự** và **Hồ sơ của tôi**.
- User Profile Pill hiển thị Avatar, Họ tên, Role Chip (`ADMIN` / `EMPLOYEE`) và nút **Đăng xuất**.

### 3. Quản lý Danh sách Nhân sự (`/employees`)
- **Bộ lọc đa tiêu chí** tương thích các query parameters của `GET /api/users`:
  - Tìm kiếm (`search`): Theo Họ tên, Username, Email, Phòng ban.
  - Phòng ban (`department`): `Engineering`, `Human Resources`, `Sales`, `Marketing`, `Finance`, `Design`.
  - Vai trò (`role`): `admin` hoặc `employee`.
  - Trạng thái (`status`): `active` hoặc `inactive`.
  - Sắp xếp (`sort_by` & `order`): Theo ngày tạo, tên, lương, v.v.
- **Bảng dữ liệu nhân viên**: Hiển thị Avatar, Thông tin tài khoản, Phòng ban & Vị trí, Role badge, Mức lương VNĐ, Chip trạng thái, nút Xem chi tiết và nút Xóa.
- **Thanh phân trang** (`Pagination UI`).
- **Modal "Thêm nhân viên mới"**: Form đầy đủ các trường tương ứng với `POST /api/users`.

### 4. Chi tiết & Cập nhật Nhân sự (`/employees/:id`)
- Khung tóm tắt nhân sự với nút tải ảnh đại diện (`POST /api/users/avatar`).
- Form phân chia rõ ràng 2 khu vực phục vụ RBAC:
  - **Khu vực thông tin cá nhân**: Họ tên, SĐT, Mật khẩu mới, Avatar (Nhân viên & Admin đều sửa được).
  - **Khu vực thông tin quản trị**: Phòng ban, Chức danh, Mức lương, Vai trò, Trạng thái (Gắn nhãn `🔒 Quyền Quản trị viên (Admin only)`).

### 5. Hồ sơ của tôi (`/profile`)
- Màn hình dành riêng cho tài khoản đăng nhập (tương thích `GET /api/auth/me` và `PUT /api/users/:id`).
- Có thông báo hướng dẫn phân quyền RBAC: Nhân viên chỉ được cập nhật thông tin cá nhân, các trường thông tin quản trị sẽ ở chế độ chỉ đọc (Read-only).

---

## 🔌 Hướng dẫn tích hợp Backend Bun RESTful API

Backend chạy mặc định tại: `http://localhost:3000`

### Danh sách API Endpoints cần gọi:

| Phương thức | Endpoint | Phân quyền | Mục đích |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Đăng nhập lấy `accessToken` & `refreshToken` |
| `POST` | `/api/auth/refresh` | Public | Refresh token khi access token hết hạn |
| `POST` | `/api/auth/logout` | Public | Đăng xuất và xóa token |
| `GET` | `/api/auth/me` | 🔒 Đã đăng nhập | Lấy thông tin tài khoản hiện tại |
| `GET` | `/api/users` | 🔒 **Admin only** | Lấy danh sách nhân viên (kèm filter, search, paging) |
| `GET` | `/api/users/:id` | 🔒 Admin / Chính chủ | Lấy thông tin chi tiết một nhân viên |
| `POST` | `/api/users` | 🔒 **Admin only** | Thêm mới một nhân viên |
| `POST` | `/api/users/avatar` | 🔒 Đã đăng nhập | Upload file ảnh đại diện (`multipart/form-data`) |
| `PUT` | `/api/users/:id` | 🔒 Admin / Chính chủ | Cập nhật thông tin nhân viên |
| `DELETE` | `/api/users/:id` | 🔒 **Admin only** | Xóa nhân viên (ngăn xóa chính mình) |

> 🔒 **Header bắt buộc khi gọi các API bảo vệ:**  
> `Authorization: Bearer <accessToken>`

---

## 📝 Lưu ý phát triển

Dự án hiện tại hoàn toàn là **Giao diện thuần (Pure UI)** với các handler placeholder (`e.preventDefault()`). Bạn có thể tự do:
1. Tạo thư mục `src/services` hoặc `src/api` để viết các hàm `fetch`/`axios`.
2. Tạo context/store (`Zustand`, `Redux`, hoặc React Context) để quản lý `auth state`, `accessToken`, `user`.
3. Bổ sung Protected Route / Route Guards trong [`src/routes.tsx`](file:///g:/BE-Reactjs-HRM/react-products-template/src/routes.tsx) để chặn truy cập theo vai trò.
