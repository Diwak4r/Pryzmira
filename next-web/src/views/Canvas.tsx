'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Download, Trash2, PenTool, Eraser, Type, Square, Circle as CircleIcon,
    Undo, Redo, MousePointer2, ZoomIn, ZoomOut, Grid, ArrowRight,
    Image as ImageIcon, Minus, Highlighter, Move, RotateCcw, Copy, Scissors,
    Palette, ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type Tool = 'select' | 'pen' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'image' | 'line' | 'highlighter' | 'pan';

interface Point { x: number; y: number; }

interface Shape {
    id: string;
    type: 'path' | 'rect' | 'circle' | 'text' | 'arrow' | 'image' | 'line';
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: Point[];
    text?: string;
    color: string;
    strokeWidth: number;
    fill?: string;
    isFilled?: boolean;
    image?: HTMLImageElement;
    opacity?: number;
    rotation?: number;
}

interface ResizeHandle {
    position: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
    cursor: string;
}

const RESIZE_HANDLES: ResizeHandle[] = [
    { position: 'nw', cursor: 'nwse-resize' },
    { position: 'n', cursor: 'ns-resize' },
    { position: 'ne', cursor: 'nesw-resize' },
    { position: 'e', cursor: 'ew-resize' },
    { position: 'se', cursor: 'nwse-resize' },
    { position: 's', cursor: 'ns-resize' },
    { position: 'sw', cursor: 'nesw-resize' },
    { position: 'w', cursor: 'ew-resize' },
];

