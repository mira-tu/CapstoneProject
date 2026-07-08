# YOLOv8 Detection Boxes Debug Report

## Issue
Detection boxes (green for persons, red for tables) are NOT showing on the public dashboard, even though:
- ✅ Video plays
- ✅ Detection legend exists
- ✅ Detection status badge shows "Active"

## Root Cause Analysis

### 1. Backend Annotation Drawing ✅ FIXED
**Status**: CRITICAL BUG FOUND AND FIXED

**Bug**: Line 259 in `backend/routes/detection.py` was trying to access region points as dicts (`p["x"]`, `p["y"]`), but they're actually stored as lists/arrays (`[x, y]`).

**Error**: `TypeError: list indices must be integers or slices, not str`

**Fix Applied**: 
- Changed line 259 from `points = [(int(p["x"]), int(p["y"])) for p in region]` to `points = [(int(p[0]), int(p[1])) for p in region]`
- Added numpy import and fixed cv2.polylines call to use np.array

**Verification**: 
```
✓ GET /api/detection/frame/annotated now returns 200 OK
✓ Annotations ARE being drawn:
  - Green pixels (persons): 401,724 pixels
  - Blue pixels (tables): 1,576,350 pixels
  - Red pixels (regions/labels): 334,278 pixels
✓ JPEG encodes successfully at 3840x2160 resolution
```

### 2. Detection Service State
**Status**: PARTIAL - No tables in state

The detection service runs successfully and detects persons/tables:
```
✓ Detection running: True
✓ Has detector: True
✓ Video path: correct
✓ YOLOv8 detection: 6 persons, 1 table per frame (working!)
✓ Regions calibrated: 4 tables (T01, T02, T03, T04)
```

**Issue**: `detection_service._state` is empty (0 tables reported)

**Root cause**: `tables_store` is empty - no tables are registered in the backend

**Impact**: Table region labels won't show with occupancy status in annotations

**Fix needed**: Initialize tables in the backend (Task for admin dashboard)

### 3. Frontend Canvas Rendering
**Status**: Should work

The frontend `AnnotatedVideoFeed.jsx`:
- ✅ Fetches `/api/detection/frame/annotated` every 500ms
- ✅ Decodes JPEG blob to Image element
- ✅ Draws on canvas with `ctx.drawImage(img, 0, 0)`
- ✅ Canvas overlay positioned absolutely over video

**No code issues found** - frontend rendering logic is correct.

### 4. Data Flow
```
1. Backend video file (3840x2160, 481 frames)
   ↓
2. YoloDetector.detect_all() finds persons/tables
   ↓
3. RegionMapper.assign_persons_to_tables() maps to regions
   ↓
4. Backend draws:
   - Green rectangles for persons
   - Blue rectangles for dining tables  
   - Red polygons for calibrated table regions
   - Status labels (if tables in store)
   ↓
5. Encodes as JPEG
   ↓
6. Frontend fetches JPEG every 500ms
   ↓
7. Renders on canvas overlay
```

## What's Working Now
- ✅ Backend generates annotated frames with all drawings
- ✅ Persons are drawn in green
- ✅ Tables are drawn in blue
- ✅ Table regions are drawn in red
- ✅ Frontend can fetch and render the annotated frame

## What Still Needs Fixing
- ⚠️ Table occupancy labels might not show (tables_store is empty)
- ⚠️ Frontend needs to be restarted/refreshed to see latest changes
- ⚠️ Need to verify frontend is actually displaying the boxes (not getting cached response)

## Next Steps to Verify

1. **Check frontend is getting fresh frames** - Make sure caching headers are correct
2. **Check frontend canvas is large enough** - Video is 3840x2160 at high res
3. **Verify table data is loaded** - Add sample tables to backend tables_store
4. **Test in browser** - Open dashboard and check if boxes appear

## Files Modified
- `backend/routes/detection.py`:
  - Line 18: Added `import numpy as np`
  - Line 259: Fixed region point access from dict to array indices
  - Line 260: Fixed cv2.polylines call to use numpy array

