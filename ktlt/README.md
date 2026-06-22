# KTLT_CO1027_232 - Kỹ Thuật Lập Trình

Đây là repository lưu trữ các Bài Tập Lớn (Assignment) cho môn học **Kỹ Thuật Lập Trình (CO1027)** - Học kỳ 232.

## Giới thiệu
Dự án mô phỏng trò chơi "Sherlock: A Study in Pink" bằng ngôn ngữ C++. Chương trình tái hiện cuộc truy đuổi giữa Sherlock, Watson và tên tội phạm trong một mê cung.

## Cấu trúc dự án

### 1. Assignment 1
- **Thư mục:** `Assignment1/`
- **Mô tả:** Phần 1 của dự án, tập trung vào các xử lý logic cơ bản, thao tác với hàm và dữ liệu sơ cấp trong C++.

### 2. Assignment 2
- **Thư mục:** `Assignment2/`
- **Mô tả:** Phần 2 mở rộng sử dụng **Lập trình hướng đối tượng (OOP)**.
- **Các tính năng chính:**
  - **Kiến trúc lớp:** Xây dựng hệ thống các class `Sherlock`, `Watson`, `Criminal`, `Robot`, `Map`...
  - **Hệ thống vật phẩm:** Quản lý các `Item` (thuốc hồi máu, thẻ bài...) và `Bag` (túi đồ danh sách liên kết).
  - **Logic game:** Xử lý di chuyển, va chạm và điều kiện thắng/thua.

## Yêu cầu hệ thống
- **Ngôn ngữ:** C++ (Chuẩn C++11 trở lên).
- **Trình biên dịch:** g++ (GNU Compiler Collection).

## Hướng dẫn biên dịch & Chạy
Ví dụ để chạy Assignment 2:

1. Di chuyển vào thư mục `Assignment2/intial`:
   ```bash
   cd Assignment2/intial
   ```
2. Biên dịch chương trình:
   ```bash
   g++ -o main main.cpp study_in_pink2.cpp -I . -std=c++11
   ```
3. Chạy chương trình:
   ```bash
   # Trên Windows
   ./main.exe
   
   # Trên Linux/MacOS
   ./main
   ```

