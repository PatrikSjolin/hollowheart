import React from 'react';
import translations from './translations'; // Import translations

const MessageOverlay = ({ title, message, onClose, language }) => {
  return (
    <div className="overlay">
      <div className="overlay-content">
        <h2>{title}</h2>
        <pre className="overlay-message">{message}</pre>
        <button onClick={onClose}>{translations[language].close}</button>
      </div>
    </div>
  );
};

export default MessageOverlay;
