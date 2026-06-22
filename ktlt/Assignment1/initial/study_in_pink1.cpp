#include "study_in_pink1.h"

bool readFile(const string &filename, int &HP1, int &HP2, int &EXP1, int &EXP2,
              int &M1, int &M2, int &E1, int &E2, int &E3) {
  // This function is used to read the input file,
  // DO NOT MODIFY THIS FUNTION
  ifstream ifs(filename);
  if (ifs.is_open()) {
    ifs >> HP1 >> HP2 >> EXP1 >> EXP2 >> M1 >> M2 >> E1 >> E2 >> E3;
    return true;
  } else {
    cerr << "The file is not found" << endl;
    return false;
  }
}

////////////////////////////////////////////////////////////////////////
/// STUDENT'S ANSWER BEGINS HERE
/// Complete the following functions
/// DO NOT modify any parameters in the functions.
////////////////////////////////////////////////////////////////////////

int Sum(int n) {
  while (n >= 10) {
    n = n / 10 + n % 10;
  }
  return n;
}

int check(int n, int start, int end) { // KIEM TRA GIA TRI
  if (n > end)
    n = end;
  if (n < start)
    n = start;
  return n;
}

bool SquareNumber(int n) { // KIEM TRA SO CHINH PHUONG
  int i = 0;
  while (i * i <= n) {
    if (i * i == n) {
      return true;
    }
    ++i;
  }
  return false;
}
float Probability(int n) { // TINH XAC XUAT
  int S;
  float n_s = n, P1;
  int a = sqrt(n) + 1;
  int b = sqrt(n);
  if (SquareNumber(n))
    S = n;
  else {
    if ((a * a - n) > (n - b * b))
      S = b * b;
    else
      S = a * a;
  }
  if (n >= S)
    P1 = 100;
  else
    P1 = ((n_s / S) + 80) * 100 / 123;
  P1 = round(P1);
  return P1;
}

// check thêm case của E cho 3 bài đầu

int firstMeet(int &exp1, int &exp2, int e1) { // Task 1
  // TODO: Complete this function
  if (e1 < 0 || e1 > 99) {
    return -99;
  } else {
    exp1 = check(exp1, 0, 600);
    exp2 = check(exp2, 0, 600);
    float exp2_s = exp2, exp1_s = exp1;
    exp1_s = check(exp1_s, 0, 600);
    exp2_s = check(exp2_s, 0, 600);
    if (e1 < 4) {
      switch (e1) {
      case 0:
        exp2_s += 29;
        break;
      case 1:
        exp2_s += 45;
        break;
      case 2:
        exp2_s += 75;
        break;
      case 3:
        exp2_s += 29 + 45 + 75;
        break;
      }
      int D = e1 * 3 + exp1_s * 7;
      float D_s = D;
      if (D % 2 == 0) {
        exp1_s += D_s / 200;
      } else
        exp1_s -= D_s / 100;
    }
    exp1_s = ceil(exp1_s);
    exp1_s = check(exp1_s, 0, 600);
    exp2_s = check(exp2_s, 0, 600);
    float e1_s = e1;
    if (e1 >= 4 && e1 <= 19) { // 1
      exp2_s += e1_s / 4 + 19;
      exp2_s = ceil(exp2_s);
      exp2_s = check(exp2_s, 0, 600);
    } else if (e1 >= 20 && e1 <= 49) { // 2
      exp2_s += e1_s / 9 + 21;
      exp2_s = ceil(exp2_s);
      exp2_s = check(exp2_s, 0, 600);
    } else if (e1 >= 50 && e1 <= 65) { // 3
      exp2_s += e1_s / 16 + 17;
      exp2_s = ceil(exp2_s);
      exp2_s = check(exp2_s, 0, 600);
    } else if (e1 >= 66 && e1 <= 79) {

      exp2_s += e1_s / 4 + 19;
      exp2_s = ceil(exp2_s);
      exp2_s = check(exp2_s, 0, 600);

      if (exp2_s > 200) {
        exp2_s += e1_s / 9 + 21;
        exp2_s = ceil(exp2_s);
        exp2_s = check(exp2_s, 0, 600);
      }

    } else if (e1 >= 80 && e1 <= 99) {
      exp2_s += e1_s / 4 + 19;
      exp2_s = ceil(exp2_s);
      exp2_s = check(exp2_s, 0, 600);
      exp2_s += e1_s / 9 + 21;
      exp2_s = ceil(exp2_s);
      exp2_s = check(exp2_s, 0, 600);

      if (exp2_s > 400) {
        exp2_s += e1_s / 16 + 17;
        exp2_s = ceil(exp2_s);
        exp2_s = check(exp2_s, 0, 600);
        exp2_s *= 1.15;
      }
    }
    exp2 = ceil(exp2_s);
    exp1 = ceil(exp1_s);

    if (e1 >= 4)
      exp1 -= e1;
    exp1 = check(exp1, 0, 600);
    exp2 = check(exp2, 0, 600);
    return exp1 + exp2;
  }
}

