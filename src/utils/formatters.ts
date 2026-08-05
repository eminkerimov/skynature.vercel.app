const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const formatCurrency = (value: number): string =>
  currencyFormatter.format(value);

export const formatNightlyPrice = (value: number): string =>
  formatCurrency(value) + " / night";

export const pluralize = (
  count: number,
  singular: string,
  plural = singular + "s",
): string => String(count) + " " + (count === 1 ? singular : plural);

export const formatGuestCount = (count: number): string =>
  pluralize(count, "guest");

export const formatDate = (value: string | Date): string => {
  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(value + "T00:00:00")
      : new Date(value);

  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
};
