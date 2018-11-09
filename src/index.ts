import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser/index";


let tokenizer = new Tokenizer();


let tokens = tokenizer.tokenize("if (Decision \"A\" Outcome is equal to \"Leave As Is\" OR Pipe 'PipeA' Diameter is greater than or equal to -1.001) and pipe \"PipeB\" Diameter is less than 100 then decision \"a\" outcome is \"b\" and decision \"d\" outcome is \"c\"");
console.log(JSON.stringify(tokens))
let parser = new Parser();
let res = parser.parse(tokens);
