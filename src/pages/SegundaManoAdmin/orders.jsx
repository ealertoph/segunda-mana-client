import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  Users,
} from "lucide-react";
import "../../css/styles.css";
import "../../css/adminsidebar.css";
import caritasLogo from "../../assets/caritas_icon.jpg";
import ActionButtons from "./action-buttons";
import ViewModal from "./view-modal";

const OrderManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const maxPageNumbers = 3;
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const token = sessionStorage.getItem("sg_admin_token");
    if (!token) {
      navigate("/login");
      return;
    }
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };

    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem("sg_admin_token");
        const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders", error);
      }
    };

    fetchOrders();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filtered = orders.filter((o) => {
    const orderId = o._id?.toLowerCase() || "";
    const customer = o.buyerName?.toLowerCase() || "";
    const productNames = o.items
      .map(
        (i) =>
          i.productId?.title?.toLowerCase() ||
          i.productId?.itemName?.toLowerCase() ||
          ""
      )
      .join(" ");

    const searchTerm = search.toLowerCase();

    return (
      orderId.includes(searchTerm) ||
      customer.includes(searchTerm) ||
      productNames.includes(searchTerm) ||
      o.paymentStatus?.toLowerCase().includes(searchTerm) ||
      new Date(o.createdAt).toLocaleDateString().includes(searchTerm)
    );
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      "No",
      "Order ID",
      "Product IDs",
      "Product Names",
      "Customer",
      "Date",
      "Time",
      "Status",
      "Payment Status",
    ];

    const rows = filtered.map((o, index) => {
      const productNames = o.items
        .map((i) => i.productId?.title || i.productId?.itemName || "")
        .join(", ");
      const productIds = o.items
        .map((i) => i.productId?._id || i.productId?.id || "")
        .join(", ");

      const date = new Date(o.createdAt);
      const dateStr = date.toLocaleDateString("en-PH");
      const timeStr = date.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return [
        index + 1,
        o._id || "",
        productIds,
        productNames,
        o.buyerName || "",
        dateStr,
        timeStr,
        o.status || "",
        o.paymentStatus || "Pending",
      ].map((val) => `"${String(val).replace(/"/g, '""')}"`);
    });

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleView = (item) => setViewData(item);
  const handleEdit = (item) => setEditData(item);
  const handleDelete = (item) => setDeleteItem(item);

  const confirmDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("sg_admin_token");
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/orders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete order");

      alert("Order deleted successfully!");
      setOrders((prev) => prev.filter((o) => o._id !== id));
      setDeleteItem(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Error deleting order");
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filtered.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filtered.length / ordersPerPage);

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

  if (endPage - startPage + 1 < maxPageNumbers) {
    startPage = Math.max(1, endPage - maxPageNumbers + 1);
  }
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  const updateToReceive = async (id) => {
    await updateStatus(id, "to-receive");
  };

  const updateReceived = async (id) => {
    await updateStatus(id, "received");
  };

  const cancelOrder = async (id) => {
    await updateStatus(id, "cancel");
  };

  const updateStatus = async (id, action) => {
    const token = sessionStorage.getItem("sg_admin_token");
    let url = `${process.env.REACT_APP_API_URL_ADMIN}/orders/${id}/${action}`;

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedOrder = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    } catch (err) {
      console.error("Error:", err);
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
            {sessionStorage.getItem("sg_admin_role") === "superadmin" && (
              <NavLink
                to="/activity"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Activity size={18} /> Activity Log
              </NavLink>
            )}

            {/* Staff Management - Superadmin Only */}
            {sessionStorage.getItem("sg_admin_role") === "superadmin" && (
              <NavLink
                to="/staff-management"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Users size={18} /> Staff Management
              </NavLink>
            )}
            <NavLink
              to="/dailycollection"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FilePen size={18} /> Daily Collection
            </NavLink>

            <NavLink
              to="/account-settings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Settings size={18} /> Account Settings
            </NavLink>
          </nav>
        </aside>

        <main className="admin-settings-content">
          <div className="admin-settings-page-title">
            <h1 className="admin-h1 mb-6">Order Management</h1>
          </div>

          <div className="toolbar">
            <div className="search">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9aa4b2"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                placeholder="Search for ID, name, product, or payment status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/*<button className="btn">Filter</button>*/}
            <button className="btn" onClick={exportCSV}>
              Export CSV
            </button>
            <NavLink to="/add-order" className="btn btn-add">
              + Add New Order
            </NavLink>
          </div>

          <div className="table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>No</th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((o, index) => (
                  <tr key={o._id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{indexOfFirstOrder + index + 1}</td>
                    <td>{o._id}</td>
                    <td>
                      {o.items
                        .map((i) => i.productId?.title || i.productId?.itemName)
                        .join(", ")}
                    </td>
                    <td>{o.buyerName}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(o.createdAt).toLocaleTimeString()}</td>
                    <td>
                      {o.status === "Received" ? (
                        <span className="status active">Received</span>
                      ) : (
                        <span className="status hold">{o.status}</span>
                      )}
                    </td>
                    <td>
                      {o.paymentStatus
                        ? o.paymentStatus.toUpperCase()
                        : "PENDING"}
                    </td>
                    <td>
                      <ActionButtons
                        onView={() => handleView(o)}
                        onEdit={() => handleEdit(o)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {pageNumbers.map((num) => (
              <button
                key={num}
                className={`page-btn ${currentPage === num ? "active" : ""}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>

          {/* View Modal */}
          <ViewModal data={viewData} onClose={() => setViewData(null)} />

          {/* Edit Modal */}
          {editData && (
            <div className="modal-overlay">
              <div className="modal-box max-w-md">
                <div className="modal-header">
                  <h2>Edit Order</h2>
                  <button
                    className="modal-close"
                    onClick={() => setEditData(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-content">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select mb-4"
                    value={editData.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      setEditData({ ...editData, status: newStatus });

                      try {
                        const token = sessionStorage.getItem("sg_admin_token");
                        let url = `${process.env.REACT_APP_API_URL_ADMIN}/orders/${editData._id}`;

                        if (
                          newStatus === "to receive" ||
                          newStatus === "Pending"
                        ) {
                          url += "/to-receive";
                        } else if (
                          newStatus === "received" ||
                          newStatus === "Received"
                        ) {
                          url += "/received";
                        } else if (
                          newStatus === "cancelled" ||
                          newStatus === "Cancelled"
                        ) {
                          // If cancel is handled separately
                          url += ""; // stay on base /:id (default cancel endpoint)
                        }

                        const res = await fetch(url, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ status: newStatus }),
                        });

                        const result = await res.json();
                        if (!res.ok)
                          throw new Error(
                            result.message || "Failed to update status"
                          );

                        alert(`Order updated to ${newStatus}`);
                        window.location.reload(); // Refresh UI
                      } catch (err) {
                        console.error(err);
                        alert(err.message || "Failed to update order");
                      }
                    }}
                  >
                    <option value="to receive">To Receive</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <label className="form-label mt-4">Payment Status</label>
                  <select
                    className="form-select mb-4"
                    value={editData.paymentStatus || "pending"}
                    onChange={async (e) => {
                      const newPaymentStatus = e.target.value;
                      setEditData({
                        ...editData,
                        paymentStatus: newPaymentStatus,
                      });

                      try {
                        const token = sessionStorage.getItem("sg_admin_token");
                        const res = await fetch(
                          `${process.env.REACT_APP_API_URL_ADMIN}/orders/${editData._id}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              paymentStatus: newPaymentStatus,
                            }),
                          }
                        );

                        const result = await res.json();
                        if (!res.ok)
                          throw new Error(
                            result.message || "Failed to update payment status"
                          );

                        alert(`Payment status updated to ${newPaymentStatus}`);
                        window.location.reload();
                      } catch (err) {
                        console.error(err);
                        alert(err.message || "Failed to update payment status");
                      }
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>

                  <button
                    className="btn primary w-full"
                    onClick={() => {
                      setOrders((prev) =>
                        prev.map((o) => (o._id === editData._id ? editData : o))
                      );
                      setEditData(null);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {deleteItem && (
            <div className="modal-overlay">
              <div className="modal-box max-w-md text-center">
                <h2 className="text-lg font-semibold mb-3">Confirm Delete</h2>
                <p>
                  Are you sure you want to delete order{" "}
                  <strong>{deleteItem._id}</strong>?
                </p>
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    className="btn border"
                    onClick={() => setDeleteItem(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => confirmDelete(deleteItem._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderManagement;
