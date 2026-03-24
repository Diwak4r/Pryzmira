import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import {
    type StrategyBriefDeliveryChannel,
    type StrategyBriefRecord,
    type StrategyBriefSendStatus,
    type StrategyLeadOffer,
    type StrategyLeadStatus,
    type StrategyLeadSurface,
    type StrategyPlan,
    type StrategyPremiumLeadInput,
    type StrategyPremiumLeadRecord,
    type StrategyProfileInput,
    type StrategyProfileRecord,
    getStrategyPremiumStage,
    getStrategyWeekKey,
    sanitizeStrategyProfileInput,
} from '@/lib/strategy';

const POSTGRES_CONNECTION_STRING =
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
const LOCAL_STORE_PATH = path.join(process.cwd(), 'data', 'strategy-store.json');

interface StrategyStoreSnapshot {
    briefs: StrategyBriefRecord[];
    premiumLeads: StrategyPremiumLeadRecord[];
    profiles: StrategyProfileRecord[];
    updatedAt: string;
}

interface SaveStrategyBriefOptions {
    deliveryChannel?: StrategyBriefDeliveryChannel;
    emailProviderId?: string | null;
    sendStatus?: StrategyBriefSendStatus;
    sentAt?: string | null;
    weekKey?: string;
}

interface StrategyBriefDeliveryUpdate {
    emailProviderId?: string | null;
    sendStatus: StrategyBriefSendStatus;
    sentAt?: string | null;
}

declare global {
    var __pryzmiraStrategyPool: Pool | undefined;
    var __pryzmiraStrategySchemaPromise: Promise<void> | undefined;
}

function createEmptySnapshot(): StrategyStoreSnapshot {
    return {
        briefs: [],
        premiumLeads: [],
        profiles: [],
        updatedAt: new Date().toISOString(),
    };
}

function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

function isPostgresConfigured(): boolean {
    return Boolean(POSTGRES_CONNECTION_STRING);
}

function createConfigurationError(): Error {
    return new Error(
        'Strategy persistence is not configured. Add POSTGRES_URL for production profile storage.'
    );
}

function getPool(): Pool {
    if (!POSTGRES_CONNECTION_STRING) {
        throw createConfigurationError();
    }

    if (!globalThis.__pryzmiraStrategyPool) {
        globalThis.__pryzmiraStrategyPool = new Pool({
            connectionString: POSTGRES_CONNECTION_STRING,
            max: 1,
            ssl: POSTGRES_CONNECTION_STRING.includes('sslmode=require')
                ? { rejectUnauthorized: false }
                : undefined,
        });
    }

    return globalThis.__pryzmiraStrategyPool;
}

