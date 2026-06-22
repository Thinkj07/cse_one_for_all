// CandidateDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Bookmark, Bell, Settings, LogOut, ArrowRight, MapPin, DollarSign, Layers2 } from 'lucide-react';
import '../styles/CandidateDashboard.css';

// Fallback data
const FALLBACK_DATA = {
  user: {
    name: 'Nguyễn Văn A',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=0A65CC&color=fff&size=128'
  },
  stats: {
    appliedJobs: 0,
    favoriteJobs: 0,
    jobAlerts: 0
  },
  recentApplications: []
};

export default function CandidateDashboard() {
  const navigate = useNavigate();
  
  const [data, setData] = useState(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState('overview');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token || !userStr) {
      console.log('⚠️ Chưa đăng nhập, chuyển về trang đăng nhập');
      navigate('/signin');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    console.log('🚀 Bắt đầu fetch dashboard data...');

    try {
      // Lấy token và user info
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!token) {
        throw new Error('Không tìm thấy token');
      }

      const user = JSON.parse(userStr);
      const candidateId = user.candidateId || user.id;

      console.log('👤 User info:', { candidateId, email: user.email });

      // Gọi API GET /api/candidate/dashboard
      // Backend sẽ lấy candidateId từ token hoặc query params
      const response = await fetch(`${API_BASE_URL}/candidate/dashboard?candidateId=${candidateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error('Không thể tải dữ liệu dashboard');
      }
      
      const apiData = await response.json();
      console.log('📦 Dashboard data:', apiData);

      if (apiData.success && apiData.data) {
        // Map data từ API với fallback cho từng field
        const mappedData = {
          user: {
            name: apiData.data.user?.name || user.fullName || 'Người dùng',
            avatar: apiData.data.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apiData.data.user?.name || user.fullName || 'User')}&background=0A65CC&color=fff&size=128`
          },
          stats: {
            appliedJobs: apiData.data.stats?.appliedJobs || 0,
            favoriteJobs: apiData.data.stats?.favoriteJobs || 0,
            jobAlerts: apiData.data.stats?.jobAlerts || 0
          },
          recentApplications: Array.isArray(apiData.data.recentApplications) && apiData.data.recentApplications.length > 0
            ? apiData.data.recentApplications.map(app => ({
                id: app.jobId || app.id || Math.random(),
                title: app.title || 'Không có tiêu đề',
                type: app.type || 'Full Time',
                company: app.company || 'Công ty',
                logo: app.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.company || 'C')}&background=0A65CC&color=fff&size=80`,
                location: app.location || 'Chưa cập nhật',
                salary: app.salary || 'Thỏa thuận',
                dateApplied: app.appliedAt || 'N/A',
                status: app.status || 'active'
              }))
            : [] // Mảng rỗng nếu không có applications
        };  

        console.log('✅ Mapped data:', mappedData);
        setData(mappedData);
      } else {
        // Nếu response không có data, dùng fallback với thông tin user
        console.log('⚠️ API không trả data, dùng fallback với user info');
        setData({
          user: {
            name: user.fullName || 'Người dùng',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=0A65CC&color=fff&size=128`
          },
          stats: {
            appliedJobs: 0,
            favoriteJobs: 0,
            jobAlerts: 0
          },
          recentApplications: []
        });
      }

    } catch (error) {
      console.error('❌ Lỗi fetch dashboard:', error);
      setError(error.message);
      
      // Nếu lỗi token, chuyển về login
      if (error.message.includes('Token') || error.message.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        // Dùng fallback data
        setData(FALLBACK_DATA);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Kết thúc fetch dashboard');
    }
  };

  const handleViewDetails = (jobId) => {
    console.log('📄 Xem chi tiết job:', jobId);
    navigate(`/jobs/${jobId}`);
  };

  const handleEditProfile = () => {
    console.log('✏️ Chỉnh sửa profile');
    navigate('/candidate-dashboard/setting');
  };

  const handleLogout = () => {
    console.log('👋 Đăng xuất...');
    
    // Xóa token và user info
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Chuyển về trang đăng nhập
    navigate('/signin');
  };

  const getJobTypeClass = (type) => {
    const typeMap = {
      'Remote': 'remote',
      'Full Time': 'fulltime',
      'Temporary': 'temporary',
      'Contract Base': 'contract',
      'Part Time': 'parttime',
      'Internship': 'internship'
    };
    return typeMap[type] || 'fulltime';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'đang duyệt': { text: 'Đang duyệt', class: 'pending'},
      'pending': { text: 'Đang xét duyệt', class: 'pending'},
      'submitted': { text: 'Đang xét duyệt', class: 'pending' },
      'active': { text: 'Đang hoạt động', class: 'active', icon: '✓' },
      'approved': { text: 'Đã duyệt', class: 'active', icon: '✓' },
      'từ chối': { text: 'Từ chối', class: 'rejected', icon: '✕' },
      'rejected': { text: 'Từ chối', class: 'rejected', icon: '✕' },
      'cancelled': { text: 'Đã hủy', class: 'cancelled', icon: '⊘' },
      'expired': { text: 'Hết hạn', class: 'expired', icon: '!' }
    };
    return statusMap[status?.toLowerCase()] || { text: 'Đang xét duyệt', class: 'pending', icon: '⏳' };
  };

  if (loading) {
    return (
      <div className="candidate-dashboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard-container">
      {/* Sidebar */}
      <aside className="candidate-dashboard-sidebar">
        <div className="db-sidebar-header">
          <span className="db-sidebar-title">BẢNG ĐIỀU KHIỂN ỨNG VIÊN</span>
        </div>

        <nav className="db-sidebar-nav">
          <Link 
            to="/candidate-dashboard" 
            className={`db-nav-item ${activeMenu === 'overview' ? 'active' : ''}`}
          >
            <Layers2 size={20} />
            <span>Tổng quan</span>
          </Link>
          
          <Link 
            to="/candidate-dashboard/applied-jobs" 
            className={`db-nav-item ${activeMenu === 'applied' ? 'active' : ''}`}
          >
            <Briefcase size={20} />
            <span>Việc đã ứng tuyển</span>
          </Link>

          <Link 
            to="/candidate-dashboard/favourite-jobs" 
            className={`db-nav-item ${activeMenu === 'favourite' ? 'active' : ''}`}
          >
            <Bookmark size={20} />
            <span>Việc yêu thích</span>
          </Link>

          <Link 
            to="/candidate-dashboard/notifications" 
            className={`db-nav-item ${activeMenu === 'alerts' ? 'active' : ''}`}
          >
            <Bell size={20} />
            <span>Thông báo việc làm</span>
          </Link>

          <Link 
            to="/candidate-dashboard/setting" 
            className={`db-nav-item ${activeMenu === 'setting' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Cài đặt</span>
          </Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-candidate">
        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FEE',
            border: '1px solid #FCC',
            borderRadius: '6px',
            color: '#C33',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Welcome Section */}
        <div className="db-welcome-section">
          <h1 className="welcome-title">Xin chào, {data.user.name}</h1>
          <p className="welcome-subtitle">Đây là hoạt động hàng ngày và thông báo việc làm của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="db-stats-grid">
          <div className="db-stat-card blue">
            <div className="db-stat-content">
              <div>
                <div className="db-stat-number">{data.stats.appliedJobs}</div>
                <div className="db-stat-label">Việc đã ứng tuyển</div>
              </div>
              <div className="db-stat-icon blue">
                <Briefcase size={28} color="#0A65CC" />
              </div>
            </div>
          </div>

          <div className="db-stat-card yellow">
            <div className="db-stat-content">
              <div>
                <div className="db-stat-number">{data.stats.favoriteJobs}</div>
                <div className="db-stat-label">Việc yêu thích</div>
              </div>
              <div className="db-stat-icon blue">
                <Bookmark size={28} color="#0A65CC" />
              </div>
            </div>
          </div>

          <div className="db-stat-card green">
            <div className="db-stat-content">
              <div>
                <div className="db-stat-number">{data.stats.jobAlerts}</div>
                <div className="db-stat-label">Thông báo việc làm</div>
              </div>
              <div className="db-stat-icon blue">
                <Bell size={28} color="#0A65CC" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Alert */}
        <div className="profile-alert">
          <div className="profile-alert-content">
            <img 
              src={data.user.avatar} 
              alt="Avatar" 
              className="db-profile-avatar"
            />
            <div>
              <div className="profile-alert-title">Hồ sơ của bạn chưa hoàn tất.</div>
              <div className="profile-alert-text">Hoàn thành chỉnh sửa hồ sơ và xây dựng CV tùy chỉnh của bạn</div>
            </div>
          </div>
          <button className="db-edit-profile-btn" onClick={handleEditProfile}>
            Chỉnh sửa hồ sơ
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Recently Applied Section */}
        <div className="db-recent-section">
          <div className="db-section-header">
            <h2 className="db-section-title">Đã ứng tuyển gần đây</h2>
            <Link to="/candidate-dashboard/applied-jobs" className="db-view-all-btn">
              Xem tất cả
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Table Header */}
          <div className="candidate-table-header">
            <div>Công việc</div>
            <div>Trạng thái</div>
            <div>Hành động</div>
          </div>

          {/* Job List */}
          <div className="db-job-list">
            {data.recentApplications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999',
                fontSize: '16px'
              }}>
                Bạn chưa ứng tuyển công việc nào
              </div>
            ) : (
              data.recentApplications.map((job) => (
                <div key={job.id} className="db-job-card">
                  <div className="db-job-info">
                    <img src={job.logo} alt={job.company} className="db-company-logo" />
                    <div>
                      <div className="db-job-header">
                        <h3 className="db-job-title">{job.title}</h3>
                        <span className={`db-job-type ${getJobTypeClass(job.type)}`}>
                          {job.type}
                        </span>
                      </div>
                      <div className="db-job-meta">
                        <span className="db-meta-item">
                          <MapPin size={14} />
                          {job.location}
                        </span>
                        <span className="db-meta-item">
                          <DollarSign size={14} />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`db-job-status status-${getStatusDisplay(job.status).class}`}>
                    <span className="status-icon">{getStatusDisplay(job.status).icon}</span>
                    <span>{getStatusDisplay(job.status).text}</span>
                  </div>

                  <div className="db-job-actions">
                    <button 
                      className="details-btn"
                      onClick={() => handleViewDetails(job.id)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}