import chess

def get_all_legal_moves(board):
    moves = []
    for move in board.legal_moves:
        moves.append(move)
    return moves

def order_moves(board, moves):
    ordered_moves = []
    for move in moves:
        if board.is_capture(move):
            ordered_moves.insert(0, move)
        else:
            ordered_moves.append(move)
    return ordered_moves