async function ensureSchema(): Promise<void> {
    if (!globalThis.__pryzmiraStrategySchemaPromise) {
        globalThis.__pryzmiraStrategySchemaPromise = (async () => {
            const pool = getPool();

            await pool.query(`
                CREATE TABLE IF NOT EXISTS strategy_profiles (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    full_name TEXT NOT NULL,
                    goal TEXT NOT NULL,
                    experience_level TEXT NOT NULL,
                    weekly_hours INTEGER NOT NULL,
                    monetization_path TEXT NOT NULL,
                    wants_briefs BOOLEAN NOT NULL DEFAULT FALSE,
                    premium_interest BOOLEAN NOT NULL DEFAULT FALSE,
                    premium_stage TEXT NOT NULL DEFAULT 'none',
                    last_brief_sent_at TIMESTAMPTZ NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);

            await pool.query(`
                ALTER TABLE strategy_profiles
                ADD COLUMN IF NOT EXISTS premium_stage TEXT NOT NULL DEFAULT 'none'
            `);
            await pool.query(`
                ALTER TABLE strategy_profiles
                ADD COLUMN IF NOT EXISTS last_brief_sent_at TIMESTAMPTZ NULL
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS strategy_briefs (
                    id TEXT PRIMARY KEY,
                    profile_id TEXT NOT NULL REFERENCES strategy_profiles(id) ON DELETE CASCADE,
                    subject TEXT NOT NULL,
                    preview TEXT NOT NULL,
                    plan JSONB NOT NULL,
                    week_key TEXT NOT NULL DEFAULT '',
                    delivery_channel TEXT NOT NULL DEFAULT 'web',
                    send_status TEXT NOT NULL DEFAULT 'draft',
                    sent_at TIMESTAMPTZ NULL,
                    email_provider_id TEXT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS strategy_premium_leads (
                    id TEXT PRIMARY KEY,
                    profile_id TEXT NOT NULL REFERENCES strategy_profiles(id) ON DELETE CASCADE,
                    email TEXT NOT NULL,
                    surface TEXT NOT NULL,
                    offer TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'new',
                    notes TEXT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);

            await pool.query(`
                ALTER TABLE strategy_briefs
                ADD COLUMN IF NOT EXISTS week_key TEXT NOT NULL DEFAULT ''
            `);
            await pool.query(`
                ALTER TABLE strategy_briefs
                ADD COLUMN IF NOT EXISTS delivery_channel TEXT NOT NULL DEFAULT 'web'
            `);
            await pool.query(`
                ALTER TABLE strategy_briefs
                ADD COLUMN IF NOT EXISTS send_status TEXT NOT NULL DEFAULT 'draft'
            `);
            await pool.query(`
                ALTER TABLE strategy_briefs
                ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ NULL
            `);
            await pool.query(`
                ALTER TABLE strategy_briefs
                ADD COLUMN IF NOT EXISTS email_provider_id TEXT NULL
            `);

            await pool.query(`
                CREATE INDEX IF NOT EXISTS strategy_briefs_profile_created_at_idx
                ON strategy_briefs(profile_id, created_at DESC)
            `);
            await pool.query(`
                CREATE INDEX IF NOT EXISTS strategy_briefs_profile_week_channel_idx
                ON strategy_briefs(profile_id, week_key, delivery_channel)
            `);
            await pool.query(`
                CREATE INDEX IF NOT EXISTS strategy_profiles_wants_briefs_idx
                ON strategy_profiles(wants_briefs, created_at ASC)
            `);
            await pool.query(`
                CREATE INDEX IF NOT EXISTS strategy_premium_leads_profile_offer_idx
                ON strategy_premium_leads(profile_id, offer, created_at DESC)
            `);
        })().catch((error) => {
            globalThis.__pryzmiraStrategySchemaPromise = undefined;
            throw error;
        });
    }

    await globalThis.__pryzmiraStrategySchemaPromise;
}

function sanitizeProfileRecord(value: unknown): StrategyProfileRecord | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const candidate = value as Partial<StrategyProfileRecord>;
    const base = sanitizeStrategyProfileInput(candidate);

    if (!base || typeof candidate.id !== 'string') {
        return null;
    }

    return {
        ...base,
        id: candidate.id,
        lastBriefSentAt:
            typeof candidate.lastBriefSentAt === 'string'
                ? candidate.lastBriefSentAt
                : null,
        premiumStage: getStrategyPremiumStage(
            base.premiumInterest,
            candidate.premiumStage
        ),
        createdAt:
            typeof candidate.createdAt === 'string'
                ? candidate.createdAt
                : new Date().toISOString(),
        updatedAt:
            typeof candidate.updatedAt === 'string'
                ? candidate.updatedAt
                : new Date().toISOString(),
    };
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

function sanitizeLeadStatus(value: unknown): StrategyLeadStatus {
    switch (value) {
        case 'contacted':
        case 'qualified':
        case 'won':
        case 'lost':
            return value;
        default:
            return 'new';
    }
}

function sanitizeBriefRecord(value: unknown): StrategyBriefRecord | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const candidate = value as Partial<StrategyBriefRecord>;

    if (
        typeof candidate.id !== 'string' ||
        typeof candidate.profileId !== 'string' ||
        typeof candidate.subject !== 'string' ||
        typeof candidate.preview !== 'string' ||
        !candidate.plan ||
        typeof candidate.createdAt !== 'string'
    ) {
        return null;
    }

    return {
        id: candidate.id,
        profileId: candidate.profileId,
        subject: candidate.subject,
        preview: candidate.preview,
        plan: candidate.plan as StrategyPlan,
        weekKey:
            typeof candidate.weekKey === 'string'
                ? candidate.weekKey
                : getStrategyWeekKey(),
        deliveryChannel:
            candidate.deliveryChannel === 'email' ? 'email' : 'web',
        sendStatus:
            candidate.sendStatus === 'sent' || candidate.sendStatus === 'failed'
                ? candidate.sendStatus
                : 'draft',
        sentAt: typeof candidate.sentAt === 'string' ? candidate.sentAt : null,
        emailProviderId:
            typeof candidate.emailProviderId === 'string'
                ? candidate.emailProviderId
                : null,
        createdAt: candidate.createdAt,
    };
}

function sanitizePremiumLeadRecord(value: unknown): StrategyPremiumLeadRecord | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const candidate = value as Partial<StrategyPremiumLeadRecord>;
    const surface = sanitizeLeadSurface(candidate.surface);
    const offer = sanitizeLeadOffer(candidate.offer);

    if (
        typeof candidate.id !== 'string' ||
        typeof candidate.profileId !== 'string' ||
        typeof candidate.email !== 'string' ||
        !surface ||
        !offer ||
        typeof candidate.createdAt !== 'string' ||
        typeof candidate.updatedAt !== 'string'
    ) {
        return null;
    }

    return {
        id: candidate.id,
        profileId: candidate.profileId,
        email: candidate.email,
        offer,
        surface,
        status: sanitizeLeadStatus(candidate.status),
        notes: typeof candidate.notes === 'string' ? candidate.notes : null,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
    };
}

