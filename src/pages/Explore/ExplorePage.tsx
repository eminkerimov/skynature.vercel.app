import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Leaf, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Filters from "../../components/Filters/Filters";
import Pagination from "../../components/Pagination/Pagination";
import StayCard from "../../components/StayCard/StayCard";
import {
  allAmenities,
  categories,
  destinations,
  stays,
} from "../../data/stays";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type {
  StayFilterState,
  StaySort,
  StayType,
} from "../../types/stay";
import { formatCurrency } from "../../utils/formatters";
import {
  DEFAULT_STAY_FILTERS,
  filterAndSortStays,
} from "../../utils/stayFilters";
import styles from "./ExplorePage.module.scss";

const ITEMS_PER_PAGE = 9;
const LOADING_DELAY = 350;
const VALID_SORTS: StaySort[] = [
  "rating-desc",
  "price-asc",
  "price-desc",
];

const parseOptionalNumber = (
  value: string | null,
  maximum?: number,
): number | null => {
  if (!value || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0 ||
    (maximum !== undefined && parsed > maximum)
  ) {
    return null;
  }

  return parsed;
};

const readFilters = (params: URLSearchParams): StayFilterState => {
  const typeParam = params.get("type") ?? "";
  const regionParam = params.get("region") ?? "";
  const sortParam = params.get("sort") ?? DEFAULT_STAY_FILTERS.sort;
  const amenityParams = (params.get("amenities") ?? "")
    .split(",")
    .map((amenity) => amenity.trim())
    .filter(
      (amenity, index, source) =>
        allAmenities.includes(amenity) && source.indexOf(amenity) === index,
    );

  return {
    query: params.get("q") ?? "",
    type: categories.includes(typeParam as StayType)
      ? (typeParam as StayType)
      : "",
    region: destinations.includes(regionParam) ? regionParam : "",
    minPrice: parseOptionalNumber(params.get("minPrice")),
    maxPrice: parseOptionalNumber(params.get("maxPrice")),
    minRating: parseOptionalNumber(params.get("rating"), 5),
    amenities: amenityParams,
    sort: VALID_SORTS.includes(sortParam as StaySort)
      ? (sortParam as StaySort)
      : DEFAULT_STAY_FILTERS.sort,
  };
};

const readPage = (params: URLSearchParams): number => {
  const parsed = Number(params.get("page"));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const writeFilters = (
  filters: StayFilterState,
  page = 1,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.query.trim()) {
    params.set("q", filters.query);
  }
  if (filters.type) {
    params.set("type", filters.type);
  }
  if (filters.region) {
    params.set("region", filters.region);
  }
  if (filters.minPrice !== null) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== null) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.minRating !== null) {
    params.set("rating", String(filters.minRating));
  }
  if (filters.amenities.length > 0) {
    params.set("amenities", filters.amenities.join(","));
  }
  if (filters.sort !== DEFAULT_STAY_FILTERS.sort) {
    params.set("sort", filters.sort);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  return params;
};

