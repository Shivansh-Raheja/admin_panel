import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Reviews from "./pages/Reviews";
import Brochure from "./pages/Brochure";
import Blog from "./pages/Blog";
import Categories from "./pages/Categories";
import Coupons from "./pages/Coupon";
import Banners from "./pages/Banners";
import Products from "./pages/Products";
import Partners from "./pages/Partners";

const ProtectedRoute = ({ element }) => {
  return localStorage.getItem("adminToken") ? element : <Navigate to="/" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />}>
          <Route path="users" element={<Users />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="brochure" element={<Brochure />} />
          <Route path="blog" element={<Blog />} />
          <Route path="categories" element={<Categories />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="banners" element={<Banners />} />
          <Route path="partners" element={<Partners />} />
          <Route path="products" element={<Products />} />
          {/* Add more nested routes here */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
