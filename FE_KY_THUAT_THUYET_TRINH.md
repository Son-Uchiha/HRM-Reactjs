# TÀI LIỆU THUYẾT TRÌNH: BẢN DỊCH "DỄ HIỂU NHẤT" VỀ CÁC KỸ THUẬT FRONTEND

> **Mục tiêu:** Giúp bạn hiểu bản chất từng bài toán trong đời thực. Khi hiểu rồi, bạn lên thuyết trình bằng lời văn tự nhiên của mình mà không cần học vẹt!

---

## MỤC LỤC

1. [Kỹ thuật 1: JWT — Chiếc "vòng tay vé vào cổng"](#1-jwt--chiec-vong-tay-ve-vao-cong)
2. [Kỹ thuật 2: Refresh Token Queue — Giải cứu sự cố nghẽn mạng khi hết hạn Token](#2-refresh-token-queue--giai-cuu-su-co-nghen-mang)
3. [Kỹ thuật 3 & 4: RBAC & Phân quyền Admin / Employee — Chốt chặn 3 tầng](#3--4-rbac--phan-quyen-admin--employee)
4. [Kỹ thuật 5: TanStack Query & `keepPreviousData` — Xóa sổ hoàn toàn hiện tượng nháy trắng màn hình](#5-tanstack-query--keepPreviousData)
5. [Kỹ thuật 6: Tìm kiếm với Debounce — Ngăn người dùng "vô tình DDoS" server](#6-tim-kiem-voi-debounce)

---

## 1. JWT — Chiếc "vòng tay vé vào cổng"

### 🎯 Bài toán thực tế là gì?

Khi bạn đăng nhập vào web, làm thế nào để ở các trang sau (như xem hồ sơ, xem bảng lương), Frontend chứng minh được với Backend: _"Tôi chính là người đã đăng nhập thành công lúc nãy"_?

- **Nếu không có JWT:** Mỗi lần bấm chuyển trang hoặc bấm nút, trang web lại phải bắt bạn nhập lại Mật khẩu! Hoặc Server phải mở một cuốn sổ lớn ghi nhớ từng người (Session), nếu có 10.000 người online thì Server sẽ quá tải bộ nhớ.

### 💡 Giải pháp JWT trong dự án:

JWT giống như việc bạn đi công viên nước Đầm Sen / VinWonders:

- Lúc mua vé ở cổng (Login), bảo vệ phát cho bạn một **chiếc vòng tay bằng giấy** (chính là chuỗi `accessToken`).
- Trên vòng tay có đóng con dấu chống giả mạo của công viên, ghi rõ tên bạn và hạn dùng trong ngày.
- Khi bạn sang khu trượt nước hay hồ bơi (gọi API lấy dữ liệu), bạn **không cần xuất trình CCCD hay mật khẩu nữa**, chỉ cần giơ vòng tay ra.

### 🛠️ Áp dụng vào code FE thế nào?

- Khi Login xong: Lưu chiếc vòng tay này vào `localStorage`.
- Để không phải viết tay vòng tay này vào từng hàm gọi API, dự án dùng **Axios Request Interceptor** (`src/lib/http.ts`): Cứ hễ có request nào chuẩn bị bay đi, Interceptor sẽ tự động móc token từ `localStorage` và dán vào Header `Authorization: Bearer <token>`.

---

## 2. Refresh Token Queue — Giải cứu sự cố nghẽn mạng

> ⭐ **ĐÂY LÀ KỸ THUẬT ĂN ĐIỂM CAO NHẤT KHI THUYẾT TRÌNH!**

### 🎯 Bài toán thực tế là gì?

- Chiếc vòng tay `accessToken` ở trên chỉ cho sống **15 phút** thôi. Vì sao? Vì nếu hacker lỡ chụp trộm được token của bạn, sau 15 phút token đó thành rác, hacker không làm gì được nữa ➡️ **Rất an toàn**.
- Nhưng người dùng đang làm việc thì sao? Chẳng lẽ cứ 15 phút lại bắt người ta đăng nhập lại mật khẩu một lần? Khách hàng sẽ đập bàn phím vì ức chế!
- Vì vậy, Backend phát thêm một chiếc thẻ phụ gọi là `refreshToken` (sống tận 7 ngày) cất kín trong tủ, dùng để **đi xin chiếc vòng tay 15 phút mới** mà không cần gõ mật khẩu.

### 💣 Thảm họa "Race Condition" xảy ra khi nào?

Hãy tưởng tượng: Bạn vừa bấm F5 trang Quản lý nhân viên. Trình duyệt gửi **cùng lúc 3 request song song**:

1. Lấy danh sách nhân viên (`GET /api/users`)
2. Lấy thông tin tài khoản của mình (`GET /api/auth/me`)
3. Lấy ảnh đại diện

Đúng lúc đó, vòng tay 15 phút vừa hết hạn!
➡️ **Cả 3 request cùng nhận lỗi `401 Unauthorized` cùng 1 tích tắc!**

**Hậu quả nếu KHÔNG có Hàng đợi (Queue):**

- Cả 3 request cùng tranh nhau gọi API xin cấp lại token mới.
- Nhưng Backend áp dụng cơ chế bảo mật: _"Một Refresh Token chỉ được đổi 1 lần, đổi xong là hủy thẻ cũ"_.
- Khi Request 1 đổi xong, thẻ cũ bị hủy. Request 2 và 3 nhảy vào đòi đổi tiếp ➡️ Backend báo: _"Thẻ này đã bị dùng rồi, nghi ngờ bị hack!"_ ➡️ **Đá văng người dùng ra trang Login ngay lập tức!**

### 💡 Giải pháp Hàng Đợi (Queue Interceptor trong `http.ts`):

Hệ thống giải quyết như một hàng xếp hàng văn minh:

1. Khi gặp lỗi 401, **Request 1 đến trước tiên**: Nó giơ tay hô to: _"Tôi đang đi đổi token mới đây, mấy ông kia đứng lại chờ!"_ (bật cờ `isRefreshing = true`).
2. **Request 2 và 3 đến sau**: Thấy cờ `isRefreshing === true` ➡️ **Ngoan ngoãn đứng vào một Hàng Đợi (`failedQueue`)** và tạm dừng lại (dưới dạng Promise chờ).
3. Khi Request 1 đổi được Token mới về thành công:
   - Nó quay lại hàng đợi, phát token mới cho Request 2 và Request 3.
   - Cả 3 request cùng tự động chạy lại với token mới.
4. **Kết quả:** Người dùng không hề biết có sự cố vừa xảy ra, trang web vẫn load mượt mà, không bị văng ra Login!

---

## 3 & 4. RBAC & Phân quyền Admin / Employee

### 🎯 Bài toán thực tế là gì?

Trong công ty có **Sếp (Admin)** và **Nhân viên (Employee)**:

- Sếp có quyền: Xem danh sách, xem mức lương toàn công ty, thêm nhân viên, đuổi việc (xóa) nhân viên.
- Nhân viên: Chỉ được xem và sửa hồ sơ (Profile) của chính mình. Nếu nhân viên mà vào xem được mức lương của đồng nghiệp thì nội bộ công ty sẽ lục đục!

### 💡 Giải pháp Chốt chặn 3 tầng ở Frontend:

#### 🚪 Tầng 1: Chốt chặn đường link (Route Guard)

- Nếu một nhân viên tò mò, tự gõ trên thanh địa chỉ trình duyệt: `http://localhost:5173/employees` để xem danh sách và lương.
- Component `<AdminRoute>` sẽ chặn ngay tại cửa: Kiểm tra thấy `user.role !== 'admin'` ➡️ **Lập tức đá văng về trang `/profile`**, không cho tải trang nhân sự.

#### 👁️ Tầng 2: Giao diện tàng hình (Dynamic UI)

- Trong thanh menu điều hướng (`Layout.tsx`), code kiểm tra:
  - Nếu là Admin ➡️ Hiển thị menu **"Nhân sự"**.
  - Nếu là Employee ➡️ Ẩn hoàn toàn chữ "Nhân sự", nhân viên không nhìn thấy thì sẽ không tò mò bấm vào.
- Trong bảng nhân sự: Nút **"Xóa"** sẽ bị làm mờ và vô hiệu hóa đối với tài khoản Admin gốc (`user.id === 1`), tránh trường hợp Admin tự tay xóa chính mình làm hệ thống mất quyền quản trị.

#### 🧭 Tầng 3: Điều hướng thông minh (`RootRedirect`)

- Người dùng chỉ cần vào trang chủ `/`:
  - Hệ thống tự check: Là Admin thì đưa sang `/employees`, là Employee thì đưa sang `/profile`. Người dùng không cần phải tự chọn đường dẫn.

---

## 5. TanStack Query & `keepPreviousData`

### 🎯 Bài toán thực tế: Sự khó chịu của cách viết cũ

Trước đây khi bạn dùng `useState` + `useEffect` để phân trang:

1. Bạn đang ở Trang 1 xem danh sách nhân viên.
2. Bạn bấm sang Trang 2: Dữ liệu Trang 1 bị xóa sạch ➡️ Hiện vòng xoay xoay tròn giữa màn hình 1 giây ➡️ Dữ liệu Trang 2 mới hiện lên.
3. Cứ mỗi lần bấm chuyển trang (1 ➡️ 2 ➡️ 3) hay bấm Lọc phòng ban: **Màn hình lại bị nháy trắng và giật một cái**. Trải nghiệm người dùng rất khó chịu và thiếu chuyên nghiệp!

### 💡 Kỹ thuật `placeholderData: keepPreviousData`:

Kỹ thuật này giống như rạp chiếu phim khi đổi cảnh:

- Khi bạn bấm sang Trang 2: TanStack Query **vẫn giữ nguyên bảng dữ liệu của Trang 1 trên màn hình** (không xoay, không nhấp nháy).
- Dưới ngầm, nó âm thầm tải dữ liệu Trang 2.
- Khi dữ liệu Trang 2 về đến nơi, nó nhẹ nhàng thay thế dữ liệu cũ.
- **Kết quả:** Người dùng lật trang mượt mà như lướt app điện thoại, màn hình êm ru 100%!

### 💡 Caching thông minh:

- Nếu bạn xem Trang 1 ➡️ bấm sang Trang 2 ➡️ bấm lại Trang 1: **Dữ liệu hiện ra ngay lập tức 0ms**, không tốn 1 mili-giây nào chờ đợi, vì TanStack Query đã lưu sẵn Trang 1 trong bộ nhớ tạm (Cache).

---

## 6. Tìm kiếm với Debounce

### 🎯 Bài toán thực tế: Ngăn người dùng "vô tình đánh sập server"

Giả sử bạn muốn tìm nhân viên tên: **"Nguyễn Văn An"** (gồm 13 ký tự).

- **Nếu KHÔNG có Debounce:**
  - Bạn gõ chữ `"N"` ➡️ gọi 1 request API tìm chữ "N".
  - Bạn gõ chữ `"g"` ➡️ gọi tiếp 1 request API tìm chữ "Ng".
  - ...Bạn gõ xong chữ `"An"` ➡️ **13 request API liên tiếp dội bom vào server chỉ trong 2 giây!**
- **Thảm họa:** Nếu công ty có 100 người cùng tìm kiếm, server sẽ nhận hàng ngàn request rác cùng lúc và bị nghẽn mạng. Chưa kể, request tìm chữ "N" (chạy chậm) có thể về sau request "Nguyễn Văn An" (chạy nhanh), làm kết quả trên màn hình bị đảo lộn lung tung!

### 💡 Giải pháp Debounce (`useRef` + `setTimeout` 500ms):

Cách hoạt động giống như một người kiên nhẫn lắng nghe:

1. Bạn gõ chữ `"N"`: Hệ thống bật đồng hồ đếm ngược 500ms (nửa giây).
2. Khi đồng hồ chưa kịp hết giờ, bạn gõ tiếp chữ `"g"`: Hệ thống lập tức **hủy đồng hồ cũ, đặt lại đồng hồ 500ms mới**.
3. Bạn cứ gõ liên tục `"Nguyễn Văn An"` thì đồng hồ cứ bị reset liên tục.
4. Đến khi bạn **ngừng tay suy nghĩ đủ 500ms**: Đồng hồ mới chính thức reo chuông ➡️ Gửi đi **đúng 1 request API duy nhất** với từ khóa hoàn chỉnh!

👉 **Kết quả:** Người dùng vẫn gõ chữ mượt mà, nhưng tiết kiệm được **90% số lượng request** gửi lên server!

---

## 🎤 BẢNG TỔNG KẾT DÀNH CHO BẠN KHI LÊN THUYẾT TRÌNH

| Kỹ thuật                                   | Trả lời ngắn gọn: "Dùng để làm gì?"                                                                                              |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **1. JWT**                                 | Như "chiếc vòng tay" vào cổng, giúp xác thực người dùng không trạng thái mà không cần hỏi lại mật khẩu.                          |
| **2. Refresh Token Queue**                 | Cơ chế hàng đợi tự động đổi token mới ngầm khi hết hạn, chống xung đột nhiều API và không làm văng người dùng ra màn hình Login. |
| **3. RBAC & Route Guard**                  | Phân quyền Admin xem quản trị, Employee xem cá nhân. Chặn người dùng tự ý gõ link trên thanh địa chỉ.                            |
| **4. Dynamic UI**                          | Ẩn/hiện menu và nút bấm theo đúng quyền hạn của tài khoản đang đăng nhập.                                                        |
| **5. TanStack Query (`keepPreviousData`)** | Caching dữ liệu và giữ nguyên giao diện cũ khi chuyển trang, loại bỏ hoàn toàn việc nhấp nháy màn hình.                          |
| **6. Debounce Search**                     | Đợi người dùng ngưng gõ 500ms mới gọi API, tránh spam hàng chục request rác lên server.                                          |
