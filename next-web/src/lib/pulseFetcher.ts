/* =========================================================================
   PULSE FETCHER — AI news aggregation via Tavily API
   Scrapes multiple sources for AI developments
   ========================================================================= */

import { createPulseItem, PulseItem } from './pulseStore';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = 'https://api.tavily.com/search';

// High-value AI news sources
const TRUSTED_SOURCES = [
  'openai.com',
  'anthropic.com',
  'deepmind.google',
  'blog.google',
  'ai.meta.com',
  'stability.ai',
  'huggingface.co',
  'arxiv.org',
  'x.com',
  'twitter.com',
  'reddit.com',
  'news.ycombinator.com',
  'techcrunch.com',
  'theverge.com',
  'wired.com',
  'mit.edu',
  'stanford.edu',
  'aaai.org',
  'icml.cc',
  'neurips.cc',
];

// Search queries for different AI news categories
const CATEGORY_QUERIES: Record<string, string[]> = {
  models: [
    'new AI model released GPT Claude Llama',
    'large language model benchmark results',
    'multimodal AI model announcement',
    'AI model API pricing changes',
  ],
  tools: [
    'new AI tool product launch',
    'AI coding assistant Claude Cursor',
    'AI image generator update',
    'AI productivity tool release',
  ],
  business: [
    'AI startup funding round',
    'OpenAI Anthropic funding valuation',
    'AI company acquisition merger',
    'AI regulatory policy news',
  ],
  research: [
    'AI research paper breakthrough',
    'machine learning arxiv preprint',
    'AI safety alignment research',
    'neural network architecture paper',
  ],
  trends: [
    'AI adoption enterprise survey',
    'generative AI usage trends report',
    'AI job market impact analysis',
    'AI compute resources growth',
  ],
};

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
  query: string;
}

// ==========================================================================
// Tavily API Search
// ==========================================================================

async function searchTavily(query: string): Promise<TavilySearchResult[]> {
  if (!TAVILY_API_KEY) {
    console.log('[PulseFetcher] No TAVILY_API_KEY — skipping Tavily search');
    return [];
  }

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        max_results: 10,
        include_answer: false,
        include_raw_content: false,
        include_images: false,
        include_news: true,
        topic: 'news',
        days: 2, // Last 48 hours
        source: TRUSTED_SOURCES.join(','),
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data: TavilyResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('[PulseFetcher] Tavily search error:', error);
    return [];
  }
}

// ==========================================================================
// Content Processing
// ==========================================================================

function generateSummary(content: string, title: string): string {
  // Extract first sentence or truncate content
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 0) {
    const first = sentences[0].trim();
    if (first.length > 100) {
      return first.slice(0, 150) + '...';
    }
    return first + '.';
  }
  return title;
}

function detectSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');

    const sourceMap: Record<string, string> = {
      'openai.com': 'OpenAI',
      'anthropic.com': 'Anthropic',
      'blog.google': 'Google AI',
      'deepmind.google': 'DeepMind',
      'ai.meta.com': 'Meta AI',
      'stability.ai': 'Stability AI',
      'huggingface.co': 'Hugging Face',
      'arxiv.org': 'arXiv',
      'x.com': 'X',
      'twitter.com': 'Twitter',
      'reddit.com': 'Reddit',
      'news.ycombinator.com': 'Hacker News',
      'techcrunch.com': 'TechCrunch',
      'theverge.com': 'The Verge',
      'wired.com': 'Wired',
      'mit.edu': 'MIT',
      'stanford.edu': 'Stanford',
    };

    for (const [domain, source] of Object.entries(sourceMap)) {
      if (hostname.includes(domain)) {
        return source;
      }
    }

    return hostname.split('.')[0];
  } catch {
    return 'Web';
  }
}

function calculateHeat(score: number, published_date?: string): number {
  // Base heat from Tavily relevance score (0-100)
  let heat = Math.round(score * 100);

  // Boost for recent content
  if (published_date) {
    const age = Date.now() - new Date(published_date).getTime();
    const hours = age / (1000 * 60 * 60);

    if (hours < 6) {
      heat += 20; // Breaking news
    } else if (hours < 24) {
      heat += 10; // Recent
    }
  }

  return Math.min(100, Math.max(0, heat));
}

