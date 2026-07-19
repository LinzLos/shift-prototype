// Single source of truth for the 34 queues. Overview renders the cards from
// `queues`; Queue Monitor, Simulation, and Loans derive their numbers from the
// same records, so a queue's KPIs, alerts, risk lines, and loan counts agree
// with its card by construction.

import { assignedTo, transferCandidatesFor, type TeamMember } from './team'

export type Stat = { label: string; value: string; sub: string }
export type QueueDef = {
  title: string
  category: string
  favorite?: boolean
  badge: { text: string; type: 'danger' | 'info' }
  stats: [Stat, Stat]
  flow: { outflow: string; inflow: string }
  footer: { text: string; type: 'danger' | 'info' }
}

const rawQueues: QueueDef[] = [
  // ── Review (10) ─────────────────────────────────────────────────────────────
  {
    title: 'Urgent Loan',
    category: 'Review',
    favorite: true,
    badge: { text: '14 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '1,402', sub: '+228 New Today' },
      { label: 'Avg. Process Time', value: '5.2h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '212', inflow: '228' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'New Purchase Applications',
    category: 'Review',
    badge: { text: '8 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '3,847', sub: '+312 New Today' },
      { label: 'Avg. Process Time', value: '3.8h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '298', inflow: '312' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Income Verification',
    category: 'Review',
    badge: { text: '22 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '612', sub: '+87 New Today' },
      { label: 'Avg. Process Time', value: '7.4h', sub: 'vs 5.5h Target' },
    ],
    flow: { outflow: '54', inflow: '87' },
    footer: { text: 'Backlogging', type: 'danger' },
  },
  {
    title: 'Employment History Review',
    category: 'Review',
    badge: { text: '11 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '441', sub: '+63 New Today' },
      { label: 'Avg. Process Time', value: '4.1h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '58', inflow: '63' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Credit Score Review',
    category: 'Review',
    badge: { text: '9 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '289', sub: '+44 New Today' },
      { label: 'Avg. Process Time', value: '6.8h', sub: 'vs 4.8h Target' },
    ],
    flow: { outflow: '31', inflow: '44' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Self-Employed Income Review',
    category: 'Review',
    badge: { text: '17 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '178', sub: '+29 New Today' },
      { label: 'Avg. Process Time', value: '8.2h', sub: 'vs 6.0h Target' },
    ],
    flow: { outflow: '22', inflow: '29' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Foreign National Review',
    category: 'Review',
    badge: { text: '4 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '94', sub: '+11 New Today' },
      { label: 'Avg. Process Time', value: '9.1h', sub: 'vs 9.0h Target' },
    ],
    flow: { outflow: '9', inflow: '11' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'VA Loan Review',
    category: 'Review',
    badge: { text: '5 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '521', sub: '+71 New Today' },
      { label: 'Avg. Process Time', value: '3.6h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '68', inflow: '71' },
    footer: { text: 'On track', type: 'info' },
  },
  {
    title: 'FHA Loan Review',
    category: 'Review',
    badge: { text: '12 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '834', sub: '+108 New Today' },
      { label: 'Avg. Process Time', value: '4.4h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '104', inflow: '108' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Jumbo Loan Review',
    category: 'Review',
    badge: { text: '7 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '203', sub: '+31 New Today' },
      { label: 'Avg. Process Time', value: '7.6h', sub: 'vs 5.5h Target' },
    ],
    flow: { outflow: '24', inflow: '31' },
    footer: { text: 'Above target time', type: 'danger' },
  },

  // ── Eligibility (8) ─────────────────────────────────────────────────────────
  {
    title: 'Refinance',
    category: 'Eligibility',
    favorite: true,
    badge: { text: '47 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '2,341', sub: '+203 New Today' },
      { label: 'Avg. Process Time', value: '6.1h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '91', inflow: '203' },
    footer: { text: 'Needs attention', type: 'info' },
  },
  {
    title: 'Debt-to-Income Assessment',
    category: 'Eligibility',
    badge: { text: '19 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '734', sub: '+92 New Today' },
      { label: 'Avg. Process Time', value: '5.9h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '78', inflow: '92' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'LTV Eligibility Review',
    category: 'Eligibility',
    badge: { text: '13 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '489', sub: '+64 New Today' },
      { label: 'Avg. Process Time', value: '5.3h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '55', inflow: '64' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Condo & Co-op Approval',
    category: 'Eligibility',
    badge: { text: '6 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '167', sub: '+19 New Today' },
      { label: 'Avg. Process Time', value: '6.4h', sub: 'vs 7.0h Target' },
    ],
    flow: { outflow: '15', inflow: '19' },
    footer: { text: 'Within target', type: 'info' },
  },
  {
    title: 'Second Home Eligibility',
    category: 'Eligibility',
    badge: { text: '8 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '244', sub: '+28 New Today' },
      { label: 'Avg. Process Time', value: '4.8h', sub: 'vs 5.0h Target' },
    ],
    flow: { outflow: '25', inflow: '28' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Investment Property Eligibility',
    category: 'Eligibility',
    badge: { text: '11 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '312', sub: '+47 New Today' },
      { label: 'Avg. Process Time', value: '6.7h', sub: 'vs 5.0h Target' },
    ],
    flow: { outflow: '39', inflow: '47' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'ARM Eligibility Review',
    category: 'Eligibility',
    badge: { text: '3 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '198', sub: '+24 New Today' },
      { label: 'Avg. Process Time', value: '3.9h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '21', inflow: '24' },
    footer: { text: 'On track', type: 'info' },
  },
  {
    title: 'USDA Loan Eligibility',
    category: 'Eligibility',
    badge: { text: '2 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '87', sub: '+9 New Today' },
      { label: 'Avg. Process Time', value: '4.6h', sub: 'vs 5.0h Target' },
    ],
    flow: { outflow: '8', inflow: '9' },
    footer: { text: 'Within target', type: 'info' },
  },

  // ── Closing (6) ─────────────────────────────────────────────────────────────
  {
    title: 'Title & Escrow Coordination',
    category: 'Closing',
    badge: { text: '14 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '891', sub: '+103 New Today' },
      { label: 'Avg. Process Time', value: '4.2h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '97', inflow: '103' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Final Disclosure Review',
    category: 'Closing',
    badge: { text: '16 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '423', sub: '+58 New Today' },
      { label: 'Avg. Process Time', value: '5.8h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '49', inflow: '58' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Clear to Close',
    category: 'Closing',
    badge: { text: '21 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '678', sub: '+84 New Today' },
      { label: 'Avg. Process Time', value: '6.3h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '71', inflow: '84' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Wire Transfer Authorization',
    category: 'Closing',
    badge: { text: '9 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '312', sub: '+38 New Today' },
      { label: 'Avg. Process Time', value: '2.8h', sub: 'vs 2.0h Target' },
    ],
    flow: { outflow: '34', inflow: '38' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Deed Recording',
    category: 'Closing',
    badge: { text: '7 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '544', sub: '+67 New Today' },
      { label: 'Avg. Process Time', value: '3.6h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '62', inflow: '67' },
    footer: { text: 'On track', type: 'info' },
  },
  {
    title: 'Post-Close Document Verification',
    category: 'Closing',
    badge: { text: '18 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '1,124', sub: '+139 New Today' },
      { label: 'Avg. Process Time', value: '4.9h', sub: 'vs 5.5h Target' },
    ],
    flow: { outflow: '128', inflow: '139' },
    footer: { text: 'Within target', type: 'info' },
  },

  // ── Fulfillment (5) ─────────────────────────────────────────────────────────
  {
    title: 'Appraisal Scheduling',
    category: 'Fulfillment',
    badge: { text: '23 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '567', sub: '+74 New Today' },
      { label: 'Avg. Process Time', value: '8.9h', sub: 'vs 6.0h Target' },
    ],
    flow: { outflow: '61', inflow: '74' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Flood Zone Certification',
    category: 'Fulfillment',
    badge: { text: '4 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '234', sub: '+28 New Today' },
      { label: 'Avg. Process Time', value: '2.4h', sub: 'vs 3.0h Target' },
    ],
    flow: { outflow: '25', inflow: '28' },
    footer: { text: 'On track', type: 'info' },
  },
  {
    title: 'Insurance Verification',
    category: 'Fulfillment',
    badge: { text: '9 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '389', sub: '+47 New Today' },
      { label: 'Avg. Process Time', value: '3.7h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '43', inflow: '47' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Survey & Title Search',
    category: 'Fulfillment',
    badge: { text: '12 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '445', sub: '+56 New Today' },
      { label: 'Avg. Process Time', value: '7.1h', sub: 'vs 5.5h Target' },
    ],
    flow: { outflow: '48', inflow: '56' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Conditions Clearance',
    category: 'Fulfillment',
    badge: { text: '31 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '812', sub: '+98 New Today' },
      { label: 'Avg. Process Time', value: '5.6h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '87', inflow: '98' },
    footer: { text: 'Backlogging', type: 'danger' },
  },

  // ── Exceptions (3) ──────────────────────────────────────────────────────────
  {
    title: 'Manual Underwrite Exception',
    category: 'Exceptions',
    badge: { text: '8 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '156', sub: '+22 New Today' },
      { label: 'Avg. Process Time', value: '11.3h', sub: 'vs 8.0h Target' },
    ],
    flow: { outflow: '18', inflow: '22' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'High-Risk Property Exception',
    category: 'Exceptions',
    badge: { text: '5 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '89', sub: '+13 New Today' },
      { label: 'Avg. Process Time', value: '9.7h', sub: 'vs 7.0h Target' },
    ],
    flow: { outflow: '10', inflow: '13' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Non-Warrantable Condo Exception',
    category: 'Exceptions',
    badge: { text: '2 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '47', sub: '+6 New Today' },
      { label: 'Avg. Process Time', value: '8.4h', sub: 'vs 9.0h Target' },
    ],
    flow: { outflow: '5', inflow: '6' },
    footer: { text: 'Near target', type: 'info' },
  },

  // ── Audit (2) ───────────────────────────────────────────────────────────────
  {
    title: 'HMDA Compliance Audit',
    category: 'Audit',
    badge: { text: '24 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '2,891', sub: '+187 New Today' },
      { label: 'Avg. Process Time', value: '6.2h', sub: 'vs 7.0h Target' },
    ],
    flow: { outflow: '174', inflow: '187' },
    footer: { text: 'Within target', type: 'info' },
  },
  {
    title: 'QC Post-Close Audit',
    category: 'Audit',
    badge: { text: '11 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '1,203', sub: '+148 New Today' },
      { label: 'Avg. Process Time', value: '5.4h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '135', inflow: '148' },
    footer: { text: 'Above target time', type: 'danger' },
  },
]

export const queues = rawQueues
export const categories = ['Review', 'Eligibility', 'Closing', 'Fulfillment', 'Exceptions', 'Audit']

// ─── Parsed metrics ───────────────────────────────────────────────────────────

export type QueueMetrics = {
  title: string
  active: number
  inflow: number
  outflow: number
  net: number            // outflow − inflow; negative means the backlog is growing
  processHours: number
  targetHours: number
  atRisk: number
  atRiskType: 'danger' | 'info'
  urgent: number         // loans within 5 days of closing
  specialistCount: number
}

function toNum(s: string) {
  return parseInt(s.replace(/,/g, ''), 10) || 0
}

export function getQueue(title: string): QueueDef {
  return queues.find((q) => q.title === title) ?? queues.find((q) => q.title === 'Refinance')!
}

export function getMetrics(title: string): QueueMetrics {
  const q = getQueue(title)
  const active = toNum(q.stats[0].value)
  const inflow = toNum(q.flow.inflow)
  const outflow = toNum(q.flow.outflow)
  const atRisk = parseInt(q.badge.text, 10) || 0
  const atRiskType = q.badge.type
  const processHours = parseFloat(q.stats[1].value) || 0
  const targetHours = parseFloat(q.stats[1].sub.replace(/^vs\s*/, '')) || 0
  // "At risk" loans are inside the 5-day closing window; "approaching risk"
  // loans are mostly outside it still — roughly a third have crossed.
  const urgent = atRiskType === 'danger' ? atRisk : Math.max(2, Math.floor(atRisk * 0.3))
  // Sized so each specialist carries roughly the Refinance-average load; the
  // canonical team sets a floor where it has members assigned.
  const assigned = assignedTo(q.title).length
  const specialistCount = Math.max(assigned, Math.min(22, Math.max(3, Math.round(active / 167))))
  return { title: q.title, active, inflow, outflow, net: outflow - inflow, processHours, targetHours, atRisk, atRiskType, urgent, specialistCount }
}

/** The header risk line — derived from the same badge the Overview card shows. */
export function getRiskLine(title: string): { label: string; type: 'danger' | 'info' } {
  const q = getQueue(title)
  const count = parseInt(q.badge.text, 10) || 0
  return {
    label: q.badge.type === 'danger' ? `${count} loans at risk` : `${count} loans approaching risk`,
    type: q.badge.type,
  }
}

// ─── Per-queue specialist workloads ───────────────────────────────────────────

export type Workload = { name: string; loans: number; fill: number; isTeamMember: boolean }

// Fill-in names for queues where the canonical team has no assignments.
const FILL_NAMES = [
  'Nadia Osman', 'Kwame Boateng', 'Lucia Ferreira', 'Dmitri Volkov', 'Aisha Karim',
  'Owen McAllister', 'Sana Qureshi', 'Mateo Vargas', 'Ingrid Solberg', 'Kenji Watanabe',
  'Amara Toure', 'Piotr Nowak', 'Leila Haddad', 'Marcus Lindqvist', 'Renee Dubois',
  'Tunde Adebayo', 'Silvia Romano', 'Arjun Malhotra', 'Freya Jensen', 'Diego Morales',
  'Zainab Farouk', 'Callum Boyd', 'Mei-Ling Chen', 'Oskar Novak',
]

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/**
 * Distribute a queue's active loans across its specialists with descending
 * weights. Canonical team members come first; generated names pad the rest.
 * The per-specialist loads sum to (approximately) the queue's active count, so
 * "queue load / specialist" agrees with the card's active loans.
 */
export function getWorkloads(title: string): Workload[] {
  const m = getMetrics(title)
  const members = assignedTo(title)
  const n = m.specialistCount
  const names: { name: string; isTeamMember: boolean }[] = members.map((t: TeamMember) => ({ name: t.name, isTeamMember: true }))
  const offset = hash(title) % FILL_NAMES.length
  for (let i = 0; names.length < n; i++) {
    const candidate = FILL_NAMES[(offset + i) % FILL_NAMES.length]
    if (!names.some((x) => x.name === candidate)) names.push({ name: candidate, isTeamMember: false })
  }
  const totalWeight = (n * (n + 1)) / 2 + n * (n / 2)
  return names.map((entry, i) => {
    const weight = (n - i) + n / 2
    const loans = Math.max(1, Math.round((m.active * weight) / totalWeight))
    return { ...entry, loans, fill: 0 }
  }).map((w, _i, arr) => ({ ...w, fill: w.loans / arr[0].loans }))
}

// ─── Per-period Queue Monitor data ────────────────────────────────────────────

export type PeriodKey = 'Real Time' | '1d' | 'Week' | 'Month' | 'Custom'
export const PERIOD_KEYS: PeriodKey[] = ['Real Time', '1d', 'Week', 'Month', 'Custom']

export type KpiBadge = { text: string; variant: 'warning' | 'danger' | 'none' }
export type PeriodKpi = { label: string; value: string; sub: string; badge?: KpiBadge; trend: 'up' | 'down' }
export type PeriodChart = { xLabels: string[]; outflow: number[]; inflow: number[]; target: number[]; bannerText: string; bannerStat: string; bannerTone: 'danger' | 'info' }
export type PeriodAlert = {
  title: string
  body: string
  variant: 'critical' | 'warning'
  cta?: { label: string; action: 'reassign' | 'roster' | 'loans' }
}
export type PeriodData = {
  kpis: PeriodKpi[]
  chart: PeriodChart
  alerts: PeriodAlert[]
  capacity: { load: number; gap: number }
}

// Scale factors relative to real-time, per period.
const PERIODS: Record<PeriodKey, { activeF: number; processF: number; inflowF: number; netF: number; phrase: string; xLabels: string[]; outShape: number[]; inShape: number[] }> = {
  'Real Time': { activeF: 1,     processF: 1,     inflowF: 1,     netF: 1,     phrase: 'today',
    xLabels: ['12a', '9a', '12p', '1p', '2p', '3p', 'Now'],
    outShape: [0.79, 0.82, 0.86, 0.89, 0.91, 0.94, 1.0], inShape: [0.51, 0.56, 0.63, 0.72, 0.80, 0.90, 1.0] },
  '1d':        { activeF: 0.963, processF: 0.967, inflowF: 0.956, netF: 0.794, phrase: 'yesterday',
    xLabels: ['12a', '4a', '8a', '12p', '4p', '8p', '12a'],
    outShape: [0.86, 0.90, 0.95, 1.0, 1.0, 0.98, 0.94], inShape: [0.58, 0.61, 0.65, 0.72, 0.82, 0.92, 1.0] },
  'Week':      { activeF: 0.900, processF: 0.885, inflowF: 0.92,  netF: 2.786, phrase: 'this week',
    xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    outShape: [0.80, 0.83, 0.86, 0.91, 0.96, 0.95, 1.0], inShape: [0.66, 0.80, 0.86, 0.90, 0.94, 0.93, 1.0] },
  'Month':     { activeF: 0.789, processF: 0.803, inflowF: 0.88,  netF: 7.955, phrase: 'this month',
    xLabels: ['Mar 1', 'Mar 8', 'Mar 15', 'Mar 22', 'Mar 28'],
    outShape: [0.79, 0.82, 0.88, 0.93, 1.0], inShape: [0.66, 0.72, 0.78, 0.89, 1.0] },
  'Custom':    { activeF: 0.872, processF: 0.852, inflowF: 0.90,  netF: 4.857, phrase: 'over range',
    xLabels: ['Mar 1', 'Mar 8', 'Mar 15', 'Mar 22', 'Mar 28'],
    outShape: [0.78, 0.83, 0.87, 0.94, 1.0], inShape: [0.67, 0.73, 0.80, 0.89, 1.0] },
}

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

export function getPeriodData(title: string, period: PeriodKey): PeriodData {
  const m = getMetrics(title)
  const p = PERIODS[period] ?? PERIODS['Custom']
  const isRT = period === 'Real Time'

  const active = Math.round(m.active * p.activeF)
  const process = Math.round(m.processHours * p.processF * 10) / 10
  const net = Math.round(m.net * p.netF)
  const inflow = Math.round(m.inflow * p.inflowF)
  const outflow = inflow + net // forces inflow − outflow parity with net
  const backlog = -net // positive when the backlog grew

  const overTarget = Math.round((process - m.targetHours) * 10) / 10
  const processBadge: KpiBadge | undefined =
    overTarget > m.targetHours * 0.3 ? { text: 'Breaching', variant: 'danger' }
    : overTarget > 0 ? { text: 'Above target', variant: 'warning' }
    : undefined
  const netBadge: KpiBadge | undefined = net < 0 ? { text: 'Backlogging', variant: 'danger' } : undefined
  const activeBadge: KpiBadge | undefined = net < 0 ? { text: 'Above target', variant: 'warning' } : undefined

  const activeSub = isRT ? `+${fmt(Math.round(m.inflow / 12))} in last 15 min`
    : period === '1d' ? 'vs prior day'
    : period === 'Week' ? 'Weekly avg'
    : period === 'Month' ? 'Monthly avg · trending' + (net < 0 ? ' up' : ' down')
    : 'Avg over selected range'
  const processSub = `Target ${m.targetHours}h · ${overTarget > 0 ? '+' : ''}${overTarget}h ${overTarget > 0 ? 'over' : 'under'}`
  const netSub = isRT || period === '1d'
    ? `+${fmt(inflow)} in · -${fmt(outflow)} out`
    : `Cumulative ${p.phrase}`

  // Trend arrows follow the metric's actual direction: a growing backlog means
  // active loans are climbing and net flow is falling.
  const kpis: PeriodKpi[] = [
    { label: 'Active Loans', value: fmt(active), sub: activeSub, badge: activeBadge, trend: net < 0 ? 'up' : 'down' },
    { label: 'Process Time Avg.', value: `${process} h`, sub: processSub, badge: processBadge, trend: overTarget > 0 ? 'up' : 'down' },
    { label: 'Net Flow', value: net > 0 ? `+${fmt(net)}` : fmt(net), sub: netSub, badge: netBadge, trend: net < 0 ? 'down' : 'up' },
  ]

  // Chart: shapes scaled to this queue's flow volumes.
  const outPeak = Math.max(outflow, 8)
  const inPeak = Math.max(inflow, 8)
  const chartOut = p.outShape.map((s) => Math.round(s * outPeak))
  const chartIn = p.inShape.map((s) => Math.round(s * inPeak))
  const target = p.xLabels.map(() => Math.round(outPeak * 0.9))
  const growing = net < 0
  const bannerText = growing
    ? `Backlog growing — inflow has exceeded outflow ${isRT ? 'for 4 straight days' : p.phrase}`
    : `Outflow ahead of inflow — backlog shrinking ${p.phrase}`
  const bannerStat = growing ? `Backlog +${fmt(backlog)} ${p.phrase}` : `Cleared ${fmt(net)} ${p.phrase}`

  const chart: PeriodChart = {
    xLabels: p.xLabels, outflow: chartOut, inflow: chartIn, target,
    bannerText, bannerStat, bannerTone: growing ? 'danger' : 'info',
  }

  // Alerts: same numbers, tensed for the period. Staffing CTAs only exist for
  // Refinance — the roster and reassign flows are scoped to it.
  const staffable = title === 'Refinance'
  const alerts: PeriodAlert[] = []
  if (isRT) {
    alerts.push({
      title: `${m.urgent} loans within 5 days of closing`,
      body: 'Tighten closing threshold.',
      variant: m.atRiskType === 'danger' ? 'critical' : 'warning',
      cta: { label: 'See loan details', action: 'loans' },
    })
    if (growing) alerts.push({
      title: 'Inflow outpacing outflow for 4 consecutive days',
      body: 'Rebalance specialist load.',
      variant: 'critical',
      ...(staffable ? { cta: { label: 'Reassign Staff', action: 'reassign' as const } } : {}),
    })
    else alerts.push({
      title: 'Outflow ahead of inflow today',
      body: 'Queue is draining — no rebalance needed.',
      variant: 'warning',
    })
    if (staffable) alerts.push({
      title: '2 specialists consistently idle',
      body: 'Review Roster assignments.',
      variant: 'warning',
      cta: { label: 'Go to Roster', action: 'roster' },
    })
    else alerts.push({
      title: `Process time ${overTarget > 0 ? `+${overTarget}h over` : 'within'} target`,
      body: overTarget > 0 ? 'Throughput below required pace.' : 'Holding steady at current staffing.',
      variant: overTarget > 0 ? 'critical' : 'warning',
    })
  } else {
    if (growing) alerts.push({
      title: `Backlog grew by ${fmt(backlog)} loans ${p.phrase}`,
      body: 'Sustained inflow pressure building.',
      variant: 'critical',
    })
    else alerts.push({
      title: `Backlog shrank by ${fmt(net)} loans ${p.phrase}`,
      body: 'Outflow held above inflow.',
      variant: 'warning',
    })
    if (overTarget > 0) alerts.push({
      title: `Process time averaged ${overTarget}h above target`,
      body: 'Specialist throughput below required pace.',
      variant: 'critical',
    })
    else alerts.push({
      title: 'Process time held within target',
      body: `Averaged ${process}h against a ${m.targetHours}h target.`,
      variant: 'warning',
    })
    alerts.push({
      title: `Peak inflow reached ${fmt(inflow)} loans ${p.phrase}`,
      body: growing ? 'No surge capacity was activated.' : 'Existing capacity absorbed the peak.',
      variant: 'warning',
    })
  }

  const load = Math.round(active / m.specialistCount)
  return { kpis, chart, alerts, capacity: { load, gap: load - 85 } }
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

/** Queues that hold cross-trained specialists available to move into `target`. */
export function getSourceQueues(target: string, alreadyTransferred: string[]): SourceQueue[] {
  const candidates = transferCandidatesFor(target).filter((m) => !alreadyTransferred.includes(m.name))
  const byQueue = new Map<string, TeamMember[]>()
  for (const c of candidates) {
    const list = byQueue.get(c.assignedQueue) ?? []
    list.push(c)
    byQueue.set(c.assignedQueue, list)
  }
  const out: SourceQueue[] = []
  for (const [name, specialists] of byQueue) {
    const status = SOURCE_QUEUE_STATUS[name] ?? { health: 'healthy' as QueueHealth, capacityPct: 60 }
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

// ─── Per-queue loan drill-down data ───────────────────────────────────────────

export type Loan = {
  id: string
  borrower: string
  daysToClose: number
  amount: number
  stage: string
  specialist: string
  timeInQ: number // hours in queue
  ltv: number     // loan-to-value %
  dti: number     // debt-to-income %
}

export const LOAN_STAGES = ['Clear to Close', 'Final Review', 'Underwriting', 'Docs Out', 'Conditional Approval']

const BORROWERS = [
  'Amara Ng', 'Liam Roy', 'Sofia Diaz', 'Noah Khan', 'Mia Park', 'Ethan Cole', 'Ava Brooks',
  'Lucas Reed', 'Isla Moreno', 'Owen Hart', 'Zara Patel', 'Leo Fischer', 'Nina Walsh', 'Caleb Stone',
  'Ruby Tan', 'Eli Banks', 'Maya Frost', 'Jonah West', 'Iris Lund', 'Theo Vance', 'Lena Cruz',
  'Asher Quinn', 'Vera Holt', 'Milo Day', 'Esme Cardoza', 'Felix Wynn', 'Cora Bishop', 'Hugo Maris',
  'Daisy Lin', 'Ari Solem', 'Nora Beck', 'Sam Iyer', 'Greta Voss', 'Reuben Ode', 'Talia Mensah',
  'Dion Park', 'Petra Falk', 'Omar Reza', 'Beth Calder', 'Niko Sato', 'Vivian Ross', 'Hana Oduya',
  'Cyrus Bell', 'Maren Wolfe', 'Idris Khan', 'Bea Conti', 'Soren Lund', 'Faye Adler', 'Rhys Okafor',
  'Lila Senn', 'Knox Reyes', 'Opal Vega', 'Ravi Mehta', 'June Halloran', 'Dane Whitlock', 'Yuki Mori',
  'Pearl Agu', 'Ezra Tobin', 'Nadia Ruiz', 'Cole Hammond', 'Vesna Petrova', 'Tariq Bello', 'Lottie Frey',
]

function queuePrefix(title: string) {
  const words = title.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w))
  if (title === 'Refinance') return 'RF'
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return title.slice(0, 2).toUpperCase()
}

/**
 * Deterministic loan pool for a queue's drill-down. The first `urgent` loans
 * land within 5 days of closing so the count matches the queue's alert exactly.
 */
export function getLoans(title: string): Loan[] {
  const m = getMetrics(title)
  const workloads = getWorkloads(title)
  const prefix = queuePrefix(title)
  const h = hash(title)
  const urgent = Math.min(m.urgent, BORROWERS.length - 8)
  const total = Math.min(BORROWERS.length, Math.max(urgent + 16, 30))
  return BORROWERS.slice(0, total).map((borrower, i) => {
    const daysToClose = i < urgent ? (i % 5) + 1 : (((i + h) * 7) % 26) + 6
    const amount = 215000 + (((i + h) * 41737) % 540000)
    const stage = i < urgent
      ? (i % 2 === 0 ? 'Clear to Close' : 'Final Review')
      : LOAN_STAGES[((i + h) * 3) % LOAN_STAGES.length]
    return {
      id: `${prefix}-${4800 + ((h % 90) * 10) + i * 13}`,
      borrower,
      daysToClose,
      amount: Math.round(amount / 1000) * 1000,
      stage,
      specialist: workloads[i % workloads.length].name,
      timeInQ: i < urgent ? 30 + (((i + h) * 5) % 36) : 8 + (((i + h) * 13) % 60),
      ltv: 62 + (((i + h) * 17) % 36),
      dti: 28 + (((i + h) * 11) % 27),
    }
  })
}
