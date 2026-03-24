import Desk from '@/views/Desk';

export default async function DeskPage({
    searchParams,
}: {
    searchParams: Promise<{ profileId?: string; token?: string }>;
}) {
    const params = await searchParams;

    return <Desk initialProfileId={params.profileId} initialToken={params.token} />;
}
