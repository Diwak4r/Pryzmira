import Link from 'next/link';
import { ArrowRight, CheckCircle2, CircleDot, FlaskConical, KeyRound, Radio } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import {
    BUILD_SOURCES,
    CAPABILITIES,
    ENV_VARS,
    FAQ,
    QUICKSTART_STEPS,
    RECIPES,
    TEST_SUITE,
    TROUBLESHOOTING,
    type CapabilityStatus,
} from '@/lib/guide';

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'quickstart', label: 'Quickstart' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'builds', label: 'Build gallery' },
    { id: 'tests', label: 'Tests' },
    { id: 'environment', label: 'Environment' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
    { id: 'faq', label: 'FAQ' },
];

const STATUS_STYLES: Record<CapabilityStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    stable: {
        label: 'stable',
        className: 'border-primary/30 bg-primary/5 text-foreground',
        icon: CheckCircle2,
    },
    new: {
        label: 'new',
        className: 'border-primary/40 bg-primary/10 text-foreground',
        icon: CircleDot,
    },
    beta: {
        label: 'beta',
        className: 'border-border bg-secondary text-muted-foreground',
        icon: FlaskConical,
    },
    'needs-key': {
        label: 'needs key',
        className: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400',
        icon: KeyRound,
    },
};

function CodeBlock({ code, label }: { code: string; label?: string }) {
    return (
        <div className="relative rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                    {label || 'shell'}
                </span>
                <CopyButton value={code} label="Copy" compact className="h-6 w-6 justify-center p-0" />
            </div>
            <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[0.72rem] leading-relaxed text-foreground">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function SectionHeading({ id, title, kicker }: { id: string; title: string; kicker: string }) {
    return (
        <div className="scroll-mt-20" id={id}>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">{kicker}</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h2>
        </div>
    );
}

export default function GuideView() {
    return (
        <div className="wide-container pb-20 pt-8 md:pt-12">
            <div className="border-b border-border pb-6">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                    Guide
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                    Everything Pryzmira can do
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    A working manual, not a pitch. How the voice engine behaves, what each route does, how the
                    build gallery pulls from X and GitHub, which environment variables matter, and how to run
                    the tests. If a feature is not shipped, it is not listed here.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                        href="/"
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Start writing
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                    <Link
                        href="/builds"
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    >
                        Open the build gallery
                    </Link>
                </div>
            </div>

            <div className="mt-8 gap-10 lg:grid lg:grid-cols-[170px_1fr]">
                <nav aria-label="Guide sections" className="mb-6 lg:mb-0">
                    <ul className="flex flex-wrap gap-1.5 lg:sticky lg:top-16 lg:block lg:space-y-1">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="block rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                                >
                                    {section.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="min-w-0 space-y-12">
                    <section>
                        <SectionHeading id="overview" kicker="01" title="What this is" />
                        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                            <p>
                                Pryzmira learns how you write from one sample, then drafts new text against that
                                pattern. It is not a paraphrase tool and it does not keep a permanent memory of
                                you unless you save a profile. The pipeline is analysis, then a voice contract,
                                then drafting, then an anti-generic retry.
                            </p>
                            <p>
                                Three surfaces share the same engine:{' '}
                                <Link href="/" className="text-foreground underline underline-offset-2">
                                    the writer
                                </Link>{' '}
                                (sample in, draft out),{' '}
                                <Link href="/desk" className="text-foreground underline underline-offset-2">
                                    the desk
                                </Link>{' '}
                                (refine, copy, save, history), and{' '}
                                <Link href="/builds" className="text-foreground underline underline-offset-2">
                                    the build gallery
                                </Link>{' '}
                                (what other people are shipping with AI models). Any gallery card can hand a
                                ready-made task to the writer.
                            </p>
                            <div className="rounded-md border border-border bg-card px-3 py-2.5">
                                <p className="text-xs leading-relaxed text-foreground">
                                    No model key configured? The app runs in demo mode: it composes a local
                                    draft from your own sample and labels it clearly. Nothing calls a model in
                                    demo mode.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <SectionHeading id="quickstart" kicker="02" title="Quickstart" />
                        <ol className="mt-4 space-y-4">
                            {QUICKSTART_STEPS.map((step, index) => (
                                <li key={step.title} className="flex gap-3">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-[0.65rem] text-muted-foreground">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{step.title}</p>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                            {step.body}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-4">
                            <CodeBlock
                                label="local development"
                                code={'cd next-web\nnpm install\nnpm run dev\n# open http://localhost:3000'}
                            />
                        </div>
                    </section>

                    <section>
                        <SectionHeading id="capabilities" kicker="03" title="Capability scan" />
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Every capability below is wired to a route or module in this repository. The badge
                            tells you what it needs before it works.
                        </p>
                        <div className="mt-4 overflow-hidden rounded-md border border-border">
                            {CAPABILITIES.map((capability, index) => {
                                const status = STATUS_STYLES[capability.status];
                                const StatusIcon = status.icon;

                                return (
                                    <div
                                        key={capability.id}
                                        className={`flex flex-col gap-1.5 px-3 py-3 ${
                                            index > 0 ? 'border-t border-border' : ''
                                        } bg-card`}
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-medium text-foreground">{capability.name}</p>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${status.className}`}
                                            >
                                                <StatusIcon className="h-2.5 w-2.5" aria-hidden />
                                                {status.label}
                                            </span>
                                            <code className="ml-auto font-mono text-[0.65rem] text-muted-foreground/80">
                                                {capability.where}
                                            </code>
                                        </div>
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            {capability.summary}
                                        </p>
                                        {capability.requirements && (
                                            <p className="font-mono text-[0.62rem] text-muted-foreground/70">
                                                needs: {capability.requirements}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section>
                        <SectionHeading id="recipes" kicker="04" title="Recipes that work" />
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Short, concrete tasks beat long briefs. Each recipe prefills the writer with a task
                            and constraints; you still supply the writing sample.
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {RECIPES.map((recipe) => {
                                const href = `/?task=${encodeURIComponent(recipe.task)}&instructions=${encodeURIComponent(
                                    recipe.instructions
                                )}`;

                                return (
                                    <div
                                        key={recipe.id}
                                        className="flex h-full flex-col rounded-md border border-border bg-card p-3.5"
                                    >
                                        <p className="text-sm font-medium leading-snug text-foreground">
                                            {recipe.title}
                                        </p>
                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
                                                task
                                            </span>
                                            <br />
                                            {recipe.task}
                                        </p>
                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
                                                constraints
                                            </span>
                                            <br />
                                            {recipe.instructions}
                                        </p>
                                        <p className="mt-2 text-[0.7rem] italic leading-relaxed text-muted-foreground/80">
                                            {recipe.note}
                                        </p>
                                        <div className="mt-auto pt-3">
                                            <Link
                                                href={href}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                            >
                                                Use this recipe
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section>
                        <SectionHeading id="builds" kicker="05" title="Build gallery sources" />
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            The gallery shows builds made with AI models. Curated picks ship with the app; X and
                            GitHub are live when configured. Sources are independent - one failing never hides
                            the others.
                        </p>
                        <div className="mt-4 space-y-3">
                            {BUILD_SOURCES.map((source) => (
                                <div key={source.id} className="rounded-md border border-border bg-card p-3.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium text-foreground">{source.label}</p>
                                        <span className="inline-flex items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                                            {source.id === 'x' ? (
                                                <Radio className="h-2.5 w-2.5" aria-hidden />
                                            ) : null}
                                            {source.state}
                                        </span>
                                        {source.envKey && (
                                            <code className="font-mono text-[0.65rem] text-muted-foreground/80">
                                                {source.envKey}
                                            </code>
                                        )}
                                    </div>
                                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                        {source.detail}
                                    </p>
                                    {source.code && (
                                        <div className="mt-2">
                                            <CodeBlock
                                                code={source.code}
                                                label={source.id === 'custom' ? 'typescript' : 'env'}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <SectionHeading id="tests" kicker="06" title="Tests and verification" />
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            The suite runs on Vitest with no network access: provider calls, X, and GitHub are
                            all mocked at the fetch boundary. Tests caught two real bugs in the voice engine -
                            a swallowed configuration error and raw provider messages leaking to users.
                        </p>
                        <div className="mt-3">
                            <CodeBlock
                                label="verification"
                                code={'npm test          # unit tests\nnpm run typecheck # tsc --noEmit\nnpm run lint      # eslint\nnpm run verify    # all three, in order'}
                            />
                        </div>
                        <div className="mt-3 overflow-hidden rounded-md border border-border">
                            {TEST_SUITE.map((entry, index) => (
                                <div
                                    key={entry.file}
                                    className={`flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:gap-4 ${
                                        index > 0 ? 'border-t border-border' : ''
                                    } bg-card`}
                                >
                                    <code className="w-full shrink-0 font-mono text-[0.68rem] text-foreground sm:w-56">
                                        {entry.file}
                                    </code>
                                    <span className="text-xs leading-relaxed text-muted-foreground">
                                        {entry.covers}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <SectionHeading id="environment" kicker="07" title="Environment variables" />
                        <div className="mt-3 overflow-hidden rounded-md border border-border">
                            {ENV_VARS.map((entry, index) => (
                                <div
                                    key={entry.key}
                                    className={`px-3 py-2.5 ${index > 0 ? 'border-t border-border' : ''} bg-card`}
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <code className="font-mono text-[0.7rem] text-foreground">{entry.key}</code>
                                        <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
                                            {entry.required}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        {entry.purpose}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
                            Keep all of these in <code className="font-mono">.env.local</code>. Only variables
                            prefixed with NEXT_PUBLIC_ are exposed to the browser.
                        </p>
                    </section>

                    <section>
                        <SectionHeading id="troubleshooting" kicker="08" title="Troubleshooting" />
                        <div className="mt-3 space-y-2">
                            {TROUBLESHOOTING.map((entry) => (
                                <details
                                    key={entry.symptom}
                                    className="group rounded-md border border-border bg-card px-3 py-2.5"
                                >
                                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden">
                                        <span className="mr-1 text-muted-foreground group-open:hidden">+</span>
                                        <span className="mr-1 hidden text-muted-foreground group-open:inline">
                                            -
                                        </span>
                                        {entry.symptom}
                                    </summary>
                                    <div className="mt-2 space-y-1.5 border-t border-border pt-2">
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
                                                cause
                                            </span>
                                            <br />
                                            {entry.cause}
                                        </p>
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
                                                fix
                                            </span>
                                            <br />
                                            {entry.fix}
                                        </p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>

                    <section>
                        <SectionHeading id="faq" kicker="09" title="FAQ" />
                        <div className="mt-3 space-y-2">
                            {FAQ.map((entry) => (
                                <details
                                    key={entry.question}
                                    className="group rounded-md border border-border bg-card px-3 py-2.5"
                                >
                                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                                        <span className="mr-1 text-muted-foreground group-open:hidden">+</span>
                                        <span className="mr-1 hidden text-muted-foreground group-open:inline">
                                            -
                                        </span>
                                        {entry.question}
                                    </summary>
                                    <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
                                        {entry.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
