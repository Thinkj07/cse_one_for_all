#include "study_in_pink2.h"

////////////////////////////////////////////////////////////////////////
/// STUDENT'S ANSWER BEGINS HERE
/// Complete the following functions
/// DO NOT modify any parameters in the functions.
////////////////////////////////////////////////////////////////////////

// Position npos constant
const Position Position::npos = Position(-1, -1);

// MapElement implementation
MapElement::MapElement(ElementType in_type) : type(in_type) {}

MapElement::~MapElement() {}

ElementType MapElement::getType() const {
    return type;
}

// Path implementation
Path::Path() : MapElement(PATH) {}

// Wall implementation
Wall::Wall() : MapElement(WALL) {}

// FakeWall implementation
FakeWall::FakeWall(int in_req_exp) : MapElement(FAKE_WALL), req_exp(in_req_exp) {}

int FakeWall::getReqExp() const {
    return req_exp;
}

// Position implementation
Position::Position(int r, int c) : r(r), c(c) {}

Position::Position(const string & str_pos) {
    // Format: (r,c)
    sscanf(str_pos.c_str(), "(%d,%d)", &r, &c);
}

int Position::getRow() const { return r; }
int Position::getCol() const { return c; }
void Position::setRow(int r) { this->r = r; }
void Position::setCol(int c) { this->c = c; }

string Position::str() const {
    return "(" + to_string(r) + "," + to_string(c) + ")";
}

bool Position::isEqual(int in_r, int in_c) const {
    return r == in_r && c == in_c;
}

bool Position::isEqual(const Position & pos) const {
    return r == pos.r && c == pos.c;
}

// Map implementation
Map::Map(int num_rows, int num_cols, int num_walls, Position * array_walls, int num_fake_walls, Position * array_fake_walls) 
    : num_rows(num_rows), num_cols(num_cols) {
    // Allocate 2D array
    map = new MapElement**[num_rows];
    for (int i = 0; i < num_rows; i++) {
        map[i] = new MapElement*[num_cols];
        for (int j = 0; j < num_cols; j++) {
            map[i][j] = new Path();
        }
    }
    
    // Add walls
    for (int i = 0; i < num_walls; i++) {
        int r = array_walls[i].getRow();
        int c = array_walls[i].getCol();
        delete map[r][c];
        map[r][c] = new Wall();
    }
    
    // Add fake walls
    for (int i = 0; i < num_fake_walls; i++) {
        int r = array_fake_walls[i].getRow();
        int c = array_fake_walls[i].getCol();
        int req_exp = (r * 257 + c * 139 + 89) % 900 + 1;
        delete map[r][c];
        map[r][c] = new FakeWall(req_exp);
    }
}

Map::~Map() {
    for (int i = 0; i < num_rows; i++) {
        for (int j = 0; j < num_cols; j++) {
            delete map[i][j];
        }
        delete[] map[i];
    }
    delete[] map;
}

int Map::getNumRows() const { return num_rows; }
int Map::getNumCols() const { return num_cols; }

ElementType Map::getElementType(int r, int c) const {
    if (r < 0 || r >= num_rows || c < 0 || c >= num_cols) {
        return WALL;
    }
    return map[r][c]->getType();
}

bool Map::isValid(const Position & pos, MovingObject * mv_obj) const {
    int r = pos.getRow();
    int c = pos.getCol();
    
    // Check bounds
    if (r < 0 || r >= num_rows || c < 0 || c >= num_cols) {
        return false;
    }
    
    ElementType type = map[r][c]->getType();
    
    // Wall blocks everyone
    if (type == WALL) {
        return false;
    }
    
    // Path is always valid
    if (type == PATH) {
        return true;
    }
    
    // FakeWall handling
    if (type == FAKE_WALL) {
        FakeWall * fw = dynamic_cast<FakeWall*>(map[r][c]);
        
        // Robots can pass through fake walls
        if (dynamic_cast<Robot*>(mv_obj) != nullptr) {
            return true;
        }
        
        // Watson needs exp > req_exp
        Watson * watson = dynamic_cast<Watson*>(mv_obj);
        if (watson != nullptr) {
            return watson->getEXP() > fw->getReqExp();
        }
        
        // Sherlock can pass (observant)
        if (dynamic_cast<Sherlock*>(mv_obj) != nullptr) {
            return true;
        }
        
        // Criminal can pass (creator of maze)
        if (dynamic_cast<Criminal*>(mv_obj) != nullptr) {
            return true;
        }
    }
    
    return true;
}

