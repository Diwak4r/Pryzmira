import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

const POSTGRES_CONNECTION_STRING =
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
const LOCAL_STORE_PATH = path.join(process.cwd(), 'data', 'waitlist-store.json');

export interface WaitlistEntry {
    id: string;
    email: string;
    name: string | null;
    position: number;
    referralCode: string;
    referredBy: string | null;
    joinedAt: string;
    status: 'waiting' | 'invited' | 'converted';
}

interface WaitlistSnapshot {
    entries: WaitlistEntry[];
    updatedAt: string;
}

declare global {
    var __pryzmiraWaitlistPool: Pool | undefined;
    var __pryzmiraWaitlistSchemaPromise: Promise<void> | undefined;
}

function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

function isPostgresConfigured(): boolean {
    return Boolean(POSTGRES_CONNECTION_STRING);
}

function createConfigurationError(): Error {
    return new Error('Waitlist persistence is not configured. Add POSTGRES_URL.');
}

function getPool(): Pool {
    if (!POSTGRES_CONNECTION_STRING) {
        throw createConfigurationError();
    }

    if (!globalThis.__pryzmiraWaitlistPool) {
        globalThis.__pryzmiraWaitlistPool = new Pool({
            connectionString: POSTGRES_CONNECTION_STRING,
            max: 1,
            ssl: {
                rejectUnauthorized: false,
            },
        });
    }

    return globalThis.__pryzmiraWaitlistPool;
}

async function ensureSchema(): Promise<void> {
    if (!globalThis.__pryzmiraWaitlistSchemaPromise) {
        globalThis.__pryzmiraWaitlistSchemaPromise = (async () => {
            const pool = getPool();

            await pool.query(`
                CREATE TABLE IF NOT EXISTS waitlist (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT,
                    position INTEGER NOT NULL,
                    referral_code TEXT UNIQUE NOT NULL,
                    referred_by TEXT,
                    joined_at TIMESTAMPTZ DEFAULT NOW(),
                    status TEXT DEFAULT 'waiting'
                )
            `);

            await pool.query(`
                CREATE INDEX IF NOT EXISTS waitlist_position_idx
                ON waitlist(position ASC)
            `);

            await pool.query(`
                CREATE INDEX IF NOT EXISTS waitlist_referral_code_idx
                ON waitlist(referral_code)
            `);
        })().catch((error) => {
            globalThis.__pryzmiraWaitlistSchemaPromise = undefined;
            throw error;
        });
    }

    await globalThis.__pryzmiraWaitlistSchemaPromise;
}

function createEmptySnapshot(): WaitlistSnapshot {
    return {
        entries: [],
        updatedAt: new Date().toISOString(),
    };
}

async function readLocalSnapshot(): Promise<WaitlistSnapshot> {
    try {
        const raw = await readFile(LOCAL_STORE_PATH, 'utf8');
        if (!raw.trim()) {
            return createEmptySnapshot();
        }
        return JSON.parse(raw);
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (!message.includes('ENOENT')) {
            console.error('[WaitlistStore] Failed to read local snapshot:', error);
        }
        return createEmptySnapshot();
    }
}

async function writeLocalSnapshot(snapshot: WaitlistSnapshot): Promise<void> {
    await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await writeFile(LOCAL_STORE_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
}

async function joinWaitlistLocal(
    email: string,
    name: string | null,
    referredBy: string | null
): Promise<WaitlistEntry> {
    const snapshot = await readLocalSnapshot();
    const existing = snapshot.entries.find((entry) => entry.email === email);

    if (existing) {
        return existing;
    }

    let referralCode = generateReferralCode();
    while (snapshot.entries.some((entry) => entry.referralCode === referralCode)) {
        referralCode = generateReferralCode();
    }

    const position = snapshot.entries.length + 1;
    const newEntry: WaitlistEntry = {
        id: `waitlist_${randomUUID()}`,
        email,
        name,
        position,
        referralCode,
        referredBy,
        joinedAt: new Date().toISOString(),
        status: 'waiting',
    };

    const entries = [...snapshot.entries, newEntry];

    if (referredBy) {
        const referrer = entries.find((entry) => entry.referralCode === referredBy);
        if (referrer && referrer.position > 1) {
            entries.forEach((entry) => {
                if (entry.position === referrer.position - 1) {
                    entry.position += 1;
                }
            });
            referrer.position -= 1;
        }
    }

    await writeLocalSnapshot({
        entries,
        updatedAt: new Date().toISOString(),
    });

    return newEntry;
}

async function getWaitlistPositionLocal(email: string): Promise<WaitlistEntry | null> {
    const snapshot = await readLocalSnapshot();
    return snapshot.entries.find((entry) => entry.email === email) || null;
}

async function getWaitlistCountLocal(): Promise<number> {
    const snapshot = await readLocalSnapshot();
    return snapshot.entries.length;
}

async function getReferralCountLocal(referralCode: string): Promise<number> {
    const snapshot = await readLocalSnapshot();
    return snapshot.entries.filter((entry) => entry.referredBy === referralCode).length;
}

type WaitlistRow = {
    id: string;
    email: string;
    name: string | null;
    position: number;
    referral_code: string;
    referred_by: string | null;
    joined_at: string;
    status: string;
};

function mapWaitlistRow(row: WaitlistRow): WaitlistEntry {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
        position: row.position,
        referralCode: row.referral_code,
        referredBy: row.referred_by,
        joinedAt: row.joined_at,
        status: (row.status as 'waiting' | 'invited' | 'converted') || 'waiting',
    };
}

