import { Page, Layer, LayerType, TextLayer, ShapeLayer, GroupLayer, ImageLayer } from '../../types';

export interface ColorPalette {
    name: string;
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
}

export interface FontPair {
    name: string;
    header: string;
    body: string;
}

export type LayoutStyle = 'ORIGINAL' | 'SWISS' | 'BAUHAUS' | 'MINIMAL';

export const PALETTES: ColorPalette[] = [
    {
        name: "Cyberpunk",
        background: "#0f0f1a",
        primary: "#00ff9f",
        secondary: "#bd00ff",
        accent: "#00b8ff",
        text: "#ffffff"
    },
    {
        name: "Sunset",
        background: "#2d1b2e",
        primary: "#ff5e78",
        secondary: "#ffc75f",
        accent: "#845ec2",
        text: "#fbeaff"
    },
    {
        name: "Corporate Clean",
        background: "#ffffff",
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#f59e0b",
        text: "#1e293b"
    },
    {
        name: "Forest",
        background: "#1a2f23",
        primary: "#4ade80",
        secondary: "#166534",
        accent: "#facc15",
        text: "#f0fdf4"
    },
    {
        name: "Luxury",
        background: "#000000",
        primary: "#d4af37",
        secondary: "#333333",
        accent: "#f7f7f7",
        text: "#e5e5e5"
    },
    {
        name: "Pastel Dream",
        background: "#fff1f2",
        primary: "#fda4af",
        secondary: "#fdba74",
        accent: "#93c5fd",
        text: "#4c0519"
    },
    {
        name: "Vibrant",
        background: "#4f46e5",
        primary: "#fbbf24",
        secondary: "#ec4899",
        accent: "#ffffff",
        text: "#ffffff"
    },
    {
        name: "Swiss Red",
        background: "#f5f5f5",
        primary: "#ff0000",
        secondary: "#000000",
        accent: "#333333",
        text: "#111111"
    },
    {
        name: "Bauhaus Primary",
        background: "#f0f0f0",
        primary: "#0057b7", // Blue
        secondary: "#ffcd00", // Yellow
        accent: "#d70232",  // Red
        text: "#1a1a1a"
    }
];

export const FONT_PAIRS: FontPair[] = [
    { name: "Modern", header: "Inter", body: "Inter" },
    { name: "Classic", header: "Playfair Display", body: "Lato" },
    { name: "Bold", header: "Oswald", body: "Open Sans" },
    { name: "Tech", header: "Roboto Mono", body: "Roboto" },
    { name: "Elegant", header: "Cinzel", body: "Montserrat" },
    { name: "Fun", header: "Comic Neue", body: "Nunito" },
    { name: "Minimal", header: "Helvetica", body: "Arial" }
];

export class RemixEngine {
    static getRandomPalette(): ColorPalette {
        return PALETTES[Math.floor(Math.random() * PALETTES.length)];
    }

    static getRandomFontPair(): FontPair {
        return FONT_PAIRS[Math.floor(Math.random() * FONT_PAIRS.length)];
    }

    static getRandomLayoutStyle(gridType: string = 'none'): LayoutStyle {
        // 1. Grid-based Overrides (Strict)
        if (['swiss', '4x4', '6x6', 'thirds'].includes(gridType)) return 'SWISS';
        if (['bauhaus', 'golden', 'fibonacci'].includes(gridType)) return 'BAUHAUS';

        // 2. Random Fallback
        const rand = Math.random();
        if (rand < 0.2) return 'ORIGINAL';
        if (rand < 0.6) return 'SWISS';
        return 'BAUHAUS';
    }

    static applyRemix(page: Page, gridType: string = 'none'): Page {
        const palette = this.getRandomPalette();
        const fonts = this.getRandomFontPair();
        const layoutStyle = this.getRandomLayoutStyle(gridType);

        console.log(`✨ Remix Applied: ${palette.name} | ${fonts.name} | ${layoutStyle} (Grid: ${gridType})`);

        // 1. Update Appearance (Colors/Fonts)
        let remixedPage = {
            ...page,
            backgroundColor: palette.background,
            layers: page.layers.map(layer => this.remixLayerAppearance(layer, palette, fonts))
        };

        // 2. Update Layout (Spatial)
        // 2. Update Layout (Spatial)
        if (layoutStyle !== 'ORIGINAL') {
            remixedPage = this.applyLayout(remixedPage, layoutStyle, gridType);
        }

        return remixedPage;
    }

