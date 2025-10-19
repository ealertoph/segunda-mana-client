import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import caritasLogo from "../../assets/caritas_icon.jpg";
import "../../css/styles.css";

const Contact = () => {
  const [navActive, setNavActive] = useState(false);

  const toggleMobileNav = () => {
    setNavActive(!navActive);
    document.body.style.overflow = !navActive ? "hidden" : "";
  };

  const closeMobileNav = () => {
    setNavActive(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        closeMobileNav();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Message sent successfully!");
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        alert(data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while sending your message.");
    }
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
            <Link to="/contact" className="active">
              Contact Us
            </Link>
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

      {/* Mobile Nav Overlay */}
      <div
        className={`mobile-nav-overlay ${navActive ? "active" : ""}`}
        onClick={closeMobileNav}
      ></div>

      {/* Contact Section */}
      <main className="contact-wrapper">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h1>We would love to hear from you!</h1>
              <p>
                Questions, comments, or suggestions? Simply fill in the form and
                we'll be in touch shortly.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon address"></div>
                  <span>
                    2002 Jesus St, Pandacan, Manila, 1011 Metro Manila
                  </span>
                </div>
                <div className="contact-item">
                  <div className="contact-icon phone"></div>
                  <span>(02) 8562 0020</span>
                </div>
                <div className="contact-item">
                  <div className="contact-icon email"></div>
                  <span>donatedgoods@caritasmanila.org.ph</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h2>Send us a message</h2>
              <form onSubmit={handleSubmit}>
                <div className="contact-field">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label>Your message...</label>
                  <textarea
                    name="message"
                    placeholder="Tell us how we can help you"
                    value={form.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="contact-submit">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Segunda Mana. Shop with purpose.
      </footer>
    </div>
  );
};

export default Contact;
