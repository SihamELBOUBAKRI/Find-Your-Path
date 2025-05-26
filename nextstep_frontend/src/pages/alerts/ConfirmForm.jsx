import React from 'react';
import './styles/Alerts.css';

const ConfirmForm = ({ 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  return (
    <div className="confirm-container">
      <div className="confirm-content">
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="confirm-button cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-button confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmForm;