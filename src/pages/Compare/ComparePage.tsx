import { ArrowLeft, ArrowRight, Plus, Scale, Star, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MAX_COMPARED_STAYS } from "../../context/CompareContext";
import { useProjectData } from "../../context/ProjectDataContext";
import { useCompare } from "../../hooks/useCompare";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { formatCurrency } from "../../utils/formatters";
import { createStayHref, readBookingSearch } from "../../utils/staySearch";
import Badge from "../../components/Badge/Badge";
import CompareStayPicker from "../../components/CompareStayPicker/CompareStayPicker";
import styles from "./ComparePage.module.scss";

export default function ComparePage() {
  useDocumentTitle("Compare stays");
  const { search } = useLocation();
  const navigate = useNavigate();
  const { stays, images, settings } = useProjectData();
  const { ids, removeCompare, clearCompare } = useCompare();
  const [pickerOpen, setPickerOpen] = useState(false);
  const selected = ids.map((id) => stays.find((stay) => stay.id === id)).filter((stay) => stay !== undefined);
  const openPicker = () => setPickerOpen(true);
  const booking = readBookingSearch(search);
  const bookingParams = new URLSearchParams();
  if (booking.checkIn) bookingParams.set("checkIn", booking.checkIn);
  if (booking.checkOut) bookingParams.set("checkOut", booking.checkOut);
  if (booking.guests !== null) bookingParams.set("guests", String(booking.guests));
  const exploreHref = `/explore${bookingParams.size ? `?${bookingParams}` : ""}`;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Badge>Your places, side by side</Badge>
          <h1>Compare stays</h1>
          <p>See the details together and find the place that fits your escape. Choose up to three stays to compare.</p>
        </div>
      </header>
      <div className={`${styles.container} ${styles.content}`}>
        {selected.length ? (
          <>
            <div className={styles.toolbar}>
              <div className={styles.toolbarLinks}>
                {selected.length < MAX_COMPARED_STAYS && (
                  <button type="button" className={styles.addStay} onClick={openPicker}>
                    <Plus size={18} aria-hidden="true" /> Add another stay
                  </button>
                )}
                <Link to={exploreHref}><ArrowLeft size={17} aria-hidden="true" />Keep exploring</Link>
              </div>
              <button type="button" onClick={clearCompare}>Clear comparison</button>
            </div>
            {selected.length === 1 && <p className={styles.hint}>Add a second stay to compare prices, space, and amenities.</p>}
            <div className={styles.tableScroll} data-count={selected.length} role="region" aria-label="Stay comparison" tabIndex={0}>
              <table className={styles.table} style={{ minWidth: 170 + selected.length * 240 }}>
                <caption className="sr-only">Compare prices, space, amenities, and cancellation policies for {selected.length} selected stays.</caption>
                <thead>
                  <tr>
                    <th scope="col" className={styles.labelColumn}>The details</th>
                    {selected.map((stay) => (
                      <th scope="col" key={stay.id}>
                        <div className={styles.stayHeading}>
                          <button type="button" className={styles.remove} onClick={() => removeCompare(stay.id)} aria-label={`Remove ${stay.name} from comparison`}><X size={18} aria-hidden="true" /></button>
                          <Link to={createStayHref(stay.slug, search)}>
                            <img src={stay.image} alt={images.find((image) => image.url === stay.image)?.alt ?? stay.name} />
                            <span className={styles.type}>{stay.type}</span>
                            <h2>{stay.name}</h2>
                          </Link>
                          <p>{stay.location}</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr><th scope="row">Price / night</th>{selected.map((stay) => <td key={stay.id} className={styles.price}>{formatCurrency(stay.price, settings.locale, settings.currency)}</td>)}</tr>
                  <tr><th scope="row">Guests</th>{selected.map((stay) => <td key={stay.id}>Up to {stay.maxGuests}</td>)}</tr>
                  <tr><th scope="row">Bedrooms</th>{selected.map((stay) => <td key={stay.id}>{stay.bedrooms}</td>)}</tr>
                  <tr><th scope="row">Bathrooms</th>{selected.map((stay) => <td key={stay.id}>{stay.bathrooms}</td>)}</tr>
                  <tr><th scope="row">Guest rating</th>{selected.map((stay) => <td key={stay.id}><span className={styles.rating}><Star size={15} fill="currentColor" aria-hidden="true" />{stay.rating.toFixed(1)} / 5</span><small>{stay.reviews.length} reviews</small></td>)}</tr>
                  <tr><th scope="row">Amenities</th>{selected.map((stay) => <td key={stay.id}><ul className={styles.amenities}>{stay.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}</ul></td>)}</tr>
                  <tr><th scope="row">Minimum stay</th>{selected.map((stay) => <td key={stay.id}>{stay.stayInfo.minimumNights} nights</td>)}</tr>
                  <tr><th scope="row">Cancellation</th>{selected.map((stay) => <td key={stay.id} className={styles.policy}>{stay.stayInfo.cancellationPolicy}</td>)}</tr>
                  <tr>
                    <th scope="row">Your next step</th>
                    {selected.map((stay) => (
                      <td key={stay.id}>
                        <div className={styles.stayActions}>
                          <Link to={createStayHref(stay.slug, search)}>View stay <ArrowRight size={16} aria-hidden="true" /></Link>
                          <button type="button" onClick={() => { removeCompare(stay.id); navigate(exploreHref); }} aria-label={`Change ${stay.name}`}>Change stay</button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <section className={styles.empty} aria-labelledby="compare-empty-title">
            <span className={styles.emptyIcon}><Scale size={35} strokeWidth={1.5} aria-hidden="true" /></span>
            <h2 id="compare-empty-title">Find your perfect match</h2>
            <p>Choose up to three places. Their prices, space, and amenities will appear here together.</p>
            <div className={styles.emptyActions}>
              <button type="button" className={styles.addStay} onClick={openPicker}><Plus size={18} aria-hidden="true" />Choose stays</button>
              <Link to={exploreHref}>Explore stays <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </section>
        )}
      </div>
      {pickerOpen && <CompareStayPicker onClose={() => setPickerOpen(false)} />}
    </main>
  );
}
