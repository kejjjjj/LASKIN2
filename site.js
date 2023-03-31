const OperatorPriority = Object.freeze({
    FAILURE: 0,
    ASSIGNMENT: 1,
    CONDITIONAL: 2,
    LOGICAL_OR:3,    
    LOGICAL_AND :4 ,
    BITWISE_OR :5,
    BITWISE_AND :6,
    EQUALITY : 7,
    RELATIONAL : 8,
    SHIFT : 9,
    ADDITIVE : 10,
    MULTIPLICATIVE : 11,
    UNARY: 12
});
let use_degrees = true;
let decimal_precision = 1;
class FuncClass
{
    constructor(fnc, requires_angle){
        this.name = fnc.name;
        this.fnc = fnc;
        this.num_args = fnc.length;
        this.requires_angle = requires_angle;
    };
    call(...args){
        // if(args.length != this.num_args)
        //     throw `expected ${this.num_args} args instead of ${args.length}`;
        for(let i = 0; i < args.length; i++){
            console.log(`type: ${typeof(args[i])}`);
            console.log(args);
            if(this.requires_angle && use_degrees){
                console.log(`before: ${args[i]}`);
                args[i] *=  Math.PI / 180;
                console.log(`after: ${args[i]}`);
            }
        }

        console.log(`${this.name}(${args})`);
        return (this.fnc(...args) * (this.requires_angle && use_degrees ? 180 / Math.PI : 1));
    }
}
const Functions = new Map([
    ['tan',     new FuncClass  (Math.tan,   true )],
    ['atan',    new FuncClass  (Math.atan,  true )],
    ['sin',     new FuncClass  (Math.sin,   true )],
    ['asin',    new FuncClass  (Math.asin,  true )],
    ['cos',     new FuncClass  (Math.cos,   true )],
    ['acos',    new FuncClass  (Math.acos,  true )],
    ['atan2',   new FuncClass  (Math.atan2, true )],
    ['sqrt',    new FuncClass  (Math.sqrt,  false)],
    ['pow',     new FuncClass  (Math.pow,   false)],
    ['abs',     new FuncClass  (Math.abs,   false)],
    ['ceil',    new FuncClass  (Math.ceil,  false)],
    ['floor',   new FuncClass  (Math.floor, false)],
    ['round',   new FuncClass  (Math.round, false)],
    ['min',     new FuncClass  (Math.min,   false)],
    ['max',     new FuncClass  (Math.max,   false)],
    ['random',  new FuncClass  (Math.random,false)]
])

