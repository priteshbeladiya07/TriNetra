# 🚦 TriNetra — AI Traffic Risk, Computer Vision & Police Deployment Command Center

> **See the risk. Detect the incident. Understand the reason. Deploy the right resources.**

TriNetra is an AI-powered **traffic intelligence, computer-vision, risk prediction, enforcement, incident response, and police deployment decision-support platform** designed for smart-city traffic operations.

The system combines a realistic Nagpur traffic-risk simulation with a camera-vision pipeline and a human-in-the-loop command dashboard. It is designed to move beyond a conventional traffic dashboard by answering:

> **Where is the risk, what is happening, why is it happening, what should authorities do next, and how should limited police resources be deployed?**

---

## 📌 Project Overview

Traditional traffic-management systems generally focus on monitoring, enforcement, or displaying CCTV feeds. TriNetra brings these capabilities together into one operational platform.

The platform has two major intelligence layers:

### 1. 🧠 Traffic Risk & Deployment Intelligence

TriNetra continuously evaluates monitored Nagpur junctions using:

- Traffic congestion
- Historical accidents
- Violation density
- Weather
- Public events and crowd pressure
- Road and structural risk
- Current police coverage
- Active incidents

It converts these signals into a **0–100 composite risk score**, identifies coverage gaps, ranks locations by deployment priority, and recommends how officers should be allocated.

### 2. 👁️ Computer Vision & Enforcement Intelligence

The camera-vision pipeline analyzes video streams using object detection and tracking to identify events such as:

- Overspeeding
- Red-light violations
- No helmet
- Triple riding
- Pedestrian intrusion
- Animals on road
- Litter / abandoned objects
- Fire
- Smoke
- Suspected accidents

Detected enforcement events can enter the **e-Challan workflow**, while critical events such as fire, smoke, and suspected accidents can trigger the **Police Dispatch workflow**.

---

# 🎯 Core Problem

Traffic authorities have to manage many junctions with a limited number of officers.

Traffic conditions can change rapidly because of:

- 🚗 Rush-hour congestion
- 🚨 Accidents
- 🌧️ Rain and poor visibility
- 🚦 Traffic violations
- 🏟️ Sports events
- 🎪 Festivals and processions
- 👥 Crowd surges
- 🛣️ Roadwork
- 💡 Poorly lit or structurally risky roads
- 🚧 Waterlogging
- 🚥 Signal failures

The challenge is not simply detecting traffic.

The real operational question is:

> **"Where should limited traffic-police personnel be deployed right now, why are they needed there, and how should deployment change when conditions change?"**

TriNetra is built around this decision-support problem.

---

# 💡 What TriNetra Does

TriNetra transforms multiple data sources into an operational workflow:

```text
Traffic / CCTV / Accidents / Violations / Weather / Events
                         │
                         ▼
                Data & Vision Layer
                         │
                         ▼
              Risk & Incident Engine
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       Risk Intelligence       Incident Detection
              │                     │
              ▼                     ▼
       Coverage Analysis      Dispatch / Challan
              │
              ▼
       Deployment Optimizer
              │
              ▼
       Explainable Recommendation
              │
              ▼
       Human Operator Decision
              │
              ▼
        Audit / Feedback
```

---

# 🌟 Major Features

## 🗺️ 1. Live Nagpur Risk Command Center

The main dashboard provides an operational overview of the simulated Nagpur traffic network.

### Dashboard metrics

- Average city risk
- High-risk zones
- Medium-risk zones
- Low-risk zones
- Officers allocated
- Total officer roster
- Open incidents
- High-risk coverage
- Unmanned risk zones

### Risk heatmap

The map displays junction-level risk using:

| Risk Score | Level |
|---:|---|
| 0–40 | 🟢 Low |
| 41–70 | 🟡 Medium |
| 71–100 | 🔴 High |

Each location can be selected to inspect its detailed risk state.

---

