import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import AboutPage from "./AboutPage";

export default function AboutRoute() {
  return (
    <>
      <Navbar />
      <AboutPage />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
