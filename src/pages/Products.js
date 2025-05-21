import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Row, Col, Badge } from "react-bootstrap";
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
    sku: "",
    short_description: "",
    features: "",
    description: "",
    product_reviews: "",
    youtube_video_link: "",
    colors: [],
    images: [],
    image_3d: null,
    description_images: []
  });

  // Helper function to safely parse JSON or return default value
  const safeJsonParse = (str, defaultValue = []) => {
    try {
      if (typeof str === 'string') {
        return JSON.parse(str);
      }
      if (Array.isArray(str)) {
        return str;
      }
      return defaultValue;
    } catch (e) {
      console.error('JSON parse error:', e);
      return defaultValue;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://api.wonderplastpanel.in/admin_api/products.php");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://api.wonderplastpanel.in/admin_api/categories.php");
      if (response.data.success && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else {
        console.error("Unexpected response format:", response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
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
        sku: product.sku || "",
        short_description: product.short_description,
        features: product.features,
        description: product.description,
        product_reviews: product.product_reviews || "",
        youtube_video_link: product.youtube_video_link || "",
        colors: safeJsonParse(product.colors),
        images: [], // This is for new files to upload
        image_3d: null, // This is for new file to upload
        description_images: [], // This is for new files to upload
        // Add existing paths for display purposes
        existing_images: safeJsonParse(product.images),
        existing_description_images: safeJsonParse(product.description_images),
        existing_image_3d: product.image_3d
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        cost: "",
        mrp: "",
        category_id: "",
        sku: "",
        short_description: "",
        features: "",
        description: "",
        product_reviews: "",
        youtube_video_link: "",
        colors: [],
        images: [],
        image_3d: null,
        description_images: []
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

  const handleDescImagesChange = (e) => {
    setFormData({ ...formData, description_images: Array.from(e.target.files) });
  };

  const handle3DFileChange = (e) => {
    setFormData({ ...formData, image_3d: e.target.files[0] });
  };

  const handleColorChange = (e, index) => {
    const newColors = [...formData.colors];
    newColors[index] = e.target.value;
    setFormData({ ...formData, colors: newColors });
  };

  const addColorField = () => {
    if (formData.colors.length < 4) {
      setFormData({ ...formData, colors: [...formData.colors, ""] });
    }
  };

  const removeColorField = (index) => {
    const newColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: newColors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = new FormData();
    productData.append("name", formData.name);
    productData.append("cost", formData.cost);
    productData.append("mrp", formData.mrp);
    productData.append("category_id", formData.category_id);
    productData.append("sku", formData.sku);
    productData.append("short_description", formData.short_description);
    productData.append("features", formData.features);
    productData.append("description", formData.description);
    productData.append("product_reviews", formData.product_reviews);
    productData.append("youtube_video_link", formData.youtube_video_link);
    productData.append("colors", JSON.stringify(formData.colors));

    // Append images
    formData.images.forEach((file) => productData.append("images[]", file));
    
    // Append description images
    formData.description_images.forEach((file) => 
      productData.append("description_images[]", file)
    );

    // Append 3D image if exists
    if (formData.image_3d) {
      productData.append("image_3d", formData.image_3d);
    }

    try {
      const url = "https://api.wonderplastpanel.in/admin_api/products.php";
      const config = {
        headers: { "Content-Type": "multipart/form-data" }
      };

      if (editingProduct) {
        if (formData.existing_images) {
          productData.append("existing_images", JSON.stringify(formData.existing_images));
        }
        if (formData.existing_description_images) {
          productData.append("existing_description_images", JSON.stringify(formData.existing_description_images));
        }
        if (formData.existing_image_3d) {
          productData.append("existing_image_3d", formData.existing_image_3d);
        }
        productData.append("_method", "PUT");
        productData.append("id", editingProduct.id);
        await axios.post(url, productData, config);
        Swal.fire("Success!", "Product updated successfully.", "success");
      } else {
        await axios.post(url, productData, config);
        Swal.fire("Success!", "Product added successfully.", "success");
      }
      
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire("Error!", error.response?.data?.message || "Failed to save product.", "error");
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
          await axios.delete("https://api.wonderplastpanel.in/admin_api/products.php", { 
            data: { id } 
          });
          Swal.fire("Deleted!", "The product has been removed.", "success");
          fetchProducts();
        } catch (error) {
          Swal.fire("Error!", "Failed to delete product.", "error");
        }
      }
    });
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    // Handle both string and array inputs
    const imagePath = Array.isArray(path) ? path[0] : path;
    // Check if imagePath exists and is a string before calling replace
    if (typeof imagePath !== 'string') return '';
    // Normalize path and construct full URL
    return `https://api.wonderplastpanel.in/admin_api/${imagePath.replace(/\\\//g, '/')}`;
  };

  return (
    <div className="products-container">
      <h2>Manage Products</h2>
      <Button variant="primary" onClick={() => handleShow()}>Add Product</Button>
      
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Category</th>
            <th>Colors</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                
                    <strong>{product.name}</strong>
                
              </td>
              <td>{product.sku || '-'}</td>
              <td>
                <div>Cost: Rs.{product.cost}</div>
                <div>MRP: Rs.{product.mrp}</div>
              </td>
              <td>{product.category_name}</td>
              <td>
                {safeJsonParse(product.colors).map((color, index) => (
                  <Badge key={index} className="me-1" bg="secondary">
                    {color}
                  </Badge>
                ))}
              </td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleShow(product)}>
                  Edit
                </Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Product Modal */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name*</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>SKU</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Product SKU or code"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Short Description*</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Features</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cost*</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>MRP*</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category*</Form.Label>
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

                <Form.Group className="mb-3">
                  <Form.Label>Product Reviews</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.product_reviews}
                    onChange={(e) => setFormData({ ...formData, product_reviews: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>YouTube Video Link</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtube_video_link}
                    onChange={(e) => setFormData({ ...formData, youtube_video_link: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Colors (Max 4 colors)</Form.Label>
                  {formData.colors.map((color, index) => (
                    <div key={index} className="d-flex mb-2">
                      <Form.Control
                        type="text"
                        value={color}
                        onChange={(e) => handleColorChange(e, index)}
                        placeholder="Color name or hex code"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => removeColorField(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {formData.colors.length < 4 && (
                    <Button variant="outline-secondary" size="sm" onClick={addColorField}>
                      + Add Color
                    </Button>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Main Images* (Upto 5)</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {editingProduct && editingProduct.images && (
                    <div className="mt-2">
                      <small>Current Images:</small>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {safeJsonParse(editingProduct.images).map((img, i) => (
                          <img
                            key={i}
                            src={getImageUrl(img)}
                            alt={`Product ${i}`}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description Images (Max 4 Images)</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleDescImagesChange}
                  />
                  {editingProduct && editingProduct.description_images && (
                    <div className="mt-2">
                      <small>Current Description Images:</small>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {safeJsonParse(editingProduct.description_images).map((img, i) => (
                          <img
                            key={i}
                            src={getImageUrl(img)}
                            alt={`Desc ${i}`}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>3D Model (GLB/GLTF/FBX)</Form.Label>
              <Form.Control
                type="file"
                accept=".glb,.gltf,.fbx"
                onChange={handle3DFileChange}
              />
              {editingProduct && editingProduct.image_3d && (
                <div className="mt-2">
                  <small>Current 3D Model:</small>
                  <div>{editingProduct.image_3d}</div>
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleClose} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingProduct ? "Update" : "Save"} Product
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Products;