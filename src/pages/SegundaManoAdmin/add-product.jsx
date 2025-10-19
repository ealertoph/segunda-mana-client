import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Box,
  ClipboardList,
  User,
  Megaphone,
  Activity,
  Settings,
  Upload,
  Trash2,
  FilePen,
  Boxes,
} from "lucide-react";
import "../../css/styles.css";
import "../../css/adminsidebar.css";
import "../../css/forms.css";

const AddProduct = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Product data
  const [product, setProduct] = useState({
    arRef: "",
    itemName: "",
    category: "",
    size: "",
    price: "",
    status: "Available",
    description: "",
  });

  // Image uploads
  const [images, setImages] = useState([null, null, null, null]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Authentication check
  // useEffect(() => {
  //   const isAuthed = sessionStorage.getItem("sg_admin_logged_in") === "true";
  //   if (!isAuthed) {
  //     window.location.replace("/login");
  //   }
  // }, []);

  // Handle image selection
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const newImages = [...images];
    newImages[index] = file; // store file, not URL
    setImages(newImages);
  };
  const previewImages = images.map((img) =>
    img ? URL.createObjectURL(img) : null
  );

  // Handle image removal
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !product.arRef ||
      !product.name ||
      !product.category ||
      !product.price
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append product fields
      formDataToSend.append("arRef", product.arRef);
      formDataToSend.append("itemName", product.name);
      formDataToSend.append("category", product.category);
      formDataToSend.append("size", product.size);
      formDataToSend.append("price", product.price);
      formDataToSend.append("quantity", product.quantity || 1);
      formDataToSend.append("description", product.description);

      // Append images
      images.forEach((imgFile, index) => {
        if (imgFile instanceof File) {
          formDataToSend.append("images", imgFile);
        }
      });

      const token = sessionStorage.getItem("sg_admin_token");
      const response = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/products`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      const data = await response.json();
      alert("Product added successfully!");

      // Reset form
      setProduct({
        arRef: "",
        itemName: "",
        category: "",
        size: "",
        price: "",
        status: "Available",
        description: "",
      });
      setImages([null, null, null, null]);
    } catch (error) {
      console.error("Error adding product:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="admin-activity">
      {/* Mobile menu button */}
      <button
        className="admin-settings-mobile-menu-toggle"
        onClick={toggleSidebar}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Sidebar overlay */}
      <div
        className={`admin-settings-sidebar-overlay ${
          sidebarOpen ? "open" : ""
        }`}
        onClick={toggleSidebar}
      ></div>

      <div className="admin-settings-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="admin-brand">
            <div className="admin-logo"></div>
            <span className="admin-brand-text">
              <span>Segunda</span>
              <span>Mana</span>
            </span>
          </div>

          <nav className="admin-nav">
            <div className="admin-section-title">GENERAL</div>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Home size={18} /> Dashboard
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Boxes size={18} /> Inventory
            </NavLink>
            <NavLink
              to="/admin-product"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Box size={18} /> Product
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <ClipboardList size={18} /> Order Management
            </NavLink>
            <NavLink
              to="/beneficiary"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <User size={18} /> Beneficiary
            </NavLink>
            <NavLink
              to="/announcement"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Megaphone size={18} /> Announcement
            </NavLink>

            <div className="admin-section-title">TOOLS</div>
            <NavLink
              to="/dailycollection"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FilePen size={18} /> Daily Collection
            </NavLink>
            {sessionStorage.getItem("sg_admin_role") === "superadmin" && (
              <NavLink
                to="/activity"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Activity size={18} /> Activity Log
              </NavLink>
            )}
            <NavLink
              to="/account-settings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Settings size={18} /> Account Settings
            </NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="admin-settings-content">
          <div className="content">
            <div className="page-title text-center mb-6">
              <h1 className="text-2xl font-bold">Add New Product</h1>
            </div>

            <div className="form-container max-w-6xl mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Product details */}
                  <div className="form-panel md:col-span-2">
                    <div className="form-title">Product Information</div>

                    <div className="form-group mb-4">
                      <label className="form-label">AR Ref No. *</label>
                      <input
                        type="text"
                        placeholder="Enter AR Reference Number"
                        value={product.arRef}
                        onChange={(e) =>
                          setProduct({ ...product, arRef: e.target.value })
                        }
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label">Item Name *</label>
                      <input
                        type="text"
                        placeholder="Enter item name"
                        value={product.name}
                        onChange={(e) =>
                          setProduct({ ...product, name: e.target.value })
                        }
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Category *</label>
                        <select
                          value={product.category}
                          onChange={(e) =>
                            setProduct({ ...product, category: e.target.value })
                          }
                          className="form-select"
                          required
                        >
                          <option value="">Select category</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Gadgets & Phones">
                            Gadgets & Phones
                          </option>
                          <option value="Bags">Bags</option>
                          <option value="Toys">Toys</option>
                          <option value="Dining">Dining</option>
                          <option value="Outdoors">Outdoors</option>
                        </select>
                      </div>
                      {["Clothing", "Shoes"].includes(product.category) && (
                        <div>
                          <label className="form-label">Size</label>
                          <select
                            value={product.size || "M"}
                            onChange={(e) =>
                              setProduct({ ...product, size: e.target.value })
                            }
                            className="form-select"
                            required
                          >
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="form-label">Price (₱) *</label>
                        <input
                          type="number"
                          placeholder="Enter price"
                          value={product.price}
                          onChange={(e) =>
                            setProduct({ ...product, price: e.target.value })
                          }
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          placeholder="Enter stock quantity"
                          value={product.quantity || 1}
                          onChange={(e) =>
                            setProduct({ ...product, quantity: e.target.value })
                          }
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="form-label">
                          Perceived Value (₱)
                        </label>
                        <input
                          type="number"
                          placeholder="Value for impact calculation"
                          value={product.perceivedValue || 0.5}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              perceivedValue: e.target.value,
                            })
                          }
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Impact (Meals)</label>
                        <input
                          type="number"
                          placeholder="Meals Impact"
                          value={product.impact?.meals || 0}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              impact: {
                                ...product.impact,
                                meals: e.target.value,
                              },
                            })
                          }
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group mt-4">
                      <label className="form-label">Description</label>
                      <textarea
                        placeholder="Enter product description"
                        value={product.description}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            description: e.target.value,
                          })
                        }
                        className="form-textarea"
                      />
                    </div>
                  </div>

                  {/* Upload images */}
                  <div className="form-panel">
                    <div className="form-title">Upload Images</div>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload up to 4 product photos (JPG/PNG)
                    </p>

                    <div className="upload-grid">
                      {images.map((img, i) => (
                        <div key={i} className="upload-box">
                          {img ? (
                            <>
                              <img
                                src={images[i] ? previewImages[i] : ""}
                                alt={`Upload ${i}`}
                                className="upload-preview"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(i)}
                                className="remove-btn"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                            </>
                          ) : (
                            <label className="upload-placeholder">
                              <Upload size={36} strokeWidth={1.3} />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => handleImageChange(e, i)}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn border"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn primary">
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddProduct;
