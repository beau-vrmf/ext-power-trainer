// Fault Isolation training data — C-130 Electrical System
// Fault Code: 240115 — Aircraft will not accept external power.
// Source: Figure 3-7 (verbatim from Technical Order)
// Correct training path terminates at Block 182 (circuit breaker was pulled open).

export type Outcome = {
  kind: 'resolved' | 'escalate'
  message: string
}

export type Block = {
  id: string              // canonical: '<TO>/<figure>/<sheet>/<blockNumber>'
  technicalOrder: string
  figure: string
  sheet: string
  blockNumber: string
  text: string            // verbatim TO text
  sheetNotes?: string[]
  cautions?: string[]
  imageRef?: string       // path to training image in /public/figures/
  onYes?: string          // block ID to route to on YES
  onNo?: string           // block ID to route to on NO
  terminalKind?: 'resolved' | 'escalate'
  correctAnswer?: 'yes' | 'no'  // correct answer for scoring; undefined on terminal blocks
  stub?: true
}

export type FaultCode = {
  code: string
  description: string
  reference: string
  entry: string | null
}

const TO = 'TO-EXTPWR'
const FIG = '3-7'
const SHEET = '1'

export function bid(blockNumber: string): string {
  return `${TO}/${FIG}/${SHEET}/${blockNumber}`
}

function block(
  blockNumber: string,
  partial: Omit<Block, 'id' | 'technicalOrder' | 'figure' | 'sheet' | 'blockNumber'>,
): Block {
  const defaultImageRef = partial.imageRef ?? `/figures/${FIG}/blk-${blockNumber}.png`
  return {
    id: bid(blockNumber),
    technicalOrder: TO,
    figure: FIG,
    sheet: SHEET,
    blockNumber,
    ...partial,
    imageRef: defaultImageRef,
  }
}

// ── Fault codes ────────────────────────────────────────────────────────────

export const faultCodes: FaultCode[] = [
  {
    code: '240115',
    description: 'Aircraft will not accept external power.',
    reference: 'Perform Figure 3-1, Preparation A, then go to Figure 3-7, Block 167.',
    entry: bid('167'),
  },
]

// ── Decision tree — Figure 3-7 ─────────────────────────────────────────────
// Correct training path: 167(NO)→168(YES)→169(NO)→170(NO)→171(YES)→180(YES)→182

const _blocks: Block[] = [
  block('167', {
    text: 'In flight station, observe EXTERNAL POWER AVAIL indicator. Is indicator illuminated?',
    correctAnswer: 'no',
    onYes: bid('172'),
    onNo: bid('168'),
  }),
  block('168', {
    text: 'On power cart, observe CONTACT light. Is CONTACT light illuminated?',
    correctAnswer: 'yes',
    onYes: bid('169'),
    onNo: bid('175'),
  }),
  block('169', {
    text: 'a. Shut down external power source. b. Disconnect power cable and inspect connector pins. Is contamination present on connector pins?',
    correctAnswer: 'no',
    onYes: bid('178'),
    onNo: bid('170'),
  }),
  block('170', {
    text: 'a. Reseat power cable plug. b. Apply external power in accordance with Figure 3-1, Preparation A. Did aircraft accept external power?',
    correctAnswer: 'no',
    onYes: bid('179'),
    onNo: bid('171'),
  }),
  block('171', {
    text: 'Inspect battery compartment circuit breaker. Is battery compartment circuit breaker pulled open?',
    correctAnswer: 'yes',
    onYes: bid('180'),
    onNo: bid('181'),
  }),
  block('172', {
    text: 'Using multimeter, check for 28 VDC at aircraft power switch. Is 28 VDC present at aircraft power switch?',
    onYes: bid('173'),
    onNo: bid('174'),
  }),
  block('173', {
    text: 'Fault is in aircraft power switch. Replace aircraft power switch in accordance with applicable maintenance procedures.',
    terminalKind: 'resolved',
  }),
  block('174', {
    text: 'Fault is in aircraft power wiring. Refer to applicable wiring diagrams and continue troubleshooting.',
    terminalKind: 'escalate',
  }),
  block('175', {
    text: 'a. Shut down external power unit. b. Reattempt generator start in accordance with generator operating instructions. Did CONTACT light illuminate?',
    onYes: bid('176'),
    onNo: bid('177'),
  }),
  block('176', {
    text: 'Bad generator start caused malfunction. No further troubleshooting required.',
    terminalKind: 'resolved',
  }),
  block('177', {
    text: 'Fault is in external power generator. Refer to applicable generator maintenance procedures and continue troubleshooting.',
    terminalKind: 'escalate',
  }),
  block('178', {
    text: 'Contamination on connector pins caused malfunction. Clean connector pins with approved solvents. No further troubleshooting required.',
    terminalKind: 'resolved',
  }),
  block('179', {
    text: 'Unseated connector plug caused malfunction. No further troubleshooting required.',
    terminalKind: 'resolved',
  }),
  block('180', {
    text: 'a. Close battery compartment circuit breaker. b. Apply external power in accordance with Figure 3-1, Preparation A. Did aircraft accept external power?',
    correctAnswer: 'yes',
    onYes: bid('182'),
    onNo: bid('183'),
  }),
  block('181', {
    text: 'Fault is in aircraft power wiring. Refer to applicable wiring diagrams and continue troubleshooting.',
    terminalKind: 'escalate',
  }),
  block('182', {
    text: 'Open battery compartment circuit breaker caused malfunction. No further troubleshooting required.',
    terminalKind: 'resolved',
  }),
  block('183', {
    text: 'Fault is in aircraft power wiring. Refer to applicable wiring diagrams and continue troubleshooting.',
    terminalKind: 'escalate',
  }),
]

const blockMap = new Map(_blocks.map((b) => [b.id, b]))

export function getBlock(id: string): Block | undefined {
  return blockMap.get(id)
}

export function getFaultCode(code: string): FaultCode | undefined {
  return faultCodes.find((f) => f.code === code)
}

export function isTerminal(block: Block): boolean {
  return block.onYes === undefined && block.onNo === undefined
}

export const DEDUCTION_PER_WRONG_ANSWER = 10
