/* =========================================================================
   PULSE STORE — AI news aggregation and storage
   Supports PostgreSQL with local JSON fallback
   ========================================================================= */

import { Pool } from 'pg';
import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { join } from 'path';

// ==========================================================================
// Types
// ==========================================================================

export interface PulseItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: 'models' | 'tools' | 'business' | 'research' | 'trends';
  publishedAt: Date;
  heat: number; // 0-100 score based on engagement
  tags: string[];
  createdAt: Date;
}

export interface PulseStats {
  total: number;
  last24h: number;
  last7d: number;
  byCategory: Record<string, number>;
}

// ==========================================================================
// Database Configuration
// ==========================================================================

function getDbConfig() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.log('[PulseStore] No POSTGRES_URL found — using JSON fallback');
    return null;
  }

  return {
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

async function getDb(): Promise<Pool | null> {
  const config = getDbConfig();
  if (!config) return null;
  return new Pool(config);
}

// ==========================================================================
// Initialization
// ==========================================================================

export async function initPulseTables(): Promise<void> {
  const db = await getDb();

  if (!db) {
    console.log('[PulseStore] Using JSON fallback — initializing pulse data file');
    await initJsonStorage();
    return;
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pulse_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT,
        url TEXT NOT NULL,
        source VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        published_at TIMESTAMP NOT NULL,
        heat INTEGER DEFAULT 0,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(url)
      )
    `);

    // Index for fast sorting
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_pulse_items_published_at
      ON pulse_items(published_at DESC)
    `);

    // Index for category filtering
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_pulse_items_category
      ON pulse_items(category)
    `);

    console.log('[PulseStore] PostgreSQL pulse tables initialized');
  } catch (error) {
    console.error('[PulseStore] Failed to initialize pulse tables:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// ==========================================================================
// JSON Fallback Storage
// ==========================================================================

const DATA_DIR = join(process.cwd(), 'data');
const PULSE_FILE = join(DATA_DIR, 'pulse-store.json');

interface JsonPulseData {
  items: PulseItem[];
}

interface PulseItemRow {
  id: string | number;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: PulseItem['category'];
  published_at: string | Date;
  heat: number;
  tags: string[] | null;
  created_at: string | Date;
}

async function ensureDataDir(): Promise<void> {
  try {
    await access(DATA_DIR);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function initJsonStorage(): Promise<void> {
  await ensureDataDir();
  try {
    await access(PULSE_FILE);
  } catch {
    await writeFile(PULSE_FILE, JSON.stringify({ items: [] }, null, 2));
  }
}

async function readJsonData(): Promise<JsonPulseData> {
  await ensureDataDir();
  try {
    const content = await readFile(PULSE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { items: [] };
  }
}

async function writeJsonData(data: JsonPulseData): Promise<void> {
  await ensureDataDir();
  await writeFile(PULSE_FILE, JSON.stringify(data, null, 2));
}

// ==========================================================================
// Core Operations
// ==========================================================================

export async function createPulseItem(item: Omit<PulseItem, 'id' | 'createdAt'>): Promise<PulseItem | null> {
  const db = await getDb();

  if (db) {
    try {
      const result = await db.query(
        `INSERT INTO pulse_items (title, summary, url, source, category, published_at, heat, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (url) DO UPDATE SET
           heat = GREATEST(pulse_items.heat, EXCLUDED.heat)
         RETURNING id, title, summary, url, source, category, published_at, heat, tags, created_at`,
        [
          item.title,
          item.summary,
          item.url,
          item.source,
          item.category,
          item.publishedAt,
          item.heat,
          item.tags,
        ]
      );
      await db.end();
      return result.rows.length > 0 ? formatPulseItem(result.rows[0]) : null;
    } catch (error) {
      console.error('[PulseStore] Error creating pulse item:', error);
      await db.end();
      return null;
    }
  }

  // JSON fallback
  const data = await readJsonData();

  // Check for duplicates
  const existingIndex = data.items.findIndex(i => i.url === item.url);
  if (existingIndex !== -1) {
    // Update heat score
    data.items[existingIndex].heat = Math.max(data.items[existingIndex].heat, item.heat);
    await writeJsonData(data);
    return data.items[existingIndex];
  }

  const newItem: PulseItem = {
    ...item,
    id: String(data.items.length + 1),
    createdAt: new Date(),
  };
  data.items.push(newItem);
  await writeJsonData(data);
  return newItem;
}

export async function getPulseItems(options: {
  category?: string;
  limit?: number;
  offset?: number;
  since?: Date;
} = {}): Promise<PulseItem[]> {
  const { category, limit = 50, offset = 0, since } = options;
  const db = await getDb();

  if (db) {
    let query = `
      SELECT id, title, summary, url, source, category, published_at, heat, tags, created_at
      FROM pulse_items
      WHERE 1=1
    `;
    const params: Array<string | number | Date> = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (since) {
      params.push(since);
      query += ` AND published_at > $${params.length}`;
    }

    query += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    await db.end();
    return result.rows.map(formatPulseItem);
  }

  // JSON fallback
  const data = await readJsonData();
  let items = data.items;

  if (category) {
    items = items.filter(i => i.category === category);
  }

  if (since) {
    items = items.filter(i => new Date(i.publishedAt) > since);
  }

  return items
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(offset, offset + limit);
}

export async function getPulseStats(): Promise<PulseStats> {
  const db = await getDb();

  if (db) {
    const result = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE published_at > NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE published_at > NOW() - INTERVAL '7 days') as last_7d,
        category,
        COUNT(*) as cat_count
      FROM pulse_items
      GROUP BY category
    `);
    await db.end();

    const byCategory: Record<string, number> = {};
    result.rows.forEach(row => {
      byCategory[row.category] = parseInt(row.cat_count);
    });

    return {
      total: parseInt(result.rows[0]?.total || 0),
      last24h: parseInt(result.rows[0]?.last_24h || 0),
      last7d: parseInt(result.rows[0]?.last_7d || 0),
      byCategory,
    };
  }

  // JSON fallback
  const data = await readJsonData();
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const byCategory: Record<string, number> = {};
  data.items.forEach(item => {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  });

  return {
    total: data.items.length,
    last24h: data.items.filter(i => new Date(i.publishedAt) > last24h).length,
    last7d: data.items.filter(i => new Date(i.publishedAt) > last7d).length,
    byCategory,
  };
}

export async function deleteOldPulseItems(days: number = 30): Promise<number> {
  const db = await getDb();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  if (db) {
    const result = await db.query(
      'DELETE FROM pulse_items WHERE published_at < $1 RETURNING id',
      [cutoff]
    );
    await db.end();
    return result.rowCount || 0;
  }

  // JSON fallback
  const data = await readJsonData();
  const originalCount = data.items.length;
  data.items = data.items.filter(i => new Date(i.publishedAt) > cutoff);
  await writeJsonData(data);
  return originalCount - data.items.length;
}

// ==========================================================================
// Helper Functions
// ==========================================================================

function formatPulseItem(row: PulseItemRow): PulseItem {
  return {
    id: String(row.id),
    title: row.title,
    summary: row.summary,
    url: row.url,
    source: row.source,
    category: row.category,
    publishedAt: new Date(row.published_at),
    heat: row.heat,
    tags: row.tags || [],
    createdAt: new Date(row.created_at),
  };
}

// Generate a unique ID for URLs
export function generatePulseId(url: string): string {
  // Simple hash of URL for ID
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
