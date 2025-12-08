from dictionary import *
from helpers import remove_flowers, clean_tiles, remove_and_count_jokers
from itertools import combinations, product

class DeckValidatorJoker:
    def __init__(self, winner_tiles):
        self.winner_tiles = clean_tiles(winner_tiles)
        self.winner_tiles_no_flower = clean_tiles(remove_flowers(winner_tiles))
        self.joker_number, self.winner_tiles_no_joker_no_flower = remove_and_count_jokers(self.winner_tiles_no_flower)
        self.possibleDecks = []

    def full_check(self):
        #Check flower hu
        flower_results = self.flower_hu_check(self.winner_tiles)
        if flower_results:
            self.possibleDecks.append(flower_results)

        #Check there are 17 or more tiles
        if self.card_count(self.winner_tiles_no_flower) < 17 and not flower_results:
            return False
        
        #Check 16bd
        sixteen_bd_results = self.sixteen_bd_check(self.winner_tiles_no_joker_no_flower,self.joker_number)
        if sixteen_bd_results:
            self.possibleDecks.extend(sixteen_bd_results)

        #Check 13 waist
        thirteen_results = self.thirteen_waist_check(self.winner_tiles_no_joker_no_flower,self.joker_number)
        if thirteen_results:
            self.possibleDecks.extend(thirteen_results)

        #Check Ligu
        ligu_results = self.ligu_check(self.winner_tiles_no_joker_no_flower,self.joker_number)
        if ligu_results:
            self.possibleDecks.extend(ligu_results)
        
        #Check Standard, uses extend because there can be multiple iterations
        standard_results = self.standard_check(self.winner_tiles_no_joker_no_flower,self.joker_number)
        if standard_results:
            self.possibleDecks.extend(standard_results)

        return len(self.possibleDecks) > 0

    def card_count(self, tiles):
        count = 0

        for _, value in tiles.items():
            count += value

        return count
    
    def flower_hu_check(self, tiles):
        flowers = []

        for key in tiles:
            if key in FLOWER_DICT:
                flowers.append(key)

        if len(flowers) >= 7:
            return {'hu_type': flower_hu, 'flowers': flowers}

        return []
    
    def ligu_check(self, tiles, joker_number):
        if (self.card_count(tiles) + joker_number) != 17:
            return []

        base_counts = tiles.copy()
        results = []
        seen_decks = set()

        def pairs_needed_remaining(counts, jokers_left, needed_pairs):
            return (self.card_count(counts) + jokers_left) >= needed_pairs * 2

        def pair_dfs(start_idx, counts, jokers_left, pairs_needed, current_pairs, collected):
            if pairs_needed == 0:
                collected.append([pair.copy() for pair in current_pairs])
                return

            if start_idx >= len(ALL_TILES):
                return

            if not pairs_needed_remaining(counts, jokers_left, pairs_needed):
                return

            for idx in range(start_idx, len(ALL_TILES)):
                tile = ALL_TILES[idx]
                available = counts.get(tile, 0)

                if available >= 2:
                    counts[tile] = available - 2
                    if counts[tile] == 0:
                        counts.pop(tile, None)
                    current_pairs.append([tile, tile])
                    pair_dfs(idx, counts, jokers_left, pairs_needed - 1, current_pairs, collected)
                    current_pairs.pop()
                    counts[tile] = available

                if available >= 1 and jokers_left >= 1:
                    counts[tile] = available - 1
                    if counts[tile] == 0:
                        counts.pop(tile, None)
                    current_pairs.append([tile, tile])
                    pair_dfs(idx, counts, jokers_left - 1, pairs_needed - 1, current_pairs, collected)
                    current_pairs.pop()
                    counts[tile] = available

                if jokers_left >= 2:
                    current_pairs.append([tile, tile])
                    pair_dfs(idx, counts, jokers_left - 2, pairs_needed - 1, current_pairs, collected)
                    current_pairs.pop()

        for triplet_tile in ALL_TILES:
            available = base_counts.get(triplet_tile, 0)
            max_joker_use = min(3, joker_number)

            for joker_used_for_triplet in range(0, max_joker_use + 1):
                real_needed = 3 - joker_used_for_triplet
                if real_needed < 0:
                    continue
                if available < real_needed:
                    continue

                remaining_jokers = joker_number - joker_used_for_triplet
                counts_after_triplet = base_counts.copy()
                counts_after_triplet[triplet_tile] = available - real_needed
                if counts_after_triplet[triplet_tile] == 0:
                    counts_after_triplet.pop(triplet_tile, None)

                pair_solutions = []
                pair_dfs(0, counts_after_triplet, remaining_jokers, 7, [], pair_solutions)

                for pairs in pair_solutions:
                    full_tiles = [pair.copy() for pair in pairs]
                    full_tiles.append([triplet_tile, triplet_tile, triplet_tile])
                    normalized = tuple(sorted((tuple(group) for group in full_tiles), key=lambda grp: (len(grp), grp)))

                    if normalized in seen_decks:
                        continue

                    seen_decks.add(normalized)
                    ordered_tiles = [list(group) for group in normalized]
                    results.append({'hu_type': ligu_hu, 'eyes': None, 'tiles': ordered_tiles})

        return results

    
    def sixteen_bd_check(self, tiles, joker_number):
        if ((self.card_count(tiles) + joker_number) != 17): return []

        #Check more than 1 pair
        dap_for_eyes = 0
        eyes = [key for key, value in tiles.items() if value == 2]
        if len(eyes) > 1: return []
        if len(eyes) < 1: dap_for_eyes += 1

        missing_tiles = []
        #Check it has all wind and zfb
        for key in WIND_DICT:
            if key not in tiles:
                missing_tiles.append(key)
            
        for key in ZFB_DICT:
            if key not in tiles:
                missing_tiles.append(key)

        #Check at least separated by 3 for m,s,t.
        def sixteenbd_helper(dictionary, suit):
            present = [False] * 10
            present_tiles = set()
            present_numbers = []
            
            for key in tiles:
                if key in dictionary:
                    number = dictionary[key]
                    present[number] = True
                    present_tiles.add(key)
                    present_numbers.append(number)

            #Check that tiles are separated by at least 3
            for i in range(1, 10):
                if present[i]:
                    if (i + 1 <= 9 and present[i + 1]) or (i + 2 <= 9 and present[i + 2]):
                        return False, [], 0
                    
            #No tiles present
            if len(present_tiles) == 0:
                all_combos = combinations(range(1, 10), 3)
                valid_combos = []
                for combo in all_combos:
                    if all(combo[i+1] - combo[i] >= 3 for i in range(len(combo) - 1)):
                        temp = []
                        for number in combo:
                            suited_number = f'{suit}{number}'
                            temp.append(suited_number)
                        valid_combos.append(temp)
                
                return True, valid_combos, 3
            
            #Less than 3 tiles
            if len(present_tiles) < 3:
                present_numbers_sorted = sorted(present_numbers)
                daps_needed = 3 - len(present_tiles)
                valid_combos = []
                
                # Find all possible numbers that can be added
                possible_nums = []
                for num in range(1, 10):
                    if num not in present_numbers:
                        valid = True
                        for temp_num in present_numbers:
                            if abs(num - temp_num) < 3:
                                valid = False
                                break
                        if valid:
                            possible_nums.append(num)
                
                # Generate all combinations of the daps_needed numbers
                for combo in combinations(possible_nums, daps_needed):
                    combined = sorted(present_numbers_sorted + list(combo))
                    if all(combined[i+1] - combined[i] >= 3 for i in range(len(combined) - 1)):
                        temp = []
                        for number in combined:
                            suited_number = f'{suit}{number}'
                            temp.append(suited_number)
                        valid_combos.append(temp)

                return True, valid_combos, daps_needed
            
            #Already have 3 valid tiles
            return True, [sorted(list(present_tiles))], 0

        m_possible, m_combos, m_daps_needed = sixteenbd_helper(M_DICT, TSM_NAME[0])
        t_possible, t_combos, t_daps_needed = sixteenbd_helper(T_DICT, TSM_NAME[1])
        s_possible, s_combos, s_daps_needed = sixteenbd_helper(S_DICT, TSM_NAME[2])
        if not m_possible or not t_possible or not s_possible:
            return []
        
        temp_daps_needed = m_daps_needed + t_daps_needed + s_daps_needed + len(missing_tiles) + dap_for_eyes
        if temp_daps_needed > joker_number:
            return []
        
        curr_present_tiles = []
        for key, value in tiles.items():
            curr_present_tiles.extend([key] * value)

        #Supplementing decks with daps
        close_to_possible_decks = []
        daps_used = 0
        for m_combo, t_combo, s_combo in product(m_combos, t_combos, s_combos):
            temp_deck = curr_present_tiles.copy()

            for tile in missing_tiles:
                temp_deck.append(tile)
                daps_used += 1

            for tile in m_combo:
                if tile in curr_present_tiles:
                    continue
                temp_deck.append(tile)
                daps_used += 1

            for tile in s_combo:
                if tile in curr_present_tiles:
                    continue
                temp_deck.append(tile)
                daps_used += 1

            for tile in t_combo:
                if tile in curr_present_tiles:
                    continue
                temp_deck.append(tile)
                daps_used += 1

            close_to_possible_decks.append(sorted(temp_deck))

        if len(eyes) == 1:
            complete_decks = []
            for item in close_to_possible_decks:
                complete_decks.append({'hu_type': sixteen_bd_hu,'eyes': eyes[0],'tiles': item})
            return complete_decks

        complete_decks = []
        for deck in close_to_possible_decks:
             for tile in deck:
                deck_with_eyes = deck.copy()
                deck_with_eyes.append(tile)
                complete_decks.append({'hu_type': sixteen_bd_hu,'eyes': tile,'tiles': deck_with_eyes})

        return complete_decks            
            
    def thirteen_waist_check(self, tiles, joker_number):
        if (self.card_count(tiles) + joker_number) != 17:
            return []

        required_tiles = self._get_thirteen_required_tiles()
        missing_tiles = [tile for tile in required_tiles if tiles.get(tile, 0) == 0]

        if len(missing_tiles) > joker_number:
            return []

        jokers_left = joker_number - len(missing_tiles)
        missing_set = set(missing_tiles)

        pair_candidates = []
        for tile in required_tiles:
            count = tiles.get(tile, 0)
            if tile in missing_set:
                count += 1
            needed_for_pair = max(0, 2 - count)
            if needed_for_pair <= jokers_left:
                pair_candidates.append((tile, needed_for_pair))

        if not pair_candidates:
            return []

        base_tiles = []
        for tile, count in tiles.items():
            base_tiles.extend([tile] * count)

        results = []
        seen_decks = set()

        for pair_tile, jokers_for_pair in pair_candidates:
            deck = base_tiles.copy()
            deck.extend(missing_tiles)

            if jokers_for_pair:
                deck.extend([pair_tile] * jokers_for_pair)

            remaining_jokers = jokers_left - jokers_for_pair
            if remaining_jokers > 0:
                deck.extend([pair_tile] * remaining_jokers)

            deck_sorted = sorted(deck)
            curr_deck = tuple(deck_sorted)
            if curr_deck in seen_decks:
                continue
            seen_decks.add(curr_deck)

            results.append({
                'hu_type': thirteen_waist_hu,
                'eyes': pair_tile,
                'tiles': deck_sorted
            })

        return results
    
    def standard_check(self, tiles, joker_number):        
        possible_eyes = self._generate_eye_candidates(tiles, joker_number)
        if not possible_eyes:
            return []

        results = []
        seen_decks = set()

        for candidate in possible_eyes:
            all_solutions = []
            self._search_standard_melds(candidate['tiles'], candidate['jokers_left'], 5, [], all_solutions)

            for solution in all_solutions:
                complete_sets = [candidate['eye_tiles'].copy()] + [group.copy() for group in solution]
                sorted_sets = [tuple(sorted(group)) for group in complete_sets]
                normalized = tuple(sorted(sorted_sets))

                if normalized in seen_decks:
                    continue

                seen_decks.add(normalized)
                ordered_sets = sorted([group.copy() for group in complete_sets])
                results.append({'hu_type': standard_hu, 'eyes': candidate['eye_tile'], 'tiles': ordered_sets})

        return results

    def _generate_eye_candidates(self, tiles, joker_number):
        candidates = []

        for tile, count in tiles.items():
            if count >= 2:
                next_tiles = tiles.copy()
                next_tiles[tile] -= 2
                candidates.append({
                    'eye_tile': tile,
                    'eye_tiles': [tile, tile],
                    'tiles': clean_tiles(next_tiles),
                    'jokers_left': joker_number
                })

            if joker_number >= 1 and count >= 1:
                next_tiles = tiles.copy()
                next_tiles[tile] -= 1
                candidates.append({
                    'eye_tile': tile,
                    'eye_tiles': [tile, tile],
                    'tiles': clean_tiles(next_tiles),
                    'jokers_left': joker_number - 1
                })

        if joker_number >= 2:
            for tile in ALL_TILES:
                candidates.append({
                    'eye_tile': tile,
                    'eye_tiles': [tile, tile],
                    'tiles': tiles.copy(),
                    'jokers_left': joker_number - 2
                })

        return candidates

    def _search_standard_melds(self, tiles, jokers_left, sets_needed, current_sets, all_solutions):
        if sets_needed == 0:
            if not tiles and jokers_left == 0:
                all_solutions.append([group.copy() for group in current_sets])
            return

        if not tiles:
            self._fill_sets_with_only_jokers(jokers_left, sets_needed, current_sets, all_solutions)
            return

        curr_tile = min(tiles.keys())
        count = tiles[curr_tile]

        self._try_multiple_set(curr_tile, tiles, count, 4, jokers_left, sets_needed, current_sets, all_solutions)
        self._try_multiple_set(curr_tile, tiles, count, 3, jokers_left, sets_needed, current_sets, all_solutions)
        self._try_sequence_set(curr_tile, tiles, jokers_left, sets_needed, current_sets, all_solutions)

    def _try_multiple_set(self, tile, tiles, tile_count, size, jokers_left, sets_needed, current_sets, all_solutions):
        if tile_count <= 0:
            return

        max_joker_use = min(size - 1, jokers_left)
        min_joker_needed = max(0, size - tile_count)

        for jokers_used in range(min_joker_needed, max_joker_use + 1):
            real_needed = size - jokers_used
            if real_needed <= 0 or real_needed > tile_count:
                continue

            next_tiles = tiles.copy()
            next_tiles[tile] -= real_needed
            next_tiles = clean_tiles(next_tiles)

            current_sets.append([tile] * size)
            self._search_standard_melds(next_tiles, jokers_left - jokers_used, sets_needed - 1, current_sets, all_solutions)
            current_sets.pop()

    def _try_sequence_set(self, tile, tiles, jokers_left, sets_needed, current_sets, all_solutions):
        if tile not in MST_DICT:
            return

        rank = MST_DICT[tile]
        if rank > 7:
            return

        suit = tile[0]
        seq_tiles = [tile, f'{suit}{rank + 1}', f'{suit}{rank + 2}']
        jokers_used = 0
        next_tiles = tiles.copy()

        for seq_tile in seq_tiles:
            if next_tiles.get(seq_tile, 0) > 0:
                next_tiles[seq_tile] -= 1
                if next_tiles[seq_tile] == 0:
                    del next_tiles[seq_tile]
            else:
                jokers_used += 1

        if jokers_used <= jokers_left:
            current_sets.append(seq_tiles)
            self._search_standard_melds(next_tiles, jokers_left - jokers_used, sets_needed - 1, current_sets, all_solutions)
            current_sets.pop()

    def _fill_sets_with_only_jokers(self, jokers_left, sets_needed, current_sets, all_solutions):
        if sets_needed == 0:
            if jokers_left == 0:
                all_solutions.append([group.copy() for group in current_sets])
            return

        if jokers_left == 0:
            return

        if jokers_left == 3 and sets_needed == 1:
            for combo in self._get_joker_only_triplets():
                current_sets.append(combo.copy())
                all_solutions.append([group.copy() for group in current_sets])
                current_sets.pop()
            return

        if jokers_left == 4 and sets_needed == 1:
            for quad in self._get_joker_only_quads():
                current_sets.append(quad.copy())
                all_solutions.append([group.copy() for group in current_sets])
                current_sets.pop()
            return

    def _get_joker_only_triplets(self):
        if not hasattr(self, '_joker_triplets_cache'):
            combos = [[tile, tile, tile] for tile in ALL_TILES]
            for suit in TSM_NAME:
                for rank in range(1, 8):
                    combos.append([f'{suit}{rank}', f'{suit}{rank + 1}', f'{suit}{rank + 2}'])
            self._joker_triplets_cache = combos
        return self._joker_triplets_cache

    def _get_joker_only_quads(self):
        if not hasattr(self, '_joker_quads_cache'):
            self._joker_quads_cache = [[tile, tile, tile, tile] for tile in ALL_TILES]
        return self._joker_quads_cache

    def _get_thirteen_required_tiles(self):
        if not hasattr(self, '_thirteen_required_cache'):
            self._thirteen_required_cache = [
                'east', 'south', 'west', 'north',
                'zhong', 'fa', 'bai',
                'm1', 'm9', 't1', 't9', 's1', 's9'
            ]
        return self._thirteen_required_cache
    
    def get_validated_decks(self):
        return self.possibleDecks