import coursesData from '@/data/courses.json';
import { aiTools, resources } from '@/data/mockData';
import type { CourseRecord, ToolRecord } from '@/lib/catalog';

export type StrategyGoal =
    | 'launch-ai-product'
    | 'become-ai-engineer'
    | 'get-hired-in-tech'
    | 'use-ai-at-work';

export type ExperienceLevel = 'starter' | 'working' | 'advanced';
export type MonetizationPath = 'career' | 'freelance' | 'saas';
export type StrategyBriefDeliveryChannel = 'web' | 'email';
export type StrategyBriefSendStatus = 'draft' | 'sent' | 'failed';
export type StrategyPremiumStage =
    | 'none'
    | 'interested'
    | 'lead'
    | 'contacted'
    | 'converted';
export type StrategyLeadSurface = 'home' | 'desk' | 'email' | 'roadmap';
export type StrategyLeadOffer = 'pro_waitlist' | 'weekly_reviews' | 'launch_reviews';
export type StrategyLeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface StrategyProfileInput {
    email: string;
    fullName: string;
    goal: StrategyGoal;
    experienceLevel: ExperienceLevel;
    weeklyHours: number;
    monetizationPath: MonetizationPath;
    wantsBriefs: boolean;
    premiumInterest: boolean;
}

export interface StrategyProfileRecord extends StrategyProfileInput {
    id: string;
    lastBriefSentAt: string | null;
    premiumStage: StrategyPremiumStage;
    createdAt: string;
    updatedAt: string;
}

export interface StrategyRecommendation {
    id: string | number;
    title: string;
    href: string;
    label: string;
    category: string;
    reason: string;
}

export interface StrategySprintSession {
    title: string;
    duration: string;
    outcome: string;
}

export interface StrategyPlan {
    headline: string;
    summary: string;
    promise: string;
    recommendations: {
        courses: StrategyRecommendation[];
        tools: StrategyRecommendation[];
        resources: StrategyRecommendation[];
    };
    sprintFocus: string;
    nextActions: string[];
    sessions: StrategySprintSession[];
    monetizationHook: string;
    weekLabel: string;
}

export interface StrategyBriefRecord {
    id: string;
    profileId: string;
    subject: string;
    preview: string;
    plan: StrategyPlan;
    weekKey: string;
    deliveryChannel: StrategyBriefDeliveryChannel;
    sendStatus: StrategyBriefSendStatus;
    sentAt: string | null;
    emailProviderId: string | null;
    createdAt: string;
}

export interface StrategyPremiumLeadInput {
    notes?: string;
    offer: StrategyLeadOffer;
    profileId: string;
    surface: StrategyLeadSurface;
}

