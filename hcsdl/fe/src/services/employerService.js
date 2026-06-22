// Employer API Service - Aligned with Database Schema
// Schema tables: employer, job, company, package, follow, apply, notification
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get authentication token from localStorage or context
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('authToken') || '';
};

// Get employer dashboard statistics
// Schema: employer table có NumberOfOpenedJob, còn savedCandidates từ bảng follow
export const getEmployerStats = async (employerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employer/${employerId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Expected response: { NumberOfOpenedJob, totalFollowers }
    return data;
  } catch (error) {
    console.error('Error fetching employer stats:', error);
    throw error;
  }
};

// Get employer's posted jobs
// Schema: job table fields: JobID, JobName, JobType, ContractType, Level, Quantity,
// SalaryFrom, SalaryTo, RequiredExpYear, Location, PostDate, ExpireDate, JobStatus, NumberOfApplicant
export const getEmployerJobs = async (employerId, params = {}) => {
  try {
    console.log('📡 Calling getEmployerJobs API for employerId:', employerId);
    console.log('📋 Params:', params);
    
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || 'all', // 'Open', 'Closed', 'all'
      ...params
    });

    const url = `${API_BASE_URL}/employer/${employerId}/jobs?${queryParams}`;
    console.log('🌐 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Jobs API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching employer jobs:', error);
    throw error;
  }
};

// Get job applications for a specific job
// Schema: apply table có CandidateID, JobID, upLoadCV, CoverLetter, Status_apply
// Status_apply default: 'Dang duyet'
export const getJobApplications = async (jobId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      status: params.status || 'all', // 'Dang duyet', other statuses, 'all'
      ...params
    });

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw error;
  }
};

// Get saved candidates (from follow table)
export const getSavedCandidates = async (employerId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...params
    });

    const response = await fetch(`${API_BASE_URL}/employer/${employerId}/saved-candidates?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching saved candidates:', error);
    throw error;
  }
};

// Post a new job
// Schema: job table - JobName (max 20), JD (max 500), JobType, ContractType, Level,
// Quantity (>=1), SalaryFrom (>0), SalaryTo (>SalaryFrom), RequiredExpYear, Location (max 30),
// PostDate, ExpireDate (>PostDate), JobStatus, NumberOfApplicant (default 0), EmployerID
// Relations: job_category (in table), skill (require table)
export const postJob = async (jobData) => {
  try {
    console.log('=== POST JOB DEBUG ===');
    console.log('API URL:', `${API_BASE_URL}/jobs`);
    console.log('Job data:', JSON.stringify(jobData, null, 2));
    console.log('Categories:', jobData.categories);
    console.log('Skills:', jobData.skills);
    console.log('EmployerID:', jobData.EmployerID);
    
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(jobData),
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      // Lấy thông báo lỗi từ response
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('❌ Error posting job:', error);
    throw error;
  }
};

// Update job status (mark as expired, activate, etc.)
// Schema: JobStatus in job table (varchar 10) - Valid values: 'Open', 'Closed'
export const updateJobStatus = async (jobId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ JobStatus: status }), // e.g., 'Open', 'Closed'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
};

// Update a job
export const updateJob = async (jobId, jobData) => {
  try {
    console.log('=== UPDATE JOB DEBUG ===');
    console.log('API URL:', `${API_BASE_URL}/jobs/${jobId}`);
    console.log('Job data:', JSON.stringify(jobData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(jobData),
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('❌ Error updating job:', error);
    throw error;
  }
};

// Delete a job
export const deleteJob = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// Get employer profile
export const getEmployerProfile = async (employerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employer/${employerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    throw error;
  }
};

// Update employer profile
export const updateEmployerProfile = async (employerId, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employer/${employerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating employer profile:', error);
    throw error;
  }
};

// Get employer's company information
export const getCompanyInfo = async (employerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employer/${employerId}/company`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw error;
  }
};

// Update company information
export const updateCompanyInfo = async (companyId, companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating company info:', error);
    throw error;
  }
};

// Get employer's package information
export const getPackageInfo = async (packageName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (packageName && Array.isArray(data?.data)) {
      return data.data.find((pkg) => pkg.PackageName === packageName) || null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching package info:', error);
    throw error;
  }
};

// Update application status
// Schema: apply table - Status_apply (varchar 20, default 'Dang duyet')
export const updateApplicationStatus = async (candidateId, jobId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${jobId}/${candidateId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ Status_apply: status }), // 'Dang duyet' or other values
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

// Save/Follow a candidate
// Schema: follow table có CandidateID, EmployerID
export const toggleFollowCandidate = async (employerId, candidateId, isFollowing) => {
  try {
    const method = isFollowing ? 'DELETE' : 'POST';
    const response = await fetch(`${API_BASE_URL}/employer/${employerId}/follow/${candidateId}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling follow candidate:', error);
    throw error;
  }
};

// Get notifications for employer
// Schema: notification table có nID, Title (max 30), Content (max 200), Time,
// CandidateID, EmployerID, JobID
export const getNotifications = async (employerId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...params
    });

    const response = await fetch(`${API_BASE_URL}/employer/${employerId}/notifications?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export default {
  getEmployerStats,
  getEmployerJobs,
  getJobApplications,
  getSavedCandidates,
  postJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getEmployerProfile,
  updateEmployerProfile,
  getCompanyInfo,
  updateCompanyInfo,
  getPackageInfo,
  updateApplicationStatus,
  toggleFollowCandidate,
  getNotifications
};
