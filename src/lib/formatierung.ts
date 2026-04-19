export function formatDatum(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatProzent(value: number) {
  return `${value.toFixed(1).replace(".", ",")} %`;
}

export function formatZahl(value: number) {
  return new Intl.NumberFormat("de-DE").format(value);
}
