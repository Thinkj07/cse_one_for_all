## Question 1
Given the grammar of MP as follows:

program: vardecls EOF;

vardecls: vardecl vardecltail;

vardecltail: vardecl vardecltail | ;

vardecl: mptype ids ';' ;

mptype: INTTYPE | FLOATTYPE;

ids: ID ',' ids | ID; 

INTTYPE: 'int';

FLOATTYPE: 'float';

ID: [a-z]+ ;

Please copy the following class into your answer and modify the bodies of its methods to count the terminal nodes in the parse tree?

    class ASTGeneration(MPVisitor):
        def visitProgram(self,ctx:MPParser.ProgramContext):
            return None
        def visitVardecls(self,ctx:MPParser.VardeclsContext):
            return None
        def visitVardecltail(self,ctx:MPParser.VardecltailContext): 
            return None
        def visitVardecl(self,ctx:MPParser.VardeclContext): 
            return None
        def visitMptype(self,ctx:MPParser.MptypeContext):
            return None
        def visitIds(self,ctx:MPParser.IdsContext):
            return None
**ANSWER**
```
class ASTGeneration(MPVisitor):
    def visitProgram(self,ctx:MPParser.ProgramContext):
        return self.visit(ctx.vardecls()) + 1

    def visitVardecls(self,ctx:MPParser.VardeclsContext):
        return self.visit(ctx.vardecl()) + self.visit(ctx.vardecltail())

    def visitVardecltail(self,ctx:MPParser.VardecltailContext): 
        if ctx.getChildCount() == 0:
            return 0;
        return self.visit(ctx.vardecl()) + self.visit(ctx.vardecltail())

    def visitVardecl(self,ctx:MPParser.VardeclContext): 
        return self.visit(ctx.mptype()) + self.visit(ctx.ids()) + 1

    def visitMptype(self,ctx:MPParser.MptypeContext):
        return 1

    def visitIds(self,ctx:MPParser.IdsContext):
        if ctx.getChildCount() > 1:
            return 2 + self.visit(ctx.ids())
        return 1
```

## Question 2
Given the grammar of MP as follows:

program: vardecls EOF;

vardecls: vardecl vardecltail;

vardecltail: vardecl vardecltail | ;

vardecl: mptype ids ';' ;

mptype: INTTYPE | FLOATTYPE;

ids: ID ',' ids | ID; 

INTTYPE: 'int';

FLOATTYPE: 'float';

ID: [a-z]+ ;

Please copy the following class into your answer and modify the bodies of its methods to count the non-terminal nodes in the parse tree?

    class ASTGeneration(MPVisitor):
        def visitProgram(self,ctx:MPParser.ProgramContext):
            return None
        def visitVardecls(self,ctx:MPParser.VardeclsContext):
            return None
        def visitVardecltail(self,ctx:MPParser.VardecltailContext): 
            return None
        def visitVardecl(self,ctx:MPParser.VardeclContext): 
            return None
        def visitMptype(self,ctx:MPParser.MptypeContext):
            return None
        def visitIds(self,ctx:MPParser.IdsContext):
            return None
**ANSWER**
```
class ASTGeneration(MPVisitor):
    def visitProgram(self,ctx:MPParser.ProgramContext):
        return 1 + self.visit(ctx.vardecls())
        
    def visitVardecls(self,ctx:MPParser.VardeclsContext):
        return 1 + self.visit(ctx.vardecl()) + self.visit(ctx.vardecltail())
        
    def visitVardecltail(self,ctx:MPParser.VardecltailContext): 
        if ctx.getChildCount() == 0:
            return 1;
        return 1 + self.visit(ctx.vardecl()) + self.visit(ctx.vardecltail())
        
    def visitVardecl(self,ctx:MPParser.VardeclContext): 
        return 1 + self.visit(ctx.mptype()) + self.visit(ctx.ids())
        
    def visitMptype(self,ctx:MPParser.MptypeContext):
        return 1
        
    def visitIds(self,ctx:MPParser.IdsContext):
        if ctx.getChildCount() == 1:
            return 1
        return 1 + self.visit(ctx.ids())
```

