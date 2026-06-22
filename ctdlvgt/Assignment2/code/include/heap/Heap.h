/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Heap.h
 * Author: LTSACH
 *
 * Created on 22 August 2020, 18:18
 */

#ifndef HEAP_H
#define HEAP_H
#include <memory.h>
#include "heap/IHeap.h"
#include <sstream>
/*
 * function pointer: int (*comparator)(T& lhs, T& rhs)
 *      compares objects of type T given in lhs and rhs.
 *      return: sign of (lhs - rhs)
 *              -1: lhs < rhs
 *              0 : lhs == rhs
 *              +1: ls > rhs
 * 
 * function pointer: void (*deleteUserData)(Heap<T>* pHeap)
 *      remove user's data in case that T is a pointer type
 *      Users should pass &Heap<T>::free for "deleteUserData"
 * 
 */
template<class T>
class Heap: public IHeap<T>{
public:
    class Iterator; //forward declaration
    
protected:
    T *elements;    //a dynamic array to contain user's data
    int capacity;   //size of the dynamic array
    int count;      //current count of elements stored in this heap
    int (*comparator)(T& lhs, T& rhs);      //see above
    void (*deleteUserData)(Heap<T>* pHeap); //see above
    
public:
    Heap(   int (*comparator)(T& , T&)=0, 
            void (*deleteUserData)(Heap<T>*)=0 );
    
    Heap(const Heap<T>& heap); //copy constructor 
    Heap<T>& operator=(const Heap<T>& heap); //assignment operator
    
    ~Heap();
    
    //Inherit from IHeap: BEGIN
    void push(T item);
    T pop();
    const T peek();
    void remove(T item, void (*removeItemData)(T)=0);
    bool contains(T item);
    int size();
    void heapify(T array[], int size);
    void clear();
    bool empty();
    string toString(string (*item2str)(T&)=0 );
    //Inherit from IHeap: END
    
    void println(string (*item2str)(T&)=0 ){
        cout << toString(item2str) << endl;
    }
    
    Iterator begin(){
        return Iterator(this, true);
    }
    Iterator end(){
        return Iterator(this, false);
    }
    
public:
    /* if T is pointer type:
     *     pass the address of method "free" to Heap<T>'s constructor:
     *     to:  remove the user's data (if needed)
     * Example:
     *  Heap<Point*> heap(&Heap<Point*>::free);
     *  => Destructor will call free via function pointer "deleteUserData"
     */
    static void free(Heap<T> *pHeap){
        for(int idx=0; idx < pHeap->count; idx++) delete pHeap->elements[idx];
    }
    
    
private:
    bool aLTb(T& a, T& b){
        return compare(a, b) < 0;
    }
    int compare(T& a, T& b){
        if(comparator != 0) return comparator(a, b);
        else{
            if (a < b) return -1;
            else if(a > b) return 1;
            else return 0;
        }
    }
    
    void ensureCapacity(int minCapacity); 
    void swap(int a, int b);
    void reheapUp(int position);
    void reheapDown(int position);
    int getItem(T item);
    
    void removeInternalData();
    void copyFrom(const Heap<T>& heap);
    
    
//////////////////////////////////////////////////////////////////////
////////////////////////  INNER CLASSES DEFNITION ////////////////////
//////////////////////////////////////////////////////////////////////
    
public:
    
    //Iterator: BEGIN
    class Iterator{
    private:
        Heap<T>* heap;
        int cursor;
    public:
        Iterator(Heap<T>* heap=0, bool begin=0){
            this->heap = heap;
            if(begin && (heap !=0)) cursor = 0;
            if(!begin && (heap !=0)) cursor = heap->size();
        }
        Iterator& operator=(const Iterator& iterator){
            this->heap = iterator.heap;
            this->cursor = iterator.cursor;
            return *this;
        }
        
        T& operator*(){
            return this->heap->elements[cursor];
        }
        bool operator!=(const Iterator& iterator){
            return this->cursor != iterator.cursor;
        }
        // Prefix ++ overload 
        Iterator& operator++(){
            cursor++;
            return *this; 
        }
        // Postfix ++ overload 
        Iterator operator++(int){
            Iterator iterator = *this; 
            ++*this; 
            return iterator; 
        }
        void remove(void (*removeItemData)(T)=0){
            this->heap->remove(this->heap->elements[cursor], removeItemData);
        }
    };
    //Iterator: END
};


//////////////////////////////////////////////////////////////////////
////////////////////////     METHOD DEFNITION      ///////////////////
//////////////////////////////////////////////////////////////////////

template<class T>
Heap<T>::Heap(
        int (*comparator)(T&, T&), 
        void (*deleteUserData)(Heap<T>* ) ){
    this->comparator = comparator;
    this->deleteUserData = deleteUserData;
    capacity = 10;
    count = 0;
    elements = new T[capacity];
}
template<class T>
Heap<T>::Heap(const Heap<T>& heap){
    copyFrom(heap);
}

template<class T>
Heap<T>& Heap<T>::operator=(const Heap<T>& heap){
    if (this != &heap) {
        clear();     
        copyFrom(heap);
    }
    return *this;
}


template<class T>
Heap<T>::~Heap(){
    removeInternalData();
}

