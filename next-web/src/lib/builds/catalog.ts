import type { BuildCategory, BuildPlatform, ModelAbility } from '@/lib/builds/types';

export interface AiModel {
    id: string;
    label: string;
    vendor: string;
    family: string;
    abilities: ModelAbility[];
    /** Lower-case phrases used to spot this model in free text. */
    keywords: string[];
}

export interface AiTool {
    id: string;
    label: string;
    /** Lower-case phrases used to spot this tool in free text. */
    keywords: string[];
    kind: 'builder' | 'editor' | 'runtime' | 'framework' | 'infra' | 'media';
    /**
     * True for tools that are themselves AI products. A mention of `python` or
     * `react` is context, not attribution, so those never qualify a build on
     * their own.
     */
    ai: boolean;
}

/**
 * Editable model catalog. This list drives the gallery filters, the model
 * badges on every card, and the text matching used by the live X / GitHub
 * adapters. Add an entry here and it is picked up everywhere.
 */
export const AI_MODELS: AiModel[] = [
    {
        id: 'claude-sonnet-4-5',
        label: 'Claude Sonnet 4.5',
        vendor: 'Anthropic',
        family: 'Claude',
        abilities: ['text', 'code', 'reasoning'],
        keywords: ['claude sonnet 4.5', 'claude-sonnet-4-5', 'sonnet 4.5', 'claude 4.5'],
    },
    {
        id: 'claude-opus-4-1',
        label: 'Claude Opus 4.1',
        vendor: 'Anthropic',
        family: 'Claude',
        abilities: ['text', 'code', 'reasoning'],
        keywords: ['claude opus 4.1', 'claude-opus-4-1', 'opus 4.1'],
    },
    {
        id: 'claude-3-7-sonnet',
        label: 'Claude 3.7 Sonnet',
        vendor: 'Anthropic',
        family: 'Claude',
        abilities: ['text', 'code'],
        keywords: ['claude 3.7', 'claude-3-7-sonnet', 'claude 3.5 sonnet', 'claude-3.5-sonnet'],
    },
    {
        id: 'gpt-5',
        label: 'GPT-5',
        vendor: 'OpenAI',
        family: 'GPT',
        abilities: ['text', 'code', 'reasoning'],
        keywords: ['gpt-5', 'gpt5', 'gpt 5'],
    },
    {
        id: 'gpt-4-1',
        label: 'GPT-4.1',
        vendor: 'OpenAI',
        family: 'GPT',
        abilities: ['text', 'code'],
        keywords: ['gpt-4.1', 'gpt 4.1', 'gpt-4-1'],
    },
    {
        id: 'gpt-4o',
        label: 'GPT-4o',
        vendor: 'OpenAI',
        family: 'GPT',
        abilities: ['text', 'code', 'audio'],
        keywords: ['gpt-4o', 'gpt4o', 'gpt 4o'],
    },
    {
        id: 'gemini-2-5-pro',
        label: 'Gemini 2.5 Pro',
        vendor: 'Google',
        family: 'Gemini',
        abilities: ['text', 'code', 'reasoning'],
        keywords: ['gemini 2.5 pro', 'gemini-2.5-pro', 'gemini 2.5'],
    },
    {
        id: 'gemini-2-5-flash',
        label: 'Gemini 2.5 Flash',
        vendor: 'Google',
        family: 'Gemini',
        abilities: ['text', 'code'],
        keywords: ['gemini 2.5 flash', 'gemini flash', 'gemini-2.5-flash'],
    },
    {
        id: 'veo-3',
        label: 'Veo 3',
        vendor: 'Google',
        family: 'Veo',
        abilities: ['video'],
        keywords: ['veo 3', 'veo-3', 'veo3'],
    },
    {
        id: 'llama-3-3-70b',
        label: 'Llama 3.3 70B',
        vendor: 'Meta',
        family: 'Llama',
        abilities: ['text', 'code'],
        keywords: ['llama 3.3', 'llama-3.3', 'llama 3.3 70b', 'llama3.3'],
    },
    {
        id: 'llama-4',
        label: 'Llama 4',
        vendor: 'Meta',
        family: 'Llama',
        abilities: ['text', 'code'],
        keywords: ['llama 4', 'llama-4', 'llama4'],
    },
    {
        id: 'deepseek-r1',
        label: 'DeepSeek R1',
        vendor: 'DeepSeek',
        family: 'DeepSeek',
        abilities: ['reasoning', 'text'],
        keywords: ['deepseek r1', 'deepseek-r1', 'deepseek reasoning'],
    },
    {
        id: 'deepseek-v3',
        label: 'DeepSeek V3',
        vendor: 'DeepSeek',
        family: 'DeepSeek',
        abilities: ['text', 'code'],
        keywords: ['deepseek v3', 'deepseek-v3', 'deepseek'],
    },
    {
        id: 'qwen3',
        label: 'Qwen3',
        vendor: 'Alibaba',
        family: 'Qwen',
        abilities: ['text', 'code'],
        keywords: ['qwen3', 'qwen 3', 'qwen-3'],
    },
    {
        id: 'qwen2-5-coder',
        label: 'Qwen2.5 Coder',
        vendor: 'Alibaba',
        family: 'Qwen',
        abilities: ['code'],
        keywords: ['qwen2.5 coder', 'qwen coder', 'qwen2.5-coder'],
    },
    {
        id: 'grok-4',
        label: 'Grok 4',
        vendor: 'xAI',
        family: 'Grok',
        abilities: ['text', 'reasoning'],
        keywords: ['grok 4', 'grok-4', 'grok4'],
    },
    {
        id: 'mistral-large',
        label: 'Mistral Large',
        vendor: 'Mistral',
        family: 'Mistral',
        abilities: ['text', 'code'],
        keywords: ['mistral large', 'mistral-large', 'mistral'],
    },
    {
        id: 'codestral',
        label: 'Codestral',
        vendor: 'Mistral',
        family: 'Mistral',
        abilities: ['code'],
        keywords: ['codestral'],
    },
    {
        id: 'flux-1',
        label: 'FLUX.1',
        vendor: 'Black Forest Labs',
        family: 'FLUX',
        abilities: ['image'],
        keywords: ['flux.1', 'flux 1', 'flux schnell', 'flux-1', 'flux'],
    },
    {
        id: 'sdxl',
        label: 'Stable Diffusion XL',
        vendor: 'Stability AI',
        family: 'Stable Diffusion',
        abilities: ['image'],
        keywords: ['sdxl', 'stable diffusion xl', 'stable diffusion'],
    },
    {
        id: 'midjourney',
        label: 'Midjourney',
        vendor: 'Midjourney',
        family: 'Midjourney',
        abilities: ['image'],
        keywords: ['midjourney'],
    },
    {
        id: 'sora',
        label: 'Sora',
        vendor: 'OpenAI',
        family: 'Sora',
        abilities: ['video'],
        keywords: ['sora'],
    },
    {
        id: 'elevenlabs',
        label: 'ElevenLabs',
        vendor: 'ElevenLabs',
        family: 'ElevenLabs',
        abilities: ['audio'],
        keywords: ['elevenlabs', 'eleven labs'],
    },
    {
        id: 'suno',
        label: 'Suno',
        vendor: 'Suno',
        family: 'Suno',
        abilities: ['audio'],
        keywords: ['suno'],
    },
    {
        id: 'whisper',
        label: 'Whisper',
        vendor: 'OpenAI',
        family: 'Whisper',
        abilities: ['audio'],
        keywords: ['whisper'],
    },
];

