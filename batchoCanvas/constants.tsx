
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
  // Print Portrait (300 DPI)
  'A3 Portrait': { w: 3508, h: 4961 },
  'A4 Portrait': { w: 2480, h: 3508 },
  'A5 Portrait': { w: 1748, h: 2480 },
  'Letter Portrait': { w: 2550, h: 3300 },
  'Legal Portrait': { w: 2550, h: 4200 },
  'Ledger Portrait': { w: 3300, h: 5100 },
  'Half Letter Portrait': { w: 1650, h: 2550 },
  'Trade Paperback Portrait': { w: 1800, h: 2700 },
  'Magazine Portrait': { w: 2700, h: 3600 },
  // Print Landscape (300 DPI)
  'A3 Landscape': { w: 4961, h: 3508 },
  'A4 Landscape': { w: 3508, h: 2480 },
  'A5 Landscape': { w: 2480, h: 1748 },
  'Letter Landscape': { w: 3300, h: 2550 },
  'Legal Landscape': { w: 4200, h: 2550 },
  'Ledger Landscape': { w: 5100, h: 3300 },
  'Half Letter Landscape': { w: 2550, h: 1650 },
  'Trade Paperback Landscape': { w: 2700, h: 1800 },
  'Magazine Landscape': { w: 3600, h: 2700 },
};

export const INITIAL_ZOOM = 1.0;
export const MAX_ZOOM = 5;
export const MIN_ZOOM = 0.05;

export const DEFAULT_PAGE_ID = 'page-1';