export interface StrategyPremiumLeadRecord {
    id: string;
    profileId: string;
    email: string;
    offer: StrategyLeadOffer;
    surface: StrategyLeadSurface;
    status: StrategyLeadStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface StrategyWaitlistStatus {
    position: number;
    total: number;
}

export interface StrategyGrowthStats {
    briefsThisWeek: number;
    buildersThisWeek: number;
    totalBuilders: number;
    waitlistCount: number;
}

export interface StrategyWorkspaceResponse {
    profile: StrategyProfileRecord;
    brief: StrategyBriefRecord;
    resumeUrl: string;
}

interface ResourceRecord {
    id: string;
    title: string;
    type: string;
    description: string;
    link: string;
}

const courseCatalog = coursesData as CourseRecord[];
const toolCatalog = aiTools as ToolRecord[];
const resourceCatalog = resources as ResourceRecord[];

const GOAL_COPY: Record<
    StrategyGoal,
    {
        label: string;
        hero: string;
        summary: string;
        sprintFocus: string;
        promise: string;
        monetizationHook: string;
        courseTracks: string[];
        toolTracks: string[];
        resourceKeywords: string[];
    }
> = {
    'launch-ai-product': {
        label: 'Launch an AI product',
        hero: 'Turn scattered tools into a shipping system.',
        summary:
            'This plan prioritizes product execution, modern AI tooling, and the engineering fundamentals required to ship something people will use.',
        sprintFocus: 'Ship one meaningful thing every week.',
        promise:
            'You need fewer bookmarks and more momentum. Pryzmira gives you a working route, not another reading list.',
        monetizationHook:
            'Pryzmira Pro will turn this into a rolling operating system with deeper briefs, tool stacks, and launch-focused reviews.',
        courseTracks: ['Web Dev', 'Full Stack', 'AI', 'AI/ML', 'System Design', 'Design', 'UI/UX', 'Product Management'],
        toolTracks: ['Coding', 'Chatbot', 'Productivity', 'Design', 'Research'],
        resourceKeywords: ['roadmap', 'react', 'product', 'system design', 'github'],
    },
    'become-ai-engineer': {
        label: 'Become an AI engineer',
        hero: 'Build depth in models, systems, and delivery.',
        summary:
            'This path balances machine learning fundamentals, engineering rigor, and the tools you need to move from experimentation to production.',
        sprintFocus: 'Build technical depth with a weekly output loop.',
        promise:
            'The goal is not just to use AI tools. It is to understand how to build with them, evaluate them, and ship reliable systems.',
        monetizationHook:
            'Pryzmira Pro will unlock stronger model briefs, interview-grade drills, and applied project tracks.',
        courseTracks: ['AI', 'AI/ML', 'Data Science', 'Coding', 'Cloud', 'System Design', 'Backend'],
        toolTracks: ['Chatbot', 'Coding', 'Research', 'Search', 'Self-Hosted'],
        resourceKeywords: ['prompt', 'machine', 'system design', 'mit', 'cs50'],
    },
    'get-hired-in-tech': {
        label: 'Get job-ready in tech',
        hero: 'Turn learning into visible signals employers trust.',
        summary:
            'This plan emphasizes fundamentals, portfolio proof, and the courses that compound fastest for interviews and shipping real projects.',
        sprintFocus: 'Build signal, not just knowledge.',
        promise:
            'You need a believable sequence of proof: skills, projects, and clarity about what to learn next.',
        monetizationHook:
            'Pryzmira Pro will package this into interview briefs, portfolio tracks, and accountability emails.',
        courseTracks: ['Coding', 'DSA', 'Web Dev', 'System Design', 'Computer Science', 'Backend', 'Cloud'],
        toolTracks: ['Coding', 'Productivity', 'Research', 'Chatbot'],
        resourceKeywords: ['career', 'interview', 'github', 'roadmap', 'community'],
    },
    'use-ai-at-work': {
        label: 'Use AI to accelerate your work',
        hero: 'Build a sharper stack for leverage, not novelty.',
        summary:
            'This plan focuses on practical tools, workflow design, and the minimum learning needed to turn AI into measurable output.',
        sprintFocus: 'Create leverage inside your existing work.',
        promise:
            'The fastest wins come from pairing better tools with a repeatable routine. Pryzmira makes that routine concrete.',
        monetizationHook:
            'Pryzmira Pro will add role-specific stacks, automations, and deeper weekly execution briefs.',
        courseTracks: ['AI', 'AI/ML', 'Web Dev', 'Productivity', 'Business', 'Marketing', 'Design'],
        toolTracks: ['Productivity', 'Chatbot', 'Design', 'Research', 'Creative'],
        resourceKeywords: ['prompt', 'guide', 'community', 'react', 'design'],
    },
};

const EXPERIENCE_COPY: Record<ExperienceLevel, string> = {
    starter: 'Start with guided fundamentals and a lighter weekly load.',
    working: 'Balance practical shipping with deeper technical context.',
    advanced: 'Bias toward leverage, specialization, and compound outputs.',
};

const MONETIZATION_COPY: Record<MonetizationPath, string> = {
    career: 'Optimize the plan around skill proof, interviews, and long-term employability.',
    freelance: 'Bias the stack toward fast delivery, client utility, and repeatable workflows.',
    saas: 'Bias the stack toward product execution, iteration, and audience traction.',
};

const GOAL_OPTIONS = Object.entries(GOAL_COPY).map(([value, config]) => ({
    value: value as StrategyGoal,
    label: config.label,
    description: config.hero,
}));

const EXPERIENCE_OPTIONS = [
    { value: 'starter', label: 'Starter', description: EXPERIENCE_COPY.starter },
    { value: 'working', label: 'Working', description: EXPERIENCE_COPY.working },
    { value: 'advanced', label: 'Advanced', description: EXPERIENCE_COPY.advanced },
] as const;

const MONETIZATION_OPTIONS = [
    { value: 'career', label: 'Career growth', description: MONETIZATION_COPY.career },
    { value: 'freelance', label: 'Freelance income', description: MONETIZATION_COPY.freelance },
    { value: 'saas', label: 'Build a SaaS', description: MONETIZATION_COPY.saas },
] as const;

const COURSE_CATEGORY_ALIASES: Record<string, string> = {
    'AI/ML': 'AI',
    'Cloud Computing': 'Cloud',
    'Cyber Security': 'Cybersecurity',
    'Game Development': 'Game Dev',
};

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function normalizeText(value: string): string {
    return value.trim().toLowerCase();
}

function normalizeCourseCategory(category: string): string {
    return COURSE_CATEGORY_ALIASES[category] ?? category;
}

function sanitizePremiumStage(value: unknown, premiumInterest = false): StrategyPremiumStage {
    switch (value) {
        case 'interested':
        case 'lead':
        case 'contacted':
        case 'converted':
            return value;
        default:
            return premiumInterest ? 'interested' : 'none';
    }
}

function sanitizeLeadSurface(value: unknown): StrategyLeadSurface | null {
    switch (value) {
        case 'home':
        case 'desk':
        case 'email':
        case 'roadmap':
            return value;
        default:
            return null;
    }
}

function sanitizeLeadOffer(value: unknown): StrategyLeadOffer | null {
    switch (value) {
        case 'pro_waitlist':
        case 'weekly_reviews':
        case 'launch_reviews':
            return value;
        default:
            return null;
    }
}

function getDifficultyLevel(value: string): ExperienceLevel {
    const normalized = normalizeText(value);

    if (
        normalized.includes('advanced') ||
        normalized.includes('expert') ||
        normalized.includes('senior')
    ) {
        return 'advanced';
    }

    if (
        normalized.includes('intermediate') ||
        normalized.includes('working') ||
        normalized.includes('beginner to advanced')
    ) {
        return 'working';
    }

    return 'starter';
}

function courseDifficultyScore(
    course: CourseRecord,
    experienceLevel: ExperienceLevel
): number {
    const difficulty = getDifficultyLevel(course.difficulty);

    if (difficulty === experienceLevel) {
        return 4;
    }

    if (
        (experienceLevel === 'working' && difficulty === 'starter') ||
        (experienceLevel === 'advanced' && difficulty === 'working')
    ) {
        return 2;
    }

    if (experienceLevel === 'starter' && difficulty === 'advanced') {
        return -2;
    }

    return 1;
}

function keywordScore(text: string, keywords: string[]): number {
    const normalized = normalizeText(text);
    return keywords.reduce((score, keyword) => {
        return normalized.includes(keyword) ? score + 1 : score;
    }, 0);
}

function formatHours(hours: number): string {
    if (hours <= 4) {
        return `${hours} hrs`;
    }

    return `${hours}+ hrs`;
}

function getWeekLabel(): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date());
}

