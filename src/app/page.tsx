import Link from "next/link";
import { getEvents } from "@/lib/events";
import { formatDateRange, formatPrice, label } from "@/lib/format";

export default async function Home() {
  const events = await getEvents();

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Upcoming events</h1>

      {events.length === 0 ? (
        <p className="mt-6 text-black/60 dark:text-white/60">No events yet. Check back soon.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="block h-full rounded-xl border border-black/10 p-5 transition hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
              >
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                  {event.category && <span>{event.category}</span>}
                  {event.status !== "published" && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">
                      {label(event.status)}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-xl font-semibold">{event.name}</h2>
                <p className="mt-2 text-sm text-black/70 dark:text-white/70">
                  {formatDateRange(event.start_at, event.end_at, event.timezone)}
                </p>
                <p className="mt-1 text-sm text-black/70 dark:text-white/70">
                  {[event.venue_name, event.city].filter(Boolean).join(", ") ||
                    label(event.event_format)}
                </p>
                <p className="mt-4 font-medium">
                  {event.is_free ? "Free" : `From ${formatPrice(event.price, event.currency)}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
