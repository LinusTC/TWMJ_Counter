from ultralytics import YOLO

class TileClassifier:
    def __init__(self, image_source, classified_array, model=None):
        self.image_source = image_source
        self.classified_decks = []
        self.classified_decks_multiple = classified_array
        self.model = model if model else YOLO("m_model_v2/weights/last.pt")
        
    def classify_photo(self):
        all_results = self.model.predict(source=self.image_source, conf=0.5)

        for result in all_results:
            boxes = result.boxes
            detected_tiles = {}
            detected_tiles_with_boxes = []

            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = result.names[class_id]
                
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                detected_tiles[class_name] = detected_tiles.get(class_name, 0) + 1
                
                detected_tiles_with_boxes.append({
                    "tile": class_name,
                    "confidence": round(confidence, 2),
                    "bbox": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2)
                    }
                })
                
                print(f"Detected: {class_name} at ({x1:.0f},{y1:.0f})-({x2:.0f},{y2:.0f}) (confidence: {confidence:.2f})")

            detection_data = {
                "tiles": detected_tiles,
                "detections": detected_tiles_with_boxes
            }
            
            self.classified_decks.append(detection_data)
            self.classified_decks_multiple.append(detection_data)

    def stablize_image(self):
        stability_threshold = 5

        if len(self.classified_decks_multiple) < stability_threshold: 
            return None

        stable_image = None
        stable_count = 0
        previous_detection = None

        for item in self.classified_decks_multiple:
            current_tiles = item.get("tiles", {})
            
            if current_tiles == previous_detection:
                stable_count += 1

                if stable_count == stability_threshold and item:
                    stable_image = item
                    self.classified_decks_multiple = self.classified_decks_multiple[-(stability_threshold//2):]
                    print(f"Stable detection found, keeping last {stability_threshold//2} for continuity")
                    break
            else:
                stable_count = 0
                previous_detection = current_tiles.copy() if current_tiles else None

        return stable_image

    def classify_video(self):
        all_results = self.model.predict(source=self.image_source, conf=0.5, stream=True, save = True)

        previous_detection = None
        stable_count = 0
        stability_threshold = 20
        
        for result in all_results:
            boxes = result.boxes
            detected_tiles = {}

            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = result.names[class_id]
                detected_tiles[class_name] = detected_tiles.get(class_name, 0) + 1
                print(f"Detected: {class_name} (confidence: {confidence:.2f})")

            # Check if current detection matches previous one
            if detected_tiles == previous_detection:
                stable_count += 1
                # Once we reach stability threshold, save it (only once)
                if stable_count == stability_threshold and detected_tiles:
                    self.classified_decks.append(detected_tiles)
            else:
                stable_count = 0
                previous_detection = detected_tiles.copy() if detected_tiles else None
    
    def get_classified_decks(self):
        return self.classified_decks