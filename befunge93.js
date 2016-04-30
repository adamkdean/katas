// Adam K Dean, 2016.
// www.adamkdean.co.uk / akd.io

function befunge93(code, DEBUG_OVERRIDE) {
  let DEBUG_ENABLED = DEBUG_OVERRIDE || false;
  
  const stack = [];
  const lines = code.split('\n');
  const cursor = { row: 0, column: 0 };
  const direction = { row: 0, column: 1 };
  
  const moveLeft = () => { direction.row = 0; direction.column = -1; };
  const moveRight = () => { direction.row = 0; direction.column = 1; };
  const moveUp = () => { direction.row = -1; direction.column = 0; };
  const moveDown = () => { direction.row = 1; direction.column = 0; };
  
  const moveCursor = () => {
    cursor.row = cursor.row + direction.row % lines.length;
    if (cursor.row < 0) cursor.row = 0;    
    cursor.column = cursor.column + direction.column % lines[cursor.row].length;
    if (cursor.column < 0) cursor.column = 0;
  }
  
  let output = '';
  let running = true;
  let stringMode = false;
  let skipNext = false;
  
  if (DEBUG_ENABLED) {
    const codeOutput = code.split(' ').join('&nbsp;');
    console.log(codeOutput);
  }
  
  while (running) {
    const char = lines[cursor.row][cursor.column];
    let a, b, x, y, v, random, vs, pre, post = null;
    
    if (DEBUG_ENABLED) {
      console.log(`>> interpreting "${char}" at ${cursor.row},${cursor.column}`);
      console.log('before', `"${output}"`, stack);
    }
    
    if (skipNext) {
      skipNext = false;
      moveCursor();
      continue;
    }
    
    if (stringMode && char !== '"') {
      stack.push(char.charCodeAt(0));
      moveCursor();
      continue;
    }
    
    switch (char) {
    
      // 0-9 Push this number onto the stack.
      case (char.match(/[0-9]/) || {}).input:
        stack.push(parseInt(char));
        break;
        
      // Addition: Pop a and b, then push a+b.
      case '+': 
        a = stack.pop();
        b = stack.pop();
        stack.push(a + b);
        break;
        
      // Subtraction: Pop a and b, then push b-a.
      case '-':
        a = stack.pop();
        b = stack.pop();
        stack.push(b - a);
        break;
        
      // Multiplication: Pop a and b, then push a*b.
      case '*':
        a = stack.pop();
        b = stack.pop();
        stack.push(a * b);
        break;
        
      // Integer division: Pop a and b, then push b/a, rounded down. If a is zero, push zero.
      case '/':
        a = stack.pop();
        b = stack.pop();
        if (a === 0) stack.push(0);
        else stack.push(Math.floor(b / a))
        break;
        
      // Modulo: Pop a and b, then push the b%a. If a is zero, push zero.
      case '%':
        a = stack.pop();
        b = stack.pop();
        stack.push(b % a);
        break;
        
      // Logical NOT: Pop a value. If the value is zero, push 1; otherwise, push zero.  
      case '!':
        a = stack.pop();
        stack.push(+!a);
        break;
        
      // Greater than: Pop a and b, then push 1 if b>a, otherwise push zero.
      case '`':
        a = stack.pop();
        b = stack.pop();
        stack.push(+(b > a));
        break;
        
      // > Start moving right.
      case '>':
        moveRight();
        break;
        
      // < Start moving left.
      case '<':
        moveLeft();
        break;
        
      // ^ Start moving up.
      case '^':
        moveUp();
        break;
        
      // v Start moving down.
      case 'v':
        moveDown();
        break;
        
      // Start moving in a random cardinal direction.
      case '?':
        random = Math.floor(Math.random() * 4) + 1;
        if (random === 1) moveLeft();
        else if (random === 2) moveRight();
        else if (random === 3) moveUp(); 
        else if (random === 4) moveDown();
        break;
        
      // Pop a value; move right if value = 0, left otherwise.
      case '_':
        a = stack.pop();
        if (a === 0) moveRight();
        else moveLeft();
        break;
        
      // Pop a value; move down if value = 0, up otherwise.
      case '|':
        a = stack.pop();
        if (a === 0) moveDown();
        else moveUp();
        break;
        
      // Start string mode: push each character's ASCII value all the way up to the next ".
      case '"':
        stringMode = !stringMode;
        break;
        
      // Duplicate value on top of the stack. If there is nothing on top of the stack, push a 0.
      case ':':
        if (stack.length === 0) stack.push(0);
        else stack.push(stack[stack.length - 1]);
        break;
        
      // Swap two values on top of the stack. If there is only one value, pretend there is an extra 0 on bottom of the stack.
      case '\\':
        a = stack.pop();
        b = stack.pop() || 0;
        stack.push(a);
        stack.push(b);
        break;
        
      // Pop value from the stack and discard it.
      case '$':
        stack.pop();
        break;
        
      // Pop value and output as an integer.
      case '.':
        a = stack.pop();
        output += parseInt(a); // TODO: Check
        break;
        
      // Pop value and output the ASCII character represented by the integer code that is stored in the value.
      case ',':
        a = stack.pop();
        output += String.fromCharCode(a);
        break;
        
      // Trampoline: Skip next cell.
      case '#':
        skipNext = true;
        break;
        
      // A "put" call (a way to store a value for later use). Pop y, x and v, then change the 
      // character at the position (x,y) in the program to the character with ASCII value v.
      case 'p':
        y = stack.pop();
        x = stack.pop();
        v = stack.pop();
        vs = String.fromCharCode(v);
        pre = lines[y].substr(0, x);
        post = lines[y].substr(x + 1);        
        lines[y] = `${pre}${vs}${post}`;
        break;
        
      // A "get" call (a way to retrieve data in storage). Pop y and x, then push ASCII value of 
      // the character at that position in the program.
      case 'g':
        y = stack.pop();
        x = stack.pop();
        stack.push(lines[y][x].charCodeAt(0));
        break;
        
      // End program.
      case '@':
        running = false;
        break;
        
      // ' ' (i.e. a space) No-op. Does nothing.
      case ' ':
        break;
    }
    
    moveCursor();
    
    if (DEBUG_ENABLED) {
      console.log('after', `"${output}"`, stack);
      console.log();
    }
  }
  
  return output;
}

const interpret = befunge93;
