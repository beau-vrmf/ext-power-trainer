// Block bounding boxes for Figure 3-7 manual overlay.
// Coordinates are percentages of slide dimensions (cx=7,772,400 EMU / cy=9,144,000 EMU).
// Generated from PPTX XML shape positions — update if the PPTX layout changes.

export type BlockCoord = {
  blockNumber: string
  sheet: 1 | 2
  x: number  // left edge as % of slide width
  y: number  // top edge as % of slide height
  w: number  // width as % of slide width
  h: number  // height as % of slide height
}

export const blockCoords: BlockCoord[] = [
  // ── Sheet 1 (sheet-123.png) ────────────────────────────────────────────────
  { blockNumber: '167', sheet: 1, x:  4.534, y:  6.165, w: 27.339, h: 11.394 },
  { blockNumber: '172', sheet: 1, x: 38.534, y:  6.168, w: 25.359, h: 11.394 },
  { blockNumber: '173', sheet: 1, x: 70.998, y:  6.765, w: 25.359, h: 10.066 },
  { blockNumber: '174', sheet: 1, x: 70.998, y: 19.596, w: 25.359, h:  9.701 },
  { blockNumber: '168', sheet: 1, x:  4.534, y: 33.282, w: 27.339, h: 11.394 },
  { blockNumber: '176', sheet: 1, x: 72.533, y: 33.282, w: 23.823, h: 11.394 },
  { blockNumber: '177', sheet: 1, x: 72.533, y: 48.148, w: 23.823, h: 11.394 },
  { blockNumber: '169', sheet: 1, x:  4.534, y: 56.471, w: 27.339, h: 13.776 },
  { blockNumber: '178', sheet: 1, x: 38.383, y: 57.394, w: 28.200, h: 11.394 },
  { blockNumber: '170', sheet: 1, x:  4.534, y: 76.430, w: 27.339, h: 11.394 },
  { blockNumber: '179', sheet: 1, x: 38.535, y: 77.650, w: 28.200, h:  9.022 },
  { blockNumber: '175', sheet: 1, x: 42.505, y: 80.777, w: 28.200, h: 12.552 },

  // ── Sheet 2 (sheet-124.png) ────────────────────────────────────────────────
  { blockNumber: '171', sheet: 2, x:  4.534, y: 12.648, w: 37.803, h: 11.394 },
  { blockNumber: '181', sheet: 2, x: 56.111, y: 12.688, w: 37.803, h: 11.394 },
  { blockNumber: '180', sheet: 2, x:  4.534, y: 33.163, w: 37.803, h: 12.582 },
  { blockNumber: '183', sheet: 2, x: 55.220, y: 33.798, w: 37.803, h: 11.394 },
  { blockNumber: '182', sheet: 2, x:  4.534, y: 55.669, w: 37.803, h: 11.394 },
]

const SHEET2_BLOCKS = new Set(['171', '180', '181', '182', '183'])

export function sheetForBlock(blockNumber: string): 1 | 2 {
  return SHEET2_BLOCKS.has(blockNumber) ? 2 : 1
}
