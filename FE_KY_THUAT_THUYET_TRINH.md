# TÀI LIỆU THUYẾT TRÌNH: CÁC KỸ THUẬT FRONTEND TRỌNG TÂM (HRM SYSTEM)
> **Dành cho:** Báo cáo đồ án / Thuyết trình kỹ thuật  
> **Phạm vi:** Frontend (React 19 + TypeScript + Vite + HeroUI + TanStack Query)

---

## MỤC LỤC
1. [JWT (JSON Web Token) trên Frontend](#1-jwt-json-web-token-trên-frontend)
2. [Refresh Token Queue với Axios Interceptors](#2-refresh-token-queue-với-axios-interceptors)
3. [RBAC (Role-Based Access Control) trên Frontend](#3-rbac-role-based-access-control-trên-frontend)
4. [Phân Quyền Admin & Employee (Route Guards & Dynamic UI)](#4-phân-quyền-admin--employee)
5. [TanStack Query v5 (Server State & Caching)](#5-tanstack-query-v5-server-state--caching)
6. [Tìm Kiếm với Kỹ Thuật Debounce (useRef + setTimeout)](#6-tìm-kiếm-với-kỹ-thuật-debounce)

---

## 1. JWT (JSON Web Token) trên Frontend

### ❓ Vấn đề thực tế (Tại sao dùng?)
- Hệ thống cần xác thực người dùng mà không dùng Session Cookie truyền thống (Stateless Auth).
- Phía Frontend cần lưu trữ thông tin xác thực gọn nhẹ, dễ đính kèm khi giao tiếp với RESTful API.

### ⚙️ Cách triển khai trong dự án
- **Lưu trữ:** Lưu `accessToken` (thời hạn ngắn) và `refreshToken` (thời hạn dài) vào `localStorage`.
- **Tự động hóa:** Sử dụng **Axios Request Interceptor** (`src/lib/http.ts`) để tự động "đóng dấu" token vào Header của mọi request gửi đi:
  ```typescript
  config.headers.Authorization = `Bearer ${accessToken}`;
  ```
- **Xóa sạch:** Khi đăng xuất, xóa toàn bộ token và dọn cache để tránh rò rỉ dữ liệu phiên cũ.

> 🎤 **Câu thoại thuyết trình ngắn gọn:**  
> *"Phía Frontend sử dụng JWT để quản lý phiên đăng nhập không trạng thái. Mọi request API đều được Axios Request Interceptor tự động gắn kèm Bearer Token mà lập trình viên không cần gõ thủ công ở từng component."*

---

## 2. Refresh Token Queue với Axios Interceptors

### ❓ Vấn đề thực tế (Tại sao dùng?)
- Access Token có thời hạn ngắn (để bảo mật). Khi token hết hạn, backend trả về lỗi **401 Unauthorized**.
- **Bài toán hóc búa:** Một trang web khi vừa tải có thể bắn cùng lúc **3 – 5 API song song**. Nếu token hết hạn, cả 5 API đều bị 401 cùng một tích tắc. Nếu cả 5 đều gọi API refresh token ➡️ **Gây xung đột (Race Condition) và lỗi token**.

### ⚙️ Cách triển khai trong dự án (`src/lib/http.ts`)
Áp dụng mô hình **Cờ khóa (`isRefreshing`) kết hợp Hàng đợi (`failedQueue`)**:
1. **Request đầu tiên** dính 401: Bật `isRefreshing = true` và lập tức gửi request lấy token mới từ `/api/auth/refresh`.
2. **Các request theo sau** cũng bị 401: Thấy cờ `isRefreshing === true` ➡️ Không gọi refresh nữa mà tự động **xếp hàng vào `failedQueue` (dưới dạng Promise treo)**.
3. Khi lấy được token mới:
   - Lưu `accessToken` mới vào LocalStorage.
   - Hàm `processQueue()` đánh thức toàn bộ các request đang chờ trong hàng đợi, gán token mới và tự động chạy lại (retry).
   - Người dùng tiếp tục thao tác bình thường, **không hề bị văng ra trang Login**.

> 🎤 **Câu thoại thuyết trình ngắn gọn:**  
> *"Điểm sáng kỹ thuật lớn nhất ở tầng mạng của nhóm là Response Interceptor kết hợp hàng đợi (Queue). Khi token hết hạn, hệ thống tự động làm mới token ngầm và chạy lại toàn bộ các request bị nghẽn mà người dùng không hề nhận ra gián đoạn."*

---

## 3. RBAC (Role-Based Access Control) trên Frontend

### ❓ Vấn đề thực tế (Tại sao dùng?)
- Hệ thống có 2 nhóm người dùng với thẩm quyền khác nhau: **Admin** (toàn quyền quản trị nhân sự) và **Employee** (chỉ xem/sửa hồ sơ cá nhân).
- Cần kiểm soát chặt chẽ để Employee không thể truy cập trái phép vào các tài nguyên của Admin.

### ⚙️ Cách triển khai trong dự án
- Thông tin phân quyền được lưu trong `user.role` từ endpoint `/api/auth/me` và cung cấp toàn cục qua `AuthContext`.
- Mọi quyết định hiển thị trang hay thao tác nút bấm đều dựa trên `user.role === 'admin'`.

> 🎤 **Câu thoại thuyết trình ngắn gọn:**  
> *"RBAC phía Frontend giúp đồng bộ quyền hạn với Backend, đảm bảo giao diện được cá nhân hóa chính xác theo vai trò của người đăng nhập."*

---

## 4. Phân Quyền Admin & Employee

### ❓ Vấn đề thực tế (Tại sao dùng?)
- Tránh tình trạng người dùng gõ trực tiếp URL trên thanh địa chỉ (ví dụ: nhân viên gõ `/employees`) để xem lén dữ liệu quản trị.
- Tối ưu trải nghiệm: Ẩn các nút bấm hoặc menu mà người dùng không có quyền dùng.

### ⚙️ Cách triển khai trong dự án (Bảo vệ 3 tầng)
1. **Tầng 1 - Route Guards (`src/components/`):**
   - `<ProtectedRoute>`: Bắt buộc phải đăng nhập mới được vào.
   - `<AdminRoute>`: Nếu `user.role !== 'admin'`, lập tức đá người dùng về trang `/profile`.
   - `<GuestRoute>`: Đã đăng nhập rồi thì không cho quay lại trang `/login`.
2. **Tầng 2 - Điều hướng thông minh (`RootRedirect`):**
   - Khi vào trang chủ `/`: Admin tự động được chuyển hướng sang `/employees`, Employee tự động được chuyển sang `/profile`.
3. **Tầng 3 - Dynamic UI (Giao diện động theo quyền):**
   - Trong `Layout.tsx`: Menu "Nhân sự" chỉ hiển thị với Admin.
   - Trong `EmployeesPage.tsx`: Nút "Xóa" bị vô hiệu hóa đối với tài khoản Admin chính chủ (`id === 1`).

> 🎤 **Câu thoại thuyết trình ngắn gọn:**  
> *"Dự án áp dụng bảo vệ đa tầng: Chặn truy cập từ Router bằng các Route Guards và tự động ẩn/hiện các thành phần giao diện theo vai trò thực tế."*

---

## 5. TanStack Query v5 (Server State & Caching)

### ❓ Vấn đề thực tế (Tại sao dùng?)
- Quản lý dữ liệu từ Server bằng `useState` + `useEffect` thủ công rất dễ gặp lỗi: code dài dòng, dễ memory leak, không có cache, mỗi lần chuyển trang lại bị nháy trắng màn hình (Loading flash).

### ⚙️ Cách triển khai và điểm sáng kỹ thuật
- **Caching tự động:** Dữ liệu nhân viên và hồ sơ cá nhân được cache theo `queryKey`. Tránh gọi lại API khi dữ liệu còn mới.
- **`placeholderData: keepPreviousData` (Cực kỳ quan trọng khi phân trang & lọc):**
  - Khi bấm sang trang 2 hoặc đổi bộ lọc, TanStack Query vẫn **giữ nguyên bảng dữ liệu cũ trên màn hình** trong lúc chờ dữ liệu mới tải về.
  - Kết quả: **Không bị giật nháy loading**, trải nghiệm chuyển trang mượt mà như app desktop.
- **Tối ưu Cache khi Login/Logout:**
  - `queryClient.setQueryData(["me"], data.user)`: Nạp ngay thông tin User vào Cache khi vừa Login xong (hiển thị ngay lập tức 0ms).
  - `queryClient.clear()`: Xóa sạch toàn bộ Cache khi Logout (tránh rò rỉ dữ liệu giữa 2 tài khoản khác nhau).

> 🎤 **Câu thoại thuyết trình ngắn gọn:**  
> *"Nhóm sử dụng TanStack Query để quản lý Server State. Điểm nổi bật là kỹ thuật `keepPreviousData` giúp phân trang và lọc dữ liệu cực kỳ mượt mà, loại bỏ hoàn toàn hiện tượng nháy trắng màn hình."*

---

## 6. Tìm Kiếm với Kỹ Thuật Debounce

### ❓ Vấn đề thực tế (Tại sao dùng?)
- Nếu người dùng gõ từ khóa `"Nguyễn Văn A"` (12 ký tự), nếu không debounce thì cứ gõ 1 phím là gọi API 1 lần ➡️ **Bắn 12 request liên tục lên server**, gây quá tải hệ thống và xung đột thứ tự dữ liệu trả về.

### ⚙️ Cách triển khai trong dự án (`useRef` + `setTimeout`)
- **Tách bạch 2 trạng thái:**
  - `searchInput` (State): Cập nhật tức thì (0ms) để người dùng gõ phím mượt mà, chữ hiện ngay.
  - `searchTimerRef` (`useRef`): Giữ ID bộ đếm thời gian xuyên suốt các lần render mà không gây re-render thừa.
- **Cơ chế hoạt động:**
  - Mỗi khi gõ 1 phím mới: Hủy bộ hẹn giờ cũ bằng `clearTimeout`.
  - Thiết lập bộ hẹn giờ mới 500ms.
  - Chỉ khi người dùng **dừng tay đủ 500ms**, hàm `updateParams` mới đẩy từ khóa lên URL ➡️ TanStack Query chỉ gọi API **đúng 1 lần duy nhất**!

> 🎤 **Câu thoại thuyết trình ngắn gọn:**  
> *"Nhóm tự xây dựng cơ chế Debounce 500ms bằng `useRef` và `setTimeout`. Kỹ thuật này giúp ô input phản hồi mượt mà cho người dùng, đồng thời cắt giảm đến hơn 90% số lượng request dư thừa lên server."*

---

## 🎯 TỔNG KẾT BẢNG SO SÁNH NHANH KHI ĐƯỢC GIẢNG VIÊN HỎI

| Kỹ thuật | Thay thế cho cách làm cũ nào? | Lợi ích lớn nhất mang lại |
| :--- | :--- | :--- |
| **JWT + Interceptor** | Truyền token thủ công vào từng hàm axios | Tự động hóa 100%, code gọn gàng |
| **Refresh Token Queue** | Bắt người dùng đăng nhập lại khi token hết hạn | Giữ phiên đăng nhập xuyên suốt, không gián đoạn |
| **Route Guards (RBAC)** | `if/else` kiểm tra role trong từng component | Bảo vệ tập trung tại Router, ngăn chặn truy cập trái phép |
| **TanStack Query** | `useState` + `useEffect` + cờ `isLoading` | Có sẵn Caching, hỗ trợ `keepPreviousData` chống nháy trang |
| **Debounce Search** | Bắt sự kiện `onChange` gọi API ngay | Chống spam server, tối ưu hiệu năng mạng |
