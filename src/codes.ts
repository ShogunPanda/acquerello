export interface ANSICode {
  open: string
  close: string
}

export function escapeCode(...code: (number | number[])[]): string {
  return `\u001B[${code
    .flat(Number.POSITIVE_INFINITY)
    .map(c => c.toString())
    .join(';')}m`
}

export function makeAnsiCode(open: number | number[], close: number | number[]): ANSICode {
  return { open: escapeCode(open), close: escapeCode(close) }
}

// This is the list of ANSI Escape codes, taken from https://github.com/chalk/ansi-styles
export const defaultStyles: Record<string, ANSICode> = {
  reset: makeAnsiCode(0, 0),
  // Style
  bold: makeAnsiCode(1, 22), // 21 isn't widely supported and 22 does the same thing
  dim: makeAnsiCode(2, 22),
  italic: makeAnsiCode(3, 23),
  underline: makeAnsiCode(4, 24),
  inverse: makeAnsiCode(7, 27),
  hidden: makeAnsiCode(8, 28),
  strikethrough: makeAnsiCode(9, 29),
  // Foreground colors
  black: makeAnsiCode(30, 39),
  red: makeAnsiCode(31, 39),
  green: makeAnsiCode(32, 39),
  yellow: makeAnsiCode(33, 39),
  blue: makeAnsiCode(34, 39),
  magenta: makeAnsiCode(35, 39),
  cyan: makeAnsiCode(36, 39),
  white: makeAnsiCode(37, 39),
  gray: makeAnsiCode(90, 39), // It is aliased from bright black
  // Background colors
  bgBlack: makeAnsiCode(40, 49),
  bgRed: makeAnsiCode(41, 49),
  bgGreen: makeAnsiCode(42, 49),
  bgYellow: makeAnsiCode(43, 49),
  bgBlue: makeAnsiCode(44, 49),
  bgMagenta: makeAnsiCode(45, 49),
  bgCyan: makeAnsiCode(46, 49),
  bgWhite: makeAnsiCode(47, 49),
  // Bright foreground colors
  blackBright: makeAnsiCode(90, 39),
  redBright: makeAnsiCode(91, 39),
  greenBright: makeAnsiCode(92, 39),
  yellowBright: makeAnsiCode(93, 39),
  blueBright: makeAnsiCode(94, 39),
  magentaBright: makeAnsiCode(95, 39),
  cyanBright: makeAnsiCode(96, 39),
  whiteBright: makeAnsiCode(97, 39),
  // Bright background colors
  bgBlackBright: makeAnsiCode(100, 49),
  bgRedBright: makeAnsiCode(101, 49),
  bgGreenBright: makeAnsiCode(102, 49),
  bgYellowBright: makeAnsiCode(103, 49),
  bgBlueBright: makeAnsiCode(104, 49),
  bgMagentaBright: makeAnsiCode(105, 49),
  bgCyanBright: makeAnsiCode(106, 49),
  bgWhiteBright: makeAnsiCode(107, 49)
}
