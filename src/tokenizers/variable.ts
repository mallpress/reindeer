import { Token } from "../token";
import { TokenResult } from "../tokenresult";
import { TokenType } from "../tokentype";
import { BaseTokenizer } from "./base";

export class VariableTokenizer extends BaseTokenizer {
    private static validStarts: RegExp = /[a-z]/i
    private static validName: RegExp = /[0-9a-z]/i

    constructor() {
        super(TokenType.Number, "Variable")
    }

    public nextToken(input: string, current: number): TokenResult | null {
        let firstChar = input[current];

        if(!VariableTokenizer.validStarts.test(firstChar)) return null;

        let tempPos = current;
        let currentValue = "";
       
        while(tempPos < input.length) {
            let char = input[tempPos]
            if(VariableTokenizer.validName.test(char)) {
                currentValue += char
            } else if(!VariableTokenizer.validName.test(char)) {
                return new TokenResult(length, new Token(TokenType.Number, currentValue, current))
            }
            tempPos++;
        }        
        return null
    }
}