# BÁO CÁO KỸ THUẬT FRONTEND: CÁC GIẢI PHÁP VÀ KỸ THUẬT NỔI BẬT
**Hệ thống:** Quản lý Nhân sự & Phân quyền (HRM & RBAC System)  
**Công nghệ:** React 19, TypeScript, React Router v7, TanStack Query v5, Axios, HeroUI

---

## 1. JWT (JSON Web Token) & Axios Request Interceptor

* **Tại sao dự án lại chọn JWT (Thay vì Session/Cookie truyền thống)?**  
  1. **Phù hợp kiến trúc SPA & RESTful API (Tách rời Frontend - Backend):**  
     Frontend (React - Port 5173) và Backend (Bun - Port 3000) hoạt động độc lập. Nếu dùng Session Cookie truyền thống, hệ thống sẽ gặp nhiều rắc rối phức tạp về CORS, chính sách `SameSite` và chia sẻ cookie giữa các domain/port. JWT giải quyết triệt để vấn đề này vì token được truyền qua Header HTTP tiêu chuẩn.
  2. **Kiến trúc không trạng thái (Stateless & High Scalability):**  
     Server không cần tốn bộ nhớ RAM hay Database (Redis) để lưu trữ phiên của hàng ngàn người dùng như Session. Bản thân JWT là *Self-contained* (tự chứa các thông tin cần thiết như `userId`, `role`, hạn dùng). Server chỉ cần xác thực chữ ký số (Signature) là hợp lệ.
  3. **Tối ưu cho mô hình phân quyền RBAC:**  
     Thông tin quyền hạn (`role`) được đóng gói ngay trong Payload của JWT, giúp hệ thống kiểm tra và áp dụng quyền tức thì mà không phải liên tục truy vấn lại cơ sở dữ liệu.
  4. **Miễn nhiễm với tấn công CSRF:**  
     Khác với Cookie (vốn tự động đính kèm trong mọi request từ trình duyệt và dễ bị tấn công Cross-Site Request Forgery), JWT được lưu trữ và đính kèm thủ công qua Header `Authorization`, giúp ứng dụng an toàn hơn trước các cuộc tấn công giả mạo yêu cầu.

* **Vấn đề đặt ra phía Frontend (Problem):**  
  Khi sử dụng JWT, mọi API được bảo vệ đều yêu cầu phải có token trong Header. Nếu không có cơ chế quản lý tập trung, lập trình viên sẽ phải truyền thủ công `Authorization: Bearer <token>` vào từng hàm gọi API, gây lặp code và rất dễ bỏ sót dẫn đến lỗi 401.

* **Cách giải quyết phía Frontend (Solution):**  
  Sau khi đăng nhập thành công, `accessToken` được lưu trữ tại `localStorage`. Dự án sử dụng **Axios Request Interceptor** (`src/lib/http.ts`) để can thiệp tập trung vào mọi HTTP request trước khi rời Client, tự động đính kèm tiêu đề:  
  `Authorization: Bearer <accessToken>`.

* **Giá trị mang lại (Value):**  
  Tự động hóa 100% quy trình xác thực phía Client, đảm bảo mọi request hợp lệ mà không cần viết lặp code ở từng component, đồng thời tối ưu hiệu năng và độ tin cậy của toàn hệ thống.

---

## 2. Refresh Token Queue kết hợp Axios Response Interceptor

* **Vấn đề đặt ra (Problem):**  
  Nhằm đảm bảo an toàn, `accessToken` được thiết lập thời gian sống ngắn (15 phút). Khi token hết hạn, các request đồng thời (ví dụ: khi vừa tải trang có 3–4 API cùng chạy) đều sẽ nhận lỗi `401 Unauthorized`. Nếu cả 4 request này cùng lúc gọi API refresh token, cơ chế *Refresh Token Rotation* ở Backend sẽ coi đây là hành vi dùng lại token cũ (bị xâm nhập) và lập tức vô hiệu hóa phiên, khiến người dùng bị văng ra trang Login bất thường.

