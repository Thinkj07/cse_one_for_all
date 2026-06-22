/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cppFiles/class.cc to edit this template
 */

/* 
 * File:   Softmax.cpp
 * Author: ltsach
 * 
 * Created on August 25, 2024, 2:46 PM
 */

#include "layer/Softmax.h"
#include "ann/functions.h"
#include "sformat/fmt_lib.h"
#include <xtensor/xarray.hpp>
#include <xtensor/xmath.hpp> // for xt::exp, xt::sum, xt::view
#include <xtensor/xadapt.hpp>

Softmax::Softmax(int axis, string name) : m_nAxis(axis) {
    if (trim(name).size() != 0) m_sName = name;
    else m_sName = "Softmax_" + to_string(++m_unLayer_idx);
}

Softmax::Softmax(const Softmax& orig) {
}

Softmax::~Softmax() {
}

xt::xarray<double> Softmax::forward(xt::xarray<double> X) {
    xt::xarray<double> exp_X = xt::exp(X - xt::amax(X, {m_nAxis}, xt::keep_dims)); // Ổn định số học
    m_aCached_Y = exp_X / xt::sum(exp_X, {m_nAxis}, xt::keep_dims); // Lưu lại softmax để dùng trong backward
    return m_aCached_Y;
}

xt::xarray<double> Softmax::backward(xt::xarray<double> DY) {
    // Assuming DY is the upstream gradient for softmax layer output
    xt::xarray<double> sum_dy = xt::sum(DY * m_aCached_Y, {m_nAxis}, xt::keep_dims);
    return m_aCached_Y * (DY - sum_dy);
}

string Softmax::get_desc() {
    string desc = fmt::format("{:<10s}, {:<15s}: {:4d}", "Softmax", this->getname(), m_nAxis);
    return desc;
}
