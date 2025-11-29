import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Tool {
    id: string;
    name: string;
    category: string;
    description: string;
    url: string;
    tags: string[];
    pricing: string;
    image: string;
    featured?: boolean;
}

interface ToolCardProps {
    tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
    const [imgSrc, setImgSrc] = useState(tool.image);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="h-full"
        >
            <Card className="group overflow-hidden flex flex-col h-full border-border hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                {/* Tool Image */}
                <div className="h-48 overflow-hidden relative border-b border-border">
                    <Image
                        src={imgSrc}
                        alt={tool.name}
                        fill
                        className={`${tool.image.includes('logo.clearbit.com') ? 'object-contain p-8 bg-white' : 'object-cover'} transition-transform duration-500 group-hover:scale-105`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setImgSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80')}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                            {tool.pricing}
                        </Badge>
                        {tool.featured && (
                            <Badge className="bg-yellow-500/90 hover:bg-yellow-500 text-white border-none backdrop-blur-sm">
                                Featured
                            </Badge>
                        )}
                    </div>

                    <div className="absolute bottom-3 left-3">
                        <Badge className="bg-primary text-primary-foreground">
                            {tool.category}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                            {tool.name}
                        </h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow leading-relaxed">
                        {tool.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {tool.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] font-bold">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto">
                    <Button asChild className="w-full" variant="outline">
                        <a
                            href={tool.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2"
                        >
                            Visit Tool <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
