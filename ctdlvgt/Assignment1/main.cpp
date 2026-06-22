#include <iostream>
#include <iomanip>
#include <sstream>
#include <string>
#include "list/listheader.h"
#include "list/DLinkedListDemo.h"
#include "list/XArrayListDemo.h"
#include "ann/dataset.h"
#include "ann/dataloader.h"

using namespace std;


int main(int argc, char** argv) {
    cout << "Assignment-1" << endl;
    xt::random::seed(100);
    xt::xarray<double> X = xt::random::randn<double>({105, 10, 10});
    xt::xarray<int> t = xt::ones<int>({105});
    TensorDataset<double, int> ds(X, t);
    DataLoader<double, int> loader(&ds, 10, true);
    for(auto batch: loader){
        cout << (xt::adapt(batch.getData().shape())) << endl;
        cout << (xt::adapt(batch.getLabel().shape())) << endl;
    }
    
    return 0;
}