function extractTags(title: string, content: string): string[] {
  const combined = `${title} ${content}`.toLowerCase();
  const tags: string[] = [];

  const tagPatterns: Record<string, string[]> = {
    'gpt-4': ['gpt-4', 'gpt4'],
    'gpt-5': ['gpt-5', 'gpt5'],
    'claude': ['claude 3', 'claude-3', 'claude 4'],
    'llama': ['llama 3', 'llama-3', 'llama 4'],
    'openai': ['openai'],
    'anthropic': ['anthropic'],
    'google': ['gemini', 'google ai'],
    'meta': ['meta ai', 'llama'],
    'mistral': ['mistral'],
    'stability': ['stable diffusion', 'sdxl'],
    'safety': ['ai safety', 'alignment', 'rlhf'],
    'multimodal': ['vision', 'image', 'audio', 'video'],
    'coding': ['code', 'developer', 'copilot', 'cursor'],
    'agents': ['agent', 'autonomous', 'copilot'],
    'api': ['api', 'developer platform'],
  };

  for (const [tag, patterns] of Object.entries(tagPatterns)) {
    if (patterns.some(p => combined.includes(p))) {
      tags.push(tag);
    }
  }

  return tags.slice(0, 5); // Max 5 tags
}

// ==========================================================================
// Category-Specific Fetchers
// ==========================================================================

