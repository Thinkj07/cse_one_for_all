/*
* Ho Chi Minh City University of Technology
* Faculty of Computer Science and Engineering
* Initial code for Assignment 1
* Programming Fundamentals Spring 2023
* Author: Vu Van Tien
* Date: 02.02.2023
*/

//The library here is concretely set, students are not allowed to include any other libraries.
#ifndef _H_STUDY_IN_PINK_2_H_
#define _H_STUDY_IN_PINK_2_H_

#include "main.h"

////////////////////////////////////////////////////////////////////////
/// STUDENT'S ANSWER BEGINS HERE
/// Complete the following functions
/// DO NOT modify any parameters in the functions.
////////////////////////////////////////////////////////////////////////

// Forward declaration
class MovingObject;
class Position;
class Configuration;
class Map;

class Criminal;
class RobotS;
class RobotW;
class RobotSW;
class RobotC;

class ArrayMovingObject;
class StudyPinkProgram;

class BaseItem;
class BaseBag;
class SherlockBag;
class WatsonBag;
class Sherlock;
class Watson;
class Robot;

class TestStudyInPink;

enum ItemType { MAGIC_BOOK, ENERGY_DRINK, FIRST_AID, EXCEMPTION_CARD, PASSING_CARD };
enum ElementType { PATH, WALL, FAKE_WALL };
enum RobotType { C=0, S, W, SW };

class MapElement {
protected:
    ElementType type;
public:
    MapElement(ElementType in_type);
    virtual ~MapElement();
    virtual ElementType getType() const;
};

class Path : public MapElement {
public:
    Path();
};

class Wall : public MapElement {
public:
    Wall();
};

class FakeWall : public MapElement {
private:
    int req_exp;
public:
    FakeWall(int in_req_exp);
    int getReqExp() const;
};

class Map {
private:
    int num_rows, num_cols;
    MapElement*** map;

public:
    Map(int num_rows, int num_cols, int num_walls, Position * array_walls, int num_fake_walls, Position * array_fake_walls);
    ~Map();
    int getNumRows() const;
    int getNumCols() const;
    ElementType getElementType(int r, int c) const;
    bool isValid(const Position & pos, MovingObject * mv_obj) const;
};

class Position {
private:
    int r, c;
public:
    static const Position npos;

    Position(int r=0, int c=0);

    Position(const string & str_pos);

    int getRow() const;
    int getCol() const;
    void setRow(int r);
    void setCol(int c);

    string str() const;

    bool isEqual(int in_r, int in_c) const;
    bool isEqual(const Position & pos) const;
};

class MovingObject {
protected:
    int index;
    Position pos;
    Map * map;
    string name;

public:
    MovingObject(int index, const Position pos, Map * map, const string & name="");
    virtual ~MovingObject();
    virtual Position getNextPosition() = 0;
    Position getCurrentPosition() const;
    virtual void move() = 0;
    virtual string str() const = 0;
};

class Character : public MovingObject {
public:
    Character(int index, const Position pos, Map * map, const string & name="");
    virtual int getHP() const = 0;
    virtual int getEXP() const = 0;
    virtual void setHP(int hp) = 0;
    virtual void setEXP(int exp) = 0;
};

class Sherlock : public Character {
private:
    int hp;
    int exp;
    string moving_rule;
    int move_count;

public:
    Sherlock(int index, const string & moving_rule, const Position & init_pos, Map * map, int init_hp, int init_exp);
    Position getNextPosition();
    void move();
    string str() const;
    int getHP() const;
    int getEXP() const;
    void setHP(int hp);
    void setEXP(int exp);
};

class Watson : public Character {
private:
    int hp;
    int exp;
    string moving_rule;
    int move_count;

public:
    Watson(int index, const string & moving_rule, const Position & init_pos, Map * map, int init_hp, int init_exp);
    Position getNextPosition();
    void move();
    string str() const;
    int getHP() const;
    int getEXP() const;
    void setHP(int hp);
    void setEXP(int exp);
};

class Criminal : public MovingObject {
private:
    Sherlock * sherlock;
    Watson * watson;
    int count;

public:
    Criminal(int index, const Position & init_pos, Map * map, Sherlock * sherlock, Watson * watson);
    Position getNextPosition();
    void move();
    string str() const;
    int getCount() const;
};

// Robot Classes
class Robot : public MovingObject {
protected:
    RobotType robot_type;
    BaseItem * item;
    
public:
    Robot(int index, const Position & pos, Map * map, RobotType robot_type, const string & name);
    virtual ~Robot();
    virtual Position getNextPosition() = 0;
    virtual void move() = 0;
    virtual string str() const = 0;
    virtual int getDistance(Sherlock * sherlock) const;
    virtual int getDistance(Watson * watson) const;
    RobotType getType() const;
    BaseItem * getItem() const;
};

class RobotC : public Robot {
private:
    Criminal * criminal;
    
public:
    RobotC(int index, const Position & init_pos, Map * map, Criminal * criminal);
    Position getNextPosition();
    void move();
    string str() const;
    int getDistance() const;
};

class RobotS : public Robot {
private:
    Sherlock * sherlock;
    
public:
    RobotS(int index, const Position & init_pos, Map * map, Criminal * criminal, Sherlock * sherlock);
    Position getNextPosition();
    void move();
    string str() const;
};