let expecting_expression = true;
let expecting_opening_parenthesis = 0;
let expecting_function_arguments = 0;
let unary_allowed = true;
function GetOperandPriority(ops)
{
    if(typeof(ops) != "string")
        throw `GetOperandPriority(): passed type ${typeof(ops)} instead of string`;
    
    if(ops.length == 1){
        const op = ops[0];

        if (op == '|') // Bitwise OR	
            return OperatorPriority.BITWISE_OR;

        else if (op == '^') //Bitwise XOR	
            return OperatorPriority.BITWISE_XOR;

        else if (op == '&') //Bitwise AND	
            return OperatorPriority.BITWISE_AND;

        else if (op == '>' || op == '<') //Relational
            return OperatorPriority.RELATIONAL;

        else if (op == '+' || op == '-')
            return OperatorPriority.ADDITIVE;

        else if (op == '*' || op == '/' || op == '%')
            return OperatorPriority.MULTIPLICATIVE;
    }

    if (ops == "==" || ops == "!=")
        return OperatorPriority.EQUALITY;

    else if (ops == "<=" || ops == ">=")
        return OperatorPriority.RELATIONAL;

    else if (ops == "<<" || ops == ">>")
        return OperatorPriority.SHIFT;

    else if (ops == "&&")
        return OperatorPriority.LOGICAL_AND;

    else if (ops == "||")
        return OperatorPriority.LOGICAL_OR;

    return OperatorPriority.FAILURE;
}
function StrEval(loperand, operator, roperand)
{
    let lvalue = 0;
    let rvalue = 0;

    if(isNumber(loperand)){
        lvalue = parseFloat(loperand);
    }if(isNumber(roperand)){
        rvalue = parseFloat(roperand);
    }

    if (operator.length < 2) {
        const op = operator[0];
        switch (op) {
            case '+':
                return String(lvalue + rvalue);
            case '-':
                return String(lvalue - rvalue);
            case '*':
                return String(lvalue * rvalue);
            case '/':
                return String(lvalue / rvalue);
        }
    }
    return "0";
}
function isNumber(input) {
    const parsed = parseFloat(input);
    return !isNaN(parsed) && isFinite(parsed) && String(parsed).length == input.length;
}
function isOperator(o)
{
    return (o == '+' || o == '-' || o == '/' || o =='*');
}
function isAlpha(character) {
    return /^[a-zA-Z]+$/.test(character);
}
function isAlphanumeric(character) {
    return /^[a-z0-9]+$/i.test(character);
}
function StringWithinParantheses(str)
{
    if(typeof(str) != "string")
        throw (`StringWithinParantheses(): passed type ${typeof(str)} instead of string`);

    let obj = new Object({count_closing: 0, 
        count_opening: 0, 
        opening: 0,
        strlength: 0, 
        result_string: "",});
    
    let closing = 0;
    for(let i = 0; i < str.length; i++){
        switch(str[i]){
            case '(':
                obj.count_opening = 1;
                obj.opening = i;
                break;
            case ')':
                obj.count_closing = 1;
                closing = i;
                break;

            default:
                break;
        }
        if (obj.count_opening > 0 && obj.count_opening == obj.count_closing) {
            break;
        }

    }
    if (obj.count_opening != obj.count_closing) {
		throw (`no matching pair for '${obj.count_opening > obj.count_closing ? '(' : ')'}'`);
	}
    obj.strlength = closing - obj.opening - obj.count_opening;
    obj.result_string = str.substr(obj.opening + 1, obj.strlength);
    if(obj.count_opening && obj.count_closing && !obj.result_string)
        obj.result_string = String("empty");
    return obj;
}
function EvaluateExpression_Init()
{

     expecting_expression = true;
    expecting_opening_parenthesis = 0;
    expecting_function_arguments = 0;
    unary_allowed = true;
    let elem = document.getElementById("expression_");
    let output = document.getElementById("output_val");
    output.innerHTML = "";

    let expression = elem.value.replace(/\s/g, ''); //remove whitespaces

    try{
        result = EvaluateExpressionParts(expression);
    }
    catch(exception)
    {
        console.log("exception caught!");
        let output = document.getElementById("output_val");
        output.innerHTML += (exception);
        return false, console.log(exception);
    }
    // if(typeof(result) == "string"){
    //     let output = document.getElementById("output_val");
    //     output.innerHTML += (result);
    //     return false, console.log(result);
    // }
    //output.innerHTML += expression;
    //console.log(tokens);
}
function eraseString(str, start, count) {
    return (str.substr(0, start) + str.substr(start + count));
}
function insertString(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
} 
function inverseString(str) {
    let inversedStr = "";
    
    for(let i = str.length -1; i >= 0; i--) {
      inversedStr += str[i];
    }
    
    return inversedStr;
  }
  function getSubstringDecimal(arg) {
    numberString = String(arg);
    const decimalIndex = numberString.indexOf(".");
    if(decimalIndex !== -1) {
      return numberString.substr(0, decimalIndex + 1 + decimal_precision);
    }
    return numberString;
  }
