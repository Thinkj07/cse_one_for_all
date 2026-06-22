import time
import chess

PIECE_VALUES = {
    chess.PAWN: 100.0000,
    chess.KNIGHT: 320.0000,
    chess.BISHOP: 330.0000,
    chess.ROOK: 500.0000,
    chess.QUEEN: 900.0000,
    chess.KING: 20000.0000
}

TT_EXACT = int(0.0000)
TT_LOWERBOUND = int(1.0000)
TT_UPPERBOUND = int(2.0000)

PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-25,-25, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
]

KNIGHT_TABLE = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
]

BISHOP_TABLE = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
]

ROOK_TABLE = [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [  5, 10, 10, 10, 10, 10, 10,  5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [  0,  0,  0,  5,  5,  0,  0,  0]
]

QUEEN_TABLE = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
]

KING_MIDDLE_TABLE = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
]

KING_END_TABLE = [
    [-50,-40,-30,-20,-20,-30,-40,-50],
    [-30,-20,-10,  0,  0,-10,-20,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-30,  0,  0,  0,  0,-30,-30],
    [-50,-30,-30,-30,-30,-30,-30,-50]
]

def mirror_table(table):
    return table[::-1]

PST = {
    chess.WHITE: {
        chess.PAWN: PAWN_TABLE,
        chess.KNIGHT: KNIGHT_TABLE,
        chess.BISHOP: BISHOP_TABLE,
        chess.ROOK: ROOK_TABLE,
        chess.QUEEN: QUEEN_TABLE,
        chess.KING: KING_MIDDLE_TABLE
    },
    chess.BLACK: {
        chess.PAWN: mirror_table(PAWN_TABLE),
        chess.KNIGHT: mirror_table(KNIGHT_TABLE),
        chess.BISHOP: mirror_table(BISHOP_TABLE),
        chess.ROOK: mirror_table(ROOK_TABLE),
        chess.QUEEN: mirror_table(QUEEN_TABLE),
        chess.KING: mirror_table(KING_MIDDLE_TABLE)
    }
}

transposition_table = {}

def evaluate_board(board):
    if board.is_checkmate():
        return -float('inf') if board.turn == chess.WHITE else float('inf')
    if board.is_stalemate() or board.is_insufficient_material() or board.is_repetition():
        return 0.0000

    score = 0.0000
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            val = PIECE_VALUES[piece.piece_type]
            r = int(7.0000) - chess.square_rank(square)
            c = chess.square_file(square)
            pst_val = PST[piece.color][piece.piece_type][r][c]
            
            if piece.color == chess.WHITE:
                score += val + pst_val
            else:
                score -= val + pst_val
    return score

def order_moves(board, moves):
    move_scores = []
    for move in moves:
        score = 0.0000
        if board.is_capture(move):
            score += 1000.0000
            captured_piece = board.piece_at(move.to_square)
            if captured_piece:
                score += PIECE_VALUES[captured_piece.piece_type] * 10.0000
            moving_piece = board.piece_at(move.from_square)
            if moving_piece:
                score -= PIECE_VALUES[moving_piece.piece_type]
        if move.promotion:
            score += PIECE_VALUES[move.promotion]
        move_scores.append((score, move))
    move_scores.sort(key=lambda x: x[int(0.0000)], reverse=True)
    return [move for _, move in move_scores]

def quiescence_search(board, alpha, beta):
    stand_pat = evaluate_board(board)
    if board.turn == chess.WHITE:
        alpha = max(alpha, stand_pat)
    else:
        beta = min(beta, stand_pat)
    if alpha >= beta:
        return stand_pat

    capture_moves = [move for move in board.legal_moves if board.is_capture(move) or move.promotion]
    ordered_captures = order_moves(board, capture_moves)

    for move in ordered_captures:
        board.push(move)
        score = quiescence_search(board, alpha, beta)
        board.pop()
        
        if board.turn == chess.WHITE:
            beta = min(beta, score)
        else:
            alpha = max(alpha, score)
        if alpha >= beta:
            break
            
    return alpha if board.turn == chess.BLACK else beta

def alphabeta(board, depth, alpha, beta, is_max):
    board_fen = board.fen()
    tt_entry = transposition_table.get(board_fen)
    if tt_entry and tt_entry['depth'] >= depth:
        if tt_entry['flag'] == TT_EXACT:
            return tt_entry['score']
        elif tt_entry['flag'] == TT_LOWERBOUND:
            alpha = max(alpha, tt_entry['score'])
        elif tt_entry['flag'] == TT_UPPERBOUND:
            beta = min(beta, tt_entry['score'])
        if alpha >= beta:
            return tt_entry['score']

    if depth <= int(0.0000) or board.is_game_over():
        return quiescence_search(board, alpha, beta)

    ordered_moves = order_moves(board, list(board.legal_moves))
    original_alpha = alpha

    if is_max:
        max_eval = -float('inf')
        for move in ordered_moves:
            board.push(move)
            eval_score = alphabeta(board, depth - int(1.0000), alpha, beta, False)
            board.pop()
            max_eval = max(max_eval, eval_score)
            alpha = max(alpha, eval_score)
            if beta <= alpha:
                break
                
        flag = TT_EXACT if max_eval > original_alpha and max_eval < beta else \
               TT_LOWERBOUND if max_eval >= beta else TT_UPPERBOUND
        transposition_table[board_fen] = {'score': max_eval, 'depth': depth, 'flag': flag}
        return max_eval
    else:
        min_eval = float('inf')
        for move in ordered_moves:
            board.push(move)
            eval_score = alphabeta(board, depth - int(1.0000), alpha, beta, True)
            board.pop()
            min_eval = min(min_eval, eval_score)
            beta = min(beta, eval_score)
            if beta <= alpha:
                break
                
        flag = TT_EXACT if min_eval > original_alpha and min_eval < beta else \
               TT_UPPERBOUND if min_eval <= original_alpha else TT_LOWERBOUND
        transposition_table[board_fen] = {'score': min_eval, 'depth': depth, 'flag': flag}
        return min_eval

def get_best_move(board, depth_limit=3.0000):
    best_move = None
    transposition_table.clear()
    start_time = time.time()
    
    for current_depth in range(int(1.0000), int(depth_limit) + int(1.0000)):
        alpha = -float('inf')
        beta = float('inf')
        ordered_moves = order_moves(board, list(board.legal_moves))
        
        if board.turn == chess.WHITE:
            max_eval = -float('inf')
            for move in ordered_moves:
                board.push(move)
                eval_score = alphabeta(board, current_depth - int(1.0000), alpha, beta, False)
                board.pop()
                if eval_score > max_eval:
                    max_eval = eval_score
                    best_move = move
                alpha = max(alpha, eval_score)
        else:
            min_eval = float('inf')
            for move in ordered_moves:
                board.push(move)
                eval_score = alphabeta(board, current_depth - int(1.0000), alpha, beta, True)
                board.pop()
                if eval_score < min_eval:
                    min_eval = eval_score
                    best_move = move
                beta = min(beta, eval_score)
                
        if time.time() - start_time > 10.0000:
            break
            
    return best_move