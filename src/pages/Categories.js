import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://65.0.109.136/admin_api/categories.php");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleShow = (category = null) => {
    if (category) {
      setEditMode(true);
      setSelectedCategory(category);
      setTitle(category.title);
    } else {
      setEditMode(false);
      setSelectedCategory(null);
      setTitle("");
      setImage(null);
    }
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formData = new FormData();
    formData.append("title", title);
    if (image) {
      formData.append("image", image);
    }

    try {
      if (editMode) {
        formData.append("id", selectedCategory.id);
        await axios.put("https://65.0.109.136/admin_api/categories.php", formData);
        Swal.fire("Updated!", "Category updated successfully.", "success");
      } else {
        await axios.post("https://65.0.109.136/admin_api/categories.php", formData);
        Swal.fire("Added!", "Category added successfully.", "success");
      }
      fetchCategories();
      handleClose();
    } catch (error) {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete("https://65.0.109.136/admin_api/categories.php", { data: { id } });
          Swal.fire("Deleted!", "Category has been deleted.", "success");
          fetchCategories();
        } catch (error) {
          Swal.fire("Error!", "Failed to delete category.", "error");
        }
      }
    });
  };

  return (
    <div className="container">
      <h2 className="title">Manage Categories</h2>
      <Button className="add-btn" onClick={() => handleShow()}>Add Category</Button>

      <Table striped bordered hover className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{category.title}</td>
              <td>
                <img src={`https://65.0.109.136/admin_api/${category.image}`} alt="Category" className="category-img" />
              </td>
              <td>
                <Button variant="warning" onClick={() => handleShow(category)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(category.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Adding/Editing Category */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
            </Form.Group>
            <Button variant="primary" type="submit">{editMode ? "Update" : "Add"}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Categories;
