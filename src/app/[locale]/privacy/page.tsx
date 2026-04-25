import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import PrivacyPage from "./PrivacyPage";

export default function PrivacyRoute() {
  return (
    <>
      <Navbar />
      <PrivacyPage />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
