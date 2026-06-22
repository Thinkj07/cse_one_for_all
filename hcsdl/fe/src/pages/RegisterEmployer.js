import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Briefcase, FileText, Building2 } from 'lucide-react';
import '../styles/Signup.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RegisterEmployer = () => {
  const navigate = useNavigate();

  // Form state
  const [isEmployer, setIsEmployer] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    // Additional fields
    positionTitle: '',
    phoneNumber: '',
    companyName: '',
    taxNumber: '',
    industry: '',
    companySize: '',
    website: '',
    nationality: '',
    description: '',
    logo: null
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats từ API
  const [stats, setStats] = useState({
    liveJobs: '1,75,324',
    companies: '97,354',
    newJobs: '7,532'
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats từ API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stats`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        const liveJob = data.find(s => s.label === 'Live Job')?.number || '1,75,324';
        const companies = data.find(s => s.label.includes('Compan'))?.number || '97,354';
        const newJobs = data.find(s => s.label.includes('New Job'))?.number || '7,532';

        setStats({ liveJobs: liveJob, companies, newJobs });
      } catch (err) {
        console.log('Dùng fallback stats');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (!formData.agreedToTerms) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register-employer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,

          // Company Info
          companyName: formData.companyName,
          taxNumber: formData.taxNumber,
          industry: formData.industry,
          companySize: formData.companySize,
          website: formData.website,
          nationality: formData.nationality,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      if (data.success) {
        setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');

        setTimeout(() => {
          navigate('/signin-employer');
        }, 2000);
      } else {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }

    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* PHẦN TRÁI - FORM ĐĂNG KÝ */}
      <div className="login-left">
        <div className="login-card">
          <div className="logo">
            <span className="it-blue">IT</span><span className="viec-black">viec</span>
          </div>

          <h1>Tạo tài khoản mới</h1>
          <p className="login-link">
            Đã có tài khoản? <a href="/signin-employer">Đăng nhập ngay</a>
          </p>

          {/* CHỌN LOẠI TÀI KHOẢN */}
          <div className="account-type-selector">
            <p className="selector-label">TẠO TÀI KHOẢN VỚI TƯ CÁCH</p>
            <div className="selector-buttons">
              <button
                type="button"
                className={`selector-btn ${!isEmployer ? 'active' : ''}`}
                onClick={() => {
                  setIsEmployer(false);
                  navigate('/signup'); // 👉 chuyển sang trang đăng ký ứng viên
                }}

              >
                <User size={20} strokeWidth={2} />
                Ứng viên
              </button>

              <button
                type="button"
                className={`selector-btn ${isEmployer ? 'active' : ''}`}
                onClick={() => setIsEmployer(true)}
              >
                <Building2 size={20} strokeWidth={2} />
                Nhà tuyển dụng
              </button>
            </div>
          </div>

          {/* FORM ĐĂNG KÝ */}
          <form onSubmit={handleSubmit} className="empreg-form">
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#FEE',
                border: '1px solid #FCC',
                borderRadius: '6px',
                color: '#C33',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '12px',
                backgroundColor: '#E8F5E9',
                border: '1px solid #A5D6A7',
                borderRadius: '6px',
                color: '#2E7D32',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {success}
              </div>
            )}

            {/* --- SECTION 1: PERSON INFO --- */}
            <h3 className="empreg-section-title">Thông tin người đại diện</h3>

            <div className="empreg-row">
              <input
                type="text"
                name="fullName"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleInputChange}
                className="empreg-input"
                required
              />
              <input
                type="text"
                name="positionTitle"
                placeholder="Chức vụ (VD: HR Manager)"
                value={formData.positionTitle}
                onChange={handleInputChange}
                className="empreg-input"
                required
              />
            </div>

            <div className="empreg-row">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="empreg-input"
                required
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Số điện thoại"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="empreg-input"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="empreg-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                className="empreg-input full-width"
                required
              />
              <button
                type="button"
                className="empreg-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="empreg-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="empreg-input full-width"
                required
              />
              <button
                type="button"
                className="empreg-toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* --- SECTION 2: COMPANY INFO --- */}
            <h3 className="empreg-section-title">Thông tin công ty</h3>

            <div className="empreg-row">
              <input
                type="text"
                name="companyName"
                placeholder="Tên công ty"
                value={formData.companyName}
                onChange={handleInputChange}
                className="empreg-input"
                required
              />
              <input
                type="text"
                name="taxNumber"
                placeholder="Mã số thuế"
                value={formData.taxNumber}
                onChange={handleInputChange}
                className="empreg-input"
                required
              />
            </div>

            <div className="empreg-row">
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="empreg-input"
                required
              >
                <option value="">Lĩnh vực</option>
                <option value="IT">Công nghệ thông tin</option>
                <option value="Finance">Tài chính</option>
                <option value="Education">Giáo dục</option>
                <option value="Manufacturing">Sản xuất</option>
                <option value="Other">Khác</option>
              </select>

              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                className="empreg-input"
                required
              >
                <option value="">Quy mô công ty</option>
                <option value="1-10">1–10 nhân sự</option>
                <option value="11-50">11–50 nhân sự</option>
                <option value="51-200">51–200 nhân sự</option>
                <option value="200+">200+ nhân sự</option>
              </select>
            </div>

            <div className="empreg-row">
              <input
                type="url"
                name="website"
                placeholder="Website công ty"
                value={formData.website}
                onChange={handleInputChange}
                className="empreg-input"
                required
              />
              <input
                type="text"
                name="nationality"
                placeholder="Quốc gia (VD: Vietnam)"
                value={formData.nationality}
                onChange={handleInputChange}
                className="empreg-input"
                required
              />
            </div>

            {/* LOGO */}
            <div className="empreg-file-upload">
              <label>Logo công ty</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleInputChange}
                className="empreg-file"
                required
              />
            </div>

            <textarea
              name="description"
              placeholder="Mô tả về công ty"
              value={formData.description}
              onChange={handleInputChange}
              className="empreg-textarea"
              rows={4}
              required
            />

            {/* TERMS */}
            <label className="empreg-checkbox">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
                required
              />
              <span>
                Tôi đồng ý với <a href="#terms">Điều khoản dịch vụ</a>
              </span>
            </label>

            <button type="submit" className="empreg-submit">
              Tạo tài khoản nhà tuyển dụng
            </button>
          </form>


          <div className="divider"><span>HOẶC</span></div>

          <div className="social-buttons">
            <button type="button" className="social-btn facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Đăng ký bằng Facebook
            </button>
            <button type="button" className="social-btn google">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Đăng ký bằng Google
            </button>
          </div>
        </div>
      </div>

      {/* PHẦN PHẢI - THỐNG KÊ */}
      <div className="login-right">
        <div className="login-stats-overlay">
          <h2>
            Hơn {loadingStats ? '1,75,324' : stats.liveJobs} ứng viên<br />
            đang chờ nhà tuyển dụng tốt.
          </h2>

          <div className="login-stats-grid">
            <div className="login-stat-card">
              <div className="login-stat-icon">
                <Briefcase size={28} strokeWidth={2} />
              </div>
              <div className="login-stat-number">{loadingStats ? '1,75,324' : stats.liveJobs}</div>
              <div className="login-stat-label">Việc làm đang mở</div>
            </div>

            <div className="login-stat-card">
              <div className="login-stat-icon">
                <Building2 size={28} strokeWidth={2} />
              </div>
              <div className="login-stat-number">{loadingStats ? '97,354' : stats.companies}</div>
              <div className="login-stat-label">Công ty đăng tuyển</div>
            </div>

            <div className="login-stat-card">
              <div className="login-stat-icon">
                <FileText size={28} strokeWidth={2} />
              </div>
              <div className="login-stat-number">{loadingStats ? '7,532' : stats.newJobs}</div>
              <div className="login-stat-label">Tin tuyển dụng mới</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterEmployer;