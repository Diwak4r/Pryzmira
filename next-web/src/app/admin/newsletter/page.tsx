import { redirect } from 'next/navigation';
import NewsletterAdminClient from '@/components/NewsletterAdminClient';
import { auth } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

function isAllowedAdmin(email: string | null | undefined): boolean {
    if (!email) {
        return false;
    }

    const configuredAdmins = process.env.ADMIN_EMAILS
        ?.split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

    if (!configuredAdmins || configuredAdmins.length === 0) {
        return true;
    }

    return configuredAdmins.includes(email.toLowerCase());
}

export default async function NewsletterAdminPage() {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
        redirect('/?signin=true');
    }

    if (!isAllowedAdmin(email)) {
        redirect('/desk');
    }

    return <NewsletterAdminClient />;
}
