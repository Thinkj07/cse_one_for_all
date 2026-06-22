"""
Code generator for TyC.
"""

import os
from typing import Any

from ..utils.nodes import *
from ..utils.visitor import BaseVisitor
from .emitter import *
from .frame import *
from .io import IO_SYMBOL_LIST
from .utils import *


class StringArrayType:
    """Marker type for JVM main(String[] args)."""
    pass


class CodeGenerator(BaseVisitor):
    """Full AST -> Jasmin code generator for TyC."""

    def __init__(self):
        self.emit = None
        self.functions = {}
        self.structs = {}          # name -> list[MemberDecl]
        self.current_return_type = VoidType()
        self.class_name = "TyC"

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _lookup_symbol(self, name: str, sym_list: list[Symbol]) -> Symbol:
        for sym in reversed(sym_list):
            if sym.name == name:
                return sym
        raise RuntimeError(f"Undeclared symbol: {name}")

    def _infer_type(self, node: Expr, o: Access):
        """Infer the type of an expression without emitting code."""
        if isinstance(node, IntLiteral):
            return IntType()
        if isinstance(node, FloatLiteral):
            return FloatType()
        if isinstance(node, StringLiteral):
            return StringType()
        if isinstance(node, Identifier):
            return self._lookup_symbol(node.name, o.sym).type
        if isinstance(node, AssignExpr):
            if isinstance(node.lhs, Identifier):
                return self._lookup_symbol(node.lhs.name, o.sym).type
            if isinstance(node.lhs, MemberAccess):
                obj_type = self._infer_type(node.lhs.obj, o)
                struct_name = obj_type.struct_name
                for m in self.structs[struct_name]:
                    if m.name == node.lhs.member:
                        return m.member_type
            return self._infer_type(node.rhs, o)
        if isinstance(node, FuncCall):
            return self.functions[node.name].type.return_type
        if isinstance(node, BinaryOp):
            if node.operator in ["+", "-", "*", "/"]:
                lt = self._infer_type(node.left, o)
                rt = self._infer_type(node.right, o)
                if is_float_type(lt) or is_float_type(rt):
                    return FloatType()
                return IntType()
            if node.operator == "%":
                return IntType()
            if node.operator in ["<", "<=", ">", ">=", "==", "!=",
                                  "&&", "||"]:
                return IntType()
        if isinstance(node, PrefixOp):
            if node.operator in ["+", "-"]:
                return self._infer_type(node.operand, o)
            return IntType()  # !, ++, --
        if isinstance(node, PostfixOp):
            return IntType()  # ++, --
        if isinstance(node, MemberAccess):
            obj_type = self._infer_type(node.obj, o)
            struct_name = obj_type.struct_name
            for m in self.structs[struct_name]:
                if m.name == node.member:
                    return m.member_type
        if isinstance(node, StructLiteral):
            # Should be resolved from context; fallback shouldn't happen
            return IntType()
        return IntType()

    def _get_member_type(self, struct_name: str, member_name: str):
        """Get the type of a struct member."""
        for m in self.structs[struct_name]:
            if m.name == member_name:
                return m.member_type
        raise RuntimeError(f"No member {member_name} in struct {struct_name}")

    def _get_struct_name_from_type(self, t) -> str:
        """Extract struct class name from a type node."""
        if hasattr(t, 'struct_name'):
            return t.struct_name
        raise RuntimeError(f"Not a struct type: {t}")

    # ------------------------------------------------------------------
    # Struct class file generation
    # ------------------------------------------------------------------

    def _generate_struct_class(self, name: str, members: list):
        """Generate a .j class file for a struct."""
        runtime_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), "runtime"
        )
        filepath = os.path.join(runtime_dir, f"{name}.j")
        lines = []
        lines.append(f".source {name}.java")
        lines.append(f".class public {name}")
        lines.append(f".super java/lang/Object")
        lines.append("")
        for m in members:
            jvm_type = self.emit.get_jvm_type(m.member_type)
            lines.append(f".field public {m.name} {jvm_type}")
        lines.append("")
        lines.append(".method public <init>()V")
        lines.append("\taload_0")
        lines.append("\tinvokespecial java/lang/Object/<init>()V")
        lines.append("\treturn")
        lines.append(".limit stack 1")
        lines.append(".limit locals 1")
        lines.append(".end method")
        lines.append("")
        with open(filepath, "w") as f:
            f.write("\n".join(lines))

    # ------------------------------------------------------------------
    # Program
    # ------------------------------------------------------------------

    def visit_program(self, node: Program, o: Any = None):
        self.emit = Emitter(f"{self.class_name}.j")

        # Load built-in I/O functions
        for io_sym in IO_SYMBOL_LIST:
            self.functions[io_sym.name] = io_sym

        # First pass: collect struct metadata
        for decl in node.decls:
            if isinstance(decl, StructDecl):
                self.structs[decl.name] = decl.members

        # Generate struct classes
        for decl in node.decls:
            if isinstance(decl, StructDecl):
                self._generate_struct_class(decl.name, decl.members)

        # Second pass: collect function signatures
        for decl in node.decls:
            if isinstance(decl, FuncDecl):
                return_type = decl.return_type if decl.return_type else VoidType()
                param_types = [p.param_type for p in decl.params]
                self.functions[decl.name] = Symbol(
                    decl.name, FunctionType(param_types, return_type), CName(self.class_name)
                )

        # Emit class prolog
        self.emit.print_out(self.emit.emit_prolog(self.class_name))

        # Third pass: generate function bodies
        for decl in node.decls:
            if isinstance(decl, FuncDecl):
                self.visit(decl, None)

        self.emit.emit_epilog()

    # ------------------------------------------------------------------
    # Function Declaration
    # ------------------------------------------------------------------

    def visit_func_decl(self, node: FuncDecl, o: Any = None):
        self.current_return_type = node.return_type if node.return_type else VoidType()
        frame = Frame(node.name, self.current_return_type)
        frame.enter_scope(True)

        if node.name == "main":
            mtype = FunctionType([StringArrayType()], VoidType())
        else:
            mtype = FunctionType([p.param_type for p in node.params], self.current_return_type)

        self.emit.print_out(self.emit.emit_method(node.name, mtype, True))

        start_label = frame.get_start_label()
        end_label = frame.get_end_label()
        self.emit.print_out(self.emit.emit_label(start_label, frame))

        local_syms: list[Symbol] = []
        if node.name == "main":
            args_idx = frame.get_new_index()
            self.emit.print_out(
                self.emit.emit_var(
                    args_idx, "args", StringArrayType(), start_label, end_label
                )
            )

        for param in node.params:
            idx = frame.get_new_index()
            self.emit.print_out(
                self.emit.emit_var(idx, param.name, param.param_type, start_label, end_label)
            )
            local_syms.append(Symbol(param.name, param.param_type, Index(idx)))

        sub_body = SubBody(frame, local_syms)
        self.visit(node.body, sub_body)

        if is_void_type(self.current_return_type):
            self.emit.print_out(self.emit.emit_return(VoidType(), frame))

        self.emit.print_out(self.emit.emit_label(end_label, frame))
        frame.exit_scope()
        self.emit.print_out(self.emit.emit_end_method(frame))

    # ------------------------------------------------------------------
    # Statements
    # ------------------------------------------------------------------

    def visit_block_stmt(self, node: BlockStmt, o: SubBody = None):
        frame = o.frame
        frame.enter_scope(False)
        start_label = frame.get_start_label()
        end_label = frame.get_end_label()
        self.emit.print_out(self.emit.emit_label(start_label, frame))

        saved_sym_len = len(o.sym)

        for stmt in node.statements:
            o = self.visit(stmt, o)

        self.emit.print_out(self.emit.emit_label(end_label, frame))
        frame.exit_scope()

        # Restore symbol table — remove block-local symbols
        o.sym = o.sym[:saved_sym_len]
        return o

    def visit_var_decl(self, node: VarDecl, o: SubBody = None):
        frame = o.frame
        idx = frame.get_new_index()
        var_type = node.var_type if node.var_type else self._infer_type(node.init_value, Access(frame, o.sym))
        self.emit.print_out(
            self.emit.emit_var(
                idx, node.name, var_type, frame.get_start_label(), frame.get_end_label()
            )
        )
        if node.init_value is not None:
            if isinstance(node.init_value, StructLiteral) and is_struct_type(var_type):
                # Pass expected struct type for struct literal
                rhs_code, _ = self._visit_struct_literal_with_type(
                    node.init_value, var_type, Access(frame, o.sym)
                )
            else:
                rhs_code, _ = self.visit(node.init_value, Access(frame, o.sym))
            self.emit.print_out(rhs_code)
            self.emit.print_out(self.emit.emit_write_var(node.name, var_type, idx, frame))
        o.sym.append(Symbol(node.name, var_type, Index(idx)))
        return o

    def visit_expr_stmt(self, node: ExprStmt, o: SubBody = None):
        code, expr_type = self.visit(node.expr, Access(o.frame, o.sym))
        self.emit.print_out(code)
        if not is_void_type(expr_type):
            self.emit.print_out(self.emit.emit_pop(o.frame))
        return o

    def _ends_with_return(self, stmt):
        """Check if a statement always ends with a return (no fall-through)."""
        if isinstance(stmt, ReturnStmt):
            return True
        if isinstance(stmt, BlockStmt):
            if stmt.statements and isinstance(stmt.statements[-1], ReturnStmt):
                return True
            if stmt.statements and isinstance(stmt.statements[-1], IfStmt):
                sub = stmt.statements[-1]
                return (sub.else_stmt is not None
                        and self._ends_with_return(sub.then_stmt)
                        and self._ends_with_return(sub.else_stmt))
        if isinstance(stmt, IfStmt):
            return (stmt.else_stmt is not None
                    and self._ends_with_return(stmt.then_stmt)
                    and self._ends_with_return(stmt.else_stmt))
        return False

    def visit_if_stmt(self, node: IfStmt, o: SubBody = None):
        frame = o.frame
        cond_code, _ = self.visit(node.condition, Access(frame, o.sym))
        else_label = frame.get_new_label()
        end_label = frame.get_new_label()
        self.emit.print_out(cond_code)
        self.emit.print_out(self.emit.emit_if_false(else_label, frame))
        self.visit(node.then_stmt, o)
        # Skip goto if then-branch always returns (avoids dead code after return)
        if not self._ends_with_return(node.then_stmt):
            self.emit.print_out(self.emit.emit_goto(end_label, frame))
        self.emit.print_out(self.emit.emit_label(else_label, frame))
        if node.else_stmt:
            self.visit(node.else_stmt, o)
        self.emit.print_out(self.emit.emit_label(end_label, frame))
        return o

    def visit_while_stmt(self, node: WhileStmt, o: SubBody = None):
        frame = o.frame
        frame.enter_loop()
        con_label = frame.get_continue_label()
        brk_label = frame.get_break_label()
        self.emit.print_out(self.emit.emit_label(con_label, frame))
        cond_code, _ = self.visit(node.condition, Access(frame, o.sym))
        self.emit.print_out(cond_code)
        self.emit.print_out(self.emit.emit_if_false(brk_label, frame))
        self.visit(node.body, o)
        self.emit.print_out(self.emit.emit_goto(con_label, frame))
        self.emit.print_out(self.emit.emit_label(brk_label, frame))
        frame.exit_loop()
        return o

    def visit_for_stmt(self, node: ForStmt, o: SubBody = None):
        frame = o.frame

        # Handle init (VarDecl or ExprStmt or None)
        if node.init is not None:
            if isinstance(node.init, VarDecl):
                o = self.visit(node.init, o)
            elif isinstance(node.init, ExprStmt):
                o = self.visit(node.init, o)
            else:
                # It's an expression used as init
                code, expr_type = self.visit(node.init, Access(frame, o.sym))
                self.emit.print_out(code)
                if not is_void_type(expr_type):
                    self.emit.print_out(self.emit.emit_pop(frame))

        frame.enter_loop()
        con_label = frame.get_continue_label()
        brk_label = frame.get_break_label()

        top_label = frame.get_new_label()
        self.emit.print_out(self.emit.emit_label(top_label, frame))

        # Condition (if None, always true)
        if node.condition is not None:
            cond_code, _ = self.visit(node.condition, Access(frame, o.sym))
            self.emit.print_out(cond_code)
            self.emit.print_out(self.emit.emit_if_false(brk_label, frame))

        # Body
        self.visit(node.body, o)

        # Continue label (update goes here)
        self.emit.print_out(self.emit.emit_label(con_label, frame))

        # Update
        if node.update is not None:
            update_code, update_type = self.visit(node.update, Access(frame, o.sym))
            self.emit.print_out(update_code)
            if not is_void_type(update_type):
                self.emit.print_out(self.emit.emit_pop(frame))

        self.emit.print_out(self.emit.emit_goto(top_label, frame))
        self.emit.print_out(self.emit.emit_label(brk_label, frame))
        frame.exit_loop()
        return o

    def visit_switch_stmt(self, node: SwitchStmt, o: SubBody = None):
        frame = o.frame

        # Evaluate switch expression, store in temp
        expr_code, expr_type = self.visit(node.expr, Access(frame, o.sym))
        self.emit.print_out(expr_code)
        temp_idx = frame.get_new_index()
        self.emit.print_out(self.emit.emit_write_var("$switch", expr_type, temp_idx, frame))

        # Break label for the switch
        brk_label = frame.get_new_label()
        frame.brk_label.append(brk_label)

        # Collect all case/default labels
        all_items = []
        for case in node.cases:
            all_items.append(('case', case))
        if node.default_case:
            all_items.append(('default', node.default_case))

        # Generate comparison labels for each case
        case_labels = []
        for item in all_items:
            case_labels.append(frame.get_new_label())

        # Default label
        default_label = brk_label  # if no default, break out
        end_label = brk_label

        # First: emit comparison jumps
        for i, (kind, item) in enumerate(all_items):
            if kind == 'case':
                self.emit.print_out(self.emit.emit_read_var("$switch", expr_type, temp_idx, frame))
                case_expr_code, _ = self.visit(item.expr, Access(frame, o.sym))
                self.emit.print_out(case_expr_code)
                # Compare
                frame.pop()
                frame.pop()
                self.emit.print_out(self.emit.jvm.emitIFICMPEQ(case_labels[i]))
            elif kind == 'default':
                default_label = case_labels[i]

        # Jump to default (or break if no default)
        self.emit.print_out(self.emit.emit_goto(default_label, frame))

        # Second: emit case bodies with fall-through
        for i, (kind, item) in enumerate(all_items):
            self.emit.print_out(self.emit.emit_label(case_labels[i], frame))
            stmts = item.statements
            for stmt in stmts:
                self.visit(stmt, o)

        # Break label
        self.emit.print_out(self.emit.emit_label(brk_label, frame))
        frame.brk_label.pop()
        return o

    def visit_break_stmt(self, node: BreakStmt, o: SubBody = None):
        frame = o.frame
        self.emit.print_out(self.emit.emit_goto(frame.get_break_label(), frame))
        return o

    def visit_continue_stmt(self, node: ContinueStmt, o: SubBody = None):
        frame = o.frame
        self.emit.print_out(self.emit.emit_goto(frame.get_continue_label(), frame))
        return o

    def visit_return_stmt(self, node: ReturnStmt, o: SubBody = None):
        if node.expr is None:
            self.emit.print_out(self.emit.emit_return(VoidType(), o.frame))
            return o
        code, ret_type = self.visit(node.expr, Access(o.frame, o.sym))
        self.emit.print_out(code)
        self.emit.print_out(self.emit.emit_return(ret_type, o.frame))
        return o

    # ------------------------------------------------------------------
    # Expressions
    # ------------------------------------------------------------------

    def visit_binary_op(self, node: BinaryOp, o: Access = None):
        frame = o.frame

        # Short-circuit &&
        if node.operator == "&&":
            label_false = frame.get_new_label()
            label_end = frame.get_new_label()

            left_code, _ = self.visit(node.left, o)
            code = left_code
            code += self.emit.emit_if_false(label_false, frame)
            right_code, _ = self.visit(node.right, o)
            code += right_code
            code += self.emit.emit_if_false(label_false, frame)
            code += self.emit.emit_push_iconst(1, frame)
            code += self.emit.emit_goto(label_end, frame)
            code += self.emit.emit_label(label_false, frame)
            code += self.emit.emit_push_iconst(0, frame)
            code += self.emit.emit_label(label_end, frame)
            return code, IntType()

        # Short-circuit ||
        if node.operator == "||":
            label_true = frame.get_new_label()
            label_end = frame.get_new_label()

            left_code, _ = self.visit(node.left, o)
            code = left_code
            code += self.emit.emit_if_true(label_true, frame)
            right_code, _ = self.visit(node.right, o)
            code += right_code
            code += self.emit.emit_if_true(label_true, frame)
            code += self.emit.emit_push_iconst(0, frame)
            code += self.emit.emit_goto(label_end, frame)
            code += self.emit.emit_label(label_true, frame)
            code += self.emit.emit_push_iconst(1, frame)
            code += self.emit.emit_label(label_end, frame)
            return code, IntType()

        left_code, left_type = self.visit(node.left, o)
        right_code, right_type = self.visit(node.right, o)

        if node.operator in ["+", "-"]:
            result_type = FloatType() if is_float_type(left_type) or is_float_type(right_type) else IntType()
            code = left_code
            if is_float_type(result_type) and is_int_type(left_type):
                code += self.emit.emit_i2f(frame)
            code += right_code
            if is_float_type(result_type) and is_int_type(right_type):
                code += self.emit.emit_i2f(frame)
            code += self.emit.emit_add_op(node.operator, result_type, frame)
            return code, result_type

        if node.operator in ["*", "/"]:
            result_type = FloatType() if is_float_type(left_type) or is_float_type(right_type) else IntType()
            code = left_code
            if is_float_type(result_type) and is_int_type(left_type):
                code += self.emit.emit_i2f(frame)
            code += right_code
            if is_float_type(result_type) and is_int_type(right_type):
                code += self.emit.emit_i2f(frame)
            code += self.emit.emit_mul_op(node.operator, result_type, frame)
            return code, result_type

        if node.operator == "%":
            return left_code + right_code + self.emit.emit_mod(frame), IntType()

        if node.operator in ["<", "<=", ">", ">=", "==", "!="]:
            op_type = FloatType() if is_float_type(left_type) or is_float_type(right_type) else IntType()
            code = left_code
            if is_float_type(op_type) and is_int_type(left_type):
                code += self.emit.emit_i2f(frame)
            code += right_code
            if is_float_type(op_type) and is_int_type(right_type):
                code += self.emit.emit_i2f(frame)
            code += self.emit.emit_re_op(node.operator, op_type, frame)
            return code, IntType()

        raise RuntimeError(f"Unsupported operator: {node.operator}")

    def visit_prefix_op(self, node: PrefixOp, o: Access = None):
        frame = o.frame

        if node.operator == "+":
            return self.visit(node.operand, o)

        if node.operator == "-":
            code, typ = self.visit(node.operand, o)
            code += self.emit.emit_neg_op(typ, frame)
            return code, typ

        if node.operator == "!":
            # Logical not: if operand is 0 -> 1, else -> 0
            label_false = frame.get_new_label()
            label_end = frame.get_new_label()
            code, _ = self.visit(node.operand, o)
            code += self.emit.emit_if_false(label_false, frame)
            code += self.emit.emit_push_iconst(0, frame)
            code += self.emit.emit_goto(label_end, frame)
            code += self.emit.emit_label(label_false, frame)
            code += self.emit.emit_push_iconst(1, frame)
            code += self.emit.emit_label(label_end, frame)
            return code, IntType()

        if node.operator in ["++", "--"]:
            # Prefix increment/decrement: mutate, return new value
            if isinstance(node.operand, Identifier):
                sym = self._lookup_symbol(node.operand.name, o.sym)
                idx = sym.value.value
                code = self.emit.emit_read_var(node.operand.name, sym.type, idx, frame)
                code += self.emit.emit_push_iconst(1, frame)
                if node.operator == "++":
                    code += self.emit.emit_add_op("+", IntType(), frame)
                else:
                    code += self.emit.emit_add_op("-", IntType(), frame)
                code += self.emit.emit_dup(frame)
                code += self.emit.emit_write_var(node.operand.name, sym.type, idx, frame)
                return code, IntType()

            if isinstance(node.operand, MemberAccess):
                obj_type = self._infer_type(node.operand.obj, o)
                struct_name = self._get_struct_name_from_type(obj_type)
                member_type = self._get_member_type(struct_name, node.operand.member)
                field_spec = f"{struct_name}/{node.operand.member}"

                obj_code, _ = self.visit(node.operand.obj, o)
                code = obj_code
                code += self.emit.emit_dup(frame)  # dup obj ref
                code += self.emit.emit_get_field(field_spec, member_type, frame)
                code += self.emit.emit_push_iconst(1, frame)
                if node.operator == "++":
                    code += self.emit.emit_add_op("+", IntType(), frame)
                else:
                    code += self.emit.emit_add_op("-", IntType(), frame)
                # Stack: [obj_ref, new_value]
                code += self.emit.emit_dup_x1(frame)  # [new_value, obj_ref, new_value]
                code += self.emit.emit_put_field(field_spec, member_type, frame)
                return code, IntType()

        raise RuntimeError(f"Unsupported prefix operator: {node.operator}")

    def visit_postfix_op(self, node: PostfixOp, o: Access = None):
        frame = o.frame

        if isinstance(node.operand, Identifier):
            sym = self._lookup_symbol(node.operand.name, o.sym)
            idx = sym.value.value
            # Load old value (this is the return value)
            code = self.emit.emit_read_var(node.operand.name, sym.type, idx, frame)
            # Compute new value
            code += self.emit.emit_read_var(node.operand.name, sym.type, idx, frame)
            code += self.emit.emit_push_iconst(1, frame)
            if node.operator == "++":
                code += self.emit.emit_add_op("+", IntType(), frame)
            else:
                code += self.emit.emit_add_op("-", IntType(), frame)
            code += self.emit.emit_write_var(node.operand.name, sym.type, idx, frame)
            return code, IntType()

        if isinstance(node.operand, MemberAccess):
            obj_type = self._infer_type(node.operand.obj, o)
            struct_name = self._get_struct_name_from_type(obj_type)
            member_type = self._get_member_type(struct_name, node.operand.member)
            field_spec = f"{struct_name}/{node.operand.member}"

            obj_code, _ = self.visit(node.operand.obj, o)
            code = obj_code
            code += self.emit.emit_dup(frame)  # dup obj ref for later putfield
            code += self.emit.emit_get_field(field_spec, member_type, frame)
            # Stack: [obj_ref, old_value]
            code += self.emit.emit_dup_x1(frame)  # [old_value, obj_ref, old_value]
            code += self.emit.emit_push_iconst(1, frame)
            if node.operator == "++":
                code += self.emit.emit_add_op("+", IntType(), frame)
            else:
                code += self.emit.emit_add_op("-", IntType(), frame)
            # Stack: [old_value, obj_ref, new_value]
            code += self.emit.emit_put_field(field_spec, member_type, frame)
            # Stack: [old_value] -- return value
            return code, IntType()

        raise RuntimeError(f"Unsupported postfix operand: {type(node.operand)}")

    def visit_assign_expr(self, node: AssignExpr, o: Access = None):
        frame = o.frame

        if isinstance(node.lhs, Identifier):
            lhs_sym = self._lookup_symbol(node.lhs.name, o.sym)
            idx = lhs_sym.value.value
            lhs_type = lhs_sym.type

            if isinstance(node.rhs, StructLiteral) and is_struct_type(lhs_type):
                rhs_code, rhs_type = self._visit_struct_literal_with_type(
                    node.rhs, lhs_type, o
                )
            else:
                rhs_code, rhs_type = self.visit(node.rhs, o)

            code = rhs_code
            code += self.emit.emit_dup(frame)
            code += self.emit.emit_write_var(node.lhs.name, lhs_type, idx, frame)
            return code, lhs_type

        if isinstance(node.lhs, MemberAccess):
            obj_type = self._infer_type(node.lhs.obj, o)
            struct_name = self._get_struct_name_from_type(obj_type)
            member_type = self._get_member_type(struct_name, node.lhs.member)
            field_spec = f"{struct_name}/{node.lhs.member}"

            obj_code, _ = self.visit(node.lhs.obj, o)

            if isinstance(node.rhs, StructLiteral) and is_struct_type(member_type):
                rhs_code, rhs_type = self._visit_struct_literal_with_type(
                    node.rhs, member_type, o
                )
            else:
                rhs_code, rhs_type = self.visit(node.rhs, o)

            # Stack: [obj, value] -> need to dup value for expression result
            code = obj_code + rhs_code
            code += self.emit.emit_dup_x1(frame)  # [value, obj, value]
            code += self.emit.emit_put_field(field_spec, member_type, frame)
            return code, member_type

        raise RuntimeError(f"Invalid LHS for assignment: {type(node.lhs)}")

    def visit_member_access(self, node: MemberAccess, o: Access = None):
        obj_code, obj_type = self.visit(node.obj, o)
        struct_name = self._get_struct_name_from_type(obj_type)
        member_type = self._get_member_type(struct_name, node.member)
        field_spec = f"{struct_name}/{node.member}"
        code = obj_code + self.emit.emit_get_field(field_spec, member_type, o.frame)
        return code, member_type

    def visit_struct_literal(self, node: StructLiteral, o: Access = None):
        # This shouldn't normally be called without context
        # It will be called through _visit_struct_literal_with_type
        raise RuntimeError("StructLiteral needs expected type context")

    def _visit_struct_literal_with_type(self, node: StructLiteral, expected_type, o: Access):
        """Generate code for a struct literal given the expected struct type."""
        frame = o.frame
        struct_name = self._get_struct_name_from_type(expected_type)
        members = self.structs[struct_name]

        code = self.emit.emit_new_instance(struct_name, frame)

        for i, (member, value) in enumerate(zip(members, node.values)):
            code += self.emit.emit_dup(frame)  # dup object ref for putfield
            if isinstance(value, StructLiteral) and is_struct_type(member.member_type):
                val_code, _ = self._visit_struct_literal_with_type(
                    value, member.member_type, o
                )
            else:
                val_code, _ = self.visit(value, o)
            code += val_code
            field_spec = f"{struct_name}/{member.name}"
            code += self.emit.emit_put_field(field_spec, member.member_type, frame)

        return code, expected_type

    def visit_func_call(self, node: FuncCall, o: Access = None):
        frame = o.frame
        fn_sym = self.functions[node.name]
        fn_type = fn_sym.type
        code = ""
        for i, arg in enumerate(node.args):
            if isinstance(arg, StructLiteral) and i < len(fn_type.param_types) and is_struct_type(fn_type.param_types[i]):
                arg_code, _ = self._visit_struct_literal_with_type(
                    arg, fn_type.param_types[i], o
                )
            else:
                arg_code, _ = self.visit(arg, o)
            code += arg_code
        code += self.emit.emit_invoke_static(f"{fn_sym.value.value}/{node.name}", fn_type, frame)
        return code, fn_type.return_type

    def visit_identifier(self, node: Identifier, o: Access = None):
        sym = self._lookup_symbol(node.name, o.sym)
        return self.emit.emit_read_var(node.name, sym.type, sym.value.value, o.frame), sym.type

    def visit_int_literal(self, node: IntLiteral, o: Access = None):
        return self.emit.emit_push_iconst(node.value, o.frame), IntType()

    def visit_float_literal(self, node: FloatLiteral, o: Access = None):
        return self.emit.emit_push_fconst(str(node.value), o.frame), FloatType()

    def visit_string_literal(self, node: StringLiteral, o: Access = None):
        return self.emit.emit_push_const(node.value, StringType(), o.frame), StringType()

    # ------------------------------------------------------------------
    # No-op visitors for types and non-codegen nodes
    # ------------------------------------------------------------------

    def visit_struct_decl(self, node: StructDecl, o: Any = None):
        return None

    def visit_member_decl(self, node: MemberDecl, o: Any = None):
        return None

    def visit_param(self, node: Param, o: Any = None):
        return None

    def visit_int_type(self, node: IntType, o: Any = None):
        return node

    def visit_float_type(self, node: FloatType, o: Any = None):
        return node

    def visit_string_type(self, node: StringType, o: Any = None):
        return node

    def visit_void_type(self, node: VoidType, o: Any = None):
        return node

    def visit_struct_type(self, node: StructType, o: Any = None):
        return node

    def visit_case_stmt(self, node: CaseStmt, o: Any = None):
        # Handled inline by visit_switch_stmt
        return None

    def visit_default_stmt(self, node: DefaultStmt, o: Any = None):
        # Handled inline by visit_switch_stmt
        return None
