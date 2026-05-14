import { useState } from 'react'
import { blockCoords, sheetForBlock } from '../data/manual-coords'
import type { IncorrectDecision, StepRecord } from '../store/session'

type Props = {
  open: boolean
  onClose: () => void
  currentBlockId: string  // e.g. "TO-EXTPWR/3-7/1/167"
  steps: StepRecord[]
  incorrectDecisions: IncorrectDecision[]
}

export function ManualView({ open, onClose, currentBlockId, steps, incorrectDecisions }: Props) {
  const currentBlockNumber = currentBlockId.split('/').at(-1) ?? ''
  const [sheet, setSheet] = useState<1 | 2>(() => sheetForBlock(currentBlockNumber))

  if (!open) return null

  // Build blockNumber → overlay color.
  // Pass 1: mark every block where user ever gave a wrong answer (red).
  //         These persist even after goBack() since incorrectDecisions is never truncated.
  const colorMap: Record<string, string> = {}
  for (const id of incorrectDecisions) {
    const bn = id.blockId.split('/').at(-1) ?? ''
    colorMap[bn] = 'rgba(239,68,68,0.55)'
  }
  // Pass 2: overlay the current path — always takes priority over historical red.
  for (const step of steps) {
    const bn = step.blockId.split('/').at(-1) ?? ''
    if (step.answer === null) {
      // Current block — not yet answered
      colorMap[bn] = 'rgba(250,204,21,0.55)'
    } else if (step.wasCorrect === true) {
      colorMap[bn] = 'rgba(34,197,94,0.55)'
    } else if (step.wasCorrect === false) {
      colorMap[bn] = 'rgba(239,68,68,0.55)'
    } else {
      // Terminal block visited (no correctAnswer scoring) — neutral highlight
      colorMap[bn] = 'rgba(148,163,184,0.45)'
    }
  }

  const imgSrc = sheet === 1
    ? '/figures/manual/sheet-123.png'
    : '/figures/manual/sheet-124.png'

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">
            Figure 3-7 — Sheet {sheet === 1 ? '123' : '124'}
          </span>
          <div className="flex rounded-md overflow-hidden border border-slate-600 text-xs">
            <button
              onClick={() => setSheet(1)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                sheet === 1
                  ? 'bg-sky-700 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Sheet 123
            </button>
            <button
              onClick={() => setSheet(2)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                sheet === 2
                  ? 'bg-sky-700 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Sheet 124
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
        >
          ✕ Close
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 py-2 bg-slate-900 border-b border-slate-700 text-xs text-slate-300 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(250,204,21,0.8)' }} />
          Current step
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(34,197,94,0.8)' }} />
          Correct
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(239,68,68,0.8)' }} />
          Incorrect
        </span>
      </div>

      {/* Slide image with overlays */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
        <div className="relative w-full max-w-2xl shadow-2xl">
          <img
            key={imgSrc}
            src={imgSrc}
            alt={`Figure 3-7 Sheet ${sheet === 1 ? '123' : '124'}`}
            className="w-full block select-none"
            draggable={false}
          />
          {blockCoords
            .filter(bc => bc.sheet === sheet && colorMap[bc.blockNumber])
            .map(bc => (
              <div
                key={bc.blockNumber}
                className="absolute pointer-events-none"
                style={{
                  left:            `${bc.x + bc.w * 0.06}%`,
                  top:             `${bc.y + bc.h * 0.06}%`,
                  width:           `${bc.w * 0.88}%`,
                  height:          `${bc.h * 0.88}%`,
                  backgroundColor: colorMap[bc.blockNumber],
                  borderRadius:    '12%',
                  mixBlendMode:    'multiply',
                }}
              />
            ))
          }
        </div>
      </div>

    </div>
  )
}
