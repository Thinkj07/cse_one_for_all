"""
Test cases for TyC Static Semantic Checker

This module contains test cases for the static semantic checker.
100 test cases covering all error types and comprehensive scenarios.
"""

from tests.utils import Checker
from src.utils.nodes import (
    Program,
    FuncDecl,
    BlockStmt,
    VarDecl,
    AssignExpr,
    ExprStmt,
    IntType,
    FloatType,
    StringType,
    VoidType,
    StructType,
    IntLiteral,
    FloatLiteral,
    StringLiteral,
    Identifier,
    BinaryOp,
    MemberAccess,
    FuncCall,
    StructDecl,
    MemberDecl,
    Param,
    ReturnStmt,
)


# ============================================================================
# Valid Programs (test_001 - test_020)
# ============================================================================


def test_001():
    """TypeMismatchInStatement: assignment statement with type mismatch (int = float)"""
    source = """
void main() {
    int a;
    float b;
    a = b;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_002():
    """Valid: auto type inference with literals"""
    source = """
void main() {
    auto x = 10;
    auto y = 3.14;
    auto z = x + y;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_003():
    """Valid: function call and return"""
    source = """
int add(int x, int y) {
    return x + y;
}
void main() {
    int sum = add(5, 3);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_004():
    """Valid: struct declaration and member access"""
    source = """
struct Point {
    int x;
    int y;
};
void main() {
    Point p;
    p.x = 10;
    p.y = 20;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_005():
    """Valid: nested blocks"""
    source = """
void main() {
    int x = 10;
    {
        int y = 20;
        int z = x + y;
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_006():
    """Redeclared Variable in same block"""
    source = """
void main() {
    int x = 10;
    int x = 20;
}
"""
    assert Checker(source).check_from_source() == "Redeclared(Variable, x)"


def test_007():
    """Redeclared function (no overloading)"""
    source = """
int add(int a, int b) {
    return a + b;
}
float add(float a, float b) {
    return a + b;
}
void main() {}
"""
    assert Checker(source).check_from_source() == "Redeclared(Function, add)"


def test_008():
    """Redeclared struct"""
    source = """
struct Point { int x; };
struct Point { int y; };
void main() {}
"""
    assert Checker(source).check_from_source() == "Redeclared(Struct, Point)"


def test_009():
    """UndeclaredIdentifier: variable used before declaration"""
    source = """
void main() {
    int x = y + 5;
    int y = 10;
}
"""
    assert Checker(source).check_from_source() == "UndeclaredIdentifier(y)"


def test_010():
    """UndeclaredFunction"""
    source = """
void main() {
    int result = calculate(5, 3);
}
"""
    assert Checker(source).check_from_source() == "UndeclaredFunction(calculate)"


def test_011():
    """Valid: built-in functions"""
    source = """
void main() {
    int x = readInt();
    printInt(x);
    float f = readFloat();
    printFloat(f);
    string s = readString();
    printString(s);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_012():
    """Valid: if/else statement"""
    source = """
void main() {
    int x = 10;
    if (x) {
        printInt(1);
    } else {
        printInt(0);
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_013():
    """Valid: while loop"""
    source = """
void main() {
    int i = 0;
    while (i < 10) {
        printInt(i);
        i = i + 1;
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_014():
    """Valid: for loop"""
    source = """
void main() {
    for (int i = 0; i < 10; i++) {
        printInt(i);
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_015():
    """Valid: switch with break"""
    source = """
void main() {
    int x = 1;
    switch (x) {
        case 1: printInt(1); break;
        case 2: printInt(2); break;
        default: printInt(0);
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_016():
    """Valid: struct with literal init and member access"""
    source = """
struct Point { int x; int y; };
void main() {
    Point p = {10, 20};
    printInt(p.x);
    printInt(p.y);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_017():
    """Valid: variable shadowing in nested block"""
    source = """
void main() {
    int x = 10;
    {
        int x = 20;
        printInt(x);
    }
    printInt(x);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_018():
    """Valid: return from non-void function"""
    source = """
int square(int x) {
    return x * x;
}
void main() {
    int r = square(5);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_019():
    """Valid: void function with return;"""
    source = """
void doNothing() {
    return;
}
void main() {
    doNothing();
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_020():
    """Valid: mixed int/float arithmetic"""
    source = """
void main() {
    int a = 10;
    float b = 3.14;
    float c = a + b;
    float d = a * b;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


# ============================================================================
# Redeclared Tests (test_021 - test_030)
# ============================================================================


def test_021():
    """Redeclared Parameter"""
    source = """
int calc(int x, float y, int x) {
    return x;
}
void main() {}
"""
    assert Checker(source).check_from_source() == "Redeclared(Parameter, x)"


def test_022():
    """Redeclared Variable with different types"""
    source = """
void main() {
    int count = 10;
    float count = 20.0;
}
"""
    assert Checker(source).check_from_source() == "Redeclared(Variable, count)"


def test_023():
    """Valid: no redeclaration across different scopes (shadowing)"""
    source = """
void main() {
    int x = 10;
    {
        int x = 20;
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_024():
    """Redeclared: auto and explicit in same block"""
    source = """
void main() {
    auto x = 10;
    int x = 20;
}
"""
    assert Checker(source).check_from_source() == "Redeclared(Variable, x)"


def test_025():
    """Redeclared struct member"""
    source = """
struct Point { int x; int x; };
void main() {}
"""
    assert Checker(source).check_from_source() == "Redeclared(Member, x)"


def test_026():
    """Valid: same variable name across functions"""
    source = """
void foo() {
    int x = 5;
}
void main() {
    int x = 10;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_027():
    """Valid: struct and function with same name (separate namespaces)"""
    source = """
struct foo { int x; int y; };
int foo(int x, int y) {
    return x + y;
}
void main() {
    int r = foo(1, 2);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_028():
    """Valid: multiple functions"""
    source = """
int foo() { return 1; }
int bar() { return 2; }
void main() {
    int a = foo();
    int b = bar();
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_029():
    """Redeclared: redeclare built-in function name"""
    source = """
void printInt(int x) {}
void main() {}
"""
    assert Checker(source).check_from_source() == "Redeclared(Function, printInt)"


def test_030():
    """Redeclared Variable in for-init scope"""
    source = """
void main() {
    for (int i = 0; i < 5; i++) {
        float i = 1.2;
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


# ============================================================================
# UndeclaredIdentifier Tests (test_031 - test_037)
# ============================================================================


def test_031():
    """Undeclared variable in expression"""
    source = """
void main() {
    int x = 5 + unknown;
}
"""
    assert Checker(source).check_from_source() == "UndeclaredIdentifier(unknown)"


def test_032():
    """Variable out of scope after block"""
    source = """
void main() {
    {
        int inner = 42;
    }
    printInt(inner);
}
"""
    assert Checker(source).check_from_source() == "UndeclaredIdentifier(inner)"


def test_033():
    """Valid: parameter visible in function body"""
    source = """
int calc(int x, int y) {
    int result = x + y;
    return result;
}
void main() {}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_034():
    """Undeclared variable in assignment RHS"""
    source = """
void main() {
    int x;
    x = missing;
}
"""
    assert Checker(source).check_from_source() == "UndeclaredIdentifier(missing)"


def test_035():
    """Valid: variable in enclosing scope accessible"""
    source = """
void main() {
    int outer = 10;
    {
        int inner = outer + 5;
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_036():
    """Undeclared variable in if condition"""
    source = """
void main() {
    if (flag) {
        printInt(1);
    }
}
"""
    assert Checker(source).check_from_source() == "UndeclaredIdentifier(flag)"


def test_037():
    """Undeclared variable in while condition"""
    source = """
void main() {
    while (cond) {
        break;
    }
}
"""
    assert Checker(source).check_from_source() == "UndeclaredIdentifier(cond)"


# ============================================================================
# UndeclaredFunction Tests (test_038 - test_042)
# ============================================================================


def test_038():
    """Undeclared function with arguments"""
    source = """
void main() {
    int r = nonexist(1);
}
"""
    assert Checker(source).check_from_source() == "UndeclaredFunction(nonexist)"


def test_039():
    """Valid: function declared later (forward ref via 2-pass)"""
    source = """
void main() {
    helper();
}
void helper() {}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_040():
    """Valid: built-in functions usable"""
    source = """
void main() {
    int x = readInt();
    printInt(x);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_041():
    """Undeclared function in expression"""
    source = """
void main() {
    int x = 5 + getVal();
}
"""
    assert Checker(source).check_from_source() == "UndeclaredFunction(getVal)"


def test_042():
    """Valid: recursive function call"""
    source = """
int fact(int n) {
    if (n < 2) { return 1; }
    return n * fact(n - 1);
}
void main() {
    int r = fact(5);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


# ============================================================================
# UndeclaredStruct Tests (test_043 - test_048)
# ============================================================================


def test_043():
    """Undeclared struct in variable declaration"""
    source = """
void main() {
    Point p;
}
"""
    assert Checker(source).check_from_source() == "UndeclaredStruct(Point)"


def test_044():
    """Undeclared struct in member declaration"""
    source = """
struct Address { City city; };
void main() {}
"""
    assert Checker(source).check_from_source() == "UndeclaredStruct(City)"


def test_045():
    """Valid: struct member using previously declared struct"""
    source = """
struct Point { int x; int y; };
struct Line { Point start; Point end; };
void main() {}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_046():
    """Undeclared struct in function parameter"""
    source = """
void process(Data d) {}
void main() {}
"""
    assert Checker(source).check_from_source() == "UndeclaredStruct(Data)"


def test_047():
    """Undeclared struct in function return type"""
    source = """
Widget getWidget() {
    return;
}
void main() {}
"""
    assert Checker(source).check_from_source() == "UndeclaredStruct(Widget)"


def test_048():
    """Valid: struct used after declaration"""
    source = """
struct Color { int r; int g; int b; };
void paint(Color c) {
    printInt(c.r);
}
void main() {
    Color c = {255, 0, 0};
    paint(c);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


# ============================================================================
# TypeCannotBeInferred Tests (test_049 - test_058)
# ============================================================================


def test_049():
    """Auto with struct literal init — cannot infer"""
    source = """
struct Point { int x; int y; };
void main() {
    auto p = {1, 2};
}
"""
    result = Checker(source).check_from_source()
    assert "TypeCannotBeInferred" in result


def test_050():
    """Both auto in binary op"""
    source = """
void main() {
    auto x;
    auto y;
    auto result = x + y;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeCannotBeInferred" in result


def test_051():
    """Valid: auto with init from known literal"""
    source = """
void main() {
    auto x = 10;
    auto y = 3.14;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_052():
    """Valid: auto without init, inferred from assignment"""
    source = """
void main() {
    auto a;
    a = 10;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_053():
    """Valid: auto without init, inferred from function arg"""
    source = """
void main() {
    auto x;
    printInt(x);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_054():
    """Both auto in assignment — cannot infer"""
    source = """
void main() {
    auto x;
    auto y;
    x = y;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeCannotBeInferred" in result


def test_055():
    """Valid: auto inferred from binary op with known type"""
    source = """
void main() {
    auto value;
    auto result = value + 5;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_056():
    """Valid: auto inferred from function return"""
    source = """
void main() {
    auto x;
    x = readInt();
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_057():
    """Auto init from void function — TypeMismatchInStatement"""
    source = """
void doNothing() {}
void main() {
    auto x = doNothing();
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_058():
    """Valid: auto inferred from prefix increment"""
    source = """
void main() {
    auto x;
    ++x;
    printInt(x);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


# ============================================================================
# TypeMismatchInStatement Tests (test_059 - test_072)
# ============================================================================


def test_059():
    """If condition not int — float"""
    source = """
void main() {
    float x = 5.0;
    if (x) {}
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_060():
    """If condition not int — string"""
    source = """
void main() {
    string s = "hello";
    if (s) {}
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_061():
    """While condition not int"""
    source = """
void main() {
    float f = 1.0;
    while (f) {}
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_062():
    """For condition not int"""
    source = """
void main() {
    for (int i = 0; 1.5; i++) {}
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_063():
    """Return int from void function"""
    source = """
void main() {
    return 42;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_064():
    """Return float from int function"""
    source = """
int getVal() {
    return 3.14;
}
void main() {}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_065():
    """Return void (no expr) from int function"""
    source = """
int getVal() {
    return;
}
void main() {}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_066():
    """Variable init type mismatch: int var = float"""
    source = """
void main() {
    int x = 3.14;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_067():
    """Variable init type mismatch: float var = string"""
    source = """
void main() {
    float f = "hello";
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_068():
    """Switch expression not int"""
    source = """
void main() {
    float f = 1.0;
    switch (f) {
        case 1: break;
    }
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_069():
    """Valid: return consistent with inferred type"""
    source = """
foo() {
    return 42;
}
void main() {
    int x = foo();
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_070():
    """Inconsistent return types with inferred function"""
    source = """
bar() {
    return 42;
    return 3.14;
}
void main() {}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_071():
    """Valid: nested struct member access"""
    source = """
struct Point { int x; int y; };
struct Line { Point start; Point end; };
void main() {
    Line l;
    l.start.x = 1;
    l.start.y = 2;
    l.end.x = 3;
    l.end.y = 4;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_072():
    """Struct literal field count mismatch"""
    source = """
struct Point { int x; int y; };
void main() {
    Point p = {1, 2, 3};
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


# ============================================================================
# TypeMismatchInExpression Tests (test_073 - test_088)
# ============================================================================


def test_073():
    """String + int"""
    source = """
void main() {
    string s = "hi";
    auto x = s + 5;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_074():
    """Modulus with float"""
    source = """
void main() {
    float a = 5.0;
    int b = 3;
    auto c = a % b;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_075():
    """Logical AND with float"""
    source = """
void main() {
    float a = 1.0;
    int b = 1;
    auto c = a && b;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_076():
    """Logical OR with float"""
    source = """
void main() {
    int a = 1;
    float b = 1.0;
    auto c = a || b;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_077():
    """Increment on float"""
    source = """
void main() {
    float f = 1.0;
    f++;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_078():
    """Logical NOT on float"""
    source = """
void main() {
    float f = 1.0;
    auto x = !f;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_079():
    """Member access on non-struct type"""
    source = """
void main() {
    int x = 10;
    auto y = x.field;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_080():
    """Access non-existent member"""
    source = """
struct Point { int x; int y; };
void main() {
    Point p;
    auto z = p.z;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_081():
    """Function call wrong argument count"""
    source = """
int add(int a, int b) { return a + b; }
void main() {
    int r = add(1, 2, 3);
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_082():
    """Function call wrong argument type"""
    source = """
void showInt(int x) { printInt(x); }
void main() {
    showInt("hello");
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_083():
    """TypeMismatchInStatement: assignment statement with type mismatch (string = int)"""
    source = """
void main() {
    string s = "hi";
    s = 42;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_084():
    """TypeMismatchInStatement: assignment statement with type mismatch (int = struct)"""
    source = """
struct Point { int x; int y; };
void main() {
    Point p = {1, 2};
    int x;
    x = p;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInStatement" in result


def test_085():
    """Valid: relational and logical operators return int"""
    source = """
void main() {
    int a = 10;
    int b = 20;
    int c = a < b;
    int d = a == b;
    int e = c && d;
    int f = c || d;
    int g = !c;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_086():
    """Struct literal field type mismatch"""
    source = """
struct Point { int x; int y; };
void main() {
    Point p = {1, 2.5};
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


def test_087():
    """Valid: struct assignment same type"""
    source = """
struct Point { int x; int y; };
void main() {
    Point p1 = {1, 2};
    Point p2;
    p2 = p1;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_088():
    """Prefix decrement on float"""
    source = """
void main() {
    float f = 1.0;
    --f;
}
"""
    result = Checker(source).check_from_source()
    assert "TypeMismatchInExpression" in result


# ============================================================================
# MustInLoop Tests (test_089 - test_095)
# ============================================================================


def test_089():
    """Break outside loop and switch"""
    source = """
void main() {
    break;
}
"""
    result = Checker(source).check_from_source()
    assert "MustInLoop" in result


def test_090():
    """Continue outside loop"""
    source = """
void main() {
    continue;
}
"""
    result = Checker(source).check_from_source()
    assert "MustInLoop" in result


def test_091():
    """Continue inside switch only (invalid)"""
    source = """
void main() {
    int x = 1;
    switch (x) {
        case 1: continue;
    }
}
"""
    result = Checker(source).check_from_source()
    assert "MustInLoop" in result


def test_092():
    """Valid: break in switch"""
    source = """
void main() {
    int x = 1;
    switch (x) {
        case 1: break;
        default: break;
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_093():
    """Valid: break and continue in while"""
    source = """
void main() {
    int i = 0;
    while (i < 10) {
        if (i == 5) { break; }
        if (i == 3) { i = i + 1; continue; }
        i = i + 1;
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_094():
    """Valid: break and continue in for"""
    source = """
void main() {
    for (int i = 0; i < 10; i++) {
        if (i == 3) { continue; }
        if (i == 7) { break; }
        printInt(i);
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_095():
    """Break inside if but outside loop/switch"""
    source = """
void main() {
    int x = 1;
    if (x) {
        break;
    }
}
"""
    result = Checker(source).check_from_source()
    assert "MustInLoop" in result


# ============================================================================
# Complex / Edge Case Tests (test_096 - test_100)
# ============================================================================


def test_096():
    """Valid: nested for loops with break/continue"""
    source = """
void main() {
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 5; j++) {
            if (i == j) { continue; }
            if (j > 3) { break; }
        }
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_097():
    """Valid: struct as function param and return"""
    source = """
struct Point { int x; int y; };
Point makePoint(int x, int y) {
    Point p = {x, y};
    return p;
}
void main() {
    Point p = makePoint(10, 20);
    printInt(p.x);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_098():
    """Valid: chained assignment"""
    source = """
void main() {
    int a;
    int b;
    int c;
    a = b = c = 42;
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_099():
    """Valid: auto inferred from chained context"""
    source = """
void main() {
    auto x;
    auto y = x + 10;
    printInt(y);
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"


def test_100():
    """Valid: complex program with structs, functions, loops"""
    source = """
struct Vec2 { float x; float y; };
float dot(Vec2 a, Vec2 b) {
    return a.x * b.x + a.y * b.y;
}
float length(Vec2 v) {
    return dot(v, v);
}
void main() {
    Vec2 v1 = {1.0, 2.0};
    Vec2 v2 = {3.0, 4.0};
    float d = dot(v1, v2);
    printFloat(d);
    float l = length(v1);
    printFloat(l);
    for (int i = 0; i < 10; i++) {
        if (i > 5) { break; }
        printInt(i);
    }
}
"""
    assert Checker(source).check_from_source() == "Static checking passed"
