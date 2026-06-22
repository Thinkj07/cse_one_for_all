## Question 1

Given the AST declarations as follows:

class Program: #decl:List[VarDecl],stmts:List[Assign]

class VarDecl: #name:str

class Assign: #lhs:Id,rhs:Exp

class Exp(ABC): #abstract class

class BinOp(Exp): #op:str,e1:Exp,e2:Exp #op is +,-,_,/,+.,-.,_.,/., &&,||, >, >., >b, =, =., =b

class UnOp(Exp): #op:str,e:Exp #op is -,-., !,i2f, floor

class IntLit(Exp): #val:int

class FloatLit(Exp): #val:float

class BoolLit(Exp): #val:bool

class Id(Exp): #name:str

and the Visitor class is declared as follows:

    class StaticCheck(Visitor):
        def visitProgram(self,ctx:Program,o):pass
        def visitVarDecl(self,ctx:VarDecl,o): pass
        def visitAssign(self,ctx:Assign,o): pass
        def visitBinOp(self,ctx:BinOp,o): pass
        def visitUnOp(self,ctx:UnOp,o):pass
        def visitIntLit(self,ctx:IntLit,o): pass
        def visitFloatLit(self,ctx,o): pass
        def visitBoolLit(self,ctx,o): pass
        def visitId(self,ctx,o): pass

Rewrite the body of the methods in class StaticCheck to infer the type of identifiers and check the following type constraints:

- \+ , - , \*, / accept their operands in int type and return int type
- +., -., \*., /. accept their operands in float type and return float type
- \> and = accept their operands in int type and return bool type
- \>. and =. accept their operands in float type and return bool type
- !, &&, ||, >b and =b accept their operands in bool type and return bool type
- i2f accepts its operand in int type and return float type
- floor accept its operand in float type and return int type
- In an Assign, the type of lhs must be the same as that of rhs, otherwise, the exception TypeMismatchInStatement should be raised together with the Assign
- the type of an Id is inferred from the above constraints in the first usage,
  - if the Id is not in the declarations, exception UndeclaredIdentifier should be raised together with the name of the Id, or
  - If the Id cannot be inferred in the first usage, exception TypeCannotBeInferred should be raised together with the name of the identifier

If the expression does not conform the type constraints, the StaticCheck will raise exception TypeMismatchInExpression with the assign statement where contains the type-unresolved identifier.

**Test**: Program([VarDecl("x"),VarDecl("y")],[Assign(Id("x"),Id("y"))])

**Result**: Type Cannot Be Inferred: Assign(Id("x"),Id("y"))

**ANSWER**

```
from functools import reduce

class Type: pass
class IntType(Type): pass
class FloatType(Type): pass
class BoolType(Type): pass

class Symbol:
    def __init__(self, name, type):
        self.name = name
        self.type = type # or None

def infer(name, type, lst):
    for sym in lst:
        if sym.name == name:
            sym.type = type
            return type

class StaticCheck(Visitor):

    def visitProgram(self, ctx: Program, o):
        o = reduce(lambda a, c: self.visit(c, a), ctx.decl, [])
        reduce(lambda a, c: self.visit(c, o), ctx.stmts, o)

    def visitVarDecl(self, ctx: VarDecl, o):
        return o + [Symbol(ctx.name, None)]

    def visitAssign(self, ctx: Assign, o):
        rhs_type = self.visit(ctx.rhs, o)
        lhs_type = self.visit(ctx.lhs, o)

        if lhs_type is None and rhs_type is None:
            raise TypeCannotBeInferred(ctx)

        elif lhs_type is None:
            infer(ctx.lhs.name, rhs_type, o)
            lhs_type = rhs_type
        elif rhs_type is None:
            if isinstance(ctx.rhs, Id):
                infer(ctx.rhs.name, lhs_type, o)
                rhs_type = lhs_type
            else:
                raise TypeCannotBeInferred(ctx)

        if type(lhs_type) is not type(rhs_type):
            raise TypeMismatchInStatement(ctx)

    def visitBinOp(self, ctx: BinOp, o):
        typ1 = self.visit(ctx.e1, o)
        typ2 = self.visit(ctx.e2, o)

        if ctx.op in ['+', '-', '*', '/']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, IntType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, IntType(), o)
            if type(typ1) is not IntType or type(typ2) is not IntType:
                raise TypeMismatchInExpression(ctx)
            return IntType()

        if ctx.op in ['+.', '-.', '*.', '/.']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, FloatType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, FloatType(), o)
            if type(typ1) is not FloatType or type(typ2) is not FloatType:
                raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op in ['>', '=']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, IntType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, IntType(), o)
            if type(typ1) is not IntType or type(typ2) is not IntType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op in ['>.', '=.']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, FloatType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, FloatType(), o)
            if type(typ1) is not FloatType or type(typ2) is not FloatType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op in ['&&', '||', '>b', '=b']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, BoolType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, BoolType(), o)
            if type(typ1) is not BoolType or type(typ2) is not BoolType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

    def visitUnOp(self, ctx: UnOp, o):
        typ = self.visit(ctx.e, o)

        if ctx.op == '-':
            if typ is None: typ = infer(ctx.e.name, IntType(), o)
            if type(typ) is not IntType: raise TypeMismatchInExpression(ctx)
            return IntType()

        if ctx.op == '-.':
            if typ is None: typ = infer(ctx.e.name, FloatType(), o)
            if type(typ) is not FloatType: raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op == '!':
            if typ is None: typ = infer(ctx.e.name, BoolType(), o)
            if type(typ) is not BoolType: raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op == 'i2f':
            if typ is None: typ = infer(ctx.e.name, IntType(), o)
            if type(typ) is not IntType: raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op == 'floor':
            if typ is None: typ = infer(ctx.e.name, FloatType(), o)
            if type(typ) is not FloatType: raise TypeMismatchInExpression(ctx)
            return IntType()

    def visitIntLit(self,ctx:IntLit,o): return IntType()

    def visitFloatLit(self,ctx,o): return FloatType()

    def visitBoolLit(self,ctx,o): return BoolType()

    def visitId(self, ctx: Id, o):
        sym = next(filter(lambda x: x.name == ctx.name, o), None)
        if not sym: raise UndeclaredIdentifier(ctx.name)
        return sym.type
```

