import { STAY_TYPES } from "../types/stay";
import type { SkyNatureData } from "../types/projectData";

export const PROJECT_DATA_URL = "https://dbem.pages.dev/skynature/data.json";
const REQUEST_TIMEOUT = 15_000;

type JsonObject = Record<string, unknown>;
let cachedData: SkyNatureData | undefined;
let pendingRequest: Promise<SkyNatureData> | undefined;

function requireValid(condition: unknown): asserts condition {
  if (!condition) throw new Error("The project data has an invalid format.");
}

function object(value: unknown): JsonObject {
  requireValid(value !== null && typeof value === "object" && !Array.isArray(value));
  return value as JsonObject;
}

function array(value: unknown): unknown[] {
  requireValid(Array.isArray(value));
  return value;
}

function strings(value: unknown): string[] {
  const result = array(value);
  requireValid(result.every((entry) => typeof entry === "string"));
  return result as string[];
}

function textFields(value: JsonObject, fields: string[]) {
  for (const field of fields) requireValid(typeof value[field] === "string");
}

function numberField(value: JsonObject, field: string, minimum = 0, integer = false) {
  const number = value[field];
  requireValid(typeof number === "number" && Number.isFinite(number) && number >= minimum);
  if (integer) requireValid(Number.isInteger(number));
  return number;
}

function imageUrl(value: unknown) {
  requireValid(typeof value === "string");
  requireValid(new URL(value).protocol === "https:");
}

