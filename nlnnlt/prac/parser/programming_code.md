## Question 1

Given the description of a program in HLang as follows:

A program in HLang consists of many declarations, which are **variable** and **function declarations**.

Modify the HLang.g4 as follows:

program: // write for program rule here using vardecl and funcdecl

vardecl: 'vardecl' ;

funcdecl: 'funcdecl' ;

WS: [ \t\r\n] -> skip;

ERROR_CHAR: . {raise ErrorToken(self.text)};

Example:
| Test | Result |
|---|---|
| """vardecl""" | successful |

**ANSWER**
```
program: declaration+ EOF;
declaration: vardecl | funcdecl ;
vardecl: 'vardecl' ;
funcdecl: 'funcdecl' ;
```

## Question 2

Given the description of a program in HLang as follows:

A program in HLang consists of many declarations, which are **variable** and **function declarations**.

A **variable declaration** starts with a type, which is **int** or **float**, then a comma-separated list of identifiers and ends with a semicolon.

A **function declaration** also start with a type and then an identifier, which is the function name, and then parameter declaration and ends with a body. The parameter declaration starts with a left round bracket ’(’ and a null-able semicolon-separated list of parameters and ends with a right round bracket ’)’. Each parameter always starts with a type and then a comma-separated list of identifier.

Modify HLang.g4 as follows:

program: // write your rule here

//And some other rules for variable declaration, function declaration and other rules

body: 'body';

ID: // includes a sequence of alphabetic characters.

WS: [ \t\r\n] -> skip;

ERROR_CHAR: . {raise ErrorToken(self.text)};

Example:
| Test | Result |
|---|---|
| """int a, b,c; | successful |
float foo(int a; float c, d) body
loat goo (float a, b) body"""

**ANSWER**
```
program: declaration+ EOF;
declaration: vardecl | funcdecl;
vardecl: type id_list SEMI;
id_list: ID COMMA id_list | ID;
funcdecl: type ID LP (param_list | ) RP body;
param_list: param SEMI param_list | param;
param: type id_list;
type: INT_TYPE| FLOAT_TYPE;
body : 'body' ;
INT_TYPE   : 'int' ;
FLOAT_TYPE : 'float' ;
ID    : [a-zA-Z]+ ;
SEMI  : ';' ;
COMMA : ',' ;
LP    : '(' ;
RP    : ')' ;
```

## Question 3

Given the description of a program in HLang as follows:

A program in HLang consists of many declarations, which are **variable** and **function declarations**.

A **variable declaration** starts with a type, which is **int** or **float**, then a comma-separated list of identifiers and ends with a semicolon.

A **function declaration** also start with a type and then an identifier, which is the function name, and then parameter declaration and ends with a body. The parameter declaration starts with a left round bracket ’(’ and a null-able semicolon-separated list of parameters and ends with a right round bracket ’)’. Each parameter always starts with a type and then a comma-separated list of identifier. A body starts with a left curly bracket ’{’, follows by a null-able list of variable declarations or statements and ends with a right curly bracket ’}’.

There are **3 kinds of statements**: assignment, call and return. All statements must end with a semicolon. An assignment statement starts with an identifier, then an equal ’=’, then an expression. A call starts with an identifier and then follows by a null-able comma-separated list of expressions enclosed by round brackets. A return statement starts with a symbol ’return’ and then an expression.

Modify HLang.g4 as follows:

program :// write your rule for program here

//And some other rules for variable declaration, function declaration, statements but using following expr for an expression

expr: 'expr';

ID: //includes a sequence of alphabetic characters

WS: [ \t\r\n] -> skip;

ERROR_CHAR: . {raise ErrorToken(self.text)};

**ANSWER**
```
declaration: vardecl | funcdecl;
vardecl: type id_list SEMI;
id_list: ID COMMA id_list | ID;
funcdecl: type ID LPAREN (param_list | ) RPAREN body;
param_list: param SEMI param_list | param;
param: type id_list;
type: INT_TYPE| FLOAT_TYPE;

body : LBRACE stmt_list* RBRACE ;

stmt_list: stmt | vardecl;

stmt: assignment_stmt | call_stmt | return_stmt;

assignment_stmt: ID ASSIGN expr SEMI;
call_stmt: ID LPAREN (expr_list | ) RPAREN SEMI;
return_stmt: RETURN expr SEMI;


expr: 'expr';
expr_list: expr COMMA expr_list | expr ;

RETURN : 'return' ;
INT_TYPE   : 'int' ;
FLOAT_TYPE : 'float' ;
ID    : [a-zA-Z]+ ;
ASSIGN: '=' ;
SEMI  : ';' ;
COMMA : ',' ;
LPAREN: '(' ;
RPAREN: ')' ;
LBRACE: '{' ;
RBRACE: '}' ;
```

