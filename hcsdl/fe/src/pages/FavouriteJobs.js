import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Bookmark, Bell, Settings, Layers2, LogOut, MapPin, DollarSign, Clock, ArrowRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import '../styles/FavouriteJobs.css';
import '../styles/CandidateDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function FavouriteJobs() {
  const navigate = useNavigate();
  
  const [activeMenu] = useState('favourite');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12,
    totalPages: 1,
    totalJobs: 0
  });

  useEffect(() => {
    // Kiểm tra authentication
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.log('⚠️ Chưa đăng nhập, chuyển về trang đăng nhập');
      navigate('/signin');
      return;
    }

    fetchFavoriteJobs();
  }, [pagination.currentPage]);

  const fetchFavoriteJobs = async () => {
    setLoading(true);
    setError('');
    
    console.log('🚀 Fetching favorite jobs, page:', pagination.currentPage);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!token || !userStr) {
        throw new Error('Không tìm thấy token hoặc user info');
      }

      const user = JSON.parse(userStr);
      const candidateId = user.candidateId || user.id;

      console.log('👤 Candidate ID:', candidateId);

      // GET /api/candidate/favorites
      const response = await fetch(
        `${API_BASE_URL}/candidate/favorites?candidateId=${candidateId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error('Không thể tải danh sách yêu thích');
      }

      const data = await response.json();
      console.log('📦 Favorites data:', data);

      if (data.success && data.data) {
        // Map favorite jobs từ API
        const mappedJobs = (data.data.jobs || data.data || []).map(job => ({
          id: job.JobID || job.id,
          title: job.JobName || job.title || 'Không có tiêu đề',
          type: job.JobType || job.type || 'Full Time',
          company: job.companyName || job.company || 'Công ty',
          logo: job.companyLogo || job.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName || 'C')}&background=0A65CC&color=fff&size=80`,
          location: job.Location || job.location || 'Chưa cập nhật',
          salary: job.salary || formatSalary(job.SalaryFrom, job.SalaryTo) || 'Thỏa thuận',
          status: checkJobStatus(job.ExpireDate || job.expireDate),
          daysRemaining: calculateDaysRemaining(job.ExpireDate || job.expireDate),
          bookmarked: true,
          favoriteDate: job.Date || job.favoriteDate
        }));

        console.log('✅ Mapped favorite jobs:', mappedJobs);
        setFavoriteJobs(mappedJobs);

        // Update pagination if provided
        setPagination(prev => ({
          ...prev,
          totalJobs: data.data.total || mappedJobs.length
        }));
      } else {
        console.log('⚠️ Không có favorite jobs');
        setFavoriteJobs([]);
      }

    } catch (err) {
      console.error('❌ Lỗi fetch favorites:', err);
      setError(err.message);

      // Nếu lỗi token, logout
      if (err.message.includes('Token') || err.message.includes('401')) {
        console.log('🔒 Token không hợp lệ, đăng xuất...');
        handleLogout();
      } else {
        setFavoriteJobs([]);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Kết thúc fetch favorites');
    }
  };

  const checkJobStatus = (expireDate) => {
    if (!expireDate) return 'remaining';
    const expire = new Date(expireDate);
    const today = new Date();
    return expire < today ? 'expired' : 'remaining';
  };

  const calculateDaysRemaining = (expireDate) => {
    if (!expireDate) return 0;
    const expire = new Date(expireDate);
    const today = new Date();
    const diffTime = expire - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatSalary = (from, to) => {
    if (!from && !to) return 'Thỏa thuận';
    if (from && to) return `${formatNumber(from)}-${formatNumber(to)} VNĐ`;
    if (from) return `Từ ${formatNumber(from)} VNĐ`;
    return 'Thỏa thuận';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleToggleBookmark = async (jobId) => {
    console.log('💔 Bỏ yêu thích job:', jobId);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // DELETE /api/jobs/:jobId/favorite
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove job from list
        setFavoriteJobs(prev => prev.filter(job => job.id !== jobId));
        setPagination(prev => ({
          ...prev,
          totalJobs: prev.totalJobs - 1
        }));
        console.log('✅ Đã bỏ yêu thích');
      }
    } catch (err) {
      console.error('❌ Lỗi bỏ yêu thích:', err);
      alert('Không thể bỏ yêu thích. Vui lòng thử lại.');
    }
  };

  const handleApplyNow = (jobId) => {
    console.log('📝 Ứng tuyển job:', jobId);
    navigate(`/jobs/${jobId}/apply`);
  };

  const handleViewDetails = (jobId) => {
    console.log('📄 Xem chi tiết job:', jobId);
    navigate(`/jobs/${jobId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    console.log('👋 Đăng xuất...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/signin');
  };

  const getJobTypeClass = (type) => {
    const typeMap = {
      'Remote': 'remote',
      'Full Time': 'fulltime',
      'Part Time': 'parttime',
      'Temporary': 'temporary',
      'Contract Base': 'contract',
      'Internship': 'internship'
    };
    return typeMap[type] || 'fulltime';
  };

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    
    // Smart pagination: show 5 pages around current
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(i);
      } else if (
        i === currentPage - 3 ||
        i === currentPage + 3
      ) {
        pages.push('...');
      }
    }

    return (
      <div className="pagination">
        <button
          className="pagination-arrow"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`dots-${index}`} className="pagination-dots">...</span>
          ) : (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page < 10 ? `0${page}` : page}
            </button>
          )
        ))}

        <button
          className="pagination-arrow"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="favorite-jobs-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Đang tải danh sách yêu thích...
        </div>
      </div>
    );
  }

  return (
    <div className="favorite-jobs-container">
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
      <main className="favorite-jobs-main">
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

        {/* Page Header */}
        <div className="f-page-header">
          <h1 className="f-page-title">
            Việc yêu thích <span className="f-page-title-count">({pagination.totalJobs})</span>
          </h1>
        </div>

        {/* Favorite Jobs Grid */}
        {favoriteJobs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#999'
          }}>
            <Bookmark size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
            <h3 style={{ marginBottom: '10px', color: '#666' }}>Chưa có công việc yêu thích</h3>
            <p>Hãy tìm và lưu những công việc bạn quan tâm!</p>
            <Link to="/find-job" style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 24px',
              background: '#0A65CC',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px'
            }}>
              Tìm việc làm
            </Link>
          </div>
        ) : (
          <>
            <div className="favorite-jobs-grid">
              {favoriteJobs.map((job) => (
                <div key={job.id} className="favorite-job-card">
                  {/* Card Header */}
                  <div className="f-job-card-header">
                    <div className="f-company-info">
                      <img src={job.logo} alt={job.company} className="f-company-logo" />
                      <div className="f-company-details">
                        <h3 onClick={() => handleViewDetails(job.id)} style={{ cursor: 'pointer' }}>
                          {job.title}
                        </h3>
                        <span className={`f-job-type-badge ${getJobTypeClass(job.type)}`}>
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <button
                      className={`f-bookmark-btn ${job.bookmarked ? 'bookmarked' : ''}`}
                      onClick={() => handleToggleBookmark(job.id)}
                      title="Bỏ yêu thích"
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>

                  {/* Job Meta */}
                  <div className="f-job-card-meta">
                    <div className="f-job-meta-row">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                    <div className="f-job-meta-row">
                      <DollarSign size={16} />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  {/* Job Status & Action */}
                  <div className="f-job-status-row">
                    {job.status === 'expired' ? (
                      <>
                        <div className="f-job-status expired">
                          <Calendar size={16} />
                          <span className="f-job-status-text">Hết hạn</span>
                        </div>
                        <button className="deadline-expired-btn" disabled>
                          Hết hạn ứng tuyển
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="f-job-status remaining">
                          <Clock size={16} />
                          <span className="f-job-status-text">{job.daysRemaining} ngày còn lại</span>
                        </div>
                        <button
                          className="apply-now-btn"
                          onClick={() => handleApplyNow(job.id)}
                        >
                          Ứng tuyển ngay
                          <ArrowRight size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && renderPagination()}
          </>
        )}
      </main>
    </div>
  );
}