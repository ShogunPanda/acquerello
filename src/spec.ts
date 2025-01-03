import { defaultStyles, makeAnsiCode, type ANSICode } from './codes.js'

// Base styles for ANSI, RGB and HEX
export const ansiForeground = { open: 38, close: 39 }
export const ansiBackground = { open: 48, close: 49 }

export const ansiMatcher = /^(bg)?(ansi):(\d+)(?:[,;](\d+)[,;](\d+))?$/i
export const rgbMatcher = /^(bg)?(rgb):(\d+)[,;](\d+)[,;](\d+)$/i
export const hexMatcher = /^(bg)?(hex):#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i

export function convertColorSpec(name: string): ANSICode | null {
  let lastMatch: RegExpMatchArray | string[] =
    name.match(ansiMatcher) || name.match(rgbMatcher) || name.match(hexMatcher) || []
  lastMatch = lastMatch.map(m => (m ? m.toLowerCase() : m))

  const ansiBase = lastMatch[1] && lastMatch[1] === 'bg' ? ansiBackground : ansiForeground
  const base = lastMatch[2] === 'hex' ? 16 : 0
  const [r, g, b] = lastMatch.slice(3, 6).map(c => (c ? Number.parseInt(c, base) : -1))

  if (lastMatch[2] === 'ansi') {
    // Short color spec - Valid if r goes from 16 to 255, included
    if (r > 16 && r < 256 && g === -1) {
      return makeAnsiCode([ansiBase.open, 5, r], ansiBase.close)
    }

    // Full color spec - Valid if each component goes from 0 to 5, included
    return r >= 0 && g >= 0 && b >= 0 && r <= 5 && g <= 5 && b <= 5
      ? makeAnsiCode([ansiBase.open, 5, 16 + r * 36 + g * 6 + b], ansiBase.close)
      : null
  } else if (lastMatch[2]) {
    // RGB or HEX, since HEX has been converted to INT, it's the same thing - Valid if each component goes from 0 to 255, included
    return r >= 0 && g >= 0 && b >= 0 && r <= 255 && g <= 255 && b <= 255
      ? makeAnsiCode([ansiBase.open, 2, r, g, b], ansiBase.close)
      : null
  }

  return defaultStyles[name] || null
}
