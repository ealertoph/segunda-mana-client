import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import caritasLogo from "../../assets/caritas_icon.jpg";
import "../../css/styles.css";

const ThankYou = () => {
  const [navActive, setNavActive] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const location = useLocation();
  const { orderId, voucherCode } = location.state || {};

  // prevent body scroll when mobile nav is active
  useEffect(() => {
    document.body.style.overflow = navActive ? "hidden" : "";
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setNavActive(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navActive]);

  useEffect(() => {
    if (orderId) {
      fetch(`${process.env.REACT_APP_API_URL_ADMIN}/orders/${orderId}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrderDetails({
              total: data.order.subtotal,
              date: new Date(data.order.createdAt).toLocaleDateString(),
              type: data.order.orderType,
              address: data.order.address,
              impact: data.order.impact,
              code: voucherCode || data.order.code,
            });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch order details:", err);
        });
    }
  }, [orderId]);
  return (
    <>
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
            <Link to="/landing">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact Us</Link>
            <button
              className="mobile-nav-close"
              aria-label="Close navigation"
              onClick={() => setNavActive(false)}
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
            onClick={() => setNavActive(!navActive)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`mobile-nav-overlay ${navActive ? "active" : ""}`}
        onClick={() => setNavActive(false)}
      ></div>

      {/* Main Content */}
      <main className="thankyou-wrapper">
        <div className="thankyou-content">
          <h1 className="thankyou-title">Thank you!</h1>

          {orderDetails ? (
            <>
              <p className="thankyou-message">
                Your order of <strong>₱{orderDetails.total}</strong> will
                {orderDetails.impact.meals > 0 && (
                  <>
                    {" "}
                    provide <strong>
                      {orderDetails.impact.meals} meals
                    </strong>{" "}
                    to scholars.
                  </>
                )}
              </p>

              <div className="thankyou-order">
                <div className="thankyou-order-row">
                  <span className="label">Order code:</span>
                  <span className="value">#{orderDetails.code}</span>
                </div>
                <div className="thankyou-order-row">
                  <span className="label">Date:</span>
                  <span className="value">{orderDetails.date}</span>
                </div>
                <div className="thankyou-order-row">
                  <span className="label">Order type:</span>
                  <span className="value">{orderDetails.type}</span>
                </div>
                {orderDetails.type === "Delivery" && (
                  <div className="thankyou-order-row">
                    <span className="label">Address:</span>
                    <span className="value">{orderDetails.address}</span>
                  </div>
                )}
                <div className="thankyou-order-row total">
                  <span className="label">Total:</span>
                  <span className="value">₱{orderDetails.total}</span>
                </div>
              </div>
            </>
          ) : (
            <p>No order details found.</p>
          )}

          <div className="thankyou-actions">
            <a href="#" className="thankyou-btn primary">
              Download Certificate of Donation
            </a>
            <Link to="/shop" className="thankyou-btn secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      {/* Floating Social Media Icon */}
      <a href="#" className="thankyou-float" aria-label="Follow us on Facebook">
        F
      </a>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Segunda Mana. Shop with purpose.
      </footer>
    </>
  );
};

export default ThankYou;
