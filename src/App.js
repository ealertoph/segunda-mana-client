import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./css/styles.css";
import About from "./pages/SegundaManoCustomer/about";
import Checkout from "./pages/SegundaManoCustomer/checkout";
import Contact from "./pages/SegundaManoCustomer/contact";
import Landing from "./pages/SegundaManoCustomer/landing";
import MyCart from "./pages/SegundaManoCustomer/mycart";
import Product from "./pages/SegundaManoCustomer/product";
import Shop from "./pages/SegundaManoCustomer/shop";
import Thankyou from "./pages/SegundaManoCustomer/thankyou";

/*Admin Side*/
import Inventory from "./pages/SegundaManoAdmin/inventory";
import Dashboard from "./pages/SegundaManoAdmin/dashboard";
import Login from "./pages/SegundaManoAdmin/login";
import Orders from "./pages/SegundaManoAdmin/orders";
import Activity from "./pages/SegundaManoAdmin/activity";
import Beneficiary from "./pages/SegundaManoAdmin/beneficiary";
import AddProduct from "./pages/SegundaManoAdmin/add-product";
import AddOrder from "./pages/SegundaManoAdmin/add-order";
import AddBeneficiary from "./pages/SegundaManoAdmin/add-beneficiary";
import AddInventory from "./pages/SegundaManoAdmin/add-inventory";
import Announcement from "./pages/SegundaManoAdmin/announcement";
import AccountSettings from "./pages/SegundaManoAdmin/account-settings";
import AdminProduct from "./pages/SegundaManoAdmin/admin-product";
import StaffManagement from "./pages/SegundaManoAdmin/staff-management";
import DailyCollection from "./pages/SegundaManoAdmin/dailycollection";
import ViewModal from "./pages/SegundaManoAdmin/view-modal";
import ActionButtons from "./pages/SegundaManoAdmin/action-buttons";
/* Components */
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/mycart" element={<MyCart />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/thankyou" element={<Thankyou />} />

        {/* ✅ Admin Pages */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes - All roles */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beneficiary"
          element={
            <ProtectedRoute>
              <Beneficiary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-order"
          element={
            <ProtectedRoute>
              <AddOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-beneficiary"
          element={
            <ProtectedRoute>
              <AddBeneficiary />
            </ProtectedRoute>
          }
        />
        <Route path="/add-inventory" element={<AddInventory />} />

        <Route
          path="/announcement"
          element={
            <ProtectedRoute>
              <Announcement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-product"
          element={
            <ProtectedRoute>
              <AdminProduct />
            </ProtectedRoute>
          }
        />
        <Route path="/view-modal" element={<ViewModal />} />
        <Route path="/action-buttons" element={<ActionButtons />} />
        <Route path="/dailycollection" element={<DailyCollection />} />

        {/* Protected Superadmin Routes - Superadmin only */}
        <Route
          path="/activity"
          element={
            <ProtectedRoute requireSuperAdmin={true}>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-management"
          element={
            <ProtectedRoute requireSuperAdmin={true}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