export function getStrategyWeekKey(date = new Date()): string {
    const reference = new Date(date);
    reference.setHours(0, 0, 0, 0);

    const day = reference.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    reference.setDate(reference.getDate() + offset);

    return reference.toISOString().slice(0, 10);
}

function getWeeklySessionCount(weeklyHours: number): number {
    if (weeklyHours <= 4) {
        return 3;
    }

    if (weeklyHours <= 7) {
        return 4;
    }

    return 5;
}

function scoreCourse(
    course: CourseRecord,
    profile: StrategyProfileInput
): number {
    const goal = GOAL_COPY[profile.goal];
    const normalizedCategory = normalizeCourseCategory(course.category);
    const keywordBase = [goal.label.toLowerCase(), ...goal.resourceKeywords];
    const text = `${course.title} ${course.description} ${(course.tags || []).join(' ')}`;
    let score = 0;

    if (goal.courseTracks.includes(normalizedCategory)) {
        score += 6;
    }

    score += courseDifficultyScore(course, profile.experienceLevel);
    score += keywordScore(text, keywordBase) * 2;
    score += Math.min((course.rating || 0) / 2, 3);
    score += Math.min((course.students || 0) / 1_500_000, 3);

    return score;
}

function scoreTool(tool: ToolRecord, profile: StrategyProfileInput): number {
    const goal = GOAL_COPY[profile.goal];
    const text = `${tool.name} ${tool.description} ${tool.tags.join(' ')}`;
    let score = 0;

    if (goal.toolTracks.includes(tool.category)) {
        score += 5;
    }

    score += keywordScore(text, goal.resourceKeywords) * 2;
    score += tool.featured ? 2 : 0;
    score += profile.monetizationPath === 'freelance' && tool.pricing === 'Free' ? 1 : 0;

    return score;
}

