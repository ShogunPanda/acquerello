"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertColorSpec = exports.hexMatcher = exports.rgbMatcher = exports.ansiMatcher = exports.ansiBackground = exports.ansiForeground = void 0;
const codes_1 = require("./codes");
// Base styles for ANSI, RGB and HEX
exports.ansiForeground = { open: 38, close: 39 };
exports.ansiBackground = { open: 48, close: 49 };
exports.ansiMatcher = /^(bg)?(ansi):(\d+)(?:[,;](\d+)[,;](\d+))?$/i;
exports.rgbMatcher = /^(bg)?(rgb):(\d+)[,;](\d+)[,;](\d+)$/i;
exports.hexMatcher = /^(bg)?(hex):(?:#?)([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
function convertColorSpec(name) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    let lastMatch = name.match(exports.ansiMatcher) || name.match(exports.rgbMatcher) || name.match(exports.hexMatcher) || [];
    lastMatch = lastMatch.map((m) => (m ? m.toLowerCase() : m));
    const ansiBase = lastMatch[1] && lastMatch[1] === 'bg' ? exports.ansiBackground : exports.ansiForeground;
    const base = lastMatch[2] === 'hex' ? 16 : 0;
    const [r, g, b] = lastMatch.slice(3, 6).map((c) => (c ? parseInt(c, base) : -1));
    if (lastMatch[2] === 'ansi') {
        // Short color spec - Valid if r goes from 16 to 255, included
        if (r > 16 && r < 256 && g === -1) {
            return codes_1.makeAnsiCode([ansiBase.open, 5, r], ansiBase.close);
        }
        // Full color spec - Valid if each component goes from 0 to 5, included
        return r >= 0 && g >= 0 && b >= 0 && r <= 5 && g <= 5 && b <= 5
            ? codes_1.makeAnsiCode([ansiBase.open, 5, 16 + r * 36 + g * 6 + b], ansiBase.close)
            : null;
    }
    else if (lastMatch[2]) {
        // RGB or HEX, since HEX has been converted to INT, it's the same thing - Valid if each component goes from 0 to 255, included
        return r >= 0 && g >= 0 && b >= 0 && r <= 255 && g <= 255 && b <= 255
            ? codes_1.makeAnsiCode([ansiBase.open, 2, r, g, b], ansiBase.close)
            : null;
    }
    return codes_1.defaultStyles[name] || null;
}
exports.convertColorSpec = convertColorSpec;
