import time
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

router = APIRouter()

_cache: dict = {"data": None, "timestamp": 0}
CAMERA_CACHE_TTL = 300  # 5 minutes
SNAPSHOT_CACHE: dict = {}
SNAPSHOT_TTL = 20  # seconds

SOCRATA_URL = "https://data.austintexas.gov/resource/b4k4-adkb.json"
SNAPSHOT_BASE = "https://cctv.austinmobility.io/image/{}.jpg"


def normalize_camera(cam: dict) -> dict | None:
    try:
        loc = cam.get("location", {})
        coords = loc.get("coordinates", [])
        if len(coords) < 2:
            return None
        return {
            "id": str(cam.get("camera_id", "")),
            "name": cam.get("location_name", "Unknown"),
            "lat": float(coords[1]),
            "lon": float(coords[0]),
            "status": cam.get("camera_status", "UNKNOWN"),
            "image_url": SNAPSHOT_BASE.format(cam.get("camera_id", "")),
        }
    except Exception:
        return None


@router.get("/cameras")
async def get_cameras():
    global _cache
    now = time.time()

    if _cache["data"] and (now - _cache["timestamp"]) < CAMERA_CACHE_TTL:
        return _cache["data"]

    params = {
        "$limit": 300,
        "$where": "camera_status='ON'",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(SOCRATA_URL, params=params)
            resp.raise_for_status()
            raw = resp.json()
    except Exception:
        if _cache["data"]:
            return _cache["data"]
        return []

    cameras = [c for cam in raw if (c := normalize_camera(cam))]
    _cache = {"data": cameras, "timestamp": now}
    return cameras


@router.get("/cameras/{camera_id}/snapshot")
async def get_snapshot(camera_id: str):
    now = time.time()
    cached = SNAPSHOT_CACHE.get(camera_id)
    if cached and (now - cached["timestamp"]) < SNAPSHOT_TTL:
        return Response(content=cached["data"], media_type="image/jpeg")

    url = SNAPSHOT_BASE.format(camera_id)
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            image_bytes = resp.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch camera snapshot: {e}")

    SNAPSHOT_CACHE[camera_id] = {"data": image_bytes, "timestamp": now}
    return Response(content=image_bytes, media_type="image/jpeg")
