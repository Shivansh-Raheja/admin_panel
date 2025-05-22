import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Banners.css";

const Partners = () => {
  const [partners, setpartners] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    image: null,
    visible_status: "0",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchpartners();
  }, []);

  const fetchpartners = async () => {
    try {
      const response = await axios.get("https://api.wonderplastpanel.in/admin_api/partners.php");
      setpartners(response.data);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const handleShow = () => {
    setFormData({ id: "", title: "", image: null, visible_status: "0" });
    setEditing(false);
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
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("visible_status", formData.visible_status);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editing) {
        formDataToSend.append("id", formData.id);
        await axios.put("https://api.wonderplastpanel.in/admin_api/partners.php", formDataToSend);
        Swal.fire("Updated!", "partners updated successfully.", "success");
      } else {
        await axios.post("https://api.wonderplastpanel.in/admin_api/partners.php", formDataToSend);
        Swal.fire("Added!", "partners added successfully.", "success");
      }
      
      fetchpartners();
      handleClose();
    } catch (error) {
      console.error("Error saving partners:", error);
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  const handleEdit = (partner) => {
    setFormData({ ...partner, image: null });
    setEditing(true);
    setShow(true);
  };

  const handleDelete = (id) => {
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
          await axios.delete(`https://api.wonderplastpanel.in/admin_api/partners.php`, { data: { id } });
          fetchpartners();
          Swal.fire("Deleted!", "Your partner has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting partner:", error);
          Swal.fire("Error!", "Failed to delete partner.", "error");
        }
      }
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage partners</h2>
      <Button variant="primary" onClick={handleShow}>Add partner</Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Image</th>
            <th>Visible Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner.id}>
              <td>{partner.id}</td>
              <td>{partner.title}</td>
              <td>
                {partner.image && <img src={`https://api.wonderplastpanel.in/admin_api/${partner.image}`} alt="partner" className="banner-img" />}
              </td>
              <td>{partner.visible_status === "0" ? "Visible" : "Hidden"}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(partner)} className="me-2">Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(partner.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit partner" : "Add partner"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" name="image" accept="image/*" onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Visible Status</Form.Label>
              <Form.Select name="visible_status" value={formData.visible_status} onChange={handleChange} required>
                <option value="0">Visible</option>
                <option value="1">Hidden</option>
              </Form.Select>
            </Form.Group>
            <Button variant="success" type="submit">{editing ? "Update" : "Add"} partner</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Partners;
