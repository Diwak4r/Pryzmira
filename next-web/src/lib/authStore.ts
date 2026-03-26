/* =========================================================================
   AUTH STORE — Database persistence for NextAuth integration
   Supports PostgreSQL with local JSON fallback
   ========================================================================= */

import { Pool } from 'pg';
import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { join } from 'path';

// ==========================================================================
// Types
// ==========================================================================

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  created_at?: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expires: Date;
}

// ==========================================================================
// Database Configuration
// ==========================================================================

function getDbConfig() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.log('[AuthStore] No POSTGRES_URL found — using JSON fallback');
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

export async function initAuthTables(): Promise<void> {
  const db = await getDb();

  if (!db) {
    console.log('[AuthStore] Using JSON fallback — initializing auth data file');
    await initJsonStorage();
    return;
  }

  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified TIMESTAMP,
        image TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Accounts table for OAuth
    await db.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL UNIQUE,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255)
      )
    `);

    // Sessions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires TIMESTAMP NOT NULL
      )
    `);

    // Verification tokens table
    await db.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);

    console.log('[AuthStore] PostgreSQL auth tables initialized');
  } catch (error) {
    console.error('[AuthStore] Failed to initialize auth tables:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// ==========================================================================
// JSON Fallback Storage
// ==========================================================================

const DATA_DIR = join(process.cwd(), 'data');
const AUTH_FILE = join(DATA_DIR, 'auth-store.json');

interface JsonAuthData {
  users: User[];
  accounts: Account[];
  sessions: Session[];
  verificationTokens: { identifier: string; token: string; expires: string }[];
}

interface UserRow {
  id: string | number;
  name: string | null;
  email: string;
  email_verified: string | Date | null;
  image: string | null;
  created_at?: string | Date | null;
}

interface AccountRow {
  id: string | number;
  user_id: string | number;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

interface SessionRow {
  id: string | number;
  user_id: string | number;
  session_token: string;
  expires: string | Date;
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
    await access(AUTH_FILE);
  } catch {
    await writeFile(AUTH_FILE, JSON.stringify({
      users: [],
      accounts: [],
      sessions: [],
      verificationTokens: []
    }, null, 2));
  }
}

async function readJsonData(): Promise<JsonAuthData> {
  await ensureDataDir();
  try {
    const content = await readFile(AUTH_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { users: [], accounts: [], sessions: [], verificationTokens: [] };
  }
}

async function writeJsonData(data: JsonAuthData): Promise<void> {
  await ensureDataDir();
  await writeFile(AUTH_FILE, JSON.stringify(data, null, 2));
}

// ==========================================================================
// User Operations
// ==========================================================================

export async function createUser(userData: {
  name?: string | null;
  email: string;
  image?: string | null;
}): Promise<User> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      `INSERT INTO users (name, email, image)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, email_verified, image, created_at`,
      [userData.name || null, userData.email, userData.image || null]
    );
    await db.end();
    return formatUser(result.rows[0]);
  }

  // JSON fallback
  const data = await readJsonData();
  const newUser: User = {
    id: String(data.users.length + 1),
    name: userData.name || null,
    email: userData.email,
    emailVerified: null,
    image: userData.image || null,
    created_at: new Date(),
  };
  data.users.push(newUser);
  await writeJsonData(data);
  return newUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      'SELECT id, name, email, email_verified, image, created_at FROM users WHERE email = $1',
      [email]
    );
    await db.end();
    return result.rows.length > 0 ? formatUser(result.rows[0]) : null;
  }

  // JSON fallback
  const data = await readJsonData();
  const user = data.users.find(u => u.email === email);
  return user || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      'SELECT id, name, email, email_verified, image, created_at FROM users WHERE id = $1',
      [id]
    );
    await db.end();
    return result.rows.length > 0 ? formatUser(result.rows[0]) : null;
  }

  // JSON fallback
  const data = await readJsonData();
  const user = data.users.find(u => u.id === id);
  return user || null;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      `UPDATE users
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           image = COALESCE($4, image)
       WHERE id = $1
       RETURNING id, name, email, email_verified, image, created_at`,
      [id, updates.name, updates.email, updates.image]
    );
    await db.end();
    return result.rows.length > 0 ? formatUser(result.rows[0]) : null;
  }

  // JSON fallback
  const data = await readJsonData();
  const index = data.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  data.users[index] = { ...data.users[index], ...updates };
  await writeJsonData(data);
  return data.users[index];
}

function formatUser(row: UserRow): User {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    emailVerified: row.email_verified ? new Date(row.email_verified) : null,
    image: row.image,
    created_at: row.created_at ? new Date(row.created_at) : undefined,
  };
}

// ==========================================================================
// Account Operations
// ==========================================================================

export async function createAccount(accountData: {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}): Promise<Account> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      `INSERT INTO accounts (user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state`,
      [
        accountData.userId,
        accountData.type,
        accountData.provider,
        accountData.providerAccountId,
        accountData.refresh_token || null,
        accountData.access_token || null,
        accountData.expires_at || null,
        accountData.token_type || null,
        accountData.scope || null,
        accountData.id_token || null,
        accountData.session_state || null,
      ]
    );
    await db.end();
    return formatAccount(result.rows[0]);
  }

  // JSON fallback
  const data = await readJsonData();
  const newAccount: Account = {
    id: String(data.accounts.length + 1),
    userId: accountData.userId,
    type: accountData.type,
    provider: accountData.provider,
    providerAccountId: accountData.providerAccountId,
    refresh_token: accountData.refresh_token ?? null,
    access_token: accountData.access_token ?? null,
    expires_at: accountData.expires_at ?? null,
    token_type: accountData.token_type ?? null,
    scope: accountData.scope ?? null,
    id_token: accountData.id_token ?? null,
    session_state: accountData.session_state ?? null,
  };
  data.accounts.push(newAccount);
  await writeJsonData(data);
  return newAccount;
}

