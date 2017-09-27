import { BrightscriptLexer, TokenType } from './BrightscriptLexer';
let lexer: BrightscriptLexer;
beforeEach(() => {
    lexer = new BrightscriptLexer();
    jasmine.addMatchers({
        toEqualCustom: function (util, customEqualityTesters) {
            return {
                compare: function (actual: any, expected: any) {
                    let result = {
                        message: <string | undefined>undefined,
                        pass: true
                    };
                    result.pass = util.equals(actual, expected[0]);
                    if (result.pass === false) {
                        result.message = `Expected '${actual}' to equal '${expected[0]}' for '${expected[1]}'`;
                    }
                    return result;
                },
                negativeCompare: function (actual: any, expected: any) {
                    let result = {
                        message: <string | undefined>undefined,
                        pass: true
                    };
                    result.pass = !util.equals(actual, expected[0]);
                    if (result.pass === false) {
                        result.message = `Expected '${actual}' not to equal '${expected[0]}' for '${expected[1]}'`;
                    }
                    return result;
                }
            };
        }
    });
});
function matchMany(tokenType: TokenType, textItems: string[]) {
    for (let text of textItems) {
        let match = lexer.getMatch(text);
        expect(match ? TokenType[match.tokenType] : undefined).toEqualCustom([TokenType[tokenType], text]);
    }
}
function notMatchMany(tokenType: TokenType, textItems: string[]) {
    for (let text of textItems) {
        let match = lexer.getMatch(text);
        expect(match ? TokenType[match.tokenType] : undefined).not.toEqualCustom([TokenType[tokenType], text]);
    }
}
describe('BrightscriptLexer', () => {
    describe('getMatch works for --', () => {
        it('as', () => {
            matchMany(TokenType.as, ['as', 'AS', 'as ']);
            notMatchMany(TokenType.as, [' as', 'asp', 'gasp']);
        });

        it('boolean', () => {
            matchMany(TokenType.boolean, ['boolean', 'BOOLEAN', 'boolean ', 'boolean,', 'boolean)']);
            notMatchMany(TokenType.boolean, [' boolean', 'booleanValue', 'boolea']);
        });

        it('booleanValue', () => {
            matchMany(TokenType.booleanValue, ['true', 'TRUE', 'true)', 'false', 'FALSE', 'false)']);
            notMatchMany(TokenType.booleanValue, [' true', ' false', 'trueVar', 'falseVar']);
        });

        it('closeParen', () => {
            matchMany(TokenType.closeParen, [')', '),', ')(', ').']);
            notMatchMany(TokenType.closeParen, [' )', 'something)']);
        });

        it('colon', () => {
            matchMany(TokenType.colon, [':', ':abc', ':"']);
            notMatchMany(TokenType.colon, [' :', 'something:']);
        });
    });
});
