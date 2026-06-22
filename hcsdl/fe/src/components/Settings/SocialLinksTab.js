import React, { useState } from 'react';
import { PlusCircle, XCircle, Settings } from 'lucide-react';

const SocialLinksTab = () => {
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: 'facebook', url: '' },
    { id: 2, platform: 'twitter', url: '' },
    { id: 3, platform: 'instagram', url: '' },
    { id: 4, platform: 'youtube', url: '' }
  ]);

  const handleAddSocialLink = () => {
    const newId = socialLinks.length + 1;
    setSocialLinks([...socialLinks, { id: newId, platform: 'facebook', url: '' }]);
  };

  const handleRemoveSocialLink = (id) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  return (
    <div className="settings-content">
      <div className="settings-social-links">
        {socialLinks.map((link, index) => (
          <div key={link.id} className="settings-social-link-row">
            <label className="settings-label">Social Link {index + 1}</label>
            <div className="settings-social-link-inputs">
              <select 
                className="settings-select settings-social-platform"
                value={link.platform}
                onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
              >
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">Youtube</option>
                <option value="linkedin">LinkedIn</option>
              </select>
              <input 
                type="url" 
                className="settings-input settings-social-url" 
                placeholder="Profile link/url..."
                value={link.url}
                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              />
              <button 
                className="settings-remove-link-btn"
                onClick={() => handleRemoveSocialLink(link.id)}
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        ))}

        <button className="settings-add-social-btn" onClick={handleAddSocialLink}>
          <PlusCircle size={20} />
          Add New Social Link
        </button>
      </div>

      <button className="settings-save-btn">Save Changes</button>
    </div>
  );
};

export default SocialLinksTab;