import AppShell from "@/components/layouts/app-shell";
import HomeHeader from "./home-header";
import HeroSection from "./hero-section";
import RestaurantSection from "./restaurant-section";

export default function HomePage() {
  return (
    <AppShell>
      <HomeHeader />
      <HeroSection />
      <RestaurantSection />
    </AppShell>
  );
}
