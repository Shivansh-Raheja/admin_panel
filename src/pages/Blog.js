import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";
import "./Blog.css";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    author_name: "",
    author_image: null,
    short_description: "",
    description: "",
    blog_image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const shortDescEditorRef = useRef(null);
  const descEditorRef = useRef(null);

  const API_URL = "https://api.wonderplastpanel.in/admin_api/blog.php";

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      if (response.data.success) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      Swal.fire("Error", "Failed to load blogs", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleShortDescChange = (content) => {
    setFormData({ ...formData, short_description: content });
  };

  const handleDescChange = (content) => {
    setFormData({ ...formData, description: content });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("title", formData.title);
    form.append("author_name", formData.author_name);
    form.append("short_description", formData.short_description);
    form.append("description", formData.description);

    if (formData.author_image) form.append("author_image", formData.author_image);
    if (formData.blog_image) form.append("blog_image", formData.blog_image);

    try {
      if (isEditing) {
        form.append("id", formData.id);
        await axios.put(`${API_URL}?id=${formData.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        Swal.fire("Success", "Blog updated successfully!", "success");
      } else {
        await axios.post(API_URL, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        Swal.fire("Success", "Blog added successfully!", "success");
      }
      fetchBlogs();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting blog:", error);
      Swal.fire("Error", "Failed to submit blog", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}?id=${id}`);
        Swal.fire("Deleted!", "The blog has been deleted.", "success");
        fetchBlogs();
      } catch (error) {
        Swal.fire("Error", "Failed to delete blog", "error");
      }
    }
  };

  const handleShowModal = (blog = null) => {
    if (blog) {
      setFormData({
        id: blog.id,
        title: blog.title,
        author_name: blog.author_name,
        short_description: blog.short_description,
        description: blog.description,
        author_image: null,
        blog_image: null,
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: "",
        title: "",
        author_name: "",
        author_image: null,
        short_description: "",
        description: "",
        blog_image: null,
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="blog-container">
      <h2>Blogs</h2>
      <Button variant="primary" onClick={() => handleShowModal()}>
        Add Blog
      </Button>

      {loading ? (
        <div className="loading">
          <Spinner animation="border" variant="primary" />
          <p>Loading blogs...</p>
        </div>
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Author Image</th>
              <th>Short Description</th>
              <th>Blog Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td>{blog.id}</td>
                <td>{blog.title}</td>
                <td>{blog.author_name}</td>
                <td>
                  <img 
                    src={`https://api.wonderplastpanel.in/admin_api/${blog.author_image}`} 
                    alt="Author" 
                    className="small-img" 
                  />
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: blog.short_description }} />
                </td>
                <td>
                  <img 
                    src={`https://api.wonderplastpanel.in/admin_api/${blog.blog_image}`} 
                    alt="Blog" 
                    className="small-img" 
                  />
                </td>
                <td>
                  <Button 
                    variant="warning" 
                    size="sm" 
                    onClick={() => handleShowModal(blog)}
                  >
                    Edit
                  </Button>{" "}
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(blog.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Blog" : "Add Blog"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Author Name</Form.Label>
              <Form.Control 
                type="text" 
                name="author_name" 
                value={formData.author_name} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Author Image</Form.Label>
              <Form.Control 
                type="file" 
                name="author_image" 
                onChange={handleFileChange} 
                accept="image/*"
              />
              {isEditing && (
                <Form.Text className="text-muted">
                  Leave empty to keep current image
                </Form.Text>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Short Description</Form.Label>
              <Editor
                apiKey="pz7fiqk1a3u0cmmz1vg9i8y10sf0t954opjyit1dkzr41j0w" // Replace with your actual API key
                onInit={(evt, editor) => shortDescEditorRef.current = editor}
                value={formData.short_description}
                onEditorChange={handleShortDescChange}
                init={{
                  height: 200,
                  menubar: false,
                  plugins: [
                    'advlist autolink lists link image charmap preview anchor pagebreak'
                  ],
                  toolbar_mode: 'floating',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Editor
                apiKey="pz7fiqk1a3u0cmmz1vg9i8y10sf0t954opjyit1dkzr41j0w" // Replace with your actual API key
                onInit={(evt, editor) => descEditorRef.current = editor}
                value={formData.description}
                onEditorChange={handleDescChange}
                init={{
                  height: 300,
                  menubar: true,
                  plugins: [
                    'advlist autolink lists link image charmap preview anchor pagebreak'
                  ],
                  toolbar_mode: 'floating',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Blog Image</Form.Label>
              <Form.Control 
                type="file" 
                name="blog_image" 
                onChange={handleFileChange} 
                accept="image/*"
              />
              {isEditing && (
                <Form.Text className="text-muted">
                  Leave empty to keep current image
                </Form.Text>
              )}
            </Form.Group>
            
            <Button variant="primary" type="submit" className="mt-3">
              {isEditing ? "Update Blog" : "Add Blog"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Blog;