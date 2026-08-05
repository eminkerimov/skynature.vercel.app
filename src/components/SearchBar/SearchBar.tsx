import { FormEvent, useId, useState } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { destinations } from "../../data/stays";
import styles from "./SearchBar.module.scss";

export default function SearchBar() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const listId = useId();
  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests !== "2") params.set("guests", guests);
    navigate(`/explore${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <form className={styles.search} onSubmit={handleSubmit} aria-label="Search stays">
      <label className={styles.field}>
        <MapPin size={19} aria-hidden="true" />
        <span>
          <strong>Destination</strong>
          <input
            type="search"
            value={destination}
            list={listId}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Where do you want to go?"
          />
        </span>
      </label>
      <datalist id={listId}>
        {destinations.map((destinationOption) => (
          <option key={destinationOption} value={destinationOption} />
        ))}
      </datalist>
      <label className={styles.field}>
        <CalendarDays size={19} aria-hidden="true" />
        <span>
          <strong>Check-in</strong>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(event) => {
              setCheckIn(event.target.value);
              if (checkOut && event.target.value >= checkOut) setCheckOut("");
            }}
          />
        </span>
      </label>
      <label className={styles.field}>
        <CalendarDays size={19} aria-hidden="true" />
        <span>
          <strong>Check-out</strong>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(event) => setCheckOut(event.target.value)}
          />
        </span>
      </label>
      <label className={styles.field}>
        <Users size={19} aria-hidden="true" />
        <span>
          <strong>Guests</strong>
          <select value={guests} onChange={(event) => setGuests(event.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
              <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>
            ))}
          </select>
        </span>
      </label>
      <button className={styles.submit} type="submit">
        <Search size={20} aria-hidden="true" />
        <span>Search</span>
      </button>
    </form>
  );
}
