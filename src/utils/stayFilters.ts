import type {
  Stay,
  StayFilters,
  StayFilterState,
  StaySort,
} from "../types/stay";

export const DEFAULT_STAY_FILTERS: StayFilterState = {
  query: "",
  type: "",
  region: "",
  minPrice: null,
  maxPrice: null,
  minRating: null,
  amenities: [],
  sort: "rating-desc",
};

const normalize = (value: string): string => value.trim().toLocaleLowerCase("en");

const includesEveryAmenity = (
  stayAmenities: string[],
  selectedAmenities: string[],
): boolean => {
  const normalizedStayAmenities = new Set(stayAmenities.map(normalize));

  return selectedAmenities.every((amenity) =>
    normalizedStayAmenities.has(normalize(amenity)),
  );
};

const compareStays = (sort: StaySort) => (first: Stay, second: Stay): number => {
  if (sort === "price-asc") {
    return first.price - second.price || second.rating - first.rating;
  }

  if (sort === "price-desc") {
    return second.price - first.price || second.rating - first.rating;
  }

  return second.rating - first.rating || first.price - second.price;
};

export const filterAndSortStays = (
  source: readonly Stay[],
  filters: StayFilters = {},
): Stay[] => {
  const query = normalize(filters.query ?? "");
  const type = filters.type ?? "";
  const region = normalize(filters.region ?? "");
  const selectedAmenities = (filters.amenities ?? []).filter(Boolean);
  const sort = filters.sort ?? DEFAULT_STAY_FILTERS.sort;

  return source
    .filter((stay) => {
      const searchableLocation = [
        stay.name,
        stay.location,
        stay.region,
        stay.country,
      ]
        .map(normalize)
        .join(" ");

      const matchesQuery = !query || searchableLocation.includes(query);
      const matchesType = !type || stay.type === type;
      const matchesRegion = !region || normalize(stay.region) === region;
      const matchesMinPrice =
        filters.minPrice == null || stay.price >= filters.minPrice;
      const matchesMaxPrice =
        filters.maxPrice == null || stay.price <= filters.maxPrice;
      const matchesRating =
        filters.minRating == null || stay.rating >= filters.minRating;
      const matchesAmenities = includesEveryAmenity(
        stay.amenities,
        selectedAmenities,
      );

      return (
        matchesQuery &&
        matchesType &&
        matchesRegion &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesRating &&
        matchesAmenities
      );
    })
    .sort(compareStays(sort));
};
