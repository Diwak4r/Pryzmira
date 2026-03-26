import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const postgresUrl = process.env.POSTGRES_URL;
    const postgresUrlNonPooling = process.env.POSTGRES_URL_NON_POOLING;

    return NextResponse.json({
        hasPostgresUrl: Boolean(postgresUrl),
        hasPostgresUrlNonPooling: Boolean(postgresUrlNonPooling),
        postgresUrlLength: postgresUrl?.length || 0,
        postgresUrlStart: postgresUrl?.substring(0, 20) || 'missing',
        nodeEnv: process.env.NODE_ENV,
    });
}
