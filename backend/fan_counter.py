from dictionary import *
from values import *

class FanCounter:
    def __init__(self, winner_seat, winner_tiles, curr_wind):
        self.winner_seat = winner_seat
        self.base_winner_tiles = winner_tiles.copy() if winner_tiles else {}
        self.curr_wind = curr_wind
        self.logs = []

    def count_wind_and_zfb_value(self, validated_deck=None):
        self.logs = []  # Reset logs for each count
        tile_counts = self._build_tile_counts(validated_deck)

        wind_value, has_wind, counted_pos = self.count_wind_value(tile_counts)
        zfb_value, has_zfb = self.count_zfb_value(tile_counts)

        total_fan_value = wind_value + zfb_value
        return total_fan_value, has_wind, has_zfb, counted_pos
    
    def count_wind_value(self, tiles):
        value = 0
        has_wind = False
        small_wind = 0
        big_wind = 0
        wind_logs = []
        counted_pos = False        
        
        #Counts wind
        for key, count in tiles.items():
            if key not in WIND_DICT:
                continue
            else:
                has_wind = True

                if count >= 2:
                    small_wind += 1

                if count >= 3:
                    big_wind += 1
                    value += wind_value
                    wind_logs.append(f"{key} +{wind_value}")

        #Checks small/big wind
        if small_wind == 3:
            value = small_3_wind_value
            wind_logs.clear()
            wind_logs.append(f"小三風 +{value}")

        if big_wind == 3:
            value = big_3_wind_value
            wind_logs.clear()
            wind_logs.append(f"大三風 +{value}")

        if small_wind == 4:
            value = small_4_wind_value
            wind_logs.clear()
            wind_logs.append(f"小四喜 +{value}")

        if big_wind == 4:
            value = big_4_wind_value
            wind_logs.clear()
            wind_logs.append(f"大四喜 +{value}")

        #Counts curr wind
        if self.curr_wind in tiles and tiles[self.curr_wind] >= 3:
            value += wind_value
            wind_logs.append(f"正{self.curr_wind}圈 +{wind_wind_value}")

        #Counts seat position
        seat_tile = SEAT_DICT[self.winner_seat]
        if seat_tile in tiles and tiles[seat_tile] >= 3:
            value += wind_seat_value
            counted_pos = True
            wind_logs.append(f"正{SEAT_DICT[self.winner_seat]}位 +{wind_seat_value}")

        self.logs.extend(wind_logs)

        return value, has_wind, counted_pos

    def count_zfb_value(self, tiles):
        value = 0
        has_zfb = False
        small_3 = 0
        big_3 = 0
        zfb_logs = []

        for key, count in tiles.items():
            if key not in ZFB_DICT:
                continue
            else:
                has_zfb = True
                if count > 1:
                    small_3 += 1
                    if count > 2:
                        value += zfb_value
                        zfb_logs.append(f"{key} +{zfb_value}")
                        big_3 += 1

        if small_3 == 3:
            value = small_3_zfb_value
            zfb_logs.clear()
            zfb_logs.append(f"小三元 +{small_3_zfb_value}")

        if big_3 == 3:
            value = big_3_zfb_value
            zfb_logs.clear()
            zfb_logs.append(f"大三元 +{big_3_zfb_value}")

        self.logs.extend(zfb_logs)

        return value, has_zfb
    
    def getLogs(self):
        return self.logs

    def _build_tile_counts(self, validated_deck):
        if isinstance(validated_deck, dict) and 'tiles' in validated_deck:
            counts = {}
            for tile_group in validated_deck['tiles']:
                tiles = tile_group if isinstance(tile_group, list) else [tile_group]
                for tile in tiles:
                    counts[tile] = counts.get(tile, 0) + 1
            return counts

        return self.base_winner_tiles.copy()
