/**
 * Single source of truth for the /guide page and the README capability scan.
 * Keeping it in TypeScript means the docs are typechecked alongside the code
 * they describe, and unit tests can assert that every route/env var mentioned
 * here actually exists.
 */

export type CapabilityStatus = 'stable' | 'new' | 'beta' | 'needs-key';

export interface Capability {
    id: string;
    name: string;
    summary: string;
    status: CapabilityStatus;
    where: string;
    requirements?: string;
}

export const CAPABILITIES: Capability[] = [
    {
        id: 'analysis',
        name: 'Voice fingerprint analysis',
        summary:
            'Reads a writing sample and extracts tone, sentence rhythm, vocabulary habits, transitions, language mixing, and closing style - plus 5-7 concrete style markers.',
        status: 'stable',
        where: '/ (generate)',
        requirements: 'A model key (or demo mode)',
    },
    {
        id: 'generation',
        name: 'Voice-matched drafting',
        summary:
            'Builds a dynamic voice contract from the analysis and the measurable signals in the sample (sentence length, contractions, anchors), then drafts with an anti-generic retry pass.',
        status: 'stable',
        where: '/ (generate), /desk (refine)',
        requirements: 'A model key (or demo mode)',
    },
    {
        id: 'refine',
        name: 'Refine loop',
        summary:
            'Four one-tap refinements plus free-form instructions. Every refine keeps the original voice context so the draft does not drift.',
        status: 'stable',
        where: '/desk',
        requirements: 'An existing generation',
    },
    {
        id: 'save',
        name: 'Save and history',
        summary:
            'Saved profiles and generations live in Supabase when configured, with a local JSON store for development. Session history works without an account.',
        status: 'stable',
        where: '/desk, /api/voice/save-current',
        requirements: 'Sign in for permanent saves',
    },
    {
        id: 'auth',
        name: 'Accounts',
        summary:
            'Email/password plus Google OAuth with PKCE. Sessions are http-only cookies; the refresh token never reaches the browser.',
        status: 'stable',
        where: '/api/voice/auth/*, /auth/callback',
        requirements: 'Supabase project + redirect allowlist',
    },
    {
        id: 'quota',
        name: 'Quota and rate limits',
        summary:
            'Five anonymous generations per hour keyed by a hashed IP + user agent, twenty per day for signed-in users, plus sign-in rate limiting.',
        status: 'stable',
        where: '/api/voice/generate, /api/voice/refine',
        requirements: 'Supabase for shared counters',
    },
    {
        id: 'fallbacks',
        name: 'Model fallback chain',
        summary:
            'Groq is primary; DashScope and OpenRouter are optional fallbacks. Provider errors are normalized before they reach the UI.',
        status: 'stable',
        where: 'src/lib/voiceService.ts',
        requirements: 'At least one provider key',
    },
    {
        id: 'gallery',
        name: 'Build gallery',
        summary:
            'A gallery of builds made with AI models, with search, model/vendor/source filters, trending sort, and a "write about this" handoff into the desk.',
        status: 'new',
        where: '/builds',
        requirements: 'None - curated picks ship with the app',
    },
    {
        id: 'x-feed',
        name: 'Live X (Twitter) feed',
        summary:
            'Pulls recent build posts from X using the v2 recent-search endpoint, maps them to cards, and caches results for five minutes.',
        status: 'needs-key',
        where: 'src/lib/builds/sources/x.ts',
        requirements: 'X_BEARER_TOKEN',
    },
    {
        id: 'github-feed',
        name: 'Live GitHub feed',
        summary:
            'Searches recently created AI repositories by topic, filters out archived or unattributed projects, and merges them with the rest of the feed.',
        status: 'beta',
        where: 'src/lib/builds/sources/github.ts',
        requirements: 'GITHUB_TOKEN recommended (raises rate limits)',
    },
    {
        id: 'demo',
        name: 'Demo mode',
        summary:
            'When no model key is configured, the app composes a clearly-labelled local draft instead of failing, so the whole flow can be walked end to end.',
        status: 'new',
        where: 'src/lib/demoEngine.ts',
        requirements: 'Automatic; force with PRYZMIRA_DEMO_MODE',
    },
    {
        id: 'tests',
        name: 'Unit test suite',
        summary:
            'Vitest coverage for the voice pipeline, auth redirects, rate limiting, storage and quotas, both feed adapters, filtering, and the docs data.',
        status: 'new',
        where: 'src/lib/**/__tests__',
        requirements: 'npm test',
    },
];

export interface GuideStep {
    title: string;
    body: string;
    code?: string;
}

