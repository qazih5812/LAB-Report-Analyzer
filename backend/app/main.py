from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_NAME, VERSION, LAB_REPORTS_DIR
from app.api.routes import router
from app.db.database import init_db, get_report_history, record_report_history
from app.core.parser import load_all_reports
from app.core.classifier import classify_test_result

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

@app.on_event("startup")
def on_startup():
    """Initializes the database schema and seeds initial reports into history if empty."""
    init_db()
    existing = get_report_history(limit=5)
    if not existing:
        try:
            reports = load_all_reports(LAB_REPORTS_DIR)
            for r in reports:
                classified = [classify_test_result(raw, r.recorded_age, r.biological_sex) for raw in r.raw_results]
                has_urgent = any(c.is_urgent for c in classified)
                record_report_history(
                    patient_id=r.patient_id,
                    patient_name=r.patient_name,
                    mrn=r.mrn,
                    report_date=r.date_of_issuance,
                    results=[c.model_dump() for c in classified],
                    has_urgent=has_urgent,
                    summary_excerpt=f"Routine encounter for {r.patient_name} ({r.mrn}) with {len(classified)} biomarkers."
                )
        except Exception as e:
            print(f"Warning during DB startup seed: {e}")

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
