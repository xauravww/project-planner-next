import Link from "next/link";

export function Logo() {
    return (
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="NebulaPlan home">
            {/* mark: node with an orbital ring + accent dot */}
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
                <circle cx="16" cy="16" r="6" fill="none" stroke="#000" strokeWidth="2" />
                <ellipse cx="16" cy="16" rx="13" ry="5" fill="none" stroke="#000" strokeWidth="2" transform="rotate(-24 16 16)" />
                <circle cx="25" cy="8" r="2.4" fill="#FF4D00" />
            </svg>
            <span className="font-mono text-sm font-bold uppercase tracking-tighter text-black">
                NebulaPlan
            </span>
        </Link>
    );
}
