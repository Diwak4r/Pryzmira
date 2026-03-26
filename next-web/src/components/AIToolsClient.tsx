'use client';

import dynamic from 'next/dynamic';
import type { ToolPricingFilter, ToolRecord } from '@/lib/catalog';

const AIToolsView = dynamic(() => import('@/views/AITools'), {
  ssr: false,
  loading: () => <div className="page-shell py-24 text-sm text-muted-foreground">Loading AI tools…</div>,
});

interface AIToolsClientProps {
  categories: string[];
  displayedTools: ToolRecord[];
  featuredTools: ToolRecord[];
  initialCategory: string;
  initialPricing: ToolPricingFilter;
  initialQuery: string;
  totalMatches: number;
  visibleCount: number;
}

export default function AIToolsClient(props: AIToolsClientProps) {
  return <AIToolsView {...props} />;
}
