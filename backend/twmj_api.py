from fastapi import FastAPI, File, UploadFile, WebSocket
from tile_classifier import TileClassifier
from deck_validator import DeckValidator
from full_counter import FullCounter
from PIL import Image
from io import BytesIO
import base64
from pillow_heif import register_heif_opener
from ultralytics import YOLO
from asyncio import Semaphore

register_heif_opener()
twmj = FastAPI()

YOLO_MODEL = YOLO("m_model_v2/weights/last.pt")
model_semaphore = Semaphore(2)  # Only 1 inference at a time

@twmj.get("/")
def root():
    return('hello world')

@twmj.post("/classify-hand")
async def classify_hand(image: UploadFile = File(...)):
    async with model_semaphore:
        payload = await image.read()
        pil_image = Image.open(BytesIO(payload))
        
        tile_classifier = TileClassifier(pil_image, [], YOLO_MODEL)
        tile_classifier.classify_photo()
        classified_decks = tile_classifier.get_classified_decks()
        
        return {
            "filename": image.filename,
            "size": len(payload),
            "classified_decks": classified_decks,
        }

@twmj.post("/get-points")
async def get_points(winner_tiles: dict):
    
    deck_validator = DeckValidator(winner_tiles)
    deck_validator.full_check()

    full_counter = FullCounter(winner_tiles, 1, 1, None, True, True, 0, 1)
    count, logs, winning_deck, winning_deck_organized = full_counter.full_count()
    
    return {
        "count": count,
        "logs": logs,
        "winning_deck_organized": winning_deck_organized,
    }

@twmj.websocket("/start-scan/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await websocket.accept()
    classified_array = []
    try:
        while True:
            # Try to receive as text (base64) first, fallback to binary
            try:
                data = await websocket.receive_text()
                # Decode base64 to bytes
                image_bytes = base64.b64decode(data)
            except:
                # If text fails, receive as binary
                image_bytes = await websocket.receive_bytes()
            
            try:
                pil_image = Image.open(BytesIO(image_bytes))
                
                # Classify the image
                tile_classifier = TileClassifier(pil_image, classified_array, YOLO_MODEL)
                tile_classifier.classify_photo()
                stable_classified_deck = tile_classifier.stablize_image()

                # Send classification result back
                await websocket.send_json({
                    "status": "success",
                    "classified_decks": stable_classified_deck,
                })
                
            except Exception as e:
                await websocket.send_json({
                    "status": "error",
                    "message": str(e)
                })
                
    except Exception as e:
        print(f"Client {client_id} disconnected: {e}")
    finally:
        await websocket.close()
        print(f"Client {client_id} connection closed.")