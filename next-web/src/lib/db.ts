import { get, put } from '@vercel/blob';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

const STORE_PATHNAME = 'newsletter/subscribers.json';
const LOCAL_STORE_PATH = path.join(process.cwd(), 'data', 'subscribers.json');
const POSTGRES_CONNECTION_STRING =
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

interface SubscriberStore {
    emails: string[];
    updatedAt: string;
}

declare global {
    var __pryzmiraNewsletterPool: Pool | undefined;
    var __pryzmiraNewsletterSchemaPromise: Promise<void> | undefined;
}

export class SubscriberStoreConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SubscriberStoreConfigurationError';
    }
}

export function isSubscriberStoreConfigurationError(
    error: unknown
): error is SubscriberStoreConfigurationError {
    return error instanceof SubscriberStoreConfigurationError;
}

function createEmptyStore(): SubscriberStore {
    return { emails: [], updatedAt: new Date().toISOString() };
}

function normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

function sanitizeStore(value: unknown): SubscriberStore {
    if (!value || typeof value !== 'object' || !('emails' in value)) {
        return createEmptyStore();
    }

    const candidate = value as { emails?: unknown; updatedAt?: unknown };
    const emails = Array.isArray(candidate.emails)
        ? candidate.emails
            .filter((entry): entry is string => typeof entry === 'string')
            .map(normalizeEmail)
            .filter(Boolean)
        : [];

    return {
        emails: Array.from(new Set(emails)),
        updatedAt:
            typeof candidate.updatedAt === 'string'
                ? candidate.updatedAt
                : new Date().toISOString(),
    };
}

function isBlobConfigured(): boolean {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isPostgresConfigured(): boolean {
    return Boolean(POSTGRES_CONNECTION_STRING);
}

function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

function getConfigurationError(): SubscriberStoreConfigurationError {
    return new SubscriberStoreConfigurationError(
        'Newsletter storage is not configured. Add POSTGRES_URL or BLOB_READ_WRITE_TOKEN for production subscriber persistence.'
    );
}

function getPool(): Pool {
    if (!POSTGRES_CONNECTION_STRING) {
        throw getConfigurationError();
    }

    if (!globalThis.__pryzmiraNewsletterPool) {
        globalThis.__pryzmiraNewsletterPool = new Pool({
            connectionString: POSTGRES_CONNECTION_STRING,
            max: 1,
            ssl: {
                rejectUnauthorized: false,
            },
        });

        globalThis.__pryzmiraNewsletterPool.on('error', (error) => {
            console.error('[NewsletterStore] Unexpected Postgres pool error:', error);
        });
    }

    return globalThis.__pryzmiraNewsletterPool;
}

async function ensurePostgresSchema(): Promise<void> {
    if (!globalThis.__pryzmiraNewsletterSchemaPromise) {
        globalThis.__pryzmiraNewsletterSchemaPromise = getPool()
            .query(`
                CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                    email TEXT PRIMARY KEY,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `)
            .then(() => undefined)
            .catch((error) => {
                globalThis.__pryzmiraNewsletterSchemaPromise = undefined;
                throw error;
            });
    }

    await globalThis.__pryzmiraNewsletterSchemaPromise;
}

async function addSubscriberToPostgres(email: string): Promise<{ added: boolean; count: number }> {
    await ensurePostgresSchema();

    const pool = getPool();
    const insertResult = await pool.query(
        `
            INSERT INTO newsletter_subscribers (email)
            VALUES ($1)
            ON CONFLICT (email) DO NOTHING
            RETURNING email
        `,
        [email]
    );

    const countResult = await pool.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM newsletter_subscribers'
    );

    return {
        added: (insertResult.rowCount ?? 0) > 0,
        count: Number(countResult.rows[0]?.count || '0'),
    };
}

async function getSubscribersFromPostgres(): Promise<string[]> {
    await ensurePostgresSchema();

    const result = await getPool().query<{ email: string }>(
        'SELECT email FROM newsletter_subscribers ORDER BY created_at ASC'
    );

    return result.rows.map((row) => normalizeEmail(row.email));
}

async function getSubscriberCountFromPostgres(): Promise<number> {
    await ensurePostgresSchema();

    const result = await getPool().query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM newsletter_subscribers'
    );

    return Number(result.rows[0]?.count || '0');
}

async function readBlobStore(): Promise<SubscriberStore> {
    const result = await get(STORE_PATHNAME, { access: 'private' });
    if (!result || result.statusCode !== 200 || !result.stream) {
        return createEmptyStore();
    }

    const raw = await new Response(result.stream).text();
    if (!raw.trim()) {
        return createEmptyStore();
    }

    return sanitizeStore(JSON.parse(raw));
}

async function writeBlobStore(store: SubscriberStore): Promise<void> {
    await put(STORE_PATHNAME, JSON.stringify(store), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
    });
}

async function readLocalStore(): Promise<SubscriberStore> {
    try {
        const raw = await readFile(LOCAL_STORE_PATH, 'utf8');
        if (!raw.trim()) {
            return createEmptyStore();
        }

        return sanitizeStore(JSON.parse(raw));
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (!message.includes('ENOENT')) {
            console.error('[NewsletterStore] Failed to read local store:', error);
        }

        return createEmptyStore();
    }
}

async function writeLocalStore(store: SubscriberStore): Promise<void> {
    await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await writeFile(LOCAL_STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

async function readFallbackStore(): Promise<SubscriberStore> {
    if (isBlobConfigured()) {
        return readBlobStore();
    }

    if (isProduction()) {
        throw getConfigurationError();
    }

    return readLocalStore();
}

async function writeFallbackStore(store: SubscriberStore): Promise<void> {
    if (isBlobConfigured()) {
        await writeBlobStore(store);
        return;
    }

    if (isProduction()) {
        throw getConfigurationError();
    }

    await writeLocalStore(store);
}

export async function addSubscriber(email: string): Promise<{ added: boolean; count: number }> {
    const normalized = normalizeEmail(email);

    if (isPostgresConfigured()) {
        return addSubscriberToPostgres(normalized);
    }

    const store = await readFallbackStore();
    if (store.emails.includes(normalized)) {
        return { added: false, count: store.emails.length };
    }

    const nextStore: SubscriberStore = {
        emails: [...store.emails, normalized],
        updatedAt: new Date().toISOString(),
    };

    await writeFallbackStore(nextStore);

    return { added: true, count: nextStore.emails.length };
}

export async function getSubscribers(): Promise<string[]> {
    if (isPostgresConfigured()) {
        return getSubscribersFromPostgres();
    }

    return (await readFallbackStore()).emails;
}

export async function getSubscriberCount(): Promise<number> {
    if (isPostgresConfigured()) {
        return getSubscriberCountFromPostgres();
    }

    return (await readFallbackStore()).emails.length;
}
