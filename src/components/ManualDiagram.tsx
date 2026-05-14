import { useState } from 'react'
import { getBlock } from '../data/fi-tree'
import { blockCoords, sheetForBlock } from '../data/manual-coords'
import type { IncorrectDecision, StepRecord } from '../store/session'

type Props = {
  steps: StepRecord[]
  incorrectDecisions: IncorrectDecision[]
  /** Pass during a live session so the unanswered block shows yellow.
   *  Omit on the outcome page — terminal block renders sky blue. */
  currentBlockId?: string
}

// ── Style palette ─────────────────────────────────────────────────────────────
// Each entry: translucent fill + solid border (rendered via CSS border)
const S = {
  current:      { fill: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,1)'   },
  destination:  { fill: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,1)'   },
  correct:      { fill: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,1)'    },
  incorrect:    { fill: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,1)'    },
  wrongVisited: { fill: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,1)'   },
  terminal:     { fill: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.8)'},
} as const

type BlockStyle = typeof S[keyof typeof S]

export function ManualDiagram({ steps, incorrectDecisions, currentBlockId }: Props) {
  const lastBN = steps.at(-1)?.blockId.split('/').at(-1) ?? ''
  const currentBN = currentBlockId?.split('/').at(-1) ?? ''
  const [sheet, setSheet] = useState<1 | 2>(() => sheetForBlock(lastBN || currentBN || '167'))

  // ── Build colorMap ───────────────────────────────────────────────────────────
  const colorMap: Record<string, BlockStyle> = {}

  // Pass 1 — incorrectDecisions: mark the block where user answered wrong (red)
  // AND the immediate next block they landed on due to that wrong answer (orange).
  // The downstream block is pruned from `steps` by goBack() so it won't appear
  // in Pass 2 — this is the only place it gets tracked.
  for (const id of incorrectDecisions) {
    const bn = id.blockId.split('/').at(-1) ?? ''
    colorMap[bn] = S.incorrect

    const block = getBlock(id.blockId)
    if (block) {
      const wrongNext = id.userAnswer === 'yes' ? block.onYes : block.onNo
      if (typeof wrongNext === 'string') {
        const wrongNextBN = wrongNext.split('/').at(-1) ?? ''
        // Only set if not already marked (don't clobber a correct-path block)
        if (!colorMap[wrongNextBN]) {
          colorMap[wrongNextBN] = S.wrongVisited
        }
      }
    }
  }

  // Pass 2 — current path always wins over Pass 1
  for (const step of steps) {
    const bn = step.blockId.split('/').at(-1) ?? ''
    if (step.answer === null) {
      colorMap[bn] = currentBlockId ? S.current : S.destination
    } else if (step.wasCorrect === true) {
      colorMap[bn] = S.correct
    } else if (step.wasCorrect === false) {
      colorMap[bn] = S.incorrect
    } else {
      colorMap[bn] = S.terminal
    }
  }

  const imgSrc = sheet === 1
    ? '/figures/manual/sheet-123.png'
    : '/figures/manual/sheet-124.png'

  const hasWrongVisited = Object.values(colorMap).includes(S.wrongVisited)

  return (
    <div className="flex flex-col gap-0">
      {/* Sheet toggle + legend */}
      <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-2 mb-2">
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

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
          {currentBlockId ? (
            <LegendSwatch style={S.current}   label="Current"     />
          ) : (
            <LegendSwatch style={S.destination} label="Destination" />
          )}
          <LegendSwatch style={S.correct}   label="Correct"   />
          <LegendSwatch style={S.incorrect} label="Incorrect"  />
          {hasWrongVisited && (
            <LegendSwatch style={S.wrongVisited} label="Wrong path" />
          )}
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
          .map(bc => {
            const style = colorMap[bc.blockNumber]
            return (
              <div
                key={bc.blockNumber}
                className="absolute pointer-events-none"
                style={{
                  left:            `${bc.x}%`,
                  top:             `${bc.y}%`,
                  width:           `${bc.w}%`,
                  height:          `${bc.h}%`,
                  backgroundColor: style.fill,
                  border:          `3px solid ${style.border}`,
                  borderRadius:    '10%',
                  boxSizing:       'border-box',
                }}
              />
            )
          })
        }
      </div>
    </div>
  )
}

function LegendSwatch({ style, label }: { style: BlockStyle; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block w-4 h-4 rounded-sm"
        style={{
          backgroundColor: style.fill,
          border:          `2px solid ${style.border}`,
          boxSizing:       'border-box',
        }}
      />
      {label}
    </span>
  )
}
