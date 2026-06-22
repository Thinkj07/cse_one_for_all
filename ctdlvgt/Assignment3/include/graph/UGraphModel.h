/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * File:   UGraphModel.h
 * Author: LTSACH
 *
 * Created on 24 August 2020, 15:16
 */

#ifndef UGRAPHMODEL_H
#define UGRAPHMODEL_H

#include "graph/AbstractGraph.h"
#include "stacknqueue/IDeck.h"

//////////////////////////////////////////////////////////////////////
///////////// UGraphModel: Undirected Graph Model ////////////////////
//////////////////////////////////////////////////////////////////////

template <class T>
class UGraphModel : public AbstractGraph<T>
{
private:
public:
    // class UGraphAlgorithm;
    // friend class UGraphAlgorithm;

    UGraphModel(
        bool (*vertexEQ)(T &, T &),
        string (*vertex2str)(T &)) : AbstractGraph<T>(vertexEQ, vertex2str)
    {
    }

    void connect(T from, T to, float weight = 0)
    {
        typename AbstractGraph<T>::VertexNode* fromNode = this->getVertexNode(from);
        typename AbstractGraph<T>::VertexNode* toNode = this->getVertexNode(to);
        if (!fromNode || !toNode) {
            throw "VertexNotFoundException";
        }
        if (!fromNode->getEdge(toNode)) {
            fromNode->connect(toNode, weight);
            toNode->connect(fromNode, weight); // Bidirectional edge
        }
    }
    void disconnect(T from, T to)
    {
        typename AbstractGraph<T>::VertexNode* fromNode = this->getVertexNode(from);
        typename AbstractGraph<T>::VertexNode* toNode = this->getVertexNode(to);
        if (!fromNode || !toNode) {
            throw "VertexNotFoundException";
        }
        if (!fromNode->getEdge(toNode)) {
            throw "EdgeNotFoundException";
        }
        fromNode->removeTo(toNode);
        toNode->removeTo(fromNode);
    }
    void remove(T vertex)
    {
        typename AbstractGraph<T>::VertexNode* targetNode = this->getVertexNode(vertex);

        if (!targetNode) {
            throw "VertexNotFoundException";
        }

        typename DLinkedList<typename AbstractGraph<T>::VertexNode*>::Iterator it = this->nodeList.begin();
        while (it != this->nodeList.end()) {
            typename AbstractGraph<T>::VertexNode* node = *it;
            if (node != targetNode) {
                node->removeTo(targetNode);
                targetNode->removeTo(node); // Ensure bidirectional cleanup
            }
            ++it;
        }

        this->nodeList.remove(targetNode);
        delete targetNode;
    }
    static UGraphModel<T> *create(
        T *vertices, int nvertices, Edge<T> *edges, int nedges,
        bool (*vertexEQ)(T &, T &),
        string (*vertex2str)(T &))
    {
        UGraphModel<T>* graph = new UGraphModel<T>(vertexEQ, vertex2str);
        for (int i = 0; i < nvertices; ++i) {
            graph->add(vertices[i]);
        }
        for (int i = 0; i < nedges; ++i) {
            graph->connect(edges[i].from->vertex, edges[i].to->vertex, edges[i].weight);
        }
        return graph;
    }
};

#endif /* UGRAPHMODEL_H */
