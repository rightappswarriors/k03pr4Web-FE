import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LandingHero from "@/sections/landing/LandingHero";
import BannerCarousel from "@/components/ui/BannerCarousel";
import FeatureIcons from "@/components/ui/FeatureIcons";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header />
      <LandingHero />
      <section className="container-shell space-y-12 py-12">
        <BannerCarousel />
        <FeatureIcons />
      </section>
      <Footer />
    </main>
  );
}