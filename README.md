# TriNetra — Digital Eyes

AI traffic-management command centre for Nagpur city: predictive risk mapping, officer
deployment, computer-vision violation detection, e-challan generation and emergency dispatch.

Built with [Lovable](https://lovable.dev) · **Live app**: https://trinetra-insight-map.lovable.app

---

## Stack

| Layer    | Tech                                                                 |
| -------- | -------------------------------------------------------------------- |
| Frontend | React 19, TanStack Start + Router, Tailwind CSS v4, shadcn/ui, Recharts |
| Maps     | Google Maps JavaScript API (`visualization` library for the risk heatmap) |
| Vision   | Python pipeline in `backend/` — Ultralytics YOLO, OpenCV, supervision, EasyOCR |

## Prerequisites

- Node.js 20+ (or [Bun](https://bun.sh))
- Python 3.10+ (only if you want to run the vision backend)
- A Google Maps JavaScript API key

## 1. Configure environment

```sh
cp .env.example .env
```

Fill in:

- `VITE_GOOGLE_MAPS_API_KEY` — from Google Cloud Console. Enable **Maps JavaScript API**,
  then restrict the key to your domains (`http://localhost:*` for local dev).
- `VITE_API_BASE_URL` — optional. Leave empty to run the app fully offline; uploaded
  footage is then ingested by the in-browser pipeline.

## 2. Run the frontend

```sh
npm install
npm run dev
```

The app is served at http://localhost:8080.

Other scripts: `npm run build` (production build), `npm run start` (serve the build),
`npm run lint`.

## 3. Run the vision backend (optional)

```sh
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `VITE_API_BASE_URL=http://localhost:8000` in `.env` and restart the dev server.
With a backend configured, drag-and-drop uploads are streamed to
`POST /api/streams/upload` with real progress; without one they stay in the browser.

## Features

- **Command Center** — Google Maps risk grid with a live weighted heatmap, junction markers,
  dispatch corridors and detail popups. Time-of-day and weather controls re-run the risk engine.
- **Risk Intelligence** — per-junction factor decomposition and scoring trends.
- **Deployment** — officer allocation and high-risk coverage tracking.
- **Incidents / Dispatch** — live response queue and emergency routing.
- **Digital Twin** — what-if rehearsal of interventions.
- **Camera Vision** — drag-and-drop video ingest (mp4/mov/avi/webm, up to 512 MB), live
  detection overlay, zones, and event stream.
- **E-Challan** — automated violation fines with plate evidence.
- **Analytics** — trends and audit trail.

## Project structure

```
src/
  routes/            file-based routes (one per dashboard)
  components/
    trinetra/        shell, risk map, dashboard widgets
    vision/          live canvas, drag-and-drop uploader
    ui/              shadcn primitives
  lib/
    trinetra/        risk engine, data model, app store
    vision/          detection simulation + stream store
    maps/            Google Maps loader & light map style
    api.ts           backend base URL + upload client
  styles.css         design tokens (light theme) and utilities
backend/             FastAPI + YOLO vision pipeline
```

## Notes

- The map requires a valid `VITE_GOOGLE_MAPS_API_KEY`; without it the map panel shows a
  configuration message instead of failing silently.
- All colours come from semantic tokens in `src/styles.css` — avoid hard-coded colour classes.
