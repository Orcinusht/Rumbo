# Rumbo

A calendar + annual-goals organization app: yearly goals break down into weekly
objectives, which break down into daily objectives that recur automatically
on the calendar and on "Hoy" (Today). Implemented from the `Rumbo.dc.html`
Claude Design handoff in `../project/`.

## Run it

```bash
npm install
npm run dev      # dev server
npm run build    # production build (dist/)
npm run preview  # serve the production build locally
```

It's a installable PWA (manifest + icons in `public/`); data lives in
`localStorage` on the device, no backend.

## Stack

React 19 + Vite, no router (four tabs are plain view state). Icons from
`@phosphor-icons/react` (duotone, matching the prototype). Styling is plain
CSS using the Broadsheet design-system tokens ported into
`src/styles/tokens.css` (colors, type, spacing, the `.btn`/`.input`/`.cmyk-num`
components) plus app-specific layout in `src/styles/app.css`.

## Structure

- `src/lib/` — pure helpers: date/recurrence math (`dates.js`), categories,
  event types, id generation, localStorage read/write.
- `src/state/store.jsx` — the data model (goals → weekly → daily objectives,
  events, loose one-off tasks, per-occurrence completions/notes) as a
  `useReducer` + Context, persisted to `localStorage`, plus derived selectors
  (today's tasks, a day's calendar entries, upcoming reminders, goal %).
- `src/state/ui.jsx` — ephemeral UI state (active tab, open sheets, wizard
  draft, calendar cursor) — not persisted.
- `src/state/seed.js` — first-run demo content, ported from the prototype's
  sample data.
- `src/components/screens/` — Hoy, Calendario, Metas (list/goal/weekly),
  Perfil.
- `src/components/sheets/` — Note, Add-task, generic Editor (goal/weekly/
  daily/loose-task text + delete), Event, Reminders.
- `src/components/wizard/` — the 3-step new-goal flow.
- `src/components/ui/` — Sheet shell, checkbox (with the 44×44 tap target),
  progress bar, and the confetti/celebration layer (`Fx.jsx`).

## Notable decisions / departures from the prototype

The prototype was a static single-day mockup (everything hardcoded to
"7 de septiembre"). To make this a real, ongoing app:

- **Daily objectives are actually recurring.** Each daily objective carries
  the weekdays it runs on; "Hoy" and the calendar compute which objectives
  apply to a given date live, instead of the prototype's fixed task list.
  This is what the chat brief asked for ("los diarios se reflejarán
  automáticamente en el calendario y en Hoy").
- **Goal progress (%) is computed**, not authored: it's the share of a
  goal's weekly objectives currently marked done. The "target" line under
  the title (e.g. "60 días seguidos sin morderme") is free flavor text,
  same as the prototype.
- **"Today" is the real device date**, not a pinned Sept 7, 2026 — the demo
  data happens to line up with that date so a first run today reproduces
  the prototype's walkthrough exactly.
- **Calendar month/week navigation** (prev/next) was added since a real
  calendar needs to go beyond the one demo month.
- **The Hoy screen still ships all three explored variants** (Índice/
  Portada/Fichas) because the design chat never landed on one — there's a
  switcher for it under Progreso → Ajustes de Hoy instead of guessing.
- Weekly "cumplido esta semana" stays a manual toggle (as in the prototype)
  rather than auto-resetting each ISO week — that reset behavior was never
  specified.
