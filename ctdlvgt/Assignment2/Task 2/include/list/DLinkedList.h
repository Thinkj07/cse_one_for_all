/*
 * File:   DLinkedList.h
 */

#ifndef DLINKEDLIST_H
#define DLINKEDLIST_H

#include "list/IList.h"

#include <sstream>
#include <iostream>
#include <type_traits>
using namespace std;

template <class T>
class DLinkedList : public IList<T>
{
public:
    class Node;        // Forward declaration
    class Iterator;    // Forward declaration
    class BWDIterator; // Forward declaration

protected:
    Node *head; // this node does not contain user's data
    Node *tail; // this node does not contain user's data
    int count;
    bool (*itemEqual)(T &lhs, T &rhs);        // function pointer: test if two items (type: T&) are equal or not
    void (*deleteUserData)(DLinkedList<T> *); // function pointer: be called to remove items (if they are pointer type)

public:
    DLinkedList(
        void (*deleteUserData)(DLinkedList<T> *) = 0,
        bool (*itemEqual)(T &, T &) = 0);
    DLinkedList(const DLinkedList<T> &list);
    DLinkedList<T> &operator=(const DLinkedList<T> &list);
    ~DLinkedList();

    // Inherit from IList: BEGIN
    void add(T e);
    void add(int index, T e);
    T removeAt(int index);
    bool removeItem(T item, void (*removeItemData)(T) = 0);
    bool empty();
    int size();
    void clear();
    T &get(int index);
    int indexOf(T item);
    bool contains(T item);
    string toString(string (*item2str)(T &) = 0);
    // Inherit from IList: END

    void println(string (*item2str)(T &) = 0)
    {
        cout << toString(item2str) << endl;
    }
    void setDeleteUserDataPtr(void (*deleteUserData)(DLinkedList<T> *) = 0)
    {
        this->deleteUserData = deleteUserData;
    }

    bool contains(T array[], int size)
    {
        int idx = 0;
        for (DLinkedList<T>::Iterator it = begin(); it != end(); it++)
        {
            if (!equals(*it, array[idx++], this->itemEqual))
                return false;
        }
        return true;
    }

    /*
     * free(DLinkedList<T> *list):
     *  + to remove user's data (type T, must be a pointer type, e.g.: int*, Point*)
     *  + if users want a DLinkedList removing their data,
     *      he/she must pass "free" to constructor of DLinkedList
     *      Example:
     *      DLinkedList<T> list(&DLinkedList<T>::free);
     */
    static void free(DLinkedList<T> *list)
    {
        typename DLinkedList<T>::Iterator it = list->begin();
        while (it != list->end())
        {
            delete *it;
            it++;
        }
    }

    /* begin, end and Iterator helps user to traverse a list forwardly
     * Example: assume "list" is object of DLinkedList

     DLinkedList<char>::Iterator it;
     for(it = list.begin(); it != list.end(); it++){
            char item = *it;
            std::cout << item; //print the item
     }
     */
    Iterator begin()
    {
        return Iterator(this, true);
    }
    Iterator end()
    {
        return Iterator(this, false);
    }

    /* last, beforeFirst and BWDIterator helps user to traverse a list backwardly
     * Example: assume "list" is object of DLinkedList

     DLinkedList<char>::BWDIterator it;
     for(it = list.last(); it != list.beforeFirst(); it--){
            char item = *it;
            std::cout << item; //print the item
     }
     */
    BWDIterator last()
    {
        return BWDIterator(this, true);
    }
    BWDIterator beforFirst()
    {
        return BWDIterator(this, false);
    }

protected:
    static bool equals(T &lhs, T &rhs, bool (*itemEqual)(T &, T &))
    {
        if (itemEqual == 0)
            return lhs == rhs;
        else
            return itemEqual(lhs, rhs);
    }
    void copyFrom(const DLinkedList<T> &list);
    void removeInternalData();
    Node *getPreviousNodeOf(int index);

    //////////////////////////////////////////////////////////////////////
    ////////////////////////  INNER CLASSES DEFNITION ////////////////////
    //////////////////////////////////////////////////////////////////////
public:
    class Node
    {
    public:
        T data;
        Node *next;
        Node *prev;
        friend class DLinkedList<T>;

