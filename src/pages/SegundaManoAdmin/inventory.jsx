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
  Boxes,
  FilePen,
  Users,
} from "lucide-react";
import "../../css/styles.css";
import "../../css/adminsidebar.css";
import ActionButtons from "./action-buttons";
import ViewModal from "./view-modal";
import caritasLogo from "../../assets/caritas_icon.jpg";


const Inventory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [toggleItem, setToggleItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");

  const itemsPerPage = 10;

  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("sg_admin_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchInventory = async () => {
      try {
        const token = sessionStorage.getItem("sg_admin_token");
        const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/inventory`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) throw new Error("Failed to fetch inventory");
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load inventory. Check console for details.");
      }
    };

    fetchInventory();
  }, []);

  const filtered = inventory.filter((inv) => {
    const q = search.trim().toLowerCase();

    if (q) {
      const match =
        inv.itemName.toLowerCase().includes(q) ||
        inv.category.toLowerCase().includes(q) ||
        inv.arRef.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterStatus === "active" && inv.isArchived) return false;
    if (filterStatus === "archived" && !inv.isArchived) return false;

    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedRows = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportCSV = () => {
    if (filtered.length === 0) {
      alert("No inventory data to export.");
      return;
    }

    const headers = [
      "ID",
      "AR Ref No.",
      "Item Name",
      "Category",
      "Size",
      "Price",
      // "Quantity",
      "Description",
    ];

    const csvRows = [
      headers.join(","),
      ...filtered.map((inv) =>
        [
          inv._id,
          inv.arRef,
          `"${inv.itemName}"`,
          inv.category,
          inv.size,
          inv.price,
          // inv.quantity,
          `"${inv.description}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `inventory_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (item) => setViewData(item);
  const handleEdit = (item) => setEditData(item);
  const handleToggle = (item) => setToggleItem(item);

  const confirmToggleArchive = async (id, isArchived) => {
    try {
      const token = sessionStorage.getItem("sg_admin_token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL_ADMIN}/inventory/${id}/archive?restore=${
          isArchived ? "true" : "false"
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to update Inventory");

      // Update UI
      setInventory((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isArchived: !isArchived } : p))
      );

      setToggleItem(null);
      alert(isArchived ? "Inventory restored!" : "Inventory archived!");
      setFilterStatus("active"); 
    } catch (err) {
      console.error("Error archiving/restoring product:", err);
      alert("Failed to update Inventory.");
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
            <h1 className="admin-h1 mb-6">Inventory Management</h1>
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
                placeholder="Search by AR Ref, name, or category"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="btn"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>{" "}
            <button className="btn" onClick={exportCSV}>
              Export CSV
            </button>
            <NavLink to="/add-inventory" className="btn btn-add">
              + Add Item
            </NavLink>
          </div>

          <div className="table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "36px" }}></th>
                  <th>No</th>
                  <th>AR Ref No.</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Price</th>
                  {/* <th>Quantity</th> */}
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((inv) => (
                  <tr key={inv._id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{inv._id}</td>
                    <td>{inv.arRef}</td>
                    <td>{inv.itemName}</td>
                    <td>{inv.category}</td>
                    <td>{inv.size}</td>
                    <td>₱{inv.price}</td>
                    <td>{inv.quantity}</td>
                    <td>{inv.description}</td>
                    <td>
                      <ActionButtons
                        onView={() => handleView(inv)}
                        onEdit={() => handleEdit(inv)}
                        onDelete={() => handleToggle(inv)}
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
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`page-btn ${num === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              ›
            </button>
          </div>

          <ViewModal data={viewData} onClose={() => setViewData(null)} />

          {/* Edit Modal */}
          {editData && (
            <div className="modal-overlay">
              <div className="modal-box max-w-md">
                <div className="modal-header">
                  <h2>Edit Product</h2>
                  <button
                    className="modal-close"
                    onClick={() => setEditData(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-content">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-input mb-3"
                    value={editData.itemName}
                    onChange={(e) =>
                      setEditData({ ...editData, itemName: e.target.value })
                    }
                  />

                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input mb-3"
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                  />

                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    className="form-input mb-3"
                    value={editData.price}
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                  />

                  <button
                    className="btn primary w-full"
                    onClick={async () => {
                      try {
                        const token = sessionStorage.getItem("sg_admin_token");

                        const res = await fetch(
                          `${process.env.REACT_APP_API_URL_ADMIN}/inventory/${editData._id}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(editData),
                          }
                        );

                        if (!res.ok)
                          throw new Error("Failed to update product");
                        const updatedProduct = await res.json();

                        setInventory((prev) =>
                          prev.map((p) =>
                            p._id === updatedProduct._id ? updatedProduct : p
                          )
                        );

                        setEditData(null);
                      } catch (err) {
                        console.error("Error updating product:", err);
                        alert("Failed to update product.");
                      }
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {toggleItem && (
            <div className="modal-overlay">
              <div className="modal-box max-w-md text-center">
                <h2 className="text-lg font-semibold mb-3">
                  Confirm {toggleItem.isArchived ? "Restore" : "Archive"}
                </h2>
                <p>
                  Are you sure you want to{" "}
                  <strong>
                    {toggleItem.isArchived ? "restore" : "archive"}
                  </strong>{" "}
                  (AR Ref: {toggleItem.arRef})?
                </p>
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    className="btn border"
                    onClick={() => setToggleItem(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn danger"
                    onClick={() =>
                      confirmToggleArchive(
                        toggleItem._id,
                        toggleItem.isArchived
                      )
                    }
                  >
                    {toggleItem.isArchived ? "Restore" : "Archive"}
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

export default Inventory;
