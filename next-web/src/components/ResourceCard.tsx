import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Youtube, ExternalLink, BookOpen, GraduationCap, Map } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Resource {
    id: string;
    title: string;
    description: string;
    type: string;
    link: string;
    image: string;
}

interface ResourceCardProps {
    resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
    const [imgSrc, setImgSrc] = useState(resource.image);

    const getIcon = (type: string) => {
        switch (type) {
            case 'YouTube Channel': return <Youtube className="w-3 h-3" />;
            case 'Course': return <GraduationCap className="w-3 h-3" />;
            case 'Guide': return <Map className="w-3 h-3" />;
            case 'Platform': return <BookOpen className="w-3 h-3" />;
            default: return <ExternalLink className="w-3 h-3" />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
            transition={{
                layout: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
            }}
            className="h-full"
        >
            <Card className="group overflow-hidden flex flex-col h-full border-border hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden border-b border-border">
                    <Image
                        src={imgSrc}
                        alt={resource.title}
                        fill
                        className={`${resource.image.includes('logo.clearbit.com') ? 'object-contain p-8 bg-white' : 'object-cover'} transition-transform duration-700 group-hover:scale-105`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setImgSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-foreground border-border/50 flex items-center gap-1.5 shadow-sm">
                            {getIcon(resource.type)}
                            {resource.type}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
                        {resource.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed flex-grow">
                        {resource.description}
                    </p>
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto">
                    <Button asChild className="w-full" variant="outline">
                        <a
                            href={resource.link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2"
                        >
                            Open Resource <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