* **Cách giải quyết (Solution):**  
  Áp dụng **Axios Response Interceptor** kết hợp cơ chế **Cờ khóa (`isRefreshing`) và Hàng đợi (`failedQueue`)** trong `src/lib/http.ts`:
  1. Request đầu tiên gặp lỗi 401 sẽ bật cờ `isRefreshing = true` và trực tiếp gọi API `/auth/refresh`.
  2. Các request gặp lỗi 401 theo sau sẽ không gọi refresh nữa mà được đẩy vào hàng đợi dưới dạng các `Promise` chờ.
  3. Khi có `accessToken` mới: Hệ thống giải phóng hàng đợi, gán token mới cho toàn bộ các request đang chờ và tự động thực thi lại (retry).

* **Tại sao sử dụng (Why):**  
  Giải quyết triệt để lỗi xung đột (Race Condition) khi làm mới token. Duy trì phiên làm việc liên tục (Seamless Session), người dùng không bị gián đoạn hay bị văng ra màn hình đăng nhập.

---

## 3. RBAC (Role-Based Access Control) trên Frontend

* **Vấn đề đặt ra (Problem):**  
  Hệ thống HRM có 2 nhóm đối tượng: **Admin** (toàn quyền quản trị nhân sự, xem lương) và **Employee** (chỉ có quyền xem và cập nhật thông tin cá nhân). Cần một kiến trúc phân quyền tập trung ở Frontend để phân tách ranh giới dữ liệu và chức năng giữa 2 vai trò này.

* **Cách giải quyết (Solution):**  
  Phân quyền dựa trên thuộc tính `user.role` nhận về từ API `/auth/me`. Dữ liệu này được quản trị tập trung thông qua `AuthContext` (`src/contexts/AuthContext.tsx`) và phân phối xuống toàn bộ cây component trong ứng dụng.

* **Tại sao sử dụng (Why):**  
  Chuẩn hóa cấu trúc phân quyền ngay từ tầng Client, giúp code sáng sủa, dễ kiểm soát và sẵn sàng mở rộng thêm các vai trò mới (như `Manager`, `HR`) trong tương lai mà không làm vỡ cấu trúc hiện tại.

---

## 4. Phân Quyền Admin & Employee (Route Guards & Dynamic UI)

* **Vấn đề đặt ra (Problem):**  
  Người dùng có vai trò `employee` có thể cố tình truy cập trái phép bằng cách nhập trực tiếp URL quản trị trên thanh địa chỉ (ví dụ: `/employees`). Bên cạnh đó, nếu giao diện vẫn hiển thị các nút chức năng quản trị (như nút Thêm, Xóa nhân viên) cho Employee thì trải nghiệm người dùng sẽ bị sai lệch.

* **Cách giải quyết (Solution):**  
  Triển khai bảo mật 2 lớp độc lập:
  - **Lớp 1 - Route Guards (`routes.tsx`, `src/components/`):** Sử dụng các component bọc tuyến đường:
    - `<ProtectedRoute>`: Yêu cầu đăng nhập.
    - `<AdminRoute>`: Kiểm tra nếu `user.role !== 'admin'` sẽ lập tức điều hướng (redirect) về `/profile`.
    - `<GuestRoute>`: Ngăn người đã đăng nhập quay lại màn hình Login.
    - `<RootRedirect>`: Tự động chuyển hướng trang chủ (`/`) sang `/employees` (cho Admin) hoặc `/profile` (cho Employee).
  - **Lớp 2 - Dynamic UI:** Menu "Nhân sự" trong `Layout.tsx` và các nút hành động (Xóa/Sửa) chỉ được render khi thỏa mãn điều kiện vai trò hợp lệ.

* **Tại sao sử dụng (Why):**  
  Ngăn chặn triệt để hành vi truy cập trái phép từ thanh địa chỉ URL, đồng thời giữ giao diện trực quan, tinh gọn và đúng thẩm quyền của từng đối tượng.

---

## 5. Quản lý Server State & Caching với TanStack Query v5 (`keepPreviousData`)

* **Vấn đề đặt ra (Problem):**  
  Khi quản lý dữ liệu từ Server bằng `useState` và `useEffect` truyền thống:
  - Không có bộ nhớ đệm (Cache), dẫn đến việc gọi API trùng lặp gây hao tổn băng thông.
  - Khi người dùng bấm chuyển trang phân trang hoặc thay đổi bộ lọc, dữ liệu trang cũ bị xóa trước khi dữ liệu trang mới tải xong, gây ra hiện tượng **nhấp nháy trắng màn hình (layout flicker/shift)** rất khó chịu.

