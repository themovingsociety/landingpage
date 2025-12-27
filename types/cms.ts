
export interface HeroContent {
    title: string;
    subtitle?: string;
    ctaText: string;
    ctaLink: string;
    images?: string[];
}

export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    image: string;
    link?: string;
    tags?: string[];
}

export interface PortfolioContent {
    title: string;
    subtitle: string;
    items: PortfolioItem[];
}

export interface ContactContent {
    title: string;
    subtitle: string;
    email: string;
    instagram?: string;
}

export interface SiteContent {
    hero: HeroContent;
    portfolio: PortfolioContent;
    contact: ContactContent;
}

