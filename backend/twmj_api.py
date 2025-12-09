from fastapi import FastAPI, File, UploadFile, WebSocket, HTTPException
from tile_classifier import TileClassifier
from deck_validator import DeckValidator
from full_counter import FullCounter
from PIL import Image
from io import BytesIO
import base64
from pillow_heif import register_heif_opener
from ultralytics import YOLO
from asyncio import Semaphore
from pathlib import Path
from datetime import datetime, timedelta, timezone
import json
import time
import asyncio
from pydantic import BaseModel
from contextlib import asynccontextmanager


TEMP_TEMPLATE_TTL_SECONDS = 60 * 3
BASE_DIR = Path(__file__).resolve().parent
TEMP_TEMPLATE_DIR = BASE_DIR / "temporary_templates"
TEMP_TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

register_heif_opener()

YOLO_MODEL = YOLO("m_model_v2/weights/last.pt")
model_semaphore = Semaphore(2)


async def cleanup_task():
    """Background task to periodically clean up expired templates."""
    while True:
        await asyncio.sleep(30)  # Check every 30 seconds
        cleanup_expired_templates()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup: start background cleanup task
    task = asyncio.create_task(cleanup_task())
    yield
    # Shutdown: cancel background task and clean up all temporary templates
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    cleanup_all_temp_templates()


twmj = FastAPI(lifespan=lifespan)

class TemplateExportPayload(BaseModel):
    uuid: str
    name: str
    rules: dict
    rules_enabled: dict

def cleanup_expired_templates() -> None:
    """Delete expired template files from temporary storage."""
    now = datetime.now(timezone.utc)
    for path in TEMP_TEMPLATE_DIR.glob("*.json"):
        try:
            data = json.loads(path.read_text())
            expires_at = data.get("expires_at")
            if expires_at:
                expires_dt = datetime.fromisoformat(expires_at)
                if expires_dt < now:
                    path.unlink(missing_ok=True)
        except (FileNotFoundError, json.JSONDecodeError, ValueError):
            # If file is corrupted or missing, try to delete it
            try:
                path.unlink(missing_ok=True)
            except FileNotFoundError:
                pass

def cleanup_all_temp_templates() -> None:
    """Delete all temporary template files on shutdown."""
    for path in TEMP_TEMPLATE_DIR.glob("*.json"):
        try:
            path.unlink(missing_ok=True)
        except FileNotFoundError:
            continue

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


@twmj.post("/templates/export")
async def export_template(payload: TemplateExportPayload):
    cleanup_expired_templates()
    file_path = TEMP_TEMPLATE_DIR / f"{payload.uuid}.json"

    # Check if UUID already has an active export
    if file_path.exists():
        try:
            existing = json.loads(file_path.read_text())
            expires_dt = datetime.fromisoformat(existing["expires_at"])
            if expires_dt > datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=409,
                    detail="Template already exists. Please generate a new QR.",
                )
        except (json.JSONDecodeError, ValueError, KeyError):
            # Corrupted or invalid file, allow overwrite
            pass

    expiration = datetime.now(timezone.utc) + timedelta(seconds=TEMP_TEMPLATE_TTL_SECONDS)
    payload_record = {
        "uuid": payload.uuid,
        "expires_at": expiration.isoformat(),
        "template": {
            "name": payload.name,
            "rules": payload.rules,
            "rules_enabled": payload.rules_enabled,
        },
    }

    file_path.write_text(json.dumps(payload_record))
    return payload_record


@twmj.get("/templates/import/{template_uuid}")
async def import_template(template_uuid: str):
    cleanup_expired_templates()
    file_path = TEMP_TEMPLATE_DIR / f"{template_uuid}.json"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Template not found or expired.")

    try:
        payload_record = json.loads(file_path.read_text())
        expires_dt = datetime.fromisoformat(payload_record["expires_at"])
        
        if expires_dt < datetime.now(timezone.utc):
            file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=404, detail="Template not found or expired.")
            
        return payload_record
    except (json.JSONDecodeError, ValueError, KeyError):
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=404, detail="Template not found or expired.")

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