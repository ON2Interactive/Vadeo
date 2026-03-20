import React from 'react';
import { Line, Group } from 'react-konva';

export type GridType = 'none' | 'thirds' | '4x4' | '6x6' | 'swiss' | 'fibonacci' | 'golden' | 'bauhaus';

interface GridOverlayProps {
    width: number;
    height: number;
    type: GridType;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ width, height, type }) => {
    if (type === 'none') return null;

    const lines: JSX.Element[] = [];
    const strokeColor = 'rgba(0, 0, 0, 0.6)'; // Darker grid for better visibility
    const strokeWidth = 1;

    if (type === 'thirds') {
        const stepX = width / 3;
        const stepY = height / 3;
        for (let i = 1; i < 3; i++) {
            lines.push(<Line key={`v-${i}`} points={[i * stepX, 0, i * stepX, height]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
            lines.push(<Line key={`h-${i}`} points={[0, i * stepY, width, i * stepY]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        }
    } else if (type === '4x4') {
        const stepX = width / 4;
        const stepY = height / 4;
        for (let i = 1; i < 4; i++) {
            lines.push(<Line key={`v-${i}`} points={[i * stepX, 0, i * stepX, height]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
            lines.push(<Line key={`h-${i}`} points={[0, i * stepY, width, i * stepY]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        }
    } else if (type === '6x6') {
        const stepX = width / 6;
        const stepY = height / 6;
        for (let i = 1; i < 6; i++) {
            lines.push(<Line key={`v-${i}`} points={[i * stepX, 0, i * stepX, height]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
            lines.push(<Line key={`h-${i}`} points={[0, i * stepY, width, i * stepY]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        }
    } else if (type === 'swiss') {
        const cols = 12;
        const stepX = width / cols;
        for (let i = 1; i < cols; i++) {
            lines.push(<Line key={`v-${i}`} points={[i * stepX, 0, i * stepX, height]} stroke={strokeColor} strokeWidth={strokeWidth} dash={[4, 4]} listening={false} />);
        }
        const rows = 9;
        const stepY = height / rows;
        for (let i = 1; i < rows; i++) {
            lines.push(<Line key={`h-${i}`} points={[0, i * stepY, width, i * stepY]} stroke={strokeColor} strokeWidth={strokeWidth} dash={[4, 4]} listening={false} />);
        }
    } else if (type === 'fibonacci') {
        // Phi Grid (1 : 0.618 : 1) - approximate ratio 1:1.618
        // Lines at 38.2% and 61.8%
        const x1 = width * 0.382;
        const x2 = width * 0.618;
        const y1 = height * 0.382;
        const y2 = height * 0.618;

        lines.push(<Line key="v-1" points={[x1, 0, x1, height]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        lines.push(<Line key="v-2" points={[x2, 0, x2, height]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        lines.push(<Line key="h-1" points={[0, y1, width, y1]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        lines.push(<Line key="h-2" points={[0, y2, width, y2]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
    } else if (type === 'golden') {
        // Golden Triangle
        // Main diagonal
        lines.push(<Line key="diag-main" points={[0, height, width, 0]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);

        // Perpendicular from Top-Left to diagonal
        // Mathematical points for 90 deg intersection on standard aspect ratios often fall roughly at 38% / 61%
        // Simplified visual approximation: Line from (0,0) to (width * 0.618, height * 0.382)
        // Correct geometric projection:
        // Let A=(0,0), B=(w,0), C=(w,h), D=(0,h). Diagonal is D->B.
        // Line from A perpendicular to DB.
        lines.push(<Line key="perp-1" points={[0, 0, width * 0.7, height * 0.45]} stroke={strokeColor} strokeWidth={strokeWidth} dash={[4, 4]} listening={false} />);
    } else if (type === 'bauhaus') {
        // Geometric / Diagonal Grid
        // Center cross
        lines.push(<Line key="center-v" points={[width / 2, 0, width / 2, height]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        lines.push(<Line key="center-h" points={[0, height / 2, width, height / 2]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        // Diagonals
        lines.push(<Line key="diag-1" points={[0, 0, width, height]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        lines.push(<Line key="diag-2" points={[0, height, width, 0]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
        // Diamond
        lines.push(<Line key="diamond-1" points={[width / 2, 0, width, height / 2, width / 2, height, 0, height / 2, width / 2, 0]} stroke={strokeColor} strokeWidth={strokeWidth} listening={false} />);
    }

    return <Group listening={false}>{lines}</Group>;
};

export default GridOverlay;
