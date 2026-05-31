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
        title="Project planning, reimagined"
        subtitle="One home for the whole plan. Turn a rough idea into stories, an architecture map, and a shippable backlog — in minutes."
        ctaLabel="Get started"
        ctaHref="/signup"
        secondaryCtaLabel="View demo"
        secondaryCtaHref="#demo"
        align="left"
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
