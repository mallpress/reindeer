import {Node} from "./node";
import { ReferenceType } from "./referencetype";
import { BooleanOperator } from "./booleanoperator";
import { NodeType } from "./nodetype";

export class Condition extends Node {
    public refType: ReferenceType
    public reference: string
    public property: string
    public operator: BooleanOperator
    public value: any
    constructor(refType: ReferenceType, reference: string, property: string, operator: BooleanOperator, value: any) {
        super(NodeType.Condition)
        this.refType = refType
        this.reference = reference
        this.property = property
        this.operator = operator
        this.value = value
    }
}