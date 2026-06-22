/*
 * Ho Chi Minh City University of Technology
 * Faculty of Computer Science and Engineering
 * Initial code for Assignment 1
 * Programming Fundamentals Spring 2023
 * Author: Vu Van Tien
 * Date: 02.02.2023
 */

// The library here is concretely set, students are not allowed to include any
// other libraries.

#include "study_in_pink1.h"

using namespace std;

void test_firstMeet(int exp1, int exp2, int e1, int tc) {
  cout << "----- Testcase " << tc << " -----" << endl;
  int result = firstMeet(exp1, exp2, e1);
  cout << "EXP1: " << exp1 << ", EXP2: " << exp2 << ", result: " << result
       << endl;
}

void test_traceLuggage(int hp1, int exp1, int m1, int e2, int tc) {
  cout << "----- Testcase " << tc << " -----" << endl;
  int result = traceLuggage(hp1, exp1, m1, e2);
  cout << "HP1: " << hp1 << ", EXP1: " << exp1 << ", M1: " << m1
       << ", result: " << result << endl;
}

void test_chaseTaxi(int hp1, int exp1, int hp2, int exp2, int e3, int tc) {
  cout << "----- Testcase " << tc << " -----" << endl;
  int result = chaseTaxi(hp1, exp1, hp2, exp2, e3);
  cout << "HP1: " << hp1 << ", EXP1: " << exp1 << ", HP2: " << hp2
       << ", EXP2: " << exp2 << ", result: " << result << endl;
}

void test_checkPassword(const char *s, const char *email, int tc) {
  cout << "----- Testcase " << tc << " -----" << endl;
  int result = checkPassword(s, email);
  cout << "result: " << result << endl;
}

void test_findCorrectPassword(const char *arr_pwds[], int num_pwds, int tc) {
  cout << "----- Testcase " << tc << " -----" << endl;
  int result = findCorrectPassword(arr_pwds, num_pwds);
  cout << "result: " << result << endl;
}

int main(int argc, const char *argv[]) {
  // 10 test cases for firstMeet
  test_firstMeet(150, 200, 0, 1);
  test_firstMeet(300, 400, 1, 2);
  test_firstMeet(10, 20, 2, 3);
  test_firstMeet(250, 350, 3, 4);
  test_firstMeet(0, 0, 10, 5);
  test_firstMeet(600, 600, 30, 6);
  test_firstMeet(120, 150, 60, 7);
  test_firstMeet(450, 50, 70, 8);
  test_firstMeet(100, 100, 90, 9);
  test_firstMeet(700, 700, 99, 10);

  // 10 test cases for traceLuggage
  test_traceLuggage(100, 150, 500, 0, 11);
  test_traceLuggage(250, 450, 1000, 10, 12);
  test_traceLuggage(150, 350, 2000, 25, 13);
  test_traceLuggage(300, 250, 100, 31, 14);
  test_traceLuggage(500, 500, 3000, 50, 15);
  test_traceLuggage(50, 100, 50, 67, 16);
  test_traceLuggage(190, 390, 1500, 78, 17);
  test_traceLuggage(210, 410, 2500, 89, 18);
  test_traceLuggage(0, 0, 0, 99, 19);
  test_traceLuggage(666, 600, 3000, 5, 20);

  // 10 test cases for chaseTaxi(int & HP1, int & EXP1, int & HP2, int & EXP2,
  // int E3)
//   test_chaseTaxi(100, 150, 200, 250, 0, 21);
//   test_chaseTaxi(300, 400, 100, 150, 15, 22);
//   test_chaseTaxi(50, 50, 50, 50, 30, 23);
//   test_chaseTaxi(600, 600, 600, 600, 45, 24);
//   test_chaseTaxi(0, 0, 0, 0, 60, 25);
//   test_chaseTaxi(120, 130, 140, 150, 75, 26);
//   test_chaseTaxi(230, 240, 250, 260, 80, 27);
//   test_chaseTaxi(340, 350, 360, 370, 95, 28);
//   test_chaseTaxi(450, 460, 470, 480, 99, 29);
//   test_chaseTaxi(666, 600, 666, 600, 10, 30);

  // 10 test cases for checkPassword(const char * s, const char * email)
  test_checkPassword("1234567", "abc@gmail.com", 31); // length < 8
  test_checkPassword("123456789012345678901", "abc@gmail.com",
                     32);                               // length > 20
  test_checkPassword("abc@12345", "abc@gmail.com", 33); // contains se
  test_checkPassword("aab@12345", "abc@gmail.com", 34); // valid
  test_checkPassword("aaa@12345", "def@gmail.com",
                     35); // consecutive identical characters
  test_checkPassword("abcdefgh", "xyz@gmail.com", 36);     // no special chars
  test_checkPassword("A@1abcdef", "lmn@gmail.com", 37);    // valid
  test_checkPassword("a@1^bcdef", "pqr@gmail.com", 38);    // invalid char ^
  test_checkPassword("hello@world", "test@gmail.com", 39); // valid
  test_checkPassword("validPw#1", "user@mail.com", 40);    // valid

  // 9 test cases for findCorrectPassword(const char * arr_pwds[], int num_pwds)
  const char *arr1[] = {"1234567", "abcdefg", "1234567"};
  test_findCorrectPassword(arr1, 3, 41);

  const char *arr2[] = {"abc", "def", "ghi"};
  test_findCorrectPassword(arr2, 3, 42);

  const char *arr3[] = {"longer1", "longer1", "sh1", "sh1"};
  test_findCorrectPassword(arr3, 4, 43);

  const char *arr4[] = {"abc", "abc", "def", "def", "def"};
  test_findCorrectPassword(arr4, 5, 44);

  const char *arr5[] = {"same", "same", "same"};
  test_findCorrectPassword(arr5, 3, 45);

  const char *arr6[] = {"a", "b", "c", "d", "a", "b"};
  test_findCorrectPassword(arr6, 6, 46);

  const char *arr7[] = {"password", "password", "wordpass", "wordpass"};
  test_findCorrectPassword(arr7, 4, 47);

  const char *arr8[] = {"test1", "test1", "test2", "test1", "test2"};
  test_findCorrectPassword(arr8, 5, 48);

  const char *arr9[] = {"pwd", "pwd", "pwd"};
  test_findCorrectPassword(arr9, 3, 49);

  return 0;
}