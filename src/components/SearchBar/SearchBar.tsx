import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { destinations } from "../../data/stays";
import styles from "./SearchBar.module.scss";

type ActiveControl = "destination" | "checkIn" | "checkOut" | "guests" | null;

interface PopoverPosition {
  left: number;
  top: number;
  width: number;
}

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const fullDayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value: string) {
  return value ? dayFormatter.format(fromDateKey(value)) : "Add dates";
}

function getCalendarCells(month: Date) {
  const leadingDays = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1),
    ),
  ];
}

export default function SearchBar() {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLFormElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);
  const activeAnchorRef = useRef<HTMLElement | null>(null);
  const destinationListId = useId();
  const calendarTitleId = useId();
  const guestsTitleId = useId();

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [activeControl, setActiveControl] = useState<ActiveControl>(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const [focusedDate, setFocusedDate] = useState(todayKey);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({
    left: 12,
    top: 12,
    width: 320,
  });

  const filteredDestinations = useMemo(() => {
    const query = destination.trim().toLocaleLowerCase("en");
    return destinations.filter((region) =>
      region.toLocaleLowerCase("en").includes(query),
    );
  }, [destination]);

  const closePopover = useCallback((restoreFocus = false) => {
    setActiveControl(null);
    if (restoreFocus) activeAnchorRef.current?.focus();
  }, []);

  const updatePopoverPosition = useCallback(() => {
    const anchor = activeAnchorRef.current;
    if (!anchor || !activeControl) return;

    const rect = anchor.getBoundingClientRect();
    const preferredWidth =
      activeControl === "checkIn" || activeControl === "checkOut"
        ? 624
        : activeControl === "guests"
          ? 290
          : 340;
    const width = Math.min(preferredWidth, window.innerWidth - 24);
    const left = Math.min(
      Math.max(rect.left + window.scrollX, window.scrollX + 12),
      window.scrollX + window.innerWidth - width - 12,
    );

    setPopoverPosition({
      left,
      top: rect.bottom + window.scrollY + 10,
      width,
    });
  }, [activeControl]);

  const openPopover = (
    control: Exclude<ActiveControl, null>,
    anchor: HTMLElement | null,
  ) => {
    activeAnchorRef.current = anchor;
    setActiveControl(control);

    if (control === "checkIn" || control === "checkOut") {
      const initialDate =
        control === "checkOut" && checkOut
          ? fromDateKey(checkOut)
          : checkIn
            ? fromDateKey(checkIn)
            : today;
      setViewMonth(startOfMonth(initialDate));
      setFocusedDate(toDateKey(initialDate));
    }
  };

  useLayoutEffect(() => {
    if (!activeControl) return;
    updatePopoverPosition();
    const frame = window.requestAnimationFrame(updatePopoverPosition);
    return () => window.cancelAnimationFrame(frame);
  }, [activeControl, updatePopoverPosition]);

  useEffect(() => {
    if (!activeControl) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        searchRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      closePopover();
    };
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closePopover(true);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [activeControl, closePopover, updatePopoverPosition]);

  useEffect(() => {
    setActiveSuggestion(0);
  }, [destination]);

  useLayoutEffect(() => {
    if (activeControl !== "checkIn" && activeControl !== "checkOut") return;
    const frame = window.requestAnimationFrame(() => {
      popoverRef.current
        ?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)
        ?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeControl, focusedDate, viewMonth]);

  useLayoutEffect(() => {
    if (activeControl !== "guests") return;
    const frame = window.requestAnimationFrame(() => {
      popoverRef.current
        ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
        ?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeControl]);

  useEffect(() => {
    if (activeControl !== "destination") return;
    popoverRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(`${destinationListId}-${activeSuggestion}`)}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeControl, activeSuggestion, destinationListId]);

  const selectDestination = (region: string) => {
    setDestination(region);
    closePopover();
    destinationRef.current?.querySelector("input")?.focus();
  };

  const handleDestinationKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (activeControl !== "destination") {
        openPopover("destination", destinationRef.current);
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveSuggestion((current) =>
        Math.min(
          Math.max(current + direction, 0),
          Math.max(filteredDestinations.length - 1, 0),
        ),
      );
    }

    if (
      event.key === "Enter" &&
      activeControl === "destination" &&
      filteredDestinations[activeSuggestion]
    ) {
      event.preventDefault();
      selectDestination(filteredDestinations[activeSuggestion]);
    }

    if (event.key === "Escape") {
      event.stopPropagation();
      closePopover();
    }
  };

  const selectDate = (date: Date) => {
    const selected = toDateKey(date);
    setFocusedDate(selected);

    if (!checkIn || checkOut) {
      setCheckIn(selected);
      setCheckOut("");
      setActiveControl("checkOut");
      return;
    }

    if (selected <= checkIn) {
      setCheckIn(selected);
      setCheckOut("");
      return;
    }

    setCheckOut(selected);
    closePopover();
    checkOutRef.current?.querySelector("button")?.focus();
  };

  const handleDayKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    date: Date,
  ) => {
    const increments: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const increment = increments[event.key];
    if (!increment) return;

    event.preventDefault();
    const nextDate = addDays(date, increment);
    const safeDate = nextDate < today ? today : nextDate;
    const nextMonth = startOfMonth(safeDate);
    const followingMonth = addMonths(viewMonth, 1);

    if (nextMonth < viewMonth) setViewMonth(nextMonth);
    if (nextMonth > followingMonth) setViewMonth(nextMonth);
    setFocusedDate(toDateKey(safeDate));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const exactRegion = destinations.find(
      (region) => region.toLocaleLowerCase("en") === destination.trim().toLocaleLowerCase("en"),
    );

    if (exactRegion) params.set("region", exactRegion);
    else if (destination.trim()) params.set("q", destination.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    navigate(`/explore?${params.toString()}`);
  };

  const renderMonth = (month: Date) => (
    <section className={styles.month} key={month.toISOString()}>
      <h3>{monthFormatter.format(month)}</h3>
      <div className={styles.weekDays} aria-hidden="true">
        {weekDays.map((day) => <span key={day}>{day.slice(0, 1)}</span>)}
      </div>
      <div className={styles.days} role="grid" aria-label={monthFormatter.format(month)}>
        {getCalendarCells(month).map((date, index) => {
          if (!date) return <span className={styles.emptyDay} key={`empty-${index}`} />;

          const dateKey = toDateKey(date);
          const isPast = date < today;
          const isStart = dateKey === checkIn;
          const isEnd = dateKey === checkOut;
          const isInRange = Boolean(
            checkIn && checkOut && dateKey > checkIn && dateKey < checkOut,
          );
          const dayClassName = [
            styles.day,
            isStart ? styles.rangeStart : "",
            isEnd ? styles.rangeEnd : "",
            isInRange ? styles.inRange : "",
            dateKey === todayKey ? styles.today : "",
          ].filter(Boolean).join(" ");

          return (
            <button
              key={dateKey}
              type="button"
              className={dayClassName}
              disabled={isPast}
              data-date={dateKey}
              tabIndex={dateKey === focusedDate ? 0 : -1}
              aria-label={fullDayFormatter.format(date)}
              aria-selected={isStart || isEnd || isInRange}
              onFocus={() => setFocusedDate(dateKey)}
              onKeyDown={(event) => handleDayKeyDown(event, date)}
              onClick={() => selectDate(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );

  const popoverStyle: CSSProperties = {
    left: popoverPosition.left,
    top: popoverPosition.top,
    width: popoverPosition.width,
  };

  return (
    <>
      <form ref={searchRef} className={styles.search} onSubmit={handleSubmit} aria-label="Search stays">
        <div
          ref={destinationRef}
          className={`${styles.field} ${styles.destinationField} ${activeControl === "destination" ? styles.active : ""}`}
        >
          <MapPin size={19} aria-hidden="true" />
          <span>
            <label htmlFor="hero-destination">Destination</label>
            <input
              id="hero-destination"
              type="search"
              value={destination}
              role="combobox"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={activeControl === "destination"}
              aria-controls={destinationListId}
              aria-activedescendant={
                activeControl === "destination" && filteredDestinations[activeSuggestion]
                  ? `${destinationListId}-${activeSuggestion}`
                  : undefined
              }
              onFocus={() => openPopover("destination", destinationRef.current)}
              onClick={() => openPopover("destination", destinationRef.current)}
              onKeyDown={handleDestinationKeyDown}
              onChange={(event) => {
                setDestination(event.target.value);
                openPopover("destination", destinationRef.current);
              }}
              placeholder="Where do you want to go?"
            />
          </span>
        </div>

        <div
          ref={checkInRef}
          className={`${styles.field} ${activeControl === "checkIn" ? styles.active : ""}`}
        >
          <CalendarDays size={19} aria-hidden="true" />
          <span>
            <span className={styles.label}>Check-in</span>
            <button
              type="button"
              className={checkIn ? styles.hasValue : ""}
              aria-haspopup="dialog"
              aria-expanded={activeControl === "checkIn"}
              onClick={(event) => openPopover("checkIn", event.currentTarget)}
            >
              {formatDate(checkIn)}
            </button>
          </span>
        </div>

        <div
          ref={checkOutRef}
          className={`${styles.field} ${activeControl === "checkOut" ? styles.active : ""}`}
        >
          <CalendarDays size={19} aria-hidden="true" />
          <span>
            <span className={styles.label}>Check-out</span>
            <button
              type="button"
              className={checkOut ? styles.hasValue : ""}
              aria-haspopup="dialog"
              aria-expanded={activeControl === "checkOut"}
              onClick={(event) => openPopover("checkOut", event.currentTarget)}
            >
              {formatDate(checkOut)}
            </button>
          </span>
        </div>

        <div
          ref={guestsRef}
          className={`${styles.field} ${activeControl === "guests" ? styles.active : ""}`}
        >
          <Users size={19} aria-hidden="true" />
          <span>
            <span className={styles.label}>Guests</span>
            <button
              type="button"
              className={styles.hasValue}
              aria-haspopup="dialog"
              aria-expanded={activeControl === "guests"}
              onClick={(event) => openPopover("guests", event.currentTarget)}
            >
              {guests} {guests === 1 ? "guest" : "guests"}
            </button>
          </span>
        </div>

        <button className={styles.submit} type="submit">
          <Search size={20} aria-hidden="true" />
          <span>Search</span>
        </button>
      </form>

      {activeControl && createPortal(
        <div ref={popoverRef} className={styles.popover} style={popoverStyle}>
          {activeControl === "destination" && (
            <div className={styles.destinationMenu}>
              <p>Popular regions</p>
              <ul id={destinationListId} role="listbox" aria-label="Destination suggestions">
                {filteredDestinations.length > 0 ? filteredDestinations.map((region, index) => {
                  const selected = region === destination;
                  return (
                    <li key={region} role="none">
                      <button
                        id={`${destinationListId}-${index}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={index === activeSuggestion ? styles.highlighted : ""}
                        onMouseEnter={() => setActiveSuggestion(index)}
                        onClick={() => selectDestination(region)}
                      >
                        <MapPin size={17} aria-hidden="true" />
                        <span>{region}</span>
                        {selected && <Check size={16} aria-hidden="true" />}
                      </button>
                    </li>
                  );
                }) : (
                  <li className={styles.noResults}>No matching regions</li>
                )}
              </ul>
            </div>
          )}

          {(activeControl === "checkIn" || activeControl === "checkOut") && (
            <div className={styles.calendar} role="dialog" aria-labelledby={calendarTitleId}>
              <div className={styles.calendarHeader}>
                <div>
                  <h2 id={calendarTitleId}>Select your dates</h2>
                  <p>{checkIn && !checkOut ? "Now choose your check-out date" : "Choose a check-in and check-out range"}</p>
                </div>
                <div className={styles.monthNavigation}>
                  <button
                    type="button"
                    aria-label="Previous month"
                    disabled={viewMonth <= startOfMonth(today)}
                    onClick={() => setViewMonth((current) => addMonths(current, -1))}
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setViewMonth((current) => addMonths(current, 1))}
                  >
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className={styles.months}>
                {renderMonth(viewMonth)}
                {renderMonth(addMonths(viewMonth, 1))}
              </div>
              <div className={styles.dateSummary} aria-live="polite">
                <span><strong>Check-in</strong>{formatDate(checkIn)}</span>
                <ChevronRight size={16} aria-hidden="true" />
                <span><strong>Check-out</strong>{formatDate(checkOut)}</span>
              </div>
            </div>
          )}

          {activeControl === "guests" && (
            <div className={styles.guestsMenu} role="dialog" aria-labelledby={guestsTitleId}>
              <div>
                <h2 id={guestsTitleId}>Guests</h2>
                <p>Up to 8 guests</p>
              </div>
              <div className={styles.counter}>
                <button
                  type="button"
                  aria-label="Remove one guest"
                  disabled={guests === 1}
                  onClick={() => setGuests((current) => Math.max(1, current - 1))}
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <span aria-live="polite">{guests}</span>
                <button
                  type="button"
                  aria-label="Add one guest"
                  disabled={guests === 8}
                  onClick={() => setGuests((current) => Math.min(8, current + 1))}
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
