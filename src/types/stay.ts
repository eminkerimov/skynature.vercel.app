export const STAY_TYPES = [
  "Cabin",
  "Eco home",
  "Glamping",
  "Lakeside",
  "Mountain retreat",
  "Treehouse",
] as const;

export type StayType = (typeof STAY_TYPES)[number];

export type StaySort = "rating-desc" | "price-asc" | "price-desc";

export interface StayReview {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
}

export interface StayInfo {
  checkIn: string;
  checkOut: string;
  minimumNights: number;
  cancellationPolicy: string;
  houseRules: string[];
}

export interface Stay {
  id: string;
  slug: string;
  name: string;
  type: StayType;
  region: string;
  country: string;
  location: string;
  price: number;
  rating: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  amenities: string[];
  activities: string[];
  highlights: string[];
  stayInfo: StayInfo;
  reviews: StayReview[];
  relatedIds: string[];
  featured: boolean;
}

export interface StayFilters {
  query?: string;
  type?: StayType | "";
  region?: string;
  guests?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  amenities?: string[];
  sort?: StaySort;
}

export interface StayFilterState {
  query: string;
  type: StayType | "";
  region: string;
  guests: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  amenities: string[];
  sort: StaySort;
}
