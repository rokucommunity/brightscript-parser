"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BrightScriptLexer = /** @class */ (function () {
    function BrightScriptLexer() {
        this.tokenDefinitions = [];
        this.addTokenDefinitions();
    }
    BrightScriptLexer.prototype.addTokenDefinition = function (tokenType, regexp) {
        this.tokenDefinitions.push({ tokenType: tokenType, regexp: regexp });
    };
    /**
     * Add a symbol token definition with the standard regexp for symbols
     * @param symbol the symbol in a string
     * @param tokenType
     */
    BrightScriptLexer.prototype.addSymbolTokenDefinition = function (symbol, tokenType) {
        //escape the symbol if need be
        symbol = symbol.replace(/[.*+?^${}()|[\]\\]/gi, '\\$&'); // $& means the whole matched string
        var regexp = new RegExp("^(" + symbol + ")", 'i');
        this.addTokenDefinition(tokenType, regexp);
    };
    BrightScriptLexer.prototype.addKeywordTokenDefinition = function (keyword, tokenType) {
        var regexp = new RegExp("^(" + keyword + ")(?![a-z_0-9])", 'i');
        this.addTokenDefinition(tokenType, regexp);
    };
    BrightScriptLexer.prototype.addKeywordTokenDefinitions = function (tokenTypes) {
        for (var _i = 0, tokenTypes_1 = tokenTypes; _i < tokenTypes_1.length; _i++) {
            var tokenType = tokenTypes_1[_i];
            var keyword = tokenType;
            this.addKeywordTokenDefinition(keyword, tokenType);
        }
    };
    BrightScriptLexer.prototype.addTokenDefinitions = function () {
        //get comment literals (rem or quote followed by anything until newline or EOF
        this.addTokenDefinition(TokenType.quoteComment, /^('.*)(?=\r|\n|\r\n|\n\r|$)/i);
        this.addTokenDefinition(TokenType.remComment, /^(rem[ \t].*)(?=\r|\n|\r\n|\n\r|$)/i);
        //now add newlines
        this.addTokenDefinition(TokenType.newline, /^(\r\n|\n\r|\r|\n)/);
        //add composite keywords (like "end if" and "endiff")
        this.addTokenDefinition(TokenType.endFunction, /^(end\s*function)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.endIf, /^(end\s*if)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.endSub, /^(end\s*sub)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.endWhile, /^(end\s*while)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.exitWhile, /^(exit\s*while)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.exitFor, /^(exit\s*for)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.endFor, /^(end\s*for)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.elseIf, /^(else[ \t]*if)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.condElseIf, /^(#else[ \t]*if)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.condEndIf, /^(#end\s*if)(?![a-z_0-9])/i);
        //add whitespace first (because it's probably the most common)
        this.addTokenDefinition(TokenType.whitespace, /^([\t ]+)/);
        //now add keywords
        this.addKeywordTokenDefinitions(exports.BasicKeywordTokenTypes);
        //now add literal values
        this.addTokenDefinition(TokenType.booleanLiteral, /^(true|false)(?![a-z_0-9])/i);
        this.addTokenDefinition(TokenType.stringLiteral, /^("([^"]|"")*")/);
        this.addTokenDefinition(TokenType.numberLiteral, /^(\d)/);
        //now add all symbols
        for (var tokenType in exports.SymbolTokenTypeValues) {
            var symbol = exports.SymbolTokenTypeValues[tokenType];
            this.addSymbolTokenDefinition(symbol, tokenType);
        }
        //now add identifiers
        this.addTokenDefinition(TokenType.identifier, /^([a-z_]+[a-z0-9_]*)/i);
    };
    BrightScriptLexer.prototype.tokenize = function (text) {
        var tokens = [];
        var index = 0;
        while (text.length > 0) {
            var match = this.getMatch(text);
            if (match) {
                var value = match.value;
                var token = {
                    tokenType: match.tokenType,
                    value: value,
                    startIndex: index
                };
                var isKeywordTokenType = exports.KeywordTokenTypes.indexOf(match.tokenType) > -1;
                //if we found a keyword, determine if it's actually an identifier
                if (isKeywordTokenType && this.matchIsIdentifier(match, tokens)) {
                    token.tokenType = TokenType.identifier;
                }
                text = text.substring(token.value.length);
                index += token.value.length;
                tokens.push(token);
            }
            else {
                var value = text.substring(0, 1);
                text = text.substring(1);
                index++;
                var token = {
                    tokenType: TokenType.INVALID_TOKEN,
                    value: value,
                    startIndex: index
                };
                tokens.push(token);
            }
        }
        tokens.push({
            tokenType: TokenType.END_OF_FILE,
            value: '',
            startIndex: index
        });
        return tokens;
    };
    /**
     * Keywords will match before identifiers, so this will backtrack the captured
     * tokens to determine if this match is actually an identifier and not a keyword
     * @param match
     * @param tokens
     */
    BrightScriptLexer.prototype.matchIsIdentifier = function (match, tokens) {
        for (var i = tokens.length - 1; i >= 0; i--) {
            var token = tokens[i];
            //eat any whitespace characters
            if (token.tokenType === TokenType.whitespace) {
                continue;
            }
            if (token.tokenType === TokenType.periodSymbol) {
                return true;
            }
            else {
                return false;
            }
        }
    };
    BrightScriptLexer.prototype.getMatch = function (text) {
        for (var _i = 0, _a = this.tokenDefinitions; _i < _a.length; _i++) {
            var def = _a[_i];
            var match = def.regexp.exec(text);
            if (match) {
                return {
                    tokenType: def.tokenType,
                    value: match[0]
                };
            }
        }
        return undefined;
    };
    return BrightScriptLexer;
}());
exports.BrightScriptLexer = BrightScriptLexer;
var TokenType;
(function (TokenType) {
    //keywords
    TokenType["and"] = "and";
    TokenType["elseIf"] = "elseIf";
    TokenType["endFunction"] = "endFunction";
    TokenType["endSub"] = "endSub";
    TokenType["endWhile"] = "endWhile";
    TokenType["endFor"] = "endFor";
    TokenType["eval"] = "eval";
    TokenType["exitWhile"] = "exitWhile";
    TokenType["exitFor"] = "exitFor";
    TokenType["if"] = "if";
    TokenType["then"] = "then";
    TokenType["else"] = "else";
    TokenType["endIf"] = "endIf";
    TokenType["for"] = "for";
    TokenType["to"] = "to";
    TokenType["step"] = "step";
    TokenType["exit"] = "exit";
    TokenType["each"] = "each";
    TokenType["while"] = "while";
    TokenType["function"] = "function";
    TokenType["sub"] = "sub";
    TokenType["as"] = "as";
    TokenType["return"] = "return";
    TokenType["print"] = "print";
    TokenType["goto"] = "goto";
    TokenType["dim"] = "dim";
    TokenType["stop"] = "stop";
    TokenType["void"] = "void";
    TokenType["boolean"] = "boolean";
    TokenType["integer"] = "integer";
    TokenType["number"] = "number";
    TokenType["longInteger"] = "longInteger";
    TokenType["float"] = "float";
    TokenType["double"] = "double";
    TokenType["string"] = "string";
    TokenType["object"] = "object";
    TokenType["interface"] = "interface";
    TokenType["invalid"] = "invalid";
    TokenType["dynamic"] = "dynamic";
    TokenType["or"] = "or";
    TokenType["let"] = "let";
    TokenType["lineNum"] = "lineNum";
    TokenType["next"] = "next";
    TokenType["not"] = "not";
    TokenType["run"] = "run";
    TokenType["condIf"] = "condIf";
    TokenType["condElseIf"] = "condElseIf";
    TokenType["condEndIf"] = "condEndIf";
    //symbols 
    TokenType["additionAssignmentSymbol"] = "additionAssignmentSymbol";
    TokenType["subtractionAssignmentSymbol"] = "subtractionAssignmentSymbol";
    TokenType["multiplicationAssignmentSymbol"] = "multiplicationAssignmentSymbol";
    TokenType["divisionAssignmentSymbol"] = "divisionAssignmentSymbol";
    TokenType["integerDivisionAssignmentSymbol"] = "integerDivisionAssignmentSymbol";
    TokenType["lessThanLessThanEqualSymbol"] = "lessThanLessThanEqualSymbol";
    TokenType["greaterThanGreaterThanEqualSymbol"] = "greaterThanGreaterThanEqualSymbol";
    TokenType["plusPlusSymbol"] = "plusPlusSymbol";
    TokenType["minusMinusSymbol"] = "minusMinusSymbol";
    TokenType["asteriskSymbol"] = "asteriskSymbol";
    TokenType["forwardSlashSymbol"] = "forwardSlashSymbol";
    TokenType["backSlashSymbol"] = "backSlashSymbol";
    TokenType["modSymbol"] = "modSymbol";
    TokenType["plusSymbol"] = "plusSymbol";
    TokenType["minusSymbol"] = "minusSymbol";
    TokenType["carotSymbol"] = "carotSymbol";
    TokenType["doubleQuoteSymbol"] = "doubleQuoteSymbol";
    TokenType["openParenSymbol"] = "openParenSymbol";
    TokenType["closeParenSymbol"] = "closeParenSymbol";
    TokenType["openSquareBraceSymbol"] = "openSquareBraceSymbol";
    TokenType["closeSquareBraceSymbol"] = "closeSquareBraceSymbol";
    TokenType["openCurlyBraceSymbol"] = "openCurlyBraceSymbol";
    TokenType["closeCurlyBraceSymbol"] = "closeCurlyBraceSymbol";
    TokenType["periodSymbol"] = "periodSymbol";
    TokenType["commaSymbol"] = "commaSymbol";
    TokenType["semicolonSymbol"] = "semicolonSymbol";
    TokenType["percentSymbol"] = "percentSymbol";
    TokenType["equalSymbol"] = "equalSymbol";
    TokenType["lessThanSymbol"] = "lessThanSymbol";
    TokenType["greaterThanSymbol"] = "greaterThanSymbol";
    TokenType["colonSymbol"] = "colonSymbol";
    TokenType["condElse"] = "condElse";
    //literals
    TokenType["numberLiteral"] = "numberLiteral";
    TokenType["booleanLiteral"] = "booleanLiteral";
    TokenType["stringLiteral"] = "stringLiteral";
    //other
    TokenType["identifier"] = "identifier";
    TokenType["quoteComment"] = "quoteComment";
    TokenType["remComment"] = "remComment";
    TokenType["newline"] = "newline";
    TokenType["whitespace"] = "whitespace";
    //lexer specific
    TokenType["END_OF_FILE"] = "END_OF_FILE";
    TokenType["INVALID_TOKEN"] = "INVALID_TOKEN";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
/**
 * composite keywords (like "endif" and "endfor")
 */
exports.CompositeKeywordTokenTypes = [
    TokenType.endFunction,
    TokenType.endIf,
    TokenType.endSub,
    TokenType.endWhile,
    TokenType.exitWhile,
    TokenType.exitFor,
    TokenType.endFor,
    TokenType.elseIf,
    TokenType.condElseIf,
    TokenType.condEndIf
];
exports.BasicKeywordTokenTypes = [
    TokenType.and,
    TokenType.eval,
    TokenType.if,
    TokenType.then,
    TokenType.else,
    TokenType.for,
    TokenType.to,
    TokenType.step,
    TokenType.exit,
    TokenType.each,
    TokenType.while,
    TokenType.function,
    TokenType.sub,
    TokenType.as,
    TokenType.return,
    TokenType.print,
    TokenType.goto,
    TokenType.dim,
    TokenType.stop,
    TokenType.void,
    TokenType.number,
    TokenType.boolean,
    TokenType.integer,
    TokenType.longInteger,
    TokenType.float,
    TokenType.double,
    TokenType.string,
    TokenType.object,
    TokenType.interface,
    TokenType.invalid,
    TokenType.dynamic,
    TokenType.or,
    TokenType.let,
    TokenType.lineNum,
    TokenType.next,
    TokenType.not,
    TokenType.run,
    TokenType.condIf,
    TokenType.condElse
];
exports.KeywordTokenTypes = [];
Array.prototype.push.apply(exports.KeywordTokenTypes, exports.CompositeKeywordTokenTypes);
Array.prototype.push.apply(exports.KeywordTokenTypes, exports.BasicKeywordTokenTypes);
exports.SymbolTokenTypes = [
    TokenType.additionAssignmentSymbol,
    TokenType.subtractionAssignmentSymbol,
    TokenType.multiplicationAssignmentSymbol,
    TokenType.divisionAssignmentSymbol,
    TokenType.integerDivisionAssignmentSymbol,
    TokenType.lessThanLessThanEqualSymbol,
    TokenType.greaterThanGreaterThanEqualSymbol,
    TokenType.plusPlusSymbol,
    TokenType.minusMinusSymbol,
    TokenType.carotSymbol,
    TokenType.asteriskSymbol,
    TokenType.forwardSlashSymbol,
    TokenType.backSlashSymbol,
    TokenType.modSymbol,
    TokenType.plusSymbol,
    TokenType.minusSymbol,
    TokenType.doubleQuoteSymbol,
    TokenType.openParenSymbol,
    TokenType.closeParenSymbol,
    TokenType.openSquareBraceSymbol,
    TokenType.closeSquareBraceSymbol,
    TokenType.openCurlyBraceSymbol,
    TokenType.closeCurlyBraceSymbol,
    TokenType.periodSymbol,
    TokenType.commaSymbol,
    TokenType.semicolonSymbol,
    TokenType.percentSymbol,
    TokenType.equalSymbol,
    TokenType.lessThanSymbol,
    TokenType.greaterThanSymbol,
    TokenType.colonSymbol,
    TokenType.condIf,
    TokenType.condElse
];
exports.MiscelaneousTokenTypes = [
    TokenType.numberLiteral,
    TokenType.booleanLiteral,
    TokenType.stringLiteral,
    TokenType.identifier,
    TokenType.quoteComment,
    TokenType.remComment,
    TokenType.newline,
    TokenType.whitespace,
    TokenType.END_OF_FILE,
    TokenType.INVALID_TOKEN
];
exports.SymbolTokenTypeValues = {};
exports.SymbolTokenTypeValues[TokenType.plusPlusSymbol] = '++';
exports.SymbolTokenTypeValues[TokenType.minusMinusSymbol] = '--';
exports.SymbolTokenTypeValues[TokenType.additionAssignmentSymbol] = '+=';
exports.SymbolTokenTypeValues[TokenType.subtractionAssignmentSymbol] = '-=';
exports.SymbolTokenTypeValues[TokenType.multiplicationAssignmentSymbol] = '*=';
exports.SymbolTokenTypeValues[TokenType.divisionAssignmentSymbol] = '/=';
exports.SymbolTokenTypeValues[TokenType.integerDivisionAssignmentSymbol] = '\\=';
exports.SymbolTokenTypeValues[TokenType.lessThanLessThanEqualSymbol] = '<<=';
exports.SymbolTokenTypeValues[TokenType.greaterThanGreaterThanEqualSymbol] = '>>=';
exports.SymbolTokenTypeValues[TokenType.asteriskSymbol] = '*';
exports.SymbolTokenTypeValues[TokenType.forwardSlashSymbol] = '/';
exports.SymbolTokenTypeValues[TokenType.backSlashSymbol] = '\\';
exports.SymbolTokenTypeValues[TokenType.modSymbol] = 'MOD';
exports.SymbolTokenTypeValues[TokenType.plusSymbol] = '+';
exports.SymbolTokenTypeValues[TokenType.carotSymbol] = '^';
exports.SymbolTokenTypeValues[TokenType.doubleQuoteSymbol] = '"';
exports.SymbolTokenTypeValues[TokenType.openParenSymbol] = '(';
exports.SymbolTokenTypeValues[TokenType.closeParenSymbol] = ')';
exports.SymbolTokenTypeValues[TokenType.openSquareBraceSymbol] = '[';
exports.SymbolTokenTypeValues[TokenType.closeSquareBraceSymbol] = ']';
exports.SymbolTokenTypeValues[TokenType.openCurlyBraceSymbol] = '{';
exports.SymbolTokenTypeValues[TokenType.closeCurlyBraceSymbol] = '}';
exports.SymbolTokenTypeValues[TokenType.periodSymbol] = '.';
exports.SymbolTokenTypeValues[TokenType.commaSymbol] = ',';
exports.SymbolTokenTypeValues[TokenType.semicolonSymbol] = ';';
exports.SymbolTokenTypeValues[TokenType.minusSymbol] = '-';
exports.SymbolTokenTypeValues[TokenType.percentSymbol] = '%';
exports.SymbolTokenTypeValues[TokenType.equalSymbol] = '=';
exports.SymbolTokenTypeValues[TokenType.lessThanSymbol] = '<';
exports.SymbolTokenTypeValues[TokenType.greaterThanSymbol] = '>';
exports.SymbolTokenTypeValues[TokenType.colonSymbol] = ':';
exports.SymbolTokenTypeValues[TokenType.condIf] = '#if';
exports.SymbolTokenTypeValues[TokenType.condElse] = '#else';
