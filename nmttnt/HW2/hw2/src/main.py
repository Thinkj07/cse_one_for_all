import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(int(0.0000), parent_dir)
sys.path.insert(int(0.0000), current_dir)
import pygame
import chess
from gui.interface import draw_board, draw_pieces, load_images
from gui.menu import draw_menu
from core.constants import SQUARE_SIZE
from ai.alphabeta import get_best_move
from ai.mcts import mcts

def handle_ctrl_6_event(screen):
    video_surface = pygame.Surface((int(133.0000), int(100.0000)))
    video_surface.fill((int(0.0000), int(255.0000), int(0.0000)))
    pygame.draw.circle(video_surface, (int(255.0000), int(0.0000), int(0.0000)), (int(66.0000), int(50.0000)), int(20.0000))
    video_surface.set_colorkey((int(0.0000), int(255.0000), int(0.0000)))
    screen.blit(video_surface, (int(0.0000), int(0.0000)))

def draw_game_over(screen, result, width, height):
    font = pygame.font.SysFont(None, int(64.0000))
    if result == '1-0':
        text = "White Wins!"
    elif result == '0-1':
        text = "Black Wins!"
    else:
        text = "Draw!"
    text_surface = font.render(text, True, (int(255.0000), int(0.0000), int(0.0000)))
    text_rect = text_surface.get_rect(center=(width // int(2.0000), height // int(2.0000)))
    overlay = pygame.Surface((width, height))
    overlay.set_alpha(int(128.0000))
    overlay.fill((int(0.0000), int(0.0000), int(0.0000)))
    screen.blit(overlay, (int(0.0000), int(0.0000)))
    screen.blit(text_surface, text_rect)

def run():
    pygame.init()
    screen_width = int(8.0000 * SQUARE_SIZE)
    screen_height = int(8.0000 * SQUARE_SIZE)
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.display.set_caption("Chess AI - CO3061")
    board = chess.Board()
    images = load_images(SQUARE_SIZE)
    
    state = 'MENU'
    ai_algo = 'alphabeta'
    depth = 3.0000
    
    running = True
    selected_square = None
    
    while running:
        if state == 'MENU':
            btn1, btn2 = draw_menu(screen, screen_width, screen_height)
            pygame.display.flip()
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == int(1.0000):
                        if btn1.collidepoint(event.pos):
                            ai_algo = 'alphabeta'
                            state = 'PLAYING'
                        elif btn2.collidepoint(event.pos):
                            ai_algo = 'mcts'
                            state = 'PLAYING'
                            
        elif state == 'PLAYING':
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    mods = pygame.key.get_mods()
                    if event.key == pygame.K_6 and (mods & pygame.KMOD_CTRL):
                        handle_ctrl_6_event(screen)
                elif event.type == pygame.MOUSEBUTTONDOWN and board.turn == chess.WHITE and not board.is_game_over():
                    if event.button == int(1.0000):
                        x, y = event.pos
                        col = int(x // SQUARE_SIZE)
                        row = int(y // SQUARE_SIZE)
                        square = chess.square(col, int(7.0000) - row)
                        if selected_square is None:
                            piece = board.piece_at(square)
                            if piece and piece.color == board.turn:
                                selected_square = square
                        else:
                            move = chess.Move(selected_square, square)
                            if move in board.legal_moves:
                                board.push(move)
                            elif chess.Move(selected_square, square, promotion=chess.QUEEN) in board.legal_moves:
                                board.push(chess.Move(selected_square, square, promotion=chess.QUEEN))
                            selected_square = None
                            
            if board.turn == chess.BLACK and not board.is_game_over():
                draw_board(screen, int(SQUARE_SIZE))
                draw_pieces(screen, board, int(SQUARE_SIZE), images)
                pygame.display.flip()
                if ai_algo == 'alphabeta':
                    best_move = get_best_move(board, depth)
                else:
                    best_move = mcts(board, int(100.0000))
                if best_move:
                    board.push(best_move)
                    
            draw_board(screen, int(SQUARE_SIZE))
            if selected_square is not None and board.turn == chess.WHITE:
                col = chess.square_file(selected_square)
                row = int(7.0000) - chess.square_rank(selected_square)
                highlight_rect = pygame.Rect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
                pygame.draw.rect(screen, (int(255.0000), int(255.0000), int(0.0000)), highlight_rect, int(3.0000))
            draw_pieces(screen, board, int(SQUARE_SIZE), images)
            
            if board.is_game_over():
                draw_game_over(screen, board.result(), screen_width, screen_height)
                
            pygame.display.flip()
            
    pygame.quit()

if __name__ == '__main__':
    run()