    private static remixLayerAppearance(layer: Layer, palette: ColorPalette, fonts: FontPair): Layer {
        // Handle Groups Recursively
        if (layer.type === LayerType.GROUP) {
            const group = layer as GroupLayer;
            return {
                ...group,
                children: group.children.map(child => this.remixLayerAppearance(child, palette, fonts))
            };
        }

        // Handle Text
        if (layer.type === LayerType.TEXT) {
            const textLayer = layer as TextLayer;
            const isHeader = textLayer.fontSize > 32;
            return {
                ...textLayer,
                fontFamily: isHeader ? fonts.header : fonts.body,
                fill: palette.text
            };
        }

        // Handle Shapes
        if (
            layer.type === LayerType.RECT ||
            layer.type === LayerType.CIRCLE ||
            layer.type === LayerType.TRIANGLE ||
            layer.type === LayerType.POLYGON ||
            layer.type === LayerType.STAR ||
            layer.type === LayerType.ARROW ||
            layer.type === LayerType.DIAMOND ||
            layer.type === LayerType.HEART ||
            layer.type === LayerType.TRAPEZOID
        ) {
            const shapeLayer = layer as ShapeLayer;
            const colorChoice = Math.random();
            let newFill = palette.primary;
            if (colorChoice > 0.6) newFill = palette.secondary;
            if (colorChoice > 0.9) newFill = palette.accent;

            return {
                ...shapeLayer,
                fill: newFill,
                stroke: palette.text,
                strokeWidth: shapeLayer.strokeWidth > 0 ? shapeLayer.strokeWidth : 0
            };
        }

        return layer;
    }

    // --- Layout Engines ---

    private static applyLayout(page: Page, style: LayoutStyle, gridType: string = 'none'): Page {
        const w = page.width;
        const h = page.height;
        const textLayers = page.layers.filter(l => l.type === LayerType.TEXT) as TextLayer[];
        const shapeLayers = page.layers.filter(l => l.type !== LayerType.TEXT && l.type !== LayerType.IMAGE && l.type !== LayerType.GROUP) as ShapeLayer[];
        const imageLayers = page.layers.filter(l => l.type === LayerType.IMAGE || l.type === LayerType.GROUP) as (ImageLayer | GroupLayer)[];

        // Sort text by size to find hierarchy
        textLayers.sort((a, b) => b.fontSize - a.fontSize);

        let newLayers: Layer[] = [];


        if (style === 'SWISS') {
            newLayers = this.applyDynamicGridLayout(w, h, textLayers, shapeLayers, imageLayers, gridType);
        } else if (style === 'BAUHAUS') {
            newLayers = this.applyBauhausLayout(w, h, textLayers, shapeLayers, imageLayers);
        } else {
            return page;
        }

        return { ...page, layers: newLayers };
    }

    private static getGridSpecs(gridType: string, w: number, h: number) {
        let cols = 12; // Default Swiss
        let rows = 9;
        let margin = w * 0.05;

        if (gridType === '4x4') { cols = 4; rows = 4; }
        if (gridType === '6x6') { cols = 6; rows = 6; }
        if (gridType === 'thirds') { cols = 3; rows = 3; }

        // Swiss defaults (12 col modular)
        if (gridType === 'swiss') { cols = 12; rows = 12; margin = w * 0.08; }

        const cellW = (w - (margin * 2)) / cols;
        const cellH = (h - (margin * 2)) / rows;

        return { cols, rows, margin, cellW, cellH };
    }

