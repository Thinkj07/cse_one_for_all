# Cấu trúc dữ liệu và giải thuật

Thư mục này lưu ba bài tập lớn của môn Cấu trúc dữ liệu và giải thuật. Cả ba bài cùng sử dụng chủ đề mạng nơ-ron và học sâu, đồng thời kế thừa lẫn nhau: Assignment 2 sử dụng nền tảng từ Assignment 1, còn Assignment 3 tiếp tục phát triển từ hai bài trước. Mã nguồn sử dụng C++17 và thư viện `xtensor`.

## Assignment 1 - List, Dataset và DataLoader

Assignment 1 tập trung vào hai nhóm nhiệm vụ: cài đặt danh sách và xây dựng phần nền tảng cho MLP (Multi-Layer Perceptron). Đây là phần nền tảng bắt buộc cho các assignment tiếp theo.

### Nội dung chính

- Cài đặt danh sách liên kết đôi thông qua `DLinkedList`.
- Cài đặt mảng động thông qua `XArrayList`.
- Xây dựng các interface và lớp tiện ích cho thao tác trên list.
- Cài đặt các lớp dataset, bao gồm `Dataset` và `TensorDataset`; đặc tả cũng yêu cầu thiết kế `ImageFolderDataset` cho dữ liệu đọc từ thư mục.
- Cài đặt `DataLoader` để truy xuất dataset theo batch, kích thước batch và tùy chọn xáo trộn.
- Chuẩn bị và chia dữ liệu để đưa vào MLP.
- Cài đặt các lớp và phương thức cần thiết cho **inference** của MLP, chưa tập trung vào quá trình huấn luyện.
- Sử dụng `xtensor` để sinh và thao tác với mảng nhiều chiều.

### Mã nguồn đáng chú ý

- [`Assignment1/include/list/`](Assignment1/include/list/): Các cấu trúc list và chương trình minh họa.
- [`Assignment1/include/ann/dataset.h`](Assignment1/include/ann/dataset.h): Các lớp dataset dạng tensor.
- [`Assignment1/include/ann/dataloader.h`](Assignment1/include/ann/dataloader.h): Bộ nạp dữ liệu theo batch.
- [`Assignment1/main.cpp`](Assignment1/main.cpp): Tạo dữ liệu mẫu, khởi tạo dataset/dataloader và in kích thước từng batch.

## Assignment 2 - Hash, Heap và nền tảng ANN

Assignment 2 gồm hai nội dung độc lập về mặt chấm điểm nhưng có quan hệ phụ thuộc trong mã nguồn. TASK-1 chiếm 40% và TASK-2 chiếm 60% tổng điểm.

### TASK-1 - Hash và Heap (40%)

- Cài đặt `XHashMap` trong `include/hash/xMap.h` dựa trên interface map và danh sách liên kết kép để xử lý các phần tử va chạm.
- Hỗ trợ các thao tác thêm/cập nhật (`put`), truy xuất (`get`), xóa, kiểm tra key/value, lấy danh sách key/value và thống kê va chạm.
- Cài đặt `Heap` trong `include/heap/Heap.h`, hỗ trợ min-heap hoặc max-heap thông qua comparator.
- Hỗ trợ `push`, `pop`, `peek`, `remove`, `contains`, `heapify`, `clear`, tự mở rộng capacity và các thao tác `reheapUp`/`reheapDown`.
- TASK-1 phụ thuộc vào `DLinkedList` của Assignment 1, đặc biệt là backward iterator và các phép toán iterator được yêu cầu trong đặc tả.

Các thư mục [`TASK1 - HASH/`](Assignment2/TASK1%20-%20HASH/) và [`TASK2 - HEAP/`](Assignment2/TASK2%20-%20HEAP/) chứa tài liệu, test case và các bản mã liên quan.

### TASK-2 - Huấn luyện MLP (60%)

- Sử dụng các cấu trúc dữ liệu đã cài đặt để hoàn thiện chức năng **training** cho mạng nơ-ron truyền thẳng nhiều lớp.
- Hoàn thiện các lớp trong thư mục `include/ann` và phần hiện thực tương ứng trong `src/ann`.
- Áp dụng MLP cho các bài toán phân tích dữ liệu như **classification** và **regression**.
- Cập nhật các lớp dataset, dataloader và các thành phần ANN kế thừa từ Assignment 1 khi cần.
- Chỉ thực hiện TASK-2 sau khi TASK-1 và các phần cần thiết của Assignment 1 đã hoạt động đúng.

