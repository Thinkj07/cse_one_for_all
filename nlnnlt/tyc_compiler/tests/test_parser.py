"""
Parser test cases for TyC compiler
TODO: Implement 100 test cases for parser
"""

import pytest
from tests.utils import Parser


# ========== Simple Test Cases (10 types) ==========
def test_empty_program():
    """1. Empty program"""
    assert Parser("").parse() == "success"


def test_program_with_only_main():
    """2. Program with only main function"""
    assert Parser("void main() {}").parse() == "success"


def test_struct_simple():
    """3. Struct declaration"""
    source = "struct Point { int x; int y; };"
    assert Parser(source).parse() == "success"


def test_function_no_params():
    """4. Function with no parameters"""
    source = "void greet() { printString(\"Hello\"); }"
    assert Parser(source).parse() == "success"


def test_var_decl_auto_with_init():
    """5. Variable declaration"""
    source = "void main() { auto x = 5; }"
    assert Parser(source).parse() == "success"


def test_if_simple():
    """6. If statement"""
    source = "void main() { if (1) printInt(1); }"
    assert Parser(source).parse() == "success"


def test_while_simple():
    """7. While statement"""
    source = "void main() { while (1) printInt(1); }"
    assert Parser(source).parse() == "success"


def test_for_simple():
    """8. For statement"""
    source = "void main() { for (auto i = 0; i < 10; ++i) printInt(i); }"
    assert Parser(source).parse() == "success"


def test_switch_simple():
    """9. Switch statement"""
    source = "void main() { switch (1) { case 1: printInt(1); break; } }"
    assert Parser(source).parse() == "success"


def test_assignment_simple():
    """10. Assignment statement"""
    source = "void main() { int x; x = 5; }"
    assert Parser(source).parse() == "success"


_ADDITIONAL_PARSER_CASES = [
    "struct Empty {};",
    "struct Point { int x; int y; };",
    "struct Person { string name; int age; float height; };",
    "struct Flags { int value; };",
    "int add(int a, int b) { return a + b; }",
    "float average(float a, float b) { return (a + b) / 2.0; }",
    "string echo(string value) { return value; }",
    "void noop() {}",
    "compute(int value) { return value; }",
    "void main(int argc) {}",
    "void main() { int x; }",
    "void main() { float x; }",
    "void main() { string x; }",
    "void main() { auto x; }",
    "void main() { auto x = 1; }",
    "void main() { auto x = 1.5; }",
    "void main() { auto x = \"text\"; }",
    "void main() { int x = 1; int y = 2; }",
    "void main() { Point p; }",
    "void main() { Point p = {1, 2}; }",
    "void main() { int x = (1 + 2) * 3; }",
    "void main() { int x = 1 + 2 * 3; }",
    "void main() { int x = (1 + 2) * (3 - 4); }",
    "void main() { int x = -1; }",
    "void main() { int x = +1; }",
    "void main() { int x = !1; }",
    "void main() { int x = 1 < 2; }",
    "void main() { int x = 1 <= 2; }",
    "void main() { int x = 1 > 2; }",
    "void main() { int x = 1 >= 2; }",
    "void main() { int x = 1 == 2; }",
    "void main() { int x = 1 != 2; }",
    "void main() { int x = 1 && 2; }",
    "void main() { int x = 1 || 2; }",
    "void main() { int x = 1 % 2; }",
    "void main() { int x = 1 / 2; }",
    "void main() { int x = 1; x = 2; }",
    "void main() { int x; int y; x = y = 3; }",
    "void main() { int x = 1; x++; }",
    "void main() { int x = 1; ++x; }",
    "void main() { int x = 1; x--; }",
    "void main() { int x = 1; --x; }",
    "void main() { printInt(1); }",
    "void main() { printFloat(1.0); }",
    "void main() { printString(\"hello\"); }",
    "void main() { readInt(); }",
    "void main() { readFloat(); }",
    "void main() { readString(); }",
    "void main() { int x = printInt(1); }",
    "void main() { int x = foo(1, 2); }",
    "void main() { int x = a.b; }",
    "void main() { int x = a.b.c; }",
    "void main() { if (1) {} }",
    "void main() { if (1) {} else {} }",
    "void main() { if (x) y = 1; else y = 2; }",
    "void main() { while (1) {} }",
    "void main() { while (x < 10) x++; }",
    "void main() { for (;;) {} }",
    "void main() { for (auto i = 0; i < 10; ++i) {} }",
    "void main() { for (int i = 0; i < 10; i++) printInt(i); }",
    "void main() { for (i = 0; i < 10; i = i + 1) {} }",
    "void main() { for (; i < 10; ) {} }",
    "void main() { break; }",
    "void main() { continue; }",
    "void main() { return; }",
    "void main() { return 1; }",
    "int value() { return 1; }",
    "void main() { { int x; } }",
    "void main() { { { int x = 1; } } }",
    "void main() { int x; { int y; x = y; } }",
    "void main() { switch (x) {} }",
    "void main() { switch (x) { case 1: break; } }",
    "void main() { switch (x) { case 1: case 2: break; } }",
    "void main() { switch (x) { default: break; } }",
    "void main() { switch (x) { case 1: printInt(1); default: printInt(0); } }",
    "void main() { switch (x) { case 1 + 2: break; } }",
    "void main() { switch (x) { case (1): break; } }",
    "void main() { switch (x) { case -1: break; } }",
    "void main() { switch (x) { case +1: break; } }",
    "void main() { switch (x) { case 2 * 3: break; } }",
    "struct A { int x; }; struct B { A value; };",
    "struct A { int x; }; void main() { A value; }",
    "struct A { int x; }; void main() { A value = {1}; }",
    "struct A { int x; }; struct B { A value; int y; };",
    "struct A { int x; }; void set(A value) { value.x = 1; }",
    "int square(int x) { return x * x; } void main() { square(3); }",
    "int first() { return 1; } int second() { return first(); }",
    "void main() { auto x = (1 + 2) * 3; if (x) { x--; } }",
    "void main() { auto i = 0; while (i < 3) { ++i; if (i == 2) break; } }",
    "void main() { for (auto i = 0; i < 3; i++) { continue; } }",
    "void main() { int x = 1; switch (x) { case 1: { printInt(x); break; } default: {} } }",
    "void main() { int x = 1; x = (x + 2) * 4; printInt(x); }",
    "void main() { auto x = {1, 2, 3}; }",
    "void main() { foo({1, 2}); }",
]


@pytest.mark.parametrize("source", _ADDITIONAL_PARSER_CASES)
def test_additional_parser_cases(source):
    assert Parser(source).parse() == "success"
