import { motion } from 'framer-motion';
import { Play, FileText, Clock, ExternalLink, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MotivationItem {
    id: number;
    title: string;
    person: string;
    category: string;
    url: string;
    type: string;
    duration: string;
    key_points: string[];
    tags: string[];
}

export default function MotivationCard({ item, index }: { item: MotivationItem; index: number }) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'Talk': return <Play className="w-4 h-4" />;
            case 'Essay': return <FileText className="w-4 h-4" />;
            case 'Podcast': return <Mic className="w-4 h-4" />;
            default: return <ExternalLink className="w-4 h-4" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="h-full"
        >
            <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block h-full group"
            >
                <Card className="h-full flex flex-col hover:border-primary/50 transition-all hover:shadow-lg">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-3">
                            <Badge variant="secondary" className="text-xs font-medium">
                                {item.category}
                            </Badge>
                            <div className="p-2 rounded-full bg-accent text-accent-foreground">
                                {getIcon(item.type)}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.person}</p>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                            <Clock className="w-3 h-3" />
                            <span>{item.duration}</span>
                        </div>

                        <div className="space-y-2">
                            {item.key_points.slice(0, 2).map((point, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </a>
        </motion.div>
    );
}
