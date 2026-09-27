import type { SupabaseClient } from '@supabase/supabase-js';
import type { LinkPreview } from './types';

export function isAuthorizedCron(request: Request): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) return true; // no secret configured — allow (dev convenience), lock this down in production
    return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function queueSubmission(
    client: SupabaseClient,
    args: { url: string; note: string; preview?: LinkPreview },
): Promise<'inserted' | 'duplicate' | 'error'> {
    const { data: existing } = await client.from('submissions').select('id').eq('url', args.url).maybeSingle();
    if (existing) return 'duplicate';

    const { error } = await client.from('submissions').insert({
        url: args.url,
        note: args.note,
        status: 'pending',
        ip_hash: null,
        preview_json: args.preview ?? null,
    });

    return error ? 'error' : 'inserted';
}