function sanitizeSnapshot(value: unknown): StrategyStoreSnapshot {
    if (!value || typeof value !== 'object') {
        return createEmptySnapshot();
    }

    const candidate = value as Partial<StrategyStoreSnapshot>;

    return {
        profiles: Array.isArray(candidate.profiles)
            ? candidate.profiles
                  .map((profile) => sanitizeProfileRecord(profile))
                  .filter((profile): profile is StrategyProfileRecord => profile !== null)
            : [],
        briefs: Array.isArray(candidate.briefs)
            ? candidate.briefs
                  .map((brief) => sanitizeBriefRecord(brief))
                  .filter((brief): brief is StrategyBriefRecord => brief !== null)
            : [],
        premiumLeads: Array.isArray(candidate.premiumLeads)
            ? candidate.premiumLeads
                  .map((lead) => sanitizePremiumLeadRecord(lead))
                  .filter((lead): lead is StrategyPremiumLeadRecord => lead !== null)
            : [],
        updatedAt:
            typeof candidate.updatedAt === 'string'
                ? candidate.updatedAt
                : new Date().toISOString(),
    };
}

async function readLocalSnapshot(): Promise<StrategyStoreSnapshot> {
    try {
        const raw = await readFile(LOCAL_STORE_PATH, 'utf8');
        if (!raw.trim()) {
            return createEmptySnapshot();
        }

        return sanitizeSnapshot(JSON.parse(raw));
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (!message.includes('ENOENT')) {
            console.error('[StrategyStore] Failed to read local snapshot:', error);
        }

        return createEmptySnapshot();
    }
}

