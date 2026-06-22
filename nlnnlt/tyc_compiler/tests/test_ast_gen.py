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

