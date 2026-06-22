
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import random
from typing import List
from .models import Stock

def get_random_color():
    """Sinh màu ngẫu nhiên dịu mắt."""
    return (random.random(), random.random(), random.random())

def visualize_packing(stocks: List[Stock], title: str = "Cutting Pattern"):
    """
    Vẽ sơ đồ cắt cho danh sách các tấm Stock.
    """
    num_stocks = len(stocks)
    if num_stocks == 0:
        print("No stocks to visualize.")
        return

    # Tính toán bố cục lưới (grid) để hiển thị
    cols = 3
    rows = (num_stocks + cols - 1) // cols
    
    fig, axes = plt.subplots(rows, cols, figsize=(15, 5 * rows))
    fig.suptitle(title, fontsize=16)
    
    # Xử lý trường hợp 1 subplot (axes không phải array)
    if num_stocks == 1:
        axes = [axes]
    elif rows > 1:
        axes = axes.flatten()
        
    for i, stock in enumerate(stocks):
        ax = axes[i]
        ax.set_title(f"Stock {i+1} (Size: {stock.width}x{stock.height}) - Util: {stock.used_area/(stock.width*stock.height):.1%}")
        ax.set_xlim(0, stock.width)
        ax.set_ylim(0, stock.height)
        ax.set_aspect('equal')
        
        # Vẽ khung Stock
        stock_rect = patches.Rectangle((0, 0), stock.width, stock.height, linewidth=2, edgecolor='black', facecolor='none')
        ax.add_patch(stock_rect)
        
        # Vẽ các Items
        for item in stock.items:
            w, h = item.get_dimension()
            # Màu sắc khác nhau cho mỗi item
            color = get_random_color()
            rect = patches.Rectangle(
                (item.x, item.y), w, h, 
                linewidth=1, edgecolor='black', facecolor=color, alpha=0.7
            )
            ax.add_patch(rect)
            
            # Ghi kích thước/ID vào giữa
            cx = item.x + w/2
            cy = item.y + h/2
            ax.text(cx, cy, f"{w}x{h}", color='black', fontsize=8, ha='center', va='center')

    # Ẩn các trục thừa nếu có
    for j in range(i + 1, len(axes)):
        axes[j].axis('off')

    plt.tight_layout()
    plt.show()

def print_solution_metrics(stocks: List[Stock], execution_time: float):
    total_stocks = len(stocks)
    total_used_area = sum(s.used_area for s in stocks)
    total_stock_area = sum(s.width * s.height for s in stocks)
    utilization = (total_used_area / total_stock_area * 100) if total_stock_area > 0 else 0
    
    print("\n" + "="*40)
    print(f"SOLUTION METRICS")
    print(f"="*40)
    print(f"Total Stocks Used: {total_stocks}")
    print(f"Total Utilization: {utilization:.2f}%")
    print(f"Execution Time:    {execution_time:.4f} seconds")
    print(f"="*40)
    for i, stock in enumerate(stocks):
        u = (stock.used_area / (stock.width * stock.height)) * 100
        print(f"  Stock {i+1}: {stock.width}x{stock.height} - Util: {u:.2f}% | Items: {len(stock.items)}")

