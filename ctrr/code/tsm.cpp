#include "tsm.h"

void tspUtil(int graph[20][20], int cur_pos, int n, int count, int cost, int start) {
    if (count == n && graph[cur_pos][start]) {
        if (cost + graph[cur_pos][start] < min_cost) {
            min_cost = cost + graph[cur_pos][start];
            for (int i = 0; i < n; ++i) {
                best_path[i] = path[i];
            }
            best_path[n] = start; 
        }
        return;
    }

    for (int i = 0; i < n; ++i) {
        if (!visit[i] && graph[cur_pos][i]) {
        	if (cost + graph[cur_pos][i] >= min_cost) continue;
        	
            visit[i] = 1;
            path[count] = i;

            tspUtil(graph, i, n, count + 1, cost + graph[cur_pos][i], start);
            
            visit[i] = 0;
        }
    }
}

string Traveling(int graph[20][20], int n, char start_vertex) {
    int start = start_vertex - 'A';
    string result;

    min_cost = 1e9; // Re-initialize min_cost for each call

    for (int i = 0; i < n; ++i) {
        visit[i] = 0;
        path[i] = -1;
        best_path[i] = -1;
    }
    visit[start] = 1;
    path[0] = start;

    tspUtil(graph, start, n, 1, 0, start);

    for (int i = 0; i <= n; ++i) {
        result += char(best_path[i] + 'A');
        if (i < n) {
            result += " ";
        }
    }

    return result;
}