## Question 3
Given the grammar of MP as follows:

program: vardecls EOF;

vardecls: vardecl vardecltail;

vardecltail: vardecl vardecltail | ;

vardecl: mptype ids ';' ;

mptype: INTTYPE | FLOATTYPE;

ids: ID ',' ids | ID; 

INTTYPE: 'int';

FLOATTYPE: 'float';

ID: [a-z]+ ;

and AST classes as follows:
```
class AST(ABC):
    def __eq__(self, other): 
        return self.__dict__ == other.__dict__

    @abstractmethod
    def accept(self, v, param):
        return v.visit(self, param)

class Type(AST):
    __metaclass__ = ABCMeta
    pass

class IntType(Type):
    def __str__(self):
        return "IntType"

    def accept(self, v, param):
        return v.visitIntType(self, param)

class FloatType(Type):
    def __str__(self):
        return "FloatType"

    def accept(self, v, param):
        return v.visitFloatType(self, param)


class Program(AST):
    #decl:list(Decl)
    def __init__(self, decl):
        self.decl = decl
    
    def __str__(self):
        return "Program([" + ','.join(str(i) for i in self.decl) + "])"
    
    def accept(self, v: Visitor, param):
        return v.visitProgram(self, param)

class Decl(AST):
    __metaclass__ = ABCMeta
    pass

class VarDecl(Decl):
    #variable:Id
    #varType: Type
    def __init__(self, variable, varType):
        self.variable = variable
        self.varType = varType

    def __str__(self):
        return "VarDecl(" + str(self.variable) + "," + str(self.varType) + ")"

    def accept(self, v, param):
        return v.visitVarDecl(self, param)


class Id(AST):
    #name:string
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return "Id(" + self.name + ")"

    def accept(self, v, param):
        return v.visitId(self, param)
```

Please copy the following class into your answer and modify the bodies of its methods to generate the AST of a MP input?

    class ASTGeneration(MPVisitor):
        def visitProgram(self,ctx:MPParser.ProgramContext):
            return None
        def visitVardecls(self,ctx:MPParser.VardeclsContext):
            return None
        def visitVardecltail(self,ctx:MPParser.VardecltailContext): 
            return None
        def visitVardecl(self,ctx:MPParser.VardeclContext): 
            return None
        def visitMptype(self,ctx:MPParser.MptypeContext):
            return None
        def visitIds(self,ctx:MPParser.IdsContext):
            return None
**ANSWER**
```
class ASTGeneration(MPVisitor):
    def visitProgram(self,ctx:MPParser.ProgramContext):
        decl = self.visit(ctx.vardecls())
        return Program(decl)

    def visitVardecls(self,ctx:MPParser.VardeclsContext):
        return self.visit(ctx.vardecl()) + self.visit(ctx.vardecltail())

    def visitVardecltail(self,ctx:MPParser.VardecltailContext): 
        if ctx.getChildCount() == 0:
            return []
        return self.visit(ctx.vardecl()) + self.visit(ctx.vardecltail())

    def visitVardecl(self,ctx:MPParser.VardeclContext): 
        type = self.visit(ctx.mptype())
        id = self.visit(ctx.ids())
        return [VarDecl(ids, type) for ids in id]

    def visitMptype(self,ctx:MPParser.MptypeContext):
        if ctx.INTTYPE():
            return IntType()
        return FloatType()

    def visitIds(self,ctx:MPParser.IdsContext):
        cur_id = Id(ctx.ID().getText())
        if ctx.getChildCount() == 1 :
            return [cur_id]
        return [cur_id] + self.visit(ctx.ids())
```

## Question 4
Given the grammar of MP as follows:

program: exp EOF;

exp: term ASSIGN exp | term;

term: factor COMPARE factor | factor;

factor: factor ANDOR operand | operand; 

operand: ID | INTLIT | BOOLIT | '(' exp ')';

INTLIT: [0-9]+ ;

