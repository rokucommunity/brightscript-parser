import { BrightScriptLexer as OriginalLexer } from './BrightScriptLexer';
import { Tokenizer } from './Tokenizer';

let iterations = 100000;
let program =
    `function Main()
    name = "John Doe"
    age = 12
    shoeSize = 7.5
    isAlive = true
end function
`;

let start = Date.now();

// let lexer = new OriginalLexer();
// for (let i = 0; i < iterations; i++) {
//     lexer.tokenize(program);
// }

let tokenizer = new Tokenizer();
for (let i = 0; i < iterations; i++) {
    tokenizer.tokenize(program);
}
let totalTime = Date.now() - start;
let timePerOp = totalTime / iterations;
console.log(`
Original:
    ${timePerOp}ms average
    ${totalTime}ms total`
);
