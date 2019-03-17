import { TokenType } from './BrightScriptLexer';
import { Range } from './interfaces';
import { util } from './util';

/**
 * Tokenizes and lexes a BrightScript file
 */
export class Lexer {
    constructor() {

    }

    /**
     * Turn an entire piece of text into chunks where alphanumeric characters are grouped, but everything else is split by character
     * @param text 
     */
    public getAllWords(text: string) {
        let chunks = [] as string[];
        let offset = 0;
        while (offset < text.length) {
            let chunk = this.getWord(text, offset);
            chunks.push(chunk);
            offset += chunk.length;
        }
        return chunks;
    }

    /**
     * Groups alphanumeric (and underscore) characters into a single chunk, or returns the single char if non-alphanumeric
     * @param text 
     */
    public getWord(text: string, startIndex: number) {
        if (startIndex >= text.length) {
            return '';
        }
        let chunk = '';
        for (let i = startIndex; i < text.length; i++) {
            let char = text[i];
            let isAlphanumeric = Lexer.identifierChars.indexOf(char.toLowerCase()) > -1;

            //if this is the first character, and it's not alphanumeric, return it
            if (chunk.length === 0 && isAlphanumeric === false) {
                return char;
            }
            //the current char is not alphanumeric. return whatever chunk we currently have
            if (isAlphanumeric === false) {
                return chunk;
            }

            //the current char IS alphanumeric, so keep it and move on to the next char
            chunk += char;
        }
        return chunk;
    }

