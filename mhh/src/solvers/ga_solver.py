
import random
import copy
from typing import List, Tuple
from ..models import Item, Stock
from .greedy_solver import GreedySolver

class GASolver:
    def __init__(self, population_size=50, generations=100, mutation_rate=0.1):
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        # Sử dụng Greedy logic để đánh giá fitness của một hoán vị
        self.decoder = GreedySolver() 

    def calculate_fitness(self, individual: List[Item], stock_types: List[Tuple[int, int]]) -> float:
        """
        Fitness function: Đánh giá chất lượng giải pháp.
        Chúng ta muốn MINIMIZE số lượng stock sử dụng và lãng phí.
        
        Để đơn giản: Fitness = (Số lượng Stock * Area_Stock_Max) + Tổng lãng phí
        Hoặc đơn giản hơn: 1.0 / (Tổng diện tích sử dụng / Tổng diện tích stock) (Maximize Utilization)
        
        Ở đây ta dùng chi phí (Cost) để Minimize:
        Cost = Số lượng stocks.
        Để phân loại tốt hơn giữa 2 giải pháp cùng số lượng stock, ta cộng thêm tỉ lệ lãng phí.
        """
        # Giải mã nhiễm sắc thể (danh sách items) thành các stock
        # Lưu ý: Cần deepcopy item để không làm hỏng dữ liệu gốc trong quá trình simulation
        # Tuy nhiên việc deepcopy liên tục sẽ rất chậm.
        # Ta sẽ reset state của items (x, y, rotated) trước khi đưa vào decoder.
        
        # Reset items state
        sim_items = []
        for it in individual:
            new_it = copy.copy(it) # Shallow copy là đủ vì ta chỉ sửa x,y,rotated
            new_it.x = -1
            new_it.y = -1
            new_it.rotated = False
            sim_items.append(new_it)

        stocks = self.decoder.solve(sim_items, stock_types)
        
        num_stocks = len(stocks)
        if num_stocks == 0: return float('inf')
        
        # Tính lãng phí của stock cuối cùng (các stock trước đó coi như đầy hoặc chấp nhận được)
        # Hoặc tổng diện tích thừa.
        total_waste = sum(s.waste_area for s in stocks)
        
        # Hàm mục tiêu: Ưu tiên ít stock nhất, sau đó là ít lãng phí nhất.
        # Weight stock count rất cao.
        score = (num_stocks * 100000) + total_waste
        return score

    def crossover(self, p1: List[Item], p2: List[Item]) -> List[Item]:
        """Order Crossover (OX1) để giữ tính hợp lệ của hoán vị."""
        size = len(p1)
        start, end = sorted(random.sample(range(size), 2))
        
        child = [None] * size
        # Copy đoạn giữa từ cha 1
        child[start:end] = p1[start:end]
        
        # Điền các phần còn lại từ cha 2 (theo thứ tự xuất hiện)
        current_p2_idx = 0
        for i in range(size):
            if child[i] is None:
                while p2[current_p2_idx] in child: # Check if item already exists based on ID/Ref
                    current_p2_idx += 1
                child[i] = p2[current_p2_idx]
                
        return child

    def mutate(self, individual: List[Item]):
        """Swap Mutation."""
        for i in range(len(individual)):
            if random.random() < self.mutation_rate:
                j = random.randint(0, len(individual) - 1)
                individual[i], individual[j] = individual[j], individual[i]

    def solve(self, items: List[Item], stock_types: List[Tuple[int, int]]) -> List[Stock]:
        # 1. Khởi tạo quần thể (Population)
        population = []
        for _ in range(self.population_size):
            ind = items.copy()
            random.shuffle(ind)
            population.append(ind)

        best_solution = None
        best_fitness = float('inf')

        # 2. Vòng lặp tiến hóa
        for gen in range(self.generations):
            # Đánh giá fitness
            pop_fitness = []
            for ind in population:
                fit = self.calculate_fitness(ind, stock_types)
                pop_fitness.append((ind, fit))
                
                if fit < best_fitness:
                    best_fitness = fit
                    best_solution = ind # Lưu lại thứ tự tốt nhất
            
            # Sắp xếp theo fitness tốt nhất (thấp nhất)
            pop_fitness.sort(key=lambda x: x[1])
            
            # Elitism: Giữ lại top k cá thể tốt nhất
            new_population = [x[0] for x in pop_fitness[:2]] 
            
            # Selection & Crossover
            while len(new_population) < self.population_size:
                # Tournament Selection đơn giản
                parent1 = min(random.sample(pop_fitness, 5), key=lambda x: x[1])[0]
                parent2 = min(random.sample(pop_fitness, 5), key=lambda x: x[1])[0]
                
                child = self.crossover(parent1, parent2)
                self.mutate(child)
                new_population.append(child)
            
            population = new_population
            # if gen % 10 == 0:
            #     print(f"Gen {gen}: Best Fitness = {best_fitness}")

        # 3. Trả về kết quả tốt nhất
        # Decode lần cuối để lấy Stocks
        print(f"GA Finished. Best Fitness: {best_fitness}")
        
        final_items = []
        for it in best_solution:
            new_it = copy.copy(it)
            new_it.x = -1
            new_it.y = -1
            new_it.rotated = False
            final_items.append(new_it)
            
        return self.decoder.solve(final_items, stock_types)

