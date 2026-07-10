import Hero from '@/components/store/Hero';
import HomeShowcase from '@/components/store/HomeShowcase';
import PromoBanner from '@/components/store/PromoBanner';
import BrandStory from '@/components/store/BrandStory';
import Testimonials from '@/components/store/Testimonials';
import TrustStrip from '@/components/store/TrustStrip';

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeShowcase />
      <PromoBanner />
      <BrandStory />
      <Testimonials />
      <TrustStrip />
    </>
  );
}
