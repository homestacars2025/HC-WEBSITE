import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import TermsPage from "./TermsPage";

export default function TermsRoute() {
  return (
    <>
      <Navbar />
      <TermsPage />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
