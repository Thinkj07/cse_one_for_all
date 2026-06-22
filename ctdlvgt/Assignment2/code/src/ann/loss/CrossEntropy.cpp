/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cppFiles/class.cc to edit this template
 */

/* 
 * File:   CrossEntropy.cpp
 * Author: ltsach
 * 
 * Created on August 25, 2024, 2:47 PM
 */

#include "loss/CrossEntropy.h"
#include "ann/functions.h"

CrossEntropy::CrossEntropy(LossReduction reduction): ILossLayer(reduction){
    
}

CrossEntropy::CrossEntropy(const CrossEntropy& orig):
ILossLayer(orig){
}

CrossEntropy::~CrossEntropy() {
}

double CrossEntropy::forward(xt::xarray<double> X, xt::xarray<double> t){
    m_aCached_Ypred = X;
    m_aYtarget = t;

    // Ensure numerical stability by clipping predictions to prevent log(0)
    X = xt::clip(X, 1e-15, 1.0);

    // Compute cross-entropy loss
    auto loss = -xt::sum(t * xt::log(X))();

    // Apply reduction (mean reduction by default)
    if (m_eReduction == REDUCE_MEAN) {
        loss /= X.shape()[0]; // Divide by the number of samples
    }

    return loss;
}
xt::xarray<double> CrossEntropy::backward() {
    xt::xarray<double> gradient = m_aCached_Ypred - m_aYtarget;

    // Apply reduction (mean reduction by default)
    if (m_eReduction == REDUCE_MEAN) {
        gradient /= m_aCached_Ypred.shape()[0]; // Divide by the number of samples
    }

    return gradient;
}