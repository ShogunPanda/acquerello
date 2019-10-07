export function addCustomStyle(name: string, ...styles: Array<string>): void {
  if (!name.match(/^[^\s\{\}]$/)) {
    throw new Error('The custom style name cannot contain spaces or curly braces')
  }

  customStyles.set(name, styles.join(' '))
}

export function deleteCustomStyle(name: string): void {
  customStyles.delete(name)
}

export const customStyles = new Map<string, string>()