template<class T>
void Heap<T>::push(T item){ //item  = 25
    ensureCapacity(count + 1);   
    elements[count] = item;      
    reheapUp(count);             
    count++; 
}
/*
      18
     /  \
    15   13
    /
  25 
 =>
      25
     /  \
    18   13
    /
  15 
=> array: [25, 18, 13, 15, , ]
           0   1    2   3
 
 */
template<class T>
T Heap<T>::pop(){
    if (empty()) throw std::underflow_error("Calling to peek with the empty heap.");
    T root = elements[0];        
    elements[0] = elements[--count]; 
    reheapDown(0);               
    return root; }

/*
      15
     /  \
    18   13
 => ReheapDown
      18
     /  \
    15   13
=> Array: [18, 15, 13, , , ]
 */

template<class T>
const T Heap<T>::peek(){
    if (empty()) throw std::underflow_error("Calling to peek with the empty heap.");
    return elements[0];
}


template<class T>
void Heap<T>::remove(T item, void (*removeItemData)(T)){
    int idx = getItem(item);    
    if (idx == -1) return;      

    if (removeItemData) removeItemData(elements[idx]); // Free item if needed

    elements[idx] = elements[--count];  
    reheapDown(idx);
}

template<class T>
bool Heap<T>::contains(T item){
    return getItem(item) != -1;
}

template<class T>
int Heap<T>::size(){
    return count;
}

template<class T>
void Heap<T>::heapify(T array[], int size){
    clear();
    ensureCapacity(size);         
    for (int i = 0; i < size; i++) push(array[i]);
}

template<class T>
void Heap<T>::clear(){
    removeInternalData();         // Clear memory
    count = 0;                    // Reset count
    capacity = 10;                
    elements = new T[capacity]; 
}

template<class T>
bool Heap<T>::empty(){
    return count == 0;
}

template<class T>
string Heap<T>::toString(string (*item2str)(T&)){
    stringstream os;
    if(item2str != 0){
        os << "[";
        for(int idx=0; idx < count -1; idx++)
            os << item2str(elements[idx]) << ",";
        if(count > 0) os << item2str(elements[count - 1]);
        os << "]";
    }
    else{
        os << "[";
        for(int idx=0; idx < count -1; idx++)
            os << elements[idx] << ",";
        if(count > 0) os << elements[count - 1];
        os << "]";
    }
    return os.str();
}


//////////////////////////////////////////////////////////////////////
//////////////////////// (private) METHOD DEFNITION //////////////////
//////////////////////////////////////////////////////////////////////

template<class T>
void Heap<T>::ensureCapacity(int minCapacity){
    if(minCapacity >= capacity){
        //re-allocate 
        int old_capacity = capacity;
        capacity = old_capacity + (old_capacity >> 2);
        try{
            T* new_data = new T[capacity];
            //OLD: memcpy(new_data, elements, capacity*sizeof(T));
            memcpy(new_data, elements, old_capacity*sizeof(T));
            delete []elements;
            elements = new_data;
        }
        catch(std::bad_alloc e){
            e.what();
        }
    }
}

template<class T>
void Heap<T>::swap(int a, int b){
    T temp = this->elements[a];
    this->elements[a] = this->elements[b];
    this->elements[b] = temp;
}

template<class T>
void Heap<T>::reheapUp(int position){
    // int parent = (position - 1) / 2;
    // while (position > 0 && aLTb(elements[parent], elements[position])) {
    //     swap(parent, position);
    //     position = parent;
    //     parent = (position - 1) / 2;
    // }
    while (position > 0) {
        int parent = (position - 1) / 2;
        if (aLTb(elements[position], elements[parent])) {
            swap(position, parent);
            position = parent;
        } else break;
    }
}

template<class T>
void Heap<T>::reheapDown(int position){
    // int child = 2 * position + 1;
    // while (child < count) {
    //     int rightChild = child + 1;
    //     if (rightChild < count && aLTb(elements[child], elements[rightChild])) {
    //         child = rightChild;
    //     }
    //     if (!aLTb(elements[position], elements[child])) break;
    //     swap(position, child);
    //     position = child;
    //     child = 2 * position + 1;
    // }
     while (true) {
        int left = 2 * position + 1;
        int right = 2 * position + 2;
        int smallest = position;

        if (left < count && aLTb(elements[left], elements[smallest])) smallest = left;
        if (right < count && aLTb(elements[right], elements[smallest])) smallest = right;

        if (smallest != position) {
            swap(position, smallest);
            position = smallest;
        } else break;
    }
}

template<class T>
int Heap<T>::getItem(T item){
    for (int i = 0; i < count; i++) {
        if (compare(elements[i], item) == 0) return i;
    }
    return -1;
}

template<class T>
void Heap<T>::removeInternalData(){
    if(this->deleteUserData != 0) deleteUserData(this); //clear users's data if they want
    delete []elements;
}

template<class T>
void Heap<T>::copyFrom(const Heap<T>& heap){
    capacity = heap.capacity;
    count = heap.count;
    elements = new T[capacity];
    this->comparator = heap.comparator;
    this->deleteUserData = heap.deleteUserData;
    
    //Copy items from heap:
    for(int idx=0; idx < heap.size(); idx++){
        this->elements[idx] = heap.elements[idx];
    }
}

#endif /* HEAP_H */

