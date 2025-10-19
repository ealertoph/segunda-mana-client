import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Box,
  ClipboardList,
  User,
  Megaphone,
  Activity,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Users,
  FilePen,
} from "lucide-react";
import "../../css/styles.css";
import "../../css/adminsidebar.css";
import caritasLogo from "../../assets/caritas_icon.jpg";
import { announcementService } from "../../services/announcementService";

const Announcement = () => {
  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState(
    "<p>Enter the text for your Message..</p>"
  );
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  const editorRef = useRef(null);

  // Exec formatting (bold, italic, underline, heading)
  const execCommand = (cmd, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, value);
    }
  };

  // Insert variable like {{name}}
  const insertVariable = () => {
    const name = prompt("Variable name (e.g., firstName)");
    if (!name) return;
    execCommand("insertHTML", `{{${name}}}`);
  };

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Set initial editor content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = message;
    }
  }, []);

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);

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

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await announcementService.getAllAnnouncements();

      if (result.success) {
        setAnnouncements(result.data.announcements);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch announcements");
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !label.trim() || !message.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("label", label.trim());
      formData.append("body", editorRef.current.innerHTML);

      if (mediaType) {
        formData.append("media", mediaType); // single file
      }

      const result = await announcementService.addAnnouncement(formData);

      if (result.success) {
        setSuccess("Announcement published successfully!");
        setTitle("");
        setLabel("");
        setMessage("<p>Enter the text for your Message..</p>");
        setMediaType(null);
        if (editorRef.current)
          editorRef.current.innerHTML =
            "<p>Enter the text for your Message..</p>";
        fetchAnnouncements();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to publish announcement");
      console.error("Error publishing announcement:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setAnnouncementToDelete(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;

    try {
      setError(null);
      const result = await announcementService.deleteAnnouncement(
        announcementToDelete._id
      );

      if (result.success) {
        setSuccess("Announcement deleted successfully!");
        fetchAnnouncements();
        closeDeleteModal();
      } else {
        setError(result.error);
        closeDeleteModal();
      }
    } catch (err) {
      setError("Failed to delete announcement");
      console.error("Error deleting announcement:", err);
      closeDeleteModal();
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      const result = await announcementService.toggleAnnouncementStatus(
        id,
        !currentStatus
      );

      if (result.success) {
        setSuccess(
          `Announcement ${
            !currentStatus ? "enabled" : "disabled"
          } successfully!`
        );
        fetchAnnouncements();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to update announcement status");
      console.error("Error updating announcement status:", err);
    }
  };

  // Filter announcements based on search
  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(search.toLowerCase()) ||
      announcement.label.toLowerCase().includes(search.toLowerCase()) ||
      announcement.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
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

      {/* Content */}
      <div className="admin-content">
        <div className="admin-page-header">
          <div className="admin-header-content">
            <h1 className="admin-h1">Segunda Mana</h1>
          </div>
        </div>

        <div className="admin-dashboard-content">
          <div className="admin-main-content">
            {/* Two Column Layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* LEFT COLUMN - Announcement Form */}
              <div className="admin-panel">
                <div className="admin-title">
                  <h3>Announcement</h3>
                </div>

                <div style={{ padding: "0", marginTop: "10px" }}>
                  {/* Title Field */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                      placeholder="Enter announcement title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Media Content Field */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Media Content
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setMediaType(e.target.files[0]); // store File object
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                    />
                    {mediaType && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "4px",
                        }}
                      >
                        Selected file: {mediaType.name}
                      </p>
                    )}
                  </div>

                  {/* Label Field */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Label
                    </label>
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                      placeholder="Enter label"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                    />
                  </div>

                  {/* Message Editor */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Message
                    </label>

                    {/* Rich Text Toolbar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        border: "1px solid #d1d5db",
                        borderBottom: "none",
                        borderRadius: "6px 6px 0 0",
                        backgroundColor: "#f9fafb",
                        padding: "8px 12px",
                      }}
                    >
                      <select
                        style={{
                          fontSize: "14px",
                          border: "none",
                          backgroundColor: "transparent",
                        }}
                      >
                        <option>Normal</option>
                      </select>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginLeft: "16px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => execCommand("bold")}
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand("italic")}
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            fontStyle: "italic",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand("underline")}
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            textDecoration: "underline",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                        >
                          U
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand("formatBlock", "H1")}
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand("formatBlock", "H2")}
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            execCommand("formatBlock", "BLOCKQUOTE")
                          }
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                        >
                          S
                        </button>
                        <button
                          type="button"
                          onClick={insertVariable}
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                        >
                          + Add Variable
                        </button>
                      </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      style={{
                        border: "1px solid #d1d5db",
                        borderTop: "none",
                        borderRadius: "0 0 6px 6px",
                        minHeight: "120px",
                        padding: "12px",
                        fontSize: "14px",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-wrap",
                        overflow: "auto",
                        direction: "ltr",
                        textAlign: "left",
                        color:
                          message === "<p>Enter the text for your Message..</p>"
                            ? "#9ca3af"
                            : "#000",
                      }}
                      onInput={(e) => setMessage(e.currentTarget.innerHTML)}
                      onFocus={(e) => {
                        if (
                          e.currentTarget.innerHTML ===
                          "<p>Enter the text for your Message..</p>"
                        ) {
                          e.currentTarget.innerHTML = "";
                          setMessage("");
                        }
                      }}
                      onBlur={(e) => {
                        if (
                          e.currentTarget.innerHTML.trim() === "" ||
                          e.currentTarget.innerHTML === "<br>"
                        ) {
                          e.currentTarget.innerHTML =
                            "<p>Enter the text for your Message..</p>";
                          setMessage(
                            "<p>Enter the text for your Message..</p>"
                          );
                        }
                      }}
                    ></div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "12px",
                      paddingTop: "16px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      style={{
                        padding: "10px 20px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        backgroundColor: "white",
                        color: "#374151",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={submitting}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        opacity: submitting ? 0.5 : 1,
                      }}
                    >
                      {submitting ? "Publishing..." : "Publish Post"}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Past Announcements */}
              <div className="admin-panel">
                <div className="admin-title">
                  <h3>Past Announcements</h3>
                </div>

                <div style={{ padding: "0", marginTop: "10px" }}>
                  {/* Search Bar */}
                  <div style={{ position: "relative", marginBottom: "16px" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "12px",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg
                        style={{
                          width: "16px",
                          height: "16px",
                          color: "#9ca3af",
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        paddingLeft: "40px",
                        paddingRight: "12px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* Announcements List */}
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                      <div style={{ color: "#6b7280", fontSize: "14px" }}>
                        Loading announcements...
                      </div>
                    </div>
                  ) : filteredAnnouncements.length > 0 ? (
                    <div style={{ maxHeight: "384px", overflowY: "auto" }}>
                      {filteredAnnouncements.map((announcement) => (
                        <div
                          key={announcement._id}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            padding: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Badges */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginBottom: "8px",
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "2px 8px",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: announcement.active
                                      ? "#dcfce7"
                                      : "#f3f4f6",
                                    color: announcement.active
                                      ? "#166534"
                                      : "#374151",
                                  }}
                                >
                                  {announcement.label}
                                </span>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "2px 8px",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: announcement.active
                                      ? "#dbeafe"
                                      : "#fee2e2",
                                    color: announcement.active
                                      ? "#1e40af"
                                      : "#dc2626",
                                  }}
                                >
                                  {announcement.active ? "Active" : "Inactive"}
                                </span>
                              </div>

                              {/* Title */}
                              <h4
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "#111827",
                                  marginBottom: "4px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {announcement.title}
                              </h4>

                              {/* Body Preview */}
                              <p
                                style={{
                                  fontSize: "14px",
                                  color: "#6b7280",
                                  marginBottom: "8px",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html:
                                    announcement.body
                                      .replace(/<[^>]*>/g, "")
                                      .substring(0, 100) + "...",
                                }}
                              ></p>

                              {/* Date */}
                              <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                                {new Date(
                                  announcement.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                marginLeft: "12px",
                              }}
                            >
                              <button
                                onClick={() =>
                                  handleToggleStatus(
                                    announcement._id,
                                    announcement.active
                                  )
                                }
                                style={{
                                  padding: "8px",
                                  color: "#9ca3af",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  borderRadius: "6px",
                                }}
                                title={
                                  announcement.active ? "Disable" : "Enable"
                                }
                              >
                                {announcement.active ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => openDeleteModal(announcement)}
                                style={{
                                  padding: "8px",
                                  color: "#9ca3af",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  borderRadius: "6px",
                                }}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                      <div style={{ color: "#6b7280", fontSize: "14px" }}>
                        {search
                          ? "No announcements found matching your search."
                          : "No announcements yet."}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          {/* Success Icon */}
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

          {/* Message */}
          <span
            style={{
              fontSize: "15px",
              fontWeight: "600",
              flex: 1,
            }}
          >
            {success}
          </span>

          {/* Close Button */}
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
            aria-label="Close success notification"
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
          {/* Error Icon */}
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

          {/* Message */}
          <span
            style={{
              fontSize: "15px",
              fontWeight: "600",
              flex: 1,
            }}
          >
            {error}
          </span>

          {/* Close Button */}
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
            aria-label="Close error notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && announcementToDelete && (
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
              Delete Announcement?
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
              Are you sure you want to delete this announcement?
            </p>

            {/* Announcement Title Preview */}
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
                "{announcementToDelete.title}"
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
                {announcementToDelete.label}
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

      {/* Alert & Modal Animation Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
      `}</style>
    </div>
  );
};

export default Announcement;
