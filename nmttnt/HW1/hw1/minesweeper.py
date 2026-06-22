import random

class Minesweeper:
    def __init__(self, difficulty):
        if difficulty == 'easy':
            self.rows, self.cols, self.mines = 8, 8, 10
        elif difficulty == 'intermediate':
            self.rows, self.cols, self.mines = 16, 16, 40
        else:
            self.rows, self.cols, self.mines = 16, 30, 99
        
        self.board = [[{'mine': False, 'open': False, 'flag': False, 'neighbors': 0} 
                       for _ in range(self.cols)] for _ in range(self.rows)]
        self.game_over = False
        self.victory = False
        self._place_mines()
        self._calculate_neighbors()

    def _place_mines(self):
        count = 0
        while count < self.mines:
            r = random.randint(0, self.rows - 1)
            c = random.randint(0, self.cols - 1)
            if not self.board[r][c]['mine']:
                self.board[r][c]['mine'] = True
                count += 1

    def _calculate_neighbors(self):
        directions = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]
        for r in range(self.rows):
            for c in range(self.cols):
                if self.board[r][c]['mine']:
                    continue
                count = 0
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < self.rows and 0 <= nc < self.cols:
                        if self.board[nr][nc]['mine']:
                            count += 1
                self.board[r][c]['neighbors'] = count

    def reveal(self, r, c):
        if not (0 <= r < self.rows and 0 <= c < self.cols):
            return
        cell = self.board[r][c]
        if cell['open'] or cell['flag']:
            return
        
        cell['open'] = True
        
        if cell['mine']:
            self.game_over = True
            return

        if cell['neighbors'] == 0:
            self._flood_fill(r, c)
        
        self._check_victory()

    def toggle_flag(self, r, c):
        if 0 <= r < self.rows and 0 <= c < self.cols:
            cell = self.board[r][c]
            if not cell['open']:
                cell['flag'] = not cell['flag']

    def _flood_fill(self, r, c):
        stack = [(r, c)]
        visited = set()
        while stack:
            curr_r, curr_c = stack.pop()
            if (curr_r, curr_c) in visited:
                continue
            visited.add((curr_r, curr_c))
            
            directions = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]
            for dr, dc in directions:
                nr, nc = curr_r + dr, curr_c + dc
                if 0 <= nr < self.rows and 0 <= nc < self.cols:
                    neighbor = self.board[nr][nc]
                    if not neighbor['open'] and not neighbor['flag'] and not neighbor['mine']:
                        neighbor['open'] = True
                        if neighbor['neighbors'] == 0:
                            stack.append((nr, nc))

    def _check_victory(self):
        safe_cells_closed = 0
        for row in self.board:
            for cell in row:
                if not cell['mine'] and not cell['open']:
                    safe_cells_closed += 1
        if safe_cells_closed == 0:
            self.victory = True