# 🧮 2. Composite AI Risk Scoring

TriNetra calculates a composite risk score from six major factors.

```text
Risk Score =
    30% × Traffic Congestion
  + 25% × Accident Probability
  + 15% × Violation Density
  + 10% × Weather Impact
  + 10% × Event / Crowd Pressure
  + 10% × Structural Risk
```

### Factor breakdown

| Factor | Weight | Examples |
|---|---:|---|
| Traffic Congestion | 30% | Vehicle flow, road capacity, demand |
| Accident Probability | 25% | Historic accidents, congestion, weather |
| Violation Density | 15% | Violations/hour |
| Weather Impact | 10% | Clear, rain, heavy rain, fog |
| Event/Crowd | 10% | Festivals, sports, rallies |
| Structural Risk | 10% | Road type, lighting, signal, nearby sensitive areas |

Every risk result contains both:

- Normalized raw factors
- Weighted factor contributions
- Final score
- Risk band
- Explanation

---

# 🚨 3. "Act Here First" Priority Ranking

TriNetra does not rank locations using risk alone.

A high-risk junction that already has enough officers may be less urgent than a high-risk junction with insufficient coverage.

The deployment priority is:

```text
Deployment Priority =
Risk Score × (1 − Current Coverage Ratio)
```

This creates an operational ranking of:

> **Where should authorities act first?**

The dashboard can show:

- Junction
- Risk score
- Current officers
- Recommended officers
- Coverage
- Priority
- Explanation
- Recommended movement

---

# 👮 4. Police Deployment Optimizer

TriNetra treats police deployment as a **constrained resource-allocation problem**.

The optimizer considers:

- Fixed officer pool
- Current officer distribution
- Required officers per risk level
- High-risk locations
- Current coverage
- Unmanned or under-covered zones
- Manual officer overrides

The implementation includes a greedy constrained allocation strategy that prioritizes locations according to marginal risk reduction.

### Example

```text
Location             Risk     Current     Recommended
-------------------------------------------------------
Variety Square        87          1            5
Wardha Road           82          2            4
Pardi Naka            79          0            4
Sitabuldi             74          3            4
```

The system then calculates where officers should be added or moved.

---

# 👤 5. Officer Roster

TriNetra includes a simulated police roster containing:

- Officer ID
- Officer name
- Rank
- Shift
- Current post
- Availability
- Deployment status
- Fatigue score

Supported ranks include:

- Constable
- Head Constable
- Marshal
- PSI

Supported shifts:

- A — 06:00–14:00
- B — 14:00–22:00
- C — 22:00–06:00

Officer fatigue is also surfaced in the deployment interface to support future fairness and workload constraints.

---

# 🚨 6. Incident Command Center

The Incident Command interface allows operators to report incidents directly against a junction.

Supported incident types:

- Accident
- Breakdown
- Waterlogging
- Signal Failure
- Crowd Surge

Supported severity levels:

- Minor
- Major
- Critical

### Incident workflow

```text
Operator reports incident
          ↓
Incident pressure injected
          ↓
Junction risk recalculated
          ↓
Affected grid updated
          ↓
Deployment plan re-optimized
          ↓
New recommendation displayed
```

This means an incident does not remain just a log entry — it directly affects the decision engine.

---

# 🔄 7. Dynamic Re-optimization

When an incident changes the risk state, TriNetra can immediately recalculate:

- Junction risk
- Risk ranking
- Coverage
- Officer requirements
- Deployment priority
- Recommended officer allocation

Example:

```text
Before:
Junction A → Medium Risk
Junction B → High Risk

New accident at Junction A
          ↓
Junction A → Critical Risk
          ↓
Optimizer runs again
          ↓
Officer redeployment recommendation
```

---

# 🪞 8. Nagpur Digital Twin / What-If Simulator

One of TriNetra's key differentiators is the **Digital Twin**.

The simulator lets commanders test hypothetical scenarios without changing the live operational state.

