## Question 1
Assume that 
- class IntLiteral in AST is declared with field value in int type. 
- The visitor CodeGeneration has field emit keeping an object of Emitter 
- Object Frame is kept in field frame of the argument passed to parameter o of visitIntLiteral
- The method visitIntLiteral must return a pair of jasmin code of loading an int constant into operand stack and the type of the constant (one object of a subclass of class Type)

Based on the above assumption, write method visitIntLiteral(self,ctx,o) of visitor CodeGeneration? Your code is at line 160.

Remind that class Type has subclasses: IntType, FloatType, VoidType, StringType, ArrayType, MType.

**Test**: IntLiteral(5)

**Result**: b'5'

**ANSWER**
```
# Note: Indent it one level because the function is inside the CodeGeneration class.
    def visitIntLiteral(self, ctx, o):
        code = self.emit.emitPUSHICONST(ctx.value, o.frame)
        typ = IntType()
        return code, typ
```

## Question 2
Assume that 
- class FloatLiteral in AST is declared with field value in float type. 
- The visitor CodeGeneration has field emit keeping an object of Emitter 
- Object Frame is kept in field frame of the argument passed to parameter o of visitFloatLiteral
- The method visitFloatLiteral must return a pair of jasmin code of loading a float constant into operand stack and the type of the constant (one object of a subclass of class Type)

Based on the above assumption, write method visitFloatLiteral(self,ctx,o) of visitor CodeGeneration? Your code is at line 160.

Remind that class Type has subclasses: IntType, FloatType, VoidType, StringType.

**Test**: FloatLiteral(5.0)

**Result**: b'5.0'

**ANSWER**
```
    def visitFloatLiteral(self, ctx, o):
        typ = StringType()
        val = str(ctx.value)
        code = self.emit.emitPUSHFCONST(val, o.frame)
        return code, typ
```

## Question 3
Assume that 
- class BinExpr in AST is declared with field op in str type, e1 and e2 in Expr type. op can be '+', '-', '*', '/', '+.', '-.', '*.', '/.' where '+', '-', '*', '/' accept 2 operands e1, e2 in IntType and the others accept their operands in FloatType. No Type Error happens. Class Expr is the superclass of BinExpr, IntLiteral and FloatLiteral.
- The visitor CodeGeneration has field emit keeping an object of Emitter 
- Object Frame is kept in field frame of the argument passed to parameter o of visitBinExpr
- The method visitBinExpr must return a pair of jasmin code of a binary expression and the type of the result (one object of a subclass of class Type)

Based on the above assumption, write method visitBinExpr(self,ctx,o) of visitor CodeGeneration? Your code is at line 160.

Remind that class Type has subclasses: IntType, FloatType, VoidType, StringType, ArrayType, MType.

**Test**: CallExpr(Id("putInt"),[BinExpr("+",IntLiteral(5),IntLiteral(3))])

**Result**: b'8'

**ANSWER**
```
    def visitBinExpr(self, ctx, o):
        code1, typ1 = self.visit(ctx.e1, o)
        code2, typ2 = self.visit(ctx.e2, o)
        typ = None
        code = None

        if ctx.op in ['+', '-']:
            code = self.emit.emitADDOP(ctx.op, IntType(), o.frame)
            typ = IntType()
        elif ctx.op in ['+.', '-.']:
            code = self.emit.emitADDOP(ctx.op[0], FloatType(), o.frame)
            typ = FloatType()
        elif ctx.op in ['*', '/']:
            code = self.emit.emitMULOP(ctx.op, IntType(), o.frame)
            typ = IntType()
        elif ctx.op in ['*.', '/.']:
            code = self.emit.emitMULOP(ctx.op[0], FloatType(), o.frame)
            typ = FloatType()
        
        return code1 + code2 + code, typ
```

## Question 4
Assume that 
- class Id in AST is declared with field name in str type. 
- The visitor CodeGeneration has field emit keeping an object of Emitter 
- Object Frame is kept in field frame of the argument passed to parameter o of visitId. In addition, field sym of the argument keeps a list of Symbol which has three fields: name (str type), mtype (Type type) and value (Val type). The Val type has two concrete classes: Index with field value in int type and CName with field value in str type. An Index object keeps the index of the variable while a CName keeps the name of the class name (used for global variable). The first element of sym contains the identifier which belongs to the innermost referencing environment while the last element of sym contains one in the outermost referencing environment (global).
- The method visitId must return a pair of jasmin code of a read value of the identifier onto the operand stack and the type of the identifier (one object of a subclass of class Type)
 
Based on the above assumption, write method visitId(self,ctx,o) of visitor CodeGeneration? Your code is at line 160.

Remind that class Type has subclasses: IntType, FloatType, VoidType, StringType, ArrayType.