export const AI_TOOLS: AiTool[] = [
    { id: 'cursor', label: 'Cursor', kind: 'editor', keywords: ['cursor'], ai: true },
    { id: 'v0', label: 'v0', kind: 'builder', keywords: ['v0'], ai: true },
    { id: 'lovable', label: 'Lovable', kind: 'builder', keywords: ['lovable'], ai: true },
    { id: 'bolt-new', label: 'bolt.new', kind: 'builder', keywords: ['bolt.new', 'bolt new', 'boltnew'], ai: true },
    { id: 'windsurf', label: 'Windsurf', kind: 'editor', keywords: ['windsurf'], ai: true },
    { id: 'replit', label: 'Replit Agent', kind: 'builder', keywords: ['replit'], ai: true },
    { id: 'claude-code', label: 'Claude Code', kind: 'editor', keywords: ['claude code'], ai: true },
    { id: 'codex-cli', label: 'Codex CLI', kind: 'editor', keywords: ['codex'], ai: true },
    { id: 'github-copilot', label: 'GitHub Copilot', kind: 'editor', keywords: ['github copilot', 'copilot'], ai: true },
    { id: 'aider', label: 'Aider', kind: 'editor', keywords: ['aider'], ai: true },
    { id: 'continue', label: 'Continue', kind: 'editor', keywords: ['continue.dev', 'continue dev'], ai: true },
    { id: 'open-webui', label: 'Open WebUI', kind: 'runtime', keywords: ['open webui', 'open-webui'], ai: true },
    { id: 'openhands', label: 'OpenHands', kind: 'runtime', keywords: ['openhands'], ai: true },
    { id: 'comfyui', label: 'ComfyUI', kind: 'runtime', keywords: ['comfyui', 'comfy ui'], ai: true },
    { id: 'ollama', label: 'Ollama', kind: 'runtime', keywords: ['ollama'], ai: true },
    { id: 'groq', label: 'Groq', kind: 'infra', keywords: ['groq'], ai: true },
    { id: 'openrouter', label: 'OpenRouter', kind: 'infra', keywords: ['openrouter'], ai: true },
    { id: 'supabase', label: 'Supabase', kind: 'infra', keywords: ['supabase'], ai: false },
    { id: 'vercel', label: 'Vercel', kind: 'infra', keywords: ['vercel'], ai: false },
    { id: 'nextjs', label: 'Next.js', kind: 'framework', keywords: ['next.js', 'nextjs', 'next js'], ai: false },
    { id: 'react', label: 'React', kind: 'framework', keywords: ['react'], ai: false },
    { id: 'tailwind', label: 'Tailwind CSS', kind: 'framework', keywords: ['tailwind'], ai: false },
    { id: 'langchain', label: 'LangChain', kind: 'framework', keywords: ['langchain'], ai: true },
    { id: 'llamaindex', label: 'LlamaIndex', kind: 'framework', keywords: ['llamaindex', 'llama index'], ai: true },
    { id: 'streamlit', label: 'Streamlit', kind: 'framework', keywords: ['streamlit'], ai: false },
    { id: 'gradio', label: 'Gradio', kind: 'framework', keywords: ['gradio'], ai: false },
    { id: 'huggingface', label: 'Hugging Face', kind: 'infra', keywords: ['hugging face', 'huggingface'], ai: true },
    { id: 'replicate', label: 'Replicate', kind: 'infra', keywords: ['replicate'], ai: true },
    { id: 'figma', label: 'Figma', kind: 'media', keywords: ['figma'], ai: false },
    { id: 'godot', label: 'Godot', kind: 'framework', keywords: ['godot'], ai: false },
    { id: 'python', label: 'Python', kind: 'framework', keywords: ['python'], ai: false },
    { id: 'typescript', label: 'TypeScript', kind: 'framework', keywords: ['typescript'], ai: false },
];

