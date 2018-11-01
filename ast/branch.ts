import {Node} from "./node";
import { Sequence } from "./sequence";
import { NodeType } from "./nodetype";
import { Condition } from "./condition";

export class Branch extends Node {
    public conditions: Condition[];
    public condTrueBody: Sequence;
    public condFalseBody?: Sequence;

    public constructor(conditions: Condition[], condTrueBody: Sequence, condFalseBody?: Sequence) {
        super(NodeType.Branch)
        this.conditions = conditions
        this.condTrueBody = condTrueBody
        this.condFalseBody = condFalseBody
    }
}