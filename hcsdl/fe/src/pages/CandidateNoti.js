import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Briefcase, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  LogOut,
  Trash2,
  Check,
  Bookmark,
  Filter,
  Settings,
  Search,
  Layers2
} from 'lucide-react';
import '../styles/CandidateNoti.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Fallback data
const FALLBACK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'application',
    title: 'Application Viewed',
    message: 'Your application has been viewed by the employer.',
    company: 'Company Name',
    time: '2 hours ago',
    isRead: false,
    icon: 'briefcase'
  }
];

const CandidateNoti = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('notifications');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 20,
    totalPages: 1,
    totalNotifications: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.log('⚠️ Chưa đăng nhập, chuyển về trang đăng nhập');
      navigate('/signin');
      return;
    }

    fetchNotifications();
  }, [pagination.currentPage]);

  // useEffect(() => {
  //   // Kiểm tra đăng nhập
  //   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  //   if (!token) {
  //     console.log('⚠️ Chưa đăng nhập, chuyển về trang đăng nhập');
  //     navigate('/signin');
  //     return;
    // //   }

    //   fetchNotifications();
    // }, [pagination.currentPage]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    
    console.log('🚀 Bắt đầu fetch notifications...');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!token || !userStr) {
        throw new Error('Không tìm thấy token hoặc user info');
      }

      const user = JSON.parse(userStr);
      const candidateId = user.candidateId || user.id;

      console.log('👤 Candidate ID:', candidateId);

      // GET /api/candidate/notifications?candidateId=X&page=X&limit=X
      const response = await fetch(
        `${API_BASE_URL}/candidate/notifications?candidateId=${candidateId}&page=${pagination.currentPage}&limit=${pagination.limit}`,
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
        throw new Error('Không thể tải thông báo');
      }

      const data = await response.json();
      console.log('📦 Notifications data:', data);

      if (data.success && data.data) {
        // Map notifications từ API
        const mappedNotifications = (data.data.notifications || []).map(notif => ({
          id: notif.id || notif.NotificationID,
          type: notif.type || 'application',
          title: notif.title || 'Thông báo',
          message: notif.message || notif.content || '',
          company: notif.company || notif.companyName || 'Company',
          time: notif.time || (notif.createdAt ? getTimeAgo(notif.createdAt) : 'N/A'),
          isRead: notif.isRead || false,
          icon: getIconFromType(notif.type || 'application')
        }));

        console.log('✅ Mapped notifications:', mappedNotifications);
        setNotifications(mappedNotifications);

        // Update pagination nếu có
        if (data.data.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: data.data.pagination.totalPages || 1,
            totalNotifications: data.data.pagination.total || mappedNotifications.length
          }));
        }
      } else {
        // Không có data, dùng mảng rỗng
        console.log('⚠️ Không có notifications');
        setNotifications([]);
      }

    } catch (err) {
      console.error('❌ Lỗi fetch notifications:', err);
      setError(err.message);

      // Nếu lỗi token, logout
      if (err.message.includes('Token') || err.message.includes('401')) {
        console.log('🔒 Token không hợp lệ, đăng xuất...');
        handleLogout();
      } else {
        // Dùng mảng rỗng thay vì fallback data
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Kết thúc fetch notifications');
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString('vi-VN');
  };

  const getIconFromType = (type) => {
    const iconMap = {
      application: 'briefcase',
      shortlist: 'check',
      interview: 'clock',
      rejected: 'x',
      saved: 'building',
      alert: 'bell'
    };
    return iconMap[type] || 'bell';
  };

  const handleMarkAsRead = async (id) => {
    console.log('✓ Đánh dấu đã đọc notification:', id);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // PUT /api/candidate/notifications/:id/read
      // API backend chưa có cột isRead → trả {count: 0}
      // Hiện tại mark as read chỉ update UI local
      // Delete all chỉ xóa local (backend chưa có endpoint)
      const response = await fetch(`${API_BASE_URL}/candidate/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        ));
        console.log('✅ Đã đánh dấu đọc');
      }
    } catch (err) {
      console.error('❌ Lỗi mark as read:', err);
      // Vẫn update UI local
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    console.log('✓ Đánh dấu tất cả đã đọc');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // PUT /api/candidate/notifications/read-all
      const response = await fetch(`${API_BASE_URL}/candidate/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
        console.log('✅ Đã đánh dấu tất cả');
      }
    } catch (err) {
      console.error('❌ Lỗi mark all as read:', err);
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    }
  };

  const handleDelete = async (id) => {
    console.log('🗑️ Xóa notification:', id);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // DELETE /api/candidate/notifications/:id
      const response = await fetch(`${API_BASE_URL}/candidate/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(notifications.filter(notif => notif.id !== id));
        console.log('✅ Đã xóa');
      }
    } catch (err) {
      console.error('❌ Lỗi delete:', err);
      setNotifications(notifications.filter(notif => notif.id !== id));
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) {
      console.log('🗑️ Xóa tất cả notifications');
      // Backend chưa có API delete all, nên chỉ xóa local
      setNotifications([]);
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

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(notif => notif.type === activeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(notif => 
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getNotificationIcon = (iconType) => {
    const iconMap = {
      briefcase: <Briefcase size={20} />,
      check: <CheckCircle size={20} />,
      clock: <Clock size={20} />,
      x: <XCircle size={20} />,
      building: <Building2 size={20} />,
      bell: <Bell size={20} />
    };
    return iconMap[iconType] || <Bell size={20} />;
  };

  const getNotificationTypeClass = (type) => {
    const typeMap = {
      application: 'notification-type-application',
      shortlist: 'notification-type-shortlist',
      interview: 'notification-type-interview',
      rejected: 'notification-type-rejected',
      saved: 'notification-type-saved',
      alert: 'notification-type-alert'
    };
    return typeMap[type] || '';
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          Đang tải thông báo...
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
            className={`db-nav-item ${activeMenu === 'notifications' ? 'active' : ''}`}
          >
            <Bell size={20} />
            <span>Thông báo việc làm</span>
            {unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
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

        <div className="jobpilot-notifications-page">
          <div className="jobpilot-notifications-container">
            {/* Header */}
            <div className="notifications-header">
              <div className="notifications-header-left">
                <h1 className="notifications-title">
                  <Bell size={28} />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="notifications-badge">{unreadCount}</span>
                  )}
                </h1>
                <p className="notifications-subtitle">
                  Stay updated with your job applications and opportunities
                </p>
              </div>
              <div className="notifications-header-actions">
                <button 
                  className="notifications-action-btn"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check size={18} />
                  Mark all as read
                </button>
                <button 
                  className="notifications-action-btn notifications-delete-all-btn"
                  onClick={handleDeleteAll}
                  disabled={notifications.length === 0}
                >
                  <Trash2 size={18} />
                  Delete all
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="notifications-filters">
              <div className="notifications-filter-tabs">
                <button
                  className={`filter-tab ${activeFilter === 'all' ? 'filter-tab-active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All ({notifications.length})
                </button>
                <button
                  className={`filter-tab ${activeFilter === 'application' ? 'filter-tab-active' : ''}`}
                  onClick={() => setActiveFilter('application')}
                >
                  <Briefcase size={16} />
                  Applications
                </button>
                <button
                  className={`filter-tab ${activeFilter === 'shortlist' ? 'filter-tab-active' : ''}`}
                  onClick={() => setActiveFilter('shortlist')}
                >
                  <CheckCircle size={16} />
                  Shortlisted
                </button>
                <button
                  className={`filter-tab ${activeFilter === 'interview' ? 'filter-tab-active' : ''}`}
                  onClick={() => setActiveFilter('interview')}
                >
                  <Clock size={16} />
                  Interviews
                </button>
                <button
                  className={`filter-tab ${activeFilter === 'alert' ? 'filter-tab-active' : ''}`}
                  onClick={() => setActiveFilter('alert')}
                >
                  <Bell size={16} />
                  Alerts
                </button>
              </div>

              <div className="notifications-search">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  className="notifications-search-input"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
              {filteredNotifications.length === 0 ? (
                <div className="notifications-empty">
                  <Bell size={64} />
                  <h3>No notifications found</h3>
                  <p>You're all caught up! Check back later for updates.</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.isRead ? 'notification-unread' : ''}`}
                  >
                    <div className={`notification-icon ${getNotificationTypeClass(notification.type)}`}>
                      {getNotificationIcon(notification.icon)}
                    </div>

                    <div className="notification-content">
                      <div className="notification-header-row">
                        <h3 className="notification-title-text">{notification.title}</h3>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <span className="notification-company">
                          <Building2 size={14} />
                          {notification.company}
                        </span>
                      </div>
                    </div>

                    <div className="notification-actions">
                      {!notification.isRead && (
                        <button
                          className="notification-action-btn"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        className="notification-action-btn notification-delete-btn"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {filteredNotifications.length > 0 && (
              <div className="notifications-pagination">
                <span className="pagination-info">
                  Showing {filteredNotifications.length} of {notifications.length} notifications
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateNoti;