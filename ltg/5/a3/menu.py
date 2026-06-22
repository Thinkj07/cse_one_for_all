import pygame
from settings import SCREEN_WIDTH, SCREEN_HEIGHT, FPS

class Button:
    """Button class with enhanced hover effects"""
    def __init__(self, x, y, width, height, text, color, hover_color, text_color):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.hover_color = hover_color
        self.text_color = text_color
        self.is_hovered = False
        self.font = pygame.font.SysFont('Arial', 28, bold=True)
        
    def update(self, pos):
        """Update hover state"""
        self.is_hovered = self.rect.collidepoint(pos)
        
    def draw(self, surface):
        """Draw button with hover effect"""
        # Color based on hover state
        current_color = self.hover_color if self.is_hovered else self.color
        
        pygame.draw.rect(surface, current_color, self.rect, border_radius=10)
        
        border_color = (255, 255, 255) if self.is_hovered else (200, 200, 200)
        pygame.draw.rect(surface, border_color, self.rect, 3, border_radius=10)
        
        # Draw text
        text_surf = self.font.render(self.text, True, self.text_color)
        text_rect = text_surf.get_rect(center=self.rect.center)
        surface.blit(text_surf, text_rect)
        
    def is_clicked(self, pos):
        """Check if button was clicked"""
        return self.rect.collidepoint(pos)


