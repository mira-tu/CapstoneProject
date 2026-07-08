# TABLEYE Project - Chat Summary & Current Status

## Project Overview
**TABLEYE**: Computer Vision-Based Real-Time Table Occupancy Monitoring System for Dining Establishments using YOLOv8 person detection and overhead CCTV camera feed.

**Proponent**: Kenneth Q. Mira (WMSU College of Computing Studies)

**Target Users**:
- **Admin**: Staff managing tables, calibrating camera, and monitoring occupancy
- **Public**: Customers viewing real-time table availability on entrance display

---

## Current Project Status

### ✅ COMPLETED WORK

1. **Detection Visualization - FIXED**
   - Issue: Detection boxes (green for persons, blue for tables) were not visible on Public Dashboard
   - Root cause: Frontend canvas rendering architecture conflict between video element and canvas overlay
   - Solution: Removed video element, made canvas the primary display with annotated frames from backend
   - Result: Detection boxes now visible with real-time updates every 500ms
   - Files modified: `frontend/src/components/detection/AnnotatedVideoFeed.jsx`

2. **Backend Frame Synchronization - FIXED**
   - Issue: `/api/detection/frame/annotated` endpoint was always returning frame 0, not synchronized with detection loop
   - Solution: Modified detection service to store current frame being processed, endpoint now retrieves synchronized frame
   - Result: Smooth video playback with detection boxes updating in real-time
   - Files modified: `backend/detection/detection_service.py`, `backend/routes/detection.py`

3. **Auto-Start Detection - DISABLED**
   - Issue: Backend auto-loaded most recent video even when user hadn't explicitly uploaded one (confusing UX)
   - Solution: Disabled auto-start feature, now requires admin to manually upload video and start detection
   - Result: Clear admin workflow - no surprise frames appearing
   - Files modified: `backend/state.py`

4. **Detection Legend - REMOVED**
   - Removed the detection legend (Person/Table/Region) from Public Dashboard per user request
   - Cleaner visual presentation for customers

5. **Build Status**
   - Frontend: ✅ Building successfully (0 errors, 0 warnings)
   - Backend: ✅ Python app.py runs without errors (after syntax fix)

### 🔧 KNOWN ISSUES / TODO

1. **Floor Plan Upload Feature - NOT YET IMPLEMENTED**
   - Panelist revision request: Add ability to upload floor plan image
   - Current: Camera Calibration uses video frame only
   - Needed: Allow admin to upload floor plan diagram as background
   - Status: Spec needs to be created

2. **Analytics/Occupancy Logs - PARTIALLY DOCUMENTED**
   - Added to workflow (Step 14)
   - Explanation: "Admin accesses historical occupancy data and charts to identify peak dining hours"
   - Status: Feature needs implementation if not already present

3. **Syntax Error Fixed**
   - Had duplicate code block in `backend/routes/detection.py` (lines 285-310)
   - Duplicated the entire `get_annotated_frame()` function ending
   - Fixed by removing duplicate

---

## YOLOv8 Detection Architecture

### What YOLOv8 Detects (Automatic):
- Persons (COCO class 0)
- Dining table objects

### What Admin Configures (Manual):
- Table IDs, labels, capacity, floor assignment
- Camera regions (by calibration click)
- Manual status overrides (Reserved, Maintenance)

### Detection Pipeline:
```
Video Frame → YOLOv8 Detection → Region Mapper (assign persons to tables) 
→ Table Classifier (compute status) → Backend stores results 
→ Frontend fetches annotated frame every 500ms → Display on canvas
```

---

## Admin Workflow (17 Steps)

1. **Login** - Authenticate with credentials
2. **View Dashboard** - See live occupancy overview with KPI metrics
3. **Upload Video** - Provide restaurant video for detection (Settings)
4. **Configure Detection** - Set confidence threshold, FPS, RTSP URL (Settings)
5. **Start Detection** - Activate YOLOv8 processing (Settings)
6. **Open Calibration** - Go to Camera Calibration page
7. **Select Table** - Choose first table from dropdown
8. **Click Location** - Mark table's position on video frame
9. **Position All Tables** - Repeat for all tables, complete spatial mapping
10. **Save Calibration** - Confirm positioning complete
11. **View Dashboard** - See real detection results (not simulation)
12. **Edit Table** - Adjust capacity, label, floor, manual status (Dashboard)
13. **Customize CMS** - Brand the public dashboard with colors, logo, text (Settings)
14. **View Public Dashboard** - Check what customers see (video + floor plan)
15. **View Analytics** - Check occupancy logs and peak hour data
16. **Monitor Detection** - Verify detection status and performance (Settings)
17. **Stop Detection** - Shutdown service at end of shift (Settings)
18. **Logout** - End admin session

---

## Tech Stack (Per Steering Rules)

### Frontend
- React 19 + Vite 8
- React Router 7
- Tailwind CSS 4
- lucide-react (icons)
- react-toastify (notifications)
- ESLint 10

### Backend
- Python 3 + Flask 3
- Ultralytics YOLOv8 (person detection)
- OpenCV (frame handling, region mapping)
- flask-cors (CORS to localhost:5173)
- python-dotenv (environment vars)
- Supabase (planned, not yet wired)

