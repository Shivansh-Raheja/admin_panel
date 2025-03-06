import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Blog.css"; // Import CSS for styling

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

  const API_URL = "https://65.0.109.136/admin_api/blog.php";

  // Fetch all blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      if (response.data.success) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  // Handle form submission (Add or Update)
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
        await axios.post(API_URL + `?id=${formData.id}&_method=PUT`, form);
        Swal.fire("Success", "Blog updated!", "success");
      } else {
        await axios.post(API_URL, form);
        Swal.fire("Success", "Blog added!", "success");
      }
      fetchBlogs();
      handleCloseModal();
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(API_URL + `?id=${id}`);
          Swal.fire("Deleted!", "The blog has been deleted.", "success");
          window.location.reload();
        } catch (error) {
          Swal.fire("Error", "Failed to delete blog", "error");
        }
      }
    });
  };

  // Open modal for adding/updating blog
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

  // Close modal
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
                  <img src={`https://65.0.109.136/admin_api/${blog.author_image}`} alt="Author" className="small-img" />
                </td>
                <td>{blog.short_description}</td>
                <td>
                  <img src={`https://65.0.109.136/admin_api/${blog.blog_image}`} alt="Blog" className="small-img" />
                </td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleShowModal(blog)}>
                    Edit
                  </Button>{" "}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(blog.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Blog Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Blog" : "Add Blog"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Author Name</Form.Label>
              <Form.Control type="text" name="author_name" value={formData.author_name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Author Image</Form.Label>
              <Form.Control type="file" name="author_image" onChange={handleFileChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Short Description</Form.Label>
              <Form.Control as="textarea" name="short_description" value={formData.short_description} onChange={handleChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Blog Image</Form.Label>
              <Form.Control type="file" name="blog_image" onChange={handleFileChange} />
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