## Question 2

Given the AST declarations as follows:

class Program: #decl:List[VarDecl],stmts:List[Assign]

class VarDecl: #name:str

class Assign: #lhs:Id,rhs:Exp

class Exp(ABC): #abstract class

class BinOp(Exp): #op:str,e1:Exp,e2:Exp #op is +,-,_,/,+.,-.,_.,/., &&,||, >, >., >b, =, =., =b

class UnOp(Exp): #op:str,e:Exp #op is -,-., !,i2f, floor

class IntLit(Exp): #val:int

class FloatLit(Exp): #val:float

class BoolLit(Exp): #val:bool

class Id(Exp): #name:str

and the Visitor class is declared as follows:

    class StaticCheck(Visitor):
        def visitProgram(self,ctx:Program,o):pass
        def visitVarDecl(self,ctx:VarDecl,o): pass
        def visitAssign(self,ctx:Assign,o): pass
        def visitBinOp(self,ctx:BinOp,o): pass
        def visitUnOp(self,ctx:UnOp,o):pass
        def visitIntLit(self,ctx:IntLit,o): pass
        def visitFloatLit(self,ctx,o): pass
        def visitBoolLit(self,ctx,o): pass
        def visitId(self,ctx,o): pass

Rewrite the body of the methods in class StaticCheck to infer the type of identifiers and check the following type constraints:

- \+ , - , \*, / accept their operands in int type and return int type
- +., -., \*., /. accept their operands in float type and return float type
- \> and = accept their operands in int type and return bool type
- \>. and =. accept their operands in float type and return bool type
- !, &&, ||, >b and =b accept their operands in bool type and return bool type
- i2f accepts its operand in int type and return float type
- floor accept its operand in float type and return int type
- In an Assign, the type of lhs must be the same as that of rhs, otherwise, the exception TypeMismatchInStatement should be raised together with the Assign
- the type of an Id is inferred from the above constraints in the first usage,
  - if the Id is not in the declarations, exception UndeclaredIdentifier should be raised together with the name of the Id, or
  - If the Id cannot be inferred in the first usage, exception TypeCannotBeInferred should be raised together with the name of the identifier
- For static referencing environment, this language applies the scope rules of block-structured programming language. When there is a declaration duplication of a name in a scope, exception Redeclared should be raised together with the second declaration.
- If an expression does not conform the type constraints, the StaticCheck will raise exception TypeMismatchInExpression with the expression.

**Test**: Program([VarDecl("x")],[Assign(Id("x"),IntLit(3)),Block([VarDecl("y")],[Assign(Id("x"),Id("y")),Assign(Id("y"),BoolLit(True))])])

