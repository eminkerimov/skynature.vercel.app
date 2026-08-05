import { FormEvent, useMemo, useState } from "react";
import { Check, CheckCircle2, Mail, UserRound } from "lucide-react";
import type { Stay } from "../../types/stay";
import { formatCurrency, formatDate } from "../../utils/formatters";
import Modal from "../Modal/Modal";
import styles from "./BookingModal.module.scss";

interface BookingModalProps {
  stay: Stay;
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  checkIn: string;
  checkOut: string;
  guests: string;
  name: string;
  email: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  checkIn: "",
  checkOut: "",
  guests: "2",
  name: "",
  email: "",
};

const dayMs = 1000 * 60 * 60 * 24;

export default function BookingModal({ stay, open, onClose }: BookingModalProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const nights = useMemo(() => {
    if (!values.checkIn || !values.checkOut) return 0;
    const difference = (new Date(values.checkOut).getTime() - new Date(values.checkIn).getTime()) / dayMs;
    return difference > 0 ? Math.round(difference) : 0;
  }, [values.checkIn, values.checkOut]);

  const subtotal = nights * stay.price;
  const cleaningFee = nights ? 45 : 0;
  const serviceFee = nights ? Math.round(subtotal * 0.12) : 0;
  const total = subtotal + cleaningFee + serviceFee;

  const update = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!values.checkIn) nextErrors.checkIn = "Choose a check-in date.";
    else if (values.checkIn < today) nextErrors.checkIn = "Check-in cannot be in the past.";
    if (!values.checkOut) nextErrors.checkOut = "Choose a check-out date.";
    else if (values.checkIn && values.checkOut <= values.checkIn) nextErrors.checkOut = "Check-out must be after check-in.";
    else if (nights < stay.stayInfo.minimumNights) nextErrors.checkOut = `This stay requires at least ${stay.stayInfo.minimumNights} nights.`;
    const guestCount = Number(values.guests);
    if (!guestCount || guestCount > stay.maxGuests) nextErrors.guests = `Choose between 1 and ${stay.maxGuests} guests.`;
    if (values.name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Enter a valid email address.";
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(() => {
      setValues(initialValues);
      setErrors({});
      setSubmitted(false);
    }, 200);
  };

  return (
    <Modal open={open} onClose={handleClose} title={submitted ? "Request received" : `Book ${stay.name}`}>
      {submitted ? (
        <div className={styles.success} role="status">
          <CheckCircle2 size={54} strokeWidth={1.5} aria-hidden="true" />
          <h3>Your nature break is one step closer</h3>
          <p>Thanks, {values.name.trim()}. We have prepared a booking request for {formatDate(values.checkIn)} to {formatDate(values.checkOut)}.</p>
          <div className={styles.confirmation}>
            <span>{nights} nights · {values.guests} guests</span>
            <strong>{formatCurrency(total)} total</strong>
          </div>
          <p className={styles.note}>This is a demo booking. No payment has been taken.</p>
          <button type="button" className={styles.primaryButton} onClick={handleClose}>Done</button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <p className={styles.intro}>Send a no-obligation booking request. You will review the details before any payment.</p>
          <div className={styles.twoColumns}>
            <label>
              <span>Check-in</span>
              <input
                type="date"
                value={values.checkIn}
                min={today}
                onChange={(event) => {
                  update("checkIn", event.target.value);
                  if (values.checkOut && event.target.value >= values.checkOut) update("checkOut", "");
                }}
                aria-invalid={Boolean(errors.checkIn)}
                aria-describedby={errors.checkIn ? "check-in-error" : undefined}
              />
              {errors.checkIn && <small id="check-in-error">{errors.checkIn}</small>}
            </label>
            <label>
              <span>Check-out</span>
              <input
                type="date"
                value={values.checkOut}
                min={values.checkIn || today}
                onChange={(event) => update("checkOut", event.target.value)}
                aria-invalid={Boolean(errors.checkOut)}
                aria-describedby={errors.checkOut ? "check-out-error" : undefined}
              />
              {errors.checkOut && <small id="check-out-error">{errors.checkOut}</small>}
            </label>
          </div>
          <label>
            <span>Guests</span>
            <select value={values.guests} onChange={(event) => update("guests", event.target.value)} aria-invalid={Boolean(errors.guests)}>
              {Array.from({ length: stay.maxGuests }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>
              ))}
            </select>
            {errors.guests && <small>{errors.guests}</small>}
          </label>
          <div className={styles.twoColumns}>
            <label>
              <span>Name</span>
              <div className={styles.inputWithIcon}>
                <UserRound size={17} aria-hidden="true" />
                <input type="text" autoComplete="name" value={values.name} onChange={(event) => update("name", event.target.value)} aria-invalid={Boolean(errors.name)} />
              </div>
              {errors.name && <small>{errors.name}</small>}
            </label>
            <label>
              <span>Email</span>
              <div className={styles.inputWithIcon}>
                <Mail size={17} aria-hidden="true" />
                <input type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} aria-invalid={Boolean(errors.email)} />
              </div>
              {errors.email && <small>{errors.email}</small>}
            </label>
          </div>
          <div className={styles.priceSummary} aria-live="polite">
            <div><span>{formatCurrency(stay.price)} × {nights || 0} nights</span><span>{formatCurrency(subtotal)}</span></div>
            <div><span>Cleaning fee</span><span>{formatCurrency(cleaningFee)}</span></div>
            <div><span>Service fee</span><span>{formatCurrency(serviceFee)}</span></div>
            <div className={styles.total}><strong>Total</strong><strong>{formatCurrency(total)}</strong></div>
          </div>
          <button type="submit" className={styles.primaryButton}>
            <Check size={18} aria-hidden="true" />
            Request booking
          </button>
        </form>
      )}
    </Modal>
  );
}
