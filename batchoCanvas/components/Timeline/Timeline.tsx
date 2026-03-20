import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, Plus, Trash2 } from 'lucide-react';
import { Layer, Page } from '../../types';

interface TimelineProps {
    activePage: Page;
    playheadTime: number;
    isPlaying: boolean;
    selectedKeyframe: { layerId: string, time: number } | null;
    onPlayheadChange: (time: number) => void;
    onTogglePlay: () => void;
    onAddKeyframe: (layerId: string) => void;
    onKeyframeSelect: (layerId: string, time: number) => void;
    onKeyframeMove: (layerId: string, oldTime: number, newTime: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
    activePage,
    playheadTime,
    isPlaying,
    selectedKeyframe,
    onPlayheadChange,
    onTogglePlay,
    onAddKeyframe,
    onKeyframeSelect,
    onKeyframeMove
}) => {
    const duration = 5000; // Default 5s for now
    const pixelsPerMs = 0.1; // 100px per second
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
    const [draggingKeyframe, setDraggingKeyframe] = useState<{ layerId: string, time: number } | null>(null);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const millis = Math.floor((ms % 1000) / 10);
        return `${seconds}:${millis.toString().padStart(2, '0')}`;
    };

    const getTimeAtX = (x: number) => {
        return Math.max(0, Math.min(duration, x / pixelsPerMs));
    };

    const handleMouseDownPlayhead = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDraggingPlayhead(true);
    };

    const handleMouseDownTimeline = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        onPlayheadChange(getTimeAtX(x));
        setIsDraggingPlayhead(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, e.clientX - rect.left);

        if (isDraggingPlayhead) {
            onPlayheadChange(getTimeAtX(x));
        } else if (draggingKeyframe) {
            const newTime = Math.round(getTimeAtX(x));
            onKeyframeMove(draggingKeyframe.layerId, draggingKeyframe.time, newTime);
            setDraggingKeyframe({ ...draggingKeyframe, time: newTime });
        }
    };

    const handleMouseUp = () => {
        setIsDraggingPlayhead(false);
        setDraggingKeyframe(null);
    };

    useEffect(() => {
        if (isDraggingPlayhead || draggingKeyframe) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingPlayhead, draggingKeyframe]);

    return (
        <div className="h-48 bg-[#0f0f11] border-t border-zinc-800 flex flex-col select-none overflow-hidden">
            {/* Timeline Controls */}
            <div className="h-10 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onPlayheadChange(0)}
                        className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                    >
                        <SkipBack size={16} />
                    </button>
                    <button
                        onClick={onTogglePlay}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <div className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                        <span className="text-blue-400 font-bold">{formatTime(playheadTime)}</span>
                        <span className="mx-1 text-zinc-600">/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pro Timeline Studio</span>
                </div>
            </div>

            {/* Tracks Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex">
                {/* Layer Labels */}
                <div className="w-48 border-r border-zinc-800 bg-zinc-900/30 flex flex-col shrink-0">
                    {activePage.layers.map(layer => (
                        <div key={layer.id} className="h-8 border-b border-zinc-800/50 px-3 flex items-center justify-between group hover:bg-zinc-800/50 transition-colors">
                            <span className="text-[11px] font-medium text-zinc-300 truncate">{layer.name}</span>
                            <button
                                onClick={() => onAddKeyframe(layer.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-400 transition-all"
                                title="Add Keyframe at playhead"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Timeline Tracks */}
                <div
                    ref={containerRef}
                    className="flex-1 relative bg-zinc-950/20 overflow-x-auto"
                    style={{ cursor: isDraggingPlayhead ? 'grabbing' : 'crosshair' }}
                    onMouseDown={handleMouseDownTimeline}
                >
                    {/* Time Markers */}
                    <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute top-0 bottom-0 border-l border-zinc-800/30 text-[9px] text-zinc-600 pl-1 pt-1"
                                style={{ left: i * 1000 * pixelsPerMs }}
                            >
                                {i}s
                            </div>
                        ))}
                    </div>

                    {/* Keyframe Tracks */}
                    <div className="relative z-10 pointer-events-none">
                        {activePage.layers.map(layer => (
                            <div key={layer.id} className="h-8 border-b border-zinc-800/30 relative">
                                {layer.keyframes?.map(kf => {
                                    const isSelected = selectedKeyframe?.layerId === layer.id && selectedKeyframe?.time === kf.time;
                                    return (
                                        <div
                                            key={kf.time}
                                            className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border shadow-sm cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-20 pointer-events-auto
                        ${isSelected ? 'bg-blue-400 border-white ring-2 ring-blue-500 ring-offset-1 ring-offset-[#0f0f11]' : 'bg-blue-600 border-white/20'}`}
                                            style={{ left: kf.time * pixelsPerMs - 6 }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                onKeyframeSelect(layer.id, kf.time);
                                                setDraggingKeyframe({ layerId: layer.id, time: kf.time });
                                            }}
                                            title={`Keyframe at ${kf.time}ms`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Playhead Line */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-auto cursor-grab active:cursor-grabbing shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        style={{ left: playheadTime * pixelsPerMs }}
                        onMouseDown={handleMouseDownPlayhead}
                    >
                        <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0f0f11]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
