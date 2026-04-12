import time
import httpx
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

_cache: dict = {"data": None, "timestamp": 0}
CACHE_TTL = 15  # seconds
OPENSKY_URL = "https://opensky-network.org/api/states/all"


def parse_state(state: list) -> dict:
    return {
        "icao24": state[0],
        "callsign": (state[1] or "").strip() or None,
        "origin_country": state[2],
        "time_position": state[3],
        "last_contact": state[4],
        "lon": state[5],
        "lat": state[6],
        "baro_altitude": state[7],
        "on_ground": state[8],
        "velocity": state[9],
        "heading": state[10],
        "vertical_rate": state[11],
        "geo_altitude": state[13],
        "squawk": state[14],
    }


@router.get("/flights")
async def get_flights(
    lamin: float = Query(default=26.0),
    lomin: float = Query(default=-106.0),
    lamax: float = Query(default=33.0),
    lomax: float = Query(default=-93.0),
):
    global _cache
    now = time.time()

    if _cache["data"] and (now - _cache["timestamp"]) < CACHE_TTL:
        return {**_cache["data"], "from_cache": True}

    params = {"lamin": lamin, "lomin": lomin, "lamax": lamax, "lomax": lomax}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(OPENSKY_URL, params=params)
            resp.raise_for_status()
            raw = resp.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429 and _cache["data"]:
            return {**_cache["data"], "from_cache": True, "cache_stale": True}
        raise
    except Exception:
        if _cache["data"]:
            return {**_cache["data"], "from_cache": True, "cache_stale": True}
        return {"time": now, "flights": [], "from_cache": False}

    states = raw.get("states") or []
    flights = [
        parse_state(s)
        for s in states
        if s[5] is not None and s[6] is not None
    ]

    result = {"time": raw.get("time", now), "flights": flights, "from_cache": False}
    _cache = {"data": result, "timestamp": now}
    return result
