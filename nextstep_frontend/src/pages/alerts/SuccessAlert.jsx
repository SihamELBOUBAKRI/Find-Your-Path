import React from 'react';
import './styles/Alerts.css';

const SuccessAlert = ({ message, onClose }) => {
  return (
    <div className="alert-container success-alert">
      <div className="alert-content">
        <span className="alert-icon">✓</span>
        <p>{message}</p>
        <button className="alert-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default SuccessAlert;