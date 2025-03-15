import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [show, setShow] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    mrp: "",
    category_id: "",
    short_description: "",
    features: "",
    description: "",
    product_reviews: "",
    images: [],
    image_3d: null,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://api.magnumwonderplast.com/admin_api/products.php");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://api.magnumwonderplast.com/admin_api/categories.php");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleShow = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        cost: product.cost,
        mrp: product.mrp,
        category_id: product.category_id,
        short_description: product.short_description,
        features: product.features,
        description: product.description,
        product_reviews: product.product_reviews || "",
        images: [],
        image_3d: null,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        cost: "",
        mrp: "",
        category_id: "",
        short_description: "",
        features: "",
        description: "",
        product_reviews: "",
        images: [],
        image_3d: null,
      });
    }
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setEditingProduct(null);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handle3DFileChange = (e) => {
    setFormData({ ...formData, image_3d: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = new FormData();
    productData.append("name", formData.name);
    productData.append("cost", formData.cost);
    productData.append("mrp", formData.mrp);
    productData.append("category_id", formData.category_id);
    productData.append("short_description", formData.short_description);
    productData.append("features", formData.features);
    productData.append("description", formData.description);
    productData.append("product_reviews", formData.product_reviews);

    // Append images
    formData.images.forEach((file) => productData.append("images[]", file));

    // Append 3D image if exists
    if (formData.image_3d) {
      productData.append("image_3d", formData.image_3d);
    }

    try {
      await axios.post("https://api.magnumwonderplast.com/admin_api/products.php", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Success!", "Product added successfully.", "success");
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error("Error adding product:", error);
      Swal.fire("Error!", "Failed to add product.", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff6b00",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete("https://api.magnumwonderplast.com/admin_api/products.php", { data: { id } });
          Swal.fire("Deleted!", "The product has been removed.", "success");
          fetchProducts();
        } catch (error) {
          Swal.fire("Error!", "Failed to delete product.", "error");
        }
      }
    });
  };

  return (
    <div className="products-container">
      <h2>Manage Products</h2>
      <Button variant="primary" onClick={() => handleShow()}>Add Product</Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Cost</th>
            <th>MRP</th>
            <th>Category</th>
            <th>Short Desc.</th>
            <th>Features</th>
            <th>Description</th>
            <th>Reviews</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {product.images && product.images.length > 0 && (
                  <img
                    src={`https://api.magnumwonderplast.com/admin_api/${product.images[0]}`}
                    alt="Product"
                    className="product-image"
                    style={{ width: "50px", height: "50px" }}
                  />
                )}
              </td>
              <td>{product.name}</td>
              <td>${product.cost}</td>
              <td>${product.mrp}</td>
              <td>{product.category_name}</td>
              <td>{product.short_description}</td>
              <td>{product.features}</td>
              <td>{product.description}</td>
              <td>{product.product_reviews}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleShow(product)}>Edit</Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Product Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form onSubmit={handleSubmit}>
  <Form.Group>
    <Form.Label>Name</Form.Label>
    <Form.Control
      type="text"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      required
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Short Description</Form.Label>
    <Form.Control
      type="text"
      value={formData.short_description}
      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
      required
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Features</Form.Label>
    <Form.Control
      as="textarea"
      rows={3}
      value={formData.features}
      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Description</Form.Label>
    <Form.Control
      as="textarea"
      rows={4}
      value={formData.description}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      required
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Cost</Form.Label>
    <Form.Control
      type="number"
      value={formData.cost}
      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
      required
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>MRP</Form.Label>
    <Form.Control
      type="number"
      value={formData.mrp}
      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
      required
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Category</Form.Label>
    <Form.Select
      value={formData.category_id}
      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
      required
    >
      <option value="">Select Category</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.title}
        </option>
      ))}
    </Form.Select>
  </Form.Group>

  <Form.Group>
    <Form.Label>Product Reviews</Form.Label>
    <Form.Control
      as="textarea"
      rows={2}
      value={formData.product_reviews}
      onChange={(e) => setFormData({ ...formData, product_reviews: e.target.value })}
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Images (Max 8)</Form.Label>
    <Form.Control type="file" multiple accept="image/*" onChange={handleFileChange} />
  </Form.Group>

  <Form.Group>
    <Form.Label>3D Image</Form.Label>
    <Form.Control type="file" accept=".glb,.gltf" onChange={handle3DFileChange} />
  </Form.Group>

            <Button variant="primary" type="submit">Save</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Products;
