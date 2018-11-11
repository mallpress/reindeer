/// <reference path="../../node_modules/@types/jest/index.d.ts"

import { Tokenizer } from "../tokenizer";
import { Parser } from "../parser";
import { Branch } from "../ast/branch";

describe("Simple parser tests", () => {
    let tokenizer = new Tokenizer();
    let parser = new Parser();

    let condA = "Decision 'A' Outcome is equal to 'Leave As Is'"
    let condARes = {"nodeType": "Condition","refType": 2,"reference": "A","property": "outcome","operator": 0,"value": "Leave As Is"};
    let condB = "Pipe 'B' Diameter is greater than or equal to -1.001"
    let condBRes = {"nodeType": "Condition","refType": 0,"reference": "B","property": "diameter","operator": 3,"value": -1.001};
    let condC = "Decision 'C' Outcome is equal to 'Leave As Is'"
    let condCRes = {"nodeType": "Condition","refType": 2,"reference": "C","property": "outcome","operator": 0,"value": "Leave As Is"};
    let condD = "Pipe 'D' Diameter is greater than or equal to -1.001"
    let condDRes = {"nodeType": "Condition","refType": 0,"reference": "D","property": "diameter","operator": 3,"value": -1.001};

    it("IF A THEN B", () => {
        let text = `IF ${condA} THEN DECISION 'A' outcome is 'B'`
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");
        expect(branch.condition).toEqual(condARes)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
    
    it("IF A THEN B AND C", () => {
        let text = `IF ${condA} THEN DECISION 'A' outcome is 'B' AND DECISION 'B' outcome is 'B'`
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");
        expect(branch.condition).toEqual(condARes)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}, {"decision": "B", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
    
    it("IF A OR B THEN C", () => {
        let text = `IF ${condA} OR ${condB} THEN DECISION 'A' outcome is 'B'`
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");

        let expectedCondition = {
            "nodeType": "ConditionGroup",
            "left": condARes,
            "operator": "OR",
            "right": condBRes
        }

        expect(branch.condition).toEqual(expectedCondition)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
    
    it("IF (A OR B) THEN C", () => {
        let text = `IF (${condA} OR ${condB}) THEN DECISION 'A' outcome is 'B'`
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
        let text = `IF ${condA} OR ${condB} AND Decision 'C' Outcome is equal to 'Leave As Is' THEN DECISION 'A' outcome is 'B'`
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
        let text = `IF (${condA} OR ${condB}) AND Decision 'C' Outcome is equal to 'Leave As Is' THEN DECISION 'A' outcome is 'B'`
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
    
    it("IF (A OR B) AND (C AND D) AND C THEN C", () => {
        let text = `IF (${condA} OR ${condB}) AND (${condC} AND ${condD}) THEN DECISION 'A' outcome is 'B'`
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");

        let expectedCondition = {
            "nodeType": "ConditionGroup",
            "left": {
                "nodeType": "ConditionGroup",
                "left": condARes,
                "operator": "OR",
                "right": condBRes
            },
            "operator": "AND",
            "right": {
                "nodeType": "ConditionGroup",
                "left": condCRes,
                "operator": "AND",
                "right": condDRes
            }
        }

        expect(branch.condition).toEqual(expectedCondition)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
    
    
    it("IF ((A OR B) AND C) AND D THEN C", () => {
        let text = `IF ((${condA} OR ${condB}) AND ${condC}) AND ${condD} THEN DECISION 'A' outcome is 'B'`
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        expect(typeof ast).toBe("object");
        let branch = ast as Branch;
        expect(branch.nodeType).toBe("Branch");

        let expectedCondition = {
            "nodeType": "ConditionGroup",
            "left": {
                "nodeType": "ConditionGroup",
                "left": {
                    "nodeType": "ConditionGroup",
                    "left": condARes,
                    "operator": "OR",
                    "right": condBRes
                },
                "operator": "AND",
                "right": condCRes
            },
            "operator": "AND",
            "right": condDRes
        }

        expect(branch.condition).toEqual(expectedCondition)
        expect(branch.condTrueBody).toEqual({"nodeType": "Sequence", "nodes": [{"decision": "A", "nodeType": "Operation", "outcome": "B"}]})
        expect(branch.condFalseBody).toBeUndefined()
    })
})