### Example scenarios

- Start heavy rain
- Enable/disable city events
- Change time of day
- Move officers between junctions
- Increase incident pressure
- Test a future crowd event
- Test how risk coverage changes

### Workflow

```text
CURRENT WORLD STATE
        │
        ▼
Create hypothetical state
        │
        ├── Change weather
        ├── Change event state
        ├── Change officer allocation
        └── Simulate incident
        │
        ▼
Run same Risk Engine
        │
        ▼
Run same Deployment Optimizer
        │
        ▼
Compare BEFORE vs AFTER
```

The live state is not modified by the simulation.

### Comparison metrics

The simulator compares:

- High-risk coverage
- Average city risk
- Number of high-risk zones
- Officer allocation
- Risk changes
- Deployment changes

This turns TriNetra from a monitoring tool into a **decision-rehearsal tool**.

---

# 👁️ 9. Live Camera Vision

The Camera Vision module provides a dedicated computer-vision interface.

The frontend supports:

- Live camera feed
- Object tracking overlay
- Detection event feed
- Alert banners
- Event confidence
- Track IDs
- Speed information
- Scenario simulation
- Accident simulation
- Fire simulation

The backend uses:

- YOLO-based object detection
- ByteTrack-style tracking through the tracking pipeline
- OpenCV
- Supervision
- Event-specific detection modules

The backend supports video files, RTSP streams, webcam sources, and scenario inputs.

---

# 🎥 10. Computer Vision Event Detection

TriNetra's vision event taxonomy includes:

| Event | Description |
|---|---|
| Overspeed | Vehicle exceeding configured speed limit |
| Red Light | Red-light jump |
| No Helmet | Helmet violation |
| Triple Riding | More than permitted riders |
| Pedestrian Intrusion | Pedestrian entering monitored roadway area |
| Animal on Road | Animal detected on roadway |
| Litter | Litter / abandoned object suspicion |
| Fire | Fire detection |
| Smoke | Smoke detection |
| Accident | Suspected accident |

---

# 🚗 11. Vehicle Tracking & Speed Analysis

The vision pipeline tracks detected objects across video frames.

Each track can contain:

- Track ID
- Object class
- Bounding box
- Detection confidence
- Estimated speed
- Associated event flag

The backend maintains tracking state and calculates speed information from tracked objects.

A configurable speed limit is associated with each registered stream.

---

# 🚦 12. Red-Light Violation Detection

The red-light module identifies potential red-light violations from the camera stream.

A detected violation can be:

```text
Camera
  ↓
Vehicle Detection
  ↓
Tracking
  ↓
Red-Light Event
  ↓
Evidence Snapshot
  ↓
e-Challan Workflow
```

---

# 🪖 13. Helmet Detection

TriNetra supports a dedicated helmet/no-helmet detection module.

The project explicitly supports a custom helmet model because standard COCO YOLO weights do not provide a dedicated helmet class.

Custom model support:

```text
backend/models/helmet/best.pt
```

If the custom model is not available, the system reports that helmet detection is unavailable instead of producing unreliable helmet detections.

---

# 👥 14. Triple-Riding Detection

The vision system includes triple-riding detection for identifying cases where multiple riders are detected on a two-wheeler.

Detected violations can feed the enforcement pipeline.

---

# 🚶 15. Pedestrian Intrusion Detection

TriNetra can flag pedestrian intrusion events where pedestrians enter monitored roadway regions.

This can help identify:

- Unsafe pedestrian crossings
- Roadway encroachment
- Potential conflict zones
- Pedestrian-heavy locations

---

# 🐕 16. Animal-on-Road Detection

The vision event layer includes animal-on-road detection.

This can identify unexpected road obstacles and contribute to the incident/risk workflow.

---

# 🗑️ 17. Litter / Abandoned Object Detection

TriNetra includes a review-oriented litter/abandoned-object event.

These events can be flagged for operator review rather than automatically treated as critical emergencies.