// MovingObject implementation
MovingObject::MovingObject(int index, const Position pos, Map * map, const string & name)
    : index(index), pos(pos), map(map), name(name) {}

MovingObject::~MovingObject() {}

Position MovingObject::getCurrentPosition() const {
    return pos;
}

// Character implementation
Character::Character(int index, const Position pos, Map * map, const string & name)
    : MovingObject(index, pos, map, name) {}

// Sherlock implementation
Sherlock::Sherlock(int index, const string & moving_rule, const Position & init_pos, Map * map, int init_hp, int init_exp)
    : Character(index, init_pos, map, "Sherlock"), moving_rule(moving_rule), move_count(0) {
    this->hp = (init_hp < 0) ? 0 : (init_hp > 500) ? 500 : init_hp;
    this->exp = (init_exp < 0) ? 0 : (init_exp > 900) ? 900 : init_exp;
}

Position Sherlock::getNextPosition() {
    if (moving_rule.empty()) return Position::npos;
    
    char move = moving_rule[move_count % moving_rule.length()];
    int r = pos.getRow();
    int c = pos.getCol();
    
    switch(move) {
        case 'L': c--; break;
        case 'R': c++; break;
        case 'U': r--; break;
        case 'D': r++; break;
        default: return Position::npos;
    }
    
    Position next_pos(r, c);
    if (map->isValid(next_pos, this)) {
        return next_pos;
    }
    return Position::npos;
}

void Sherlock::move() {
    Position next_pos = getNextPosition();
    if (!(next_pos.getRow() == -1 && next_pos.getCol() == -1)) {
        pos = next_pos;
    }
    move_count++;
}

string Sherlock::str() const {
    return "Sherlock[index=" + to_string(index) + ";pos=" + pos.str() + ";moving_rule=" + moving_rule + "]";
}

int Sherlock::getHP() const { return hp; }
int Sherlock::getEXP() const { return exp; }

void Sherlock::setHP(int hp) {
    this->hp = (hp < 0) ? 0 : (hp > 500) ? 500 : hp;
}

void Sherlock::setEXP(int exp) {
    this->exp = (exp < 0) ? 0 : (exp > 900) ? 900 : exp;
}

// Watson implementation
Watson::Watson(int index, const string & moving_rule, const Position & init_pos, Map * map, int init_hp, int init_exp)
    : Character(index, init_pos, map, "Watson"), moving_rule(moving_rule), move_count(0) {
    this->hp = (init_hp < 0) ? 0 : (init_hp > 500) ? 500 : init_hp;
    this->exp = (init_exp < 0) ? 0 : (init_exp > 900) ? 900 : init_exp;
}

Position Watson::getNextPosition() {
    if (moving_rule.empty()) return Position::npos;
    
    char move = moving_rule[move_count % moving_rule.length()];
    int r = pos.getRow();
    int c = pos.getCol();
    
    switch(move) {
        case 'L': c--; break;
        case 'R': c++; break;
        case 'U': r--; break;
        case 'D': r++; break;
        default: return Position::npos;
    }
    
    Position next_pos(r, c);
    if (map->isValid(next_pos, this)) {
        return next_pos;
    }
    return Position::npos;
}

void Watson::move() {
    Position next_pos = getNextPosition();
    if (!(next_pos.getRow() == -1 && next_pos.getCol() == -1)) {
        pos = next_pos;
    }
    move_count++;
}

string Watson::str() const {
    return "Watson[index=" + to_string(index) + ";pos=" + pos.str() + ";moving_rule=" + moving_rule + "]";
}

