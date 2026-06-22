"""
Static Semantic Checker for TyC Programming Language

This module implements a comprehensive static semantic checker using visitor pattern
for the TyC procedural programming language. It performs type checking,
scope management, type inference, and detects all semantic errors as
specified in the TyC language specification.
"""

from functools import reduce
from typing import (
    Dict,
    List,
    Set,
    Optional,
    Any,
    Tuple,
    NamedTuple,
    Union,
    TYPE_CHECKING,
)
from ..utils.visitor import ASTVisitor
from ..utils.nodes import (
    ASTNode,
    Program,
    StructDecl,
    MemberDecl,
    FuncDecl,
    Param,
    VarDecl,
    IfStmt,
    WhileStmt,
    ForStmt,
    BreakStmt,
    ContinueStmt,
    ReturnStmt,
    BlockStmt,
    SwitchStmt,
    CaseStmt,
    DefaultStmt,
    Type,
    IntType,
    FloatType,
    StringType,
    VoidType,
    StructType,
    BinaryOp,
    PrefixOp,
    PostfixOp,
    AssignExpr,
    MemberAccess,
    FuncCall,
    Identifier,
    StructLiteral,
    IntLiteral,
    FloatLiteral,
    StringLiteral,
    ExprStmt,
    AssignStmt,
    Expr,
    Stmt,
    Decl,
)

# Type aliases for better type hints
TyCType = Union[IntType, FloatType, StringType, VoidType, StructType]
from .static_error import (
    StaticError,
    Redeclared,
    UndeclaredIdentifier,
    UndeclaredFunction,
    UndeclaredStruct,
    TypeCannotBeInferred,
    TypeMismatchInStatement,
    TypeMismatchInExpression,
    MustInLoop,
)


