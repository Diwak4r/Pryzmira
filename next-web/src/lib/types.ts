export type Platform = 'x' | 'reddit' | 'youtube' | 'github' | 'article' | 'other';

export type MediaKind = 'video' | 'image' | 'thread' | 'code' | 'link';

export type Category =
    | 'llm'
    | 'image'
    | 'video'
    | 'audio'
    | 'agent'
    | 'coding'
    | 'robotics'
    | 'other';

export interface Release {
    id: string;
    slug: string;
    name: string;
    company: string;
    category: Category;
    releasedAt: string;
}

export interface Artifact {
    id: string;
    releaseId: string;
    releaseSlug: string;
    releaseName: string;
    platform: Platform;
    mediaKind: MediaKind;
    sourceUrl: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    title: string;
    promptText?: string;
    creatorHandle?: string;
    creatorName?: string;
    postedAt: string;
    firstSeenAt: string;
    engagementScore: number;
    tags: string[];
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Submission {
    id: string;
    url: string;
    note: string | null;
    status: SubmissionStatus;
    createdAt: string;
    ipHash: string | null;
    previewJson: Record<string, unknown> | null;
}

export interface LinkPreview {
    platform: Platform;
    mediaKind: MediaKind;
    title: string;
    creatorHandle?: string;
    creatorName?: string;
    promptText?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    postedAt?: string;
    sourceUrl: string;
}

export type SortMode = 'new' | 'trending';

export interface FeedFilters {
    category?: Category;
    platform?: Platform;
    tag?: string;
    sort?: SortMode;
}
