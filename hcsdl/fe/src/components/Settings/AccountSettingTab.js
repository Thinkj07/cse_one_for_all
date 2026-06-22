import React, { useState } from 'react';
import { MapPin, Mail, Eye, EyeOff,Settings, XCircle } from 'lucide-react';

const AccountSettingTab = () => {
  const [profilePublic, setProfilePublic] = useState(true);
  const [resumePublic, setResumePublic] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="settings-content">
      <div className="settings-section">
        <h3 className="settings-subsection-title">Contact Info</h3>
        
        <div className="settings-form-group">
          <label className="settings-label">Map Location</label>
          <div className="settings-input-icon">
            <MapPin size={20} className="settings-input-icon-svg" />
            <input type="text" className="settings-input settings-input-with-icon" placeholder="Location" />
          </div>
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Phone</label>
          <div className="settings-phone-input">
            <select className="settings-select settings-phone-code">
              <option>+880</option>
              <option>+1</option>
              <option>+44</option>
              <option>+91</option>
            </select>
            <input type="tel" className="settings-input" placeholder="Phone number..." />
          </div>
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Email</label>
          <div className="settings-input-icon">
            <Mail size={20} className="settings-input-icon-svg" />
            <input type="email" className="settings-input settings-input-with-icon" placeholder="Email address" />
          </div>
        </div>

        <button className="settings-save-btn">Save Changes</button>
      </div>

      <div className="settings-section">
        <h3 className="settings-subsection-title">Notification</h3>
        
        <div className="settings-notification-grid">
          <label className="settings-checkbox-label">
            <input type="checkbox" className="settings-checkbox" defaultChecked />
            <span>Notify me when employers shortlisted me</span>
          </label>

          <label className="settings-checkbox-label">
            <input type="checkbox" className="settings-checkbox" />
            <span>Notify me when employers saved my profile</span>
          </label>

          <label className="settings-checkbox-label">
            <input type="checkbox" className="settings-checkbox" />
            <span>Notify me when my applied jobs are expire</span>
          </label>

          <label className="settings-checkbox-label">
            <input type="checkbox" className="settings-checkbox" defaultChecked />
            <span>Notify me when employers rejected me</span>
          </label>

          <label className="settings-checkbox-label">
            <input type="checkbox" className="settings-checkbox" defaultChecked />
            <span>Notify me when I have up to 5 job alerts</span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-subsection-title">Job Alerts</h3>
        
        <div className="settings-form-grid">
          <div className="settings-form-group">
            <label className="settings-label">Role</label>
            <input type="text" className="settings-input" placeholder="Your job roles" />
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Location</label>
            <input type="text" className="settings-input" placeholder="City, state, country name" />
          </div>
        </div>

        <button className="settings-save-btn">Save Changes</button>
      </div>

      <div className="settings-section">
        <h3 className="settings-subsection-title">Profile Privacy</h3>
        
        <div className="settings-privacy-row">
          <div className="settings-privacy-item">
            <div className="settings-privacy-info">
              <h4>Profile Privacy</h4>
              <p className="settings-privacy-status">
                <span className={profilePublic ? 'settings-status-yes' : 'settings-status-no'}>
                  {profilePublic ? 'YES' : 'NO'}
                </span>
                Your profile is {profilePublic ? 'public' : 'private'} now
              </p>
            </div>
            <label className="settings-toggle">
              <input 
                type="checkbox" 
                checked={profilePublic}
                onChange={(e) => setProfilePublic(e.target.checked)}
              />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>

          <div className="settings-privacy-item">
            <div className="settings-privacy-info">
              <h4>Resume Privacy</h4>
              <p className="settings-privacy-status">
                <span className={resumePublic ? 'settings-status-yes' : 'settings-status-no'}>
                  {resumePublic ? 'YES' : 'NO'}
                </span>
                Your resume is {resumePublic ? 'public' : 'private'} now
              </p>
            </div>
            <label className="settings-toggle">
              <input 
                type="checkbox" 
                checked={resumePublic}
                onChange={(e) => setResumePublic(e.target.checked)}
              />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-subsection-title">Change Password</h3>
        
        <div className="settings-password-grid">
          <div className="settings-form-group">
            <label className="settings-label">Current Password</label>
            <div className="settings-password-input">
              <input 
                type={showPassword.current ? "text" : "password"} 
                className="settings-input" 
                placeholder="Password" 
              />
              <button 
                type="button" 
                className="settings-password-toggle"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="settings-form-group">
            <label className="settings-label">New Password</label>
            <div className="settings-password-input">
              <input 
                type={showPassword.new ? "text" : "password"} 
                className="settings-input" 
                placeholder="Password" 
              />
              <button 
                type="button" 
                className="settings-password-toggle"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Confirm Password</label>
            <div className="settings-password-input">
              <input 
                type={showPassword.confirm ? "text" : "password"} 
                className="settings-input" 
                placeholder="Password" 
              />
              <button 
                type="button" 
                className="settings-password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <button className="settings-save-btn">Save Changes</button>
      </div>

      <div className="settings-section">
        <h3 className="settings-subsection-title">Delete Your Account</h3>
        <p className="settings-delete-description">
          If you delete your Jobpilot account, you will no longer be able to get information about the matched jobs, following employers, and job alert. Shortlisted jobs and more. You will be abandoned from all the services of Jobpilot.com.
        </p>
        <button className="settings-delete-btn">
          <XCircle size={20} />
          Close Account
        </button>
      </div>
    </div>
  );
};

export default AccountSettingTab;