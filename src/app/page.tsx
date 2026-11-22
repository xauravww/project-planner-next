import { KineticNav } from "@/components/kinetic/KineticNav";
import { KineticHero } from "@/components/kinetic/KineticHero";
import { KineticMarquee } from "@/components/kinetic/KineticMarquee";
import { KineticFeatures } from "@/components/kinetic/KineticFeatures";
import { KineticPricing } from "@/components/kinetic/KineticPricing";
import { KineticHow } from "@/components/kinetic/KineticHow";
import { KineticFAQ } from "@/components/kinetic/KineticFAQ";
import { KineticCTA } from "@/components/kinetic/KineticCTA";
import { KineticFooter } from "@/components/kinetic/KineticFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      <KineticNav />
      <main>
        <KineticHero />
        <KineticMarquee />
        <KineticFeatures />
        <KineticPricing />
        <KineticHow />
        <KineticFAQ />
        <KineticCTA />
      </main>
      <KineticFooter />
    </div>
  );
}
