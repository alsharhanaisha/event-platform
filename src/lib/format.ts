export function formatPrice(amount: number | null, currency: string): string {
  if (amount === null) return "";
  if (amount === 0) return "Free";
  // KWD has 3 decimal places (1000 fils); Intl knows this per currency.
  return new Intl.NumberFormat("en-KW", { style: "currency", currency }).format(amount);
}

export function formatDateRange(startIso: string, endIso: string, timeZone: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const sameDay = dateFmt.format(start) === dateFmt.format(end);
  if (sameDay) {
    return `${dateFmt.format(start)}, ${timeFmt.format(start)} – ${timeFmt.format(end)}`;
  }
  return `${dateFmt.format(start)}, ${timeFmt.format(start)} – ${dateFmt.format(end)}, ${timeFmt.format(end)}`;
}

export function formatDateTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const LABELS: Record<string, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
  open: "Open to all",
  women_only: "Women only",
  men_only: "Men only",
  family: "Families",
  sold_out: "Sold out",
  postponed: "Postponed",
  cancelled: "Cancelled",
  published: "On sale",
};

export function label(value: string): string {
  return LABELS[value] ?? value;
}
