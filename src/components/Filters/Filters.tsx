import { useEffect, useRef } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type { StayFilterState } from "../../types/stay";
import { useProjectData } from "../../context/ProjectDataContext";
import { formatCurrency } from "../../utils/formatters";
import styles from "./Filters.module.scss";

interface ChangeOptions {
  replace?: boolean;
}

interface FiltersProps {
  value: StayFilterState;
  destinations: string[];
  amenities: string[];
  resultCount: number;
  mobileOpen: boolean;
  onChange: (value: StayFilterState, options?: ChangeOptions) => void;
  onReset: () => void;
  onCloseMobile: () => void;
  onApplyMobile: () => void;
}

interface FilterFieldsProps {
  idPrefix: string;
  value: StayFilterState;
  destinations: string[];
  amenities: string[];
  onChange: FiltersProps["onChange"];
}

function FilterFields({
  idPrefix,
  value,
  destinations,
  amenities,
  onChange,
}: FilterFieldsProps) {
  const { categories, settings } = useProjectData();
  const { priceBounds, priceStep, ratingOptions } = settings.catalog;

  const setValue = <Key extends keyof StayFilterState,>(
    key: Key,
    nextValue: StayFilterState[Key],
    options?: ChangeOptions,
  ) => {
    onChange({ ...value, [key]: nextValue }, options);
  };

  const toggleAmenity = (amenity: string) => {
    const nextAmenities = value.amenities.includes(amenity)
      ? value.amenities.filter((item) => item !== amenity)
      : [...value.amenities, amenity];

    setValue("amenities", nextAmenities);
  };

  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label htmlFor={idPrefix + "-query"}>Search stays</label>
        <div className={styles.searchInput}>
          <Search size={18} aria-hidden="true" />
          <input
            id={idPrefix + "-query"}
            type="search"
            value={value.query}
            placeholder="Name or location"
            autoComplete="off"
            onChange={(event) =>
              setValue("query", event.target.value, { replace: true })
            }
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={idPrefix + "-type"}>Stay type</label>
        <select
          id={idPrefix + "-type"}
          value={value.type}
          onChange={(event) =>
            setValue("type", event.target.value as StayFilterState["type"])
          }
        >
          <option value="">All stay types</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={idPrefix + "-region"}>Region</label>
        <select
          id={idPrefix + "-region"}
          value={value.region}
          onChange={(event) => setValue("region", event.target.value)}
        >
          <option value="">All regions</option>
          {destinations.map((destination) => (
            <option key={destination} value={destination}>
              {destination}
            </option>
          ))}
        </select>
      </div>

      <fieldset className={styles.priceGroup}>
        <legend>Price per night</legend>
        <div className={styles.priceInputs}>
          <label htmlFor={idPrefix + "-min-price"}>
            <span>Minimum</span>
            <input
              id={idPrefix + "-min-price"}
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              step={priceStep}
              inputMode="numeric"
              placeholder={formatCurrency(priceBounds.min, settings.locale, settings.currency)}
              value={value.minPrice ?? ""}
              onChange={(event) =>
                setValue(
                  "minPrice",
                  event.target.value ? Number(event.target.value) : null,
                  { replace: true },
                )
              }
            />
          </label>
          <span className={styles.priceSeparator} aria-hidden="true">
            —
          </span>
          <label htmlFor={idPrefix + "-max-price"}>
            <span>Maximum</span>
            <input
              id={idPrefix + "-max-price"}
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              step={priceStep}
              inputMode="numeric"
              placeholder={formatCurrency(priceBounds.max, settings.locale, settings.currency)}
              value={value.maxPrice ?? ""}
              onChange={(event) =>
                setValue(
                  "maxPrice",
                  event.target.value ? Number(event.target.value) : null,
                  { replace: true },
                )
              }
            />
          </label>
        </div>
      </fieldset>

      <div className={styles.field}>
        <label htmlFor={idPrefix + "-rating"}>Minimum rating</label>
        <select
          id={idPrefix + "-rating"}
          value={value.minRating ?? ""}
          onChange={(event) =>
            setValue(
              "minRating",
              event.target.value ? Number(event.target.value) : null,
            )
          }
        >
          <option value="">Any rating</option>
          {ratingOptions.map((rating) => (
            <option key={rating} value={rating}>{rating.toFixed(1)} and above</option>
          ))}
        </select>
      </div>

      <fieldset className={styles.amenities}>
        <legend>Amenities</legend>
        <div className={styles.amenityList}>
          {amenities.map((amenity) => (
            <label key={amenity} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={value.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              <span aria-hidden="true" />
              {amenity}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export default function Filters({
  value,
  destinations,
  amenities,
  resultCount,
  mobileOpen,
  onChange,
  onReset,
  onCloseMobile,
  onApplyMobile,
}: FiltersProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.classList.add("modal-open");
    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseMobile();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
      previouslyFocused?.focus();
    };
  }, [mobileOpen, onCloseMobile]);

  const overlayClassName =
    styles.overlay + (mobileOpen ? " " + styles.overlayOpen : "");
  const drawerClassName =
    styles.drawer + (mobileOpen ? " " + styles.drawerOpen : "");

  return (
    <>
      <aside className={styles.desktopPanel} aria-label="Stay filters">
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>Refine your trip</span>
            <h2>Filters</h2>
          </div>
          <button type="button" className={styles.resetLink} onClick={onReset}>
            Reset
          </button>
        </div>
        <FilterFields
          idPrefix="desktop-filter"
          value={value}
          destinations={destinations}
          amenities={amenities}
          onChange={onChange}
        />
      </aside>

      <button
        type="button"
        className={overlayClassName}
        aria-label="Close filters"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={onCloseMobile}
      />
      <aside
        ref={drawerRef}
        className={drawerClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-title"
        aria-hidden={!mobileOpen}
        {...(!mobileOpen ? { inert: true } : {})}
      >
        <div className={styles.drawerHeading}>
          <div>
            <span className={styles.eyebrow}>Find your place</span>
            <h2 id="mobile-filter-title">
              <SlidersHorizontal size={20} aria-hidden="true" />
              Filters
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            aria-label="Close filters"
            onClick={onCloseMobile}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.drawerBody}>
          <FilterFields
            idPrefix="mobile-filter"
            value={value}
            destinations={destinations}
            amenities={amenities}
            onChange={onChange}
          />
        </div>
        <div className={styles.drawerActions}>
          <button type="button" className={styles.resetButton} onClick={onReset}>
            <RotateCcw size={17} aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            className={styles.applyButton}
            onClick={onApplyMobile}
          >
            Show {resultCount} {resultCount === 1 ? "stay" : "stays"}
          </button>
        </div>
      </aside>
    </>
  );
}
