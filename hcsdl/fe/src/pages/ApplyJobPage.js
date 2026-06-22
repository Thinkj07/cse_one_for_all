import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ApplyJobPage.css';
import { 
  Building2, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Briefcase, 
  GraduationCap 
} from 'lucide-react';

const ApplyJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [uploadedCV, setUploadedCV] = useState(null);
  const [savedResumes, setSavedResumes] = useState([]);
  const [useTextEditor, setUseTextEditor] = useState(true);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Không thể tải thông tin công việc');
        }
        const result = await response.json();
        const data = result.data || result;
        setJobDetails(data);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setJobDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, API_BASE_URL]);

  // Fetch candidate's saved resumes
  useEffect(() => {
    const fetchSavedResumes = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!token || !userStr) return;
        const user = JSON.parse(userStr);
        const candidateId = user.candidateId || user.id;

        const response = await fetch(`${API_BASE_URL}/candidate/resumes?candidateId=${candidateId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Không thể tải CV đã lưu');
        }

        const data = await response.json();
        const resumes = data?.data || data || [];
        const normalized = Array.isArray(resumes)
          ? resumes.map((item, idx) => ({ id: item.id || idx + 1, name: item.name || item }))
          : [];
        setSavedResumes(normalized);
      } catch (error) {
        console.error('Error fetching saved resumes:', error);
        setSavedResumes([]);
      }
    };

    fetchSavedResumes();
  }, [API_BASE_URL]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (file.type === 'application/pdf' || file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Kích thước file không được vượt quá 5MB');
          return;
        }
        
        // Note: Backend will rename file to ensure length <= 50 chars
        // Format: cv_{candidateId}_{jobId}_{timestamp}.ext
        setUploadedCV(file);
        setSelectedResume(''); // Clear selected resume when uploading new file
      } else {
        alert('Vui lòng chỉ tải lên file PDF hoặc DOC/DOCX');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedResume && !uploadedCV) {
      alert('Vui lòng chọn hoặc tải lên CV của bạn');
      return;
    }

    // Lấy token & candidateId
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!token || !userStr) {
      alert('Vui lòng đăng nhập trước khi ứng tuyển');
      navigate('/signin');
      return;
    }
    const user = JSON.parse(userStr);
    const candidateId = user.candidateId || user.id;

    setLoading(true);

    try {
      const payload = {
        CandidateID: candidateId,
        CoverLetter: coverLetter || null,
        upLoadCV: uploadedCV ? uploadedCV.name : selectedResume,
      };

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể gửi đơn ứng tuyển');
      }

      alert('Ứng tuyển thành công!');
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(error.message || 'Có lỗi xảy ra khi ứng tuyển. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getContractTypeLabel = (type) => {
    switch (type) {
      case 'Fulltime': return 'Toàn thời gian';
      case 'Parttime': return 'Bán thời gian';
      case 'Contract': return 'Hợp đồng';
      case 'Internship': return 'Thực tập';
      default: return type;
    }
  };

  const getJobTypeLabel = (type) => {
    switch (type) {
      case 'Onsite': return 'Tại văn phòng';
      case 'Remote': return 'Từ xa';
      case 'Hybrid': return 'Kết hợp';
      default: return type;
    }
  };

  if (loading && !jobDetails) {
    return (
      <div className="apply-job-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="apply-job-container">
        <div className="error">Không tìm thấy thông tin công việc</div>
      </div>
    );
  }

  return (
    <div className="apply-job-container">
      {/* Header */}
      <div className="apply-header">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')} className="breadcrumb-link">Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span onClick={() => navigate('/find-job')} className="breadcrumb-link">Tìm việc</span>
          <span className="breadcrumb-separator">/</span>
          <span onClick={() => navigate(`/jobs/${jobId}`)} className="breadcrumb-link">Chi tiết công việc</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Ứng tuyển</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="apply-content">
        {/* Modal-like Card */}
        <div className="apply-modal">
          {/* Close Button */}
          <button className="close-btn" onClick={handleCancel}>×</button>
          
          {/* Modal Header */}
          <div className="modal-header">
            <h2>Ứng tuyển: {jobDetails.JobName}</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="apply-form">
            {/* Resume Selection */}
            <div className="form-section">
              <label className="form-label">Chọn CV</label>
              <div className="resume-selector">
                <select 
                  className="resume-dropdown"
                  value={selectedResume}
                  onChange={(e) => {
                    setSelectedResume(e.target.value);
                    setUploadedCV(null);
                  }}
                  disabled={uploadedCV !== null}
                >
                  <option value="">Chọn...</option>
                  {savedResumes.map((resume) => (
                    <option key={resume.id} value={resume.name}>
                      {resume.name}
                    </option>
                  ))}
                </select>
                <span className="dropdown-icon">▼</span>
              </div>
              
              {/* File Upload */}
              <div className="file-upload-section">
                <label className="upload-label">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <span className="upload-btn">
                    📎 Tải lên CV mới
                  </span>
                </label>
                {uploadedCV && (
                  <div className="uploaded-file-info">
                    <span>✓ {uploadedCV.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setUploadedCV(null)}
                      className="remove-file-btn"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div className="form-section">
              <label className="form-label">Thư giới thiệu (tối đa 50 ký tự)</label>
              <div className="cover-letter-editor">
                <textarea
                  className="cover-letter-textarea"
                  placeholder="Viết thư giới thiệu của bạn tại đây. Hãy cho nhà tuyển dụng biết bạn là ai..."
                  value={coverLetter}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setCoverLetter(e.target.value);
                    }
                  }}
                  maxLength={50}
                  rows={3}
                />
                <div className="character-count">
                  {coverLetter.length}/50 ký tự
                </div>
                
                {/* Text Formatting Toolbar */}
                <div className="editor-toolbar">
                  <button type="button" className="toolbar-btn" title="Bold">
                    <strong>B</strong>
                  </button>
                  <button type="button" className="toolbar-btn" title="Italic">
                    <em>I</em>
                  </button>
                  <button type="button" className="toolbar-btn" title="Underline">
                    <u>U</u>
                  </button>
                  <button type="button" className="toolbar-btn" title="Strikethrough">
                    <s>S</s>
                  </button>
                  <button type="button" className="toolbar-btn" title="Link">
                    🔗
                  </button>
                  <button type="button" className="toolbar-btn" title="Bullet List">
                    ☰
                  </button>
                  <button type="button" className="toolbar-btn" title="Numbered List">
                    ≡
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading || (!selectedResume && !uploadedCV)}
              >
                {loading ? 'Đang gửi...' : 'Ứng tuyển ngay'}
                {!loading && <span className="arrow-icon">→</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Job Info Sidebar */}
        <div className="job-info-sidebar">
          {/* Company Card */}
          <div className="company-card">
            <div className="company-logo">
              <img 
                src={jobDetails.company?.Logo || jobDetails.CompanyLogo} 
                alt={jobDetails.company?.CName || jobDetails.CompanyName} 
              />
            </div>
            <h3 className="company-name">
              {jobDetails.company?.CName || jobDetails.CompanyName}
            </h3>
            <p className="company-industry">
              {jobDetails.company?.Industry || 'Công nghệ thông tin'}
            </p>
            
            <div className="company-details">
              <div className="detail-row">
                <span className="detail-icon">
      <Building2 size={20} strokeWidth={2} />
    </span>
                <div className="detail-content">
                  <span className="detail-label">Loại tổ chức:</span>
                  <span className="detail-value">Private Company</span>
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-icon">
      <Users size={20} strokeWidth={2} />
    </span>
                <div className="detail-content">
                  <span className="detail-label">Quy mô công ty:</span>
                  <span className="detail-value">
                    {jobDetails.company?.CompanySize ? `${jobDetails.company.CompanySize}+ Nhân viên` : '120-300 Nhân viên'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Overview Card */}
          <div className="job-overview-card">
            <div className="overview-item">
              <span className="overview-icon">
      <Calendar size={18} strokeWidth={2} />
    </span>
              <div className="overview-content">
                <span className="overview-label">NGÀY ĐĂNG:</span>
                <span className="overview-value">{formatDate(jobDetails.PostDate)}</span>
              </div>
            </div>
            <div className="overview-item">
              <span className="overview-icon">
      <Clock size={18} strokeWidth={2} />
    </span>
              <div className="overview-content">
                <span className="overview-label">HẠN NỘP:</span>
                <span className="overview-value">
                  {jobDetails.ExpireDate ? formatDate(jobDetails.ExpireDate) : 'June 30, 2021'}
                </span>
              </div>
            </div>
            <div className="overview-item">
              <span className="overview-icon">
      <MapPin size={18} strokeWidth={2} />
    </span>
              <div className="overview-content">
                <span className="overview-label">ĐỊA ĐIỂM:</span>
                <span className="overview-value">{jobDetails.Location}</span>
              </div>
            </div>
            <div className="overview-item">
              <span className="overview-icon">
      <Briefcase size={18} strokeWidth={2} />
    </span>
              <div className="overview-content">
                <span className="overview-label">LOẠI CÔNG VIỆC:</span>
                <span className="overview-value">{getContractTypeLabel(jobDetails.ContractType)}</span>
              </div>
            </div>
            <div className="overview-item">
              <span className="overview-icon">
      <GraduationCap size={18} strokeWidth={2} />
    </span>
              <div className="overview-content">
                <span className="overview-label">HỌC VẤN</span>
                <span className="overview-value">Tốt nghiệp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobPage;
