
from typing import List, Tuple
from ..models import Item, Stock

class FFDSolver:
    def __init__(self):
        pass

    def solve(self, items: List[Item], stock_types: List[Tuple[int, int]]) -> List[Stock]:
        """
        Thuật toán First-Fit Decreasing (FFD):
        1. Sắp xếp items theo diện tích giảm dần.
        2. Duyệt từng item, thử đặt vào các stock ĐÃ MỞ (theo thứ tự).
        3. Nếu không vừa stock nào, mở stock mới.
        """
        # 1. Sort items decreasing by area
        sorted_items = sorted(items, key=lambda x: x.area, reverse=True)
        
        opened_stocks: List[Stock] = []
        
        for item in sorted_items:
            placed = False
            
            # 2. Try to fit in existing opened stocks
            for stock in opened_stocks:
                if stock.add_item(item):
                    placed = True
                    break
            
            # 3. If not placed, open new stock
            if not placed:
                # Chọn loại stock phù hợp
                # Case 2 có nhiều loại stock. Ta cần chọn loại nào?
                # Chiến thuật: Chọn loại stock ĐẦU TIÊN mà item có thể nhét vừa (để đơn giản)
                # Hoặc chọn loại stock có diện tích nhỏ nhất mà vẫn chứa được item (Best Fit Strategy for Stock Selection)
                
                best_stock_type = None
                
                # Tìm stock type phù hợp
                for w, h in stock_types:
                    # Check nếu item (kể cả xoay) vừa với kích thước stock này
                    # Item dim: iw, ih. Stock dim: w, h
                    # Case A: iw <= w AND ih <= h
                    # Case B: ih <= w AND iw <= h (Rotated)
                    iw, ih = item.width, item.height
                    fits = (iw <= w and ih <= h) or (ih <= w and iw <= h)
                    
                    if fits:
                        best_stock_type = (w, h)
                        break # Chọn cái đầu tiên vừa (First Fit Stock Selection)
                
                if best_stock_type:
                    new_stock = Stock(best_stock_type[0], best_stock_type[1])
                    if new_stock.add_item(item):
                        opened_stocks.append(new_stock)
                        placed = True
                    else:
                         print(f"Error: Item {item.id} fits theoretically but failed to place!")
                else:
                    print(f"Warning: Item {item.id} ({item.width}x{item.height}) is too big for any stock!")

        return opened_stocks

