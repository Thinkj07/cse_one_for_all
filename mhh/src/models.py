
from dataclasses import dataclass
from typing import List, Tuple, Optional

@dataclass
class Item:
    id: int
    width: int
    height: int
    x: int = -1
    y: int = -1
    rotated: bool = False

    @property
    def area(self) -> int:
        return self.width * self.height

    def get_dimension(self) -> Tuple[int, int]:
        """Trả về kích thước thực tế sau khi tính đến việc xoay."""
        return (self.height, self.width) if self.rotated else (self.width, self.height)

class Stock:
    def __init__(self, width: int, height: int, id: int = 0):
        self.id = id
        self.width = width
        self.height = height
        self.items: List[Item] = []
        # Danh sách các điểm neo ứng cử viên (x, y) để thử đặt item mới
        # Khởi tạo với gốc tọa độ (0,0)
        self.candidate_points: List[Tuple[int, int]] = [(0, 0)]

    @property
    def used_area(self) -> int:
        return sum(item.area for item in self.items)

    @property
    def waste_area(self) -> int:
        return (self.width * self.height) - self.used_area

    def can_place(self, item: Item, x: int, y: int) -> bool:
        """Kiểm tra xem có thể đặt item tại (x, y) không."""
        w, h = item.get_dimension()

        # 1. Kiểm tra biên (Boundary check)
        if x + w > self.width or y + h > self.height:
            return False

        # 2. Kiểm tra va chạm (Overlap check)
        # Item mới: [x, x+w] x [y, y+h]
        for placed_item in self.items:
            px, py = placed_item.x, placed_item.y
            pw, ph = placed_item.get_dimension()
            
            # Kiểm tra va chạm hình chữ nhật (AABB)
            # Không va chạm nếu: bên trái OR bên phải OR bên trên OR bên dưới
            if not (x + w <= px or  # New item is strictly left
                    x >= px + pw or  # New item is strictly right
                    y + h <= py or  # New item is strictly below
                    y >= py + ph):   # New item is strictly above
                return False # Có va chạm
        
        return True

    def add_item(self, item: Item) -> bool:
        """
        Thử đặt item vào Stock sử dụng chiến thuật Bottom-Left.
        Duyệt qua các candidate_points.
        Hỗ trợ xoay 90 độ.
        """
        # Sắp xếp candidate points: Ưu tiên Y nhỏ nhất (Bottom), sau đó X nhỏ nhất (Left)
        # Lưu ý: Trong hệ tọa độ màn hình máy tính thường Y tăng dần xuống dưới, 
        # nhưng logic Bottom-Left thường hiểu là Y nhỏ. Ở đây ta sort theo Y tăng dần.
        self.candidate_points.sort(key=lambda p: (p[1], p[0]))

        # Thử 2 hướng: Không xoay và Có xoay
        orientations = [False, True]
        
        for rotate in orientations:
            item.rotated = rotate
            w, h = item.get_dimension()
            
            # Nếu xoay mà kích thước vượt quá tấm lớn thì bỏ qua ngay
            if w > self.width or h > self.height:
                continue

            for idx, (x, y) in enumerate(self.candidate_points):
                if self.can_place(item, x, y):
                    # Đặt item thành công
                    item.x = x
                    item.y = y
                    self.items.append(item)
                    
                    # Cập nhật candidate points
                    # Thêm 2 điểm mới từ góc trên-trái và dưới-phải của item mới
                    new_candidates = [
                        (x, y + h),      # Top-Left của item vừa đặt
                        (x + w, y)       # Bottom-Right của item vừa đặt
                    ]
                    
                    # Thêm vào danh sách và lọc các điểm trùng hoặc không hợp lệ (nếu cần tối ưu sâu hơn)
                    # Ở mức cơ bản, ta cứ thêm vào.
                    for nc in new_candidates:
                        if nc[0] < self.width and nc[1] < self.height:
                            self.candidate_points.append(nc)
                    
                    # Xóa điểm candidate đã sử dụng (x,y)
                    # Thực ra ta không cần xóa ngay vì có thể điểm đó bị che lấp, 
                    # logic can_place sẽ lo phần check overlap. 
                    # Nhưng để tối ưu tốc độ, ta có thể bỏ qua nó trong tương lai.
                    # Tuy nhiên, một điểm (x,y) có thể là góc của nhiều khoảng trống?
                    # Để đơn giản và chính xác: Ta remove điểm này khỏi candidates.
                    self.candidate_points.pop(idx)
                    
                    return True

        return False

