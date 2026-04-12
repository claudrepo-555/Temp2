from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import flights, cameras, ai

app = FastAPI(title="WorldView API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flights.router, prefix="/api")
app.include_router(cameras.router, prefix="/api")
app.include_router(ai.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "WorldView API"}
