import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MyItems.css"; // Make sure to create this CSS file with the appropriate styles

const MyItemsPage = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  const handleNotificationClick = () => {
    setIsNotificationVisible(!isNotificationVisible);
  };

  return (
    <div className="my-items-container">
      <header className="navbar">
        <div className="logo-section">
          <img src="settings.png" alt="Tsaaritsa Logo" className="logo" />
          <h1 className="brand-name">Lost and Found</h1>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/lost-items" className="nav-link">
            Lost Items
          </Link>
          <Link to="/my-items" className="nav-link active">
            My Items
          </Link>
        </nav>
        <button className="notification-bell" onClick={handleNotificationClick}>
          <img src="bell.png" alt="Notification" />
          <span className="notification-count">{notificationCount}</span>
        </button>
      </header>

      <main className="main-section">
        <div className="text-section">
          <h2 className="main-heading">My Items</h2>
          <p className="main-subheading">
            Here are the items you have reported or found.
          </p>
          <div className="divider"></div>
          {/* Here you can display a list of your items */}
          <ul>
            <li>Item 1: Lost Wallet</li>
            <li>Item 2: Found Umbrella</li>
            {/* Add more items as needed */}
          </ul>
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

export default MyItemsPage;