---

# 🔥 18. Fire & Smoke Detection

Fire and smoke are treated as **critical events**.

The architecture supports:

- Fire detection
- Smoke detection
- Evidence capture
- Critical-event handling
- Emergency dispatch

The backend supports a fire/smoke module with a heuristic fallback and a custom-model path.

For production use, the project recommends a trained fire/smoke model and temporal analysis rather than relying only on a single-frame color threshold.

---

# 🚑 19. Automatic Emergency Dispatch

Critical camera events can bypass the normal challan workflow.

Critical events include:

- 🔥 Fire
- 🌫️ Smoke
- 🚨 Suspected Accident

The dispatch pipeline creates a response order containing:

- Event ID
- Event type
- Stream
- Location
- Timestamp
- Dispatch status
- Unit
- ETA
- Responders
- Notes

Example response units include:

```text
PCR-07 Sitabuldi
PCR-12 Dharampeth
FIRE-03 Civil Lines
AMB-21 GMCH
```

---

# 🧾 20. Automated E-Challan Workflow

Traffic violations detected by computer vision can be converted into e-challans.

Supported challan events:

- Overspeed
- Red-light violation
- No helmet
- Triple riding

Each challan can contain:

- Challan ID
- Event ID
- Number plate
- Plate confidence
- Violation type
- Vehicle class
- Evidence snapshot
- Timestamp
- Location
- Status

---

# 🔎 21. ANPR / Number Plate Pipeline

The enforcement layer includes automatic number plate recognition support.

The workflow is:

```text
Vehicle Detection
       ↓
Vehicle Tracking
       ↓
Violation Detection
       ↓
ANPR / Plate Recognition
       ↓
Evidence Snapshot
       ↓
E-Challan
```

The backend includes EasyOCR as part of the ANPR pipeline.

---

# 💰 22. Fine Calculation

The current simulated statutory fine mapping includes:

| Violation | Fine |
|---|---:|
| Overspeeding | ₹2,000 |
| Red Light | ₹1,000 |
| No Helmet | ₹1,000 |
| Triple Riding | ₹1,000 |

These values are implemented as configurable project data and should be independently verified before any real-world enforcement deployment.

---

# ⚖️ 23. Challan Review & Dispute Workflow

Challans support multiple states:

```text
Auto Generated
      ↓
Pending Review
      ↓
Issued
```

or:

```text
Pending Review
      ↓
Disputed
```

The E-Challan dashboard provides:

- Search by plate
- Search by challan ID
- Status filters
- Review
- Issue
- Dispute
- CSV export
- Evidence inspection

---

# 📸 24. Evidence Capture

Vision events can store evidence snapshots.

The backend creates event records containing:

- Event metadata
- Timestamp
- Confidence
- Stream ID
- Evidence snapshot path
- Optional evidence clip
- Review status
- Reviewer note

This provides an auditable connection between detection and enforcement/response.

---

# 📊 25. Analytics & Audit Dashboard

TriNetra includes a dedicated **Trends & Audit** dashboard.

It provides:

### 24-hour analytics

- Risk trend
- Violation trend
- Current time window

### Violation mix

Shows the distribution of e-challan violations.

### Zone comparison

Compares average composite risk across Nagpur zones.

### Operator decision audit

Tracks human decisions such as:

- Accepted
- Modified
- Rejected

This supports the human-in-the-loop operating model.

---

# 🕵️ 26. Hidden Dangerous Zone Detection

The Risk Intelligence page includes a hidden-danger concept.

A location may appear safe when looking only at raw accident counts, but can still be risky due to:

- High severity
- Structural risk
- Violation pressure
- Poor lighting
- Congestion
- Environmental conditions

TriNetra surfaces these situations for deeper inspection rather than relying only on accident frequency.

---

# 🌦️ 27. Weather-Aware Risk

Supported simulated weather states:

