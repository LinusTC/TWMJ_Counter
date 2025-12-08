from dictionary import *
from values import *

class FlowerCounter:
    def __init__(self, winner_seat, winner_tiles):
        self.winner_seat = winner_seat
        self.winner_tiles = winner_tiles
        self.logs = []

    def count_flower_value(self):
        self.logs = []  # Reset logs for each count
        value = 0
        has_flower = False
        counted_pos = False

        for key in self.winner_tiles:
            if key not in FLOWER_DICT:
                continue
            else:
                has_flower = True
                value += flower_value
                self.logs.append(f"花{key} +{flower_value}")

                if FLOWER_DICT[key] == self.winner_seat:
                    value += flower_seat_value
                    counted_pos = True
                    self.logs.append(f"花位{key} +{flower_seat_value}")

        if value == 0: value += flower_value

        return value, has_flower, counted_pos
    
    def getLogs(self):
        return self.logs