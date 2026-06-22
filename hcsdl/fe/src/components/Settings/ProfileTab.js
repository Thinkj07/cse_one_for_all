import React from 'react';
import { Bold, Italic, Underline, Strikethrough, Link2, List, ListOrdered, Settings } from 'lucide-react';

const ProfileTab = () => {
  return (
    <div className="settings-content">
      <div className="settings-form-grid">
        <div className="settings-form-group">
          <label className="settings-label">Nationality</label>
          <select className="settings-select">
            <option>Select...</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>India</option>
            <option>Other</option>
          </select>
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Date of Birth</label>
          <input type="text" className="settings-input" placeholder="dd/mm/yyyy" />
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Gender</label>
          <select className="settings-select">
            <option>Select...</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Marital Status</label>
          <select className="settings-select">
            <option>Select...</option>
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
          </select>
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Education</label>
          <select className="settings-select">
            <option>Select...</option>
            <option>High School</option>
            <option>Bachelor's</option>
            <option>Master's</option>
          </select>
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Experience</label>
          <select className="settings-select">
            <option>Select...</option>
            <option>0-1 years</option>
            <option>1-3 years</option>
            <option>3-5 years</option>
          </select>
        </div>

        <div className="settings-form-group settings-full-width">
          <label className="settings-label">Biography</label>
          <div className="settings-editor">
            <textarea 
              className="settings-textarea" 
              placeholder="Write down your biography here. Let the employers know who you are..."
              rows="6"
            ></textarea>
            <div className="settings-editor-toolbar">
              <button type="button" className="settings-editor-btn">
                <Bold size={16} />
              </button>
              <button type="button" className="settings-editor-btn">
                <Italic size={16} />
              </button>
              <button type="button" className="settings-editor-btn">
                <Underline size={16} />
              </button>
              <button type="button" className="settings-editor-btn">
                <Strikethrough size={16} />
              </button>
              <button type="button" className="settings-editor-btn">
                <Link2 size={16} />
              </button>
              <button type="button" className="settings-editor-btn">
                <List size={16} />
              </button>
              <button type="button" className="settings-editor-btn">
                <ListOrdered size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="settings-save-btn">Save Changes</button>
    </div>
  );
};

export default ProfileTab;