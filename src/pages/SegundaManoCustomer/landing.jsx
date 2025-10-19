import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import caritasLogo from "../../assets/caritas_icon.jpg";
import "../../css/styles.css";
import { announcementService } from "../../services/announcementService";

const Landing = () => {
  const [navActive, setNavActive] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [shuffledAnnouncements, setShuffledAnnouncements] = useState([]);

  const toggleMobileNav = () => {
    setNavActive(!navActive);
    document.body.style.overflow = !navActive ? "hidden" : "";
  };

  const closeMobileNav = () => {
    setNavActive(false);
    document.body.style.overflow = "";
  };

  const openModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
    setIsModalOpen(false);
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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  // Fetch announcements on component mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await announcementService.getPublicAnnouncements();

        if (result.success) {
          const activeAnnouncements = result.data.announcements.filter(
            (a) => a.active
          );

          // Shuffle announcements randomly
          const shuffled = [...activeAnnouncements].sort(
            () => 0.5 - Math.random()
          );
          setShuffledAnnouncements(shuffled);
          setCurrentAnnouncementIndex(0);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to fetch announcements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    const fetchProducts = async () => {
      try {
        // Fetch all products
        const res = await fetch(
          `${process.env.REACT_APP_API_URL_ADMIN}/products/customer`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        // Fetch cart session
        const cartRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/cart/get`,
          {
            credentials: "include",
          }
        );

        const cartData = cartRes.ok ? await cartRes.json() : { cart: [] };

        // Adjust stock based on cart reservations
        const adjustedProducts = data.map((prod) => {
          const itemInCart = cartData.cart?.find(
            (item) => item.productId === prod._id
          );
          const reservedQty = itemInCart?.quantity || 0;
          return {
            ...prod,
            quantity: Math.max((prod.quantity || 0) - reservedQty, 0),
          };
        });

        // Shuffle products randomly
        const shuffled = adjustedProducts.sort(() => 0.5 - Math.random());

        // Optional: Hide products with zero current stock
        setProducts(shuffled.filter((p) => p.quantity > 0));
      } catch (err) {
        console.error(err);
        alert("Failed to load products. Check console for details.");
      }
    };

    fetchProducts();

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (shuffledAnnouncements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAnnouncementIndex(
        (prev) => (prev + 1) % shuffledAnnouncements.length
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [shuffledAnnouncements]);

  return (
    <>
      {/* Header */}
      <header className="site-header" role="banner">
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
            <Link to="/" className="active">
              Home
            </Link>
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
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`mobile-nav-overlay ${navActive ? "active" : ""}`}
        onClick={closeMobileNav}
      ></div>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero__banner">
              <img
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1800&auto=format&fit=crop"
                alt="Charity shop banner showing clothes and accessories"
              />
              <h1 className="hero__title">
                Shop with Heart. Give with Purpose.
              </h1>
              <p className="hero__subtitle">
                Segunda Mana turns donations into hope, shop today and be part
                of our mission.
              </p>
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="intro container">
          <div className="intro__title-wrap">
            <h2 className="intro__title">
              Segunda
              <br />
              Mana
            </h2>
          </div>
          <div className="intro__copy-wrap">
            <hr className="intro__rule" />
            <p className="intro__copy">
              Where every purchase makes an impact. By buying quality pre-loved
              items, you’re not just getting great finds — you’re helping send
              underprivileged youth to school, support struggling families, and
              build a more sustainable, compassionate community.
            </p>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="metrics">
          <div className="container">
            <div className="metrics__header">
              <h2 className="metrics__title">BY THE NUMBERS</h2>
              <p className="metrics__subtitle">54 Segunda Mana Stores</p>
            </div>
            <div className="metrics__grid">
              <div className="metric-card">
                <div className="metric-card__content">
                  <div className="metric-card__value">40</div>
                  <div className="metric-card__label">Charity Outlets</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card__content">
                  <div className="metric-card__value">10</div>
                  <div className="metric-card__label">Parish Kiosks</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card__content">
                  <div className="metric-card__value">4</div>
                  <div className="metric-card__label">Long-Term Bazaars</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="product-landing container">
          <h3 className="product-landing-title">Our Products:</h3>
          <div className="product-landing-grid">
            {products.length > 0 ? (
              products.slice(0, 3).map((p, i) => (
                <Link
                  to={`/product/${p._id}`} // Dynamic route based on product ID
                  state={{ product: p }} // Pass the full product object to the page
                  key={i}
                  className="product-landing-card"
                >
                  <img src={p.images?.[0] || p.img || ""} alt={p.name} />
                  <div className="product-landing-card__body">
                    <p className="product-landing-card__name">
                      {p.name || p.itemName}
                      <br />
                      {p.color || ""}
                    </p>
                    <div className="product-landing-card__price">
                      ₱{p.price}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p>Loading products...</p>
            )}
          </div>
        </section>

        {/* Announcement Section */}
        <section
          style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 20px" }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ color: "#6b7280" }}>Loading announcements...</p>
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                borderRadius: "12px",
              }}
            >
              <p>Error loading announcements: {error}</p>
            </div>
          ) : shuffledAnnouncements.length > 0 ? (
            <>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  marginBottom: "24px",
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                Latest Announcement
              </h2>

              <div
                key={shuffledAnnouncements[currentAnnouncementIndex]?._id}
                onClick={() =>
                  openModal(shuffledAnnouncements[currentAnnouncementIndex])
                }
                style={{
                  display: "flex",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  overflow: "hidden",
                  alignItems: "flex-start",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
              >
                {/* Image on the left */}
                {shuffledAnnouncements[currentAnnouncementIndex].media &&
                  shuffledAnnouncements[currentAnnouncementIndex].media.length >
                    0 && (
                    <img
                      src={
                        shuffledAnnouncements[currentAnnouncementIndex].media[0]
                      }
                      alt={
                        shuffledAnnouncements[currentAnnouncementIndex].title
                      }
                      style={{
                        width: "25%",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginRight: "16px",
                      }}
                    />
                  )}

                {/* Text content on the right */}
                <div
                  style={{
                    width: "75%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Badge
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor:
                        shuffledAnnouncements[
                          currentAnnouncementIndex
                        ].label?.toLowerCase() === "alert"
                          ? "#ef4444"
                          : shuffledAnnouncements[
                              currentAnnouncementIndex
                            ].label?.toLowerCase() === "warning"
                          ? "#f59e0b"
                          : "#3b82f6",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      letterSpacing: "0.5px",
                      width: "fit-content",
                    }}
                  >
                    {shuffledAnnouncements[currentAnnouncementIndex].label}
                  </span> */}

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "#1f2937",
                    }}
                  >
                    {shuffledAnnouncements[currentAnnouncementIndex].title}
                  </h3>

                  {/* Body */}
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      lineHeight: "1.6",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "auto",
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        shuffledAnnouncements[
                          currentAnnouncementIndex
                        ].body.replace(/<[^>]*>/g, "").length > 150
                          ? shuffledAnnouncements[currentAnnouncementIndex].body
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 150) + "..."
                          : shuffledAnnouncements[currentAnnouncementIndex]
                              .body,
                    }}
                  />

                  {/* Date */}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginTop: "auto",
                    }}
                  >
                    {new Date(
                      shuffledAnnouncements[currentAnnouncementIndex].createdAt
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ color: "#6b7280", fontSize: "16px" }}>
                No announcements available at the moment.
              </p>
            </div>
          )}
        </section>

        {/* Announcement Modal */}
        {isModalOpen && selectedAnnouncement && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
              animation: "fadeIn 0.2s ease-in-out",
            }}
            onClick={closeModal}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "32px",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                animation: "slideUp 0.3s ease-out",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "none",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#6b7280",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "background-color 0.2s",
                  lineHeight: "1",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                aria-label="Close modal"
              >
                ×
              </button>

              {selectedAnnouncement.media &&
                selectedAnnouncement.media.length > 0 && (
                  <img
                    src={selectedAnnouncement.media[0]}
                    alt={selectedAnnouncement.title}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      marginBottom: "24px",
                    }}
                  />
                )}

              {/* Badge
              <span
                style={{
                  display: "inline-block",
                  backgroundColor:
                    selectedAnnouncement.label === "alert" ||
                    selectedAnnouncement.label === "ALERT"
                      ? "#ef4444"
                      : selectedAnnouncement.label === "warning" ||
                        selectedAnnouncement.label === "WARNING"
                      ? "#f59e0b"
                      : "#3b82f6",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                  letterSpacing: "0.5px",
                }}
              >
                {selectedAnnouncement.label}
              </span> */}

              {/* Title */}
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#1f2937",
                  marginBottom: "12px",
                  paddingRight: "40px",
                  lineHeight: "1.3",
                }}
              >
                {selectedAnnouncement.title}
              </h2>

              {/* Date */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  marginBottom: "24px",
                  fontWeight: "500",
                }}
              >
                {new Date(selectedAnnouncement.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>

              {/* Divider */}
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #e5e7eb",
                  marginBottom: "24px",
                }}
              />

              {/* Full Body Content */}
              <div
                style={{
                  fontSize: "16px",
                  lineHeight: "1.7",
                  color: "#374151",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: selectedAnnouncement.body }}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} Segunda Mana. Shop with purpose.
      </footer>

      {/* Modal Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        @media (max-width: 768px) {
          .modal-content {
            padding: 24px !important;
            max-height: 90vh !important;
          }
          
          .modal-content h2 {
            fontSize: 24px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Landing;
