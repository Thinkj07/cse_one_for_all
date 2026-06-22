#include "bellman.h"

void setMatrix(int n, int start) {
	for (int i = 0; i <= n; ++i) {
        for (int j = 0; j < n; ++j) {
            mincost[i][j] = (i == 0 && j == start) ? 0 : 1e9;
            previous[i][j] = -1;
        }
    }
}

void BF(int graph[20][20], int n, char start_vertex, int BFValue[20], int BFPrev[20]) {
	static int step = 1;
    int start = start_vertex - 'A';
    for (int i = 0; i < n; i++) {
    	for (int j = 0; j < n; j++) {
    		if (graph[i][j] == 0 && i != j) graph[i][j] = 1e9;
		}
	}
    
	if (step == 1) setMatrix(n, start);
        for (int i = 0; i < n; ++i) {
            mincost[step][i] = mincost[step - 1][i];
            previous[step][i] = previous[step - 1][i];
            for (int j = 0; j < n; ++j) {
                if (graph[j][i] != 1e9 && mincost[step - 1][j] != 1e9) {
                    if (mincost[step][i] == 1e9 || mincost[step - 1][j] + graph[j][i] < mincost[step][i]) {
                        mincost[step][i] = mincost[step - 1][j] + graph[j][i];
                        previous[step][i] = j;
                        
                    }
                }

            }
        }
	
	for (int i = 0; i < n; i++) {
	    BFValue[i] = mincost[step][i];
	    if (BFValue[i] == 1e9) BFValue[i] = -1;
	}
	for (int i = 0; i < n; i++) {
	    BFPrev[i] = previous[step][i];
	}

	step++;

}

string BF_Path(int graph[20][20], int n, char start_vertex, char goal_vertex) {
	string ch = "";
	char c;
	int start = start_vertex - 'A';
	int goal = goal_vertex - 'A';
	//------------------------------------Set up
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			if (graph[i][j] == 0 && i != j ) graph[i][j] = 1e9;
		}
	}
	for (int i = 0; i <= n; ++i) {
        for (int j = 0; j < n; ++j) {
            mincos[i][j] = (i == 0 && j == start) ? 0 : 1e9;
            previou[i][j] = -1;
        }
    }
    
	//-------------------------------------Tim quang duong ngan nhat
	for (int step = 1; step <= n; ++step) {
        for (int i = 0; i < n; ++i) {
            mincos[step][i] = mincos[step - 1][i];
            previou[step][i] = previou[step - 1][i];
			
            for (int j = 0; j < n; ++j) {
                if (graph[j][i] != 1e9 && mincos[step - 1][j] != 1e9) {
                    if (mincos[step][i] == 1e9 || mincos[step - 1][j] + graph[j][i] < mincos[step][i]) {
                        mincos[step][i] = mincos[step - 1][j] + graph[j][i];
                        previou[step][i] = j;
                    }
                }
            }
        }
	}
	//--------------------------------------Tim duong di ngan nhat
	if (mincos[n - 1][goal] == 1e9) cout << "Not found";
	else {
		int path[100000];
		int j = 0;
		while(goal != start) {
			path[j] = goal;
			j++;
			goal = previou[n - 1][goal];
		}
		ch = ch + start_vertex + " ";
		for (int i = j - 1; i >= 0; i--) {
			c = path[i] + 'A';
			ch = ch + c + " ";
		}
		
	}
	//---------------------------
	return ch;
}
