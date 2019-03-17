import { Lexer, Token2 } from './Lexer';
import { expect } from 'chai';
import { TokenType } from './BrightScriptLexer';
import * as fs from 'fs-extra';

describe('Lexer', () => {
    let lexer: Lexer;
    beforeEach(() => {
        lexer = new Lexer();
    });

    it('matches all known tokens', () => {
        let knownTokens = [
            ...Lexer.numberChars,
            ...Lexer.letterChars,
            ...Lexer.keywordKeys,
            ...Lexer.symbolKeys
        ];

        let knownTokensWithSpaces = [] as string[];
        for (let i = 0; i < knownTokens.length; i++) {
            let knownToken = knownTokens[i];
            if (i > 0) {
                knownTokensWithSpaces.push(' ');
            }
            knownTokensWithSpaces.push(knownToken);
        }

        let tokens = getTokenValues(knownTokensWithSpaces.join(''));
        for (let i = 0; i < tokens.length; i++) {
            expect(tokens[i]).to.equal(knownTokensWithSpaces[i], `Index ${i}`);
        }
    });

    it('handles weirness with the "run" keyword case', () => {
        let tokens = getTokenValues('run');
        expect(tokens).to.eql(['run']);
    });

    it('captures identifiers', () => {
        expect(getTokenValues('123var')).to.eql(['123var']);
        expect(getTokenValues('var123')).to.eql(['var123']);
        expect(getTokenValues('camelCaseVar')).to.eql(['camelCaseVar']);
        // //identifiers with type designator chars at the end
        // expect(lexer.tokenize('boy$')[0]).to.deep.include({ value: 'boy$', tokenType: TokenType.identifier });
        // expect(lexer.tokenize('boy%')[0]).to.deep.include({ value: 'boy%', tokenType: TokenType.identifier });
        // expect(lexer.tokenize('boy!')[0]).to.deep.include({ value: 'boy!', tokenType: TokenType.identifier });
        // expect(lexer.tokenize('boy#')[0]).to.deep.include({ value: 'boy#', tokenType: TokenType.identifier });
    });

    it('handles misc. cases', () => {
        expect(getTokenValues('var_1 = 123')).to.eql(['var_1', ' ', '=', ' ', '123']);
    });

    it('handles comments as single token', () => {
        expect(getTokenValues(`didSomething=true'this is a comment`)).to.eql(['didSomething', '=', 'true', `'this is a comment`]);
    });

    it('captures whitespace', () => {
        expect(getTokenValues('é é')).to.eql(['é', ' ', 'é']);
        expect(getTokenValues('é\té')).to.eql(['é', '\t', 'é']);
    });

    it('captures newlines', () => {
        expect(getTokenValues('\n')).to.eql(['\n']);
        expect(getTokenValues('\né')).to.eql(['\n', 'é']);
        expect(getTokenValues('\r\n')).to.eql(['\r\n']);
        expect(getTokenValues('\r\né')).to.eql(['\r\n', 'é']);
    });

    it('captures numeric literals', () => {
        expect(getTokenValues('0 1 2 3 4 5 6 7 8 9').filter(x => x !== ' ')).to.eql(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
        expect(lexer.tokenize('123')[0].tokenType).to.eql(TokenType.numberLiteral);
    });

    it('splits composite keywords into separate tokens', () => {
        expect(
            getTokenValues('elseif endfunction endsub endwhile endfor exitwhile exitfor').filter(x => x !== ' ')
        ).to.eql(['else', 'if', 'end', 'function', 'end', 'sub', 'end', 'while', 'end', 'for', 'exit', 'while', 'exit', 'for']);
    });

    describe('getNextChunk', () => {
        it('works', () => {
            expect(lexer.getAllWords('a abc 1a a1 a+b b!')).to.eql([
                'a', ' ', 'abc', ' ', '1a', ' ', 'a1', ' ', 'a', '+', 'b', ' ', 'b', '!'
            ]);
        });
    });

    describe('edge cases', () => {
        it('finds mixed case identifiers', () => {
            let program = `Function Main`;
            expect(lexer.tokenize(program)).to.eql([{
                value: 'Function',
                offset: 0,
                line: 0,
                column: 0,
                tokenType: TokenType.function
            }, {
                value: ' ',
                offset: 8,
                line: 0,
                column: 8,
                tokenType: TokenType.spaces
            }, {
                value: 'Main',
                offset: 9,
                line: 0,
                column: 9,
                tokenType: TokenType.identifier
            }] as Token2[]);
        });
    });

    describe('offset', () => {
        it('is set properly for all token types', () => {
            let fileContents = fs.readFileSync('testFiles/Collisions.brs').toString();
            let tokens = lexer.tokenize(fileContents);

            //the first token should not be offset at all
            expect(tokens[0].offset).to.equal(0);

            //ensure that the offsets are perfectly aligned
            for (let i = 0; i < tokens.length - 1; i++) {
                let currentToken = tokens[i];
                let nextToken = tokens[i + 1];
                if (currentToken && nextToken) {
                    if (currentToken.offset + currentToken.value.length !== nextToken.offset) {
                        console.log('Current token', currentToken);
                        console.log('Next token', nextToken);
                        throw new Error(`Unexpected gap between token ${i} and ${i + 1}`);
                    }
                }
            }
        });
    });

    function getTokenValues(text: string) {
        return lexer.tokenize(text).map(x => x.value);
    }
});
