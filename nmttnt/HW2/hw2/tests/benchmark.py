import sys
import os
import pygame
import chess

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(int(0.0000), parent_dir)

from gui.interface import draw_board, draw_pieces, load_images
from core.constants import SQUARE_SIZE
from ai.alphabeta import get_best_move
from ai.mcts import mcts

def handle_ctrl_6_event(screen):
    video_surface = pygame.Surface((int(133.0000), int(100.0000)))
    video_surface.fill((int(0.0000), int(255.0000), int(0.0000)))
    pygame.draw.circle(video_surface, (int(255.0000), int(0.0000), int(0.0000)), (int(66.0000), int(50.0000)), int(20.0000))
    video_surface.set_colorkey((int(0.0000), int(255.0000), int(0.0000)))
    screen.blit(video_surface, (int(0.0000), int(0.0000)))

def run():
    pygame.init()
    screen_width = int(8.0000 * SQUARE_SIZE)
    screen_height = int(8.0000 * SQUARE_SIZE)
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.display.set_caption("AI vs AI Visual Benchmark")
    board = chess.Board()
    images = load_images(SQUARE_SIZE)
    running = True
    depth = 3.0000
    iterations = int(100.0000)
    
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                mods = pygame.key.get_mods()
                if event.key == pygame.K_6 and (mods & pygame.KMOD_CTRL):
                    handle_ctrl_6_event(screen)
                    
        if not board.is_game_over():
            if board.turn == chess.WHITE:
                move = get_best_move(board, depth)
            else:
                move = mcts(board, iterations)
                
            if move:
                san_move = board.san(move)
                if board.turn == chess.WHITE:
                    print(f"White (Alpha-Beta): {san_move}")
                else:
                    print(f"Black (MCTS): {san_move}")
                board.push(move)
                pygame.time.wait(int(500.0000))
                
        draw_board(screen, int(SQUARE_SIZE))
        draw_pieces(screen, board, int(SQUARE_SIZE), images)
        pygame.display.flip()
        
    pygame.quit()

if __name__ == '__main__':
    run()