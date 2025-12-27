// Contenido por defecto (mock data)
// Cuando se integre el CMS, esto se reemplazará con llamadas a la API

import type { SiteContent } from '@/types/cms';

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
        image: '/placeholder-project.jpg',
        tags: ['Web', 'Design'],
      },
      {
        id: '2',
        title: 'Proyecto 2',
        description: 'Descripción del proyecto 2',
        image: '/placeholder-project.jpg',
        tags: ['Mobile', 'App'],
      },
      {
        id: '3',
        title: 'Proyecto 3',
        description: 'Descripción del proyecto 3',
        image: '/placeholder-project.jpg',
        tags: ['Branding', 'Identity'],
      },
      {
        id: '4',
        title: 'Proyecto 4',
        description: 'Descripción del proyecto 4',
        image: '/placeholder-project.jpg',
        tags: ['Luxury', 'Fashion'],
      },
      {
        id: '5',
        title: 'Proyecto 5',
        description: 'Descripción del proyecto 5',
        image: '/placeholder-project.jpg',
        tags: ['Lifestyle', 'Editorial'],
      },
      {
        id: '6',
        title: 'Proyecto 6',
        description: 'Descripción del proyecto 6',
        image: '/placeholder-project.jpg',
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

// Función helper para obtener contenido (preparada para CMS)
export async function getContent(): Promise<SiteContent> {
  // Por ahora retorna contenido por defecto
  // Aquí se hará la llamada al CMS cuando esté listo
  return defaultContent;
}

