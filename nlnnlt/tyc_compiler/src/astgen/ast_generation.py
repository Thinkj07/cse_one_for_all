"""
AST Generation module for TyC programming language.
This module contains the ASTGeneration class that converts parse trees
into Abstract Syntax Trees using the visitor pattern.
"""

from functools import reduce
from build.TyCVisitor import TyCVisitor
from build.TyCParser import TyCParser
from src.utils.nodes import *


class ASTGeneration(TyCVisitor):
    """AST Generation visitor for TyC language."""
    def visitProgram(self, ctx:TyCParser.ProgramContext):
        decls = self.visit(ctx.decl_list())
        return Program(decls)

    def visitDecl_list(self, ctx:TyCParser.Decl_listContext):
        if ctx.getChildCount() == 0:
            return []
        else:
            current_decl = self.visit(ctx.decl())
            remaining_decls = self.visit(ctx.decl_list())
            return [current_decl] + remaining_decls

    def visitDecl(self, ctx:TyCParser.DeclContext):
        if ctx.struct_decl():
            return self.visit(ctx.struct_decl())
        elif ctx.func_decl():
            return self.visit(ctx.func_decl())

    def visitStruct_decl(self, ctx:TyCParser.Struct_declContext):
        name = ctx.ID().getText()
        members = self.visit(ctx.member_list())
        return StructDecl(name, members)

    def visitMember_list(self, ctx:TyCParser.Member_listContext):
        if ctx.getChildCount() == 0:
            return []
        else:
            current_member = self.visit(ctx.member())
            remaining_members = self.visit(ctx.member_list())
            return [current_member] + remaining_members

    def visitMember(self, ctx:TyCParser.MemberContext):
        if ctx.AUTO():
            member_type = None
        elif ctx.VOID():
            member_type = VoidType()
        else:
            member_type = self.visit(ctx.var_typ())
        name = ctx.ID().getText()
        return MemberDecl(member_type, name)
    
    def visitFunc_decl(self, ctx:TyCParser.Func_declContext):
        return_type = None
        name = ctx.ID().getText()
        params = self.visit(ctx.param_list_opt())
        body = self.visit(ctx.block_stmt())
        if ctx.typ():
            return_type = self.visit(ctx.typ())
        return FuncDecl(return_type, name, params, body)
        
    def visitParam_list_opt(self, ctx:TyCParser.Param_list_optContext):
        if ctx.getChildCount() == 0:
            return []
        else:
            return self.visit(ctx.param_list())

    def visitParam_list(self, ctx:TyCParser.Param_listContext):
        current_param = self.visit(ctx.param())
        if ctx.param_list():
            remaining_params = self.visit(ctx.param_list())
            return [current_param] + remaining_params
        else:
            return [current_param]

    def visitParam(self, ctx:TyCParser.ParamContext):
        param_type = None
        if ctx.VOID():
            param_type = VoidType()
        elif ctx.AUTO():
            param_type = None
        else:
            param_type = self.visit(ctx.var_typ())
        name = ctx.ID().getText()
        return Param(param_type, name)

    def visitTyp(self, ctx:TyCParser.TypContext):
        if ctx.INT():
            return IntType()
        elif ctx.FLOAT():
            return FloatType()
        elif ctx.STRING():
            return StringType()
        elif ctx.VOID():
            return VoidType()
        elif ctx.ID():
            struct_name = ctx.ID().getText()
            return StructType(struct_name)

    def visitVar_typ(self, ctx:TyCParser.Var_typContext):
        if ctx.INT():
            return IntType()
        elif ctx.FLOAT():
            return FloatType()
        elif ctx.STRING():
            return StringType()
        elif ctx.ID():
            struct_name = ctx.ID().getText()
            return StructType(struct_name)

    def visitBlock_stmt(self, ctx:TyCParser.Block_stmtContext):
        statements = self.visit(ctx.stmt_list())
        return BlockStmt(statements)

    def visitStmt_list(self, ctx:TyCParser.Stmt_listContext):
        if ctx.getChildCount() == 0:
            return []
        else:
            current_stmt = self.visit(ctx.stmt())
            remaining_stmts = self.visit(ctx.stmt_list())
            return [current_stmt] + remaining_stmts

    def visitStmt(self, ctx:TyCParser.StmtContext):
        if ctx.var_decl_stmt():
            return self.visit(ctx.var_decl_stmt())
        elif ctx.block_stmt():
            return self.visit(ctx.block_stmt())
        elif ctx.if_stmt():
            return self.visit(ctx.if_stmt())
        elif ctx.while_stmt():
            return self.visit(ctx.while_stmt())
        elif ctx.for_stmt():
            return self.visit(ctx.for_stmt())
        elif ctx.switch_stmt():
            return self.visit(ctx.switch_stmt())
        elif ctx.break_stmt():
            return self.visit(ctx.break_stmt())
        elif ctx.continue_stmt():
            return self.visit(ctx.continue_stmt())
        elif ctx.return_stmt():
            return self.visit(ctx.return_stmt())
        elif ctx.expr_stmt():
            return self.visit(ctx.expr_stmt())

    def visitVar_decl_stmt(self, ctx:TyCParser.Var_decl_stmtContext):
        var_type = None
        name = ctx.ID().getText()
        init_value = self.visit(ctx.var_init_opt())
        if ctx.AUTO():
            var_type = None
        else:
            var_type = self.visit(ctx.var_typ())
        return VarDecl(var_type, name, init_value)

    def visitVar_init_opt(self, ctx:TyCParser.Var_init_optContext):
        if ctx.getChildCount() == 0:
            return None
        else:
            return self.visit(ctx.expr())

    def visitIf_stmt(self, ctx:TyCParser.If_stmtContext):
        condition = self.visit(ctx.expr())
        then_stmt = self.visit(ctx.stmt())
        else_stmt = self.visit(ctx.else_part())
        return IfStmt(condition, then_stmt, else_stmt)

    def visitElse_part(self, ctx:TyCParser.Else_partContext):
        if ctx.getChildCount() == 0:
            return None
        else:
            return self.visit(ctx.stmt())

    def visitWhile_stmt(self, ctx:TyCParser.While_stmtContext):
        condition = self.visit(ctx.expr())
        body = self.visit(ctx.stmt())
        return WhileStmt(condition, body)

    def visitFor_stmt(self, ctx:TyCParser.For_stmtContext):
        init = self.visit(ctx.for_init())
        cond = self.visit(ctx.for_cond())
        update = self.visit(ctx.for_update())
        body = self.visit(ctx.stmt())
        return ForStmt(init, cond, update, body)
    
    def visitFor_init(self, ctx:TyCParser.For_initContext):
        if ctx.getChildCount() == 0:
            return None
        elif ctx.AUTO():
            name = ctx.ID().getText()
            init_value = self.visit(ctx.var_init_opt())
            return VarDecl(None, name, init_value)
        elif ctx.var_typ():
            var_type = self.visit(ctx.var_typ())
            name = ctx.ID().getText()
            init_value = self.visit(ctx.var_init_opt())
            return VarDecl(var_type, name, init_value)
        else:
            lhs = self.visit(ctx.lvalue()) 
            rhs = self.visit(ctx.expr())
            assign_expr = AssignExpr(lhs, rhs)
            return ExprStmt(assign_expr)

    def visitFor_cond(self, ctx:TyCParser.For_condContext):
        if ctx.getChildCount() == 0:
            return None
        return self.visit(ctx.expr())

    def visitFor_update(self, ctx:TyCParser.For_updateContext):
        if ctx.getChildCount() == 0:
            return None
        if ctx.ASSIGN():
            lhs = self.visit(ctx.lvalue())
            rhs = self.visit(ctx.expr())
            return AssignExpr(lhs, rhs)
        lvalue_node = self.visit(ctx.lvalue())
        operator = "++" if ctx.INC() else "--"
        first_child_text = ctx.getChild(0).getText()
        if first_child_text in ["++", "--"]:
            return PrefixOp(operator, lvalue_node)
        else:
            return PostfixOp(operator, lvalue_node)

    def visitSwitch_stmt(self, ctx:TyCParser.Switch_stmtContext):
        expr = self.visit(ctx.expr())
        cases, default_case = self.visit(ctx.case_list())
        return SwitchStmt(expr, cases, default_case)

    def visitCase_list(self, ctx:TyCParser.Case_listContext):
        cases_part_1 = self.visit(ctx.case_only_list())
        default_node, cases_part_2 = self.visit(ctx.default_part())
        total_cases = cases_part_1 + cases_part_2
        return total_cases, default_node

    def visitCase_only_list(self, ctx:TyCParser.Case_only_listContext):
        if ctx.getChildCount() == 0:
            return []
        else:
            current_case = self.visit(ctx.case_only())
            remaining_cases = self.visit(ctx.case_only_list())
            return [current_case] + remaining_cases

    def visitCase_only(self, ctx:TyCParser.Case_onlyContext):
        expr = self.visit(ctx.const_expr())
        statements = self.visit(ctx.stmt_list())
        return CaseStmt(expr, statements)

    def visitDefault_part(self, ctx:TyCParser.Default_partContext):
        if ctx.getChildCount() == 0:
            return None, []
        else:
            statements = self.visit(ctx.stmt_list()) 
            default_node = DefaultStmt(statements)
            more_cases = self.visit(ctx.case_only_list())
            return default_node, more_cases

    def visitConst_expr(self, ctx:TyCParser.Const_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.const_term())
        else:
            left = self.visit(ctx.const_expr())
            op = ctx.const_add_op().getText() 
            right = self.visit(ctx.const_term())
            return BinaryOp(left, op, right)

    def visitConst_term(self, ctx:TyCParser.Const_termContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.const_factor())
        else:
            left = self.visit(ctx.const_term())
            operator = ctx.const_mul_op().getText()
            right = self.visit(ctx.const_factor())
            return BinaryOp(left, operator, right)

    def visitConst_factor(self, ctx:TyCParser.Const_factorContext):
        if ctx.INTLIT():
            return IntLiteral(int(ctx.INTLIT().getText()))
        elif ctx.LPAREN():
            return self.visit(ctx.const_expr())
        else:
            operator = ctx.getChild(0).getText()
            operand = self.visit(ctx.const_factor())
            return PrefixOp(operator, operand)

    def visitConst_add_op(self, ctx:TyCParser.Const_add_opContext):
        if ctx.PLUS():
            return ctx.PLUS().getText()
        elif ctx.MINUS():
            return ctx.MINUS().getText()

    def visitConst_mul_op(self, ctx:TyCParser.Const_mul_opContext):
        if ctx.MUL():
            return ctx.MUL().getText()
        elif ctx.DIV():
            return ctx.DIV().getText()
        elif ctx.MOD():
            return ctx.MOD().getText()

    def visitBreak_stmt(self, ctx:TyCParser.Break_stmtContext):
        return BreakStmt()

    def visitContinue_stmt(self, ctx:TyCParser.Continue_stmtContext):
        return ContinueStmt()

    def visitReturn_stmt(self, ctx:TyCParser.Return_stmtContext):
        expr = self.visit(ctx.expr_opt())
        return ReturnStmt(expr)

    def visitExpr_opt(self, ctx:TyCParser.Expr_optContext):
        if ctx.getChildCount() == 0:
            return None
        else:
            return self.visit(ctx.expr())

    def visitExpr_stmt(self, ctx:TyCParser.Expr_stmtContext):
        expr = self.visit(ctx.expr())
        return ExprStmt(expr)

    def visitExpr(self, ctx:TyCParser.ExprContext):
        return self.visit(ctx.assign_expr())

    def visitAssign_expr(self, ctx:TyCParser.Assign_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.or_expr())
        else:
            lhs = self.visit(ctx.lvalue())
            rhs = self.visit(ctx.assign_expr())
            return AssignExpr(lhs, rhs)

    def visitLvalue(self, ctx:TyCParser.LvalueContext):
        if ctx.postfix_expr() is None:
            return Identifier(ctx.ID().getText())
        else:
            obj = self.visit(ctx.postfix_expr())
            member = ctx.ID().getText()
            return MemberAccess(obj, member)

    def visitOr_expr(self, ctx:TyCParser.Or_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.and_expr())
        left = self.visit(ctx.or_expr())
        right = self.visit(ctx.and_expr())
        return BinaryOp(left, "||", right)

    def visitAnd_expr(self, ctx:TyCParser.And_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.eq_expr())
        left = self.visit(ctx.and_expr())
        right = self.visit(ctx.eq_expr())
        return BinaryOp(left, "&&", right)

    def visitEq_expr(self, ctx:TyCParser.Eq_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.rel_expr())
        left = self.visit(ctx.eq_expr())
        operator = ctx.eq_op().getText()
        right = self.visit(ctx.rel_expr())
        return BinaryOp(left, operator, right)

    def visitEq_op(self, ctx:TyCParser.Eq_opContext):
        if ctx.EQ():
            return ctx.EQ().getText()
        elif ctx.NEQ():
            return ctx.NEQ().getText()

    def visitRel_expr(self, ctx:TyCParser.Rel_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.add_expr())
        left = self.visit(ctx.rel_expr())
        operator = ctx.rel_op().getText() 
        right = self.visit(ctx.add_expr())
        return BinaryOp(left, operator, right)

    def visitRel_op(self, ctx:TyCParser.Rel_opContext):
        if ctx.LT():
            return ctx.LT().getText()
        elif ctx.LEQ():
            return ctx.LEQ().getText()
        elif ctx.GT():
            return ctx.GT().getText()
        elif ctx.GEQ():
            return ctx.GEQ().getText()

    def visitAdd_expr(self, ctx:TyCParser.Add_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.mul_expr())
        left = self.visit(ctx.add_expr())
        operator = ctx.add_op().getText()
        right = self.visit(ctx.mul_expr())
        return BinaryOp(left, operator, right)

    def visitAdd_op(self, ctx:TyCParser.Add_opContext):
        if ctx.PLUS():
            return ctx.PLUS().getText()
        elif ctx.MINUS():
            return ctx.MINUS().getText()

    def visitMul_expr(self, ctx:TyCParser.Mul_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.unary_expr())
        left = self.visit(ctx.mul_expr())
        operator = ctx.mul_op().getText() 
        right = self.visit(ctx.unary_expr())
        return BinaryOp(left, operator, right)

    def visitMul_op(self, ctx:TyCParser.Mul_opContext):
        if ctx.MUL():
            return ctx.MUL().getText()
        elif ctx.DIV():
            return ctx.DIV().getText()
        elif ctx.MOD():
            return ctx.MOD().getText()

    def visitUnary_expr(self, ctx:TyCParser.Unary_exprContext):
        if ctx.getChildCount() == 1:
            return self.visit(ctx.postfix_expr())
        else:
            operator = ctx.getChild(0).getText()
            operand = self.visit(ctx.unary_expr())
            return PrefixOp(operator, operand)

    def visitPostfix_expr(self, ctx:TyCParser.Postfix_exprContext):
        if ctx.ID() and ctx.LPAREN():
            name = ctx.ID().getText()
            args = self.visit(ctx.arg_list_opt())
            return FuncCall(name, args)
        elif ctx.DOT():
            obj = self.visit(ctx.postfix_expr())
            member = ctx.ID().getText()
            return MemberAccess(obj, member)
        elif ctx.INC() or ctx.DEC():
            operator = ctx.getChild(1).getText()
            operand = self.visit(ctx.postfix_expr())
            return PostfixOp(operator, operand)
        else:
            return self.visit(ctx.primary_expr())

    def visitArg_list_opt(self, ctx:TyCParser.Arg_list_optContext):
        if ctx.getChildCount() == 0:
            return []
        else:
            return self.visit(ctx.arg_list())

    def visitArg_list(self, ctx:TyCParser.Arg_listContext):
        current = self.visit(ctx.expr())
        if ctx.COMMA():
            return [current] + self.visit(ctx.arg_list())
        else:
            return [current]

    def visitPrimary_expr(self, ctx:TyCParser.Primary_exprContext):
        if ctx.ID():
            return Identifier(ctx.ID().getText())
        elif ctx.INTLIT():
            return IntLiteral(int(ctx.INTLIT().getText()))
        elif ctx.FLOATLIT():
            return FloatLiteral(float(ctx.FLOATLIT().getText()))
        elif ctx.STRINGLIT():
            return StringLiteral(ctx.STRINGLIT().getText())
        elif ctx.LPAREN():
            return self.visit(ctx.expr())
        elif ctx.LBRACE():
            values = self.visit(ctx.expr_list_opt())
            return StructLiteral(values)

    def visitExpr_list_opt(self, ctx:TyCParser.Expr_list_optContext):
        if ctx.getChildCount() == 0:
            return []
        else:
            return self.visit(ctx.expr_list())

    def visitExpr_list(self, ctx:TyCParser.Expr_listContext):
        current = self.visit(ctx.expr())
        if ctx.COMMA():
            return [current] + self.visit(ctx.expr_list())
        else:
            return [current]