    public:
        Node(Node *next = 0, Node *prev = 0)
        {
            this->next = next;
            this->prev = prev;
        }
        Node(T data, Node *next = 0, Node *prev = 0)
        {
            this->data = data;
            this->next = next;
            this->prev = prev;
        }
    };

    //////////////////////////////////////////////////////////////////////
    class BWDIterator{
    private:
        DLinkedList<T> *pList; 
        Node *pNode;            

    public:
        BWDIterator(DLinkedList<T> *pList = 0, bool last = true) {
            if (last) {
                if (pList != nullptr)
                    this->pNode = pList->tail->prev;  // Start from the last data node
                else
                    pNode = nullptr;
            } else {
                if (pList != nullptr)
                    this->pNode = pList->head;  // Set to the head sentinel node for 'before first'
                else
                    pNode = nullptr;
            }
            this->pList = pList;
        }

        BWDIterator &operator=(const BWDIterator &iterator) {
            this->pNode = iterator.pNode;
            this->pList = iterator.pList;
            return *this;
        }

        void remove(void (*removeItemData)(T) = 0) {
            pNode->prev->next = pNode->next;
            pNode->next->prev = pNode->prev;
            Node *pPrev = pNode->next;  // Must use next, so iterator-- will go to beginning
            if (removeItemData != nullptr)
                removeItemData(pNode->data);
            delete pNode;
            pNode = pPrev;
            pList->count -= 1;
        }

        T &operator*() {
            return pNode->data;
        }

        bool operator!=(const BWDIterator &iterator) {
            return pNode != iterator.pNode;
        }

        BWDIterator &operator++() {
            pNode = pNode->prev;
            return *this;
        }

        BWDIterator operator++(int) {
            BWDIterator iterator = *this;
            --*this;
            return iterator;
        }
    };
    class Iterator
    {
    private:
        DLinkedList<T> *pList;
        Node *pNode;

    public:
        Iterator(DLinkedList<T> *pList = 0, bool begin = true)
        {
            if (begin)
            {
                if (pList != 0)
                    this->pNode = pList->head->next;
                else
                    pNode = 0;
            }
            else
            {
                if (pList != 0)
                    this->pNode = pList->tail;
                else
                    pNode = 0;
            }
            this->pList = pList;
        }

        Iterator &operator=(const Iterator &iterator)
        {
            this->pNode = iterator.pNode;
            this->pList = iterator.pList;
            return *this;
        }
        void remove(void (*removeItemData)(T) = 0)
        {
            pNode->prev->next = pNode->next;
            pNode->next->prev = pNode->prev;
            Node *pNext = pNode->prev; // MUST prev, so iterator++ will go to end
            if (removeItemData != 0)
                removeItemData(pNode->data);
            delete pNode;
            pNode = pNext;
            pList->count -= 1;
        }

        T &operator*()
        {
            return pNode->data;
        }
        bool operator!=(const Iterator &iterator)
        {
            return pNode != iterator.pNode;
        }
        // Prefix ++ overload
        Iterator &operator++()
        {
            pNode = pNode->next;
            return *this;
        }
        // Postfix ++ overload
        Iterator operator++(int)
        {
            Iterator iterator = *this;
            ++*this;
            return iterator;
        }
    };
};
//////////////////////////////////////////////////////////////////////
// Define a shorter name for DLinkedList:

template <class T>
using List = DLinkedList<T>;

//////////////////////////////////////////////////////////////////////
////////////////////////     METHOD DEFNITION      ///////////////////
//////////////////////////////////////////////////////////////////////

template <class T>
DLinkedList<T>::DLinkedList(
    void (*deleteUserData)(DLinkedList<T> *),
    bool (*itemEqual)(T &, T &))
{
    this->head = new Node(); 
    this->tail = new Node();  
    this->head->next = this->tail;
    this->tail->prev = this->head;
    this->count = 0;
    this->deleteUserData = deleteUserData;
    this->itemEqual = itemEqual;
}

