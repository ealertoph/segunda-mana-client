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
  FilePen,
  Boxes,
} from "lucide-react";
import "../../css/adminsidebar.css";
import "../../css/forms.css";
import caritasLogo from "../../assets/caritas_icon.jpg";

const AddInventory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  //   const isAuthed = sessionStorage.getItem("sg_admin_logged_in") === "true";
  //   if (!isAuthed) window.location.replace("/login");
  // }, []);

  const [formData, setFormData] = useState({
    arRef: "",
    itemName: "",
    category: "",
    size: "",
    price: "",
    status: "Available",
    description: "",
  });

  useEffect(() => {
    if (!["Clothing", "Shoes"].includes(formData.category)) {
      setFormData((prev) => ({ ...prev, size: "" }));
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("sg_admin_token");
      const response = await fetch(
        `http://localhost:5000/api/admin/inventory/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add inventory");
      }

      const data = await response.json();
      alert("Inventory item added successfully!");

      // Reset form
      setFormData({
        arRef: "",
        itemName: "",
        category: "",
        size: "",
        price: "",
        status: "Available",
        description: "",
      });

      // Optionally navigate to inventory list page
      // navigate("/inventory");
    } catch (error) {
      console.error("Error adding inventory:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="admin-activity">
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

      <div
        className={`admin-settings-sidebar-overlay ${
          sidebarOpen ? "open" : ""
        }`}
        onClick={toggleSidebar}
      ></div>

      <div className="admin-settings-layout">
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="admin-brand">
            <img src={caritasLogo} alt="Caritas Logo" className="admin-logo" />
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

        <main className="admin-settings-content">
          <div className="content p-6">
            <div className="page-title text-center mb-6">
              <h1 className="text-2xl font-bold">Add Inventory Item</h1>
            </div>

            <div className="form-container max-w-5xl mx-auto">
              <div className="form-panel">
                <div className="form-title mb-4">Inventory Information</div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group flex flex-col">
                      <label className="form-label">AR Ref No.</label>
                      <input
                        type="text"
                        name="arRef"
                        value={formData.arRef}
                        onChange={handleChange}
                        placeholder="Enter AR reference number"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group flex flex-col">
                      <label className="form-label">Item Name</label>
                      <input
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        placeholder="Enter item name"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group flex flex-col">
                      <label className="form-label">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">Select category</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Shoes">Shoes</option>
                        <option value="Bags">Bags</option>
                      </select>
                    </div>

                    {["Clothing", "Shoes"].includes(formData.category) && (
                      <div className="form-group flex flex-col">
                        <label className="form-label">Size</label>
                        <input
                          type="text"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          placeholder="Enter item size"
                          className="form-input"
                        />
                      </div>
                    )}

                    <div className="form-group flex flex-col">
                      <label className="form-label">Price</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Enter price"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group flex flex-col">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="Available">Available</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>

                    <div className="form-group flex flex-col md:col-span-2">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter item description"
                        className="form-textarea"
                      />
                    </div>
                  </div>

                  <div className="form-actions mt-6">
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      className="btn border"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn primary">
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddInventory;
