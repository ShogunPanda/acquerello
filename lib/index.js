import { defaultStyles } from './codes';
import { resolveStyle } from './template';
export * from './codes';
export * from './styles';
export * from './template';
export function colorize(raw) {
    // Create a new styles stack
    let stylesStack = [];
    let stylesInserted = false;
    // For each tag in the string
    let modified = raw.replace(/\{{2}([^\{\}]+?)\}{2}/gi, (_, spec) => {
        const revert = [];
        let replacement = '';
        // Get all the styles - Whatever is not found in ansi-styles is ignored
        const tokens = spec
            .trim()
            .split(/\s+/)
            .map((s) => s.trim().toLowerCase());
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
            }
            else if (token === 'reset') {
                // Forget all previously defined styles
                stylesStack = [];
            }
            else {
                // Add a style
                const style = resolveStyle(token);
                if (style) {
                    replacement += style.open;
                    revert.push(style);
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
        modified += defaultStyles.reset.close;
    }
    return modified;
}
