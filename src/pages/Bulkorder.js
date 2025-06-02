import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Bulkorder.css";

const OrderRequests = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://api.wonderplastpanel.in/admin_api/order_requests.php");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire("Error", "Failed to load orders", "error");
    }
  };

  // Fetch single order by ID
  const fetchOrderById = async (id) => {
    try {
      const response = await axios.get(`https://api.wonderplastpanel.in/admin_api/order_requests.php?id=${id}`);
      setCurrentOrder(response.data);
      setStatus(response.data.status);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching order:", error);
      Swal.fire("Error", "Failed to load order details", "error");
    }
  };

  // Update order status
  const updateStatus = async () => {
    try {
      await axios.put("https://api.wonderplastpanel.in/admin_api/order_requests.php", {
        id: currentOrder.id,
        status: status
      });
      Swal.fire("Success", "Order status updated successfully", "success");
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      Swal.fire("Error", "Failed to update order status", "error");
    }
  };

  // Delete order
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the order!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`https://api.wonderplastpanel.in/admin_api/order_requests.php?id=${id}`);
        Swal.fire("Deleted!", "Order has been deleted.", "success");
        fetchOrders();
      } catch (error) {
        Swal.fire("Error", "Failed to delete order", "error");
      }
    }
  };

  // Status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processed":
        return "info";
      case "completed":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="orders-container">
      <h2>Bulk Order Requests</h2>
      
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <div>{order.customer_name}</div>
                  <small className="text-muted">{order.email}</small>
                </td>
                <td>
                  {order.order_details.map((item, index) => (
                    <div key={index}>
                      {item.quantity}x {item.productName}
                    </div>
                  ))}
                </td>
                <td>₹{order.total_price}</td>
                <td>
                  <Badge bg={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => fetchOrderById(order.id)}
                  >
                    View/Edit
                  </Button>
                  {/* <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(order.id)} 
                    className="ms-2"
                  >
                    Delete
                  </Button> */}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">No orders found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order #{currentOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <div>
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Customer Details</h5>
                  <p><strong>Name:</strong> {currentOrder.customer_name}</p>
                  <p><strong>Email:</strong> {currentOrder.email}</p>
                  <p><strong>Phone:</strong> {currentOrder.phone}</p>
                  {currentOrder.occupation && (
                    <p><strong>Occupation:</strong> {currentOrder.occupation}</p>
                  )}
                  {currentOrder.reason && (
                    <p><strong>Reason:</strong> {currentOrder.reason}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <h5>Order Summary</h5>
                  <p><strong>Date:</strong> {new Date(currentOrder.created_at).toLocaleString()}</p>
                  <p><strong>Category:</strong> {currentOrder.category}</p>
                  <p><strong>Status:</strong> 
                    <select 
                      className="form-select d-inline-block w-auto ms-2"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processed">Processed</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </p>
                </div>
              </div>

              <h5>Order Items</h5>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Discount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.order_details.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.unitPrice}</td>
                      <td>{item.discount}</td>
                      <td>₹{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-end mt-3">
                <h4>Total: ₹{currentOrder.total_price}</h4>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={updateStatus}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderRequests;