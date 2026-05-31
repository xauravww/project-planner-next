import { Navbar } from "@/components/layout/Navbar";
import AetherHero from "@/components/ui/aether-hero";
import { Story } from "@/components/landing/Story";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-nebula-bg)]">
      <Navbar />
      <AetherHero
        title="Plan Like a Visionary"
        subtitle="Turn your ideas into clear, actionable plans. AI-powered project planning for modern builders."
        ctaLabel="Start Building"
        ctaHref="/signup"
        secondaryCtaLabel="View Demo"
        secondaryCtaHref="#demo"
      />
      <Story />
      <Features />
      <Demo />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
