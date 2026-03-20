
export type AspectRatio =
  | '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9'
  | '1.85:1 Flat' | '2.39:1 CinemaScope' | '21:9 UltraWide' | '1.43:1 IMAX'
  | 'A3 Portrait' | 'A3 Landscape'
  | 'A4 Portrait' | 'A4 Landscape'
  | 'A5 Portrait' | 'A5 Landscape'
  | 'Letter Portrait' | 'Letter Landscape'
  | 'Legal Portrait' | 'Legal Landscape'
  | 'Ledger Portrait' | 'Ledger Landscape'
  | 'Half Letter Portrait' | 'Half Letter Landscape'
  | 'Trade Paperback Portrait' | 'Trade Paperback Landscape'
  | 'Magazine Portrait' | 'Magazine Landscape';

export interface ExportConfig {
  format: 'png' | 'video' | 'pdf';
  targetWidth: number;
  duration: number; // in milliseconds
  label: string;
}

export interface Point {
  x: number;
  y: number;
}

export enum LayerType {
  TEXT = 'TEXT',
  RECT = 'RECT',
  CIRCLE = 'CIRCLE',
  LINE = 'LINE',
  IMAGE = 'IMAGE',
  POLYGON = 'POLYGON',
  TRIANGLE = 'TRIANGLE',
  STAR = 'STAR',
  GROUP = 'GROUP',
  ARROW = 'ARROW',
  DIAMOND = 'DIAMOND',
  HEART = 'HEART',
  TRAPEZOID = 'TRAPEZOID',
}

export interface LayerKeyframe {
  time: number;        // time in milliseconds
  x?: number;
  y?: number;
  rotation?: number;
  opacity?: number;
  width?: number;
  height?: number;
  fontSize?: number;   // for TextLayer
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible?: boolean;
  locked?: boolean;
  blendMode?: string;
  isMask?: boolean; // NEW: Identification for masking layers
  keyframes?: LayerKeyframe[]; // NEW: Animation keyframes
}

export interface GroupLayer extends BaseLayer {
  type: LayerType.GROUP;
  children: Layer[]; // Recursive definition
}

export interface TextLayer extends BaseLayer {
  type: LayerType.TEXT;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fill: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
}

export interface ShapeLayer extends BaseLayer {
  type: LayerType.RECT | LayerType.CIRCLE | LayerType.LINE | LayerType.POLYGON | LayerType.TRIANGLE | LayerType.STAR | LayerType.ARROW | LayerType.DIAMOND | LayerType.HEART | LayerType.TRAPEZOID;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
  sides?: number; // for polygons
  innerRadius?: number; // for stars
}

export interface ImageLayer extends BaseLayer {
  type: LayerType.IMAGE;
  src: string;
  isBaseMedia?: boolean;
  filter?: string; // Video effect preset
  mediaType: 'image' | 'video';
  // Video specific props
  playing?: boolean;
  loop?: boolean;
  volume?: number;
  currentTime?: number;
  duration?: number; // Duration in seconds
}

export type Layer = TextLayer | ShapeLayer | ImageLayer | GroupLayer;

export interface Page {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
  thumbnail?: string;
}

export interface EditorState {
  pages: Page[];
  activePageId: string;
  zoom: number;
  pan: Point;
  selectedLayerId: string | null; // Kept for backward compatibility logic
  selectedLayerIds: string[]; // NEW: Multi-selection support
  history: Page[][];
  historyIndex: number;
  isPro?: boolean;
  // Timeline State
  playheadTime: number; // current time in ms
  isPlaying: boolean;
  selectedKeyframe: { layerId: string, time: number } | null;
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  updatedAt: number;
  thumbnail?: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  updatedAt: number;
  thumbnail?: string;
}
