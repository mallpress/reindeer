/// <reference path="../../node_modules/@types/jest/index.d.ts"

import { Tokenizer } from "../tokenizer";
import { Parser } from "../parser";
import { Branch } from "../ast/branch";

describe("Simple parser tests", () => {
    let tokenizer = new Tokenizer();
    let parser = new Parser();
    it("IF A THEN B", () => {
        let text = "IF Decision 'A' Outcome is equal to 'Leave As Is' THEN DECISION 'A' outcome is 'B'"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");
        expect(branch.condition).toEqual({"nodeType": "Condition","refType": 2,"reference": "A","property": "outcome","operator": 0,"value": "Leave As Is"})
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
    
    it("IF A OR B THEN C", () => {
        let text = "IF Decision 'A' Outcome is equal to 'Leave As Is' OR Pipe 'B' Diameter is greater than or equal to -1.001 THEN DECISION 'A' outcome is 'B'"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");

        let expectedCondition = {
            "nodeType": "ConditionGroup",
            "left": {"nodeType": "Condition","refType": 2,"reference": "A","property": "outcome","operator": 0,"value": "Leave As Is"},
            "operator": "OR",
            "right": {"nodeType": "Condition","refType": 0,"reference": "B","property": "diameter","operator": 3,"value": -1.001}
        }

        expect(branch.condition).toEqual(expectedCondition)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
    
    it("IF (A OR B) THEN C", () => {
        let text = "IF (Decision 'A' Outcome is equal to 'Leave As Is' OR Pipe 'B' Diameter is greater than or equal to -1.001) THEN DECISION 'A' outcome is 'B'"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");

        let expectedCondition = {
            "nodeType": "ConditionGroup",
            "left": {"nodeType": "Condition","refType": 2,"reference": "A","property": "outcome","operator": 0,"value": "Leave As Is"},
            "operator": "OR",
            "right": {"nodeType": "Condition","refType": 0,"reference": "B","property": "diameter","operator": 3,"value": -1.001}
        }

        expect(branch.condition).toEqual(expectedCondition)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
        
    it("IF A OR B AND C THEN C", () => {
        let text = "IF Decision 'A' Outcome is equal to 'Leave As Is' OR Pipe 'B' Diameter is greater than or equal to -1.001 AND Decision 'C' Outcome is equal to 'Leave As Is' THEN DECISION 'A' outcome is 'B'"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");

        let expectedCondition = {
            "nodeType": "ConditionGroup",
            "left": {"nodeType": "Condition","refType": 2,"reference": "A","property": "outcome","operator": 0,"value": "Leave As Is"},
            "operator": "OR",
            "right": {
                "nodeType": "ConditionGroup",
                "left": {"nodeType": "Condition","refType": 0,"reference": "B","property": "diameter","operator": 3,"value": -1.001},
                "operator": "AND",
                "right": {"nodeType": "Condition","refType": 2,"reference": "C","property": "outcome","operator": 0,"value": "Leave As Is"}
            }
        }

        expect(branch.condition).toEqual(expectedCondition)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
        
    it("IF (A OR B) AND C THEN C", () => {
        let text = "IF (Decision 'A' Outcome is equal to 'Leave As Is' OR Pipe 'B' Diameter is greater than or equal to -1.001) AND Decision 'C' Outcome is equal to 'Leave As Is' THEN DECISION 'A' outcome is 'B'"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");

        let expectedCondition = {
            "nodeType": "ConditionGroup",
            "left": {
                "nodeType": "ConditionGroup",
                "left": {"nodeType": "Condition","refType": 2,"reference": "A","property": "outcome","operator": 0,"value": "Leave As Is"},
                "operator": "OR",
                "right": {"nodeType": "Condition","refType": 0,"reference": "B","property": "diameter","operator": 3,"value": -1.001}
            },
            "operator": "AND",
            "right": {"nodeType": "Condition","refType": 2,"reference": "C","property": "outcome","operator": 0,"value": "Leave As Is"}
        }

        expect(branch.condition).toEqual(expectedCondition)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
})