## Question 4

Given the description of a program in HLang as follows:

A program in HLang consists of many declarations, which are **variable** and **function declarations**.

A **variable declaration** starts with a type, which is **int** or **float**, then a comma-separated list of identifiers and ends with a semicolon.

A **function declaration** also start with a type and then an identifier, which is the function name, and then parameter declaration and ends with a body. The parameter declaration starts with a left round bracket ’(’ and a null-able semicolon-separated list of parameters and ends with a right round bracket ’)’. Each parameter always starts with a type and then a comma-separated list of identifier. A body starts with a left curly bracket ’{’, follows by a null-able list of variable declarations or statements and ends with a right curly bracket ’}’.

There are **3 kinds of statements**: assignment, call and return. All statements must end with a semicolon. An assignment statement starts with an identifier, then an equal ’=’, then an expression. A call starts with an identifier and then follows by a null-able comma-separated list of expressions enclosed by round brackets. A return statement starts with a symbol ’return’ and then an expression.

An **expression** is a construct which is made up of operators and operands. They calculate on their operands and return new value. There are four kinds of infix operators: ’+’, ’-’, ’_’ and ’/’ where ’+’ have lower precedence than ’-’ while ’_’ and ’/’ have the highest precedence among these operators. The ’+’ operator is right associative, ’-’ is non-associative while ’\*’ and ’/’ is left-associative. To change the precedence, a sub-expression is enclosed in round brackets. The operands can be an integer literal, float literal, an identifier, a call or a sub-expression.

For example:

```
int a, b, c;
float foo(int a; float c, d) {
     int e;
     e = a + 4;
     c = a * d / 2.0;
     return c + 1;
}
float goo(float a, b) {
     return foo(1, a, b);
}
```

Some tokens:

1. An identifier includes a sequence of alphabetic characters.

2. An integer number includes a sequence of numerical characters.

3. A real (float) number includes two parts: integer and fractional parts. The integer and fractional part are like a integer number, but separated by a point (.).

**ANSWER**
```
declaration: vardecl | funcdecl;
vardecl: type id_list SEMI;
id_list: ID COMMA id_list | ID;
funcdecl: type ID LPAREN (param_list | ) RPAREN body;
param_list: param SEMI param_list | param;
param: type id_list;
type: INT_TYPE| FLOAT_TYPE;

body : LBRACE stmt_x RBRACE;

stmt_x: stmt_list stmt_x | ;

stmt_list: stmt | vardecl;

stmt: assignment_stmt | call_stmt | return_stmt;

assignment_stmt: ID ASSIGN expr SEMI;
call_stmt: ID LPAREN (expr_list | ) RPAREN SEMI;
return_stmt: RETURN expr SEMI;

expr_list: expr COMMA expr_list | expr ;

expr: expr1 ADD expr | expr1;
expr1: expr2 SUB expr2 | expr2;
expr2: expr2 MUL expr3 | expr2 DIV expr3 | expr3;
expr3: ID | literals | ID LPAREN (expr_list | ) RPAREN | LPAREN expr RPAREN;

literals: INT_LIT | FLOAT_LIT;

RETURN : 'return' ;
INT_TYPE   : 'int' ;
FLOAT_TYPE : 'float' ;
ID    : [a-zA-Z]+ ;
INT_LIT   : [0-9]+ ;
FLOAT_LIT : [0-9]+ '.' [0-9]+ ;
ADD: '+' ;
SUB: '-' ;
MUL: '*' ;
DIV: '/' ;
ASSIGN: '=' ;
SEMI  : ';' ;
COMMA : ',' ;
LPAREN: '(' ;
RPAREN: ')' ;
LBRACE: '{' ;
RBRACE: '}' ;
```
