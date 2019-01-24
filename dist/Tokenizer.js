"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tokenizes a BrightScript file
 */
var Tokenizer = /** @class */ (function () {
    function Tokenizer() {
    }
    Tokenizer.prototype.tokenize = function (text) {
        var tokens = [];
        //any other text gets added here until another valid token is found
        var catchallToken = '';
        for (var charIndex = 0; charIndex < text.length; charIndex++) {
            var char = text[charIndex];
            var lowerChar = char.toLowerCase();
            //find any symbols
            if (Tokenizer.symbols.indexOf(char) > -1) {
                tokens.push(char);
                continue;
            }
            //match on keywords
            {
                for (var _i = 0, _a = Tokenizer.keywords; _i < _a.length; _i++) {
                    var keyword = _a[_i];
                    //get the same number of characters as the keyword
                    var chars = text.substring(charIndex, charIndex + keyword.length);
                    var lowerChars = chars.toLowerCase();
                    //get the character AFTER the keyword.
                    var nextChar = text[charIndex + keyword.length + 1];
                    var lowerNextChar = nextChar ? nextChar.toLowerCase() : '';
                    //if the keyword matches exactly, and the next char is not an identifier char
                    //then this set of chars is a keyword (and not an identifier)
                    if (lowerChars === keyword && Tokenizer.identifierChars.indexOf(lowerNextChar) === -1) {
                        tokens.push(chars);
                        //move the index to the end of this text
                        charIndex = charIndex + keyword.length - 1;
                        continue;
                    }
                }
            }
            //match on whitespace
            {
                var whitespaceToken = '';
                inner: for (var idx = charIndex; idx < text.length; idx++) {
                    var innerChar = text[idx];
                    var whitespaceChar = text[idx];
                    //only keep spaces and tabs
                    if (innerChar === ' ' || innerChar === '\t') {
                        whitespaceToken += innerChar;
                    }
                    else {
                        break inner;
                    }
                }
                if (whitespaceToken.length > 0) {
                    tokens.push(whitespaceToken);
                    charIndex = charIndex + whitespaceToken.length - 1;
                    continue;
                }
            }
            //match identifiers
            {
                //identifiers must start with a letter
                if (Tokenizer.letterChars.indexOf(lowerChar) > -1) {
                    var identifierToken = char;
                    inner: for (var idx = charIndex + 1; idx < text.length; idx++) {
                        var innerChar = text[idx];
                        var innerCharLower = innerChar.toLowerCase();
                        if (Tokenizer.identifierChars.indexOf(innerChar) > -1) {
                            identifierToken += innerChar;
                        }
                        else {
                            break inner;
                        }
                    }
                    tokens.push(identifierToken);
                    charIndex = charIndex + identifierToken.length - 1;
                    continue;
                }
            }
            //match numbers on their own
            {
                if (Tokenizer.numberChars.indexOf(lowerChar) > -1) {
                    var numberToken = char;
                    inner: for (var idx = charIndex + 1; idx < text.length; idx++) {
                        var innerChar = text[idx];
                        if (Tokenizer.numberChars.indexOf(innerChar) > -1) {
                            numberToken += innerChar;
                        }
                        else {
                            break inner;
                        }
                    }
                    tokens.push(numberToken);
                    charIndex = charIndex + numberToken.length - 1;
                    continue;
                }
            }
            //handle unknown characters
            {
                //create a new catchall token and add it as a token
                if (!catchallToken) {
                    catchallToken = char;
                    tokens.push(catchallToken);
                }
                else {
                    //we have a running catchall token, append this to it
                    catchallToken += char;
                    //the last token in the list is the catchall token, append to it
                    tokens[tokens.length - 1] = catchallToken;
                }
            }
        }
        return tokens;
    };
    Tokenizer.keywords = [
        'and',
        'elseif',
        'endfunction',
        'endsub',
        'endwhile',
        'endfor',
        'eval',
        'exitwhile',
        'exitfor',
        'if',
        'then',
        'else',
        'endif',
        'for',
        'to',
        'step',
        'exit',
        'each',
        'while',
        'function',
        'sub',
        'as',
        'return',
        'print',
        'goto',
        'dim',
        'stop',
        'void',
        'boolean',
        'integer',
        'number',
        'longinteger',
        'float',
        'double',
        'string',
        'object',
        'interface',
        'invalid',
        'dynamic',
        'or',
        'let',
        'linenum',
        'next',
        'not',
        'run',
        '#if',
        '#else',
        '#elseif',
        'mod',
    ];
    Tokenizer.symbols = [
        '+',
        '-',
        '*',
        '/',
        '\\',
        '%',
        '^',
        '"',
        '(',
        ')',
        '[',
        ']',
        '{',
        '}',
        '.',
        ',',
        ';',
        '%',
        '=',
        '<',
        '>',
        ':'
    ];
    Tokenizer.letterChars = [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z'
    ];
    Tokenizer.numberChars = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0'
    ];
    Tokenizer.identifierChars = Tokenizer.letterChars.concat(Tokenizer.numberChars, [
        '_'
    ]);
    Tokenizer.whitespaceChars = ['\s', '\t'];
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=Tokenizer.js.map