**Result**: Type Mismatch In Statement: Assign(Id("y"),BoolLit(True))

**ANSWER**

```
from functools import reduce

class Type: pass
class IntType(Type): pass
class FloatType(Type): pass
class BoolType(Type): pass

class Symbol:
    def __init__(self, name, type):
        self.name = name
        self.type = type # or None

def infer(name, type, lst):
    for env in lst:
        for sym in env:
            if sym.name == name:
                sym.type = type
                return type

class StaticCheck(Visitor):

    def visitProgram(self, ctx: Program, o):
        sym_table = reduce(lambda a, c: self.visit(c, a), ctx.decl, [[]])
        reduce(lambda a, c: self.visit(c, sym_table), ctx.stmts, sym_table)

    def visitVarDecl(self, ctx: VarDecl, o):
        if any(sym.name == ctx.name for sym in o[0]):
            raise Redeclared(ctx)
        new_current_scope = o[0] + [Symbol(ctx.name, None)]
        return [new_current_scope] + o[1:]

    def visitBlock(self, ctx: Block, o):
        env = [[]] + o
        env = reduce(lambda a, c: self.visit(c, a), ctx.decl, env)
        env = reduce(lambda a, c: self.visit(c, a), ctx.stmts, env)
        return o[1:]

    def visitAssign(self, ctx: Assign, o):
        rhs_type = self.visit(ctx.rhs, o)
        lhs_type = self.visit(ctx.lhs, o)

        if lhs_type is None and rhs_type is None:
            raise TypeCannotBeInferred(ctx)

        elif lhs_type is None:
            infer(ctx.lhs.name, rhs_type, o)
            lhs_type = rhs_type
        elif rhs_type is None:
            if isinstance(ctx.rhs, Id):
                infer(ctx.rhs.name, lhs_type, o)
                rhs_type = lhs_type
            else:
                raise TypeCannotBeInferred(ctx)

        if type(lhs_type) is not type(rhs_type):
            raise TypeMismatchInStatement(ctx)
        return o

    def visitBinOp(self, ctx: BinOp, o):
        typ1 = self.visit(ctx.e1, o)
        typ2 = self.visit(ctx.e2, o)

        if ctx.op in ['+', '-', '*', '/']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, IntType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, IntType(), o)
            if type(typ1) is not IntType or type(typ2) is not IntType:
                raise TypeMismatchInExpression(ctx)
            return IntType()

        if ctx.op in ['+.', '-.', '*.', '/.']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, FloatType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, FloatType(), o)
            if type(typ1) is not FloatType or type(typ2) is not FloatType:
                raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op in ['>', '=']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, IntType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, IntType(), o)
            if type(typ1) is not IntType or type(typ2) is not IntType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op in ['>.', '=.']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, FloatType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, FloatType(), o)
            if type(typ1) is not FloatType or type(typ2) is not FloatType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op in ['&&', '||', '>b', '=b']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, BoolType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, BoolType(), o)
            if type(typ1) is not BoolType or type(typ2) is not BoolType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

    def visitUnOp(self, ctx: UnOp, o):
        typ = self.visit(ctx.e, o)

        if ctx.op == '-':
            if typ is None: typ = infer(ctx.e.name, IntType(), o)
            if type(typ) is not IntType: raise TypeMismatchInExpression(ctx)
            return IntType()

        if ctx.op == '-.':
            if typ is None: typ = infer(ctx.e.name, FloatType(), o)
            if type(typ) is not FloatType: raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op == '!':
            if typ is None: typ = infer(ctx.e.name, BoolType(), o)
            if type(typ) is not BoolType: raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op == 'i2f':
            if typ is None: typ = infer(ctx.e.name, IntType(), o)
            if type(typ) is not IntType: raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op == 'floor':
            if typ is None: typ = infer(ctx.e.name, FloatType(), o)
            if type(typ) is not FloatType: raise TypeMismatchInExpression(ctx)
            return IntType()

    def visitIntLit(self,ctx:IntLit,o): return IntType()

    def visitFloatLit(self,ctx,o): return FloatType()

    def visitBoolLit(self,ctx,o): return BoolType()

    def visitId(self, ctx: Id, o):
        for scope in o:
            sym = next((s for s in scope if s.name == ctx.name), None)
            if sym:return sym.type
        raise UndeclaredIdentifier(ctx.name)
```

## Question 3

Given the AST declarations as follows:

class Program: #decl:List[Decl],stmts:List[Stmt]

class Decl(ABC): #abstract class

