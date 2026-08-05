import { describe, expect, it } from "vitest";
import type { Stay } from "../types/stay";
import { filterAndSortStays } from "./stayFilters";

const baseStay: Stay = {
  id: "base",
  slug: "base-stay",
  name: "Base Stay",
  type: "Cabin",
  region: "Test Region",
  country: "Test Country",
  location: "Test Region, Test Country",
  price: 200,
  rating: 4.5,
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  image: "/images/test.png",
  gallery: ["/images/test.png"],
  shortDescription: "A stay used for domain tests.",
  description: "A complete stay record used to exercise filtering and sorting.",
  amenities: ["Wi-Fi"],
  activities: ["Walking"],
  highlights: ["Quiet setting"],
  stayInfo: {
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
    minimumNights: 2,
    cancellationPolicy: "Flexible",
    houseRules: ["No smoking"],
  },
  reviews: [
    {
      id: "review-a",
      author: "Test Guest",
      date: "2026-01-01",
      rating: 5,
      comment: "A useful review.",
    },
    {
      id: "review-b",
      author: "Second Guest",
      date: "2026-01-02",
      rating: 4,
      comment: "Another useful review.",
    },
  ],
  relatedIds: [],
  featured: false,
};

const makeStay = (overrides: Partial<Stay>): Stay => ({
  ...baseStay,
  ...overrides,
});

const sampleStays: Stay[] = [
  makeStay({
    id: "mosswood",
    slug: "mosswood-ridge-cabin",
    name: "Mosswood Ridge Cabin",
    region: "Scottish Highlands",
    country: "Scotland",
    location: "Scottish Highlands, Scotland",
    price: 245,
    rating: 4.9,
    amenities: ["Wi-Fi", "Fireplace", "Private deck"],
  }),
  makeStay({
    id: "fernwatch",
    slug: "fernwatch-cabin",
    name: "Fernwatch Cabin",
    region: "Black Forest",
    country: "Germany",
    location: "Black Forest, Germany",
    price: 175,
    rating: 4.5,
    amenities: ["Wood stove", "Outdoor shower", "Private deck"],
  }),
  makeStay({
    id: "quietwater",
    slug: "quietwater-a-frame",
    name: "Quietwater A-Frame",
    type: "Lakeside",
    region: "Lake District",
    country: "England",
    location: "Lake District, England",
    price: 320,
    rating: 4.7,
    amenities: ["Wi-Fi", "Lake access", "Kayaks"],
  }),
];

describe("filterAndSortStays", () => {
  it("matches a case-insensitive query against both name and location", () => {
    expect(
      filterAndSortStays(sampleStays, { query: "MOSSWOOD" }).map(
        (stay) => stay.id,
      ),
    ).toEqual(["mosswood"]);

    expect(
      filterAndSortStays(sampleStays, { query: "lake district" }).map(
        (stay) => stay.id,
      ),
    ).toEqual(["quietwater"]);
  });

  it("combines type, region, price, rating, and every selected amenity", () => {
    const result = filterAndSortStays(sampleStays, {
      type: "Cabin",
      region: "Black Forest",
      minPrice: 150,
      maxPrice: 200,
      minRating: 4.5,
      amenities: ["Wood stove", "Outdoor shower"],
    });

    expect(result.map((stay) => stay.id)).toEqual(["fernwatch"]);
  });

  it("sorts by rating and price without mutating the source array", () => {
    const originalOrder = sampleStays.map((stay) => stay.id);

    expect(
      filterAndSortStays(sampleStays, { sort: "rating-desc" }).map(
        (stay) => stay.id,
      ),
    ).toEqual(["mosswood", "quietwater", "fernwatch"]);
    expect(
      filterAndSortStays(sampleStays, { sort: "price-asc" }).map(
        (stay) => stay.id,
      ),
    ).toEqual(["fernwatch", "mosswood", "quietwater"]);
    expect(
      filterAndSortStays(sampleStays, { sort: "price-desc" }).map(
        (stay) => stay.id,
      ),
    ).toEqual(["quietwater", "mosswood", "fernwatch"]);
    expect(sampleStays.map((stay) => stay.id)).toEqual(originalOrder);
  });
});
