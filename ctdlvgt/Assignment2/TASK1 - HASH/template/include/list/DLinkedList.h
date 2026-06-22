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

    static void free(DLinkedList<T> *list)
    {
        typename DLinkedList<T>::Iterator it = list->begin();
        while (it != list->end())
        {
            delete *it;
            it++;
        }
    }

    Iterator begin()
    {
        return Iterator(this, true);
    }
    Iterator end()
    {
        return Iterator(this, false);
    }

    BWDIterator bbegin()
    {
        return BWDIterator(this, true);
    }
    BWDIterator bend()
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

    class BWDIterator {
    private:
        DLinkedList<T> *pList;
        Node *pNode;

    public:
        BWDIterator(DLinkedList<T>* pList = nullptr, bool begin = true) 
        {
            if (begin) {
            if (pList != 0)
                this->pNode = pList->tail->prev;
            else
                pNode = 0;
            } else {
            if (pList != 0)
                this->pNode = pList->head;
            else
                pNode = 0;
            }
        this->pList = pList;
        }

        BWDIterator &operator=(const BWDIterator &iterator) 
        {
            this->pNode = iterator.pNode;
            this->pList = iterator.pList;
            return *this;
        }

        void remove(void (*removeItemData)(T) = 0) 
        {
            pNode->prev->next = pNode->next;
            pNode->next->prev = pNode->prev;
            Node* pPrev = pNode->next;
            if (removeItemData != 0) removeItemData(pNode->data); 
            delete pNode;
            pNode = pPrev; 
            pList->count--; 
        }

        T &operator*() 
        { 
            return pNode->data; 
        }

        bool operator!=(const BWDIterator &iterator) 
        {
            return pNode != iterator.pNode;
        }

        BWDIterator &operator--() 
        {
            pNode = pNode->prev;
            return *this;
        }

        BWDIterator operator--(int) 
        {
            BWDIterator iterator = *this;
            --*this;
            return iterator;
        }

        BWDIterator &operator++() 
        {
            pNode = pNode->prev;
            return *this;
        }

        BWDIterator operator++(int) 
        {
            BWDIterator iterator = *this;
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
    head = new Node();
    tail = new Node();
    head->next = tail;
    tail->prev = head;
    count = 0;
    this->deleteUserData = deleteUserData;
    this->itemEqual = itemEqual;
}

template <class T>
DLinkedList<T>::DLinkedList(const DLinkedList<T> &list)
{
    head = new Node();
    tail = new Node();
    head->next = tail;
    tail->prev = head;
    count = 0;

    Node* curr = list.head->next;
    while (curr != list.tail) {
        add(curr->data);
        curr = curr->next;
    }
    this->deleteUserData = list.deleteUserData;
    this->itemEqual = list.itemEqual;
}

template <class T>
DLinkedList<T> &DLinkedList<T>::operator=(const DLinkedList<T> &list)
{
    if (this != &list) {
        Node* curr = head->next;
        while (curr != tail) {
            Node* next = curr->next;
            delete curr; 
            curr = next;
        }
        head->next = tail;
        tail->prev = head;
        count = 0;

        Node* sourceCurr = list.head->next;
        while (sourceCurr != list.tail) {
            add(sourceCurr->data);
            sourceCurr = sourceCurr->next;
        }
    }
    return *this;
}

template <class T>
DLinkedList<T>::~DLinkedList()
{
    if (deleteUserData) {
        deleteUserData(this);
    }
    Node* curr = head->next;  
    while (curr != tail) {
        Node* next = curr->next;     
        delete curr; 
        curr = next; 
    }
    delete head;
    delete tail;
}

template <class T>
void DLinkedList<T>::add(T e)
{
    Node* newNode = new Node(e);
    if (head->next == tail) {
        head->next = newNode;
        newNode->prev = head;
        newNode->next = tail;
        tail->prev = newNode;
    } else {
        tail->prev->next = newNode;
        newNode->prev = tail->prev;
        newNode->next = tail;
        tail->prev = newNode;
    }
    count++;
}
template <class T>
void DLinkedList<T>::add(int index, T e)
{
    if (index < 0 || index > count) {
        throw out_of_range("Index is out of range!");
    }
    Node* newNode = new Node(e);
    
    if (index == 0) {
        newNode->next = head->next;
        newNode->prev = head;
        head->next->prev = newNode;
        head->next = newNode;
    } 
    else if (index == count) {
        newNode->next = tail;
        newNode->prev = tail->prev;
        tail->prev->next = newNode;
        tail->prev = newNode;
    } 
    else {
        Node* curr = head;
        for (int i = 0; i < index; ++i) {
            curr = curr->next;
        }
        newNode->next = curr->next;
        newNode->prev = curr;
        curr->next->prev = newNode;
        curr->next = newNode;
    }
    count++;
}

template <class T>
typename DLinkedList<T>::Node *DLinkedList<T>::getPreviousNodeOf(int index) {}

template <class T>
T DLinkedList<T>::removeAt(int index)
{
    // TODO
    if (index < 0 || index >= count) {
        throw out_of_range("Index is out of range!");
    }
    Node* curr = head->next;
    T item;

    if (index == 0) {
        item = curr->data;
        head->next = curr->next;
        curr->next->prev = head;
        delete curr;
        count--;
        return item;
    }

    for (int i = 0; i < index; ++i) {
        curr = curr->next;
    }

    item = curr->data;
    curr->prev->next = curr->next;
    curr->next->prev = curr->prev;
    delete curr;
    count--;

    return item;
}

template <class T>
bool DLinkedList<T>::empty()
{
    return count == 0;
}

template <class T>
int DLinkedList<T>::size()
{
    return count;
}

template <class T>
void DLinkedList<T>::clear()
{
    if (deleteUserData) {
        deleteUserData(this); 
    } 

    Node* curr = head->next;    
        while (curr != tail) {
            Node* next = curr->next;
            delete curr;
            curr = next;
        }

    head->next = tail;  
    tail->prev = head;
    count = 0;
}

template <class T>
T &DLinkedList<T>::get(int index)
{
    if (index < 0 || index >= count) {
        throw out_of_range("Index is out of range!");
    }
    Node* curr = head;
    for (int i = 0; i < index; i++) {
        curr = curr->next;
    }
    return curr->next->data;
}

template <class T>
int DLinkedList<T>::indexOf(T item)
{
    Node* curr = head->next;
    for (int i = 0; i < count; i++) {
        if (equals(curr->data, item, itemEqual)) {
        return i;
        }
        curr = curr->next;  
    }
    return -1;
}

template <class T>
bool DLinkedList<T>::removeItem(T item, void (*removeItemData)(T))
{
    if (empty()) return false;

    Node* curr = head->next;  
    while (curr != tail) {
        if (equals(curr->data, item, itemEqual)) {
        curr->prev->next = curr->next;
        curr->next->prev = curr->prev;
        if (removeItemData != nullptr) {
            removeItemData(curr->data);
        }
        delete curr;
        count--;
        return true;
        }
        curr = curr->next;
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
    stringstream ss;
    ss << "[";
    Node* curr = head->next;

    while (curr != tail) {
        if (item2str == nullptr) {
            ss << curr->data;
        }
        else {
        ss << item2str(curr->data);
        }

        if (curr->next != tail) {
            ss << ", "; 
        }

        curr = curr->next;  
    }

    ss << "]";
    return ss.str();
}

template <class T>
void DLinkedList<T>::copyFrom(const DLinkedList<T> &list) {}


template <class T>
void DLinkedList<T>::removeInternalData() {}

#endif /* DLINKEDLIST_H */
