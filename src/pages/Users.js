import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://13.233.119.140/admin_api/users.php");
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle Add/Edit Form Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Add / Edit User
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://13.233.119.140/admin_api/users.php", formData);
      if (response.data.success) {
        Swal.fire("Success", response.data.message, "success");
        setShowModal(false);
        fetchUsers();
      } else {
        Swal.fire("Error", response.data.message, "error");
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // Handle Delete User
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
        await axios.delete(`http://localhost/admin_api/users.php?id=${id}`);
        Swal.fire("Deleted!", "User has been deleted.", "success");
        fetchUsers();
      } catch (error) {
        Swal.fire("Error", "Failed to delete user.", "error");
      }
    }
  };

  return (
    <div className="users-container">
      <h2>Users</h2>
      <Button variant="primary" onClick={() => { setShowModal(true); setEditUser(null); }}>+ Add User</Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => { setShowModal(true); setEditUser(user); setFormData(user); }}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)} className="ms-2">Delete</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" className="text-center">No users found</td></tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editUser ? "Edit User" : "Add User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>
            {!editUser && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
              </Form.Group>
            )}
            <Button variant="success" type="submit">{editUser ? "Update" : "Add"} User</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Users;
