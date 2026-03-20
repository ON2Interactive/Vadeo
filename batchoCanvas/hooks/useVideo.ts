
import { useState, useEffect } from 'react';

export const useVideo = (
  src: string,
  playing: boolean = true,
  loop: boolean = true,
  volume: number = 1,
  currentTime?: number
) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = document.createElement('video');
    // Check if src is a blob URL (local upload) or data URL
    const isBlobOrData = src.startsWith('blob:') || src.startsWith('data:');

    // CRITICAL for Chrome: Do NOT set crossOrigin for blobs, it breaks loading.
    // Only set for remote URLs to allow canvas usage (CORS)
    if (!isBlobOrData) {
      video.crossOrigin = 'anonymous';
    }

    // Append a cache-busting parameter ONLY for external URLs to ensure we get a fresh response with correct CORS headers
    // Doing this to a blob URL breaks it.
    if (isBlobOrData) {
      video.src = src;
    } else {
      const cacheBuster = src.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
      video.src = `${src}${cacheBuster}`;
    }
    video.muted = volume === 0;
    video.volume = volume;
    video.playsInline = true;

    // Auto-play attempt
    if (playing) {
      video.play().catch(e => console.warn("Autoplay blocked or failed", e));
    }

    setVideoElement(video);

    return () => {
      video.pause();
      video.src = '';
      video.load();
    };
  }, [src]);

  // Handle prop updates for the existing video element
  useEffect(() => {
    if (videoElement) {
      videoElement.loop = loop;
      videoElement.volume = volume;
      videoElement.muted = volume === 0;

      if (playing) {
        videoElement.play().catch(() => { });
      } else {
        videoElement.pause();
      }
    }
  }, [playing, loop, volume, videoElement]);

  // Handle external seek requests - reduced epsilon for frame-perfect resets
  useEffect(() => {
    if (videoElement && currentTime !== undefined) {
      // Reduced from 0.5 to 0.01 for better accuracy, especially for "start from beginning"
      if (Math.abs(videoElement.currentTime - currentTime) > 0.01) {
        videoElement.currentTime = currentTime;
      }
    }
  }, [currentTime, videoElement]);

  return videoElement;
};
