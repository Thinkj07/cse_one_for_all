#include <iostream>
#include <iomanip>
#include <sstream>                                  //lệnh compiler: g++ -Idemo -Iinclude main.cpp
#include <string>                    //lệnh run: ./main.exe hoặc ./a.exe (tùy file thực thi máy xuất ra sau khi compile thành công)
#include <fstream>          
#include "include/list/listheader.h"
#include "demo/hash/xMapDemo.h"
#include "demo/heap/HeapDemo.h"
#include "include/hash/xMap.h"

#include "include/sformat/fmt_lib.h"
#include "include/tensor/xtensor_lib.h"
#include "include/ann/annheader.h"
#include "include/loader/dataset.h"
#include "include/loader/dataloader.h"
#include "ann/config/Config.h"
#include "ann/dataset/DSFactory.h"
#include "ann/optim/Adagrad.h"
#include "ann/optim/Adam.h"
#include "ann/modelzoo/twoclasses.h"
#include "ann/modelzoo/threeclasses.h"

using namespace std;

void mlpDemo1() {
    xt::random::seed(42);
    DSFactory factory("./config.txt");
    xmap<string, TensorDataset<double, double>*>* pMap = factory.get_datasets_2cc();
    TensorDataset<double, double>* train_ds = pMap->get("train_ds");
    TensorDataset<double, double>* valid_ds = pMap->get("valid_ds");
    TensorDataset<double, double>* test_ds = pMap->get("test_ds");
    DataLoader<double, double> train_loader(train_ds, 50, true, false);
    DataLoader<double, double> valid_loader(valid_ds, 50, false, false);
    DataLoader<double, double> test_loader(test_ds, 50, false, false);

    cout << "Train dataset: " << train_ds->len() << endl;
    cout << "Valid dataset: " << valid_ds->len() << endl;
    cout << "Test dataset: " << test_ds->len() << endl;

    int nClasses = 2;
    ILayer* layers[] = {
        new FCLayer(2, 50, true),
        new ReLU(),
        new FCLayer(50, nClasses, true),
        new Softmax()
    };

    MLPClassifier model("./config.txt", "2c-classification", layers, sizeof(layers)/sizeof(ILayer*));

    SGD optim(2e-3);
    CrossEntropy loss;
    ClassMetrics metrics(nClasses);

    model.compile(&optim, &loss, &metrics);
    model.fit(&train_loader, &valid_loader, 10);
    string base_path = "./models";
    // model.save(base_path + "/" + "2c-classification-1");
    double_tensor eval_rs = model.evaluate(&test_loader);
    cout << "Evaluation result on the testing dataset: " << endl;
    cout << eval_rs << endl;
}


int main(int argc, char** argv) {
    //twoclasses_classification();
    ofstream outFile("outputheap.txt");  

    if (!outFile) {
        cerr << "Không thể mở file để ghi!" << endl;
        return 1;
    }
    //TEST HASH : void (*hashDemos[])() = {0, hashDemo1, hashDemo2, heapDemo3, hashDemo4, hashDemo5, hashDemo6, hashDemo7};
    //Test heap:
    void (*hashDemos[])() = {0, hashDemo6, hashDemo1};
    //outFile << "TEST HAEP DEMO:......................................." << endl;
    //Test ReLU:
    //void (*ReLUDemos[])() = {0, ReLU_demo};
    

    for (int i = 1; i <= 2; i++) { //test hash i<=7
        outFile << "Demo " << i << "-------------------------" << endl;
        outFile << endl;

        streambuf* coutBuffer = cout.rdbuf();
        cout.rdbuf(outFile.rdbuf());
        hashDemos[i]();
        //ReLUDemos[i]();
        cout.rdbuf(coutBuffer);
    }

    outFile.close();
    return 0;
}
