import { Token } from "./token";

export class TokenStream {
    private tokens: Token[]
    private position: number = 0
    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    public peek() : Token {
        return this.tokens[this.position + 1]
    }

    public consume() : void {
        this.position++;
    }

    public hasNext() : boolean {
        return this.position < this.tokens.length
    }
}