Đặc tả Assignment 2 nằm trong [`Assignment2/Spec/V1.0/`](Assignment2/Spec/V1.0/). File [`unit_test_relu.cpp`](Assignment2/unit_test_relu.cpp) là một test case liên quan đến phần ANN.

### Khung ANN

Thư mục [`Assignment2/code/`](Assignment2/code/) là mã nguồn được cung cấp cho phần ANN, với các nhóm module:

- `dataset`: Dataset và DataLoader.
- `layer`: Các lớp mạng như fully-connected, ReLU, sigmoid và softmax.
- `loss`: Hàm mất mát.
- `metrics`: Các độ đo đánh giá.
- `model`: Mô hình mạng nơ-ron.
- `optim`: Các thành phần tối ưu hóa phục vụ quá trình training.
- `tensor`: Tiện ích tensor dựa trên `xtensor`.

### Biên dịch

Trong thư mục `Assignment2/code/`, Makefile sử dụng C++17 và tự động biên dịch các file `.cpp` trong `src/`:

```bash
cd Assignment2/code
make
./program
```

Xóa file thực thi và object file bằng `make clean`.

## Assignment 3 - Graph và lan truyền trên mạng nơ-ron

Assignment 3 gồm hai task. Task 1 xây dựng cấu trúc dữ liệu graph; Task 2 sử dụng graph để mô hình hóa và thực hiện các bước forward propagation, backward propagation trong mạng nơ-ron.

### TASK-1 - Cấu trúc graph

- Cài đặt các file `AbstractGraph.h`, `DGraphModel.h` và `UGraphModel.h` trong `include/graph`.
- Xây dựng interface graph theo template, cho phép graph lưu vertex thuộc nhiều kiểu dữ liệu.
- Sử dụng adjacency list để lưu các vertex và edge.
- Hỗ trợ graph có hướng và graph vô hướng, cạnh có thể có trọng số.
- Cài đặt các thao tác thêm/xóa vertex, kết nối/ngắt edge, kiểm tra liên thông, lấy trọng số, lấy cạnh vào/cạnh ra, tính in-degree/out-degree và duyệt graph.
- Hỗ trợ iterator và hàm chuyển graph thành chuỗi để kiểm thử, minh họa.

### TASK-2 - Computational graph và propagation

- Dùng cấu trúc graph để biểu diễn quan hệ giữa các phép tính hoặc node của mạng nơ-ron.
- Thực hiện **forward propagation** theo thứ tự topo để tính đầu ra từ các node đầu vào.
- Thực hiện **backward propagation** bằng cách truyền gradient từ đầu ra về các node trước đó.
- Sử dụng đạo hàm và gradient để cập nhật tham số bằng một phương pháp tối ưu như gradient descent.
- Nội dung này giúp minh họa cách computational graph được dùng trong deep learning; trọng tâm của đặc tả là cấu trúc graph và cơ chế propagation.

### Cấu trúc và dữ liệu đi kèm

- [`Assignment3/include/`](Assignment3/include/): Header của các cấu trúc dữ liệu và thư viện hỗ trợ.
- [`Assignment3/src/`](Assignment3/src/): Phần hiện thực C++.
- [`Assignment3/demo/`](Assignment3/demo/): Các chương trình minh họa graph và các thành phần liên quan.
- [`Assignment3/datasets/`](Assignment3/datasets/): Dữ liệu mẫu.
- [`Assignment3/models/`](Assignment3/models/): Model/checkpoint được cung cấp hoặc sinh ra trong quá trình chạy.
- [`Assignment3/spec3.pdf`](Assignment3/spec3.pdf): Đặc tả chính thức của assignment.

### Biên dịch

Quy trình biên dịch của Assignment 3 tương tự Assignment 2. Makefile sử dụng `g++` với chuẩn C++17, pthread và các header đi kèm:

```bash
cd Assignment3
make
./program
```

Dùng `make clean` để xóa chương trình và thư mục object được tạo trong quá trình build.

## Lưu ý

Ba assignment có quan hệ kế thừa, vì vậy nên hoàn thành theo thứ tự Assignment 1, Assignment 2 rồi Assignment 3. Khi chạy, nên đứng đúng thư mục chứa Makefile tương ứng, biên dịch bằng C++17 và kiểm tra các đường dẫn tương đối trong file cấu hình. Đặc tả yêu cầu kiểm thử bằng các test case mẫu; bài nộp có thể được đánh giá thêm bằng test case ẩn.