class VarDecl(Decl): #name:str

class FuncDecl(Decl): #name:str,param:List[VarDecl],local:List[Decl],stmts:List[Stmt]

class Stmt(ABC): #abstract class

class Assign(Stmt): #lhs:Id,rhs:Exp

class CallStmt(Stmt): #name:str,args:List[Exp]

class Exp(ABC): #abstract class

class IntLit(Exp): #val:int

class FloatLit(Exp): #val:float

class BoolLit(Exp): #val:bool

class Id(Exp): #name:str

and the Visitor class is declared as follows:

    class StaticCheck(Visitor):
        def visitProgram(self,ctx:Program,o):pass
        def visitVarDecl(self,ctx:VarDecl,o): pass
        def visitFuncDecl(self,ctx:FuncDecl,o): pass
        def visitCallStmt(self,ctx:CallStmt,o):pass
        def visitAssign(self,ctx:Assign,o): pass
        def visitIntLit(self,ctx:IntLit,o): pass
        def visitFloatLit(self,ctx,o): pass
        def visitBoolLit(self,ctx,o): pass
        def visitId(self,ctx,o): pass

Rewrite the body of the methods in class StaticCheck to infer the type of identifiers and check the following type constraints:

- In an Assign, the type of lhs must be the same as that of rhs, otherwise, the exception TypeMismatchInStatement should be raised together with the Assign
- the type of an Id is inferred from the above constraints in the first usage,
  - if the Id is not in the declarations, exception UndeclaredIdentifier should be raised together with the name of the Id, or
  - If the Id cannot be inferred in the first usage, exception TypeCannotBeInferred should be raised together with the statement
- For static referencing environment, this language applies the scope rules of block-structured programming language where a function is a block. When there is a declaration duplication of a name in a scope, exception Redeclared should be raised together with the second declaration.
- In a call statement, the argument type must be the same as the parameter type. If there is no function declaration in the static referencing environment, exception UndeclaredIdentifier should be raised together with the function call name. If the numbers of parameters and arguments are not the same or at least one argument type is not the same as the type of the corresponding parameter, exception TypeMismatchInStatement should be raise with the call statement. If there is at least one parameter type cannot be resolved, exception TypeCannotBeInferred should be raised together with the call statement.

**Test**: Program([VarDecl("x"),FuncDecl("foo",[VarDecl("y"),VarDecl("z")],[],[])],[CallStmt("foo",[IntLit(3),Id("x")])])

**Result**: Type Cannot Be Inferred: CallStmt("foo",[IntLit(3),Id("x")])

**ANSWER**

