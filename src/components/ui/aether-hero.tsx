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
 * Hero stripe — Resend rhythm.
 * Pure black canvas, no backdrop, no shader. The loudest element
 * is the serif headline; the only solid bright surface is the
 * primary white CTA. One per page.
 */
export default function AetherHero({
    title = 'Email for developers',
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
    const words = title.split(' ');
    const last = words.pop() ?? '';
    const head = words.join(' ');

    return (
        <section
            aria-label={ariaLabel}
            className={cn(
                'relative overflow-hidden bg-[var(--color-nebula-bg)]',
                align === 'center' ? 'text-center' : 'text-left',
                className,
            )}
            style={{ height }}
        >
            <div className="relative z-10 h-full w-full flex flex-col justify-center container mx-auto px-6 max-w-[1200px]">
                <div
                    className={cn(
                        'w-full max-w-3xl space-y-[var(--space-xl)]',
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
                                'type-subtitle max-w-xl reveal reveal-d-2',
                                align === 'center' && 'mx-auto',
                            )}
                        >
                            {subtitle}
                        </p>
                    ) : null}

                    {(ctaLabel || secondaryCtaLabel) && (
                        <div
                            className={cn(
                                'flex flex-wrap gap-3 pt-[var(--space-md)] reveal reveal-d-3',
                                align === 'center' ? 'justify-center' : 'justify-start',
                            )}
                        >
                            {ctaLabel ? (
                                <a href={ctaHref} className="nebula-btn nebula-btn--primary">
                                    {ctaLabel}
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
        </section>
    );
}
