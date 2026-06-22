import pygame
import math
from settings import *

class Item(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface, item_type):
        super().__init__()
        self.item_type = item_type
        self.frames = []
        self.frame_index = 0
        self.animation_speed = 0.15
        self.is_following = False
        self.target = None
        self.base_y = pos[1]

        if surface:
            if self.item_type in ['coin', 'star']:
                f_w, f_h = (80, 80) if self.item_type == 'coin' else (50, 49)
                t_w, t_h = (24, 24) if self.item_type == 'coin' else (28, 28)
                sheet_w = surface.get_width()
                if sheet_w >= f_w:
                    for x in range(0, sheet_w, f_w):
                        frame_surf = pygame.Surface((f_w, f_h), pygame.SRCALPHA)
                        frame_surf.blit(surface, (0, 0), pygame.Rect(x, 0, f_w, f_h))
                        self.frames.append(pygame.transform.scale(frame_surf, (t_w, t_h)))
                else: self.frames.append(pygame.transform.scale(surface, (t_w, t_h)))
            else: self.frames.append(surface)
        else:
            temp_surf = pygame.Surface((size, size))
            temp_surf.fill('yellow')
            self.frames.append(temp_surf)

        self.image = self.frames[self.frame_index]
        self.rect = self.image.get_rect(center=pos)

    def animate(self):
        self.frame_index += self.animation_speed
        if self.frame_index >= len(self.frames): self.frame_index = 0
        self.image = self.frames[int(self.frame_index)]

    def floating_effect(self):
        time = pygame.time.get_ticks()
        self.rect.centery = self.base_y + math.sin(time / 200) * 5

    def trailing_effect(self, player_pos):
        if self.target and player_pos:
            facing_right = getattr(self.target, 'facing_right', True)
            offset_x = -30 if facing_right else 30
            target_v = pygame.math.Vector2(player_pos[0] + offset_x, player_pos[1] - 20)
            current_v = pygame.math.Vector2(self.rect.center)
            new_pos = current_v.lerp(target_v, 0.15)
            self.rect.center = (int(new_pos.x), int(new_pos.y))

    def update(self, *args):
        player_pos = args[0] if args else None
        if self.item_type in ['coin', 'star'] and len(self.frames) > 1: self.animate()
        if self.item_type == 'key':
            if not self.is_following: self.floating_effect()
            else: self.trailing_effect(player_pos)

class Item01(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface, collision_sprites):
        super().__init__()
        self.frames = []
        f_w, f_h = 97, 92
        if surface:
            if surface.get_width() >= f_w:
                for i in range(surface.get_width() // f_w):
                    frame_surf = pygame.Surface((f_w, f_h), pygame.SRCALPHA)
                    frame_surf.blit(surface, (0, 0), pygame.Rect(i * f_w, 0, f_w, f_h))
                    self.frames.append(pygame.transform.scale(frame_surf, (size, size)))
            else: self.frames.append(pygame.transform.scale(surface, (size, size)))
        else:
            temp_surf = pygame.Surface((size, size))
            temp_surf.fill('green')
            self.frames.append(temp_surf)

        self.frame_index = 0
        self.animation_speed = 0.15
        self.image = self.frames[self.frame_index]
        self.rect = self.image.get_rect(topleft=pos)
        self.direction = 1
        self.speed = 1
        self.collision_sprites = collision_sprites

    def animate(self):
        if len(self.frames) > 1:
            self.frame_index += self.animation_speed
            if self.frame_index >= len(self.frames): self.frame_index = 0
            self.image = self.frames[int(self.frame_index)]

    def update(self, *args):
        self.animate()
        self.rect.x += self.direction * self.speed
        for sprite in self.collision_sprites:
            if sprite.rect.colliderect(self.rect):
                if self.direction > 0: self.rect.right = sprite.rect.left
                else: self.rect.left = sprite.rect.right
                self.direction *= -1
                return
        l_check = pygame.Rect(self.rect.centerx + (self.direction * 16), self.rect.bottom + 1, 2, 2)
        if not any(s.rect.colliderect(l_check) for s in self.collision_sprites): self.direction *= -1

class SurpriseBlock(pygame.sprite.Sprite):
    def __init__(self, pos, size, surf_normal, surf_popped, item_type='trap', surfaces=None):
        super().__init__()
        self.image = surf_normal if surf_normal else pygame.Surface((size, size))
        self.surf_popped = surf_popped if surf_popped else pygame.Surface((size, size))
        self.rect = self.image.get_rect(topleft=pos)
        self.is_popped = False
        self.item_type = item_type
        self.surfaces = surfaces

    def spawn_trap(self, trap_group, visible_group, collision_group, item_group=None):
        if not self.is_popped:
            self.is_popped = True
            self.image = self.surf_popped
            spawn_pos = (self.rect.x, self.rect.y - self.rect.height)
            
            if self.item_type == 'item01':
                img = self.surfaces.get('Item01')
                item = Item01(spawn_pos, self.rect.width, img, collision_group)
                if item_group is not None: item_group.add(item)
                visible_group.add(item)
            else:
                img = self.surfaces.get('Item02')
                item = Item02(spawn_pos, self.rect.width, img)
                if item_group is not None: item_group.add(item)
                visible_group.add(item)

class Item02(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface):
        super().__init__()
        if surface:
            self.image = pygame.transform.scale(surface, (size, size))
        else:
            self.image = pygame.Surface((size, size))
            self.image.fill('pink')
        self.rect = self.image.get_rect(topleft = pos)

    def update(self, *args):
        pass

class HiddenBlock(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface_popped):
        super().__init__()
        self.image = pygame.Surface((size, size), pygame.SRCALPHA)
        self.rect = self.image.get_rect(topleft=pos)
        self.surface_popped = surface_popped if surface_popped else pygame.Surface((size, size))
        self.is_revealed = False

    def reveal(self, collision_group):
        if not self.is_revealed:
            self.is_revealed = True
            self.image = self.surface_popped
            collision_group.add(self)

    def update(self, *args):
        pass

class TrapDoor(pygame.sprite.Sprite):
    def __init__(self, pos, size, surface):
        super().__init__()
        if surface:
            self.image = pygame.transform.scale(surface, (size, size))
        else:
            self.image = pygame.Surface((size, size))
            self.image.fill('gray')
        self.rect = self.image.get_rect(topleft=pos)

    def update(self, *args):
        pass