class Menu:
    """Main Menu class"""
    def __init__(self):
        self.screen = pygame.display.get_surface()
        self.clock = pygame.time.Clock()
        
        self.bg_color = (30, 30, 40) 
        self.accent_color = (100, 200, 255)
        self.accent_dark = (50, 150, 200)
        self.button_color = (50, 100, 150)
        self.button_hover = (100, 150, 200)
        self.text_color = (255, 255, 255)
        
        self.font_title = pygame.font.SysFont('Arial', 80, bold=True)
        self.font_subtitle = pygame.font.SysFont('Arial', 32, italic=True)
        self.font_small = pygame.font.SysFont('Arial', 20)
        
        # Load player images
        self.player_images = {}
        try:
            self.player_images['default'] = pygame.image.load('Assets/graphics/Default.png').convert_alpha()
            self.player_images['jump'] = pygame.image.load('Assets/graphics/Jump.png').convert_alpha()
            self.player_images['dash'] = pygame.image.load('Assets/graphics/Dash.png').convert_alpha()
            self.player_images['die'] = pygame.image.load('Assets/graphics/Die.png').convert_alpha()
        except Exception as e:
            print(f"[Warning] Cannot load player images: {e}")
            # Create placeholder surfaces
            for key in ['default', 'jump', 'dash', 'die']:
                self.player_images[key] = pygame.Surface((64, 64))
                self.player_images[key].fill((200, 100, 100))
        
        # Track which button is currently hovered
        self.hovered_button_index = None
        
        button_width = 250
        button_height = 50
        button_x = 100
        button_y_start = 200
        button_gap = 70
        
        self.start_button = Button(
            button_x, button_y_start, 
            button_width, button_height, 
            "SINGLEPLAYER", self.button_color, self.button_hover, self.text_color
        )
        
        self.multiplayer_button = Button(
            button_x, button_y_start + button_gap,
            button_width, button_height,
            "MULTIPLAYER", self.button_color, self.button_hover, self.text_color
        )
        
        self.instructions_button = Button(
            button_x, button_y_start + button_gap * 2,
            button_width, button_height,
            "INSTRUCTIONS", self.button_color, self.button_hover, self.text_color
        )
        
        self.settings_button = Button(
            button_x, button_y_start + button_gap * 3,
            button_width, button_height,
            "SETTINGS", self.button_color, self.button_hover, self.text_color
        )
        
        self.quit_button = Button(
            button_x, button_y_start + button_gap * 4,
            button_width, button_height,
            "QUIT", self.button_color, self.button_hover, self.text_color
        )
        
        self.buttons = [
            self.start_button,
            self.multiplayer_button,
            self.instructions_button,
            self.settings_button,
            self.quit_button
        ]
        
        # State
        self.current_screen = 'main' 
        self.selected_level = 0
        self.multiplayer_selected_level = 0
        self.is_multiplayer = False
        self.server_ip = '127.0.0.1'
        self.ip_active = False
        self.player_color_options = [(255, 77, 77), (77, 77, 255), (77, 255, 77), (255, 255, 77)] # Red, Blue, Green, Yellow
        self.current_color_idx = 0
        self.lobby_connected = False
        self.remote_color_idx = -1
        self.last_sent_color = -1
        
        # Settings
        self.sound_enabled = True
        self.fullscreen_enabled = False
        self.game_speed = 60
        
        # Key Bindings
        self.key_bindings = {
            'left': pygame.K_LEFT,
            'right': pygame.K_RIGHT,
            'jump': pygame.K_x,
            'dash': pygame.K_z,
            'grab': pygame.K_SPACE
        }
        self.waiting_for_key = None  # Track which key is being set

    def handle_event(self, event):
        """Handle events"""
        if event.type == pygame.MOUSEMOTION:
            pos = pygame.mouse.get_pos()
            for idx, button in enumerate(self.buttons):
                button.update(pos)
                if button.is_hovered:
                    self.hovered_button_index = idx
                else:
                    if self.hovered_button_index == idx:
                        self.hovered_button_index = None
                
        elif event.type == pygame.MOUSEBUTTONDOWN:
            pos = pygame.mouse.get_pos()
            
            if self.current_screen == 'main':
                if self.start_button.is_clicked(pos):
                    self.is_multiplayer = False
                    self.current_screen = 'level_select'
                elif self.multiplayer_button.is_clicked(pos):
                    self.current_screen = 'multiplayer'
                elif self.instructions_button.is_clicked(pos):
                    self.current_screen = 'instructions'
                elif self.settings_button.is_clicked(pos):
                    self.current_screen = 'settings'
                elif self.quit_button.is_clicked(pos):
                    return 'quit'
                    
            elif self.current_screen == 'multiplayer':
                res = self.handle_multiplayer_click(pos)
                if res: return res
                    
            elif self.current_screen == 'level_select':
                return self.handle_level_select(pos)
                
            elif self.current_screen == 'settings':
                self.handle_settings_click(pos)
                
            elif self.current_screen == 'instructions':
                self.current_screen = 'main'
                
        elif event.type == pygame.KEYDOWN:
            # Handle IP input
            if self.current_screen == 'multiplayer' and getattr(self, 'ip_active', False):
                if event.key == pygame.K_RETURN or event.key == pygame.K_ESCAPE:
                    self.ip_active = False
                elif event.key == pygame.K_BACKSPACE:
                    self.server_ip = self.server_ip[:-1]
                else:
                    if len(self.server_ip) < 20 and event.unicode.isprintable():
                        self.server_ip += event.unicode
                return

            # Handle key binding customization
            if self.waiting_for_key:
                if event.key != pygame.K_ESCAPE:
                    self.key_bindings[self.waiting_for_key] = event.key
                    key_name = pygame.key.name(event.key)
                    print(f"[SETTINGS] {self.waiting_for_key.upper()} set to: {key_name}")
                self.waiting_for_key = None
                return
            
            if event.key == pygame.K_ESCAPE:
                if self.current_screen != 'main':
                    self.current_screen = 'main'
                else:
                    return 'quit'
                    
        return None

    def handle_level_select(self, pos):
        """Handle level selection"""
        from settings import LEVEL_DATA
        
        num_levels = len(LEVEL_DATA)
        level_width = 100
        level_height = 100
        level_start_x = 400
        level_start_y = 250
        level_gap = 150
        
        for i in range(num_levels):
            x = level_start_x + (i % 3) * level_gap
            y = level_start_y + (i // 3) * level_gap
            rect = pygame.Rect(x, y, level_width, level_height)
            
            if rect.collidepoint(pos):
                return ('start_game', i)
        
        back_rect = pygame.Rect(50, 50, 100, 50)
        if back_rect.collidepoint(pos):
            self.current_screen = 'main'
            
        return None

    def handle_multiplayer_click(self, pos):
        back_rect = pygame.Rect(50, 50, 100, 50)
        if back_rect.collidepoint(pos):
            self.current_screen = 'main'
            if getattr(self, 'lobby_connected', False):
                return 'disconnect_lobby'
            return
            
        center_x = SCREEN_WIDTH // 2
        
        if not getattr(self, 'lobby_connected', False):
            left_arrow = pygame.Rect(center_x - 120, 200, 40, 40)
            right_arrow = pygame.Rect(center_x + 80, 200, 40, 40)
            if left_arrow.collidepoint(pos):
                self.current_color_idx = (self.current_color_idx - 1) % len(self.player_color_options)
            elif right_arrow.collidepoint(pos):
                self.current_color_idx = (self.current_color_idx + 1) % len(self.player_color_options)
                
            connect_btn = pygame.Rect(center_x - 125, 380, 250, 60)
            if connect_btn.collidepoint(pos):
                self.is_multiplayer = True
                return ('connect_lobby', self.server_ip)
                
            ip_rect = pygame.Rect(center_x - 150, 310, 300, 40)
            if ip_rect.collidepoint(pos):
                self.ip_active = True
            else:
                self.ip_active = False
        else:
            if getattr(self, 'is_host', False):
                my_x = SCREEN_WIDTH // 3
            else:
                my_x = SCREEN_WIDTH * 2 // 3
                
            left_arrow = pygame.Rect(my_x - 60, 350, 30, 30)
            right_arrow = pygame.Rect(my_x + 30, 350, 30, 30)
            
            if left_arrow.collidepoint(pos):
                self.current_color_idx = (self.current_color_idx - 1) % len(self.player_color_options)
                if self.current_color_idx == self.remote_color_idx:
                    self.current_color_idx = (self.current_color_idx - 1) % len(self.player_color_options)
            elif right_arrow.collidepoint(pos):
                self.current_color_idx = (self.current_color_idx + 1) % len(self.player_color_options)
                if self.current_color_idx == self.remote_color_idx:
                    self.current_color_idx = (self.current_color_idx + 1) % len(self.player_color_options)
            
            if getattr(self, 'is_host', False):
                from settings import LEVEL_DATA
                num_levels = len(LEVEL_DATA)
                
                lvl_left_rect = pygame.Rect(center_x - 70, 420, 30, 30)
                lvl_right_rect = pygame.Rect(center_x + 40, 420, 30, 30)
                
                if lvl_left_rect.collidepoint(pos):
                    self.multiplayer_selected_level = (getattr(self, 'multiplayer_selected_level', 0) - 1) % num_levels
                    return
                elif lvl_right_rect.collidepoint(pos):
                    self.multiplayer_selected_level = (getattr(self, 'multiplayer_selected_level', 0) + 1) % num_levels
                    return
                
                start_btn = pygame.Rect(center_x - 125, 480, 250, 60)
                if start_btn.collidepoint(pos):
                    return ('start_multiplayer', getattr(self, 'multiplayer_selected_level', 0))
            
        return None

    def handle_settings_click(self, pos):
        """Handle settings screen clicks"""
        # Check back button
        back_rect = pygame.Rect(50, 50, 100, 50)
        if back_rect.collidepoint(pos):
            self.current_screen = 'main'
            return
        
        right_x = 500
        toggle_width = 80
        toggle_height = 40
        
        # Row 1: Sound toggle
        sound_rect = pygame.Rect(right_x, 150, toggle_width, toggle_height)
        if sound_rect.collidepoint(pos):
            self.sound_enabled = not self.sound_enabled
            status = "ON" if self.sound_enabled else "OFF"
            print(f"[SETTINGS] Sound: {status}")
        
        # Row 2: Fullscreen toggle
        fullscreen_rect = pygame.Rect(right_x, 220, toggle_width, toggle_height)
        if fullscreen_rect.collidepoint(pos):
            self.fullscreen_enabled = not self.fullscreen_enabled
            self.apply_fullscreen()
        
        # Row 3: Game speed buttons
        speed_minus_rect = pygame.Rect(right_x, 290, 30, toggle_height)
        speed_plus_rect = pygame.Rect(right_x + 70, 290, 30, toggle_height)
        
        if speed_minus_rect.collidepoint(pos):
            self.game_speed = max(30, self.game_speed - 10)
            print(f"[SETTINGS] Game Speed: {self.game_speed} FPS")
        elif speed_plus_rect.collidepoint(pos):
            self.game_speed = min(120, self.game_speed + 10)
            print(f"[SETTINGS] Game Speed: {self.game_speed} FPS")
        
        # Key binding buttons
        key_button_width = 80
        key_button_height = 35
        key_gap = 50
        
        key_bindings_keys = ['left', 'right', 'jump', 'dash', 'grab']
        
        for idx, key_name in enumerate(key_bindings_keys):
            key_y = 410 + idx * key_gap
            key_rect = pygame.Rect(right_x, key_y, key_button_width, key_button_height)
            if key_rect.collidepoint(pos):
                self.waiting_for_key = key_name
                print(f"[SETTINGS] Press a key for {key_name.upper()}...")
    
    def apply_fullscreen(self):
        """Apply fullscreen setting"""
        try:
            if self.fullscreen_enabled:
                self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.FULLSCREEN)
                print("[SETTINGS] Fullscreen: ON")
            else:
                self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
                print("[SETTINGS] Fullscreen: OFF")
        except Exception as e:
            print(f"[ERROR] Cannot apply fullscreen: {e}")
            self.fullscreen_enabled = not self.fullscreen_enabled

    def draw_main_menu(self):
        """Draw main menu"""
        self.screen.fill(self.bg_color)
        
        right_x = SCREEN_WIDTH // 2
        
        pygame.draw.rect(
            self.screen, 
            self.accent_color, 
            (right_x, 0, SCREEN_WIDTH // 2, SCREEN_HEIGHT), 
            1, 3
        )
        
        right_panel_x = right_x + (SCREEN_WIDTH // 2) // 2
        
        game_title = self.font_title.render('GAMEDEV_3', True, self.accent_color)
        game_title_rect = game_title.get_rect(center=(right_panel_x, 80))
        self.screen.blit(game_title, game_title_rect)
        
        if self.hovered_button_index is not None:
            image_keys = ['default', 'jump', 'dash', 'die', 'die']
            image_key = image_keys[min(self.hovered_button_index, len(image_keys) - 1)]
        else:
            image_key = 'default'
        
        player_img = self.player_images[image_key]
        scaled_img = pygame.transform.scale(player_img, (200, 200))
        player_rect = scaled_img.get_rect(center=(right_panel_x, 350))
        self.screen.blit(scaled_img, player_rect)
        
        for button in self.buttons:
            button.draw(self.screen)
        
        hint_text = self.font_small.render('ESC: Exit menu', True, (150, 150, 150))
        hint_rect = hint_text.get_rect(bottomright=(SCREEN_WIDTH - 20, SCREEN_HEIGHT - 20))
        self.screen.blit(hint_text, hint_rect)

    def draw_level_select(self):
        """Draw level selection screen"""
        from settings import LEVEL_DATA
        
        self.screen.fill(self.bg_color)
        
        title = self.font_title.render('SELECT LEVEL', True, self.accent_color)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 80))
        self.screen.blit(title, title_rect)
        
        back_button = Button(50, 50, 100, 50, 'BACK', 
                           self.button_color, self.button_hover, self.text_color)
        back_button.update(pygame.mouse.get_pos())
        back_button.draw(self.screen)
        
        num_levels = len(LEVEL_DATA)
        level_width = 100
        level_height = 100
        level_start_x = 400
        level_start_y = 250
        level_gap = 150
        
        for i in range(num_levels):
            x = level_start_x + (i % 3) * level_gap
            y = level_start_y + (i // 3) * level_gap
            
            rect = pygame.Rect(x, y, level_width, level_height)
            is_hovered = rect.collidepoint(pygame.mouse.get_pos())
            
            color = self.button_hover if is_hovered else self.button_color
            pygame.draw.rect(self.screen, color, rect, border_radius=10)
            pygame.draw.rect(self.screen, (255, 255, 255) if is_hovered else (200, 200, 200), 
                           rect, 3, border_radius=10)
            
            level_num = self.font_title.render(str(i + 1), True, self.text_color)
            level_num_rect = level_num.get_rect(center=rect.center)
            self.screen.blit(level_num, level_num_rect)

    def draw_player_preview(self, center_pos, color, text_label):
        img = self.player_images['default'].copy()
        color_surf = pygame.Surface(img.get_size()).convert_alpha()
        color_surf.fill((*color, 255))
        img.blit(color_surf, (0,0), special_flags=pygame.BLEND_MULT)
        
        scaled_img = pygame.transform.scale(img, (96, 96))
        img_rect = scaled_img.get_rect(center=center_pos)
        self.screen.blit(scaled_img, img_rect)
        
        label = self.font_small.render(text_label, True, self.text_color)
        self.screen.blit(label, label.get_rect(center=(center_pos[0], center_pos[1] - 70)))

    def draw_multiplayer(self):
        """Draw multiplayer lobby screen"""
        self.screen.fill(self.bg_color)
        
        back_button = Button(50, 50, 100, 50, 'BACK', self.button_color, self.button_hover, self.text_color)
        back_button.update(pygame.mouse.get_pos())
        back_button.draw(self.screen)
        
        center_x = SCREEN_WIDTH // 2
        
        if not getattr(self, 'lobby_connected', False):
            title = self.font_title.render('MULTIPLAYER', True, self.accent_color)
            title_rect = title.get_rect(center=(center_x, 80))
            self.screen.blit(title, title_rect)
            
            color_label = self.font_subtitle.render('Your Initial Color:', True, self.text_color)
            self.screen.blit(color_label, color_label.get_rect(center=(center_x, 160)))
            
            pygame.draw.rect(self.screen, self.button_color, (center_x - 120, 200, 40, 40), border_radius=5)
            pygame.draw.rect(self.screen, self.button_color, (center_x + 80, 200, 40, 40), border_radius=5)
            
            arrow_left = self.font_subtitle.render('<', True, self.text_color)
            self.screen.blit(arrow_left, arrow_left.get_rect(center=(center_x - 100, 220)))
            arrow_right = self.font_subtitle.render('>', True, self.text_color)
            self.screen.blit(arrow_right, arrow_right.get_rect(center=(center_x + 100, 220)))
            
            current_color = self.player_color_options[self.current_color_idx]
            pygame.draw.rect(self.screen, current_color, (center_x - 60, 190, 120, 60), border_radius=10)
            pygame.draw.rect(self.screen, (255,255,255), (center_x - 60, 190, 120, 60), 3, border_radius=10)
            
            # IP Input Box
            ip_label = self.font_small.render('Server IP:', True, (200, 200, 200))
            self.screen.blit(ip_label, ip_label.get_rect(center=(center_x, 290)))
            
            ip_rect = pygame.Rect(center_x - 150, 310, 300, 40)
            is_active = getattr(self, 'ip_active', False)
            pygame.draw.rect(self.screen, (50, 50, 60), ip_rect, border_radius=5)
            border_color = self.accent_color if is_active else (150, 150, 150)
            pygame.draw.rect(self.screen, border_color, ip_rect, 2, border_radius=5)
            
            # Blinking cursor
            cursor = "|" if is_active and pygame.time.get_ticks() % 1000 < 500 else ""
            ip_text = self.font_small.render(self.server_ip + cursor, True, self.text_color)
            self.screen.blit(ip_text, ip_text.get_rect(center=ip_rect.center))
            
            hint = self.font_small.render('Click to edit IP' if not is_active else 'Press ENTER to save', True, (100, 150, 200))
            self.screen.blit(hint, hint.get_rect(center=(center_x, 360)))
            
            connect_btn = Button(center_x - 125, 380, 250, 60, 'CONNECT', self.button_color, self.button_hover, self.text_color)
            connect_btn.update(pygame.mouse.get_pos())
            connect_btn.draw(self.screen)
            
        else:
            title = self.font_title.render('WAITING ROOM', True, self.accent_color)
            title_rect = title.get_rect(center=(center_x, 80))
            self.screen.blit(title, title_rect)
            
            if getattr(self, 'is_host', False):
                my_pos = (SCREEN_WIDTH // 3, 250)
                other_pos = (SCREEN_WIDTH * 2 // 3, 250)
                my_label = "Player 1 (Host - YOU)"
                other_label = "Player 2"
            else:
                other_pos = (SCREEN_WIDTH // 3, 250)
                my_pos = (SCREEN_WIDTH * 2 // 3, 250)
                other_label = "Player 1 (Host)"
                my_label = "Player 2 (YOU)"
                
            my_color = self.player_color_options[self.current_color_idx]
            self.draw_player_preview(my_pos, my_color, my_label)
            
            pygame.draw.rect(self.screen, self.button_color, (my_pos[0] - 60, 350, 30, 30), border_radius=5)
            pygame.draw.rect(self.screen, self.button_color, (my_pos[0] + 30, 350, 30, 30), border_radius=5)
            arrow_left = self.font_subtitle.render('<', True, self.text_color)
            self.screen.blit(arrow_left, arrow_left.get_rect(center=(my_pos[0] - 45, 365)))
            arrow_right = self.font_subtitle.render('>', True, self.text_color)
            self.screen.blit(arrow_right, arrow_right.get_rect(center=(my_pos[0] + 45, 365)))
            
            if self.remote_color_idx != -1:
                r_color = self.player_color_options[self.remote_color_idx]
                self.draw_player_preview(other_pos, r_color, other_label)
            else:
                empty_label = self.font_subtitle.render("Waiting for player...", True, (150, 150, 150))
                self.screen.blit(empty_label, empty_label.get_rect(center=other_pos))
                
            if getattr(self, 'is_host', False):
                lvl_num = getattr(self, 'multiplayer_selected_level', 0)
                
                lvl_label = self.font_subtitle.render('Level:', True, self.text_color)
                self.screen.blit(lvl_label, lvl_label.get_rect(center=(center_x - 120, 435)))
                
                pygame.draw.rect(self.screen, self.button_color, (center_x - 70, 420, 30, 30), border_radius=5)
                pygame.draw.rect(self.screen, self.button_color, (center_x + 40, 420, 30, 30), border_radius=5)
                
                arrow_left = self.font_subtitle.render('<', True, self.text_color)
                self.screen.blit(arrow_left, arrow_left.get_rect(center=(center_x - 55, 435)))
                arrow_right = self.font_subtitle.render('>', True, self.text_color)
                self.screen.blit(arrow_right, arrow_right.get_rect(center=(center_x + 55, 435)))
                
                lvl_disp = self.font_title.render(f'{lvl_num + 1}', True, self.text_color)
                self.screen.blit(lvl_disp, lvl_disp.get_rect(center=(center_x, 435)))
                
                start_btn = Button(center_x - 125, 480, 250, 60, 'START GAME', self.button_color, self.button_hover, self.text_color)
                start_btn.update(pygame.mouse.get_pos())
                start_btn.draw(self.screen)
            else:
                lvl_num = getattr(self, 'multiplayer_selected_level', 0)
                wait_label = self.font_small.render(f'Waiting for host to start Level {lvl_num + 1}...', True, (200, 200, 200))
                self.screen.blit(wait_label, wait_label.get_rect(center=(center_x, 480)))

    def draw_instructions(self):
        """Draw instructions screen"""
        self.screen.fill(self.bg_color)
        
        # Title
        title = self.font_title.render('INSTRUCTIONS', True, self.accent_color)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 50))
        self.screen.blit(title, title_rect)
        
        # Instructions
        instructions = [
            "LEFT / RIGHT : Move left and right",
            "X : Jump",
            "Z : Dash",
            "SPACE : Wall Grab",
            "R : Restart level",
            "",
            "Goal: Jump to the goal (G marker)",
            "Collect coins for points",
            "Avoid spikes and enemies",
        ]
        
        y = 150
        for instruction in instructions:
            if instruction == "":
                y += 30
                continue
            text = self.font_small.render(instruction, True, self.text_color)
            text_rect = text.get_rect(x=150, y=y)
            self.screen.blit(text, text_rect)
            y += 50
        
        hint = self.font_small.render('Click to go back to menu', True, (150, 150, 150))
        hint_rect = hint.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 50))
        self.screen.blit(hint, hint_rect)

    def draw_settings(self):
        """Draw settings screen"""
        self.screen.fill(self.bg_color)
        
        # Title
        title = self.font_title.render('SETTINGS', True, self.accent_color)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 50))
        self.screen.blit(title, title_rect)
        
        # Back button
        back_button = Button(50, 50, 100, 50, 'BACK', 
                           self.button_color, self.button_hover, self.text_color)
        back_button.update(pygame.mouse.get_pos())
        back_button.draw(self.screen)
        
        # Layout settings
        left_x = 150
        right_x = 500
        toggle_width = 80
        toggle_height = 40
        
        # ===== Row 1: Sound =====
        y = 150
        label_text = self.font_small.render('Sound:', True, self.text_color)
        self.screen.blit(label_text, (left_x, y + 5))
        
        toggle_rect = pygame.Rect(right_x, y, toggle_width, toggle_height)
        toggle_color = (0, 180, 0) if self.sound_enabled else (180, 0, 0)
        pygame.draw.rect(self.screen, toggle_color, toggle_rect, border_radius=5)
        pygame.draw.rect(self.screen, (255, 255, 255), toggle_rect, 2, border_radius=5)
        status_text = self.font_small.render('ON' if self.sound_enabled else 'OFF', True, (255, 255, 255))
        status_rect = status_text.get_rect(center=toggle_rect.center)
        self.screen.blit(status_text, status_rect)
        
        # ===== Row 2: Fullscreen =====
        y += 70
        label_text = self.font_small.render('Fullscreen:', True, self.text_color)
        self.screen.blit(label_text, (left_x, y + 5))
        
        toggle_rect = pygame.Rect(right_x, y, toggle_width, toggle_height)
        toggle_color = (0, 180, 0) if self.fullscreen_enabled else (180, 0, 0)
        pygame.draw.rect(self.screen, toggle_color, toggle_rect, border_radius=5)
        pygame.draw.rect(self.screen, (255, 255, 255), toggle_rect, 2, border_radius=5)
        status_text = self.font_small.render('ON' if self.fullscreen_enabled else 'OFF', True, (255, 255, 255))
        status_rect = status_text.get_rect(center=toggle_rect.center)
        self.screen.blit(status_text, status_rect)
        
        # ===== Row 3: Game Speed =====
        y += 70
        label_text = self.font_small.render('Game Speed:', True, self.text_color)
        self.screen.blit(label_text, (left_x, y + 5))
        
        speed_minus_rect = pygame.Rect(right_x, y, 30, toggle_height)
        pygame.draw.rect(self.screen, (100, 100, 100), speed_minus_rect, border_radius=5)
        pygame.draw.rect(self.screen, (255, 255, 255), speed_minus_rect, 2, border_radius=5)
        minus_text = self.font_small.render('-', True, (255, 255, 255))
        minus_rect = minus_text.get_rect(center=speed_minus_rect.center)
        self.screen.blit(minus_text, minus_rect)
        
        speed_text = self.font_small.render(f'{self.game_speed}', True, self.accent_color)
        speed_rect = speed_text.get_rect(center=(right_x + 50, y + 20))
        self.screen.blit(speed_text, speed_rect)
        
        speed_plus_rect = pygame.Rect(right_x + 70, y, 30, toggle_height)
        pygame.draw.rect(self.screen, (100, 100, 100), speed_plus_rect, border_radius=5)
        pygame.draw.rect(self.screen, (255, 255, 255), speed_plus_rect, 2, border_radius=5)
        plus_text = self.font_small.render('+', True, (255, 255, 255))
        plus_rect = plus_text.get_rect(center=speed_plus_rect.center)
        self.screen.blit(plus_text, plus_rect)
        
        # ===== Key Bindings =====
        y += 80
        key_label = self.font_small.render('Controls:', True, self.accent_color)
        self.screen.blit(key_label, (left_x, y))
        
        key_button_width = 80
        key_button_height = 35
        key_gap = 50
        
        key_bindings_list = ['Move Left', 'Move Right', 'Jump', 'Dash', 'Grab']
        key_bindings_keys = ['left', 'right', 'jump', 'dash', 'grab']
        
        for idx, (display_name, key_name) in enumerate(zip(key_bindings_list, key_bindings_keys)):
            key_y = y + 40 + idx * key_gap
            
            label_text = self.font_small.render(f'{display_name}:', True, self.text_color)
            self.screen.blit(label_text, (left_x, key_y + 2))
            
            key_rect = pygame.Rect(right_x, key_y, key_button_width, key_button_height)
            is_waiting = self.waiting_for_key == key_name
            button_color = (255, 100, 100) if is_waiting else (100, 100, 150)
            
            pygame.draw.rect(self.screen, button_color, key_rect, border_radius=5)
            pygame.draw.rect(self.screen, (255, 255, 255), key_rect, 2, border_radius=5)
            
            current_key = pygame.key.name(self.key_bindings[key_name])
            if is_waiting:
                key_text = self.font_small.render('...', True, (255, 255, 255))
            else:
                key_text = self.font_small.render(current_key.upper(), True, (255, 255, 255))
            key_text_rect = key_text.get_rect(center=key_rect.center)
            self.screen.blit(key_text, key_text_rect)
        
        hint = self.font_small.render('ESC: Back | Click to change keys', True, (150, 150, 150))
        hint_rect = hint.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 30))
        self.screen.blit(hint, hint_rect)

    def draw(self):
        """Draw menu based on current state"""
        if self.current_screen == 'main':
            self.draw_main_menu()
        elif self.current_screen == 'level_select':
            self.draw_level_select()
        elif self.current_screen == 'multiplayer':
            self.draw_multiplayer()
        elif self.current_screen == 'instructions':
            self.draw_instructions()
        elif self.current_screen == 'settings':
            self.draw_settings()


