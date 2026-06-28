# TABLEYE

> Computer Vision-Based Real-Time Table Occupancy Monitoring System
> WMSU College of Computing Studies — Capstone Project

---

## Project Structure

```
CapstoneProject/
│
├── frontend/              # React + Vite + Tailwind (Ashley)
│   ├── public/            # Static assets (favicon, icons)
│   ├── src/
│   │   ├── api/           # All HTTP calls to the Flask backend
│   │   │   ├── tablesApi.js
│   │   │   └── detectionApi.js
│   │   ├── assets/        # Images, logos
│   │   ├── auth/          # AdminLogin, ForgotPassword
│   │   ├── components/
│   │   │   ├── table/     # TableCard, FloorPlanTable
│   │   │   └── modals/    # EditModal, ViewModal, DeleteModal
│   │   ├── constants/
│   │   │   └── tableStatus.js  # computeStatus, STATUS_META, etc.
│   │   ├── hooks/
│   │   │   ├── useOccupancyLog.js
│   │   │   ├── useTableSimulation.js
│   │   │   └── useMergeSimulation.js
│   │   ├── layouts/       # AdminWrapper (sidebar), AdminTopbar
│   │   ├── pages/         # One file per page
│   │   ├── App.jsx        # Top-level routing + state wiring
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js     # Proxies /api → http://localhost:5000
│
├── backend/               # Python Flask detection backend (Kenneth)
│   ├── detection/
│   │   ├── yolo_detector.py      # YOLOv8 inference wrapper
│   │   ├── table_classifier.py   # Person count → status logic
│   │   └── region_mapper.py      # Maps person centers to table polygons
│   ├── routes/
│   │   ├── tables.py             # /api/tables endpoints
│   │   └── detection.py          # /api/detection endpoints
│   ├── models/
│   │   └── table.py              # Table dataclass
│   ├── data/
│   │   └── table_regions.json    # Saved calibration polygons
│   ├── app.py                    # Flask entry point
│   ├── requirements.txt
│   └── .env.example              # Copy to .env and fill in keys
│
└── README.md
```

---

## Running the Project

### Frontend

cd frontend
npm install
npm run dev


### Backend

cd backend
pip install -r requirements.txt
cp .env.example .env          
python app.py                 


## Team

 CV Backend & Docs - Kenneth
 Frontend & Doc - Ashley
 Testing & Docs - Collen


## Detection Status Classification

| Status | Color | Condition |
|--------|-------|-----------|
| Available | Green | `persons == 0` |
| Partially Occupied | Yellow | `0 < persons < capacity` |
| Full | Red | `persons >= capacity` |