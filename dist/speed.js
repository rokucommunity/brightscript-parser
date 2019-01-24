"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BrightScriptLexer_1 = require("./BrightScriptLexer");
var iterations = 100000;
var program = "function Main()\n    name = \"John Doe\"\n    age = 12\n    shoeSize = 7.5\n    isAlive = true\nend function\n";
var start = Date.now();
var lexer = new BrightScriptLexer_1.BrightScriptLexer();
for (var i = 0; i < iterations; i++) {
    lexer.tokenize(program);
}
var totalTime = Date.now() - start;
var timePerOp = totalTime / iterations;
console.log("\nOriginal:\n    " + timePerOp + "ms average\n    " + totalTime + "ms total");
//# sourceMappingURL=speed.js.map