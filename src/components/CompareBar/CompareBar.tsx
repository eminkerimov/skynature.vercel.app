import { ArrowRight, Plus, Scale, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MAX_COMPARED_STAYS } from "../../context/CompareContext";
import { useProjectData } from "../../context/ProjectDataContext";
import { useCompare } from "../../hooks/useCompare";
import { readBookingSearch } from "../../utils/staySearch";
import CompareStayPicker from "../CompareStayPicker/CompareStayPicker";
import styles from "./CompareBar.module.scss";

export default function CompareBar() {
  const { pathname, search } = useLocation();
  const { stays } = useProjectData();
  const { ids, removeCompare, clearCompare, statusMessage, dismissStatus } = useCompare();
  const barRef = useRef<HTMLElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const visible = ids.length > 0 && pathname.replace(/\/+$/, "") !== "/compare";
  useEffect(() => {
    if (!visible || !barRef.current) return;
    const bar = barRef.current;
    const measure = () => document.documentElement.style.setProperty("--compare-bar-height", `${bar.getBoundingClientRect().height || 120}px`);
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(bar);
    return () => {
      observer?.disconnect();
      document.documentElement.style.removeProperty("--compare-bar-height");
    };
  }, [visible]);
  if (!visible) return null;

  const selected = ids.map((id) => stays.find((stay) => stay.id === id)).filter((stay) => stay !== undefined);
  const booking = readBookingSearch(search);
  const params = new URLSearchParams();
  if (booking.checkIn) params.set("checkIn", booking.checkIn);
  if (booking.checkOut) params.set("checkOut", booking.checkOut);
  if (booking.guests !== null) params.set("guests", String(booking.guests));
  const compareHref = `/compare${params.size ? `?${params}` : ""}`;

  return (
    <>
      <aside
        ref={barRef}
        className={`${styles.bar} ${pathname.startsWith("/stays/") ? styles.aboveBooking : ""}`}
        aria-label="Selected stays for comparison"
      >
        <div className={styles.content}>
          <div className={styles.summary}>
            <Scale size={21} aria-hidden="true" />
            <span aria-live="polite"><strong>{ids.length} of 3</strong> stays selected</span>
          </div>
          <ul className={styles.selected}>
            {selected.map((stay) => (
              <li key={stay.id}>
                <span title={stay.name}>{stay.name}</span>
                <button type="button" onClick={() => removeCompare(stay.id)} aria-label={`Remove ${stay.name} from comparison`}>
                  <X size={15} aria-hidden="true" />
                </button>
              </li>
            ))}
            {ids.length < MAX_COMPARED_STAYS && (
              <li className={styles.addSlot}>
                <button type="button" className={styles.addStay} onClick={() => setPickerOpen(true)}>
                  <Plus size={17} aria-hidden="true" />Add stay
                </button>
              </li>
            )}
          </ul>
          <div className={styles.actions}>
            <button type="button" className={styles.clear} onClick={clearCompare}>Clear</button>
            <Link className={styles.compare} to={compareHref}>
              Compare <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
        {statusMessage && (
          <div className={styles.status}>
            <p role="status">{statusMessage}</p>
            <button type="button" onClick={dismissStatus} aria-label="Dismiss comparison message"><X size={16} aria-hidden="true" /></button>
          </div>
        )}
      </aside>
      {pickerOpen && <CompareStayPicker onClose={() => setPickerOpen(false)} />}
    </>
  );
}
