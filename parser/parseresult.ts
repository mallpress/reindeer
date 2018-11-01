import {Node} from "../ast/node";

export class ParseResult<T extends Node> {
    public node: T
    public consumed: number
    constructor(node: T, consumed: number) {
        this.node = node
        this.consumed = consumed
    }
}