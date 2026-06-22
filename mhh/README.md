# 2D Cutting Stock Problem Solver

Hệ thống giải quyết bài toán Cắt vật liệu 2 chiều (2D Cutting Stock Problem) sử dụng Python. Dự án này hỗ trợ các thuật toán tối ưu hóa cắt giảm lãng phí vật liệu, bao gồm Greedy, First-Fit Decreasing (FFD) và Genetic Algorithm (GA).

## Tính năng

- **Greedy Algorithm**: Chiến thuật xếp tham lam (Bottom-Left), ưu tiên lấp đầy tấm hiện tại.
- **First-Fit Decreasing (FFD)**: Sắp xếp các tấm nhỏ theo diện tích giảm dần trước khi cắt để tối ưu hóa không gian.
- **Genetic Algorithm (GA)**: Tìm kiếm thứ tự xếp tối ưu thông qua quá trình tiến hóa (Selection, Crossover, Mutation).
- **Visualization**: Vẽ sơ đồ cắt trực quan sử dụng `matplotlib`.
- **Hỗ trợ xoay**: Tự động xoay tấm nhỏ 90 độ để tìm vị trí vừa vặn.

## Cài đặt

1. **Yêu cầu hệ thống**:
   - Python 3.8 trở lên.
2. **Cài đặt thư viện**:
   ```bash
   pip install -r requirements.txt
   ```

## Hướng dẫn sử dụng


### 1. Case Study 1 

```bash
python main.py --case 1
```

### 2. Case Study 2 

```bash
python main.py --case 2
```

### 3. Genetic Algorithm

```bash
python main.py --case 3
```

## Cấu trúc dự án

```
CuttingStockProject/
│
├── data/                  # Chứa dữ liệu đầu vào (JSON)
│   ├── case_study_1.json
│   └── case_study_2.json
│
├── src/
│   ├── models.py          # Định nghĩa Class Item, Stock
│   ├── utils.py           # Hàm vẽ hình và tính toán
│   └── solvers/           # Các thuật toán giải quyết
│       ├── greedy_solver.py
│       ├── ffd_solver.py
│       └── ga_solver.py
│
├── main.py                # Chương trình chính
├── requirements.txt       # Các thư viện phụ thuộc
└── README.md              # Tài liệu hướng dẫn
```

## Giải thuật

1. **Core Logic**: Sử dụng chiến thuật "Coordinate-based Bottom-Left". Hệ thống duy trì một danh sách các điểm ứng viên (candidate points). Khi đặt một tấm mới, hệ thống kiểm tra va chạm và cập nhật danh sách điểm ứng viên.
2. **FFD**: Các items được sắp xếp giảm dần theo diện tích. Khi cần mở tấm Stock mới (Case 2), hệ thống chọn loại Stock đầu tiên trong danh sách có thể chứa được item đó.
