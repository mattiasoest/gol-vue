/** Relative live cells (+ optional bounding box derived from extents). */

export interface RLEDecodeResult {
  cells: readonly { readonly x: number; readonly y: number }[]
  patternWidth: number
  patternHeight: number
}

/**
 * Conway Life Wiki style RLE: tags `o` (on), `b` (off), `$` newline, `!` end.
 * Skips `#` comments and ignores header lines matching `x =` / `rule =`.
 */
export function decodeRLE(rle: string): RLEDecodeResult {
  const bodyLines = rle
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  const compactParts: string[] = []
  for (const line of bodyLines) {
    if (/^x\s*=/i.test(line) || /^rule\s*=/i.test(line)) continue
    compactParts.push(line.replace(/\s+/g, ''))
  }

  let s = compactParts.join('')
  const bang = s.indexOf('!')
  if (bang >= 0) s = s.slice(0, bang)

  let x = 0
  let y = 0
  let run = 0
  let i = 0
  const coords: { x: number; y: number }[] = []
  let maxX = 0
  let maxY = 0

  const flushDigits = (): void => {
    if (run === 0) run = 1
  }

  while (i < s.length) {
    const ch = s[i++]!
    if (ch >= '0' && ch <= '9') {
      run = run * 10 + (ch.charCodeAt(0) - 48)
      continue
    }

    const lower = ch.toLowerCase()

    if (lower === '!') break

    if (lower === '$') {
      flushDigits()
      y += run
      x = 0
      run = 0
      maxY = Math.max(maxY, y > 0 ? y - 1 : 0)
      continue
    }

    flushDigits()

    if (lower === 'b') {
      x += run
      maxX = Math.max(maxX, x > 0 ? x - 1 : 0)
      run = 0
      continue
    }

    if (lower === 'o') {
      for (let k = 0; k < run; k++) {
        coords.push({ x: x + k, y })
        maxX = Math.max(maxX, x + k)
        maxY = Math.max(maxY, y)
      }
      x += run
      run = 0
      continue
    }

    /** Unknown tag letters are ignored without advancing geometry (helps with exotic extensions). */
    run = 0
  }

  const patternWidth = maxX >= 0 ? maxX + 1 : 0
  const patternHeight = maxY >= 0 ? maxY + 1 : 0

  return { cells: coords, patternWidth, patternHeight }
}
