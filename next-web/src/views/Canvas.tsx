'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Trash2, PenTool, Eraser, Type, Square, Circle as CircleIcon, Undo, Redo, MousePointer2, ZoomIn, ZoomOut, Grid, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type Tool = 'select' | 'pen' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'image';
type ShapeType = 'path' | 'rect' | 'circle' | 'text' | 'arrow' | 'image';

interface Shape {
    id: string;
    type: ShapeType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: { x: number; y: number }[];
    text?: string;
    color: string;
    strokeWidth: number;
    fill?: string;
    isFilled?: boolean;
    image?: HTMLImageElement;
}

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const searchParams = useSearchParams();

    // Canvas State
    const [elements, setElements] = useState<Shape[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [history, setHistory] = useState<Shape[][]>([]);
    const [historyStep, setHistoryStep] = useState(-1);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('pryzmira-canvas');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // eslint-disable-next-line react-hooks/set-state-in-effect
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
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'text',
                    x: 100,
                    y: 100,
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
    // Tool State
    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState(theme === 'dark' ? '#E0E0E0' : '#37352F');
    const [brushSize, setBrushSize] = useState(4);
    const [fillShape, setFillShape] = useState(false);
    const [showGrid, setShowGrid] = useState(true); // Default to true for student graph paper vibe

    // Interaction State
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElement, setCurrentElement] = useState<Shape | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectionOffset, setSelectionOffset] = useState<{ x: number, y: number } | null>(null);

    // Viewport State
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Text Input State
    const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);

    // Helper: Generate ID
    const generateId = () => Math.random().toString(36).substr(2, 9);

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
            const newStep = historyStep - 1;
            setHistoryStep(newStep);
            setElements(history[newStep]);
        } else if (historyStep === 0) {
            setHistoryStep(-1);
            setElements([]);
        }
    }, [history, historyStep]);

    const redo = useCallback(() => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            setHistoryStep(newStep);
            setElements(history[newStep]);
        }
    }, [history, historyStep]);

    // Coordinate Conversion
    const getScreenCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const getWorldCoords = (screenX: number, screenY: number) => {
        return {
            x: (screenX - offset.x) / scale,
            y: (screenY - offset.y) / scale
        };
    };

    // Drawing Logic
    const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: Shape) => {
        ctx.strokeStyle = element.color;
        ctx.lineWidth = element.strokeWidth;
        ctx.fillStyle = element.isFilled ? element.color : 'transparent';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        if (element.type === 'path' && element.points) {
            if (element.points.length > 0) {
                ctx.moveTo(element.points[0].x, element.points[0].y);
                element.points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.stroke();
            }
        } else if (element.type === 'rect') {
            if (element.isFilled) {
                ctx.fillRect(element.x, element.y, element.width || 0, element.height || 0);
            }
            ctx.strokeRect(element.x, element.y, element.width || 0, element.height || 0);
        } else if (element.type === 'circle') {
            const radius = Math.sqrt(Math.pow(element.width || 0, 2) + Math.pow(element.height || 0, 2));
            ctx.arc(element.x, element.y, radius, 0, 2 * Math.PI);
            if (element.isFilled) ctx.fill();
            ctx.stroke();
        } else if (element.type === 'arrow') {
            const headLength = 20;
            const dx = element.width || 0;
            const dy = element.height || 0;
            const angle = Math.atan2(dy, dx);
            const endX = element.x + dx;
            const endY = element.y + dy;

            ctx.moveTo(element.x, element.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
        } else if (element.type === 'text' && element.text) {
            ctx.font = `${element.strokeWidth * 4}px Outfit, sans-serif`;
            ctx.fillStyle = element.color;
            ctx.fillText(element.text, element.x, element.y);
        } else if (element.type === 'image' && element.image) {
            ctx.drawImage(element.image, element.x, element.y, element.width || 0, element.height || 0);
        }
    }, []);

    const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        if (!showGrid) return;
        // Subtle grid for Notion/Student vibe
        ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 40; // Slightly smaller grid

        const startX = Math.floor(-offset.x / scale / gridSize) * gridSize;
        const startY = Math.floor(-offset.y / scale / gridSize) * gridSize;
        const endX = startX + (width / scale) + gridSize;
        const endY = startY + (height / scale) + gridSize;

        ctx.beginPath();
        for (let x = startX; x <= endX; x += gridSize) {
            ctx.moveTo(x, -10000);
            ctx.lineTo(x, 10000);
        }
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.moveTo(-10000, y);
            ctx.lineTo(10000, y);
        }
        ctx.stroke();
    }, [showGrid, theme, offset, scale]);

    // Main Render Loop
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

        if (selectedId) {
            const el = elements.find(e => e.id === selectedId);
            if (el) {
                ctx.strokeStyle = '#EB5757'; // Notion Red for selection
                ctx.lineWidth = 1 / scale;
                ctx.setLineDash([5 / scale, 5 / scale]);

                if (el.type === 'rect' || el.type === 'text') {
                    const w = el.width || (el.text ? ctx.measureText(el.text).width : 0);
                    const h = el.height || (el.text ? el.strokeWidth * 4 : 0);
                    const y = el.type === 'text' ? el.y - h : el.y;
                    ctx.strokeRect(el.x - 5, y - 5, w + 10, h + 10);
                } else if (el.type === 'circle') {
                    const r = Math.sqrt(Math.pow(el.width || 0, 2) + Math.pow(el.height || 0, 2));
                    ctx.beginPath();
                    ctx.arc(el.x, el.y, r + 5, 0, 2 * Math.PI);
                    ctx.stroke();
                } else if (el.type === 'arrow') {
                    const dx = el.width || 0;
                    const dy = el.height || 0;
                    const minX = Math.min(el.x, el.x + dx);
                    const maxX = Math.max(el.x, el.x + dx);
                    const minY = Math.min(el.y, el.y + dy);
                    const maxY = Math.max(el.y, el.y + dy);
                    ctx.strokeRect(minX - 5, minY - 5, (maxX - minX) + 10, (maxY - minY) + 10);
                } else if (el.type === 'path' && el.points) {
                    const xs = el.points.map(p => p.x);
                    const ys = el.points.map(p => p.y);
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);
                    const minY = Math.min(...ys);
                    const maxY = Math.max(...ys);
                    ctx.strokeRect(minX - 5, minY - 5, (maxX - minX) + 10, (maxY - minY) + 10);
                } else if (el.type === 'image') {
                    ctx.strokeRect(el.x - 5, el.y - 5, (el.width || 0) + 10, (el.height || 0) + 10);
                }
                ctx.setLineDash([]);
            }
        }

        ctx.restore();
    }, [elements, currentElement, offset, scale, showGrid, selectedId, theme, drawElement, drawGrid]);

    // Hit Test Helper
    const getElementAtPosition = (x: number, y: number, elements: Shape[]) => {
        return [...elements].reverse().find(el => {
            if (el.type === 'rect') {
                const minX = Math.min(el.x, el.x + (el.width || 0));
                const maxX = Math.max(el.x, el.x + (el.width || 0));
                const minY = Math.min(el.y, el.y + (el.height || 0));
                const maxY = Math.max(el.y, el.y + (el.height || 0));
                return x >= minX && x <= maxX && y >= minY && y <= maxY;
            }
            if (el.type === 'circle') {
                const r = Math.sqrt(Math.pow(el.width || 0, 2) + Math.pow(el.height || 0, 2));
                const dist = Math.sqrt(Math.pow(x - el.x, 2) + Math.pow(y - el.y, 2));
                return dist <= r;
            }
            if (el.type === 'arrow') {
                const dx = el.width || 0;
                const dy = el.height || 0;
                const minX = Math.min(el.x, el.x + dx) - 10;
                const maxX = Math.max(el.x, el.x + dx) + 10;
                const minY = Math.min(el.y, el.y + dy) - 10;
                const maxY = Math.max(el.y, el.y + dy) + 10;
                return x >= minX && x <= maxX && y >= minY && y <= maxY;
            }
            if (el.type === 'text' && el.text) {
                const fontSize = el.strokeWidth * 4;
                const width = el.text.length * fontSize * 0.6;
                return x >= el.x && x <= el.x + width && y >= el.y - fontSize && y <= el.y;
            }
            if (el.type === 'path' && el.points) {
                const xs = el.points.map(p => p.x);
                const ys = el.points.map(p => p.y);
                const minX = Math.min(...xs) - 10;
                const maxX = Math.max(...xs) + 10;
                const minY = Math.min(...ys) - 10;
                const maxY = Math.max(...ys) + 10;
                return x >= minX && x <= maxX && y >= minY && y <= maxY;
            }
            if (el.type === 'image') {
                return x >= el.x && x <= el.x + (el.width || 0) && y >= el.y && y <= el.y + (el.height || 0);
            }
            return false;
        });
    };

    // Event Handlers
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const { x: screenX, y: screenY } = getScreenCoords(e);

        if (e.type === 'mousedown' && (e as React.MouseEvent).button === 1) {
            setIsPanning(true);
            setPanStart({ x: screenX - offset.x, y: screenY - offset.y });
            return;
        }

        const { x, y } = getWorldCoords(screenX, screenY);

        if (tool === 'select') {
            const clicked = getElementAtPosition(x, y, elements);

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
            const clicked = getElementAtPosition(x, y, elements);
            if (clicked) {
                setElements(prev => prev.filter(el => el.id !== clicked.id));
            }
            return;
        }

        if (tool === 'text') {
            setTextInput({ x: screenX, y: screenY, value: '' });
            return;
        }

        setIsDrawing(true);
        const id = generateId();

        if (tool === 'pen') {
            setCurrentElement({
                id, type: 'path', x, y, points: [{ x, y }], color, strokeWidth: brushSize
            });
        } else if (tool === 'rect' || tool === 'circle' || tool === 'arrow' || tool === 'image') {
            setCurrentElement({
                id, type: tool, x, y, width: 0, height: 0, color, strokeWidth: brushSize, isFilled: fillShape
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const { x: screenX, y: screenY } = getScreenCoords(e);

        if (isPanning) {
            setOffset({
                x: screenX - panStart.x,
                y: screenY - panStart.y
            });
            return;
        }

        if (!isDrawing) return;
        const { x, y } = getWorldCoords(screenX, screenY);

        if (tool === 'select' && selectedId && selectionOffset) {
            const updatedElements = elements.map(el => {
                if (el.id === selectedId) {
                    return { ...el, x: x - selectionOffset.x, y: y - selectionOffset.y };
                }
                return el;
            });
            setElements(updatedElements);
            return;
        }

        if (tool === 'eraser') {
            const clicked = getElementAtPosition(x, y, elements);
            if (clicked) {
                setElements(prev => prev.filter(el => el.id !== clicked.id));
            }
            return;
        }

        if (currentElement) {
            if (currentElement.type === 'path') {
                setCurrentElement({
                    ...currentElement,
                    points: [...(currentElement.points || []), { x, y }]
                });
            } else if (currentElement.type === 'rect' || currentElement.type === 'circle' || currentElement.type === 'arrow' || currentElement.type === 'image') {
                setCurrentElement({
                    ...currentElement,
                    width: x - currentElement.x,
                    height: y - currentElement.y
                });
            }
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
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
        if (!textInput || !textInput.value.trim()) {
            setTextInput(null);
            return;
        }
        const { x, y } = getWorldCoords(textInput.x, textInput.y);
        const newElement: Shape = {
            id: generateId(),
            type: 'text',
            x,
            y,
            text: textInput.value,
            color,
            strokeWidth: brushSize
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        addToHistory(newElements);
        setTextInput(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId) {
                    const newElements = elements.filter(el => el.id !== selectedId);
                    setElements(newElements);
                    addToHistory(newElements);
                    setSelectedId(null);
                }
            }
            if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                const moveAmount = 10 / scale;
                setElements(prev => prev.map(el => {
                    if (el.id === selectedId) {
                        return {
                            ...el,
                            x: el.x + (e.key === 'ArrowRight' ? moveAmount : e.key === 'ArrowLeft' ? -moveAmount : 0),
                            y: el.y + (e.key === 'ArrowDown' ? moveAmount : e.key === 'ArrowUp' ? -moveAmount : 0)
                        };
                    }
                    return el;
                }));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [elements, selectedId, history, historyStep, scale, undo, redo, addToHistory]);

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const parent = containerRef.current;
            if (canvas && parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const clearCanvas = () => {
        setElements([]);
        addToHistory([]);
        setSelectedId(null);
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        // Use theme-aware background for export
        ctx.fillStyle = theme === 'dark' ? '#191919' : '#FFFFFF';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);
        elements.forEach(el => drawElement(ctx, el));

        const link = document.createElement('a');
        link.download = 'pryzmira-creation.png';
        link.href = tempCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Center the image or place at top-left
                // Let's place it at center of current view
                const centerX = -offset.x / scale + (canvasRef.current?.width || 800) / 2 / scale;
                const centerY = -offset.y / scale + (canvasRef.current?.height || 600) / 2 / scale;

                // Scale down if too big
                let width = img.width;
                let height = img.height;
                const maxSize = 400;
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width *= ratio;
                    height *= ratio;
                }

                const newElement: Shape = {
                    id: generateId(),
                    type: 'image',
                    x: centerX - width / 2,
                    y: centerY - height / 2,
                    width,
                    height,
                    image: img,
                    color: 'transparent',
                    strokeWidth: 0
                };

                const newElements = [...elements, newElement];
                setElements(newElements);
                addToHistory(newElements);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col relative">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-text-primary">Creative Canvas</h1>

                <div className="bg-surface border border-border rounded-xl p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-sm">
                    <button onClick={undo} disabled={historyStep < 0} className={`p-2 rounded-lg transition-colors ${historyStep < 0 ? 'text-text-secondary opacity-50' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Undo"><Undo className="w-4 h-4" /></button>
                    <button onClick={redo} disabled={historyStep >= history.length - 1} className={`p-2 rounded-lg transition-colors ${historyStep >= history.length - 1 ? 'text-text-secondary opacity-50' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Redo"><Redo className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-border mx-1" />

                    <button onClick={() => setTool('select')} className={`p-2 rounded-lg transition-colors ${tool === 'select' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Select/Move"><MousePointer2 className="w-4 h-4" /></button>
                    <button onClick={() => setTool('pen')} className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Pen"><PenTool className="w-4 h-4" /></button>
                    <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Eraser"><Eraser className="w-4 h-4" /></button>
                    <button onClick={() => setTool('text')} className={`p-2 rounded-lg transition-colors ${tool === 'text' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Text"><Type className="w-4 h-4" /></button>
                    <button onClick={() => setTool('rect')} className={`p-2 rounded-lg transition-colors ${tool === 'rect' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Rectangle"><Square className="w-4 h-4" /></button>
                    <button onClick={() => setTool('circle')} className={`p-2 rounded-lg transition-colors ${tool === 'circle' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Circle"><CircleIcon className="w-4 h-4" /></button>
                    <button onClick={() => setTool('arrow')} className={`p-2 rounded-lg transition-colors ${tool === 'arrow' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Arrow"><ArrowRight className="w-4 h-4" /></button>
                    <label className={`p-2 rounded-lg transition-colors cursor-pointer text-text-secondary hover:text-primary hover:bg-surface-hover`} title="Upload Image">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <ImageIcon className="w-4 h-4" />
                    </label>

                    <div className="w-px h-5 bg-border mx-1" />

                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" title="Color" />
                    <button onClick={() => setFillShape(!fillShape)} className={`p-2 rounded-lg transition-colors ${fillShape ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Toggle Fill"><div className="w-4 h-4 border border-current rounded-sm bg-current" style={{ opacity: fillShape ? 1 : 0.3 }} /></button>

                    {/* Size Selector */}
                    <div className="flex items-center gap-1 bg-surface-hover rounded-lg p-1 border border-border">
                        {[2, 6, 12].map(size => (
                            <button
                                key={size}
                                onClick={() => setBrushSize(size)}
                                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${brushSize === size ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-primary'}`}
                                title={`Size ${size}px`}
                            >
                                <div className="rounded-full bg-current" style={{ width: size / 1.5, height: size / 1.5 }} />
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-border mx-1" />

                    <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-primary hover:bg-surface-hover'}`} title="Toggle Grid"><Grid className="w-4 h-4" /></button>
                    <button onClick={() => setScale(s => Math.min(s + 0.1, 3))} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-hover" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-hover" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>

                    <div className="w-px h-5 bg-border mx-1" />

                    <button onClick={clearCanvas} className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors" title="Clear"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={downloadCanvas} className="p-2 rounded-lg text-text-secondary hover:text-green-500 hover:bg-green-50 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="flex-grow bg-surface rounded-xl overflow-hidden relative touch-none border border-border shadow-sm"
                style={{ cursor: tool === 'select' ? 'default' : isPanning ? 'grabbing' : 'crosshair' }}
            >
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    className="w-full h-full block"
                />

                {/* Text Input Overlay */}
                {textInput && (
                    <div
                        className="absolute z-50"
                        style={{
                            left: textInput.x,
                            top: textInput.y,
                            transform: 'translateY(-50%)'
                        }}
                    >
                        <input
                            autoFocus
                            type="text"
                            value={textInput.value}
                            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                            onBlur={handleTextSubmit}
                            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                            className="bg-surface border border-border text-text-primary outline-none p-2 min-w-[100px] shadow-lg rounded-md"
                            style={{
                                fontSize: `${brushSize * 4}px`,
                                color: color,
                                fontFamily: 'Outfit, sans-serif'
                            }}
                            placeholder="Type here..."
                        />
                    </div>
                )}

                {/* Status Bar */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-surface text-xs text-text-secondary border border-border flex gap-4 shadow-sm">
                    <span>{Math.round(scale * 100)}%</span>
                    <span>{elements.length} objects</span>
                    <span>{selectedId ? 'Selected' : 'No Selection'}</span>
                </div>
            </div>
        </div>
    );
}
