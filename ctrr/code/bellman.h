#include<iostream>
#include<climits>

using namespace std;

#define MAX 100
#define INF INT_MAX



int mincost[MAX+1][MAX];
int previous[MAX+1][MAX];

int mincos[MAX+1][MAX];
int previou[MAX+1][MAX];

void setMatrix(int n, int start);
void BF(int graph[20][20], int n, char start_vertex, int BFValue[20], int BFPrev[20]);
string BF_Path(int graph[20][20], int num_vertices, char start_vertex, char goal_vertex); 
