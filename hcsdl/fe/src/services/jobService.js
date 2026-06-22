// Job API Service - Aligned with Database Schema
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Fetch jobs với các filter options
// Backend response: { success: true, data: { jobs, pagination }, message }
// Jobs format: { JobID, JobName, CompanyName, CompanyLogo, Location, ContractType, JobType, Level, SalaryFrom, SalaryTo, ... }
export const fetchJobs = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add search and filters
    if (params.search) queryParams.append('search', params.search);
    if (params.location) queryParams.append('location', params.location);
    if (params.jobType) queryParams.append('jobType', params.jobType);
    if (params.contractType) queryParams.append('contractType', params.contractType);
    if (params.level) queryParams.append('level', params.level);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);

    const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Backend returns: { success: true, data: { jobs, pagination }, message }
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Fetch job details by ID
// Backend response: Full job details with company info, categories, and required skills
export const fetchJobById = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Backend returns: { success: true, data: {...jobDetails}, message }
    // Return the whole result object so consumers can check success flag
    return result;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
};

// Apply for a job
// Backend expects: { CandidateID, JobID, upLoadCV, CoverLetter, Status_apply }
export const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        CandidateID: applicationData.candidateId,
        upLoadCV: applicationData.cvPath,
        CoverLetter: applicationData.coverLetter || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error applying for job:', error);
    throw error;
  }
};

// Bookmark/Save job (favorite table in schema)
// Backend endpoints: POST /jobs/:jobId/favorite and DELETE /jobs/:jobId/favorite
export const toggleBookmark = async (jobId, isBookmarked) => {
  try {
    const method = isBookmarked ? 'DELETE' : 'POST';
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/favorite`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
};

// Get job categories/filters
// Schema: job_category table có các trường: JCName, Specialty
export const fetchJobCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get skills list (backend chưa có endpoint riêng, fallback mảng rỗng)
export const fetchSkills = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/skills`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback nếu 404 hoặc chưa triển khai
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};