- Clear
- Light Rain
- Heavy Rain
- Fog

Weather affects the risk engine.

For example:

```text
Clear
  ↓
Low weather impact

Light Rain
  ↓
Moderate impact

Heavy Rain
  ↓
High impact

Fog
  ↓
High visibility-related risk
```

Weather can therefore change both the risk score and the deployment priority.

---

# 🎪 28. Event & Crowd Intelligence

The simulation includes events that can create temporary risk spikes.

Examples include:

- Ganesh Visarjan Procession
- Dhamma Chakra Gathering
- VCA Stadium T20 Fixture
- Metro Pillar Roadwork
- Farmers' Union Rally
- VIP Convoy Movement

Events have:

- Event type
- Junction
- Active time window
- Expected crowd
- Risk pressure

This allows the risk engine to model short-duration situations that historical traffic patterns may not capture.

---

# 🛣️ 29. Road & Structural Risk

Junction-level structural information includes:

- Road type
- Lane count
- Signal availability
- Lighting quality
- Nearby school
- Nearby hospital
- Nearby market
- Historic accident count
- Base traffic flow

Structural risk contributes to the final composite score.

---

# 🗺️ 30. Nagpur Junction Simulation

The project contains a simulated Nagpur traffic network with **28 configured junctions**.

Examples include:

- Variety Square
- Sitabuldi Main Road
- Sadar Bazaar Chowk
- Ram Jhula Junction
- Wardha Road / Ajni
- Chhatrapati Square
- Manish Nagar Crossing
- Kamptee Road / Indora
- Automotive Square
- Deekshabhoomi
- Medical Square
- Zero Mile Chowk
- Pardi Naka
- Kalamna Market
- Hingna T-Point
- Dharampeth Square
- Futala Lake Road
- Jaripatka Square
- Besa Ring Road
- Mankapur Square

Each junction contains simulated geographic and traffic attributes.

---

# 🔢 31. Deterministic Traffic Simulation

The frontend risk engine uses a deterministic simulation model.

Traffic demand follows a two-peak daily pattern:

```text
Morning Peak
≈ 10:00 AM

Evening Peak
≈ 7:00 PM
```

The engine considers:

- Time of day
- Base traffic flow
- Road capacity
- Lane count
- Weather
- Incident pressure
- Events
- Historical accidents

Deterministic pseudo-noise keeps the simulated dashboard stable for the same junction and hour.

---

# 🧠 32. Explainable Risk Recommendations

Every risk result contains an explanation.

Example:

```text
Variety Square scores 82/100 —
driven by traffic congestion (+28),
accident probability (+22),
and violation density (+12).

1 of 4 recommended officers are currently on post.
```

This makes the recommendation inspectable instead of presenting an unexplained AI score.

---

# 👨‍✈️ 33. Human-in-the-Loop Control

TriNetra is not designed to automatically make final operational decisions.

Operators can:

- Accept recommendations
- Modify deployment
- Reject recommendations
- Review incidents
- Review challans
- Clear incidents
- Inspect evidence
- Run simulations
- Compare deployment plans

The architecture follows:

> **AI recommends — human decides.**

---

# 🎨 34. Modern Command-Center UI

The frontend is designed as a professional control-room interface with:

- Dark operational theme
- Risk-aware visual hierarchy
- Animated alerts
- Live clock
- Interactive maps
- Data cards
- Charts
- Tables
- Event feeds
- Status badges
- Responsive layouts
- Motion/transition effects
- Command-center navigation

---

# 🧭 Application Modules

The frontend is organized into dedicated operational pages.