//pass the whole expression including the parentheses
function EvaluateExpressionParts(expression) //recursive
{
    if(typeof(expression) != "string"){
        throw `EvaluateExpressionParts(): passed type ${typeof(expression)} instead of string`;
        //return "invalid", alert(`EvaluateExpressionParts(): passed type ${typeof(expression)} instead of string`);

    }
    
    console.log(`EvaluateExpressionParts: "${expression}"`);


    let par = StringWithinParantheses(expression);
    if(par == undefined){
        console.log(`EvaluateExpressionParts: par == undefined`);
        throw `EvaluateExpressionParts: par == undefined`;
    }

    if(par.result_string.length){
        console.log(`parenthesis ${par.result_string}`);
        if(par.result_string == "empty")
            par.result_string = "";
        let isfunccall = ((expr, itr) => {
            if(itr < 0)
                return undefined;

            let ch = expr[itr];
            let token = String();
            while(isAlphanumeric(ch)){

                if(itr == 0){
                    token += ch;
                    break;
                }
                token += ch;
                ch = expr[--itr];
            }
            token = inverseString(token);
            console.log(`testing if ${token} is a function`);
            let valid = Functions.get(token);
            
            if(!valid && token.length){
                return String(`Syntax error: unknown function "${token}"`);
               // return String(`Syntax error: unknown function "${token}"`)
            }
            return valid;
            
        })(expression, par.opening-1); //IsFunctionCall

        if(typeof(isfunccall) == "string"){
            throw isfunccall;
        }
        if(isfunccall != undefined){
            let result = EvaluateFunctionExpression(isfunccall, par);
            let v_length = isfunccall.name.length; 
            expression = eraseString(expression, par.opening - v_length, par.strlength + 2 + v_length);
            expression = insertString(expression, par.opening - v_length, result);
            let output = document.getElementById("output_val");
            output.innerHTML += `${isfunccall.name}(${par.result_string}) = ${getSubstringDecimal(result)}<br>`;
            result = EvaluateExpressionParts(expression);
            expecting_expression = false;
            return result;
        }
        console.log("it is not a function");
        let result = EvaluateExpression(par.result_string);
        
        if(result == "NaN")
            return false;

        //console.log(expression);
        expression = eraseString(expression, par.opening, par.strlength + 2);
        expression = insertString(expression, par.opening, result);
        //console.log(`inserting "${result}" to ${expression}`);
        result = EvaluateExpressionParts(expression);
        expecting_expression = false;
        unary_allowed = false;
        return result;
    }
    
    let result = EvaluateExpression(expression);
    if(result == "NaN"){
        console.log("epic EvaluateExpression() failure!");
        throw "epic EvaluateExpression() failure!";
        //return false;
    }
    return result;
}
function EvaluateExpression(expression)
{
    if(isNumber(expression)){
        console.log(`IsNumber(${expression}) == true`)
        return expression;
    }
    if(typeof(expression) != "string")
        throw `EvaluateExpression(): passed type ${typeof(expression)} instead of string`;


    const tokens = TokenizeExpression(expression);

    if(typeof(tokens) == "string"){
        throw tokens;
        // let output = document.getElementById("output_val");
        // output.innerHTML += (tokens);
        // console.log(`epic failure: ${tokens}`);
        // return "NaN";
    }
    console.log(tokens);
    return EvaluateExpressionTokens(tokens);
}
function EvaluateExpressionTokens(tokens)
{
    let output = document.getElementById("output_val");
    let initial_size = tokens.length;
    console.log(`initial_size: ${tokens.length}`);
    let evaluated = 0;
    while(initial_size > 1){
        let lval_itr = 0;
        let rval_itr = lval_itr+1;
        let lobj = new Object(tokens[lval_itr]);
        let robj = new Object(tokens[rval_itr]);
        

        let op = GetOperandPriority(lobj.operator);
        let next_op = GetOperandPriority(robj.operator);

        while (next_op > op) {
            
            lobj = new Object(tokens[lval_itr]);
            robj = new Object(tokens[rval_itr]);

            op = GetOperandPriority(lobj.operator);
            next_op = GetOperandPriority(robj.operator);

            if(rval_itr == tokens.length-1)
                break;

            if (next_op <= op)
                break;

            ++lval_itr;
            ++rval_itr;

            
        }

        let loperand = tokens[lval_itr].expr;
        let roperand = tokens[rval_itr].expr;
        let _operator = tokens[lval_itr].operator;
        evaluated = StrEval(loperand, _operator, roperand);
        console.log(`evaluating: (${loperand} ${_operator} ${roperand}) = ${evaluated}`);
        // console.log(`size: ${tokens.length}, accessing: ${lval_itr}`);
        tokens.splice(lval_itr, 2, new Object({expr: evaluated, operator: tokens[rval_itr].operator}));
       // tokens[lval_itr].expr = evaluated;
        
        
        output.innerHTML += `(${getSubstringDecimal(loperand)} ${_operator} ${getSubstringDecimal(roperand)}) = ${getSubstringDecimal(evaluated)}<br>`;
        initial_size--;
    }
    return String(evaluated);
}
function EvaluateFunctionExpression(func_obj, par)
{
    //par_string = parenthesis object
    //par.result_string contains the string within the parentheses
    console.log(`it is a function that takes ${func_obj.num_args} arguments`);
    console.log(`evaluating the token ${par.result_string}`)
    let arguments_processed = 0;
    let args = par.result_string.split(",");
    if(par.result_string == "")
        args = [];
    console.log(func_obj);

    if(args.length != func_obj.num_args){
         throw (`Syntax error: incorrect amount of arguments (expected ${func_obj.num_args} instead of ${args.length})`);
    }
    console.log(`unevaluated args: ${args}`);
    par.result_string = "";
    while(arguments_processed != func_obj.num_args){
        let result = EvaluateExpressionParts(args[arguments_processed]);
        
        if(result === "NaN")
            throw "NaN";

        args[arguments_processed] = result;
      
        ++arguments_processed;
        par.result_string += (String(getSubstringDecimal(result)) + String(arguments_processed != func_obj.num_args ? ',' : "")); 
    }
    console.log(`evaluated args: ${args}`);

    return String(func_obj.call(...args));

}
function TokenizeExpression(expression)
{
    if(typeof(expression) != "string")
        throw (`TokenizeExpression(): passed type ${typeof(expression)} instead of string`);

    let iterator = 0;
    let token = new String();
    let tokens = [];
    
    while(iterator < expression.length){
        let ch =  (expression[iterator]);

        if(expecting_opening_parenthesis && ch != '('){
            throw "Syntax Error: expected a '('";
        }else if(expecting_opening_parenthesis)
            expecting_opening_parenthesis = 1;

        token += expression[iterator];
        let isOP = isOperator(expression[iterator]);
        
         if(isOP && !(unary_allowed && ch == '-')){
            if(expecting_expression)
                throw "Syntax Error: expecting expression";

            if(token.length != 1){
                token = token.slice(0,-1);
            }
            
            if(token.length){
               // tokens.set(token, expression[iterator]);
                let is_number = isNumber(token);
                console.log(`isNumber(${token}) == ${is_number}`);
                if(isOP && !is_number){
                   let fnc = Functions.get(token);
                   
                    if(fnc == undefined){
                        throw String(`Syntax Error: unexpected token: ${token}`);
                    }
                    expecting_function_arguments = fnc.num_args;
                    expecting_opening_parenthesis = 0;
                    //return "big success!";
                }
                else if(isOP || is_number){
                    tokens.push({expr: token, operator : expression[iterator]});
                    if(isOP){
                        unary_allowed = true;

                    }
                }
                token = "";
            }
        }else if(unary_allowed && ch == '-' || unary_allowed && token.length>1){
            unary_allowed = false;
        }
        // else if(ch === '('){
        //     if(token.length != 1){
        //         token = token.slice(0,-1);
        //     }

            
        // }
        
        expecting_expression = isOP;
        iterator++;
    }

    if(token.length){
        console.log(`last length: ${token.length}`);
        let is_number = isNumber(token);
        console.log(`isNumber(${token}) == ${is_number}`);
        if(is_number){
            

            tokens.push({expr: token, operator : ""});
            token = "";
        }else if(!is_number){
            let fnc = Functions.get(token);
                   
            if(fnc == undefined){
                throw String(`Syntax Error: unexpected token: ${token}`);
            }
            throw String(`expected a function call for the token: ${token}`);
        }
    }

    if(expecting_expression)
        throw "Syntax Error: expecting expression";

    console.log(expression);



    return tokens;
    
}
function func()
{
    const checkbox = document.querySelector('#check');
    checkbox.addEventListener('change', (event) => {
        use_degrees = event.target.checked;
        if (event.target.checked) {
            // Do something when checked
            console.log("checked");
        } else {
            console.log("unchecked");
            // Do something when unchecked
        }
    });

    var select = document.querySelector("#numberSelect");
    select.addEventListener('change', (event) => {
        console.log("changed");
        use_degrees = event.target;
        console.log(event.target.value);
        decimal_precision = parseInt(event.target.value);
    });

}

window.onload = (func);