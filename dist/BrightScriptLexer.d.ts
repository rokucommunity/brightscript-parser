export declare class BrightScriptLexer {
    private tokenDefinitions;
    constructor();
    addTokenDefinition(tokenType: TokenType, regexp: RegExp): void;
    /**
     * Add a symbol token definition with the standard regexp for symbols
     * @param symbol the symbol in a string
     * @param tokenType
     */
    addSymbolTokenDefinition(symbol: string, tokenType: TokenType): void;
    addKeywordTokenDefinition(keyword: string, tokenType: TokenType): void;
    addKeywordTokenDefinitions(tokenTypes: TokenType[]): void;
    addTokenDefinitions(): void;
    tokenize(text: string): Token[];
    /**
     * Keywords will match before identifiers, so this will backtrack the captured
     * tokens to determine if this match is actually an identifier and not a keyword
     * @param match
     * @param tokens
     */
    matchIsIdentifier(match: Match, tokens: Token[]): boolean | undefined;
    getMatch(text: string): Match;
}
export interface Token {
    tokenType: TokenType;
    value: string;
    startIndex: number;
}
export declare enum TokenType {
    and = "and",
    elseIf = "elseIf",
    endFunction = "endFunction",
    endSub = "endSub",
    endWhile = "endWhile",
    endFor = "endFor",
    eval = "eval",
    exitWhile = "exitWhile",
    exitFor = "exitFor",
    if = "if",
    then = "then",
    else = "else",
    endIf = "endIf",
    for = "for",
    to = "to",
    step = "step",
    exit = "exit",
    each = "each",
    while = "while",
    function = "function",
    sub = "sub",
    as = "as",
    return = "return",
    print = "print",
    goto = "goto",
    dim = "dim",
    stop = "stop",
    void = "void",
    boolean = "boolean",
    integer = "integer",
    number = "number",
    longInteger = "longInteger",
    float = "float",
    double = "double",
    string = "string",
    object = "object",
    interface = "interface",
    invalid = "invalid",
    dynamic = "dynamic",
    or = "or",
    let = "let",
    lineNum = "lineNum",
    next = "next",
    not = "not",
    run = "run",
    additionAssignmentSymbol = "additionAssignmentSymbol",
    subtractionAssignmentSymbol = "subtractionAssignmentSymbol",
    multiplicationAssignmentSymbol = "multiplicationAssignmentSymbol",
    divisionAssignmentSymbol = "divisionAssignmentSymbol",
    integerDivisionAssignmentSymbol = "integerDivisionAssignmentSymbol",
    lessThanLessThanEqualSymbol = "lessThanLessThanEqualSymbol",
    greaterThanGreaterThanEqualSymbol = "greaterThanGreaterThanEqualSymbol",
    plusPlusSymbol = "plusPlusSymbol",
    minusMinusSymbol = "minusMinusSymbol",
    asteriskSymbol = "asteriskSymbol",
    forwardSlashSymbol = "forwardSlashSymbol",
    backSlashSymbol = "backSlashSymbol",
    modSymbol = "modSymbol",
    plusSymbol = "plusSymbol",
    minusSymbol = "minusSymbol",
    carotSymbol = "carotSymbol",
    doubleQuoteSymbol = "doubleQuoteSymbol",
    openParenSymbol = "openParenSymbol",
    closeParenSymbol = "closeParenSymbol",
    openSquareBraceSymbol = "openSquareBraceSymbol",
    closeSquareBraceSymbol = "closeSquareBraceSymbol",
    openCurlyBraceSymbol = "openCurlyBraceSymbol",
    closeCurlyBraceSymbol = "closeCurlyBraceSymbol",
    periodSymbol = "periodSymbol",
    commaSymbol = "commaSymbol",
    semicolonSymbol = "semicolonSymbol",
    percentSymbol = "percentSymbol",
    equalSymbol = "equalSymbol",
    lessThanSymbol = "lessThanSymbol",
    greaterThanSymbol = "greaterThanSymbol",
    colonSymbol = "colonSymbol",
    numberLiteral = "numberLiteral",
    booleanLiteral = "booleanLiteral",
    stringLiteral = "stringLiteral",
    identifier = "identifier",
    quoteComment = "quoteComment",
    remComment = "remComment",
    newline = "newline",
    whitespace = "whitespace",
    END_OF_FILE = "END_OF_FILE",
    INVALID_TOKEN = "INVALID_TOKEN",
}
/**
 * composite keywords (like "endif" and "endfor")
 */
export declare const CompositeKeywordTokenTypes: TokenType[];
export declare const BasicKeywordTokenTypes: TokenType[];
export declare let KeywordTokenTypes: TokenType[];
export declare const SymbolTokenTypes: TokenType[];
export declare const MiscelaneousTokenTypes: TokenType[];
export declare const SymbolTokenTypeValues: {};
export interface Match {
    tokenType: TokenType;
    value: string;
}
