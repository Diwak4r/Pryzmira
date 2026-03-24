function normalizeSiteUrl(value: string): string {
    const trimmed = value.trim();

    if (trimmed === '') {
        return '';
    }

    const withProtocol =
        trimmed.startsWith('http://') || trimmed.startsWith('https://')
            ? trimmed
            : `https://${trimmed}`;

    return withProtocol.replace(/\/$/, '');
}

export function getSiteUrl(request?: Request): string {
    const envSiteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        process.env.VERCEL_URL;

    if (envSiteUrl) {
        return normalizeSiteUrl(envSiteUrl);
    }

    if (request) {
        const currentUrl = new URL(request.url);
        return `${currentUrl.protocol}//${currentUrl.host}`;
    }

    return 'https://pryzmira.diwakaryadav.com.np';
}
