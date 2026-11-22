"use client";

const ROW1 = [
    "User Stories",
    "Architecture",
    "Backlog",
    "Exports",
    "Collaboration",
];

const ROW2 = [
    "AI planning",
    "No templates",
    "Ship faster",
    "One place",
];

function MarqueeRow({ items, className }: { items: string[]; className?: string }) {
    const doubled = [...items, ...items];
    return (
        <div className="flex overflow-hidden whitespace-nowrap">
            <div className={`flex min-w-full shrink-0 items-center ${className}`}>
                {doubled.map((t, i) => (
                    <span key={i} className="mx-2 sm:mx-4 md:mx-8">
                        {t} <span className="mx-1.5 sm:mx-3 md:mx-5">✦</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

export function KineticMarquee() {
    return (
        <section className="bg-black -skew-x-2 pt-6 pb-3 overflow-hidden">
            <div className="skew-x-2">
                <MarqueeRow
                    items={ROW1}
                    className="animate-marquee text-[#FF4D00] text-[clamp(1.25rem,7vw,7rem)] font-display uppercase leading-none"
                />
                <MarqueeRow
                    items={ROW2}
                    className="animate-marquee-reverse text-white/80 text-[clamp(1rem,5.5vw,5rem)] font-display uppercase leading-none mt-2"
                />
            </div>
        </section>
    );
}
