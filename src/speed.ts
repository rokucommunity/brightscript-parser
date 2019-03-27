import { BrightScriptLexer as OriginalLexer } from './BrightScriptLexer';
import { Lexer } from './Lexer';
import * as fs from 'fs-extra';
import * as brs from 'brs';
let program = fs.readFileSync('./testFiles/Collisions.brs').toString();
declare var process: any;

let iterationCount = 3000;

function doTest(name: string, callback: () => void) {
    let runtimeSums = 0;
    for (let i = 0; i < iterationCount; i++) {
        let start = Date.now();
        callback();
        runtimeSums += Date.now() - start;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${name}: ${i}`);
    }
    process.stdout.write('\n');
    console.log(`${name}: ${(runtimeSums) / iterationCount}ms`);
}
let lexer = new OriginalLexer();
// doTest('original', () => {
//     lexer.tokenize(program);
// });

// let tokenizer = new Lexer();
// doTest('tokenizer', () => {
//     tokenizer.tokenize(program);
// });
// doTest('brs tokenizer', () => {
//     brs.lexer.Lexer.scan(program);
// });

doTest('brs parser', () => {
    let { tokens } = brs.lexer.Lexer.scan(program);
    let { errors } = brs.parser.Parser.parse(tokens);
    if (errors.length > 0) {
        throw errors[0];
    }
});