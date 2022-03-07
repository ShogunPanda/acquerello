import { colorize } from './index.js'

export function applyStyle(content: string, ...styles: Array<string>): string {
  return colorize(`{{${styles.join(' ')}}}${content}{{-}}`)
}

export function addCustomStyle(name: string, ...styles: Array<string>): void {
  if (!/^[^\s{}]+$/.test(name)) {
    throw new Error('The custom style name cannot contain spaces or curly braces')
  }

  customStyles.set(name, styles)
}

export function deleteCustomStyle(name: string): void {
  customStyles.delete(name)
}

export const customStyles = new Map<string, Array<string>>()
