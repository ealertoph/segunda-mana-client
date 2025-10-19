import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, Store, Wallet, HandCoins } from "lucide-react";
import caritasLogo from "../../assets/caritas_icon.jpg";
import "../../css/styles.css";

export default function Checkout() {
  const [navActive, setNavActive] = useState(false);
  const [orderType, setOrderType] = useState("delivery");
  const [paymentMode, setPaymentMode] = useState("gcash");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [orderId, setOrderId] = useState(false);

  // Contact + Address fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();

  const toggleMobileNav = () => {
    setNavActive((prev) => !prev);
    document.body.style.overflow = !navActive ? "hidden" : "";
  };

  const closeMobileNav = () => {
    setNavActive(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    // resize
    const handleResize = () => {
      if (window.innerWidth > 900) closeMobileNav();
    };
    window.addEventListener("resize", handleResize);

    const fetchCart = async () => {
      // get cart
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/cart/get`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        if (data.success) {
          setCartItems(data.cart);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Failed to fetch cart", err);
      }
    };

    fetchCart();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //total ng cart
  const subtotal = cartItems.reduce(
    // subtotal
    (acc, item) =>
      acc +
      (item.price || item.unitPrice || 0) * (item.quantity || item.qty || 1),
    0
  );
  const total = subtotal - discount;
  const clearCart = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/cart/clear`, {
      method: "POST",
      credentials: "include",
    });
    setCartItems([]); // Clear frontend state too
  };
  // Apply voucher
  const applyVoucher = () => {
    // voucher
    if (voucher.trim().toUpperCase() === "DISCOUNT50") {
      setDiscount(50);
    } else {
      setDiscount(0);
      alert("Invalid voucher code");
    }
  };

  // Handle Place Order
  const handlePlaceOrder = async () => {
    if (!firstName || !lastName || !phone || !email) {
      alert("Please fill out all contact information.");
      return;
    }

    if (orderType === "delivery" && (!street || !city)) {
      alert("Please fill out your delivery address.");
      return;
    }

    if (paymentMode === "gcash" && !receiptFile) {
      alert("Please upload your GCash receipt.");
      return;
    }

    const formData = new FormData();
    formData.append("buyerName", `${firstName} ${lastName}`);
    formData.append("buyerEmail", email);
    formData.append("items", JSON.stringify(cartItems));
    formData.append("paymentMethod", paymentMode);
    formData.append("orderType", orderType);
    if (orderType === "delivery") {
      formData.append("address", JSON.stringify({ street, city, state, zip }));
    }
    if (receiptFile) formData.append("proofOfPayment", receiptFile);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/orders/order`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create order.");
        return;
      }

      // 🔹 If OTP required
      if (data.requiresOtp) {
        alert("OTP sent to your email. Please verify.");
        setOrderId(data.orderId);
        setOtpModalOpen(true);
        return;
      }

      // 🔹 If voucher issued
      if (data.voucherCode) {
        await clearCart();

        navigate("/thankyou", {
          state: {
            email,
            orderId: data.orderId,
            voucherCode: data.voucherCode,
            order: data.order,
          },
        });
        return;
      }

      // 🔹 Fallback
      alert("Order created successfully!");
      navigate("/thankyou", { state: { email, orderId: data.orderId } });
    } catch (err) {
      console.error(err);
      alert("Server error while creating order.");
    }
  };

  // OTP submit handler
  const handleOtpSubmit = async () => {
    // otp submit
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/orders/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, otp }),
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        alert("OTP verified! Redirecting to Thank You page...");
        setOtpModalOpen(false);
        await clearCart();
        setEmailVerified(true);
        navigate("/thankyou", {
          state: {
            email,
            orderId: data.order._id,
            voucherCode: data.order.ticketVoucher.code,
            order: data.order,
          },
        });
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("OTP verification failed.");
    }
  };

  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  const handleReceiptUpload = (e) => {
    // receipt upload
    setReceiptFile(e.target.files[0]);
  };

  return (
    <div>
      {/* Header */}
      <header className="site-header">
        <div className="container header-grid">
          <div className="brand">
            <img src={caritasLogo} alt="Caritas Icon" className="brand__logo" />
            <span className="brand__text">
              Segunda
              <br />
              Mana
            </span>
          </div>
          <nav className={`main-nav ${navActive ? "active" : ""}`}>
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact Us</Link>
            <button
              className="mobile-nav-close"
              aria-label="Close navigation"
              onClick={closeMobileNav}
            >
              ✕
            </button>
          </nav>

          <div className="header-tools">
            {/*<div className="search">
              <input placeholder="What are you looking for?" />
              <span className="icon icon-search" aria-hidden="true"></span>
            </div>*/}
            <Link to="/mycart" aria-label="My Cart">
              <span className="icon icon-cart" aria-hidden="true"></span>
            </Link>
          </div>

          <button
            className={`mobile-nav-toggle ${navActive ? "active" : ""}`}
            aria-label="Toggle navigation"
            onClick={toggleMobileNav}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`mobile-nav-overlay ${navActive ? "active" : ""}`}
        onClick={closeMobileNav}
      ></div>

      {/* Checkout Content */}
      <main className="checkout-wrapper">
        <div className="container">
          <h1 className="checkout-title">Check Out</h1>

          <div className="checkout-grid">
            {/* Checkout Form */}
            <div className="checkout-form">
              {/* Pick Order Type */}
              <section className="checkout-section">
                <h3>Pick Order Type</h3>
                <div className="option-group horizontal-options">
                  <label
                    className={`option-card ${
                      orderType === "delivery" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={orderType === "delivery"}
                      onChange={() => setOrderType("delivery")}
                    />
                    <div className="option-content">
                      <Truck size={28} />
                      <span>Delivery</span>
                    </div>
                  </label>

                  <label
                    className={`option-card ${
                      orderType === "pickup" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="pickup"
                      checked={orderType === "pickup"}
                      onChange={() => setOrderType("pickup")}
                    />
                    <div className="option-content">
                      <Store size={28} />
                      <span>Pick up</span>
                    </div>
                  </label>
                </div>
              </section>

              {/* Contact Information */}
              <section className="checkout-section">
                <h3>Contact Information</h3>
                <div className="checkout-field">
                  <label>FIRST NAME</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="checkout-field">
                  <label>LAST NAME</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="checkout-field">
                  <label>PHONE NUMBER</label>
                  <input
                    type="tel"
                    placeholder="eg. 09171234567  "
                    value={phone}
                    maxLength={11} // Prevent typing more than 11 digits
                    onChange={(e) => {
                      const value = e.target.value;

                      // Allow only digits

                      // Enforce starting with 09
                      if (value.length === 1) {
                        if (value !== "0") return;
                        setPhone(value);
                        return;
                      }

                      // Enforce second character to be '9'
                      if (value.length === 2) {
                        if (value !== "09") return;
                        setPhone(value);
                        return;
                      }
                      setPhone(value);
                    }}
                  />
                </div>
                <div className="checkout-field">
                  <label>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    placeholder="eg. john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </section>

              {/* Address (only if Delivery) */}
              {orderType === "delivery" && (
                <section className="checkout-section">
                  <h3>Address</h3>
                  <div className="checkout-field">
                    <label>STREET ADDRESS *</label>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                  <div className="checkout-field">
                    <label>TOWN / CITY *</label>
                    <input
                      type="text"
                      placeholder="Town / City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="checkout-field">
                    <label>STATE</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div className="checkout-field">
                    <label>ZIP CODE</label>
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </section>
              )}

              {/* Payment Method */}
              <section className="checkout-section">
                <h3>Payment Method</h3>
                <div className="option-group horizontal-options">
                  <label
                    className={`option-card ${
                      paymentMode === "gcash" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value="gcash"
                      checked={paymentMode === "gcash"}
                      onChange={() => setPaymentMode("gcash")}
                    />
                    <div className="option-content">
                      <Wallet size={28} />
                      <span>GCash</span>
                    </div>
                  </label>

                  <label
                    className={`option-card ${
                      paymentMode === "cash" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value="cash"
                      checked={paymentMode === "cash"}
                      onChange={() => setPaymentMode("cash")}
                    />
                    <div className="option-content">
                      <HandCoins size={28} />
                      <span>Cash</span>
                    </div>
                  </label>
                </div>

                {/* Conditional render for GCash */}
                {paymentMode === "gcash" && (
                  <div className="gcash-section">
                    <div className="checkout-qr">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=InstaPay&bgcolor=ffffff&color=000000"
                        alt="InstaPay QR Code"
                      />
                      <p className="qr-text">
                        Scan this QR using your GCash app
                      </p>
                    </div>

                    <div className="checkout-field">
                      <label>Reference Number</label>
                      <input
                        type="text"
                        placeholder="Enter reference number"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                      />
                    </div>

                    <div className="checkout-field">
                      <label>Upload Receipt</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                      />
                    </div>
                  </div>
                )}

                {/* Conditional render for Cash */}
                {paymentMode === "cash" && (
                  <p className="cash-note">
                    You will pay <b>cash</b> upon delivery or pickup.
                  </p>
                )}
              </section>
            </div>

            {/* Order Summary */}
            <aside className="checkout-order">
              <h3>Order summary</h3>
              {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                cartItems.map((item, i) => (
                  <div className="checkout-item" key={i}>
                    <img
                      src={
                        item.image ||
                        (item.images && item.images[0]) ||
                        "https://via.placeholder.com/80"
                      }
                      alt={item.title || "Product"}
                    />
                    <div className="checkout-item-info">
                      <div className="checkout-item-name">
                        {item.title || item.name}
                      </div>
                      <div className="checkout-item-variant">
                        Qty: {item.qty || item.quantity || 1}
                      </div>
                    </div>
                    <div className="checkout-item-price">
                      ₱{(item.price || 0) * item.quantity.toFixed(2)}
                    </div>
                  </div>
                ))
              )}

              {/* Voucher Code */}
              <div className="checkout-field">
                <label>Voucher Code</label>
                <div className="voucher-inline">
                  <input
                    type="text"
                    placeholder="Enter voucher"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                  />
                  <button className="voucher-btn" onClick={applyVoucher}>
                    Apply
                  </button>
                </div>
              </div>

              <div className="checkout-summary">
                <span>Subtotal</span>
                <span>₱{subtotal}.00</span>
              </div>
              {discount > 0 && (
                <div className="checkout-summary">
                  <span>Discount</span>
                  <span>-₱{discount}.00</span>
                </div>
              )}
              <div className="checkout-summary total">
                <span>Total</span>
                <span>₱{total}.00</span>
              </div>

              <button
                className="checkout-place-order"
                onClick={handlePlaceOrder}
              >
                Place Order
              </button>
              {/* OTP Modal */}
              {otpModalOpen && (
                <div className="otp-modal-overlay">
                  <div className="otp-modal-content">
                    <h2>OTP Verification</h2>
                    <p>Please enter the OTP sent to your email:</p>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                    />
                    <div className="otp-modal-buttons">
                      <button onClick={handleOtpSubmit} className="verify-btn">
                        Verify OTP
                      </button>
                      <button
                        onClick={() => setOtpModalOpen(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Segunda Mana. Shop with purpose.
      </footer>
    </div>
  );
}
