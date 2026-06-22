/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   DLinkedListSE.h
 * Author: LTSACH
 *
 * Created on 31 August 2020, 14:13
 */

#ifndef DLINKEDLISTSE_H
#define DLINKEDLISTSE_H
#include "list/DLinkedList.h"
#include "sorting/ISort.h"

template<class T>
class DLinkedListSE: public DLinkedList<T>{
public:
    
    DLinkedListSE(
            void (*removeData)(DLinkedList<T>*)=0, 
            bool (*itemEQ)(T&, T&)=0 ) : 
            DLinkedList<T>(removeData, itemEQ){
        
    };
    
    DLinkedListSE(const DLinkedList<T>& list){
        this->copyFrom(list);
    }
    
    void sort(int (*comparator)(T&,T&)=0){
        if (this->head->next == this->tail) {
            // List is empty or contains a single element; no sorting needed
            return;
        }

        this->head->next = mergeSort(this->head->next, this->tail->prev, comparator);
        // Re-link head and tail sentinels
        typename DLinkedList<T>::Node* current = this->head;
        while (current->next != nullptr) {
            current->next->prev = current;
            current = current->next;
        }
        this->tail->prev = current;
        current->next = this->tail;
    };
    
protected:
    static int compare(T& lhs, T& rhs, int (*comparator)(T&,T&)=0){
        if(comparator != 0) return comparator(lhs, rhs);
        else{
            if(lhs < rhs) return -1;
            else if(lhs > rhs) return +1;
            else return 0;
        }
    }

    typename DLinkedList<T>::Node* mergeSort(
        typename DLinkedList<T>::Node* start,
        typename DLinkedList<T>::Node* end,
        int (*comparator)(T&, T&)
    ) {
        if (start == end) {
            // Base case: single element
            start->next = nullptr; // Ensure proper termination of sublist
            return start;
        }

        // Find the midpoint
        typename DLinkedList<T>::Node* mid = getMiddle(start, end);

        // Recursively sort each half
        typename DLinkedList<T>::Node* left = mergeSort(start, mid, comparator);
        typename DLinkedList<T>::Node* right = mergeSort(mid->next, end, comparator);

        // Merge sorted halves
        return merge(left, right, comparator);
    }

    typename DLinkedList<T>::Node* merge(
        typename DLinkedList<T>::Node* left,
        typename DLinkedList<T>::Node* right,
        int (*comparator)(T&, T&)
    ) {
        typename DLinkedList<T>::Node dummy;
        typename DLinkedList<T>::Node* tail = &dummy;

        while (left != nullptr && right != nullptr) {
            if (compare(left->data, right->data, comparator) <= 0) {
                tail->next = left;
                left->prev = tail;
                left = left->next;
            } else {
                tail->next = right;
                right->prev = tail;
                right = right->next;
            }
            tail = tail->next;
        }

        // Append any remaining elements
        if (left != nullptr) {
            tail->next = left;
            left->prev = tail;
        }
        if (right != nullptr) {
            tail->next = right;
            right->prev = tail;
        }

        return dummy.next;
    }

    typename DLinkedList<T>::Node* getMiddle(
        typename DLinkedList<T>::Node* start,
        typename DLinkedList<T>::Node* end
    ) {
        typename DLinkedList<T>::Node* slow = start;
        typename DLinkedList<T>::Node* fast = start;

        while (fast != end && fast->next != end) {
            slow = slow->next;
            fast = fast->next->next;
        }

        return slow;
    }
    


};

// template <class T>
// void DLinkedListSE<T>::updateTail() {
//     typename DLinkedList<T>::Node* current = this->head;
//     while (current->next) {
//         current = current->next;
//     }
//     this->tail->prev = current;
//     current->next = this->tail;
// }
// template <class T>
// typename DLinkedList<T>::Node* DLinkedListSE<T>::getMiddle(
//     typename DLinkedList<T>::Node* head
// ) {
//     if (!head) return head;

//     typename DLinkedList<T>::Node* slow = head;
//     typename DLinkedList<T>::Node* fast = head;

//     while (fast->next && fast->next->next) {
//         slow = slow->next;
//         fast = fast->next->next;
//     }

//     return slow;
// }

// template <class T>
// typename DLinkedList<T>::Node* DLinkedListSE<T>::merge(
//     typename DLinkedList<T>::Node* left,
//     typename DLinkedList<T>::Node* right,
//     int (*comparator)(T&, T&)
// ) {

//     typename DLinkedList<T>::Node dummy;
//     typename DLinkedList<T>::Node* tail = &dummy;

//     while (left && right) {
//         if (compare(left->data, right->data, comparator) <= 0) {
//             tail->next = left;
//             left->prev = tail;
//             left = left->next;
//         } else {
//             tail->next = right;
//             right->prev = tail;
//             right = right->next;
//         }
//         tail = tail->next;
//     }

//     if (left) {
//         tail->next = left;
//         left->prev = tail;
//     } else if (right) {
//         tail->next = right;
//         right->prev = tail;
//     }

//     dummy.next->prev = nullptr; 
//     return dummy.next;
// }
// template <class T>
// typename DLinkedList<T>::Node* DLinkedListSE<T>::mergeSort(
//     typename DLinkedList<T>::Node* head,
//     int (*comparator)(T&, T&)
// ) {

//     if (!head || !head->next) return head;

//     typename DLinkedList<T>::Node* mid = getMiddle(head);
//     typename DLinkedList<T>::Node* nextToMid = mid->next;
//     mid->next = nullptr;
//     if (nextToMid) nextToMid->prev = nullptr;

//     typename DLinkedList<T>::Node* left = mergeSort(head, comparator);
//     typename DLinkedList<T>::Node* right = mergeSort(nextToMid, comparator);

//     return merge(left, right, comparator);
// }

#endif /* DLINKEDLISTSE_H */

