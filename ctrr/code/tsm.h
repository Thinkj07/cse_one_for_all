#ifndef _TSM_
#define _TSM_

#include<iostream>
#include<climits>

using namespace std;

const int MAX = 100;

int visit[MAX]; 
int path[MAX]; 
int best_path[MAX]; 
int min_cost;

void tspUtil(int graph[20][20], int cur_pos, int n, int count, int cost, int start);
string Traveling(int graph[20][20], int n, char start_vertex);

#endif
