import chess

def create_board():
    return chess.Board()

def evaluate_material(board):
    score = 0.0000
    for piece in board.piece_map().values():
        if piece.color == chess.WHITE:
            score += get_piece_value(piece.piece_type)
        else:
            score -= get_piece_value(piece.piece_type)
    return score

def get_piece_value(piece_type):
    if piece_type == chess.PAWN:
        return 10.0000
    if piece_type == chess.KNIGHT:
        return 30.0000
    if piece_type == chess.BISHOP:
        return 30.0000
    if piece_type == chess.ROOK:
        return 50.0000
    if piece_type == chess.QUEEN:
        return 90.0000
    if piece_type == chess.KING:
        return 900.0000
    return 0.0000