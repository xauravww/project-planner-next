'use client';

import React from 'react';
import { cn } from '@/lib/utils';

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
 * Constellation-drift hero. CSS-only. All visual rules live in
 * `globals.css` (`@theme` tokens + `.nebula-*` utilities). This
 * component only composes them — no hardcoded colors or sizes.
 *
 * Replaces the previous WebGL shader (chess-tile + X-ray) the
 * user disliked. Same prop API as before so `page.tsx` keeps
 * compiling.
 */
export default function AetherHero({
    title = 'Make the impossible feel inevitable.',
    subtitle,
    ctaLabel = 'Get Started',
    ctaHref = '#',
    secondaryCtaLabel,
    secondaryCtaHref,
    align = 'center',
    height = '100vh',
    className = '',
    ariaLabel = 'Hero',
}: AetherHeroProps) {
    // Last word renders in italic serif — editorial accent.
    const words = title.split(' ');
    const last = words.pop() ?? '';
    const head = words.join(' ');

    return (
        <section
            aria-label={ariaLabel}
            className={cn(
                'relative overflow-hidden bg-[var(--color-nebula-bg)] nebula-backdrop',
                align === 'center' ? 'text-center' : 'text-left',
                className,
            )}
            style={{ height }}
        >
            {/* content */}
            <div
                className={cn(
                    'relative z-10 h-full w-full flex flex-col justify-center',
                    'container mx-auto px-6',
                )}
            >
                <div
                    className={cn(
                        'w-full max-w-4xl space-y-[var(--nebula-stack-md)]',
                        align === 'center' && 'mx-auto',
                    )}
                >
                    <h1 className="type-display text-[color:var(--color-nebula-fg)] reveal reveal-d-1">
                        {head}{' '}
                        <em className="type-italic-accent">{last}</em>
                    </h1>

                    {subtitle ? (
                        <p
                            className={cn(
                                'type-body max-w-xl reveal reveal-d-2',
                                align === 'center' && 'mx-auto',
                            )}
                        >
                            {subtitle}
                        </p>
                    ) : null}

                    {(ctaLabel || secondaryCtaLabel) && (
                        <div
                            className={cn(
                                'flex flex-wrap gap-3 pt-2 reveal reveal-d-3',
                                align === 'center' ? 'justify-center' : 'justify-start',
                            )}
                        >
                            {ctaLabel ? (
                                <a href={ctaHref} className="nebula-btn nebula-btn--primary">
                                    {ctaLabel}
                                    <span aria-hidden>→</span>
                                </a>
                            ) : null}
                            {secondaryCtaLabel ? (
                                <a href={secondaryCtaHref} className="nebula-btn nebula-btn--ghost">
                                    {secondaryCtaLabel}
                                </a>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* bottom fade into next section */}
            <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-32 z-[1] pointer-events-none"
                style={{
                    background:
                        'linear-gradient(180deg, transparent 0%, var(--color-nebula-bg) 100%)',
                }}
            />
        </section>
    );
}
