import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-black pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Privacy Policy</h1>
                    <div className="space-y-6 text-zinc-400">
                        <p>Last updated: January 2026</p>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
                            <p>
                                NebulaPlan ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our websites and services.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
                            <p>
                                We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or request customer support. This may include your name, email address, and payment information.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">4. Data Security</h2>
                            <p>
                                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">5. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at privacy@nebulaplan.com.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
