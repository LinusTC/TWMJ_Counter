#!/usr/bin/env python3
"""
Script to convert JPG images to PNG format with background removal.
Usage: python convert_jpg_to_png.py <input_path> [output_path]
"""

import sys
import os
from pathlib import Path
from PIL import Image
from rembg import remove


def convert_jpg_to_png(input_path, output_path=None):
    """
    Convert a JPG image to PNG format with background removed.
    
    Args:
        input_path: Path to input JPG file or directory
        output_path: Path to output PNG file or directory (optional)
    """
    input_path = Path(input_path)
    
    # Check if input exists
    if not input_path.exists():
        print(f"Error: {input_path} does not exist")
        return False
    
    # Handle single file
    if input_path.is_file():
        if input_path.suffix.lower() not in ['.jpg', '.jpeg']:
            print(f"Error: {input_path} is not a JPG/JPEG file")
            return False
        
        # Determine output path
        if output_path is None:
            output_path = input_path.with_suffix('.png')
        else:
            output_path = Path(output_path)
            if output_path.is_dir():
                output_path = output_path / input_path.with_suffix('.png').name
        
        # Convert image and remove background
        try:
            with Image.open(input_path) as img:
                print(f"Removing background from {input_path}...")
                # Remove background
                output_img = remove(img)
                output_img.save(output_path, 'PNG')
                print(f"Converted: {input_path} -> {output_path}")
                return True
        except Exception as e:
            print(f"Error converting {input_path}: {e}")
            return False
    
    # Handle directory
    elif input_path.is_dir():
        # Determine output directory
        if output_path is None:
            output_dir = input_path / "converted_png"
        else:
            output_dir = Path(output_path)
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Find all JPG files
        jpg_files = list(input_path.glob('*.jpg')) + list(input_path.glob('*.jpeg')) + \
                   list(input_path.glob('*.JPG')) + list(input_path.glob('*.JPEG'))
        
        if not jpg_files:
            print(f"No JPG/JPEG files found in {input_path}")
            return False
        
        print(f"Found {len(jpg_files)} JPG/JPEG files to convert")
        
        success_count = 0
        for i, jpg_file in enumerate(jpg_files, 1):
            png_file = output_dir / jpg_file.with_suffix('.png').name
            try:
                print(f"[{i}/{len(jpg_files)}] Processing {jpg_file.name}...")
                with Image.open(jpg_file) as img:
                    # Remove background
                    output_img = remove(img)
                    output_img.save(png_file, 'PNG')
                    print(f"  ✓ Converted: {jpg_file.name} -> {png_file}")
                    success_count += 1
            except Exception as e:
                print(f"  ✗ Error converting {jpg_file}: {e}")
        
        print(f"\nConversion complete: {success_count}/{len(jpg_files)} files converted")
        return success_count > 0
    
    return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python convert_jpg_to_png.py <input_path> [output_path]")
        print("\nThis script converts JPG images to PNG with background removal.")
        print("\nExamples:")
        print("  python convert_jpg_to_png.py image.jpg")
        print("  python convert_jpg_to_png.py image.jpg output.png")
        print("  python convert_jpg_to_png.py ./images/")
        print("  python convert_jpg_to_png.py ./images/ ./output/")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = convert_jpg_to_png(input_path, output_path)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
