from dictionary import *
from deck_validator import DeckValidator
from full_counter import FullCounter
from tile_classifier import TileClassifier
import tkinter as tk
from tkinter import filedialog

if __name__ == "__main__":
    # Create a hidden root window for the file dialog
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    
    # Open file dialog to select image
    print("請選擇麻將牌圖片 / Please select mahjong tiles image...")
    image_path = filedialog.askopenfilename(
        title="選擇麻將牌圖片 / Select Mahjong Tiles Image",
        filetypes=[
            ("Image files", "*.jpg *.jpeg *.png *.bmp *.heic"),
            ("JPEG files", "*.jpg *.jpeg"),
            ("HEIC files", "*.heic *.heic"),
            ("PNG files", "*.png"),
            ("All files", "*.*")
        ]
    )
    
    # Check if user selected a file
    if not image_path:
        print("未選擇圖片，程式結束 / No image selected, exiting...")
        exit()
    
    print(f"已選擇: {image_path}")
    
    # Use the selected image
    tile_classifier = TileClassifier(image_path)
    tile_classifier.classify_photo()
    winner_tiles = tile_classifier.get_classified_decks()
    print("detected deck: ", winner_tiles)