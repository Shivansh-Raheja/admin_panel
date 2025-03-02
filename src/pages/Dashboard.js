import React from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { FaUser, FaTable, FaSignOutAlt, FaDatabase, FaBullseye, FaLightbulb, FaRocket } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    navigate("/");
  };

  // Sidebar menu items
  const menuItems = [
    { name: "Users", path: "/dashboard/users", icon: <FaUser /> },
    { name: "Reviews", path: "/dashboard/reviews", icon: <FaUser /> },
    { name: "Brochure", path: "/dashboard/brochure", icon: <FaUser /> },
    { name: "Blogs", path: "/dashboard/blog", icon: <FaUser /> },
    { name: "Categories", path: "/dashboard/categories", icon: <FaUser /> },
    { name: "Coupons", path: "/dashboard/coupons", icon: <FaUser /> },
    { name: "Banners", path: "/dashboard/banners", icon: <FaUser /> },
    { name: "Products", path: "/dashboard/products", icon: <FaDatabase /> },
    { name: "Orders", path: "/dashboard/orders", icon: <FaTable /> },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink to={item.path} className="nav-link">
                {item.icon} {item.name}
              </NavLink>
            </li>
          ))}
          <li className="logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <h1>Welcome, {adminName}!</h1>
        <p>This is your admin panel. Manage your data here.</p>

        {/* Mission, Vision, Goal Section */}
        

        {/* Business Statistics */}
       

        {/* Dynamic Page Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
