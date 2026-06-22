"""
Test cases for TyC code generation.
"""

from src.utils.nodes import *
from tests.utils import CodeGenerator


# ===========================================================================
# Tests 1-10: I/O, literals, var/assign basics
# ===========================================================================


def test_001():
    """Print string literal"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printString", [StringLiteral("Hello World")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "Hello World"


def test_002():
    """Print integer literal"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [IntLiteral(42)]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "42"


def test_003():
    """Print float literal"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printFloat", [FloatLiteral(3.14)]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "3.14"


def test_004():
    """Variable declaration with init and print"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(10)),
            ExprStmt(FuncCall("printInt", [Identifier("x")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "10"


def test_005():
    """Int variable assignment expression"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(0)),
            ExprStmt(AssignExpr(Identifier("x"), IntLiteral(99))),
            ExprStmt(FuncCall("printInt", [Identifier("x")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "99"


def test_006():
    """Float variable"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(FloatType(), "f", FloatLiteral(2.5)),
            ExprStmt(FuncCall("printFloat", [Identifier("f")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "2.5"


def test_007():
    """String variable"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StringType(), "s", StringLiteral("abc")),
            ExprStmt(FuncCall("printString", [Identifier("s")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "abc"


def test_008():
    """Multiple prints"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [IntLiteral(1)])),
            ExprStmt(FuncCall("printInt", [IntLiteral(2)])),
            ExprStmt(FuncCall("printInt", [IntLiteral(3)]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "123"


def test_009():
    """Print negative integer"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [IntLiteral(-42)]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "-42"


def test_010():
    """Print zero"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [IntLiteral(0)]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "0"


# ===========================================================================
# Tests 11-20: Arithmetic int/float, %, mixed expressions
# ===========================================================================


def test_011():
    """Int addition"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(5), "+", IntLiteral(3))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "8"


def test_012():
    """Int subtraction"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(10), "-", IntLiteral(4))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "6"


def test_013():
    """Int multiplication"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(6), "*", IntLiteral(7))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "42"


def test_014():
    """Int division"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(10), "/", IntLiteral(3))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "3"


def test_015():
    """Int modulus"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(10), "%", IntLiteral(3))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1"


def test_016():
    """Float addition"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printFloat", [
                BinaryOp(FloatLiteral(1.5), "+", FloatLiteral(2.5))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "4.0"


def test_017():
    """Mixed int + float"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printFloat", [
                BinaryOp(IntLiteral(2), "+", FloatLiteral(3.5))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "5.5"


def test_018():
    """Mixed float * int"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printFloat", [
                BinaryOp(FloatLiteral(2.5), "*", IntLiteral(4))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "10.0"


def test_019():
    """Nested arithmetic: (2 + 3) * 4"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(
                    BinaryOp(IntLiteral(2), "+", IntLiteral(3)),
                    "*",
                    IntLiteral(4)
                )
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "20"


def test_020():
    """Float division"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printFloat", [
                BinaryOp(FloatLiteral(10.0), "/", FloatLiteral(4.0))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "2.5"


# ===========================================================================
# Tests 21-30: Relational, logical, !, short-circuit
# ===========================================================================


def test_021():
    """Less than true"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(1), "<", IntLiteral(2))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1"


def test_022():
    """Less than false"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(5), "<", IntLiteral(3))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "0"


def test_023():
    """Equal"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(5), "==", IntLiteral(5))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1"


def test_024():
    """Not equal"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(5), "!=", IntLiteral(3))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1"


def test_025():
    """Logical AND true"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(1), "&&", IntLiteral(1))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1"


def test_026():
    """Logical AND short-circuit: left false, right not evaluated"""
    # 0 && printInt(99) should print nothing (printInt not called)
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(0)),
            VarDecl(IntType(), "r",
                BinaryOp(Identifier("x"), "&&", FuncCall("readInt", []))
            ),
            ExprStmt(FuncCall("printInt", [Identifier("r")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "0"


def test_027():
    """Logical OR true"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                BinaryOp(IntLiteral(0), "||", IntLiteral(1))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1"


def test_028():
    """Logical OR short-circuit: left true"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(1)),
            VarDecl(IntType(), "r",
                BinaryOp(Identifier("x"), "||", IntLiteral(0))
            ),
            ExprStmt(FuncCall("printInt", [Identifier("r")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1"


def test_029():
    """Logical NOT on 0"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                PrefixOp("!", IntLiteral(0))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1"


def test_030():
    """Logical NOT on non-zero"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                PrefixOp("!", IntLiteral(5))
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "0"


# ===========================================================================
# Tests 31-40: if/else (including nested)
# ===========================================================================


def test_031():
    """If true branch"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            IfStmt(
                IntLiteral(1),
                ExprStmt(FuncCall("printString", [StringLiteral("yes")])),
                ExprStmt(FuncCall("printString", [StringLiteral("no")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "yes"


def test_032():
    """If false branch (else)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            IfStmt(
                IntLiteral(0),
                ExprStmt(FuncCall("printString", [StringLiteral("yes")])),
                ExprStmt(FuncCall("printString", [StringLiteral("no")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "no"


def test_033():
    """If without else, condition true"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            IfStmt(IntLiteral(1),
                ExprStmt(FuncCall("printString", [StringLiteral("ok")])),
                None
            ),
            ExprStmt(FuncCall("printString", [StringLiteral("done")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "okdone"


def test_034():
    """If without else, condition false"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            IfStmt(IntLiteral(0),
                ExprStmt(FuncCall("printString", [StringLiteral("ok")])),
                None
            ),
            ExprStmt(FuncCall("printString", [StringLiteral("done")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "done"


def test_035():
    """If with relational condition"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(5)),
            IfStmt(
                BinaryOp(Identifier("x"), ">", IntLiteral(3)),
                ExprStmt(FuncCall("printString", [StringLiteral("big")])),
                ExprStmt(FuncCall("printString", [StringLiteral("small")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "big"


def test_036():
    """Nested if-else"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(5)),
            IfStmt(
                BinaryOp(Identifier("x"), ">", IntLiteral(10)),
                ExprStmt(FuncCall("printString", [StringLiteral("A")])),
                IfStmt(
                    BinaryOp(Identifier("x"), ">", IntLiteral(3)),
                    ExprStmt(FuncCall("printString", [StringLiteral("B")])),
                    ExprStmt(FuncCall("printString", [StringLiteral("C")]))
                )
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "B"


def test_037():
    """If with block body"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(1)),
            IfStmt(
                Identifier("x"),
                BlockStmt([
                    ExprStmt(FuncCall("printString", [StringLiteral("a")])),
                    ExprStmt(FuncCall("printString", [StringLiteral("b")]))
                ]),
                None
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "ab"


def test_038():
    """If with negative condition (non-zero is true)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            IfStmt(
                IntLiteral(-1),
                ExprStmt(FuncCall("printString", [StringLiteral("yes")])),
                ExprStmt(FuncCall("printString", [StringLiteral("no")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "yes"


def test_039():
    """If-else chain (if-elseif-else)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(2)),
            IfStmt(
                BinaryOp(Identifier("x"), "==", IntLiteral(1)),
                ExprStmt(FuncCall("printString", [StringLiteral("one")])),
                IfStmt(
                    BinaryOp(Identifier("x"), "==", IntLiteral(2)),
                    ExprStmt(FuncCall("printString", [StringLiteral("two")])),
                    ExprStmt(FuncCall("printString", [StringLiteral("other")]))
                )
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "two"


def test_040():
    """If with >= and <="""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(5)),
            IfStmt(
                BinaryOp(
                    BinaryOp(Identifier("x"), ">=", IntLiteral(1)),
                    "&&",
                    BinaryOp(Identifier("x"), "<=", IntLiteral(10))
                ),
                ExprStmt(FuncCall("printString", [StringLiteral("in range")])),
                ExprStmt(FuncCall("printString", [StringLiteral("out")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "in range"


# ===========================================================================
# Tests 41-50: while + break + continue
# ===========================================================================


def test_041():
    """Simple while loop"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            WhileStmt(
                BinaryOp(Identifier("i"), "<", IntLiteral(5)),
                BlockStmt([
                    ExprStmt(FuncCall("printInt", [Identifier("i")])),
                    ExprStmt(AssignExpr(Identifier("i"),
                        BinaryOp(Identifier("i"), "+", IntLiteral(1))))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "01234"


def test_042():
    """While loop with break"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            WhileStmt(
                BinaryOp(Identifier("i"), "<", IntLiteral(10)),
                BlockStmt([
                    IfStmt(
                        BinaryOp(Identifier("i"), "==", IntLiteral(3)),
                        BreakStmt(),
                        None
                    ),
                    ExprStmt(FuncCall("printInt", [Identifier("i")])),
                    ExprStmt(AssignExpr(Identifier("i"),
                        BinaryOp(Identifier("i"), "+", IntLiteral(1))))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012"


def test_043():
    """While loop with continue"""
    # Print only odd numbers 1,3,5,7,9
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            WhileStmt(
                BinaryOp(Identifier("i"), "<", IntLiteral(10)),
                BlockStmt([
                    ExprStmt(AssignExpr(Identifier("i"),
                        BinaryOp(Identifier("i"), "+", IntLiteral(1)))),
                    IfStmt(
                        BinaryOp(BinaryOp(Identifier("i"), "%", IntLiteral(2)), "==", IntLiteral(0)),
                        ContinueStmt(),
                        None
                    ),
                    ExprStmt(FuncCall("printInt", [Identifier("i")]))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "13579"


def test_044():
    """While loop that doesn't execute (condition false)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            WhileStmt(
                IntLiteral(0),
                ExprStmt(FuncCall("printString", [StringLiteral("x")]))
            ),
            ExprStmt(FuncCall("printString", [StringLiteral("done")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "done"


def test_045():
    """Nested while loops"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            WhileStmt(
                BinaryOp(Identifier("i"), "<", IntLiteral(3)),
                BlockStmt([
                    VarDecl(IntType(), "j", IntLiteral(0)),
                    WhileStmt(
                        BinaryOp(Identifier("j"), "<", IntLiteral(2)),
                        BlockStmt([
                            ExprStmt(FuncCall("printInt", [Identifier("i")])),
                            ExprStmt(AssignExpr(Identifier("j"),
                                BinaryOp(Identifier("j"), "+", IntLiteral(1))))
                        ])
                    ),
                    ExprStmt(AssignExpr(Identifier("i"),
                        BinaryOp(Identifier("i"), "+", IntLiteral(1))))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "001122"


def test_046():
    """Break in nested while (only inner loop breaks)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            WhileStmt(
                BinaryOp(Identifier("i"), "<", IntLiteral(3)),
                BlockStmt([
                    VarDecl(IntType(), "j", IntLiteral(0)),
                    WhileStmt(
                        BinaryOp(Identifier("j"), "<", IntLiteral(10)),
                        BlockStmt([
                            IfStmt(
                                BinaryOp(Identifier("j"), "==", IntLiteral(2)),
                                BreakStmt(), None
                            ),
                            ExprStmt(FuncCall("printInt", [Identifier("j")])),
                            ExprStmt(AssignExpr(Identifier("j"),
                                BinaryOp(Identifier("j"), "+", IntLiteral(1))))
                        ])
                    ),
                    ExprStmt(AssignExpr(Identifier("i"),
                        BinaryOp(Identifier("i"), "+", IntLiteral(1))))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "010101"


def test_047():
    """While loop summing 1..5"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "sum", IntLiteral(0)),
            VarDecl(IntType(), "i", IntLiteral(1)),
            WhileStmt(
                BinaryOp(Identifier("i"), "<=", IntLiteral(5)),
                BlockStmt([
                    ExprStmt(AssignExpr(Identifier("sum"),
                        BinaryOp(Identifier("sum"), "+", Identifier("i")))),
                    ExprStmt(AssignExpr(Identifier("i"),
                        BinaryOp(Identifier("i"), "+", IntLiteral(1))))
                ])
            ),
            ExprStmt(FuncCall("printInt", [Identifier("sum")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "15"


def test_048():
    """While with && condition"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            VarDecl(IntType(), "ok", IntLiteral(1)),
            WhileStmt(
                BinaryOp(
                    BinaryOp(Identifier("i"), "<", IntLiteral(5)),
                    "&&",
                    Identifier("ok")
                ),
                BlockStmt([
                    ExprStmt(FuncCall("printInt", [Identifier("i")])),
                    ExprStmt(AssignExpr(Identifier("i"),
                        BinaryOp(Identifier("i"), "+", IntLiteral(1)))),
                    IfStmt(
                        BinaryOp(Identifier("i"), "==", IntLiteral(3)),
                        ExprStmt(AssignExpr(Identifier("ok"), IntLiteral(0))),
                        None
                    )
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012"


def test_049():
    """While with prefix increment"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            WhileStmt(
                BinaryOp(Identifier("i"), "<", IntLiteral(3)),
                BlockStmt([
                    ExprStmt(FuncCall("printInt", [Identifier("i")])),
                    ExprStmt(PrefixOp("++", Identifier("i")))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012"


def test_050():
    """Continue skips rest of loop body"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            WhileStmt(
                BinaryOp(Identifier("i"), "<", IntLiteral(5)),
                BlockStmt([
                    ExprStmt(PrefixOp("++", Identifier("i"))),
                    IfStmt(
                        BinaryOp(Identifier("i"), "==", IntLiteral(3)),
                        ContinueStmt(), None
                    ),
                    ExprStmt(FuncCall("printInt", [Identifier("i")]))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1245"


# ===========================================================================
# Tests 51-60: for (init/cond/update optional)
# ===========================================================================


def test_051():
    """Simple for loop"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ForStmt(
                VarDecl(IntType(), "i", IntLiteral(0)),
                BinaryOp(Identifier("i"), "<", IntLiteral(5)),
                PrefixOp("++", Identifier("i")),
                ExprStmt(FuncCall("printInt", [Identifier("i")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "01234"


def test_052():
    """For loop with break"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ForStmt(
                VarDecl(IntType(), "i", IntLiteral(0)),
                BinaryOp(Identifier("i"), "<", IntLiteral(10)),
                PrefixOp("++", Identifier("i")),
                BlockStmt([
                    IfStmt(
                        BinaryOp(Identifier("i"), "==", IntLiteral(3)),
                        BreakStmt(), None
                    ),
                    ExprStmt(FuncCall("printInt", [Identifier("i")]))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012"


def test_053():
    """For loop with continue"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ForStmt(
                VarDecl(IntType(), "i", IntLiteral(0)),
                BinaryOp(Identifier("i"), "<", IntLiteral(5)),
                PrefixOp("++", Identifier("i")),
                BlockStmt([
                    IfStmt(
                        BinaryOp(BinaryOp(Identifier("i"), "%", IntLiteral(2)), "==", IntLiteral(0)),
                        ContinueStmt(), None
                    ),
                    ExprStmt(FuncCall("printInt", [Identifier("i")]))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "13"


def test_054():
    """For without init"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            ForStmt(
                None,
                BinaryOp(Identifier("i"), "<", IntLiteral(3)),
                PrefixOp("++", Identifier("i")),
                ExprStmt(FuncCall("printInt", [Identifier("i")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012"


def test_055():
    """For without condition (infinite loop + break)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(0)),
            ForStmt(
                None,
                None,
                PrefixOp("++", Identifier("i")),
                BlockStmt([
                    IfStmt(
                        BinaryOp(Identifier("i"), "==", IntLiteral(3)),
                        BreakStmt(), None
                    ),
                    ExprStmt(FuncCall("printInt", [Identifier("i")]))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012"


def test_056():
    """For without update"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ForStmt(
                VarDecl(IntType(), "i", IntLiteral(0)),
                BinaryOp(Identifier("i"), "<", IntLiteral(3)),
                None,
                BlockStmt([
                    ExprStmt(FuncCall("printInt", [Identifier("i")])),
                    ExprStmt(AssignExpr(Identifier("i"),
                        BinaryOp(Identifier("i"), "+", IntLiteral(1))))
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012"


def test_057():
    """Nested for loops"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ForStmt(
                VarDecl(IntType(), "i", IntLiteral(0)),
                BinaryOp(Identifier("i"), "<", IntLiteral(2)),
                PrefixOp("++", Identifier("i")),
                BlockStmt([
                    ForStmt(
                        VarDecl(IntType(), "j", IntLiteral(0)),
                        BinaryOp(Identifier("j"), "<", IntLiteral(3)),
                        PrefixOp("++", Identifier("j")),
                        ExprStmt(FuncCall("printInt", [Identifier("j")]))
                    )
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012012"


def test_058():
    """For with assignment in init"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "i", IntLiteral(10)),
            ForStmt(
                ExprStmt(AssignExpr(Identifier("i"), IntLiteral(0))),
                BinaryOp(Identifier("i"), "<", IntLiteral(3)),
                PrefixOp("++", Identifier("i")),
                ExprStmt(FuncCall("printInt", [Identifier("i")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "012"


def test_059():
    """For with postfix update"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ForStmt(
                VarDecl(IntType(), "i", IntLiteral(0)),
                BinaryOp(Identifier("i"), "<", IntLiteral(4)),
                PostfixOp("++", Identifier("i")),
                ExprStmt(FuncCall("printInt", [Identifier("i")]))
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "0123"


def test_060():
    """For summing 1..10"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "sum", IntLiteral(0)),
            ForStmt(
                VarDecl(IntType(), "i", IntLiteral(1)),
                BinaryOp(Identifier("i"), "<=", IntLiteral(10)),
                PrefixOp("++", Identifier("i")),
                ExprStmt(AssignExpr(Identifier("sum"),
                    BinaryOp(Identifier("sum"), "+", Identifier("i"))))
            ),
            ExprStmt(FuncCall("printInt", [Identifier("sum")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "55"


# ===========================================================================
# Tests 61-70: switch/case/default + fall-through + break
# ===========================================================================


def test_061():
    """Simple switch with break"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(2)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(IntLiteral(1), [
                        ExprStmt(FuncCall("printString", [StringLiteral("one")])),
                        BreakStmt()
                    ]),
                    CaseStmt(IntLiteral(2), [
                        ExprStmt(FuncCall("printString", [StringLiteral("two")])),
                        BreakStmt()
                    ]),
                    CaseStmt(IntLiteral(3), [
                        ExprStmt(FuncCall("printString", [StringLiteral("three")])),
                        BreakStmt()
                    ]),
                ],
                None
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "two"


def test_062():
    """Switch with default"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(5)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(IntLiteral(1), [
                        ExprStmt(FuncCall("printString", [StringLiteral("one")])),
                        BreakStmt()
                    ]),
                ],
                DefaultStmt([
                    ExprStmt(FuncCall("printString", [StringLiteral("default")])),
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "default"


def test_063():
    """Switch fall-through (no break)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(1)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(IntLiteral(1), [
                        ExprStmt(FuncCall("printString", [StringLiteral("A")])),
                    ]),
                    CaseStmt(IntLiteral(2), [
                        ExprStmt(FuncCall("printString", [StringLiteral("B")])),
                    ]),
                    CaseStmt(IntLiteral(3), [
                        ExprStmt(FuncCall("printString", [StringLiteral("C")])),
                    ]),
                ],
                None
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "ABC"


def test_064():
    """Switch partial fall-through"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(2)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(IntLiteral(1), [
                        ExprStmt(FuncCall("printString", [StringLiteral("A")])),
                        BreakStmt()
                    ]),
                    CaseStmt(IntLiteral(2), [
                        ExprStmt(FuncCall("printString", [StringLiteral("B")])),
                    ]),
                    CaseStmt(IntLiteral(3), [
                        ExprStmt(FuncCall("printString", [StringLiteral("C")])),
                        BreakStmt()
                    ]),
                ],
                None
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "BC"


def test_065():
    """Switch empty body"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(1)),
            SwitchStmt(Identifier("x"), [], None),
            ExprStmt(FuncCall("printString", [StringLiteral("ok")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "ok"


def test_066():
    """Switch case with expression"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(3)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(BinaryOp(IntLiteral(1), "+", IntLiteral(2)), [
                        ExprStmt(FuncCall("printString", [StringLiteral("match")])),
                        BreakStmt()
                    ]),
                ],
                DefaultStmt([
                    ExprStmt(FuncCall("printString", [StringLiteral("no")])),
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "match"


def test_067():
    """Switch with default before case (order doesn't matter)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(1)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(IntLiteral(1), [
                        ExprStmt(FuncCall("printString", [StringLiteral("one")])),
                        BreakStmt()
                    ]),
                ],
                DefaultStmt([
                    ExprStmt(FuncCall("printString", [StringLiteral("def")])),
                    BreakStmt()
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "one"


def test_068():
    """Switch fall-through into default"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(2)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(IntLiteral(1), [
                        ExprStmt(FuncCall("printString", [StringLiteral("A")])),
                        BreakStmt()
                    ]),
                    CaseStmt(IntLiteral(2), [
                        ExprStmt(FuncCall("printString", [StringLiteral("B")])),
                    ]),
                ],
                DefaultStmt([
                    ExprStmt(FuncCall("printString", [StringLiteral("D")])),
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "BD"


def test_069():
    """Switch no matching case, goes to default"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(99)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(IntLiteral(1), [
                        ExprStmt(FuncCall("printString", [StringLiteral("one")])),
                        BreakStmt()
                    ]),
                    CaseStmt(IntLiteral(2), [
                        ExprStmt(FuncCall("printString", [StringLiteral("two")])),
                        BreakStmt()
                    ]),
                ],
                DefaultStmt([
                    ExprStmt(FuncCall("printString", [StringLiteral("other")])),
                ])
            )
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "other"


def test_070():
    """Switch no matching case, no default (nothing executed)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(99)),
            SwitchStmt(
                Identifier("x"),
                [
                    CaseStmt(IntLiteral(1), [
                        ExprStmt(FuncCall("printString", [StringLiteral("one")])),
                        BreakStmt()
                    ]),
                ],
                None
            ),
            ExprStmt(FuncCall("printString", [StringLiteral("done")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "done"


# ===========================================================================
# Tests 71-80: function call, nested call, return types
# ===========================================================================


def test_071():
    """Function with int return"""
    ast = Program([
        FuncDecl(IntType(), "add", [Param(IntType(), "a"), Param(IntType(), "b")],
            BlockStmt([ReturnStmt(BinaryOp(Identifier("a"), "+", Identifier("b")))])
        ),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [FuncCall("add", [IntLiteral(20), IntLiteral(22)])]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "42"


def test_072():
    """Function with float return"""
    ast = Program([
        FuncDecl(FloatType(), "half", [Param(FloatType(), "x")],
            BlockStmt([ReturnStmt(BinaryOp(Identifier("x"), "/", FloatLiteral(2.0)))])
        ),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printFloat", [FuncCall("half", [FloatLiteral(10.0)])]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "5.0"


def test_073():
    """Function with string return"""
    ast = Program([
        FuncDecl(StringType(), "greet", [],
            BlockStmt([ReturnStmt(StringLiteral("Hi"))])
        ),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printString", [FuncCall("greet", [])]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "Hi"


def test_074():
    """Recursive function: factorial"""
    ast = Program([
        FuncDecl(IntType(), "fact", [Param(IntType(), "n")], BlockStmt([
            IfStmt(
                BinaryOp(Identifier("n"), "<=", IntLiteral(1)),
                ReturnStmt(IntLiteral(1)),
                ReturnStmt(BinaryOp(Identifier("n"), "*",
                    FuncCall("fact", [BinaryOp(Identifier("n"), "-", IntLiteral(1))])))
            )
        ])),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [FuncCall("fact", [IntLiteral(5)])]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "120"


def test_075():
    """Void function"""
    ast = Program([
        FuncDecl(VoidType(), "hello", [], BlockStmt([
            ExprStmt(FuncCall("printString", [StringLiteral("Hello")]))
        ])),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("hello", []))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "Hello"


def test_076():
    """Function with multiple parameters"""
    ast = Program([
        FuncDecl(IntType(), "max", [Param(IntType(), "a"), Param(IntType(), "b")], BlockStmt([
            IfStmt(
                BinaryOp(Identifier("a"), ">", Identifier("b")),
                ReturnStmt(Identifier("a")),
                ReturnStmt(Identifier("b"))
            )
        ])),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [FuncCall("max", [IntLiteral(7), IntLiteral(3)])]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "7"


def test_077():
    """Nested function calls"""
    ast = Program([
        FuncDecl(IntType(), "inc", [Param(IntType(), "x")],
            BlockStmt([ReturnStmt(BinaryOp(Identifier("x"), "+", IntLiteral(1)))])
        ),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [
                FuncCall("inc", [FuncCall("inc", [FuncCall("inc", [IntLiteral(0)])])])
            ]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "3"


def test_078():
    """Function with local variable"""
    ast = Program([
        FuncDecl(IntType(), "double", [Param(IntType(), "x")], BlockStmt([
            VarDecl(IntType(), "result", BinaryOp(Identifier("x"), "*", IntLiteral(2))),
            ReturnStmt(Identifier("result"))
        ])),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [FuncCall("double", [IntLiteral(21)])]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "42"


def test_079():
    """Multiple function calls in sequence"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [IntLiteral(1)])),
            ExprStmt(FuncCall("printString", [StringLiteral(" ")])),
            ExprStmt(FuncCall("printFloat", [FloatLiteral(2.0)])),
            ExprStmt(FuncCall("printString", [StringLiteral(" ")])),
            ExprStmt(FuncCall("printString", [StringLiteral("end")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1 2.0 end"


def test_080():
    """Fibonacci function"""
    ast = Program([
        FuncDecl(IntType(), "fib", [Param(IntType(), "n")], BlockStmt([
            IfStmt(
                BinaryOp(Identifier("n"), "<=", IntLiteral(1)),
                ReturnStmt(Identifier("n")),
                ReturnStmt(BinaryOp(
                    FuncCall("fib", [BinaryOp(Identifier("n"), "-", IntLiteral(1))]),
                    "+",
                    FuncCall("fib", [BinaryOp(Identifier("n"), "-", IntLiteral(2))])
                ))
            )
        ])),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [FuncCall("fib", [IntLiteral(7)])]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "13"


# ===========================================================================
# Tests 81-90: prefix/postfix on variables and members
# ===========================================================================


def test_081():
    """Prefix ++"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(5)),
            ExprStmt(FuncCall("printInt", [PrefixOp("++", Identifier("x"))])),
            ExprStmt(FuncCall("printInt", [Identifier("x")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "66"


def test_082():
    """Prefix --"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(5)),
            ExprStmt(FuncCall("printInt", [PrefixOp("--", Identifier("x"))])),
            ExprStmt(FuncCall("printInt", [Identifier("x")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "44"


def test_083():
    """Postfix ++"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(5)),
            ExprStmt(FuncCall("printInt", [PostfixOp("++", Identifier("x"))])),
            ExprStmt(FuncCall("printInt", [Identifier("x")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "56"


def test_084():
    """Postfix --"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(5)),
            ExprStmt(FuncCall("printInt", [PostfixOp("--", Identifier("x"))])),
            ExprStmt(FuncCall("printInt", [Identifier("x")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "54"


def test_085():
    """Unary minus int"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(7)),
            ExprStmt(FuncCall("printInt", [PrefixOp("-", Identifier("x"))]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "-7"


def test_086():
    """Unary minus float"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(FloatType(), "f", FloatLiteral(3.5)),
            ExprStmt(FuncCall("printFloat", [PrefixOp("-", Identifier("f"))]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "-3.5"


def test_087():
    """Unary plus (no-op)"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            ExprStmt(FuncCall("printInt", [PrefixOp("+", IntLiteral(42))]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "42"


def test_088():
    """Prefix ++ on struct member"""
    ast = Program([
        StructDecl("Counter", [MemberDecl(IntType(), "val")]),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Counter"), "c", StructLiteral([IntLiteral(10)])),
            ExprStmt(FuncCall("printInt", [
                PrefixOp("++", MemberAccess(Identifier("c"), "val"))
            ])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("c"), "val")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1111"


def test_089():
    """Postfix ++ on struct member"""
    ast = Program([
        StructDecl("Counter", [MemberDecl(IntType(), "val")]),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Counter"), "c", StructLiteral([IntLiteral(10)])),
            ExprStmt(FuncCall("printInt", [
                PostfixOp("++", MemberAccess(Identifier("c"), "val"))
            ])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("c"), "val")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1011"


def test_090():
    """Chained assignment x = y = 10"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(0)),
            VarDecl(IntType(), "y", IntLiteral(0)),
            ExprStmt(AssignExpr(
                Identifier("x"),
                AssignExpr(Identifier("y"), IntLiteral(10))
            )),
            ExprStmt(FuncCall("printInt", [Identifier("x")])),
            ExprStmt(FuncCall("printInt", [Identifier("y")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1010"


# ===========================================================================
# Tests 91-100: struct declaration/use, member read-write, struct literal
# ===========================================================================


def test_091():
    """Struct declaration and member write/read"""
    ast = Program([
        StructDecl("Point", [MemberDecl(IntType(), "x"), MemberDecl(IntType(), "y")]),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Point"), "p", StructLiteral([IntLiteral(10), IntLiteral(20)])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("p"), "x")])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("p"), "y")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "1020"


def test_092():
    """Struct member assignment"""
    ast = Program([
        StructDecl("Point", [MemberDecl(IntType(), "x"), MemberDecl(IntType(), "y")]),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Point"), "p", StructLiteral([IntLiteral(0), IntLiteral(0)])),
            ExprStmt(AssignExpr(MemberAccess(Identifier("p"), "x"), IntLiteral(42))),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("p"), "x")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "42"


def test_093():
    """Struct with string member"""
    ast = Program([
        StructDecl("Person", [MemberDecl(StringType(), "name"), MemberDecl(IntType(), "age")]),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Person"), "p",
                StructLiteral([StringLiteral("Alice"), IntLiteral(25)])),
            ExprStmt(FuncCall("printString", [MemberAccess(Identifier("p"), "name")])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("p"), "age")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "Alice25"


def test_094():
    """Struct passed to function"""
    ast = Program([
        StructDecl("Point", [MemberDecl(IntType(), "x"), MemberDecl(IntType(), "y")]),
        FuncDecl(IntType(), "getX", [Param(StructType("Point"), "p")],
            BlockStmt([ReturnStmt(MemberAccess(Identifier("p"), "x"))])
        ),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Point"), "pt", StructLiteral([IntLiteral(7), IntLiteral(8)])),
            ExprStmt(FuncCall("printInt", [FuncCall("getX", [Identifier("pt")])]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "7"


def test_095():
    """Function returning struct"""
    ast = Program([
        StructDecl("Point", [MemberDecl(IntType(), "x"), MemberDecl(IntType(), "y")]),
        FuncDecl(StructType("Point"), "makePoint",
            [Param(IntType(), "x"), Param(IntType(), "y")],
            BlockStmt([
                VarDecl(StructType("Point"), "p", StructLiteral([Identifier("x"), Identifier("y")])),
                ReturnStmt(Identifier("p"))
            ])
        ),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Point"), "p",
                FuncCall("makePoint", [IntLiteral(3), IntLiteral(4)])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("p"), "x")])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("p"), "y")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "34"


def test_096():
    """Struct assignment (reference copy)"""
    ast = Program([
        StructDecl("Point", [MemberDecl(IntType(), "x"), MemberDecl(IntType(), "y")]),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Point"), "p1", StructLiteral([IntLiteral(1), IntLiteral(2)])),
            VarDecl(StructType("Point"), "p2", Identifier("p1")),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("p2"), "x")])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("p2"), "y")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "12"


def test_097():
    """Nested struct"""
    ast = Program([
        StructDecl("Coord", [MemberDecl(IntType(), "val")]),
        StructDecl("Wrapper", [MemberDecl(StructType("Coord"), "nested"), MemberDecl(IntType(), "id")]),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Wrapper"), "o",
                StructLiteral([StructLiteral([IntLiteral(42)]), IntLiteral(1)])),
            ExprStmt(FuncCall("printInt", [
                MemberAccess(MemberAccess(Identifier("o"), "nested"), "val")
            ])),
            ExprStmt(FuncCall("printInt", [MemberAccess(Identifier("o"), "id")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "421"


def test_098():
    """Empty struct"""
    ast = Program([
        StructDecl("Empty", []),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Empty"), "e", StructLiteral([])),
            ExprStmt(FuncCall("printString", [StringLiteral("ok")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "ok"


def test_099():
    """Struct with float member and arithmetic"""
    ast = Program([
        StructDecl("Circle", [MemberDecl(FloatType(), "radius")]),
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(StructType("Circle"), "c", StructLiteral([FloatLiteral(5.0)])),
            VarDecl(FloatType(), "area",
                BinaryOp(
                    BinaryOp(FloatLiteral(3.14), "*", MemberAccess(Identifier("c"), "radius")),
                    "*",
                    MemberAccess(Identifier("c"), "radius")
                )),
            ExprStmt(FuncCall("printFloat", [Identifier("area")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "78.5"


def test_100():
    """Assignment expression used in expression context: (x = 5) + 7"""
    ast = Program([
        FuncDecl(VoidType(), "main", [], BlockStmt([
            VarDecl(IntType(), "x", IntLiteral(0)),
            VarDecl(IntType(), "y",
                BinaryOp(
                    AssignExpr(Identifier("x"), IntLiteral(5)),
                    "+",
                    IntLiteral(7)
                )
            ),
            ExprStmt(FuncCall("printInt", [Identifier("x")])),
            ExprStmt(FuncCall("printInt", [Identifier("y")]))
        ]))
    ])
    assert CodeGenerator().generate_and_run(ast) == "512"
