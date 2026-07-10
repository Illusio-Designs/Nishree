# Nishree — Unified B2B + D2C Backend

Nishree started as a **D2C** (direct‑to‑consumer) e‑commerce backend. This module
adds a full **B2B** (wholesale / distribution) management layer **in the same
codebase and the same database**, so a single admin runs both channels side by
side. Nothing about the existing D2C flow changes — B2B is additive.

This document covers the **backend only**. The frontend will be built on top of
these APIs in a follow‑up.

> Modelled on the Stallion B2B distribution platform documentation, adapted to
> Nishree's Node/Express + Sequelize (MySQL) architecture.

---

## 1. How B2B and D2C share one system

| Concern | D2C (existing) | B2B (new) |
|---------|----------------|-----------|
| Customer | `User` (role `consumer`) | `Party`, `Distributor` (+ optional linked `User`) |
| Field team | — | `Salesman` |
| Orders | `orders` table, `channel = 'd2c'` | **same** `orders` table, `channel = 'b2b'` |
| Pricing | `ProductVariation.price` | `ProductVariation.wholesalePrice` + `priceTiers` |
| Discounts | `Coupon` | `Offer` (snapshotted onto the order) |

The **`orders` table is unified**: every order — retail or wholesale — lives in
one place. A `channel` column (`d2c` / `b2b`) splits them, and `order_type`
refines the B2B origin (`party_order`, `distributor_order`, `event_order`,
`visit_order`, `whatsapp_order`). Existing D2C orders default to
`channel = 'd2c'`, `order_type = 'd2c_order'`, so historical data is untouched.

---

## 2. Roles

`User.role` is extended (still single‑role) with the B2B layer:

- **End‑user (self‑scoped) roles:** `party`, `distributor`, `salesman` — their
  `/my` endpoints return only their own records.
- **Manager roles:** `sales_manager`, `distributor_manager`, `party_manager`,
  `product_manager`, `order_manager`, `reports_manager`, `expense_manager`.
- **Unchanged:** `admin` (full access), `consumer` (D2C shopper).

Every B2B route is guarded by `authorize([...])`.

---

## 3. Data model (new tables)

- **Zone** — geographic grouping used for territory mapping.
- **Party** — a wholesale retail shop (address + geocoded lat/lng, GST, credit
  terms, active flag), optionally linked to a `Distributor` and `User`.
- **Distributor** + **DistributorState** / **DistributorZone** — wholesale
  partner and its territory.
- **Salesman** + **SalesmanState** / **SalesmanZone** — field rep, territory and
  KYC docs (PAN, Aadhaar, cancelled cheque, photo).
- **SalesmanCheckin** — a GPS‑verified field visit at a party.
- **SalesmanTarget** — assigned sales target for a period.
- **SalesmanExpense** — field expense (with review status).
- **Offer** — a B2B discount, snapshotted onto orders when applied.
- **Event** — exhibition/roadshow grouping event orders.
- **AuditLog** — create/update/delete history with old/new snapshots.

**Extended tables:** `users` (role enum), `orders` (channel/type + counterparty
ids + pricing breakdown + visit geolocation), `product_variations`
(`wholesalePrice`, `priceTiers`).

Schema ships automatically — `scripts/setupDatabase.js` alter‑syncs every
`*Model.js` on startup (no hand‑written migrations).

---

## 4. Wholesale pricing

Per the chosen model: **per‑variation wholesale price + quantity‑break tiers.**

```jsonc
// product_variations row
{
  "price": 100,             // retail (D2C)
  "wholesalePrice": 90,     // base B2B price
  "priceTiers": [           // quantity breaks (highest matching minQty wins)
    { "minQty": 10, "price": 85 },
    { "minQty": 50, "price": 80 }
  ]
}
```

Resolution (`utils/b2bPricing.js`): highest matching tier → `wholesalePrice` →
`price` (retail fallback). Used automatically when building a B2B order.

---

## 5. Visit reporting & geofencing

The field‑verification core (`utils/geo.js`):

