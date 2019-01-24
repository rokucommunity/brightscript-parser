/**
 * Tokenizes a BrightScript file
 */
export declare class Tokenizer {
    constructor();
    tokenize(text: string): string[];
    static keywords: string[];
    static symbols: string[];
    static letterChars: string[];
    static numberChars: string[];
    static identifierChars: string[];
    static whitespaceChars: string[];
}
