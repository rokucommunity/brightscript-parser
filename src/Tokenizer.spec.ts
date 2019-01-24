import { Tokenizer } from './Tokenizer';
import { expect } from 'chai';

describe.only('Tokenizer', () => {
    let tokenizer: Tokenizer;
    beforeEach(() => {
        tokenizer = new Tokenizer();
    });

    it('matches all known tokens', () => {
        let knownTokens = [
            ...Tokenizer.identifierChars,
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

});