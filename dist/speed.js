"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tokenizer_1 = require("./Tokenizer");
var iterations = 100000;
var program = "function Main()\n    name = \"John Doe\"\n    age = 12\n    shoeSize = 7.5\n    isAlive = true\nend function\n";
var start = Date.now();
// let lexer = new OriginalLexer();
// for (let i = 0; i < iterations; i++) {
//     lexer.tokenize(program);
// }
var tokenizer = new Tokenizer_1.Tokenizer();
for (var i = 0; i < iterations; i++) {
    tokenizer.tokenize(program);
}
var totalTime = Date.now() - start;
var timePerOp = totalTime / iterations;
console.log("\nOriginal:\n    " + timePerOp + "ms average\n    " + totalTime + "ms total");
//# sourceMappingURL=speed.js.map