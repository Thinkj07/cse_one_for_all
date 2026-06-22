import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  PlusCircle, 
  Briefcase, 
  Bookmark, 
  CreditCard, 
  Building2, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';
import '../styles/EmployerLayout.css';

const EmployerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="employer-layout">
      {/* Sidebar */}
      <aside className={`employer-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <span className="logo-text">ITviec</span>
          </Link>
          <button 
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-section">
          <nav className="sidebar-menu">
            <Link 
              to="/employer-dashboard" 
              className={`menu-item ${isActive('/employer-dashboard')}`}
            >
              <LayoutDashboard size={18} />
              <span>Tổng quan</span>
            </Link>
            <Link 
              to="/employer/profile" 
              className={`menu-item ${isActive('/employer/profile')}`}
            >
              <User size={18} />
              <span>Hồ sơ công ty</span>
            </Link>
            <Link 
              to="/employer/post-job" 
              className={`menu-item ${isActive('/employer/post-job')}`}
            >
              <PlusCircle size={18} />
              <span>Đăng tin</span>
            </Link>
            <Link 
              to="/employer/my-jobs" 
              className={`menu-item ${isActive('/employer/my-jobs')}`}
            >
              <Briefcase size={18} />
              <span>Tin đã đăng</span>
            </Link>
            <Link 
              to="/employer/watch-candidate" 
              className={`menu-item ${isActive('/employer/watch-candidate')}`}
            >
              <Bookmark size={18} />
              <span>Ứng viên</span>
            </Link>
            <Link 
              to="/employer/billing" 
              className={`menu-item ${isActive('/employer/billing')}`}
            >
              <CreditCard size={18} />
              <span>Thanh toán</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-section">
          <nav className="sidebar-menu">
            <Link 
              to="/employer/company" 
              className={`menu-item ${isActive('/employer/company')}`}
            >
              <Building2 size={18} />
              <span>Công ty</span>
            </Link>
            <Link 
              to="/employer/settings" 
              className={`menu-item ${isActive('/employer/settings')}`}
            >
              <Settings size={18} />
              <span>Cài đặt</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="employer-main">
        {/* Page Content */}
        <main className="employer-content">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default EmployerLayout;
