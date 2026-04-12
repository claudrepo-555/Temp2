import os
import json
import base64
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import anthropic

router = APIRouter()

SYSTEM_PROMPT = """You are WorldView Intelligence, an AI analyst embedded in a real-time geospatial surveillance dashboard inspired by Palantir Gotham. You have access to live ADS-B flight tracking data over Texas and Austin city traffic camera feeds.

Your role:
- Analyze flight patterns, density, and anomalies in the airspace
- Assess traffic conditions from camera imagery
- Answer questions about what's visible on the map with precision
- Provide concise, authoritative intelligence briefs

Format rules:
- Lead with the key finding
- Use bullet points for data values, formatted as `KEY: value`
- Keep responses under 200 words unless asked for detail
- When analyzing images, describe: traffic density (light/moderate/heavy), visible incidents, road conditions, and notable activity
- When analyzing flights, note: count, altitude distribution, unusual headings, congestion areas"""

SNAPSHOT_BASE = "https://cctv.austinmobility.io/image/{}.jpg"


class Viewport(BaseModel):
    lat: float
    lon: float
    zoom: float = 9.0


class AnalyzeRequest(BaseModel):
    query: str
    context: Optional[dict] = None


def build_messages(body: AnalyzeRequest, image_b64: Optional[str] = None) -> list:
    ctx = body.context or {}
    viewport = ctx.get("viewport", {})
    flights = ctx.get("flights_visible", [])[:20]
    cameras = ctx.get("cameras_visible", [])

    context_text = f"""Current map viewport: lat={viewport.get('lat', 30.27):.4f}, lon={viewport.get('lon', -97.74):.4f}, zoom={viewport.get('zoom', 9)}

Flights visible: {len(flights)}
"""
    if flights:
        context_text += "Flight data (nearest 20):\n"
        for f in flights:
            callsign = f.get("callsign") or f.get("icao24", "???")
            alt = f.get("baro_altitude")
            alt_ft = f"{int(alt * 3.28084):,} ft" if alt else "on ground"
            vel = f.get("velocity")
            spd = f"{int(vel * 1.94384)} kts" if vel else "unknown"
            hdg = f.get("heading")
            hdg_str = f"{int(hdg)}°" if hdg else "unknown"
            country = f.get("origin_country", "")
            context_text += f"  - {callsign} ({country}): {alt_ft}, {spd}, hdg {hdg_str}\n"

    if cameras:
        context_text += f"\nAustin traffic cameras in view: {', '.join(cameras[:10])}"

    content = []

    if image_b64:
        cam_id = ctx.get("selected_camera_id", "")
        content.append({
            "type": "text",
            "text": f"Austin traffic camera feed (Camera ID: {cam_id}):\n[Image attached below]"
        })
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": image_b64,
            }
        })

    content.append({
        "type": "text",
        "text": f"Map context:\n{context_text}\n\nQuestion: {body.query}"
    })

    return [{"role": "user", "content": content}]


@router.post("/ai/analyze")
async def analyze(body: AnalyzeRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    client = anthropic.AsyncAnthropic(api_key=api_key)

    # Fetch camera image if requested
    image_b64 = None
    ctx = body.context or {}
    camera_id = ctx.get("selected_camera_id")
    if camera_id:
        try:
            async with httpx.AsyncClient(timeout=8.0) as http:
                resp = await http.get(SNAPSHOT_BASE.format(camera_id))
                resp.raise_for_status()
                image_b64 = base64.b64encode(resp.content).decode()
        except Exception:
            pass  # Proceed without image if fetch fails

    messages = build_messages(body, image_b64)

    async def event_generator():
        try:
            async with client.messages.stream(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                messages=messages,
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'text': text})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
