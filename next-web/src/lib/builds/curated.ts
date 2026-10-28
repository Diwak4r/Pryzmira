import type { AiBuild } from '@/lib/builds/types';

/**
 * The date this starter catalog was compiled. Curated entries intentionally
 * do NOT claim a launch date for someone else's project; the gallery shows
 * "curated pick" instead of a relative timestamp for them.
 */
export const CATALOG_DATE = '2026-10-28T00:00:00.000Z';

/**
 * Hand-picked starter builds. They guarantee the gallery is useful before any
 * X or GitHub token is configured, and they double as examples of what a good
 * gallery card looks like.
 *
 * Attribution rule: `models` only lists models the team has publicly said they
 * build on. Model-agnostic projects list the tools they run on instead, and
 * every card links back to its source so readers can verify.
 */
export const CURATED_BUILDS: AiBuild[] = [
    {
        id: 'curated:lovable',
        title: 'Lovable',
        summary:
            'Prompt-to-app builder that turns a plain-language brief into a working full-stack web app, with hosting and a database wired in.',
        maker: { name: 'Lovable', handle: 'lovable_dev' },
        models: ['claude-sonnet-4-5'],
        tools: ['lovable', 'supabase'],
        category: 'app',
        tags: ['prompt-to-app', 'full-stack', 'no-code'],
        source: { platform: 'web', url: 'https://lovable.dev', label: 'Website' },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        highlight: 'The clearest picture of the prompt-to-app loop: describe, preview, iterate, ship.',
    },
    {
        id: 'curated:bolt-new',
        title: 'bolt.new',
        summary:
            'Browser-based full-stack builder. Write a brief, get a running app in a sandbox with a live preview and editable code.',
        maker: { name: 'StackBlitz', handle: 'stackblitz' },
        models: ['claude-sonnet-4-5'],
        tools: ['bolt-new', 'nextjs'],
        category: 'app',
        tags: ['browser-ide', 'scaffolding', 'full-stack'],
        source: { platform: 'web', url: 'https://bolt.new', label: 'Website' },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        highlight: 'Shows how far a single prompt gets you when the runtime runs in the browser.',
    },
    {
        id: 'curated:cursor',
        title: 'Cursor',
        summary:
            'AI-first code editor built around multi-file edits, codebase-wide questions, and agent runs that touch real repositories.',
        maker: { name: 'Anysphere', handle: 'cursor_ai' },
        models: ['claude-sonnet-4-5', 'gpt-5'],
        tools: ['cursor'],
        category: 'devtool',
        tags: ['ide', 'codegen', 'refactor'],
        source: { platform: 'web', url: 'https://cursor.com', label: 'Website' },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        highlight: 'A reference for how model choice changes the feel of the same editor.',
    },
    {
        id: 'curated:openhands',
        title: 'OpenHands',
        summary:
            'Open-source software-engineering agent that runs commands, edits files, and browses the web inside a sandbox to finish issues end to end.',
        maker: { name: 'All Hands AI', handle: 'allhands_ai' },
        models: ['claude-sonnet-4-5'],
        tools: ['openhands', 'python'],
        category: 'agent',
        tags: ['swe-agent', 'autonomy', 'open-source'],
        source: {
            platform: 'github',
            url: 'https://github.com/All-Hands-AI/OpenHands',
            label: 'GitHub repo',
        },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        language: 'Python',
        highlight: 'Good study for tool loops, sandboxing, and where agents still need a human.',
    },
    {
        id: 'curated:aider',
        title: 'Aider',
        summary:
            'Terminal pair-programmer that edits files in your git repo and commits with sensible messages, wired to the model of your choice.',
        maker: { name: 'Aider' },
        models: [],
        tools: ['aider', 'python'],
        category: 'devtool',
        tags: ['cli', 'git', 'pair-programming'],
        source: { platform: 'github', url: 'https://github.com/Aider-AI/aider', label: 'GitHub repo' },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        language: 'Python',
        highlight: 'Model-agnostic by design. Swap models and watch the same workflow behave differently.',
    },
    {
        id: 'curated:continue',
        title: 'Continue',
        summary:
            'Open-source IDE extension for chat, autocomplete, and edit workflows. Point it at a hosted model or a local one.',
        maker: { name: 'Continue', handle: 'continuedev' },
        models: [],
        tools: ['continue'],
        category: 'devtool',
        tags: ['ide-extension', 'local-models', 'open-source'],
        source: {
            platform: 'github',
            url: 'https://github.com/continuedev/continue',
            label: 'GitHub repo',
        },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        language: 'TypeScript',
    },
    {
        id: 'curated:open-webui',
        title: 'Open WebUI',
        summary:
            'Self-hosted chat interface for local and remote models, with tools, RAG, and multi-user support out of the box.',
        maker: { name: 'Open WebUI' },
        models: [],
        tools: ['open-webui', 'ollama'],
        category: 'devtool',
        tags: ['self-hosted', 'chat-ui', 'local-models'],
        source: {
            platform: 'github',
            url: 'https://github.com/open-webui/open-webui',
            label: 'GitHub repo',
        },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        language: 'TypeScript',
        highlight: 'What a private, local-first front end for LLMs looks like in practice.',
    },
    {
        id: 'curated:comfyui',
        title: 'ComfyUI',
        summary:
            'Node-graph runtime for image and video models. Chain loaders, samplers, and upscalers into reusable workflows.',
        maker: { name: 'ComfyUI', handle: 'comfyanonymous' },
        models: ['flux-1', 'sdxl'],
        tools: ['comfyui', 'python'],
        category: 'creative',
        tags: ['node-graph', 'image-gen', 'workflows'],
        source: {
            platform: 'github',
            url: 'https://github.com/comfyanonymous/ComfyUI',
            label: 'GitHub repo',
        },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        language: 'Python',
        highlight: 'The most legible example of composing generative models like a pipeline.',
    },
    {
        id: 'curated:flux-schnell-space',
        title: 'FLUX.1 [schnell] demo',
        summary:
            'One-click image generation on Hugging Face. Type a prompt, get four images, no setup and no account required to try it.',
        maker: { name: 'Black Forest Labs', handle: 'bfl_ml' },
        models: ['flux-1'],
        tools: ['huggingface'],
        category: 'creative',
        tags: ['image-gen', 'demo', 'text-to-image'],
        source: {
            platform: 'huggingface',
            url: 'https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell',
            label: 'HF Space',
        },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        highlight: 'Fastest way to feel a model ceiling before you wire it into anything.',
    },
    {
        id: 'curated:whisper-web',
        title: 'Whisper Web',
        summary:
            'Speech-to-text that runs entirely in the browser. Drop in audio and the model transcribes it locally, no upload.',
        maker: { name: 'Xenova' },
        models: ['whisper'],
        tools: ['react'],
        category: 'app',
        tags: ['speech-to-text', 'in-browser', 'privacy'],
        source: {
            platform: 'github',
            url: 'https://github.com/xenova/whisper-web',
            label: 'GitHub repo',
        },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        language: 'TypeScript',
        highlight: 'Proof that “AI app” does not have to mean “server bill”.',
    },
    {
        id: 'curated:v0',
        title: 'v0 by Vercel',
        summary:
            'Generates React interfaces from a description or a screenshot, then hands you the code for the components it produced.',
        maker: { name: 'Vercel', handle: 'vercel' },
        models: [],
        tools: ['v0', 'vercel', 'nextjs', 'tailwind'],
        category: 'devtool',
        tags: ['ui-generation', 'react', 'design'],
        source: { platform: 'web', url: 'https://v0.dev', label: 'Website' },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        highlight: 'Good pattern to copy: generation is only useful if the output is editable code.',
    },
    {
        id: 'curated:windsurf',
        title: 'Windsurf',
        summary:
            'Agentic editor that keeps context on your project and proposes multi-step changes you can review inline.',
        maker: { name: 'Windsurf' },
        models: [],
        tools: ['windsurf'],
        category: 'devtool',
        tags: ['ide', 'agentic-editing', 'review'],
        source: { platform: 'web', url: 'https://windsurf.com', label: 'Website' },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
    },
    {
        id: 'curated:pryzmira',
        title: 'Pryzmira',
        summary:
            'This site. Paste a writing sample, get an analysis of your cadence and habits, then generate drafts that keep your voice.',
        maker: { name: 'Diwakar Yadav', handle: 'Diwak4r' },
        models: ['llama-3-3-70b'],
        tools: ['groq', 'nextjs', 'supabase', 'vercel'],
        category: 'app',
        tags: ['writing', 'voice-cloning', 'this-site'],
        source: {
            platform: 'github',
            url: 'https://github.com/Diwak4r/Pryzmira',
            label: 'GitHub repo',
        },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        language: 'TypeScript',
        highlight: 'Open source, including the voice contract that keeps the model from sounding like a model.',
    },
    {
        id: 'curated:suno',
        title: 'Suno',
        summary:
            'Text-to-music generator: describe a genre, mood, and lyric idea, and get a finished track with vocals.',
        maker: { name: 'Suno' },
        models: ['suno'],
        tools: [],
        category: 'creative',
        tags: ['music', 'generation', 'audio'],
        source: { platform: 'web', url: 'https://suno.com', label: 'Website' },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
    },
    {
        id: 'curated:swe-agent',
        title: 'SWE-agent',
        summary:
            'Research harness that lets a language model use a shell and an editor to resolve GitHub issues, shipped with evaluation tooling.',
        maker: { name: 'Princeton NLP' },
        models: [],
        tools: ['python'],
        category: 'research',
        tags: ['agents', 'benchmark', 'research'],
        source: {
            platform: 'github',
            url: 'https://github.com/SWE-agent/SWE-agent',
            label: 'GitHub repo',
        },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        language: 'Python',
        highlight: 'Read this before trusting an agent benchmark you saw in a post.',
    },
    {
        id: 'curated:ai-dungeon',
        title: 'AI Dungeon',
        summary:
            'Long-running text adventure where a model improvises the world as you type. One of the earliest consumer AI-native games.',
        maker: { name: 'AI Dungeon' },
        models: [],
        tools: [],
        category: 'game',
        tags: ['text-adventure', 'generative-game', 'interactive-fiction'],
        source: { platform: 'web', url: 'https://aidungeon.com', label: 'Website' },
        provenance: 'curated',
        addedAt: CATALOG_DATE,
        highlight: 'Still the cleanest example of a model as a game engine, not a feature.',
    },
];
