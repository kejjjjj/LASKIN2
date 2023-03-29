export {isNumber}
export {isOperator}

function isNumber(input) {
    return !isNaN(input);
}
function isOperator(o)
{
    return (o == '+' || o == '-' || o == '/' || o =='*');
}