class StaticChecker(ASTVisitor):
    class Symbol:
        def __init__(self, name: str):
            self.name = name

    class StructSymbol(Symbol):
        def __init__(self, name: str, decl: Optional[StructDecl] = None, members: Optional[Dict[str, Type]] = None):
            super().__init__(name)
            self.decl = decl
            self.members = members if members is not None else {}

    class FunctionSymbol(Symbol):
        def __init__(self, name: str, decl: Optional[FuncDecl] = None, return_type: Optional[Type] = None, params: Optional[Dict[str, Type]] = None, is_build_in: bool = False):
            super().__init__(name)
            self.decl = decl
            self.return_type = return_type
            self.params = params if params is not None else {}
            self.is_build_in = is_build_in

    class VariableSymbol(Symbol):
        def __init__(self, name: str, decl: Optional[Union[VarDecl, Param]] = None, var_type: Optional[Type] = None, inferred: bool = False):
            super().__init__(name)
            self.decl = decl
            self.var_type = var_type
            self.inferred = inferred

    def __init__(self):
        self.struct_symbol_table: Dict[str, StaticChecker.StructSymbol] = {}
        self.func_symbol_table: Dict[str, StaticChecker.FunctionSymbol] = {}
        self.scope_stack: List[Dict[str, StaticChecker.VariableSymbol]] = []          # List of scopes in a stack

        self.current_func: Optional[StaticChecker.FunctionSymbol] = None
        self.loop_depth: int = 0
        self.switch_depth: int = 0
        self.register_build_in_functions()

    # ------------------ Helpers ------------------

    def register_build_in_functions(self):
        def add_functions(name: str, return_type: Type, params: Dict[str, Type]) -> None:
            self.func_symbol_table[name] = StaticChecker.FunctionSymbol(
                name=name,
                return_type=return_type,
                params=params,
                is_build_in=True
            )
        add_functions("readInt", IntType(), {})
        add_functions("readFloat", FloatType(), {})
        add_functions("readString", StringType(), {})
        add_functions("printInt", VoidType(), {"value": IntType()})
        add_functions("printFloat", VoidType(), {"value": FloatType()})
        add_functions("printString", VoidType(), {"value": StringType()})

    def push_scope(self):
        self.scope_stack.append({})

    def pop_scope(self):
        self.scope_stack.pop()

    def declare_variable(self, name: str, var_type: Optional[Type], decl=None):
        current_scope = self.scope_stack[-1]
        if name in current_scope:
            raise Redeclared("Variable", name)
        if self.current_func and name in self.current_func.params:
            if not isinstance(decl, Param):
                raise Redeclared("Variable", name)
        sym = StaticChecker.VariableSymbol(name=name, decl=decl, var_type=var_type)
        current_scope[name] = sym
        return sym

    def lookup_variable(self, name: str) -> Optional['StaticChecker.VariableSymbol']:
        for scope in reversed(self.scope_stack):
            if name in scope:
                return scope[name]
        return None

    def same_type(self, t1: Optional[Type], t2: Optional[Type]) -> bool:
        if t1 is None or t2 is None:
            return False
        if type(t1) != type(t2):
            return False
        if isinstance(t1, StructType) and isinstance(t2, StructType):
            return t1.struct_name == t2.struct_name
        return True

    def is_numeric(self, t: Optional[Type]) -> bool:
        return isinstance(t, (IntType, FloatType))

    def is_int(self, t: Optional[Type]) -> bool:
        return isinstance(t, IntType)

    def is_float(self, t: Optional[Type]) -> bool:
        return isinstance(t, FloatType)

    def is_struct(self, t: Optional[Type]) -> bool:
        return isinstance(t, StructType)

    def is_void(self, t: Optional[Type]) -> bool:
        return isinstance(t, VoidType)

    def validate_type(self, t: Type):
        if isinstance(t, StructType):
            if t.struct_name not in self.struct_symbol_table:
                raise UndeclaredStruct(t.struct_name)

    def infer_auto_var(self, sym: 'StaticChecker.VariableSymbol', inferred_type: Type):
        if sym.var_type is None and inferred_type is not None:
            sym.var_type = inferred_type
            sym.inferred = True

    def infer_from_binop(self, expr, other_type, op):
        if isinstance(expr, Identifier):
            sym = self.lookup_variable(expr.name)
            if sym and sym.var_type is None:
                if op in ('+', '-', '*', '/'):
                    if self.is_numeric(other_type):
                        self.infer_auto_var(sym, other_type)
                        return sym.var_type
                elif op == '%':
                    if self.is_int(other_type):
                        self.infer_auto_var(sym, IntType())
                        return sym.var_type
                elif op in ('==', '!=', '<', '<=', '>', '>='):
                    if self.is_numeric(other_type):
                        self.infer_auto_var(sym, other_type)
                        return sym.var_type
                elif op in ('&&', '||'):
                    if self.is_int(other_type):
                        self.infer_auto_var(sym, IntType())
                        return sym.var_type
        return None

    def _check_unused_auto(self, block_node):
        if not self.scope_stack:
            return
        current_scope = self.scope_stack[-1]
        for name, sym in current_scope.items():
            if sym.var_type is None:
                raise TypeCannotBeInferred(block_node)

    def check_program(self, ast):
        self.struct_symbol_table = {}
        self.func_symbol_table = {}
        self.scope_stack = []
        self.current_func = None
        self.loop_depth = 0
        self.switch_depth = 0
        self.register_build_in_functions()        
        self.visit(ast)

    # ==================== VISITOR METHODS ====================

    def visit_program(self, node: "Program", o: Any = None):
        for decl in node.decls:
            if isinstance(decl, StructDecl):
                self.visit_struct_decl(decl)
            elif isinstance(decl, FuncDecl):
                self.visit_func_decl(decl, "register")

        if "main" not in self.func_symbol_table:
            raise UndeclaredFunction("main")
        main_sym = self.func_symbol_table.get("main")
        if not main_sym.is_build_in:
            if main_sym.decl is not None:
                if main_sym.decl.params:
                    raise UndeclaredFunction("main")
                if main_sym.return_type is not None and not isinstance(main_sym.return_type, VoidType):
                    raise UndeclaredFunction("main")

        for decl in node.decls:
            if isinstance(decl, FuncDecl):
                self.visit_func_decl(decl, "check")

    def visit_struct_decl(self, node: "StructDecl", o: Any = None):
        if node.name in self.struct_symbol_table:
            raise Redeclared("Struct", node.name)

        members = {}
        for member in node.members:
            self.visit_member_decl(member, (node, members))

        self.struct_symbol_table[node.name] = StaticChecker.StructSymbol(name=node.name, decl=node, members=members)

    def visit_member_decl(self, node: "MemberDecl", o: Any = None):
        parent_node, members = o
        if node.name in members:
            raise Redeclared("Member", node.name)
        mtype = node.member_type
        if isinstance(mtype, VoidType):
            raise TypeMismatchInStatement(parent_node)
        if mtype is None:
            raise TypeMismatchInStatement(parent_node)
        self.validate_type(mtype)
        members[node.name] = mtype

    def visit_func_decl(self, node: "FuncDecl", o: Any = None):
        if o == "register":
            if node.name in self.func_symbol_table:
                raise Redeclared("Function", node.name)

            params = {}
            for param in node.params:
                self.visit_param(param, (node, params))

            return_type = node.return_type
            if return_type is not None:
                if isinstance(return_type, StructType):
                    self.validate_type(return_type)

            self.func_symbol_table[node.name] = StaticChecker.FunctionSymbol(name=node.name, decl=node, return_type=return_type, params=params)
        
        elif o == "check":
            func_sym = self.func_symbol_table.get(node.name)
            prev_func = self.current_func
            self.current_func = func_sym

            self.push_scope()
            for param in node.params:
                self.declare_variable(param.name, param.param_type, param)

            if isinstance(node.body, BlockStmt):
                for stmt in node.body.statements:
                    self.visit(stmt)
                self._check_unused_auto(node.body)
            else:
                self.visit(node.body)
            self.pop_scope()
            self.current_func = prev_func

    def visit_param(self, node: "Param", o: Any = None):
        parent_node, params = o
        if node.name in params:
            raise Redeclared("Parameter", node.name)
        ptype = node.param_type
        if ptype is None:
            raise TypeMismatchInStatement(parent_node)
        if isinstance(ptype, VoidType):
            raise TypeMismatchInStatement(parent_node)
        self.validate_type(ptype)
        params[node.name] = ptype

    def visit_int_type(self, node: "IntType", o: Any = None):
        return node

    def visit_float_type(self, node: "FloatType", o: Any = None):
        return node

    def visit_string_type(self, node: "StringType", o: Any = None):
        return node

    def visit_void_type(self, node: "VoidType", o: Any = None):
        return node

    def visit_struct_type(self, node: "StructType", o: Any = None):
        if node.struct_name not in self.struct_symbol_table:
            raise UndeclaredStruct(node.struct_name)
        return node

    # ==================== STATEMENTS ====================

    def visit_block_stmt(self, node: "BlockStmt", o: Any = None):
        self.push_scope()
        for stmt in node.statements:
            self.visit(stmt)
        self._check_unused_auto(node)
        self.pop_scope()

    def visit_var_decl(self, node: "VarDecl", o: Any = None):
        var_type = node.var_type

        if var_type is not None:
            if isinstance(var_type, VoidType):
                raise TypeMismatchInStatement(node)
            self.validate_type(var_type)

        if node.init_value is not None:
            if var_type is None:
                if isinstance(node.init_value, StructLiteral):
                    raise TypeCannotBeInferred(node)
                init_type = self.visit(node.init_value)
                if init_type is None:
                    raise TypeCannotBeInferred(node)
                if isinstance(init_type, VoidType):
                    raise TypeMismatchInStatement(node)
                var_type = init_type
            else:
                if isinstance(node.init_value, StructLiteral):
                    self.visit_struct_literal(node.init_value, var_type)
                    init_type = var_type
                else:
                    init_type = self.visit(node.init_value)
                    if init_type is None:
                        raise TypeCannotBeInferred(node)
                    if not self.same_type(var_type, init_type):
                        raise TypeMismatchInStatement(node)
        self.declare_variable(node.name, var_type, node)

    def visit_if_stmt(self, node: "IfStmt", o: Any = None):
        cond_type = self.visit(node.condition)
        if not self.is_int(cond_type):
            raise TypeMismatchInStatement(node)
        self.visit(node.then_stmt)
        if node.else_stmt:
            self.visit(node.else_stmt)

    def visit_while_stmt(self, node: "WhileStmt", o: Any = None):
        cond_type = self.visit(node.condition)
        if not self.is_int(cond_type):
            raise TypeMismatchInStatement(node)
        self.loop_depth += 1
        self.visit(node.body)
        self.loop_depth -= 1

    def visit_for_stmt(self, node: "ForStmt", o: Any = None):
        if node.init:
            self.visit(node.init)
        self.push_scope()
        if node.condition:
            cond_type = self.visit(node.condition)
            if not self.is_int(cond_type):
                raise TypeMismatchInStatement(node)
        if node.update:
            self.visit(node.update)
        self.loop_depth += 1
        self.visit(node.body)
        self.loop_depth -= 1
        self.pop_scope()

    def visit_switch_stmt(self, node: "SwitchStmt", o: Any = None):
        expr_type = self.visit(node.expr)
        if not self.is_int(expr_type):
            raise TypeMismatchInStatement(node)
        self.switch_depth += 1
        for case in node.cases:
            self.visit(case)
        if node.default_case:
            self.visit(node.default_case)
        self.switch_depth -= 1

    def visit_case_stmt(self, node: "CaseStmt", o: Any = None):
        case_type = self.visit(node.expr)
        if not self.is_int(case_type):
            raise TypeMismatchInStatement(node)
        for stmt in node.statements:
            self.visit(stmt)

    def visit_default_stmt(self, node: "DefaultStmt", o: Any = None):
        for stmt in node.statements:
            self.visit(stmt)

    def visit_break_stmt(self, node: "BreakStmt", o: Any = None):
        if self.loop_depth == 0 and self.switch_depth == 0:
            raise MustInLoop(node)

    def visit_continue_stmt(self, node: "ContinueStmt", o: Any = None):
        if self.loop_depth == 0:
            raise MustInLoop(node)

    def visit_return_stmt(self, node: "ReturnStmt", o: Any = None):
        if self.current_func is None:
            return

        func_ret_type = self.current_func.return_type

        if node.expr is None:
            if func_ret_type is None:
                self.current_func.return_type = VoidType()
            elif not self.is_void(func_ret_type):
                raise TypeMismatchInStatement(node)
        else:
            if isinstance(node.expr, StructLiteral):
                if func_ret_type is None:
                    raise TypeCannotBeInferred(node)
                if self.is_void(func_ret_type):
                    raise TypeMismatchInStatement(node)
                self.visit_struct_literal(node.expr, func_ret_type)
                expr_type = func_ret_type
            else:
                expr_type = self.visit(node.expr)

            if expr_type is None:
                raise TypeCannotBeInferred(node)

            if self.is_void(expr_type):
                raise TypeMismatchInStatement(node)

            if func_ret_type is None:
                self.current_func.return_type = expr_type
            elif self.is_void(func_ret_type):
                raise TypeMismatchInStatement(node)
            elif not self.same_type(func_ret_type, expr_type):
                raise TypeMismatchInStatement(node)

    def visit_expr_stmt(self, node: "ExprStmt", o: Any = None):
        if isinstance(node.expr, AssignExpr):
            self.visit(node.expr, "statement")
        else:
            self.visit(node.expr)

    # ==================== EXPRESSIONS ====================

    def visit_binary_op(self, node: "BinaryOp", o: Any = None):
        op = node.operator
        if isinstance(node.left, StructLiteral) or isinstance(node.right, StructLiteral):
            raise TypeMismatchInExpression(node)

        left_type = self.visit(node.left)
        right_type = self.visit(node.right)

        if left_type is None and right_type is not None:
            left_type = self.infer_from_binop(node.left, right_type, op)
        if right_type is None and left_type is not None:
            right_type = self.infer_from_binop(node.right, left_type, op)

        if left_type is None:
            raise TypeCannotBeInferred(node)

        if right_type is None:
            raise TypeCannotBeInferred(node)

        if op in ('+', '-', '*', '/'):
            if not self.is_numeric(left_type) or not self.is_numeric(right_type):
                raise TypeMismatchInExpression(node)

            if self.is_int(left_type) and self.is_int(right_type):
                return IntType()
            return FloatType()

        elif op == '%':
            if not self.is_int(left_type) or not self.is_int(right_type):
                raise TypeMismatchInExpression(node)
            return IntType()

        elif op in ('==', '!=', '<', '<=', '>', '>='):
            if not self.is_numeric(left_type) or not self.is_numeric(right_type):
                raise TypeMismatchInExpression(node)
            return IntType()

        elif op in ('&&', '||'):
            if not self.is_int(left_type) or not self.is_int(right_type):
                raise TypeMismatchInExpression(node)
            return IntType()

        raise TypeMismatchInExpression(node)

    def visit_prefix_op(self, node: "PrefixOp", o: Any = None):
        op = node.operator
        operand_type = self.visit(node.operand)

        if operand_type is None:
            if isinstance(node.operand, Identifier):
                sym = self.lookup_variable(node.operand.name)
                if sym and sym.var_type is None:
                    if op in ('++', '--', '!'):
                        self.infer_auto_var(sym, IntType())
                        operand_type = IntType()
                    elif op in ('+', '-'):
                        raise TypeCannotBeInferred(node)
            if operand_type is None:
                raise TypeMismatchInExpression(node)

        if op == '!':
            if not self.is_int(operand_type):
                raise TypeMismatchInExpression(node)
            return IntType()

        if op in ('+', '-'):
            if not self.is_numeric(operand_type):
                raise TypeMismatchInExpression(node)
            return operand_type

        if op in ('++', '--'):
            if not self.is_int(operand_type):
                raise TypeMismatchInExpression(node)
            if not isinstance(node.operand, (Identifier, MemberAccess)):
                raise TypeMismatchInExpression(node)
            return IntType()
        raise TypeMismatchInExpression(node)

    def visit_postfix_op(self, node: "PostfixOp", o: Any = None):
        op = node.operator
        operand_type = self.visit(node.operand)

        if operand_type is None:
            if isinstance(node.operand, Identifier):
                sym = self.lookup_variable(node.operand.name)
                if sym and sym.var_type is None:
                    if op in ('++', '--'):
                        self.infer_auto_var(sym, IntType())
                        operand_type = IntType()
            if operand_type is None:
                raise TypeMismatchInExpression(node)

        if op in ('++', '--'):
            if not self.is_int(operand_type):
                raise TypeMismatchInExpression(node)
            if not isinstance(node.operand, (Identifier, MemberAccess)):
                raise TypeMismatchInExpression(node)
            return IntType()
        raise TypeMismatchInExpression(node)

    def visit_assign_expr(self, node: "AssignExpr", o: Any = None):
        is_statement = (o == "statement")
        
        if not isinstance(node.lhs, (Identifier, MemberAccess)):
            raise TypeMismatchInExpression(node)

        lhs_type = self.visit(node.lhs)

        if isinstance(node.rhs, StructLiteral):
            if lhs_type is None:
                raise TypeCannotBeInferred(node)
            if not self.is_struct(lhs_type):
                raise TypeMismatchInExpression(node)
            self.visit_struct_literal(node.rhs, lhs_type)
            return lhs_type

        rhs_type = self.visit(node.rhs)

        if lhs_type is None and rhs_type is None:
            raise TypeCannotBeInferred(node)

        elif lhs_type is None and rhs_type is not None:
            if isinstance(rhs_type, VoidType):
                if is_statement:
                    raise TypeMismatchInStatement(node)
                raise TypeMismatchInExpression(node)
            if isinstance(node.lhs, Identifier):
                sym = self.lookup_variable(node.lhs.name)
                if sym:
                    self.infer_auto_var(sym, rhs_type)
                    lhs_type = sym.var_type
            if lhs_type is None:
                raise TypeCannotBeInferred(node)

        elif lhs_type is not None and rhs_type is None:
            if isinstance(node.rhs, Identifier):
                sym = self.lookup_variable(node.rhs.name)
                if sym and sym.var_type is None:
                    self.infer_auto_var(sym, lhs_type)
                    rhs_type = sym.var_type
            if rhs_type is None:
                raise TypeCannotBeInferred(node)

        if not self.same_type(lhs_type, rhs_type):
            if is_statement:
                raise TypeMismatchInStatement(node)
            raise TypeMismatchInExpression(node)
        return lhs_type

    def visit_member_access(self, node: "MemberAccess", o: Any = None):
        obj_type = self.visit(node.obj)

        if obj_type is None:
            raise TypeMismatchInExpression(node)

        if not self.is_struct(obj_type):
            raise TypeMismatchInExpression(node)

        struct_name = obj_type.struct_name
        if struct_name not in self.struct_symbol_table:
            raise UndeclaredStruct(struct_name)

        struct_sym = self.struct_symbol_table.get(struct_name)
        if node.member not in struct_sym.members:
            raise TypeMismatchInExpression(node)
        return struct_sym.members[node.member]

    def visit_func_call(self, node: "FuncCall", o: Any = None):
        if node.name not in self.func_symbol_table:
            raise UndeclaredFunction(node.name)

        func_sym = self.func_symbol_table.get(node.name)

        param_list = list(func_sym.params.items())
        if len(node.args) != len(param_list):
            raise TypeMismatchInExpression(node)

        for i, arg in enumerate(node.args):
            param_name, param_type = param_list[i]
            if isinstance(arg, StructLiteral):
                if not self.is_struct(param_type):
                    raise TypeMismatchInExpression(node)
                self.visit_struct_literal(arg, param_type)
                continue

            arg_type = self.visit(arg)

            if arg_type is None:
                if isinstance(arg, Identifier):
                    sym = self.lookup_variable(arg.name)
                    if sym and sym.var_type is None:
                        self.infer_auto_var(sym, param_type)
                        arg_type = sym.var_type
                if arg_type is None:
                    raise TypeCannotBeInferred(arg)

            if not self.same_type(arg_type, param_type):
                raise TypeMismatchInExpression(node)
        return func_sym.return_type

    def visit_identifier(self, node: "Identifier", o: Any = None):
        sym = self.lookup_variable(node.name)
        if sym is None:
            raise UndeclaredIdentifier(node.name)
        return sym.var_type

    def visit_struct_literal(self, node: "StructLiteral", o: Any = None):
        if o is None:
            raise TypeCannotBeInferred(node)

        expected_type = o
        if not self.is_struct(expected_type):
            raise TypeMismatchInExpression(node)

        struct_name = expected_type.struct_name
        if struct_name not in self.struct_symbol_table:
            raise UndeclaredStruct(struct_name)

        struct_sym = self.struct_symbol_table.get(struct_name)
        member_list = list(struct_sym.members.items())

        if len(node.values) != len(member_list):
            raise TypeMismatchInExpression(node)

        for i, value_expr in enumerate(node.values):
            member_name, member_type = member_list[i]
            if isinstance(value_expr, StructLiteral):
                self.visit_struct_literal(value_expr, member_type)
            else:
                value_type = self.visit(value_expr)
                if value_type is None:
                    raise TypeCannotBeInferred(value_expr)
                if not self.same_type(value_type, member_type):
                    raise TypeMismatchInExpression(node)

    def visit_int_literal(self, node: "IntLiteral", o: Any = None):
        return IntType()

    def visit_float_literal(self, node: "FloatLiteral", o: Any = None):
        return FloatType()

    def visit_string_literal(self, node: "StringLiteral", o: Any = None):
        return StringType()