// Task 2
int traceLuggage(int &HP1, int &EXP1, int &M1, int E2) { // TEST CASE 158 186
  // 	CON DUONG 1
  if (E2 < 0 || E2 > 99) {
    return -99;
  } else {
    int S, M1_s = M1 / 2;
    M1 = check(M1, 0, 3000);
    float P1, P2, P3, EXP1_s = EXP1, HP1_s = HP1;
    P1 = Probability(EXP1_s);

    // CON DUONG 2
    int sum;
    if (E2 % 2 == 0) {
      M1 = check(M1, 0, 3000);
      if (HP1_s < 200 && M1 > 0) {
        HP1_s *= 1.3;
        HP1_s = ceil(HP1_s);
        HP1_s = check(HP1_s, 0, 666);
        M1 -= 150;
        M1 = check(M1, 0, 3000);
      } else if (HP1_s >= 200 && M1 > 0) {
        HP1_s *= 1.1;
        HP1_s = ceil(HP1_s);
        HP1_s = check(HP1_s, 0, 666);
        M1 -= 70;
        M1 = check(M1, 0, 3000);
      }
      M1 = check(M1, 0, 3000);
      if (EXP1_s < 400 && M1 > 0) {
        M1 -= 200;
        M1 = check(M1, 0, 3000);
        EXP1_s *= 1.13;
        EXP1_s = ceil(EXP1_s);
        EXP1_s = check(EXP1_s, 0, 600);
      } else if (EXP1_s >= 400 && M1 > 0) {
        M1 -= 120;
        M1 = check(M1, 0, 3000);
        EXP1_s *= 1.13;
        EXP1_s = ceil(EXP1_s);
        EXP1_s = check(EXP1_s, 0, 600);
      }
      M1 = check(M1, 0, 3000);
      if (EXP1_s < 300 && M1 > 0) {
        M1 -= 100;
        M1 = check(M1, 0, 3000);
        EXP1_s *= 0.9;
        EXP1_s = ceil(EXP1_s);
      } else if (EXP1_s >= 300 && M1 > 0) {
        M1 -= 120;
        M1 = check(M1, 0, 3000);
        EXP1_s *= 0.9;
        EXP1_s = ceil(EXP1_s);
      }

    } else {
      sum = 0;
      while (true) {

        if (HP1_s < 200) {
          HP1_s *= 1.3;
          HP1_s = ceil(HP1_s);
          HP1_s = check(HP1_s, 0, 666);
          M1 -= 150;
          sum += 150;
        } else {
          HP1_s *= 1.1;
          HP1_s = ceil(HP1_s);
          HP1_s = check(HP1_s, 0, 666);
          M1 -= 70;
          sum += 70;
        }
        M1 = check(M1, 0, 3000);
        if (sum > M1_s || M1 <= 0)
          break;
        if (EXP1_s < 400) {
          M1 -= 200;
          sum += 200;
        } else {
          M1 -= 120;
          sum += 120;
        }
        EXP1_s *= 1.13;
        EXP1_s = ceil(EXP1_s);
        EXP1_s = check(EXP1_s, 0, 600);
        M1 = check(M1, 0, 3000);
        if (sum > M1_s || M1 <= 0)
          break;
        if (EXP1_s < 300) {
          M1 -= 100;
          sum += 100;
        } else {
          M1 -= 120;
          sum += 120;
        }
        M1 = check(M1, 0, 3000);
        EXP1_s *= 0.9;
        EXP1_s = ceil(EXP1_s);
        if (sum > M1_s || M1 <= 0)
          break;
      }
    }
    HP1_s *= 0.83;
    HP1_s = ceil(HP1_s);
    EXP1_s *= 1.17;
    EXP1_s = ceil(EXP1_s);
    HP1_s = check(HP1_s, 0, 666);
    EXP1_s = check(EXP1_s, 0, 600);
    P2 = Probability(EXP1_s);

    // CON DUONG 3
    int i, P[] = {32, 47, 28, 79, 100, 50, 22, 83, 64, 11};
    if (0 <= E2 && E2 <= 9)
      i = E2;
    else
      i = (E2 / 10 + E2 % 10) % 10;
    P3 = P[i];

    // KET QUA
    int avg;
    if (P1 == 100 && P2 == 100 && P3 == 100) {
      EXP1_s *= 0.75;
      EXP1_s = ceil(EXP1_s);
    } else {
      avg = round((P1 + P2 + P3) / 3);
      if (avg < 50) {
        HP1_s *= 0.85;
        HP1 = ceil(HP1_s);
        EXP1_s *= 1.15;
        EXP1 = ceil(EXP1_s);
      } else {
        HP1_s *= 0.9;
        HP1 = ceil(HP1_s);
        EXP1_s *= 1.2;
        EXP1 = ceil(EXP1_s);
      }
    }
    HP1 = ceil(HP1_s);
    EXP1 = ceil(EXP1_s);
    HP1 = check(HP1, 0, 666);
    EXP1 = check(EXP1, 0, 600);
    return HP1 + EXP1 + M1;
  }
}

