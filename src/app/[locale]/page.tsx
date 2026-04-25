import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import WhyHomesta from "@/components/home/WhyHomesta";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import BosphorusBridge from "@/components/illustrations/BosphorusBridge";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyHomesta />
        <CTASection />
        {/* Bosphorus Bridge — slim section divider watermark */}
        <div className="relative overflow-hidden bg-white" style={{ height: 48 }}>
          <BosphorusBridge className="absolute inset-x-0 bottom-0 w-full opacity-[0.1] pointer-events-none select-none" />
        </div>
        <FeaturedCarousel />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