int Watson::getHP() const { return hp; }
int Watson::getEXP() const { return exp; }

void Watson::setHP(int hp) {
    this->hp = (hp < 0) ? 0 : (hp > 500) ? 500 : hp;
}

void Watson::setEXP(int exp) {
    this->exp = (exp < 0) ? 0 : (exp > 900) ? 900 : exp;
}

// Criminal implementation
Criminal::Criminal(int index, const Position & init_pos, Map * map, Sherlock * sherlock, Watson * watson)
    : MovingObject(index, init_pos, map, "Criminal"), sherlock(sherlock), watson(watson), count(0) {}

Position Criminal::getNextPosition() {
    Position current = pos;
    int max_distance = -1;
    Position best_pos = Position::npos;
    
    // Try all 4 directions: U, L, D, R
    int dr[] = {-1, 0, 1, 0};
    int dc[] = {0, -1, 0, 1};
    
    for (int i = 0; i < 4; i++) {
        int new_r = current.getRow() + dr[i];
        int new_c = current.getCol() + dc[i];
        Position next_pos(new_r, new_c);
        
        if (map->isValid(next_pos, this)) {
            // Calculate distances
            int dist_sherlock = abs(new_r - sherlock->getCurrentPosition().getRow()) + 
                              abs(new_c - sherlock->getCurrentPosition().getCol());
            int dist_watson = abs(new_r - watson->getCurrentPosition().getRow()) + 
                            abs(new_c - watson->getCurrentPosition().getCol());
            int total_dist = dist_sherlock + dist_watson;
            
            if (total_dist > max_distance) {
                max_distance = total_dist;
                best_pos = next_pos;
            }
        }
    }
    
    return best_pos;
}

void Criminal::move() {
    Position next_pos = getNextPosition();
    if (!(next_pos.getRow() == -1 && next_pos.getCol() == -1)) {
        pos = next_pos;
        count++;
    }
}

string Criminal::str() const {
    return "Criminal[index=" + to_string(index) + ";pos=" + pos.str() + "]";
}

int Criminal::getCount() const {
    return count;
}

// ArrayMovingObject implementation
ArrayMovingObject::ArrayMovingObject(int capacity) : capacity(capacity), count(0) {
    arr_mv_objs = new MovingObject*[capacity];
    for (int i = 0; i < capacity; i++) {
        arr_mv_objs[i] = nullptr;
    }
}

ArrayMovingObject::~ArrayMovingObject() {
    // Note: Don't delete the objects themselves, just the array
    delete[] arr_mv_objs;
}

bool ArrayMovingObject::isFull() const {
    return count >= capacity;
}

bool ArrayMovingObject::add(MovingObject * mv_obj) {
    if (isFull()) return false;
    arr_mv_objs[count++] = mv_obj;
    return true;
}

MovingObject * ArrayMovingObject::get(int index) const {
    if (index < 0 || index >= count) return nullptr;
    return arr_mv_objs[index];
}

int ArrayMovingObject::size() const {
    return count;
}

string ArrayMovingObject::str() const {
    string result = "ArrayMovingObject[count=" + to_string(count) + ";capacity=" + to_string(capacity);
    for (int i = 0; i < count; i++) {
        result += ";" + arr_mv_objs[i]->str();
    }
    result += "]";
    return result;
}

