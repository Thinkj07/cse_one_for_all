import React, { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, Target, CheckCircle2, Clock, Search, CheckCircle, ArrowRight, Star, Award, BarChart3 } from 'lucide-react';
import '../styles/EmployerLanding.css';
import { Link } from 'react-router-dom';
import '../utils/scroll.ts';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function EmployerLandingPage() {
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState({
    candidates: '250,000+',
    companies: '12,500+',
    successfulHires: '45,000+',
    avgTime: '14 ngày'
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [pricingPackages, setPricingPackages] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchPricingPackages();
  }, []);

  const fetchStats = async () => {
    console.log('🚀 Fetching employer landing stats...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      console.log('📦 Stats data:', data);
      
      // Map data từ API với fallback
      const mappedStats = {
        candidates: data.find(s => s.label === 'Candidates')?.number || '250,000+',
        companies: data.find(s => s.label?.includes('Compan'))?.number || '12,500+',
        successfulHires: data.find(s => s.label?.includes('Successfull Hires') || s.label?.includes('Successful Hires'))?.number || '45,000+',
        avgTime: '14 ngày'
      };
      
      console.log('✅ Mapped stats:', mappedStats);
      setStats(mappedStats);
      
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      // Giữ nguyên fallback stats nếu fetch thất bại
      console.log('⚠️ Using fallback stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPricingPackages = async () => {
    console.log('🚀 Fetching pricing packages...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/pricing-packages`);
      
      console.log('📡 Pricing response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pricing packages');
      }
      
      const data = await response.json();
      console.log('📦 Pricing data:', data);
      
      if (data.success && data.packages && data.packages.length > 0) {
        setPricingPackages(data.packages);
        console.log('✅ Pricing packages loaded:', data.packages);
      } else {
        throw new Error('No pricing packages found');
      }
      
    } catch (error) {
      console.error('❌ Error fetching pricing packages:', error);
      // Sử dụng fallback nếu fetch thất bại
      setPricingPackages([]);
    } finally {
      setLoadingPricing(false);
    }
  };

  const handleGetStarted = () => {
    if (email) {
      console.log('📧 Email:', email);
      window.location.href = '/register-employer?email=' + encodeURIComponent(email);
    } else {
      window.location.href = '/register-employer';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-left">
              <h1 className="hero-title">
                Tìm kiếm nhân tài IT<br />
                <span className="highlight">nhanh chóng & hiệu quả</span>
              </h1>
              <p className="hero-description">
                Kết nối với hơn {stats.candidates} ứng viên IT chất lượng cao. Đăng tin tuyển dụng miễn phí và nhận hồ sơ từ những developer giỏi nhất Việt Nam.
              </p>
              <div className="hero-cta">
                <input
                  type="email"
                  placeholder="Email công ty của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="email-input"
                />
                <button onClick={handleGetStarted} className="btn-primary">
                  Bắt đầu ngay <ArrowRight size={20} />
                </button>
              </div>
              <p className="hero-note">✓ Miễn phí đăng tin • ✓ Không cần thẻ tín dụng</p>
            </div>

            <div className="hero-right">
              <div className="stats-card">
                <div className="stats-header">
                  <div className="stats-icon">
                    <Users size={32} />
                  </div>
                  <div className="stats-info">
                    <div className="stats-number">{loadingStats ? '...' : stats.candidates}</div>
                    <div className="stats-label">Ứng viên IT</div>
                  </div>
                </div>
                <div className="candidate-list">
                  <div className="candidate-item">
                    <CheckCircle size={20} />
                    <span>Backend Developer</span>
                  </div>
                  <div className="candidate-item">
                    <CheckCircle size={20} />
                    <span>Frontend Developer</span>
                  </div>
                  <div className="candidate-item">
                    <CheckCircle size={20} />
                    <span>Full-stack Developer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{loadingStats ? '...' : stats.candidates}</div>
              <div className="stat-label">Ứng viên IT</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{loadingStats ? '...' : stats.companies}</div>
              <div className="stat-label">Công ty</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{loadingStats ? '...' : stats.successfulHires}</div>
              <div className="stat-label">Việc làm thành công</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.avgTime}</div>
              <div className="stat-label">Thời gian tuyển dụng TB</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Tại sao chọn ITviec?</h2>
            <p>Nền tảng tuyển dụng IT hàng đầu Việt Nam</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Target size={28} />
              </div>
              <h3>Chỉ tập trung IT</h3>
              <p>Nền tảng được thiết kế riêng cho ngành công nghệ. Tiếp cận đúng ứng viên IT bạn cần.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Search size={28} />
              </div>
              <h3>Tìm kiếm thông minh</h3>
              <p>Công cụ lọc ứng viên theo kỹ năng, kinh nghiệm và ngôn ngữ lập trình cụ thể.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={28} />
              </div>
              <h3>Thống kê chi tiết</h3>
              <p>Theo dõi số lượt xem, ứng tuyển và hiệu quả của từng tin tuyển dụng.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={28} />
              </div>
              <h3>Ứng viên chất lượng</h3>
              <p>Nhận hồ sơ từ những developer có kinh nghiệm và kỹ năng được xác minh.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={28} />
              </div>
              <h3>Tuyển nhanh hơn</h3>
              <p>Giảm thời gian tuyển dụng trung bình xuống chỉ còn 14 ngày.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Award size={28} />
              </div>
              <h3>Xây dựng thương hiệu</h3>
              <p>Tạo trang công ty chuyên nghiệp để thu hút ứng viên tốt nhất.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Bảng giá linh hoạt</h2>
            <p>Chọn gói phù hợp với nhu cầu tuyển dụng của bạn</p>
          </div>

          {loadingPricing ? (
            <div className="pricing-loading">
              <p>Đang tải các gói dịch vụ...</p>
            </div>
          ) : pricingPackages.length > 0 ? (
            <div className="pricing-grid">
              {pricingPackages.map((pkg, index) => (
                <div key={pkg.id || index} className={`pricing-card ${pkg.popular ? 'featured' : ''}`}>
                  {pkg.popular && <div className="popular-badge">Phổ biến nhất</div>}
                  <div className="pricing-header">
                    <h3>{pkg.name}</h3>
                    <div className="price">
                      {pkg.price === 0 ? '0₫' : `${pkg.price.toLocaleString('vi-VN')}₫`}
                    </div>
                    {pkg.price > 0 && <p className="price-note">/ {pkg.duration === 'month' ? 'tháng' : 'năm'}</p>}
                  </div>
                  <ul className="pricing-features">
                    {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                      pkg.features.map((feature, idx) => (
                        <li key={idx} className={feature.included ? 'included' : 'not-included'}>
                          <CheckCircle size={20} />
                          <span>{feature.text || feature}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li>
                          <CheckCircle size={20} />
                          <span>Tối đa {pkg.maxJobs} tin tuyển dụng</span>
                        </li>
                        <li>
                          <CheckCircle size={20} />
                          <span>Hiển thị {pkg.maxJobDuration} ngày</span>
                        </li>
                      </>
                    )}
                  </ul>
                  <Link to="/register-employer">
                    <button className={`btn-pricing ${pkg.popular ? 'primary' : ''}`}>
                      {pkg.price === 0 ? 'Bắt đầu miễn phí' : 'Chọn gói này'}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="pricing-grid">
              {/* Free Plan */}
              <div className="pricing-card">
                <div className="pricing-header">
                  <h3>Miễn phí</h3>
                  <div className="price">0₫</div>
                  <p className="price-note">Dùng thử không giới hạn</p>
                </div>
                <ul className="pricing-features">
                  <li>
                    <CheckCircle size={20} />
                    <span>1 tin tuyển dụng đang hoạt động</span>
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    <span>Hiển thị 30 ngày</span>
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    <span>Trang công ty cơ bản</span>
                  </li>
                </ul>
                <Link to="/register-employer">
                  <button className="btn-pricing">Bắt đầu miễn phí</button>
                </Link>
              </div>

              {/* Standard Plan */}
              <div className="pricing-card featured">
                <div className="popular-badge">Phổ biến nhất</div>
                <div className="pricing-header">
                  <h3>Standard</h3>
                  <div className="price">5,000,000₫</div>
                  <p className="price-note">/ tháng</p>
                </div>
                <ul className="pricing-features">
                  <li>
                    <CheckCircle size={20} />
                    <span>5 tin tuyển dụng đang hoạt động</span>
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    <span>Tin được ưu tiên hiển thị</span>
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    <span>Tìm kiếm CV không giới hạn</span>
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    <span>Thống kê chi tiết</span>
                  </li>
                </ul>
                <Link to="/register-employer">
                  <button className="btn-pricing primary">Chọn gói này</button>
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="pricing-card">
                <div className="pricing-header">
                  <h3>Premium</h3>
                  <div className="price">12,000,000₫</div>
                  <p className="price-note">/ tháng</p>
                </div>
                <ul className="pricing-features">
                  <li>
                    <CheckCircle size={20} />
                    <span>Tin không giới hạn</span>
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    <span>Vị trí nổi bật trang chủ</span>
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    <span>Email marketing ứng viên</span>
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    <span>Account Manager riêng</span>
                  </li>
                </ul>
                <Link to="/register-employer">
                  <button className="btn-pricing">Liên hệ tư vấn</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Sẵn sàng tìm kiếm nhân tài?</h2>
            <p>Hàng ngàn công ty đã tin tưởng ITviec. Đến lượt bạn!</p>
            <Link to="/register-employer">
              <button className="btn-cta">
                Đăng tin miễn phí ngay <ArrowRight size={24} className="ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}