| Route | Purpose |
|---|---|
| `/` | Main Nagpur Risk Command Center |
| `/risk` | Risk Intelligence |
| `/deployment` | Police Deployment Optimizer |
| `/incidents` | Incident Command |
| `/camera-vision` | Live Computer Vision |
| `/e-challan` | Automated E-Challan |
| `/dispatch` | Emergency Police/Fire/Ambulance Dispatch |
| `/analytics` | Trends & Operator Audit |
| `/simulator` | Digital Twin / What-If Simulation |

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────────────┐
                         │       TriNetra UI            │
                         │ React + TypeScript + Vite    │
                         └──────────────┬───────────────┘
                                        │
             ┌──────────────────────────┼─────────────────────────┐
             │                          │                         │
             ▼                          ▼                         ▼
      Risk Dashboard              Camera Vision            Operations
             │                          │                         │
             ▼                          ▼                         ▼
       Risk Engine               YOLO + Tracking        Incidents / Dispatch
             │                          │                         │
             ▼                          ▼                         ▼
 Deployment Optimizer          Event Detection            E-Challan
             │                          │                         │
             └──────────────┬───────────┴─────────────────────────┘
                            ▼
                   Human Operator / Audit
```

---

# 🧰 Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- TanStack Router
- React Leaflet
- Leaflet
- Recharts
- Motion
- Lucide React
- Tailwind CSS
- Radix UI components
- React Hook Form
- Zod
- Sonner

## Computer Vision Backend

- Python
- Ultralytics YOLO
- OpenCV
- NumPy
- Supervision
- EasyOCR

## Vision Models

- YOLO-based object detection
- Custom helmet model support
- Fire/smoke model support
- Tracking pipeline
- ANPR/OCR

## Storage

The current backend intentionally uses **local JSON persistence** rather than PostgreSQL or another database.

This makes the prototype simple to run locally and easy to demonstrate.

---

# 📁 Project Structure

```text
TriNetra/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── detector.py
│   │   │   ├── homography.py
│   │   │   └── tracker_utils.py
│   │   │
│   │   ├── modules/
│   │   │   ├── accident.py
│   │   │   ├── anpr_challan.py
│   │   │   ├── dispatch.py
│   │   │   ├── fire_smoke.py
│   │   │   ├── helmet.py
│   │   │   ├── intrusion.py
│   │   │   ├── litter.py
│   │   │   ├── overloading.py
│   │   │   ├── red_light.py
│   │   │   └── speed.py
│   │   │
│   │   ├── storage_io/
│   │   │   └── json_store.py
│   │   │
│   │   └── main.py
│   │
│   ├── models/
│   │   ├── fire_smoke/
│   │   └── helmet/
│   │
│   ├── tests/
│   ├── tools/
│   └── requirements.txt
│
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── live-feed.mp4
│
├── src/
│   ├── components/
│   │   ├── trinetra/
│   │   ├── vision/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── trinetra/
│   │   │   ├── data.ts
│   │   │   ├── engine.ts
│   │   │   └── store.ts
│   │   │
│   │   └── vision/
│   │       ├── engine.ts
│   │       ├── liveTracks.ts
│   │       ├── scenarios.ts
│   │       ├── store.tsx
│   │       └── types.ts
│   │
│   └── routes/
│       ├── analytics.tsx
│       ├── camera-vision.tsx
│       ├── deployment.tsx
│       ├── dispatch.tsx
│       ├── e-challan.tsx
│       ├── incidents.tsx
│       ├── index.tsx
│       ├── risk.tsx
│       └── simulator.tsx
│
├── package.json
└── README.md
```

---

# ⚙️ Risk Engine

The risk engine is implemented as a reusable pure calculation layer.

It receives a `WorldState` containing:

```text
hour
weather
eventsEnabled
totalOfficers
incidentPressure
manualOfficers
```

It produces:

```text
RiskResult[]
Allocation[]
Metrics
```

This same engine powers both:

- Live dashboard
- Digital Twin simulation

That means the What-If simulator does not use a separate fake calculation path.

---

# 📊 Risk Result Data

Each junction result can contain:

```text
Junction
Risk Score
Risk Band
Congestion Factor
Accident Factor
Violation Factor
Weather Factor
Event Factor
Structural Factor
Congestion Index
Violations per Hour
Officers Present
Officers Recommended
Coverage
Deployment Priority
Active Event
Explanation
```

---

# 🚀 Getting Started

## Prerequisites

### Frontend

Install:

- Node.js
- npm

### Backend

Install:

- Python 3.x
- pip
- OpenCV-compatible environment

---

# 💻 Frontend Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd trinetra
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run lint:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

---

# 🐍 Backend Installation

Move into the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Activate it on Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 🎥 Running the Computer Vision Pipeline

The backend can process:

- Video files
- RTSP streams
- Webcam input

Example:

```bash
python -m app.main --source path/to/video.mp4
```

Specify a stream ID:

```bash
python -m app.main \
  --source path/to/video.mp4 \
  --stream-id stream_01
