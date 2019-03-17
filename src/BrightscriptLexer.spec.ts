import { BrightScriptLexer, KeywordTokenTypes, MiscelaneousTokenTypes, SymbolTokenTypes, SymbolTokenTypeValues, Token, TokenType } from './BrightScriptLexer';
import { expect } from 'chai';

let lexer: BrightScriptLexer;

beforeEach(() => {
    lexer = new BrightScriptLexer();
});

function matchMany(tokenType: TokenType, textItems: string[]) {
    for (let text of textItems) {
        let match = lexer.getMatch(text);
        let matchTokenType = match ? match.tokenType : undefined;

        let errorMessage = `Expected '${matchTokenType}' to equal '${tokenType}' for '${text}'`;

        expect(matchTokenType, errorMessage).to.equal(tokenType);
        // (expect(match ? match.tokenType : undefined) as any).toEqualCustom([tokenType, text]);
    }
}
function notMatchMany(tokenType: TokenType, textItems: string[]) {
    for (let text of textItems) {
        let match = lexer.getMatch(text);
        let matchTokenType = match ? match.tokenType : undefined;

        let errorMessage = `Expected '${matchTokenType}' NOT to equal '${tokenType}' for '${text}'`;

        expect(matchTokenType, errorMessage).not.to.equal(tokenType);

        //    (expect(match ? match.tokenType : undefined) as any).not.toEqualCustom([tokenType, text]);
    }
}
function fkeywordIt(tokenType: TokenType) {
    keywordIt(tokenType, true);
}
function keywordIt(tokenType: TokenType, exclusive = false) {
    let method = exclusive ? it.only : it;
    method(tokenType, () => {
        matchMany(tokenType, [
            tokenType.toLowerCase(),
            tokenType.toUpperCase(),
            tokenType
        ]);
        notMatchMany(tokenType, [
            ` ${tokenType}`,
            `${tokenType}WithOtherWord`,
            `wordThen${tokenType}`
        ]);
    });
}
function fsymbolIt(symbol: string, tokenType: TokenType) {
    symbolIt(symbol, tokenType, true);
}
function symbolIt(symbol: string, tokenType: TokenType, exclusive = false) {
    let method = exclusive ? it.only : it;
    method(tokenType, () => {
        matchMany(tokenType, [symbol, `${symbol},`, `${symbol})(`, `${symbol}Something`]);
        notMatchMany(tokenType, [` ${symbol}`, `something${symbol}`]);
    });
}

it('all tokens are placed into a bucket', () => {
    let allTokenTypes: TokenType[] = [];
    for (let tokenType in TokenType) {
        allTokenTypes.push(<TokenType>tokenType);
    }

    //test that every symbol is represented in a bucket
    let buckets = [
        KeywordTokenTypes,
        SymbolTokenTypes,
        MiscelaneousTokenTypes
    ];

    for (let bucket of buckets) {
        for (let tokenType of bucket) {
            let index = allTokenTypes.indexOf(tokenType);
            if (index > -1) {
                allTokenTypes.splice(index, 1);
            }
        }
    }
    expect(allTokenTypes).to.deep.equal([]);
});

it('all tokens have a token definition', () => {
    let allTokenTypes: TokenType[] = [];
    for (let tokenType in TokenType) {
        allTokenTypes.push(<TokenType>tokenType);
    }

    for (let tokenDefinition of ((lexer as any).tokenDefinitions as { tokenType: TokenType }[])) {
        let index = allTokenTypes.indexOf(tokenDefinition.tokenType);
        if (index > -1) {
            allTokenTypes.splice(index, 1);
        }
    }
    //the only tokens that should not have a definition are the EOF and INVALID_TOKEN tokens
    expect(allTokenTypes).to.deep.equal([TokenType.END_OF_FILE, TokenType.INVALID_TOKEN]);
});

