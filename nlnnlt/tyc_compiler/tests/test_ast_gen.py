"""
AST Generation test cases for TyC compiler.
TODO: Implement 100 test cases for AST generation
"""

import pytest
from tests.utils import ASTGenerator


def test_001():
    """Empty program (valid)"""
    source = """"""
    expected = "Program([])"
    assert str(ASTGenerator(source).generate()) == expected


def test_002():
    """Program with only main function"""
    source = """void main() {}"""
    expected = "Program([FuncDecl(VoidType(), main, [], [])])"
    assert str(ASTGenerator(source).generate()) == expected


def test_003():
    """Using line comments (//)"""
    source = """// This is a comment
void main() {
    // Another comment
    int x = 5; // inline comment
}"""
    expected = "Program([FuncDecl(VoidType(), main, [], [VarDecl(IntType(), x = IntLiteral(5))])])"
    assert str(ASTGenerator(source).generate()) == expected


def test_004():
    """Using block comments (/* */) and interleaved functions/structs"""
    source = """/* Block comment */
struct A { int x; };
/* Another comment */
void foo() {}"""
    expected = "Program([StructDecl(A, [MemberDecl(IntType(), x)]), FuncDecl(VoidType(), foo, [], [])])"
    assert str(ASTGenerator(source).generate()) == expected


# --- 005-009: Struct Declarations ---

def test_005():
    """Empty struct"""
    source = """struct Empty {};"""
    expected = "Program([StructDecl(Empty, [])])"
    assert str(ASTGenerator(source).generate()) == expected


def test_006():
    """Struct containing another struct as member"""
    source = """struct Inner { int val; };
struct Outer { Inner inner; int count; };"""
    expected = "Program([StructDecl(Inner, [MemberDecl(IntType(), val)]), StructDecl(Outer, [MemberDecl(StructType(Inner), inner), MemberDecl(IntType(), count)])])"
    assert str(ASTGenerator(source).generate()) == expected


def test_007():
    """Self-referencing struct (syntax check only)"""
    source = """struct Node { int data; Node next; };"""
    expected = "Program([StructDecl(Node, [MemberDecl(IntType(), data), MemberDecl(StructType(Node), next)])])"
    assert str(ASTGenerator(source).generate()) == expected


def test_008():
    """Error - Struct member using auto keyword"""
    source = """struct S { auto x = 1; };"""
    result = str(ASTGenerator(source).generate())
    assert "Error" in result


def test_009():
    """Error - Struct member with initializer"""
    source = """struct S { int x = 5; };"""
    result = str(ASTGenerator(source).generate())
    assert "Error" in result


