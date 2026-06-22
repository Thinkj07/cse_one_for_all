grammar TyC;

@lexer::header {
from lexererr import *
}

@lexer::members {
def emit(self):
    tk = self.type
    if tk == self.UNCLOSE_STRING:       
        result = super().emit();
        raise UncloseString(result.text);
    elif tk == self.ILLEGAL_ESCAPE:
        result = super().emit();
        raise IllegalEscape(result.text);
    elif tk == self.ERROR_CHAR:
        result = super().emit();
        raise ErrorToken(result.text); 
    else:
        return super().emit();
}

options{
	language=Python3;
}

// ================================================== PARSER RULES ==================================================

program: decl_list EOF;

decl_list
    : decl decl_list
    |
    ;

decl
    : struct_decl
    | func_decl
    ;

// ==================== STRUCT DECLARATION ====================
struct_decl: STRUCT ID LBRACE member_list RBRACE SEMI;

member_list
    : member member_list
    |
    ;

member: var_typ ID SEMI | VOID ID SEMI | AUTO ID SEMI;  // Og: member: var_typ ID SEMI;

// ==================== FUNCTION DECLARATION ====================
func_decl
    : typ ID LPAREN param_list_opt RPAREN block_stmt      // explicit return type
    | ID LPAREN param_list_opt RPAREN block_stmt          // inferred return type
    ;

param_list_opt
    : param_list
    |
    ;

param_list
    : param COMMA param_list
    | param
    ;

param: var_typ ID | VOID ID | AUTO ID;                  // Og: param: var_typ ID;

// ==================== TYPES ====================
typ                                                     // Type for func return type and params (includes void)
    : INT
    | FLOAT
    | STRING
    | VOID
    | ID                                                // struct type
    ;

var_typ                                                 // Type for var decl (excludes void)
    : INT
    | FLOAT
    | STRING
    | ID                                                // struct type
    ;

// ==================== STATEMENTS ====================
block_stmt: LBRACE stmt_list RBRACE;

stmt_list
    : stmt stmt_list
    |
    ;

stmt
    : var_decl_stmt
    | block_stmt
    | if_stmt
    | while_stmt
    | for_stmt
    | switch_stmt
    | break_stmt
    | continue_stmt
    | return_stmt
    | expr_stmt
    ;

// ==================== VARIABLE DECLARATION ====================
var_decl_stmt
    : AUTO ID var_init_opt SEMI
    | var_typ ID var_init_opt SEMI
    ;

var_init_opt
    : ASSIGN expr
    |
    ;

// ==================== IF STATEMENT ====================
if_stmt: IF LPAREN expr RPAREN stmt else_part;

else_part
    : ELSE stmt
    |
    ;

// ==================== WHILE STATEMENT ====================
while_stmt: WHILE LPAREN expr RPAREN stmt;

// ==================== FOR STATEMENT ====================
for_stmt: FOR LPAREN for_init SEMI for_cond SEMI for_update RPAREN stmt;

for_init                                                    // only var decl or assignment expr (not any expr)
    : AUTO ID var_init_opt
    | var_typ ID var_init_opt
    | lvalue ASSIGN expr
    |
    ;

for_cond
    : expr
    |
    ;

for_update
    : lvalue ASSIGN expr     
    | INC lvalue               
    | DEC lvalue               
    | lvalue INC               
    | lvalue DEC              
    |                          
    ;

// ==================== SWITCH STATEMENT ====================
switch_stmt: SWITCH LPAREN expr RPAREN LBRACE case_list RBRACE;

case_list                                                   // allow at most one `default` clause
    : case_only_list default_part                           // if multiple `default` clauses are present, it is a compile-time error.
    ;

case_only_list
    : case_only case_only_list
    |
    ;

case_only
    : CASE const_expr COLON stmt_list
    ;

default_part                                                // optional, at most once, can have cases after it
    : DEFAULT COLON stmt_list case_only_list
    |
    ;

const_expr                                                  // const expr: only int lit and operators
    : const_expr const_add_op const_term
    | const_term
    ;

const_term
    : const_term const_mul_op const_factor
    | const_factor
    ;

const_factor
    : MINUS const_factor
    | PLUS const_factor
    | LPAREN const_expr RPAREN
    | INTLIT
    ;

const_add_op
    : PLUS
    | MINUS
    ;

const_mul_op
    : MUL
    | DIV
    | MOD
    ;

// ==================== SIMPLE STATEMENTS ====================
break_stmt: BREAK SEMI;

continue_stmt: CONTINUE SEMI;

return_stmt: RETURN expr_opt SEMI;

expr_opt
    : expr
    |
    ;
                                                            
expr_stmt: expr SEMI;

// ==================== EXPRESSIONS ====================
expr: assign_expr;

