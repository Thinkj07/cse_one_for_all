import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Bookmark, Bell, Settings, LogOut, ArrowRight, MapPin, DollarSign, CheckCircle, Layers2 } from 'lucide-react';
import '../styles/CandidateDashboard.css';
import '../styles/AppliedJob.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AppliedJobs() {
  const navigate = useNavigate();
  
  const [activeMenu] = useState('applied');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalApplications: 0
  });

  useEffect(() => {
    // Kiểm tra authentication
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.log('⚠️ Chưa đăng nhập, chuyển về trang đăng nhập');
      navigate('/signin');
      return;
    }

    fetchApplications();
  }, [pagination.currentPage]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    
    console.log('🚀 Fetching applications, page:', pagination.currentPage);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!token || !userStr) {
        throw new Error('Không tìm thấy token hoặc user info');
      }

      const user = JSON.parse(userStr);
      const candidateId = user.candidateId || user.id;

      console.log('👤 Candidate ID:', candidateId);

      // GET /api/candidate/applications?page=X&limit=X
      const response = await fetch(
        `${API_BASE_URL}/candidate/applications?candidateId=${candidateId}&page=${pagination.currentPage}&limit=${pagination.limit}`,
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
        throw new Error('Không thể tải danh sách ứng tuyển');
      }

      const data = await response.json();
      console.log('📦 Applications data:', data);

      if (data.success && data.data) {
        // Map applications từ API
        const mappedApplications = (data.data.applications || []).map(app => ({
          id: app.JobID || app.id,
          title: app.title || app.JobName || 'Không có tiêu đề',
          type: app.jobType || app.JobType || 'Full Time',
          company: app.companyName || app.company || 'Công ty',
          logo: app.companyLogo || app.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.companyName || 'C')}&background=0A65CC&color=fff&size=80`,
          location: app.location || app.Location || 'Chưa cập nhật',
          salary: app.salary || formatSalary(app.SalaryFrom, app.SalaryTo) || 'Thỏa thuận',
          dateApplied: app.appliedDate ? formatDate(app.appliedDate) : 'N/A',
          status: app.Status_apply || app.status || 'Đang duyệt'
        }));

        console.log('✅ Mapped applications:', mappedApplications);
        setApplications(mappedApplications);

        // Update pagination
        if (data.data.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: data.data.pagination.totalPages || 1,
            totalApplications: data.data.pagination.total || mappedApplications.length
          }));
        }
      } else {
        // Không có applications
        console.log('⚠️ Không có applications');
        setApplications([]);
      }

    } catch (err) {
      console.error('❌ Lỗi fetch applications:', err);
      setError(err.message);

      // Nếu lỗi token, logout
      if (err.message.includes('Token') || err.message.includes('401')) {
        console.log('🔒 Token không hợp lệ, đăng xuất...');
        handleLogout();
      } else {
        setApplications([]);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Kết thúc fetch applications');
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (jobId) => {
    console.log('📄 View job details:', jobId);
    navigate(`/jobs/${jobId}`);
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

  const getStatusClass = (status) => {
    const statusMap = {
      'Đang duyệt': 'pending',
      'Pending': 'pending',
      'Duyệt': 'approved',
      'Approved': 'approved',
      'Từ chối': 'rejected',
      'Rejected': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  const getStatusText = (status) => {
    const statusText = {
      'Đang duyệt': 'Đang xét duyệt',
      'Pending': 'Đang xét duyệt',
      'Duyệt': 'Đã duyệt',
      'Approved': 'Đã duyệt',
      'Từ chối': 'Từ chối',
      'Rejected': 'Từ chối'
    };
    return statusText[status] || status;
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
          Đang tải danh sách ứng tuyển...
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

        <div className="db-recent-section">
          <div className="db-section-header">
            <h2 className="db-section-title">
              Việc đã ứng tuyển ({pagination.totalApplications})
            </h2>
          </div>

          {/* Table Header */}
          <div className="candidate-table-header">
            <div>Công việc</div>
            <div>Trạng thái</div>
            <div>Hành động</div>
          </div>

          {/* Job List */}
          <div className="db-job-list">
            {applications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999'
              }}>
                <Briefcase size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                <h3 style={{ marginBottom: '10px' }}>Chưa có đơn ứng tuyển</h3>
                <p>Bạn chưa ứng tuyển công việc nào. Hãy bắt đầu tìm việc ngay!</p>
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
              applications.map((job) => (
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

                  <div className={`db-job-status status-${getStatusClass(job.status)}`}>
                    <CheckCircle size={16} />
                    <span>{getStatusText(job.status)}</span>
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

          {/* Pagination */}
          {applications.length > 0 && pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                ←
              </button>

              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Chỉ hiển thị 5 pages xung quanh current page
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= pagination.currentPage - 2 && pageNum <= pagination.currentPage + 2)
                ) {
                  return (
                    <button 
                      key={pageNum}
                      className={`page-btn ${pagination.currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum < 10 ? `0${pageNum}` : pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.currentPage - 3 ||
                  pageNum === pagination.currentPage + 3
                ) {
                  return <span key={pageNum} className="page-dots">...</span>;
                }
                return null;
              })}

              <button 
                className="page-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}