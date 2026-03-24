import { ExternalLink, FileText, Mic, Play } from 'lucide-react';

interface MotivationItem {
    id: number;
    title: string;
    person: string;
    category: string;
    url: string;
    type: string;
    duration: string;
    key_points: string[];
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'Talk':
            return <Play className="h-4 w-4" />;
        case 'Essay':
            return <FileText className="h-4 w-4" />;
        case 'Podcast':
            return <Mic className="h-4 w-4" />;
        default:
            return <ExternalLink className="h-4 w-4" />;
    }
}

export default function MotivationCard({ item }: { item: MotivationItem; index: number }) {
    return (
        <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="group block h-full"
        >
            <article className="paper-panel hover-rise flex h-full flex-col gap-5 rounded-[1.7rem] p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            {item.category}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
                            {item.title}
                        </h3>
                    </div>
                    <span className="rounded-full bg-primary/8 p-2 text-primary">
                        {getTypeIcon(item.type)}
                    </span>
                </div>
                <p className="text-sm font-medium text-foreground">{item.person}</p>
                <div className="space-y-3">
                    {item.key_points.slice(0, 2).map((point) => (
                        <div key={point} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                            <span className="mt-[0.78rem] h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{point}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-auto">
                    <div className="ink-rule" />
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{item.duration}</span>
                        <span className="editorial-link text-foreground">
                            Open
                            <ExternalLink className="h-4 w-4" />
                        </span>
                    </div>
                </div>
            </article>
        </a>
    );
}
