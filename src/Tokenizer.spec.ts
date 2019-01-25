import { Tokenizer } from './Tokenizer';
import { expect } from 'chai';

describe('Tokenizer', () => {
    let tokenizer: Tokenizer;
    beforeEach(() => {
        tokenizer = new Tokenizer();
    });

    it('matches all known tokens', () => {
        let knownTokens = [
            ...Tokenizer.numberChars,
            ...Tokenizer.letterChars,
            ...Tokenizer.keywords,
            ...Tokenizer.symbols
        ];

        let knownTokensWithSpaces = [] as string[];
        for (let i = 0; i < knownTokens.length; i++) {
            let knownToken = knownTokens[i];
            if (i > 0) {
                knownTokensWithSpaces.push(' ');
            }
            knownTokensWithSpaces.push(knownToken);
        }

        let tokens = tokenizer.tokenize(knownTokensWithSpaces.join(''));
        for (let i = 0; i < tokens.length; i++) {
            expect(tokens[i]).to.equal(knownTokensWithSpaces[i], `Index ${i}`);
        }
    });

    it('handles weirness with the "run" keyword case', () => {
        let tokens = tokenizer.tokenize('run');
        expect(tokens).to.eql(['run']);
    });

    it('captures identifiers', () => {
        expect(tokenizer.tokenize('123var')).to.eql(['123var']);
        expect(tokenizer.tokenize('var123')).to.eql(['var123']);
        expect(tokenizer.tokenize('camelCaseVar')).to.eql(['camelCaseVar']);
    });

    it('handles misc. cases', () => {
        expect(tokenizer.tokenize('var_1 = 123')).to.eql(['var_1', ' ', '=', ' ', '123']);
    });

    it('handles comments as single token', () => {
        expect(tokenizer.tokenize(`didSomething=true'this is a comment`)).to.eql(['didSomething', '=', 'true', `'this is a comment`]);
    });

    it('captures whitespace', () => {
        expect(tokenizer.tokenize('é é')).to.eql(['é', ' ', 'é']);
        expect(tokenizer.tokenize('é\té')).to.eql(['é', '\t', 'é']);
    });

    it('captures newlines', () => {
        expect(tokenizer.tokenize('\n')).to.eql(['\n']);
        expect(tokenizer.tokenize('\né')).to.eql(['\n', 'é']);
        expect(tokenizer.tokenize('\r\n')).to.eql(['\r\n']);
        expect(tokenizer.tokenize('\r\né')).to.eql(['\r\n', 'é']);
    });
});