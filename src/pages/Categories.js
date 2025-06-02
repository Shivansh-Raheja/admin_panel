import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    image: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://api.wonderplastpanel.in/admin_api/categories.php");
      if (response.data.success && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else {
        setCategories([]);
        console.error("Unexpected response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleShow = () => {
    setFormData({ id: "", title: "", image: null });
    setEditing(false);
    setShow(true);
  };

  const handleEdit = (category) => {
    setFormData({ ...category, image: null }); // reset image upload
    setEditing(true);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    if (formData.image) {
      formPayload.append("image", formData.image);
    }

    try {
      if (editing) {
        formPayload.append("id", formData.id);
        formPayload.append("_method", "PUT"); // method override
        await axios.post("https://api.wonderplastpanel.in/admin_api/categories.php", formPayload);
        Swal.fire("Updated!", "Category updated successfully.", "success");
      } else {
        await axios.post("https://api.wonderplastpanel.in/admin_api/categories.php", formPayload);
        Swal.fire("Added!", "Category added successfully.", "success");
      }
      fetchCategories();
      handleClose();
    } catch (error) {
      console.error("Error saving category:", error);
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete("https://api.wonderplastpanel.in/admin_api/categories.php", {
            data: { id },
          });
          Swal.fire("Deleted!", "Category has been deleted.", "success");
          fetchCategories();
        } catch (error) {
          Swal.fire("Error!", "Failed to delete category.", "error");
        }
      }
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Categories</h2>
      <Button variant="primary" onClick={handleShow}>Add Category</Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.title}</td>
              <td>
                {cat.image && (
                  <img
                    src={`https://api.wonderplastpanel.in/admin_api/${cat.image}`}
                    alt="Category"
                    className="category-img"
                  />
                )}
              </td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(cat)} className="me-2">
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(cat.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Category" : "Add Category"}</Modal.Title>
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
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editing ? "Update" : "Add"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Categories;
