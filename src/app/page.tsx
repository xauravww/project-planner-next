import { Navbar } from "@/components/layout/Navbar";
import AetherHero from "@/components/ui/aether-hero";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <AetherHero
        title="Plan Like a Visionary"
        subtitle="Transform your ideas into actionable plans with our AI-powered, premium project management suite. Designed for the modern builder."
        ctaLabel="Start Building"
        ctaHref="#"
        secondaryCtaLabel="View Demo"
        secondaryCtaHref="#"
        align="center"
        overlayGradient="linear-gradient(180deg, #000000bb 0%, #00000055 40%, #000000 100%)"
      />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
