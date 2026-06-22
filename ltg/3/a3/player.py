import pygame
from settings import *
from movement import Movement

class Player(pygame.sprite.Sprite):
    def __init__(self, pos, groups, obstacle_sprites, player_surfaces, key_bindings=None):
        super().__init__(groups)
        self.surfaces = player_surfaces
        self.image = self.surfaces['player_default']
        self.normal_surf = self.image
        self.rect = self.image.get_rect(topleft = pos)
        
        self.is_big = False
        try:
            full_surf = pygame.image.load("Assets/graphics/Big_One.png").convert_alpha()
            self.big_surf = pygame.transform.scale(full_surf, (82, 140))
        except:
            self.big_surf = pygame.Surface((82, 140))
            self.big_surf.fill('Red')
            
        self.obstacle_sprites = obstacle_sprites
        self.display_surface = pygame.display.get_surface()
        self.m = Movement(self, key_bindings)
        
        self.on_ground = False
        self.on_wall = False
        self.facing_right = True
        self.is_dead = False
        self.rotation_angle = 0
        self.remainder_x = 0.0
        self.remainder_y = 0.0

    def die(self):
        if not self.is_dead:
            self.is_dead = True
            self.image = self.surfaces['player_die']
            self.m.direction.y = -12
            self.obstacle_sprites = [] 

    def grow(self):
        if not self.is_big:
            self.is_big = True
            self.rect = self.big_surf.get_rect(midbottom = self.rect.midbottom)

    def shrink(self):
        if self.is_big:
            self.is_big = False
            self.rect = self.normal_surf.get_rect(midbottom = self.rect.midbottom)

    def animate(self):
        if self.is_dead:
            img = self.surfaces['player_die']
        elif self.is_big:
            img = self.big_surf
        elif self.m.is_dashing:
            img = self.surfaces['player_dash']
        elif not self.on_ground:
            img = self.surfaces['player_jump']
        else:
            img = self.surfaces['player_default']

        if not self.facing_right:
            img = pygame.transform.flip(img, True, False)

        self.image = img
        
        curr_bottom = self.rect.bottom
        curr_centerx = self.rect.centerx
        self.rect = self.image.get_rect(midbottom = (curr_centerx, curr_bottom))

    def update(self, *args):
        if self.is_dead:
            self.m.direction.y += 0.5 
            self.rect.y += int(self.m.direction.y)
            self.animate()
            return

        self.m.check_dash_status()
        self.m.input(pygame.key.get_pressed())
        
        if self.m.direction.x > 0: self.facing_right = True
        elif self.m.direction.x < 0: self.facing_right = False

        speed = DASH_SPEED if self.m.is_dashing else PLAYER_SPEED
        
        move_x = (self.m.direction.x * speed) + self.remainder_x
        move_int_x = int(move_x)
        self.remainder_x = move_x - move_int_x
        self.rect.x += move_int_x
        self.horizontal_collision()
        
        if self.m.is_dashing:
            move_y = (self.m.direction.y * speed) + self.remainder_y
        else:
            self.m.apply_gravity()
            move_y = self.m.direction.y + self.remainder_y
            
        move_int_y = int(move_y)
        self.remainder_y = move_y - move_int_y
        self.rect.y += move_int_y
        self.vertical_collision()
            
        self.animate()

    def horizontal_collision(self):
        self.on_wall = False
        for sprite in self.obstacle_sprites:
            if sprite.rect.colliderect(self.rect):
                if self.m.direction.x > 0: 
                    self.rect.right = sprite.rect.left
                    self.remainder_x = 0 
                elif self.m.direction.x < 0: 
                    self.rect.left = sprite.rect.right
                    self.remainder_x = 0 

        side_check = 4
        left_rect = pygame.Rect(self.rect.left - side_check, self.rect.top + 4, side_check, self.rect.height - 8)
        right_rect = pygame.Rect(self.rect.right, self.rect.top + 4, side_check, self.rect.height - 8)

        for sprite in self.obstacle_sprites:
            if not self.on_ground:
                if sprite.rect.colliderect(right_rect):
                    self.on_wall = True
                    self.facing_right = True
                elif sprite.rect.colliderect(left_rect):
                    self.on_wall = True
                    self.facing_right = False

    def vertical_collision(self):
        self.old_on_ground = self.on_ground
        self.on_ground = False
        
        for sprite in self.obstacle_sprites:
            if sprite.rect.colliderect(self.rect):
                if self.m.direction.y > 0:
                    self.rect.bottom = sprite.rect.top
                    self.m.direction.y = 0
                    self.remainder_y = 0 
                    self.on_ground = True
                elif self.m.direction.y < 0:
                    self.rect.top = sprite.rect.bottom
                    self.m.direction.y = 0
                    self.remainder_y = 0 

        if not self.on_ground and self.old_on_ground and self.m.direction.y >= 0:
            check_rect = self.rect.move(0, 1)
            for sprite in self.obstacle_sprites:
                if sprite.rect.colliderect(check_rect):
                    self.on_ground = True
                    self.m.direction.y = 0
                    self.remainder_y = 0
                    break

    def draw_stamina(self, offset):
        if self.is_dead: return
        if self.m.stamina < self.m.stamina_max:
            bar_width = (self.m.stamina / self.m.stamina_max) * 24
            bar_rect = pygame.Rect(self.rect.left - offset.x, self.rect.top - 15 - offset.y, bar_width, 5)
            color = 'red' if self.m.stamina < 100 else 'yellow' if self.m.stamina < 200 else 'green'
            pygame.draw.rect(self.display_surface, color, bar_rect)