### File Structure
```
frontend/src/
  ├── api/                    (fetch calls only)
  ├── auth/                   (login, forgot password)
  ├── components/
  │   ├── detection/          (AnnotatedVideoFeed.jsx)
  │   ├── table/              (FloorPlanTable.jsx)
  │   └── modals/             (Edit, View, Delete)
  ├── constants/              (tableStatus.js, cmsConfig.js)
  ├── hooks/                  (useTableSimulation, etc.)
  ├── layouts/                (AdminWrapper, TopBar)
  └── pages/                  (AdminDashboard, PublicDashboard, CameraCalibration, etc.)

backend/
  ├── detection/              (yolo_detector.py, detection_service.py, region_mapper.py)
  ├── routes/                 (tables.py, detection.py)
  ├── models/                 (table.py, tables_store.py)
  ├── data/
  │   ├── uploads/            (video files)
  │   └── table_regions.json  (calibrated regions)
  └── app.py                  (Flask entry point)
```

---

## Key Configuration Files

### CMS Config (`frontend/src/constants/cmsConfig.js`)
```javascript
DEFAULT_CMS_CONFIG = {
  brandName: 'TABLEYE',
  logo: null,
  showLiveVideoPublicly: true,  // ← Enables video on public dashboard
  showOccupancyStats: true,
  showTableList: true,
  themeColor, sidebarColor, accentColor, backgroundColor, textColor
}
```

### Environment Variables (`backend/.env`)
```
SUPABASE_URL = ...
SUPABASE_KEY = ...
CAMERA_SOURCE = 0 (or RTSP URL or video file path)
CONFIDENCE_THRESHOLD = 0.5
```

---

## Documentation Created This Session

1. **SEQUENCE_FLOW_GUIDE.md** - Complete user journeys (public + admin)
2. **ADMIN_WORKFLOW_FLOW.md** - Detailed 16-step admin workflow with explanations
3. **ADMIN_WORKFLOW_SHORT.md** - Concise 1-line explanations per step for proponents
4. **DETECTION_BOXES_DEBUG_REPORT.md** - Technical root cause analysis and fix details
5. **SEQUENCE_FLOW_GUIDE.md** - Visual flow guides for all features

---

## Next Steps / Recommendations

### High Priority
1. **Test the fixed detection visualization**
   - Restart backend (`python app.py`)
   - Upload video through UI
   - Start detection
   - Verify green/blue detection boxes visible on Public Dashboard
   - Verify smooth video playback (not static frames)

2. **Capture Screenshots for Capstone Documentation**
   - Follow the 17-step admin workflow
   - Take one screenshot per step
   - Use one-line explanations from ADMIN_WORKFLOW_SHORT.md

3. **Implement Floor Plan Upload Feature** (Panelist Revision)
   - Create spec for floor plan upload
   - Allow admin to upload image as background in Camera Calibration
   - Display floor plan on Public Dashboard instead of (or in addition to) video

### Medium Priority
1. Implement/verify Analytics/Occupancy Logs feature
2. Add peak hours visualization
3. Complete Supabase integration (currently stubbed with TODO)
4. Add proper error handling for detection failures

### Low Priority
1. Add test framework (frontend/backend)
2. Performance optimization for high-res video (3840x2160)
3. Edge case handling (no tables calibrated, detection confidence too low)

---

## Important Files to Know

| File | Purpose | Status |
|------|---------|--------|
| `frontend/src/pages/PublicDashboard.jsx` | Customer-facing display | ✅ Working |
| `frontend/src/components/detection/AnnotatedVideoFeed.jsx` | Canvas video renderer | ✅ Fixed (shows detection boxes) |
| `backend/routes/detection.py` | Detection API endpoints | ✅ Fixed (syntax corrected) |
| `backend/detection/detection_service.py` | YOLOv8 processing loop | ✅ Updated (stores current frame) |
| `backend/state.py` | Auto-start logic | ✅ Disabled |
| `frontend/src/constants/cmsConfig.js` | CMS branding config | ✅ Working |
| `.kiro/specs/public-lobby-dashboard-redesign/tasks.md` | Spec tasks (174 completed) | ✅ Done |

---

## Common Commands

### Frontend
```bash
cd frontend
npm install        # install deps
npm run dev        # start Vite dev server (http://localhost:5173)
npm run build      # production build
npm run lint       # check linting
```

### Backend
```bash
cd backend
pip install -r requirements.txt   # install deps
copy .env.example .env             # create env file
python app.py                      # start Flask server (http://localhost:5000)
```

### Diagnostics
```bash
python test_yolo_detections.py      # verify YOLOv8 works
python test_detection.py            # check detection service status
python test_annotated_endpoint.py   # verify annotated frames draw boxes
```

---

## Contact & Notes

- **Proponent**: Kenneth Q. Mira
- **Institution**: WMSU College of Computing Studies
- **Project Status**: Near-complete; detection visualization fixed; ready for capstone documentation
- **Panelist Revision**: Implement floor plan upload feature

---

## How to Continue in New Chat

Paste this summary and then specify what you want to work on:

**Example prompts for new chat**:
- "I need to implement the floor plan upload feature. Can you create a spec for it?"
- "I'm capturing screenshots for the capstone. Should I follow the 17-step workflow?"
- "The backend detection is failing with [specific error]. Can you help debug?"
- "I need to add analytics/occupancy logs. Can you create that feature?"
- "Can you help me prepare the presentation documentation?"

---

## Files in Project Directory (Key Ones)

- `.kiro/specs/public-lobby-dashboard-redesign/` - Main spec directory
- `backend/test_*.py` - Diagnostic test scripts
- `DETECTION_BOXES_DEBUG_REPORT.md` - Technical debugging notes
- `SEQUENCE_FLOW_GUIDE.md` - User journey documentation
- `ADMIN_WORKFLOW_FLOW.md` - Detailed admin steps
- `ADMIN_WORKFLOW_SHORT.md` - Condensed one-liners