async function fetchForCategory(category: string): Promise<Partial<PulseItem>[]> {
  const queries = CATEGORY_QUERIES[category] || [category];
  const allResults: Map<string, Partial<PulseItem>> = new Map();

  for (const query of queries) {
    const results = await searchTavily(query);

    for (const result of results) {
      // Skip duplicates
      if (allResults.has(result.url)) continue;

      // Skip low-quality results
      if (result.score < 0.5) continue;

      const pulseItem: Partial<PulseItem> = {
        title: result.title,
        summary: generateSummary(result.content, result.title),
        url: result.url,
        source: detectSource(result.url),
        category: category as PulseItem['category'],
        publishedAt: result.published_date ? new Date(result.published_date) : new Date(),
        heat: calculateHeat(result.score, result.published_date),
        tags: extractTags(result.title, result.content),
      };

      allResults.set(result.url, pulseItem);
    }

    // Small delay between queries
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return Array.from(allResults.values());
}

// ==========================================================================
// Main Fetch Functions
// ==========================================================================

export async function fetchPulseItems(): Promise<{ saved: number; errors: number }> {
  console.log('[PulseFetcher] Starting pulse fetch...');

  let saved = 0;
  let errors = 0;

  for (const category of Object.keys(CATEGORY_QUERIES)) {
    console.log(`[PulseFetcher] Fetching ${category}...`);

    try {
      const items = await fetchForCategory(category);
      console.log(`[PulseFetcher] Found ${items.length} ${category} items`);

      for (const item of items) {
        try {
          const result = await createPulseItem(item as Omit<PulseItem, 'id' | 'createdAt'>);
          if (result) {
            saved++;
            console.log(`[PulseFetcher] Saved: ${item.title?.slice(0, 50)}...`);
          }
        } catch (error) {
          console.error('[PulseFetcher] Error saving item:', error);
          errors++;
        }
      }
    } catch (error) {
      console.error(`[PulseFetcher] Error fetching ${category}:`, error);
      errors++;
    }

    // Delay between categories
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`[PulseFetcher] Complete: ${saved} saved, ${errors} errors`);
  return { saved, errors };
}

export async function fetchPulseItemsForUsers(userGoals: string[]): Promise<PulseItem[]> {
  // Personalized pulse based on user goals
  const relevantItems: Partial<PulseItem>[] = [];

  const goalCategoryMap: Record<string, string[]> = {
    'launch-ai-product': ['tools', 'business', 'research'],
    'improve-workflow': ['tools', 'models', 'trends'],
    'learn-ai': ['research', 'models', 'trends'],
    'build-ai-team': ['business', 'tools', 'trends'],
    'ai-research': ['research', 'models', 'safety'],
    'ai-consulting': ['business', 'tools', 'trends'],
  };

  const categories = new Set<string>();
  for (const goal of userGoals) {
    const goalCats = goalCategoryMap[goal] || ['trends'];
    goalCats.forEach(c => categories.add(c));
  }

  for (const category of categories) {
    try {
      const items = await fetchForCategory(category);
      relevantItems.push(...items);
    } catch (error) {
      console.error(`[PulseFetcher] Error fetching for ${category}:`, error);
    }
  }

  // Sort by relevance and deduplicate
  const unique = new Map<string, Partial<PulseItem>>();
  relevantItems
    .sort((a, b) => (b.heat || 0) - (a.heat || 0))
    .forEach(item => {
      if (!unique.has(item.url!)) {
        unique.set(item.url!, item);
      }
    });

  return Array.from(unique.values()).slice(0, 20) as PulseItem[];
}

// ==========================================================================
// Mock Data for Development
// ==========================================================================

export async function seedMockPulseData(): Promise<void> {
  const mockItems: Omit<PulseItem, 'id' | 'createdAt'>[] = [
    {
      title: 'OpenAI Announces GPT-5 with Multimodal Capabilities',
      summary: 'OpenAI reveals GPT-5, featuring native multimodal understanding and 10x longer context windows. The new model demonstrates significant improvements in reasoning and code generation tasks.',
      url: 'https://openai.com/blog/gpt-5-announcement',
      source: 'OpenAI',
      category: 'models',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      heat: 98,
      tags: ['gpt-5', 'openai', 'multimodal', 'announcement'],
    },
    {
      title: 'Anthropic Releases Claude 3.5 Sonnet with Enhanced Reasoning',
      summary: 'Claude 3.5 Sonnet brings breakthrough performance on complex reasoning tasks while maintaining high efficiency. New features include expanded context windows and improved tool use.',
      url: 'https://anthropic.com/news/claude-3-5-sonnet',
      source: 'Anthropic',
      category: 'models',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      heat: 95,
      tags: ['claude', 'anthropic', 'reasoning', 'tools'],
    },
    {
      title: 'Meta Unveils Llama 3.1: Open Source Model Surpasses GPT-4',
      summary: `Llama 3.1 405B parameter model achieves competitive performance with leading proprietary models while remaining fully open source. Available for commercial use with flexible licensing.`,
      url: 'https://ai.meta.com/blog/llama-3-1/',
      source: 'Meta AI',
      category: 'models',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      heat: 94,
      tags: ['llama', 'meta', 'open-source', '405b'],
    },
    {
      title: 'Stability AI Releases Stable Diffusion 3 with Superior Image Quality',
      summary: 'Stable Diffusion 3 demonstrates significant improvements in text rendering and fine-grained control. New architecture enables faster inference and better resource efficiency.',
      url: 'https://stability.ai/news/stable-diffusion-3',
      source: 'Stability AI',
      category: 'tools',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      heat: 88,
      tags: ['stable-diffusion', 'image-gen', 'stability'],
    },
    {
      title: 'Cursor Raises $100M Series B Led by Thrive Capital',
      summary: 'AI coding assistant Cursor secures major funding round as developer adoption accelerates. The company plans to expand team and build enterprise features.',
      url: 'https://techcrunch.com/cursor-series-b',
      source: 'TechCrunch',
      category: 'business',
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      heat: 85,
      tags: ['cursor', 'funding', 'coding', 'developer-tools'],
    },
    {
      title: 'Google DeepMind Introduces AlphaDev for Code Optimization',
      summary: 'AI system discovers faster sorting algorithms, outperforming decades of human optimization. Results integrated into LLVM standard library.',
      url: 'https://deepmind.google/discover/blog/alphadev/',
      source: 'DeepMind',
      category: 'research',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      heat: 92,
      tags: ['deepmind', 'google', 'alphadev', 'algorithms'],
    },
    {
      title: 'Hugging Face Launches Inference API for 100K+ Models',
      summary: 'Democratizing AI deployment with serverless inference for open source models. New pricing tiers make production deployment more accessible.',
      url: 'https://huggingface.co/blog/inference-api',
      source: 'Hugging Face',
      category: 'tools',
      publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
      heat: 82,
      tags: ['huggingface', 'api', 'deployment', 'open-source'],
    },
    {
      title: 'AI Agents Report: 78% of Enterprises Testing Autonomous Systems',
      summary: 'New survey reveals rapid adoption of AI agents in enterprise workflows. Customer service and coding assistants lead deployment categories.',
      url: 'https://www.aaai.org/enterprise-agents-report',
      source: 'AAAI',
      category: 'trends',
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      heat: 78,
      tags: ['agents', 'enterprise', 'survey', 'trends'],
    },
  ];

  for (const item of mockItems) {
    try {
      await createPulseItem(item);
      console.log(`[PulseFetcher] Seeded: ${item.title.slice(0, 40)}...`);
    } catch (error) {
      console.error('[PulseFetcher] Error seeding:', error);
    }
  }

  console.log('[PulseFetcher] Mock data seeded successfully');
}
