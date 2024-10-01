import React from 'react';

const MessageOverlay = ({ title, message, onClose }) => {
  return (
    <div className="overlay">
      <div className="overlay-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default MessageOverlay;