BOOLIT: 'True' | 'False' ;

ANDOR: 'and' | 'or' ;

ASSIGN: '+=' | '-=' | '&=' | '|=' | ':=' ;

COMPARE: '=' | '<>' | '>=' | '<=' | '<' | '>' ;

ID: [a-z]+ ;

and AST classes as follows:
```
class AST(ABC):
    def __eq__(self, other): 
        return self.__dict__ == other.__dict__

    @abstractmethod
    def accept(self, v, param):
        return v.visit(self, param)

class Expr(AST):
    __metaclass__ = ABCMeta
    pass

class Binary(Expr):
    #op:string: 
    #left:Expr
    #right:Expr
    def __init__(self, op, left, right):
        self.op = op
        self.left = left
        self.right = right

    def __str__(self):
        return "Binary(" + self.op + "," + str(self.left) + "," + str(self.right) + ")"

    def accept(self, v, param):
        return v.visitBinaryOp(self, param)

class Id(Expr):
    #value:string
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return "Id(" + self.value + ")"

    def accept(self, v, param):
        return v.visitId(self, param)

class IntLiteral(Expr):
    #value:int
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return "IntLiteral(" + str(self.value) + ")"

    def accept(self, v, param):
        return v.visitIntLiteral(self, param)

class BooleanLiteral(Expr):
    #value:boolean
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return "BooleanLiteral(" + str(self.value) + ")"

    def accept(self, v, param):
        return v.visitBooleanLiteral(self, param)
```

Please copy the following class into your answer and modify the bodies of its methods to generate the AST of a MP input?

    class ASTGeneration(MPVisitor):
        def visitProgram(self,ctx:MPParser.ProgramContext):
            return None
        def visitExp(self,ctx:MPParser.ExpContext):
            return None
        def visitTerm(self,ctx:MPParser.TermContext): 
            return None
        def visitFactor(self,ctx:MPParser.FactorContext):
            return None
        def visitOperand(self,ctx:MPParser.OperandContext):
            return None
**ANSWER**
```
class ASTGeneration(MPVisitor):
    def visitProgram(self,ctx:MPParser.ProgramContext):
        return self.visit(ctx.exp())

    def visitExp(self,ctx:MPParser.ExpContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.term())
        else:
            op = ctx.ASSIGN().getText()
            left = self.visit(ctx.term())
            right = self.visit(ctx.exp())
            return Binary(op, left, right)

    def visitTerm(self,ctx:MPParser.TermContext): 
        if ctx.getChildCount() == 1:
            return self.visit(ctx.factor(0))
        else:
            op = ctx.COMPARE().getText()
            left = self.visit(ctx.factor(0))
            right = self.visit(ctx.factor(1))
            return Binary(op, left, right)

    def visitFactor(self,ctx:MPParser.FactorContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.operand())
        else:
            op = ctx.ANDOR().getText()
            left = self.visit(ctx.factor())
            right = self.visit(ctx.operand())
            return Binary(op, left, right)

    def visitOperand(self,ctx:MPParser.OperandContext):
        if ctx.ID():
            return Id(ctx.ID().getText())
        elif ctx.INTLIT():
            return IntLiteral(ctx.INTLIT().getText())
        elif ctx.BOOLIT():
            return BooleanLiteral(ctx.BOOLIT().getText())
        else:
            return self.visit(ctx.exp())
```

## Question 5
Given the grammar of MP as follows:

program: vardecl+ EOF;

vardecl: mptype ids ';' ;

mptype: INTTYPE | FLOATTYPE;

ids: ID (',' ID)*; 

INTTYPE: 'int';

FLOATTYPE: 'float';

ID: [a-z]+ ;

and AST classes as follows:

class Program:#decl:list(VarDecl)

class Type(ABC): pass

class IntType(Type): pass

class FloatType(Type): pass

class VarDecl: #variable:Id; varType: Type

class Id: #name:str

