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
import caritasLogo from "../../assets/caritas_icon.jpg";
import "../../css/styles.css";
import "../../css/adminsidebar.css";

const ActivityLog = () => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("activity");
    fetch(`${process.env.REACT_APP_API_URL_ADMIN}/activity`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("sg_admin_token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error("Failed to load logs", err));
  }, []);

  const exportToCSV = () => {
    if (!rows || rows.length === 0) {
      alert("No activity logs to export.");
      return;
    }

    // CSV headers
    const headers = ["Date", "Time", "User", "Activity Type", "Changes"];

    // Helper to safely format any value
    const safe = (val) => {
      if (val == null) return "";
      if (typeof val === "object")
        return JSON.stringify(val).replace(/"/g, "'");
      return String(val).replace(/"/g, '""');
    };

    // Map rows to CSV format
    const csvRows = rows.map((row) => {
      const bodyDetails = row.details?.body
        ? Object.entries(row.details.body)
            .map(([key, value]) => `${key}: ${safe(value)}`)
            .join("; ")
        : "";

      const paramDetails = row.details?.params
        ? Object.entries(row.details.params)
            .map(([key, value]) => `${key}: ${safe(value)}`)
            .join("; ")
        : "";

      const changes = [bodyDetails, paramDetails].filter(Boolean).join(" | ");

      return [
        `"${safe(row.formattedDate)}"`,
        `"${safe(row.formattedTime)}"`,
        `"${safe(row.adminName)}"`,
        `"${safe(row.action)}"`,
        `"${safe(changes)}"`,
      ].join(",");
    });

    // Join everything
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "activity_log.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="admin-activity">
      {/* Mobile Menu Toggle */}
      <button
        className="admin-settings-mobile-menu-toggle"
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
        className={`admin-settings-sidebar-overlay ${
          sidebarOpen ? "open" : ""
        }`}
        onClick={toggleSidebar}
      ></div>

      <div className="admin-settings-layout">
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

        {/* Main content */}
        <main className="admin-settings-content">
          <div className="admin-settings-page-title">
            <h1>Activity Log</h1>
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
              <input placeholder="Search" />
            </div>
            {/*<button className="btn">Filter</button>*/}
            <button className="btn" onClick={exportToCSV}>
              Export
            </button>{" "}
          </div>

          <div className="table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "36px" }}></th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>User</th>
                  <th>Activity Type</th>
                  <th>Changes</th>
                  <th style={{ width: "80px" }}></th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{row.formattedDate}</td>
                    <td>{row.formattedTime}</td>
                    <td>{row.adminName}</td>
                    <td>{row.action}</td>
                    <td>
                      <div
                        style={{
                          maxWidth: "250px", // adjust as needed
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={
                          row.details
                            ? `${
                                row.details.body
                                  ? JSON.stringify(row.details.body)
                                  : ""
                              } ${
                                row.details.params
                                  ? JSON.stringify(row.details.params)
                                  : ""
                              }`
                            : ""
                        }
                      >
                        {row.details ? (
                          <>
                            {row.details.body &&
                              Object.keys(row.details.body).length > 0 && (
                                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                                  {Object.entries(row.details.body).map(
                                    ([key, value]) => (
                                      <li key={key}>
                                        <strong>{key}:</strong>{" "}
                                        {value != null ? value.toString() : ""}
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            {row.details.params &&
                              Object.keys(row.details.params).length > 0 && (
                                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                                  {Object.entries(row.details.params).map(
                                    ([key, value]) => (
                                      <li key={key}>
                                        <strong>{key}:</strong>{" "}
                                        {value != null ? value.toString() : ""}
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                          </>
                        ) : (
                          <span>No details</span>
                        )}
                      </div>
                    </td>

                    {/*<td>
                      <span className="link">View</span>
                    </td>*/}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    className={`page-btn ${
                      num === currentPage ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActivityLog;