describe('BrightscriptLexer', () => {
    describe('getMatch() works for --', () => {
        for (let keywordTokenType of KeywordTokenTypes) {
            //skip the conditional compile items
            if (keywordTokenType.indexOf('cond') === 0) {
                continue;
            }
            keywordIt(keywordTokenType);
        }

        function handleCondKeywords(tokenType, keywordText) {
            it(tokenType, () => {
                matchMany(tokenType, [
                    keywordText.toLowerCase(),
                    keywordText.toUpperCase(),
                    keywordText
                ]);
                notMatchMany(keywordText, [
                    ` ${keywordText}`,
                    `${keywordText}WithOtherWord`,
                    `wordThen${keywordText}`
                ]);
            });
        }

        //add the conditional items
        handleCondKeywords('condIf', '#if');
        handleCondKeywords('condElse', '#else');
        handleCondKeywords('condElseIf', '#else if');
        handleCondKeywords('condElseIf', '#elseif');
        handleCondKeywords('condEndIf', '#endif');
        handleCondKeywords('condEndIf', '#end if');

        for (let tokenType in SymbolTokenTypeValues) {
            let symbol = SymbolTokenTypeValues[tokenType];
            symbolIt(symbol, <TokenType>tokenType);
        }

        it('booleanLiteral', () => {
            matchMany(TokenType.booleanLiteral, ['true', 'TRUE', 'true)', 'false', 'FALSE', 'false)']);
            notMatchMany(TokenType.booleanLiteral, [' true', ' false', 'trueVar', 'falseVar']);
        });

        it('stringLiteral', () => {
            matchMany(TokenType.stringLiteral, ['"cat"', '"cat" ', '"cat")']);
            notMatchMany(TokenType.stringLiteral, ['"cat', ' "cat"', 'cat"']);
        });

        it('numberLiteral', () => {
            matchMany(TokenType.numberLiteral, ['1', '123', '1 ']);
            notMatchMany(TokenType.numberLiteral, ['a1', ' 123', '+1', '-1']);
        });

        it('identifier', () => {
            matchMany(TokenType.identifier, ['a', '_a', '_a_', '__aa', 'a_', 'a1', '_a1', 'a1_']);
            notMatchMany(TokenType.identifier, ['1a', ' a', '', '*&^']);
        });

        it('whitespace', () => {
            matchMany(TokenType.spaces, [' ', '   ', '     ']);
            matchMany(TokenType.tabs, ['\t', '\t\t', '\t\t\t']);
        });

        it('newline', () => {
            matchMany(TokenType.newline, ['\n', '\r', '\r\n', '\n\r', '\n ']);
            notMatchMany(TokenType.newline, ['a\n', ' \r']);
        });
    });

    describe('tokenize', () => {
        it('comment tokens do not include newline character', () => {
            expect(tokenize(`'some comment\n`)).to.deep.equal([TokenType.quoteComment, TokenType.newline, TokenType.END_OF_FILE]);

            let tokens = lexer.tokenize(`REM some comment\n`);
            expect(tokens[0].tokenType).to.deep.equal(TokenType.remComment);
            expect(tokens[1].tokenType).to.deep.equal(TokenType.newline);
        });

        it('comment tokens are not captured within string literal', () => {
            expect(tokenize(`REM some comment\n`)).to.deep.equal([TokenType.remComment, TokenType.newline, TokenType.END_OF_FILE]);
        });

        it('should not extract keywords from words that start with those keywords', () => {
            expect(getTypes(lexer.tokenize('reminder'))).to.deep.equal([TokenType.identifier, TokenType.END_OF_FILE]);
            expect(getTypes(lexer.tokenize('fortune'))).to.deep.equal([TokenType.identifier, TokenType.END_OF_FILE]);
            expect(getTypes(lexer.tokenize('nextThing'))).to.deep.equal([TokenType.identifier, TokenType.END_OF_FILE]);
            expect(getTypes(lexer.tokenize('andThen'))).to.deep.equal([TokenType.identifier, TokenType.END_OF_FILE]);
            expect(getTypes(lexer.tokenize('elseIfSomething'))).to.deep.equal([TokenType.identifier, TokenType.END_OF_FILE]);
        });

        it('should find invalid tokens', () => {
            let program = 'k = #';
            let tokens = lexer.tokenize(program);
            expect(tokens[4].tokenType).to.deep.equal(TokenType.INVALID_TOKEN);
        });

        it('should not add extra newlines', () => {
            let program = `sub Main()\r\n    showChannelSGScreen()\r\n    end sub`;
            let tokens = lexer.tokenize(program);
            let types: TokenType[] = [];
            for (let token of tokens) {
                types.push(token.tokenType);
            }
            expect(types).to.deep.equal([
                TokenType.sub,
                TokenType.spaces,
                TokenType.identifier,
                TokenType.openParenSymbol,
                TokenType.closeParenSymbol,
                TokenType.newline,
                TokenType.spaces,
                TokenType.identifier,
                TokenType.openParenSymbol,
                TokenType.closeParenSymbol,
                TokenType.newline,
                TokenType.spaces,
                TokenType.endSub,
                TokenType.END_OF_FILE
            ]);
        });

        it('should combine back to the original program', () => {
            let program = `
                sub DoSomething()
                    k = 2
                end sub
            `;
            let tokens = lexer.tokenize(program);
            expect(stringify(tokens)).to.deep.equal(program);
            let types: TokenType[] = [];
            for (let token of tokens) {
                types.push(token.tokenType);
            }
            expect(types).to.deep.equal([
                TokenType.newline,
                TokenType.spaces,
                TokenType.sub,
                TokenType.spaces,
                TokenType.identifier,
                TokenType.openParenSymbol,
                TokenType.closeParenSymbol,
                TokenType.newline,
                TokenType.spaces,
                TokenType.identifier,
                TokenType.spaces,
                TokenType.equalSymbol,
                TokenType.spaces,
                TokenType.numberLiteral,
                TokenType.newline,
                TokenType.spaces,
                TokenType.endSub,
                TokenType.newline,
                TokenType.spaces,
                TokenType.END_OF_FILE
            ]);
        });

        describe('string literals', () => {
            it('works with basic strings', () => {
                expect(getTypes(lexer.tokenize(`"foo"`))).to.deep.equal([
                    TokenType.stringLiteral,
                    TokenType.END_OF_FILE
                ]);
            });

            it('works with concatenation', () => {
                expect(getTypes(lexer.tokenize(`"foo" + "bar"`))).to.deep.equal([
                    TokenType.stringLiteral,
                    TokenType.spaces,
                    TokenType.plusSymbol,
                    TokenType.spaces,
                    TokenType.stringLiteral,
                    TokenType.END_OF_FILE
                ]);
            });
            it('works with escaped quotemarks', () => {
                expect(getTypes(lexer.tokenize(`"""foo"""`))).to.deep.equal([
                    TokenType.stringLiteral,
                    TokenType.END_OF_FILE
                ]);

                expect(getTypes(lexer.tokenize(`"foo""foo""foo"`))).to.deep.equal([
                    TokenType.stringLiteral,
                    TokenType.END_OF_FILE
                ]);
            });
        });
        describe('special cases', () => {
            it('special case #1', () => {
                let program = `Else If Type(value)="roAssociativeArray" then`;
                let tokens = lexer.tokenize(program);
                expect(stringify(tokens)).to.deep.equal(program);
                expect(getTypes(tokens)).to.deep.equal([
                    TokenType.elseIf,
                    TokenType.spaces,
                    TokenType.identifier,
                    TokenType.openParenSymbol,
                    TokenType.identifier,
                    TokenType.closeParenSymbol,
                    TokenType.equalSymbol,
                    TokenType.stringLiteral,
                    TokenType.spaces,
                    TokenType.then,
                    TokenType.END_OF_FILE
                ]);
            });

            it('square brace accessor', () => {
                let program = `function test()\n    asdf = "asdf: " + anytostring(m.asdf["asdf"])\nend function`;
                let tokens = lexer.tokenize(program);
                expect(stringify(tokens)).to.deep.equal(program);
                expect(getTypes(tokens)).to.deep.equal([
                    TokenType.function,
                    TokenType.spaces,
                    TokenType.identifier,
                    TokenType.openParenSymbol,
                    TokenType.closeParenSymbol,
                    TokenType.newline,
                    TokenType.spaces,
                    TokenType.identifier,
                    TokenType.spaces,
                    TokenType.equalSymbol,
                    TokenType.spaces,
                    TokenType.stringLiteral,
                    TokenType.spaces,
                    TokenType.plusSymbol,
                    TokenType.spaces,
                    TokenType.identifier,
                    TokenType.openParenSymbol,
                    TokenType.identifier,
                    TokenType.periodSymbol,
                    TokenType.identifier,
                    TokenType.openSquareBraceSymbol,
                    TokenType.stringLiteral,
                    TokenType.closeSquareBraceSymbol,
                    TokenType.closeParenSymbol,
                    TokenType.newline,
                    TokenType.endFunction,
                    TokenType.END_OF_FILE
                ]);

            });

            it('nested if statements', () => {
                let program = `if true then\n    doSomething()\nelse\n    if true then\n        doSomething()\n    end if\n    end if`;
                let tokens = lexer.tokenize(program);
                expect(stringify(tokens)).to.deep.equal(program);
                expect(getTypes(tokens)).to.deep.equal([
                    TokenType.if,
                    TokenType.spaces,
                    TokenType.booleanLiteral,
                    TokenType.spaces,
                    TokenType.then,
                    TokenType.newline,
                    TokenType.spaces,
                    TokenType.identifier,
                    TokenType.openParenSymbol,
                    TokenType.closeParenSymbol,
                    TokenType.newline,
                    TokenType.else,
                    TokenType.newline,
                    TokenType.spaces,
                    TokenType.if,
                    TokenType.spaces,
                    TokenType.booleanLiteral,
                    TokenType.spaces,
                    TokenType.then,
                    TokenType.newline,
                    TokenType.spaces,
                    TokenType.identifier,
                    TokenType.openParenSymbol,
                    TokenType.closeParenSymbol,
                    TokenType.newline,
                    TokenType.spaces,
                    TokenType.endIf,
                    TokenType.newline,
                    TokenType.spaces,
                    TokenType.endIf,
                    TokenType.END_OF_FILE
                ]);
            });
            it('method called "next"', () => {
                let program = `m.top.returnString = m.someArray.next()`;
                let tokens = lexer.tokenize(program);
                expect(stringify(tokens)).to.deep.equal(program);
                expect(getTypes(tokens)).to.deep.equal([
                    TokenType.identifier,
                    TokenType.periodSymbol,
                    TokenType.identifier,
                    TokenType.periodSymbol,
                    TokenType.identifier,
                    TokenType.spaces,
                    TokenType.equalSymbol,
                    TokenType.spaces,
                    TokenType.identifier,
                    TokenType.periodSymbol,
                    TokenType.identifier,
                    TokenType.periodSymbol,
                    TokenType.identifier,
                    TokenType.openParenSymbol,
                    TokenType.closeParenSymbol,
                    TokenType.END_OF_FILE
                ]);
            });
        });
    });
});

function getTypes(tokens: Token[]) {
    let types: TokenType[] = [];
    for (let token of tokens) {
        types.push(token.tokenType);
    }
    return types;
}

function stringify(tokens: Token[]) {
    let result = '';
    for (let token of tokens) {
        result += token.value ? token.value : '';
    }
    return result;
}

function tokenize(text: string) {
    return getTypes(lexer.tokenize(text));
}