import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Brochure.css";

const Brochure = () => {
    const [brochures, setBrochures] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: "", title: "", file: null, type: "" });

    useEffect(() => {
        fetchBrochures();
    }, []);

    const fetchBrochures = async () => {
        try {
            const response = await axios.get("http://api.magnumwonderplast.com/admin_api/brochure.php");
            if (response.data.success) {
                setBrochures(response.data.brochures);
            }
        } catch (error) {
            console.error("Error fetching brochures:", error);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append("title", formData.title);
        form.append("type", formData.type);
        if (formData.file) form.append("file", formData.file);

        try {
            if (editMode) {
                form.append("id", formData.id);
                await axios.post("http://api.magnumwonderplast.com/admin_api/brochure.php?_method=PUT", form);
                Swal.fire("Success!", "Brochure updated successfully.", "success");
            } else {
                await axios.post("http://api.magnumwonderplast.com/admin_api/brochure.php", form);
                Swal.fire("Success!", "Brochure added successfully.", "success");
            }
            fetchBrochures();
            handleClose();
        } catch (error) {
            Swal.fire("Error!", "Something went wrong. Try again.", "error");
            console.error("Error saving brochure:", error);
        }
    };

    const handleEdit = (brochure) => {
        setFormData({ id: brochure.id, title: brochure.title, file: null, type: brochure.type });
        setEditMode(true);
        setShowModal(true);
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
                await axios.delete("http://api.magnumwonderplast.com/admin_api/brochure.php", {
                    data: { id },
                });
                Swal.fire("Deleted!", "Brochure has been deleted.", "success");
                fetchBrochures();
            } catch (error) {
                Swal.fire("Error!", "Failed to delete brochure.", "error");
                console.error("Error deleting brochure:", error);
            }
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditMode(false);
        setFormData({ id: "", title: "", file: null, type: "" });
    };

    return (
        <div className="container mt-4">
            <h2>Brochure Management</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
                Add Brochure
            </Button>

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>File</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {brochures.map((brochure) => (
                        <tr key={brochure.id}>
                            <td>{brochure.id}</td>
                            <td>{brochure.title}</td>
                            <td>{brochure.type || "N/A"}</td>
                            <td>
                                <a href={`http://api.magnumwonderplast.com/admin_api/${brochure.file_path}`} target="_blank" rel="noopener noreferrer">
                                    View File
                                </a>
                            </td>
                            <td>
                                <Button variant="warning" size="sm" onClick={() => handleEdit(brochure)}>
                                    Edit
                                </Button>
                                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(brochure.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? "Edit Brochure" : "Add Brochure"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mt-2">
                            <Form.Label>Type</Form.Label>
                            <Form.Select name="type" value={formData.type} onChange={handleChange} required>
                                <option value="">Select Type</option>
                                <option value="main">Main</option>
                                <option value="kids">Kids</option>
                                <option value="trifold">Trifold</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-2">
                            <Form.Label>File (PDF/DOC)</Form.Label>
                            <Form.Control type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-3">
                            {editMode ? "Update" : "Add"} Brochure
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Brochure;
