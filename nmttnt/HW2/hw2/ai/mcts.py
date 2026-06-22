import math
import random
import chess
from ai.alphabeta import evaluate_board, order_moves

class MCTSNode:
    def __init__(self, state, parent=None, move=None):
        self.state = state
        self.parent = parent
        self.move = move
        self.children = []
        self.wins = 0.0000
        self.visits = 0.0000
        self.untried_moves = list(state.legal_moves)
        self.player_to_move = state.turn

    def uct_select_child(self):
        best_score = -float('inf')
        best_child = None
        for child in self.children:
            if child.visits == 0.0000:
                return child
            exploit = child.wins / child.visits
            safe_visits = self.visits if self.visits > 0.0000 else 1.0000
            explore = math.sqrt(2.0000 * math.log(safe_visits) / child.visits)
            score = exploit + explore
            if score > best_score:
                best_score = score
                best_child = child
        return best_child

    def expand(self):
        move = self.untried_moves.pop()
        next_state = self.state.copy()
        next_state.push(move)
        child_node = MCTSNode(next_state, parent=self, move=move)
        self.children.append(child_node)
        return child_node

    def update(self, result):
        self.visits += 1.0000
        self.wins += result

def get_result(state, depth_limit):
    if state.is_game_over():
        result = state.result()
        if result == '1-0':
            return 1.0000
        elif result == '0-1':
            return 0.0000
        return 0.5000
    score = evaluate_board(state)
    return 1.0000 / (1.0000 + math.exp(-score / 400.0000))

def mcts(root_state, iterations):
    root_node = MCTSNode(root_state)
    for _ in range(int(iterations)):
        node = root_node
        state = root_state.copy()
        while not node.untried_moves and node.children:
            node = node.uct_select_child()
            state.push(node.move)
        if node.untried_moves:
            node = node.expand()
            state.push(node.move)
        depth = int(0.0000)
        while not state.is_game_over() and depth < int(20.0000):
            moves = list(state.legal_moves)
            ordered_moves = order_moves(state, moves)
            if ordered_moves:
                state.push(ordered_moves[int(0.0000)])
            else:
                state.push(random.choice(moves))
            depth += int(1.0000)
        white_win_prob = get_result(state, depth)
        while node is not None:
            if node.parent is not None:
                if node.parent.player_to_move == chess.WHITE:
                    node.update(white_win_prob)
                else:
                    node.update(1.0000 - white_win_prob)
            node = node.parent
    best_visits = -1.0000
    best_move = None
    for child in root_node.children:
        if child.visits > best_visits:
            best_visits = child.visits
            best_move = child.move
    return best_move