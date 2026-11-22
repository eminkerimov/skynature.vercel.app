const currencyFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

export const formatCurrency = (value: number, locale = "en-US", currency = "USD"): string => {
  const key = `${locale}:${currency}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(value);
};

export const formatNightlyPrice = (value: number, locale = "en-US", currency = "USD"): string =>
  formatCurrency(value, locale, currency) + " / night";

export const pluralize = (
  count: number,
  singular: string,
  plural = singular + "s",
): string => String(count) + " " + (count === 1 ? singular : plural);

export const formatGuestCount = (count: number): string =>
  pluralize(count, "guest");

export const formatDate = (value: string | Date, locale = "en-US"): string => {
  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(value + "T00:00:00")
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "";
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" });
    dateFormatters.set(locale, formatter);
  }
  return formatter.format(date);
};