_ADDITIONAL_AST_CASES = [
    ("struct S {};", "StructDecl(S, [])"),
    ("struct S { float value; };", "StructDecl(S, [MemberDecl(FloatType(), value)])"),
    ("struct S { string value; };", "StructDecl(S, [MemberDecl(StringType(), value)])"),
    ("struct S { void value; };", "StructDecl(S, [MemberDecl(VoidType(), value)])"),
    ("struct A { int x; }; struct B { A a; };", "StructDecl(B"),
    ("struct A { int x; int y; };", "MemberDecl(IntType(), x)"),
    ("void main() {}", "FuncDecl(VoidType(), main"),
    ("int main() {}", "FuncDecl(IntType(), main"),
    ("float main() {}", "FuncDecl(FloatType(), main"),
    ("string main() {}", "FuncDecl(StringType(), main"),
    ("main() {}", "FuncDecl(auto, main"),
    ("void f(int x) {}", "Param(IntType(), x)"),
    ("void f(float x) {}", "Param(FloatType(), x)"),
    ("void f(string x) {}", "Param(StringType(), x)"),
    ("void f(void x) {}", "Param(VoidType(), x)"),
    ("void f(auto x) {}", "Param(None, x)"),
    ("void f(int x, float y, string z) {}", "Param(StringType(), z)"),
    ("void main() { int x; }", "VarDecl(IntType(), x)"),
    ("void main() { float x; }", "VarDecl(FloatType(), x)"),
    ("void main() { string x; }", "VarDecl(StringType(), x)"),
    ("void main() { auto x; }", "VarDecl(auto, x)"),
    ("void main() { auto x = 1; }", "VarDecl(auto, x = IntLiteral(1))"),
    ("void main() { auto x = 2.5; }", "FloatLiteral(2.5)"),
    ("void main() { auto x = \"hi\"; }", "StringLiteral('hi')"),
    ("void main() { int x = 1; int y = 2; }", "VarDecl(IntType(), y = IntLiteral(2))"),
    ("void main() { int x = -1; }", "PrefixOp(-IntLiteral(1))"),
    ("void main() { int x = +1; }", "PrefixOp(+IntLiteral(1))"),
    ("void main() { int x = !1; }", "PrefixOp(!IntLiteral(1))"),
    ("void main() { int x = 1 + 2; }", "BinaryOp(IntLiteral(1), +, IntLiteral(2))"),
    ("void main() { int x = 1 - 2; }", "BinaryOp(IntLiteral(1), -, IntLiteral(2))"),
    ("void main() { int x = 2 * 3; }", "BinaryOp(IntLiteral(2), *, IntLiteral(3))"),
    ("void main() { int x = 6 / 3; }", "BinaryOp(IntLiteral(6), /, IntLiteral(3))"),
    ("void main() { int x = 7 % 3; }", "BinaryOp(IntLiteral(7), %, IntLiteral(3))"),
    ("void main() { int x = 1 < 2; }", "BinaryOp(IntLiteral(1), <, IntLiteral(2))"),
    ("void main() { int x = 1 > 2; }", "BinaryOp(IntLiteral(1), >, IntLiteral(2))"),
    ("void main() { int x = 1 == 2; }", "BinaryOp(IntLiteral(1), ==, IntLiteral(2))"),
    ("void main() { int x = 1 != 2; }", "BinaryOp(IntLiteral(1), !=, IntLiteral(2))"),
    ("void main() { int x = 1 && 2; }", "BinaryOp(IntLiteral(1), &&, IntLiteral(2))"),
    ("void main() { int x = 1 || 2; }", "BinaryOp(IntLiteral(1), ||, IntLiteral(2))"),
    ("void main() { int x = 1 + 2 * 3; }", "BinaryOp(IntLiteral(1), +"),
    ("void main() { int x = (1 + 2) * 3; }", "BinaryOp(BinaryOp(IntLiteral(1), +"),
    ("void main() { int x = 1; x = 2; }", "AssignExpr(Identifier(x) = IntLiteral(2))"),
    ("void main() { int x; int y; x = y = 1; }", "AssignExpr(Identifier(x) = AssignExpr"),
    ("void main() { int x = 1; x++; }", "PostfixOp(Identifier(x)++)"),
    ("void main() { int x = 1; ++x; }", "PrefixOp(++Identifier(x))"),
    ("void main() { int x = 1; x--; }", "PostfixOp(Identifier(x)--"),
    ("void main() { int x = 1; --x; }", "PrefixOp(--Identifier(x))"),
    ("void main() { printInt(1); }", "FuncCall(printInt, [IntLiteral(1)])"),
    ("void main() { printFloat(1.5); }", "FuncCall(printFloat, [FloatLiteral(1.5)])"),
    ("void main() { printString(\"x\"); }", "FuncCall(printString, [StringLiteral('x')])"),
    ("void main() { foo(); }", "FuncCall(foo, [])"),
    ("void main() { foo(1, 2); }", "FuncCall(foo, [IntLiteral(1), IntLiteral(2)])"),
    ("void main() { int x = value; }", "Identifier(value)"),
    ("void main() { int x = object.field; }", "MemberAccess(Identifier(object).field)"),
    ("void main() { int x = object.left.right; }", "MemberAccess(MemberAccess"),
    ("void main() { int x = {1, 2}; }", "StructLiteral({IntLiteral(1), IntLiteral(2)})"),
    ("void main() { int x = {}; }", "StructLiteral({})"),
    ("void main() { if (1) {} }", "IfStmt(if IntLiteral(1) then BlockStmt([]))"),
    ("void main() { if (1) {} else {} }", "else BlockStmt([])"),
    ("void main() { if (x) y = 1; }", "IfStmt(if Identifier(x)"),
    ("void main() { while (1) {} }", "WhileStmt(while IntLiteral(1)"),
    ("void main() { while (x < 2) x++; }", "WhileStmt(while BinaryOp"),
    ("void main() { for (;;) {} }", "ForStmt(for None; None; None"),
    ("void main() { for (auto i = 0; i < 2; ++i) {} }", "ForStmt(for VarDecl(auto, i"),
    ("void main() { for (int i = 0; i < 2; i++) {} }", "PostfixOp(Identifier(i)++)"),
    ("void main() { for (i = 0; i < 2; i = i + 1) {} }", "AssignExpr(Identifier(i) ="),
    ("void main() { break; }", "BreakStmt()"),
    ("void main() { continue; }", "ContinueStmt()"),
    ("void main() { return; }", "ReturnStmt(return)"),
    ("void main() { return 1; }", "ReturnStmt(return IntLiteral(1))"),
    ("int get() { return 1; }", "ReturnStmt(return IntLiteral(1))"),
    ("void main() { {} }", "BlockStmt([])"),
    ("void main() { { int x = 1; } }", "BlockStmt([VarDecl(IntType(), x"),
    ("void main() { switch (x) {} }", "SwitchStmt(switch Identifier(x) cases [])"),
    ("void main() { switch (x) { case 1: break; } }", "CaseStmt(case IntLiteral(1)"),
    ("void main() { switch (x) { default: break; } }", "DefaultStmt(default"),
    ("void main() { switch (x) { case 1: case 2: break; } }", "CaseStmt(case IntLiteral(2)"),
    ("void main() { switch (x) { case 1 + 2: break; } }", "BinaryOp(IntLiteral(1), +"),
    ("void main() { switch (x) { case -1: break; } }", "PrefixOp(-IntLiteral(1))"),
    ("void main() { switch (x) { case (1): break; } }", "CaseStmt(case IntLiteral(1)"),
    ("struct A { int x; }; void main() { A a; }", "StructType(A)"),
    ("struct A { int x; }; void main() { A a = {1}; }", "VarDecl(StructType(A), a"),
    ("struct A { int x; }; struct B { A a; };", "MemberDecl(StructType(A), a)"),
    ("void main() { auto x = readInt(); }", "FuncCall(readInt, [])"),
    ("void main() { auto x = readFloat(); }", "FuncCall(readFloat, [])"),
    ("void main() { auto x = readString(); }", "FuncCall(readString, [])"),
    ("int add(int a, int b) { return a + b; }", "FuncDecl(IntType(), add"),
    ("float add(float a, float b) { return a + b; }", "FuncDecl(FloatType(), add"),
    ("string echo(string x) { return x; }", "FuncDecl(StringType(), echo"),
    ("f(int x) { return x; }", "FuncDecl(auto, f"),
    ("void main() { auto x = 1; if (x) { x++; } }", "IfStmt(if Identifier(x)"),
    ("void main() { auto i = 0; while (i < 3) { ++i; } }", "WhileStmt(while BinaryOp"),
    ("void main() { for (auto i = 0; i < 3; i++) { continue; } }", "ContinueStmt()"),
    ("void main() { int x = 1; switch (x) { case 1: break; default: {} } }", "DefaultStmt(default"),
    ("void main() { int x = 1; x = (x + 2) * 4; }", "AssignExpr(Identifier(x)"),
    ("void main() { foo({1, 2}); }", "StructLiteral({IntLiteral(1), IntLiteral(2)})"),
]


@pytest.mark.parametrize("source, expected_fragment", _ADDITIONAL_AST_CASES)
def test_additional_ast_cases(source, expected_fragment):
    result = ASTGenerator(source).generate()
    assert not isinstance(result, str), result
    assert expected_fragment in str(result)

