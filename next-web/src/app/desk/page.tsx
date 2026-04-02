import { Suspense } from 'react';
import VoiceDesk from '@/views/VoiceDesk';

export const dynamic = 'force-dynamic';

export default function DeskPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VoiceDesk />
        </Suspense>
    );
}
