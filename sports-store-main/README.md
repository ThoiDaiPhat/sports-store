# 🏆 SportStore — Hệ Thống Phân Phối Đồ Thể Thao Cao Cấp

SportStore là ứng dụng thương mại điện tử chuyên nghiệp được xây dựng trên nền tảng **Next.js 16 (Turbopack)**, **Prisma ORM**, **MySQL** (lưu trữ cloud qua Railway), **Zustand** (quản lý state), và styling bằng **Tailwind CSS**. Dự án đã được nâng cấp toàn diện các tính năng nghiệp vụ thương mại điện tử nâng cao và tối ưu hóa trải nghiệm người dùng.

🚀 **Link Demo Web:** [https://sports-store-three.vercel.app/](https://sports-store-three.vercel.app/)

---

## 🔑 Tài Khoản Demo Test Hệ Thống
Để hỗ trợ việc chấm điểm và test nhanh, hệ thống đã được seed sẵn các tài khoản demo sau (tất cả đều đã được xác minh email mặc định):

*   **Tài khoản Quản trị (Admin):**
    *   **Email:** `admin@sportstore.com`
    *   **Mật khẩu:** `admin123`
*   **Tài khoản Người dùng (User):**
    *   **Email:** `user@sportstore.com`
    *   **Mật khẩu:** `user123`

---

## ✨ Các Tính Năng Nghiệp Vụ Nâng Cao Đã Triển Khai

### 📦 1. Quản lý Tồn Kho Theo Biến Thể Chi Tiết (Product Variants)
*   **Mô hình 1-N:** Mỗi sản phẩm (`Product`) liên kết trực tiếp với nhiều biến thể (`ProductVariant`) theo từng cặp **Size - Màu sắc** cụ thể và có mã **SKU duy nhất**.
*   **Trừ kho tự động (Stock Deduction):** Khi khách hàng đặt mua biến thể cụ thể (ví dụ: Size 40 - Đen), hệ thống sẽ trừ chính xác số lượng trong database. Nếu hết hàng, hệ thống khóa tính năng thêm vào giỏ và thanh toán cho riêng biến thể đó.
*   **Giao dịch an toàn (DB Transaction):** Quá trình đặt hàng và trừ kho được gói gọn trong Prisma Transaction. Nếu một sản phẩm trong giỏ bị hết hàng giữa chừng, toàn bộ đơn hàng sẽ tự động hủy (Rollback) để tránh lỗi dữ liệu.

### 🏷️ 2. Hệ Thống Mã Giảm Giá Ràng Buộc Cao Cấp (Coupon Validation)
*   **Đơn tối thiểu (`minOrderAmount`):** Mã giảm giá chỉ áp dụng khi tổng giá trị giỏ hàng đạt điều kiện tối thiểu.
*   **Giới hạn trần giảm giá (`maxDiscountAmount`):** Giới hạn số tiền được giảm tối đa của mã. (Ví dụ: Giảm 10% tối đa 100k, đơn hàng 2 triệu sẽ chỉ giảm đúng 100k thay vì 200k).
*   **Giới hạn số lần dùng (`usageLimit`):** Mỗi mã giảm giá có tổng số lần được phép áp dụng trên hệ thống. Khi đạt giới hạn, mã sẽ tự động khóa.

### 💳 3. Quy Trình Thanh Toán & Tự Động Hủy Đơn Hàng (Order Cancellation)
*   **Tự hủy đơn (Cancel Order):** Khách hàng có thể tự hủy các đơn hàng đang ở trạng thái chờ xử lý (`PENDING`) trực tiếp từ lịch sử đơn hàng.
*   **Hoàn kho tự động:** Khi hủy đơn thành công, hệ thống tự động cộng ngược số lượng sản phẩm vào kho của từng biến thể tương ứng.
*   **Webhook Thanh Toán giả lập:** Tích hợp API Webhook `/api/webhooks/payment` nhận tín hiệu thanh toán online từ cổng thanh toán để tự động chuyển trạng thái đơn hàng sang `PROCESSING` (Đang xử lý) và trạng thái thanh toán sang `PAID` (Đã thanh toán).

### 📧 4. Tích Hợp Email Xác Nhận & Đặt Lại Mật Khẩu (Resend Email Integration)
*   **Gửi mail giao dịch:** Hệ thống tự động gửi email thông báo chi tiết khi **Đặt hàng thành công** và **Hủy đơn hàng**.
*   **Luồng Quên Mật Khẩu:**
    *   Người dùng yêu cầu đặt lại mật khẩu tại `/forgot-password`.
    *   Hệ thống gửi email chứa liên kết bảo mật có thời hạn 1 giờ.
    *   **Debug Mode cho Reviewer:** Do giới hạn Sandbox của tài khoản Resend dùng thử (chỉ gửi được tới email đăng ký Resend), hệ thống sẽ tự động hiển thị trực tiếp đường link đặt lại mật khẩu trên màn hình (UI) để người chấm điểm có thể bấm trực tiếp và trải nghiệm đổi mật khẩu mà không bị chặn.

### 🛡️ 5. Xác Thực Bảo Mật Đăng Ký & Đăng Nhập
*   **NextAuth v5 (Auth.js):** Xác thực phân quyền người dùng và admin an toàn qua JWT Session.
*   **Auto-Verified khi Đăng Ký:** Người dùng đăng ký mới được tự động đánh dấu đã xác minh email (`emailVerified: true`) để có thể đăng nhập test ngay mà không bị chặn gửi OTP (vẫn lưu trữ các trang và API xác thực OTP 6 số trong source code để tham khảo).

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dưới Máy Local

### 1. Chuẩn bị biến môi trường (Environment Variables)
Tạo file `.env` ở thư mục gốc của dự án với các cấu hình tương tự như sau:
```env
# Database MySQL (Ví dụ kết nối Cloud hoặc Local XAMPP)
DATABASE_URL="mysql://username:password@localhost:3306/sports_store"

# Cấu hình NextAuth
NEXTAUTH_SECRET="sports-store-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="sports-store-super-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cấu hình ngân hàng hiển thị VietQR thanh toán
NEXT_PUBLIC_BANK_ID="VCB"
NEXT_PUBLIC_BANK_ACCOUNT="1029384756"
NEXT_PUBLIC_BANK_NAME="SPORTSTORE VIETNAM"

# Dịch vụ gửi Email Resend (Đăng ký tại resend.com, để trống sẽ tự chạy Mock ghi log ra Console)
RESEND_API_KEY=""
EMAIL_FROM="SportStore <onboarding@resend.dev>"
```

### 2. Các bước khởi chạy dự án
Chạy lần lượt các lệnh sau trong terminal:

```bash
# 1. Cài đặt các thư viện cần thiết
npm install

# 2. Tạo bảng và đồng bộ Database cấu trúc mới
npx prisma db push

# 3. Tạo dữ liệu mẫu (Seeding: Admin, User, Sản phẩm, Biến thể, Đơn hàng mẫu 7 ngày gần nhất)
npx prisma db seed

# 4. Khởi động máy chủ phát triển
npm run dev
```
Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000) để bắt đầu trải nghiệm!
