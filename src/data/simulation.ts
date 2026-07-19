// Simulation engine: the queue's current ranking scores every loan against the
// four live ranking factors at their CURRENT thresholds (the same rules the
// Queue Monitor "What's driving rankings" card describes). A simulation re-runs
// that scoring with the user's PROPOSED thresholds substituted for the
// conditions they added, then diffs the two rankings — so editing a threshold
// genuinely changes the results. The loan pool is a sample; headline counts are
// scaled to the queue's full active-loan population and labeled as estimates.

import { getLoans, getMetrics, type Loan } from './queues'

export type SimCondition = {
  label: string     // matches a ranking-factor label below
  proposed: string  // free text like "≤ 14 days" — first number is the threshold
}

export type SimRow = {
  rank: number
  loan: string
  closing: string
  timeInQ: string
  ltv: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export type SimResult = {
  affected: number      // scaled to the queue's active count
  up: number
  down: number
  affectedPct: number   // % of active
  rows: SimRow[]
}

// The live ranking rules — one threshold per factor. These match the template
// "current" values shown in the Condition Builder.
const CURRENT_THRESHOLDS: Record<string, number> = {
  'Closing Timeline': 30,  // closing within N days is prioritized
  'Processing Status': 48, // queued longer than N hours is prioritized
  'LTV Ratio': 80,         // LTV at or above 80 up to N% is prioritized
  'DTI Ratio': 43,         // DTI at or above N% is prioritized
}

/** First number in a threshold string; falls back to the current rule. */
export function parseThreshold(proposed: string, label: string): number {
  const m = proposed.match(/\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : CURRENT_THRESHOLDS[label] ?? 0
}

/** One factor's score contribution for one loan. Positive promotes. */
function factorScore(label: string, threshold: number, loan: Loan): number {
  switch (label) {
    case 'Closing Timeline':
      // Window membership comes from the threshold; the urgency gradient is
      // fixed, so tightening drops later loans out without deflating the
      // scores of the loans closing soonest.
      return loan.daysToClose <= threshold ? 40 + Math.max(0, 31 - loan.daysToClose) * 2 : 0
    case 'Processing Status':
      return loan.timeInQ > threshold ? Math.min(40, loan.timeInQ - threshold) : 0
    case 'LTV Ratio':
      return loan.ltv >= 80 && loan.ltv <= threshold ? loan.ltv - 79 : 0
    case 'DTI Ratio':
      return loan.dti >= threshold ? loan.dti - threshold + 5 : 0
    default:
      return 0
  }
}

/** Full ranking score under a given set of per-factor thresholds. */
function totalScore(loan: Loan, thresholds: Record<string, number>): number {
  return Object.entries(thresholds).reduce((s, [label, t]) => s + factorScore(label, t, loan), 0)
}

function rankBy(pool: Loan[], thresholds: Record<string, number>): Map<string, number> {
  const sorted = [...pool].sort((a, b) =>
    totalScore(b, thresholds) - totalScore(a, thresholds)
    || a.daysToClose - b.daysToClose
    || a.id.localeCompare(b.id)
  )
  return new Map(sorted.map((l, i) => [l.id, i + 1]))
}

export function runSimulation(queue: string, conditions: SimCondition[]): SimResult {
  const metrics = getMetrics(queue)
  const pool = getLoans(queue)

  const proposedThresholds = { ...CURRENT_THRESHOLDS }
  for (const c of conditions) {
    if (c.label in proposedThresholds) proposedThresholds[c.label] = parseThreshold(c.proposed, c.label)
  }

  const baseRank = rankBy(pool, CURRENT_THRESHOLDS)
  const newRank = rankBy(pool, proposedThresholds)

  const changes = pool
    .map((loan) => ({ loan, rank: newRank.get(loan.id)!, change: baseRank.get(loan.id)! - newRank.get(loan.id)! }))

  const movedUp = changes.filter((c) => c.change > 0).length
  const movedDown = changes.filter((c) => c.change < 0).length
  const scale = metrics.active / pool.length

  // "Top 10 Rank Changes" = the ten biggest movers, best new rank first.
  const movers = [...changes]
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change) || a.rank - b.rank)
    .slice(0, 10)
    .sort((a, b) => a.rank - b.rank)

  const rows: SimRow[] = movers.map((c) => ({
    rank: c.rank,
    loan: c.loan.id,
    closing: `${c.loan.daysToClose} days`,
    timeInQ: `${c.loan.timeInQ} hrs`,
    ltv: `${c.loan.ltv}%`,
    change: c.change > 0 ? `+${c.change}` : c.change < 0 ? `${c.change}` : '–',
    changeType: c.change > 0 ? 'positive' : c.change < 0 ? 'negative' : 'neutral',
  }))

  const affected = Math.round((movedUp + movedDown) * scale)
  return {
    affected,
    up: Math.round(movedUp * scale),
    down: Math.round(movedDown * scale),
    affectedPct: Math.round((affected / metrics.active) * 1000) / 10,
    rows,
  }
}

/** Live per-condition insight — the count is computed, not asserted. */
export function insightFor(queue: string, label: string, proposed: string): string {
  const metrics = getMetrics(queue)
  const pool = getLoans(queue)
  const threshold = parseThreshold(proposed, label)
  const current = CURRENT_THRESHOLDS[label] ?? threshold
  const scaled = (n: number) => Math.round(n * (metrics.active / pool.length)).toLocaleString('en-US')
  const count = (t: number) => pool.filter((l) => factorScore(label, t, l) > 0).length
  const delta = Math.abs(count(threshold) - count(current))
  switch (label) {
    case 'Closing Timeline':
      return threshold < current
        ? `Tightening to ${threshold} days pulls priority off ~${scaled(delta)} loans closing later — the closest deadlines rise.`
        : `Widening to ${threshold} days spreads priority across ~${scaled(count(threshold))} loans in the window.`
    case 'Processing Status':
      return threshold < current
        ? `Lowering the cutoff promotes ~${scaled(delta)} additional stalled loans past ${threshold} hours in queue.`
        : `Raising the cutoff to ${threshold} hours drops ~${scaled(delta)} loans out of the stalled tier.`
    case 'LTV Ratio':
      return threshold > current
        ? `Raising the ceiling to ${threshold}% pulls ~${scaled(delta)} higher-LTV loans up the ranking.`
        : `Lowering the ceiling to ${threshold}% releases ~${scaled(delta)} loans from the high-LTV tier.`
    case 'DTI Ratio':
      return threshold > current
        ? `Tightening to ${threshold}% DTI drops ~${scaled(delta)} borderline loans from priority range.`
        : `Expanding to ${threshold}% DTI elevates ~${scaled(delta)} additional loans into priority range.`
    default:
      return `~${scaled(count(threshold))} loans match this condition.`
  }
}
