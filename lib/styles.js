export function addCustomStyle(name, ...styles) {
    if (!name.match(/^[^\s\{\}]$/)) {
        throw new Error('The custom style name cannot contain spaces or curly braces');
    }
    customStyles.set(name, styles.join(' '));
}
export function deleteCustomStyle(name) {
    customStyles.delete(name);
}
export const customStyles = new Map();