// Configuration implementation
Configuration::Configuration(const string & filepath) {
    ifstream file(filepath);
    string line;
    
    while (getline(file, line)) {
        size_t pos = line.find('=');
        if (pos == string::npos) continue;
        
        string key = line.substr(0, pos);
        string value = line.substr(pos + 1);
        
        if (key == "MAP_NUM_ROWS") {
            map_num_rows = stoi(value);
        }
        else if (key == "MAP_NUM_COLS") {
            map_num_cols = stoi(value);
        }
        else if (key == "MAX_NUM_MOVING_OBJECTS") {
            max_num_moving_objects = stoi(value);
        }
        else if (key == "ARRAY_WALLS") {
            // Parse: [(1,2);(2,3);(3,4)]
            num_walls = 0;
            if (value.length() > 2) {
                // Count walls
                for (char c : value) {
                    if (c == '(') num_walls++;
                }
                
                arr_walls = new Position[num_walls];
                int idx = 0;
                size_t start = 0;
                while ((start = value.find('(', start)) != string::npos) {
                    size_t end = value.find(')', start);
                    string pos_str = value.substr(start, end - start + 1);
                    arr_walls[idx++] = Position(pos_str);
                    start = end + 1;
                }
            } else {
                arr_walls = nullptr;
            }
        }
        else if (key == "ARRAY_FAKE_WALLS") {
            num_fake_walls = 0;
            if (value.length() > 2) {
                // Count fake walls
                for (char c : value) {
                    if (c == '(') num_fake_walls++;
                }
                
                arr_fake_walls = new Position[num_fake_walls];
                int idx = 0;
                size_t start = 0;
                while ((start = value.find('(', start)) != string::npos) {
                    size_t end = value.find(')', start);
                    string pos_str = value.substr(start, end - start + 1);
                    arr_fake_walls[idx++] = Position(pos_str);
                    start = end + 1;
                }
            } else {
                arr_fake_walls = nullptr;
            }
        }
        else if (key == "SHERLOCK_MOVING_RULE") {
            sherlock_moving_rule = value;
        }
        else if (key == "SHERLOCK_INIT_POS") {
            sherlock_init_pos = Position(value);
        }
        else if (key == "SHERLOCK_INIT_HP") {
            sherlock_init_hp = stoi(value);
        }
        else if (key == "SHERLOCK_INIT_EXP") {
            sherlock_init_exp = stoi(value);
        }
        else if (key == "WATSON_MOVING_RULE") {
            watson_moving_rule = value;
        }
        else if (key == "WATSON_INIT_POS") {
            watson_init_pos = Position(value);
        }
        else if (key == "WATSON_INIT_HP") {
            watson_init_hp = stoi(value);
        }
        else if (key == "WATSON_INIT_EXP") {
            watson_init_exp = stoi(value);
        }
        else if (key == "CRIMINAL_INIT_POS") {
            criminal_init_pos = Position(value);
        }
        else if (key == "NUM_STEPS") {
            num_steps = stoi(value);
        }
    }
    
    file.close();
}

Configuration::~Configuration() {
    if (arr_walls != nullptr) {
        delete[] arr_walls;
    }
    if (arr_fake_walls != nullptr) {
        delete[] arr_fake_walls;
    }
}

string Configuration::str() const {
    string result = "Configuration[\n";
    result += "MAP_NUM_ROWS=" + to_string(map_num_rows) + "\n";
    result += "MAP_NUM_COLS=" + to_string(map_num_cols) + "\n";
    result += "MAX_NUM_MOVING_OBJECTS=" + to_string(max_num_moving_objects) + "\n";
    result += "NUM_WALLS=" + to_string(num_walls) + "\n";
    result += "ARRAY_WALLS=[";
    for (int i = 0; i < num_walls; i++) {
        if (i > 0) result += ";";
        result += arr_walls[i].str();
    }
    result += "]\n";
    result += "NUM_FAKE_WALLS=" + to_string(num_fake_walls) + "\n";
    result += "ARRAY_FAKE_WALLS=[";
    for (int i = 0; i < num_fake_walls; i++) {
        if (i > 0) result += ";";
        result += arr_fake_walls[i].str();
    }
    result += "]\n";
    result += "SHERLOCK_MOVING_RULE=" + sherlock_moving_rule + "\n";
    result += "SHERLOCK_INIT_POS=" + sherlock_init_pos.str() + "\n";
    result += "SHERLOCK_INIT_HP=" + to_string(sherlock_init_hp) + "\n";
    result += "SHERLOCK_INIT_EXP=" + to_string(sherlock_init_exp) + "\n";
    result += "WATSON_MOVING_RULE=" + watson_moving_rule + "\n";
    result += "WATSON_INIT_POS=" + watson_init_pos.str() + "\n";
    result += "WATSON_INIT_HP=" + to_string(watson_init_hp) + "\n";
    result += "WATSON_INIT_EXP=" + to_string(watson_init_exp) + "\n";
    result += "CRIMINAL_INIT_POS=" + criminal_init_pos.str() + "\n";
    result += "NUM_STEPS=" + to_string(num_steps) + "\n";
    result += "]";
    return result;
}