// Task 3
int chaseTaxi(int &HP1, int &EXP1, int &HP2, int &EXP2, int E3) {
  // TODO: Complete this function
  if (E3 < 0 || E3 > 99) {
    return -99;
  } else {
    float HP1_s = HP1, HP2_s = HP2, EXP1_s = EXP1, EXP2_s = EXP2;
    int check_p = 0, check_n = 0;
    int mtr[10][10];
    for (int i = 0; i < 10; i++) {
      for (int j = 0; j < 10; j++) {
        mtr[i][j] = ((E3 * j) + (i * 2)) * (i - j);
        if (mtr[i][j] > (E3 * 2))
          check_p++;
        if (mtr[i][j] < (-E3))
          check_n++;
      }
    }
    int m_i = Sum(check_p), m_j = Sum(check_n);
    //------------------------------------------------------
    int start_i, start_j, end_i, max_p = -1e9, max_t = -1e9, max;

    if (m_i > m_j) {
      start_i = m_i - m_j;
      start_j = 0;
      end_i = 9;
    }
    if (m_i < m_j) {
      start_i = 0;
      start_j = m_j - m_i;
      end_i = 9 - m_j;
    }
    for (int i = 0; i <= end_i - start_i; i++) {
      if (mtr[start_i + i][start_j + i] >= max_t)
        max_t = mtr[start_i + i][start_j + i];
    }

    start_i = m_i + m_j - 9;
    if (start_i < 0) {
      start_i = 0;
      start_j = m_i + m_j;
      start_i = m_i + m_j;
    } else {
      start_j = 9;
      end_i = 9;
    }
    for (int i = 0; i <= end_i - start_i; i++) {
      if (mtr[start_i + i][start_j - i] >= max_p)
        max_p = mtr[start_i + i][start_j - i];
    }
    if (max_t > max_p)
      max = max_t;
    else
      max = max_p;
    if (abs(mtr[m_i][m_j]) > max) {
      EXP1_s *= 0.88;
      EXP1 = ceil(EXP1_s);
      HP1_s *= 0.9;
      HP1 = ceil(HP1_s);
      EXP2_s *= 0.88;
      EXP2 = ceil(EXP2_s);
      HP2_s *= 0.9;
      HP2 = ceil(HP2_s);
      HP1 = check(HP1, 0, 666);
      EXP1 = check(EXP1, 0, 600);
      HP2 = check(HP2, 0, 666);
      EXP2 = check(EXP2, 0, 600);
      return mtr[m_i][m_j];
    } else {
      EXP1_s *= 1.12;
      EXP1 = ceil(EXP1_s);
      HP1_s *= 1.1;
      HP1 = ceil(HP1_s);
      EXP2_s *= 1.12;
      EXP2 = ceil(EXP2_s);
      HP2_s *= 1.1;
      HP2 = ceil(HP2_s);
      HP1 = check(HP1, 0, 666);
      EXP1 = check(EXP1, 0, 600);
      HP2 = check(HP2, 0, 666);
      EXP2 = check(EXP2, 0, 600);
      return max;
    }
  }
}
// Task 4
int checkPassword(const char *s, const char *email) {
  string str = s;
  string str_e = email;
  size_t at_pos = str_e.find('@');
  string se = str_e.substr(0, at_pos);

  int len = str.length();

  if (len < 8) {
    return -1;
  }

  if (len > 20) {
    return -2;
  }

  size_t sei = str.find(se);
  if (sei != string::npos) {
    return -(300 + sei);
  }

  for (int i = 0; i <= len - 3; ++i) {
    if (s[i] == s[i + 1] && s[i + 1] == s[i + 2]) {
      return -(400 + i);
    }
  }

  bool has_special = false;
  for (int i = 0; i < len; ++i) {
    char c = s[i];
    if (c == '@' || c == '#' || c == '%' || c == '$' || c == '!') {
      has_special = true;
      break;
    }
  }
  if (!has_special) {
    return -5;
  }

  for (int i = 0; i < len; ++i) {
    char c = s[i];
    bool is_digit = (c >= '0' && c <= '9');
    bool is_lower = (c >= 'a' && c <= 'z');
    bool is_upper = (c >= 'A' && c <= 'Z');
    bool is_special =
        (c == '@' || c == '#' || c == '%' || c == '$' || c == '!');

    if (!is_digit && !is_lower && !is_upper && !is_special) {
      return i;
    }
  }

  return -10;
}

// Task 5
int findCorrectPassword(const char *arr_pwds[], int num_pwds) {
  int max_check = -1e9, max_size = -1, check_i = -1, size;

  for (int i = 0; i < num_pwds; i++) {

    int check = 0;
    size = strlen(arr_pwds[i]);
    for (int j = i; j < num_pwds; j++) {
      if (arr_pwds[i] == arr_pwds[j]) {
        check++;
      }
    }
    if (max_check < check) {
      max_check = check;
      max_size = size;
      check_i = i;
    } else if (check == max_check) {
      if (max_size < size) {
        max_size = size;
        check_i = i;
      } else if (size == max_size)
        check_i = -1;
    }
  }
  if (max_check == 1)
    check_i = -1;
  return check_i;
}

////////////////////////////////////////////////
/// END OF STUDENT'S ANSWER
////////////////////////////////////////////////