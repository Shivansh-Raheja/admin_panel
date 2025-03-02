import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Banners.css";

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    image: null,
    visible_status: "0",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get("http://localhost/admin_api/banners.php");
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
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
        await axios.put("http://localhost/admin_api/banners.php", formDataToSend);
        Swal.fire("Updated!", "Banner updated successfully.", "success");
      } else {
        await axios.post("http://localhost/admin_api/banners.php", formDataToSend);
        Swal.fire("Added!", "Banner added successfully.", "success");
      }
      
      fetchBanners();
      handleClose();
    } catch (error) {
      console.error("Error saving banner:", error);
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  const handleEdit = (banner) => {
    setFormData({ ...banner, image: null });
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
          await axios.delete(`http://localhost/admin_api/banners.php`, { data: { id } });
          fetchBanners();
          Swal.fire("Deleted!", "Your banner has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting banner:", error);
          Swal.fire("Error!", "Failed to delete banner.", "error");
        }
      }
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Banners</h2>
      <Button variant="primary" onClick={handleShow}>Add Banner</Button>
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
          {banners.map((banner) => (
            <tr key={banner.id}>
              <td>{banner.id}</td>
              <td>{banner.title}</td>
              <td>
                {banner.image && <img src={`http://localhost/admin_api/${banner.image}`} alt="Banner" className="banner-img" />}
              </td>
              <td>{banner.visible_status === "0" ? "Visible" : "Hidden"}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(banner)} className="me-2">Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(banner.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Banner" : "Add Banner"}</Modal.Title>
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
            <Button variant="success" type="submit">{editing ? "Update" : "Add"} Banner</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Banners;