function link(value: unknown) {
  const entry = object(value);
  textFields(entry, ["label", "href"]);
  const href = entry.href as string;
  requireValid(/^\/(?!\/)|^https?:\/\/|^mailto:|^#/.test(href));
}

export function parseProjectData(payload: unknown): SkyNatureData {
  const document = object(payload);
  requireValid(document.schemaVersion === 1 && document.project === "skynature");
  const data = object(document.data);
  const stays = array(data.stays);
  const stayIds = new Set<string>();
  const slugs = new Set<string>();
  const reviewIds = new Set<string>();
  for (const value of stays) {
    const stay = object(value);
    textFields(stay, ["id", "slug", "name", "type", "region", "country", "location", "shortDescription", "description"]);
    requireValid(typeof stay.featured === "boolean");
    requireValid(STAY_TYPES.some((type) => type === stay.type));
    requireValid(!stayIds.has(stay.id as string) && !slugs.has(stay.slug as string));
    stayIds.add(stay.id as string);
    slugs.add(stay.slug as string);
    numberField(stay, "price", 0.01);
    requireValid(numberField(stay, "rating") <= 5);
    for (const field of ["maxGuests", "bedrooms", "bathrooms"]) numberField(stay, field, 1, true);
    for (const field of ["amenities", "activities", "highlights", "relatedIds"]) strings(stay[field]);
    imageUrl(stay.image);
    const gallery = strings(stay.gallery);
    requireValid(gallery.length > 0);
    gallery.forEach(imageUrl);
    const info = object(stay.stayInfo);
    textFields(info, ["checkIn", "checkOut", "cancellationPolicy"]);
    numberField(info, "minimumNights", 1, true);
    strings(info.houseRules);
    for (const rawReview of array(stay.reviews)) {
      const review = object(rawReview);
      textFields(review, ["id", "author", "date", "comment"]);
      requireValid(!reviewIds.has(review.id as string));
      reviewIds.add(review.id as string);
      requireValid(Number.isFinite(Date.parse(review.date as string)));
      requireValid(numberField(review, "rating", 1, true) <= 5);
    }
  }
  for (const rawStay of stays) {
    const stay = object(rawStay);
    requireValid(strings(stay.relatedIds).every((id) => stayIds.has(id)));
  }

  const categories = strings(data.categories);
  requireValid(categories.length > 0 && categories.every((category) => STAY_TYPES.some((type) => type === category)));
  strings(data.destinations);
  strings(data.allAmenities);
  const settings = object(data.settings);
  textFields(settings, ["locale", "currency"]);
  new Intl.NumberFormat(settings.locale as string, { style: "currency", currency: settings.currency as string });
  const booking = object(settings.booking);
  numberField(booking, "cleaningFee");
  numberField(booking, "serviceFeeRate");
  numberField(booking, "defaultGuests", 1, true);
  const search = object(settings.search);
  const minGuests = numberField(search, "minGuests", 1, true);
  const maxGuests = numberField(search, "maxGuests", minGuests, true);
  const defaultGuests = numberField(search, "defaultGuests", minGuests, true);
  requireValid(defaultGuests <= maxGuests);
  const catalog = object(settings.catalog);
  numberField(catalog, "pageSize", 1, true);
  requireValid(["rating-desc", "price-asc", "price-desc"].includes(catalog.defaultSort as string));
  requireValid(array(catalog.ratingOptions).every((rating) => typeof rating === "number" && Number.isFinite(rating) && rating >= 0 && rating <= 5));
  numberField(catalog, "priceStep", 0.01);
  const bounds = object(catalog.priceBounds);
  requireValid(numberField(bounds, "max") >= numberField(bounds, "min"));

  const site = object(data.site);
  textFields(site, ["name", "tagline", "footerTagline"]);
  requireValid(typeof site.isDemo === "boolean");
  textFields(object(site.contacts), ["hello", "partners", "help"]);
  array(site.social).forEach(link);
  const navigation = object(site.navigation);
  for (const rawItem of array(navigation.header)) {
    const item = object(rawItem);
    textFields(item, ["to", "label"]);
    requireValid(typeof item.end === "boolean" && /^\/(?!\/)/.test(item.to as string));
  }
  link(navigation.saved);
  for (const rawGroup of array(navigation.footer)) {
    const group = object(rawGroup);
    textFields(group, ["title"]);
    array(group.links).forEach(link);
  }

  const home = object(data.home);
  const hero = object(home.hero);
  textFields(hero, ["alt", "badge", "title", "description"]);
  imageUrl(hero.image);
  const categoryDetails = object(home.categoryDetails);
  for (const category of categories) textFields(object(categoryDetails[category]), ["icon", "description"]);
  for (const rawDestination of array(home.destinationVisuals)) {
    const destination = object(rawDestination);
    textFields(destination, ["region", "alt"]);
    imageUrl(destination.image);
  }
  for (const rawBenefit of array(home.benefits)) textFields(object(rawBenefit), ["icon", "title", "copy"]);
  for (const rawStep of array(home.steps)) textFields(object(rawStep), ["icon", "number", "title", "copy"]);
  for (const rawQuote of array(home.testimonials)) textFields(object(rawQuote), ["quote", "author", "initials"]);
  const sections = object(home.sections);
  for (const key of ["categories", "destinations", "steps", "testimonials"]) {
    textFields(object(sections[key]), ["eyebrow", "title", "description"]);
  }
  const featured = object(sections.featured);
  textFields(featured, ["eyebrow", "title", "linkLabel", "href"]);
  link({ label: featured.linkLabel, href: featured.href });
  numberField(featured, "limit", 1, true);
  const benefits = object(sections.benefits);
  textFields(benefits, ["eyebrow", "title", "description", "linkLabel", "href"]);
  link({ label: benefits.linkLabel, href: benefits.href });
  const cta = object(home.cta);
  textFields(cta, ["eyebrow", "title", "description", "label", "href"]);
  link(cta);

  const images = array(data.images);
  const imageUrls = new Set<string>();
  for (const rawImage of images) {
    const image = object(rawImage);
    textFields(image, ["id", "kind", "fileName", "alt", "description", "aspectRatio", "source"]);
    imageUrl(image.url);
    requireValid(!imageUrls.has(image.url as string));
    imageUrls.add(image.url as string);
  }
  for (const rawStay of stays) {
    const stay = object(rawStay);
    requireValid(imageUrls.has(stay.image as string) && strings(stay.gallery).every((url) => imageUrls.has(url)));
  }
  const numbers = object(data.numbers);
  for (const key of ["stays", "regions", "categories", "reviews", "images"]) numberField(numbers, key, 0, true);

  const result = data as unknown as SkyNatureData;
  // Facets and counts follow the catalogue if an owner edits only the stays.
  const destinations = [...new Set(result.stays.map((stay) => stay.region))].sort();
  const allAmenities = [...new Set(result.stays.flatMap((stay) => stay.amenities))].sort();
  return {
    ...result,
    destinations,
    allAmenities,
    numbers: {
      stays: result.stays.length,
      regions: destinations.length,
      categories: result.categories.length,
      reviews: result.stays.reduce((total, stay) => total + stay.reviews.length, 0),
      images: result.images.length,
    },
  };
}

export function getCachedProjectData() {
  return cachedData;
}

export function loadProjectData(): Promise<SkyNatureData> {
  if (cachedData) return Promise.resolve(cachedData);
  if (pendingRequest) return pendingRequest;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  pendingRequest = (async () => {
    try {
      const response = await fetch(PROJECT_DATA_URL, {
        signal: controller.signal,
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(`Project data request failed (${response.status}).`);
      const result = parseProjectData(await response.json());
      cachedData = result;
      return result;
    } finally {
      window.clearTimeout(timeout);
      pendingRequest = undefined;
    }
  })();
  return pendingRequest;
}
