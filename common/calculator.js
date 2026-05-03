/**
 * Evaluates a mathematical expression string.
 *
 * Supported operators:
 *   +  addition
 *   -  subtraction
 *   x  ×  *  multiplication
 *   /  ÷  division
 *
 * Supports multi-digit integers, decimals, nested parentheses,
 * and implicit multiplication before parentheses (e.g. "2(3+1)" → 8).
 *
 * @param {string} expression
 * @returns {number}
 */
function calculate(expression) {
  // Normalise operators to ASCII equivalents
  const normalised = expression
    .replace(/\s+/g, '')           // strip whitespace
    .replace(/×/g, '*')            // × → *
    .replace(/x(?=[0-9.(])/gi, '*') // x followed by digit/dot/( → *
    .replace(/(?<=[0-9.)])x/gi, '*') // digit/)/dot followed by x → *
    .replace(/÷/g, '/');            // ÷ → /

  let pos = 0;

  function peek() {
    return normalised[pos];
  }

  function consume() {
    return normalised[pos++];
  }

  /** Parse a full expression (handles + and -) */
  function parseExpression() {
    let left = parseTerm();

    while (pos < normalised.length && (peek() === '+' || peek() === '-')) {
      const op = consume();
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }

    return left;
  }

  /** Parse a term (handles * and /) */
  function parseTerm() {
    let left = parseFactor();

    while (pos < normalised.length && (peek() === '*' || peek() === '/')) {
      const op = consume();
      const right = parseFactor();
      if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        left = left / right;
      } else {
        left = left * right;
      }
    }

    return left;
  }

  /** Parse a factor: a number, a parenthesised expression, or a unary minus */
  function parseFactor() {
    // Unary minus
    if (peek() === '-') {
      consume();
      return -parseFactor();
    }

    // Unary plus
    if (peek() === '+') {
      consume();
      return parseFactor();
    }

    // Parenthesised expression
    if (peek() === '(') {
      consume(); // '('
      const value = parseExpression();
      if (peek() !== ')') throw new Error(`Expected ')' at position ${pos}`);
      consume(); // ')'

      // Implicit multiplication: "(...)number" or "(...)("
      if (pos < normalised.length && (peek() === '(' || /[0-9.]/.test(peek()))) {
        return value * parseFactor();
      }

      return value;
    }

    // Number (integer or decimal)
    if (/[0-9.]/.test(peek())) {
      let numStr = '';
      while (pos < normalised.length && /[0-9.]/.test(peek())) {
        numStr += consume();
      }
      const num = parseFloat(numStr);
      if (isNaN(num)) throw new Error(`Invalid number: ${numStr}`);

      // Implicit multiplication: "number("
      if (peek() === '(') {
        return num * parseFactor();
      }

      return num;
    }

    throw new Error(`Unexpected character '${peek()}' at position ${pos}`);
  }

  const result = parseExpression();

  if (pos !== normalised.length) {
    throw new Error(`Unexpected character '${normalised[pos]}' at position ${pos}`);
  }

  return result;
}
