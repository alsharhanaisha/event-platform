# Database

The app stores its data in a Supabase (Postgres) database with two tables:

- **`events`**: one row per event.
- **`ticket_types`**: the ticket options for each event, such as Early Bird, General and VIP.

One event can have many ticket types. Each ticket type belongs to exactly one event.

```
events (1) ──── (many) ticket_types
```

The SQL that creates these tables is in [`supabase/migrations/`](supabase/migrations/).

---

## `events`

Each row describes one event: what it is, when and where it happens, what it costs, who it's for and who runs it.

### Basic info

| Column | Type | Why it's there |
|---|---|---|
| `id` | `uuid` | A unique ID for the event, created automatically. Other tables use it to point to this event. |
| `name` | `text` | The event's title, such as "Kuwait Tech Summit 2026". **Required.** |
| `description` | `text` | A longer explanation of the event, shown on its page. |
| `cover_image_url` | `text` | A link to the event's banner or poster image. |
| `category` | `text` | A broad group, such as Technology, Family or Arts, so people can browse by type. |
| `language` | `text` | The language the event is held in, such as Arabic or English. |
| `tags` | `text[]` (list of text) | Keywords for searching and filtering, such as `{ai, startups}`. Empty by default. |

### Date and time

| Column | Type | Why it's there |
|---|---|---|
| `start_at` | `timestamptz` (date + time + timezone) | When the event starts. **Required.** |
| `end_at` | `timestamptz` | When the event ends. **Required**, and it must be after `start_at`. |
| `timezone` | `text` | The event's local timezone, so times show correctly. Defaults to `Asia/Kuwait`. |
| `duration` | `interval` (length of time) | How long the event lasts. **Calculated automatically** as `end_at − start_at`, so it can't be set by hand. |
| `recurrence` | `text` | Whether the event repeats: `none`, `daily`, `weekly` or `monthly`. Defaults to `none`. |
| `recurrence_end_date` | `date` | The last date a repeating event happens. |

### Location

| Column | Type | Why it's there |
|---|---|---|
| `event_format` | `text` | How people attend: `in_person`, `online` or `hybrid` (both). Defaults to `in_person`. |
| `venue_name` | `text` | The name of the place, such as "Al Shaheed Park". |
| `address` | `text` | The street address or area. |
| `city` | `text` | The city, used for filtering events by location. |
| `map_url` | `text` | A link to the location on a map, such as Google Maps. |
| `latitude` | `numeric(9,6)` (decimal number) | The exact map position, for showing a pin on a map. |
| `longitude` | `numeric(9,6)` | The exact map position, paired with `latitude`. |
| `online_meeting_url` | `text` | The link to join online or hybrid events, such as a Zoom or Meet link. |

### Pricing

| Column | Type | Why it's there |
|---|---|---|
| `is_free` | `boolean` (true/false) | A quick flag for free events, used for "free events only" filters. Defaults to `false`. |
| `price` | `numeric(10,2)` (money, 2 decimals) | The main or starting price. Can't be negative. Detailed prices are in `ticket_types`. |
| `currency` | `text` | The currency of the price. Defaults to `KWD` (Kuwaiti dinar). |

### Audience

| Column | Type | Why it's there |
|---|---|---|
| `min_age` | `int` (whole number) | The youngest age allowed, if there is one. |
| `max_age` | `int` | The oldest age allowed, if there is one. It can't be lower than `min_age`. |
| `gender_restriction` | `text` | Who may attend: `open`, `women_only`, `men_only` or `family`. Defaults to `open`. |
| `accessibility_info` | `text` | Notes for people with disabilities, such as wheelchair access or parking. |
| `requirements` | `text` | Anything attendees must bring or know beforehand, such as an ID, a laptop or a dress code. |

### Registration

| Column | Type | Why it's there |
|---|---|---|
| `capacity` | `int` | The maximum number of attendees. It must be more than 0 if set. |
| `registration_url` | `text` | A link to an outside sign-up page, if registration happens somewhere else. |
| `registration_deadline` | `timestamptz` | The last moment people can sign up. |

### Organizer

| Column | Type | Why it's there |
|---|---|---|
| `organizer_name` | `text` | The person or company running the event. |
| `organizer_email` | `text` | The organizer's contact email. |
| `organizer_phone` | `text` | The organizer's contact phone number. Stored as text so it can include `+` and spaces. |

### Status

| Column | Type | Why it's there |
|---|---|---|
| `status` | `text` | Where the event stands. Defaults to `draft`. |

The possible `status` values:

| Value | Meaning |
|---|---|
| `draft` | Still being prepared. **Hidden from the public.** |
| `published` | Live and visible to everyone. |
| `sold_out` | Visible, but no places are left. |
| `postponed` | Visible, but moved to a later date. |
| `cancelled` | Visible, but won't happen. It stays visible so people who planned to go can see the news. |

### Record-keeping

| Column | Type | Why it's there |
|---|---|---|
| `created_at` | `timestamptz` | When the row was added. Set automatically. |
| `updated_at` | `timestamptz` | When the row was last changed. **Updated automatically** by a trigger on every edit. |

---

## `ticket_types`

Each row is one kind of ticket for one event. For example, the Tech Summit has three rows here: Early Bird, General and VIP.

| Column | Type | Why it's there |
|---|---|---|
| `id` | `uuid` | A unique ID for this ticket type, created automatically. |
| `event_id` | `uuid` | The event this ticket belongs to. **Required.** It must match an `events.id`. If the event is deleted, its ticket types are deleted too. |
| `name` | `text` | The ticket's label, such as Adult, Child, Early Bird or VIP. **Required.** |
| `price` | `numeric(10,2)` | The cost of this ticket. Defaults to `0`, and can't be negative. |
| `currency` | `text` | The currency of the price. Defaults to `KWD`. |
| `quantity` | `int` | How many tickets of this type are available. It must be more than 0 if set. Leave it empty for unlimited. |
| `sales_end_at` | `timestamptz` | When this ticket stops being sold. Useful for Early Bird deals. |
| `created_at` | `timestamptz` | When the row was added. Set automatically. |

---

## Built-in rules

Besides the column limits listed above, the database enforces these rules, so bad data can't get in by mistake:

- An event must **end after it starts**.
- `min_age` can't be **greater than** `max_age`.
- Prices can't be **negative**.
- Values like `status`, `event_format`, `recurrence` and `gender_restriction` must be **one of the allowed options**.

## Who can see what (security)

Both tables have **Row Level Security** turned on, which controls who can see and change rows:

- **Anyone**, including visitors who aren't logged in, can **read** events that aren't drafts, and the ticket types of those events.
- **Drafts are hidden** from the public, along with their ticket types.
- **Nobody** can add, edit or delete rows through the public app. Changes are made from the Supabase dashboard or with the secret service key.

## Speed (indexes)

Indexes make common searches faster:

- `events.start_at`: listing upcoming events by date.
- `events.status`: filtering published events.
- `ticket_types.event_id`: finding an event's tickets.
