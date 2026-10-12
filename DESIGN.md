# Design Brief

## Direction

SARRTHI — a premium navy-and-saffron command desk for Indian MSME suppliers tracking tenders, orders, invoices and compliance.

## Tone

Refined institutional confidence: deep navy structure, crisp white data surfaces, and a single saffron accent that reads as authority rather than decoration.

## Differentiation

A navy sidebar anchors every page like a masthead, while saffron is rationed to exactly one signal per view — the rest of the dashboard is disciplined white and grey so numbers dominate.

## Color Palette

| Token      | OKLCH       | Role                                    |
| ---------- | ----------- | --------------------------------------- |
| background | 0.985 0.006 255 | Off-white app canvas                |
| foreground | 0.22 0.045 258  | Navy-tinted primary text            |
| card       | 1 0 0       | Pure white KPI/table surfaces           |
| primary    | 0.37 0.105 258  | Navy — nav, primary buttons, headers    |
| accent     | 0.8 0.16 78 | Saffron — active states, key highlights |
| muted      | 0.955 0.012 255 | Light grey section fills, table stripes |
| success    | 0.58 0.145 152  | Green — paid / cleared              |
| warning    | 0.8 0.16 78 | Amber — upcoming deadlines              |
| destructive| 0.55 0.2 27 | Red — overdue items                     |
| sidebar    | 0.245 0.06 258  | Deep navy sidebar surface           |

## Typography

- Display: Plus Jakarta Sans — page titles, KPI numbers, section headings, brand wordmark
- Body: Figtree — tables, labels, forms, body copy
- Mono: JetBrains Mono — invoice/tender IDs, amounts, reference codes
- Scale: hero `text-3xl md:text-4xl font-bold tracking-tight`, card title `text-sm font-semibold uppercase tracking-widest text-muted-foreground`, body `text-sm`, KPI number `text-2xl md:text-3xl font-bold font-display tabular-nums`

## Elevation & Depth

White cards on a faint-grey canvas with a three-tier shadow ladder (subtle / elevated / floating); no borders on primary cards, hairline `border` on dense tables and inputs.

## Structural Zones

| Zone    | Background       | Border   | Notes                                             |
| ------- | ---------------- | -------- | ------------------------------------------------- |
| Sidebar | `sidebar` navy   | none     | Icon rail, saffron active indicator, brand top    |
| Header  | `card` white     | `border-b` | Search, notifications, profile; sticky          |
| Content | `background`     | —        | Cards `bg-card`; alternate sections `bg-muted/40`  |
| Footer  | `muted/40` grey  | `border-t` | Disclaimer + secondary links                    |

## Spacing & Rhythm

8px base unit; card padding `p-5 md:p-6`, grid gaps `gap-4 md:gap-6`, page gutters `px-4 md:px-8`, section breaks `space-y-6`; dense tables use `py-3` rows.

## Component Patterns

- Buttons: `rounded-md`, navy primary; saffron for the single most important CTA per page; outline variant for secondary; hover lifts to `shadow-subtle`
- Cards: `rounded-lg`, `bg-card`, `shadow-subtle`, `p-5`; KPI cards add a thin left accent bar (navy or status colour)
- Badges: pill `rounded-full`, `text-xs font-semibold`, tinted background + solid text — green paid, amber upcoming, red overdue, navy neutral/in-review
- Tables: white surface, `bg-muted/40` header row, hover row tint, sticky header, horizontal scroll on mobile
- Forms: `rounded-md` inputs with `border-input`, focus `ring-2 ring-ring`, inline validation text in `destructive`
- States: skeleton `animate-shimmer` for loading, muted icon+copy empty, `destructive` error banner, `success` confirmation toast

## Motion

- Entrance: `animate-fade-in` 0.35s staggered on KPI cards and rows
- Hover: `transition-smooth` on buttons, rows, and nav items
- Decorative: `animate-shimmer` skeletons; `animate-scale-in` on popovers and modals

## Constraints

- Navy primary, white surfaces, light grey neutrals, saffron accent only
- Status colours reserved: green=paid, amber=upcoming, red=overdue — never repurposed for decoration
- No government logos or official affiliation; always show "Academic Project — Not an Official Government Portal."
- Token-only styling: no raw hex, rgb, or arbitrary colour classes in components
- Responsive: sidebar collapses to icon rail / drawer on mobile, tables scroll horizontally

## Signature Detail

Every KPI card carries a 3px left accent bar keyed to its status colour, turning the dashboard into a scannable status ledger.
