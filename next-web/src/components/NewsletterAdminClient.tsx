'use client';

import dynamic from 'next/dynamic';

const NewsletterAdminInner = dynamic(() => import('@/components/NewsletterAdminInner'), {
  ssr: false,
  loading: () => <div className="container mx-auto max-w-4xl px-4 py-12 text-sm text-muted-foreground">Loading newsletter admin…</div>,
});

export default function NewsletterAdminClient() {
  return <NewsletterAdminInner />;
}
