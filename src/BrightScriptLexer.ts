export class BrightScriptLexer {
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
        symbol = symbol.replace(/[.*+?^${}()|[\]\\]/gi, '\\$&'); // $& means the whole matched string
        let regexp = new RegExp(`^(${symbol})`, 'i');
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
        //get comment literals (rem or quote followed by anything until newline or EOF
        this.addTokenDefinition(TokenType.quoteComment, /^('.*)(?=\r|\n|\r\n|\n\r|$)/i);
        this.addTokenDefinition(TokenType.remComment, /^(rem[ \t].*)(?=\r|\n|\r\n|\n\r|$)/i);

        //now add newlines
        this.addTokenDefinition(TokenType.newline, /^(\r\n|\n\r|\r|\n)/);

        //add composite keywords (like "end if" and "endiff")
        this.addTokenDefinition(TokenType.endFunction, /^(end\s*function)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.endIf, /^(end\s*if)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.endSub, /^(end\s*sub)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.endWhile, /^(end\s*while)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.exitWhile, /^(exit\s*while)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.exitFor, /^(exit\s*for)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.endFor, /^(end\s*for)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.elseIf, /^(else[ \t]*if)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.condIf, /^(#if)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.condElseIf, /^(#else[ \t]*if)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.condElse, /^(#else)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.condEndIf, /^(#end\s*if)(?![a-z_0-9])/i);
        
        //add whitespace first (because it's probably the most common)
        this.addTokenDefinition(TokenType.whitespace, /^([\t ]+)/);

        //now add keywords
        this.addKeywordTokenDefinitions(BasicKeywordTokenTypes);

        //now add literal values
        this.addTokenDefinition(TokenType.booleanLiteral, /^(true|false)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.stringLiteral, /^("([^"]|"")*")/);
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
                let isKeywordTokenType = KeywordTokenTypes.indexOf(match.tokenType) > -1;
                //if we found a keyword, determine if it's actually an identifier
                if (isKeywordTokenType && this.matchIsIdentifier(match, tokens)) {
                    token.tokenType = TokenType.identifier;
                }
                text = text.substring(token.value.length);
                index += token.value.length;
                tokens.push(token);
            } else {
                let value = text.substring(0, 1);
                text = text.substring(1);
                index++;
                let token = {
                    tokenType: TokenType.INVALID_TOKEN,
                    value,
                    startIndex: index
                };
                tokens.push(token);
            }
        }
        tokens.push({
            tokenType: TokenType.END_OF_FILE,
            value: '',
            startIndex: index
        });
        return tokens;
    }

    /**
     * Keywords will match before identifiers, so this will backtrack the captured
     * tokens to determine if this match is actually an identifier and not a keyword
     * @param match 
     * @param tokens 
     */
    public matchIsIdentifier(match: Match, tokens: Token[]) {
        for (let i = tokens.length - 1; i >= 0; i--) {
            let token = tokens[i];
            //eat any whitespace characters
            if (token.tokenType === TokenType.whitespace) {
                continue;
            }
            if (token.tokenType === TokenType.periodSymbol) {
                return true;
            } else {
                return false;
            }
        }
    }

    public getMatch(text: string): Match {
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
    value: string;
    startIndex: number;
}
export enum TokenType {
    //keywords
    and = 'and',
    elseIf = 'elseIf',
    endFunction = 'endFunction',
    endSub = 'endSub',
    endWhile = 'endWhile',
    endFor = 'endFor',
    eval = 'eval',
    exitWhile = 'exitWhile',
    exitFor = 'exitFor',
    if = 'if',
    then = 'then',
    else = 'else',
    endIf = 'endIf',
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
    or = 'or',
    let = 'let',
    lineNum = 'lineNum',
    next = 'next',
    not = 'not',
    run = 'run',
    condIf = 'condIf',
    condElse = 'condElse',
    condElseIf = 'condElseIf',
    condEndIf = 'condEndIf',

    //symbols 
    additionAssignmentSymbol = 'additionAssignmentSymbol',
    subtractionAssignmentSymbol = 'subtractionAssignmentSymbol',
    multiplicationAssignmentSymbol = 'multiplicationAssignmentSymbol',
    divisionAssignmentSymbol = 'divisionAssignmentSymbol',
    integerDivisionAssignmentSymbol = 'integerDivisionAssignmentSymbol',
    lessThanLessThanEqualSymbol = 'lessThanLessThanEqualSymbol',
    greaterThanGreaterThanEqualSymbol = 'greaterThanGreaterThanEqualSymbol',
    plusPlusSymbol = 'plusPlusSymbol',
    minusMinusSymbol = 'minusMinusSymbol',
    asteriskSymbol = 'asteriskSymbol',
    forwardSlashSymbol = 'forwardSlashSymbol',
    backSlashSymbol = 'backSlashSymbol',
    modSymbol = 'modSymbol',
    plusSymbol = 'plusSymbol',
    minusSymbol = 'minusSymbol',
    carotSymbol = 'carotSymbol',
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
    percentSymbol = 'percentSymbol',
    equalSymbol = 'equalSymbol',
    lessThanSymbol = 'lessThanSymbol',
    greaterThanSymbol = 'greaterThanSymbol',
    colonSymbol = 'colonSymbol',
    notEqualSymbol = 'notEqualSymbol',
    lessOrEqualThanSymbol = 'lessOrEqualThanSymbol',
    greaterOrEqualThanSymbol = 'greaterOrEqualThanSymbol',
    bitShiftLeftSymbol = 'bitShiftLeftSymbol',
    bitShiftRightSymbol = 'bitShiftRightSymbol',

    //literals
    numberLiteral = 'numberLiteral',
    booleanLiteral = 'booleanLiteral',
    stringLiteral = 'stringLiteral',

    //other
    identifier = 'identifier',
    quoteComment = 'quoteComment',
    remComment = 'remComment',
    newline = 'newline',
    whitespace = 'whitespace',

    //lexer specific
    END_OF_FILE = 'END_OF_FILE',
    INVALID_TOKEN = 'INVALID_TOKEN',
}

/**
 * composite keywords (like "endif" and "endfor")
 */
export const CompositeKeywordTokenTypes = [
    TokenType.endFunction,
    TokenType.endIf,
    TokenType.endSub,
    TokenType.endWhile,
    TokenType.exitWhile,
    TokenType.exitFor,
    TokenType.endFor,
    TokenType.elseIf,
    TokenType.condElseIf,
    TokenType.condEndIf
];

export const BasicKeywordTokenTypes = [
    TokenType.and,
    TokenType.eval,
    TokenType.if,
    TokenType.then,
    TokenType.else,
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
    TokenType.or,
    TokenType.let,
    TokenType.lineNum,
    TokenType.next,
    TokenType.not,
    TokenType.run,
    TokenType.condIf,
    TokenType.condElse
];

export let KeywordTokenTypes: TokenType[] = [];
Array.prototype.push.apply(KeywordTokenTypes, CompositeKeywordTokenTypes);
Array.prototype.push.apply(KeywordTokenTypes, BasicKeywordTokenTypes);

export const SymbolTokenTypes = [
    TokenType.additionAssignmentSymbol,
    TokenType.subtractionAssignmentSymbol,
    TokenType.multiplicationAssignmentSymbol,
    TokenType.divisionAssignmentSymbol,
    TokenType.integerDivisionAssignmentSymbol,
    TokenType.lessThanLessThanEqualSymbol,
    TokenType.greaterThanGreaterThanEqualSymbol,
    TokenType.plusPlusSymbol,
    TokenType.minusMinusSymbol,
    TokenType.carotSymbol,
    TokenType.asteriskSymbol,
    TokenType.forwardSlashSymbol,
    TokenType.backSlashSymbol,
    TokenType.modSymbol,
    TokenType.plusSymbol,
    TokenType.minusSymbol,
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
    TokenType.percentSymbol,
    TokenType.equalSymbol,
    TokenType.lessThanSymbol,
    TokenType.greaterThanSymbol,
    TokenType.colonSymbol,
    TokenType.condIf,
    TokenType.condElse,
    TokenType.notEqualSymbol,
    TokenType.lessOrEqualThanSymbol,
    TokenType.greaterOrEqualThanSymbol,
    TokenType.bitShiftLeftSymbol,
    TokenType.bitShiftRightSymbol
];

export const MiscelaneousTokenTypes = [
    TokenType.numberLiteral,
    TokenType.booleanLiteral,
    TokenType.stringLiteral,
    TokenType.identifier,
    TokenType.quoteComment,
    TokenType.remComment,
    TokenType.newline,
    TokenType.whitespace,
    TokenType.END_OF_FILE,
    TokenType.INVALID_TOKEN
];

export const SymbolTokenTypeValues = {};
SymbolTokenTypeValues[TokenType.plusPlusSymbol] = '++';
SymbolTokenTypeValues[TokenType.minusMinusSymbol] = '--';
SymbolTokenTypeValues[TokenType.additionAssignmentSymbol] = '+=';
SymbolTokenTypeValues[TokenType.subtractionAssignmentSymbol] = '-=';
SymbolTokenTypeValues[TokenType.multiplicationAssignmentSymbol] = '*=';
SymbolTokenTypeValues[TokenType.divisionAssignmentSymbol] = '/=';
SymbolTokenTypeValues[TokenType.integerDivisionAssignmentSymbol] = '\\=';
SymbolTokenTypeValues[TokenType.lessThanLessThanEqualSymbol] = '<<=';
SymbolTokenTypeValues[TokenType.greaterThanGreaterThanEqualSymbol] = '>>=';
SymbolTokenTypeValues[TokenType.asteriskSymbol] = '*';
SymbolTokenTypeValues[TokenType.forwardSlashSymbol] = '/';
SymbolTokenTypeValues[TokenType.backSlashSymbol] = '\\';
SymbolTokenTypeValues[TokenType.modSymbol] = 'MOD';
SymbolTokenTypeValues[TokenType.plusSymbol] = '+';
SymbolTokenTypeValues[TokenType.carotSymbol] = '^';
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
SymbolTokenTypeValues[TokenType.minusSymbol] = '-';
SymbolTokenTypeValues[TokenType.percentSymbol] = '%';
SymbolTokenTypeValues[TokenType.equalSymbol] = '=';
SymbolTokenTypeValues[TokenType.colonSymbol] = ':';
SymbolTokenTypeValues[TokenType.condIf] = '#if';
SymbolTokenTypeValues[TokenType.condElse] = '#else';
SymbolTokenTypeValues[TokenType.notEqualSymbol] = '<>';
SymbolTokenTypeValues[TokenType.lessOrEqualThanSymbol] = '<=';
SymbolTokenTypeValues[TokenType.greaterOrEqualThanSymbol] = '>=';
SymbolTokenTypeValues[TokenType.bitShiftLeftSymbol] = '<<';
SymbolTokenTypeValues[TokenType.bitShiftRightSymbol] = '>>';
SymbolTokenTypeValues[TokenType.lessThanSymbol] = '<';
SymbolTokenTypeValues[TokenType.greaterThanSymbol] = '>';

export const NeedSpaceAfterTokens = [
    TokenType.and,
    TokenType.eval,
    TokenType.if,
    TokenType.for,
    TokenType.to,
    TokenType.step,
    TokenType.each,
    TokenType.while,
    TokenType.function,
    TokenType.sub,
    TokenType.as,
    TokenType.return,
    TokenType.print,
    TokenType.goto,
    TokenType.dim,
    TokenType.or,
    TokenType.let,
    TokenType.next,
    TokenType.not,
    TokenType.condIf,
    TokenType.elseIf,
    TokenType.condElseIf,
    TokenType.plusPlusSymbol,
    TokenType.minusMinusSymbol,
    TokenType.additionAssignmentSymbol,
    TokenType.subtractionAssignmentSymbol,
    TokenType.multiplicationAssignmentSymbol,
    TokenType.divisionAssignmentSymbol,
    TokenType.integerDivisionAssignmentSymbol,
    TokenType.lessThanLessThanEqualSymbol,
    TokenType.greaterThanGreaterThanEqualSymbol,
    TokenType.asteriskSymbol,
    TokenType.forwardSlashSymbol,
    TokenType.backSlashSymbol,
    TokenType.modSymbol,
    TokenType.plusSymbol,
    TokenType.openCurlyBraceSymbol,
    TokenType.commaSymbol,
    TokenType.semicolonSymbol,
    TokenType.minusSymbol,
    TokenType.percentSymbol,
    TokenType.equalSymbol,
    TokenType.lessThanSymbol,
    TokenType.greaterThanSymbol,
    TokenType.colonSymbol,
    TokenType.notEqualSymbol,
    TokenType.lessOrEqualThanSymbol,
    TokenType.greaterOrEqualThanSymbol,
    TokenType.bitShiftLeftSymbol,
    TokenType.bitShiftRightSymbol
];

export const NeedSpaceBeforeTokens = [
    TokenType.and,
    TokenType.eval,
    TokenType.then,
    TokenType.to,
    TokenType.step,
    TokenType.each,
    TokenType.as,
    TokenType.return,
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
    TokenType.or,
    TokenType.let,
    TokenType.lineNum,
    TokenType.next,
    TokenType.not,
    TokenType.run,
    TokenType.condIf,
    TokenType.condElse
];

export interface Match {
    tokenType: TokenType;
    value: string;
}