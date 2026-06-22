// Configuration constants
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    JOBS: '/jobs',
    JOB_DETAIL: '/jobs/:id',
    FAVORITE_JOB: '/jobs/:id/favorite',
    APPLY_JOB: '/jobs/:id/apply',
    CHECK_JOB_STATUS: '/jobs/:id/check-status',
    HEALTH: '/health'
  },
  DEFAULT_PARAMS: {
    PAGE: 1,
    LIMIT: 9,
    STATUS: 'active'
  }
};

export const JOB_FILTERS = {
  INDUSTRIES: [
    'Development', 
    'Design', 
    'Marketing', 
    'IT & Software', 
    'Business', 
    'Finance', 
    'Data Science', 
    'Mobile', 
    'DevOps'
  ],
  JOB_TYPES: [
    { value: 'Onsite', label: 'Tại văn phòng' },
    { value: 'Remote', label: 'Làm việc từ xa' },
    { value: 'Hybrid', label: 'Kết hợp' }
  ],
  CONTRACT_TYPES: [
    { value: 'Fulltime', label: 'Toàn thời gian' },
    { value: 'Parttime', label: 'Bán thời gian' },
    { value: 'Internship', label: 'Thực tập' },
    { value: 'Contract', label: 'Theo hợp đồng' }
  ],
  LEVELS: [
    { value: 'Fresher', label: 'Mới tốt nghiệp' },
    { value: 'Junior', label: 'Nhân viên' },
    { value: 'Mid', label: 'Trung cấp' },
    { value: 'Senior', label: 'Cao cấp' },
    { value: 'Manager', label: 'Quản lý' }
  ]
};

export const SALARY_RANGES = {
  MIN: 0,
  MAX: 100000000, // 100 triệu VNĐ
  QUICK_RANGES: [
    { min: 0, max: 10000000, label: '< 10tr' },
    { min: 10000000, max: 20000000, label: '10-20tr' },
    { min: 20000000, max: 30000000, label: '20-30tr' },
    { min: 30000000, max: 50000000, label: '30-50tr' },
    { min: 50000000, max: 100000000, label: '50tr+' }
  ]
};

export const POPULAR_SEARCHES = [
  'Frontend', 
  'Backend', 
  'Full Stack', 
  'React', 
  'Node.js',
  'Java', 
  'Python', 
  'UI/UX', 
  'DevOps', 
  'Mobile App'
];