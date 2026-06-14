# 🔀 Shift — Loan-Servicing Operations Console

An interactive UX prototype of a **loan-servicing operations console** — the multi-screen workspace an operations lead uses to keep loan queues moving: watching live demand, shifting specialist capacity and queue priority, and catching loans at risk of missing a closing deadline before they slip.

### ▶️ [Live demo → shift-prototype.netlify.app](https://shift-prototype.netlify.app/)

It's a working multi-screen front-end, not a set of static comps: queues update live, actions you take on one screen carry through to the others, and a closing-risk alert drills straight into the loan behind it.

> **On the terminology:** this prototype uses generalized language. Internal system names, proprietary metrics, and business-specific thresholds are abstracted to protect confidential information. The design decisions, constraints, and interactions are accurate representations of the real work.

## The screens

Six connected views, sharing one live queue state:

- **Overview** — the live operations pipeline at a glance. Surfaces only the real-time picture and says so honestly — historical replay isn't feasible across the event volume, so that's shown as status rather than a dead toggle.
- **Queue Monitor** — live loan queues with their ranking rules, and closing-risk alerts that **drill straight into the loan** behind the alert.
- **Loans** — the loan-level drill-down a risk alert lands you on, with the detail needed to act.
- **Simulation** — a what-if surface for re-ranking and throughput: try a different queue priority and see the projected effect before committing.
- **Performance** — loans completed against target pace, for tracking whether the operation is keeping up.
- **Roster** — specialist staffing: who's **assigned** vs. **trained** on which queue, and how queue load maps to available capacity.
- **Viz Lab** — throughput visualizations (inflow vs. outflow demand) — the exploratory corner where the data views get prototyped.

## Interaction craft worth a look

- **Shared live state** — a queue you action on one screen stays actioned as you move across the console (a small `QueueContext`), so the workspace behaves like one system instead of seven disconnected pages.
- **Alert → drill-down** — closing-risk alerts in Queue Monitor route directly to the underlying loan, modeling the real "see a problem → act on it" path rather than a dead-end notification.
- **Honest live-only status** — where real-time constraints rule out a feature (historical replay), the UI states it plainly instead of faking a control.

## Built with

- **[Tiny Wire](https://linzlos.github.io/tiny-wire/)** ([source](https://github.com/LinzLos/tiny-wire)) — the design system this is built on; tokens, type, and components come from it. Includes full light/dark theming with a persisted toggle.
- **React 19** + **TypeScript** + **Vite** + **React Router** + **Tailwind CSS v4**.
- Deployed on **Netlify** with SPA routing fallback.

## Run it locally

```bash
npm install
npm run dev      # start the dev server (Vite)
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Credits

Designed and built by **Lindsay Zuñiga**. Built on the [Tiny Wire](https://github.com/LinzLos/tiny-wire) design system. Please credit when remixing or adapting — feedback welcome → [linkedin.com/in/zunigo](https://www.linkedin.com/in/zunigo)
