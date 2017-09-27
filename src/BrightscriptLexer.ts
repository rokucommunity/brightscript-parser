export enum TokenType {
    sequenceTerminator,
    invalidToken,
    and,
    createObject,
    elseIf,
    endFunction,
    endSub,
    endWhile,
    eval,
    exitWhile,
    if,
    then,
    else,
    end,
    endif,
    for,
    to,
    step,
    exit,
    each,
    while,
    function,
    as,
    return,
    print,
    rem,
    goto,
    dim,
    stop,
    void,
    boolean,
    integer,
    longInteger,
    float,
    double,
    string,
    object,
    interface,
    invalid,
    dynamic,
    type,
    singleQuote,
    doubleQuote,
    openParen,
    closeParen,
    openSquareBrace,
    closeSquareBrace,
    period,
    comma,
    number,
    newline,
    whitespace,
    identifier,
    numberValue,
    stringValue,
    booleanValue,
    let,
    lineNum,
    next,
    not,
    ObjFun,
    pos,
    run,
    tap,
    semicolon,
    dash,
    percent,
    equal,
    lessThan,
    greaterThan,
    or,
    colon,
}

export class BrightscriptLexer {
    private tokenDefinitions: { tokenType: TokenType, regexp: RegExp }[] = [];
    constructor() {
        this.addTokenDefinitions();
    }

    public addTokenDefinition(tokenType: TokenType, regexp: RegExp) {
        this.tokenDefinitions.push({ tokenType, regexp });
    }

    public addTokenDefinitions() {
        //for reference, the identifierRegex
        //   [a-z_][a-z0-9_]*
        this.addTokenDefinition(TokenType.as, /^(as)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.boolean, /^(boolean)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.booleanValue, /^(true|false)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.closeParen, /^\)/);
        this.addTokenDefinition(TokenType.closeSquareBrace, /^\]/);

        this.addTokenDefinition(TokenType.openParen, /^\(/);

        this.addTokenDefinition(TokenType.identifier, /[a-z_][a-z0-9_]*/i);

        this.addTokenDefinition(TokenType.whitespace, /^\s+/);
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