// Robot implementation
Robot::Robot(int index, const Position & pos, Map * map, RobotType robot_type, const string & name)
    : MovingObject(index, pos, map, name), robot_type(robot_type), item(nullptr) {}

Robot::~Robot() {
    if (item != nullptr) {
        delete item;
    }
}

int Robot::getDistance(Sherlock * sherlock) const {
    return abs(pos.getRow() - sherlock->getCurrentPosition().getRow()) + 
           abs(pos.getCol() - sherlock->getCurrentPosition().getCol());
}

int Robot::getDistance(Watson * watson) const {
    return abs(pos.getRow() - watson->getCurrentPosition().getRow()) + 
           abs(pos.getCol() - watson->getCurrentPosition().getCol());
}

RobotType Robot::getType() const {
    return robot_type;
}

BaseItem * Robot::getItem() const {
    return item;
}

// RobotC implementation
RobotC::RobotC(int index, const Position & init_pos, Map * map, Criminal * criminal)
    : Robot(index, init_pos, map, C, "RobotC"), criminal(criminal) {}

Position RobotC::getNextPosition() {
    return criminal->getCurrentPosition();
}

void RobotC::move() {
    pos = criminal->getCurrentPosition();
}

string RobotC::str() const {
    return "Robot[pos=" + pos.str() + ";type=C;dist=]";
}

int RobotC::getDistance() const {
    return 0;
}

// RobotS implementation
RobotS::RobotS(int index, const Position & init_pos, Map * map, Criminal * criminal, Sherlock * sherlock)
    : Robot(index, init_pos, map, S, "RobotS"), sherlock(sherlock) {}

Position RobotS::getNextPosition() {
    Position current = pos;
    Position sherlock_pos = sherlock->getCurrentPosition();
    
    int min_distance = INT_MAX;
    Position best_pos = Position::npos;
    
    // Try all 4 directions: U, R, D, L
    int dr[] = {-1, 0, 1, 0};
    int dc[] = {0, -1, 0, 1};
    
    for (int i = 0; i < 4; i++) {
        int new_r = current.getRow() + dr[i];
        int new_c = current.getCol() + dc[i];
        Position next_pos(new_r, new_c);
        
        if (map->isValid(next_pos, this)) {
            int dist = abs(new_r - sherlock_pos.getRow()) + abs(new_c - sherlock_pos.getCol());
            if (dist < min_distance) {
                min_distance = dist;
                best_pos = next_pos;
            }
        }
    }
    
    return best_pos;
}

void RobotS::move() {
    Position next_pos = getNextPosition();
    if (!(next_pos.getRow() == -1 && next_pos.getCol() == -1)) {
        pos = next_pos;
    }
}

string RobotS::str() const {
    return "Robot[pos=" + pos.str() + ";type=S;dist=" + to_string(getDistance(sherlock)) + "]";
}

// RobotW implementation
RobotW::RobotW(int index, const Position & init_pos, Map * map, Criminal * criminal, Watson * watson)
    : Robot(index, init_pos, map, W, "RobotW"), watson(watson) {}

Position RobotW::getNextPosition() {
    Position current = pos;
    Position watson_pos = watson->getCurrentPosition();
    
    int min_distance = INT_MAX;
    Position best_pos = Position::npos;
    
    // Try all 4 directions: U, L, D, R
    int dr[] = {-1, 0, 1, 0};
    int dc[] = {0, -1, 0, 1};
    
    for (int i = 0; i < 4; i++) {
        int new_r = current.getRow() + dr[i];
        int new_c = current.getCol() + dc[i];
        Position next_pos(new_r, new_c);
        
        if (map->isValid(next_pos, this)) {
            int dist = abs(new_r - watson_pos.getRow()) + abs(new_c - watson_pos.getCol());
            if (dist < min_distance) {
                min_distance = dist;
                best_pos = next_pos;
            }
        }
    }
    
    return best_pos;
}

