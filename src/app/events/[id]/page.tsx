import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import { formatDateRange, formatDateTime, formatPrice, label } from "@/lib/format";

export default function EventPage({ params }: PageProps<"/events/[id]">) {
  return (
    <>
      <Link href="/" className="text-sm text-black/60 hover:underline dark:text-white/60">
        ← All events
      </Link>
      <Suspense fallback={<p className="mt-6 text-black/60">Loading event…</p>}>
        <EventDetails params={params} />
      </Suspense>
    </>
  );
}

async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const location = [event.venue_name, event.address, event.city].filter(Boolean).join(", ");
  const ages =
    event.min_age !== null && event.max_age !== null
      ? `${event.min_age}–${event.max_age}`
      : event.min_age !== null
        ? `${event.min_age}+`
        : event.max_age !== null
          ? `Up to ${event.max_age}`
          : null;

  return (
    <article className="mt-6">
      {event.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- cover images can come from any host
        <img
          src={event.cover_image_url}
          alt=""
          className="mb-6 aspect-[2/1] w-full rounded-xl object-cover"
        />
      )}

      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
        {event.category && <span>{event.category}</span>}
        {event.status !== "published" && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">
            {label(event.status)}
          </span>
        )}
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{event.name}</h1>
      {event.organizer_name && (
        <p className="mt-1 text-black/60 dark:text-white/60">by {event.organizer_name}</p>
      )}

      <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-[max-content_1fr]">
        <dt className="font-medium">When</dt>
        <dd>{formatDateRange(event.start_at, event.end_at, event.timezone)}</dd>

        <dt className="font-medium">Where</dt>
        <dd>
          {label(event.event_format)}
          {location && ` · ${location}`}
          {event.map_url && (
            <>
              {" · "}
              <a href={event.map_url} className="underline" target="_blank" rel="noreferrer">
                Map
              </a>
            </>
          )}
        </dd>

        {event.language && (
          <>
            <dt className="font-medium">Language</dt>
            <dd>{event.language}</dd>
          </>
        )}

        <dt className="font-medium">Who can attend</dt>
        <dd>
          {label(event.gender_restriction)}
          {ages && ` · Ages ${ages}`}
        </dd>

        {event.capacity !== null && (
          <>
            <dt className="font-medium">Capacity</dt>
            <dd>{event.capacity} people</dd>
          </>
        )}

        {event.registration_deadline && (
          <>
            <dt className="font-medium">Register by</dt>
            <dd>{formatDateTime(event.registration_deadline, event.timezone)}</dd>
          </>
        )}
      </dl>

      {event.description && (
        <p className="mt-8 max-w-prose whitespace-pre-line leading-7">{event.description}</p>
      )}

      {event.requirements && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">What to bring</h2>
          <p className="mt-2 max-w-prose whitespace-pre-line">{event.requirements}</p>
        </section>
      )}

      {event.accessibility_info && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Accessibility</h2>
          <p className="mt-2 max-w-prose whitespace-pre-line">{event.accessibility_info}</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Tickets</h2>
        {event.ticket_types.length === 0 ? (
          <p className="mt-2">
            {event.is_free ? "Free entry." : formatPrice(event.price, event.currency)}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10 dark:divide-white/15 dark:border-white/15">
            {event.ticket_types.map((ticket) => (
              <li key={ticket.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="font-medium">{ticket.name}</p>
                  {ticket.sales_end_at && (
                    <p className="text-xs text-black/60 dark:text-white/60">
                      Sales end {formatDateTime(ticket.sales_end_at, event.timezone)}
                    </p>
                  )}
                </div>
                <p className="font-medium">{formatPrice(ticket.price, ticket.currency)}</p>
              </li>
            ))}
          </ul>
        )}

        {event.registration_url && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 font-medium text-background"
          >
            Register
          </a>
        )}
      </section>
    </article>
  );
}
