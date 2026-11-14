from pathlib import Path
import os
import dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
env_candidates = [
    BASE_DIR.parent / ".env",
    BASE_DIR / ".env",
    Path.cwd() / ".env",
    Path.cwd().parent / ".env",
]
for env_path in env_candidates:
    if env_path.exists():
        dotenv.load_dotenv(dotenv_path=env_path)
        break

# Discover lab_reports directory
ENV_LAB_REPORTS = os.getenv("LAB_REPORTS_DIR")
if ENV_LAB_REPORTS and Path(ENV_LAB_REPORTS).exists():
    LAB_REPORTS_DIR = Path(ENV_LAB_REPORTS).resolve()
else:
    # Check City-Lab-AI-Hackathon/lab_reports
    candidate1 = BASE_DIR.parent / "lab_reports"
    # Check current workspace root lab_reports
    candidate2 = BASE_DIR.parent.parent / "City-Lab-AI-Hackathon" / "lab_reports"
    
    if candidate1.exists():
        LAB_REPORTS_DIR = candidate1.resolve()
    elif candidate2.exists():
        LAB_REPORTS_DIR = candidate2.resolve()
    else:
        LAB_REPORTS_DIR = (BASE_DIR.parent / "lab_reports").resolve()

APP_NAME = "CityLab Diagnostics — Medical Lab Report Explainer"
VERSION = "1.0.0"
