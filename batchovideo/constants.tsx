
import { AspectRatio } from './types';

export const ASPECT_RATIOS: Record<AspectRatio, { w: number, h: number }> = {
  '1:1': { w: 1080, h: 1080 },
  '2:3': { w: 1080, h: 1620 },
  '3:2': { w: 1620, h: 1080 },
  '3:4': { w: 1080, h: 1440 },
  '4:3': { w: 1440, h: 1080 },
  '4:5': { w: 1080, h: 1350 },
  '5:4': { w: 1350, h: 1080 },
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
  '1.85:1 Flat': { w: 1998, h: 1080 },
  '2.39:1 CinemaScope': { w: 2581, h: 1080 },
  '21:9 UltraWide': { w: 2560, h: 1080 },
  '1.43:1 IMAX': { w: 1430, h: 1000 },
};

export const INITIAL_ZOOM = 1.0;
export const MAX_ZOOM = 5;
export const MIN_ZOOM = 0.05;

export const DEFAULT_PAGE_ID = 'page-1';
