import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MapPin, 
  Clock, // Thay Briefcase bằng Clock cho giống mẫu '3 Years experience' hoặc dùng Briefcase tùy ý
  Briefcase,
  Bookmark, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  Download,
  FileText
} from 'lucide-react';
import EmployerLayout from '../components/EmployerLayout';
import '../styles/WatchCandidate.css';

const WatchCandidate = () => {
  const navigate = useNavigate();
  const { jobId } = useParams(); // Lấy jobId từ URL
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState('all');
  const [employerJobs, setEmployerJobs] = useState([]);
  const [savedCandidates, setSavedCandidates] = useState(new Set());
  const [employerId, setEmployerId] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const mockEmployerId = 1;

  // --- LOGIC AUTH & FETCH API (GIỮ NGUYÊN NHƯ CŨ) ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    console.log('👤 Stored user:', storedUser);
    console.log('🔑 Has token:', !!storedToken);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('📋 User data:', userData);
        
        if (userData.role === 'EMPLOYER' && userData.employerId) {
          setEmployerId(userData.employerId);
          console.log('✅ EmployerId from user:', userData.employerId);
        } else if (userData.employerId) {
          setEmployerId(userData.employerId);
          console.log('✅ EmployerId found:', userData.employerId);
        } else {
          console.warn('⚠️ No employerId in user data, using mock');
          setEmployerId(mockEmployerId);
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        setEmployerId(mockEmployerId);
      }
    } else {
      console.warn('⚠️ No user in storage, using mock employerId');
      setEmployerId(mockEmployerId);
    }
  }, [navigate]);

  // Tự động chọn job nếu có jobId từ URL
  useEffect(() => {
    if (jobId) {
      console.log('🎯 Auto-selecting job from URL:', jobId);
      setSelectedJob(jobId);
    }
  }, [jobId]);

  useEffect(() => {
    if (!employerId) return;
    const fetchEmployerJobs = async () => {
      try {
        console.log('🔍 Fetching jobs for employerId:', employerId);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/employer/${employerId}/jobs`, {
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }) 
          }
        });
        
        console.log('📡 Jobs API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📦 Jobs API result:', result);
          
          if (result.success && result.data && result.data.jobs) {
            setEmployerJobs(result.data.jobs);
            console.log('✅ Jobs loaded:', result.data.jobs);
          } else {
            console.warn('⚠️ No jobs in response, using mock data');
            setEmployerJobs([
              { JobID: 1, JobName: 'Senior Frontend Developer' },
              { JobID: 2, JobName: 'UX/UI Designer' },
              { JobID: 3, JobName: 'Backend Engineer' },
            ]);
          }
        } else {
          console.error('❌ Jobs API error, status:', response.status);
          // Mock jobs for testing
          setEmployerJobs([
            { JobID: 1, JobName: 'Senior Frontend Developer' },
            { JobID: 2, JobName: 'UX/UI Designer' },
            { JobID: 3, JobName: 'Backend Engineer' },
          ]);
        }
      } catch (error) {
        console.error('❌ Error fetching jobs:', error);
        // Mock jobs
        setEmployerJobs([
          { JobID: 1, JobName: 'Senior Frontend Developer' },
          { JobID: 2, JobName: 'UX/UI Designer' },
          { JobID: 3, JobName: 'Backend Engineer' },
        ]);
      }
    };
    fetchEmployerJobs();
  }, [employerId, API_BASE_URL]);

  useEffect(() => {
    console.log('📌 Selected Job changed:', selectedJob);
    console.log('📌 Employer ID:', employerId);
    
    if (!employerId || selectedJob === 'all') {
      setCandidates([]);
      setStatistics(null);
      return;
    }
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        console.log('🚀 Fetching applications for JobID:', selectedJob);
        const token = localStorage.getItem('token');
        
        // Gọi API GET /api/jobs/:jobId/applications
        const response = await fetch(`${API_BASE_URL}/jobs/${selectedJob}/applications`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const result = await response.json();
        console.log('📦 Applications response:', result);

        if (result.success && result.data && result.data.applications) {
          // Map dữ liệu từ API - cấu trúc đã đúng từ backend
          const mappedCandidates = result.data.applications.map(app => ({
            CandidateID: app.CandidateID,
            candidate: app.candidate, // { FName, LName, Email, Phonenumber, Profile_Picture, Address }
            CoverLetter: app.CoverLetter || 'Applicant',
            profile: app.profile, // { YearOfExperience, savedCv }
            upLoadCV: app.upLoadCV,
            Status_apply: app.Status_apply,
            AppliedDate: app.AppliedDate
          }));

          setCandidates(mappedCandidates);
          setStatistics(result.data.statistics || null);
          console.log('✅ Mapped candidates:', mappedCandidates);
          console.log('📊 Statistics:', result.data.statistics);
        } else {
          setCandidates([]);
          setStatistics(null);
        }
      } catch (error) {
        console.error('❌ Error fetching candidates:', error);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [selectedJob, employerId, API_BASE_URL]);

  // Handle Handlers
  const handleToggleSave = (id) => {
    setSavedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const getInitials = (f, l) => `${f?.[0]||''}${l?.[0]||''}`.toUpperCase();

  return (
    <EmployerLayout>
      <div className="watch-candidate-container">
        {/* ===== MAIN CONTENT ===== */}
        <main className="content-area">
          
          {/* Job Select Dropdown */}
          <div className="job-select-wrapper">
            <select 
              className="job-select"
              value={selectedJob}
              onChange={(e) => {
                console.log('🎯 Job selected:', e.target.value);
                setSelectedJob(e.target.value);
              }}
            >
              <option value="all">-- Select a Job to View Candidates --</option>
              {employerJobs.map(job => (
                <option key={job.JobID} value={job.JobID}>{job.JobName}</option>
              ))}
            </select>
            {employerJobs.length === 0 && (
              <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px' }}>
                No jobs found. Please post a job first.
              </p>
            )}
          </div>

          {/* Statistics */}
          {statistics && selectedJob !== 'all' && (
            <div className="statistics-bar">
              <div className="stat-item">
                <span className="stat-label">Total Applications:</span>
                <span className="stat-value">{statistics.total || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending:</span>
                <span className="stat-value pending">{statistics.pending || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Approved:</span>
                <span className="stat-value approved">{statistics.approved || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rejected:</span>
                <span className="stat-value rejected">{statistics.rejected || 0}</span>
              </div>
            </div>
          )}

          {/* Candidate List or States */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading candidates...</p>
            </div>
          )}

          {!loading && selectedJob === 'all' && (
            <div className="empty-state">
              <FileText size={48} color="#d1d5db" style={{marginBottom: 10}}/>
              <p>Please select a job to view applications</p>
            </div>
          )}

          {!loading && selectedJob !== 'all' && candidates.length === 0 && (
            <div className="empty-state">
              <p>No candidates found for this job.</p>
            </div>
          )}

          {/* LIST */}
          {!loading && candidates.length > 0 && (
            <div className="candidates-list">
              {candidates.map((item) => (
                <div key={item.CandidateID} className="candidate-card">
                  
                  {/* Left Side */}
                  <div className="candidate-left">
                    <div className="candidate-avatar">
                      {item.candidate.Profile_Picture ? (
                        <img src={item.candidate.Profile_Picture} alt="avatar" />
                      ) : (
                        <div className="avatar-initials">
                          {getInitials(item.candidate.FName, item.candidate.LName)}
                        </div>
                      )}
                    </div>
                    
                    <div className="candidate-info">
                      <h3 className="candidate-name">
                        {item.candidate.FName} {item.candidate.LName}
                      </h3>
                      <p className="candidate-position">{item.CoverLetter || 'Applicant'}</p>
                      
                      <div className="candidate-meta">
                        <div className="meta-item">
                          <MapPin size={16} />
                          <span>{item.candidate.Address || 'New York'}</span>
                        </div>
                        <div className="meta-item">
                          <Clock size={16} /> {/* Dùng Clock hoặc Briefcase */}
                          <span>{item.profile.YearOfExperience || 0} Years experience</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side (Actions) */}
                  <div className="candidate-right">
                    <div className="candidate-actions">
                      <button 
                        className={`btn-icon ${savedCandidates.has(item.CandidateID) ? 'saved' : ''}`}
                        onClick={() => handleToggleSave(item.CandidateID)}
                      >
                        <Bookmark size={20} strokeWidth={savedCandidates.has(item.CandidateID) ? 2.5 : 2} />
                      </button>

                      <button 
                        className="btn-view-profile"
                        onClick={() => navigate(`/candidate/${item.CandidateID}`, { 
                          state: { 
                            candidateData: item,
                            jobId: selectedJob 
                          } 
                        })}
                      >
                        View Profile <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </EmployerLayout>
  );
};

export default WatchCandidate;