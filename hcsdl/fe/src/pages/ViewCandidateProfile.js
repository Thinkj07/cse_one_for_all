import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft,
  Mail,
  Cake,
  MapPin,
  Flag,
  User,
  Briefcase,
  GraduationCap,
  Globe,
  Phone,
  Bookmark,
  Download,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Award,
  Check,
  X
} from 'lucide-react';
import EmployerLayout from '../components/EmployerLayout';
import '../styles/ViewCandidateProfile.css';

const ViewCandidateProfile = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [updating, setUpdating] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Kiểm tra xem có dữ liệu từ state không (khi navigate từ WatchCandidate)
    if (location.state?.candidateData) {
      const data = location.state.candidateData;
      console.log('📦 Dữ liệu ứng viên từ state:', data);
      console.log('📦 Candidate object:', data.candidate);
      console.log('📅 Ngày sinh (Bdate):', data.candidate?.Bdate);
      console.log('📅 Tất cả keys trong candidate:', data.candidate ? Object.keys(data.candidate) : 'undefined');
      
      // Lấy jobId và status từ data
      if (location.state.jobId) {
        setJobId(location.state.jobId);
        
        // Kiểm tra status đã lưu trong localStorage trước
        const savedStatus = localStorage.getItem(`application_status_${location.state.jobId}_${candidateId}`);
        if (savedStatus) {
          console.log('📌 Phục hồi status từ localStorage:', savedStatus);
          setApplicationStatus(savedStatus);
        } else if (data.Status_apply) {
          setApplicationStatus(data.Status_apply);
        }
      } else if (data.Status_apply) {
        setApplicationStatus(data.Status_apply);
      }
      
      // Nếu không có Bdate trong state, fetch thêm từ API
      const needFetchMoreData = !data.candidate?.Bdate;
      
      if (needFetchMoreData) {
        console.log('⚠️ Thiếu dữ liệu Bdate, sẽ fetch từ API candidate profile');
        // Set dữ liệu tạm thời trước
        const tempProfileData = {
          fullName: `${data.candidate.FName} ${data.candidate.LName}`,
          FName: data.candidate.FName,
          LName: data.candidate.LName,
          email: data.candidate.Email,
          phone: data.candidate.Phonenumber,
          avatar: data.candidate.Profile_Picture,
          location: data.candidate.Address,
          dateOfBirth: null, // Sẽ fetch sau
          Username: data.candidate.Username,
          savedCv: data.profile?.savedCv,
          experience: `${data.profile?.YearOfExperience || 0} năm`,
          YearOfExperience: data.profile?.YearOfExperience || 0,
          Award: data.profile?.Award,
          CoverLetter: data.CoverLetter,
          upLoadCV: data.upLoadCV,
          biography: data.profile?.Biography,
          education: data.profile?.Education,
          gender: data.candidate.Gender,
          nationality: data.candidate.Nationality,
          maritalStatus: data.candidate.MaritalStatus,
          website: data.profile?.Website,
          socialLinks: []
        };
        setCandidate(tempProfileData);
        setLoading(false);
        
        // Fetch thêm thông tin từ API
        fetchAdditionalCandidateInfo(candidateId, tempProfileData);
        return;
      }
      
      // Map dữ liệu từ WatchCandidate sang format phù hợp
      const profileData = {
        fullName: `${data.candidate.FName} ${data.candidate.LName}`,
        FName: data.candidate.FName,
        LName: data.candidate.LName,
        email: data.candidate.Email,
        phone: data.candidate.Phonenumber,
        avatar: data.candidate.Profile_Picture,
        location: data.candidate.Address,
        dateOfBirth: data.candidate.Bdate,
        Username: data.candidate.Username,
        savedCv: data.profile?.savedCv,
        experience: `${data.profile?.YearOfExperience || 0} năm`,
        YearOfExperience: data.profile?.YearOfExperience || 0,
        Award: data.profile?.Award,
        CoverLetter: data.CoverLetter,
        upLoadCV: data.upLoadCV,
        biography: data.profile?.Biography,
        education: data.profile?.Education,
        gender: data.candidate.Gender,
        nationality: data.candidate.Nationality,
        maritalStatus: data.candidate.MaritalStatus,
        website: data.profile?.Website,
        socialLinks: []
      };
      
      console.log('✅ Profile data với dateOfBirth:', profileData.dateOfBirth);
      setCandidate(profileData);
      setLoading(false);
      return;
    }

    // Nếu không có data từ state, fetch từ API candidate profile
    const fetchCandidateProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Sử dụng API candidate profile
        const response = await fetch(`${API_BASE_URL}/candidate/profile?candidateId=${candidateId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (!response.ok) {
          throw new Error('Không thể tải thông tin ứng viên');
        }

        const result = await response.json();
        console.log('📦 Thông tin ứng viên từ API:', result);

        if (result.success && result.data) {
          // Map dữ liệu từ API response
          const apiData = result.data;
          console.log('📅 DateOfBirth từ API:', apiData.dateOfBirth);
          
          const nameParts = apiData.fullName ? apiData.fullName.split(' ') : ['', ''];
          const profileData = {
            fullName: apiData.fullName,
            FName: nameParts.slice(0, -1).join(' ') || nameParts[0],
            LName: nameParts[nameParts.length - 1],
            email: apiData.email,
            phone: apiData.phone,
            avatar: apiData.avatar,
            location: apiData.location,
            dateOfBirth: apiData.dateOfBirth,
            Username: apiData.fullName,
            savedCv: apiData.savedCv,
            experience: apiData.experience,
            YearOfExperience: parseInt(apiData.experience) || 0,
            Award: apiData.award,
            biography: apiData.biography,
            education: apiData.education,
            gender: apiData.gender,
            nationality: apiData.nationality,
            maritalStatus: apiData.maritalStatus,
            website: apiData.website,
            socialLinks: apiData.socialLinks || []
          };
          console.log('📦 Profile data mapped:', profileData);
          setCandidate(profileData);
        }
      } catch (error) {
        console.error('❌ Lỗi khi tải thông tin ứng viên:', error);
        // Mock data để test
        setCandidate({
          fullName: 'Nguyễn Văn A',
          FName: 'Nguyễn Văn',
          LName: 'A',
          email: 'nguyenvana@gmail.com',
          phone: '0123456789',
          avatar: null,
          location: 'Quận 1, TP. Hồ Chí Minh',
          dateOfBirth: '1995-06-14',
          Username: 'nguyenvana',
          savedCv: 'NguyenVanA-CV.pdf',
          experience: '5 năm',
          YearOfExperience: 5,
          Award: 'Nhân viên xuất sắc năm 2023'
        });
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidateProfile();
    }
  }, [candidateId, location.state, API_BASE_URL]);

  // Hàm fetch thêm thông tin candidate (Bdate, v.v.)
  const fetchAdditionalCandidateInfo = async (candidateId, existingData) => {
    try {
      console.log('🔄 Fetching additional candidate info for:', candidateId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/candidate/profile?candidateId=${candidateId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Additional info response:', result);
        
        if (result.success && result.data) {
          const apiData = result.data;
          console.log('📅 DateOfBirth từ additional API:', apiData.dateOfBirth);
          
          // Merge với dữ liệu hiện tại
          setCandidate(prev => ({
            ...prev,
            dateOfBirth: apiData.dateOfBirth || prev.dateOfBirth,
            biography: apiData.biography || prev.biography,
            education: apiData.education || prev.education,
            nationality: apiData.nationality || prev.nationality,
            maritalStatus: apiData.maritalStatus || prev.maritalStatus,
            website: apiData.website || prev.website
          }));
          console.log('✅ Đã cập nhật dateOfBirth:', apiData.dateOfBirth);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching additional info:', error);
    }
  };

  const handleDownloadResume = () => {
    if (candidate?.savedCv) {
      console.log('Đang tải CV:', candidate.savedCv);
      // TODO: Implement actual download logic
      // window.open(`${API_BASE_URL}/files/${candidate.savedCv}`, '_blank');
      alert('Chức năng tải CV đang được phát triển');
    }
  };

  const handleApprove = async () => {
    if (!jobId || !candidateId) {
      alert('Thiếu thông tin để duyệt ứng viên');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn duyệt ứng viên này?')) {
      try {
        setUpdating(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        console.log('🔄 Đang gửi request duyệt ứng viên...');
        console.log('URL:', `${API_BASE_URL}/applications/${jobId}/${candidateId}/status`);
        console.log('Body:', { Status_apply: 'Approved' });
        
        const response = await fetch(`${API_BASE_URL}/applications/${jobId}/${candidateId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ Status_apply: 'Approved' })
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        console.log('📥 Response headers:', response.headers);
        
        // Clone response trước khi đọc để có thể đọc lại nếu cần
        const responseClone = response.clone();
        let result = null;
        
        try {
          // Thử parse JSON trước
          result = await response.json();
          console.log('✅ Response JSON parsed:', result);
        } catch (jsonError) {
          console.warn('⚠️ Không thể parse JSON, thử đọc text:', jsonError);
          try {
            const text = await responseClone.text();
            console.log('📄 Response text:', text);
            result = { success: response.ok, message: text || 'No response body' };
          } catch (textError) {
            console.error('❌ Không thể đọc response:', textError);
            result = { success: response.ok, message: 'Cannot read response' };
          }
        }
        
        console.log('📦 Final result:', result);
        
        if (response.ok) {
          setApplicationStatus('Approved');
          // Lưu status vào localStorage để giữ sau khi reload
          localStorage.setItem(`application_status_${jobId}_${candidateId}`, 'Approved');
          console.log('✅ Đã lưu status Approved vào localStorage');
          alert('Đã duyệt ứng viên thành công!');
        } else {
          throw new Error(result?.message || `Lỗi ${response.status}: Không thể duyệt ứng viên`);
        }
      } catch (error) {
        console.error('❌ Lỗi khi duyệt ứng viên:', error);
        alert(`Có lỗi xảy ra: ${error.message}`);
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleReject = async () => {
    if (!jobId || !candidateId) {
      alert('Thiếu thông tin để từ chối ứng viên');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn từ chối ứng viên này?')) {
      try {
        setUpdating(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        console.log('🔄 Đang gửi request từ chối ứng viên...');
        console.log('URL:', `${API_BASE_URL}/applications/${jobId}/${candidateId}/status`);
        console.log('Body:', { Status_apply: 'Rejected' });
        
        const response = await fetch(`${API_BASE_URL}/applications/${jobId}/${candidateId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ Status_apply: 'Rejected' })
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        console.log('📥 Response headers:', response.headers);
        
        // Clone response trước khi đọc để có thể đọc lại nếu cần
        const responseClone = response.clone();
        let result = null;
        
        try {
          // Thử parse JSON trước
          result = await response.json();
          console.log('✅ Response JSON parsed:', result);
        } catch (jsonError) {
          console.warn('⚠️ Không thể parse JSON, thử đọc text:', jsonError);
          try {
            const text = await responseClone.text();
            console.log('📄 Response text:', text);
            result = { success: response.ok, message: text || 'No response body' };
          } catch (textError) {
            console.error('❌ Không thể đọc response:', textError);
            result = { success: response.ok, message: 'Cannot read response' };
          }
        }
        
        console.log('📦 Final result:', result);
        
        if (response.ok) {
          setApplicationStatus('Rejected');
          // Lưu status vào localStorage để giữ sau khi reload
          localStorage.setItem(`application_status_${jobId}_${candidateId}`, 'Rejected');
          console.log('✅ Đã lưu status Rejected vào localStorage');
          alert('Đã từ chối ứng viên!');
        } else {
          throw new Error(result?.message || `Lỗi ${response.status}: Không thể từ chối ứng viên`);
        }
      } catch (error) {
        console.error('❌ Lỗi khi từ chối ứng viên:', error);
        alert(`Có lỗi xảy ra: ${error.message}`);
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleSendMail = () => {
    if (candidate?.email) {
      window.location.href = `mailto:${candidate.email}`;
    }
  };

  const getInitials = (fname, lname) => {
    return `${fname?.[0] || ''}${lname?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log('⚠️ Không có dateString');
      return 'Chưa cập nhật';
    }
    try {
      console.log('📅 Format date input:', dateString, 'Type:', typeof dateString);
      const date = new Date(dateString);
      console.log('📅 Date object:', date, 'Valid:', !isNaN(date.getTime()));
      
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date:', dateString);
        return 'Chưa cập nhật';
      }
      
      const formatted = date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      console.log('✅ Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ Lỗi format date:', error, 'Input:', dateString);
      return 'Chưa cập nhật';
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thông tin ứng viên...</p>
        </div>
      </EmployerLayout>
    );
  }

  if (!candidate) {
    return (
      <EmployerLayout>
        <div className="error-container">
          <p>Không tìm thấy ứng viên</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} /> Quay lại
          </button>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="candidate-profile-container">
        
        {/* Header with back button */}
        <div className="profile-header">
          <button onClick={() => navigate(-1)} className="btn-back-arrow">
            <ArrowLeft size={20} />
            <span>Quay lại danh sách ứng viên</span>
          </button>
        </div>

        <div className="profile-content">
          
          {/* Left Column */}
          <div className="profile-left">
            
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-avatar-section">
                {candidate.avatar ? (
                  <img src={candidate.avatar} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {getInitials(candidate.FName, candidate.LName)}
                  </div>
                )}
              </div>

              <h1 className="profile-name">
                {candidate.fullName || `${candidate.FName} ${candidate.LName}`}
              </h1>
              <p className="profile-title">@{candidate.Username || 'ứng viên'}</p>

              {/* Action Buttons */}
              <div className="profile-actions">
                <button 
                  className={`btn-save ${isSaved ? 'saved' : ''}`}
                  onClick={() => setIsSaved(!isSaved)}
                  title={isSaved ? 'Bỏ lưu' : 'Lưu ứng viên'}
                  disabled={updating}
                >
                  <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                <button 
                  className="btn-approve" 
                  onClick={handleApprove}
                  disabled={updating || applicationStatus === 'Approved' || applicationStatus === 'Duyet'}
                >
                  <Check size={20} />
                  {(applicationStatus === 'Approved' || applicationStatus === 'Duyet') ? 'Đã duyệt' : 'Duyệt'}
                </button>
                <button 
                  className="btn-reject" 
                  onClick={handleReject}
                  disabled={updating || applicationStatus === 'Rejected' || applicationStatus === 'Tu choi'}
                >
                  <X size={20} />
                  {(applicationStatus === 'Rejected' || applicationStatus === 'Tu choi') ? 'Đã từ chối' : 'Từ chối'}
                </button>
              </div>
            </div>

            {/* Biography Section */}
            {candidate.biography && (
              <div className="profile-section">
                <h3 className="section-title">Tiểu sử</h3>
                <p className="biography-text">{candidate.biography}</p>
              </div>
            )}

            {/* Awards Section */}
            {candidate.Award && (
              <div className="profile-section">
                <h3 className="section-title">Giải thưởng & Thành tích</h3>
                <div className="awards-content">
                  <Award size={20} className="award-icon" />
                  <p className="award-text">{candidate.Award}</p>
                </div>
              </div>
            )}

            {/* Social Media - Placeholder for future implementation */}
            <div className="profile-section">
              <h3 className="section-title">Mạng xã hội</h3>
              <div className="social-links">
                {candidate.socialLinks && candidate.socialLinks.length > 0 ? (
                  candidate.socialLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="social-icon facebook" title={link.platform}>
                      <Facebook size={20} />
                    </a>
                  ))
                ) : (
                  <>
                    <a href="#" className="social-icon facebook" title="Facebook">
                      <Facebook size={20} />
                    </a>
                    <a href="#" className="social-icon twitter" title="Twitter">
                      <Twitter size={20} />
                    </a>
                    <a href="#" className="social-icon linkedin" title="LinkedIn">
                      <Linkedin size={20} />
                    </a>
                    <a href="#" className="social-icon youtube" title="YouTube">
                      <Youtube size={20} />
                    </a>
                    <a href="#" className="social-icon instagram" title="Instagram">
                      <Instagram size={20} />
                    </a>
                  </>
                )}
              </div>
              {(!candidate.socialLinks || candidate.socialLinks.length === 0) && (
                <p className="social-note">Chức năng liên kết mạng xã hội đang được phát triển</p>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="profile-right">
            
            {/* Info Grid */}
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <Cake size={24} />
                </div>
                <div className="info-content">
                  <span className="info-label">NGÀY SINH</span>
                  <span className="info-value">
                    {formatDate(candidate.dateOfBirth)}
                    {calculateAge(candidate.dateOfBirth) && (
                      <span className="info-age"> ({calculateAge(candidate.dateOfBirth)} tuổi)</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <MapPin size={24} />
                </div>
                <div className="info-content">
                  <span className="info-label">ĐỊA CHỈ</span>
                  <span className="info-value">{candidate.location || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Briefcase size={24} />
                </div>
                <div className="info-content">
                  <span className="info-label">KINH NGHIỆM</span>
                  <span className="info-value">{candidate.experience || `${candidate.YearOfExperience || 0} năm`}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <User size={24} />
                </div>
                <div className="info-content">
                  <span className="info-label">GIỚI TÍNH</span>
                  <span className="info-value">{candidate.gender || 'Chưa cập nhật'}</span>
                </div>
              </div>

              {candidate.nationality && (
                <div className="info-item">
                  <div className="info-icon">
                    <Flag size={24} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">QUỐC TỊCH</span>
                    <span className="info-value">{candidate.nationality}</span>
                  </div>
                </div>
              )}

              {candidate.maritalStatus && (
                <div className="info-item">
                  <div className="info-icon">
                    <User size={24} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">TÌNH TRẠNG HÔN NHÂN</span>
                    <span className="info-value">{candidate.maritalStatus}</span>
                  </div>
                </div>
              )}

              {candidate.education && (
                <div className="info-item">
                  <div className="info-icon">
                    <GraduationCap size={24} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">HỌC VẤN</span>
                    <span className="info-value">{candidate.education}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Download Resume */}
            {candidate.savedCv && (
              <div className="resume-section">
                <h3 className="section-title">Tải CV</h3>
                <div className="resume-card" onClick={handleDownloadResume}>
                  <div className="resume-info">
                    <span className="resume-name">{candidate.savedCv}</span>
                    <span className="resume-format">PDF</span>
                  </div>
                  <button className="btn-download">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="contact-section">
              <h3 className="section-title">Thông tin liên hệ</h3>

              {candidate.website && (
                <div className="contact-item">
                  <div className="contact-icon">
                    <Globe size={20} />
                  </div>
                  <div className="contact-details">
                    <span className="contact-label">WEBSITE</span>
                    <a href={candidate.website.startsWith('http') ? candidate.website : `https://${candidate.website}`} target="_blank" rel="noopener noreferrer" className="contact-value link">
                      {candidate.website}
                    </a>
                  </div>
                </div>
              )}

              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={20} />
                </div>
                <div className="contact-details">
                  <span className="contact-label">ĐỊA CHỈ</span>
                  <span className="contact-value">{candidate.location || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={20} />
                </div>
                <div className="contact-details">
                  <span className="contact-label">SỐ ĐIỆN THOẠI</span>
                  <a href={`tel:${candidate.phone}`} className="contact-value link">
                    {candidate.phone || 'Chưa cập nhật'}
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={20} />
                </div>
                <div className="contact-details">
                  <span className="contact-label">EMAIL</span>
                  <a href={`mailto:${candidate.email}`} className="contact-value link">
                    {candidate.email}
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </EmployerLayout>
  );
};

export default ViewCandidateProfile;
