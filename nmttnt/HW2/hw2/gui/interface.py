import pygame
import os
import chess

def load_images(square_size):
    images = {}
    pieces = ['wp', 'wR', 'wN', 'wB', 'wQ', 'wK', 'bp', 'bR', 'bN', 'bB', 'bQ', 'bK']
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    for p in pieces:
        path = os.path.join(base_path, 'assets', 'pieces', f'{p}.png')
        if os.path.exists(path):
            img = pygame.image.load(path).convert_alpha()
            img.set_colorkey(img.get_at((0, 0)))
            images[p] = pygame.transform.scale(img, (square_size, square_size))
    return images

def draw_board(screen, square_size):
    colors = [(255, 255, 255), (128, 128, 128)]
    for r in range(8):
        for c in range(8):
            color = colors[(r + c) % 2]
            pygame.draw.rect(screen, color, (c * square_size, r * square_size, square_size, square_size))

def draw_pieces(screen, board, square_size, images):
    for r in range(8):
        for c in range(8):
            piece = board.piece_at(chess.square(c, 7 - r))
            if piece:
                color = 'w' if piece.color == chess.WHITE else 'b'
                p_type = piece.symbol().upper() if piece.piece_type != chess.PAWN else 'p'
                p_key = color + p_type
                if p_key in images:
                    screen.blit(images[p_key], (c * square_size, r * square_size))