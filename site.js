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
const Functions = new Map([
    ['sqrt', {fnc:   (value) =>    {return Math.sqrt(value);},    num_args: 1}],
    ['tan',  {fnc:   (value) =>    {return Math.tan(value);},     num_args: 1}],
    ['sin',  {fnc:   (value) =>    {return Math.sin(value);},     num_args: 1}],
    ['cos',  {fnc:   (value) =>    {return Math.cos(value);},     num_args: 1}]
    ])
function GetOperandPriority(ops)
{
    if(typeof(ops) != "string")
        return OperatorPriority.FAILURE, alert(`GetOperandPriority(): passed type ${typeof(ops)} instead of string`);

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
        return "invalid", alert(`StringWithinParantheses(): passed type ${typeof(str)} instead of string`);

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
		alert(`no matching pair for '${obj.count_opening > obj.count_closing ? '(' : ')'}'`);
		return undefined;
	}
    obj.strlength = closing - obj.opening - obj.count_opening;
    obj.result_string = str.substr(obj.opening + 1, obj.strlength);
    return obj;
}
function EvaluateExpression_Init()
{

    let elem = document.getElementById("expression_");
    let output = document.getElementById("output_val");
    output.innerHTML = "";

    let expression = elem.value.replace(/\s/g, ''); //remove whitespaces

    EvaluateExpressionParts(expression);

    //output.innerHTML += expression;
    //console.log(tokens);
}
function eraseString(str, start, count) {
    return (str.substr(0, start) + str.substr(start + count));
}
function insertString(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
} 
//pass the whole expression including the parentheses
function EvaluateExpressionParts(expression) //recursive
{
    if(typeof(expression) != "string")
        return "invalid", alert(`EvaluateExpressionParts(): passed type ${typeof(expression)} instead of string`);
    
    console.log(`EvaluateExpressionParts: "${expression}"`);


    let par = StringWithinParantheses(expression);
    if(par == undefined){
        console.log(`EvaluateExpressionParts: par == undefined`);

        return undefined;
    }

    if(par.result_string.length){
        let result = EvaluateExpression(par.result_string);
        
        if(result == "NaN")
            return false;

        //console.log(expression);
        expression = eraseString(expression, par.opening, par.strlength + 2);
        expression = insertString(expression, par.opening, result);
        //console.log(`inserting "${result}" to ${expression}`);
        EvaluateExpressionParts(expression);
        
        return true;
    }
    
    let result = EvaluateExpression(expression);
    if(result == "NaN"){
        console.log("epic EvaluateExpression() failure!");
        return false;
    }
    return true;
}
function EvaluateExpression(expression)
{
    if(isNumber(expression)){
        console.log(`IsNumber(${expression}) == true`)
        return expression;
    }
    if(typeof(expression) != "string")
        return "NaN", alert(`EvaluateExpression(): passed type ${typeof(expression)} instead of string`);


    const tokens = TokenizeExpression(expression);

    if(typeof(tokens) == "string"){
        let output = document.getElementById("output_val");
        output.innerHTML += (tokens);
        console.log(`epic failure: ${tokens}`);
        return "NaN";
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
        
        
        output.innerHTML += `(${loperand} ${_operator} ${roperand}) = ${evaluated}<br>`;
        initial_size--;
    }
    return String(evaluated);
}
function TokenizeExpression(expression)
{
    if(typeof(expression) != "string")
        return "NaN", alert(`TokenizeExpression(): passed type ${typeof(expression)} instead of string`);

    let iterator = 0;
    let token = new String();
    let tokens = [];
    let expecting_expression = true;
    while(iterator < expression.length){
        token += (expression[iterator]);
        let isOP = isOperator(expression[iterator]);
        
        if(isOP){
            if(expecting_expression)
                return "Syntax Error: expecting expression";

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
                    return String(`Syntax Error: unexpected token: ${token}`);
                   }
                   return "big success!";
                   
                }
                else if(isOP || is_number){
                    console.log(`the token: ${token}`);
                    tokens.push({expr: token, operator : expression[iterator]});
                    token = "";
                }
                console.log(`the token: ${token}`);
            }
        }

        expecting_expression = isOP;
        iterator++;
    }

    if(token.length){
        if(isOperator(token[token.length-1]))
            if(expecting_expression)
                return "Syntax Error: expecting expression";

        let is_number = isNumber(token);
        if(is_number){
            console.log(`isNumber(${token}) == true`);

            tokens.push({expr: token, operator : ""});
            token = "";
        }else if(!is_number){
            return String(`Syntax Error: unexpected token: ${token}`);
        }
    }
    console.log(expression);

    return tokens;
    
}