const COLOR_PALETTE = [
    '#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1'
];

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const eraserCanvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const searchParams = useSearchParams();

    // Canvas State
    const [elements, setElements] = useState<Shape[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [history, setHistory] = useState<Shape[][]>([]);
    const [historyStep, setHistoryStep] = useState(-1);

    // Tool State
    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState(theme === 'dark' ? '#E0E0E0' : '#37352F');
    const [brushSize, setBrushSize] = useState(4);
    const [eraserSize, setEraserSize] = useState(20);
    const [fillShape, setFillShape] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Interaction State
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElement, setCurrentElement] = useState<Shape | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectionOffset, setSelectionOffset] = useState<Point | null>(null);
    const [resizing, setResizing] = useState<{ handle: string; startX: number; startY: number; startShape: Shape } | null>(null);

    // Viewport State
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Text Input State
    const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);

    // Eraser mask for pixel-level erasing
    const [eraserMask, setEraserMask] = useState<ImageData | null>(null);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('pryzmira-canvas');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setElements(parsed);
                setHistory([parsed]);
                setHistoryStep(0);
            } catch (e) {
                console.error("Failed to load canvas", e);
            }
        } else {
            const challenge = searchParams.get('challenge');
            if (challenge) {
                const initial: Shape[] = [{
                    id: generateId(),
                    type: 'text',
                    x: 100, y: 100,
                    text: `Challenge: ${challenge}`,
                    color: '#3B82F6',
                    strokeWidth: 6
                }];
                setElements(initial);
                setHistory([initial]);
                setHistoryStep(0);
            }
        }
        setIsLoaded(true);
    }, [searchParams]);

    // Save to local storage
    useEffect(() => {
        if (!isLoaded) return;
        const timeout = setTimeout(() => {
            localStorage.setItem('pryzmira-canvas', JSON.stringify(elements));
        }, 500);
        return () => clearTimeout(timeout);
    }, [elements, isLoaded]);

    // History Management
    const addToHistory = useCallback((newElements: Shape[]) => {
        const newHistory = history.slice(0, historyStep + 1);
        if (newHistory.length >= 50) newHistory.shift();
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [history, historyStep]);

    const undo = useCallback(() => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            setElements(history[historyStep - 1]);
        } else if (historyStep === 0) {
            setHistoryStep(-1);
            setElements([]);
        }
    }, [history, historyStep]);

    const redo = useCallback(() => {
        if (historyStep < history.length - 1) {
            setHistoryStep(historyStep + 1);
            setElements(history[historyStep + 1]);
        }
    }, [history, historyStep]);

    // Coordinate helpers
    const getScreenCoords = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('changedTouches' in e && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const getWorldCoords = (screenX: number, screenY: number) => ({
        x: (screenX - offset.x) / scale,
        y: (screenY - offset.y) / scale
    });

    // Drawing functions
    const drawElement = useCallback((ctx: CanvasRenderingContext2D, el: Shape) => {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.strokeWidth;
        ctx.fillStyle = el.isFilled ? el.color : 'transparent';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = el.opacity ?? 1;

        ctx.beginPath();
        switch (el.type) {
            case 'path':
                if (el.points && el.points.length > 0) {
                    ctx.moveTo(el.points[0].x, el.points[0].y);
                    el.points.forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.stroke();
                }
                break;
            case 'line':
                ctx.moveTo(el.x, el.y);
                ctx.lineTo(el.x + (el.width || 0), el.y + (el.height || 0));
                ctx.stroke();
                break;
            case 'rect':
                if (el.isFilled) ctx.fillRect(el.x, el.y, el.width || 0, el.height || 0);
                ctx.strokeRect(el.x, el.y, el.width || 0, el.height || 0);
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(el.width || 0, 2) + Math.pow(el.height || 0, 2));
                ctx.arc(el.x, el.y, radius, 0, 2 * Math.PI);
                if (el.isFilled) ctx.fill();
                ctx.stroke();
                break;
            case 'arrow':
                const headLen = 20;
                const dx = el.width || 0, dy = el.height || 0;
                const angle = Math.atan2(dy, dx);
                const endX = el.x + dx, endY = el.y + dy;
                ctx.moveTo(el.x, el.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
                ctx.stroke();
                break;
            case 'text':
                if (el.text) {
                    ctx.font = `${el.strokeWidth * 4}px Outfit, sans-serif`;
                    ctx.fillStyle = el.color;
                    ctx.fillText(el.text, el.x, el.y);
                }
                break;
            case 'image':
                if (el.image) {
                    ctx.drawImage(el.image, el.x, el.y, el.width || 0, el.height || 0);
                }
                break;
        }
        ctx.globalAlpha = 1;
    }, []);

    const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        if (!showGrid) return;
        ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        const startX = Math.floor(-offset.x / scale / gridSize) * gridSize;
        const startY = Math.floor(-offset.y / scale / gridSize) * gridSize;
        const endX = startX + width / scale + gridSize;
        const endY = startY + height / scale + gridSize;
        ctx.beginPath();
        for (let x = startX; x <= endX; x += gridSize) { ctx.moveTo(x, -10000); ctx.lineTo(x, 10000); }
        for (let y = startY; y <= endY; y += gridSize) { ctx.moveTo(-10000, y); ctx.lineTo(10000, y); }
        ctx.stroke();
    }, [showGrid, theme, offset, scale]);

    // Get bounding box for element
    const getElementBounds = useCallback((el: Shape) => {
        let minX = el.x, minY = el.y, maxX = el.x, maxY = el.y;
        if (el.type === 'rect' || el.type === 'image' || el.type === 'line') {
            maxX = el.x + (el.width || 0);
            maxY = el.y + (el.height || 0);
        } else if (el.type === 'circle') {
            const r = Math.sqrt(Math.pow(el.width || 0, 2) + Math.pow(el.height || 0, 2));
            minX = el.x - r; minY = el.y - r; maxX = el.x + r; maxY = el.y + r;
        } else if (el.type === 'arrow') {
            maxX = el.x + (el.width || 0);
            maxY = el.y + (el.height || 0);
        } else if (el.type === 'path' && el.points) {
            const xs = el.points.map(p => p.x), ys = el.points.map(p => p.y);
            minX = Math.min(...xs); maxX = Math.max(...xs);
            minY = Math.min(...ys); maxY = Math.max(...ys);
        } else if (el.type === 'text' && el.text) {
            const fontSize = el.strokeWidth * 4;
            maxX = el.x + el.text.length * fontSize * 0.6;
            minY = el.y - fontSize; maxY = el.y;
        }
        if (minX > maxX) [minX, maxX] = [maxX, minX];
        if (minY > maxY) [minY, maxY] = [maxY, minY];
        return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }, []);

    // Draw resize handles
    const drawSelectionHandles = useCallback((ctx: CanvasRenderingContext2D, el: Shape) => {
        const bounds = getElementBounds(el);
        const handleSize = 8 / scale;
        const positions = {
            nw: { x: bounds.minX, y: bounds.minY },
            n: { x: bounds.minX + bounds.width / 2, y: bounds.minY },
            ne: { x: bounds.maxX, y: bounds.minY },
            e: { x: bounds.maxX, y: bounds.minY + bounds.height / 2 },
            se: { x: bounds.maxX, y: bounds.maxY },
            s: { x: bounds.minX + bounds.width / 2, y: bounds.maxY },
            sw: { x: bounds.minX, y: bounds.maxY },
            w: { x: bounds.minX, y: bounds.minY + bounds.height / 2 },
        };

        // Draw selection box
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2 / scale;
        ctx.setLineDash([5 / scale, 5 / scale]);
        ctx.strokeRect(bounds.minX - 5, bounds.minY - 5, bounds.width + 10, bounds.height + 10);
        ctx.setLineDash([]);

        // Draw handles
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2 / scale;
        Object.values(positions).forEach(pos => {
            ctx.beginPath();
            ctx.rect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
            ctx.fill();
            ctx.stroke();
        });
    }, [getElementBounds, scale]);

    // Main render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        drawGrid(ctx, canvas.width, canvas.height);
        elements.forEach(el => drawElement(ctx, el));
        if (currentElement) drawElement(ctx, currentElement);

        // Draw eraser cursor preview
        if (tool === 'eraser' && canvasRef.current) {
            // Will be handled by mouse move cursor
        }

        if (selectedId) {
            const el = elements.find(e => e.id === selectedId);
            if (el) drawSelectionHandles(ctx, el);
        }

        ctx.restore();
    }, [elements, currentElement, offset, scale, showGrid, selectedId, theme, drawElement, drawGrid, drawSelectionHandles, tool]);

    // Hit test
    const getElementAtPosition = (x: number, y: number) => {
        return [...elements].reverse().find(el => {
            const bounds = getElementBounds(el);
            return x >= bounds.minX - 10 && x <= bounds.maxX + 10 && y >= bounds.minY - 10 && y <= bounds.maxY + 10;
        });
    };

    // Check if clicking on resize handle
    const getResizeHandle = (x: number, y: number, el: Shape): string | null => {
        const bounds = getElementBounds(el);
        const handleSize = 12 / scale;
        const positions: Record<string, Point> = {
            nw: { x: bounds.minX, y: bounds.minY },
            n: { x: bounds.minX + bounds.width / 2, y: bounds.minY },
            ne: { x: bounds.maxX, y: bounds.minY },
            e: { x: bounds.maxX, y: bounds.minY + bounds.height / 2 },
            se: { x: bounds.maxX, y: bounds.maxY },
            s: { x: bounds.minX + bounds.width / 2, y: bounds.maxY },
            sw: { x: bounds.minX, y: bounds.maxY },
            w: { x: bounds.minX, y: bounds.minY + bounds.height / 2 },
        };
        for (const [handle, pos] of Object.entries(positions)) {
            if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
                return handle;
            }
        }
        return null;
    };

    // Pixel eraser - erase points from paths
    const eraseAtPoint = (x: number, y: number) => {
        const eraseRadius = eraserSize / scale;
        let changed = false;
        const newElements = elements.map(el => {
            if (el.type === 'path' && el.points) {
                const newPoints = el.points.filter(p => {
                    const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
                    return dist > eraseRadius;
                });
                if (newPoints.length !== el.points.length) {
                    changed = true;
                    if (newPoints.length === 0) return null;
                    return { ...el, points: newPoints };
                }
            }
            // For other shapes, check if center is within erase radius
            const bounds = getElementBounds(el);
            const centerX = bounds.minX + bounds.width / 2;
            const centerY = bounds.minY + bounds.height / 2;
            const dist = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
            if (dist < eraseRadius && bounds.width < eraseRadius * 2 && bounds.height < eraseRadius * 2) {
                changed = true;
                return null;
            }
            return el;
        }).filter(Boolean) as Shape[];

        if (changed) setElements(newElements);
    };

    // Event handlers
    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const { x: screenX, y: screenY } = getScreenCoords(e);
        const { x, y } = getWorldCoords(screenX, screenY);

        // Middle mouse or pan tool
        if ((e.type === 'mousedown' && (e as React.MouseEvent).button === 1) || tool === 'pan') {
            setIsPanning(true);
            setPanStart({ x: screenX - offset.x, y: screenY - offset.y });
            return;
        }

        if (tool === 'select') {
            // Check for resize handle first
            if (selectedId) {
                const selectedEl = elements.find(el => el.id === selectedId);
                if (selectedEl) {
                    const handle = getResizeHandle(x, y, selectedEl);
                    if (handle) {
                        setResizing({ handle, startX: x, startY: y, startShape: { ...selectedEl } });
                        setIsDrawing(true);
                        return;
                    }
                }
            }
            const clicked = getElementAtPosition(x, y);
            if (clicked) {
                setSelectedId(clicked.id);
                setSelectionOffset({ x: x - clicked.x, y: y - clicked.y });
                setIsDrawing(true);
            } else {
                setSelectedId(null);
            }
            return;
        }

        if (tool === 'eraser') {
            setIsDrawing(true);
            eraseAtPoint(x, y);
            return;
        }

        if (tool === 'text') {
            setTextInput({ x: screenX, y: screenY, value: '' });
            return;
        }

        setIsDrawing(true);
        const id = generateId();

        if (tool === 'pen' || tool === 'highlighter') {
            setCurrentElement({
                id, type: 'path', x, y,
                points: [{ x, y }],
                color: tool === 'highlighter' ? color : color,
                strokeWidth: tool === 'highlighter' ? brushSize * 3 : brushSize,
                opacity: tool === 'highlighter' ? 0.4 : 1
            });
        } else if (tool === 'line') {
            setCurrentElement({ id, type: 'line', x, y, width: 0, height: 0, color, strokeWidth: brushSize });
        } else if (['rect', 'circle', 'arrow', 'image'].includes(tool)) {
            setCurrentElement({
                id, type: tool as Shape['type'], x, y, width: 0, height: 0,
                color, strokeWidth: brushSize, isFilled: fillShape
            });
        }
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        const { x: screenX, y: screenY } = getScreenCoords(e);

        if (isPanning) {
            setOffset({ x: screenX - panStart.x, y: screenY - panStart.y });
            return;
        }

        if (!isDrawing) return;
        const { x, y } = getWorldCoords(screenX, screenY);

        if (tool === 'select' && resizing && selectedId) {
            const el = elements.find(e => e.id === selectedId);
            if (!el) return;
            const { handle, startX, startY, startShape } = resizing;
            const dx = x - startX, dy = y - startY;

            let newX = startShape.x, newY = startShape.y;
            let newW = startShape.width || 0, newH = startShape.height || 0;

            if (handle.includes('w')) { newX = startShape.x + dx; newW = (startShape.width || 0) - dx; }
            if (handle.includes('e')) { newW = (startShape.width || 0) + dx; }
            if (handle.includes('n')) { newY = startShape.y + dy; newH = (startShape.height || 0) - dy; }
            if (handle.includes('s')) { newH = (startShape.height || 0) + dy; }

            setElements(prev => prev.map(el => el.id === selectedId ? { ...el, x: newX, y: newY, width: newW, height: newH } : el));
            return;
        }

        if (tool === 'select' && selectedId && selectionOffset) {
            setElements(prev => prev.map(el => el.id === selectedId ? { ...el, x: x - selectionOffset.x, y: y - selectionOffset.y } : el));
            return;
        }

        if (tool === 'eraser') {
            eraseAtPoint(x, y);
            return;
        }

        if (currentElement) {
            if (currentElement.type === 'path') {
                setCurrentElement({ ...currentElement, points: [...(currentElement.points || []), { x, y }] });
            } else {
                setCurrentElement({ ...currentElement, width: x - currentElement.x, height: y - currentElement.y });
            }
        }
    };

    const handlePointerUp = () => {
        setIsPanning(false);
        setResizing(null);
        if (!isDrawing) return;
        setIsDrawing(false);

        if (tool === 'select') {
            if (selectedId) addToHistory(elements);
            setSelectionOffset(null);
            return;
        }

        if (tool === 'eraser') {
            addToHistory(elements);
            return;
        }

        if (currentElement) {
            const newElements = [...elements, currentElement];
            setElements(newElements);
            addToHistory(newElements);
            setCurrentElement(null);
        }
    };

    const handleTextSubmit = () => {
        if (!textInput || !textInput.value.trim()) { setTextInput(null); return; }
        const { x, y } = getWorldCoords(textInput.x, textInput.y);
        const newElement: Shape = { id: generateId(), type: 'text', x, y, text: textInput.value, color, strokeWidth: brushSize };
        const newElements = [...elements, newElement];
        setElements(newElements);
        addToHistory(newElements);
        setTextInput(null);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !textInput) {
                const newElements = elements.filter(el => el.id !== selectedId);
                setElements(newElements);
                addToHistory(newElements);
                setSelectedId(null);
            }
            // Tool shortcuts
            if (e.key === 'v') setTool('select');
            if (e.key === 'p') setTool('pen');
            if (e.key === 'e') setTool('eraser');
            if (e.key === 't') setTool('text');
            if (e.key === 'r') setTool('rect');
            if (e.key === 'c') setTool('circle');
            if (e.key === 'l') setTool('line');
            if (e.key === 'h') setTool('highlighter');
            if (e.key === ' ') { e.preventDefault(); setTool('pan'); }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === ' ') setTool('select');
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
    }, [elements, selectedId, undo, redo, addToHistory, textInput]);

    // Resize canvas
    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current, parent = containerRef.current;
            if (canvas && parent) { canvas.width = parent.clientWidth; canvas.height = parent.clientHeight; }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const clearCanvas = () => { setElements([]); addToHistory([]); setSelectedId(null); };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const temp = document.createElement('canvas');
        temp.width = canvas.width; temp.height = canvas.height;
        const ctx = temp.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = theme === 'dark' ? '#191919' : '#FFFFFF';
        ctx.fillRect(0, 0, temp.width, temp.height);
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);
        elements.forEach(el => drawElement(ctx, el));
        const link = document.createElement('a');
        link.download = 'pryzmira-canvas.png';
        link.href = temp.toDataURL('image/png');
        link.click();
    };

    const duplicateSelected = () => {
        if (!selectedId) return;
        const el = elements.find(e => e.id === selectedId);
        if (!el) return;
        const newEl = { ...el, id: generateId(), x: el.x + 20, y: el.y + 20 };
        const newElements = [...elements, newEl];
        setElements(newElements);
        addToHistory(newElements);
        setSelectedId(newEl.id);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const centerX = -offset.x / scale + (canvasRef.current?.width || 800) / 2 / scale;
                const centerY = -offset.y / scale + (canvasRef.current?.height || 600) / 2 / scale;
                let width = img.width, height = img.height;
                const maxSize = 400;
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width *= ratio; height *= ratio;
                }
                const newEl: Shape = { id: generateId(), type: 'image', x: centerX - width / 2, y: centerY - height / 2, width, height, image: img, color: 'transparent', strokeWidth: 0 };
                const newElements = [...elements, newEl];
                setElements(newElements);
                addToHistory(newElements);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const ToolButton = ({ t, icon, title }: { t: Tool; icon: React.ReactNode; title: string }) => (
        <button onClick={() => setTool(t)} className={`p-2 rounded-lg transition-colors ${tool === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`} title={title}>{icon}</button>
    );

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col relative">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Creative Canvas</h1>
                <div className="bg-card border rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-sm flex-wrap">
                    <button onClick={undo} disabled={historyStep < 0} className="p-2 rounded-lg disabled:opacity-30" title="Undo (Ctrl+Z)"><Undo className="w-4 h-4" /></button>
                    <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 rounded-lg disabled:opacity-30" title="Redo"><Redo className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-border mx-1" />

                    <ToolButton t="select" icon={<MousePointer2 className="w-4 h-4" />} title="Select (V)" />
                    <ToolButton t="pan" icon={<Move className="w-4 h-4" />} title="Pan (Space)" />
                    <ToolButton t="pen" icon={<PenTool className="w-4 h-4" />} title="Pen (P)" />
                    <ToolButton t="highlighter" icon={<Highlighter className="w-4 h-4" />} title="Highlighter (H)" />
                    <ToolButton t="eraser" icon={<Eraser className="w-4 h-4" />} title="Eraser (E)" />
                    <ToolButton t="text" icon={<Type className="w-4 h-4" />} title="Text (T)" />
                    <ToolButton t="line" icon={<Minus className="w-4 h-4" />} title="Line (L)" />
                    <ToolButton t="rect" icon={<Square className="w-4 h-4" />} title="Rectangle (R)" />
                    <ToolButton t="circle" icon={<CircleIcon className="w-4 h-4" />} title="Circle (C)" />
                    <ToolButton t="arrow" icon={<ArrowRight className="w-4 h-4" />} title="Arrow" />
                    <label className="p-2 rounded-lg cursor-pointer hover:bg-muted" title="Image"><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /><ImageIcon className="w-4 h-4" /></label>

                    <div className="w-px h-5 bg-border mx-1" />

                    {/* Mobile-friendly color picker */}
                    <div className="relative">
                        <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-2 rounded-lg hover:bg-muted flex items-center gap-1" title="Color">
                            <div className="w-5 h-5 rounded border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showColorPicker && (
                            <div className="absolute top-full mt-2 left-0 bg-card border rounded-lg p-3 shadow-lg z-50 grid grid-cols-6 gap-2 min-w-[200px]">
                                {COLOR_PALETTE.map(c => (
                                    <button key={c} onClick={() => { setColor(c); setShowColorPicker(false); }} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                ))}
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="col-span-6 w-full h-8 rounded cursor-pointer" />
                            </div>
                        )}
                    </div>

                    <button onClick={() => setFillShape(!fillShape)} className={`p-2 rounded-lg ${fillShape ? 'bg-primary/20 text-primary' : ''}`} title="Fill">
                        <div className="w-4 h-4 border-2 rounded-sm" style={{ backgroundColor: fillShape ? color : 'transparent', borderColor: color }} />
                    </button>

                    {/* Eraser size (when eraser selected) */}
                    {tool === 'eraser' && (
                        <div className="flex items-center gap-1 px-2">
                            <span className="text-xs text-muted-foreground">Size:</span>
                            <input type="range" min="5" max="50" value={eraserSize} onChange={e => setEraserSize(Number(e.target.value))} className="w-16 h-1" />
                        </div>
                    )}

                    {/* Brush sizes */}
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        {[2, 4, 8, 12].map(size => (
                            <button key={size} onClick={() => setBrushSize(size)} className={`w-6 h-6 rounded flex items-center justify-center ${brushSize === size ? 'bg-primary text-primary-foreground' : ''}`}>
                                <div className="rounded-full bg-current" style={{ width: size / 1.5, height: size / 1.5 }} />
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-border mx-1" />

                    <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg ${showGrid ? 'bg-primary/20 text-primary' : ''}`} title="Grid"><Grid className="w-4 h-4" /></button>
                    <button onClick={() => setScale(s => Math.min(s + 0.1, 3))} className="p-2 rounded-lg hover:bg-muted" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={() => setScale(s => Math.max(s - 0.1, 0.3))} className="p-2 rounded-lg hover:bg-muted" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                    <button onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }} className="p-2 rounded-lg hover:bg-muted" title="Reset View"><RotateCcw className="w-4 h-4" /></button>

                    <div className="w-px h-5 bg-border mx-1" />

                    {selectedId && <button onClick={duplicateSelected} className="p-2 rounded-lg hover:bg-muted" title="Duplicate"><Copy className="w-4 h-4" /></button>}
                    <button onClick={clearCanvas} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive" title="Clear"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={downloadCanvas} className="p-2 rounded-lg hover:bg-green-500/10 hover:text-green-500" title="Download"><Download className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="flex-grow bg-card rounded-xl overflow-hidden relative border shadow-sm" style={{ cursor: tool === 'pan' || isPanning ? 'grab' : tool === 'eraser' ? 'none' : tool === 'select' ? 'default' : 'crosshair', touchAction: 'none' }}>
                <canvas ref={canvasRef} onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp} onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp} className="w-full h-full block" />

                {/* Eraser cursor */}
                {tool === 'eraser' && (
                    <div className="pointer-events-none fixed rounded-full border-2 border-red-500 bg-red-500/20" style={{ width: eraserSize, height: eraserSize, transform: 'translate(-50%, -50%)' }} id="eraser-cursor" />
                )}

                {textInput && (
                    <div className="absolute z-50" style={{ left: textInput.x, top: textInput.y, transform: 'translateY(-50%)' }}>
                        <input autoFocus type="text" value={textInput.value} onChange={e => setTextInput({ ...textInput, value: e.target.value })} onBlur={handleTextSubmit} onKeyDown={e => e.key === 'Enter' && handleTextSubmit()} className="bg-card border outline-none p-2 min-w-[100px] shadow-lg rounded-md" style={{ fontSize: `${brushSize * 4}px`, color }} placeholder="Type..." />
                    </div>
                )}

                {/* Status bar */}
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-card/90 text-xs border flex gap-3 shadow-sm backdrop-blur-sm">
                    <span>{Math.round(scale * 100)}%</span>
                    <span>{elements.length} objects</span>
                    {selectedId && <span className="text-primary">Selected</span>}
                </div>

                {/* Keyboard hints */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-card/90 text-xs border shadow-sm backdrop-blur-sm hidden md:block">
                    <span className="text-muted-foreground">Space: Pan | Del: Delete | Ctrl+Z: Undo</span>
                </div>
            </div>

            {/* Mobile eraser cursor follow */}
            <script dangerouslySetInnerHTML={{
                __html: `
                document.addEventListener('mousemove', (e) => {
                    const cursor = document.getElementById('eraser-cursor');
                    if (cursor) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }
                });
            `}} />
        </div>
    );
}
