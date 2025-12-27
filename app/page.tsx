import Hero from '@/sections/Hero';
import Portfolio from '@/sections/Portfolio';
import Contact from '@/sections/Contact';
import Navbar from '@/components/Navbar';
import { getContent } from '@/lib/content';

export default async function Home() {
  const content = await getContent();

  return (
    <main>
      <Navbar />
      <Hero content={content.hero} />
      <Portfolio content={content.portfolio} />
      <Contact content={content.contact} />
    </main>
  );
}