    private static applyDynamicGridLayout(w: number, h: number, text: TextLayer[], shapes: ShapeLayer[], other: Layer[], gridType: string = 'swiss'): Layer[] {
        const { cols, rows, margin, cellW, cellH } = this.getGridSpecs(gridType, w, h);
        const layers: Layer[] = [];

        // Helper to get random grid slot
        const getRandomSlot = (minCols: number, maxCols: number, minRows: number, maxRows: number) => {
            const spanW = Math.floor(Math.random() * (maxCols - minCols + 1)) + minCols;
            const spanH = Math.floor(Math.random() * (maxRows - minRows + 1)) + minRows;

            const col = Math.floor(Math.random() * (cols - spanW + 1));
            const row = Math.floor(Math.random() * (rows - spanH + 1));

            return {
                x: margin + (col * cellW),
                y: margin + (row * cellH),
                width: spanW * cellW,
                height: spanH * cellH,
                col, row, spanW, spanH
            };
        };

        // 1. Shapes (Background Blocks)
        shapes.forEach((shape, i) => {
            const slot = getRandomSlot(2, cols / 2, 2, rows);
            layers.push({
                ...shape,
                x: slot.x,
                y: slot.y,
                width: slot.width,
                height: slot.height,
                rotation: 0,
                opacity: 0.6 + (Math.random() * 0.4)
            });
        });

        // 2. Images (Fit to Grid Cells)
        other.forEach((layer, i) => {
            // Randomly sized image blocks (e.g. 2x2, 3x4, 4x3)
            const slot = getRandomSlot(2, cols / 2, 2, rows / 2);

            // Fit image INSIDE the slot while maintaining aspect ratio
            // But aligned to the slot center or sides? Let's Center.
            const fit = this.getBestFit(layer.width, layer.height, slot.width, slot.height);

            layers.push({
                ...layer,
                x: slot.x + (slot.width - fit.width) / 2,
                y: slot.y + (slot.height - fit.height) / 2,
                width: fit.width,
                height: fit.height,
                rotation: 0
            });
        });

        // 3. Text (Align to Grid Lines)
        text.forEach((t, i) => {
            const isTitle = i === 0 || t.fontSize > 40;
            // Titles span full width or half width
            // Body text spans 2-4 cols
            const spanCols = isTitle ? Math.floor(cols * 0.8) : Math.floor(cols / 3);
            const slot = getRandomSlot(spanCols, spanCols, 1, 2);

            layers.push({
                ...t,
                x: slot.x,
                y: slot.y,
                fontSize: isTitle ? Math.max(60, w * 0.08) : Math.max(24, w * 0.025),
                align: 'left', // Swiss style usually flush left
                width: slot.width,
                rotation: 0
            });
        });

        return layers;
    }

    /**
     * BAUHAUS STYLE:
     * - Diagonal Composition
     * - Geometric Primitives
     * - 45 Degree Totations
     * - Centered but dynamic
     */
    private static applyBauhausLayout(w: number, h: number, text: TextLayer[], shapes: ShapeLayer[], other: Layer[]): Layer[] {
        const cx = w / 2;
        const cy = h / 2;
        const layers: Layer[] = [];

        // 1. Shapes (Rotated, Geometric, Framing)
        shapes.forEach((shape, i) => {
            const rot = i % 2 === 0 ? 45 : -45;
            layers.push({
                ...shape,
                x: cx + (Math.random() * 200 - 100),
                y: cy + (Math.random() * 200 - 100),
                rotation: rot,
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                opacity: 0.7
            });
        });

        // 2. Images (Central or Offset - Preserving Aspect)
        other.forEach((layer, i) => {
            // Resize if too big, but keep aspect
            const fit = this.getBestFit(layer.width, layer.height, w * 0.5, h * 0.5);

            // Add some chaotic offset for Bauhaus
            const offsetX = (i % 2 === 0 ? 1 : -1) * (i * 30);
            const offsetY = (i % 3 === 0 ? -1 : 1) * (i * 20);

            layers.push({
                ...layer,
                x: cx - (fit.width / 2) + offsetX,
                y: cy - (fit.height / 2) + offsetY,
                width: fit.width,
                height: fit.height,
                rotation: 15 + (i * 5) // Slight tilt variation
            });
        });

        // 3. Text (Bold, maybe vertical or diagonal, but usually legible)
        text.forEach((t, i) => {
            const isTitle = i === 0;
            layers.push({
                ...t,
                x: isTitle ? cx - 300 : cx - 200,
                y: isTitle ? cy - 200 : cy + 100,
                align: 'center',
                rotation: isTitle ? -90 : 0, // Vertical title is very Bauhaus
                fontSize: isTitle ? 90 : 30
            });
        });

        return layers;
    }

    private static getBestFit(srcW: number, srcH: number, targetW: number, targetH: number) {
        const srcRatio = srcW / srcH;
        const targetRatio = targetW / targetH;

        let w = targetW;
        let h = targetH;

        if (srcRatio > targetRatio) {
            // Source is wider than target -> Limit by width
            h = w / srcRatio;
        } else {
            // Source is taller than target -> Limit by height
            w = h * srcRatio;
        }

        return { width: w, height: h };
    }
}
