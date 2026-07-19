// Canonical specialist roster — the single source of truth for who exists,
// where they're assigned, what they're trained on, and how they're performing.
// Capacity, Roster, Performance, the reassign modal, and Loans all read from
// here so headcounts and identities agree across screens.

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
