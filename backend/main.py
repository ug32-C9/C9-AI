from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from C9 import route
import os
from pathlib import Path

app = FastAPI(
    title="C9-AI",
    description="AI Assistant by KohSec-Team",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get paths
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

# Serve static files (CSS, JS)
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


class ChatReq(BaseModel):
    message: str
    mode: str


@app.get("/")
async def read_root():
    """Serve the frontend HTML"""
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "C9-AI Backend is running. Frontend not found."}


@app.get("/health")
async def health_check():
    """Health check endpoint for Render"""
    return {
        "status": "healthy",
        "service": "C9-AI",
        "version": "1.0.0"
    }


@app.post("/chat")
def chat(req: ChatReq):
    """Main chat endpoint"""
    reply = route(req.message, req.mode)
    return {"response": reply}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000))
    )