async function joinWaitlistPostgres(
    email: string,
    name: string | null,
    referredBy: string | null
): Promise<WaitlistEntry> {
    await ensureSchema();
    const pool = getPool();

    const existingResult = await pool.query<WaitlistRow>(
        'SELECT * FROM waitlist WHERE email = $1 LIMIT 1',
        [email]
    );

    if (existingResult.rows[0]) {
        return mapWaitlistRow(existingResult.rows[0]);
    }

    let referralCode = generateReferralCode();
    let codeExists = true;

    while (codeExists) {
        const checkResult = await pool.query(
            'SELECT 1 FROM waitlist WHERE referral_code = $1 LIMIT 1',
            [referralCode]
        );
        if (checkResult.rows.length === 0) {
            codeExists = false;
        } else {
            referralCode = generateReferralCode();
        }
    }

    const countResult = await pool.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM waitlist'
    );
    const position = Number(countResult.rows[0]?.count || '0') + 1;

    const insertResult = await pool.query<WaitlistRow>(
        `INSERT INTO waitlist (id, email, name, position, referral_code, referred_by, joined_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'waiting')
         RETURNING *`,
        [`waitlist_${randomUUID()}`, email, name, position, referralCode, referredBy]
    );

    const newEntry = mapWaitlistRow(insertResult.rows[0]);

    if (referredBy) {
        const referrerResult = await pool.query<WaitlistRow>(
            'SELECT * FROM waitlist WHERE referral_code = $1 LIMIT 1',
            [referredBy]
        );

        if (referrerResult.rows[0] && referrerResult.rows[0].position > 1) {
            const referrer = referrerResult.rows[0];
            await pool.query(
                `UPDATE waitlist
                 SET position = position + 1
                 WHERE position = $1 AND id != $2`,
                [referrer.position - 1, referrer.id]
            );

            await pool.query('UPDATE waitlist SET position = position - 1 WHERE id = $1', [
                referrer.id,
            ]);
        }
    }

    const updatedResult = await pool.query<WaitlistRow>(
        'SELECT * FROM waitlist WHERE id = $1',
        [newEntry.id]
    );

    return mapWaitlistRow(updatedResult.rows[0]);
}

async function getWaitlistPositionPostgres(email: string): Promise<WaitlistEntry | null> {
    await ensureSchema();
    const result = await getPool().query<WaitlistRow>(
        'SELECT * FROM waitlist WHERE email = $1 LIMIT 1',
        [email]
    );

    return result.rows[0] ? mapWaitlistRow(result.rows[0]) : null;
}

async function getWaitlistCountPostgres(): Promise<number> {
    await ensureSchema();
    const result = await getPool().query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM waitlist'
    );
    return Number(result.rows[0]?.count || '0');
}

async function getReferralCountPostgres(referralCode: string): Promise<number> {
    await ensureSchema();
    const result = await getPool().query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM waitlist WHERE referred_by = $1',
        [referralCode]
    );
    return Number(result.rows[0]?.count || '0');
}

export async function joinWaitlist(
    email: string,
    name: string | null,
    referredBy: string | null
): Promise<WaitlistEntry> {
    if (isPostgresConfigured()) {
        return joinWaitlistPostgres(email, name, referredBy);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return joinWaitlistLocal(email, name, referredBy);
}

export async function getWaitlistPosition(email: string): Promise<WaitlistEntry | null> {
    if (isPostgresConfigured()) {
        return getWaitlistPositionPostgres(email);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return getWaitlistPositionLocal(email);
}

export async function getWaitlistCount(): Promise<number> {
    if (isPostgresConfigured()) {
        return getWaitlistCountPostgres();
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return getWaitlistCountLocal();
}

export async function getReferralCount(referralCode: string): Promise<number> {
    if (isPostgresConfigured()) {
        return getReferralCountPostgres(referralCode);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return getReferralCountLocal(referralCode);
}
