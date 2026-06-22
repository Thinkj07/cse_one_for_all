
import json
import time
import argparse
import os
from typing import List, Tuple
from src.models import Item, Stock
from src.solvers.greedy_solver import GreedySolver
from src.solvers.ffd_solver import FFDSolver
from src.solvers.ga_solver import GASolver
from src.utils import visualize_packing, print_solution_metrics

def load_data(filepath: str):
    """Đọc dữ liệu từ file JSON."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    return data

def expand_items(items_data: List[dict]) -> List[Item]:
    """Chuyển đổi dữ liệu items (có quantity) thành danh sách các đối tượng Item riêng biệt."""
    items = []
    item_counter = 1
    for i_data in items_data:
        w = i_data['width']
        h = i_data['height']
        qty = i_data['quantity']
        for _ in range(qty):
            items.append(Item(id=item_counter, width=w, height=h))
            item_counter += 1
    return items

def run_case_1():
    print("\n" + "#"*50)
    print("RUNNING CASE STUDY 1 (GLASS MANUFACTURING)")
    print("Algorithm: Greedy")
    print("#"*50)

    # 1. Load Data
    data = load_data('data/case_study_1.json')
    stock_w = data['stock']['width']
    stock_h = data['stock']['height']
    items = expand_items(data['items'])
    
    stock_types = [(stock_w, stock_h)]
    
    print(f"Total Items to cut: {len(items)}")
    print(f"Stock Size: {stock_w}x{stock_h}")

    # 2. Run Solver
    solver = GreedySolver()
    
    start_time = time.time()
    result_stocks = solver.solve(items, stock_types)
    end_time = time.time()
    
    # 3. Output
    print_solution_metrics(result_stocks, end_time - start_time)
    
    # 4. Visualize
    print("\nGenerating visualization...")
    visualize_packing(result_stocks, title="Case Study 1 - Greedy Algorithm")

def run_case_2():
    print("\n" + "#"*50)
    print("RUNNING CASE STUDY 2 (WOOD WORKSHOP)")
    print("Algorithm: First-Fit Decreasing (FFD)")
    print("#"*50)

    # 1. Load Data
    data = load_data('data/case_study_2.json')
    
    # Lấy danh sách kích thước stock có sẵn
    stock_types = []
    for s in data['stocks']:
        stock_types.append((s['width'], s['height']))
        
    items = expand_items(data['items'])
    
    print(f"Total Items to cut: {len(items)}")
    print(f"Available Stock Types: {stock_types}")

    # 2. Run Solver
    solver = FFDSolver()
    
    start_time = time.time()
    result_stocks = solver.solve(items, stock_types)
    end_time = time.time()
    
    # 3. Output
    print_solution_metrics(result_stocks, end_time - start_time)
    
    # 4. Visualize
    print("\nGenerating visualization...")
    visualize_packing(result_stocks, title="Case Study 2 - FFD Algorithm")

def run_ga_demo():
    print("\n" + "#"*50)
    print("RUNNING GENETIC ALGORITHM DEMO (Case 2 Data)")
    print("#"*50)
    
    data = load_data('data/case_study_2.json')
    stock_types = [(s['width'], s['height']) for s in data['stocks']]
    items = expand_items(data['items'])
    
    # Giảm số lượng items để demo chạy nhanh hơn
    # items = items[:20] 

    solver = GASolver(population_size=30, generations=20)
    
    start_time = time.time()
    result_stocks = solver.solve(items, stock_types)
    end_time = time.time()
    
    print_solution_metrics(result_stocks, end_time - start_time)
    visualize_packing(result_stocks, title="GA Demo Result")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="2D Cutting Stock Solver")
    parser.add_argument('--case', type=int, choices=[1, 2, 3], help="Run specific case (1, 2, or 3 for GA Demo)")
    args = parser.parse_args()

    if args.case == 1:
        run_case_1()
    elif args.case == 2:
        run_case_2()
    elif args.case == 3:
        run_ga_demo()
    else:
        # Run all default cases
        input("Press Enter to run Case 1...")
        run_case_1()
        input("Press Enter to run Case 2...")
        run_case_2()