function scoreResource(resource: ResourceRecord, profile: StrategyProfileInput): number {
    const goal = GOAL_COPY[profile.goal];
    const text = `${resource.title} ${resource.description} ${resource.type}`;
    let score = 0;

    score += keywordScore(text, goal.resourceKeywords) * 2;
    score += resource.type.toLowerCase().includes('guide') ? 2 : 0;
    score += resource.type.toLowerCase().includes('course') ? 1 : 0;

    if (profile.monetizationPath === 'career' && text.toLowerCase().includes('community')) {
        score += 1;
    }

    return score;
}

function buildRecommendationReason(
    label: string,
    goalLabel: string,
    context: string
): string {
    return `${label} is a strong fit for ${goalLabel.toLowerCase()} because it improves ${context}.`;
}

function getTopCourses(profile: StrategyProfileInput): StrategyRecommendation[] {
    const goal = GOAL_COPY[profile.goal];

    return [...courseCatalog]
        .sort((left, right) => scoreCourse(right, profile) - scoreCourse(left, profile))
        .slice(0, 3)
        .map((course) => ({
            id: course.id,
            title: course.title,
            href: `/course/${course.id}`,
            label: course.instructor,
            category: normalizeCourseCategory(course.category),
            reason: buildRecommendationReason(
                course.title,
                goal.label,
                'your weekly depth and proof of work'
            ),
        }));
}

function getTopTools(profile: StrategyProfileInput): StrategyRecommendation[] {
    const goal = GOAL_COPY[profile.goal];

    return [...toolCatalog]
        .sort((left, right) => scoreTool(right, profile) - scoreTool(left, profile))
        .slice(0, 3)
        .map((tool) => ({
            id: tool.id,
            title: tool.name,
            href: tool.url,
            label: tool.pricing,
            category: tool.category,
            reason: buildRecommendationReason(
                tool.name,
                goal.label,
                'your workflow speed and output quality'
            ),
        }));
}

function getTopResources(profile: StrategyProfileInput): StrategyRecommendation[] {
    const goal = GOAL_COPY[profile.goal];

    return [...resourceCatalog]
        .sort((left, right) => scoreResource(right, profile) - scoreResource(left, profile))
        .slice(0, 3)
        .map((resource) => ({
            id: resource.id,
            title: resource.title,
            href: resource.link,
            label: resource.type,
            category: resource.type,
            reason: buildRecommendationReason(
                resource.title,
                goal.label,
                'clearer context and faster recovery when you get stuck'
            ),
        }));
}

function buildSessions(
    profile: StrategyProfileInput,
    courses: StrategyRecommendation[],
    tools: StrategyRecommendation[],
    resources: StrategyRecommendation[]
): StrategySprintSession[] {
    const sessionCount = getWeeklySessionCount(profile.weeklyHours);
    const goal = GOAL_COPY[profile.goal];

    const templates: StrategySprintSession[] = [
        {
            title: 'Learn the anchor concept',
            duration: formatHours(Math.max(1, Math.round(profile.weeklyHours / sessionCount))),
            outcome: `Work through ${courses[0]?.title || 'the first core course'} and capture three implementation notes.`,
        },
        {
            title: 'Adopt one leverage tool',
            duration: '45 mins',
            outcome: `Set up ${tools[0]?.title || 'your primary tool'} and use it in a real task.`,
        },
        {
            title: 'Build a visible output',
            duration: '90 mins',
            outcome: `Turn this week's learning into one public or portfolio-ready artifact tied to ${goal.label.toLowerCase()}.`,
        },
        {
            title: 'Sharpen with a reference pass',
            duration: '30 mins',
            outcome: `Read ${resources[0]?.title || 'the best supporting reference'} and convert it into one checklist.`,
        },
        {
            title: 'Review the loop',
            duration: '20 mins',
            outcome: 'Decide what to keep, what to cut, and what next week should focus on.',
        },
    ];

    return templates.slice(0, sessionCount);
}

export function getGoalOptions() {
    return GOAL_OPTIONS;
}

export function getExperienceOptions() {
    return EXPERIENCE_OPTIONS;
}

export function getMonetizationOptions() {
    return MONETIZATION_OPTIONS;
}

