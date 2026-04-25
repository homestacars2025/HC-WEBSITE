import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import ContactPage from "./ContactPage";

export default function ContactRoute() {
  return (
    <>
      <Navbar />
      <ContactPage />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
