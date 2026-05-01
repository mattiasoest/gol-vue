import { describe, expect, it } from 'vitest'

import { decodeRLE } from './rle'

describe('decodeRLE', () => {
  it('parses blinker notation from wiki example fragment', () => {
    const { cells } = decodeRLE('bo$2bo$obo!')
    expect(cells).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 2, y: 2 },
    ])
  })

  it('ignores headers and comments', () => {
    const text = `#C comment\nx = 3, y = 3\nbo$obo!`
    const out = decodeRLE(text)
    expect(out.cells.length).toBe(3)
    expect(out.patternWidth).toBeGreaterThanOrEqual(1)
  })
})
