import React, { useState } from 'react';
import { Upload, Link2, FileText, MoreVertical, Settings, PlusCircle, X } from 'lucide-react';

const PersonalTab = () => {
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumes, setResumes] = useState([
    { id: 1, name: 'Professional Resume', size: '3.5 MB' },
    { id: 2, name: 'Product Designer', size: '4.7 MB' },
    { id: 3, name: 'Visual Designer', size: '1.3 MB' }
  ]);

  const handleAddResume = () => {
    setShowResumeModal(true);
  };

  const handleDeleteResume = (id) => {
    setResumes(resumes.filter(resume => resume.id !== id));
  };

  return (
    <>
      <div className="settings-content">
        <h2 className="settings-section-title">Basic Information</h2>
        
        <div className="settings-form-grid">
          <div className="settings-form-group settings-profile-picture">
            <label className="settings-label">Profile Picture</label>
            <div className="settings-upload-box">
              <div className="settings-upload-icon">
                <Upload size={32} />
              </div>
              <p className="settings-upload-text">
                <span className="settings-upload-link">Browse photo</span> or drop here
              </p>
              <p className="settings-upload-hint">
                A photo larger than 400 pixels work best. Max photo size 5 MB.
              </p>
            </div>
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Full name</label>
            <input type="text" className="settings-input" placeholder="Enter full name" />
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Tittle/headline</label>
            <input type="text" className="settings-input" placeholder="Enter title" />
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Experience</label>
            <select className="settings-select">
              <option>Select...</option>
              <option>0-1 years</option>
              <option>1-3 years</option>
              <option>3-5 years</option>
              <option>5+ years</option>
            </select>
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Educations</label>
            <select className="settings-select">
              <option>Select...</option>
              <option>High School</option>
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>PhD</option>
            </select>
          </div>

          <div className="settings-form-group settings-full-width">
            <label className="settings-label">Personal Website</label>
            <div className="settings-input-icon">
              <Link2 size={20} className="settings-input-icon-svg" />
              <input type="url" className="settings-input settings-input-with-icon" placeholder="Website url..." />
            </div>
          </div>
        </div>

        <button className="settings-save-btn">Save Changes</button>

        <div className="settings-resume-section">
          <h2 className="settings-section-title">Your Cv/Resume</h2>
          
          <div className="settings-resume-grid">
            {resumes.map(resume => (
              <div key={resume.id} className="settings-resume-card">
                <div className="settings-resume-icon">
                  <FileText size={24} />
                </div>
                <div className="settings-resume-info">
                  <h4 className="settings-resume-name">{resume.name}</h4>
                  <p className="settings-resume-size">{resume.size}</p>
                </div>
                <div className="settings-resume-actions">
                  <button className="settings-resume-menu-btn">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))}

            <div className="settings-resume-card settings-resume-add" onClick={handleAddResume}>
              <div className="settings-resume-add-icon">
                <PlusCircle size={32} />
              </div>
              <div className="settings-resume-add-text">
                <h4>Add Cv/Resume</h4>
                <p>Browse file or drop here. only pdf</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResumeModal && (
        <div className="jobpilot-modal-overlay" onClick={() => setShowResumeModal(false)}>
          <div className="jobpilot-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="jobpilot-modal-close"
              onClick={() => setShowResumeModal(false)}
            >
              <X size={24} />
            </button>

            <h2 className="jobpilot-modal-title">Add Cv/Resume</h2>

            <div className="jobpilot-modal-body">
              <div className="settings-form-group">
                <label className="settings-label">Cv/Resume Name</label>
                <input type="text" className="settings-input" placeholder="Enter resume name" />
              </div>

              <div className="settings-form-group">
                <label className="settings-label">Upload your Cv/Resume</label>
                <div className="settings-upload-box">
                  <div className="settings-upload-icon">
                    <Upload size={32} />
                  </div>
                  <p className="settings-upload-text">
                    <span className="settings-upload-link">Browse File</span> or drop here
                  </p>
                  <p className="settings-upload-hint">
                    Only PDF format available. Max file size 12 MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="jobpilot-modal-footer">
              <button 
                className="jobpilot-modal-cancel"
                onClick={() => setShowResumeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="jobpilot-modal-submit"
                onClick={() => setShowResumeModal(false)}
              >
                Add Cv/Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalTab;