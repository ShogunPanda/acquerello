export interface ANSICode {
    open: string;
    close: string;
}
export declare function escapeCode(...code: Array<number | Array<number>>): string;
export declare function makeAnsiCode(open: number | Array<number>, close: number | Array<number>): ANSICode;
export declare const defaultStyles: {
    [key: string]: ANSICode;
};