export const QUICKSTART_STEPS: GuideStep[] = [
    {
        title: 'Paste something you actually wrote',
        body:
            'A message you sent, an email, class notes, a post. At least 50 words and written naturally - polished essays teach the engine less than your real messages. Samples are capped at 8,000 characters.',
    },
    {
        title: 'Describe the thing you need',
        body:
            'One or two sentences is enough: "an email asking my professor for more time", "a launch note for my side project". Add optional constraints like length or tone. Short, concrete tasks work better than long briefs.',
    },
    {
        title: 'Generate and read the analysis',
        body:
            'You land on the desk. The six-cell analysis panel shows what the engine thinks your voice is. If a cell is wrong, refine the draft - the analysis is a lens, not a verdict.',
    },
    {
        title: 'Refine until it sounds like you',
        body:
            'Use the quick chips or type an instruction. Refinements keep the same voice context, so you are editing wording, not re-rolling the voice.',
    },
    {
        title: 'Save it (optional)',
        body:
            'Session history works without an account. Sign in to keep profiles and generations permanently, and to raise the quota from five per hour to twenty per day.',
    },
];

export interface Recipe {
    id: string;
    title: string;
    task: string;
    instructions: string;
    tags: string[];
    note: string;
}

export const RECIPES: Recipe[] = [
    {
        id: 'cold-email',
        title: 'Cold outreach that does not sound like a template',
        task: 'Write a short cold email to a founder I admire, asking for 15 minutes to talk about their developer tooling.',
        instructions: 'Under 120 words. One specific reason I am reaching out. No flattery, no "I hope this finds you well".',
        tags: ['email', 'outreach'],
        note: 'Use an email you actually sent as the sample, not a cover letter.',
    },
    {
        id: 'launch-note',
        title: 'Launch note for a build',
        task: 'Write a launch note for the build gallery entry I picked, for my personal site and X.',
        instructions: 'Name what it does, who it is for, and one honest limitation. No emoji, no hashtags, no hype.',
        tags: ['launch', 'writing'],
        note: 'Every gallery card has a "Write about it" button that fills this task in for you.',
    },
    {
        id: 'delay-note',
        title: 'Tell someone you are going to miss a deadline',
        task: 'Write a message to my client explaining that the delivery will slip by four days, why, and what I am doing about it.',
        instructions: 'Direct, no excuses, offer a concrete new date. Do not over-apologize.',
        tags: ['work', 'hard conversation'],
        note: 'This is where voice matters most - generic corporate apologies read as evasive.',
    },
    {
        id: 'follow-up',
        title: 'Meeting follow-up with clear next steps',
        task: 'Write a follow-up message after a project kickoff meeting, summarizing decisions and next steps.',
        instructions: 'Bullet-free. Three short paragraphs. End with who does what and by when.',
        tags: ['work', 'summary'],
        note: 'Paste a previous follow-up you wrote so the structure matches your habits.',
    },
    {
        id: 'cover-letter',
        title: 'A cover letter paragraph that sounds human',
        task: 'Write a two-paragraph cover letter intro for a product engineer role at a small AI company.',
        instructions: 'Mention one concrete thing I built. Skip the "passionate about technology" line.',
        tags: ['career'],
        note: 'Sample: a project write-up you wrote, not the job description.',
    },
    {
        id: 'thread',
        title: 'A short thread about something you learned',
        task: 'Write a five-post thread about the biggest mistake I made while shipping my first AI feature.',
        instructions: 'Plain English, no buzzwords. Each post stands alone. Do not number them.',
        tags: ['social', 'writing'],
        note: 'Paste an earlier thread as the sample so the rhythm stays conversational.',
    },
];

export interface EnvVarDoc {
    key: string;
    required: string;
    purpose: string;
}

