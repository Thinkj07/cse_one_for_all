import React, { useState, useEffect } from 'react';
import ApiService from '../services/apiService';

const ConnectionStatus = ({ className = '' }) => {
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('connecting');
        await ApiService.healthCheck();
        setStatus('connected');
        setError(null);
      } catch (err) {
        setStatus('disconnected');
        setError(err.message);
      }
    };

    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#4ade80';
      case 'connecting': return '#fbbf24';
      case 'disconnected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Backend kết nối thành công';
      case 'connecting': return 'Đang kết nối backend...';
      case 'disconnected': return 'Mất kết nối backend';
      default: return 'Không xác định';
    }
  };

  return (
    <div className={`connection-status ${className}`} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getStatusColor()
      }} />
      <span>{getStatusText()}</span>
      {error && (
        <span title={error} style={{ color: '#ef4444' }}>
          ⚠️
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;