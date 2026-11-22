import type { Stay, StaySort, StayType } from "./stay";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface HomeSection {
  eyebrow: string;
  title: string;
  description: string;
}

export interface SkyNatureData {
  site: {
    name: string;
    tagline: string;
    footerTagline: string;
    isDemo: boolean;
    contacts: { hello: string; partners: string; help: string };
    social: ProjectLink[];
    navigation: {
      header: { to: string; label: string; end: boolean }[];
      saved: ProjectLink;
      footer: { title: string; links: ProjectLink[] }[];
    };
  };
  settings: {
    locale: string;
    currency: string;
    booking: { cleaningFee: number; serviceFeeRate: number; defaultGuests: number };
    search: { minGuests: number; maxGuests: number; defaultGuests: number };
    catalog: {
      pageSize: number;
      defaultSort: StaySort;
      ratingOptions: number[];
      priceStep: number;
      priceBounds: { min: number; max: number };
    };
    imageGeneration: {
      style: string;
      aspectRatio: string;
      format: string;
      imagesPerStay: number;
      imageOrder: string[];
      landscapeImageCount: number;
    };
  };
  home: {
    hero: { image: string; alt: string; badge: string; title: string; description: string };
    categoryDetails: Record<StayType, { icon: string; description: string }>;
    destinationVisuals: { region: string; image: string; alt: string }[];
    benefits: { icon: string; title: string; copy: string }[];
    steps: { icon: string; number: string; title: string; copy: string }[];
    testimonials: { quote: string; author: string; initials: string }[];
    sections: {
      categories: HomeSection;
      featured: { eyebrow: string; title: string; linkLabel: string; href: string; limit: number };
      destinations: HomeSection;
      benefits: HomeSection & { linkLabel: string; href: string };
      steps: HomeSection;
      testimonials: HomeSection;
    };
    cta: { eyebrow: string; title: string; description: string; label: string; href: string };
  };
  numbers: { stays: number; regions: number; categories: number; reviews: number; images: number };
  stays: Stay[];
  categories: StayType[];
  destinations: string[];
  allAmenities: string[];
  images: {
    id: string;
    stayId: string | null;
    kind: string;
    source: string;
    fileName: string;
    url: string;
    alt: string;
    description: string;
    aspectRatio: string;
    referenceImageId: string | null;
  }[];
}

export interface SkyNatureDocument {
  schemaVersion: 1;
  project: "skynature";
  data: SkyNatureData;
}
