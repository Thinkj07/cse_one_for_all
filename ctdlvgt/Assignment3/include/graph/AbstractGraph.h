/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   AbstractGraph.h
 * Author: LTSACH
 *
 * Created on 23 August 2020, 17:48
 */

#ifndef ABSTRACTGRAPH_H
#define ABSTRACTGRAPH_H
#include "graph/IGraph.h"
#include <string>
#include <sstream>
using namespace std;


template<class T>
class AbstractGraph: public IGraph<T>{
public:
    class Edge; //forward declaration
    class VertexNode; //forward declaration
    class Iterator; //forward declaration
    
private:
protected:
    //Using the adjacent list technique, so need to store list of nodes (nodeList)
    DLinkedList<VertexNode*> nodeList; 
    
    //Function pointers:
    bool (*vertexEQ)(T&, T&); //to compare two vertices
    string (*vertex2str)(T&); //to obtain string representation of vertices
    
    
    VertexNode* getVertexNode(T& vertex){
        typename DLinkedList<VertexNode*>::Iterator it = nodeList.begin();
        while(it != nodeList.end()){
            VertexNode* node = *it;
            if(vertexEQ(node->vertex, vertex) ) return node;
            it++;
        }
        return 0;
    }
    string vertex2Str(VertexNode& node){
        return vertex2str(node.vertex);
    }
    string edge2Str(Edge& edge){
        stringstream os;
        os << "E("
                << vertex2str(edge.from->vertex)
                << ","
                << vertex2str(edge.to->vertex)
                << ")";
        return os.str();
    }
    
public:
    AbstractGraph(
            bool (*vertexEQ)(T&, T&)=0, 
            string (*vertex2str)(T&)=0){
        
        this->vertexEQ = vertexEQ;
        this->vertex2str = vertex2str;
    }
    virtual ~AbstractGraph(){}
    
    typedef bool (*vertexEQFunc)(T&, T&);
    typedef string (*vertex2strFunc)(T&);
    vertexEQFunc getVertexEQ(){
        return this->vertexEQ;
    }
    vertex2strFunc getVertex2Str(){
        return this->vertex2str;
    }

    
//////////////////////////////////////////////////////////////////////
//////////////////// IMPLEMENTATION of IGraph API ////////////////////
//////////////////////////////////////////////////////////////////////
    /* connect, disconnect, and remove: will be overridden in:
     *  >> UGraphModel
     *  >> DGraphModel
     */
    virtual void connect(T from, T to, float weight=0) =0;
    virtual void disconnect(T from, T to)=0;
    virtual void remove(T vertex)=0;
    
    
    
    /* The following are common methods for UGraphModel and DGraphModel
     */
    virtual void add(T vertex) {
        if (contains(vertex)) return; // Avoid duplicates
        VertexNode* newNode = new VertexNode(vertex, vertexEQ, vertex2str);
        nodeList.add(newNode);
    }
    virtual bool contains(T vertex){
        return getVertexNode(vertex) != nullptr;
    }
    virtual float weight(T from, T to){
        VertexNode* frNode = getVertexNode(from);
        if (!frNode) throw "VertexNotFoundException";
        Edge* edge = frNode->getEdge(getVertexNode(to));
        if (!edge) throw "EdgeNotFoundException";
        return edge->weight;
    }
    virtual DLinkedList<T> getOutwardEdges(T from){
        VertexNode* fromNode = getVertexNode(from);
        if (!fromNode) throw "VertexNotFoundException";
        return fromNode->getOutwardEdges();
    }
    
    virtual DLinkedList<T>  getInwardEdges(T to){
        DLinkedList<T> inwardEdges;
        typename DLinkedList<VertexNode*>::Iterator it = nodeList.begin();
        while (it != nodeList.end()) {
            VertexNode* node = *it;
            if (node->getEdge(getVertexNode(to))) {
                inwardEdges.add(node->vertex);
            }
            ++it;
        }
        return inwardEdges;
    }
    
    virtual int size() {
        return nodeList.size();
    }
    virtual bool empty(){
        return nodeList.size() == 0;
    };
    virtual void clear(){
        typename DLinkedList<VertexNode*>::Iterator it = nodeList.begin();
        while (it != nodeList.end()) {
            VertexNode* node = *it;
            delete node; 
            it++;
        }
        nodeList.clear();
    }
    virtual int inDegree(T vertex){
        VertexNode* node = getVertexNode(vertex);
        if (!node) throw "VertexNotFoundException";
        return node->inDegree();
    }
    virtual int outDegree(T vertex){
        VertexNode* node = getVertexNode(vertex);
        if (!node) throw "VertexNotFoundException";
        return node->outDegree();
    }
    
    virtual DLinkedList<T> vertices(){
        DLinkedList<T> verticesList;
        typename DLinkedList<VertexNode*>::Iterator it = nodeList.begin();
        while (it != nodeList.end()) {
            verticesList.add((*it)->vertex);
            ++it;
        }
        return verticesList;
    }
    virtual bool connected(T from, T to){
        VertexNode* fromNode = getVertexNode(from);
        VertexNode* toNode = getVertexNode(to);
        if (!fromNode || !toNode) return false;
        return fromNode->getEdge(toNode) != nullptr;
    }
    void println(){
        cout << this->toString() << endl;
    }
    virtual string toString(){
        string mark(50, '=');
        stringstream os;
        os << mark << endl;
        os << left << setw(12) << "Vertices:" << endl;
        typename DLinkedList<VertexNode*>::Iterator nodeIt = nodeList.begin();
        while(nodeIt != nodeList.end()){
            VertexNode* node = *nodeIt;
            os << node->toString() << endl;
            nodeIt++;
        }
        string mark2(30, '-');
        os << mark2 << endl;
        
        os << left << setw(12) << "Edges:" << endl;
        
        nodeIt = nodeList.begin();
        while(nodeIt != nodeList.end()){
            VertexNode* node = *nodeIt;
            
            typename DLinkedList<Edge*>::Iterator edgeIt = node->adList.begin();
            while(edgeIt != node->adList.end()){
                Edge* edge = *edgeIt;
                os << edge->toString() << endl;
                
                edgeIt++;
            }
            
            nodeIt++;
        }
        os << mark << endl;
        return os.str();
    }
    
