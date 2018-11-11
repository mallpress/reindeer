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
import { Node } from "../ast/node";
import { BinaryOperator } from "../ast/enums/binaryoperator";
import { ConditionGroup } from "../ast/conditiongroup";
import { NodeType } from "../ast/nodetype";

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
                    let conds = this.parseConditionals(stream)
                    while (stream.hasNext()) {
                        currentToken = stream.consume();
                        switch(currentToken.type) {
                            case TokenType.Then:
                                let operations = this.parseOperations(stream)
                                return new Branch(conds, operations);
                                //console.log(JSON.stringify(branch, null, "\t"))
                                finished = true
                                break;

                            default:
                                throw new ParserError(`could not parse conditional expected then, got ${currentToken.value}`, currentToken.position)
                        }
                        if(finished) break;
                    }
                    break;
            }
        }
    }

    private parseConditionals(stream: TokenStream, parenOpen: number = 0): Node {
        let prevNode: Node | null = null
        let finished = false
        let prevInGroup = false;
        while(stream.hasNext() && !finished) {
            let currentToken = stream.peek();
            switch(currentToken.type) {
                case TokenType.Or:
                case TokenType.And:
                case TokenType.Not:
                    stream.consume()
                    let operator = BinaryOperator.And;
                    switch(currentToken.type) {
                        case TokenType.Or:
                            operator = BinaryOperator.Or;
                            break;
                        case TokenType.And:
                            operator = BinaryOperator.And;
                            break;
                        case TokenType.Not:
                            operator = BinaryOperator.Not;
                            break;
                    }
                    if(!prevNode) throw new ParserError(`${currentToken.value} found, with nothing preceeding`, currentToken.position)
                    let newGroup = new ConditionGroup(prevNode)
                    newGroup.operator = operator
                    let nextToken = stream.peek()
                    if(!nextToken) throw new ParserError(`${currentToken.value} found, with nothing after it`, currentToken.position)

                    if(nextToken.type === TokenType.ParenOpen) {
                        newGroup.right = this.parseConditionals(stream, parenOpen);
                    } else {
                        let newCond = this.parseConditional(stream)
                        // need to handle the case of A || B && C, so we steal B
                        // from the previous group and create a new group with B as left and set
                        // the previous group's right to the new group this gives up A || (B && C)
                        // this should only be done if the previous expression was not
                        // in brackets, as that should be treated as fixeds
                        if(currentToken.type === TokenType.And && !prevInGroup) {
                            if(prevNode.nodeType == NodeType.ConditionGroup) {
                                let prevGroup = prevNode as ConditionGroup;
                                let newLeft = prevGroup.right as Node;
                                newGroup = new ConditionGroup(newLeft)
                                newGroup.operator = operator
                                newGroup.right = newCond
                                prevGroup.right = newGroup
                                newGroup = prevGroup
                            } else {
                                // if it was just a condition we can continue on as planned
                                newGroup.right = newCond
                            }
                        } else {
                            // if it was an or, then we can continue on as planned
                            newGroup.right = newCond
                        }
                    }
                    prevNode = newGroup as Node
                    break;
                case TokenType.ParenOpen:
                    parenOpen++;
                    stream.consume()
                    prevNode = this.parseConditionals(stream, parenOpen);
                    prevInGroup = true;
                    break;
                case TokenType.ParenClose:
                    parenOpen--;
                    stream.consume()
                    finished = true
                    if(parenOpen < 0) throw new ParserError("mismattched parentheses, unexpected ')'", currentToken.position)
                    break;
                case TokenType.Then:
                    finished = true;
                    break;
                default:
                    prevNode = this.parseConditional(stream)
                    prevInGroup = false
                    break;
            }
        }
        return prevNode!
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
            case TokenType.Decision:
                refType = ReferenceType.Decision
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
            case TokenType.Outcome:
                property = currentToken.value;
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
            case TokenType.String:
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
        if(currentToken.type !== TokenType.Outcome) {
            throw new ParserError(`parse error, outcome operator expected, found ${currentToken.value}`, currentToken.position)
        }

        currentToken = stream.consume();
        if(currentToken.type !== TokenType.Is) {
            throw new ParserError(`parse error, is operator expected, found ${currentToken.value}`, currentToken.position)
        }

        currentToken = stream.consume();
        if(currentToken.type !== TokenType.String) {
            throw new ParserError(`parse error, outcome expected, found ${currentToken.value}`, currentToken.position)
        }

        outcome = currentToken.value        
        return new Operation(decision, outcome);
    }
}