// Helper: Google favicon service (free, reliable, no API key needed)
const favicon = (domain: string, size = 128) => `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;

export const aiTools = [
    {
        "id": "1",
        "name": "ChatGPT",
        "description": "OpenAI's flagship chatbot with GPT-5.4 and integrated reasoning. The most widely used AI assistant in the world.",
        "image": favicon("chatgpt.com"),
        "url": "https://chatgpt.com",
        "category": "Chatbot",
        "tags": ["Popular", "Free", "Must-Have"],
        "pricing": "Freemium",
        "featured": true
    },
    {
        "id": "2",
        "name": "Claude",
        "description": "Anthropic's AI assistant with massive context windows, strong coding skills, and the Artifacts feature for live previews.",
        "image": favicon("claude.ai"),
        "url": "https://claude.ai",
        "category": "Chatbot",
        "tags": ["Coding", "Writing", "Popular"],
        "pricing": "Freemium",
        "featured": true
    },
    {
        "id": "3",
        "name": "DeepSeek",
        "description": "Open-source reasoning model rivaling top-tier AIs. Known for R1 reasoning and V3.2 agent capabilities.",
        "image": favicon("deepseek.com"),
        "url": "https://www.deepseek.com",
        "category": "Chatbot",
        "tags": ["Open Source", "Coding", "Reasoning"],
        "pricing": "Free",
        "featured": true
    },
    {
        "id": "4",
        "name": "Perplexity",
        "description": "AI-powered search engine that gives accurate, cited answers. The future of research.",
        "image": favicon("perplexity.ai"),
        "url": "https://www.perplexity.ai",
        "category": "Search",
        "tags": ["Search", "Research", "Popular"],
        "pricing": "Freemium",
        "featured": true
    },
    {
        "id": "5",
        "name": "Gemini",
        "description": "Google's multimodal AI family with Gemini 2.5 Pro and 3.1 Preview. Powers Search, Workspace, and creative tasks.",
        "image": favicon("gemini.google.com"),
        "url": "https://gemini.google.com",
        "category": "Chatbot",
        "tags": ["Google", "Multimodal", "Free"],
        "pricing": "Freemium",
        "featured": true
    },
    {
        "id": "6",
        "name": "Flux.1",
        "description": "Open-source image generation known for incredible prompt adherence and text rendering.",
        "image": favicon("blackforestlabs.ai"),
        "url": "https://blackforestlabs.ai",
        "category": "Image Gen",
        "tags": ["Design", "Open Source", "Quality"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "7",
        "name": "Kling AI",
        "description": "Video generation tool creating long, realistic clips with complex motion and physics.",
        "image": favicon("klingai.com"),
        "url": "https://klingai.com",
        "category": "Video",
        "tags": ["Video", "Trending", "Creative"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "8",
        "name": "Windsurf",
        "description": "Agentic IDE that flows with your coding, predicting your next move. Built on Codeium tech.",
        "image": favicon("windsurf.com"),
        "url": "https://windsurf.com",
        "category": "Coding",
        "tags": ["Dev Tool", "Productivity", "AI"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "9",
        "name": "Hailuo AI",
        "description": "MiniMax's video generator, viral for hyper-realistic human movement and expressions.",
        "image": favicon("hailuoai.video"),
        "url": "https://hailuoai.video",
        "category": "Video",
        "tags": ["Viral", "Free", "Realistic"],
        "pricing": "Free",
        "featured": false
    },
    {
        "id": "10",
        "name": "Bolt.new",
        "description": "Browser-based AI web developer that builds, deploys, and hosts full-stack apps in seconds.",
        "image": favicon("bolt.new"),
        "url": "https://bolt.new",
        "category": "Coding",
        "tags": ["Web Dev", "No-Code", "Fast"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "11",
        "name": "Napkin.ai",
        "description": "Turns text into engaging visual diagrams and charts instantly.",
        "image": favicon("napkin.ai"),
        "url": "https://napkin.ai",
        "category": "Design",
        "tags": ["Productivity", "Visuals", "Diagrams"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "12",
        "name": "NotebookLM",
        "description": "Google's research assistant that turns documents into Audio Overview podcasts and interactive notes.",
        "image": favicon("notebooklm.google.com"),
        "url": "https://notebooklm.google.com",
        "category": "Productivity",
        "tags": ["Research", "Audio", "Free"],
        "pricing": "Free",
        "featured": false
    },
    {
        "id": "13",
        "name": "Cursor",
        "description": "The AI-first code editor. Chat with your codebase, get completions, and refactor with AI.",
        "image": favicon("cursor.com"),
        "url": "https://cursor.com",
        "category": "Coding",
        "tags": ["Popular", "Dev Tool", "IDE"],
        "pricing": "Freemium",
        "featured": true
    },
    {
        "id": "14",
        "name": "Midjourney",
        "description": "The gold standard for artistic AI image generation. V7 with web editor, style controls, and now video generation.",
        "image": favicon("midjourney.com"),
        "url": "https://midjourney.com",
        "category": "Image Gen",
        "tags": ["Art", "Quality", "Paid"],
        "pricing": "Paid",
        "featured": false
    },
    {
        "id": "15",
        "name": "Lovable",
        "description": "AI web app builder focused on beautiful, production-ready applications.",
        "image": favicon("lovable.dev"),
        "url": "https://lovable.dev",
        "category": "Coding",
        "tags": ["Web Dev", "Design", "No-Code"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "16",
        "name": "Suno",
        "description": "Create radio-quality songs with AI vocals and lyrics just by describing the vibe.",
        "image": favicon("suno.com"),
        "url": "https://suno.com",
        "category": "Audio",
        "tags": ["Music", "Fun", "Popular"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "17",
        "name": "Grok",
        "description": "xAI's chatbot with real-time X/Twitter data access, image generation, and unfiltered responses.",
        "image": favicon("grok.com"),
        "url": "https://grok.com",
        "category": "Chatbot",
        "tags": ["Social", "Real-time", "xAI"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "18",
        "name": "Runway",
        "description": "Professional creative suite for AI video generation, favored by filmmakers and artists.",
        "image": favicon("runwayml.com"),
        "url": "https://runwayml.com",
        "category": "Video",
        "tags": ["Professional", "Cinema", "Edit"],
        "pricing": "Paid",
        "featured": false
    },
    {
        "id": "19",
        "name": "Gamma",
        "description": "AI-generated slide decks, documents, and webpages from a simple prompt.",
        "image": favicon("gamma.app"),
        "url": "https://gamma.app",
        "category": "Productivity",
        "tags": ["Presentations", "Design", "Office"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "20",
        "name": "ElevenLabs",
        "description": "The most realistic AI voice generator for dubbing, audiobooks, and content creation.",
        "image": favicon("elevenlabs.io"),
        "url": "https://elevenlabs.io",
        "category": "Audio",
        "tags": ["Voice", "TTS", "Quality"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "21",
        "name": "Genspark",
        "description": "AI-powered search engine and agent for deep research and content creation.",
        "image": favicon("genspark.ai"),
        "url": "https://genspark.ai",
        "category": "Search",
        "tags": ["Search", "Research", "Free"],
        "pricing": "Free",
        "featured": false
    },
    {
        "id": "22",
        "name": "Synthesia",
        "description": "Professional videos with AI avatars speaking 120+ languages. No cameras needed.",
        "image": favicon("synthesia.io"),
        "url": "https://synthesia.io",
        "category": "Video",
        "tags": ["Avatar", "Marketing", "Business"],
        "pricing": "Paid",
        "featured": false
    },
    {
        "id": "23",
        "name": "Copy.ai",
        "description": "GTM platform for generating marketing copy, blog posts, and sales documents.",
        "image": favicon("copy.ai"),
        "url": "https://copy.ai",
        "category": "Productivity",
        "tags": ["Writing", "Marketing", "SEO"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "24",
        "name": "Soundraw",
        "description": "AI music generator with customizable song length and mood for royalty-free tracks.",
        "image": favicon("soundraw.io"),
        "url": "https://soundraw.io",
        "category": "Audio",
        "tags": ["Music", "Royalty Free", "Content"],
        "pricing": "Freemium",
        "featured": false
    },
    {
        "id": "25",
        "name": "Meta AI",
        "description": "Meta's assistant powered by Llama models. Available across WhatsApp, Instagram, and web.",
        "image": favicon("meta.ai"),
        "url": "https://www.meta.ai",
        "category": "Chatbot",
        "tags": ["Social", "Free", "Llama"],
        "pricing": "Free",
        "featured": false
    },
    {
        "id": "tool-200",
        "name": "AI Studio",
        "description": "Google's Gemini API playground. Test prompts, build apps, access latest models free.",
        "url": "https://aistudio.google.com/app/prompts/new_chat",
        "category": "Chatbot",
        "tags": ["Google", "Gemini", "API"],
        "pricing": "Free",
        "image": favicon("aistudio.google.com"),
        "featured": true
    },
    {
        "id": "tool-202",
        "name": "Kimi",
        "description": "Moonshot AI's chatbot with strong reasoning and long-context capabilities.",
        "url": "https://www.kimi.com/",
        "category": "Chatbot",
        "tags": ["Reasoning", "Long Context", "Free"],
        "pricing": "Free",
        "image": favicon("kimi.com"),
        "featured": false
    },
    {
        "id": "tool-203",
        "name": "Microsoft Copilot",
        "description": "Microsoft's AI assistant built into Windows, Edge, and Office 365.",
        "url": "https://copilot.microsoft.com",
        "category": "Chatbot",
        "tags": ["Microsoft", "Productivity", "Free"],
        "pricing": "Free",
        "image": favicon("copilot.microsoft.com"),
        "featured": true
    },
    {
        "id": "tool-204",
        "name": "Qwen",
        "description": "Alibaba's powerful open-source AI with multilingual and coding capabilities.",
        "url": "https://chat.qwen.ai/",
        "category": "Chatbot",
        "tags": ["Alibaba", "Open Source", "Unlimited"],
        "pricing": "Free",
        "image": favicon("qwen.ai"),
        "featured": true
    },
    {
        "id": "tool-206",
        "name": "Mistral",
        "description": "Europe's leading open-source AI lab. Fast, capable models with strong reasoning.",
        "url": "https://chat.mistral.ai",
        "category": "Chatbot",
        "tags": ["Open Source", "European AI", "Fast"],
        "pricing": "Freemium",
        "image": favicon("mistral.ai"),
        "featured": true
    },
    {
        "id": "tool-214",
        "name": "Groq",
        "description": "Ultra-fast AI inference on custom LPU hardware. Blazing fast responses.",
        "url": "https://groq.com/",
        "category": "Chatbot",
        "tags": ["Ultra Fast", "Hardware", "LPU"],
        "pricing": "Free",
        "image": favicon("groq.com"),
        "featured": true
    },
    {
        "id": "tool-216",
        "name": "Pollinations",
        "description": "Access multiple AI models (Gemini, Claude, GPT) with no sign-up required.",
        "url": "https://chat.pollinations.ai/",
        "category": "Chatbot",
        "tags": ["Multi-Model", "No Sign-Up", "Free"],
        "pricing": "Free",
        "image": favicon("pollinations.ai"),
        "featured": false
    },
    {
        "id": "tool-217",
        "name": "Duck AI",
        "description": "Privacy-focused AI chat by DuckDuckGo. Multiple models, no sign-up, no tracking.",
        "url": "https://duck.ai/",
        "category": "Chatbot",
        "tags": ["Privacy", "No Sign-Up", "Free"],
        "pricing": "Free",
        "image": favicon("duckduckgo.com"),
        "featured": false
    },
    {
        "id": "tool-218",
        "name": "NVIDIA NIM",
        "description": "NVIDIA's AI playground with access to multiple frontier models. No sign-up needed.",
        "url": "https://build.nvidia.com/",
        "category": "Chatbot",
        "tags": ["NVIDIA", "Multi-Model", "Enterprise"],
        "pricing": "Free",
        "image": favicon("nvidia.com"),
        "featured": true
    },
    {
        "id": "tool-219",
        "name": "GitHub Copilot",
        "description": "AI pair programmer by GitHub. Code completions, chat, and agent mode in your IDE.",
        "url": "https://github.com/features/copilot",
        "category": "Coding",
        "tags": ["Coding", "GitHub", "IDE"],
        "pricing": "Freemium",
        "image": favicon("github.com"),
        "featured": true
    },
    {
        "id": "tool-220",
        "name": "v0",
        "description": "Vercel's AI that generates React/Next.js UI and full apps from text descriptions. Deploy in one click.",
        "url": "https://v0.app",
        "category": "Coding",
        "tags": ["Web Dev", "UI Generation", "Vercel"],
        "pricing": "Freemium",
        "image": favicon("v0.dev"),
        "featured": true
    },
    {
        "id": "tool-221",
        "name": "Roo Code",
        "description": "AI coding assistant for VS Code with agentic capabilities.",
        "url": "https://roocode.com/",
        "category": "Coding",
        "tags": ["VS Code", "AI", "Agent"],
        "pricing": "Freemium",
        "image": favicon("roocode.com"),
        "featured": false
    },
    {
        "id": "tool-222",
        "name": "Cline",
        "description": "Autonomous AI coding agent for VS Code. Plans, writes, and debugs code for you.",
        "url": "https://cline.bot/",
        "category": "Coding",
        "tags": ["Agent", "VS Code", "Autonomous"],
        "pricing": "Freemium",
        "image": favicon("cline.bot"),
        "featured": false
    },
    {
        "id": "tool-223",
        "name": "Aider",
        "description": "Open-source terminal-based AI coding assistant. Pair program from the command line.",
        "url": "https://aider.chat/",
        "category": "Coding",
        "tags": ["Terminal", "Open Source", "CLI"],
        "pricing": "Free",
        "image": favicon("aider.chat"),
        "featured": false
    },
    {
        "id": "tool-224",
        "name": "Ollama",
        "description": "Run LLMs locally on your machine. Privacy-first, zero cloud dependency.",
        "url": "https://ollama.com/",
        "category": "Self-Hosted",
        "tags": ["Local", "Open Source", "Privacy"],
        "pricing": "Free",
        "image": favicon("ollama.com"),
        "featured": true
    },
    {
        "id": "tool-225",
        "name": "LM Studio",
        "description": "Beautiful desktop app for downloading and running local LLMs with an intuitive GUI.",
        "url": "https://lmstudio.ai/",
        "category": "Self-Hosted",
        "tags": ["Local", "Desktop", "GUI"],
        "pricing": "Free",
        "image": favicon("lmstudio.ai"),
        "featured": false
    },
    {
        "id": "tool-226",
        "name": "Open WebUI",
        "description": "Self-hosted ChatGPT-style interface for local LLMs. Beautiful and extensible.",
        "url": "https://openwebui.com/",
        "category": "Self-Hosted",
        "tags": ["Self-Hosted", "Open Source", "Interface"],
        "pricing": "Free",
        "image": favicon("openwebui.com"),
        "featured": false
    },
    {
        "id": "tool-227",
        "name": "Sora",
        "description": "OpenAI's video generation platform and social app. Create and share stunning AI videos from text prompts.",
        "url": "https://sora.com/",
        "category": "Video",
        "tags": ["Video", "OpenAI", "Creative"],
        "pricing": "Freemium",
        "image": favicon("openai.com"),
        "featured": true
    },
    {
        "id": "tool-231",
        "name": "Recraft",
        "description": "AI image generator with vector, icon, and illustration modes. Great for designers.",
        "url": "https://www.recraft.ai/",
        "category": "Image Gen",
        "tags": ["Image", "Design", "Vector"],
        "pricing": "Freemium",
        "image": favicon("recraft.ai"),
        "featured": false
    },
    {
        "id": "tool-232",
        "name": "ImageFX",
        "description": "Google's Imagen-powered image generator. Unlimited, free, high quality.",
        "url": "https://labs.google/fx/tools/image-fx",
        "category": "Image Gen",
        "tags": ["Google", "Free", "Unlimited"],
        "pricing": "Free",
        "image": favicon("labs.google"),
        "featured": true
    },
    {
        "id": "tool-233",
        "name": "Perchance",
        "description": "Unlimited AI image generation with no sign-up required. Community-driven.",
        "url": "https://perchance.org/ai-photo-generator",
        "category": "Image Gen",
        "tags": ["Unlimited", "No Sign-Up", "Free"],
        "pricing": "Free",
        "image": favicon("perchance.org"),
        "featured": false
    },
    {
        "id": "tool-234",
        "name": "Civitai",
        "description": "The largest hub for Stable Diffusion models, LoRAs, and community creations.",
        "url": "https://civitai.com/",
        "category": "Image Gen",
        "tags": ["Models", "Community", "SD"],
        "pricing": "Freemium",
        "image": favicon("civitai.com"),
        "featured": false
    },
    {
        "id": "tool-236",
        "name": "MusicFX",
        "description": "Google's free AI music generator. Create tracks by describing the vibe.",
        "url": "https://labs.google/fx/tools/music-fx",
        "category": "Audio",
        "tags": ["Music", "Google", "Free"],
        "pricing": "Free",
        "image": favicon("labs.google"),
        "featured": false
    },
    {
        "id": "tool-237",
        "name": "Udio",
        "description": "AI music generation with studio-quality output and genre flexibility.",
        "url": "https://www.udio.com/",
        "category": "Audio",
        "tags": ["Music", "Creative", "Quality"],
        "pricing": "Freemium",
        "image": favicon("udio.com"),
        "featured": false
    },
    {
        "id": "tool-240",
        "name": "SciSpace",
        "description": "AI research assistant for reading, understanding, and summarizing academic papers.",
        "url": "https://scispace.com/",
        "category": "Research",
        "tags": ["Research", "Academic", "Papers"],
        "pricing": "Freemium",
        "image": favicon("scispace.com"),
        "featured": false
    },
    {
        "id": "tool-241",
        "name": "Elicit",
        "description": "AI research workflow tool for finding and synthesizing academic literature.",
        "url": "https://elicit.com/",
        "category": "Research",
        "tags": ["Research", "Papers", "Academic"],
        "pricing": "Freemium",
        "image": favicon("elicit.com"),
        "featured": false
    },
    {
        "id": "tool-242",
        "name": "Google Labs",
        "description": "Google's hub for experimental AI tools — ImageFX, MusicFX, and more.",
        "url": "https://labs.google/",
        "category": "Directory",
        "tags": ["Google", "Experiments", "Beta"],
        "pricing": "Free",
        "image": favicon("labs.google"),
        "featured": false
    },
    {
        "id": "tool-243",
        "name": "FutureTools",
        "description": "The biggest AI tools directory. Filter by category, pricing, and use case.",
        "url": "https://www.futuretools.io/?pricing-model=free",
        "category": "Directory",
        "tags": ["Directory", "Free", "Tools"],
        "pricing": "Free",
        "image": favicon("futuretools.io"),
        "featured": false
    },
    {
        "id": "tool-244",
        "name": "WebSim",
        "description": "AI-powered website and app builder. Create interactive experiences from prompts.",
        "url": "https://websim.com/",
        "category": "Creative",
        "tags": ["Web", "Creative", "No-Code"],
        "pricing": "Free",
        "image": favicon("websim.com"),
        "featured": false
    },
    {
        "id": "tool-245",
        "name": "Prompt Engineering Guide",
        "description": "Comprehensive guide to prompting techniques for all major AI models.",
        "url": "https://www.promptingguide.ai",
        "category": "Education",
        "tags": ["Education", "Prompting", "Guide"],
        "pricing": "Free",
        "image": favicon("promptingguide.ai"),
        "featured": false
    },
    {
        "id": "tool-246",
        "name": "Hugging Face",
        "description": "The central hub for open-source AI — host models, datasets, and Spaces. The GitHub of machine learning.",
        "url": "https://huggingface.co",
        "category": "Research",
        "tags": ["Open-Source", "Models", "Hub"],
        "pricing": "Freemium",
        "image": favicon("huggingface.co"),
        "featured": true
    },
    {
        "id": "tool-247",
        "name": "Ideogram",
        "description": "AI image generator with best-in-class text rendering inside images. Excellent for logos, posters, and typography.",
        "url": "https://ideogram.ai",
        "category": "Image Gen",
        "tags": ["Text-in-Image", "Design", "Free"],
        "pricing": "Freemium",
        "image": favicon("ideogram.ai"),
        "featured": false
    },
    {
        "id": "tool-248",
        "name": "Adobe Firefly",
        "description": "Adobe's generative AI for image creation, editing, and vector graphics. Commercially safe, integrated with Creative Cloud.",
        "url": "https://firefly.adobe.com",
        "category": "Image Gen",
        "tags": ["Enterprise", "Creative", "Commercial"],
        "pricing": "Freemium",
        "image": favicon("firefly.adobe.com"),
        "featured": false
    },
    {
        "id": "tool-249",
        "name": "Pika",
        "description": "AI video generation and editing platform. Create and modify videos from text, images, or existing clips.",
        "url": "https://pika.art",
        "category": "Video",
        "tags": ["Video-Gen", "Creative", "Easy"],
        "pricing": "Freemium",
        "image": favicon("pika.art"),
        "featured": false
    },
    {
        "id": "tool-250",
        "name": "Luma Dream Machine",
        "description": "High-quality video generation from text and images by Luma AI. Known for realistic motion and cinematic output.",
        "url": "https://lumalabs.ai",
        "category": "Video",
        "tags": ["Video-Gen", "3D", "Cinematic"],
        "pricing": "Freemium",
        "image": favicon("lumalabs.ai"),
        "featured": false
    },
    {
        "id": "tool-251",
        "name": "Leonardo.ai",
        "description": "AI art generator with fine-tuned models, real-time canvas, and powerful image editing tools.",
        "url": "https://leonardo.ai",
        "category": "Image Gen",
        "tags": ["Art", "Models", "Canvas"],
        "pricing": "Freemium",
        "image": favicon("leonardo.ai"),
        "featured": false
    },
    {
        "id": "tool-252",
        "name": "Google Veo",
        "description": "Google DeepMind's video generation model. Creates high-quality, cinematic video from text prompts.",
        "url": "https://deepmind.google/technologies/veo/",
        "category": "Video",
        "tags": ["Google", "Video-Gen", "Research"],
        "pricing": "Free",
        "image": favicon("deepmind.google"),
        "featured": false
    },
    {
        "id": "tool-253",
        "name": "Claude Code",
        "description": "Anthropic's agentic coding CLI. Reads/writes files, runs commands, searches codebases, and manages git — all from your terminal.",
        "url": "https://docs.anthropic.com/en/docs/claude-code",
        "category": "Coding",
        "tags": ["CLI", "Agentic", "Anthropic"],
        "pricing": "Paid",
        "image": favicon("anthropic.com"),
        "featured": true
    },
    {
        "id": "tool-254",
        "name": "Replit Agent",
        "description": "AI coding agent in the cloud. Build full apps from prompts, deploy instantly, and manage databases — all in your browser.",
        "url": "https://replit.com",
        "category": "Coding",
        "tags": ["Cloud IDE", "Deployment", "Beginner"],
        "pricing": "Freemium",
        "image": favicon("replit.com"),
        "featured": false
    }
];

export const resources = [
    {
        id: "1",
        title: "Hitesh Choudhury",
        description: "High-quality tech education in Hindi & English. Covers everything from JS to DevOps.",
        type: "YouTube Channel",
        link: "https://www.youtube.com/c/HiteshChoudhurydotcom",
        image: "https://ui-avatars.com/api/?name=Hitesh+Choudhury&background=random&size=128"
    },
    {
        id: "2",
        title: "CodeWithHarry",
        description: "Legendary coding tutorials in Hindi for beginners. Best for Python, C++, and Web Dev.",
        type: "YouTube Channel",
        link: "https://www.youtube.com/c/CodeWithHarry",
        image: "https://ui-avatars.com/api/?name=CodeWithHarry&background=random&size=128"
    },
    {
        id: "3",
        title: "Apna College",
        description: "Placement preparation and coding courses. Great for DSA and Interview Prep.",
        type: "YouTube Channel",
        link: "https://www.youtube.com/c/ApnaCollege",
        image: "https://ui-avatars.com/api/?name=Apna+College&background=random&size=128"
    },
    {
        id: "4",
        title: "Striver (Take U Forward)",
        description: "The ultimate DSA and Interview preparation masterclass. SDE Sheet is a must.",
        type: "YouTube Channel",
        link: "https://www.youtube.com/c/takeUforward",
        image: "https://ui-avatars.com/api/?name=Striver&background=random&size=128"
    },
    {
        id: "5",
        title: "CS50 by Harvard",
        description: "Introduction to Computer Science. The gold standard for understanding how computers work.",
        type: "Course",
        link: "https://pll.harvard.edu/course/cs50-introduction-computer-science",
        image: "https://ui-avatars.com/api/?name=CS50&background=a51c30&color=fff&size=128"
    },
    {
        id: "6",
        title: "Full Stack Open",
        description: "Deep dive into modern web development (React, Node, GraphQL, TypeScript).",
        type: "Course",
        link: "https://fullstackopen.com/en/",
        image: "https://ui-avatars.com/api/?name=FullStackOpen&background=000&color=fff&size=128"
    },
    {
        id: "7",
        title: "Roadmap.sh",
        description: "Interactive roadmaps for developers. Step-by-step guides for every role.",
        type: "Guide",
        link: "https://roadmap.sh",
        image: "https://ui-avatars.com/api/?name=Roadmap.sh&background=000&color=fff&size=128"
    },
    {
        id: "8",
        title: "FreeCodeCamp",
        description: "Learn to code for free. Build projects. Earn certifications. A massive open source community.",
        type: "Platform",
        link: "https://www.freecodecamp.org",
        image: "https://ui-avatars.com/api/?name=FreeCodeCamp&background=0a0a23&color=fff&size=128"
    },
    {
        id: "9",
        title: "Prompt Engineering Guide",
        description: "Master the art of talking to AI models. Comprehensive strategies and examples.",
        type: "Guide",
        link: "https://www.promptingguide.ai",
        image: "https://ui-avatars.com/api/?name=Prompt+Eng&background=random&size=128"
    },
    {
        id: "10",
        title: "Coursera",
        description: "Degrees and certificates from top universities like Stanford, Yale, and companies like Google.",
        type: "Platform",
        link: "https://www.coursera.org",
        image: "https://ui-avatars.com/api/?name=Coursera&background=0056d2&color=fff&size=128"
    },
    {
        id: "11",
        title: "edX",
        description: "Access 2500+ online courses from 140 top institutions including Harvard and MIT.",
        type: "Platform",
        link: "https://www.edx.org",
        image: "https://ui-avatars.com/api/?name=edX&background=b91c1c&color=fff&size=128"
    },
    {
        id: "12",
        title: "Khan Academy",
        description: "Free world-class education for anyone, anywhere. Math, Science, Computing.",
        type: "Platform",
        link: "https://www.khanacademy.org",
        image: "https://ui-avatars.com/api/?name=Khan+Academy&background=14b8a6&color=fff&size=128"
    },
    {
        id: "13",
        title: "Amrit WT",
        description: "Philosophy, design, and life lessons. A blog about thinking clearly.",
        type: "Blog",
        link: "https://amritwt.me/blog/things-i-believe",
        image: "https://ui-avatars.com/api/?name=Amrit+WT&background=000&color=fff&size=128"
    },
    {
        id: "14",
        title: "OSSU Computer Science",
        description: "Path to a free self-taught education in Computer Science. A complete curriculum.",
        type: "Curriculum",
        link: "https://github.com/ossu/computer-science",
        image: "https://ui-avatars.com/api/?name=OSSU&background=000&color=fff&size=128"
    },
    {
        id: "15",
        title: "MIT OpenCourseWare",
        description: "Free lecture notes, exams, and videos from MIT. No registration required.",
        type: "Platform",
        link: "https://ocw.mit.edu/",
        image: "https://ui-avatars.com/api/?name=MIT+OCW&background=a31f34&color=fff&size=128"
    },
    {
        id: "16",
        title: "The Feynman Lectures",
        description: "The most popular physics book ever written. Read online for free.",
        type: "Book",
        link: "https://www.feynmanlectures.caltech.edu/",
        image: "https://ui-avatars.com/api/?name=Feynman&background=random&size=128"
    },
    {
        id: "17",
        title: "Paul Graham Essays",
        description: "Thoughts on startups, life, and programming from the founder of Y Combinator.",
        type: "Blog",
        link: "https://paulgraham.com/articles.html",
        image: "https://ui-avatars.com/api/?name=Paul+Graham&background=f97316&color=fff&size=128"
    },
    {
        id: "18",
        title: "Sam Altman",
        description: "How to be successful, idea generation, and startups. Insights from OpenAI CEO.",
        type: "Blog",
        link: "https://blog.samaltman.com/how-to-be-successful",
        image: "https://ui-avatars.com/api/?name=Sam+Altman&background=000&color=fff&size=128"
    },
    {
        id: "19",
        title: "Naval Ravikant",
        description: "Wealth, happiness, and philosophy. The Almanack of Naval Ravikant.",
        type: "Blog",
        link: "https://nav.al/rich",
        image: "https://ui-avatars.com/api/?name=Naval&background=000&color=fff&size=128"
    },
    {
        id: "20",
        title: "Anna's Archive",
        description: "The largest open-source open-data library. Search engines for shadow libraries.",
        type: "Platform",
        link: "https://annas-archive.org/",
        image: "https://ui-avatars.com/api/?name=Anna's+Archive&background=random&size=128"
    },
    {
        id: "21",
        title: "Vedabase",
        description: "Authentic Vedic literature and wisdom. Bhagavad Gita, Srimad Bhagavatam.",
        type: "Platform",
        link: "https://vedabase.io/en/",
        image: "https://ui-avatars.com/api/?name=Vedabase&background=f59e0b&color=fff&size=128"
    },
    {
        id: "22",
        title: "Susan Rigetti",
        description: "Self-learning guides for Physics, Math, and Philosophy. So You Want to Learn Physics...",
        type: "Guide",
        link: "https://www.susanrigetti.com/physics",
        image: "https://ui-avatars.com/api/?name=Susan+Rigetti&background=random&size=128"
    },
    {
        id: "23",
        title: "Theoretical Minimum",
        description: "Leonard Susskind's courses on modern physics. What you need to know to start doing physics.",
        type: "Course",
        link: "https://theoreticalminimum.com/",
        image: "https://ui-avatars.com/api/?name=Theoretical+Min&background=000&color=fff&size=128"
    },
    {
        id: "24",
        title: "Rundown AI",
        description: "The most popular AI tools directory. Daily updates on the latest AI news.",
        type: "Directory",
        link: "https://www.rundown.ai/tools?category=Most+Popular",
        image: "https://ui-avatars.com/api/?name=Rundown&background=000&color=fff&size=128"
    },
    {
        id: "25",
        title: "AI Tools Spreadsheet",
        description: "Comprehensive list of AI tools. A community-maintained database.",
        type: "Directory",
        link: "https://docs.google.com/spreadsheets/d/1zi5F5YvOm7CUV6xUFYIcshaYXotXwqZmRIK4ugA8W6o/edit?usp=sharing",
        image: "https://ui-avatars.com/api/?name=AI+Sheet&background=10b981&color=fff&size=128"
    },
    {
        id: "26",
        title: "Refactoring.guru",
        description: "Interactive course on Design Patterns and Refactoring.",
        type: "Guide",
        link: "https://refactoring.guru",
        image: "https://ui-avatars.com/api/?name=Refactoring&background=f43f5e&color=fff&size=128"
    },
    {
        id: "27",
        title: "System Design Primer",
        description: "Learn how to design large-scale systems. The ultimate guide.",
        type: "Guide",
        link: "https://github.com/donnemartin/system-design-primer",
        image: "https://ui-avatars.com/api/?name=System+Design&background=000&color=fff&size=128"
    },
    {
        id: "28",
        title: "MDN Web Docs",
        description: "Resources for developers, by developers. The official documentation for the web.",
        type: "Platform",
        link: "https://developer.mozilla.org",
        image: "https://ui-avatars.com/api/?name=MDN&background=000&color=fff&size=128"
    },
    {
        id: "29",
        title: "React Documentation",
        description: "The library for web and native user interfaces. Learn React the right way.",
        type: "Guide",
        link: "https://react.dev",
        image: "https://ui-avatars.com/api/?name=React&background=61dafb&color=000&size=128"
    },
    {
        "id": "res-101",
        "title": "Tech Interview Cheatsheet",
        "description": "Comprehensive cheatsheet covering data structures, algorithms, and system design concepts in Hindi and English.",
        "type": "Guide",
        "link": "https://github.com/jwasham/coding-interview-university",
        "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
    },
    {
        "id": "res-102",
        "title": "Developer Roadmap 2025",
        "description": "Updated roadmap for frontend, backend, and devops developers with resources available in Hindi and English.",
        "type": "Guide",
        "link": "https://roadmap.sh",
        "image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
    },
    {
        "id": "res-103",
        "title": "CodeNewbie Community",
        "description": "A welcoming community for beginners in programming with active discussions and mentorship support.",
        "type": "Community",
        "link": "https://www.codenewbie.org",
        "image": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91"
    },
    {
        "id": "res-104",
        "title": "FreeCodeCamp Hindi",
        "description": "FreeCodeCamp's official Hindi YouTube channel with tutorials on web development, data structures, and more.",
        "type": "Platform",
        "link": "https://www.youtube.com/c/FreeCodeCampHindi",
        "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c"
    },
    {
        "id": "res-105",
        "title": "JavaScript Info",
        "description": "A comprehensive and detailed guide to JavaScript available in English with simple explanations.",
        "type": "Guide",
        "link": "https://javascript.info",
        "image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
    },
    {
        "id": "res-106",
        "title": "Tech Career Growth Community",
        "description": "Hindi/English tech community focused on career advice, job referrals, and skill building.",
        "type": "Community",
        "link": "https://www.reddit.com/r/cscareerquestions/",
        "image": "https://images.unsplash.com/photo-1551434678-e076c223a692"
    },
    {
        "id": "res-107",
        "title": "GitHub Skills",
        "description": "Interactive tutorials on Git, GitHub workflows, and open source contributions. The successor to GitHub Learning Lab.",
        "type": "Platform",
        "link": "https://skills.github.com",
        "image": "https://images.unsplash.com/photo-1517433456452-f9633a875f6f"
    },
    {
        "id": "res-108",
        "title": "Data Structures Chart",
        "description": "Visual cheatsheet of common data structures and algorithms for quick reference in English.",
        "type": "Guide",
        "link": "https://leetcode.com/discuss/general-discussion/460599/Data-Structure-Algorithm-Cheat-Sheet",
        "image": "https://images.unsplash.com/photo-1508385082359-f2f7a4ec2d05"
    },
    {
        "id": "res-109",
        "title": "Geeky Shows YouTube Channel",
        "description": "Popular Hindi tech channel for programming tutorials, interview prep, and project ideas.",
        "type": "Platform",
        "link": "https://www.youtube.com/c/GeekyShows",
        "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
    },
    {
        "id": "res-110",
        "title": "Stack Overflow Tech Community",
        "description": "Global programming Q&A platform with active tech communities for multiple languages including English support.",
        "type": "Community",
        "link": "https://stackoverflow.com",
        "image": "https://images.unsplash.com/photo-1517430816045-df4b7de76eec"
    }
];
