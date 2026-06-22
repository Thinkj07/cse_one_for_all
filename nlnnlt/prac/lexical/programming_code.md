## Question 1
Use `ANTLR` to write regular expressions describing a Pascal identifier that must begin with a lowercase letter (’a’ to ’z’), but may continue with many characters which are lowercase letter or digit (’0’ to ’9’).

Example: 
| Test | Result |
|---|---|
| "abc" | abc,\<EOF> |
**ANSWER**
```
IDENTIFIER: [a-z] [a-z0-9]*;
```

## Question 2
Use ANTLR to write regular expressions describing Pascal tokens For a number to be taken as "real" (or "floating point") format, it must either have a decimal point, or use scientific notation. For example, 1.0, 1e-12, 1.0e-12, 0.000000001 are all valid reals. At least one digit must exist on either side of a decimal point.

Example:
| Test | Result |
|---|---|
| "1.0" | 1.0,\<EOF> |
**ANSWER**
```
REAL_NUMBER: DIGIT+ '.' DIGIT+ (EXPONENT)? | DIGIT+ EXPONENT;
fragment EXPONENT   : [eE] [+-]? DIGIT+;
fragment DIGIT  : [0-9];
```

## Question 3
Use ANTLR to write regular expressions describing Pascal strings are made up of a sequence of characters between single quotes: 'string'. The single quote itself can appear as two single quotes back to back in a string: 'isn''t'.

Example:
| Test | Result |
|---|---|
| "'Yanxi Palace - 2018'" | 'Yanxi Palace - 2018',\<EOF> |
**ANSWER**
```
STRING: '\'' ('\'\'' | ~['\r\n])* '\'';
```

## Question 4
Use ANTLR to write regular expressions describing PHP's integers (in decimal) which is a sequence of digits (0-9) starting with a non-zero digit or only a zero. Integer literals may contain underscores (_) between digits, for better readability of literals but these underscores are removed by PHP's scanner.

Example:
| Test | Result |
|---|---|
| 1_234_567 | 1234567,\<EOF>|
**ANSWER**
```
INTERGER_PHP: ( '0' | [1-9] ( DIGIT | '_' DIGIT )* ) {self.text = self.text.replace('_', '')};
fragment DIGIT  : [0-9];
```

## Question 5
Use ANTLR to write regular expressions describing a valid IPv4 address. It consists of exact 4 strings, whose length is from 1 to 3, of digits (0-9) but not starting with 0 unless the string is 0. The strings are separated by one dot (.). 

Example:
| Test | Result |
|---|---|
| 192.168.0.1 | 192.168.0.1,\<EOF>|
**ANSWER**
```
IPV4_ADDRESS : SEGMENT '.' SEGMENT '.' SEGMENT '.' SEGMENT;
fragment SEGMENT    : '0' | [1-9] DIGIT? DIGIT?;
fragment DIGIT  : [0-9];
```

## Question 6
Use ANTLR to write a regular expression for the token **SHEXA** that describes hexadecimal number strings satisfying all the following requirements:

- Non-empty

- Corresponds to an even integer

- The first character must be a digit

- Case-insensitive (does not distinguish between lowercase and uppercase letters)

- Do not use actions when writing the regular expression for `SHEXA`

Examples of valid strings for **SHEXA**: `12`, `21A`, `3dC`, `2`

Examples of invalid strings for **SHEXA**: `A12` (first character is a letter), 1B (corresponds to 27, which is not an even integer).

Example:
| Test | Result |
|---|---|
| 12 | 12,\<EOF>|
**ANSWER**
```
SHEXA: DIGIT (HEX_DIGIT)* EVEN_HEX;
fragment HEX_DIGIT  : [0-9a-fA-F];
fragment EVEN_HEX   : [02468aAcCeE] ;
fragment DIGIT  : [0-9];
```

## Question 7
When enrolling at the University of Technology, students are required to set an account name called **BKNetID**, which consists of three components in this order: given name, family name, and a user-chosen string. A dot (.) must be placed between the given name and the family name. The given name and family name are strings containing only lowercase letters, with a minimum length of 1. The user-chosen string is 1 to 5 characters long and may include lowercase letters, digits, dots, and underscores, but it must not end with a dot.

Examples: `duy.tran2903`, `duy.tran.3_12` are valid BKNetIDs, whereas `duy.tran2903.` or `duy2.tran2903` are invalid.

Use ANTLR to write the regular expression for the BKNetID described above. Students must use a **fragment** to receive full credit.

Example:
| Test | Result |
|---|---|
| duy.tran2903 | duy.tran2903,\<EOF>|
**ANSWER**
```
BKNETID: NAME '.' NAME USER_PART;
fragment USER_PART  : CHAR LASTCHAR;
fragment CHAR       : [a-zA-Z0-9._] [a-zA-Z0-9._] [a-zA-Z0-9._] [a-zA-Z0-9._];
fragment LASTCHAR   : [a-zA-Z0-9_];
fragment NAME       : [a-z]+;
```