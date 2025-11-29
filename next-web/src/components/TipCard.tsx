import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TipItem {
    id: number;
    title: string;
    category: string;
    content: string;
    link: string;
    tags: string[];
}

export default function TipCard({ item, index }: { item: TipItem; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="h-full"
        >
            <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1 text-primary">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{item.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                </CardHeader>

                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                    </p>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex gap-2">
                        {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                        ))}
                    </div>
                    <Button asChild size="icon" variant="outline" className="h-8 w-8">
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