```

Specify custom YOLO weights:

```bash
python -m app.main \
  --source path/to/video.mp4 \
  --weights yolov8s.pt
```

Frame skipping can be configured:

```bash
python -m app.main \
  --source path/to/video.mp4 \
  --frame-skip 2
```

---

# 🪖 Custom Helmet Model

The standard COCO model does not contain a dedicated helmet/no-helmet class.

For real helmet detection, provide a custom trained model:

```text
backend/models/helmet/best.pt
```

A compatible training workflow is:

```bash
yolo train \
  data=helmet.yaml \
  model=yolov8n.pt \
  epochs=100 \
  imgsz=640
```

Then place:

```text
runs/detect/train/weights/best.pt
```

at:

```text
backend/models/helmet/best.pt
```

---

# 🔥 Fire / Smoke Model

For production-grade fire and smoke detection, a dedicated trained model is recommended.

The system architecture supports:

```text
Fire + Smoke Model
        ↓
Temporal frame analysis
        ↓
Event confirmation
        ↓
Critical alert
        ↓
Dispatch
```

The project deliberately avoids treating simple color thresholding as reliable fire detection.

Hard negatives for a production model should include:

- Brake lights
- Red vehicles
- Street lighting
- Sunset glare
- Red banners
- Similar visual false positives

---

# 🗄️ Storage

The current backend uses **local JSON persistence**.

This prototype architecture avoids database drivers such as:

- PostgreSQL drivers
- SQLAlchemy
- SQLite

Core storage records can include:

```text
streams.json
events.json
challans.json
dispatch.json
```

Evidence snapshots are stored locally.

This design is intentionally lightweight for hackathon/demo environments.

---

# 🔐 Human Oversight & Safety

TriNetra is a **decision-support prototype**, not an autonomous law-enforcement system.

Important principles:

- AI recommendations should be reviewed by authorized operators.
- Camera-derived information should be handled according to applicable privacy requirements.
- Automated challan information should be verified before real-world enforcement.
- Simulated data must not be presented as official live police data.
- Emergency dispatch integrations should require appropriate authorization.
- Production deployment requires validated models, legal review, secure infrastructure, authentication, access control, logging, and audited operational procedures.

---

# 🧪 Testing

Backend tests are included under:

```text
backend/tests/
```

Run:

```bash
pytest
```

The repository also contains pure-logic tests for core project behavior.

---

# 🎬 Recommended Hackathon Demo

A strong 5–7 minute demonstration can follow this sequence:

### Step 1 — Open Command Center

Show the Nagpur risk grid.

### Step 2 — Show the Heatmap

Explain:

```text
Green → Low
Amber → Medium
Red → High
```

### Step 3 — Select a High-Risk Junction

Show:

- Risk score
- Factor breakdown
- Current officers
- Required officers
- Explanation

### Step 4 — Open Deployment Optimizer

Show the:

```text
Act Here First
```

ranking and officer recommendations.

### Step 5 — Open Camera Vision

Show:

- Live feed
- Object tracks
- Detection events
- Speed
- Violation alerts

### Step 6 — Generate a Violation

Show the event entering the e-Challan pipeline.

### Step 7 — Trigger Critical Event

Simulate:

```text
Accident / Fire
```

Show the dispatch order.

### Step 8 — Report an Incident

Inject:

```text
Waterlogging
Signal Failure
Crowd Surge
```

and show risk re-optimization.

### Step 9 — Run Digital Twin

Ask:

> "What if heavy rain starts and two officers are moved to another junction?"

Compare:

```text
Current Plan
        VS