export const ENV_VARS: EnvVarDoc[] = [
    {
        key: 'GROQ_API_KEY',
        required: 'Required for real generation',
        purpose: 'Primary inference provider. Without it (and without a fallback key) the app runs in demo mode.',
    },
    {
        key: 'GROQ_ANALYZE_MODEL',
        required: 'Optional',
        purpose: 'Override the analysis model. Defaults to llama-3.3-70b-versatile.',
    },
    {
        key: 'GROQ_GENERATE_MODEL',
        required: 'Optional',
        purpose: 'Override the generation model. Defaults to llama-3.3-70b-versatile.',
    },
    {
        key: 'DASHSCOPE_API_KEY',
        required: 'Optional',
        purpose: 'Second fallback provider for generation. Skipped when unset.',
    },
    {
        key: 'OPENROUTER_API_KEY',
        required: 'Optional',
        purpose: 'Final fallback provider. Also used when Groq is rate limited.',
    },
    {
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        required: 'Required for accounts',
        purpose: 'Supabase project URL for auth, storage, and shared quotas.',
    },
    {
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        required: 'Required for accounts',
        purpose: 'Public Supabase key used for the auth endpoints.',
    },
    {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        required: 'Required for accounts',
        purpose: 'Server-only key for voice_profiles, voice_generations, and voice_usage. Never expose it to the client.',
    },
    {
        key: 'NEXT_PUBLIC_APP_URL',
        required: 'Recommended in production',
        purpose: 'Trusted origin for OAuth and auth redirects. SITE_URL and NEXTAUTH_URL are also accepted.',
    },
    {
        key: 'X_BEARER_TOKEN',
        required: 'Optional',
        purpose: 'Enables the live X feed in the build gallery. App-only bearer token from the X developer portal.',
    },
    {
        key: 'GITHUB_TOKEN',
        required: 'Optional',
        purpose: 'Raises the GitHub search rate limit from 10 to 30 requests per minute.',
    },
    {
        key: 'PRYZMIRA_DISABLE_GITHUB_FEED',
        required: 'Optional',
        purpose: 'Set to true to skip GitHub entirely and rely on curated picks plus X.',
    },
    {
        key: 'PRYZMIRA_DEMO_MODE',
        required: 'Optional',
        purpose: 'true forces demo mode, false disables the automatic fallback when keys are missing.',
    },
];

export interface BuildSourceDoc {
    id: string;
    label: string;
    state: string;
    envKey?: string;
    detail: string;
    code?: string;
}

export const BUILD_SOURCES: BuildSourceDoc[] = [
    {
        id: 'curated',
        label: 'Curated picks',
        state: 'Always on',
        detail:
            'Shipped with the app so the gallery is never empty. Edit src/lib/builds/curated.ts to add a project; the catalog test checks ids, URLs, model ids, and tool ids.',
    },
    {
        id: 'x',
        label: 'X (Twitter)',
        state: 'Needs a key',
        envKey: 'X_BEARER_TOKEN',
        detail:
            'Uses the v2 recent-search endpoint (the last seven days) with a builder-focused query. Create an app-only bearer token at developer.x.com, then set it below. Results are cached for five minutes; posts shorter than 40 characters, or with no detectable AI model or tool, are dropped. Tune the query in src/lib/builds/sources/x.ts to follow different keywords or makers.',
        code: 'X_BEARER_TOKEN=your_app_only_bearer_token',
    },
    {
        id: 'github',
        label: 'GitHub',
        state: 'On by default',
        envKey: 'GITHUB_TOKEN',
        detail:
            'Searches recently created repositories for the llm and ai-agents topics, sorted by stars. Archived repos, and repos that mention only generic stack terms (Python, React) without an AI model or AI-native tool, are skipped. Results are cached for ten minutes.',
        code: 'GITHUB_TOKEN=ghp_your_token  # optional, raises rate limits',
    },
    {
        id: 'custom',
        label: 'Add another source',
        state: 'About 20 lines',
        detail:
            'Write an adapter that returns AiBuild[] and register it in fetchBuildFeed. Every card, filter, and test helper works automatically because they only depend on the shared type.',
        code: [
            '// src/lib/builds/sources/huggingface.ts',
            'export async function fetchHuggingFaceBuilds(): Promise<AiBuild[]> {',
            '  const response = await fetch("https://huggingface.co/api/spaces?sort=likes");',
            '  const spaces = await response.json();',
            '  return spaces.map((space) => ({',
            '    id: `hf:${space.id}`,',
            '    title: space.id,',
            '    // ...map the rest of the AiBuild fields',
            '    provenance: "live",',
            '    addedAt: new Date().toISOString(),',
            '  }));',
            '}',
        ].join('\n'),
    },
];

export interface TroubleshootingEntry {
    symptom: string;
    cause: string;
    fix: string;
}

