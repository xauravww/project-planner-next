import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-black pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Terms of Service</h1>
                    <div className="space-y-6 text-zinc-400">
                        <p>Last updated: January 2026</p>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">2. Use of Services</h2>
                            <p>
                                You may use our services only for lawful purposes and in accordance with these Terms. You are responsible for all activity that occurs under your account.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">3. Intellectual Property</h2>
                            <p>
                                The content, features, and functionality of our services are owned by NebulaPlan and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">4. Termination</h2>
                            <p>
                                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">5. Changes to Terms</h2>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
