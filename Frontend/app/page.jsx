import Hero from '@/components/store/Hero';
import HomeShowcase from '@/components/store/HomeShowcase';
import PromoBanner from '@/components/store/PromoBanner';
import BrandStory from '@/components/store/BrandStory';
import Testimonials from '@/components/store/Testimonials';
import TrustStrip from '@/components/store/TrustStrip';
import Reveal from '@/components/ui/Reveal';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Reveal><HomeShowcase /></Reveal>
      <Reveal><PromoBanner /></Reveal>
      <Reveal><BrandStory /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><TrustStrip /></Reveal>
    </>
  );
}
