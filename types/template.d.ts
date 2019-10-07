import { ANSICode } from './codes';
export declare const ansiForeground: {
    open: number;
    close: number;
};
export declare const ansiBackground: {
    open: number;
    close: number;
};
export declare const ansiMatcher: RegExp;
export declare const rgbMatcher: RegExp;
export declare const hexMatcher: RegExp;
export declare function resolveStyle(name: string): ANSICode | null;
