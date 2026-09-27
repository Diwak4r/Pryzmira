import SubmitForm from '@/components/SubmitForm';

export const metadata = {
    title: 'Submit a build — Pryzmira',
};

export default function SubmitPage() {
    return (
        <div className="page-container pb-20 pt-8 md:pt-16">
            <h1 className="text-2xl font-semibold tracking-tight">Seen something? Drop the link.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                No account needed. Paste a link from X, Reddit, YouTube, or GitHub — we&apos;ll pull the video, prompt, and
                creator automatically where we can. A human reviews it before it goes live, usually within a few hours.
            </p>
            <div className="mt-8">
                <SubmitForm />
            </div>
        </div>
    );
}
