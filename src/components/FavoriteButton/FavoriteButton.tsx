import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../../hooks/useFavorites";
import { useToast } from "../../context/ToastContext";
import styles from "./FavoriteButton.module.scss";

interface FavoriteButtonProps {
  stay: { id: string; name: string };
  className?: string;
  savedClassName?: string;
  showLabel?: boolean;
  iconSize?: number;
}

export default function FavoriteButton({ stay, className = "", savedClassName = "", showLabel = false, iconSize = 19 }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, setFavorite } = useFavorites();
  const notify = useToast();
  const [pulse, setPulse] = useState(0);
  const saved = isFavorite(stay.id);

  return (
    <button
      type="button"
      className={`${className} ${saved ? savedClassName : ""}`}
      aria-label={showLabel ? (saved ? "Saved" : "Save stay") : (saved ? `Remove ${stay.name} from saved stays` : `Save ${stay.name}`)}
      aria-pressed={saved}
      onClick={() => {
        toggleFavorite(stay.id);
        setPulse((current) => current + 1);
        notify(saved ? `${stay.name} removed from saved stays` : `${stay.name} saved`, {
          label: "Undo",
          run: () => setFavorite(stay.id, saved),
        });
      }}
    >
      <Heart key={pulse} className={pulse ? styles.pulse : undefined} size={iconSize} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      {showLabel && (saved ? "Saved" : "Save stay")}
    </button>
  );
}
