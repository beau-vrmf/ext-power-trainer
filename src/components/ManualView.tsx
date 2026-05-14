import { ManualDiagram } from './ManualDiagram'
import type { IncorrectDecision, StepRecord } from '../store/session'

type Props = {
  open: boolean
  onClose: () => void
  currentBlockId: string  // e.g. "TO-EXTPWR/3-7/1/167"
  steps: StepRecord[]
  incorrectDecisions: IncorrectDecision[]
}

export function ManualView({ open, onClose, currentBlockId, steps, incorrectDecisions }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
        <span className="text-sm font-semibold text-white">Figure 3-7</span>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
        >
          ✕ Close
        </button>
      </div>

      {/* Diagram */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
        <div className="w-full max-w-2xl">
          <ManualDiagram
            steps={steps}
            incorrectDecisions={incorrectDecisions}
            currentBlockId={currentBlockId}
          />
        </div>
      </div>

    </div>
  )
}
