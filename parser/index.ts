import { Token } from "../token";
import { TokenType } from "../tokentype";
import { ParseResult } from "./parseresult";
import { ReferenceType } from "../ast/referencetype";
import { BooleanOperator } from "../ast/booleanoperator";
import { Condition } from "../ast/condition";
import { Sequence } from "../ast/sequence";
import { Operation } from "../ast/operation";
import { ParserError } from "./parsererror";
import { Branch } from "../ast/branch";
import { TokenStream } from "../tokenstream";

export class Parser {
    constructor() {

    }

    public parse(tokens: Token[]) {
        var stream = new TokenStream(tokens);

        let currentPos = 0;
        while (currentPos < tokens.length) {
            let currentToken = tokens[currentPos];
            switch (currentToken.type) {
                case TokenType.If:
                    let finished = false
                    let conds = []
                    while (currentPos < tokens.length) {
                        currentPos++;
                        let cond = this.parseConditional(tokens, currentPos)
                        conds.push(cond.node)
                        currentPos+= cond.consumed
                        currentToken = tokens[currentPos];
                        switch(currentToken.type) {
                            case TokenType.Then:
                                currentPos++;
                                let operations = this.parseOperations(tokens, currentPos)
                                currentPos+= operations.consumed
                                let branch = new Branch(conds, operations.node);
                                console.log(JSON.stringify(branch, null, "\t"))



                                finished = true
                                break;
                            case TokenType.Or:
                                currentPos++;
                                cond = this.parseConditional(tokens, currentPos)
                                conds.push(cond.node)
                                currentPos+= cond.consumed
                                currentToken = tokens[currentPos];
                                break;
                            case TokenType.And:
                                currentPos++;
                                cond = this.parseConditional(tokens, currentPos)
                                conds.push(cond.node)
                                currentPos+= cond.consumed
                                currentToken = tokens[currentPos];
                                break;
                        }
                        if(finished) break;
                    }
                    break;
            }
        }
    }

    private parseConditional(tokens: Token[], currentPos: number): ParseResult<Condition> {
        let refType = ReferenceType.Pipe;
        let reference = "";
        let property = "";
        let operator = BooleanOperator.DoubleEquals
        let value = null;
        let consumed = 0;
        let currentToken = tokens[currentPos]
        switch (currentToken.type) {
            case TokenType.Pipe:
                refType = ReferenceType.Pipe
                break;
            case TokenType.Junction:
                refType = ReferenceType.Junction
                break;
            default:
                throw new ParserError(`parse error, reference type expected, found ${currentToken.value}`, currentToken.position)
        }
        consumed++;
        currentToken = tokens[currentPos + consumed]
        switch (currentToken.type) {
            case TokenType.String:
                reference = currentToken.value
                break;
            default:
                throw new ParserError(`parse error, reference expected, found ${currentToken.value}`, currentToken.position)
        }

        consumed++;
        currentToken = tokens[currentPos + consumed]
        switch (currentToken.type) {
            case TokenType.Diameter:
                property = currentToken.value
                break;
            default:
                throw new ParserError(`parse error, property expected, found ${currentToken.value}`, currentToken.position)
        }

        consumed++;
        currentToken = tokens[currentPos + consumed]
        switch (currentToken.type) {
            case TokenType.DoubleEquals:
                operator = BooleanOperator.DoubleEquals
                break;
            case TokenType.LessThan:
                operator = BooleanOperator.LessThan
                break;
            case TokenType.GreaterThan:
                operator = BooleanOperator.GreaterThan
                break;
            case TokenType.LessThanEqual:
                operator = BooleanOperator.LessThanEqual
                break;
            case TokenType.GreaterThanEqual:
                operator = BooleanOperator.GreaterThanEqual
                break;
            case TokenType.NotEquals:
                operator = BooleanOperator.NotEquals
                break;
            default:
                throw new ParserError(`parse error, bool operator expected, found ${currentToken.value}`, currentToken.position)
        }
        
        consumed++;
        currentToken = tokens[currentPos + consumed]
        switch (currentToken.type) {
            case TokenType.Number:
                value = currentToken.value
                break;
            default:
                throw new ParserError(`parse error, value expected, found ${currentToken.value}`, currentToken.position)
        }

        consumed++;

        return new ParseResult(new Condition(refType, reference, property, operator, value), consumed);
    }   

    private parseOperations(tokens: Token[], currentPos: number): ParseResult<Sequence> {
        let consumed = 0;
        let seq = new Sequence()
        while (currentPos + consumed < tokens.length) {
            let op = this.parseOperation(tokens, currentPos + consumed)
            consumed += op.consumed
            seq.nodes.push(op.node)
            let nextToken = tokens[currentPos + consumed + 1]
            if(nextToken && nextToken.type !== TokenType.And) {
                break;
            }
            consumed++ 
        }
        return new ParseResult(seq, consumed);
    }

    private parseOperation(tokens: Token[], currentPos: number): ParseResult<Operation> {
        let decision = "";
        let outcome = "";
        let currentToken = tokens[currentPos];
        if(currentToken.type !== TokenType.Decision) {
            throw new ParserError(`parse error, decision expected, found ${currentToken.value}`, currentToken.position)
        }

        currentPos++
        currentToken = tokens[currentPos];
        if(currentToken.type !== TokenType.String) {
            throw new ParserError(`parse error, decision name expected, found ${currentToken.value}`, currentToken.position)
        }
        decision = currentToken.value

        currentPos++
        currentToken = tokens[currentPos];
        if(currentToken.type !== TokenType.Equals) {
            throw new ParserError(`parse error, equals operator expected, found ${currentToken.value}`, currentToken.position)
        }

        currentPos++
        currentToken = tokens[currentPos];
        if(currentToken.type !== TokenType.String) {
            throw new ParserError(`parse error, outcome expected, found ${currentToken.value}`, currentToken.position)
        }

        outcome = currentToken.value
        currentPos++
        
        return new ParseResult(new Operation(decision, outcome), 4);
    }
}