export default function ExplorePage() {
  useDocumentTitle("Explore stays");

  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const paramKey = searchParams.toString();

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const filteredStays = useMemo(
    () => filterAndSortStays(stays, filters),
    [filters],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStays.length / ITEMS_PER_PAGE),
  );
  const requestedPage = readPage(searchParams);
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleStays = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStays.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredStays]);

  useEffect(() => {
    setIsLoading(true);
    const timeout = window.setTimeout(() => setIsLoading(false), LOADING_DELAY);
    return () => window.clearTimeout(timeout);
  }, [paramKey]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const canonicalPage = currentPage > 1 ? String(currentPage) : null;

    if (pageParam !== null && pageParam !== canonicalPage) {
      setSearchParams(writeFilters(filters, currentPage), { replace: true });
    }
  }, [currentPage, filters, searchParams, setSearchParams]);

  const updateFilters = useCallback(
    (
      nextFilters: StayFilterState,
      options: { replace?: boolean } = {},
    ) => {
      setSearchParams(writeFilters(nextFilters), {
        replace: options.replace ?? false,
      });
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const closeMobileFilters = useCallback(() => {
    setMobileFiltersOpen(false);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.min(Math.max(page, 1), totalPages);
      setSearchParams(writeFilters(filters, nextPage));
      window.requestAnimationFrame(() => {
        document
          .getElementById("explore-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [filters, setSearchParams, totalPages],
  );

  const removeAmenity = (amenity: string) => {
    updateFilters({
      ...filters,
      amenities: filters.amenities.filter((item) => item !== amenity),
    });
  };

  const activeFilterCount =
    Number(Boolean(filters.query)) +
    Number(Boolean(filters.type)) +
    Number(Boolean(filters.region)) +
    Number(filters.minPrice !== null) +
    Number(filters.maxPrice !== null) +
    Number(filters.minRating !== null) +
    filters.amenities.length;

  const resultLabel =
    String(filteredStays.length) +
    " " +
    (filteredStays.length === 1 ? "stay" : "stays");

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="explore-title">
        <div className={styles.introContent}>
          <span>Curated outdoor stays</span>
          <h1 id="explore-title">Find somewhere remarkable</h1>
          <p>
            Explore quiet cabins, thoughtful eco homes, and characterful
            retreats selected for a closer connection to nature.
          </p>
        </div>
        <div className={styles.introNote} aria-label="SkyNature selection">
          <Leaf size={22} aria-hidden="true" />
          <div>
            <strong>24 handpicked places</strong>
            <span>Across 16 inspiring regions</span>
          </div>
        </div>
      </section>

      <section className={styles.catalog} aria-label="Explore stays">
        <Filters
          value={filters}
          destinations={destinations}
          amenities={allAmenities}
          resultCount={filteredStays.length}
          mobileOpen={mobileFiltersOpen}
          onChange={updateFilters}
          onReset={resetFilters}
          onCloseMobile={closeMobileFilters}
          onApplyMobile={closeMobileFilters}
        />

        <div className={styles.results}>
          <div className={styles.toolbar}>
            <div className={styles.resultSummary}>
              <strong>{resultLabel}</strong>
              <span>
                {activeFilterCount > 0
                  ? "Matching your selected filters"
                  : "Ready to explore"}
              </span>
            </div>
            <div className={styles.toolbarActions}>
              <button
                type="button"
                className={styles.mobileFilterButton}
                aria-haspopup="dialog"
                aria-expanded={mobileFiltersOpen}
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={18} aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span aria-label={String(activeFilterCount) + " active filters"}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <label className={styles.sortControl}>
                <span>Sort by</span>
                <select
                  value={filters.sort}
                  aria-label="Sort stays"
                  onChange={(event) =>
                    updateFilters({
                      ...filters,
                      sort: event.target.value as StaySort,
                    })
                  }
                >
                  <option value="rating-desc">Highest rated</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className={styles.activeFilters} aria-label="Active filters">
              {filters.query && (
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, query: "" })}
                  aria-label={"Remove search filter " + filters.query}
                >
                  Search: “{filters.query}”
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {filters.type && (
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, type: "" })}
                  aria-label={"Remove stay type filter " + filters.type}
                >
                  {filters.type}
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {filters.region && (
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, region: "" })}
                  aria-label={"Remove region filter " + filters.region}
                >
                  {filters.region}
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {filters.minPrice !== null && (
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, minPrice: null })}
                  aria-label="Remove minimum price filter"
                >
                  From {formatCurrency(filters.minPrice)}
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {filters.maxPrice !== null && (
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, maxPrice: null })}
                  aria-label="Remove maximum price filter"
                >
                  Up to {formatCurrency(filters.maxPrice)}
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {filters.minRating !== null && (
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, minRating: null })}
                  aria-label="Remove minimum rating filter"
                >
                  {filters.minRating.toFixed(1)}+ rating
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {filters.amenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  aria-label={"Remove amenity filter " + amenity}
                >
                  {amenity}
                  <X size={14} aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                className={styles.clearAll}
                onClick={resetFilters}
              >
                Clear all
              </button>
            </div>
          )}

          <div
            id="explore-results"
            className={styles.resultsAnchor}
            aria-busy={isLoading}
          >
            <span className="sr-only" role="status" aria-live="polite">
              {isLoading ? "Loading stays" : resultLabel + " found"}
            </span>

            {isLoading ? (
              <div className={styles.grid} aria-hidden="true">
                {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
                  <div className={styles.skeleton} key={index}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonBody}>
                      <div className={styles.skeletonShortLine} />
                      <div className={styles.skeletonLongLine} />
                      <div className={styles.skeletonMediumLine} />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleStays.length > 0 ? (
              <>
                <div className={styles.grid}>
                  {visibleStays.map((stay) => (
                    <StayCard key={stay.id} stay={stay} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <Leaf size={30} aria-hidden="true" />
                </span>
                <h2>No stays match these filters</h2>
                <p>
                  Try a broader region, a wider price range, or fewer
                  amenities.
                </p>
                <button type="button" onClick={resetFilters}>
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
