export class BrightscriptLexer {
    private tokenDefinitions: { tokenType: TokenType, regexp: RegExp }[] = [];

    constructor() {
        this.addTokenDefinitions();
    }

    public addTokenDefinition(tokenType: TokenType, regexp: RegExp) {
        this.tokenDefinitions.push({ tokenType, regexp });
    }

    /**
     * Add a symbol token definition with the standard regexp for symbols
     * @param symbol the symbol in a string
     * @param tokenType 
     */
    public addSymbolTokenDefinition(symbol: string, tokenType: TokenType) {
        //escape the symbol if need be
        symbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        let regexp = new RegExp(`^(${symbol})`);
        this.addTokenDefinition(tokenType, regexp);
    }

    public addKeywordTokenDefinition(keyword: string, tokenType: TokenType) {
        let regexp = new RegExp(`^(${keyword})(?![a-z_0-9])`, 'i');
        this.addTokenDefinition(tokenType, regexp);
    }

    public addKeywordTokenDefinitions(tokenTypes: TokenType[]) {
        for (let tokenType of tokenTypes) {
            let keyword = <string>tokenType;
            this.addKeywordTokenDefinition(keyword, tokenType);
        }
    }

    public addTokenDefinitions() {
        //add whitespace first (because it's probably the most common)
        this.addTokenDefinition(TokenType.whitespace, /^([\t ]+)/);

        //now add newlines
        this.addTokenDefinition(TokenType.newline, /^(\r|\n|\r\n|\n\r)/);

        //now add keywords
        this.addKeywordTokenDefinitions(KeywordTokenTypes);

        //now add literal values
        this.addTokenDefinition(TokenType.booleanLiteral, /^(true|false)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.stringLiteral, /^(".*")/);
        this.addTokenDefinition(TokenType.numberLiteral, /^(\d)/);

        //now add all symbols
        for (let tokenType in SymbolTokenTypeValues) {
            let symbol = SymbolTokenTypeValues[tokenType];
            this.addSymbolTokenDefinition(symbol, <TokenType>tokenType);
        }

        //now add identifiers
        this.addTokenDefinition(TokenType.identifier, /^([a-z_]+[a-z0-9_]*)/i);

    }
    public tokenize(text: string) {
        let tokens: Token[] = [];
        let index = 0;
        while (text.length > 0) {
            let match = this.getMatch(text);
            if (match) {
                let value = match.value;
                let token = {
                    tokenType: match.tokenType,
                    value,
                    startIndex: index
                };
                text = text.substring(token.value.length);
                index += token.value.length;
                tokens.push(token);
            } else {
                let value = text.substring(0, 1);
                text = text.substring(1);
                index++;
                let token = {
                    tokenType: TokenType.invalidToken,
                    value,
                    startIndex: index
                };
                tokens.push(token);
            }
        }
        tokens.push({
            tokenType: TokenType.sequenceTerminator,
            value: null,
            startIndex: index
        });
        return tokens;
    }

    public getMatch(text: string): { tokenType: TokenType, value: string } {
        for (let def of this.tokenDefinitions) {
            let match = def.regexp.exec(text);
            if (match) {
                return {
                    tokenType: def.tokenType,
                    value: match[0]
                };
            }
        }
        return <any>undefined;
    }
}

export interface Token {
    tokenType: TokenType;
    value: string | null;
    startIndex: number;
}
export enum TokenType {
    //keywords
    and = 'and',
    elseIf = 'elseIf',
    endFunction = 'endFunction',
    endSub = 'endSub',
    endWhile = 'endWhile',
    eval = 'eval',
    exitWhile = 'exitWhile',
    if = 'if',
    then = 'then',
    else = 'else',
    end = 'end',
    endif = 'endif',
    for = 'for',
    to = 'to',
    step = 'step',
    exit = 'exit',
    each = 'each',
    while = 'while',
    function = 'function',
    sub = 'sub',
    as = 'as',
    return = 'return',
    print = 'print',
    rem = 'rem',
    goto = 'goto',
    dim = 'dim',
    stop = 'stop',
    void = 'void',
    boolean = 'boolean',
    integer = 'integer',
    number = 'number',
    longInteger = 'longInteger',
    float = 'float',
    double = 'double',
    string = 'string',
    object = 'object',
    interface = 'interface',
    invalid = 'invalid',
    dynamic = 'dynamic',
    type = 'type',
    or = 'or',
    let = 'let',
    lineNum = 'lineNum',
    next = 'next',
    not = 'not',
    run = 'run',

