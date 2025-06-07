import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import "./SiteBanners.css";

const SiteBanners = () => {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    text: "",
    is_active: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get("https://api.wonderplastpanel.in/admin_api/site_banners.php");
      if (res.data.success) {
        setBanners([res.data.banner]); // assuming single active banner
      }
    } catch (err) {
      console.error("Error fetching banner:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      text: formData.text,
      is_active: formData.is_active
    };

    try {
      if (editingId) {
        payload.id = editingId;
        await axios.put("https://api.wonderplastpanel.in/admin_api/site_banners.php", payload);
        Swal.fire("Success", "Banner updated successfully!", "success");
      } else {
        await axios.post("https://api.wonderplastpanel.in/admin_api/site_banners.php", payload);
        Swal.fire("Success", "Banner created successfully!", "success");
      }

      fetchBanners();
      setFormData({ text: "", is_active: true });
      setEditingId(null);
    } catch (error) {
      console.error("Error submitting banner:", error);
      Swal.fire("Error", "Failed to submit banner.", "error");
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setFormData({ text: banner.text, is_active: banner.is_active });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the banner.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete("https://api.wonderplastpanel.in/admin_api/site_banners.php", {
          data: { id },
        });
        Swal.fire("Deleted!", "Site Banner has been deleted.", "success");
        fetchBanners();
      } catch (error) {
        Swal.fire("Error", "Failed to delete Site banner.", "error");
      }
    }
  };

  return (
    <div className="banners-container">
      <h2>Manage Site Banner</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="4"
          placeholder="Banner Text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          Active
        </label>
        <button type="submit">
          {editingId ? "Update Banner" : "Add Banner"}
        </button>
      </form>

      <div className="banners-list">
        {banners.map((banner) => (
          <div key={banner.id} className="banner-card">
            <p>{banner.text}</p>
            <p>Status: {banner.is_active ? "Active" : "Inactive"}</p>
            <div className="actions">
              <button className="edit-btn" onClick={() => handleEdit(banner)}>
                <FaEdit />
              </button>
              <button className="delete-btn" onClick={() => handleDelete(banner.id)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteBanners;
