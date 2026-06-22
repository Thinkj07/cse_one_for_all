import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  Users,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Rocket,
  Eye,
  Ban,
  Briefcase
} from 'lucide-react';
import EmployerLayout from '../components/EmployerLayout';
import { 
  getEmployerStats, 
  getEmployerJobs,
  updateJobStatus 
} from '../services/employerService';
import '../styles/EmployerDashboard.css';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [showJobActions, setShowJobActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employerId, setEmployerId] = useState(null);
  const [employerName, setEmployerName] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);

  const [stats, setStats] = useState({
    NumberOfOpenedJob: 0,
    totalFollowers: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    console.log('🔐 Token:', !!token);
    console.log('👤 User string:', userStr);
    
    if (!token || !userStr) {
      console.warn('⚠️ No token or user, redirecting to login');
      navigate('/signin-employer');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('📋 Parsed user:', user);
      
      // Lấy employerId từ nhiều nguồn có thể
      const id = user.employerId || user.EmployerID || user.id || user.ID;
      const name = user.fullName || user.companyName || user.name || user.username || 'Nhà tuyển dụng';
      
      console.log('✅ EmployerId:', id);
      console.log('✅ EmployerName:', name);
      
      if (!id) {
        console.error('❌ No employerId found in user data');
        setError('Không tìm thấy thông tin nhà tuyển dụng');
        setLoading(false);
        return;
      }
      
      setEmployerId(id);
      setEmployerName(name);
      fetchDashboardData(id);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      navigate('/signin-employer');
    }
  }, []);

  const fetchDashboardData = async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching dashboard data for employerId:', id);

      const [statsData, jobsData] = await Promise.all([
        getEmployerStats(id),
        getEmployerJobs(id, { limit: 1000, status: 'all' }) // Limit rất lớn để lấy tất cả
      ]);

      console.log('📊 Stats data:', statsData);
      console.log('📦 Jobs data:', jobsData);

      // Handle both response formats: direct data or { success, data }
      const statsResult = statsData?.data || statsData;
      setStats({
        NumberOfOpenedJob: statsResult?.NumberOfOpenedJob || statsResult?.openJobs || 0,
        totalFollowers: statsResult?.totalFollowers || statsResult?.savedCandidates || 0
      });

      const jobs = jobsData?.data?.jobs || jobsData?.jobs || [];
      console.log('✅ Total jobs fetched:', jobs.length);
      
      const transformedJobs = jobs.map((job) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expireDate = job.ExpireDate ? new Date(job.ExpireDate) : null;
        const daysRemaining = expireDate
          ? Math.max(0, Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24)))
          : 0;
        const status = job.JobStatus || 'Active';
        return {
          JobID: job.JobID,
          JobName: job.JobName,
          JobType: job.JobType,
          ContractType: job.ContractType,
          daysRemaining,
          JobStatus: status,
          NumberOfApplicant: job.NumberOfApplicant || 0,
          ExpireDate: expireDate ? expireDate.toLocaleDateString('vi-VN') : 'N/A',
          PostDate: job.PostDate,
          Location: job.Location,
          SalaryFrom: job.SalaryFrom,
          SalaryTo: job.SalaryTo,
        };
      });
      
      console.log('✅ Transformed jobs:', transformedJobs);
      
      // Tính số tin đang tuyển = tin chưa hết hạn và trạng thái Open/Active
      const activeJobs = transformedJobs.filter(job => {
        const isNotExpired = job.daysRemaining > 0;
        const isOpen = job.JobStatus === 'Open' || job.JobStatus === 'Active';
        return isNotExpired && isOpen;
      });
      
      console.log('✅ Active jobs count:', activeJobs.length);
      
      // Cập nhật stats với số tin thực tế đang tuyển
      setStats({
        NumberOfOpenedJob: activeJobs.length,
        totalFollowers: statsResult?.totalFollowers || statsResult?.savedCandidates || 0
      });
      
      setRecentJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setRecentJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Uncomment when API is ready
  // Fetch dashboard data on component mount
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       // Fetch stats and jobs in parallel
  //       const [statsData, jobsData] = await Promise.all([
  //         getEmployerStats(employerId),
  //         getEmployerJobs(employerId, { limit: 5 })
  //       ]);

  //       // Update stats
  //       setStats({
  //         openJobs: statsData.openJobs || statsData.NumberOfOpenedJob || 0,
  //         savedCandidates: statsData.savedCandidates || statsData.totalFollowers || 0
  //       });

  //       // Transform jobs data to match UI format
  //       const transformedJobs = jobsData.jobs?.map(job => {
  //         const today = new Date();
  //         const expireDate = new Date(job.ExpireDate);
  //         const postDate = new Date(job.PostDate);
  //         const daysRemaining = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
  //         const isExpired = job.JobStatus === 'Expired' || daysRemaining < 0;

  //         return {
  //           id: job.JobID,
  //           title: job.JobName,
  //           type: job.JobType,
  //           contractType: job.ContractType,
  //           daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
  //           status: isExpired ? 'Expire' : 'Active',
  //           applications: job.NumberOfApplicant || 0,
  //           expired: isExpired ? expireDate.toLocaleDateString('vi-VN') : null,
  //           postDate: postDate.toLocaleDateString('vi-VN'),
  //           location: job.Location,
  //           salary: `${job.SalaryFrom?.toLocaleString()} - ${job.SalaryTo?.toLocaleString()} VNĐ`
  //         };
  //       }) || [];

  //       setRecentJobs(transformedJobs);
  //     } catch (err) {
  //       console.error('Error fetching dashboard data:', err);
  //       setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDashboardData();
  // }, [employerId]);

  const handleMarkAsExpired = async (jobId) => {
    if (!employerId) return;
    try {
      await updateJobStatus(jobId, 'Closed');
      await fetchDashboardData(employerId);
      setShowJobActions(null);
    } catch (err) {
      console.error('Error updating job status:', err);
      alert('Không thể cập nhật trạng thái tin tuyển dụng');
    }
  };

  const toggleJobActions = (jobId) => {
    setShowJobActions(showJobActions === jobId ? null : jobId);
  };

  return (
    <EmployerLayout>
      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            <div className="welcome-banner">
              <h1 className="welcome-banner-title">Xin chào, {employerName}</h1>
              <p className="welcome-banner-subtitle">Quản lý tin tuyển dụng và ứng viên của bạn</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <Briefcase size={28} />
              </div>
              <div className="stat-info">
                <h3>{stats.NumberOfOpenedJob}</h3>
                <p>Tin đang tuyển</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={28} />
              </div>
              <div className="stat-info">
                <h3>{stats.totalFollowers}</h3>
                <p>Ứng viên đã lưu</p>
              </div>
            </div>
          </div>

          {/* Recently Posted Jobs */}
          <div className="recent-jobs-section">
            <div className="section-header">
              <h2>Tin tuyển dụng đã đăng </h2>
              <Link to="/employer/my-jobs" className="view-all">
                Xem tất cả <ChevronRight size={16} />
              </Link>
            </div>

            <div className="jobs-table">
              <div className="table-header">
                <div className="col-job">TIN TUYỂN DỤNG</div>
                <div className="col-status">TRẠNG THÁI</div>
                <div className="col-applications">ỨNG TUYỂN</div>
                <div className="col-actions">HÀNH ĐỘNG</div>
              </div>

              {recentJobs.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px', 
                  color: '#999',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  margin: '20px 0'
                }}>
                  <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <h3 style={{ marginBottom: '8px', color: '#666' }}>Chưa có tin tuyển dụng</h3>
                  <p style={{ marginBottom: '20px' }}>Bạn chưa đăng tin tuyển dụng nào. Hãy bắt đầu đăng tin ngay!</p>
                  <Link 
                    to="/employer/post-job" 
                    style={{
                      display: 'inline-block',
                      padding: '10px 24px',
                      background: '#0A65CC',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontWeight: '500'
                    }}
                  >
                    Đăng tin tuyển dụng
                  </Link>
                </div>
              ) : (
                <>
                  {recentJobs.map((job) => (
                <div key={job.JobID} className={`table-row ${job.JobStatus === 'Closed' || job.JobStatus === 'Expired' ? 'expired' : ''}`}>
                  <div className="col-job">
                    <h4>{job.JobName}</h4>
                    <p className="job-meta">
                      {job.JobType} • {job.JobStatus === 'Đã đóng' ? job.ExpireDate : `${job.daysRemaining} ngày còn lại`}
                    </p>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${job.JobStatus === 'Active' || job.JobStatus === 'Open' ? 'active' : 'expired'}`}>
                      {job.JobStatus === 'Active' || job.JobStatus === 'Open' ? (
                        <><CheckCircle2 size={14} /> Đang hoạt động</>
                      ) : (
                        <><XCircle size={14} /> Hết hạn</>
                      )}
                    </span>
                  </div>
                  <div className="col-applications">
                    <span className="applications-count">
                      <Users size={16} /> {job.NumberOfApplicant} Ứng tuyển
                    </span>
                  </div>
                  <div className="col-actions">
                    <button 
                      className="view-applications-btn"
                      onClick={() => navigate(`/employer/watch-candidate/${job.JobID}`)}
                    >
                      Xem ứng tuyển
                    </button>
                    <div className="actions-menu">
                      <button 
                        className="more-btn"
                        onClick={() => toggleJobActions(job.JobID)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showJobActions === job.JobID && (
                        <div className="dropdown-menu">
                          <button className="dropdown-item">
                            <Rocket size={14} /> Quảng bá
                          </button>
                          <button className="dropdown-item">
                            <Eye size={14} /> Chi tiết
                          </button>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleMarkAsExpired(job.JobID)}
                          >
                            <Ban size={14} /> Hết hạn
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
                </>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </EmployerLayout>
    );
  };

export default EmployerDashboard;