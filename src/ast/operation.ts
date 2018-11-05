import {Node} from "./node"
import { NodeType } from "./nodetype";

export class Operation extends Node {
    public decision: string
    public outcome: string
    constructor(decision: string, outcome: string) {
        super(NodeType.Operation)
        this.decision = decision
        this.outcome = outcome
    }
}