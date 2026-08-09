// Canonical specialist roster — the single source of truth for who exists,
// where they're assigned, what they're trained on, and how they're performing
// on the five queues that carry the demo's story (Refinance, Employment
// History Review, New Purchase Applications, Title & Escrow Coordination,
// Deed Recording). Capacity, Roster, Performance, the reassign modal, and
// Loans all read from here so headcounts and identities agree across screens.
//
// For every OTHER queue, `rosterFor(queue)` synthesizes a deterministic roster
// from the shared FILL_NAMES pool so switching queues never lands on an empty
// Roster or NaN-filled Performance page. Same queue → same names/numbers.

import { FILL_NAMES, getMetrics, getWorkloads, poolHash, queues } from './queues'

export type TeamMember = {
  name: string
  assignedQueue: string
  trainedQueues: string[]
  daysInQueue: number
  completedToday: number
  handleHours: number
}

// Personal daily completion target — "on target" everywhere means completedToday >= this.
export const DAILY_TARGET = 8

// Refinance team: 14 specialists. completedToday sums to 91 (the queue's daily
// outflow) and handleHours averages 6.1 (the queue's process-time average).
export const team: TeamMember[] = [
  { name: 'Simone Adeyemi', assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'New Purchase Applications', 'Clear to Close'], daysInQueue: 3,  completedToday: 12, handleHours: 3.8 },
  { name: 'Theo Bateman',   assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Employment History Review'],                   daysInQueue: 5,  completedToday: 11, handleHours: 4.0 },
  { name: 'Steph Curry',    assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Title & Escrow Coordination'],                 daysInQueue: 10, completedToday: 10, handleHours: 3.6 },
  { name: 'Draymond Green', assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Deed Recording'],                              daysInQueue: 12, completedToday: 9,  handleHours: 4.1 },
  { name: 'Jordan Marks',   assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Credit Score Review'],                         daysInQueue: 18, completedToday: 9,  handleHours: 4.2 },
  { name: 'Chris Navarro',  assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'New Purchase Applications'],                   daysInQueue: 7,  completedToday: 8,  handleHours: 5.2 },
  { name: 'Aaliya Frost',   assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Income Verification'],                         daysInQueue: 4,  completedToday: 8,  handleHours: 5.7 },
  { name: 'Ben Okafor',     assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'FHA Loan Review'],                             daysInQueue: 6,  completedToday: 8,  handleHours: 6.0 },
  { name: 'Carmen Diaz',    assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Final Disclosure Review'],                     daysInQueue: 9,  completedToday: 4,  handleHours: 7.4 },
  { name: 'Devon Park',     assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'VA Loan Review'],                              daysInQueue: 11, completedToday: 3,  handleHours: 7.9 },
  { name: 'Elise Tran',     assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Insurance Verification'],                      daysInQueue: 15, completedToday: 3,  handleHours: 8.3 },
  { name: 'Felix Grant',    assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Flood Zone Certification'],                    daysInQueue: 8,  completedToday: 2,  handleHours: 8.6 },
  { name: 'Grace Yuen',     assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Jumbo Loan Review'],                           daysInQueue: 21, completedToday: 2,  handleHours: 8.2 },
  { name: 'Hassan Ali',     assignedQueue: 'Refinance', trainedQueues: ['Refinance', 'Appraisal Scheduling'],                        daysInQueue: 13, completedToday: 2,  handleHours: 8.4 },

  // Cross-trained specialists on other queues — the transfer candidates.
  { name: 'Priya Okonkwo',  assignedQueue: 'Employment History Review',   trainedQueues: ['Employment History Review', 'Refinance'],   daysInQueue: 22, completedToday: 7, handleHours: 4.4 },
  { name: 'Yemi Osei',      assignedQueue: 'Employment History Review',   trainedQueues: ['Employment History Review', 'Refinance'],   daysInQueue: 9,  completedToday: 6, handleHours: 4.9 },
  { name: 'Dana Reyes',     assignedQueue: 'Employment History Review',   trainedQueues: ['Employment History Review', 'Refinance'],   daysInQueue: 25, completedToday: 5, handleHours: 5.5 },
  { name: 'Marcus Webb',    assignedQueue: 'Employment History Review',   trainedQueues: ['Employment History Review', 'Refinance'],   daysInQueue: 11, completedToday: 6, handleHours: 5.1 },
  { name: 'Ines Castillo',  assignedQueue: 'New Purchase Applications',   trainedQueues: ['New Purchase Applications', 'Refinance'],   daysInQueue: 6,  completedToday: 9, handleHours: 3.9 },
  { name: 'Ravi Nair',      assignedQueue: 'New Purchase Applications',   trainedQueues: ['New Purchase Applications', 'Refinance'],   daysInQueue: 14, completedToday: 8, handleHours: 4.3 },
  { name: 'Tomás Rivera',   assignedQueue: 'Title & Escrow Coordination', trainedQueues: ['Title & Escrow Coordination', 'Refinance'], daysInQueue: 17, completedToday: 7, handleHours: 4.6 },
  { name: 'Ryan Coogler',   assignedQueue: 'Deed Recording',              trainedQueues: ['Deed Recording', 'Refinance'],              daysInQueue: 5,  completedToday: 8, handleHours: 4.1 },
]

export function assignedTo(queue: string): TeamMember[] {
  return team.filter((m) => m.assignedQueue === queue)
}

export function trainedFor(queue: string): TeamMember[] {
  return team.filter((m) => m.trainedQueues.includes(queue))
}

/** Cross-trained for `queue` but currently assigned elsewhere. */
export function transferCandidatesFor(queue: string): TeamMember[] {
  return team.filter((m) => m.assignedQueue !== queue && m.trainedQueues.includes(queue))
}

// ─── Synthetic rosters for non-canonical queues ───────────────────────────────
//
// The 22-person canonical `team` only covers 5 queues. For every other queue,
// we synthesize a deterministic roster off the shared FILL_NAMES pool so
// Roster / Performance stay full when the user switches queues. Same queue →
// same names & numbers on every render.

// Nudge a value into a range using a deterministic per-name delta.
function jitter(seed: number, span: number): number {
  return ((seed % 1000) / 1000 - 0.5) * span
}

function syntheticMember(queue: string, name: string, targetHandle: number, index: number): TeamMember {
  const seed = poolHash(`${queue}::${name}`)
  // handleHours scatters around the queue's process-time average.
  const handleHours = Math.round((targetHandle + jitter(seed, 2.4)) * 10) / 10
  // Faster handlers finish more loans. DAILY_TARGET = 8, so a range of ~2–13
  // keeps the Team-Target percentage plausible without pinning it to 100%.
  const completedToday = Math.max(2, Math.min(13, Math.round(11 - handleHours * 0.9 + jitter(seed >> 3, 3))))
  const daysInQueue = 3 + (seed % 18)
  return {
    name,
    assignedQueue: queue,
    trainedQueues: [queue, ...trainedNeighborsFor(queue, index)],
    daysInQueue,
    completedToday,
    handleHours,
  }
}

// Pick 1–2 "other queue" titles as cross-training decoration for a synth
// specialist. Uses the canonical queue list from queues.ts.
function trainedNeighborsFor(queue: string, index: number): string[] {
  const titles = queues.map((q) => q.title).filter((t) => t !== queue)
  if (titles.length === 0) return []
  const offset = poolHash(`${queue}::t::${index}`) % titles.length
  const count = 1 + (index % 2)
  const picks: string[] = []
  for (let i = 0; i < count && picks.length < titles.length; i++) {
    picks.push(titles[(offset + i) % titles.length])
  }
  return picks
}

/**
 * The people shown as "assigned to" a queue — ONE headcount per queue, shared
 * with every surface. The roster is derived from getWorkloads() so its names
 * and count always match the Capacity card and the Loans drill-down: canonical
 * team members keep their real stats, and the padded names get deterministic
 * synthesized stats. (getWorkloads already puts canonical members first and
 * pads thin queues to a realistic specialistCount.)
 */
export function rosterFor(queue: string): TeamMember[] {
  const metrics = getMetrics(queue)
  const byName = new Map(team.map((m) => [m.name, m]))
  return getWorkloads(queue).map((w, i) => {
    const real = byName.get(w.name)
    if (real && real.assignedQueue === queue) return real
    return syntheticMember(queue, w.name, metrics.processHours, i)
  })
}

/**
 * People cross-trained on `queue` but assigned elsewhere. Real for canonical
 * queues, synthesized (3 pool names anchored to nearby queues) for the rest —
 * so the Roster table's "N assigned · M trained" line never reads " · 0 more
 * trained" on a queue that would look barren. This is ALSO the reassign
 * modal's candidate pool (see getSourceQueues), so the table's trained count
 * and the modal's available specialists agree by construction.
 */
export function trainedElsewhereFor(queue: string): TeamMember[] {
  const real = team.filter((m) => m.assignedQueue !== queue && m.trainedQueues.includes(queue))
  if (real.length > 0) return real
  const metrics = getMetrics(queue)
  const roster = rosterFor(queue)
  const taken = new Set(roster.map((m) => m.name))
  const otherTitles = queues.map((q) => q.title).filter((t) => t !== queue)
  const offset = poolHash(`${queue}::trained`) % FILL_NAMES.length
  const picks: TeamMember[] = []
  for (let i = 0; picks.length < 3 && i < FILL_NAMES.length; i++) {
    const name = FILL_NAMES[(offset + i) % FILL_NAMES.length]
    if (taken.has(name)) continue
    const home = otherTitles.length
      ? otherTitles[poolHash(`${queue}::home::${name}`) % otherTitles.length]
      : queue
    picks.push({
      ...syntheticMember(queue, name, metrics.processHours, roster.length + picks.length),
      assignedQueue: home,
      trainedQueues: [home, queue],
    })
  }
  return picks
}

// ─── Reassign modal source queues ─────────────────────────────────────────────

export type QueueHealth = 'healthy' | 'warning' | 'at-risk'
export type SourceQueue = {
  name: string
  health: QueueHealth
  capacityPct: number
  specialists: TeamMember[]
  suggested: boolean
  suggestReason?: string
  warningReason?: string
}

const SOURCE_QUEUE_STATUS: Record<string, { health: QueueHealth; capacityPct: number }> = {
  'Employment History Review': { health: 'healthy', capacityPct: 62 },
  'New Purchase Applications': { health: 'warning', capacityPct: 81 },
  'Title & Escrow Coordination': { health: 'at-risk', capacityPct: 96 },
  'Deed Recording': { health: 'healthy', capacityPct: 44 },
}

function sourceStatusFor(queue: string): { health: QueueHealth; capacityPct: number } {
  const known = SOURCE_QUEUE_STATUS[queue]
  if (known) return known
  const pct = 40 + (poolHash(`${queue}::capacity`) % 55)
  return { health: pct < 70 ? 'healthy' : pct < 90 ? 'warning' : 'at-risk', capacityPct: pct }
}

/**
 * Queues holding cross-trained specialists available to move into `target`.
 * Candidates come from trainedElsewhereFor — the SAME pool the Roster table
 * counts as "M more trained" — minus anyone the reassignment ledger says has
 * already been moved (to anywhere).
 */
export function getSourceQueues(target: string, reassignments: Record<string, string>): SourceQueue[] {
  const candidates = trainedElsewhereFor(target).filter((m) => !(m.name in reassignments))
  const byQueue = new Map<string, TeamMember[]>()
  for (const c of candidates) {
    const list = byQueue.get(c.assignedQueue) ?? []
    list.push(c)
    byQueue.set(c.assignedQueue, list)
  }
  const out: SourceQueue[] = []
  for (const [name, specialists] of byQueue) {
    const status = sourceStatusFor(name)
    out.push({
      name,
      ...status,
      specialists,
      suggested: false,
      warningReason: status.health === 'at-risk'
        ? `Queue at ${status.capacityPct}% capacity — pulling from here is not recommended`
        : status.health === 'warning'
          ? `Queue at ${status.capacityPct}% capacity — moving specialists may destabilize this queue`
          : undefined,
    })
  }
  // Most available specialists first (healthy queues ahead of stressed ones);
  // the single best healthy option carries the SUGGESTED banner.
  out.sort((a, b) =>
    Number(b.health === 'healthy') - Number(a.health === 'healthy')
    || b.specialists.length - a.specialists.length
    || a.capacityPct - b.capacityPct
  )
  const best = out.find((q) => q.health === 'healthy')
  if (best) {
    best.suggested = true
    best.suggestReason = `${best.specialists.length} specialist${best.specialists.length !== 1 ? 's' : ''} trained for ${target} · Queue at ${best.capacityPct}% capacity — safe to pull from`
    best.warningReason = undefined
  }
  return out
}
