from dictionary import *

def remove_flowers(tiles):
    no_flower_tiles = tiles.copy()
    keys_to_delete = []
    for key in no_flower_tiles:
        if key in FLOWER_DICT:
            keys_to_delete.append(key)
    
    for key in keys_to_delete:
        del no_flower_tiles[key]

    return no_flower_tiles

def clean_tiles(tiles):
    return {key: value for key, value in tiles.items() if value > 0}

def check_is_special_hu(validated_deck):
    hu_type = validated_deck['hu_type']
    is_special_hu = hu_type in (sixteen_bd_hu, thirteen_waist_hu, ligu_hu, flower_hu)
    return is_special_hu

def remove_and_count_jokers(no_flower_tiles):
    no_joker_tiles = no_flower_tiles.copy()
    if JOKER_DICT in no_joker_tiles:
        return no_joker_tiles.pop(JOKER_DICT), no_joker_tiles
    
    return 0, no_joker_tiles

def find_tiles_that_complete_set(incomplete_set):
    if len(incomplete_set) > 2: 
        return {}
    
    #Eyes 
    if len(incomplete_set) == 1:
        return {'complete_type' : EYES_DICT,'tiles': [incomplete_set[0]]}

    #Pong
    if incomplete_set[0] == incomplete_set[1]:
        return {'complete_type' : PONG_DICT, 'tiles': [incomplete_set[0]]}

    #Shang 
    if incomplete_set[0] != incomplete_set[1]:  
        suit = incomplete_set[0][0]
        incomplete_set = sorted(incomplete_set, key=lambda x: MST_DICT[x])
        num1 = MST_DICT[incomplete_set[0]]
        num2 = MST_DICT[incomplete_set[1]]
    
        possible = []
        
        if num1 + 1 == num2:
            if num1 - 1 > 0:
                possible.append(f'{suit}{num1 - 1}')
            if num2 + 1 < 10:
                possible.append(f'{suit}{num2 + 1}')
            return {'complete_type' : SHANG_DICT, 'tiles': possible}
        else:
            return {'complete_type' : SHANG_DICT, 'tiles': [f'{suit}{num1 + 1}']}