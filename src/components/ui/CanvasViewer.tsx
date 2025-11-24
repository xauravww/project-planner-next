"use client";

import { ReactNode, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

interface CanvasViewerProps {
    children: ReactNode;
    initialScale?: number;
    minScale?: number;
    maxScale?: number;
}

export default function CanvasViewer({
    children,
    initialScale = 1,
    minScale = 0.5,
    maxScale = 3,
}: CanvasViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [scale, setScale] = useState(initialScale);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(scale + delta, minScale), maxScale);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left click only
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const zoomIn = () => {
        setScale(Math.min(scale + 0.2, maxScale));
    };

    const zoomOut = () => {
        setScale(Math.max(scale - 0.2, minScale));
    };

    const resetView = () => {
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
    };

    const fitToView = () => {
        if (!containerRef.current || !contentRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        const scaleX = containerRect.width / (contentRect.width / scale);
        const scaleY = containerRect.height / (contentRect.height / scale);
        const newScale = Math.min(scaleX, scaleY, maxScale) * 0.9; // 90% to add padding

        setScale(newScale);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div className="relative w-full h-full bg-black/20 rounded-lg overflow-hidden border border-white/10">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                    onClick={zoomIn}
                    size="sm"
                    variant="ghost"
                    className="bg-black/50 hover:bg-black/70"
                    title="Zoom In"
                >
                    <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                    onClick={zoomOut}
                    size="sm"
                    variant="ghost"
                    className="bg-black/50 hover:bg-black/70"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                    onClick={fitToView}
                    size="sm"
                    variant="ghost"
                    className="bg-black/50 hover:bg-black/70"
                    title="Fit to View"
                >
                    <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                    onClick={resetView}
                    size="sm"
                    variant="ghost"
                    className="bg-black/50 hover:bg-black/70"
                    title="Reset View"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-4 right-4 z-10 bg-black/50 px-3 py-1.5 rounded text-xs text-white">
                {Math.round(scale * 100)}%
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    ref={contentRef}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: "center",
                        transition: isDragging ? "none" : "transform 0.1s ease-out",
                        display: "inline-block",
                        minWidth: "max-content", // Allow content to expand to its natural width
                    }}
                >
                    {children}
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 z-10 text-xs text-gray-400 bg-black/50 px-3 py-1.5 rounded">
                Drag to pan • Scroll to zoom
            </div>
        </div>
    );
}
