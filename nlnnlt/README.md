# Nguyên lý ngôn ngữ lập trình

Thư mục này lưu các bài tập lớn về xây dựng trình biên dịch cho ngôn ngữ TyC, một ngôn ngữ dạng C đơn giản phục vụ mục đích học tập.

## Nội dung bài tập

Có 4 bài tập lớn, được triển khai theo các giai đoạn của một trình biên dịch:

1. **Lexer và parser**: Phân tích từ vựng, phân tích cú pháp và xử lý lỗi đầu vào.
2. **Sinh AST**: Chuyển cây phân tích cú pháp thành cây cú pháp trừu tượng.
3. **Phân tích ngữ nghĩa**: Kiểm tra phạm vi, kiểu dữ liệu, suy luận kiểu và các ràng buộc ngữ nghĩa.
4. **Sinh mã**: Sinh mã đích từ AST đã được kiểm tra.

## Cấu trúc thư mục

- [`prac/`](prac/): Các bài thực hành theo từng chủ đề của môn học.
- [`tyc_compiler/`](tyc_compiler/): Mã nguồn trình biên dịch TyC, đặc tả ngôn ngữ, bộ kiểm thử và báo cáo.

## Công nghệ

Phần trình biên dịch sử dụng Python và ANTLR4. Chi tiết về cú pháp, ngữ nghĩa và cách chạy từng bài được mô tả trong các tài liệu README hoặc đặc tả bên trong [`tyc_compiler/`](tyc_compiler/).