    public tokenize(text: string) {
        let tokens = [] as Token2[];

        let lineIndex = 0;
        //the index of the char relative to the beginning of the line
        let lineBeginCharIndex = 0;

        outer: for (let charIndex = 0; charIndex < text.length; charIndex++) {
            let word = this.getWord(text, charIndex);
            let lowerWord = word.toLowerCase();
            let nextWord = this.getWord(text, charIndex + word.length);

            //match on newlines
            {
                if (word === '\n') {
                    tokens.push({
                        value: word,
                        tokenType: TokenType.newline,
                        line: lineIndex,
                        column: charIndex - lineBeginCharIndex,
                        offset: charIndex
                    });
                    //this is the end of a line, increment the line index tracker
                    lineIndex++;
                    //a new line starts this absolute charIndex
                    lineBeginCharIndex = charIndex + 1;
                    continue;
                } else if (word === '\r' && nextWord === '\n') {
                    tokens.push({
                        value: '\r\n',
                        tokenType: TokenType.newline,
                        line: lineIndex,
                        column: (charIndex + 1) - lineBeginCharIndex,
                        offset: charIndex
                    });
                    //we took an extra char, update the char index
                    charIndex++;
                    //this is the end of a line, increment the line index tracker
                    lineIndex++;
                    //a new line starts this absolute charIndex
                    lineBeginCharIndex = charIndex + 2;
                    continue;
                }
            }

            //match on spaces
            {
                let spacesToken = '';
                inner: for (let idx = charIndex; idx < text.length; idx++) {
                    let innerChar = text[idx];
                    //only keep spaces
                    if (innerChar === ' ') {
                        spacesToken += innerChar;
                    } else {
                        break inner;
                    }
                }
                if (spacesToken.length > 0) {
                    tokens.push({
                        value: spacesToken,
                        tokenType: TokenType.spaces,
                        line: lineIndex,
                        column: charIndex - lineBeginCharIndex,
                        offset: charIndex
                    });
                    charIndex = charIndex + spacesToken.length - 1;
                    continue;
                }
            }
            //match on tabs
            {
                let tabsToken = '';
                inner: for (let idx = charIndex; idx < text.length; idx++) {
                    let innerChar = text[idx];
                    //only keep tabs
                    if (innerChar === '\t') {
                        tabsToken += innerChar;
                    } else {
                        break inner;
                    }
                }
                if (tabsToken.length > 0) {
                    tokens.push({
                        value: tabsToken,
                        tokenType: TokenType.tabs,
                        line: lineIndex,
                        column: charIndex - lineBeginCharIndex,
                        offset: charIndex
                    });
                    charIndex = charIndex + tabsToken.length - 1;
                    continue;
                }
            }

            //match on keywords
            {
                if (Lexer.keywordKeys.indexOf(lowerWord) > -1) {
                    tokens.push({
                        value: word,
                        tokenType: Lexer.keywords[lowerWord],
                        line: lineIndex,
                        column: charIndex - lineBeginCharIndex,
                        offset: charIndex
                    });
                    //move the index to the end of this text
                    charIndex = charIndex + word.length - 1;
                    continue outer;
                }
            }
            //match on composite keywords
            {
                //split the combined keywords (like `elseif`) into separate tokens (`else` `if`)
                if (Lexer.compositeKeywordKeys.indexOf(lowerWord) > -1) {
                    let secondPartIndex = Lexer.compositeKeywords[lowerWord];
                    let firstPart = word.substring(0, secondPartIndex);
                    let secondPart = word.substring(secondPartIndex);
                    tokens.push({
                        value: firstPart,
                        tokenType: Lexer.keywords[firstPart.toLowerCase()],
                        line: lineIndex,
                        column: charIndex - lineBeginCharIndex,
                        offset: charIndex
                    });
                    tokens.push({
                        value: secondPart,
                        tokenType: Lexer.keywords[secondPart.toLowerCase()],
                        line: lineIndex,
                        column: (charIndex + firstPart.length) - lineBeginCharIndex,
                        offset: charIndex + firstPart.length
                    });
                    charIndex = charIndex + word.length - 1;
                    continue;
                }
            }

            //match on strings
            {
                if (word === '"') {
                    let stringToken = word;
                    //eat tokens until we reach the end of the string, or the end of the line
                    stringLoop: for (let idx = charIndex + 1; idx < text.length; idx++) {
                        let thisChar = text[idx];
                        let nextChar = text[idx + 1];
                        if (thisChar === '"') {
                            //escaped string character
                            if (nextChar === '"') {
                                stringToken += '""';
                                idx++;
                            } else {
                                //string was terminated
                                stringToken += thisChar;
                                break stringLoop;
                            }
                            //encountered the end of a line. Strings can't be multi-line, so terminate here
                            //and let the parser handle this string as an error later on
                        } else if (thisChar === '\n' || (thisChar === '\r' && nextChar === '\n')) {
                            break stringLoop;
                        } else {
                            stringToken += thisChar;
                        }
                    }
                    tokens.push({
                        column: charIndex - lineBeginCharIndex,
                        line: lineIndex,
                        offset: charIndex,
                        tokenType: TokenType.stringLiteral,
                        value: stringToken
                    });
                    charIndex = charIndex + stringToken.length - 1;
                    continue;
                }
            }

            //find any symbols
            if (Lexer.symbolKeys.indexOf(word) > -1) {
                tokens.push({
                    value: word,
                    tokenType: Lexer.symbols[word],
                    line: lineIndex,
                    column: charIndex - lineBeginCharIndex,
                    offset: charIndex
                });
                continue;
            }

            //match comments
            if (word === `'`) {
                let commentToken = word;
                //take all tokens until a newline or EOF
                inner: for (let idx = charIndex + 1; idx < text.length; idx++) {
                    let innerChar = text[idx];
                    if (innerChar === '\n' || innerChar === '\r') {
                        break inner;
                    } else {
                        commentToken += text[idx];
                    }
                }
                //hit newline or end of file
                tokens.push({
                    value: commentToken,
                    tokenType: TokenType.quoteComment,
                    line: lineIndex,
                    column: charIndex - lineBeginCharIndex,
                    offset: charIndex
                });
                charIndex = charIndex + commentToken.length - 1;
                continue;
            }

            //match numeric literals
            {
                //if the first char of this word starts with a number
                if (Lexer.numberChars.indexOf(word[0]) > -1) {
                    let numberToken = word;
                    let letterCount = 0;
                    for (let i = 0; i < word.length; i++) {
                        let char = word[i];
                        if (Lexer.identifierFirstCharacterChars.indexOf(char) > -1) {
                            letterCount++;
                        }
                    }
                    if (letterCount === 0) {
                        //integer literals may end with a type designator, so include that token if present
                        if (Lexer.numericTypeDesignators.indexOf(nextWord) > -1) {
                            numberToken += nextWord;
                        }

                        tokens.push({
                            value: numberToken,
                            tokenType: TokenType.numberLiteral,
                            line: lineIndex,
                            column: charIndex - lineBeginCharIndex,
                            offset: charIndex
                        });
                        charIndex = charIndex + numberToken.length - 1;
                        continue;
                    }
                }
            }

            //match identifiers
            {
                let firstChar = lowerWord[0];
                //match on any valid identifier chars (even when starting with numbers). The parser can handle the 
                //"identifier cannot start with number" errors on its end
                if (Lexer.identifierChars.indexOf(firstChar) > -1) {
                    let identifierToken = word;
                    //identifiers may end with a type designator, so include that token if present
                    let nextChar = text[charIndex + identifierToken.length];
                    if (Lexer.identifierTypeDesignators.indexOf(nextChar) > -1) {
                        identifierToken += nextChar;
                    }
                    tokens.push({
                        value: identifierToken,
                        tokenType: TokenType.identifier,
                        line: lineIndex,
                        column: charIndex - lineBeginCharIndex,
                        offset: charIndex

                    });
                    charIndex = charIndex + identifierToken.length - 1;
                    continue;
                }
            }

            //handle unknown characters
            {
                tokens.push({
                    value: word,
                    tokenType: TokenType.INVALID_TOKEN,
                    line: lineIndex,
                    column: charIndex - lineBeginCharIndex,
                    offset: charIndex
                });
            }
        }
        return tokens;
    }

