import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../../css/adminsidebar.css";
import { useNavigate } from "react-router-dom";
import { addBeneficiary } from "../../services/api";
import caritasLogo from "../../assets/caritas_icon.jpg";
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

const BeneficiaryForm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    age: "",
    gender: "",
    contactNumber: "",
    email: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    emergencyName: "",
    emergencyNumber: "",
    relationship: "",
    status: "",
    registrationDate: "",
    notes: "",
  });

  // Set today's date for Registration Date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, registrationDate: today }));
  }, []);

  // Auto-calc Age when DOB changes
  useEffect(() => {
    if (formData.dob) {
      const dob = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }
      setFormData((prev) => ({ ...prev, age }));
    }
  }, [formData.dob]);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        status: formData.status || "active",
      };
      await addBeneficiary(payload);
      alert("Beneficiary added successfully!");
      navigate("/beneficiary");
    } catch (err) {
      console.error("Failed to add beneficiary:", err);
      alert(err.message || "Failed to add beneficiary");
    }
  };

  return (
    <div className="admin-activity">
      {/* Mobile menu toggle */}
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
        <main className="admin-settings-content">
          <div className="content p-6">
            <div className="page-title text-center mb-6">
              <h1 className="text-2xl font-bold">Add New Beneficiary</h1>
            </div>

            <div className="form-container max-w-5xl mx-auto">
              <div className="form-panel bg-white border border-gray-200 rounded-xl p-6">
                <div className="form-title text-lg font-semibold mb-4">
                  Beneficiary Information
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        required
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        required
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Age */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        readOnly
                        className="form-input border rounded-lg px-3 py-2 bg-gray-100"
                      />
                    </div>

                    {/* Gender */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="form-select border rounded-lg px-3 py-2"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Contact Number */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="Enter contact number"
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Email */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Address */}
                    <div className="form-group flex flex-col col-span-2">
                      <label className="form-label font-medium">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter complete address"
                        required
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* City */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        City/Municipality{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city or municipality"
                        required
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Province */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        placeholder="Enter province"
                        required
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="Enter postal code"
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyName"
                        value={formData.emergencyName}
                        onChange={handleChange}
                        placeholder="Enter emergency contact name"
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Emergency Contact Number
                      </label>
                      <input
                        type="tel"
                        name="emergencyNumber"
                        value={formData.emergencyNumber}
                        onChange={handleChange}
                        placeholder="Enter emergency contact number"
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Relationship to Emergency Contact
                      </label>
                      <input
                        type="text"
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleChange}
                        placeholder="e.g., Parent, Sibling, Friend"
                        className="form-input border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Status */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="form-select border rounded-lg px-3 py-2"
                      >
                        <option value="">Select status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>

                    {/* Registration Date */}
                    <div className="form-group flex flex-col">
                      <label className="form-label font-medium">
                        Registration Date
                      </label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={formData.registrationDate}
                        readOnly
                        className="form-input border rounded-lg px-3 py-2 bg-gray-100"
                      />
                    </div>

                    {/* Notes */}
                    <div className="form-group flex flex-col col-span-2">
                      <label className="form-label font-medium">
                        Additional Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Enter any additional information or notes"
                        className="form-textarea border rounded-lg px-3 py-2"
                      ></textarea>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="form-actions flex gap-4 justify-center mt-6 pt-4 border-t">
                    <button
                      type="button"
                      className="btn border px-6 py-2 rounded-lg"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn primary bg-red-600 text-white px-6 py-2 rounded-lg"
                    >
                      Add Beneficiary
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

export default BeneficiaryForm;