- A salesman records a **check‑in** (`POST /api/salesman-checkins`) or places a
  **visit order** (`order_type: "visit_order"`) at a party, capturing device GPS.
- The backend geocodes the party address (on demand if missing) and computes the
  **Haversine distance**. If it exceeds `GEOFENCE_RADIUS_M` (default **250 m**),
  the visit/order is **rejected (HTTP 403)**.
- The **Visit Report** (`GET /api/b2b-analytics/visit-report`) merges stand‑alone
  check‑ins with on‑site visit orders and returns a location **match percent**
  (100 % on‑site → 0 % at 2× the geofence radius) per row.

---

## 5a. Salesman Day Journey (geo route tracking) — add-on

On top of check-ins (which prove presence *at a party*), a **day journey** traces
the salesman's **whole day of movement** as a GPS route.

- **Header** (`SalesmanJourney`) — one row per day: start/end time & coordinates,
  total distance travelled, optional odometer readings.
- **Breadcrumbs** (`SalesmanJourneyPoint`) — GPS pings logged through the day.
  Each point stores accuracy/speed/battery and its distance from the previous
  point; `event_type` (`start`/`track`/`checkin`/`order`/`end`) annotates the
  route. Points can be posted one at a time or **batched** (`points: [...]`) for
  offline sync.

Total route distance is accumulated server-side (Haversine between consecutive
points). The journey detail merges that day's check-ins and visit orders into a
**timeline**, so the full day plots on one map.

**Endpoints** (`/api/salesman-journeys`):

| Method & path | Purpose |
|---------------|---------|
| `POST /start` | Start (or resume) today's journey |
| `POST /track` | Append breadcrumb(s) — single or batch |
| `POST /end` | End the active journey |
| `GET /active` | Current active journey + points so far |
| `GET /` | List journeys (self, or all for managers; `?date=`, `?status=`, `?salesman_id=`) |
| `GET /:id` | Journey route + day timeline (check-ins + orders) + summary |

---

## 6. API surface (all under `/api`)

| Path | Purpose |
|------|---------|
| `/zones` | Zone CRUD |
| `/parties` | Party CRUD, `/my`, `POST /update-locations` (bulk geocode) |
| `/distributors` | Distributor CRUD (+ territory), `/my`, `/:id/parties` |
| `/salesmen` | Salesman CRUD (+ KYC upload, territory), `/my`, `PATCH /:id/status` |
| `/salesman-checkins` | Record / list field visits (geofenced) |
| `/salesman-targets` | Sales target CRUD |
| `/salesman-expenses` | Log / review field expenses |
| `/salesman-journeys` | Day journey geo tracking (start/track/end, route + timeline) |
| `/offers` | B2B offer CRUD, `/active` |
| `/events` | Event CRUD, `/:id/orders` |
| `/b2b-orders` | Create wholesale orders, `/my`, management list |
| `/b2b-analytics` | `/target-achievement`, `/visit-report` |
| `/audit-logs` | Change history (admin) |

D2C endpoints (`/products`, `/orders`, `/cart`, …) are unchanged.

---

## 7. Environment variables (new, all optional)

| Variable | Purpose | Default |
|----------|---------|---------|
| `GEOFENCE_RADIUS_M` | Visit geofence radius (metres) | `250` |
| `GEOFENCE_REQUIRE_COORDS` | Block a visit when the party has no coordinates | `false` (fail‑open) |
| `GEOCODER_URL` | Geocoding endpoint | OpenStreetMap Nominatim |
| `GEOCODER_KEY` | Geocoding API key (if the provider needs one) | — |
| `GEOCODER_UA` | User‑Agent sent to the geocoder | `NishreeB2B/1.0 …` |

Geocoding uses OpenStreetMap Nominatim (no key) with a **pincode‑first fallback
chain** (full address → pincode + city/state → pincode → city/state → state),
since an Indian pincode pins a locality far better than a state centroid.

---

*Backend implementation only. Frontend to follow once this is approved.*