    public static keywords = {
        'and': TokenType.and,
        'eval': TokenType.eval,
        'if': TokenType.if,
        'then': TokenType.then,
        'else': TokenType.else,
        'endif': TokenType.endIf,
        'for': TokenType.for,
        'to': TokenType.to,
        'step': TokenType.step,
        'exit': TokenType.exit,
        'each': TokenType.each,
        'while': TokenType.while,
        'function': TokenType.function,
        'sub': TokenType.sub,
        'as': TokenType.as,
        'return': TokenType.return,
        'print': TokenType.print,
        'goto': TokenType.goto,
        'dim': TokenType.dim,
        'stop': TokenType.stop,
        'void': TokenType.void,
        'boolean': TokenType.boolean,
        'integer': TokenType.integer,
        'number': TokenType.number,
        'longinteger': TokenType.longInteger,
        'float': TokenType.float,
        'double': TokenType.double,
        'string': TokenType.string,
        'object': TokenType.object,
        'interface': TokenType.interface,
        'invalid': TokenType.invalid,
        'dynamic': TokenType.dynamic,
        'or': TokenType.or,
        'let': TokenType.let,
        'linenum': TokenType.lineNum,
        'next': TokenType.next,
        'not': TokenType.not,
        'run': TokenType.run,
        'library': TokenType.library
    };

    public static keywordKeys = Object.keys(Lexer.keywords);

    /**
     * The index where the second art of the composite keyword starts
     */
    public static compositeKeywords = {
        'elseif': 4,
        'endfunction': 3,
        'endsub': 3,
        'endwhile': 3,
        'endfor': 3,
        'exitwhile': 4,
        'exitfor': 4
    };
    public static compositeKeywordKeys = Object.keys(Lexer.compositeKeywords);

    //all symbols except for single quote (because it is processed independently)
    public static symbols = {
        '+': TokenType.plusSymbol,
        '-': TokenType.minusSymbol,
        '*': TokenType.starSymbol,
        '/': TokenType.forwardSlashSymbol,
        '\\': TokenType.backSlashSymbol,
        '%': TokenType.percentSymbol,
        '^': TokenType.carotSymbol,
        '"': TokenType.doubleQuoteSymbol,
        '(': TokenType.openParenSymbol,
        ')': TokenType.closeParenSymbol,
        '[': TokenType.openSquareBraceSymbol,
        ']': TokenType.closeSquareBraceSymbol,
        '{': TokenType.openCurlyBraceSymbol,
        '}': TokenType.closeCurlyBraceSymbol,
        '.': TokenType.periodSymbol,
        ',': TokenType.commaSymbol,
        ';': TokenType.semicolonSymbol,
        '=': TokenType.equalSymbol,
        '<': TokenType.lessThanSymbol,
        '>': TokenType.greaterThanSymbol,
        ':': TokenType.colonSymbol
    };
    public static symbolKeys = Object.keys(Lexer.symbols);

    public static letterChars = [
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
    public static numberChars = [
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
    public static identifierFirstCharacterChars = [
        ...Lexer.letterChars,
        '_'
    ];
    public static identifierChars = [
        ...Lexer.identifierFirstCharacterChars,
        ...Lexer.numberChars,
    ];
    public static identifierTypeDesignators = [
        '$',
        '%',
        '!',
        '#'
    ];

    public static numericTypeDesignators = [
        '%',
        '!',
        '#'
    ];

    public static whitespaceChars = ['\s', '\t'];

}

export interface Token2 {
    /**
     * The type of this token
     */
    tokenType: TokenType;
    /**
     * The actual value of this token (i.e. what the token contains)
     */
    value: string;

    /**
     * The zero-based line index
     */
    line: number;

    /**
     * The zero-based column index
     */
    column: number;

    /**
     * The zero-based index of the start of this token, relative to the beginning of the entire string
     */
    offset: number;
}