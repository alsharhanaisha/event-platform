-- =========================================
-- EVENTS TABLE
-- =========================================
create table public.events (
  id                     uuid primary key default gen_random_uuid(),

  -- Basic info
  name                   text not null,
  description            text,
  cover_image_url        text,
  category               text,
  language               text,
  tags                   text[] default '{}',

  -- Date & time
  start_at               timestamptz not null,
  end_at                 timestamptz not null,
  timezone               text not null default 'Asia/Kuwait',
  duration               interval generated always as (end_at - start_at) stored,
  recurrence             text not null default 'none'
                           check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  recurrence_end_date    date,

  -- Location
  event_format           text not null default 'in_person'
                           check (event_format in ('in_person', 'online', 'hybrid')),
  venue_name             text,
  address                text,
  city                   text,
  map_url                text,
  latitude               numeric(9,6),
  longitude              numeric(9,6),
  online_meeting_url     text,

  -- Pricing
  is_free                boolean not null default false,
  price                  numeric(10,2) check (price >= 0),
  currency               text not null default 'KWD',

  -- Audience
  min_age                int check (min_age >= 0),
  max_age                int check (max_age >= 0),
  gender_restriction     text not null default 'open'
                           check (gender_restriction in ('open', 'women_only', 'men_only', 'family')),
  accessibility_info     text,
  requirements           text,

  -- Registration
  capacity               int check (capacity > 0),
  registration_url       text,
  registration_deadline  timestamptz,

  -- Organizer
  organizer_name         text,
  organizer_email        text,
  organizer_phone        text,

  -- Status
  status                 text not null default 'draft'
                           check (status in ('draft', 'published', 'cancelled', 'postponed', 'sold_out')),

  -- Timestamps
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- Rules
  constraint end_after_start check (end_at > start_at),
  constraint valid_age_range check (min_age is null or max_age is null or min_age <= max_age)
);

-- =========================================
-- TICKET TYPES TABLE
-- =========================================
create table public.ticket_types (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  name         text not null,                 -- e.g. Adult, Child, Early Bird, VIP
  price        numeric(10,2) not null default 0 check (price >= 0),
  currency     text not null default 'KWD',
  quantity     int check (quantity > 0),      -- tickets available of this type
  sales_end_at timestamptz,
  created_at   timestamptz not null default now()
);

create index on public.ticket_types (event_id);
create index on public.events (start_at);
create index on public.events (status);

-- =========================================
-- AUTO-UPDATE "updated_at"
-- =========================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- =========================================
-- SECURITY (Row Level Security)
-- Anyone can view published events; only you (via dashboard/service key) can edit.
-- =========================================
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;

create policy "Public can view published events"
on public.events for select
using (status in ('published', 'sold_out', 'postponed', 'cancelled'));

create policy "Public can view ticket types of visible events"
on public.ticket_types for select
using (exists (
  select 1 from public.events e
  where e.id = ticket_types.event_id
    and e.status <> 'draft'
));
