import { useState } from "react";
import {
  Activity,
  Bath,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  Heart,
  Home,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { stays } from "../../data/stays";
import { useFavorites } from "../../hooks/useFavorites";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { formatCurrency, formatDate } from "../../utils/formatters";
import Badge from "../../components/Badge/Badge";
import BookingModal from "../../components/BookingModal/BookingModal";
import StayCard from "../../components/StayCard/StayCard";
import styles from "./StayPage.module.scss";

export default function StayPage() {
  const { slug } = useParams();
  const stay = stays.find((item) => item.slug === slug);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  useDocumentTitle(stay?.name ?? "Stay not found");

  if (!stay) {
    return (
      <section className={styles.notFound}>
        <span>404</span>
        <h1>This stay has wandered off the trail</h1>
        <p>It may no longer be available, or the address might be incorrect.</p>
        <Link to="/explore">Explore all stays</Link>
      </section>
    );
  }

  const saved = isFavorite(stay.id);
  const related = stay.relatedIds
    .map((id) => stays.find((item) => item.id === id))
    .filter((item): item is (typeof stays)[number] => Boolean(item));

  return (
    <>
      <main className={styles.page}>
        <div className={styles.breadcrumbs}>
          <Link to="/explore"><ChevronLeft size={16} aria-hidden="true" />Back to explore</Link>
          <span>Stays / {stay.region}</span>
        </div>

        <header className={styles.heading}>
          <div>
            <Badge tone="green">{stay.type}</Badge>
            <h1>{stay.name}</h1>
            <p>
              <span><MapPin size={16} aria-hidden="true" />{stay.location}</span>
              <span><Star size={16} fill="currentColor" aria-hidden="true" />{stay.rating.toFixed(1)} · {stay.reviews.length} reviews</span>
            </p>
          </div>
          <button
            type="button"
            className={`${styles.saveButton} ${saved ? styles.saved : ""}`}
            onClick={() => toggleFavorite(stay.id)}
            aria-pressed={saved}
          >
            <Heart size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
            {saved ? "Saved" : "Save stay"}
          </button>
        </header>

        <section className={styles.gallery} aria-label={`${stay.name} photo gallery`}>
          {stay.gallery.slice(0, 5).map((image, index) => (
            <figure key={`${image}-${index}`}>
              <img
                src={image}
                alt={`${stay.name} ${index === 0 ? "exterior" : `gallery view ${index + 1}`}`}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </figure>
          ))}
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.content}>
            <section className={styles.overview} aria-labelledby="overview-title">
              <div className={styles.quickFacts}>
                <span><Users size={21} aria-hidden="true" /><strong>{stay.maxGuests}</strong> guests</span>
                <span><BedDouble size={21} aria-hidden="true" /><strong>{stay.bedrooms}</strong> bedrooms</span>
                <span><Bath size={21} aria-hidden="true" /><strong>{stay.bathrooms}</strong> bathrooms</span>
                <span><Home size={21} aria-hidden="true" /><strong>{stay.type}</strong></span>
              </div>
              <p className={styles.eyebrow}>The stay</p>
              <h2 id="overview-title">Space to settle into a slower rhythm</h2>
              <p className={styles.description}>{stay.description}</p>
            </section>

            <section className={styles.section} aria-labelledby="highlights-title">
              <div className={styles.sectionHeading}>
                <Sparkles size={21} aria-hidden="true" />
                <div><p>Why it feels special</p><h2 id="highlights-title">Stay highlights</h2></div>
              </div>
              <div className={styles.highlights}>
                {stay.highlights.map((highlight, index) => (
                  <article key={highlight}>
                    <span>0{index + 1}</span>
                    <h3>{highlight}</h3>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.section} aria-labelledby="amenities-title">
              <div className={styles.sectionHeading}>
                <CheckCircle2 size={21} aria-hidden="true" />
                <div><p>Everything you need</p><h2 id="amenities-title">Amenities</h2></div>
              </div>
              <ul className={styles.amenities}>
                {stay.amenities.map((amenity) => <li key={amenity}><CheckCircle2 size={17} aria-hidden="true" />{amenity}</li>)}
              </ul>
            </section>

            <section className={styles.activitySection} aria-labelledby="activities-title">
              <div className={styles.sectionHeading}>
                <Activity size={21} aria-hidden="true" />
                <div><p>Beyond the front door</p><h2 id="activities-title">Things to do</h2></div>
              </div>
              <div className={styles.activities}>
                {stay.activities.map((activity) => <span key={activity}>{activity}</span>)}
              </div>
            </section>

            <section className={styles.section} aria-labelledby="stay-info-title">
              <div className={styles.sectionHeading}>
                <Info size={21} aria-hidden="true" />
                <div><p>Before you arrive</p><h2 id="stay-info-title">Good to know</h2></div>
              </div>
              <dl className={styles.stayInfo}>
                <div><dt>Check-in</dt><dd>{stay.stayInfo.checkIn}</dd></div>
                <div><dt>Check-out</dt><dd>{stay.stayInfo.checkOut}</dd></div>
                <div><dt>Minimum stay</dt><dd>{stay.stayInfo.minimumNights} nights</dd></div>
                <div className={styles.wide}><dt>Cancellation</dt><dd>{stay.stayInfo.cancellationPolicy}</dd></div>
                <div className={styles.wide}><dt>House rules</dt><dd>{stay.stayInfo.houseRules.join(" · ")}</dd></div>
              </dl>
            </section>

            <section className={styles.section} aria-labelledby="reviews-title">
              <div className={styles.reviewsHeading}>
                <div className={styles.sectionHeading}>
                  <Star size={21} fill="currentColor" aria-hidden="true" />
                  <div><p>Guest notes</p><h2 id="reviews-title">{stay.rating.toFixed(1)} out of 5</h2></div>
                </div>
                <span>{stay.reviews.length} verified reviews</span>
              </div>
              <div className={styles.reviews}>
                {stay.reviews.map((review) => (
                  <article key={review.id}>
                    <div><span>{review.author.charAt(0)}</span><p><strong>{review.author}</strong><small>{formatDate(review.date)}</small></p></div>
                    <div className={styles.reviewStars} aria-label={`${review.rating} stars`}>{Array.from({ length: review.rating }, (_, index) => <Star key={index} size={13} fill="currentColor" aria-hidden="true" />)}</div>
                    <blockquote>“{review.comment}”</blockquote>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.bookingCard} aria-label="Booking summary">
            <div className={styles.bookingPrice}><span>From</span><p><strong>{formatCurrency(stay.price)}</strong> / night</p></div>
            <div className={styles.bookingFacts}>
              <span><CalendarCheck size={18} aria-hidden="true" />Minimum {stay.stayInfo.minimumNights} nights</span>
              <span><ShieldCheck size={18} aria-hidden="true" />Flexible cancellation</span>
            </div>
            <button type="button" onClick={() => setBookingOpen(true)}>Check availability</button>
            <p>You will not be charged yet.</p>
          </aside>
        </div>

        <section className={styles.related} aria-labelledby="related-title">
          <div className={styles.relatedHeading}><p>Keep exploring</p><h2 id="related-title">Similar stays nearby in spirit</h2></div>
          <div className={styles.relatedGrid}>{related.map((item) => <StayCard key={item.id} stay={item} />)}</div>
        </section>
      </main>
      <BookingModal stay={stay} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