* **Cách giải quyết (Solution):**  
  Sử dụng TanStack Query v5 để quản lý toàn bộ dữ liệu máy chủ:
  - Lưu cache tự động theo `queryKey`: `["users", { page, limit, search, department, role, status, sortBy, order }]`.
  - Sử dụng cấu hình `placeholderData: keepPreviousData`: Khi đổi trang hoặc đổi bộ lọc, dữ liệu cũ vẫn hiển thị cố định trên màn hình cho đến khi dữ liệu mới tải xong mới thực hiện thay thế.

* **Tại sao sử dụng (Why):**  
  Loại bỏ 100% hiện tượng nháy giật giao diện khi phân trang, mang lại trải nghiệm mượt mà như ứng dụng Desktop. Tốc độ phản hồi tức thì (0ms) khi người dùng duyệt lại các trang đã được lưu trong Cache.

---

## 6. Tối Ưu Tìm Kiếm với Kỹ Thuật Debounce (`useRef` + `setTimeout`)

* **Vấn đề đặt ra (Problem):**  
  Nếu kích hoạt gọi API ngay theo từng sự kiện gõ phím (`onChange`), khi người dùng nhập một từ khóa gồm 10 ký tự, hệ thống sẽ gửi liên tiếp 10 request lên Server trong vài giây. Hậu quả là gây lãng phí tài nguyên, quá tải Server và tiềm ẩn nguy cơ sai lệch thứ tự phản hồi của dữ liệu mạng (Race Condition).

* **Cách giải quyết (Solution):**  
  Xây dựng giải pháp Debounce trực tiếp bên trong component bằng `useRef` và `setTimeout`:
  - `searchInput` (State): Cập nhật tức thì (0ms) để ô nhập liệu luôn mượt mà khi gõ.
  - `searchTimerRef` (`useRef`): Lưu giữ định danh bộ đếm thời gian xuyên suốt các lần re-render mà không gây render thừa.
  - Mỗi khi có phím mới được gõ, bộ hẹn giờ cũ bị hủy bằng `clearTimeout`. Chỉ khi người dùng **ngừng gõ đủ 500ms**, hệ thống mới đẩy tham số lên URL (`updateParams`) để kích hoạt TanStack Query gọi API đúng 1 lần duy nhất.

* **Tại sao sử dụng (Why):**  
  Cắt giảm hơn 90% số lượng request dư thừa lên Server, giải quyết triệt để xung đột phản hồi mạng nhưng vẫn đảm bảo trải nghiệm nhập liệu tức thì cho người dùng.

---

## BẢNG TỔNG HỢP SO SÁNH KỸ THUẬT

| STT | Kỹ thuật áp dụng | Vấn đề giải quyết | Giá trị mang lại |
| :---: | :--- | :--- | :--- |
| **1** | **JWT & Axios Request Interceptor** | Quản lý phiên không trạng thái, loại bỏ việc truyền token thủ công | Xác thực tập trung, bảo mật, code sạch |
| **2** | **Refresh Token Queue Interceptor** | Tránh xung đột (Race Condition) và lỗi văng phiên khi làm mới token | Trải nghiệm đăng nhập liên tục (Seamless Session) |
| **3** | **RBAC (Role-Based Access Control)** | Phân định ranh giới chức năng và dữ liệu giữa Admin và Employee | Kiểm soát quyền hạn tập trung, chuẩn kiến trúc |
| **4** | **Route Guards & Dynamic UI** | Chặn nhập URL trực tiếp và ẩn các nút thao tác ngoài quyền hạn | Bảo mật 2 lớp, giao diện đúng thẩm quyền |
| **5** | **TanStack Query (`keepPreviousData`)**| Khắc phục nháy trắng màn hình khi đổi trang và tối ưu Cache | Trải nghiệm phân trang êm ái, giảm tải cho Server |
| **6** | **Debounce Search (`useRef`)** | Chặn spam hàng loạt request khi người dùng đang nhập từ khóa | Tiết kiệm tài nguyên mạng, ngăn lỗi sai lệch dữ liệu |
