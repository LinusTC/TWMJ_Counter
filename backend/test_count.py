from dictionary import *
from deck_validator import DeckValidator
from deck_validator_with_joker import DeckValidatorJoker
from full_counter import FullCounter

if __name__ == "__main__":
    fa_test = {'f1': 1, "ff1": 1, 'f2': 1, 'ff2': 1, "f3": 1, 'ff3': 1, 'f4':1, 'ff4':1}
    sixteenbd_test = {'m1': 1, 'm5': 1, 'm9': 1, 's1': 1, 's4': 1, 's7': 1, 't1': 1, 't6': 1, 't9': 1, 'east': 1, 'south': 1, 'west': 2, 'north': 1, 'zhong': 1, 'fa': 1, 'bai':1}
    Thirteen_waist_test = {'m1': 1, 'm9':1, 's1': 1, 's9':1, 't1': 1, 't7':1, 't8':1, 't9':3, 'east': 1, 'south': 1, 'west': 1, 'north': 1, 'zhong': 1, 'fa': 1, 'bai':1}
    ligu_test = {'m1': 4, 'm5': 4, 't1': 4, 'zhong': 2, 'bai': 3}
    standard_test = {'m2':1, 'm3':1, 'm4': 1, 'west':3, 's5': 1, 's3':1, 's4': 1,'t3':1, 't4': 2, 't5': 2, 't6':1, 't8':2}
    max_fan = {'f1': 1, "ff1": 1, 'f2': 1, 'ff2': 1, "f3": 1, 'ff3': 1, "f4": 1, 'ff4': 1, 'south':4, 'm1': 2, 'm9': 4, 'north': 4, 'east': 4, 'west': 4}

    # All test cases
    tests = {
        'test': standard_test
    }
    
    # Run all tests
    for test_name, test_tiles in tests.items():
        print("\n" + "="*60)
        print("台灣麻將計番器 - Taiwan Mahjong Counter")
        print("="*60)
        
        deck_validator = DeckValidator(test_tiles)
        has_valid_deck = deck_validator.full_check()
        print(f'Has valid decks: {has_valid_deck}')

        decks = deck_validator.get_validated_decks()
        for deck in decks:
            print(deck)

        # Winner seat (1-4)
        while True:
            try:
                winner_seat = int(input("\n贏家座位 (1-4) / Winner seat (1-4): "))
                if 1 <= winner_seat <= 4:
                    break
                print("請輸入 1-4 之間的數字 / Please enter a number between 1-4")
            except ValueError:
                print("請輸入有效的數字 / Please enter a valid number")
        
        # Current wind
        print("\n當前風圈 / Current wind:")
        print("1. 東風 (East)")
        print("2. 南風 (South)")
        print("3. 西風 (West)")
        print("4. 北風 (North)")
        while True:
            try:
                wind_choice = int(input("選擇風圈 (1-4) / Choose wind (1-4): "))
                wind_map = {1: 'east', 2: 'south', 3: 'west', 4: 'north'}
                if wind_choice in wind_map:
                    current_wind = wind_map[wind_choice]
                    break
                print("請輸入 1-4 之間的數字 / Please enter a number between 1-4")
            except ValueError:
                print("請輸入有效的數字 / Please enter a valid number")
        
        # Self-draw (自摸)
        while True:
            mo_input = input("\n自摸? (y/n) / Self-draw? (y/n): ").lower()
            if mo_input in ['y', 'n', 'yes', 'no']:
                myself_mo = mo_input in ['y', 'yes']
                break
            print("請輸入 y 或 n / Please enter y or n")
        
        # Door clear (門清)
        while True:
            door_input = input("門清? (y/n) / Door clear (no exposed sets)? (y/n): ").lower()
            if door_input in ['y', 'n', 'yes', 'no']:
                door_clear = door_input in ['y', 'yes']
                break
            print("請輸入 y 或 n / Please enter y or n")

        # 胡牌底 (Base score)
        while True:
            try:
                base_score = int(input("\n胡牌底 / Base score: "))
                break
            except ValueError:
                print("請輸入有效的數字 / Please enter a valid number")
        
        # 胡牌乘數 (Multiplier)
        while True:
            try:
                multiplier = int(input("胡牌乘數 / Score multiplier: "))
                break
            except ValueError:
                print("請輸入有效的數字 / Please enter a valid number")
        
        # Winning tile (optional)
        winning_tile = input("\n胡牌 (可選，按Enter跳過) / Winning tile (optional, press Enter to skip): ").strip() or None

        full_counter = FullCounter(test_tiles, winner_seat, current_wind, winning_tile, myself_mo, door_clear, base_score, multiplier)
        count, logs, winning_deck, winning_deck_organized = full_counter.full_count()
        
        print("\n" + "="*60)
        print("結果 / Results")
        print("="*60)
        print(f"\n牌組 / Tiles: {test_tiles}")
        print(f"總分 / Total Score: {count}")
        print(f"計分明細 / Score Breakdown: {logs}")
        print(f"勝利牌組 / Winning Deck: {winning_deck_organized}")
        print("="*60)

        print(f'{"="*60}\n')