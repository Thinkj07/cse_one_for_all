# Hệ điều hành

Thư mục này chứa bài tập mô phỏng một hệ điều hành đơn giản bằng C. Mục tiêu là tìm hiểu cách hệ điều hành quản lý CPU, tiến trình và bộ nhớ.

## Nội dung bài tập

Bài tập tập trung vào ba module chính:

- **Scheduler**: Lập lịch và điều phối nhiều tiến trình trên một hoặc nhiều CPU.
- **Synchronization**: Đồng bộ hóa khi các tiến trình cùng truy cập tài nguyên dùng chung.
- **Memory management**: Cấp phát bộ nhớ và chuyển đổi địa chỉ từ bộ nhớ ảo sang bộ nhớ vật lý bằng paging và TLB.

Các tiến trình trong mô phỏng có thể thực hiện những thao tác như tính toán, cấp phát, giải phóng, đọc và ghi bộ nhớ.

## Cấu trúc thư mục

- [`Assignment.md`](Assignment.md): Đề bài và mô tả chi tiết các module cần cài đặt.
- [`Assignment.pdf`](Assignment.pdf): Bản PDF của đề bài.
- [`ossim/`](ossim/): Mã nguồn chương trình mô phỏng hệ điều hành.
  - `include/`: Các file header.
  - `src/`: Mã nguồn C.
  - `input/`: File cấu hình và chương trình mẫu.
  - `output/`: Kết quả mô phỏng mẫu.
  - `Makefile`: Các lệnh biên dịch và dọn dẹp.
- [`to_do.md`](to_do.md): Danh sách các phần cần hoàn thiện hoặc cải tiến.

## Biên dịch và chạy

Di chuyển vào thư mục mã nguồn rồi biên dịch:

```bash
cd ossim
make
```

Sau khi biên dịch, chạy mô phỏng với một file cấu hình trong thư mục `input/`:

```bash
./os input/<ten-file-cau-hinh>
```

Dọn các file sinh ra trong quá trình biên dịch:

```bash
make clean
```

Bài tập sử dụng GCC, pthread và Make. Trên Windows, nên thực hiện trong môi trường có hỗ trợ các công cụ Unix tương ứng, chẳng hạn WSL hoặc MSYS2.
