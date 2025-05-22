import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";
import "./Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    review: "", 
    image: null 
  });
  const [editingId, setEditingId] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get("https://api.wonderplastpanel.in/admin_api/reviews.php");
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

  const handleEditorChange = (content) => {
    setFormData({ ...formData, review: content });
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
        await axios.put("https://api.wonderplastpanel.in/admin_api/reviews.php", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Review updated successfully!", "success");
      } else {
        await axios.post("https://api.wonderplastpanel.in/admin_api/reviews.php", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Review added successfully!", "success");
      }
      fetchReviews();
      setFormData({ name: "", review: "", image: null });
      setEditingId(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      Swal.fire("Error", "Failed to submit review.", "error");
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setFormData({ 
      name: review.name, 
      review: review.review, 
      image: null 
    });
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
        await axios.delete("https://api.wonderplastpanel.in/admin_api/reviews.php", { data: { id } });
        Swal.fire("Deleted!", "Review has been deleted.", "success");
        fetchReviews();
      } catch (error) {
        Swal.fire("Error", "Failed to delete review.", "error");
      }
    }
  };

  return (
    <div className="reviews-container">
      <h2>Manage Reviews</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          required 
        />
        
        <div className="editor-container">
          <Editor
            apiKey="bdrt7knvxcra7jn0ast5cn8ofq6a755qfp8xktj3m3b7f02z" // Replace with your actual API key
            onInit={(evt, editor) => editorRef.current = editor}
            value={formData.review}
            onEditorChange={handleEditorChange}
            init={{
              height: 300,
              menubar: true,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
              ],
              toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
        </div>
        
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept="image/*" 
          required={!editingId} 
        />
        <button type="submit">
          {editingId ? "Update Review" : "Add Review"}
        </button>
      </form>

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <img src={`https://api.wonderplastpanel.in/admin_api/${review.image}`} alt={review.name} />
            <div className="review-content">
              <h3>{review.name}</h3>
              <div dangerouslySetInnerHTML={{ __html: review.review }} />
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