void RobotW::move() {
    Position next_pos = getNextPosition();
    if (!(next_pos.getRow() == -1 && next_pos.getCol() == -1)) {
        pos = next_pos;
    }
}

string RobotW::str() const {
    return "Robot[pos=" + pos.str() + ";type=W;dist=" + to_string(getDistance(watson)) + "]";
}

// RobotSW implementation
RobotSW::RobotSW(int index, const Position & init_pos, Map * map, Criminal * criminal, Sherlock * sherlock, Watson * watson)
    : Robot(index, init_pos, map, SW, "RobotSW"), sherlock(sherlock), watson(watson) {}

Position RobotSW::getNextPosition() {
    Position current = pos;
    Position sherlock_pos = sherlock->getCurrentPosition();
    Position watson_pos = watson->getCurrentPosition();
    
    int min_distance = INT_MAX;
    Position best_pos = Position::npos;
    
    // Try all 8 directions
    int dr[] = {-2, -1, -1, 0, 0, 1, 1, 2};
    int dc[] = {0, -1, 1, -2, 2, -1, 1, 0};
    
    for (int i = 0; i < 8; i++) {
        int new_r = current.getRow() + dr[i];
        int new_c = current.getCol() + dc[i];
        Position next_pos(new_r, new_c);
        
        if (map->isValid(next_pos, this)) {
            int dist_s = abs(new_r - sherlock_pos.getRow()) + abs(new_c - sherlock_pos.getCol());
            int dist_w = abs(new_r - watson_pos.getRow()) + abs(new_c - watson_pos.getCol());
            int total_dist = dist_s + dist_w;
            
            if (total_dist < min_distance) {
                min_distance = total_dist;
                best_pos = next_pos;
            }
        }
    }
    
    return best_pos;
}

void RobotSW::move() {
    Position next_pos = getNextPosition();
    if (!(next_pos.getRow() == -1 && next_pos.getCol() == -1)) {
        pos = next_pos;
    }
}

string RobotSW::str() const {
    int dist = getDistance(sherlock) + getDistance(watson);
    return "Robot[pos=" + pos.str() + ";type=SW;dist=" + to_string(dist) + "]";
}

// BaseItem implementations (stub for now)
BaseItem::BaseItem(ItemType item_type) : item_type(item_type) {}
BaseItem::~BaseItem() {}
ItemType BaseItem::getType() const { return item_type; }

MagicBook::MagicBook() : BaseItem(MAGIC_BOOK) {}
bool MagicBook::canUse(Character * obj, Robot * robot) { return true; }
void MagicBook::use(Character * obj, Robot * robot) {
    obj->setEXP(obj->getEXP() * 1.25);
}

EnergyDrink::EnergyDrink() : BaseItem(ENERGY_DRINK) {}
bool EnergyDrink::canUse(Character * obj, Robot * robot) { return true; }
void EnergyDrink::use(Character * obj, Robot * robot) {
    obj->setHP(obj->getHP() * 1.2);
}

FirstAid::FirstAid() : BaseItem(FIRST_AID) {}
bool FirstAid::canUse(Character * obj, Robot * robot) { return true; }
void FirstAid::use(Character * obj, Robot * robot) {
    obj->setHP(obj->getHP() * 1.5);
}

ExcemptionCard::ExcemptionCard() : BaseItem(EXCEMPTION_CARD) {}
bool ExcemptionCard::canUse(Character * obj, Robot * robot) { 
    return dynamic_cast<Sherlock*>(obj) != nullptr && obj->getHP() % 2 == 1;
}
void ExcemptionCard::use(Character * obj, Robot * robot) {}

PassingCard::PassingCard(int i, int j) : BaseItem(PASSING_CARD) {
    int t = (i * 11 + j) % 4;
    if (t == 0) challenge = "RobotS";
    else if (t == 1) challenge = "RobotC";
    else if (t == 2) challenge = "RobotSW";
    else challenge = "all";
}

