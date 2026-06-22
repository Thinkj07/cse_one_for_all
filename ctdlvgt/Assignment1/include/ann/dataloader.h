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
#include "ann/xtensor_lib.h"
#include "ann/dataset.h"

using namespace std;

template<typename DType, typename LType>
class DataLoader {
public:
    class Iterator;
private:
    Dataset<DType, LType>* dataset;
    int batch_size;
    bool shuffle;
    bool drop_last;
    int m_seed;
    xt::xarray<int> indices; 
public:
    DataLoader(Dataset<DType, LType>* dataset, int batch_size, bool shuffle = true, bool drop_last = false, int seed = -1)
        : dataset(dataset), batch_size(batch_size), shuffle(shuffle), drop_last(drop_last), m_seed(seed) {
        indices = xt::arange<int>(0, dataset->len());

        if (shuffle) {
            if (m_seed >= 0) {
                xt::random::seed(m_seed);  
            }
            xt::random::shuffle(indices);  
        }
    }

    virtual ~DataLoader(){}

    int dataset_size() const {
        return dataset->len();
    }

    Iterator begin() {
        return Iterator(this, 0);
    }

    Iterator end() {
        int total_batches = (dataset_size() + batch_size - 1) / batch_size;
        if (drop_last && dataset_size() % batch_size != 0) {
            total_batches--; 
        }
        if (!drop_last) return Iterator(this, total_batches - 1);
        return Iterator(this, total_batches);
    }

public:
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
            
            auto batch_data = xt::view(loader->dataset->getData(), xt::range(start, end), xt::all());
            auto batch_label = xt::view(loader->dataset->getLabel(), xt::range(start, end), xt::all());

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
    
};

#endif /* DATALOADER_H */

