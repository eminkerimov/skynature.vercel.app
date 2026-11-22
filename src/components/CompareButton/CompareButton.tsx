import { Check, Scale } from "lucide-react";
import { useCompare } from "../../hooks/useCompare";
import styles from "./CompareButton.module.scss";

export default function CompareButton({ stay, className = "" }: { stay: { id: string; name: string }; className?: string }) {
  const { isCompared, toggleCompare } = useCompare();
  const selected = isCompared(stay.id);
  return (
    <button
      type="button"
      className={`${styles.button} ${selected ? styles.selected : ""} ${className}`}
      aria-label={selected ? `Remove ${stay.name} from comparison` : `Compare ${stay.name}`}
      aria-pressed={selected}
      onClick={() => toggleCompare(stay.id)}
    >
      {selected ? <Check size={16} aria-hidden="true" /> : <Scale size={16} aria-hidden="true" />}
      {selected ? "In comparison" : "Compare"}
    </button>
  );
}
