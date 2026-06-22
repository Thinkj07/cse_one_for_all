# TO-DO CHI TIẾT ASSIGNMENT 4 CODE GENERATION - TyC Compiler

Mục tiêu của file này: hướng dẫn từng bước để hoàn thành Assignment 4 đúng theo đặc tả TyC, không suy diễn ngoài 2 tài liệu chuẩn:
- `tyc_specification.md`
- `tyc-semantic_constraints_and_errors.md`

Lưu ý quan trọng:
- TyC là ngôn ngữ riêng của môn học, không phải C/C++.
- Code generation chỉ xử lý AST đã qua semantic checker.
- Pipeline bắt buộc: `AST -> .j (Jasmin) -> .class -> chạy trên JVM`.

---

## 0 Chốt phạm vi và tiêu chuẩn đạt

- [x] Đọc lại yêu cầu Assignment 4 trong `README.md` (167-203).
- [x] Xác nhận 4 tiêu chí đánh giá:
  - Đúng và đủ `CodeGenerator` + `Emitter`.
  - File `.j` assemble được bằng `jasmin.jar`.
  - Chạy được trên JVM với runtime `io`.
  - Test codegen bao phủ tốt, output đúng.
- [x] Xác nhận built-in I/O chỉ gồm: `readInt`, `readFloat`, `readString`, `printInt`, `printFloat`, `printString`.

---

## 1 Khảo sát code nền hiện tại (bắt buộc)

- [x] Đọc kỹ:
  - `src/codegen/codegen.py`
  - `src/codegen/emitter.py`
  - `src/codegen/frame.py`
  - `src/codegen/utils.py`
  - `src/codegen/io.py`
  - `src/codegen/jasmin_code.py`
- [x] Đọc cơ chế test:
  - `tests/utils.py` (`CodeGenerator.generate_and_run`)
  - `tests/test_codegen.py`
- [x] Ghi rõ phần đã có/chưa có trong `codegen.py`:
  - Đã có: function cơ bản, var decl, expr stmt, if, while, return, assign cho identifier, literal, func call, binary op một phần.
  - Chưa có đầy đủ: `for`, `switch/case/default`, `break`, `continue`, `prefix/postfix`, `member access`, `struct literal`, assign vào member, short-circuit logic.
- [x] Nắm chắc `Frame`:
  - `enter_scope/exit_scope`
  - `enter_loop/exit_loop`
  - `get_continue_label/get_break_label`

---

## 2 Chốt mapping AST -> Jasmin theo spec

- [ ] Lập bảng mapping từng node AST sang instruction Jasmin.
- [ ] Chốt descriptor kiểu:
  - `int -> I`
  - `float -> F`
  - `string -> Ljava/lang/String;`
  - `void -> V`
  - `struct -> L<StructName>;`
- [ ] Chốt thứ tự đánh giá:
  - biểu thức nhị phân: trái trước, phải sau.
  - tham số hàm: trái sang phải.
  - `&&`, `||`: short-circuit.
- [ ] Không tạo quy tắc suy diễn type mới ngoài checker.

---

## 3 Hoàn thiện `Emitter`

### 3.1 Lệnh cơ bản
- [ ] Đảm bảo load/store cho `int`, `float`, reference.
- [ ] Đảm bảo push constant int/float/string đúng JVM (escape string đúng).
- [ ] Đảm bảo arithmetic, relational, return đầy đủ.

### 3.2 Điều khiển luồng
- [ ] Có helper label/goto/if-true/if-false rõ ràng.
- [ ] Có helper cho short-circuit:
  - `&&`: trái false thì trả 0 ngay.
  - `||`: trái true thì trả 1 ngay.
  - `!`: đảo 0/non-zero thành 1/0.

### 3.3 Struct/object
- [ ] Có helper tạo object struct (`new`, `<init>`), `getfield`, `putfield`.
- [ ] Descriptor field phải đúng type của member.

### 3.4 Stack và local
- [ ] Mọi helper cập nhật đúng `frame.push()/pop()`.
- [ ] Rà soát các lệnh dễ lệch stack (invoke, compare, field put/get).
- [ ] `.limit stack` và `.limit locals` phải chính xác sau mỗi method.

---

## 4 Hoàn thiện `CodeGenerator` theo nhóm node

### 4.1 Chuẩn bị toàn chương trình
- [ ] Quét trước program để thu thập function signatures và metadata struct.
- [ ] Nạp built-in từ `IO_SYMBOL_LIST`.
- [ ] Phát sinh class chính `TyC` và class struct (nếu kiến trúc tách riêng struct class).

### 4.2 Declaration
- [ ] `visit_func_decl`:
  - tạo frame mới,
  - cấp local slot cho tham số,
  - quản lý start/end label đúng scope,
  - xử lý `main` theo JVM: `([Ljava/lang/String;)V`.
- [ ] `visit_var_decl`:
  - cấp slot local,
  - emit init nếu có,
  - xử lý đúng biến explicit type và `auto` đã được checker cố định.

