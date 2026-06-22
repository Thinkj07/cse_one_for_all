Let AST of a programming language be defined as follows:

class Program: #decl:List[Decl]

class Decl(ABC): #abstract class

class VarDecl(Decl): #name:str,typ:Type

class ConstDecl(Decl): #name:str,val:Lit

class Type(ABC): #abstract class

class IntType(Type)

class FloatType(Type)

class Lit(ABC): #abstract class

class IntLit(Lit): #val:int

and exception RedeclaredDeclaration:

class RedeclaredDeclaration(Exception): #name:str

Implement the methods of the following class Visitor to travel on the above ASST to detect redeclared declarations (throw exception RedeclaredDeclaration):

    class StaticCheck(Visitor):
        def visitProgram(self,ctx:Program,o:object): pass
        def visitVarDecl(self,ctx:VarDecl,o:object):pass
        def visitConstDecl(self,ctx:ConstDecl,o:object):pass
        def visitIntType(self,ctx:IntType,o:object):pass
        def visitFloatType(self,ctx:FloatType,o:object):pass
        def visitIntLit(self,ctx:IntLit,o:object):pass

**ANSWER**
```
class StaticCheck(Visitor):
    def visitProgram(self, ctx: Program, o: object):
        env = []
        for decl in ctx.decl:
            self.visit(decl, env)

    def visitVarDecl(self, ctx: VarDecl, o: object):
        if ctx.name in o:
            raise RedeclaredDeclaration(ctx.name)
        o.append(ctx.name)

    def visitConstDecl(self, ctx: ConstDecl, o: object):
        if ctx.name in o:
            raise RedeclaredDeclaration(ctx.name)
        o.append(ctx.name)

    def visitIntType(self, ctx: IntType, o: object):
        pass

    def visitFloatType(self, ctx: FloatType, o: object):
        pass

    def visitIntLit(self, ctx: IntLit, o: object):
        pass
```

## Question 2
Let AST of a programming language be defined as follows:

class Program: #decl:List[Decl]

class Decl(ABC): #abstract class

class VarDecl(Decl): #name:str,typ:Type

class ConstDecl(Decl): #name:str,val:Lit

class Type(ABC): #abstract class

class IntType(Type)

class FloatType(Type)

class Lit(ABC): #abstract class

class IntLit(Lit): #val:int

and exceptions:

class RedeclaredVariable(Exception): #name:str

class RedeclaredConstant(Exception): #name:str

Implement the methods of the following class Visitor to travel on the above ASST to detect redeclared declarations (throw the exception corresponding to the second declaration with the same name):

    class StaticCheck(Visitor):
        def visitProgram(self,ctx:Program,o:object): pass
        def visitVarDecl(self,ctx:VarDecl,o:object):pass
        def visitConstDecl(self,ctx:ConstDecl,o:object):pass
        def visitIntType(self,ctx:IntType,o:object):pass
        def visitFloatType(self,ctx:FloatType,o:object):pass
        def visitIntLit(self,ctx:IntLit,o:object):pass

**ANSWER**
```
    class StaticCheck(Visitor):
    def visitProgram(self, ctx: Program, o: object):
        env = []
        for decl in ctx.decl:
            self.visit(decl, env) 

    def visitVarDecl(self, ctx: VarDecl, o: object):
        if ctx.name in o:
            raise RedeclaredVariable(ctx.name)
        o.append(ctx.name)

    def visitConstDecl(self, ctx: ConstDecl, o: object):
        if ctx.name in o:
            raise RedeclaredConstant(ctx.name)
        o.append(ctx.name)

    def visitIntType(self, ctx: IntType, o: object):
        pass

    def visitFloatType(self, ctx: FloatType, o: object):
        pass

    def visitIntLit(self, ctx: IntLit, o: object):
        pass
```

## Question 3
Let AST of a programming language be defined as follows:

class Program: #decl:List[Decl]

class Decl(ABC): #abstract class

class VarDecl(Decl): #name:str,typ:Type

class ConstDecl(Decl): #name:str,val:Lit

class FuncDecl(Decl): #name:str,param:List[VarDecl],body:List[Decl]

class Type(ABC): #abstract class

class IntType(Type)

class FloatType(Type)

class Lit(ABC): #abstract class

class IntLit(Lit): #val:int

and exceptions:

class RedeclaredVariable(Exception): #name:str

class RedeclaredConstant(Exception): #name:str

class RedeclaredFunction(Exception): #name:str

