import { defaultStyles, type ANSICode } from './codes.js'
import { convertColorSpec } from './spec.js'
import { customStyles } from './styles.js'

export * from './codes.js'
export * from './spec.js'
export * from './styles.js'

export const templateMatcher = /{{2}([^{}]+?)}{2}/gi

export function colorize(raw: string): string {
  // Create a new styles stack
  let stylesStack: ANSICode[][] = []
  let stylesInserted = false

  // For each tag in the string
  let modified = raw.replaceAll(templateMatcher, (_, spec) => {
    const revert: ANSICode[] = []
    let replacement = ''

    // Get all the styles - Whatever is not found in ansi-styles is ignored
    const tokens: string[] = spec
      .trim()
      .split(/\s+/)
      .map((s: string) => s.trim())

    for (const token of tokens) {
      if (token === '-') {
        // Remove a style
        if (stylesStack.length) {
          // First of all, remove the latest applied style
          replacement += stylesStack
            .shift()!
            .reverse()
            .map(s => s.close)
            .join('')

          // If there is a style to restore it, reapply it
          if (stylesStack.length) {
            replacement += stylesStack[0].map(s => s.open).join('')
          }
        }

        break
      } else if (token === 'reset') {
        // Forget all previously defined styles
        stylesStack = []
        break
      } else {
        // Search in custom styles first
        const styles = customStyles.get(token) ?? [token]

        for (const style of styles) {
          // Add a style
          const code = convertColorSpec(style)

          if (code) {
            replacement += code.open
            revert.push(code)
          }
        }
      }
    }

    // If anything was applied, append to the stack
    if (revert.length) {
      stylesInserted = true
      stylesStack.unshift(revert)
    }

    return replacement
  })

  // Always make sure to reset codes at the end
  if (stylesInserted) {
    modified += defaultStyles.reset.close
  }

  return modified
}

export function clean(raw: string): string {
  return raw.replaceAll(templateMatcher, '')
}
