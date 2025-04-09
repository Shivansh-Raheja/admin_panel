import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Coupon.css";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    discount: "",
    threshold_amount: "",
    usage_limit: 1,
    valid_from: "",
    valid_until: "",
    status: "0",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get("http://api.magnumwonderplast.com/admin_api/coupon.php");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleShowModal = (coupon = null) => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData({
        id: null,
        name: "",
        discount: "",
        threshold_amount: "",
        usage_limit: 1,
        valid_from: "",
        valid_until: "",
        status: "0",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveCoupon = async () => {
    try {
      if (formData.id) {
        await axios.put("http://api.magnumwonderplast.com/admin_api/coupon.php", formData);
        Swal.fire("Updated!", "Coupon updated successfully.", "success");
      } else {
        await axios.post("http://api.magnumwonderplast.com/admin_api/coupon.php", formData);
        Swal.fire("Added!", "Coupon added successfully.", "success");
      }
      fetchCoupons();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving coupon:", error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This coupon will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff6b00",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete("http://api.magnumwonderplast.com/admin_api/coupon.php", {
          data: { id },
        });
        fetchCoupons();
        Swal.fire("Deleted!", "Coupon has been deleted.", "success");
      }
    });
  };

  return (
    <div className="containerr">
      <h2 className="title">Coupons</h2>
      <Button onClick={() => handleShowModal()} className="add-button">
        Add Coupon
      </Button>
      <Table bordered className="coupons-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Discount (%)</th>
            <th>Threshold Amount</th>
            <th>Usage Limit</th>
            <th>Valid From</th>
            <th>Valid Until</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon.id}>
              <td>{coupon.id}</td>
              <td>{coupon.name}</td>
              <td>{coupon.discount}</td>
              <td>{coupon.threshold_amount}</td>
              <td>{coupon.usage_limit}</td>
              <td>{coupon.valid_from}</td>
              <td>{coupon.valid_until}</td>
              <td className={coupon.status === "0" ? "public" : "private"}>
                {coupon.status === "0" ? "Public" : "Private"}
              </td>
              <td>
                <Button size="sm" variant="warning" onClick={() => handleShowModal(coupon)}>
                  Edit
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteCoupon(coupon.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit Coupon */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Edit Coupon" : "Add Coupon"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control type="number" name="discount" value={formData.discount} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Threshold Amount</Form.Label>
              <Form.Control type="number" name="threshold_amount" value={formData.threshold_amount} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Usage Limit</Form.Label>
              <Form.Control type="number" name="usage_limit" value={formData.usage_limit} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Valid From</Form.Label>
              <Form.Control type="date" name="valid_from" value={formData.valid_from} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Valid Until</Form.Label>
              <Form.Control type="date" name="valid_until" value={formData.valid_until} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="0">Public</option>
                <option value="1">Private</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveCoupon}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Coupons;
