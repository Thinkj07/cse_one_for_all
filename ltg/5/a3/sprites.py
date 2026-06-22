import pygame
from settings import *

class StaticTile(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface):
        super().__init__()
        self.image = surface
        self.rect = self.image.get_rect(topleft=pos)

class Enemy(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface, collision_sprites):
        super().__init__()
        self.frames = []
        f_w, f_h = 59, 97
        sheet_width = surface.get_width()
        
        if sheet_width >= f_w:
            for x in range(0, sheet_width, f_w):
                frame_surf = pygame.Surface((f_w, f_h), pygame.SRCALPHA)
                frame_surf.blit(surface, (0, 0), pygame.Rect(x, 0, f_w, f_h))
                self.frames.append(frame_surf)
        else:
            self.frames.append(surface)
            
        self.frame_index = 0
        self.animation_speed = 0.15
        self.image = self.frames[self.frame_index]
        self.rect = self.image.get_rect(bottomleft=(pos[0], pos[1] + size)) 
        self.direction = 1
        self.speed = 2
        self.collision_sprites = collision_sprites

    def animate(self):
        self.frame_index += self.animation_speed
        if self.frame_index >= len(self.frames): self.frame_index = 0
        img = self.frames[int(self.frame_index)]
        self.image = pygame.transform.flip(img, True, False) if self.direction < 0 else img

    def check_collisions(self):
        self.rect.x += self.direction * self.speed
        for sprite in self.collision_sprites:
            if type(sprite).__name__ != 'RemotePlayer' and sprite.rect.colliderect(self.rect):
                if self.direction > 0: self.rect.right = sprite.rect.left
                else: self.rect.left = sprite.rect.right
                self.direction *= -1
                return 

        l_check = pygame.Rect(self.rect.centerx + (self.direction * 16), self.rect.bottom + 1, 2, 2)
        if not any(type(s).__name__ != 'RemotePlayer' and s.rect.colliderect(l_check) for s in self.collision_sprites):
            self.direction *= -1

    def update(self, *args):
        self.animate()
        self.check_collisions()

class Enemy01(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface, collision_sprites):
        super().__init__()
        self.frames = []
        f_w, f_h = 20, 20
        sheet_width = surface.get_width()
        
        for x in range(0, sheet_width, f_w):
            frame_surf = pygame.Surface((f_w, f_h), pygame.SRCALPHA)
            frame_surf.blit(surface, (0, 0), pygame.Rect(x, 0, f_w, f_h))
            scaled_surf = pygame.transform.scale(frame_surf, (size, size))
            self.frames.append(scaled_surf)
            
        self.frame_index = 0
        self.animation_speed = 0.15
        self.image = self.frames[self.frame_index]
        self.rect = self.image.get_rect(bottomleft=(pos[0], pos[1] + size))
        self.direction = 1
        self.speed = 2
        self.collision_sprites = collision_sprites

    def animate(self):
        self.frame_index += self.animation_speed
        if self.frame_index >= len(self.frames): self.frame_index = 0
        img = self.frames[int(self.frame_index)]
        self.image = pygame.transform.flip(img, True, False) if self.direction < 0 else img

    def check_collisions(self):
        self.rect.x += self.direction * self.speed
        for sprite in self.collision_sprites:
            if type(sprite).__name__ != 'RemotePlayer' and sprite.rect.colliderect(self.rect):
                if self.direction > 0: self.rect.right = sprite.rect.left
                else: self.rect.left = sprite.rect.right
                self.direction *= -1
                return 

        l_check = pygame.Rect(self.rect.centerx + (self.direction * 16), self.rect.bottom + 1, 2, 2)
        if not any(type(s).__name__ != 'RemotePlayer' and s.rect.colliderect(l_check) for s in self.collision_sprites):
            self.direction *= -1

    def update(self, *args):
        self.animate()
        self.check_collisions()

class CrumblingPlatform(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface):
        super().__init__()
        self.image = surface.copy() if surface else pygame.Surface((size, size))
        self.rect = self.image.get_rect(topleft=pos)
        self.pos = pygame.math.Vector2(pos)
        self.velocity_y = 0
        self.gravity = 0.8
        self.activated = False

    def update(self, *args):
        if self.activated:
            self.velocity_y += self.gravity
            self.pos.y += self.velocity_y
            self.rect.y = int(self.pos.y)
            if self.rect.top > SCREEN_HEIGHT * 1.5:
                self.kill()

    def start_crumbling(self, group):
        if not self.activated:
            self.activated = True
            for sprite in group:
                if not sprite.activated:
                    distance = self.pos.distance_to(sprite.pos)
                    if distance <= TILE_SIZE + 2: 
                        sprite.start_crumbling(group)