import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BannerCarousel from "@/components/ui/BannerCarousel";
import FeatureIcons from "@/components/ui/FeatureIcons";
import CategoryGrid from "@/components/ui/CategoryGrid";
import FeaturedStores from "@/sections/home/FeaturedStores";
import HomeProducts from "@/sections/home/HomeProducts";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f4ee]">
      <Header />
      <section className="container-shell space-y-10 py-6 sm:py-8 md:space-y-14">
        <BannerCarousel />
        <FeatureIcons />
        <CategoryGrid />
        <FeaturedStores />
        <HomeProducts />
      </section>
      <Footer />
    </main>
  );
}
