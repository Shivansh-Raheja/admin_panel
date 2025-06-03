import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Badge, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Bulkorder.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [status, setStatus] = useState("processing");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://api.wonderplastpanel.in/admin_api/orders.php");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire("Error", "Failed to load orders", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single order by ID
  const fetchOrderById = async (orderId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://api.wonderplastpanel.in/admin_api/orders.php?id=${orderId}`);
      setCurrentOrder(response.data);
      setStatus(response.data.status);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching order:", error);
      Swal.fire("Error", "Failed to load order details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status
  const updateStatus = async () => {
    if (!currentOrder) return;
    
    try {
      await axios.put("https://api.wonderplastpanel.in/admin_api/orders.php", {
        orderId: currentOrder.orderId,
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
  const handleDelete = async (orderId) => {
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
        await axios.delete(`https://api.wonderplastpanel.in/admin_api/orders.php?id=${orderId}`);
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
      case "processing":
        return "warning";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="orders-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management</h2>
        <Button variant="primary" onClick={fetchOrders} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh Orders'}
        </Button>
      </div>
      
      {isLoading && orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading orders...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>
                    <div className="fw-semibold">{order.customer.name}</div>
                    <small className="text-muted">{order.customer.email}</small>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index}>
                          {item.quantity}x {item.productName}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <small className="text-muted">+{order.items.length - 2} more items</small>
                      )}
                    </div>
                  </td>
                  <td className="text-nowrap">{formatCurrency(order.summary.total)}</td>
                  <td>
                    <Badge bg={order.payment.method === 'cod' ? 'secondary' : 'success'}>
                      {order.payment.method.toUpperCase()}
                    </Badge>
                    <div className="small">
                      {order.payment.status === 'paid' ? (
                        <span className="text-success">Paid</span>
                      ) : (
                        <span className="text-warning">Pending</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge bg={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => fetchOrderById(order.orderId)}
                        disabled={isLoading}
                      >
                        View/Edit
                      </Button>
                      {/* <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(order.orderId)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Order Details Modal */}
      {/* Order Details Modal */}
<Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
  <Modal.Header closeButton>
    <Modal.Title>Order Details - #{currentOrder?.orderId}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {currentOrder && (
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-md-6">
            <h5>Customer Information</h5>
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Name</small>
                  <div className="fw-semibold">{currentOrder.customer.name}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Email</small>
                  <div className="fw-semibold">{currentOrder.customer.email}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Phone</small>
                  <div className="fw-semibold">{currentOrder.customer.phone}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Pincode</small>
                  <div className="fw-semibold">{currentOrder.customer.pincode}</div>
                </div>
              </div>
              <div className="col-12">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Address</small>
                  <div className="fw-semibold">{currentOrder.customer.address}</div>
                </div>
              </div>
              {currentOrder.customer.landmark && (
                <div className="col-12">
                  <div className="p-2 bg-light rounded">
                    <small className="text-muted">Landmark</small>
                    <div className="fw-semibold">{currentOrder.customer.landmark}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="col-md-6">
            <h5>Order Summary</h5>
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Order Date</small>
                  <div className="fw-semibold">{new Date(currentOrder.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Payment Method</small>
                  <div className="fw-semibold">
                    {currentOrder.payment.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Payment Status</small>
                  <div className="fw-semibold">
                    <Badge bg={currentOrder.payment.status === 'paid' ? 'success' : 'warning'}>
                      {currentOrder.payment.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Current Status</small>
                  <div className="fw-semibold">
                    <Badge bg={getStatusBadge(currentOrder.status)}>
                      {currentOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>
              {currentOrder.coupon && (
                <div className="col-12">
                  <div className="p-2 bg-light rounded">
                    <small className="text-muted">Coupon Applied</small>
                    <div className="fw-semibold">
                      {currentOrder.coupon.name} ({currentOrder.coupon.discountPercentage}% off)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h5>Order Items</h5>
            <div className="table-responsive">
              <Table striped bordered hover className="mb-4">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-end">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 offset-md-6">
            <div className="table-responsive">
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="fw-semibold">Subtotal</td>
                    <td className="text-end">{formatCurrency(currentOrder.summary.subtotal)}</td>
                  </tr>
                  {currentOrder.coupon && (
                    <tr>
                      <td className="fw-semibold">Discount ({currentOrder.coupon.name})</td>
                      <td className="text-end">-{formatCurrency(currentOrder.summary.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="fw-semibold">Delivery Fee</td>
                    <td className="text-end">{formatCurrency(currentOrder.summary.deliveryFee)}</td>
                  </tr>
                  <tr className="table-active">
                    <td className="fw-semibold">Total Amount</td>
                    <td className="text-end fw-bold">{formatCurrency(currentOrder.summary.total)}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label><strong>Update Status:</strong></Form.Label>
              <Form.Select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>
      </div>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Close
    </Button>
    <Button variant="primary" onClick={updateStatus} disabled={isLoading}>
      {isLoading ? 'Saving...' : 'Save Changes'}
    </Button>
  </Modal.Footer>
</Modal>
    </div>
  );
};

export default OrderManagement;