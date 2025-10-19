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
  Users,
  FilePen,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "../../css/adminsidebar.css";
import caritasLogo from "../../assets/caritas_icon.jpg";
import { staffService } from "../../services/staffService";

const StaffManagement = () => {
  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "view"
  const [currentStaff, setCurrentStaff] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    status: "active",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Auto-dismiss success message after 4 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle ESC key to close delete modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && deleteModalOpen) {
        closeDeleteModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [deleteModalOpen]);

  // Prevent body scroll when delete modal is open
  useEffect(() => {
    if (deleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deleteModalOpen]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffService.getAllStaff();

      if (result.success) {
        setStaffList(result.data.staff);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch staff");
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setModalMode("add");
    setCurrentStaff(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleView = (staff) => {
    setModalMode("view");
    setCurrentStaff(staff);
    setFormData({
      username: staff.username,
      email: staff.email,
      password: "",
      fullName: staff.fullName,
      status: staff.status,
    });
    setShowModal(true);
  };

  const handleEdit = (staff) => {
    setModalMode("edit");
    setCurrentStaff(staff);
    setFormData({
      username: staff.username,
      email: staff.email,
      password: "",
      fullName: staff.fullName,
      status: staff.status,
    });
    setShowModal(true);
  };

  const openDeleteModal = (staff) => {
    setStaffToDelete(staff);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setStaffToDelete(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;

    try {
      setError(null);
      const result = await staffService.deleteStaff(staffToDelete._id);

      if (result.success) {
        setSuccess("Staff account deleted successfully!");
        fetchStaff();
        closeDeleteModal();
      } else {
        setError(result.error);
        closeDeleteModal();
      }
    } catch (err) {
      setError("Failed to delete staff");
      console.error("Error deleting staff:", err);
      closeDeleteModal();
    }
  };

  const handleToggleStatus = async (staff) => {
    const newStatus = staff.status === "active" ? "inactive" : "active";

    try {
      setError(null);
      const result = await staffService.toggleStaffStatus(staff._id, newStatus);

      if (result.success) {
        setSuccess(
          `Staff ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully!`
        );
        fetchStaff();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to update staff status");
      console.error("Error updating staff status:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.email || !formData.fullName) {
      setError("Username, email, and full name are required");
      return;
    }

    if (modalMode === "add" && !formData.password) {
      setError("Password is required for new staff");
      return;
    }

    try {
      setError(null);
      let result;

      if (modalMode === "add") {
        result = await staffService.createStaff(formData);
      } else if (modalMode === "edit") {
        // Only include password if it was changed
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        result = await staffService.updateStaff(currentStaff._id, updateData);
      }

      if (result.success) {
        setSuccess(
          modalMode === "add"
            ? "Staff account created successfully!"
            : "Staff account updated successfully!"
        );
        setShowModal(false);
        fetchStaff();
        setFormData({
          username: "",
          email: "",
          password: "",
          fullName: "",
          status: "active",
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to save staff");
      console.error("Error saving staff:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStaff(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      status: "active",
    });
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.fullName.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase()) ||
      staff.username.toLowerCase().includes(search.toLowerCase())
  );

  // Get user role for conditional rendering
  const userRole = sessionStorage.getItem("sg_admin_role");

  return (
    <div className="admin-layout">
      {/* Sidebar */}
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
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
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
            <Box size={18} /> Inventory
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

          {/* Activity Log - Superadmin Only */}
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
      <div
        className={`admin-settings-sidebar-overlay ${
          sidebarOpen ? "open" : ""
        }`}
        onClick={toggleSidebar}
      />

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-h1">Staff Management</h1>
        </div>

        <main className="admin-main">
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "8px 12px",
                flex: "1",
                maxWidth: "384px",
                backgroundColor: "white",
              }}
            >
              <svg
                style={{
                  width: "16px",
                  height: "16px",
                  color: "#9ca3af",
                  marginRight: "8px",
                }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search for staff..."
                style={{
                  width: "100%",
                  outline: "none",
                  fontSize: "14px",
                  border: "none",
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              Filter
            </button>
            <button
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              Export
            </button>
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc2626",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleAddNew}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#b91c1c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#dc2626")
              }
            >
              + Add New
            </button>
          </div>

          {/* Loading/Error Messages */}
          {loading && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ color: "#6b7280" }}>Loading staff...</p>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div
              style={{
                overflowX: "auto",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <table
                style={{
                  minWidth: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>
                  <tr>
                    <th style={{ padding: "8px 16px", width: "56px" }}>No</th>
                    <th style={{ padding: "8px 16px" }}>Full Name</th>
                    <th style={{ padding: "8px 16px" }}>Email</th>
                    <th style={{ padding: "8px 16px" }}>Username</th>
                    <th style={{ padding: "8px 16px" }}>Date Created</th>
                    <th style={{ padding: "8px 16px" }}>Status</th>
                    <th style={{ padding: "8px 16px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff, index) => (
                      <tr
                        key={staff._id}
                        style={{ borderTop: "1px solid #e5e7eb" }}
                      >
                        <td style={{ padding: "8px 16px" }}>{index + 1}</td>
                        <td style={{ padding: "8px 16px" }}>
                          {staff.fullName}
                        </td>
                        <td style={{ padding: "8px 16px" }}>{staff.email}</td>
                        <td style={{ padding: "8px 16px" }}>
                          {staff.username}
                        </td>
                        <td style={{ padding: "8px 16px" }}>
                          {new Date(staff.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "8px 16px" }}>
                          <button
                            onClick={() => handleToggleStatus(staff)}
                            style={{
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                            }}
                          >
                            {staff.status === "active" ? (
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "9999px",
                                  backgroundColor: "#dcfce7",
                                  color: "#166534",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                Active
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "9999px",
                                  backgroundColor: "#f3f4f6",
                                  color: "#374151",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                Inactive
                              </span>
                            )}
                          </button>
                        </td>
                        <td style={{ padding: "8px 16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              style={{
                                padding: "8px",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                              }}
                              onClick={() => handleView(staff)}
                              title="View"
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#2563eb")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#3b82f6")
                              }
                            >
                              <FaEye />
                            </button>
                            <button
                              style={{
                                padding: "8px",
                                backgroundColor: "#22c55e",
                                color: "white",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                              }}
                              onClick={() => handleEdit(staff)}
                              title="Edit"
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#16a34a")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#22c55e")
                              }
                            >
                              <FaEdit />
                            </button>
                            <button
                              style={{
                                padding: "8px",
                                backgroundColor: "#ef4444",
                                color: "white",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                              }}
                              onClick={() => openDeleteModal(staff)}
                              title="Delete"
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#dc2626")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#ef4444")
                              }
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          padding: "32px 16px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        No staff found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit/View Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "448px",
              width: "100%",
              margin: "0 16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              {modalMode === "add"
                ? "Add New Staff"
                : modalMode === "edit"
                ? "Edit Staff"
                : "View Staff"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Full Name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={modalMode === "view"}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      backgroundColor:
                        modalMode === "view" ? "#f3f4f6" : "white",
                    }}
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Username <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={modalMode === "view"}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      backgroundColor:
                        modalMode === "view" ? "#f3f4f6" : "white",
                    }}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={modalMode === "view"}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      backgroundColor:
                        modalMode === "view" ? "#f3f4f6" : "white",
                    }}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Password{" "}
                    {modalMode === "add" && (
                      <span style={{ color: "#ef4444" }}>*</span>
                    )}
                    {modalMode === "edit" && (
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>
                        (leave blank to keep current)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={modalMode === "view"}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      backgroundColor:
                        modalMode === "view" ? "#f3f4f6" : "white",
                    }}
                    required={modalMode === "add"}
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={modalMode === "view"}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      backgroundColor:
                        modalMode === "view" ? "#f3f4f6" : "white",
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Role (Display Only) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Role
                  </label>
                  <input
                    type="text"
                    value="Staff"
                    disabled
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: "#f3f4f6",
                      color: "#6b7280",
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: "white",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  {modalMode === "view" ? "Close" : "Cancel"}
                </button>
                {modalMode !== "view" && (
                  <button
                    type="submit"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#b91c1c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#dc2626")
                    }
                  >
                    {modalMode === "add" ? "Create Staff" : "Update Staff"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast - Bottom Right */}
      {success && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            backgroundColor: "#10b981",
            color: "white",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)",
            minWidth: "320px",
            maxWidth: "420px",
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" />
            <path
              d="M8 12L11 15L16 9"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: "15px", fontWeight: "600", flex: 1 }}>
            {success}
          </span>
          <button
            onClick={() => setSuccess(null)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "22px",
              cursor: "pointer",
              padding: "4px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background-color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* Error Toast - Bottom Right */}
      {error && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            backgroundColor: "#ef4444",
            color: "white",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
            minWidth: "320px",
            maxWidth: "420px",
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" />
            <path
              d="M12 8V12M12 16H12.01"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: "15px", fontWeight: "600", flex: 1 }}>
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "22px",
              cursor: "pointer",
              padding: "4px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background-color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && staffToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={closeDeleteModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              animation: "modalFadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
              </svg>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#1f2937",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              Delete Staff Account?
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: "15px",
                color: "#6b7280",
                textAlign: "center",
                marginBottom: "8px",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to delete this staff account?
            </p>

            {/* Staff Info Preview */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px 16px",
                marginTop: "16px",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  margin: 0,
                  marginBottom: "6px",
                }}
              >
                {staffToDelete.fullName}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  margin: 0,
                  marginBottom: "4px",
                }}
              >
                {staffToDelete.email}
              </p>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                {staffToDelete.username}
              </span>
            </div>

            {/* Warning Message */}
            <p
              style={{
                fontSize: "13px",
                color: "#dc2626",
                textAlign: "center",
                marginBottom: "24px",
                fontWeight: "500",
              }}
            >
              This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={closeDeleteModal}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minWidth: "120px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minWidth: "120px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default StaffManagement;
