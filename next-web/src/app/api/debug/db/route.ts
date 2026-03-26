import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
    const postgresUrl = process.env.POSTGRES_URL;
    const postgresUrlNonPooling = process.env.POSTGRES_URL_NON_POOLING;

    const result: any = {
        hasPostgresUrl: Boolean(postgresUrl),
        hasPostgresUrlNonPooling: Boolean(postgresUrlNonPooling),
        postgresUrlLength: postgresUrl?.length || 0,
        postgresUrlStart: postgresUrl?.substring(0, 30) || 'missing',
        nodeEnv: process.env.NODE_ENV,
        connectionTest: null,
        error: null,
    };

    // Try to connect
    if (postgresUrl) {
        try {
            const cleanConnectionString = postgresUrl.replace(/[?&]sslmode=[^&]*/g, '');
            const pool = new Pool({
                connectionString: cleanConnectionString,
                max: 1,
                ssl: {
                    rejectUnauthorized: false,
                },
            });

            const testResult = await pool.query('SELECT NOW() as now');
            result.connectionTest = 'success';
            result.serverTime = testResult.rows[0]?.now;
            await pool.end();
        } catch (error) {
            result.connectionTest = 'failed';
            result.error = {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: (error as any)?.code,
                name: error instanceof Error ? error.name : 'Unknown',
            };
        }
    }

    return NextResponse.json(result);
}
