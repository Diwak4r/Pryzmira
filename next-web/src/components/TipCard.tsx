import { ArrowUpRight, Lightbulb } from 'lucide-react';

interface TipItem {
    id: number;
    title: string;
    category: string;
    content: string;
    link: string;
    tags: string[];
}

export default function TipCard({ item }: { item: TipItem; index: number }) {
    return (
        <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="group block h-full"
        >
            <article className="paper-panel hover-rise flex h-full flex-col gap-5 rounded-[1.7rem] p-5">
                <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                        <Lightbulb className="h-4 w-4" />
                        {item.category}
                    </span>
                    <h3 className="text-2xl font-semibold leading-tight text-foreground">
                        {item.title}
                    </h3>
                </div>

                <p className="flex-1 text-sm leading-7 text-muted-foreground">
                    {item.content}
                </p>

                <div className="flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto">
                    <div className="ink-rule" />
                    <div className="editorial-link mt-4 text-sm text-foreground">
                        Read note
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                </div>
            </article>
        </a>
    );
}