export const BUILD_CATEGORIES: Array<{
    id: BuildCategory;
    label: string;
    description: string;
    /** lucide-react icon name used by the gallery UI. */
    icon: 'AppWindow' | 'Bot' | 'Wrench' | 'Palette' | 'Microscope' | 'Gamepad2' | 'Boxes';
}> = [
    { id: 'app', label: 'Apps', description: 'Full products: web apps, SaaS, mobile.', icon: 'AppWindow' },
    { id: 'agent', label: 'Agents', description: 'Autonomous workers and workflows.', icon: 'Bot' },
    { id: 'devtool', label: 'Dev tools', description: 'Editors, CLIs, SDKs, infra.', icon: 'Wrench' },
    { id: 'creative', label: 'Creative', description: 'Image, video, audio, and design.', icon: 'Palette' },
    { id: 'research', label: 'Research', description: 'Papers, evals, datasets, demos.', icon: 'Microscope' },
    { id: 'game', label: 'Games', description: 'Playable experiments and worlds.', icon: 'Gamepad2' },
    { id: 'other', label: 'Other', description: 'Everything else that shipped.', icon: 'Boxes' },
];

export const BUILD_PLATFORMS: Array<{ id: BuildPlatform; label: string }> = [
    { id: 'x', label: 'X (Twitter)' },
    { id: 'github', label: 'GitHub' },
    { id: 'huggingface', label: 'Hugging Face' },
    { id: 'product-hunt', label: 'Product Hunt' },
    { id: 'web', label: 'Web' },
];

const MODEL_INDEX = new Map(AI_MODELS.map((model) => [model.id, model]));
const TOOL_INDEX = new Map(AI_TOOLS.map((tool) => [tool.id, tool]));
const CATEGORY_INDEX = new Map(BUILD_CATEGORIES.map((category) => [category.id, category]));
const PLATFORM_INDEX = new Map(BUILD_PLATFORMS.map((platform) => [platform.id, platform]));

export function getModel(id: string): AiModel | undefined {
    return MODEL_INDEX.get(id);
}

export function getTool(id: string): AiTool | undefined {
    return TOOL_INDEX.get(id);
}

export function getCategory(id: BuildCategory) {
    return CATEGORY_INDEX.get(id);
}

export function getPlatform(id: BuildPlatform) {
    return PLATFORM_INDEX.get(id);
}

export function modelLabel(id: string): string {
    return MODEL_INDEX.get(id)?.label || id;
}

export function toolLabel(id: string): string {
    return TOOL_INDEX.get(id)?.label || id;
}

export function modelVendors(): string[] {
    return [...new Set(AI_MODELS.map((model) => model.vendor))].sort((a, b) => a.localeCompare(b));
}

export function vendorOfModel(id: string): string | undefined {
    return MODEL_INDEX.get(id)?.vendor;
}

export function isKnownModel(id: string): boolean {
    return MODEL_INDEX.has(id);
}

export function isKnownTool(id: string): boolean {
    return TOOL_INDEX.has(id);
}

export function isAiTool(id: string): boolean {
    return TOOL_INDEX.get(id)?.ai === true;
}
