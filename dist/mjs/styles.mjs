import { colorize } from "./index.mjs";
export function applyStyle(content, ...styles) {
    return colorize(`{{${styles.join(' ')}}}${content}{{-}}`);
}
export function addCustomStyle(name, ...styles) {
    // eslint-disable-next-line no-useless-escape
    if (!name.match(/^[^\s\{\}]+$/)) {
        throw new Error('The custom style name cannot contain spaces or curly braces');
    }
    customStyles.set(name, styles);
}
export function deleteCustomStyle(name) {
    customStyles.delete(name);
}
export const customStyles = new Map();
