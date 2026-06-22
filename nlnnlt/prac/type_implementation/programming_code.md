## Question 1
Given the AST declarations as follows:

class Exp(ABC): #abstract class

class BinOp(Exp): #op:str,e1:Exp,e2:Exp #op is +,-,*,/,&&,||, >, <, ==, or  !=

class UnOp(Exp): #op:str,e:Exp #op is -, !

class IntLit(Exp): #val:int

class FloatLit(Exp): #val:float

class BoolLit(Exp): #val:bool

and the Visitor class is declared as follows:

    class StaticCheck(Visitor):
        def visitBinOp(self,ctx:BinOp,o): pass
        def visitUnOp(self,ctx:UnOp,o):pass
        def visitIntLit(self,ctx:IntLit,o): pass 
        def visitFloatLit(self,ctx,o): pass
        def visitBoolLit(self,ctx,o): pass

Rewrite the body of the methods in class StaticCheck to check the following type constraints:

- \+ , - and * accept their operands in int or float type and return float type if at least one of their operands is in float type, otherwise, return int type
- / accepts their operands in int or float type and returns float type
- !, && and || accept their operands in bool type and return bool type
- \>, <, == and != accept their operands in any type but must in the same type and return bool type 

If the expression does not conform the type constraints, the StaticCheck will raise exception TypeMismatchInExpression with the innermost sub-expression that contains type mismatch.

**Test**: BinOp("+",IntLit(3),BoolLit(True))

**Result**: Type Mismatch In Expression: BinOp("+",IntLit(3),BoolLit(True))

**ANSWER**
```
class IntType(): pass
class FloatType(): pass
class BoolType(): pass

class StaticCheck(Visitor):

    def visitBinOp(self,ctx:BinOp,o): 
        typ1 = self.visit(ctx.e1, o)
        typ2 = self.visit(ctx.e2, o)
        
        if ctx.op in ['+', '-', '*']:
            if type(typ1) is BoolType or type(typ2) is BoolType:
                raise TypeMismatchInExpression(ctx)
            elif type(typ1) is FloatType or type(typ2) is FloatType:
                return FloatType()
            return IntType()
            
        elif ctx.op == '/':
            if type(typ1) is BoolType or type(typ2) is BoolType:
                raise TypeMismatchInExpression(ctx)
            return FloatType()
            
        elif ctx.op in ['!', '&&', '||']:
            if type(typ1) is not BoolType or type(typ2) is not BoolType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()
            
        elif ctx.op in ['<', '>', '==', '!=']:
            if type(typ1) != type(typ2):
                raise TypeMismatchInExpression(ctx)
            return BoolType()

    def visitUnOp(self,ctx:UnOp,o):
        typ = self.visit(ctx.e, o)
        if ctx.op == '-':
            if type(typ) is BoolType:
                raise TypeMismatchInExpression(ctx)
            return typ
        
        elif ctx.op == '!':
            if type(typ) is not BoolType:
                raise TypeMismatchInExpression(ctx)
            return typ

    def visitIntLit(self,ctx:IntLit,o): 
        return IntType()

    def visitFloatLit(self,ctx,o): 
        return FloatType()

    def visitBoolLit(self,ctx,o): 
        return BoolType()
```

## Question 2

Given the AST declarations as follows:

class Program: #decl:List[VarDecl],exp:Exp

class VarDecl: #name:str,typ:Type

class Type(ABC): #abstract class

class IntType(Type)

class FloatType(Type)

class BoolType(Type)

class Exp(ABC): #abstract class

class BinOp(Exp): #op:str,e1:Exp,e2:Exp #op is +,-,*,/,&&,||, >, <, ==, or  !=

class UnOp(Exp): #op:str,e:Exp #op is -, !

class IntLit(Exp): #val:int

class FloatLit(Exp): #val:float

class BoolLit(Exp): #val:bool

class Id(Exp): #name:str

and the Visitor class is declared as follows:

    class StaticCheck(Visitor):
        def visitProgram(self,ctx:Program,o):pass
        def visitVarDecl(self,ctx:VarDecl,o): pass
        def visitBinOp(self,ctx:BinOp,o): pass
        def visitUnOp(self,ctx:UnOp,o):pass
        def visitIntLit(self,ctx:IntLit,o): pass 
        def visitFloatLit(self,ctx,o): pass
        def visitBoolLit(self,ctx,o): pass
        def visitId(self,ctx,o): pass

Rewrite the body of the methods in class StaticCheck to check the following type constraints:

- \+ , - and * accept their operands in int or float type and return float type if at least one of their operands is in float type, otherwise, return int type
- / accepts their operands in int or float type and returns float type
- !, && and || accept their operands in bool type and return bool type
- \>, <, == and != accept their operands in any type but must in the same type and return bool type
the type of an Id is from the declarations, if the Id is not in the declarations, exception UndeclaredIdentifier should be raised with the name of the Id. 

If the expression does not conform the type constraints, the StaticCheck will raise exception TypeMismatchInExpression with the innermost sub-expression that contains type mismatch.

**Test**: Program([],BinOp("+",IntLit(3),BoolLit(True)))

**Result**: Type Mismatch In Expression: BinOp("+",IntLit(3),BoolLit(True))

**ANSWER**
```
class StaticCheck(Visitor):
    def visitProgram(self,ctx:Program,o):
        env = {}
        for decl in ctx.decl:
            self.visit(decl, env)
        self.visit(ctx.exp, env)
        
    def visitVarDecl(self,ctx:VarDecl,o): 
        if type(ctx.typ) is IntType:
            o[ctx.name] = IntType()
        elif type(ctx.typ) is FloatType:
            o[ctx.name] = FloatType()
        elif type(ctx.typ) is BoolType:
            o[ctx.name] = BoolType()

    def visitBinOp(self,ctx:BinOp,o): 
        t1 = self.visit(ctx.e1, o)
        t2 = self.visit(ctx.e2, o)
        
        if ctx.op in ['+', '-', '*']:
            if type(t1) is BoolType or type(t2) is BoolType:
                raise TypeMismatchInExpression(ctx)
            elif type(t1) is FloatType or type(t2) is FloatType:
                return FloatType()
            return IntType()
            
        elif ctx.op == '/':
            if type(t1) is BoolType or type(t2) is BoolType:
                raise TypeMismatchInExpression(ctx)
            return FloatType()
            
        elif ctx.op in ['!', '&&', '||']:
            if type(t1) is not BoolType or type(t2) is not BoolType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()
            
        elif ctx.op in ['<', '>', '==', '!=']:
            if type(t1) != type(t2):
                raise TypeMismatchInExpression(ctx)
            return BoolType()

    def visitUnOp(self,ctx:UnOp,o):
        t = self.visit(ctx.e, o)
        if ctx.op == '-':
            if type(t) is BoolType:
                raise TypeMismatchInExpression(ctx)
            return t
        
        elif ctx.op == '!':
            if type(t) is not BoolType:
                raise TypeMismatchInExpression(ctx)
            return t

    def visitIntLit(self,ctx:IntLit,o): return IntType() 

    def visitFloatLit(self,ctx,o): return FloatType()

    def visitBoolLit(self,ctx,o): return BoolType()

    def visitId(self,ctx,o):
        if ctx.name not in o:
            raise UndeclaredIdentifier(ctx.name)
        return o[ctx.name]
```