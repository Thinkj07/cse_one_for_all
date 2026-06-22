import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Settings, Briefcase } from "lucide-react";
import "./Navbar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Kiểm tra user đã đăng nhập chưa
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        console.log('👤 User logged in:', userData);
      } catch (err) {
        console.error('❌ Error parsing user data:', err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    console.log('👋 Logging out...');

    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // Reset state
    setUser(null);
    setShowDropdown(false);

    // Redirect to home
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/signin';
    return user.role === 'candidate' ? '/candidate-dashboard' : '/employer-dashboard';
  };

  const getAvatarUrl = (userData) => {
    if (userData.avatar || userData.Profile_Picture) {
      return userData.avatar || userData.Profile_Picture;
    }
    const name = userData.fullName || userData.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A65CC&color=fff&size=128`;
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span className="it-blue">IT</span>
          <span className="viec-black">viec</span>
        </Link>
      </div>

      <ul className="navbar__menu">
        <li><Link to="/">Trang chủ</Link></li>
        <li><Link to="/find-job">Tìm việc làm</Link></li>
        <li><Link to={getDashboardLink()}>Bảng điều khiển</Link></li>
        <li><Link to="/about">Hỗ trợ</Link></li>
      </ul>

      {user ? (
        // User đã đăng nhập
        <div className="navbar__user">
          <div
            className="navbar__user-info"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src={getAvatarUrl(user)}
              alt={user.fullName || user.username}
              className="navbar__user-avatar"
            />
            <span className="navbar__user-name">{user.fullName || user.username}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              style={{
                marginLeft: '8px',
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {showDropdown && (
            <div className="navbar__dropdown">
              <Link
                to={user.role === 'candidate' ? '/candidate-dashboard' : '/employer-dashboard'}
                className="navbar__dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <Briefcase size={16} />
                Dashboard
              </Link>
              <Link
                to={user.role === 'candidate' ? '/candidate-dashboard/setting' : '/employer-dashboard'}
                className="navbar__dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <Settings size={16} />
                Cài đặt
              </Link>
              <div className="navbar__dropdown-divider"></div>
              <button
                className="navbar__dropdown-item navbar__dropdown-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      ) : (
        // Chưa đăng nhập
        <>
          <div className="navbar__login">
            <Link to="/signin" className="navbar__login-btn">Đăng nhập</Link>
          </div>
          <div className="navbar__login">
            <Link to="/employer" className="navbar__login_employer-btn">Đăng tuyển</Link>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;