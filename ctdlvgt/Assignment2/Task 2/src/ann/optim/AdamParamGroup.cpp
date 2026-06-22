/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cppFiles/class.cc to edit this template
 */

/* 
 * File:   AdamParamGroup.cpp
 * Author: ltsach
 * 
 * Created on October 8, 2024, 1:43 PM
 */

#include "optim/AdamParamGroup.h"

AdamParamGroup::AdamParamGroup(double beta1, double beta2):
    m_beta1(beta1), m_beta2(beta2){
    //Create some maps:
    m_pParams = new xmap<string, xt::xarray<double>*>(&stringHash);
    m_pGrads = new xmap<string, xt::xarray<double>*>(&stringHash);
    m_pFirstMomment = new xmap<string, xt::xarray<double>*>(
            &stringHash,
            0.75,
            0,
            xmap<string, xt::xarray<double>*>::freeValue);
    m_pSecondMomment = new xmap<string, xt::xarray<double>*>(
            &stringHash,
            0.75,
            0,
            xmap<string, xt::xarray<double>*>::freeValue);
    //
    m_step_idx = 1;
    m_beta1_t = m_beta1;
    m_beta2_t = m_beta2;
}

AdamParamGroup::AdamParamGroup(const AdamParamGroup& orig):
    m_beta1(orig.m_beta1), m_beta2(orig.m_beta2){
    m_pParams = new xmap<string, xt::xarray<double>*>(&stringHash);
    m_pGrads = new xmap<string, xt::xarray<double>*>(&stringHash);
    m_pFirstMomment = new xmap<string, xt::xarray<double>*>(
            &stringHash,
            0.75,
            0,
            xmap<string, xt::xarray<double>*>::freeValue);
    m_pSecondMomment = new xmap<string, xt::xarray<double>*>(
            &stringHash,
            0.75,
            0,
            xmap<string, xt::xarray<double>*>::freeValue);
    //copy:
    *m_pParams = *orig.m_pParams;
    *m_pGrads = *orig.m_pGrads;
    *m_pFirstMomment = *orig.m_pFirstMomment;
    *m_pSecondMomment = *orig.m_pSecondMomment;
    //
    m_step_idx = 1;
    m_beta1_t = m_beta1;
    m_beta2_t = m_beta2;
}

AdamParamGroup::~AdamParamGroup() {
    if(m_pFirstMomment != nullptr) delete m_pFirstMomment;
    if(m_pSecondMomment != nullptr) delete m_pSecondMomment;
}

void AdamParamGroup::register_param(string param_name, 
        xt::xarray<double>* ptr_param,
        xt::xarray<double>* ptr_grad){
    (*m_pParams)[param_name] = ptr_param;
    (*m_pGrads)[param_name] = ptr_grad;

    (*m_pFirstMomment)[param_name] = new xt::xarray<double>(xt::zeros<double>(ptr_param->shape()));
    (*m_pSecondMomment)[param_name] = new xt::xarray<double>(xt::zeros<double>(ptr_param->shape()));
}
void AdamParamGroup::register_sample_count(unsigned long long* pCounter){
    m_pCounter = pCounter;
}

void AdamParamGroup::zero_grad(){
    for (auto& grad_entry : *m_pGrads) {
        auto& grad = *(grad_entry.second);
        grad = xt::zeros<double>(grad.shape());
    }
}

void AdamParamGroup::step(double lr){
    double eps = 1e-8; // Small epsilon to prevent division by zero

    for (auto& param_entry : *m_pParams) {
        const string& param_name = param_entry.first;
        xt::xarray<double>& param = *(param_entry.second);
        xt::xarray<double>& grad = *(*m_pGrads)[param_name];
        xt::xarray<double>& first_moment = *(*m_pFirstMomment)[param_name];
        xt::xarray<double>& second_moment = *(*m_pSecondMomment)[param_name];

        // Update biased first and second moments
        first_moment = m_beta1 * first_moment + (1 - m_beta1) * grad;
        second_moment = m_beta2 * second_moment + (1 - m_beta2) * xt::square(grad);

        // Bias-corrected moments
        xt::xarray<double> first_unbiased = first_moment / (1 - m_beta1_t);
        xt::xarray<double> second_unbiased = second_moment / (1 - m_beta2_t);

        // Parameter update
        param -= lr * first_unbiased / (xt::sqrt(second_unbiased) + eps);
    }

    // Update step index
    m_step_idx += 1;
    m_beta1_t *= m_beta1;
    m_beta2_t *= m_beta2;
}