Please copy the following class into your answer and modify the bodies of its methods to generate the AST of a MP input?

    class ASTGeneration(MPVisitor):
        def visitProgram(self,ctx:MPParser.ProgramContext):
            return None
        def visitVardecl(self,ctx:MPParser.VardeclContext): 
            return None
        def visitMptype(self,ctx:MPParser.MptypeContext):
            return None
        def visitIds(self,ctx:MPParser.IdsContext):
            return None
**ANSWER**
```
class ASTGeneration(MPVisitor):
    def visitProgram(self,ctx:MPParser.ProgramContext):
        cur = []
        for x in ctx.vardecl():
            cur.extend(self.visit(x)) 
        return Program(cur)

    def visitVardecl(self,ctx:MPParser.VardeclContext): 
        ids = self.visit(ctx.ids())
        type = self.visit(ctx.mptype())
        return [VarDecl(id, type) for id in ids]

    def visitMptype(self,ctx:MPParser.MptypeContext):
        if ctx.INTTYPE():
            return IntType()
        return FloatType()

    def visitIds(self,ctx:MPParser.IdsContext):
        return [Id(x.getText) for x in ctx.ID()]
```

## Question 6
Given the grammar of MP as follows:

program: exp EOF;

exp: (term ASSIGN)* term;

term: factor COMPARE factor | factor;

factor: operand (ANDOR operand)*; 

operand: ID | INTLIT | BOOLIT | '(' exp ')';

INTLIT: [0-9]+ ;

BOOLIT: 'True' | 'False' ;

ANDOR: 'and' | 'or' ;

ASSIGN: '+=' | '-=' | '&=' | '|=' | ':=' ;

COMPARE: '=' | '<>' | '>=' | '<=' | '<' | '>' ;

ID: [a-z]+ ;

and AST classes as follows:

class Expr(ABC):

class Binary(Expr):  #op:string;left:Expr;right:Expr

class Id(Expr): #value:string

class IntLiteral(Expr): #value:int

class BooleanLiteral(Expr): #value:boolean

Please copy the following class into your answer and modify the bodies of its methods to generate the AST of a MP input?

    class ASTGeneration(MPVisitor):
        def visitProgram(self,ctx:MPParser.ProgramContext):
            return None
        def visitExp(self,ctx:MPParser.ExpContext):
            return None
        def visitTerm(self,ctx:MPParser.TermContext): 
            return None
        def visitFactor(self,ctx:MPParser.FactorContext):
            return None
        def visitOperand(self,ctx:MPParser.OperandContext):
            return None
**ANSWER**
```
class ASTGeneration(MPVisitor):
    def visitProgram(self, ctx: MPParser.ProgramContext):
        return self.visit(ctx.exp())

    def visitExp(self, ctx: MPParser.ExpContext):
        terms = ctx.term()
        assigns = ctx.ASSIGN()
        if not assigns:
            return self.visit(terms[0])
        right = self.visit(terms[-1])
        for i in range(len(assigns) - 1, -1, -1):
            op = assigns[i].getText()
            left = self.visit(terms[i])
            right = Binary(op, left, right)
        return right

    def visitTerm(self, ctx: MPParser.TermContext): 
        if ctx.COMPARE():
            op = ctx.COMPARE().getText()
            left = self.visit(ctx.factor(0))
            right = self.visit(ctx.factor(1))
            return Binary(op, left, right)
        return self.visit(ctx.factor(0))

    def visitFactor(self, ctx: MPParser.FactorContext):
        operands = ctx.operand()
        ops = ctx.ANDOR()
        res = self.visit(operands[0])
        for i in range(len(ops)):
            op = ops[i].getText()
            right = self.visit(operands[i + 1])
            res = Binary(op, res, right)
        return res

    def visitOperand(self,ctx:MPParser.OperandContext):
        if ctx.ID():
            return Id(ctx.ID().getText())
        elif ctx.INTLIT():
            return IntLiteral(ctx.INTLIT().getText())
        elif ctx.BOOLIT():
            return BooleanLiteral(ctx.BOOLIT().getText())
        else:
            return self.visit(ctx.exp())
```