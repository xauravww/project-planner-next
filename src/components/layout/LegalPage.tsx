import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export type LegalSection = { heading: string; body: string };

type LegalPageProps = {
    title: string;
    updated: string;
    sections: LegalSection[];
};

/**
 * Shared legal-doc page (Privacy, Terms, etc). Pass title + sections;
 * layout, navbar, footer, and type all come from theme tokens.
 */
export function LegalPage({ title, updated, sections }: LegalPageProps) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[var(--color-nebula-bg)] pt-28 pb-[var(--space-xxxl)]">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h1 className="type-display-xl text-[color:var(--color-nebula-fg)] mb-3">{title}</h1>
                    <p className="type-caption mb-[var(--space-xxxl)]">Last updated: {updated}</p>

                    <div className="space-y-[var(--space-xxl)]">
                        {sections.map((s, i) => (
                            <section key={i} className="space-y-3">
                                <h2 className="type-h3">
                                    {i + 1}. {s.heading}
                                </h2>
                                <p className="type-body-lg">{s.body}</p>
                            </section>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
