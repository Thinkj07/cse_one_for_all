import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <span className="logo-it">IT</span>
              <span className="logo-viec">viec</span>
            </div>
            <p>Nền tảng tuyển dụng IT hàng đầu Việt Nam</p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Dành cho Nhà tuyển dụng</h4>
            <ul>
              <li>
                <Link to="/employer">Đăng tin tuyển dụng</Link>
              </li>
              <li>
                <Link to="/pricing-plans">Bảng giá</Link>
              </li>
              <li>
                <Link to="/employer-dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/employer/my-jobs">Quản lý tin tuyển dụng</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Dành cho Ứng viên</h4>
            <ul>
              <li>
                <Link to="/find-job">Tìm việc làm</Link>
              </li>
              <li>
                <Link to="/candidate-dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/candidate-dashboard/applied-jobs">Việc đã ứng tuyển</Link>
              </li>
              <li>
                <Link to="/candidate-dashboard/favourite-jobs">Việc yêu thích</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Về ITviec</h4>
            <ul>
              <li>
                <Link to="/about">Giới thiệu</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
              <li>
                <Link to="/terms">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/privacy">Chính sách bảo mật</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Liên hệ</h4>
            <ul>
              <li>
                <a href="mailto:contact@itviec.com">
                  contact@itviec.com
                </a>
              </li>
              <li>
                <a href="tel:1900xxxx">
                  Hotline: 1900 xxxx
                </a>
              </li>
              <li>
                Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 ITviec. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/terms">Điều khoản</Link>
            <span>•</span>
            <Link to="/privacy">Bảo mật</Link>
            <span>•</span>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;