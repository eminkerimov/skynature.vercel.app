import { Plus, Search } from "lucide-react";
import { useId, useState } from "react";
import { MAX_COMPARED_STAYS } from "../../context/CompareContext";
import { useProjectData } from "../../context/ProjectDataContext";
import { useCompare } from "../../hooks/useCompare";
import { formatCurrency } from "../../utils/formatters";
import Modal from "../Modal/Modal";
import styles from "./CompareStayPicker.module.scss";

export default function CompareStayPicker({ onClose }: { onClose: () => void }) {
  const { stays, settings } = useProjectData();
  const { ids, toggleCompare } = useCompare();
  const [query, setQuery] = useState("");
  const searchId = useId();
  const searchTerm = query.trim().toLowerCase();
  const availableStays = stays.filter((stay) => !ids.includes(stay.id) &&
    `${stay.name} ${stay.location} ${stay.type}`.toLowerCase().includes(searchTerm));

  return (
    <Modal open onClose={onClose} title="Add a stay to compare">
      <p className={styles.hint}>Choose a place below to add it to your comparison.</p>
      <label className={styles.searchLabel} htmlFor={searchId}>Find a stay</label>
      <div className={styles.searchField}>
        <Search size={18} aria-hidden="true" />
        <input id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, location, or stay type" />
      </div>
      {availableStays.length ? (
        <ul className={styles.list}>
          {availableStays.map((stay) => (
            <li key={stay.id}>
              <button type="button" className={styles.stay} aria-label={`Add ${stay.name} to comparison`} onClick={() => {
                if (ids.length < MAX_COMPARED_STAYS) toggleCompare(stay.id);
                onClose();
              }}>
                <img src={stay.image} alt="" loading="lazy" />
                <span className={styles.details}>
                  <strong>{stay.name}</strong>
                  <span>{stay.location}</span>
                  <span>{formatCurrency(stay.price, settings.locale, settings.currency)} / night · Up to {stay.maxGuests} guests</span>
                </span>
                <span className={styles.add}><Plus size={18} aria-hidden="true" /><span>Add</span></span>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className={styles.noResults} role="status">No stays match your search. Try another name, location, or stay type.</p>}
    </Modal>
  );
}
