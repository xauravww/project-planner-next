'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BrowserMock } from '@/components/ui/BrowserMock';
import { NebulaButton } from '@/components/ui/NebulaButton';

export type AetherHeroProps = {
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
    ctaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;

    align?: 'left' | 'center';
    /** Deprecated — kept so old call sites still compile. */
    overlayGradient?: string;
    maxWidth?: number;
    textColor?: string;
    fragmentSource?: string;
    dprMax?: number;
    clearColor?: [number, number, number, number];
    height?: string | number;
    className?: string;
    ariaLabel?: string;
};

/**
 * Hero — clean modern SaaS.
 * Left-aligned headline + CTAs on the left, live product mockup on
 * the right (stacking on mobile). One screen tall.
 */
export default function AetherHero({
    title = 'Plan projects that ship',
    subtitle,
    ctaLabel = 'Get Started',
    ctaHref = '#',
    secondaryCtaLabel,
    secondaryCtaHref,
    align = 'left',
    height = '100vh',
    className = '',
    ariaLabel = 'Hero',
}: AetherHeroProps) {
    return (
        <section
            aria-label={ariaLabel}
            className={cn(
                'relative overflow-hidden bg-[var(--color-nebula-bg)]',
                'border-b border-[var(--color-nebula-hairline)]',
                align === 'center' ? 'text-center' : 'text-left',
                className,
            )}
            style={{ minHeight: height }}
        >
            {/* subtle top gradient wash */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--color-accent-blue-glow)] to-transparent" />

            <div className="relative z-10 min-h-[inherit] w-full flex flex-col justify-center container mx-auto px-6 max-w-[1200px] py-12">
                <div className={cn('grid items-center gap-8 lg:grid-cols-2', align === 'center' && 'justify-items-center')}>
                    {/* Copy */}
                    <div className={cn('w-full max-w-xl space-y-5', align === 'center' && 'mx-auto text-center')}>
                        <h1 className="type-display text-[color:var(--color-nebula-fg)]">
                            {title}
                        </h1>

                        {subtitle ? (
                            <p className={cn('type-subtitle text-lg', align === 'center' && 'mx-auto')}>
                                {subtitle}
                            </p>
                        ) : null}

                        {(ctaLabel || secondaryCtaLabel) && (
                            <div className={cn('flex flex-wrap gap-3 pt-2', align === 'center' ? 'justify-center' : 'justify-start')}>
                                {ctaLabel ? (
                                    <NebulaButton href={ctaHref}>
                                        {ctaLabel}
                                    </NebulaButton>
                                ) : null}
                                {secondaryCtaLabel ? (
                                    <NebulaButton href={secondaryCtaHref} variant="ghost">
                                        {secondaryCtaLabel}
                                    </NebulaButton>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Product mockup */}
                    <div className="relative w-full min-w-0">
                        <BrowserMock url="nebulaplan.app">
                            <div className="p-5 sm:p-6 space-y-4 bg-[var(--color-nebula-bg)]">
                                {/* top bar */}
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-36 rounded bg-[var(--color-nebula-hairline)]" />
                                    <div className="flex gap-2">
                                        <div className="h-5 w-14 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-nebula-hairline)]" />
                                        <div className="h-5 w-9 rounded-md bg-[var(--color-accent-blue)]" />
                                    </div>
                                </div>
                                {/* cards */}
                                <div className="grid grid-cols-3 gap-2.5">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-surface-elevated)] p-2.5 space-y-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-blue)] opacity-60" />
                                            <div className="h-2 w-3/4 rounded bg-[var(--color-nebula-hairline)]" />
                                            <div className="h-2 w-1/2 rounded bg-[var(--color-nebula-hairline)]" />
                                        </div>
                                    ))}
                                </div>
                                {/* chart */}
                                <div className="rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-surface-elevated)] p-3.5">
                                    <div className="mb-2.5 h-2.5 w-28 rounded bg-[var(--color-nebula-hairline)]" />
                                    <div className="flex items-end gap-2 h-16">
                                        {[35, 55, 40, 70, 50, 85, 65, 90, 60, 75].map((h, i) => (
                                            <div key={i} className="flex-1 rounded-t bg-[var(--color-accent-blue)] opacity-40" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                                {/* list rows */}
                                <div className="space-y-1.5">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-md border border-[var(--color-nebula-hairline)] bg-[var(--color-surface-elevated)] p-2">
                                            <div className="h-3.5 w-3.5 rounded bg-[var(--color-accent-green)] opacity-50" />
                                            <div className="h-2 flex-1 rounded bg-[var(--color-nebula-hairline)]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </BrowserMock>
                    </div>
                </div>
            </div>
        </section>
    );
}