    //symbols
    singleQuoteSymbol = 'singleQuoteSymbol',
    doubleQuoteSymbol = 'doubleQuoteSymbol',
    openParenSymbol = 'openParenSymbol',
    closeParenSymbol = 'closeParenSymbol',
    openSquareBraceSymbol = 'openSquareBraceSymbol',
    closeSquareBraceSymbol = 'closeSquareBraceSymbol',
    openCurlyBraceSymbol = 'openCurlyBraceSymbol',
    closeCurlyBraceSymbol = 'closeCurlyBraceSymbol',
    periodSymbol = 'periodSymbol',
    commaSymbol = 'commaSymbol',
    semicolonSymbol = 'semicolonSymbol',
    dashSymbol = 'dashSymbol',
    percentSymbol = 'percentSymbol',
    equalSymbol = 'equalSymbol',
    lessThanSymbol = 'lessThanSymbol',
    greaterThanSymbol = 'greaterThanSymbol',
    colonSymbol = 'colonSymbol',

    //literals
    numberLiteral = 'numberLiteral',
    booleanLiteral = 'booleanLiteral',
    stringLiteral = 'stringLiteral',

    //other
    identifier = 'identifier',
    newline = 'newline',
    whitespace = 'whitespace',

    //lexer specific
    sequenceTerminator = 'sequenceTerminator',
    invalidToken = 'invalidToken',
}

export const KeywordTokenTypes = [
    TokenType.and,
    TokenType.elseIf,
    TokenType.endFunction,
    TokenType.endSub,
    TokenType.endWhile,
    TokenType.eval,
    TokenType.exitWhile,
    TokenType.if,
    TokenType.then,
    TokenType.else,
    TokenType.end,
    TokenType.endif,
    TokenType.for,
    TokenType.to,
    TokenType.step,
    TokenType.exit,
    TokenType.each,
    TokenType.while,
    TokenType.function,
    TokenType.sub,
    TokenType.as,
    TokenType.return,
    TokenType.print,
    TokenType.rem,
    TokenType.goto,
    TokenType.dim,
    TokenType.stop,
    TokenType.void,
    TokenType.number,
    TokenType.boolean,
    TokenType.integer,
    TokenType.longInteger,
    TokenType.float,
    TokenType.double,
    TokenType.string,
    TokenType.object,
    TokenType.interface,
    TokenType.invalid,
    TokenType.dynamic,
    TokenType.type,
    TokenType.or,
    TokenType.let,
    TokenType.lineNum,
    TokenType.next,
    TokenType.not,
    TokenType.run,
];

export const SymbolTokenTypes = [
    TokenType.singleQuoteSymbol,
    TokenType.doubleQuoteSymbol,
    TokenType.openParenSymbol,
    TokenType.closeParenSymbol,
    TokenType.openSquareBraceSymbol,
    TokenType.closeSquareBraceSymbol,
    TokenType.openCurlyBraceSymbol,
    TokenType.closeCurlyBraceSymbol,
    TokenType.periodSymbol,
    TokenType.commaSymbol,
    TokenType.semicolonSymbol,
    TokenType.dashSymbol,
    TokenType.percentSymbol,
    TokenType.equalSymbol,
    TokenType.lessThanSymbol,
    TokenType.greaterThanSymbol,
    TokenType.colonSymbol,
];

export const SymbolTokenTypeValues = {};
SymbolTokenTypeValues[TokenType.singleQuoteSymbol] = '\'';
SymbolTokenTypeValues[TokenType.doubleQuoteSymbol] = '"';
SymbolTokenTypeValues[TokenType.openParenSymbol] = '(';
SymbolTokenTypeValues[TokenType.closeParenSymbol] = ')';
SymbolTokenTypeValues[TokenType.openSquareBraceSymbol] = '[';
SymbolTokenTypeValues[TokenType.closeSquareBraceSymbol] = ']';
SymbolTokenTypeValues[TokenType.openCurlyBraceSymbol] = '{';
SymbolTokenTypeValues[TokenType.closeCurlyBraceSymbol] = '}';
SymbolTokenTypeValues[TokenType.periodSymbol] = '.';
SymbolTokenTypeValues[TokenType.commaSymbol] = ',';
SymbolTokenTypeValues[TokenType.semicolonSymbol] = ';';
SymbolTokenTypeValues[TokenType.dashSymbol] = '-';
SymbolTokenTypeValues[TokenType.percentSymbol] = '%';
SymbolTokenTypeValues[TokenType.equalSymbol] = '=';
SymbolTokenTypeValues[TokenType.lessThanSymbol] = '<';
SymbolTokenTypeValues[TokenType.greaterThanSymbol] = '>';
SymbolTokenTypeValues[TokenType.colonSymbol] = ':';
