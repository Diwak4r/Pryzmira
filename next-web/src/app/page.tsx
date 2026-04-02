import { Suspense } from 'react';
import VoiceHome from '@/views/VoiceHome';

export default function HomePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VoiceHome />
        </Suspense>
    );
}
