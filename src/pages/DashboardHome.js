import React from "react";
import { FaBullseye, FaLightbulb, FaRocket } from "react-icons/fa";
import "./Dashboard.css";

const DashboardHome = () => {
  const adminName = localStorage.getItem("adminName") || "Admin";

  return (
    <div className="dashboard-home">
      <h1>Welcome, {adminName}!</h1>
      <p>This is your admin panel. Manage your data here.</p>

      {/* Mission, Vision, Goal Section */}
      <div className="dashboard-cards">
        <div className="card">
          <FaBullseye className="card-icon" />
          <h3>Our Mission</h3>
          <p>To provide high-quality, sustainable furniture solutions that redefine comfort and elegance.</p>
        </div>
        <div className="card">
          <FaLightbulb className="card-icon" />
          <h3>Our Vision</h3>
          <p>To be the leading name in the furniture industry, blending innovation with craftsmanship.</p>
        </div>
        <div className="card">
          <FaRocket className="card-icon" />
          <h3>Our Goal</h3>
          <p>Expanding globally while maintaining our reputation for excellence and customer satisfaction.</p>
        </div>
      </div>

      {/* Business Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h2>--</h2>
          <p>Orders Processed</p>
        </div>
        <div className="stat-card">
          <h2>20+</h2>
          <p>Product Categories</p>
        </div>
        <div className="stat-card">
          <h2>30+</h2>
          <p>Countries Served</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
