'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getConsent, setConsent } from '@/lib/cookieConsent';

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Reads localStorage after mount to avoid an SSR/client hydration mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(getConsent() === null);
    }, []);

    if (!visible) return null;

    const choose = (accepted: boolean) => {
        setConsent(accepted ? 'accepted' : 'declined');
        setVisible(false);
    };

    return (
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 p-4 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[960px] flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground">
                    We use privacy-friendly analytics to see which builds people find interesting. No account, no ad
                    tracking — just a yes/no.
                </p>
                <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => choose(false)}>
                        Decline
                    </Button>
                    <Button size="sm" onClick={() => choose(true)}>
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    );
}
