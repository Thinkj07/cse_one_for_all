/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   TopoSorter.h
 * Author: ltsach
 *
 * Created on July 11, 2021, 10:21 PM
 */

#ifndef TOPOSORTER_H
#define TOPOSORTER_H
#include "graph/DGraphModel.h"
#include "list/DLinkedList.h"
#include "sorting/DLinkedListSE.h"

template<class T>
class TopoSorter{
public:
    static int DFS;
    static int BFS; 
    
protected:
    DGraphModel<T>* graph;
    int (*hash_code)(T&, int);
    
public:
    TopoSorter(DGraphModel<T>* graph, int (*hash_code)(T&, int)=0){
        this->graph = graph;
        this->hash_code = hash_code;
    }   
    DLinkedList<T> sort(int mode=0, bool sorted=true){
        if (mode == DFS) {
            return dfsSort(sorted);
        } else if (mode == BFS) {
            return bfsSort(sorted);
        } else {
            throw "Invalid mode for topological sort!";
        }
    }
    DLinkedList<T> bfsSort(bool sorted=true){ 
        xMap<T, int> inDegreeMap = vertex2inDegree(hash_code);
        DLinkedListSE<T> zeroInDegree = listOfZeroInDegrees();
        DLinkedList<T> sortedList;

        while (!zeroInDegree.empty()) {
            if (sorted) {
                zeroInDegree.sort(); // Use DLinkedListSE's merge sort
            }

            T vertex = zeroInDegree.removeAt(0);
            sortedList.add(vertex);

            typename DLinkedList<T>::Iterator it = graph->getOutwardEdges(vertex).begin();
            while (it != graph->getOutwardEdges(vertex).end()) {
                T neighbor = *it;
                inDegreeMap[neighbor]--;

                if (inDegreeMap[neighbor] == 0) {
                    zeroInDegree.add(neighbor);
                }
                ++it;
            }
        }

        return sortedList;
        // xMap<T, int> inDegrees = vertex2inDegree(hash_code);
        // DLinkedList<T> zeroInDegree = listOfZeroInDegrees();
        // Queue<T> queue;
        // for (typename DLinkedList<T>::Iterator it = zeroInDegree.begin(); it != zeroInDegree.end(); ++it) {
        //     queue.push(*it);
        // }
        // if (sorted) {
        //     DLinkedListSE<T> sortedZeroInDegree;
        //     sortedZeroInDegree.copyFromPublic(zeroInDegree);
        //     sortedZeroInDegree.sort();
        //     queue.clear();
        //     for (typename DLinkedListSE<T>::Iterator it = sortedZeroInDegree.begin(); it != sortedZeroInDegree.end(); ++it) {
        //         queue.push(*it);
        //     }
        // }

        // DLinkedList<T> result;
        // while (!queue.empty()) {
        //     T current = queue.pop();
        //     result.add(current);
        //     DLinkedList<T> neighbors = graph->getOutwardEdges(current);
        //     for (typename DLinkedList<T>::Iterator it = neighbors.begin(); it != neighbors.end(); ++it) {
        //         T neighbor = *it;
        //         int degree = inDegrees.get(neighbor);
        //         inDegrees.put(neighbor, degree - 1);
        //         if (degree - 1 == 0) {
        //             queue.push(neighbor);
        //         }
        //     }
        // }

        // return result;
    }

    DLinkedList<T> dfsSort(bool sorted=true){
    // xMap<T, int> outDegrees = vertex2outDegree(hash_code);
        // DLinkedList<T> zeroInDegree = listOfZeroInDegrees();
        // Stack<T> stack;

        // for (typename DLinkedList<T>::Iterator it = zeroInDegree.begin(); it != zeroInDegree.end(); ++it) {
        //     stack.push(*it);
        // }
        // if (sorted) {
        //     DLinkedListSE<T> sortedZeroInDegree;
        //     sortedZeroInDegree.copyFromPublic(zeroInDegree);
        //     sortedZeroInDegree.sort();
        //     stack.clear();
        //     for (typename DLinkedListSE<T>::Iterator it = sortedZeroInDegree.begin(); it != sortedZeroInDegree.end(); ++it) {
        //         stack.push(*it);
        //     }
        // }
        // DLinkedList<T> result;

        // while (!stack.empty()) {
        //     T current = stack.pop();
        //     result.add(current);
        //     DLinkedList<T> neighbors = graph->getOutwardEdges(current);

        //     if (neighbors.empty()) continue; 

        //     for (typename DLinkedList<T>::Iterator it = neighbors.begin(); it != neighbors.end(); ++it) {
        //         if (outDegrees.containsKey(*it)) {
        //             int degree = outDegrees.get(*it);
        //             outDegrees.put(*it, degree - 1);
        //             if (degree - 1 == 0) {
        //                 stack.push(*it);
        //             }
        //         }
        //     }
        // }

        // return result;

        DLinkedList<T> sortedList;
        xMap<T, bool> visited(hash_code);
        typename DLinkedList<T>::Iterator it = graph->vertices().begin();

        while (it != graph->vertices().end()) {
            T vertex = *it;
            if (!visited[vertex]) {
                dfsVisit(vertex, visited, sortedList);
            }
            ++it;
        }

        if (sortedList.size() != graph->size()) {
            throw "Graph has cycles; topological sorting is not possible!";
        }

        sortedList.reverse();
        return sortedList;
    }

protected:

    //Helper functions
    xMap<T, int> vertex2inDegree(int (*hash)(T&, int)) {
        xMap<T, int> inDegreeMap(hash);
        typename DLinkedList<T>::Iterator it = graph->vertices().begin();

        while (it != graph->vertices().end()) {
            T vertex = *it;
            inDegreeMap[vertex] = 0;
            ++it;
        }

        it = graph->vertices().begin();
        while (it != graph->vertices().end()) {
            T vertex = *it;
            typename DLinkedList<T>::Iterator edgeIt = graph->getOutwardEdges(vertex).begin();
            while (edgeIt != graph->getOutwardEdges(vertex).end()) {
                T neighbor = *edgeIt;
                inDegreeMap[neighbor]++;
                ++edgeIt;
            }
            ++it;
        }

        return inDegreeMap;
    }
    xMap<T, int> vertex2outDegree(int (*hash)(T&, int)){}
    DLinkedList<T> listOfZeroInDegrees() {
        DLinkedList<T> zeroInDegree;
        xMap<T, int> inDegreeMap = vertex2inDegree(hash_code);

        typename DLinkedList<T>::Iterator it = graph->vertices().begin();
        while (it != graph->vertices().end()) {
            T vertex = *it;
            if (inDegreeMap[vertex] == 0) {
                zeroInDegree.add(vertex);
            }
            ++it;
        }

        return zeroInDegree;
    }
    void dfsVisit(T vertex, xMap<T, bool>& visited, DLinkedList<T>& sortedList) {
        visited[vertex] = true;

        typename DLinkedList<T>::Iterator it = graph->getOutwardEdges(vertex).begin();
        while (it != graph->getOutwardEdges(vertex).end()) {
            T neighbor = *it;
            if (!visited[neighbor]) {
                dfsVisit(neighbor, visited, sortedList);
            }
            ++it;
        }

        sortedList.add(vertex);
    }

}; //TopoSorter
template<class T>
int TopoSorter<T>::DFS = 0;
template<class T>
int TopoSorter<T>::BFS = 1;

/////////////////////////////End of TopoSorter//////////////////////////////////


#endif /* TOPOSORTER_H */

