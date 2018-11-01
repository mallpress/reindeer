import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";

let tokenizer = new Tokenizer();


let tokens = tokenizer.tokenize("if Pipe \"PipeA\" Diameter >= 1 then decision \"a\" = \"b\" and decision \"d\" = \"c\"");
console.log(JSON.stringify(tokens))
let parser = new Parser();
let res = parser.parse(tokens);
