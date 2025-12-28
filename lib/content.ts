// Sistema de contenido basado en Vercel KV con fallback a archivos JSON
// Prioriza Vercel KV para persistencia en producción, usa archivos JSON como fallback

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { SiteContent, HeroContent, PortfolioContent, ContactContent } from '@/types/cms';
import { getContentFromKV, isKVConfigured } from './kv';

// Contenido por defecto (fallback si no se pueden leer los JSONs)
export const defaultContent: SiteContent = {
  hero: {
    title: 'Where\nElegance Moves\nin constant motion.',
    ctaText: 'Request access',
    ctaLink: '#contact',
    images: [
      '/video-hero-1.mp4',
      '/video-hero-2.mp4',
    ],
  },
  portfolio: {
    title: 'MOVEMENT is THE LANGUAGE,\nMEANING is our DESTINATION.',
    subtitle: 'Elegance is not static. It moves.',
    items: [
      {
        id: '1',
        title: 'Proyecto 1',
        description: 'Descripción del proyecto 1',
        image: '/proyecto-1.jpg',
        tags: ['Web', 'Design'],
      },
      {
        id: '2',
        title: 'Proyecto 2',
        description: 'Descripción del proyecto 2',
        image: '/proyecto-2.jpg',
        tags: ['Mobile', 'App'],
      },
      {
        id: '3',
        title: 'Proyecto 3',
        description: 'Descripción del proyecto 3',
        image: '/proyecto-3.jpg',
        tags: ['Branding', 'Identity'],
      },
      {
        id: '4',
        title: 'Proyecto 4',
        description: 'Descripción del proyecto 4',
        image: '/proyecto-4.jpg',
        tags: ['Luxury', 'Fashion'],
      },
      {
        id: '5',
        title: 'Proyecto 5',
        description: 'Descripción del proyecto 5',
        image: '/proyecto-5.jpg',
        tags: ['Lifestyle', 'Editorial'],
      },
      {
        id: '6',
        title: 'Proyecto 6',
        description: 'Descripción del proyecto 6',
        image: '/proyecto-6.jpg',
        tags: ['Art', 'Culture'],
      },
    ],
  },
  contact: {
    title: 'Request access',
    subtitle: 'We work with a limited number of brands.\nIf our vision resonates, write to us.',
    email: 'hello@themovingsociety.com',
    instagram: 'https://instagram.com',
  },
};

// Función helper para leer archivos JSON
async function readJsonFile<T>(filename: string): Promise<T | null> {
  try {
    const filePath = join(process.cwd(), 'content', filename);
    const fileContents = await readFile(filePath, 'utf-8');
    return JSON.parse(fileContents) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

// Función principal para obtener contenido
// Prioriza Vercel KV, luego archivos JSON, finalmente contenido por defecto
export async function getContent(): Promise<SiteContent> {
  try {
    // Intentar obtener desde KV si está configurado
    if (isKVConfigured()) {
      const [heroKV, portfolioKV, contactKV] = await Promise.all([
        getContentFromKV<HeroContent>('hero'),
        getContentFromKV<PortfolioContent>('portfolio'),
        getContentFromKV<ContactContent>('contact'),
      ]);


      if (heroKV !== null || portfolioKV !== null || contactKV !== null) {
        return {
          hero: heroKV || defaultContent.hero,
          portfolio: portfolioKV || defaultContent.portfolio,
          contact: contactKV || defaultContent.contact,
        };
      }
    }

    // Fallback a archivos JSON
    const [hero, portfolio, contact] = await Promise.all([
      readJsonFile<HeroContent>('hero.json'),
      readJsonFile<PortfolioContent>('portfolio.json'),
      readJsonFile<ContactContent>('contact.json'),
    ]);

    return {
      hero: hero || defaultContent.hero,
      portfolio: portfolio || defaultContent.portfolio,
      contact: contact || defaultContent.contact,
    };
  } catch (error) {
    return defaultContent;
  }
}