class PauseMenu:
    """Pause Menu class for in-game pause"""
    def __init__(self):
        self.screen = pygame.display.get_surface()
        
        # Colors
        self.bg_color = (30, 30, 40)
        self.accent_color = (100, 200, 255)
        self.button_color = (50, 100, 150)
        self.button_hover = (100, 150, 200)
        self.text_color = (255, 255, 255)
        
        # Fonts
        self.font_title = pygame.font.SysFont('Arial', 60, bold=True)
        self.font_small = pygame.font.SysFont('Arial', 20)
        
        button_width = 250
        button_height = 60
        center_x = SCREEN_WIDTH // 2 - button_width // 2
        button_y_start = 300
        button_gap = 100
        
        self.resume_button = Button(
            center_x, button_y_start,
            button_width, button_height,
            "RESUME", self.button_color, self.button_hover, self.text_color
        )
        
        self.main_menu_button = Button(
            center_x, button_y_start + button_gap,
            button_width, button_height,
            "MAIN MENU", self.button_color, self.button_hover, self.text_color
        )
        
        self.quit_button = Button(
            center_x, button_y_start + button_gap * 2,
            button_width, button_height,
            "QUIT", self.button_color, self.button_hover, self.text_color
        )
        
        self.buttons = [self.resume_button, self.main_menu_button, self.quit_button]
    
    def handle_event(self, event):
        """Handle pause menu events"""
        if event.type == pygame.MOUSEMOTION:
            pos = pygame.mouse.get_pos()
            for button in self.buttons:
                button.update(pos)
        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            pos = pygame.mouse.get_pos()
            
            if self.resume_button.is_clicked(pos):
                return 'resume'
            elif self.main_menu_button.is_clicked(pos):
                return 'main_menu'
            elif self.quit_button.is_clicked(pos):
                return 'quit'
        
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                return 'resume'
        
        return None
    
    def draw(self):
        """Draw pause menu with semi-transparent overlay"""
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(150)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        title = self.font_title.render('PAUSED', True, self.accent_color)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 100))
        self.screen.blit(title, title_rect)
        
        for button in self.buttons:
            button.draw(self.screen)
        
        hint = self.font_small.render('Press ESC to resume', True, (150, 150, 150))
        hint_rect = hint.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 50))
        self.screen.blit(hint, hint_rect)
