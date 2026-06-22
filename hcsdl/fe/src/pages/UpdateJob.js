import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Loader } from 'lucide-react';
import { updateJob } from '../services/employerService';
import { fetchJobById } from '../services/jobService';
import EmployerLayout from '../components/EmployerLayout';
import '../styles/PostJob.css';

const UpdateJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    minSalary: '',
    maxSalary: '',
    contractType: '',
    experience: '',
    jobType: '',
    vacancies: '',
    expirationDate: '',
    jobLevel: '',
    city: '',
    jobDescription: '',
    categories: [],
    skills: []
  });

  // Predefined options - Dựa trên schema database
  const experienceLevels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  const jobTypes = [
    { value: 'Full-time', label: 'Toàn thời gian' },
    { value: 'On-site', label: 'Tại văn phòng' },
    { value: 'Hybrid', label: 'Kết hợp' },
    { value: 'Remote', label: 'Từ xa' }
  ];
  
  const jobLevels = [
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Middle', label: 'Middle' },
    { value: 'Senior', label: 'Senior' },
  ];
  
  const contractTypes = [
    { value: 'Permanent', label: 'Dài hạn' },
    { value: 'Contract', label: 'Hợp đồng' },
    { value: 'Freelance', label: 'Tự do' }
  ];

  const cities = [
    'Hà Nội',
    'TP.HCM',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Biên Hòa',
    'Nha Trang',
    'Huế',
    'Vũng Tàu',
    'Quy Nhơn',
    'Remote',
    'Khác'
  ];

  const jobCategories = [
    { value: 'Cyber Security', label: 'Cyber Security' },
    { value: 'Data & AI', label: 'Data & AI' },
    { value: 'Design', label: 'Design' },
    { value: 'Hardware/IoT', label: 'Hardware/IoT' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Software Dev', label: 'Software Dev' }
  ];

  const availableSkills = [
    { value: 'Java', label: 'Java' },
    { value: 'Python', label: 'Python' },
    { value: 'ReactJS', label: 'ReactJS' },
    { value: 'SQL', label: 'SQL' },
    { value: 'Teamwork', label: 'Teamwork' }
  ];

  // Load job data when component mounts
  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setLoadingJob(true);
      setError(null);
      
      console.log('Loading job data for ID:', jobId);
      
      const response = await fetchJobById(jobId);
      
      console.log('Job data response:', response);
      
      if (response.success && response.data) {
        const job = response.data;
        
        // Format date from YYYY-MM-DD to input format
        const expireDate = job.ExpireDate ? job.ExpireDate.split('T')[0] : '';
        
        // Extract category names from array of objects
        const categoryNames = job.categories 
          ? job.categories.map(cat => cat.JCName || cat) 
          : [];
        
        // Extract skill names from array of objects (backend returns 'requiredSkills')
        const skillNames = job.requiredSkills 
          ? job.requiredSkills.map(skill => skill.SkillName || skill)
          : [];
        
        setFormData({
          jobTitle: job.JobName || '',
          minSalary: job.SalaryFrom || job.salaryFrom || '',
          maxSalary: job.SalaryTo || job.salaryTo || '',
          contractType: job.ContractType || '',
          experience: job.RequiredExpYear?.toString() || job.RequireExpYear?.toString() || '',
          jobType: job.JobType || '',
          vacancies: job.Quantity || '',
          expirationDate: expireDate,
          jobLevel: job.Level || '',
          city: job.Location || '',
          jobDescription: job.JD || '',
          categories: categoryNames,
          skills: skillNames
        });
      } else {
        throw new Error(response.message || 'Không thể tải thông tin tin tuyển dụng');
      }
    } catch (error) {
      console.error('Error loading job data:', error);
      setError(error.message || 'Không thể tải thông tin tin tuyển dụng');
    } finally {
      setLoadingJob(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryValue) => {
    setFormData(prev => {
      const categories = prev.categories.includes(categoryValue)
        ? prev.categories.filter(c => c !== categoryValue)
        : [...prev.categories, categoryValue];
      return { ...prev, categories };
    });
  };

  const handleSkillChange = (skillValue) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skillValue)
        ? prev.skills.filter(s => s !== skillValue)
        : [...prev.skills, skillValue];
      return { ...prev, skills };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    
    // Validate độ dài theo schema
    if (formData.jobTitle.length > 20) {
      setError('Tên công việc không được quá 20 ký tự!');
      return;
    }
    
    if (formData.jobDescription.length > 500) {
      setError('Mô tả công việc không được quá 500 ký tự!');
      return;
    }
    
    if (formData.city.length > 30) {
      setError('Tên địa điểm không được quá 30 ký tự!');
      return;
    }
    
    // Validate lương
    const minSal = parseInt(formData.minSalary);
    const maxSal = parseInt(formData.maxSalary);
    
    if (minSal <= 0) {
      setError('Lương tối thiểu phải lớn hơn 0!');
      return;
    }
    
    if (maxSal <= minSal) {
      setError('Lương tối đa phải lớn hơn lương tối thiểu!');
      return;
    }
    
    // Validate ngày
    const today = new Date();
    const expireDate = new Date(formData.expirationDate);
    
    if (expireDate <= today) {
      setError('Ngày hết hạn phải sau ngày hôm nay!');
      return;
    }
    
    // Validate số lượng
    const quantity = parseInt(formData.vacancies);
    if (quantity < 1) {
      setError('Số lượng tuyển phải ít nhất là 1!');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get employerId from user data
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!userStr) {
        throw new Error('Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.');
      }
      
      const user = JSON.parse(userStr);
      const employerId = user.employerId || user.EmployerID || user.id || user.ID;
      
      if (!employerId) {
        throw new Error('Không tìm thấy thông tin nhà tuyển dụng. Vui lòng đăng nhập lại.');
      }
      
      // Transform data theo schema database
      const jobData = {
        JobName: formData.jobTitle,
        JD: formData.jobDescription,
        JobType: formData.jobType,
        ContractType: formData.contractType,
        Level: formData.jobLevel,
        Quantity: quantity,
        SalaryFrom: minSal,
        SalaryTo: maxSal,
        RequiredExpYear: parseInt(formData.experience),
        Location: formData.city,
        ExpireDate: formData.expirationDate,
        EmployerID: parseInt(employerId),
        categories: formData.categories,
        skills: formData.skills
      };
      
      console.log('=== [UpdateJob] UPDATING JOB ===');
      console.log('📦 Job data to send:', JSON.stringify(jobData, null, 2));
      console.log('🔑 JobID:', jobId);
      
      // Call backend API
      const response = await updateJob(jobId, jobData);
      
      if (response.success) {
        setShowSuccessModal(true);
        console.log('Job updated successfully');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi cập nhật tin!');
      }
      
    } catch (error) {
      console.error('Error updating job:', error);
      
      if (error.message.includes('Thiếu trường bắt buộc')) {
        setError('Vui lòng điền đầy đủ tất cả các trường bắt buộc!');
      } else if (error.message.includes('HTTP error')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
      } else {
        setError(error.message || 'Có lỗi xảy ra khi cập nhật tin. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/employer/my-jobs');
  };

  const handleViewJobs = () => {
    navigate('/employer/my-jobs');
  };

  if (loadingJob) {
    return (
      <EmployerLayout>
        <div className="post-job-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải thông tin tin tuyển dụng...</p>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="post-job-container">
        <div className="post-job-header">
          <h1>Chỉnh sửa tin tuyển dụng</h1>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <span>✓</span> {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>✕</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="post-job-form">
          {/* Job Title */}
          <div className="form-section">
            <div className="form-group">
              <label>Tên công việc *</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Ví dụ: Frontend Dev, UI/UX Designer (tối đa 20 ký tự)"
                required
                maxLength={20}
              />
              <p className="help-text">JobName tối đa 20 ký tự</p>
            </div>
          </div>

          {/* Categories */}
          <div className="form-section">
            <h3>Danh mục công việc</h3>
            <div className="checkbox-group">
              {jobCategories.map((category) => (
                <label key={category.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.value)}
                    onChange={() => handleCategoryChange(category.value)}
                  />
                  <span>{category.label}</span>
                </label>
              ))}
            </div>
            <p className="help-text">Chọn ít nhất 1 danh mục phù hợp với công việc</p>
          </div>

          {/* Salary */}
          <div className="form-section">
            <h3>Mức lương (VNĐ/tháng)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Lương tối thiểu *</label>
                <input
                  type="number"
                  name="minSalary"
                  value={formData.minSalary}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 10000000 (10 triệu)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Lương tối đa *</label>
                <input
                  type="number"
                  name="maxSalary"
                  value={formData.maxSalary}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 20000000 (20 triệu)"
                  required
                />
              </div>
            </div>
            <p className="help-text">Nhập mức lương bằng VNĐ/tháng (ví dụ: 15000000 cho 15 triệu).</p>
          </div>

          {/* Advanced Information */}
          <div className="form-section">
            <h3>Thông tin chi tiết</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Loại hợp đồng *</label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn loại hợp đồng --</option>
                  {contractTypes.map((type, index) => (
                    <option key={index} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Số năm kinh nghiệm *</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn kinh nghiệm --</option>
                  {experienceLevels.map((level, index) => (
                    <option key={index} value={level}>{level} năm</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hình thức làm việc *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn hình thức --</option>
                  {jobTypes.map((type, index) => (
                    <option key={index} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số lượng tuyển *</label>
                <input
                  type="number"
                  name="vacancies"
                  value={formData.vacancies}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 2"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày hết hạn *</label>
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cấp bậc *</label>
                <select
                  name="jobLevel"
                  value={formData.jobLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn cấp bậc --</option>
                  {jobLevels.map((level, index) => (
                    <option key={index} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h3>Địa điểm làm việc</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Địa điểm *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn địa điểm --</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </select>
                <p className="help-text">Tối đa 30 ký tự</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="form-section">
            <h3>Kỹ năng yêu cầu</h3>
            <div className="checkbox-group">
              {availableSkills.map((skill) => (
                <label key={skill.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill.value)}
                    onChange={() => handleSkillChange(skill.value)}
                  />
                  <span>{skill.label}</span>
                </label>
              ))}
            </div>
            <p className="help-text">Chọn các kỹ năng cần thiết cho vị trí này</p>
          </div>

          {/* Job Description */}
          <div className="form-section">
            <h3>Mô tả công việc *</h3>
            <div className="form-group">
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết về công việc, yêu cầu, quyền lợi... (tối đa 500 ký tự)"
                rows="10"
                required
                maxLength={500}
              />
              <p className="help-text">Job Description (Còn {500 - formData.jobDescription.length} ký tự)</p>
              <div className="editor-toolbar">
                <button type="button" title="Bold"><strong>B</strong></button>
                <button type="button" title="Italic"><em>I</em></button>
                <button type="button" title="Underline"><u>U</u></button>
                <button type="button" title="Link">🔗</button>
                <button type="button" title="Bullet List">•</button>
                <button type="button" title="Numbered List">1.</button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/employer/my-jobs')}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  Cập nhật tin →
                </>
              )}
            </button>
          </div>
        </form>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="success-modal-overlay" onClick={handleCloseModal}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>

              {/* Success Header */}
              <div className="modal-header">
                <div className="success-icon">✓</div>
                <h2>Cập nhật thành công!</h2>
                <p className="modal-subtitle">Tin tuyển dụng của bạn đã được cập nhật</p>
                <button className="view-jobs-btn" onClick={handleViewJobs}>
                  Xem tin đã đăng →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployerLayout>
  );
};

export default UpdateJob;
