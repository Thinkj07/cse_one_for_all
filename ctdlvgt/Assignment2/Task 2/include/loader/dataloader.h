/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cppFiles/file.h to edit this template
 */

/* 
 * File:   dataloader.h
 * Author: ltsach
 *
 * Created on September 2, 2024, 4:01 PM
 */

#ifndef DATALOADER_H
#define DATALOADER_H
#include "tensor/xtensor_lib.h"
#include "loader/dataset.h"

using namespace std;

template<typename DType, typename LType>
class DataLoader{
public:
    class Iterator; //forward declaration for class Iterator
    
private:
    Dataset<DType, LType>* ptr_dataset;
    int batch_size;
    bool shuffle;
    bool drop_last;
    int nbatch; // number of batch
    ulong_tensor item_indices;
    int m_seed;
    
public:
    DataLoader(Dataset<DType, LType>* ptr_dataset, 
            int batch_size, bool shuffle=true, 
            bool drop_last=false, int seed=-1)
                : ptr_dataset(ptr_dataset), 
                batch_size(batch_size), 
                shuffle(shuffle),
                m_seed(seed){
            nbatch = ptr_dataset->len()/batch_size;
            item_indices = xt::arange(0, ptr_dataset->len());
    }
    virtual ~DataLoader(){}

    int dataset_size() const {
        return ptr_dataset->len();
    }
    
    //New method: from V2: begin
    int get_batch_size(){ return batch_size; }
    int get_sample_count(){ return ptr_dataset->len(); }
    int get_total_batch(){return int(ptr_dataset->len()/batch_size); }
    
    //New method: from V2: end
    /////////////////////////////////////////////////////////////////////////
    // The section for supporting the iteration and for-each to DataLoader //
    /// START: Section                                                     //
    /////////////////////////////////////////////////////////////////////////
public:
    Iterator begin(){
        return Iterator(this, 0);
    }
    Iterator end(){
        int total_batches = (dataset_size() + batch_size - 1) / batch_size;
        if (drop_last && dataset_size() % batch_size != 0) {
            total_batches--; 
        }
        if (!drop_last) return Iterator(this, total_batches - 1);
        return Iterator(this, total_batches);
    }
    
    //BEGIN of Iterator

    class Iterator {
    private:
        DataLoader* loader;
        int current_index;
        int total_batches;

    public:
        Iterator(DataLoader* loader, int start_idx)
            : loader(loader), current_index(start_idx) {
            int total_samples = loader->dataset_size();
            total_batches = (total_samples + loader->batch_size - 1) / loader->batch_size;
            if (loader->drop_last && total_samples % loader->batch_size != 0) {
                total_batches--; 
            }
        }

        Batch<DType, LType> operator*() {
            int total_samples = loader->dataset_size();
            int start = current_index * loader->batch_size;
            int end = std::min(start + loader->batch_size, total_samples);

            if (!loader->drop_last && current_index == total_batches - 2 && end < total_samples) {
                end = total_samples; 
            }
            
            auto batch_data = xt::view(loader->ptr_dataset->getData(), xt::range(start, end), xt::all());
            auto batch_label = xt::view(loader->ptr_dataset->getLabel(), xt::range(start, end), xt::all());

            return Batch<DType, LType>(batch_data, batch_label);
        }

        Iterator& operator++() {
            current_index++;
            return *this;
        }

        Iterator operator++(int) {
            Iterator iterator = *this;
            ++*this;
            return iterator;
        }

        bool operator!=(const Iterator& other) const {
            return current_index != other.current_index;
        }
    };

    //END of Iterator
    
    /////////////////////////////////////////////////////////////////////////
    // The section for supporting the iteration and for-each to DataLoader //
    /// END: Section                                                       //
    /////////////////////////////////////////////////////////////////////////
};


#endif /* DATALOADER_H */

