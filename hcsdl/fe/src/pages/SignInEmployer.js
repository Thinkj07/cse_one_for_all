import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, Users, Briefcase, TrendingUp } from 'lucide-react';
import '../styles/SignInEmployer.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SignInEmployer = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalCandidates: '2,45,382',
    activeEmployers: '12,847',
    successfulHires: '45,293',
    avgTimeToHire: '14 days'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stats`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.log('Using fallback stats');
      }
    };
    fetchStats();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-employer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: 'employer',
          rememberMe
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      if (data.success && data.data) {
        const { token, user } = data.data;
        
        console.log('🔐 [SignInEmployer] Login response:', data);
        console.log('👤 [SignInEmployer] User object from backend:', user);
        console.log('📋 [SignInEmployer] User fields:', Object.keys(user));
        console.log('🔑 [SignInEmployer] user.employerId:', user.employerId);
        console.log('🔑 [SignInEmployer] user.id:', user.id);

        // Store token and user info
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('user', JSON.stringify(user));
        
        console.log('✅ [SignInEmployer] Saved to storage:', storage === localStorage ? 'localStorage' : 'sessionStorage');

        navigate('/employer-dashboard');
      } else {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employer-signin-wrapper">
      {/* LEFT - FORM */}
      <div className="employer-signin-left">
        <div className="employer-signin-card">
          {/* Logo */}
          <div className="employer-logo">
            <span style={{ color: '#0A65CC', fontWeight: 'bold', fontSize: '28px' }}>IT</span>
            <span style={{ color: '#18191C', fontWeight: 'bold', fontSize: '28px' }}>viec</span>
            <span style={{
              marginLeft: '12px',
              fontSize: '14px',
              color: '#767F8C',
              fontWeight: '500'
            }}>for Employers</span>
          </div>

          {/* Heading */}
          <h1>Đăng nhập nhà tuyển dụng</h1>
          <p className="employer-signin-subtitle">
            Truy cập bảng điều khiển của bạn để quản lý công việc và ứng viên
          </p>

          {/* Alert for candidates */}
          <div className="info-box">
            <span style={{ fontSize: '14px', color: '#5E6670' }}>
              Đang tìm việc làm? <a href="/signin" style={{ color: '#0A65CC', fontWeight: '500', textDecoration: 'none' }}>Đăng nhập với tư cách ứng viên</a>
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="employer-signin-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="/employer/forgot-password" className="forgot-link">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>Hoặc</span>
          </div>

          {/* Social Login */}
          <div className="social-buttons">
            <button className="social-btn google">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.8 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.5c-.2 1.2-1 2.2-2 2.9v2.5h3.2c1.9-1.7 3-4.3 3-7.2z" fill="#4285F4" />
                <path d="M10 20c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.2H1.1v2.6C2.8 17.7 6.1 20 10 20z" fill="#34A853" />
                <path d="M4.4 11.8c-.4-1.2-.4-2.4 0-3.6V5.6H1.1c-1.3 2.6-1.3 5.6 0 8.2l3.3-2z" fill="#FBBC04" />
                <path d="M10 3.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C15 .9 12.7 0 10 0 6.1 0 2.8 2.3 1.1 5.6l3.3 2.6C5.2 5.7 7.4 3.9 10 3.9z" fill="#EA4335" />
              </svg>
              Tiếp tục với Google
            </button>
            <button className="social-btn linkedin">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18.5 0h-17C.7 0 0 .7 0 1.5v17c0 .8.7 1.5 1.5 1.5h17c.8 0 1.5-.7 1.5-1.5v-17C20 .7 19.3 0 18.5 0zM6 17H3V8h3v9zM4.5 6.3c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zM17 17h-3v-4.4c0-1.1 0-2.5-1.5-2.5s-1.7 1.2-1.7 2.4V17H8V8h2.8v1.2h.1c.4-.8 1.4-1.5 2.8-1.5 3 0 3.6 2 3.6 4.5V17z" fill="#0A66C2" />
              </svg>
              Tiếp tục với LinkedIn
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="signup-prompt">
            Chưa có tài khoản nhà tuyển dụng?
            <a href="/register-employer"> Tạo tài khoản ngay</a>
          </div>
        </div>
      </div>

      {/* RIGHT - BENEFITS & STATS */}
      <div className="employer-signin-right">
        <div className="employer-benefits-content">
          <h2>
            Tìm kiếm ứng viên hoàn hảo<br />
            cho đội ngũ của bạn
          </h2>

          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-icon">
                <Users size={24} />
              </div>
              <div className="benefit-text">
                <h3>Tiếp cận nhân tài hàng đầu</h3>
                <p>Kết nối với {stats.totalCandidates} ứng viên có năng lực</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <Briefcase size={24} />
              </div>
              <div className="benefit-text">
                <h3>Quản lý công việc dễ dàng</h3>
                <p>Đăng, chỉnh sửa và quản lý tất cả tin tuyển dụng ở một nơi</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <TrendingUp size={24} />
              </div>
              <div className="benefit-text">
                <h3>Quy trình tuyển dụng nhanh hơn</h3>
                <p>Thời gian tuyển dụng trung bình: {stats.avgTimeToHire}</p>
              </div>
            </div>
          </div>

          <div className="employer-stats-grid">
            <div className="employer-stat-card">
              <div className="stat-number">{stats.totalCandidates}</div>
              <div className="stat-label">Ứng viên đang hoạt động</div>
            </div>
            <div className="employer-stat-card">
              <div className="stat-number">{stats.activeEmployers}</div>
              <div className="stat-label">Nhà tuyển dụng đang hoạt động</div>
            </div>
            <div className="employer-stat-card">
              <div className="stat-number">{stats.successfulHires}</div>
              <div className="stat-label">Tuyển dụng thành công</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInEmployer;