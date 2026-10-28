import type { Metadata } from 'next';
import GuideView from '@/views/GuideView';

export const metadata: Metadata = {
    title: 'Guide - Pryzmira',
    description:
        'How Pryzmira works: the voice pipeline, a capability scan, prompt recipes, build gallery sources, environment variables, troubleshooting, and how to run the tests.',
};

export default function GuidePage() {
    return <GuideView />;
}
