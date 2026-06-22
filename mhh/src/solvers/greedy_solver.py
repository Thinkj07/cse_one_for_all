
from typing import List, Tuple
import time
from ..models import Item, Stock

class GreedySolver:
    def __init__(self):
        pass

    def solve(self, items: List[Item], stock_types: List[Tuple[int, int]]) -> List[Stock]:
        """
        Thuật toán Greedy:
        - Duyệt từng item.
        - Cố gắng đặt vào Stock đang mở (active stock).
        - Nếu không được, mở Stock mới.
        - Không quay lui.
        """
        # Copy items để không ảnh hưởng dữ liệu gốc
        items_to_place = items.copy()
        
        # Danh sách các stock đã sử dụng
        stocks: List[Stock] = []
        
        # Stock hiện tại đang xét (Greedy thường chỉ xét stock cuối cùng hoặc tạo mới)
        # Tuy nhiên để tối ưu hơn một chút mà vẫn giữ tính chất Greedy:
        # Ta sẽ chỉ giữ 1 active stock. Nếu không vừa -> tạo mới.
        
        current_stock = None
        
        # Giả định Case 1: Chỉ có 1 loại kích thước stock (hoặc lấy loại đầu tiên làm mặc định)
        # Nếu có nhiều loại, Greedy đơn giản nhất là chọn loại đầu tiên hoặc loại lớn nhất.
        stock_w, stock_h = stock_types[0] 

        for item in items_to_place:
            placed = False
            
            # 1. Thử đặt vào stock hiện tại (nếu có)
            if current_stock:
                if current_stock.add_item(item):
                    placed = True
            
            # 2. Nếu chưa đặt được -> Tạo stock mới
            if not placed:
                # Nếu active stock cũ không chứa được nữa, nó coi như đã đóng (với Greedy thuần túy)
                # Tạo stock mới
                new_stock = Stock(stock_w, stock_h)
                
                # Thử đặt vào stock mới
                if new_stock.add_item(item):
                    stocks.append(new_stock)
                    current_stock = new_stock # Cập nhật active stock
                    placed = True
                else:
                    # Trường hợp item quá lớn so với stock
                    print(f"Warning: Item {item.id} ({item.width}x{item.height}) fits nowhere!")
        
        return stocks

