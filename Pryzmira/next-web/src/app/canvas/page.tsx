import { Suspense } from 'react';
import Canvas from '@/views/Canvas';

export default function CanvasPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Canvas />
        </Suspense>
    );
}
