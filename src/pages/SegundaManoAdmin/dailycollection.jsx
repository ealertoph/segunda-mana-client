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
  Plus,
  Trash2,
  Download,
  Boxes,
  Users,
  FilePen,
} from "lucide-react";
import "../../css/forms.css";
import "../../css/adminsidebar.css";
import "../../css/styles.css";
import caritasLogo from "../../assets/caritas_icon.jpg";

const DataCollection = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branch, setBranch] = useState("");
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([
    {
      id: 1,
      arRef: "",
      item: "",
      qty: "",
      amount: "",
      total: 0,
      cash: "",
      gcash: "",
      discount: "",
      reason: "",
      approver: "",
    },
  ]);
  const [preparedBy, setPreparedBy] = useState("");
  const [notedBy, setNotedBy] = useState("");
  const [validatedBy, setValidatedBy] = useState("");
  const [pastBranch, setPastBranch] = useState("");
  const [pastDate, setPastDate] = useState("");
  const [branches, setBranches] = useState([]);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch available branches for dropdown
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL_ADMIN}/daily-collection`)
      .then((res) => res.json())
      .then((data) => setBranches(data.branches || []))
      .catch((err) => console.error(err));
  }, []);

  // Handle input updates and auto-calculation
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === "qty" || field === "amount") {
      const qty = parseFloat(updated[index].qty) || 0;
      const amt = parseFloat(updated[index].amount) || 0;
      updated[index].total = qty * amt;
    }

    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        arRef: "",
        item: "",
        qty: "",
        amount: "",
        total: 0,
        cash: "",
        gcash: "",
        discount: "",
        reason: "",
        approver: "",
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const grandTotal = rows.reduce(
    (sum, row) => sum + (parseFloat(row.total) || 0),
    0
  );

  const saveToDB = async () => {
    const payload = {
      branch,
      date,
      rows,
      grandTotal,
      preparedBy,
      notedBy,
      validatedBy,
    };

    const res = await fetch(
      `${process.env.REACT_APP_API_URL_ADMIN}/daily-collection`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (res.ok) alert("Saved successfully!");
    else alert("Error saving: " + data.message);
  };

  const exportCSV = () => {
    const headers = [
      "AR Ref No.",
      "Item Description",
      "Qty",
      "Amount per Quantity",
      "Total",
      "Cash",
      "Gcash",
      "Discount",
      "Reason",
      "Approving Person",
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.arRef,
          r.item,
          r.qty,
          r.amount,
          r.total,
          r.cash,
          r.gcash,
          r.discount,
          r.reason,
          r.approver,
        ].join(",")
      ),
      `,,,,Grand Total,${grandTotal}`,
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_collection_${date || "report"}.csv`;
    a.click();
  };

  // Download past collection
  const downloadPastCollection = async () => {
    if (!pastBranch || !pastDate) {
      alert("Please select branch and date");
      return;
    }

    try {
      const query = new URLSearchParams({
        branch: pastBranch,
        date: pastDate,
      });

      const res = await fetch(
        `${process.env.REACT_APP_API_URL_ADMIN}/daily-collection?${query}`
      );
      const data = await res.json();
      const records = data.records || [];

      if (records.length === 0) {
        alert("No records found for this branch and date");
        return;
      }

      const csvHeaders = [
        "Branch",
        "Date",
        "AR Ref",
        "Item",
        "Qty",
        "Amount",
        "Total",
        "Cash",
        "Gcash",
        "Discount",
        "Reason",
        "Approver",
        "PreparedBy",
        "NotedBy",
        "ValidatedBy",
      ];

      const csvRows = [
        csvHeaders.join(","),
        ...records.flatMap((record) =>
          record.rows.map((r) =>
            [
              record.branch,
              record.date,
              r.arRef,
              r.item,
              r.qty,
              r.amount,
              r.total,
              r.cash,
              r.gcash,
              r.discount,
              r.reason,
              r.approver,
              record.preparedBy,
              record.notedBy,
              record.validatedBy,
            ].join(",")
          )
        ),
      ];

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily_collection_${pastBranch}_${pastDate}.csv`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Failed to download past collection");
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
            <h1 class="admin-h1 mb-6">Daily Collection</h1>
          </div>

          <div className="form-container">
            <div className="form-panel">
              <div className="grid col-span-2">
                <div>
                  <label className="form-label">Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="form-panel">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>AR Ref No.</th>
                      <th>Item Description</th>
                      <th>Qty</th>
                      <th>Amount per Quantity</th>
                      <th>Total</th>
                      <th>Cash</th>
                      <th>Gcash</th>
                      <th>Discount</th>
                      <th>Reason</th>
                      <th>Approving Person</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            className="form-input"
                            value={row.arRef}
                            onChange={(e) =>
                              handleChange(i, "arRef", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            value={row.item}
                            onChange={(e) =>
                              handleChange(i, "item", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            value={row.qty}
                            onChange={(e) =>
                              handleChange(i, "qty", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            value={row.amount}
                            onChange={(e) =>
                              handleChange(i, "amount", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-input bg-gray-100"
                            readOnly
                            value={row.total.toFixed(2)}
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            value={row.cash}
                            onChange={(e) =>
                              handleChange(i, "cash", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            value={row.gcash}
                            onChange={(e) =>
                              handleChange(i, "gcash", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            value={row.discount}
                            onChange={(e) =>
                              handleChange(i, "discount", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            value={row.reason}
                            onChange={(e) =>
                              handleChange(i, "reason", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            value={row.approver}
                            onChange={(e) =>
                              handleChange(i, "approver", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <button
                            className="action-btn delete"
                            onClick={() => removeRow(i)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-actions mt-4">
                <button className="btn border" onClick={addRow}>
                  <Plus size={16} /> Add Row
                </button>
                <button className="btn primary" onClick={exportCSV}>
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            <div className="form-panel">
              <h3 className="form-title">
                Grand Total: ₱{grandTotal.toFixed(2)}
              </h3>
            </div>

            <div className="form-panel">
              <div>
                <label className="form-label">Prepared by</label>
                <input
                  className="form-input"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Noted by</label>
                <input
                  className="form-input"
                  value={notedBy}
                  onChange={(e) => setNotedBy(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Validated by</label>
                <input
                  className="form-input"
                  value={validatedBy}
                  onChange={(e) => setValidatedBy(e.target.value)}
                />
              </div>
              <button className="btn success" onClick={saveToDB}>
                Save
              </button>
            </div>
            <div className="form-panel mt-6">
              <h2>Download Past Collection</h2>
              <div className="grid col-span-2">
                <div>
                  <label className="form-label">Branch</label>
                  <select
                    className="form-input"
                    value={pastBranch}
                    onChange={(e) => setPastBranch(e.target.value)}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={pastDate}
                    onChange={(e) => setPastDate(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn primary mt-2"
                onClick={downloadPastCollection}
              >
                <Download size={16} /> Download Past Collection
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DataCollection;
