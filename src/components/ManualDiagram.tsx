import { useState } from 'react'
import { blockCoords, sheetForBlock } from '../data/manual-coords'
import type { IncorrectDecision, StepRecord } from '../store/session'

/**
 * Shared inner diagram: flowchart PNG with colored block overlays.
 * Used both inside the ManualView modal (during a session) and
 * inline on the Outcome page (after completion).
 *
 * terminalBlockId — when provided (outcome page), the block with
 *   answer===null is treated as the resolved destination (sky blue)
 *   rather than the "current unanswered" (yellow).
 */
type Props = {
  steps: StepRecord[]
  incorrectDecisions: IncorrectDecision[]
  /** Highlight the block at this ID as the current/active step (yellow).
   *  Pass undefined on the outcome page so the terminal block renders sky. */
  currentBlockId?: string
}

export function ManualDiagram({ steps, incorrectDecisions, currentBlockId }: Props) {
  const currentBN = currentBlockId?.split('/').at(-1) ?? ''

  // Default sheet: whichever sheet the last step lives on
  const lastBN = steps.at(-1)?.blockId.split('/').at(-1) ?? ''
  const [sheet, setSheet] = useState<1 | 2>(() => sheetForBlock(lastBN || currentBN || '167'))

  // ── Color map ──────────────────────────────────────────────────────────────
  // Pass 1: blocks in incorrectDecisions → red (persist across goBack)
  const colorMap: Record<string, string> = {}
  for (const id of incorrectDecisions) {
    const bn = id.blockId.split('/').at(-1) ?? ''
    colorMap[bn] = 'rgba(239,68,68,0.55)'
  }
  // Pass 2: current path always wins
  for (const step of steps) {
    const bn = step.blockId.split('/').at(-1) ?? ''
    if (step.answer === null) {
      // During session: yellow if this is the live current block;
      // after completion: sky blue for the terminal destination.
      colorMap[bn] = currentBlockId
        ? 'rgba(250,204,21,0.55)'   // yellow — unanswered / current
        : 'rgba(56,189,248,0.55)'   // sky   — terminal destination
    } else if (step.wasCorrect === true) {
      colorMap[bn] = 'rgba(34,197,94,0.55)'
    } else if (step.wasCorrect === false) {
      colorMap[bn] = 'rgba(239,68,68,0.55)'
    } else {
      // Answered but no correctAnswer on block (terminal blocks answered via completeTerminal)
      colorMap[bn] = 'rgba(148,163,184,0.45)'
    }
  }

  const imgSrc = sheet === 1
    ? '/figures/manual/sheet-123.png'
    : '/figures/manual/sheet-124.png'

  return (
    <div className="flex flex-col gap-0">
      {/* Sheet toggle + legend */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="flex rounded-md overflow-hidden border border-slate-600 text-xs">
          <button
            onClick={() => setSheet(1)}
            className={`px-3 py-1.5 font-medium transition-colors ${
              sheet === 1 ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sheet 123
          </button>
          <button
            onClick={() => setSheet(2)}
            className={`px-3 py-1.5 font-medium transition-colors ${
              sheet === 2 ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sheet 124
          </button>
        </div>

        <div className="flex gap-3 text-xs text-slate-300">
          {currentBlockId && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(250,204,21,0.9)' }} />
              Current
            </span>
          )}
          {!currentBlockId && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(56,189,248,0.9)' }} />
              Destination
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(34,197,94,0.9)' }} />
            Correct
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(239,68,68,0.9)' }} />
            Incorrect
          </span>
        </div>
      </div>

      {/* Diagram */}
      <div className="relative w-full rounded-lg overflow-hidden border border-slate-700 shadow-lg">
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
  )
}
