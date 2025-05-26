import React from 'react';
import './loading.css';
import loading from './loading-gif.gif'; 

const PageLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <img src={loading} alt="Loading" className="loader" />
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default PageLoading;
