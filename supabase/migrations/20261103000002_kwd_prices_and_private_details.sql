-- =========================================
-- KWD PRICES: the dinar has 3 decimal places (1 KWD = 1000 fils)
-- =========================================
alter table public.events       alter column price type numeric(10,3);
alter table public.ticket_types alter column price type numeric(10,3);

-- =========================================
-- PRIVATE EVENT DETAILS
-- Columns the public must not read: the online join link and the organizer's
-- contact details. RLS is on with no policies, so only the dashboard and the
-- service key can read or change them.
-- =========================================
create table public.event_private_details (
  event_id           uuid primary key references public.events(id) on delete cascade,
  online_meeting_url text,
  organizer_email    text,
  organizer_phone    text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.event_private_details enable row level security;

create trigger event_private_details_set_updated_at
before update on public.event_private_details
for each row execute function public.set_updated_at();

-- Copy existing values across before dropping the public columns
insert into public.event_private_details (event_id, online_meeting_url, organizer_email, organizer_phone)
select id, online_meeting_url, organizer_email, organizer_phone
from public.events
where online_meeting_url is not null
   or organizer_email is not null
   or organizer_phone is not null;

alter table public.events
  drop column online_meeting_url,
  drop column organizer_email,
  drop column organizer_phone;