```
from functools import reduce

class Type: pass
class IntType(Type): pass
class FloatType(Type): pass
class BoolType(Type): pass

class Symbol:
    def __init__(self, name, type):
        self.name = name
        self.type = type  # or None

def infer(name, type, lst):
    for env in lst:
        for sym in env:
            if sym.name == name:
                sym.type = type
                return type

class StaticCheck(Visitor):

    def visitProgram(self, ctx: Program, o):
        sym_table = reduce(lambda a, c: self.visit(c, a), ctx.decl, [[]])
        reduce(lambda a, c: self.visit(c, sym_table), ctx.stmts, sym_table)

    def visitVarDecl(self, ctx: VarDecl, o):
        if any(sym.name == ctx.name for sym in o[0]):
            raise Redeclared(ctx)
        new_current_scope = o[0] + [Symbol(ctx.name, None)]
        return [new_current_scope] + o[1:]

    def visitFuncDecl(self, ctx: FuncDecl, o):
        outer_scope = o[0]
        if any(sym.name == ctx.name for sym in outer_scope):
            raise Redeclared(ctx)

        local_scope = []
        param_syms = []

        for param in ctx.param:
            if any(sym.name == param.name for sym in local_scope):
                raise Redeclared(param)
            sym = Symbol(param.name, None)
            local_scope.append(sym)
            param_syms.append(sym)

        for local in ctx.local:
            if any(sym.name == local.name for sym in local_scope):
                raise Redeclared(local)
            local_scope.append(Symbol(local.name, None))

        func_sym = Symbol(ctx.name, param_syms)
        new_outer_scope = outer_scope + [func_sym]
        new_env = [new_outer_scope] + o[1:]

        body_env = [local_scope] + new_env
        for stmt in ctx.stmts:
            self.visit(stmt, body_env)

        return new_env

    def visitAssign(self, ctx: Assign, o):
        rhs_type = self.visit(ctx.rhs, o)
        lhs_type = self.visit(ctx.lhs, o)

        if lhs_type is None and rhs_type is None:
            raise TypeCannotBeInferred(ctx)
        elif lhs_type is None:
            infer(ctx.lhs.name, rhs_type, o)
            lhs_type = rhs_type
        elif rhs_type is None:
            if isinstance(ctx.rhs, Id):
                infer(ctx.rhs.name, lhs_type, o)
                rhs_type = lhs_type
            else:
                raise TypeCannotBeInferred(ctx)

        if type(lhs_type) is not type(rhs_type):
            raise TypeMismatchInStatement(ctx)
        return o

    def visitCallStmt(self, ctx: CallStmt, o):
        func_sym = None
        for scope in o:
            for sym in scope:
                if sym.name == ctx.name:
                    func_sym = sym
                    break
            if func_sym:
                break
        if func_sym is None:
            raise UndeclaredIdentifier(ctx.name)

        param_syms = func_sym.type
        if not isinstance(param_syms, list):
            raise UndeclaredIdentifier(ctx.name)

        if len(param_syms) != len(ctx.args):
            raise TypeMismatchInStatement(ctx)

        for i, arg in enumerate(ctx.args):
            arg_type = self.visit(arg, o)
            param_sym = param_syms[i]
            param_type = param_sym.type

            if param_type is None and arg_type is None:
                raise TypeCannotBeInferred(ctx)
            elif param_type is None:
                param_sym.type = arg_type
            elif arg_type is None:
                if isinstance(arg, Id):
                    infer(arg.name, param_type, o)
                else:
                    raise TypeCannotBeInferred(ctx)
            else:
                if type(param_type) is not type(arg_type):
                    raise TypeMismatchInStatement(ctx)
        return o

    def visitBinOp(self, ctx: BinOp, o):
        typ1 = self.visit(ctx.e1, o)
        typ2 = self.visit(ctx.e2, o)

        if ctx.op in ['+', '-', '*', '/']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, IntType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, IntType(), o)
            if type(typ1) is not IntType or type(typ2) is not IntType:
                raise TypeMismatchInExpression(ctx)
            return IntType()

        if ctx.op in ['+.', '-.', '*.', '/.']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, FloatType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, FloatType(), o)
            if type(typ1) is not FloatType or type(typ2) is not FloatType:
                raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op in ['>', '=']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, IntType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, IntType(), o)
            if type(typ1) is not IntType or type(typ2) is not IntType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op in ['>.', '=.']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, FloatType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, FloatType(), o)
            if type(typ1) is not FloatType or type(typ2) is not FloatType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op in ['&&', '||', '>b', '=b']:
            if typ1 is None:
                typ1 = infer(ctx.e1.name, BoolType(), o)
            if typ2 is None:
                typ2 = infer(ctx.e2.name, BoolType(), o)
            if type(typ1) is not BoolType or type(typ2) is not BoolType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

    def visitUnOp(self, ctx: UnOp, o):
        typ = self.visit(ctx.e, o)

        if ctx.op == '-':
            if typ is None:
                typ = infer(ctx.e.name, IntType(), o)
            if type(typ) is not IntType:
                raise TypeMismatchInExpression(ctx)
            return IntType()

        if ctx.op == '-.':
            if typ is None:
                typ = infer(ctx.e.name, FloatType(), o)
            if type(typ) is not FloatType:
                raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op == '!':
            if typ is None:
                typ = infer(ctx.e.name, BoolType(), o)
            if type(typ) is not BoolType:
                raise TypeMismatchInExpression(ctx)
            return BoolType()

        if ctx.op == 'i2f':
            if typ is None:
                typ = infer(ctx.e.name, IntType(), o)
            if type(typ) is not IntType:
                raise TypeMismatchInExpression(ctx)
            return FloatType()

        if ctx.op == 'floor':
            if typ is None:
                typ = infer(ctx.e.name, FloatType(), o)
            if type(typ) is not FloatType:
                raise TypeMismatchInExpression(ctx)
            return IntType()

    def visitIntLit(self, ctx: IntLit, o):
        return IntType()

    def visitFloatLit(self, ctx, o):
        return FloatType()

    def visitBoolLit(self, ctx, o):
        return BoolType()

    def visitId(self, ctx: Id, o):
        for scope in o:
            sym = next((s for s in scope if s.name == ctx.name), None)
            if sym:
                return sym.type
        raise UndeclaredIdentifier(ctx.name)
```
