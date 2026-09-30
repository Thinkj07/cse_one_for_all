# Hệ cơ sở dữ liệu

Thư mục này chứa đồ án xây dựng một nền tảng tuyển dụng, kết nối ứng viên với doanh nghiệp và các vị trí việc làm.

## Chức năng chính

- Hiển thị thống kê, danh mục công việc và các công ty nổi bật.
- Đăng ký, đăng nhập và xác thực cho ứng viên và doanh nghiệp.
- Tìm kiếm, lọc và quản lý tin tuyển dụng.
- Quản lý hồ sơ người dùng, công ty và thông tin ứng tuyển.
- Cung cấp API cho frontend thông qua backend Express.

## Cấu trúc thư mục

- [`be/`](be/): Backend API.
  - `src/routes/`: Định nghĩa các endpoint.
  - `src/controllers/`: Xử lý request và response.
  - `src/services/`: Logic nghiệp vụ.
  - `src/models/`: Tương tác với dữ liệu.
  - `src/config/`: Cấu hình ứng dụng và cơ sở dữ liệu.
  - [`README.md`](be/README.md): Danh sách API hiện có.
- [`fe/`](fe/): Frontend React.
  - `src/pages/`: Các trang của ứng dụng.
  - `src/components/`: Các component giao diện.
  - `src/services/`: Các lời gọi API.
  - `src/context/`: State dùng chung của ứng dụng.
- `btl2.sql`: Dữ liệu hoặc cấu trúc cơ sở dữ liệu cho bài tập.
- `spec_assignment_1.pdf`, `spec_assignment_2.pdf`: Đặc tả bài tập.
- `report_assignment_1.pdf`, `report_assignment_2.pdf`: Báo cáo bài tập.

## Chạy backend

```bash
cd be
npm install
npm run dev
```

Có thể dùng `npm start` để chạy server mà không bật chế độ tự động khởi động lại. Các biến môi trường cần thiết được mô tả trong [`be/env.example`](be/env.example).

## Chạy frontend

Mở một terminal khác:

```bash
cd fe
npm install
npm start
```

Frontend sử dụng React và gọi các endpoint của backend theo cấu hình trong thư mục `fe/src/config/`.

## Lưu ý

Đây là đồ án phục vụ học tập. Hãy kiểm tra file cấu hình, thông tin kết nối cơ sở dữ liệu và hướng dẫn trong từng phần trước khi chạy ứng dụng. Không đưa mật khẩu hoặc thông tin nhạy cảm thật vào các file cấu hình được commit lên repository.
