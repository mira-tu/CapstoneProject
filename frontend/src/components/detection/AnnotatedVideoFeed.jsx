import React, { useEffect, useRef, useState } from 'react';

/**
 * AnnotatedVideoFeed
 *
 * Displays the actual uploaded video from the backend with a transparent
 * detection canvas overlay on top showing:
 * - Green boxes around detected persons
 * - Blue boxes around detected tables
 * - Red polygons for calibrated table regions
 * - Status labels showing availability (Available/Occupied/Merged/Reserved)
 *
 * The canvas fetches and draws annotated frames every second for near real-time
 * detection updates while the video plays underneath.
 */
const AnnotatedVideoFeed = ({ isRunning = false }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Fetch the current video URL from backend settings
  useEffect(() => {
    if (!isRunning) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchVideoUrl = async () => {
      try {
        const response = await fetch('/api/detection/settings');
        if (!response.ok) {
          setError('Failed to fetch detection settings');
          setIsLoading(false);
          return;
        }

        const settings = await response.json();
        if (!cancelled) {
          if (settings.videoUrl) {
            setVideoUrl(settings.videoUrl);
            setError(null);
          } else {
            setError('No video uploaded yet. Upload a video in Settings to see detections.');
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Error fetching video settings');
          setIsLoading(false);
        }
      }
    };

    fetchVideoUrl();

    return () => {
      cancelled = true;
    };
  }, [isRunning]);

  // Handle video load and setup canvas overlay
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleVideoLoadedMetadata = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (canvas && container) {
        // Match canvas size to video dimensions
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        setCanvasDimensions({ width: videoWidth, height: videoHeight });

        setIsLoading(false);
        setError(null);
      }
    };

    const handleVideoError = () => {
      setError('Failed to load video. Check if the video file exists.');
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleVideoLoadedMetadata);
    video.addEventListener('error', handleVideoError);

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoLoadedMetadata);
      video.removeEventListener('error', handleVideoError);
    };
  }, [videoUrl]);

  // Fetch and draw annotated frames on canvas overlay
  useEffect(() => {
    if (!isRunning || !videoUrl) return;

    let cancelled = false;
    let intervalId;

    const fetchAndDrawAnnotations = async () => {
      try {
        const response = await fetch('/api/detection/frame/annotated');

        if (!response.ok) {
          if (response.status === 400) {
            // No video or detection not ready yet — silent fail, video is still playing
            return;
          }
          return;
        }

        const blob = await response.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);

        // Create an image element to decode the JPEG annotation
        const img = new Image();
        img.onload = () => {
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }

          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');

          // Draw the annotated frame from the backend (includes video + detection boxes)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          URL.revokeObjectURL(url);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
        };

        img.src = url;
      } catch (err) {
        // Silently handle errors to avoid spam during video playback
      }
    };

    fetchAndDrawAnnotations();
    intervalId = setInterval(fetchAndDrawAnnotations, 1000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, videoUrl]);

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
    <div className="relative w-full h-full bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center" ref={containerRef}>
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-slate-600 border-t-blue-400 animate-spin" />
            <span className="text-sm font-medium text-slate-300">Loading video...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20">
          <div className="text-center">
            <div className="text-sm font-medium text-red-400 mb-2">⚠️ Video Error</div>
            <div className="text-xs text-slate-400">{error}</div>
          </div>
        </div>
      )}

      {/* Hidden video element used only for triggering metadata load and determining dimensions */}
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Canvas displays annotated frames (video + detection boxes) */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ maxWidth: '100%', maxHeight: '100%', display: canvasDimensions.width > 0 ? 'block' : 'none' }}
      />

      {/* Detection Status */}
      <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 border border-slate-600 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Detection Active
        </div>
      </div>
    </div>
  );
};

export default AnnotatedVideoFeed;