class RobotW : public Robot {
private:
    Watson * watson;
    
public:
    RobotW(int index, const Position & init_pos, Map * map, Criminal * criminal, Watson * watson);
    Position getNextPosition();
    void move();
    string str() const;
};

class RobotSW : public Robot {
private:
    Sherlock * sherlock;
    Watson * watson;
    
public:
    RobotSW(int index, const Position & init_pos, Map * map, Criminal * criminal, Sherlock * sherlock, Watson * watson);
    Position getNextPosition();
    void move();
    string str() const;
};

// BaseItem and BaseBag
class BaseItem {
protected:
    ItemType item_type;
    
public:
    BaseItem(ItemType item_type);
    virtual ~BaseItem();
    virtual bool canUse(Character * obj, Robot * robot) = 0;
    virtual void use(Character * obj, Robot * robot) = 0;
    ItemType getType() const;
};

class MagicBook : public BaseItem {
public:
    MagicBook();
    bool canUse(Character * obj, Robot * robot);
    void use(Character * obj, Robot * robot);
};

class EnergyDrink : public BaseItem {
public:
    EnergyDrink();
    bool canUse(Character * obj, Robot * robot);
    void use(Character * obj, Robot * robot);
};

class FirstAid : public BaseItem {
public:
    FirstAid();
    bool canUse(Character * obj, Robot * robot);
    void use(Character * obj, Robot * robot);
};

class ExcemptionCard : public BaseItem {
public:
    ExcemptionCard();
    bool canUse(Character * obj, Robot * robot);
    void use(Character * obj, Robot * robot);
};

class PassingCard : public BaseItem {
private:
    string challenge;
    
public:
    PassingCard(int i, int j);
    PassingCard(string challenge);
    bool canUse(Character * obj, Robot * robot);
    void use(Character * obj, Robot * robot);
    string getChallenge() const;
};

class BaseBag {
protected:
    int capacity;
    BaseItem ** items;
    int count;
    Character * obj;
    
public:
    BaseBag(int capacity, Character * obj);
    virtual ~BaseBag();
    virtual bool insert(BaseItem * item);
    virtual BaseItem * get();
    virtual BaseItem * get(ItemType itemType);
    virtual string str() const;
};

class SherlockBag : public BaseBag {
public:
    SherlockBag(Sherlock * sherlock);
};

class WatsonBag : public BaseBag {
public:
    WatsonBag(Watson * watson);
};

class ArrayMovingObject {
private:
    MovingObject ** arr_mv_objs;
    int count;
    int capacity;

public:
    ArrayMovingObject(int capacity);
    ~ArrayMovingObject();
    bool isFull() const;
    bool add(MovingObject * mv_obj);
    MovingObject * get(int index) const;
    int size() const;
    string str() const;
};

class Configuration {
    friend class StudyPinkProgram;

private:
    int map_num_rows;
    int map_num_cols;
    int max_num_moving_objects;
    int num_walls;
    Position * arr_walls;
    int num_fake_walls;
    Position * arr_fake_walls;
    string sherlock_moving_rule;
    Position sherlock_init_pos;
    int sherlock_init_hp;
    int sherlock_init_exp;
    string watson_moving_rule;
    Position watson_init_pos;
    int watson_init_hp;
    int watson_init_exp;
    Position criminal_init_pos;
    int num_steps;

public:
    Configuration(const string & filepath);
    ~Configuration();
    string str() const;
};

// Robot, BaseItem, BaseBag,...

class StudyPinkProgram {
private:
    // Sample attributes
    Configuration * config;
    
    Sherlock * sherlock;
    Watson * watson;
    Criminal * criminal;
    
    Map * map;
    ArrayMovingObject * arr_mv_objs;


public:
    StudyPinkProgram(const string & config_file_path);

    bool isStop() const;

    void printResult() const {
        if (sherlock->getCurrentPosition().isEqual(criminal->getCurrentPosition())) {
            cout << "Sherlock caught the criminal" << endl;
        }
        else if (watson->getCurrentPosition().isEqual(criminal->getCurrentPosition())) {
            cout << "Watson caught the criminal" << endl;
        }
        else {
            cout << "The criminal escaped" << endl;
        }
    }

    void printStep(int si) const {
        cout << "Step: " << setw(4) << setfill('0') << si
            << "--"
            << sherlock->str() << "--|--" << watson->str() << "--|--" << criminal->str() << endl;
    }

    void run(bool verbose) {
        // Note: This is a sample code. You can change the implementation as you like.
        // TODO
        for (int istep = 0; istep < config->num_steps; ++istep) {
            for (int i = 0; i < arr_mv_objs->size(); ++i) {
                arr_mv_objs->get(i)->move();
                if (isStop()) {
                    printStep(istep);
                    break;
                }
                if (verbose) {
                    printStep(istep);
                }
            }
        }
        printResult();
    }

    ~StudyPinkProgram();
};

////////////////////////////////////////////////
/// END OF STUDENT'S ANSWER
////////////////////////////////////////////////
#endif /* _H_STUDY_IN_PINK_2_H_ */
