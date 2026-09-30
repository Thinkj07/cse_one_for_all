"""
Lexer test cases for TyC compiler
TODO: Implement 100 test cases for lexer
"""

import pytest
from tests.utils import Tokenizer


# ========== Simple Test Cases (10 types) ==========
def test_keyword_auto():
    """1. Keyword"""
    tokenizer = Tokenizer("auto")
    assert tokenizer.get_tokens_as_string() == "auto,<EOF>"


def test_operator_assign():
    """2. Operator"""
    tokenizer = Tokenizer("=")
    assert tokenizer.get_tokens_as_string() == "=,<EOF>"


def test_separator_semi():
    """3. Separator"""
    tokenizer = Tokenizer(";")
    assert tokenizer.get_tokens_as_string() == ";,<EOF>"


def test_integer_single_digit():
    """4. Integer literal"""
    tokenizer = Tokenizer("5")
    assert tokenizer.get_tokens_as_string() == "5,<EOF>"


def test_float_decimal():
    """5. Float literal"""
    tokenizer = Tokenizer("3.14")
    assert tokenizer.get_tokens_as_string() == "3.14,<EOF>"


def test_string_simple():
    """6. String literal"""
    tokenizer = Tokenizer('"hello"')
    assert tokenizer.get_tokens_as_string() == "hello,<EOF>"


def test_identifier_simple():
    """7. Identifier"""
    tokenizer = Tokenizer("x")
    assert tokenizer.get_tokens_as_string() == "x,<EOF>"


def test_line_comment():
    """8. Line comment"""
    tokenizer = Tokenizer("// This is a comment")
    assert tokenizer.get_tokens_as_string() == "<EOF>"


def test_integer_in_expression():
    """9. Mixed: integers and operator"""
    tokenizer = Tokenizer("5+10")
    assert tokenizer.get_tokens_as_string() == "5,+,10,<EOF>"


def test_complex_expression():
    """10. Complex: variable declaration"""
    tokenizer = Tokenizer("auto x = 5 + 3 * 2;")
    assert tokenizer.get_tokens_as_string() == "auto,x,=,5,+,3,*,2,;,<EOF>"


_ADDITIONAL_LEXER_CASES = [
    ("break", "break,<EOF>"),
    ("case", "case,<EOF>"),
    ("continue", "continue,<EOF>"),
    ("default", "default,<EOF>"),
    ("else", "else,<EOF>"),
    ("float", "float,<EOF>"),
    ("for", "for,<EOF>"),
    ("if", "if,<EOF>"),
    ("int", "int,<EOF>"),
    ("return", "return,<EOF>"),
    ("string", "string,<EOF>"),
    ("struct", "struct,<EOF>"),
    ("switch", "switch,<EOF>"),
    ("void", "void,<EOF>"),
    ("while", "while,<EOF>"),
    ("==", "==,<EOF>"),
    ("!=", "!=,<EOF>"),
    ("<=", "<=,<EOF>"),
    (">=", ">=,<EOF>"),
    ("<", "<,<EOF>"),
    (">", ">,<EOF>"),
    ("||", "||,<EOF>"),
    ("&&", "&&,<EOF>"),
    ("!", "!,<EOF>"),
    ("++", "++,<EOF>"),
    ("--", "--,<EOF>"),
    ("+", "+,<EOF>"),
    ("-", "-,<EOF>"),
    ("*", "*,<EOF>"),
    ("/", "/,<EOF>"),
    ("%", "%,<EOF>"),
    (".", ".,<EOF>"),
    ("{", "{,<EOF>"),
    ("}", "},<EOF>"),
    ("(", "(,<EOF>"),
    (")", "),<EOF>"),
    (";", ";,<EOF>"),
    (",", ",,<EOF>"),
    (":", ":,<EOF>"),
    ("0", "0,<EOF>"),
    ("42", "42,<EOF>"),
    ("0007", "0007,<EOF>"),
    ("1.", "1.,<EOF>"),
    (".5", ".5,<EOF>"),
    ("1.25", "1.25,<EOF>"),
    ("1e4", "1e4,<EOF>"),
    ("2E-3", "2E-3,<EOF>"),
    ("5.67E+2", "5.67E+2,<EOF>"),
    ('""', ",<EOF>"),
    ('"hello world"', "hello world,<EOF>"),
    ('"a\\n\\t"', "a\\n\\t,<EOF>"),
    ('"quote: \\\"ok\\\""', 'quote: \\\"ok\\\",<EOF>'),
    ('"slash: \\\\"', "slash: \\\\,<EOF>"),
    ("_", "_,<EOF>"),
    ("_value", "_value,<EOF>"),
    ("camelCase", "camelCase,<EOF>"),
    ("Type2", "Type2,<EOF>"),
    ("a1b2", "a1b2,<EOF>"),
    ("__private__", "__private__,<EOF>"),
    ("first second", "first,second,<EOF>"),
    ("a\tb", "a,b,<EOF>"),
    ("a\nb", "a,b,<EOF>"),
    ("/* comment */x", "x,<EOF>"),
    ("x// comment", "x,<EOF>"),
    ("// comment\n42", "42,<EOF>"),
    ("/**/", "<EOF>"),
    ("int x", "int,x,<EOF>"),
    ("float y", "float,y,<EOF>"),
    ("string s", "string,s,<EOF>"),
    ("x=1", "x,=,1,<EOF>"),
    ("x+=1", "x,+,=,1,<EOF>"),
    ("x==1", "x,==,1,<EOF>"),
    ("a&&b||c", "a,&&,b,||,c,<EOF>"),
    ("i++", "i,++,<EOF>"),
    ("--j", "--,j,<EOF>"),
    ("p.x", "p,.,x,<EOF>"),
    ("{1,2,3}", "{,1,,,2,,,3,},<EOF>"),
    ("f()", "f,(,),<EOF>"),
    ("f(1, 2)", "f,(,1,,,2,),<EOF>"),
    ("1+2*3", "1,+,2,*,3,<EOF>"),
    ("!x", "!,x,<EOF>"),
    ("x<=y", "x,<=,y,<EOF>"),
    ("x>=y", "x,>=,y,<EOF>"),
    ("a!=b", "a,!=,b,<EOF>"),
    ("return;", "return,;,<EOF>"),
    ("break;", "break,;,<EOF>"),
    ("continue;", "continue,;,<EOF>"),
    ("struct A{};", "struct,A,{,},;,<EOF>"),
    ("void main(){}", "void,main,(,),{,},<EOF>"),
    ("auto x=3.14;", "auto,x,=,3.14,;,<EOF>"),
    ("if(x){y=0;}", "if,(,x,),{,y,=,0,;,},<EOF>"),
    ("for(;;)", "for,(,;,;,),<EOF>"),
    ("switch(x){case 1:}", "switch,(,x,),{,case,1,:,},<EOF>"),
    ("x / y", "x,/,y,<EOF>"),
    ("x % y", "x,%,y,<EOF>"),
    ("x . y", "x,.,y,<EOF>"),
]


@pytest.mark.parametrize("source, expected", _ADDITIONAL_LEXER_CASES)
def test_additional_lexer_cases(source, expected):
    assert Tokenizer(source).get_tokens_as_string() == expected
