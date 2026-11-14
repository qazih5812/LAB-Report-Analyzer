# CityLab Diagnostics — Render Cloud Deployment Guide

This guide describes how to deploy the full **CityLab Diagnostics** application (FastAPI backend + React frontend + SQLite persistence + Multimodal PDF/Image Upload) to [Render.com](https://render.com) in less than 3 minutes using the provided multi-stage `Dockerfile` and `render.yaml` blueprint.

---

## Architecture Overview on Render

- **Single Container Deployment**: The Dockerfile builds the React/Vite frontend in Stage 1 and copies the production assets (`dist/`) directly into FastAPI's static directory in Stage 2.
- **Unified Port Routing**: A single Web Service hosts both the frontend UI and the REST API at `https://<your-app>.onrender.com`.
- **Dynamic Port Binding**: FastAPI automatically reads `$PORT` provided by Render.
- **Multimodal Support**: Supports `.pdf`, `.png`, `.jpg`, `.jpeg`, and `.md` file uploads.

---

## Method 1: Deploy with Render Blueprint (Recommended)

1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository:
   ```
   https://github.com/qazih5812/LAB-Report-Analyzer.git
   ```
4. Render will automatically detect `render.yaml`.
5. Enter your optional environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key (optional for image OCR and explanations).
   - `GROQ_API_KEY`: Your Groq API key (optional backup provider).
6. Click **Apply**.
7. Render will build the Docker container and deploy the app live with an automatic HTTPS URL.

---

## Method 2: Manual Web Service Deployment

1. On the Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Select your repository: `qazih5812/LAB-Report-Analyzer`.
3. Fill in the service settings:
   - **Name**: `citylab-explainer`
   - **Language / Runtime**: `Docker`
   - **Branch**: `main`
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Instance Type**: `Free`
4. Expand **Advanced** and add Environment Variables:
   - `PORT`: `10000` (or leave default, Render sets this automatically)
   - `GEMINI_API_KEY`: *(Your key)*
   - `GROQ_API_KEY`: *(Your key)*
5. Click **Create Web Service**.

---

## Post-Deployment Verification Checklist

Once Render finishes building:

1. **Health Check**:
   Visit `https://<your-app>.onrender.com/api/health` — should return:
   ```json
   {
     "status": "healthy",
     "app": "CityLab Diagnostics — Medical Lab Report Explainer",
     "version": "1.0.0",
     "reports_loaded": 14
   }
   ```
2. **Interactive UI**:
   Visit `https://<your-app>.onrender.com/` — should load the CityLab interface with:
   - Sidebar navigation
   - "How It Works" protocol view
   - Top language selector (`[ EN | اردو | Roman Urdu | العربية ]`)
   - 14 patient reports
3. **Live 14/14 Self-Audit**:
   Click **"Run Live 14/14 Self-Audit"** in the UI to confirm 100% deterministic test passage.
4. **File Upload Testing**:
   Click **"+ New Analysis"** or **"Analyze Report"** and upload:
   - A PDF report (`.pdf`)
   - A lab report screenshot (`.png` / `.jpg`)
   - A Markdown report (`.md`)
