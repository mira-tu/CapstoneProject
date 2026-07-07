import React, { useEffect, useRef, useState } from 'react';

/**
 * AnnotatedVideoFeed
 *
 * Displays the live detection annotated frame from the backend.
 * Shows:
 * - Green boxes around detected persons
 * - Blue boxes around detected tables
 * - Red polygons for calibrated table regions
 * - Status labels showing availability (Available/Occupied/Merged/Reserved)
 *
 * Refreshes the frame every 500ms to show near real-time detection updates.
 */
const AnnotatedVideoFeed = ({ isRunning = false }) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isRunning) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let intervalId;

    const fetchAnnotatedFrame = async () => {
      try {
        const response = await fetch('/api/detection/frame/annotated');
        
        if (!response.ok) {
          if (response.status === 400) {
            setError('No video uploaded yet. Upload a video in Settings to see detections.');
          } else {
            setError('Failed to fetch annotated frame');
          }
          setIsLoading(false);
          return;
        }

        const blob = await response.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        
        // Create an image element to decode the JPEG
        const img = new Image();
        img.onload = () => {
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }

          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          URL.revokeObjectURL(url);
          setIsLoading(false);
          setError(null);
        };

        img.onerror = () => {
          if (!cancelled) {
            setError('Failed to load annotated frame');
            URL.revokeObjectURL(url);
            setIsLoading(false);
          }
        };

        img.src = url;
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Error fetching annotated frame');
          setIsLoading(false);
        }
      }
    };

    // Fetch immediately
    fetchAnnotatedFrame();

    // Then refresh every 500ms for near real-time updates
    intervalId = setInterval(fetchAnnotatedFrame, 500);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning]);

  if (!isRunning) {
    return (
      <div className="flex items-center justify-center bg-slate-950 rounded-lg h-full w-full text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold">Start detection to see annotated video</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-slate-600 border-t-blue-400 animate-spin" />
            <span className="text-sm font-medium text-slate-300">Loading detection feed...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
          <div className="text-center">
            <div className="text-sm font-medium text-red-400 mb-2">⚠️ Detection Error</div>
            <div className="text-xs text-slate-400">{error}</div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full w-auto h-auto"
      />

      {/* Detection Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur rounded-lg p-3 text-xs text-slate-300 space-y-1">
        <div><span className="inline-block w-3 h-3 bg-green-500 mr-2" />Person (detected)</div>
        <div><span className="inline-block w-3 h-3 bg-blue-500 mr-2" />Dining Table (detected)</div>
        <div><span className="inline-block w-3 h-3 bg-red-500 mr-2" />Table Region (calibrated)</div>
      </div>

      {/* Detection Status */}
      <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 border border-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Detection Active
        </div>
      </div>
    </div>
  );
};

export default AnnotatedVideoFeed;
