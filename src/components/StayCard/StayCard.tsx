import { Heart, MapPin, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Stay } from "../../types/stay";
import { formatCurrency } from "../../utils/formatters";
import { useFavorites } from "../../hooks/useFavorites";
import Badge from "../Badge/Badge";
import styles from "./StayCard.module.scss";

interface StayCardProps {
  stay: Stay;
}

export default function StayCard({ stay }: StayCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(stay.id);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link to={`/stays/${stay.slug}`} aria-label={`View ${stay.name}`}>
          <img src={stay.image} alt={`${stay.name} in ${stay.location}`} loading="lazy" />
        </Link>
        <div className={styles.badge}>
          <Badge>{stay.type}</Badge>
        </div>
        <button
          type="button"
          className={`${styles.favorite} ${saved ? styles.saved : ""}`}
          onClick={() => toggleFavorite(stay.id)}
          aria-label={saved ? `Remove ${stay.name} from saved stays` : `Save ${stay.name}`}
          aria-pressed={saved}
        >
          <Heart size={19} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
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
          <Link to={`/stays/${stay.slug}`}>{stay.name}</Link>
        </h3>
        <p className={styles.description}>{stay.shortDescription}</p>
        <div className={styles.footer}>
          <span className={styles.guests}>
            <Users size={15} aria-hidden="true" />
            Up to {stay.maxGuests}
          </span>
          <p className={styles.price}>
            <strong>{formatCurrency(stay.price)}</strong>
            <span> / night</span>
          </p>
        </div>
      </div>
    </article>
  );
}
