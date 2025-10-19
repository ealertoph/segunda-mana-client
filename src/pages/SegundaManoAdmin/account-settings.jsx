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
  Users,
  FilePen,
} from "lucide-react";
import caritasLogo from "../../assets/caritas_icon.jpg";
import "../../css/styles.css";
import "../../css/adminsidebar.css";

const AccountSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [adminInfo, setAdminInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    bio: "",
    language: "English",
    timezone: "UTC-5 (Eastern Time)",
    notifications: "All notifications",
  });
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("sg_admin_token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, []);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      const token = sessionStorage.getItem("sg_admin_token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5000/api/admin/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch admin info");
        const data = await res.json();

        setAdminInfo({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "Administrator",
          bio: data.bio || "",
          language: data.language || "English",
          timezone: data.timezone || "UTC-5 (Eastern Time)",
          notifications: data.notifications || "All notifications",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchAdminInfo();
  }, []);

  const handleSaveChanges = async () => {
    const token = sessionStorage.getItem("sg_admin_token");

    const payload = { ...adminInfo };
    if (
      !adminInfo.currentPassword &&
      !adminInfo.newPassword &&
      !adminInfo.confirmPassword
    ) {
      delete payload.currentPassword;
      delete payload.newPassword;
      delete payload.confirmPassword;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update account");
      alert("Account updated successfully!");

      setAdminInfo((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to update account. Check console for details.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sg_admin_token"); // or localStorage
    sessionStorage.removeItem("sg_admin_role");
    navigate("/login");
  };
  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="admin-mobile-menu-toggle"
        style={{
          display: window.innerWidth <= 768 && !sidebarOpen ? "block" : "none",
        }}
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
        className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
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

        {/* Main Content */}
        <main className="admin-settings-content">
          <div className="admin-settings-page-title">
            <h1>Account Settings</h1>
          </div>

          <div className="admin-settings-settings-content">
            <div className="admin-settings-main-settings">
              {/* Profile Information */}
              <div className="admin-settings-settings-card">
                <div className="admin-settings-card-title">
                  Profile Information
                </div>

                <div className="admin-settings-avatar-section">
                  <div className="admin-settings-avatar">A</div>
                  <div className="admin-settings-avatar-upload">
                    {/*<button className="admin-settings-upload-btn">
                      Change Photo
                    </button>
                    <div className="admin-settings-small">
                      JPG, PNG or GIF. Max size 2MB.
                    </div>*/}
                  </div>
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">Full Name</label>
                  <input
                    type="text"
                    className="admin-settings-form-input"
                    value={adminInfo.fullName}
                    onChange={(e) =>
                      setAdminInfo({ ...adminInfo, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="admin-settings-form-input"
                    value={adminInfo.email}
                    onChange={(e) =>
                      setAdminInfo({ ...adminInfo, email: e.target.value })
                    }
                  />
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="admin-settings-form-input"
                    value={adminInfo.phone}
                    onChange={(e) =>
                      setAdminInfo({ ...adminInfo, phone: e.target.value })
                    }
                  />
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">Role</label>
                  <input
                    type="text"
                    className="admin-settings-form-input"
                    value={adminInfo.role}
                    readOnly
                    style={{
                      backgroundColor: "#f9fafb",
                      color: "#6b7280",
                      cursor: "not-allowed",
                    }}
                  />
                </div>


                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">Bio</label>

                  <textarea
                    className="admin-settings-form-textarea"
                    value={adminInfo.bio}
                    onChange={(e) =>
                      setAdminInfo({ ...adminInfo, bio: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Security Settings */}
              <div className="admin-settings-settings-card">
                <div className="admin-settings-card-title">
                  Security Settings
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="admin-settings-form-input"
                    placeholder="Enter current password"
                    value={adminInfo.currentPassword}
                    onChange={(e) =>
                      setAdminInfo({
                        ...adminInfo,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="admin-settings-form-input"
                    placeholder="Enter new password"
                    value={adminInfo.newPassword}
                    onChange={(e) =>
                      setAdminInfo({
                        ...adminInfo,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="admin-settings-form-input"
                    placeholder="Confirm new password"
                    value={adminInfo.confirmPassword}
                    onChange={(e) =>
                      setAdminInfo({
                        ...adminInfo,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-settings-form-group">
                  {/* <label className="admin-settings-form-label">
                    Two-Factor Authentication
                  </label>
                  <select
                    className="admin-settings-form-select"
                    defaultValue="Enabled"
                  >
                    <option>Enabled</option>
                    <option>Disabled</option>
                  </select> */}
                </div>
              </div>

              {/* Preferences */}
              {/* <div className="admin-settings-settings-card">
                <div className="admin-settings-card-title">Preferences</div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">Language</label>
                  <select
                    className="admin-settings-form-select"
                    defaultValue="English"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">Time Zone</label>
                  <select
                    className="admin-settings-form-select"
                    defaultValue="UTC-5 (Eastern Time)"
                  >
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC+0 (GMT)</option>
                  </select>
                </div>

                <div className="admin-settings-form-group">
                  <label className="admin-settings-form-label">
                    Email Notifications
                  </label>
                  <select
                    className="admin-settings-form-select"
                    defaultValue="All notifications"
                  >
                    <option>All notifications</option>
                    <option>Important only</option>
                    <option>None</option>
                  </select>
                </div>
              </div> */}

              {/* Actions */}
              <div className="admin-settings-actions">
                <button className="admin-settings-btn admin-settings-btn-secondary">
                  Cancel
                </button>
                <button
                  className="admin-settings-btn admin-settings-btn-primary"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Aside Panels */}
            <aside className="admin-settings-aside">
              <div className="admin-settings-panel">
                <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                  Account Status
                </div>
                <div className="admin-settings-list">
                  <div className="admin-settings-item">
                    <span
                      className="admin-settings-dot"
                      style={{ background: "#10b981" }}
                    ></span>
                    <div>
                      <div>Account Active</div>
                      <div className="admin-settings-small">Verified</div>
                    </div>
                  </div>
                  <div className="admin-settings-item">
                    <span
                      className="admin-settings-dot"
                      style={{ background: "#3b82f6" }}
                    ></span>
                    <div>
                      <div>Last Login</div>
                      <div className="admin-settings-small">2 hours ago</div>
                    </div>
                  </div>
                  <div className="admin-settings-item">
                    <span
                      className="admin-settings-dot"
                      style={{ background: "#f59e0b" }}
                    ></span>
                    <div>
                      <div>Security Level</div>
                      <div className="admin-settings-small">High</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-settings-panel">
                <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                  Quick Actions
                </div>
                <div className="admin-settings-list">
                  <div className="admin-settings-item">
                    <span className="admin-settings-dot"></span>
                    <div>
                      <div>Export Data</div>
                      <div className="admin-settings-small">
                        Download your data
                      </div>
                    </div>
                  </div>
                  <div className="admin-settings-item">
                    <span className="admin-settings-dot"></span>
                    <div>
                      <div>Delete Account</div>
                      <div className="admin-settings-small">
                        Permanent action
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="admin-settings-logout"
                style={{ marginTop: "16px" }}
              >
                <button className="btn danger w-full" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default AccountSettings;
