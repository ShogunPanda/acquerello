"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = exports.colorize = exports.templateMatcher = void 0;
const codes_1 = require("./codes");
const spec_1 = require("./spec");
const styles_1 = require("./styles");
__exportStar(require("./codes"), exports);
__exportStar(require("./spec"), exports);
__exportStar(require("./styles"), exports);
// eslint-disable-next-line no-useless-escape
exports.templateMatcher = /\{{2}([^\{\}]+?)\}{2}/gi;
function colorize(raw) {
    // Create a new styles stack
    let stylesStack = [];
    let stylesInserted = false;
    // For each tag in the string
    let modified = raw.replace(exports.templateMatcher, (_, spec) => {
        var _a;
        const revert = [];
        let replacement = '';
        // Get all the styles - Whatever is not found in ansi-styles is ignored
        const tokens = spec
            .trim()
            .split(/\s+/)
            .map((s) => s.trim());
        for (const token of tokens) {
            if (token === '-') {
                // Remove a style
                if (stylesStack.length) {
                    // First of all, remove the latest applied style
                    replacement += stylesStack
                        .shift()
                        .reverse()
                        .map((s) => s.close)
                        .join('');
                    // If there is a style to restore it, reapply it
                    if (stylesStack.length) {
                        replacement += stylesStack[0].map((s) => s.open).join('');
                    }
                }
                break;
            }
            else if (token === 'reset') {
                // Forget all previously defined styles
                stylesStack = [];
                break;
            }
            else {
                // Search in custom styles first
                const styles = (_a = styles_1.customStyles.get(token)) !== null && _a !== void 0 ? _a : [token];
                for (const style of styles) {
                    // Add a style
                    const code = spec_1.convertColorSpec(style);
                    if (code) {
                        replacement += code.open;
                        revert.push(code);
                    }
                }
            }
        }
        // If anything was applied, append to the stack
        if (revert.length) {
            stylesInserted = true;
            stylesStack.unshift(revert);
        }
        return replacement;
    });
    // Always make sure to reset codes at the end
    if (stylesInserted) {
        modified += codes_1.defaultStyles.reset.close;
    }
    return modified;
}
exports.colorize = colorize;
function clean(raw) {
    return raw.replace(exports.templateMatcher, '');
}
exports.clean = clean;
