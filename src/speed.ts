import { BrightScriptLexer as OriginalLexer } from './BrightScriptLexer';
import { Lexer } from './Lexer';
import * as fs from 'fs-extra';
let program = fs.readFileSync('testFiles/Collisions.brs').toString()

let iterationCount = 3000;

function doTest(name: string, callback: () => void) {
    let start = Date.now();
    for (let i = 0; i < iterationCount; i++) {
        callback();
    }
    let stop = Date.now();
    console.log(`${name}: ${(stop - start) / iterationCount}ms`);
}
let lexer = new OriginalLexer();
doTest('original', () => {
    lexer.tokenize(program);
});

let tokenizer = new Lexer();
doTest('tokenizer', () => {
    tokenizer.tokenize(program);
});