// LostItemsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LostItems.css'; // Make sure to create this CSS file with the appropriate styles

const LostItemsPage = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  const handleNotificationClick = () => {
    setIsNotificationVisible(!isNotificationVisible);
  };

  return (
    <div className="lost-items-container">
      <header className="navbar">
        <div className="logo-section">
          <img src="settings.png" alt="Tsaaritsa Logo" className="logo" />
          <h1 className="brand-name">Lost and Found</h1>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/lost-items" className="nav-link active">Lost Items</Link>
          <Link to="/my-items" className="nav-link">My Items</Link>
        </nav>
        <button className="notification-bell" onClick={handleNotificationClick}>
          <img src="bell.png" alt="Notification" />
          <span className="notification-count">{notificationCount}</span>
        </button>
      </header>

      <main className="main-section">
        <div className="text-section">
          <h2 className="main-heading">Lost Items</h2>
          <p className="main-subheading">
            Here are the items that have been reported lost. Please help in finding them.
          </p>
          <div className="divider"></div>
          {/* Here you can display a list of lost items */}
        </div>
      </main>

      {isNotificationVisible && (
        <div className="notification-bar">
          <p>No new notifications.</p>
          {/* Add notification items here if needed */}
        </div>
      )}
    </div>
  );
};

export default LostItemsPage;
