import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ name: "", review: "", image: null });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get("http://api.magnumwonderplast.com/admin_api/reviews.php");
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("review", formData.review);
    if (formData.image) {
      form.append("image", formData.image);
    }

    try {
      if (editingId) {
        form.append("id", editingId);
        await axios.put("http://api.magnumwonderplast.com/admin_api/reviews.php", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("http://api.magnumwonderplast.com/admin_api/reviews.php", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      fetchReviews();
      setFormData({ name: "", review: "", image: null });
      setEditingId(null);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setFormData({ name: review.name, review: review.review, image: null });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete("http://api.magnumwonderplast.com/admin_api/reviews.php", { data: { id } });
        Swal.fire("Deleted!", "Review has been deleted.", "success").then(() => {
          window.location.reload();
        });
      } catch (error) {
        Swal.fire("Error", "Failed to delete review.", "error");
      }
    }
  };

  return (
    <div className="reviews-container">
      <h2>Manage Reviews</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        <textarea placeholder="Review" value={formData.review} onChange={(e) => setFormData({ ...formData, review: e.target.value })} required />
        <input type="file" onChange={handleFileChange} accept="image/*" required={!editingId} />
        <button type="submit">{editingId ? "Update Review" : "Add Review"}</button>
      </form>

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <img src={`http://api.magnumwonderplast.com/admin_api/${review.image}`} alt={review.name} />
            <div className="review-content">
              <h3>{review.name}</h3>
              <p>{review.review}</p>
            </div>
            <div className="actions">
              <button className="edit-btn" onClick={() => handleEdit(review)}>
                <FaEdit />
              </button>
              <button className="delete-btn" onClick={() => handleDelete(review.id)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
