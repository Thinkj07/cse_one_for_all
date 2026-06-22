import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, Settings, SettingsIcon, Bell, Bookmark, Layers2, LogOut, Clock, Globe } from 'lucide-react';
import '../styles/CandidateDashboard.css';
import '../styles/CandidateSetting.css';
import PersonalTab from '../components/Settings/PersonalTab';
import ProfileTab from '../components/Settings/ProfileTab';
import SocialLinksTab from '../components/Settings/SocialLinksTab';
import AccountSettingTab from '../components/Settings/AccountSettingTab';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function CandidateSetting() {
  const navigate = useNavigate();
  
  const [activeMenu, setActiveMenu] = useState('setting');
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    personal: {},
    profile: {},
    socialLinks: [],
    settings: {}
  });

  useEffect(() => {
    // Kiểm tra authentication
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.log('⚠️ Chưa đăng nhập, chuyển về trang đăng nhập');
      navigate('/signin');
      return;
    }

    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    console.log('🚀 Fetching candidate profile data...');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!token || !userStr) {
        throw new Error('Không tìm thấy token hoặc user info');
      }

      const user = JSON.parse(userStr);
      const candidateId = user.candidateId || user.id;

      console.log('👤 Candidate ID:', candidateId);

      // GET /api/candidate/profile?candidateId=X
      const response = await fetch(
        `${API_BASE_URL}/candidate/profile?candidateId=${candidateId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error('Không thể tải thông tin profile');
      }

      const data = await response.json();
      console.log('📦 Profile data:', data);

      if (data.success && data.data) {
        // Map data từ API
        setProfileData({
          personal: {
            fullName: data.data.fullName || user.fullName,
            email: data.data.email || user.email,
            phone: data.data.phone || data.data.Phonenumber || '',
            dateOfBirth: data.data.dateOfBirth || data.data.Bdate || '',
            address: data.data.address || data.data.Address || '',
            avatar: data.data.avatar || data.data.Profile_Picture || ''
          },
          profile: {
            yearsOfExperience: data.data.YearOfExperience || 0,
            skills: data.data.skills || [],
            education: data.data.education || [],
            jobHistory: data.data.jobHistory || [],
            certificates: data.data.certificates || []
          },
          socialLinks: data.data.socialLinks || [],
          settings: {
            profilePublic: data.data.profilePublic !== false,
            resumePublic: data.data.resumePublic === true
          }
        });

        console.log('✅ Profile data loaded successfully');
      } else {
        // Dùng data từ localStorage
        console.log('⚠️ API không trả data, dùng user info từ storage');
        setProfileData({
          personal: {
            fullName: user.fullName || '',
            email: user.email || '',
            phone: '',
            dateOfBirth: '',
            address: '',
            avatar: ''
          },
          profile: {
            yearsOfExperience: 0,
            skills: [],
            education: [],
            jobHistory: [],
            certificates: []
          },
          socialLinks: [],
          settings: {
            profilePublic: true,
            resumePublic: false
          }
        });
      }

    } catch (err) {
      console.error('❌ Lỗi fetch profile:', err);
      setError(err.message);

      // Nếu lỗi token, logout
      if (err.message.includes('Token') || err.message.includes('401')) {
        console.log('🔒 Token không hợp lệ, đăng xuất...');
        handleLogout();
      }
    } finally {
      setLoading(false);
      console.log('🏁 Kết thúc fetch profile');
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    console.log('💾 Updating profile:', updatedData);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      const user = JSON.parse(userStr);
      const candidateId = user.candidateId || user.id;

      // PUT /api/candidate/profile
      const response = await fetch(`${API_BASE_URL}/candidate/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateId,
          ...updatedData
        })
      });

      console.log('📡 Update response status:', response.status);

      if (!response.ok) {
        throw new Error('Không thể cập nhật profile');
      }

      const data = await response.json();
      console.log('✅ Profile updated:', data);

      // Refresh profile data
      await fetchProfileData();
      
      return { success: true, message: 'Cập nhật thành công!' };
    } catch (err) {
      console.error('❌ Lỗi update profile:', err);
      return { success: false, message: err.message };
    }
  };

  const handleUpdateAvatar = async (avatarUrl) => {
    console.log('🖼️ Updating avatar:', avatarUrl);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      const user = JSON.parse(userStr);
      const candidateId = user.candidateId || user.id;

      // POST /api/candidate/avatar
      const response = await fetch(`${API_BASE_URL}/candidate/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateId,
          avatar: avatarUrl
        })
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật avatar');
      }

      const data = await response.json();
      console.log('✅ Avatar updated:', data);

      await fetchProfileData();
      return { success: true };
    } catch (err) {
      console.error('❌ Lỗi update avatar:', err);
      return { success: false, message: err.message };
    }
  };

  const handleChangePassword = async (passwordData) => {
    console.log('🔐 Changing password...');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      const user = JSON.parse(userStr);
      const candidateId = user.candidateId || user.id;

      // PUT /api/candidate/password
      const response = await fetch(`${API_BASE_URL}/candidate/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể đổi mật khẩu');
      }

      const data = await response.json();
      console.log('✅ Password changed:', data);

      return { success: true, message: 'Đổi mật khẩu thành công!' };
    } catch (err) {
      console.error('❌ Lỗi change password:', err);
      return { success: false, message: err.message };
    }
  };

  const handleLogout = () => {
    console.log('👋 Đăng xuất...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className="candidate-dashboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Đang tải thông tin cài đặt...
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard-container">
      {/* Sidebar */}
      <aside className="candidate-dashboard-sidebar">
        <div className="db-sidebar-header">
          <span className="db-sidebar-title">BẢNG ĐIỀU KHIỂN ỨNG VIÊN</span>
        </div>

        <nav className="db-sidebar-nav">
          <Link 
            to="/candidate-dashboard" 
            className={`db-nav-item ${activeMenu === 'overview' ? 'active' : ''}`}
          >
            <Layers2 size={20} />
            <span>Tổng quan</span>
          </Link>

          <Link 
            to="/candidate-dashboard/applied-jobs" 
            className={`db-nav-item ${activeMenu === 'applied' ? 'active' : ''}`}
          >
            <Briefcase size={20} />
            <span>Việc đã ứng tuyển</span>
          </Link>

          <Link 
            to="/candidate-dashboard/favourite-jobs" 
            className={`db-nav-item ${activeMenu === 'favourite' ? 'active' : ''}`}
          >
            <Bookmark size={20} />
            <span>Việc yêu thích</span>
          </Link>

          <Link 
            to="/candidate-dashboard/notifications" 
            className={`db-nav-item ${activeMenu === 'alerts' ? 'active' : ''}`}
          >
            <Bell size={20} />
            <span>Thông báo việc làm</span>
          </Link>

          <Link 
            to="/candidate-dashboard/setting" 
            className={`db-nav-item ${activeMenu === 'setting' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Cài đặt</span>
          </Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-candidate">
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FEE',
            border: '1px solid #FCC',
            borderRadius: '6px',
            color: '#C33',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <div className="jobpilot-settings-page">
          <div className="jobpilot-settings-container">
            <h1 className="jobpilot-settings-title">Settings</h1>

            <div className="jobpilot-settings-tabs">
              <button 
                className={`jobpilot-settings-tab ${activeTab === 'personal' ? 'jobpilot-settings-tab-active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <User size={20} />
                Personal
              </button>

              <button 
                className={`jobpilot-settings-tab ${activeTab === 'profile' ? 'jobpilot-settings-tab-active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <Clock size={20} />
                Profile
              </button>

              <button 
                className={`jobpilot-settings-tab ${activeTab === 'social' ? 'jobpilot-settings-tab-active' : ''}`}
                onClick={() => setActiveTab('social')}
              >
                <Globe size={20} />
                Social Links
              </button>

              <button 
                className={`jobpilot-settings-tab ${activeTab === 'account' ? 'jobpilot-settings-tab-active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <SettingsIcon size={20} />
                Account Setting
              </button>
            </div>

            <div className="jobpilot-settings-content">
              {activeTab === 'personal' && (
                <PersonalTab 
                  data={profileData.personal}
                  onUpdate={handleUpdateProfile}
                  onUpdateAvatar={handleUpdateAvatar}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileTab 
                  data={profileData.profile}
                  onUpdate={handleUpdateProfile}
                />
              )}
              {activeTab === 'social' && (
                <SocialLinksTab 
                  data={profileData.socialLinks}
                  onUpdate={handleUpdateProfile}
                />
              )}
              {activeTab === 'account' && (
                <AccountSettingTab 
                  data={profileData.settings}
                  onUpdate={handleUpdateProfile}
                  onChangePassword={handleChangePassword}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}