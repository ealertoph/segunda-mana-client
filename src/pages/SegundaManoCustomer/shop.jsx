import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import caritasLogo from "../../assets/caritas_icon.jpg";
import "../../css/styles.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [selectedCategory, setSelectedCategory] = useState(null); // null = no filter
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
    const mainNav = document.querySelector(".main-nav");
    const mobileNavOverlay = document.querySelector(".mobile-nav-overlay");
    const mobileNavClose = document.querySelector(".mobile-nav-close");

    const shopSidebar = document.querySelector(".shop-sidebar");
    const sidebarClose = document.querySelector(".sidebar-close");
    const filterToggle = document.querySelector(".filter-toggle");

    function toggleMobileNav() {
      mainNav?.classList.toggle("active");
      mobileNavOverlay?.classList.toggle("active");
      mobileNavToggle?.classList.toggle("active");
      document.body.style.overflow = mainNav?.classList.contains("active")
        ? "hidden"
        : "";
    }

    function closeMobileNav() {
      mainNav?.classList.remove("active");
      mobileNavOverlay?.classList.remove("active");
      mobileNavToggle?.classList.remove("active");
      document.body.style.overflow = "";
    }

    function openSidebar() {
      shopSidebar?.classList.add("active");
    }

    function closeSidebar() {
      shopSidebar?.classList.remove("active");
    }

    // Listeners
    mobileNavToggle?.addEventListener("click", toggleMobileNav);
    mobileNavOverlay?.addEventListener("click", closeMobileNav);
    mobileNavClose?.addEventListener("click", closeMobileNav);
    sidebarClose?.addEventListener("click", closeSidebar);
    filterToggle?.addEventListener("click", openSidebar);

    const resizeHandler = () => {
      if (window.innerWidth > 900) {
        closeMobileNav();
        shopSidebar?.classList.remove("active");
      }
    };
    window.addEventListener("resize", resizeHandler);

    // Cleanup
    return () => {
      mobileNavToggle?.removeEventListener("click", toggleMobileNav);
      mobileNavOverlay?.removeEventListener("click", closeMobileNav);
      mobileNavClose?.removeEventListener("click", closeMobileNav);
      sidebarClose?.removeEventListener("click", closeSidebar);
      filterToggle?.removeEventListener("click", openSidebar);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  useEffect(() => {
    const min = Number(minPriceInput) || 0;
    const max = Number(maxPriceInput) || Infinity;
    setPriceRange({ min, max });
  }, [minPriceInput, maxPriceInput]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch products from backend
        const res = await fetch(
          "http://localhost:5000/api/admin/products/customer"
        );
        const data = await res.json();

        // 2️⃣ Fetch cart session
        const cartRes = await fetch("http://localhost:5000/api/cart/get", {
          credentials: "include",
        });
        const cartData = cartRes.ok ? await cartRes.json() : { cart: [] };

        // 3️⃣ Adjust stock based on cart quantities
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

        setProducts(adjustedProducts);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };

    fetchData();
  }, []);

  const handlePriceFilter = (min, max) => {
    setPriceRange({ min, max });
  };

  const filteredProducts = products
    .filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
    .filter((p) => !selectedCategory || p.category === selectedCategory)
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;

      const fields = [
        p.name,
        p.itemName,
        p.category,
        p.size,
        p.price,
        p.description,
      ];

      return fields.some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(q)
      );
    });

  const categories = [
    "Furniture",
    "Clothes",
    "Gadgets & Phones",
    "Bags",
    "Toys",
    "Dining",
    "Outdoor",
    "Shoes",
    "Accessories",
  ];

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // deselect if already selected
    } else {
      setSelectedCategory(category); // select new category
    }
  };

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
          <nav className="main-nav">
            <Link to="/landing">Home</Link>
            <Link to="/shop" className="active">
              Shop
            </Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact Us</Link>
            <button className="mobile-nav-close" aria-label="Close navigation">
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
          <button className="mobile-nav-toggle" aria-label="Toggle navigation">
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className="mobile-nav-overlay"></div>

      {/* Shop Wrapper */}
      <main className="shop-wrapper">
        <div className="shop-container">
          {/* Sidebar */}
          <aside className="shop-sidebar">
            <button className="sidebar-close" aria-label="Close sidebar">
              ✕
            </button>
            <div className="filter-block">
              <div className="filter-title">Categories</div>
              <ul className="filter-list">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategory(null); // reset to show all
                    }}
                    className={!selectedCategory ? "is-active underline" : ""}
                  >
                    All
                  </a>
                </li>

                {categories.map((cat) => (
                  <li key={cat}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategoryClick(cat);
                      }}
                      className={
                        selectedCategory === cat ? "is-active underline" : ""
                      }
                    >
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-block">
              <div className="filter-title">Price</div>
              <p className="filter-note">
                Share your budget with us — we’ll surprise you with items that
                support a scholar.
              </p>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="₱ min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="₱ max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                />
              </div>
              <ul className="filter-list small">
                <li>
                  <label>
                    <input
                      type="radio"
                      checked={priceRange?.min === 0 && priceRange?.max === 100}
                      onChange={() => handlePriceFilter(0, 100)}
                    />{" "}
                    ₱0 – ₱100.00
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      checked={
                        priceRange?.min === 101 && priceRange?.max === 199.99
                      }
                      onChange={() => handlePriceFilter(101, 199.99)}
                    />{" "}
                    ₱100.01 – ₱199.99
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      checked={
                        priceRange?.min === 200 && priceRange?.max === 299.99
                      }
                      onChange={() => handlePriceFilter(200, 299.99)}
                    />{" "}
                    ₱200 – ₱299.99
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      checked={
                        priceRange?.min === 300 && priceRange?.max === 399.99
                      }
                      onChange={() => handlePriceFilter(300, 399.99)}
                    />{" "}
                    ₱300 – ₱399.99
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      checked={
                        priceRange?.min === 400 && priceRange?.max === Infinity
                      }
                      onChange={() => handlePriceFilter(400, Infinity)}
                    />{" "}
                    ₱400+
                  </label>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <section className="shop-main">
            {/* <h1 className="shop-title">Clothes</h1> */}
            {/* <button className="filter-toggle">Filter</button> */}

            {/* Search Bar (same style as Admin) */}
            <div className="shop-toolbar">
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
                <input
                  placeholder="Search by name, category, or description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="shop-grid">
              {filteredProducts.filter((p) => p.quantity > 0).length > 0 ? (
                filteredProducts
                  .filter((p) => p.quantity > 0)
                  .map((p, i) => (
                    <article className="p-card" key={i}>
                      <Link to={`/product/${p._id}`} className="p-add">
                        {p.quantity > 0 ? "Add to cart" : "Out of Stock"}
                      </Link>
                      <Link to={`/product/${p._id}`} className="p-link">
                        <figure className="p-thumb">
                          <img
                            src={p.images?.[0] || ""}
                            alt={p.name || p.itemName}
                          />
                        </figure>
                        <div className="p-info">
                          <div className="p-name">{p.name || p.itemName}</div>
                          {p.size && <div className="p-variant">{p.size}</div>}
                          <div className="p-quantity">Qty: {p.quantity}</div>
                          <div className="p-price">₱{p.price}</div>
                        </div>
                      </Link>
                    </article>
                  ))
              ) : (
                <p>No products found for this price range.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        © 2025 Segunda Mana. Shop with purpose.
      </footer>
    </>
  );
};

export default Shop;
