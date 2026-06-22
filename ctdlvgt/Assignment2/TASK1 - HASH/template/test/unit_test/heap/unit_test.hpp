#ifndef UNIT_TEST_HEAP_HPP
#define UNIT_TEST_HEAP_HPP

#include "heap/Heap.h"
#include "library.hpp"
class UNIT_TEST_Heap {
 public:
  UNIT_TEST_Heap() {
    // TODO unit test new
  }

 private:
  // TODO unit test new

 public:
  static map<string, bool (UNIT_TEST_Heap::*)()> TESTS;
  // ANSI escape codes for colors
  const string green = "\033[32m";
  const string red = "\033[31m";
  const string cyan = "\033[36m";
  const string reset = "\033[0m";  // To reset to default color

  // print result test case
  bool printResult(string output, string expect, string name) {
    if (expect == output) {
      cout << green << "test " + name + " --------------- PASS" << reset
           << "\n";
      return true;
    } else {
      cout << red << "test " + name + " --------------- FAIL" << reset << "\n";
      cout << "\texpect : " << expect << endl;
      cout << "\toutput : " << output << endl;
      return false;
    }
  }
  // run 1 test case
  void runTest(const std::string &name) {
    auto it = TESTS.find(name);
    if (it != TESTS.end()) {
      (this->*(it->second))();
    } else {
      throw std::runtime_error("Test with name '" + name + "' does not exist.");
    }
  }
  // run all test case
  void runAllTests() {
    vector<string> fails;
    for (const auto &test : TESTS) {
      if (!(this->*(test.second))()) {
        fails.push_back(test.first);
      }
    }

    cout << cyan << "\nResult -------------------------" << reset << endl;
    // Print the results
    if (fails.empty()) {
      cout << green << "All tests passed!" << reset << endl;
    } else {
      int totalTests = TESTS.size();
      int failedTests = fails.size();
      int passedTests = totalTests - failedTests;
      double passRate =
          (totalTests > 0)
              ? (static_cast<double>(passedTests) / totalTests) * 100.0
              : 0.0;
      cout << red << "Some tests failed:";
      for (const auto &fail : fails) {
        cout << "  " << fail;
      }
      cout << cyan << "\nPass rate: " << passRate << "%" << reset << endl;
    }
  }
  static void registerTest(string name, bool (UNIT_TEST_Heap::*function)()) {
    if (TESTS.find(name) != TESTS.end()) {
      throw std::runtime_error("Test with name '" + name + "' already exists.");
    }
    TESTS[name] = function;
  }
};

#endif  // UNIT_TEST_heap_HPP