template <class T>
DLinkedList<T>::DLinkedList(const DLinkedList<T> &list)
{
    this->head = new Node();
    this->tail = new Node();
    this->head->next = this->tail;
    this->tail->prev = this->head;
    this->count = 0;
    this->itemEqual = list.itemEqual;
    this->deleteUserData = list.deleteUserData;
    copyFrom(list);
}

template <class T>
DLinkedList<T> &DLinkedList<T>::operator=(const DLinkedList<T> &list)
{
    if (this != &list) {
        clear();
        copyFrom(list);
    }
    return *this;
}

template <class T>
DLinkedList<T>::~DLinkedList()
{
    clear();
    delete this->head;
    delete this->tail;
}

template <class T>
void DLinkedList<T>::add(T e)
{
    Node *newNode = new Node(e, this->tail, this->tail->prev);
    this->tail->prev->next = newNode;
    this->tail->prev = newNode;
    this->count++;
}
template <class T>
void DLinkedList<T>::add(int index, T e)
{
    if (index < 0 || index > count) throw std::out_of_range("Index out of range");

    Node *prevNode = getPreviousNodeOf(index);
    Node *newNode = new Node(e, prevNode->next, prevNode);
    prevNode->next->prev = newNode;
    prevNode->next = newNode;
    this->count++;
}

template <class T>
typename DLinkedList<T>::Node *DLinkedList<T>::getPreviousNodeOf(int index)
{
    if (index < 0 || index > count) throw std::out_of_range("Index out of range");

    Node *current;
    if (index < this->count / 2) {
        current = this->head;
        for (int i = 0; i <= index; i++)
        {
            current = current->next;
        }
    } else {
        current = this->tail;
        for (int i = this->count; i > index; i--)
        {
            current = current->prev;
        }
    }
    return current->prev;
}

template <class T>
T DLinkedList<T>::removeAt(int index)
{
    if (index < 0 || index >= count) throw std::out_of_range("Index out of range");

    Node *prevNode = getPreviousNodeOf(index);
    Node *removeNode = prevNode->next;
    T data = removeNode->data;

    prevNode->next = removeNode->next;
    removeNode->next->prev = prevNode;
    delete removeNode;
    this->count--;

    return data;
}

template <class T>
bool DLinkedList<T>::empty()
{
    return this->head == nullptr;
}

template <class T>
int DLinkedList<T>::size()
{
    return this->count;
}

template <class T>
void DLinkedList<T>::clear()
{
    Node* current = head;
    while (current != nullptr) {
        Node* temp = current->next;
        delete current;
        current = temp;
    }
    head = tail = nullptr;
    count = 0;
}

template <class T>
T &DLinkedList<T>::get(int index)
{
    if (index < 0 || index >= count) throw std::out_of_range("Index out of range");
    Node *node = getPreviousNodeOf(index)->next;
    return node->data;
}

template <class T>
int DLinkedList<T>::indexOf(T item)
{
    int index = 0;
    for (Node *current = head->next; current != tail; current = current->next, index++) {
        if (equals(current->data, item, this->itemEqual)) return index;
    }
    return -1;
}

template <class T>
bool DLinkedList<T>::removeItem(T item, void (*removeItemData)(T))
{
    for (Iterator it = begin(); it != end(); ++it) {
        if (equals(*it, item, this->itemEqual)) {
            it.remove(removeItemData);
            return true;
        }
    }
    return false;
}

template <class T>
bool DLinkedList<T>::contains(T item)
{
    return indexOf(item) != -1;
}

template <class T>
string DLinkedList<T>::toString(string (*item2str)(T &))
{
    ostringstream os;
    os << "[";
    Node *current = head->next;
    while (current != tail) {
        if (item2str)
            os << item2str(current->data);
        else
            os << current->data;
        if (current->next != tail)
            os << ", ";
        current = current->next;
    }
    os << "]";
    return os.str();
}

template <class T>
void DLinkedList<T>::copyFrom(const DLinkedList<T> &list)
{
    for (Node *current = list.head->next; current != list.tail; current = current->next) {
        add(current->data);
    }
}

template <class T>
void DLinkedList<T>::removeInternalData()
{
    if (this->deleteUserData) {
        this->deleteUserData(this);
    }
    clear();
}

#endif /* DLINKEDLIST_H */
