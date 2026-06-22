import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Bookmark, 
  Briefcase 
} from 'lucide-react';
import '../styles/FindJobPage.css';

// Hàm ngăn scroll khi dùng wheel trên range slider - Di chuyển ra ngoài component
const preventWheelScroll = (e) => {
  e.preventDefault();
};

// Helper function để format VNĐ
const formatVND = (amount) => {
  if (!amount) return '0';
  // Chuyển thành triệu
  const millions = amount / 1000000;
  if (millions >= 1) {
    return `${millions.toFixed(0)}tr`;
  }
  return `${(amount / 1000).toFixed(0)}k`;
};

// Helper function để tạo fallback logo từ tên công ty
const getCompanyInitials = (companyName) => {
  if (!companyName) return 'C';
  const words = companyName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return companyName.substring(0, 2).toUpperCase();
};

const getDefaultLogoUrl = (companyName) => {
  const initials = getCompanyInitials(companyName);
  // Sử dụng UI Avatars API để tạo avatar đẹp
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=fff&size=32&bold=true`;
};

// Component FilterSidebar - Tách ra ngoài để tối ưu performance
const FilterSidebar = ({ 
  showFilters, 
  setShowFilters, 
  filters, 
  toggleFilter, 
  handleSalaryRangeChange,
  setQuickSalaryRange,
  applyFilters, 
  clearFilters,
  searchTerm,
  setSearchTerm,
  location,
  setLocation,
  hasFilterChanges
}) => {
  // Tính toán % để vẽ thanh màu xanh
  const maxLimit = 100000000; // 100 triệu VNĐ
  const getPercent = (value) => Math.round(((value) / maxLimit) * 100);
  const minPercent = getPercent(filters.salaryRange.min);
  const maxPercent = getPercent(filters.salaryRange.max);

  // Kiểm tra salary range có hợp lệ không
  const isSalaryRangeValid = () => {
    if (filters.salaryRange.max === 0) return true; // Chưa điền thì OK
    return filters.salaryRange.min < filters.salaryRange.max;
  };

  // Kiểm tra có thể apply không
  const canApply = hasFilterChanges && isSalaryRangeValid();

  // Helper render Active Filter Tag
  const renderActiveTag = (label, onRemove, prefix = '') => (
    <div className="filter-tag" key={label}>
      {prefix && <span>{prefix}</span>}
      {label}
      <span className="remove-tag" onClick={onRemove}>×</span>
    </div>
  );

  return (
    <div className={`filter-sidebar ${showFilters ? 'show' : ''}`}>
      {/* Header cố định ở trên */}
      <div className="filter-header">
        <h3>Bộ lọc</h3>
        <button 
          className="close-filters"
          onClick={() => setShowFilters(false)}
        >
          ×
        </button>
      </div>

      {/* Vùng cuộn chứa tất cả các filter sections */}
      <div className="filter-scroll-area">
        
        {/* --- 1. ACTIVE FILTERS SECTION --- */}
        {(searchTerm || location || filters.jobType.length > 0 || filters.contractType.length > 0 || filters.level.length > 0) && (
          <div className="active-filters-section">
            <div className="active-filters-header">
              <span>Bộ lọc đang áp dụng:</span>
            </div>
            <div className="active-tags">
              {searchTerm && renderActiveTag(searchTerm, () => setSearchTerm(''), 'Tìm kiếm:')}
              {location && renderActiveTag(location, () => setLocation(''), 'Vị trí:')}
              {filters.jobType.map(item => renderActiveTag(item, () => toggleFilter('jobType', item)))}
              {filters.contractType.map(item => renderActiveTag(item, () => toggleFilter('contractType', item)))}
              {filters.level.map(item => renderActiveTag(item, () => toggleFilter('level', item)))}
            </div>
          </div>
        )}
        
        <div className="filter-section">
          <h4>Hình thức làm việc</h4>
          <div className="filter-options">
            {[
              { value: 'On-site', label: 'Tại văn phòng' },
              { value: 'Remote', label: 'Làm việc từ xa' },
              { value: 'Hybrid', label: 'Kết hợp' },
              { value: 'Full-time', label: 'Toàn thời gian' }
            ].map(type => (
              <label key={type.value} className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.jobType.includes(type.value)}
                  onChange={() => toggleFilter('jobType', type.value)}
                />
                <span className="checkmark"></span>
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Loại hợp đồng</h4>
          <div className="filter-options">
            {[
              { value: 'Permanent', label: 'Dài hạn' },
              { value: 'Parttime', label: 'Bán thời gian' },
              { value: 'Freelance', label: 'Tự do' },
              { value: 'Contract', label: 'Theo hợp đồng' }
            ].map(type => (
              <label key={type.value} className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.contractType.includes(type.value)}
                  onChange={() => toggleFilter('contractType', type.value)}
                />
                <span className="checkmark"></span>
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Cấp độ kinh nghiệm</h4>
          <div className="filter-options">
            {[
                { value: 'Fresher', label: 'Fresher' },
                { value: 'Junior', label: 'Junior' },
                { value: 'Middle', label: 'Middle' },
                { value: 'Senior', label: 'Senior' },
            ].map(level => (
              <label key={level.value} className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.level.includes(level.value)}
                  onChange={() => toggleFilter('level', level.value)}
                />
                <span className="checkmark"></span>
                <span>{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salary Range Section */}
        <div className="filter-section">
          <h4>Mức lương (năm)</h4>
          
          {/* Quick Select Buttons */}
          <div className="salary-quick-select">
            <button 
              className="quick-btn"
              onClick={() => setQuickSalaryRange(0, 10000000)}
            >
              &lt; 10tr
            </button>
            <button 
              className="quick-btn"
              onClick={() => setQuickSalaryRange(10000000, 20000000)}
            >
              10-20tr
            </button>
            <button 
              className="quick-btn"
              onClick={() => setQuickSalaryRange(20000000, 30000000)}
            >
              20-30tr
            </button>
            <button 
              className="quick-btn"
              onClick={() => setQuickSalaryRange(30000000, 50000000)}
            >
              30-50tr
            </button>
            <button 
              className="quick-btn"
              onClick={() => setQuickSalaryRange(50000000, 100000000)}
            >
              50tr+
            </button>
          </div>

          {/* Custom Range Inputs */}
          <div className="salary-simple-container">
            <div className="salary-simple-inputs">
              <input 
                type="number" 
                min="0"
                placeholder="Tối thiểu"
                value={filters.salaryRange.min || ''}
                onChange={(e) => handleSalaryRangeChange('min', e.target.value)}
                className="salary-simple-input"
              />
              <span className="salary-separator">-</span>
              <input 
                type="number" 
                min="0"
                placeholder="Tối đa"
                value={filters.salaryRange.max || ''}
                onChange={(e) => handleSalaryRangeChange('max', e.target.value)}
                className="salary-simple-input"
              />
              <span className="salary-unit">VNĐ</span>
            </div>
            <p className="help-text">Nhập số tiền (VD: 15000000 cho 15 triệu)</p>
          </div>
        </div>
        
        {/* Khoảng trống ở cuối */}
        <div style={{ height: '40px' }}></div>

      </div>
      {/* Kết thúc filter-scroll-area */}

      {/* Footer actions cố định ở dưới */}
      <div className="filter-actions">
        <button 
          className="btn-apply" 
          onClick={applyFilters}
          disabled={!canApply}
          style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
        >
          <span>Áp dụng bộ lọc</span>
        </button>
        <button className="btn-clear" onClick={clearFilters}>
          Xóa tất cả
        </button>
      </div>
    </div>
  );
};

const FindJobPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const initialFilters = {
    jobType: [],
    contractType: [],
    level: [],
    salaryRange: {
      min: 0,
      max: 100000000 // 100 triệu VNĐ
    }
  };
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters); // Filters đã được apply
  const [hasFilterChanges, setHasFilterChanges] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredJob, setHoveredJob] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [jobDetails, setJobDetails] = useState({});
  const [tooltipLoading, setTooltipLoading] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [loadingJobIds, setLoadingJobIds] = useState(new Set());
  
  // Ref để lưu scroll position
  const scrollPositionRef = useRef(0);

  // API endpoint
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Normalize job data từ API về format chuẩn
  const normalizeJobData = (job) => {
    return {
      JobID: job.JobID || job.jobId || job.id,
      JobName: job.JobName || job.jobName || job.title || job.name,
      JobType: job.JobType || job.jobType || job.type,
      ContractType: job.ContractType || job.contractType || job.JobType || job.jobType,
      SalaryFrom: job.SalaryFrom || job.salaryFrom || job.salary_from || job.minSalary || 0,
      SalaryTo: job.SalaryTo || job.salaryTo || job.salary_to || job.maxSalary || 0,
      CompanyName: job.CompanyName || job.companyName || job.company_name || job.company,
      CompanyLogo: job.CompanyLogo || job.companyLogo || job.company_logo || job.logo,
      Location: job.Location || job.location,
      Level: job.Level || job.level || job.experienceLevel,
      RequireExpYear: job.RequireExpYear || job.requireExpYear || job.experience || 0,
      JobStatus: job.JobStatus || job.jobStatus || job.status || 'Active',
      ExpireDate: job.ExpireDate || job.expireDate || job.expire_date || job.deadline,
      JCName: job.JCName || job.jcName || job.category || job.industry
    };
  };

  // Check if job is expired
  const isJobExpired = (expireDate) => {
    if (!expireDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expire = new Date(expireDate);
    expire.setHours(0, 0, 0, 0);
    return expire < today;
  };

  // Check if job is active (not expired and status is Open/Active)
  const isJobActive = (job) => {
    const notExpired = !isJobExpired(job.ExpireDate);
    const statusOpen = job.JobStatus === 'Open' || job.JobStatus === 'Active';
    return notExpired && statusOpen;
  };

  // Fetch job details from backend
  const fetchJobDetails = async (jobId) => {
    // Luôn fetch lại để có dữ liệu mới nhất
    setTooltipLoading(true);
    setLoadingJobIds(prev => new Set([...prev, jobId]));
    
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('📦 Job details API response:', result);
      
      // Normalize job details từ API với nhiều fallback options
      const data = result.data || result;
      
      // Parse JD (Job Description) - có thể là chuỗi hoặc object
      let description = data.JD || data.JobDescription || data.description || data.Description || '';
      
      // Parse requirements - có thể là array hoặc string ngăn cách bởi dấu chấm câu
      let requirements = [];
      if (Array.isArray(data.requirements || data.Requirements)) {
        requirements = data.requirements || data.Requirements;
      } else if (typeof (data.requirements || data.Requirements) === 'string') {
        requirements = (data.requirements || data.Requirements).split(/[.;]+/).filter(r => r.trim());
      }
      
      // Parse skills - có thể từ nhiều nguồn
      let skills = [];
      if (Array.isArray(data.skills || data.Skills)) {
        skills = data.skills || data.Skills;
      } else if (Array.isArray(data.RequiredSkills)) {
        skills = data.RequiredSkills;
      }
      
      // Tính số ngày còn lại
      const calculateDaysLeft = (expireDate) => {
        if (!expireDate) return 'Chưa cập nhật';
        const today = new Date();
        const expire = new Date(expireDate);
        const diffTime = expire - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Đã hết hạn';
        if (diffDays === 0) return 'Hết hạn hôm nay';
        if (diffDays === 1) return 'Còn 1 ngày';
        return `Còn ${diffDays} ngày`;
      };
      
      const normalizedData = {
        id: data.JobID || data.id || jobId,
        description: description,
        requirements: requirements,
        benefits: data.benefits || data.Benefits || [],
        applicationDeadline: calculateDaysLeft(data.ExpireDate || data.expireDate),
        experience: data.RequiredExpYear || data.RequireExpYear ? `${data.RequiredExpYear || data.RequireExpYear} năm` : (data.experience || data.Experience || '0 năm'),
        workLocation: data.Location || data.location || data.WorkLocation || 'Chưa cập nhật',
        skills: skills,
        contactEmail: data.ContactEmail || data.email || data.Email,
        applicationLink: data.ApplicationLink || `/jobs/${jobId}/apply`,
        expireDate: data.ExpireDate || data.expireDate
      };
      
      console.log('✅ Normalized job details:', normalizedData);
      
      setJobDetails(prev => ({
        ...prev,
        [jobId]: normalizedData
      }));
      
      return normalizedData;
      
    } catch (err) {
      console.error('❌ Error fetching job details:', err);
      
      // Fallback data nếu API lỗi
      const fallbackData = {
        id: jobId,
        description: "Thông tin chi tiết đang được cập nhật...",
        requirements: [],
        benefits: [],
        applicationDeadline: "Đang cập nhật",
        experience: "Đang cập nhật",
        workLocation: "Đang cập nhật",
        skills: [],
        contactEmail: "",
        applicationLink: `/jobs/${jobId}/apply`
      };
      
      setJobDetails(prev => ({
        ...prev,
        [jobId]: fallbackData
      }));
      
      return fallbackData;
    } finally {
      setTooltipLoading(false);
      setLoadingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  // Handle filter changes - Tối ưu với useCallback
  const toggleFilter = useCallback((filterType, value) => {
    setFilters(prev => {
      const currentArray = prev[filterType];
      const isSelected = currentArray.includes(value);
      
      return {
        ...prev,
        [filterType]: isSelected
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
    setHasFilterChanges(true);
  }, []);

  const handleSalaryRangeChange = useCallback((type, value) => {
    setFilters(prev => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [type]: parseInt(value) || 0
      }
    }));
    setHasFilterChanges(true);
  }, []);

  const setQuickSalaryRange = useCallback((min, max) => {
    setFilters(prev => ({
      ...prev,
      salaryRange: { min, max }
    }));
    setHasFilterChanges(true);
  }, []);

  const handlePresetClick = useCallback((min, max) => {
    setFilters(prev => ({
      ...prev,
      salaryRange: { min, max }
    }));
  }, []);

  const applyFilters = useCallback(() => {
    // Validate salary range
    if (filters.salaryRange.min >= filters.salaryRange.max && filters.salaryRange.max > 0) {
      alert('Khoảng lương tối đa phải lớn hơn khoảng lương tối thiểu!');
      return;
    }
    
    // Cập nhật appliedFilters với giá trị hiện tại của filters
    setAppliedFilters(filters);
    setCurrentPage(1);
    setShowFilters(false);
    setHasFilterChanges(false);
    fetchJobs({ 
      search: searchTerm, 
      location: location,
      ...filters 
    });
  }, [searchTerm, location, filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setSearchTerm('');
    setLocation('');
    setCurrentPage(1);
    setHasFilterChanges(false);
    // Truyền initialFilters vào để fetchJobs dùng luôn, không đợi state update
    fetchJobs({ 
      search: '', 
      location: '',
      ...initialFilters 
    });
  }, []);

  // Fetch jobs from backend
  const fetchJobs = async (searchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ưu tiên dùng params từ searchParams, nếu không có thì dùng state
      const searchValue = searchParams.search !== undefined ? searchParams.search : searchTerm;
      const locationValue = searchParams.location !== undefined ? searchParams.location : location;
      
      // Merge searchParams với appliedFilters, ưu tiên searchParams nếu có
      const currentFilters = {
        jobType: searchParams.jobType !== undefined ? searchParams.jobType : appliedFilters.jobType,
        contractType: searchParams.contractType !== undefined ? searchParams.contractType : appliedFilters.contractType,
        level: searchParams.level !== undefined ? searchParams.level : appliedFilters.level,
        salaryRange: searchParams.salaryRange !== undefined ? searchParams.salaryRange : appliedFilters.salaryRange
      };
      
      // Xây dựng query parameters - Backend sẽ xử lý filters và pagination
      const pageToUse = searchParams.page !== undefined ? searchParams.page : currentPage;
      const queryParams = new URLSearchParams({
        page: pageToUse,
        limit: 9, // 9 jobs per page
      });
      
      // Gửi search và location
      if (searchValue) queryParams.append('search', searchValue);
      if (locationValue) queryParams.append('location', locationValue);
      
      // Gửi filters lên backend (hỗ trợ multiple values)
      if (currentFilters.jobType && currentFilters.jobType.length > 0) {
        // Express tự động parse multiple query params với cùng key thành array
        currentFilters.jobType.forEach(type => {
          queryParams.append('jobType', type);
        });
      }
      
      if (currentFilters.contractType && currentFilters.contractType.length > 0) {
        currentFilters.contractType.forEach(type => {
          queryParams.append('contractType', type);
        });
      }
      
      if (currentFilters.level && currentFilters.level.length > 0) {
        currentFilters.level.forEach(level => {
          queryParams.append('level', level);
        });
      }
      
      // Gửi salary range
      if (currentFilters.salaryRange) {
        if (currentFilters.salaryRange.min > 0) {
          queryParams.append('salaryMin', currentFilters.salaryRange.min);
        }
        if (currentFilters.salaryRange.max < 100000000) {
          queryParams.append('salaryMax', currentFilters.salaryRange.max);
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Backend returns: { success: true, data: { jobs, pagination }, message }
      if (result.success && result.data) {
        console.log('API Job Data Sample:', result.data.jobs[0]); // Debug: xem cấu trúc data từ API
        
        // Normalize job data từ API
        const normalizedJobs = (result.data.jobs || [])
          .map(job => normalizeJobData(job));
        
        // Sử dụng pagination từ backend
        const pagination = result.data.pagination || {};
        setJobData(normalizedJobs);
        setTotalPages(pagination.total_pages || 1);
        // Không cập nhật currentPage ở đây để tránh infinite loop
        // currentPage đã được set trước khi gọi fetchJobs (từ handlePageChange hoặc searchParams)
      } else {
        throw new Error('Invalid response format from server');
      }
      
    } catch (err) {
      setError('Không thể tải dữ liệu công việc. Vui lòng thử lại.');
      console.error('Error fetching jobs:', err);
      
      // Fallback data nếu API lỗi - tổng cộng 18 jobs để test pagination
      // Backend response format: { JobID, JobName, CompanyName, CompanyLogo, Location, ContractType, JobType, Level, SalaryFrom, SalaryTo, ... }
      // Fallback data với format giống backend
      let allFallbackJobs = [
        { JobID: 1, JobName: 'Technical Support', JobType: 'Parttime', ContractType: 'Parttime', SalaryFrom: 8000000, SalaryTo: 12000000, CompanyName: 'FPT Software', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png', Location: 'Hà Nội', Level: 'Junior', RequireExpYear: 1, JobStatus: 'Open', ExpireDate: '2025-12-31', JCName: 'IT & Software' },
        { JobID: 2, JobName: 'Senior UX Designer', JobType: 'Onsite', ContractType: 'Fulltime', SalaryFrom: 20000000, SalaryTo: 30000000, CompanyName: 'Viettel Group', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Viettel_logo.svg/1200px-Viettel_logo.svg.png', Location: 'TP. Hồ Chí Minh', Level: 'Senior', RequireExpYear: 3, JobStatus: 'Active', ExpireDate: '2025-12-25', JCName: 'Design' },
        { JobID: 3, JobName: 'Marketing Officer', JobType: 'Hybrid', ContractType: 'Internship', SalaryFrom: 5000000, SalaryTo: 8000000, CompanyName: 'VNG Corporation', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/VNG_Corporation_logo.svg/1200px-VNG_Corporation_logo.svg.png', Location: 'TP. Hồ Chí Minh', Level: 'Fresher', RequireExpYear: 0, JobStatus: 'Active', ExpireDate: '2026-01-15', JCName: 'Marketing' },
        { JobID: 4, JobName: 'Junior Designer', JobType: 'Remote', ContractType: 'Internship', SalaryFrom: 6000000, SalaryTo: 10000000, CompanyName: 'Tiki', CompanyLogo: 'https://salt.tikicdn.com/ts/upload/e4/49/6c/270be9859abd5f5ec5071da65fab0a94.png', Location: 'Hà Nội', Level: 'Junior', RequireExpYear: 1, JobStatus: 'Open', ExpireDate: '2025-12-20', JCName: 'Design' },
        { JobID: 5, JobName: 'Product Designer', JobType: 'Remote', ContractType: 'Parttime', SalaryFrom: 12000000, SalaryTo: 18000000, CompanyName: 'Shopee', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png', Location: 'Đà Nẵng', Level: 'Mid', RequireExpYear: 2, JobStatus: 'Active', ExpireDate: '2026-01-10', JCName: 'Design' },
        { JobID: 6, JobName: 'Project Manager', JobType: 'Onsite', ContractType: 'Fulltime', SalaryFrom: 25000000, SalaryTo: 40000000, CompanyName: 'MB Bank', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/MBBank_logo.svg/1200px-MBBank_logo.svg.png', Location: 'Hà Nội', Level: 'Manager', RequireExpYear: 5, JobStatus: 'Open', ExpireDate: '2025-12-30', JCName: 'Business' },
        { JobID: 7, JobName: 'Software Engineer', JobType: 'Hybrid', ContractType: 'Fulltime', SalaryFrom: 15000000, SalaryTo: 25000000, CompanyName: 'Momo', CompanyLogo: 'https://developers.momo.vn/v3/img/logo.svg', Location: 'TP. Hồ Chí Minh', Level: 'Mid', RequireExpYear: 3, JobStatus: 'Active', ExpireDate: '2026-01-20', JCName: 'Development' },
        { JobID: 8, JobName: 'Visual Designer', JobType: 'Onsite', ContractType: 'Fulltime', SalaryFrom: 14000000, SalaryTo: 20000000, CompanyName: 'VinID', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Vingroup_logo.svg/1200px-Vingroup_logo.svg.png', Location: 'Hà Nội', Level: 'Mid', RequireExpYear: 2, JobStatus: 'Open', ExpireDate: '2025-12-28', JCName: 'Design' },
        { JobID: 9, JobName: 'UI/UX Designer', JobType: 'Remote', ContractType: 'Fulltime', SalaryFrom: 13000000, SalaryTo: 18000000, CompanyName: 'Zalo', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1200px-Icon_of_Zalo.svg.png', Location: 'TP. Hồ Chí Minh', Level: 'Mid', RequireExpYear: 2, JobStatus: 'Active', ExpireDate: '2026-01-05', JCName: 'Design' },
        { JobID: 10, JobName: 'Full Stack Dev', JobType: 'Hybrid', ContractType: 'Fulltime', SalaryFrom: 18000000, SalaryTo: 28000000, CompanyName: 'Base.vn', CompanyLogo: 'https://base.vn/static/base-logo.svg', Location: 'Hà Nội', Level: 'Senior', RequireExpYear: 4, JobStatus: 'Open', ExpireDate: '2026-02-01', JCName: 'Development' },
        { JobID: 11, JobName: 'Network Engineer', JobType: 'Onsite', ContractType: 'Internship', SalaryFrom: 7000000, SalaryTo: 10000000, CompanyName: 'VNPT', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/VNPT_Logo.svg/1200px-VNPT_Logo.svg.png', Location: 'Đà Nẵng', Level: 'Junior', RequireExpYear: 1, JobStatus: 'Active', ExpireDate: '2025-12-15', JCName: 'IT & Software' },
        { JobID: 12, JobName: 'Frontend Dev', JobType: 'Remote', ContractType: 'Fulltime', SalaryFrom: 16000000, SalaryTo: 24000000, CompanyName: 'Got It', CompanyLogo: 'https://gotitapp.co/assets/img/logo.png', Location: 'TP. Hồ Chí Minh', Level: 'Senior', RequireExpYear: 3, JobStatus: 'Open', ExpireDate: '2026-01-25', JCName: 'Development' },
        { JobID: 13, JobName: 'Backend Dev', JobType: 'Hybrid', ContractType: 'Fulltime', SalaryFrom: 20000000, SalaryTo: 30000000, CompanyName: 'VIB Bank', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/VIB_logo.svg/1200px-VIB_logo.svg.png', Location: 'Hà Nội', Level: 'Senior', RequireExpYear: 4, JobStatus: 'Active', ExpireDate: '2026-01-30', JCName: 'Development' },
        { JobID: 14, JobName: 'Data Analyst', JobType: 'Remote', ContractType: 'Parttime', SalaryFrom: 10000000, SalaryTo: 15000000, CompanyName: 'Sendo', CompanyLogo: 'https://media.sendo.vn/media/logo/logo.png', Location: 'TP. Hồ Chí Minh', Level: 'Mid', RequireExpYear: 3, JobStatus: 'Open', ExpireDate: '2025-12-22', JCName: 'IT & Software' },
        { JobID: 15, JobName: 'DevOps Engineer', JobType: 'Onsite', ContractType: 'Fulltime', SalaryFrom: 22000000, SalaryTo: 35000000, CompanyName: 'BAEMIN', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Baemin_logo.svg/1200px-Baemin_logo.svg.png', Location: 'TP. Hồ Chí Minh', Level: 'Senior', RequireExpYear: 5, JobStatus: 'Active', ExpireDate: '2026-02-10', JCName: 'Development' },
        { JobID: 16, JobName: 'Mobile Developer', JobType: 'Remote', ContractType: 'Internship', SalaryFrom: 6000000, SalaryTo: 9000000, CompanyName: 'Topica', CompanyLogo: 'https://www.topicanative.edu.vn/static/media/logo.svg', Location: 'Hà Nội', Level: 'Fresher', RequireExpYear: 0, JobStatus: 'Open', ExpireDate: '2025-12-18', JCName: 'Development' },
        { JobID: 17, JobName: 'QA Tester', JobType: 'Hybrid', ContractType: 'Parttime', SalaryFrom: 9000000, SalaryTo: 14000000, CompanyName: 'Gameloft', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gameloft_logo.svg/1200px-Gameloft_logo.svg.png', Location: 'Hà Nội', Level: 'Junior', RequireExpYear: 1, JobStatus: 'Active', ExpireDate: '2026-01-08', JCName: 'IT & Software' },
        { JobID: 18, JobName: 'System Admin', JobType: 'Onsite', ContractType: 'Fulltime', SalaryFrom: 12000000, SalaryTo: 18000000, CompanyName: 'VCCorp', CompanyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/VCCorp_logo.svg/1200px-VCCorp_logo.svg.png', Location: 'Hà Nội', Level: 'Mid', RequireExpYear: 3, JobStatus: 'Open', ExpireDate: '2026-01-12', JCName: 'IT & Software' }
      ];

      // Load jobs from localStorage (posted via PostJob page)
      const postedJobs = JSON.parse(localStorage.getItem('postedJobs') || '[]');
      if (postedJobs.length > 0) {
        // Merge posted jobs with fallback data
        allFallbackJobs = [...allFallbackJobs, ...postedJobs];
      }

      // Ưu tiên dùng params từ searchParams, nếu không có thì dùng state
      const searchValue = searchParams.search !== undefined ? searchParams.search : searchTerm;
      const locationValue = searchParams.location !== undefined ? searchParams.location : location;

      // Apply filters to fallback data
      if (searchValue) {
        allFallbackJobs = allFallbackJobs.filter(job => 
          (job.JobName && job.JobName.toLowerCase().includes(searchValue.toLowerCase())) ||
          (job.CompanyName && job.CompanyName.toLowerCase().includes(searchValue.toLowerCase())) ||
          (job.Location && job.Location.toLowerCase().includes(searchValue.toLowerCase()))
        );
      }

      if (locationValue) {
        allFallbackJobs = allFallbackJobs.filter(job => 
          job.Location && job.Location.toLowerCase().includes(locationValue.toLowerCase())
        );
      }

      if (appliedFilters.jobType && appliedFilters.jobType.length > 0) {
        allFallbackJobs = allFallbackJobs.filter(job => appliedFilters.jobType.includes(job.JobType));
      }

      if (appliedFilters.contractType && appliedFilters.contractType.length > 0) {
        allFallbackJobs = allFallbackJobs.filter(job => appliedFilters.contractType.includes(job.ContractType));
      }

      if (appliedFilters.level && appliedFilters.level.length > 0) {
        allFallbackJobs = allFallbackJobs.filter(job => appliedFilters.level.includes(job.Level));
      }

      // Apply salary filter if enabled
      if (appliedFilters.salaryRange && (appliedFilters.salaryRange.min > 0 || appliedFilters.salaryRange.max < 100000000)) {
        allFallbackJobs = allFallbackJobs.filter(job => {
          // Khoảng lương của job phải nằm trong khoảng filter (có giao nhau)
          // Job hiển thị nếu: SalaryTo >= filter.min VÀ SalaryFrom <= filter.max
          return job.SalaryTo >= appliedFilters.salaryRange.min && 
                 job.SalaryFrom <= appliedFilters.salaryRange.max;
        });
      }

      // Filter out expired jobs - Chỉ hiển thị job đang hoạt động
      allFallbackJobs = allFallbackJobs.filter(job => isJobActive(job));
      
      // Tính toán pagination cho fallback data
      const totalJobs = allFallbackJobs.length;
      const jobsPerPage = 9;
      const totalPagesCalc = Math.ceil(totalJobs / jobsPerPage);
      const startIndex = (currentPage - 1) * jobsPerPage;
      const endIndex = startIndex + jobsPerPage;
      const paginatedJobs = allFallbackJobs.slice(startIndex, endIndex);
      
      setJobData(paginatedJobs);
      setTotalPages(totalPagesCalc);
    } finally {
      setLoading(false);
    }
  };

  // Quản lý scroll khi filter mở/đóng
  useEffect(() => {
    if (showFilters) {
      scrollPositionRef.current = window.pageYOffset;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPositionRef.current);
    }

    return () => {
      if (showFilters) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    };
  }, [showFilters]);

  // Đọc query parameters từ URL khi component mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const locationFromUrl = searchParams.get('location') || '';
    
    if (searchFromUrl) setSearchTerm(searchFromUrl);
    if (locationFromUrl) setLocation(locationFromUrl);
    
    // Nếu có params, tự động search
    if (searchFromUrl || locationFromUrl) {
      fetchJobs({ search: searchFromUrl, location: locationFromUrl });
    }
  }, []);

  // Load jobs khi component mount hoặc page change
  useEffect(() => {
    fetchJobs({ 
      page: currentPage,
      search: searchTerm,
      location: location,
      jobType: appliedFilters.jobType,
      contractType: appliedFilters.contractType,
      level: appliedFilters.level,
      salaryRange: appliedFilters.salaryRange
    });
  }, [currentPage]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset về trang đầu
    fetchJobs({ search: searchTerm, location: location });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const popularSearches = [
    'Frontend', 'Backend', 'Full Stack', 'React', 'Node.js',
    'Java', 'Python', 'UI/UX', 'DevOps', 'Mobile App'
  ];

  const getJobTypeClass = (type) => {
    switch (type) {
      case 'Onsite':
      case 'On-site': 
        return 'job-badge onsite';
      case 'Remote': 
        return 'job-badge remote';
      case 'Hybrid': 
        return 'job-badge hybrid';
      case 'Fulltime':
      case 'Full-time':
      case 'Permanent':
        return 'job-badge fulltime';
      case 'Parttime':
      case 'Part-time':
        return 'job-badge parttime';
      case 'Freelance':
        return 'job-badge freelance';
      case 'Internship':
        return 'job-badge internship';
      case 'Contract':
        return 'job-badge contract';
      default: 
        return 'job-badge';
    }
  };

  const getJobTypeLabel = (type) => {
    switch (type) {
      case 'Onsite':
      case 'On-site':
        return 'Tại văn phòng';
      case 'Remote': 
        return 'Từ xa';
      case 'Hybrid': 
        return 'Kết hợp';
      case 'Fulltime':
      case 'Full-time':
      case 'Permanent':
        return 'Toàn thời gian';
      case 'Parttime':
      case 'Part-time':
        return 'Bán thời gian';
      case 'Freelance':
        return 'Tự do';
      case 'Internship':
        return 'Thực tập';
      case 'Contract':
        return 'Hợp đồng';
      default: 
        return type;
    }
  };

  // Xử lý hover cho tooltip
  const handleJobTitleHover = async (job, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 400;
    const tooltipHeight = 500; // Ước tính chiều cao tooltip
    
    // Tính toán vị trí X (trái/phải) để không bị cắt
    let xPosition = rect.right + 10;
    if (xPosition + tooltipWidth > viewportWidth) {
      xPosition = rect.left - tooltipWidth - 10;
    }
    // Nếu vẫn bị cắt bên trái, đặt sát cạnh phải
    if (xPosition < 10) {
      xPosition = viewportWidth - tooltipWidth - 10;
    }
    
    // Tính toán vị trí Y (trên/dưới) để không bị cắt
    let yPosition = rect.top;
    // Nếu tooltip bị cắt ở phía dưới màn hình
    if (yPosition + tooltipHeight > viewportHeight) {
      yPosition = Math.max(10, viewportHeight - tooltipHeight - 10);
    }
    // Đảm bảo không bị cắt ở phía trên
    yPosition = Math.max(10, yPosition);
    
    setTooltipPosition({
      x: Math.max(10, Math.min(xPosition, viewportWidth - tooltipWidth - 10)),
      y: yPosition
    });
    
    setHoveredJob(job);
    
    // Fetch chi tiết công việc
    await fetchJobDetails(job.JobID);
  };

  const handleJobTitleLeave = () => {
    // Delay để cho phép hover vào tooltip
    setTimeout(() => {
      if (!document.querySelector('.job-tooltip:hover')) {
        setHoveredJob(null);
      }
    }, 100);
  };

  // Handle bookmark
  const handleBookmark = async (jobId) => {
    try {
      const isBookmarked = bookmarkedJobs.has(jobId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      await fetch(`${API_BASE_URL}/jobs/${jobId}/favorite`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${userToken}` // Nếu cần auth
        }
      });
      
      setBookmarkedJobs(prev => {
        const newSet = new Set(prev);
        if (isBookmarked) {
          newSet.delete(jobId);
        } else {
          newSet.add(jobId);
        }
        return newSet;
      });
      
    } catch (err) {
      console.error('Error bookmarking job:', err);
      // Fallback: toggle locally
      setBookmarkedJobs(prev => {
        const newSet = new Set(prev);
        if (prev.has(jobId)) {
          newSet.delete(jobId);
        } else {
          newSet.add(jobId);
        }
        return newSet;
      });
    }
  };

  // Handle apply job
  const handleApplyJob = (jobId) => {
    // Kiểm tra đăng nhập trước khi ứng tuyển
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    // Chuyển đến trang apply
    navigate(`/jobs/${jobId}/apply`);
  };

  // Handle view details
  const handleViewDetails = (jobId) => {
    // Chuyển đến trang chi tiết công việc
    navigate(`/jobs/${jobId}`);
  };

  // Handle job title click
  const handleJobTitleClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  // Component JobTooltip
  const JobTooltip = ({ job, position }) => {
    if (!job) return null;

    const currentJobDetails = jobDetails[job.JobID] || {};
    const isLoading = loadingJobIds.has(job.JobID);

    return (
      <div 
        className="job-tooltip" 
        style={{ 
          left: position.x, 
          top: position.y,
          position: 'fixed',
          zIndex: 9999
        }}
        onMouseEnter={() => setHoveredJob(job)}
        onMouseLeave={() => setHoveredJob(null)}
      >
        <div className="tooltip-header">
          <div className="tooltip-company-info">
            <div className="tooltip-logo">
              <img 
                src={job.CompanyLogo || getDefaultLogoUrl(job.CompanyName)} 
                alt={job.CompanyName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getDefaultLogoUrl(job.CompanyName);
                }}
              />
            </div>
            <div className="tooltip-title-section">
              <h4 className="tooltip-job-title">{job.JobName}</h4>
              <p className="tooltip-company-name">{job.CompanyName}</p>
              <p className="tooltip-salary">{formatVND(job.SalaryFrom)} - {formatVND(job.SalaryTo)} VNĐ</p>
            </div>
            <button 
              className={`tooltip-bookmark ${bookmarkedJobs.has(job.JobID) ? 'bookmarked' : ''}`}
              onClick={() => handleBookmark(job.JobID)}
              title="Bookmark job"
            >
              <Bookmark size={20} />
            </button>
          </div>
          <div className="tooltip-meta">
            <div className="tooltip-location">
              📍 {currentJobDetails.workLocation || job.Location || 'Đang tải...'}
            </div>
            <div className="tooltip-experience">
              💼 {currentJobDetails.experience || (job.RequiredExpYear ? `${job.RequiredExpYear} năm` : 'Đang tải...')}
            </div>
            <div className="tooltip-deadline">
              ⏰ {currentJobDetails.applicationDeadline || 'Đang tải...'}
            </div>
          </div>
        </div>
        
        <div className="tooltip-content">
          {isLoading ? (
            <div className="tooltip-loading">
              <div className="tooltip-spinner"></div>
              <span>Đang tải chi tiết...</span>
            </div>
          ) : (
            <>
              <div className="tooltip-section">
                <h5>Mô tả công việc</h5>
                <p>{currentJobDetails.description || 'Đang cập nhật mô tả công việc...'}</p>
              </div>
              
              {currentJobDetails.requirements && currentJobDetails.requirements.length > 0 && (
                <div className="tooltip-section">
                  <h5>Yêu cầu công việc</h5>
                  <ul className="tooltip-requirements">
                    {currentJobDetails.requirements.slice(0, 3).map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                    {currentJobDetails.requirements.length > 3 && (
                      <li className="more-items">... và {currentJobDetails.requirements.length - 3} yêu cầu khác</li>
                    )}
                  </ul>
                </div>
              )}
              
              {currentJobDetails.skills && currentJobDetails.skills.length > 0 && (
                <div className="tooltip-section">
                  <h5>Kỹ năng yêu cầu</h5>
                  <div className="tooltip-skills">
                    {currentJobDetails.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {currentJobDetails.skills.length > 5 && (
                      <span className="skill-tag more">+{currentJobDetails.skills.length - 5}</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="tooltip-actions">
                <button 
                  className="tooltip-btn apply-btn"
                  onClick={() => handleApplyJob(job.JobID)}
                >
                  Ứng tuyển ngay
                </button>
                <button 
                  className="tooltip-btn detail-btn"
                  onClick={() => handleViewDetails(job.JobID)}
                >
                  Xem chi tiết
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="find-job-page">
      {/* Page Title Section */}
      <div className="page-title-section">
        <div className="container">
          <div className="title-breadcrumb-wrapper">
            <h1 className="page-main-title">Tìm việc làm</h1>
            <div className="breadcrumb-trail">
              <span className="breadcrumb-item" onClick={() => navigate('/')}>Trang chủ</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">Tìm việc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          
          {/* Search Box Large */}
          <div className="search-wrapper">
            <form onSubmit={handleSearch} className="search-box-large">
              <div className="input-group">
                <span className="icon"><Search size={20} /></span>
                <input 
                  type="text" 
                  placeholder="Tên công việc, vị trí (ví dụ: Frontend Developer, UI/UX Designer)" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="divider"></div>
              <div className="input-group">
                <span className="icon"><MapPin size={20} /></span>
                <input 
                  type="text" 
                  placeholder="Địa điểm (ví dụ: Hà Nội, TP.HCM, Đà Nẵng)" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <span className="crosshair">⌖</span>
              </div>
              <div className="action-group">
                <button 
                  type="button" 
                  className="btn-filters"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal size={18} /> Bộ lọc
                </button>
                <button type="submit" className="btn-find" disabled={loading}>
                  {loading ? 'Đang tìm...' : 'Tìm việc'}
                </button>
              </div>
            </form>
          </div>

          {/* Popular Searches */}
          <div className="popular-searches">
            <span className="popular-label">Tìm kiếm phổ biến:</span>
            <div className="popular-tags">
              {popularSearches.map((search, index) => (
                <button 
                  key={index} 
                  className="tag-link"
                  onClick={() => {
                    setSearchTerm(search);
                    setCurrentPage(1);
                    fetchJobs({ search: search, location: location });
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Sidebar - Chỉ render khi showFilters = true */}
          {showFilters && (
            <FilterSidebar 
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filters={filters}
              toggleFilter={toggleFilter}
              handleSalaryRangeChange={handleSalaryRangeChange}
              setQuickSalaryRange={setQuickSalaryRange}
              applyFilters={applyFilters}
              clearFilters={clearFilters}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              location={location}
              setLocation={setLocation}
              hasFilterChanges={hasFilterChanges}
            />
          )}
          {showFilters && (
            <div 
              className="filter-overlay"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>Đang tải công việc...</span>
            </div>
          )}

          {/* Job Listings Grid */}
          <div className="job-grid">
            {jobData.map((job) => (
              <div key={job.JobID} className={`job-card ${job.JobID === 6 ? 'highlighted' : ''}`}>
                <div className="card-top">
                    <h3 
                      className="job-title" 
                      onMouseEnter={(e) => handleJobTitleHover(job, e)}
                      onMouseLeave={handleJobTitleLeave}
                      onClick={() => handleJobTitleClick(job.JobID)}
                      style={{ cursor: 'pointer' }}
                    >
                      {job.JobName}
                    </h3>
                </div>
                
                <div className="card-meta">
                  <span className={getJobTypeClass(job.JobType || job.ContractType)}>{getJobTypeLabel(job.JobType || job.ContractType)}</span>
                  <span className="salary">Mức lương: {formatVND(job.SalaryFrom)} - {formatVND(job.SalaryTo)}</span>
                </div>

                <div className="card-footer">
                  <div className="company-info">
                    <div className="company-logo">
                      <img 
                        src={job.CompanyLogo || getDefaultLogoUrl(job.CompanyName)} 
                        alt={job.CompanyName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getDefaultLogoUrl(job.CompanyName);
                        }}
                      />
                    </div>
                    <div className="info-text">
                      <div className="company-name">{job.CompanyName}</div>
                      <div className="location">
                        <span className="pin-icon">📍</span> {job.Location}
                      </div>
                    </div>
                  </div>
                  <button 
                    className={`bookmark-btn ${bookmarkedJobs.has(job.JobID) ? 'bookmarked' : ''}`}
                    onClick={() => handleBookmark(job.JobID)}
                  >
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!loading && jobData.length === 0 && (
            <div className="empty-state">
              <Briefcase size={64} color="#d1d5db" />
              <p>Không tìm thấy công việc nào. Hãy thử tìm kiếm với từ khóa khác.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <button 
              className="page-btn arrow" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              ←
            </button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button 
                  key={pageNumber}
                  className={`page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber.toString().padStart(2, '0')}
                </button>
              );
            })}
            
            {totalPages > 5 && (
              <span className="pagination-dots">...</span>
            )}
            
            <button 
              className="page-btn arrow"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              →
            </button>
          </div>
        </div>
      </main>
      
      {/* Job Tooltip */}
      {hoveredJob && (
        <JobTooltip job={hoveredJob} position={tooltipPosition} />
      )}
    </div>
  );
};

export default FindJobPage;