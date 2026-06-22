import pygame
from settings import *
from player import Player
from sprites import StaticTile, Enemy, Enemy01, CrumblingPlatform 
from item import Item, Item01, Item02, SurpriseBlock, HiddenBlock

class CameraGroup(pygame.sprite.Group):
    def __init__(self, map_data):
        super().__init__()
        self.display_surface = pygame.display.get_surface()
        self.offset = pygame.math.Vector2()
        self.map_height = len(map_data) * TILE_SIZE

    def custom_draw(self, player):
        self.offset.x = player.rect.centerx - SCREEN_WIDTH // 2
        
        if self.map_height < SCREEN_HEIGHT:
            self.offset.y = self.map_height - SCREEN_HEIGHT
        else:
            self.offset.y = player.rect.centery - (SCREEN_HEIGHT * 2 // 3)
            if self.offset.y < 0: self.offset.y = 0
            if self.offset.y > self.map_height - SCREEN_HEIGHT:
                self.offset.y = self.map_height - SCREEN_HEIGHT

        for sprite in self.sprites():
            offset_pos = sprite.rect.topleft - self.offset
            self.display_surface.blit(sprite.image, offset_pos)

class Level:
    def __init__(self, level_data, surface_dict, trigger_next_level, key_bindings=None): 
        self.display_surface = pygame.display.get_surface()
        self.level_data = level_data
        self.surfaces = surface_dict
        self.trigger_next_level = trigger_next_level
        self.key_bindings = key_bindings or {}
        
        self.visible_sprites = CameraGroup(self.level_data)
        self.collision_sprites = pygame.sprite.Group()
        self.item_sprites = pygame.sprite.Group()
        self.enemy_sprites = pygame.sprite.Group()
        self.goal_sprites = pygame.sprite.Group()
        self.spike_sprites = pygame.sprite.Group()
        self.bounce_sprites = pygame.sprite.Group()
        self.door_sprites = pygame.sprite.Group()
        self.crumble_sprites = pygame.sprite.Group()
        self.surprise_blocks = pygame.sprite.Group()
        self.trap_sprites = pygame.sprite.Group()
        self.hidden_blocks = pygame.sprite.Group()
        
        self.has_key = False
        self.death_count = 0
        self.coins_collected = 0

        self.death_screen_active = False
        self.death_screen_start = 0
        self.death_screen_duration = 3000

        try:
            self.dead_sound = pygame.mixer.Sound('Assets/dead_sound.mp3')
        except Exception:
            self.dead_sound = None

        self.setup_level()

    def setup_level(self):
        for row_index, row in enumerate(self.level_data):
            for col_index, cell in enumerate(row):
                x = col_index * TILE_SIZE
                y = row_index * TILE_SIZE
                
                if cell == 'X':
                    tile = StaticTile((x, y), TILE_SIZE, self.surfaces['tile'])
                    self.collision_sprites.add(tile); self.visible_sprites.add(tile)
                elif cell == 'B':
                    tile = StaticTile((x, y), TILE_SIZE, self.surfaces['bg_tile'])
                    self.visible_sprites.add(tile)
                elif cell == 'P':
                    p_surfs = {
                        'player_default': self.surfaces['player_default'],
                        'player_jump': self.surfaces['player_jump'],
                        'player_die': self.surfaces['player_die'],
                        'player_dash': self.surfaces['player_dash']
                    }
                    self.player = Player((x, y), [self.visible_sprites], self.collision_sprites, p_surfs, self.key_bindings)
                elif cell == 'C':
                    item = Item((x, y), TILE_SIZE, self.surfaces['coin'], 'coin')
                    self.item_sprites.add(item); self.visible_sprites.add(item)
                elif cell == 'S':
                    item = Item((x, y), TILE_SIZE, self.surfaces['star'], 'star')
                    self.item_sprites.add(item); self.visible_sprites.add(item)
                elif cell == 'K':
                    item = Item((x, y), TILE_SIZE, self.surfaces['key'], 'key')
                    self.item_sprites.add(item); self.visible_sprites.add(item)
                elif cell == 'E':
                    enemy = Enemy((x, y), TILE_SIZE, self.surfaces['enemy'], self.collision_sprites)
                    self.enemy_sprites.add(enemy); self.visible_sprites.add(enemy)
                elif cell == '^':
                    spike = StaticTile((x, y), TILE_SIZE, self.surfaces['spike'])
                    self.spike_sprites.add(spike); self.visible_sprites.add(spike)
                elif cell == 'J':
                    bounce = StaticTile((x, y), TILE_SIZE, self.surfaces['bounce'])
                    self.bounce_sprites.add(bounce); self.visible_sprites.add(bounce)
                elif cell == 'D':
                    door = StaticTile((x, y), TILE_SIZE, self.surfaces['door'])
                    self.door_sprites.add(door); self.collision_sprites.add(door); self.visible_sprites.add(door)
                elif cell == 'G':
                    goal = StaticTile((x, y), TILE_SIZE, self.surfaces['goal'])
                    self.goal_sprites.add(goal); self.visible_sprites.add(goal)
                elif cell == 'F':
                    surf = self.surfaces.get('crumble', self.surfaces.get('tile'))
                    crumble = CrumblingPlatform((x, y), TILE_SIZE, surf)
                    self.crumble_sprites.add(crumble); self.visible_sprites.add(crumble); self.collision_sprites.add(crumble)
                elif cell in ['Q', 'W']:
                    item_type = 'trap' if cell == 'Q' else 'item01'
                    q_normal = self.surfaces.get('q_normal')
                    q_popped = self.surfaces.get('q_popped')
                    block = SurpriseBlock((x, y), TILE_SIZE, q_normal, q_popped, item_type, self.surfaces)
                    self.surprise_blocks.add(block); self.visible_sprites.add(block); self.collision_sprites.add(block)
                elif cell == 'M':
                    m_surf = self.surfaces.get('Item02')
                    mushroom = Item02((x, y), TILE_SIZE, m_surf)
                    self.item_sprites.add(mushroom); self.visible_sprites.add(mushroom)
                elif cell == '1':
                    e_surf = self.surfaces.get('Enemy01')
                    enemy = Enemy01((x, y), TILE_SIZE, e_surf, self.collision_sprites)
                    self.enemy_sprites.add(enemy); self.visible_sprites.add(enemy)
                elif cell == 'H':
                    h_surf = self.surfaces.get('q_popped')
                    h_block = HiddenBlock((x, y), TILE_SIZE, h_surf)
                    self.hidden_blocks.add(h_block); self.visible_sprites.add(h_block)

    def trigger_death(self):
        if not self.player.is_dead:
            self.death_count += 1
            self.player.die()
            self.death_screen_active = True
            self.death_screen_start = pygame.time.get_ticks()
            if self.dead_sound:
                self.dead_sound.play()

    def draw_death_screen(self):
        self.display_surface.fill((0, 0, 0))

        player_img = self.surfaces['player_default']
        scale = 4
        big_img = pygame.transform.scale(
            player_img,
            (player_img.get_width() * scale, player_img.get_height() * scale)
        )
        img_rect = big_img.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 40))
        self.display_surface.blit(big_img, img_rect)

        font = pygame.font.SysFont('Arial', 52, bold=True)
        death_text = font.render(f'Deaths: {self.death_count}', True, (255, 50, 50))
        text_rect = death_text.get_rect(center=(SCREEN_WIDTH // 2, img_rect.bottom + 40))
        self.display_surface.blit(death_text, text_rect)

    def reset(self):
        self.visible_sprites.empty()
        self.collision_sprites.empty()
        self.item_sprites.empty()
        self.enemy_sprites.empty()
        self.goal_sprites.empty()
        self.spike_sprites.empty()
        self.bounce_sprites.empty()
        self.door_sprites.empty()
        self.crumble_sprites.empty()
        self.surprise_blocks.empty()
        self.trap_sprites.empty()
        self.hidden_blocks.empty()
        self.has_key = False
        self.setup_level()

    def interaction(self):
        if self.player.is_dead:
            return

        for h_block in self.hidden_blocks:
            if not h_block.is_revealed:
                head_rect = self.player.rect.move(0, -2)
                if h_block.rect.colliderect(head_rect) and self.player.m.direction.y < 0:
                    h_block.reveal(self.collision_sprites)
                    self.player.rect.top = h_block.rect.bottom
                    self.player.m.direction.y = 0
                    self.player.remainder_y = 0

        for block in self.surprise_blocks:
            if not block.is_popped:
                head_rect = pygame.Rect(self.player.rect.left + 5, self.player.rect.top - 5, self.player.rect.width - 10, 10)
                if block.rect.colliderect(head_rect) and self.player.m.direction.y <= 0:
                    block.spawn_trap(self.trap_sprites, self.visible_sprites, self.collision_sprites, self.item_sprites)
                    self.player.rect.top = block.rect.bottom
                    self.player.m.direction.y = 0
                    self.player.remainder_y = 0

        for death_sprite in list(self.spike_sprites) + list(self.trap_sprites):
            if death_sprite.rect.colliderect(self.player.rect):
                if getattr(self.player, 'is_big', False):
                    death_sprite.kill()
                else:
                    self.trigger_death()
                    return

        for platform in self.crumble_sprites:
            if platform.rect.colliderect(self.player.rect.move(0, 2)) and self.player.on_ground:
                platform.start_crumbling(self.crumble_sprites)
            if platform.activated and platform in self.collision_sprites:
                self.collision_sprites.remove(platform)

        items_hit = pygame.sprite.spritecollide(self.player, self.item_sprites, False)
        for item in items_hit:
            if isinstance(item, Item02):
                if hasattr(self.player, 'grow'): self.player.grow()
                item.kill()
            elif isinstance(item, Item01):
                self.trigger_death()
                return

        if getattr(self.player, 'is_big', False):
            if self.player.on_ground or self.player.m.direction.y > 0:
                foot_rect = self.player.rect.inflate(15, 0)
                foot_rect.bottom = self.player.rect.bottom + 10
                targets = list(self.collision_sprites) + list(self.surprise_blocks) + list(self.spike_sprites)
                for sprite in targets:
                    if sprite.rect.colliderect(foot_rect):
                        if sprite != self.player:
                            sprite.kill()
                            if sprite in self.collision_sprites:
                                self.collision_sprites.remove(sprite)

        for enemy in self.enemy_sprites.sprites():
            if pygame.sprite.spritecollide(enemy, self.trap_sprites, False) or \
               pygame.sprite.spritecollide(enemy, self.spike_sprites, False):
                enemy.kill()
                continue
            for block in self.surprise_blocks:
                if block.rect.colliderect(enemy.rect.move(0, -2)) and block.rect.bottom <= enemy.rect.top + 5:
                    enemy.kill()
                    break
            if enemy.rect.colliderect(self.player.rect):
                if self.player.m.direction.y > 0 and self.player.rect.bottom <= enemy.rect.bottom + 10:
                    enemy.kill()
                    self.player.m.direction.y = JUMP_SPEED * 0.8
                    self.player.m.has_dashed = False 
                else:
                    self.trigger_death()
                    break 

        for bounce in self.bounce_sprites.sprites():
            if bounce.rect.colliderect(self.player.rect):
                self.player.m.direction.y = -16
                self.player.m.is_dashing = False
                self.player.m.has_dashed = False
                self.player.rect.bottom = bounce.rect.top

        collided_items = pygame.sprite.spritecollide(self.player, self.item_sprites, False)
        for item in collided_items:
            if isinstance(item, Item):
                if item.item_type == 'key' and not item.is_following:
                    self.has_key = True
                    item.is_following = True
                    item.target = self.player
                elif item.item_type in ['coin', 'star']:
                    if item.item_type == 'coin':
                        self.coins_collected += 1
                    item.kill()

        if self.has_key:
            for door in self.door_sprites.sprites():
                if self.player.rect.inflate(10, 10).colliderect(door.rect):
                    door.kill()
                    self.has_key = False
                    for item in self.item_sprites.sprites():
                        if isinstance(item, Item) and item.item_type == 'key' and item.is_following:
                            item.kill()

        if pygame.sprite.spritecollide(self.player, self.goal_sprites, False):
            self.trigger_next_level()

        if self.player.rect.top > self.visible_sprites.map_height:
            self.trigger_death()

    def run(self):
        if self.death_screen_active:
            elapsed = pygame.time.get_ticks() - self.death_screen_start
            if elapsed >= self.death_screen_duration:
                self.death_screen_active = False
                self.reset()
            else:
                self.draw_death_screen()
            return

        self.visible_sprites.update(self.player.rect.center)
        self.interaction()
        self.visible_sprites.custom_draw(self.player)
        self.player.draw_stamina(self.visible_sprites.offset)
        self.draw_death_counter()
        self.draw_coins_counter()
    
    def draw_death_counter(self):
        """Draw the death counter on the screen"""
        font = pygame.font.SysFont('Arial', 28, bold=True)
        death_text = font.render(f'Deaths: {self.death_count}', True, (255, 50, 50))
        death_rect = death_text.get_rect(topleft=(20, 20))
        
        # Draw background
        bg_rect = death_rect.inflate(20, 20)
        pygame.draw.rect(self.display_surface, (0, 0, 0), bg_rect, border_radius=8)
        pygame.draw.rect(self.display_surface, (150, 50, 50), bg_rect, 2, border_radius=8)
        
        self.display_surface.blit(death_text, death_rect)
    
    def draw_coins_counter(self):
        """Draw the coins counter on the screen"""
        font = pygame.font.SysFont('Arial', 28, bold=True)
        coins_text = font.render(f'Gold: {self.coins_collected}', True, (255, 215, 0))
        coins_rect = coins_text.get_rect(topleft=(20, 70))
        
        # Draw background
        bg_rect = coins_rect.inflate(20, 20)
        pygame.draw.rect(self.display_surface, (0, 0, 0), bg_rect, border_radius=8)
        pygame.draw.rect(self.display_surface, (150, 120, 0), bg_rect, 2, border_radius=8)
        
        self.display_surface.blit(coins_text, coins_rect)