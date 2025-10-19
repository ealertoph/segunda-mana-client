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
import "../../css/styles.css";
import "../../css/adminsidebar.css";
import "../../css/forms.css";
import caritasLogo from "../../assets/caritas_icon.jpg";

const AddOrder = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    address: "",
    city: "",
    province: "",
    product: "",
    quantity: 1,
    paymentMethod: "",
    shippingMethod: "",
    notes: "",
  });

  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [products, setProducts] = useState([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const productPrices = {
    shirt: 500,
    pants: 700,
    shoes: 1200,
  };

  useEffect(() => {
    const selectedProduct = products.find((p) => p._id === formData.product);

    const price = selectedProduct ? selectedProduct.price : 0;
    const maxQty = selectedProduct ? selectedProduct.quantity : 1;

    const calcSubtotal = price * (formData.quantity || 1);
    const calcShipping =
      formData.shippingMethod === "delivery"
        ? 150
        : formData.shippingMethod === "pickup"
        ? 0
        : 0;

    setSubtotal(calcSubtotal);
    setShippingFee(calcShipping);
    setGrandTotal(calcSubtotal + calcShipping);
  }, [formData.product, formData.quantity, formData.shippingMethod, products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = sessionStorage.getItem("sg_admin_token");
        const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Filter only products with stock available
        const available = data.filter((p) => p.quantity > 0);
        setProducts(available);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    fetchProducts();
  }, []);
  // Update subtotal, shipping fee, and grand total dynamically

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const selectedProduct = products.find((p) => p._id === formData.product);
      const maxQty = selectedProduct ? selectedProduct.quantity : 1;
      const qty = Math.min(parseInt(value) || 1, maxQty);

      setFormData((prev) => ({ ...prev, quantity: qty }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("sg_admin_token"); // If protected route

    const selectedProduct = products.find((p) => p._id === formData.product);
    if (!selectedProduct) {
      alert("Invalid product selected!");
      return;
    }

    const orderData = {
      buyerName: formData.customerName,
      buyerEmail: formData.email,
      customer: {
        firstName: formData.customerName,
        phone: formData.contactNumber,
      },
      address: {
        street: formData.address,
        city: formData.city,
        state: formData.province,
        zip: "",
      },
      items: [
        {
          productId: formData.product,
          qty: formData.quantity,
          unitPrice: selectedProduct.price, // ✅ NOW DEFINED
        },
      ],
      subtotal: selectedProduct.price * formData.quantity,
      paymentMethod: formData.paymentMethod,
      orderType: formData.shippingMethod,
      additionalNotes: formData.notes,
      purchaseMethod: "online",
    };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL_ADMIN}/orders/manual-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!res.ok) throw new Error("Order failed");
      alert("Order placed successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to place order");
    }
  };

  return (
    <div className="admin-activity">
      {/* Mobile Sidebar Toggle */}
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

      {/* Overlay */}
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

        {/* Main Content */}
        <main className="admin-settings-content">
          <div className="page-title text-center mb-6">
            <h1 className="text-2xl font-bold">Add New Order</h1>
          </div>

          <form onSubmit={handleSubmit} className="form-container">
            {/* Customer Information */}
            <div className="form-panel mb-8">
              <div className="form-title">Customer Information</div>
              <div className="grid">
                <div className="form-group flex flex-col">
                  <label className="form-label">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group flex flex-col">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    className="form-input"
                  />
                </div>

                <div className="form-group flex flex-col">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="form-input"
                  />
                </div>

                <div className="form-group flex flex-col">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter street address"
                    className="form-input"
                  />
                </div>

                <div className="form-group flex flex-col">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="form-input"
                  />
                </div>

                <div className="form-group flex flex-col">
                  <label className="form-label">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Enter province"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div className="form-panel mb-8">
              <div className="form-title">Product Selection</div>
              <div className="grid">
                <div className="form-group flex flex-col">
                  <label className="form-label">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.itemName} — ₱{p.price} ({p.quantity} left)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex flex-col">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    max={
                      products.find((p) => p._id === formData.product)
                        ?.quantity || 1
                    }
                    value={formData.quantity}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="form-panel mb-8">
              <div className="form-title">Order Details</div>
              <div className="grid">
                <div className="form-group flex flex-col">
                  <label className="form-label">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash on Delivery</option>
                    <option value="gcash">GCash</option>
                  </select>
                </div>

                <div className="form-group flex flex-col">
                  <label className="form-label">Shipping Method</label>
                  <select
                    name="shippingMethod"
                    value={formData.shippingMethod}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select shipping method</option>
                    <option value="pickup">Pickup (₱0)</option>
                    <option value="delivery">Delivery (₱150)</option>
                  </select>
                </div>

                <div className="form-group flex flex-col col-span-2">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter any special instructions"
                    className="form-textarea"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="form-panel">
              <div className="form-title">Order Summary</div>
              <div className="summary" style={{ lineHeight: "1.8" }}>
                <p>
                  <strong>Customer:</strong> {formData.customerName || "—"}
                </p>
                <p>
                  <strong>Product:</strong>{" "}
                  {formData.product
                    ? `${
                        formData.product.charAt(0).toUpperCase() +
                        formData.product.slice(1)
                      }`
                    : "—"}
                </p>
                <p>
                  <strong>Quantity:</strong> {formData.quantity}
                </p>
                <p>
                  <strong>Payment:</strong> {formData.paymentMethod || "—"}
                </p>
                <p>
                  <strong>Shipping:</strong> {formData.shippingMethod || "—"}
                </p>
                <hr style={{ margin: "12px 0" }} />
                <p>
                  <strong>Subtotal:</strong> ₱{subtotal.toLocaleString()}
                </p>
                <p>
                  <strong>Shipping Fee:</strong> ₱{shippingFee.toLocaleString()}
                </p>
                <p>
                  <strong>Grand Total:</strong>{" "}
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>
                    ₱{grandTotal.toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn border"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Place Order
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddOrder;
