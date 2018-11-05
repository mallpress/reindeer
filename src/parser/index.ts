import { Token } from "../token";
import { TokenType } from "../tokentype";
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
        while (stream.hasNext()) {
            let currentToken = stream.consume();
            switch (currentToken.type) {
                case TokenType.If:
                    let finished = false
                    let conds = []
                    let cond = this.parseConditional(stream)
                    conds.push(cond)
                    while (stream.hasNext()) {
                        currentToken = stream.consume();
                        switch(currentToken.type) {
                            case TokenType.Then:
                                let operations = this.parseOperations(stream)
                                let branch = new Branch(conds, operations);
                                console.log(JSON.stringify(branch, null, "\t"))
                                finished = true
                                break;
                            case TokenType.Or:
                                cond = this.parseConditional(stream)
                                conds.push(cond)
                                break;
                            case TokenType.And:
                                cond = this.parseConditional(stream)
                                conds.push(cond)
                                break;
                            default:
                                throw new ParserError(`could not parse conditional expected then, and or or, got ${currentToken.value}`, currentToken.position)
                        }
                        if(finished) break;
                    }
                    break;
            }
        }
    }

    private parseConditional(stream: TokenStream): Condition {
        let refType = ReferenceType.Pipe;
        let reference = "";
        let property = "";
        let operator = BooleanOperator.DoubleEquals
        let value = null;
        let currentToken = stream.consume()
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
        currentToken = stream.consume()
        switch (currentToken.type) {
            case TokenType.String:
                reference = currentToken.value
                break;
            default:
                throw new ParserError(`parse error, reference expected, found ${currentToken.value}`, currentToken.position)
        }

        currentToken = stream.consume()
        switch (currentToken.type) {
            case TokenType.Diameter:
                property = currentToken.value
                break;
            default:
                throw new ParserError(`parse error, property expected, found ${currentToken.value}`, currentToken.position)
        }
        currentToken = stream.consume();
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
        currentToken = stream.consume();
        switch (currentToken.type) {
            case TokenType.Number:
                value = currentToken.value
                break;
            default:
                throw new ParserError(`parse error, value expected, found ${currentToken.value}`, currentToken.position)
        }
        return new Condition(refType, reference, property, operator, value);
    }   

    private parseOperations(stream: TokenStream): Sequence {
        let seq = new Sequence()
        while (stream.hasNext()) {
            let op = this.parseOperation(stream)
            seq.nodes.push(op)
            if(!stream.hasNext()) break;
            let nextToken = stream.peek()
            if(nextToken.type !== TokenType.And) {
                break;
            }
            stream.consume();
        }
        return seq;
    }

    private parseOperation(stream: TokenStream): Operation {
        let decision = "";
        let outcome = "";
        let currentToken = stream.consume();
        if(currentToken.type !== TokenType.Decision) {
            throw new ParserError(`parse error, decision expected, found ${currentToken.value}`, currentToken.position)
        }

        currentToken = stream.consume();
        if(currentToken.type !== TokenType.String) {
            throw new ParserError(`parse error, decision name expected, found ${currentToken.value}`, currentToken.position)
        }
        decision = currentToken.value

        currentToken = stream.consume();
        if(currentToken.type !== TokenType.Equals) {
            throw new ParserError(`parse error, equals operator expected, found ${currentToken.value}`, currentToken.position)
        }

        currentToken = stream.consume();
        if(currentToken.type !== TokenType.String) {
            throw new ParserError(`parse error, outcome expected, found ${currentToken.value}`, currentToken.position)
        }

        outcome = currentToken.value        
        return new Operation(decision, outcome);
    }
}