Implement the methods of the following class Visitor to travel on the above AST to detect redeclared declarations (throw the exception corresponding to the second declaration with the same name) in the same scope:

    class StaticCheck(Visitor):
        def visitProgram(self,ctx:Program,o:object): pass
        def visitVarDecl(self,ctx:VarDecl,o:object):pass
        def visitConstDecl(self,ctx:ConstDecl,o:object):pass
        def visitFuncDecl(self,ctx:FuncDecl,o:object):pass
        def visitIntType(self,ctx:IntType,o:object):pass
        def visitFloatType(self,ctx:FloatType,o:object):pass
        def visitIntLit(self,ctx:IntLit,o:object):pass

**ANSWER**
```
class StaticCheck(Visitor):
    def visitProgram(self, ctx: Program, o: object):
        env = []
        for decl in ctx.decl:
            self.visit(decl, env)

    def visitVarDecl(self, ctx: VarDecl, o: object):
        if ctx.name in o:
            raise RedeclaredVariable(ctx.name)
        o.append(ctx.name)

    def visitConstDecl(self, ctx: ConstDecl, o: object):
        if ctx.name in o:
            raise RedeclaredConstant(ctx.name)
        o.append(ctx.name)

    def visitFuncDecl(self, ctx: FuncDecl, o: object):
        if ctx.name in o:
            raise RedeclaredFunction(ctx.name)
        o.append(ctx.name)
        local_env = []
        for param in ctx.param:
            self.visit(param, local_env)
        for decl in ctx.body:
            self.visit(decl, local_env)

    def visitIntType(self, ctx: IntType, o: object):
        pass

    def visitFloatType(self, ctx: FloatType, o: object):
        pass

    def visitIntLit(self, ctx: IntLit, o: object):
        pass
```

## Question 4
Let AST of a programming language be defined as follows:

class Program: #decl:List[Decl]

class Decl(ABC): #abstract class

class VarDecl(Decl): #name:str,typ:Type

class ConstDecl(Decl): #name:str,val:Lit

class FuncDecl(Decl): #name:str,param:List[VarDecl],body:Tuple(List[Decl],List[Expr])

class Type(ABC): #abstract class

class IntType(Type)

class FloatType(Type)

class Expr(ABC): #abstract class

class Lit(Expr): #abstract class

class IntLit(Lit): #val:int

class Id(Expr): #name:str

and exceptions:

class RedeclaredVariable(Exception): #name:str

class RedeclaredConstant(Exception): #name:str

class RedeclaredFunction(Exception): #name:str

class UndeclaredIdentifier(Exception): #name:str

Implement the methods of the following class Visitor to travel on the above AST to detect undeclared declarations (throw the exception UndeclaredIdentifier). Note that the redeclared declarations exception also is thrown if a redeclared declaration is detected:

    class StaticCheck(Visitor):
        def visitProgram(self,ctx:Program,o:object): pass
        def visitVarDecl(self,ctx:VarDecl,o:object):pass
        def visitConstDecl(self,ctx:ConstDecl,o:object):pass
        def visitFuncDecl(self,ctx:FuncDecl,o:object):pass
        def visitIntType(self,ctx:IntType,o:object):pass
        def visitFloatType(self,ctx:FloatType,o:object):pass
        def visitIntLit(self,ctx:IntLit,o:object):pass
        def visitId(self,ctx:Id,o:object):pass

**ANSWER**
```
class StaticCheck(Visitor):
    def visitProgram(self, ctx: Program, o: object):
        env = [[]]
        for decl in ctx.decl:
            self.visit(decl, env)

    def visitVarDecl(self, ctx: VarDecl, o: object):
        if ctx.name in o[0]:
            raise RedeclaredVariable(ctx.name)
        o[0].append(ctx.name)
        self.visit(ctx.typ, o)

    def visitConstDecl(self, ctx: ConstDecl, o: object):
        if ctx.name in o[0]:
            raise RedeclaredConstant(ctx.name)
        o[0].append(ctx.name)
        self.visit(ctx.val, o)

    def visitFuncDecl(self, ctx: FuncDecl, o: object):
        if ctx.name in o[0]:
            raise RedeclaredFunction(ctx.name)
        o[0].append(ctx.name)
        local_env = [[]] + o
        for param in ctx.param:
            self.visit(param, local_env)
        for decl in ctx.body[0]:
            self.visit(decl, local_env)
        for expr in ctx.body[1]:
            self.visit(expr, local_env)

    def visitId(self, ctx: Id, o: object):
        for scope in o:
            if ctx.name in scope:
                return 
        raise UndeclaredIdentifier(ctx.name)

    def visitIntType(self, ctx: IntType, o: object):
        pass

    def visitFloatType(self, ctx: FloatType, o: object):
        pass

    def visitIntLit(self, ctx: IntLit, o: object):
        pass
```