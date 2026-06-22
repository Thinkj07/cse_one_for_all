import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobById } from '../services/jobService';
import { 
  DollarSign, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Clock, 
  BarChart3, 
  FileText, 
  GraduationCap 
} from 'lucide-react';
import '../styles/JobDetails.css';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job details from API
        const response = await fetchJobById(jobId);
        console.log('Job Response:', response); // Debug: xem cấu trúc dữ liệu
        
        // Extract job data from response
        const jobData = response.success ? response.data : response;
        console.log('Job Data:', jobData); // Debug: xem cấu trúc dữ liệu
        console.log('Company Data:', jobData.company); // Debug: xem thông tin company
        
        // Normalize data từ backend về format frontend
        const normalizedJob = {
          ...jobData,
          // Map camelCase từ backend sang PascalCase cho frontend
          SalaryFrom: jobData.salaryFrom || jobData.SalaryFrom,
          SalaryTo: jobData.salaryTo || jobData.SalaryTo,
          RequiredExpYear: jobData.RequireExpYear || jobData.RequiredExpYear,
          PostDate: jobData.postDate || jobData.PostDate,
          ExpireDate: jobData.expireDate || jobData.ExpireDate,
          // Company data normalization
          company: jobData.company ? {
            ...jobData.company,
            CName: jobData.company.CompanyName || jobData.company.CName,
            CNationality: jobData.company.Nationality || jobData.company.CNationality,
          } : null
        };
        
        setJob(normalizedJob);
        
      } catch (err) {
        console.error('Error loading job details:', err);
        setError(err.message || 'Không thể tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="job-details-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin công việc...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-details-container">
        <div className="error">
          <h3>Không thể tải thông tin công việc</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-container">
        <div className="not-found">
          <h3>Không tìm thấy công việc</h3>
          <p>Công việc này có thể đã bị xóa hoặc không tồn tại.</p>
          <button onClick={() => navigate('/find-job')} className="back-btn">
            Quay lại tìm việc
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
      
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  const isJobExpired = (expireDate) => {
    if (!expireDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expire = new Date(expireDate);
    expire.setHours(0, 0, 0, 0);
    return expire < today;
  };

  const getDaysUntilExpire = (expireDate) => {
    if (!expireDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expire = new Date(expireDate);
    expire.setHours(0, 0, 0, 0);
    const diffTime = expire - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format VND - Same as MyJob
  const formatVND = (amount) => {
    if (!amount) return '0';
    const millions = amount / 1000000;
    if (millions >= 1) {
      return `${millions.toFixed(0)} triệu`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
  };

  const formatSalary = (salaryFrom, salaryTo) => {
    if (!salaryFrom && !salaryTo) return 'Thương lượng';
    if (!salaryTo || salaryFrom === salaryTo) {
      return `${formatVND(salaryFrom)} VNĐ`;
    }
    return `${formatVND(salaryFrom)} - ${formatVND(salaryTo)} VNĐ`;
  };

  const getContractTypeLabel = (type) => {
    switch (type) {
      case 'Parttime': return 'Bán thời gian';
      case 'Internship': return 'Thực tập';
      case 'Contract': return 'Theo hợp đồng';
      case 'Freelance': return 'Tự do';
      case 'Permanent': return 'Dài hạn';
      default: return type;
    }
  };

  const getJobTypeLabel = (type) => {
    switch (type) {
      case 'Fulltime': return 'Toàn thời gian';
      case 'Parttime': return 'Bán thời gian';
      case 'Onsite': return 'Tại văn phòng';
      case 'Remote': return 'Từ xa';
      case 'Hybrid': return 'Kết hợp';
      case 'Full-time': return 'Toàn thời gian';
      case 'Part-time': return 'Bán thời gian';
      default: return type;
    }
  };

  const copyJobLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Đã sao chép link vào clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Đã sao chép link vào clipboard!');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Đã sao chép link vào clipboard!');
    }
  };

  return (
    <div className="job-details-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/')} className="breadcrumb-link">Trang chủ</span>
        <span className="breadcrumb-separator">/</span>
        <span onClick={() => navigate('/find-job')} className="breadcrumb-link">Tìm việc</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Chi tiết công việc</span>
      </div>

      {/* Job Header */}
      <div className="job-header">
        <div className="job-header-left">
          <div className="company-logo">
            <img 
              src={job.company?.Logo || 'https://via.placeholder.com/100'} 
              alt={job.company?.CName || 'Company Logo'} 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/100';
              }}
            />
          </div>
          <div className="job-header-info">
            <h1 className="job-title">{job.JobName || 'Tên công việc'}</h1>
            <p className="company-name">tại {job.company?.CompanyName || job.company?.CName || 'Công ty'}</p>
            <div className="job-badges">
              <span className={`badge badge-${job.ContractType?.toLowerCase() || 'default'}`}>
                {getContractTypeLabel(job.ContractType)}
              </span>
              {job.JobType && (
                <span className={`badge badge-${job.JobType?.toLowerCase()}`}>
                  {getJobTypeLabel(job.JobType)}
                </span>
              )}
              {isJobExpired(job.ExpireDate) && (
                <span className="badge badge-expired">
                  Đã hết hạn
                </span>
              )}
              {job.JobStatus === 'Close' && (
                <span className="badge badge-closed">
                  Đã đóng
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="job-header-right">
          <button className="btn-bookmark">
            <i className="icon-bookmark"></i>
          </button>
          <button 
            className={`btn-apply ${(isJobExpired(job.ExpireDate) || job.JobStatus === 'Close') ? 'disabled' : ''}`}
            onClick={() => {
              if (!isJobExpired(job.ExpireDate) && job.JobStatus !== 'Close') {
                // Kiểm tra đăng nhập trước khi ứng tuyển
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                  navigate('/signin');
                  return;
                }
                navigate(`/jobs/${jobId}/apply`);
              }
            }}
            disabled={isJobExpired(job.ExpireDate) || job.JobStatus === 'Close'}
          >
            {isJobExpired(job.ExpireDate) || job.JobStatus === 'Close' ? 'Không thể ứng tuyển' : 'Ứng tuyển ngay'}
            <i className="icon-arrow-right"></i>
          </button>
        </div>
      </div>

      {/* Job Main Content */}
      <div className="job-main-content">
        {/* Left Column - Job Description */}
        <div className="job-left-column">
          <section className="job-section">
            <h2 className="section-title">Mô tả công việc</h2>
            <div className="job-description">
              {job.JD || 'Chưa có mô tả công việc.'}
            </div>
          </section>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <section className="job-section">
              <h2 className="section-title">Kỹ năng yêu cầu</h2>
              <div className="skills-list">
                {job.requiredSkills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-name">
                      {skill.SkillName}
                    </div>
                    <div className="skill-description">{skill.Description}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Share this job */}
          <section className="job-section">
            <h2 className="section-title">Chia sẻ công việc:</h2>
            <div className="share-buttons">
              <button onClick={copyJobLink} className="share-btn share-copy">
                <i className="icon-link"></i> Sao chép liên kết
              </button>
              <button className="share-btn share-facebook">
                <i className="icon-facebook"></i>
              </button>
              <button className="share-btn share-twitter">
                <i className="icon-twitter"></i>
              </button>
              <button className="share-btn share-email">
                <i className="icon-email"></i>
              </button>
            </div>
          </section>
 
          {/* Job tags */}
          {job.categories && job.categories.length > 0 && (
            <section className="job-section">
              <h2 className="section-title">Tag:</h2>
              <div className="job-tags">
                {job.categories.map((category, index) => (
                  <span key={index} className="tag">{category.JCName}</span>
                ))}
              </div>
            </section>
          )}

          {/* Company Information */}
          {job.company && (
            <section className="job-section">
              <h2 className="section-title">Thông tin công ty</h2>
              <div className="company-info">
              <div className="company-detail">
                <strong>Tên công ty:</strong>
                <div className="company-detail-value">{job.company.CompanyName || job.company.CName || 'Chưa cập nhật'}</div>
              </div>
                {job.company.Industry && (
                  <div className="company-detail">
                    <strong>Ngành nghề:</strong>
                    <div className="company-detail-value">{job.company.Industry}</div>
                  </div>
                )}
                {job.company.CompanySize && (
                  <div className="company-detail">
                    <strong>Quy mô:</strong>
                    <div className="company-detail-value">{job.company.CompanySize} nhân viên</div>
                  </div>
                )}
                {job.company.CNationality && (
                  <div className="company-detail">
                    <strong>Quốc tịch:</strong>
                    <div className="company-detail-value">{job.company.CNationality}</div>
                  </div>
                )}
                {job.company.Website && (
                  <div className="company-detail">
                    <strong>Website:</strong>
                    <div className="company-detail-value">
                      <a 
                        href={job.company.Website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="company-website"
                      >
                        {job.company.Website}
                      </a>
                    </div>
                  </div>
                )}
                {job.company.Description && (
                  <div className="company-detail">
                    <strong>Mô tả:</strong>
                    <div className="company-detail-value">{job.company.Description}</div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Job Overview */}
        <div className="job-right-column">
          {/* Salary & Location */}
          <div className="job-info-cards">
            <div className="info-card">
              <div className="info-icon">
                <DollarSign size={24} />
              </div>
              <div className="info-content">
                <div className="info-label">Mức lương (VND)</div>
                <div className="info-value">{formatSalary(job.SalaryFrom, job.SalaryTo)}</div>
                <div className="info-sublabel">Lương theo tháng</div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <MapPin size={24} />
              </div>
              <div className="info-content">
                <div className="info-label">Địa điểm làm việc</div>
                <div className="info-value">{job.Location || 'Chưa xác định'}</div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
        <Briefcase size={24} />
      </div>
              <div className="info-content">
                <div className="info-label">Hình thức làm việc</div>
                <div className="info-value">{getJobTypeLabel(job.JobType) || getContractTypeLabel(job.ContractType) || 'Chưa xác định'}</div>
              </div>
            </div>
          </div>

          {/* Job Overview */}
          <section className="job-overview">
            <h2 className="section-title">Tổng quan công việc</h2>
            <div className="overview-items">
              <div className="overview-item">
                <div className="overview-icon">
          <Calendar size={20} />
        </div>
                <div className="overview-content">
                  <div className="overview-label">NGÀY ĐĂNG:</div>
                  <div className="overview-value">{formatDate(job.PostDate || job.postDate)}</div>
                </div>
              </div>
              <div className="overview-item">
                <div className="overview-icon">
          <Clock size={20} />
        </div>
                <div className="overview-content">
                  <div className="overview-label">HẠN NỘP:</div>
                  <div className="overview-value">
                    {formatDate(job.ExpireDate || job.expireDate)}
                    {(() => {
                      const daysLeft = getDaysUntilExpire(job.ExpireDate || job.expireDate);
                      if (daysLeft !== null) {
                        if (daysLeft < 0) {
                          return <span className="expired-text"> (Đã hết hạn)</span>;
                        } else if (daysLeft === 0) {
                          return <span className="urgent-text"> (Hết hạn hôm nay)</span>;
                        } else if (daysLeft <= 3) {
                          return <span className="urgent-text"> (Còn {daysLeft} ngày)</span>;
                        } else {
                          return <span className="normal-text"> (Còn {daysLeft} ngày)</span>;
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
              <div className="overview-item">
                <div className="overview-icon">
          <BarChart3 size={20} />
        </div>
                <div className="overview-content">
                  <div className="overview-label">CẤP BẬC:</div>
                  <div className="overview-value">{job.Level || 'Chưa xác định'}</div>
                </div>
              </div>
              <div className="overview-item">
                <div className="overview-icon">
          <FileText size={20} />
        </div>
                <div className="overview-content">
                  <div className="overview-label">KINH NGHIỆM:</div>
                  <div className="overview-value">{job.RequiredExpYear || job.RequireExpYear || 0} Năm</div>
                </div>
              </div>
              <div className="overview-item">
                <div className="overview-icon">
          <GraduationCap size={20} />
        </div>
                <div className="overview-content">
                  <div className="overview-label">SỐ LƯỢNG TUYỂN:</div>
                  <div className="overview-value">{job.Quantity || 1} người</div>
                </div>
              </div>
              <div className="overview-item">
                <div className="overview-icon">
          <BarChart3 size={20} />
        </div>
                <div className="overview-content">
                  <div className="overview-label">ỨNG VIÊN ĐÃ NỘP:</div>
                  <div className="overview-value">{job.NumberOfApplicant || 0} người</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