**Test**: CallExpr(Id("putInt"),[Id("a")])

**Result**: b'12'

**ANSWER**
```
    def visitId(self, ctx, o):
        sym = next(filter(lambda x: x.name == ctx.name, o.sym), False)
        if type(sym.value) is Index:
            code = self.emit.emitREADVAR(sym.name, sym.mtype, sym.value.value, o.frame)
        else:
            code = self.emit.emitGETSTATIC(sym.value.value + "." + sym.name, sym.mtype, o.frame)
        return code, sym.mtype
```

## Question 5
Assume that 
- class BinExpr in AST is declared with field op in str type, e1 and e2 in Expr type. op can be '+', '-', '*', '/', '>','<','>=','<=','!=','==' which can accept their operands in IntType or FloatType.  The result type of '+', '-', '*' is IntType if both operands are in IntType otherwise FloatType. The result type of '/' is FloatType and other relational operators are BoolType. Class Expr is the superclass of BinExpr, IntLiteral, FloatLiteral, BoolLiteral.
- The visitor CodeGeneration has field emit keeping an object of Emitter 
- Object Frame is kept in field frame of the argument passed to parameter o of visitBinExpr
- The method visitBinExpr must return a pair of jasmin code of a binary expression and the type of the result (one object of a subclass of class Type)

Based on the above assumption, write method visitBinExpr(self,ctx,o) of visitor CodeGeneration? Your code is at line 160.

Remind that class Type has subclasses: IntType, FloatType, VoidType, StringType, BoolType, ArrayType, MType.

**Test**: CallExpr(Id("putFloat"),[BinExpr("+",FloatLiteral(-1.0),FloatLiteral(1.0))])

**Result**: b'0.0'

**ANSWER**
```
    def visitBinExpr(self, ctx, o):
        code1, type1 = self.visit(ctx.e1, o)
        code2, type2 = self.visit(ctx.e2, o)
        
        code = code1
        if type(type1) is IntType and (type(type2) is FloatType or ctx.op == '/'):
            code += self.emit.emitI2F(o.frame)
            
        code += code2
        
        if type(type2) is IntType and (type(type1) is FloatType or ctx.op == '/'):
            code += self.emit.emitI2F(o.frame)
            
        if type(type1) is FloatType or type(type2) is FloatType or ctx.op == '/':
            typ = FloatType()
        else:
            typ = IntType()
            
        if ctx.op in ['+', '-']:
            code += self.emit.emitADDOP(ctx.op, typ, o.frame)
        elif ctx.op in ['*', '/']:
            code += self.emit.emitMULOP(ctx.op, typ, o.frame)
            typ = FloatType() if ctx.op == '/' else typ
        else:
            code += self.emit.emitREOP(ctx.op, typ, o.frame)
            typ = BoolType()
        return code, typ
```

## Question 6
Assume that 
- class Id in AST is declared with field name in str type. 
- The visitor CodeGeneration has field emit keeping an object of Emitter 
- Object is passed to the parameter o of visitId has 3 fields:
    - Field frame keeps object Frame. 
    - Field sym of the argument keeps a list of Symbol which has three fields: name (str type), mtype (Type type) and value (Val type). The Val type has two concrete classes: Index with field value in int type and CName with field value in str type. An Index object keeps the index of the variable while a CName keeps the name of the class name (used for global variable). The first element of sym contains the identifier which belongs to the innermost referencing environment while the last element of sym contains one in the outermost referencing environment (global).
    - Field isLeft in boolean type indicates the identifier in the left (isLeft true) or in the right (isLeft false).
- The method visitId must return a pair of jasmin code to read or write value of the identifier and the type of the identifier (one object of a subclass of class Type)

Based on the above assumption, write method visitId(self,ctx,o) of visitor CodeGeneration? Your code is at line 230.

**Test**: Program([VarDecl("x",IntType()),
FuncDecl("main",[],VoidType(),[Assign(Id("x"),IntLiteral(10)),CallStmt(Id("putInt"),[Id("x")])])])

**Result**: b'10'

**ANSWER**
```
    def visitId(self, ctx, o):
        symbol = next(filter(lambda x: x.name == ctx.name, o.sym), False)
        
        if type(symbol.value) is Index:
            if o.isLeft:
                code = self.emit.emitWRITEVAR(symbol.name, symbol.mtype, symbol.value.value, o.frame)
            else:
                code = self.emit.emitREADVAR(symbol.name, symbol.mtype, symbol.value.value, o.frame)
        else:
            lexeme = symbol.value.value + "." + symbol.name
            if o.isLeft:
                code = self.emit.emitPUTSTATIC(lexeme, symbol.mtype, o.frame)
            else:
                code = self.emit.emitGETSTATIC(lexeme, symbol.mtype, o.frame)
                
        return code, symbol.mtype
```