import { PatternTokenizer } from "./tokenizers/pattern";
import { TokenType } from "./tokentype";
import { Token } from "./token";
import { BaseTokenizer } from "./tokenizers/base";
import { StringTokenizer } from "./tokenizers/string";
import { SymbolTokenizer } from "./tokenizers/symbol";
import { WordTokenizer } from "./tokenizers/word";

export class Tokenizer {
    private tokenizers: BaseTokenizer[]

    constructor() {
        this.tokenizers = [
            new PatternTokenizer(TokenType.WhiteSpace, "White Space", /\s/, true),
            new PatternTokenizer(TokenType.ParenOpen, "Paren Open", /\(/),
            new PatternTokenizer(TokenType.ParenClose, "Paren Close", /\)/),
            new PatternTokenizer(TokenType.ParenClose, "Brace Open", /\{/),
            new PatternTokenizer(TokenType.ParenClose, "Brace Close", /\}/),
            new PatternTokenizer(TokenType.Number, "Number", /[0-9]/),
            new StringTokenizer(),
            new SymbolTokenizer(TokenType.Not, "!"),
            new SymbolTokenizer(TokenType.DoubleEquals, "=="),
            new SymbolTokenizer(TokenType.Equals, "="),
            new SymbolTokenizer(TokenType.NotEquals, "!="),
            new SymbolTokenizer(TokenType.LessThan, "<"),
            new SymbolTokenizer(TokenType.GreaterThan, ">"),
            new SymbolTokenizer(TokenType.GreaterThanEqual, ">="),
            new SymbolTokenizer(TokenType.LessThanEqual, "<="),
            new SymbolTokenizer(TokenType.Dot, "."),
            new SymbolTokenizer(TokenType.And, "&&"),
            new WordTokenizer(TokenType.And, "and"),
            new SymbolTokenizer(TokenType.Or, "||"),
            new WordTokenizer(TokenType.Or, "or"),
            new WordTokenizer(TokenType.If, "if"),
            new WordTokenizer(TokenType.Then, "then"),
            new WordTokenizer(TokenType.Else, "else"),
            new WordTokenizer(TokenType.True, "true"),
            new WordTokenizer(TokenType.False, "false"),
            new WordTokenizer(TokenType.Pipe, "pipe"),
            new WordTokenizer(TokenType.Junction, "junction"),
            new WordTokenizer(TokenType.Diameter, "diameter"),
            new WordTokenizer(TokenType.Decision, "decision"),
            new PatternTokenizer(TokenType.Text, "Text", /[a-z]i/),
        ];
    }

    public tokenize(input: string): Token[] {
        let toReturn = new Array<Token>()
        let currentPos = 0;
        while (currentPos < input.length) {
            let tokenized = false;
            this.tokenizers.forEach(tk => {
              if (tokenized) {return;}
              let res = tk.nextToken(input, currentPos);
              if(res) {
                tokenized = true;
                currentPos += res.consumedChar;
                if(!res.skip) toReturn.push(res.token)
              }
            });
            if (!tokenized) {
              throw new TypeError('I dont know what this character is: ' + input[currentPos]);
            }
          }

        return toReturn
    }
}