/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   DGraphModel.h
 * Author: LTSACH
 *
 * Created on 23 August 2020, 19:36
 */

#ifndef DGRAPHMODEL_H
#define DGRAPHMODEL_H
#include "graph/AbstractGraph.h"
#include "stacknqueue/Queue.h"
#include "stacknqueue/Stack.h"
#include "hash/xMap.h"
#include "stacknqueue/IDeck.h"
#include "sorting/DLinkedListSE.h"


//////////////////////////////////////////////////////////////////////
///////////// GraphModel: Directed Graph Model    ////////////////////
//////////////////////////////////////////////////////////////////////


template<class T>
class DGraphModel: public AbstractGraph<T>{
private:
public:
    DGraphModel(
            bool (*vertexEQ)(T&, T&), 
            string (*vertex2str)(T&) ): 
        AbstractGraph<T>(vertexEQ, vertex2str){
    }
    
    void connect(T from, T to, float weight=0){
        typename AbstractGraph<T>::VertexNode* fromNode = this->getVertexNode(from);
        typename AbstractGraph<T>::VertexNode* toNode = this->getVertexNode(to);
        if (!fromNode || !toNode) {
            throw "VertexNotFoundException";
        }
        fromNode->connect(toNode, weight);
    }
    void disconnect(T from, T to){
        typename AbstractGraph<T>::VertexNode* fromNode = this->getVertexNode(from);
        typename AbstractGraph<T>::VertexNode* toNode = this->getVertexNode(to);
        if (!fromNode || !toNode) {
            throw "VertexNotFoundException";
        }
        if (!fromNode->getEdge(toNode)) {
            throw "EdgeNotFoundException";
        }
        fromNode->removeTo(toNode);
    }
    void remove(T vertex){
        typename AbstractGraph<T>::VertexNode* targetNode = this->getVertexNode(vertex);
        if (!targetNode) {
            throw "VertexNotFoundException";
        }
        typename DLinkedList<typename AbstractGraph<T>::VertexNode*>::Iterator it = this->nodeList.begin();
        while (it != this->nodeList.end()) {
             typename AbstractGraph<T>::VertexNode* node = *it;
            if (node != targetNode) {
                node->removeTo(targetNode);
            }
            ++it;
        }
        this->nodeList.remove(targetNode);
        delete targetNode;
    }
    
    static DGraphModel<T>* create(
            T* vertices, int nvertices, Edge<T>* edges, int nedges,
            bool (*vertexEQ)(T&, T&),
            string (*vertex2str)(T&)){
        DGraphModel<T>* graph = new DGraphModel<T>(vertexEQ, vertex2str);
        for (int i = 0; i < nvertices; ++i) {
            graph->add(vertices[i]);
        }
        for (int i = 0; i < nedges; ++i) {
            graph->connect(edges[i].from->vertex, edges[i].to->vertex, edges[i].weight);
        }
        return graph;
    }
};

#endif /* DGRAPHMODEL_H */