async function writeLocalSnapshot(snapshot: StrategyStoreSnapshot): Promise<void> {
    await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await writeFile(LOCAL_STORE_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
}

function buildProfileRecord(
    input: StrategyProfileInput,
    existing?: StrategyProfileRecord | null
): StrategyProfileRecord {
    const timestamp = new Date().toISOString();

    return {
        ...input,
        id: existing?.id ?? `profile_${randomUUID()}`,
        lastBriefSentAt: existing?.lastBriefSentAt ?? null,
        premiumStage: getStrategyPremiumStage(
            input.premiumInterest,
            existing?.premiumStage
        ),
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
    };
}

function buildBriefRecord(
    profileId: string,
    subject: string,
    preview: string,
    plan: StrategyPlan,
    options?: SaveStrategyBriefOptions
): StrategyBriefRecord {
    return {
        id: `brief_${randomUUID()}`,
        profileId,
        subject,
        preview,
        plan,
        weekKey: options?.weekKey ?? getStrategyWeekKey(),
        deliveryChannel: options?.deliveryChannel ?? 'web',
        sendStatus: options?.sendStatus ?? 'draft',
        sentAt: options?.sentAt ?? null,
        emailProviderId: options?.emailProviderId ?? null,
        createdAt: new Date().toISOString(),
    };
}

async function upsertProfileLocal(
    input: StrategyProfileInput
): Promise<StrategyProfileRecord> {
    const snapshot = await readLocalSnapshot();
    const existing = snapshot.profiles.find((profile) => profile.email === input.email) ?? null;
    const nextProfile = buildProfileRecord(input, existing);

    const nextProfiles = [
        nextProfile,
        ...snapshot.profiles.filter((profile) => profile.id !== nextProfile.id),
    ];

    await writeLocalSnapshot({
        ...snapshot,
        profiles: nextProfiles,
        updatedAt: new Date().toISOString(),
    });

    return nextProfile;
}

async function getProfileLocalById(profileId: string): Promise<StrategyProfileRecord | null> {
    const snapshot = await readLocalSnapshot();
    return snapshot.profiles.find((profile) => profile.id === profileId) ?? null;
}

async function getProfileLocalByEmail(email: string): Promise<StrategyProfileRecord | null> {
    const snapshot = await readLocalSnapshot();
    return snapshot.profiles.find((profile) => profile.email === email) ?? null;
}

async function listProfilesLocal(): Promise<StrategyProfileRecord[]> {
    return (await readLocalSnapshot()).profiles.filter((profile) => profile.wantsBriefs);
}

async function saveBriefLocal(
    profileId: string,
    subject: string,
    preview: string,
    plan: StrategyPlan,
    options?: SaveStrategyBriefOptions
): Promise<StrategyBriefRecord> {
    const snapshot = await readLocalSnapshot();
    const nextBrief = buildBriefRecord(profileId, subject, preview, plan, options);

    const briefs = [
        nextBrief,
        ...snapshot.briefs.filter((brief) => brief.id !== nextBrief.id),
    ].slice(0, 80);

    await writeLocalSnapshot({
        ...snapshot,
        briefs,
        updatedAt: new Date().toISOString(),
    });

    return nextBrief;
}

async function getBriefLocalByWeek(
    profileId: string,
    weekKey: string,
    deliveryChannel: StrategyBriefDeliveryChannel
): Promise<StrategyBriefRecord | null> {
    const snapshot = await readLocalSnapshot();

    return (
        snapshot.briefs.find(
            (brief) =>
                brief.profileId === profileId &&
                brief.weekKey === weekKey &&
                brief.deliveryChannel === deliveryChannel
        ) ?? null
    );
}

async function getLatestBriefLocal(profileId: string): Promise<StrategyBriefRecord | null> {
    const snapshot = await readLocalSnapshot();

    return (
        snapshot.briefs
            .filter((brief) => brief.profileId === profileId)
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ?? null
    );
}

async function updateBriefDeliveryLocal(
    briefId: string,
    update: StrategyBriefDeliveryUpdate
): Promise<StrategyBriefRecord | null> {
    const snapshot = await readLocalSnapshot();
    let nextBrief: StrategyBriefRecord | null = null;

    const briefs = snapshot.briefs.map((brief) => {
        if (brief.id !== briefId) {
            return brief;
        }

        nextBrief = {
            ...brief,
            sendStatus: update.sendStatus,
            sentAt: update.sentAt ?? brief.sentAt,
            emailProviderId:
                typeof update.emailProviderId === 'string'
                    ? update.emailProviderId
                    : brief.emailProviderId,
        };

        return nextBrief;
    });

    if (!nextBrief) {
        return null;
    }

    await writeLocalSnapshot({
        ...snapshot,
        briefs,
        updatedAt: new Date().toISOString(),
    });

    return nextBrief;
}

async function markProfileLastBriefSentLocal(
    profileId: string,
    sentAt: string
): Promise<StrategyProfileRecord | null> {
    const snapshot = await readLocalSnapshot();
    let nextProfile: StrategyProfileRecord | null = null;

    const profiles = snapshot.profiles.map((profile) => {
        if (profile.id !== profileId) {
            return profile;
        }

        nextProfile = {
            ...profile,
            lastBriefSentAt: sentAt,
            updatedAt: new Date().toISOString(),
        };

        return nextProfile;
    });

    if (!nextProfile) {
        return null;
    }

    await writeLocalSnapshot({
        ...snapshot,
        profiles,
        updatedAt: new Date().toISOString(),
    });

    return nextProfile;
}

async function capturePremiumLeadLocal(
    input: StrategyPremiumLeadInput
): Promise<{ lead: StrategyPremiumLeadRecord; profile: StrategyProfileRecord }> {
    const snapshot = await readLocalSnapshot();
    const profile = snapshot.profiles.find((entry) => entry.id === input.profileId);

    if (!profile) {
        throw new Error('Strategy profile not found.');
    }

    const timestamp = new Date().toISOString();
    const existingLead =
        snapshot.premiumLeads.find(
            (lead) => lead.profileId === input.profileId && lead.offer === input.offer
        ) ?? null;

    const lead: StrategyPremiumLeadRecord = existingLead
        ? {
              ...existingLead,
              surface: input.surface,
              notes: input.notes ?? existingLead.notes,
              updatedAt: timestamp,
          }
        : {
              id: `lead_${randomUUID()}`,
              profileId: profile.id,
              email: profile.email,
              offer: input.offer,
              surface: input.surface,
              status: 'new',
              notes: input.notes ?? null,
              createdAt: timestamp,
              updatedAt: timestamp,
          };

    const updatedProfile: StrategyProfileRecord = {
        ...profile,
        premiumInterest: true,
        premiumStage:
            profile.premiumStage === 'contacted' || profile.premiumStage === 'converted'
                ? profile.premiumStage
                : 'lead',
        updatedAt: timestamp,
    };

    await writeLocalSnapshot({
        ...snapshot,
        premiumLeads: [
            lead,
            ...snapshot.premiumLeads.filter((entry) => entry.id !== lead.id),
        ],
        profiles: snapshot.profiles.map((entry) =>
            entry.id === updatedProfile.id ? updatedProfile : entry
        ),
        updatedAt: timestamp,
    });

    return { lead, profile: updatedProfile };
}

type StrategyProfileRow = {
    created_at: string;
    email: string;
    experience_level: string;
    full_name: string;
    goal: string;
    id: string;
    last_brief_sent_at: string | null;
    monetization_path: string;
    premium_interest: boolean;
    premium_stage: string;
    updated_at: string;
    wants_briefs: boolean;
    weekly_hours: number;
};

type StrategyBriefRow = {
    created_at: string;
    delivery_channel: 'email' | 'web';
    email_provider_id: string | null;
    id: string;
    plan: StrategyPlan;
    preview: string;
    profile_id: string;
    send_status: 'draft' | 'failed' | 'sent';
    sent_at: string | null;
    subject: string;
    week_key: string;
};

type StrategyPremiumLeadRow = {
    created_at: string;
    email: string;
    id: string;
    notes: string | null;
    offer: StrategyLeadOffer;
    profile_id: string;
    status: StrategyLeadStatus;
    surface: StrategyLeadSurface;
    updated_at: string;
};

function mapProfileRow(row: StrategyProfileRow): StrategyProfileRecord {
    const base = sanitizeStrategyProfileInput({
        email: row.email,
        experienceLevel: row.experience_level,
        fullName: row.full_name,
        goal: row.goal,
        lastBriefSentAt: row.last_brief_sent_at,
        monetizationPath: row.monetization_path,
        premiumInterest: row.premium_interest,
        premiumStage: row.premium_stage,
        wantsBriefs: row.wants_briefs,
        weeklyHours: row.weekly_hours,
    });

    if (!base) {
        throw new Error(`Invalid strategy profile row for ${row.email}`);
    }

    return {
        ...base,
        id: row.id,
        lastBriefSentAt: row.last_brief_sent_at,
        createdAt: row.created_at,
        premiumStage: getStrategyPremiumStage(base.premiumInterest, row.premium_stage),
        updatedAt: row.updated_at,
    };
}

function mapBriefRow(row: StrategyBriefRow): StrategyBriefRecord {
    return {
        id: row.id,
        profileId: row.profile_id,
        subject: row.subject,
        preview: row.preview,
        plan: row.plan,
        weekKey: row.week_key || getStrategyWeekKey(),
        deliveryChannel: row.delivery_channel || 'web',
        sendStatus: row.send_status || 'draft',
        sentAt: row.sent_at,
        emailProviderId: row.email_provider_id,
        createdAt: row.created_at,
    };
}

function mapPremiumLeadRow(row: StrategyPremiumLeadRow): StrategyPremiumLeadRecord {
    return {
        id: row.id,
        profileId: row.profile_id,
        email: row.email,
        offer: row.offer,
        surface: row.surface,
        status: sanitizeLeadStatus(row.status),
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function upsertProfilePostgres(
    input: StrategyProfileInput
): Promise<StrategyProfileRecord> {
    await ensureSchema();

    const pool = getPool();
    const existing = await pool.query<StrategyProfileRow>(
        `
            SELECT *
            FROM strategy_profiles
            WHERE email = $1
            LIMIT 1
        `,
        [input.email]
    );

    const nextProfile = buildProfileRecord(
        input,
        existing.rows[0] ? mapProfileRow(existing.rows[0]) : null
    );

    const result = await pool.query<StrategyProfileRow>(
        `
            INSERT INTO strategy_profiles (
                id,
                email,
                full_name,
                goal,
                experience_level,
                weekly_hours,
                monetization_path,
                wants_briefs,
                premium_interest,
                premium_stage,
                last_brief_sent_at,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (email) DO UPDATE
            SET
                full_name = EXCLUDED.full_name,
                goal = EXCLUDED.goal,
                experience_level = EXCLUDED.experience_level,
                weekly_hours = EXCLUDED.weekly_hours,
                monetization_path = EXCLUDED.monetization_path,
                wants_briefs = EXCLUDED.wants_briefs,
                premium_interest = EXCLUDED.premium_interest,
                premium_stage = EXCLUDED.premium_stage,
                last_brief_sent_at = EXCLUDED.last_brief_sent_at,
                updated_at = EXCLUDED.updated_at
            RETURNING *
        `,
        [
            nextProfile.id,
            nextProfile.email,
            nextProfile.fullName,
            nextProfile.goal,
            nextProfile.experienceLevel,
            nextProfile.weeklyHours,
            nextProfile.monetizationPath,
            nextProfile.wantsBriefs,
            nextProfile.premiumInterest,
            nextProfile.premiumStage,
            nextProfile.lastBriefSentAt,
            nextProfile.createdAt,
            nextProfile.updatedAt,
        ]
    );

    return mapProfileRow(result.rows[0]);
}

async function getProfilePostgresById(profileId: string): Promise<StrategyProfileRecord | null> {
    await ensureSchema();

    const result = await getPool().query<StrategyProfileRow>(
        `
            SELECT *
            FROM strategy_profiles
            WHERE id = $1
            LIMIT 1
        `,
        [profileId]
    );

    return result.rows[0] ? mapProfileRow(result.rows[0]) : null;
}

async function getProfilePostgresByEmail(
    email: string
): Promise<StrategyProfileRecord | null> {
    await ensureSchema();

    const result = await getPool().query<StrategyProfileRow>(
        `
            SELECT *
            FROM strategy_profiles
            WHERE email = $1
            LIMIT 1
        `,
        [email]
    );

    return result.rows[0] ? mapProfileRow(result.rows[0]) : null;
}

async function listProfilesPostgres(): Promise<StrategyProfileRecord[]> {
    await ensureSchema();

    const result = await getPool().query<StrategyProfileRow>(
        `
            SELECT *
            FROM strategy_profiles
            WHERE wants_briefs = TRUE
            ORDER BY created_at ASC
        `
    );

    return result.rows.map(mapProfileRow);
}

async function saveBriefPostgres(
    profileId: string,
    subject: string,
    preview: string,
    plan: StrategyPlan,
    options?: SaveStrategyBriefOptions
): Promise<StrategyBriefRecord> {
    await ensureSchema();

    const nextBrief = buildBriefRecord(profileId, subject, preview, plan, options);
    const result = await getPool().query<StrategyBriefRow>(
        `
            INSERT INTO strategy_briefs (
                id,
                profile_id,
                subject,
                preview,
                plan,
                week_key,
                delivery_channel,
                send_status,
                sent_at,
                email_provider_id,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `,
        [
            nextBrief.id,
            nextBrief.profileId,
            nextBrief.subject,
            nextBrief.preview,
            JSON.stringify(nextBrief.plan),
            nextBrief.weekKey,
            nextBrief.deliveryChannel,
            nextBrief.sendStatus,
            nextBrief.sentAt,
            nextBrief.emailProviderId,
            nextBrief.createdAt,
        ]
    );

    return mapBriefRow(result.rows[0]);
}

async function getBriefPostgresByWeek(
    profileId: string,
    weekKey: string,
    deliveryChannel: StrategyBriefDeliveryChannel
): Promise<StrategyBriefRecord | null> {
    await ensureSchema();

    const result = await getPool().query<StrategyBriefRow>(
        `
            SELECT *
            FROM strategy_briefs
            WHERE profile_id = $1
              AND week_key = $2
              AND delivery_channel = $3
            ORDER BY created_at DESC
            LIMIT 1
        `,
        [profileId, weekKey, deliveryChannel]
    );

    return result.rows[0] ? mapBriefRow(result.rows[0]) : null;
}

async function getLatestBriefPostgres(
    profileId: string
): Promise<StrategyBriefRecord | null> {
    await ensureSchema();

    const result = await getPool().query<StrategyBriefRow>(
        `
            SELECT *
            FROM strategy_briefs
            WHERE profile_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        `,
        [profileId]
    );

    return result.rows[0] ? mapBriefRow(result.rows[0]) : null;
}

async function updateBriefDeliveryPostgres(
    briefId: string,
    update: StrategyBriefDeliveryUpdate
): Promise<StrategyBriefRecord | null> {
    await ensureSchema();

    const result = await getPool().query<StrategyBriefRow>(
        `
            UPDATE strategy_briefs
            SET
                send_status = $2,
                sent_at = $3,
                email_provider_id = COALESCE($4, email_provider_id)
            WHERE id = $1
            RETURNING *
        `,
        [briefId, update.sendStatus, update.sentAt ?? null, update.emailProviderId ?? null]
    );

    return result.rows[0] ? mapBriefRow(result.rows[0]) : null;
}

async function markProfileLastBriefSentPostgres(
    profileId: string,
    sentAt: string
): Promise<StrategyProfileRecord | null> {
    await ensureSchema();

    const result = await getPool().query<StrategyProfileRow>(
        `
            UPDATE strategy_profiles
            SET
                last_brief_sent_at = $2,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `,
        [profileId, sentAt]
    );

    return result.rows[0] ? mapProfileRow(result.rows[0]) : null;
}

async function capturePremiumLeadPostgres(
    input: StrategyPremiumLeadInput
): Promise<{ lead: StrategyPremiumLeadRecord; profile: StrategyProfileRecord }> {
    await ensureSchema();

    const pool = getPool();
    const profileResult = await pool.query<StrategyProfileRow>(
        `
            SELECT *
            FROM strategy_profiles
            WHERE id = $1
            LIMIT 1
        `,
        [input.profileId]
    );

    const profileRow = profileResult.rows[0];
    if (!profileRow) {
        throw new Error('Strategy profile not found.');
    }

    const profile = mapProfileRow(profileRow);
    const timestamp = new Date().toISOString();

    const existingLeadResult = await pool.query<StrategyPremiumLeadRow>(
        `
            SELECT *
            FROM strategy_premium_leads
            WHERE profile_id = $1
              AND offer = $2
            ORDER BY created_at DESC
            LIMIT 1
        `,
        [input.profileId, input.offer]
    );

    let lead: StrategyPremiumLeadRecord;

    if (existingLeadResult.rows[0]) {
        const updatedLeadResult = await pool.query<StrategyPremiumLeadRow>(
            `
                UPDATE strategy_premium_leads
                SET
                    surface = $2,
                    notes = COALESCE($3, notes),
                    updated_at = $4
                WHERE id = $1
                RETURNING *
            `,
            [
                existingLeadResult.rows[0].id,
                input.surface,
                input.notes ?? null,
                timestamp,
            ]
        );

        lead = mapPremiumLeadRow(updatedLeadResult.rows[0]);
    } else {
        const createdLeadResult = await pool.query<StrategyPremiumLeadRow>(
            `
                INSERT INTO strategy_premium_leads (
                    id,
                    profile_id,
                    email,
                    surface,
                    offer,
                    status,
                    notes,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `,
            [
                `lead_${randomUUID()}`,
                profile.id,
                profile.email,
                input.surface,
                input.offer,
                'new',
                input.notes ?? null,
                timestamp,
                timestamp,
            ]
        );

        lead = mapPremiumLeadRow(createdLeadResult.rows[0]);
    }

    const updatedProfileResult = await pool.query<StrategyProfileRow>(
        `
            UPDATE strategy_profiles
            SET
                premium_interest = TRUE,
                premium_stage = CASE
                    WHEN premium_stage IN ('contacted', 'converted') THEN premium_stage
                    ELSE 'lead'
                END,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `,
        [profile.id]
    );

    return {
        lead,
        profile: mapProfileRow(updatedProfileResult.rows[0]),
    };
}

export async function upsertStrategyProfile(
    input: StrategyProfileInput
): Promise<StrategyProfileRecord> {
    if (isPostgresConfigured()) {
        return upsertProfilePostgres(input);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return upsertProfileLocal(input);
}

export async function getStrategyProfileById(
    profileId: string
): Promise<StrategyProfileRecord | null> {
    if (isPostgresConfigured()) {
        return getProfilePostgresById(profileId);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return getProfileLocalById(profileId);
}

export async function getStrategyProfileByEmail(
    email: string
): Promise<StrategyProfileRecord | null> {
    if (isPostgresConfigured()) {
        return getProfilePostgresByEmail(email);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return getProfileLocalByEmail(email);
}

export async function listStrategyProfilesForBriefs(): Promise<StrategyProfileRecord[]> {
    if (isPostgresConfigured()) {
        return listProfilesPostgres();
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return listProfilesLocal();
}

export async function saveStrategyBrief(
    profileId: string,
    subject: string,
    preview: string,
    plan: StrategyPlan,
    options?: SaveStrategyBriefOptions
): Promise<StrategyBriefRecord> {
    if (isPostgresConfigured()) {
        return saveBriefPostgres(profileId, subject, preview, plan, options);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return saveBriefLocal(profileId, subject, preview, plan, options);
}

export async function getLatestStrategyBrief(
    profileId: string
): Promise<StrategyBriefRecord | null> {
    if (isPostgresConfigured()) {
        return getLatestBriefPostgres(profileId);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return getLatestBriefLocal(profileId);
}

export async function getStrategyBriefByWeek(
    profileId: string,
    weekKey: string,
    deliveryChannel: StrategyBriefDeliveryChannel
): Promise<StrategyBriefRecord | null> {
    if (isPostgresConfigured()) {
        return getBriefPostgresByWeek(profileId, weekKey, deliveryChannel);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return getBriefLocalByWeek(profileId, weekKey, deliveryChannel);
}

export async function updateStrategyBriefDelivery(
    briefId: string,
    update: StrategyBriefDeliveryUpdate
): Promise<StrategyBriefRecord | null> {
    if (isPostgresConfigured()) {
        return updateBriefDeliveryPostgres(briefId, update);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return updateBriefDeliveryLocal(briefId, update);
}

export async function markStrategyProfileBriefSent(
    profileId: string,
    sentAt: string
): Promise<StrategyProfileRecord | null> {
    if (isPostgresConfigured()) {
        return markProfileLastBriefSentPostgres(profileId, sentAt);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return markProfileLastBriefSentLocal(profileId, sentAt);
}

export async function captureStrategyPremiumLead(
    input: StrategyPremiumLeadInput
): Promise<{ lead: StrategyPremiumLeadRecord; profile: StrategyProfileRecord }> {
    if (isPostgresConfigured()) {
        return capturePremiumLeadPostgres(input);
    }

    if (isProduction()) {
        throw createConfigurationError();
    }

    return capturePremiumLeadLocal(input);
}
