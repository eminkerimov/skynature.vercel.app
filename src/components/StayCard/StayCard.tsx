import { MapPin, Star, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { Stay } from "../../types/stay";
import { formatCurrency } from "../../utils/formatters";
import { useProjectData } from "../../context/ProjectDataContext";
import { createStayHref } from "../../utils/staySearch";
import FavoriteButton from "../FavoriteButton/FavoriteButton";
import CompareButton from "../CompareButton/CompareButton";
import Badge from "../Badge/Badge";
import styles from "./StayCard.module.scss";

interface StayCardProps {
  stay: Stay;
}

export default function StayCard({ stay }: StayCardProps) {
  const { settings, images } = useProjectData();
  const { search } = useLocation();
  const href = createStayHref(stay.slug, search);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link to={href} aria-label={`View ${stay.name}`}>
          <img src={stay.image} alt={images.find((image) => image.url === stay.image)?.alt ?? `${stay.name} in ${stay.location}`} loading="lazy" />
        </Link>
        <div className={styles.badge}>
          <Badge>{stay.type}</Badge>
        </div>
        <FavoriteButton stay={stay} className={styles.favorite} savedClassName={styles.saved} />
      </div>
      <div className={styles.body}>
        <div className={styles.location}>
          <span>
            <MapPin size={14} aria-hidden="true" />
            {stay.location}
          </span>
          <span className={styles.rating} aria-label={`${stay.rating} out of 5 stars`}>
            <Star size={14} fill="currentColor" aria-hidden="true" />
            {stay.rating.toFixed(1)}
          </span>
        </div>
        <h3>
          <Link to={href}>{stay.name}</Link>
        </h3>
        <p className={styles.description}>{stay.shortDescription}</p>
        <div className={styles.footer}>
          <span className={styles.guests}>
            <Users size={15} aria-hidden="true" />
            Up to {stay.maxGuests}
          </span>
          <p className={styles.price}>
            <strong>{formatCurrency(stay.price, settings.locale, settings.currency)}</strong>
            <span> / night</span>
          </p>
        </div>
        <CompareButton stay={stay} className={styles.compareButton} />
      </div>
    </article>
  );
}
