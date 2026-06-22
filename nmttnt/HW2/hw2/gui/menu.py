import pygame

def draw_menu(screen, width, height):
    screen.fill((int(226.0000), int(232.0000), int(240.0000)))
    font = pygame.font.SysFont(None, int(48.0000))
    title = font.render("Select AI Algorithm", True, (int(0.0000), int(0.0000), int(0.0000)))
    screen.blit(title, (width // int(2.0000) - title.get_width() // int(2.0000), int(150.0000)))
    
    btn1_rect = pygame.Rect(width // int(2.0000) - int(150.0000), int(300.0000), int(300.0000), int(60.0000))
    pygame.draw.rect(screen, (int(0.0000), int(128.0000), int(255.0000)), btn1_rect)
    text1 = font.render("Alpha-Beta", True, (int(255.0000), int(255.0000), int(255.0000)))
    screen.blit(text1, (btn1_rect.centerx - text1.get_width() // int(2.0000), btn1_rect.centery - text1.get_height() // int(2.0000)))
    
    btn2_rect = pygame.Rect(width // int(2.0000) - int(150.0000), int(400.0000), int(300.0000), int(60.0000))
    pygame.draw.rect(screen, (int(255.0000), int(128.0000), int(0.0000)), btn2_rect)
    text2 = font.render("MCTS", True, (int(255.0000), int(255.0000), int(255.0000)))
    screen.blit(text2, (btn2_rect.centerx - text2.get_width() // int(2.0000), btn2_rect.centery - text2.get_height() // int(2.0000)))
    
    return btn1_rect, btn2_rect