### 4.3 Statement
- [ ] `visit_block_stmt`: giữ đúng phạm vi biến.
- [ ] `visit_if_stmt`: nhãn then/else/end chuẩn.
- [ ] `visit_while_stmt`: hỗ trợ vòng lặp + break/continue.
- [ ] `visit_for_stmt`: xử lý init/cond/update (đều có thể thiếu), cond thiếu coi như true.
- [ ] `visit_switch_stmt`, `visit_case_stmt`, `visit_default_stmt`: hỗ trợ fall-through đúng spec.
- [ ] `visit_break_stmt`: thoát loop/switch đúng ngữ cảnh.
- [ ] `visit_continue_stmt`: nhảy về continue label của loop gần nhất.
- [ ] `visit_return_stmt`: opcode return đúng return type.

### 4.4 Expression
- [ ] `visit_binary_op`: arithmetic, relational, logical (`&&`, `||` đúng type + short-circuit.
- [ ] `visit_prefix_op`: unary `+ - !`, và `++ --` cho operand hợp lệ.
- [ ] `visit_postfix_op`: `x++`, `x--`, `obj.f++`, `obj.f--` đúng semantics postfix.
- [ ] `visit_assign_expr`: lhs là `Identifier` hoặc `MemberAccess`, assignment expression trả về giá trị sau gán.
- [ ] `visit_member_access`: đọc/ghi field đúng theo metadata struct.
- [ ] `visit_struct_literal`: tạo object và gán member đúng thứ tự khai báo struct.
- [ ] `visit_func_call`: đẩy args trái->phải rồi invoke static.

---

## 5 Kiểm thử trong lúc làm

- [ ] Sau mỗi cụm tính năng lớn, chạy `python run.py test-codegen`.
- [ ] Nếu lỗi, phân loại nhanh:
  - `Code generation error`
  - `Assembly error`
  - `Runtime error`
- [ ] Khi cần, mở `.j` trong `src/runtime` để so nhãn điều khiển, stack discipline, descriptor.
- [ ] Tạo test AST tối thiểu để cô lập lỗi khó.

---

## 6 Viết đủ 100 test cho `tests/test_codegen.py`

Nguyên tắc:
- [ ] Mỗi test kiểm tra output cuối cùng (`generate_and_run`).
- [ ] Mỗi test nên ngắn và rõ 1 mục tiêu.
- [ ] Bao phủ đúng spec, không vượt spec.

Gợi ý phân bổ:
- [ ] 1-10: I/O cơ bản, literal, var/assign cơ bản.
- [ ] 11-20: arithmetic int/float, `%`, biểu thức hỗn hợp.
- [ ] 21-30: relational, logical, `!`, short-circuit.
- [ ] 31-40: if/else (kể cả lồng nhau).
- [ ] 41-50: while + break + continue.
- [ ] 51-60: for (kể cả init/cond/update optional).
- [ ] 61-70: switch/case/default + fall-through + break.
- [ ] 71-80: function call, nested call, return nhiều kiểu.
- [ ] 81-90: prefix/postfix trên biến và member.
- [ ] 91-100: struct declaration/use, member read-write, struct assignment, struct literal.

Checklist chất lượng:
- [ ] Có edge cases: số âm, 0, float, block rỗng, switch rỗng, loop không vào vòng.
- [ ] Có test thứ tự đánh giá trái->phải.
- [ ] Có test short-circuit không đánh giá vế phải khi không cần.
- [ ] Có test assignment expression chaining (`x = y = ...`).

---

## 7 Đối chiếu tuân thủ 2 spec trước khi chốt

- [ ] Đối chiếu `tyc_specification.md`:
  - type system và operator typing,
  - semantics if/while/for/switch,
  - struct/member access,
  - built-in I/O,
  - evaluation order và short-circuit.
- [ ] Đối chiếu `tyc-semantic_constraints_and_errors.md`:
  - codegen giả định AST đã semantic-valid,
  - không thêm coercion trái luật,
  - không mở rộng hành vi ngoài đặc tả.

---

## 8 Chạy xác nhận cuối cùng

- [ ] Chạy:
  - `python run.py build`
  - `python run.py test-codegen`
- [ ] Trên Windows 11:
  - đảm bảo `java`/`javac` có trong PATH,
  - đảm bảo runtime `io.class` sẵn sàng (harness có hỗ trợ compile khi thiếu).
- [ ] Xác nhận:
  - không còn assembly/runtime error,
  - đủ 100 test codegen và output đúng kỳ vọng,
  - mã nguồn rõ ràng, dễ bảo trì.

---

## 9 Thứ tự triển khai khuyến nghị

- [ ] Bước 1: hoàn thiện `Emitter`.
- [ ] Bước 2: hoàn thiện expression generation.
- [ ] Bước 3: hoàn thiện control-flow statements.
- [ ] Bước 4: hoàn thiện struct generation.
- [ ] Bước 5: bổ sung/chốt đủ 100 test.
- [ ] Bước 6: chạy regression toàn bộ và sửa lỗi còn lại.

Đi theo thứ tự này giúp giảm lỗi dây chuyền và bám sát yêu cầu Assignment 4.
