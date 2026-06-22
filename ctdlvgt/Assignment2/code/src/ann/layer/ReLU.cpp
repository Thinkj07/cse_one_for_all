/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cppFiles/class.cc to edit this template
 */

/* 
 * File:   ReLU.cpp
 * Author: ltsach
 * 
 * Created on August 25, 2024, 2:44 PM
 */

#include "layer/ReLU.h"
#include "sformat/fmt_lib.h"
#include "ann/functions.h"
#include <xtensor/xarray.hpp>
#include <xtensor/xmath.hpp> 

ReLU::ReLU(string name) {
    if (trim(name).size() != 0) m_sName = name;
    else m_sName = "ReLU_" + to_string(++m_unLayer_idx);
}

ReLU::ReLU(const ReLU& orig) {
    m_sName = "ReLU_" + to_string(++m_unLayer_idx);
}

ReLU::~ReLU() {
}

xt::xarray<double> ReLU::forward(xt::xarray<double> X) {
    m_aMask = (X > 0); // Tạo mask để lưu lại các vị trí dương
    return xt::maximum(X, 0); // Trả về giá trị ReLU (max(X, 0))
}

xt::xarray<double> ReLU::backward(xt::xarray<double> DY) {
    // gradient only flows where X > 0
    return DY * m_aMask; // Tính gradient bằng cách nhân DY với mask
}

string ReLU::get_desc() {
    string desc = fmt::format("{:<10s}, {:<15s}:", "ReLU", this->getname());
    return desc;
}