PassingCard::PassingCard(string challenge) : BaseItem(PASSING_CARD), challenge(challenge) {}

bool PassingCard::canUse(Character * obj, Robot * robot) {
    return dynamic_cast<Watson*>(obj) != nullptr && obj->getHP() % 2 == 0;
}

void PassingCard::use(Character * obj, Robot * robot) {}

string PassingCard::getChallenge() const { return challenge; }

// BaseBag implementations
BaseBag::BaseBag(int capacity, Character * obj) : capacity(capacity), count(0), obj(obj) {
    items = new BaseItem*[capacity];
    for (int i = 0; i < capacity; i++) {
        items[i] = nullptr;
    }
}

BaseBag::~BaseBag() {
    for (int i = 0; i < count; i++) {
        delete items[i];
    }
    delete[] items;
}

bool BaseBag::insert(BaseItem * item) {
    if (count >= capacity) return false;
    items[count++] = item;
    return true;
}

BaseItem * BaseBag::get() {
    if (count == 0) return nullptr;
    BaseItem * item = items[0];
    for (int i = 0; i < count - 1; i++) {
        items[i] = items[i + 1];
    }
    count--;
    return item;
}

BaseItem * BaseBag::get(ItemType itemType) {
    for (int i = 0; i < count; i++) {
        if (items[i]->getType() == itemType) {
            BaseItem * item = items[i];
            for (int j = i; j < count - 1; j++) {
                items[j] = items[j + 1];
            }
            count--;
            return item;
        }
    }
    return nullptr;
}

string BaseBag::str() const {
    string result = "Bag[count=" + to_string(count) + ";";
    for (int i = 0; i < count; i++) {
        if (i > 0) result += ",";
        ItemType type = items[i]->getType();
        if (type == MAGIC_BOOK) result += "MagicBook";
        else if (type == ENERGY_DRINK) result += "EnergyDrink";
        else if (type == FIRST_AID) result += "FirstAid";
        else if (type == EXCEMPTION_CARD) result += "ExcemptionCard";
        else if (type == PASSING_CARD) result += "PassingCard";
    }
    result += "]";
    return result;
}

SherlockBag::SherlockBag(Sherlock * sherlock) : BaseBag(13, sherlock) {}
WatsonBag::WatsonBag(Watson * watson) : BaseBag(15, watson) {}

// StudyPinkProgram implementation
StudyPinkProgram::StudyPinkProgram(const string & config_file_path) {
    config = new Configuration(config_file_path);
    
    map = new Map(config->map_num_rows, config->map_num_cols, 
                  config->num_walls, config->arr_walls,
                  config->num_fake_walls, config->arr_fake_walls);
    
    sherlock = new Sherlock(1, config->sherlock_moving_rule, config->sherlock_init_pos, map,
                            config->sherlock_init_hp, config->sherlock_init_exp);
    
    watson = new Watson(2, config->watson_moving_rule, config->watson_init_pos, map,
                        config->watson_init_hp, config->watson_init_exp);
    
    criminal = new Criminal(0, config->criminal_init_pos, map, sherlock, watson);
    
    arr_mv_objs = new ArrayMovingObject(config->max_num_moving_objects);
    arr_mv_objs->add(criminal);
    arr_mv_objs->add(sherlock);
    arr_mv_objs->add(watson);
}

bool StudyPinkProgram::isStop() const {
    return sherlock->getCurrentPosition().isEqual(criminal->getCurrentPosition().getRow(), 
                                                   criminal->getCurrentPosition().getCol()) ||
           watson->getCurrentPosition().isEqual(criminal->getCurrentPosition().getRow(), 
                                                 criminal->getCurrentPosition().getCol());
}

StudyPinkProgram::~StudyPinkProgram() {
    delete arr_mv_objs;
    delete sherlock;
    delete watson;
    delete criminal;
    delete map;
    delete config;
}

////////////////////////////////////////////////
/// END OF STUDENT'S ANSWER
////////////////////////////////////////////////
