import React from 'react';
import './styles/Alerts.css';

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="alert-container error-alert">
      <div className="alert-content">
        <span className="alert-icon">!</span>
        <p>{message}</p>
        <button className="alert-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default ErrorAlert;