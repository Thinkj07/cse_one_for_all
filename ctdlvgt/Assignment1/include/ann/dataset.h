/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cppFiles/file.h to edit this template
 */

/* 
 * File:   dataset.h
 * Author: ltsach
 *
 * Created on September 2, 2024, 3:59 PM
 */

#ifndef DATASET_H
#define DATASET_H
#include "ann/xtensor_lib.h"
using namespace std;

template<typename DType, typename LType>
class DataLabel{
private:
    xt::xarray<DType> data;
    xt::xarray<LType> label;
public:
    DataLabel(xt::xarray<DType> data,  xt::xarray<LType> label):
    data(data), label(label){
    }
    xt::xarray<DType> getData() const{ return data; }
    xt::xarray<LType> getLabel() const{ return label; }
};

template<typename DType, typename LType>
class Batch{
private:
    xt::xarray<DType> data;
    xt::xarray<LType> label;
public:
    Batch(xt::xarray<DType> data,  xt::xarray<LType> label):
    data(data), label(label){
    }
    virtual ~Batch(){}
    xt::xarray<DType>& getData(){return data; }
    xt::xarray<LType>& getLabel(){return label; }
};


template<typename DType, typename LType>
class Dataset{
private:
public:
    Dataset(){};
    virtual ~Dataset(){};
    
    virtual int len()=0;
    virtual DataLabel<DType, LType> getitem(int index)=0;
    virtual xt::xarray<DType>& getData() = 0;
    virtual xt::xarray<LType>& getLabel() = 0;
    virtual xt::svector<unsigned long> get_data_shape()=0;
    virtual xt::svector<unsigned long> get_label_shape()=0;
    
};

//////////////////////////////////////////////////////////////////////
template<typename DType, typename LType>
class TensorDataset: public Dataset<DType, LType>{
private:
    xt::xarray<DType> data;
    xt::xarray<LType> label;
    xt::svector<unsigned long> data_shape, label_shape;
    
public:
    TensorDataset(xt::xarray<DType> data, xt::xarray<LType> label) : 
        data(data), label(label), 
        data_shape(data.shape().begin(), data.shape().end()),  
        label_shape(label.shape().begin(), label.shape().end()) {}

    int len(){
        return data.shape()[0];
    }

    DataLabel<DType, LType> getitem(int index){
        xt::xarray<DType> data_sample = xt::view(data, index, xt::all());
        xt::xarray<LType> label_sample = xt::view(label, index, xt::all());
        return DataLabel<DType, LType>(data_sample, label_sample);
    }
    xt::svector<unsigned long> get_data_shape(){
        return data_shape;
    }
    xt::svector<unsigned long> get_label_shape(){
        return label_shape;
    }
    xt::xarray<DType>& getData() {
        return data;
    }
    xt::xarray<LType>& getLabel() {
        return label;
    }
};

template <typename DType, typename LType>
class ImageFolderDataset : public Dataset<DType, LType> {
private:
    xt::xarray<xt::xarray<DType>> images;
    xt::xarray<LType> labels;
    void load_images_and_labels(const std::string& folder_path) {}
public:
    ImageFolderDataset(const std::string& folder_path) {
            load_images_and_labels(folder_path);
    }
};

#endif /* DATASET_H */

