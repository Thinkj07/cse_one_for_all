import pygame
from os import walk

def import_folder(path):
    surface_list = []
    for _, __, img_files in walk(path):
        for image in sorted(img_files):
            full_path = path + '/' + image
            image_surf = pygame.image.load(full_path).convert_alpha()
            surface_list.append(image_surf)
    return surface_list

def import_cut_graphics(path, size_x=32, size_y=32):
    surface = pygame.image.load(path).convert_alpha()
    tile_num_x = int(surface.get_size()[0] / size_x)
    tile_num_y = int(surface.get_size()[1] / size_y)
    
    cut_tiles = []
    for row in range(tile_num_y):
        for col in range(tile_num_x):
            x = col * size_x
            y = row * size_y
            new_surf = pygame.Surface((size_x, size_y), flags=pygame.SRCALPHA)
            new_surf.blit(surface, (0, 0), pygame.Rect(x, y, size_x, size_y))
            cut_tiles.append(new_surf)
    return cut_tiles

def import_sprite_sheet(path, frame_width, frame_height):
    surface = pygame.image.load(path).convert_alpha()
    sheet_width = surface.get_width()
    frames = []
    
    for x in range(0, sheet_width, frame_width):
        frame_surf = pygame.Surface((frame_width, frame_height), pygame.SRCALPHA)
        frame_surf.blit(surface, (0, 0), pygame.Rect(x, 0, frame_width, frame_height))
        frames.append(frame_surf)
        
    return frames