export async function getAccountByProviderAccountId(
  provider: string,
  providerAccountId: string
): Promise<{ account: Account; user: User } | null> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      `SELECT a.*, u.id as user_id, u.name, u.email, u.email_verified, u.image, u.created_at
       FROM accounts a
       JOIN users u ON a.user_id = u.id
       WHERE a.provider = $1 AND a.provider_account_id = $2`,
      [provider, providerAccountId]
    );
    await db.end();

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      account: {
        id: String(row.id),
        userId: String(row.user_id),
        type: row.type,
        provider: row.provider,
        providerAccountId: row.provider_account_id,
        refresh_token: row.refresh_token,
        access_token: row.access_token,
        expires_at: row.expires_at,
        token_type: row.token_type,
        scope: row.scope,
        id_token: row.id_token,
        session_state: row.session_state,
      },
      user: formatUser(row),
    };
  }

  // JSON fallback
  const data = await readJsonData();
  const account = data.accounts.find(
    a => a.provider === provider && a.providerAccountId === providerAccountId
  );
  if (!account) return null;

  const user = data.users.find(u => u.id === account.userId);
  if (!user) return null;

  return { account, user };
}

function formatAccount(row: AccountRow): Account {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: row.type,
    provider: row.provider,
    providerAccountId: row.provider_account_id,
    refresh_token: row.refresh_token,
    access_token: row.access_token,
    expires_at: row.expires_at,
    token_type: row.token_type,
    scope: row.scope,
    id_token: row.id_token,
    session_state: row.session_state,
  };
}

// ==========================================================================
// Session Operations
// ==========================================================================

export async function createSession(sessionData: {
  sessionToken: string;
  userId: string;
  expires: Date;
}): Promise<Session> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      `INSERT INTO sessions (session_token, user_id, expires)
       VALUES ($1, $2, $3)
       RETURNING id, session_token, user_id, expires`,
      [sessionData.sessionToken, sessionData.userId, sessionData.expires]
    );
    await db.end();
    return formatSession(result.rows[0]);
  }

  // JSON fallback
  const data = await readJsonData();
  const newSession: Session = {
    id: String(data.sessions.length + 1),
    ...sessionData,
  };
  data.sessions.push(newSession);
  await writeJsonData(data);
  return newSession;
}

export async function getSessionByToken(sessionToken: string): Promise<{ session: Session; user: User } | null> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      `SELECT s.*, u.id as user_id, u.name, u.email, u.email_verified, u.image, u.created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_token = $1 AND s.expires > NOW()`,
      [sessionToken]
    );
    await db.end();

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      session: {
        id: String(row.id),
        userId: String(row.user_id),
        sessionToken: row.session_token,
        expires: new Date(row.expires),
      },
      user: formatUser(row),
    };
  }

  // JSON fallback
  const data = await readJsonData();
  const session = data.sessions.find(s => s.sessionToken === sessionToken);
  if (!session || new Date(session.expires) < new Date()) return null;

  const user = data.users.find(u => u.id === session.userId);
  if (!user) return null;

  return { session, user };
}

export async function deleteSession(sessionToken: string): Promise<void> {
  const db = await getDb();

  if (db) {
    await db.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
    await db.end();
    return;
  }

  // JSON fallback
  const data = await readJsonData();
  data.sessions = data.sessions.filter(s => s.sessionToken !== sessionToken);
  await writeJsonData(data);
}

function formatSession(row: SessionRow): Session {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    sessionToken: row.session_token,
    expires: new Date(row.expires),
  };
}

// ==========================================================================
// Verification Token Operations
// ==========================================================================

export async function createVerificationToken(data: {
  identifier: string;
  token: string;
  expires: Date;
}): Promise<void> {
  const db = await getDb();

  if (db) {
    await db.query(
      'INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3)',
      [data.identifier, data.token, data.expires]
    );
    await db.end();
    return;
  }

  // JSON fallback
  const jsonData = await readJsonData();
  jsonData.verificationTokens.push({
    ...data,
    expires: data.expires.toISOString(),
  });
  await writeJsonData(jsonData);
}

export async function useVerificationToken(params: {
  identifier: string;
  token: string;
}): Promise<{ identifier: string; token: string; expires: Date } | null> {
  const db = await getDb();

  if (db) {
    const result = await db.query(
      'DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING *',
      [params.identifier, params.token]
    );
    await db.end();

    if (result.rows.length === 0) return null;

    return {
      identifier: result.rows[0].identifier,
      token: result.rows[0].token,
      expires: new Date(result.rows[0].expires),
    };
  }

  // JSON fallback
  const data = await readJsonData();
  const index = data.verificationTokens.findIndex(
    t => t.identifier === params.identifier && t.token === params.token
  );
  if (index === -1) return null;

  const token = data.verificationTokens[index];
  data.verificationTokens.splice(index, 1);
  await writeJsonData(data);

  return {
    identifier: token.identifier,
    token: token.token,
    expires: new Date(token.expires),
  };
}
