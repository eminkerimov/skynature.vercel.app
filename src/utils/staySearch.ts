export interface BookingSearch {
  checkIn: string;
  checkOut: string;
  guests: number | null;
}

export function localDateKey(date = new Date()): string {
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function readDate(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isFinite(date.getTime()) && localDateKey(date) === value ? value : "";
}

export function readBookingSearch(search: string): BookingSearch {
  const params = new URLSearchParams(search);
  const checkIn = readDate(params.get("checkIn"));
  const requestedCheckOut = readDate(params.get("checkOut"));
  const guestParam = params.get("guests") ?? "";
  const requestedGuests = /^\d+$/.test(guestParam) ? Number(guestParam) : NaN;

  return {
    checkIn,
    checkOut: checkIn && requestedCheckOut > checkIn ? requestedCheckOut : "",
    guests: Number.isSafeInteger(requestedGuests) && requestedGuests >= 1 ? requestedGuests : null,
  };
}

export function createStayHref(slug: string, search: string): string {
  const { checkIn, checkOut, guests } = readBookingSearch(search);
  const params = new URLSearchParams();
  if (checkIn) params.set("checkIn", checkIn);
  if (checkOut) params.set("checkOut", checkOut);
  if (guests !== null) params.set("guests", String(guests));
  const query = params.toString();
  return `/stays/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`;
}
