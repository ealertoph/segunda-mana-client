import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import caritasLogo from "../../assets/caritas_icon.jpg";
import "../../css/styles.css";
import heroImage from "../../assets/image.png";

export default function About() {
  const [navActive, setNavActive] = useState(false);

  const toggleMobileNav = () => {
    setNavActive((prev) => !prev);
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
            <Link to="/about" className="active">
              About
            </Link>
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

      {/* Mobile Nav Overlay */}
      <div
        className={`mobile-nav-overlay ${navActive ? "active" : ""}`}
        onClick={closeMobileNav}
      ></div>

      {/* Hero Section */}
      <section className="ab-hero">
        <img src={heroImage} alt="Segunda Mana" />
        <div className="overlay"></div>
      </section>

      {/* Hero Text Below */}
      <div className="ab-hero-text">
        <h1>
          Shop with heart.
          <br />
          Give with Purpose.
        </h1>
        <p>
          Segunda Mana turns donations into hope — shop today and be part of our
          mission.
        </p>
      </div>

      {/* About Content */}
      <section className="about-content">
        <h2>Segunda Mana</h2>
        <p>
          Segunda Mana is the special donations-in-kind program of Caritas
          Manila. It gives your pre-loved items a second life — and someone else
          a second chance. Shop or donate today and help fund education,
          livelihoods, and hope for those who need it most.
        </p>

        <div className="mvv">
          <div className="mvv-card">
            <h3>Our Vision</h3>
            <p>
              A spirit-led community of love, committed to charity for the
              common good.
            </p>
          </div>

          <div className="mvv-card">
            <h3>Our Mission</h3>
            <p>
              To uplift the social welfare and development of marginalized
              communities across Metro Manila by fostering sustainable
              micro-enterprise and social impact — catalyzing human development
              and sustainable growth.
            </p>
          </div>

          <div className="mvv-card">
            <h3>Our Values</h3>
            <ul>
              <li>Compassion & Faith</li>
              <li>Service in Love</li>
              <li>Empowering the Poor</li>
            </ul>
          </div>
        </div>

        {/* Logo at Bottom */}
        <div className="about-logo">
          <img src={caritasLogo} alt="Caritas Manila Logo" />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Segunda Mana. Shop with purpose.
      </footer>
    </div>
  );
}