Simulated Plan
```

### Step 10 — Close With Impact

Show:

- Improved high-risk coverage
- Reduced deployment gaps
- Updated risk score
- Updated officer allocation

---

# 🏆 Why TriNetra Is Different

Most traffic dashboards stop at:

```text
Detect → Display
```

TriNetra goes further:

```text
Detect
  ↓
Understand
  ↓
Predict
  ↓
Score
  ↓
Prioritize
  ↓
Optimize
  ↓
Explain
  ↓
Simulate
  ↓
Human Decision
  ↓
Audit
```

The combination of:

- AI traffic-risk scoring
- Computer vision
- Incident response
- E-Challan
- Emergency dispatch
- Police optimization
- Explainability
- Digital Twin simulation
- Human-in-the-loop control

makes TriNetra a broader **traffic intelligence and operational decision-support platform**.

---

# 🔮 Future Roadmap

## Phase 1 — Prototype

- [x] Nagpur risk grid
- [x] Risk scoring
- [x] Heatmap
- [x] Deployment optimizer
- [x] Incident command
- [x] Digital Twin
- [x] Camera vision interface
- [x] Violation pipeline
- [x] E-Challan workflow
- [x] Dispatch workflow
- [x] Analytics & audit

## Phase 2 — Real-Time Integration

- [ ] Real CCTV/RTSP feeds
- [ ] Live weather API
- [ ] Real traffic API
- [ ] Real-time ANPR
- [ ] Real-time GPS for police units
- [ ] WebSocket event streaming

## Phase 3 — Production AI

- [ ] Trained helmet model
- [ ] Production fire/smoke model
- [ ] Improved accident detection
- [ ] Better speed estimation calibration
- [ ] Junction-specific models
- [ ] Historical model training
- [ ] Model monitoring

## Phase 4 — Smart Deployment

- [ ] Travel-time-aware optimization
- [ ] Officer fatigue constraints
- [ ] Shift fairness
- [ ] Multi-unit dispatch optimization
- [ ] Route optimization
- [ ] Emergency vehicle priority

## Phase 5 — City-Scale Platform

- [ ] Multi-city support
- [ ] Role-based access
- [ ] Police command hierarchy
- [ ] Mobile officer application
- [ ] Secure cloud deployment
- [ ] Advanced audit logs
- [ ] Government-system integrations

---

# 📈 Expected Impact

TriNetra aims to help traffic authorities:

- Identify dangerous locations earlier
- Improve coverage of high-risk junctions
- Respond faster to incidents
- Reduce manual monitoring burden
- Prioritize limited police resources
- Understand why a location is risky
- Test deployment decisions before implementing them
- Maintain human control over operational decisions

---

# 📜 Data Disclaimer

This project contains a **simulated Nagpur traffic environment** for demonstration and development.

The configured junctions, officer roster, incidents, events, traffic conditions, and risk values should not be interpreted as official live Nagpur Traffic Police data.

For real deployment, the simulation layer should be replaced or supplemented with properly authorized and validated data sources.

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, and submit a pull request.

Recommended contribution areas:

- Computer vision
- Risk modeling
- Frontend UX
- Maps
- Optimization
- Data simulation
- Analytics
- Testing
- Documentation

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.

---

# ⭐ Project

**TriNetra**

### AI Traffic Risk + Computer Vision + Police Deployment Decision Support

> **From camera feeds and city data to explainable operational decisions.**

Built for smart-city traffic intelligence, hackathons, research, and future real-world integration.