export const TROUBLESHOOTING: TroubleshootingEntry[] = [
    {
        symptom: 'The writing engine is unavailable right now.',
        cause: 'Every configured provider failed, or no provider key is set and demo mode is disabled.',
        fix: 'Check the server logs for the provider prefix (Groq request failed / OpenRouter request failed), verify the key, or unset PRYZMIRA_DEMO_MODE=false to fall back to a local draft.',
    },
    {
        symptom: 'GROQ_API_KEY is not configured.',
        cause: 'The generate route reached the provider without a key.',
        fix: 'Add the key to .env.local and restart the dev server. Configuration errors are no longer masked as network errors.',
    },
    {
        symptom: 'Your writing sample needs at least 50 words.',
        cause: 'Client-side and server-side validation both enforce a 50-word minimum.',
        fix: 'Paste a longer sample. If you are testing quickly, the home page has a "Use a sample" button that fills one in.',
    },
    {
        symptom: 'Anonymous quota reached.',
        cause: 'Five generations per hour for one hashed IP + user agent.',
        fix: 'Wait for the hour window, sign in for twenty per day, or set ALLOW_LOCAL_VOICE_STORAGE=true and use a development store.',
    },
    {
        symptom: 'Voice quota service is temporarily unavailable.',
        cause: 'Supabase is configured but the voice_usage table or service-role key is missing, or a concurrent update kept losing the race.',
        fix: 'Run supabase/voice_schema.sql, confirm SUPABASE_SERVICE_ROLE_KEY, and retry. The route fails closed rather than letting requests through.',
    },
    {
        symptom: 'Sign-in could not be completed.',
        cause: 'OAuth redirect mismatch, or no trusted application URL in production.',
        fix: 'Set NEXT_PUBLIC_APP_URL, add <origin>/auth/callback to the Supabase redirect allowlist, and make sure /api/voice/auth/oauth-start is reached on the same origin.',
    },
    {
        symptom: 'X - not connected in the gallery.',
        cause: 'X_BEARER_TOKEN is missing, rejected, or the app hit the recent-search rate limit.',
        fix: 'Check the source pill tooltip for the exact status, set a valid app-only bearer token, and wait out the rate-limit window. Curated picks stay available.',
    },
    {
        symptom: 'GitHub - unavailable in the gallery.',
        cause: 'Unauthenticated search allows 10 requests per minute; three topic queries are made per refresh.',
        fix: 'Add GITHUB_TOKEN, or set PRYZMIRA_DISABLE_GITHUB_FEED=true. The error is cached with the feed, so a refresh after the limit resets clears it.',
    },
];

export interface FaqEntry {
    question: string;
    answer: string;
}

export const FAQ: FaqEntry[] = [
    {
        question: 'Is my writing sample stored?',
        answer:
            'Not unless you save. Unsaved generations stay in your browser session storage. Saving requires an account and writes to Supabase; in development it writes to next-web/data/voice-store.json, which is git-ignored.',
    },
    {
        question: 'Does it browse the web or check facts?',
        answer:
            'No. The engine only uses your sample, your task, and your instructions. It is a style engine, not a research tool - verify anything factual before sending.',
    },
    {
        question: 'Can it tell whether text was AI written?',
        answer:
            'No, and it does not try. It removes the patterns that make AI text feel generic (boilerplate openers, uniform sentence length, missing contractions) by matching your measured habits instead.',
    },
    {
        question: 'Which models does it use?',
        answer:
            'Groq Llama 3.3 70B by default, with optional DashScope and OpenRouter fallbacks. Both the analysis and generation model can be overridden with environment variables. The build gallery covers many other models.',
    },
    {
        question: 'Does demo mode call a model?',
        answer:
            'No. Demo mode composes a local draft from your own sample and task, labels the result in the UI, and is meant for walking the flow without keys. Never treat demo output as a real generation.',
    },
    {
        question: 'How does the build gallery pick what to show?',
        answer:
            'Live X and GitHub results when available, merged with a curated set. "Trending" weights reposts and replies above likes, then decays by age. A post needs a detectable model or tool to appear at all.',
    },
];

export const TEST_SUITE = [
    { file: 'voice.test.ts', covers: 'Validation, word counts, previews, refine input, truncation' },
    { file: 'voiceService.test.ts', covers: 'Analysis parsing, prompt contract, generic retry, provider fallbacks' },
    { file: 'voiceAuth.test.ts', covers: 'Redirect sanitization, PKCE generation, OAuth URL building' },
    { file: 'voiceRateLimit.test.ts', covers: 'Per-email and per-IP windows, retry timing, hashed buckets' },
    { file: 'voiceStorage.test.ts', covers: 'Quota enforcement, profile and generation persistence' },
    { file: 'voiceRequestError.test.ts', covers: 'Engine failure detection and user-facing normalization' },
    { file: 'builds/normalize.test.ts', covers: 'Model detection, classification, filtering, sorting, dedupe' },
    { file: 'builds/sources.test.ts', covers: 'X and GitHub request building plus response mapping' },
    { file: 'builds/feed.test.ts', covers: 'Feed merging, fallbacks, caching, source statuses' },
    { file: 'builds/catalog.test.ts', covers: 'Catalog and curated-data integrity' },
    { file: 'builds/route.test.ts', covers: 'API filters, sorting, limits, and cache headers' },
    { file: 'guide.test.ts', covers: 'Docs stay in sync with routes, env vars, and files' },
    { file: 'demoEngine.test.ts', covers: 'Deterministic local drafts and demo-mode detection' },
];
