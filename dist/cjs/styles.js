"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customStyles = exports.deleteCustomStyle = exports.addCustomStyle = exports.applyStyle = void 0;
const index_1 = require("./index");
function applyStyle(content, ...styles) {
    return index_1.colorize(`{{${styles.join(' ')}}}${content}{{-}}`);
}
exports.applyStyle = applyStyle;
function addCustomStyle(name, ...styles) {
    // eslint-disable-next-line no-useless-escape
    if (!name.match(/^[^\s\{\}]+$/)) {
        throw new Error('The custom style name cannot contain spaces or curly braces');
    }
    exports.customStyles.set(name, styles);
}
exports.addCustomStyle = addCustomStyle;
function deleteCustomStyle(name) {
    exports.customStyles.delete(name);
}
exports.deleteCustomStyle = deleteCustomStyle;
exports.customStyles = new Map();
