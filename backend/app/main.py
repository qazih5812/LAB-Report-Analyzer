from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_NAME, VERSION
from app.api.routes import router

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="Deterministic Medical Lab Report Explainer for Tech Fusion '26 (Problem Statement B)."
)

# Enable CORS for local dev and live cloud deployment (Vercel, Netlify, Render, Docker)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:80",
        "http://localhost",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "CityLab Diagnostics Medical Lab Report Explainer API is online.",
        "documentation": "/docs",
        "health": "/api/health",
        "reports": "/api/reports"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
