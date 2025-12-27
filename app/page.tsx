import Hero from "@/sections/Hero";
import Portfolio from "@/sections/Portfolio";
import Contact from "@/sections/Contact";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getContent } from "@/lib/content";

export default async function Home() {
  const content = await getContent();

  const whatsappPhone = process.env.WHATSAPP_PHONE_NUMBER || "";
  const whatsappMessage =
    process.env.WHATSAPP_MESSAGE || "Hello, I'm interested in your services.";

  return (
    <main>
      <Navbar />
      <Hero content={content.hero} />
      <Portfolio content={content.portfolio} />
      <Contact content={content.contact} />
      {whatsappPhone && (
        <WhatsAppButton phoneNumber={whatsappPhone} message={whatsappMessage} />
      )}
    </main>
  );
}