    /* begin, end: will be used to traverse on graph's vertices
     * example: assume that "graph" is a graph.
     * Code:
     *      AbstractGraph<T>::Iterator it;
     *      for(it = graph.begin(); it != graph.end(); it++){
     *          T vertex = *it; 
     *          //continue to process vertex here!
     *      }
     */
    Iterator begin(){
        return Iterator(this, true);
    }
    Iterator end(){
        return Iterator(this, false);
    }

//////////////////////////////////////////////////////////////////////
////////////////////////  INNER CLASSES DEFNITION ////////////////////
//////////////////////////////////////////////////////////////////////
    
public:
//BEGIN of VertexNode    
    class VertexNode{
    private:
        template<class U>
        friend class UGraphModel; //UPDATED: added
        T vertex;
        int inDegree_, outDegree_;
        DLinkedList<Edge*> adList; 
        friend class Edge;
        friend class AbstractGraph;
        
        bool (*vertexEQ)(T&, T&);
        string (*vertex2str)(T&);
        
    public:
        VertexNode():adList(&DLinkedList<Edge*>::free, &Edge::edgeEQ){}
        VertexNode(T vertex, bool (*vertexEQ)(T&, T&), string (*vertex2str)(T&))
            :adList(&DLinkedList<Edge*>::free, &Edge::edgeEQ){
            this->vertex = vertex;
            this->vertexEQ = vertexEQ;
            this->vertex2str = vertex2str;
            this->outDegree_ = this->inDegree_ = 0;
        }
        T& getVertex(){
            return vertex;
        }
        void connect(VertexNode* to, float weight=0){
            if (!getEdge(to)) {
                adList.add(new Edge(this, to, weight));
                outDegree_++;
                to->inDegree_++;
            }
        }
        DLinkedList<T> getOutwardEdges(){
            DLinkedList<T> edges;
            typename DLinkedList<Edge*>::Iterator it = adList.begin();
            while (it != adList.end()) {
                edges.add((*it)->to->vertex);
                ++it;
            }
            return edges;
        }

        Edge* getEdge(VertexNode* to){
            typename DLinkedList<Edge*>::Iterator it = adList.begin();
            while (it != adList.end()) {
                if ((*it)->to == to) return *it;
                ++it;
            }
            return nullptr;
        }
        bool equals(VertexNode* node){
            return *vertexEQ(this, node);
        }
        
        void removeTo(VertexNode* to){
            typename DLinkedList<Edge*>::Iterator it = adList.begin();
            while (it != adList.end()) {
                if ((*it)->to == to) {
                    to->inDegree_--;
                    outDegree_--;
                    adList.removeAt(it);
                    return;
                }
                ++it;
            }
        }
        int inDegree(){
            return inDegree_;
        }
        int outDegree(){
            return outDegree_;
        }
        string toString(){
            stringstream os;
            os << "V("
                    << this->vertex << ", "
                    << "in: " << this->inDegree_ << ", "
                    << "out: " << this->outDegree_ << ")";
            return os.str();
        }
    };
//END of VertexNode    
    
//BEGIN of Edge
    class Edge{
    private:
        VertexNode* from;
        VertexNode* to;
        float weight;
        friend class VertexNode;
        friend class AbstractGraph;
        
    public:
        Edge(){}
        Edge(VertexNode* from, VertexNode* to, float weight=0){
            this->from = from;
            this->to = to;
            this->weight = weight;
        }
        
        bool equals(Edge* edge){
            return this->from == edge->from && this->to == edge->to;
        }

        static bool edgeEQ(Edge*& edge1, Edge*& edge2){
            return edge1->equals(edge2);
        }
        string toString(){
            stringstream os;
            os << "E("
                    << this->from->vertex
                    << ","
                    << this->to->vertex
                    << ","
                    << this->weight
                    << ")";
            return os.str();
        }
    };
 //END of Edge
    

//BEGIN of Iterator
public:
    class Iterator{
    private:
        typename DLinkedList<VertexNode*>::Iterator nodeIt;
        
    public:
        Iterator(AbstractGraph<T>* pGraph=0, bool begin=true){
            if(begin) {
                if(pGraph != 0) nodeIt = pGraph->nodeList.begin();
            }
            else{
                if(pGraph != 0) nodeIt = pGraph->nodeList.end();
            }
        }
        Iterator& operator=(const Iterator& iterator){
            this->nodeIt = iterator.nodeIt;
            return *this;
        }
        
        T& operator*(){
            return (*nodeIt)->vertex;
        }
        
        bool operator!=(const Iterator& iterator){
            return nodeIt != iterator.nodeIt;
        }
        // Prefix ++ overload 
        Iterator& operator++(){
            nodeIt++;
            return *this; 
        }
        // Postfix ++ overload 
        Iterator operator++(int){
            Iterator iterator = *this; 
            ++*this; 
            return iterator; 
        }
    };
//END of Iterator
};

#endif /* ABSTRACTGRAPH_H */