assign_expr                                                 // right associative
    : lvalue ASSIGN assign_expr
    | or_expr
    ;

lvalue                                                      // only id or member access chain
    : ID 
    | postfix_expr DOT ID
    ;

or_expr                                                     // left associative
    : or_expr OR and_expr
    | and_expr
    ;

and_expr                                                    // left associative
    : and_expr AND eq_expr
    | eq_expr
    ;

eq_expr                                                     // left associative
    : eq_expr eq_op rel_expr
    | rel_expr
    ;

eq_op                                                       // ==, !=
    : EQ
    | NEQ
    ;

rel_expr                                                    // left associative
    : rel_expr rel_op add_expr  
    | add_expr
    ;

rel_op                                                      // <, <=, >, >=
    : LT
    | LE
    | GT
    | GE
    ;

add_expr                                                    // left associative
    : add_expr add_op mul_expr
    | mul_expr
    ;

add_op                                                      // +, -
    : PLUS
    | MINUS
    ;

mul_expr                                                    // left associative
    : mul_expr mul_op unary_expr
    | unary_expr
    ;

mul_op                                                      // *, /, %
    : MUL
    | DIV
    | MOD
    ;

unary_expr                                                  // right associative           
    : NOT unary_expr
    | MINUS unary_expr
    | PLUS unary_expr
    | INC unary_expr
    | DEC unary_expr
    | postfix_expr
    ;

postfix_expr
    : postfix_expr DOT ID                                   // member access
    | postfix_expr INC                                      // postfix inc
    | postfix_expr DEC                                      // postfix dec
    | ID LPAREN arg_list_opt RPAREN                         // function call
    | primary_expr
    ;

arg_list_opt
    : arg_list
    |
    ;

arg_list
    : expr COMMA arg_list
    | expr
    ;

primary_expr
    : ID                                                    // identifier
    | INTLIT                                                // integer lit 
    | FLOATLIT                                              // float lit
    | STRINGLIT                                             // string lit
    | LPAREN expr RPAREN                                    // parenthesized expr 
    | LBRACE expr_list_opt RBRACE                           // struct lit
    ;

expr_list_opt
    : expr_list
    |
    ;

expr_list
    : expr COMMA expr_list
    | expr
    ;

// ================================================== LEXER RULES ==================================================

// ==================== KEYWORDS ====================
AUTO: 'auto';
BREAK: 'break';
CASE: 'case';
CONTINUE: 'continue';
DEFAULT: 'default';
ELSE: 'else';
FLOAT: 'float';
FOR: 'for';
IF: 'if';
INT: 'int';
RETURN: 'return';
STRING: 'string';
STRUCT: 'struct';
SWITCH: 'switch';
VOID: 'void';
WHILE: 'while';

// ==================== OPERATORS ====================
EQ: '==';
NEQ: '!=';
LE: '<=';
GE: '>=';
LT: '<';
GT: '>';
OR: '||';
AND: '&&';
NOT: '!';
INC: '++';
DEC: '--';

PLUS: '+';
MINUS: '-';
MUL: '*';
DIV: '/';
MOD: '%';
ASSIGN: '=';
DOT: '.';                                                       // Member access

// ==================== SEPARATORS ====================
LBRACE: '{';
RBRACE: '}';
LPAREN: '(';
RPAREN: ')';
SEMI: ';';
COMMA: ',';
COLON: ':';

// ==================== LITERALS ====================
FLOATLIT: 
    [0-9]+ '.' [0-9]* EXPONENT?                                 // 1., 1.5, 1.5e4
    | '.' [0-9]+ EXPONENT?                                      // .5, .5e4
    | [0-9]+ EXPONENT                                           // 1e4 (bắt buộc có exponent nếu không có dấu chấm)
    ;

fragment EXPONENT: [eE] [+-]? [0-9]+;

INTLIT: [0-9]+;

fragment STRING_CHAR: ~[\\\r\n"] | '\\' [bfrnt"\\];

STRINGLIT: '"' STRING_CHAR* '"' {self.text = self.text[1:-1]};

// ==================== IDENTIFIER ====================
ID: [a-zA-Z_][a-zA-Z0-9_]*;

// ==================== COMMENTS ====================
BLOCK_COMMENT: '/*' (. | '\r' | '\n')*? '*/' -> skip;
LINE_COMMENT: '//' ~[\r\n]* -> skip;

// ==================== STRING ERRORS ====================
ILLEGAL_ESCAPE: '"' STRING_CHAR* '\\' ~[bfrnt"\\\r\n] {self.text = self.text[1:]};
UNCLOSE_STRING: '"' STRING_CHAR* {self.text = self.text[1:]};

// ==================== WHITESPACE ====================
WS: [ \t\r\n\f]+ -> skip;

// ==================== ERROR TOKEN ====================
ERROR_CHAR: .;
