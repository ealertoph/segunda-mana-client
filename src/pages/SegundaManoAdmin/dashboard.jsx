import { Link, NavLink, useNavigate } from "react-router-dom";
import "../../css/styles.css";
import { useState, useEffect } from "react";
import "../../css/adminsidebar.css";
import { Line, Doughnut } from "react-chartjs-2";
import caritasLogo from "../../assets/caritas_icon.jpg";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
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
import { getAnalytics } from "../../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ✅ Plugin to draw only 62% in the center of donut
const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    if (chart.config.type !== "doughnut") return;

    const { width, height, ctx } = chart;
    ctx.save();

    const dataset = chart.config.data.datasets[0].data;
    const value = dataset[0]; // 62
    const text = `${value}%`;

    ctx.font = "bold 20px Inter, sans-serif";
    ctx.fillStyle = "#2563eb";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(text, width / 2, height / 2);
    ctx.restore();
  },
};

export default function Dashboard() {
  // Get user info from sessionStorage
  const userRole = sessionStorage.getItem("sg_admin_role") || "admin";
  const userInfo = JSON.parse(sessionStorage.getItem("sg_admin_user") || "{}");
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalInventory: 0,
    pendingOrders: 0,
    totalSold: 0,
    totalRunningSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const token = sessionStorage.getItem("sg_admin_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAnalytics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("sg_admin_token");

      // Fetch products
      const productRes = await fetch(
        `${process.env.REACT_APP_API_URL_ADMIN}/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const productsData = await productRes.json();
      setProducts(productsData);

      // Fetch inventory (or you can merge with products if same endpoint)
      const inventoryRes = await fetch(
        `${process.env.REACT_APP_API_URL_ADMIN}/inventory`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const inventoryData = await inventoryRes.json();
      setInventory(inventoryData);

      // Combine activities
      const productActivities = productsData.slice(-5).map((p) => ({
        id: p._id,
        text: `Product updated: ${p.name || p.itemName}`,
        time: TimeAgo(p.updatedAt || p.createdAt),
      }));

      const inventoryActivities = inventoryData.slice(-5).map((i) => ({
        id: i._id,
        text: `Inventory updated: ${i.productName || i.itemName}`,
        time: TimeAgo(i.updatedAt || i.createdAt),
      }));

      // Merge and sort by date descending
      const mergedActivities = [
        ...productActivities,
        ...inventoryActivities,
      ].sort((a, b) => new Date(b.timeRaw) - new Date(a.timeRaw));

      // Take latest 5
      setActivities(mergedActivities.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch products/inventory:", err);
    }
  };

  // Helper to convert timestamp to readable "time ago"
  const TimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };
  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem("sg_admin_token");
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);

      // Map latest 5 orders to notifications
      const newNotifications = data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((order) => ({
          id: order._id,
          text: `New order from ${order.buyerName}`,
          time: timeAgo(order.createdAt),
        }));
      setNotifications(newNotifications);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getAnalytics();
      if (response.success) {
        setAnalytics(response.data);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Display name based on role
  let userName;
  if (userRole === "superadmin") {
    userName = "Admin";
  } else if (userRole === "staff") {
    userName = "Staff";
  } else {
    userName = "Admin"; // Fallback
  }

  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1); // Capitalize first letter

  const salesByDay = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  orders.forEach((order) => {
    const day = new Date(order.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
    });
    salesByDay[day] += order.total;
  });

  // Line chart (Sales Analytics)
  const lineData = {
    labels: Object.keys(salesByDay), // ["Sunday", "Monday", ...]
    datasets: [
      {
        label: "Orders",
        data: Object.values(salesByDay), // [500, 300, ...]
        fill: true,
        borderColor: "#3b82f6",
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
          return gradient;
        },
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} Orders`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { ticks: { stepSize: 50 } },
    },
  };

  // Doughnut chart (Donation Analytics)
  const doughnutData = {
    labels: ["Donations", "Remaining"],
    datasets: [
      {
        data: [62, 38],
        backgroundColor: ["#3b82f6", "#e5e7eb"],
        cutout: "75%",
      },
    ],
  };

  const doughnutOptions = {
    plugins: { legend: { display: false } },
    cutout: "75%",
    maintainAspectRatio: false,
  };

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

      {/* Content */}
      <div className="admin-content">
        <div className="admin-page-header">
          <div className="admin-header-content">
            <h1 className="admin-h1">
              Welcome, {userRole === "superadmin" ? "Admin" : "Staff"}!
            </h1>{" "}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "#fee",
              color: "#ef4444",
              borderRadius: "8px",
              margin: "12px 0",
            }}
          >
            ⚠️ Failed to load analytics: {error}
            <br />
            <small>Make sure the backend server is running on port 5001</small>
          </div>
        )}

        <div className="admin-dashboard-content">
          <div className="admin-main-content">
            {/* KPI Cards */}
            <div className="admin-cards">
              <div className="admin-kpi-card">
                <div className="admin-kpi-icon">🛒</div>
                <div className="admin-kpi-main">
                  <div className="admin-kpi-value">
                    {loading ? "--" : analytics.totalOrders}
                  </div>
                  <div className="admin-kpi-label">Total Orders</div>
                  <div className="admin-kpi-growth">
                    {loading ? "Loading..." : "✓ System Connected"}
                  </div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon">📦</div>
                <div className="admin-kpi-main">
                  <div className="admin-kpi-value">
                    {loading ? "--" : analytics.totalInventory}
                  </div>
                  <div className="admin-kpi-label">Total Inventory</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon">⏳</div>
                <div className="admin-kpi-main">
                  <div className="admin-kpi-value">
                    {loading ? "--" : analytics.pendingOrders}
                  </div>
                  <div className="admin-kpi-label">Pending Orders</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon">✅</div>
                <div className="admin-kpi-main">
                  <div className="admin-kpi-value">
                    {loading ? "--" : analytics.totalSold}
                  </div>
                  <div className="admin-kpi-label">Items Sold</div>
                </div>
              </div>
            </div>

            {/* Sales Analytics */}
            <div className="admin-chart-wrap">
              <div className="admin-chart-header">
                <div>
                  <h2>Sales Analytics</h2>
                  <p>
                    Total Running Sales:{" "}
                    <strong>
                      ₱
                      {loading
                        ? "--"
                        : analytics.totalRunningSales.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                    </strong>
                  </p>
                </div>
                <button className="admin-chip">📊 Save Data</button>
              </div>
              <div className="admin-chart">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </div>

          {/* Right Aside */}
          <aside className="admin-aside">
            <div className="admin-panel">
              <div className="admin-title">
                <h3>Notifications</h3>
              </div>
              <div className="admin-list">
                {notifications.length === 0 && <div>No new notifications</div>}
                {notifications.map((n) => (
                  <div className="admin-item" key={n.id}>
                    <div className="admin-dot"></div>
                    <div>
                      <strong>{n.text}</strong>
                      <div className="admin-small">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-title">
                <h3>Activities</h3>
              </div>
              <div className="admin-list">
                {activities.length === 0 && <div>No recent activity</div>}
                {activities.map((a) => (
                  <div className="admin-item" key={a.id}>
                    <div className="admin-dot"></div>
                    <div>
                      <strong>{a.text}</strong>
                      <div className="admin-small">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
