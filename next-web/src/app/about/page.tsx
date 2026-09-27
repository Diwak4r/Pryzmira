export const metadata = {
    title: 'About — Pryzmira',
};

export default function AboutPage() {
    return (
        <div className="page-container pb-20 pt-8 md:pt-16">
            <h1 className="text-2xl font-semibold tracking-tight">What this is</h1>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                    Every time a new AI model ships, the best proof of what it can actually do shows up as scattered posts —
                    a demo video buried in a Reddit thread, a prompt someone tried on X, a repo someone shipped overnight.
                    It&apos;s interesting for about 48 hours and then it&apos;s gone, unfindable in the timeline.
                </p>
                <p>Pryzmira is a running, always-updating feed of that stuff — organized by model, filterable, no login.</p>
                <p>
                    Reddit, YouTube, and GitHub are watched automatically. X/Twitter has no free way to do that, so that side
                    depends on people submitting links — if you spot something, use the{' '}
                    <a href="/submit" className="text-foreground underline">
                        submit
                    </a>{' '}
                    page. Everything is reviewed before it goes live.
                </p>
                <p>No accounts, no ads, just a cookie-consent toggle for basic analytics.</p>
                <p>
                    A side project by{' '}
                    <a
                        href="https://github.com/Diwak4r"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline"
                    >
                        Diwakar
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