export function sanitizeStrategyProfileInput(
    value: unknown
): StrategyProfileInput | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const candidate = value as Partial<StrategyProfileInput>;
    const email = typeof candidate.email === 'string' ? normalizeEmail(candidate.email) : '';
    const fullName =
        typeof candidate.fullName === 'string' ? candidate.fullName.trim() : '';
    const weeklyHours =
        typeof candidate.weeklyHours === 'number'
            ? candidate.weeklyHours
            : Number(candidate.weeklyHours);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return null;
    }

    if (!fullName || fullName.length < 2) {
        return null;
    }

    if (
        candidate.goal !== 'launch-ai-product' &&
        candidate.goal !== 'become-ai-engineer' &&
        candidate.goal !== 'get-hired-in-tech' &&
        candidate.goal !== 'use-ai-at-work'
    ) {
        return null;
    }

    if (
        candidate.experienceLevel !== 'starter' &&
        candidate.experienceLevel !== 'working' &&
        candidate.experienceLevel !== 'advanced'
    ) {
        return null;
    }

    if (
        candidate.monetizationPath !== 'career' &&
        candidate.monetizationPath !== 'freelance' &&
        candidate.monetizationPath !== 'saas'
    ) {
        return null;
    }

    if (!Number.isFinite(weeklyHours) || weeklyHours < 2 || weeklyHours > 20) {
        return null;
    }

    return {
        email,
        fullName,
        goal: candidate.goal,
        experienceLevel: candidate.experienceLevel,
        weeklyHours,
        monetizationPath: candidate.monetizationPath,
        wantsBriefs: Boolean(candidate.wantsBriefs),
        premiumInterest: Boolean(candidate.premiumInterest),
    };
}

export function sanitizeStrategyPremiumLeadInput(
    value: unknown
): StrategyPremiumLeadInput | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const candidate = value as Partial<StrategyPremiumLeadInput>;
    const profileId =
        typeof candidate.profileId === 'string' ? candidate.profileId.trim() : '';
    const surface = sanitizeLeadSurface(candidate.surface);
    const offer = sanitizeLeadOffer(candidate.offer);
    const notes =
        typeof candidate.notes === 'string' && candidate.notes.trim().length > 0
            ? candidate.notes.trim().slice(0, 500)
            : undefined;

    if (!profileId || !surface || !offer) {
        return null;
    }

    return {
        profileId,
        surface,
        offer,
        notes,
    };
}

export function buildStrategyPlan(profile: StrategyProfileInput): StrategyPlan {
    const goal = GOAL_COPY[profile.goal];
    const courses = getTopCourses(profile);
    const tools = getTopTools(profile);
    const curatedResources = getTopResources(profile);
    const sessions = buildSessions(profile, courses, tools, curatedResources);

    return {
        headline: `${goal.label}, without the usual chaos.`,
        summary: goal.summary,
        promise: `${goal.promise} ${EXPERIENCE_COPY[profile.experienceLevel]} ${MONETIZATION_COPY[profile.monetizationPath]}`,
        recommendations: {
            courses,
            tools,
            resources: curatedResources,
        },
        sprintFocus: goal.sprintFocus,
        nextActions: [
            `Start with ${courses[0]?.title || 'the first recommended course'} this week.`,
            `Use ${tools[0]?.title || 'the first recommended tool'} on a real task before exploring more tools.`,
            `Keep ${curatedResources[0]?.title || 'the top supporting resource'} open as your recovery document.`,
        ],
        sessions,
        monetizationHook: goal.monetizationHook,
        weekLabel: getWeekLabel(),
    };
}

export function buildStrategyBrief(
    profile: StrategyProfileRecord,
    plan: StrategyPlan
): Omit<StrategyBriefRecord, 'id' | 'createdAt'> {
    const firstName = profile.fullName.split(' ')[0];

    return {
        profileId: profile.id,
        subject: `${firstName}, stay ahead this week with Pryzmira`,
        preview: `${plan.sprintFocus} First move: ${plan.nextActions[0]}`,
        plan,
        weekKey: getStrategyWeekKey(),
        deliveryChannel: 'web',
        sendStatus: 'draft',
        sentAt: null,
        emailProviderId: null,
    };
}

export function getStrategyPremiumStage(
    premiumInterest: boolean,
    currentStage?: unknown
): StrategyPremiumStage {
    return sanitizePremiumStage(currentStage, premiumInterest);
}
