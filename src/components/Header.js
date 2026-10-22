import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import CreateProduct from "./CreateProduct";
import UpdateProduct from "./UpdateProduct";
import DeleteProduct from "./DeleteProduct";
export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", menuOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [menuOpen]);

  // =========================
  // SEARCH
  // =========================
  const handleSearch = (e) => {
    e.preventDefault();
    const search = searchInput.trim();
    if (search) {
      router.push(
        `/products?search=${encodeURIComponent(search)}`
      );
    } else {
      router.push("/products");
    }
  };
  // =========================
  // CLEAR SEARCH
  // =========================
  const handleClear = () => {
    setSearchInput("");
    router.push("/products");
  };
  // =========================
  // CREATE PRODUCT
  // =========================
  const handleCreateProduct = () => {
    setProfileOpen(false);
    setShowForm(true);
  };
  // =========================
  // UPDATE PRODUCT
  // =========================
  const handleUpdateProduct = () => {
    setProfileOpen(false);
    setShowUpdate(true);
  };
  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDeleteProduct = () => {
    setProfileOpen(false);
    setShowDelete(true);
  };
  // =========================
  // SHOW ORDERS
  // =========================
  const handleShowOrders = () => {
    setProfileOpen(false);
    router.push("/ShowOrder");
  };
  // =========================
  // MY ORDERS
  // =========================
  const handleMyOrders = () => {
    setProfileOpen(false);
    router.push("/MyOrders");
  };
  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/signin");
  };
  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header
        className={`navbar ${router.pathname === "/products" ? "navbar-storefront" : ""}`}
      >
        {/* ================= LEFT ================= */}
        <div className="navbar-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            Menu ☰
          </button>
          <div className="logo">
            🍗 SHAMA CHICKEN SHOP
          </div>
        </div>
        {/* ================= SEARCH ================= */}
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search the store"
            className="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "8px 16px",
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Clear
          </button>
        </form>
        {/* ================= RIGHT ================= */}
        <div className="nav-icons">
          {user ? (
            <div
              style={{
                position: "relative",
              }}
            >
              {/* ================= PROFILE BUTTON ================= */}
              <button
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                style={{
                  padding: "8px 12px",
                  background: "#0f766e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>
                  {user.name || "Profile"}
                </span>
                <span>
                  {profileOpen ? "▴" : "▾"}
                </span>
              </button>
              {/* =====================================================
                  PROFILE DROPDOWN
              ===================================================== */}
              {profileOpen && (
                <div className="profileDropdown">
                  {/* ================= USER INFO ================= */}
                  <div className="profileInfo">
                    <strong>
                      {user?.name || "User"}
                    </strong>
                    <span>
                      {user?.email || ""}
                    </span>
                    <small
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "#6b7280",
                        textTransform: "capitalize",
                      }}
                    >
                      Role: {user?.role || "user"}
                    </small>
                  </div>
                  <div className="divider"></div>
                  {/* =================================================
                      ADMIN MENU
                  ================================================= */}
                  {user?.role === "admin" ? (
                    <>
                      {/* SHOW ORDERS */}
                      <button
                        className="order-btn"
                        onClick={handleShowOrders}
                      >
                        Show Orders
                      </button>
                      {/* CREATE PRODUCT */}
                      <button
                        className="create-btn"
                        onClick={handleCreateProduct}
                      >
                        Create Product
                      </button>
                      {/* UPDATE PRODUCT */}
                      <button
                        className="update-btn"
                        onClick={handleUpdateProduct}
                      >
                        Update Product
                      </button>
                      {/* DELETE PRODUCT */}
                      <button
                        className="delete-btn"
                        onClick={handleDeleteProduct}
                      >
                        Delete Product
                      </button>
                    </>
                  ) : (
                    /* =================================================
                       NORMAL USER MENU
                    ================================================= */
                    <button
                      className="order-btn"
                      onClick={handleMyOrders}
                    >
                      My Orders
                    </button>
                  )}
                  {/* ================= LOGOUT ================= */}
                  <button
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ================= SIGN IN ================= */}
              <Link href="/signin">
                Sign in
              </Link>
              {/* ================= SIGN UP ================= */}
              <Link href="/signup">
                Sign up
              </Link>
            </>
          )}
          {/* ================= ENQUIRY ================= */}
          <Link href="/enquiry">
            Enquiry
          </Link>
          {/* ================= CART ================= */}
          <Link href="/cart">
            Cart
          </Link>
        </div>
      </header>
      {/* =====================================================
          MOBILE / MAIN MENU
      ===================================================== */}
      <nav
        className={`menu ${menuOpen ? "open" : ""}`}
        aria-label="Main menu"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu-header">
          <span>Menu</span>
          <button
            type="button"
            className="mobile-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          href="/products"
          onClick={() => setMenuOpen(false)}
        >
          All Foods
        </Link>
        <Link
          href="/products?category=Biryani"
          onClick={() => setMenuOpen(false)}
        >
          Biryani
        </Link>
        <Link
          href="/products?category=Veg"
          onClick={() => setMenuOpen(false)}
        >
          Veg
        </Link>
        <Link
          href="/products?category=Chicken%20Gravy"
          onClick={() => setMenuOpen(false)}
        >
          Chicken Gravy
        </Link>
        <Link
          href="/about"
          onClick={() => setMenuOpen(false)}
        >
          About Us
        </Link>
      </nav>
      {/* =====================================================
          MENU OVERLAY
      ===================================================== */}
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {/* =====================================================
          CREATE PRODUCT MODAL
      ===================================================== */}
      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button
              onClick={() => setShowForm(false)}
              style={closeButtonStyle}
            >
              ✕
            </button>
            <CreateProduct />
          </div>
        </div>
      )}
      {/* =====================================================
          UPDATE PRODUCT MODAL
      ===================================================== */}
      {showUpdate && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button
              onClick={() => setShowUpdate(false)}
              style={closeButtonStyle}
            >
              ✕
            </button>
            <UpdateProduct />
          </div>
        </div>
      )}
      {/* =====================================================
          DELETE PRODUCT MODAL
      ===================================================== */}
      {showDelete && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button
              onClick={() => setShowDelete(false)}
              style={closeButtonStyle}
            >
              ✕
            </button>
            <DeleteProduct />
          </div>
        </div>
      )}
    </>
  );
}
/* =========================================================
   MODAL OVERLAY
========================================================= */
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  zIndex: 3000,
  paddingTop: "50px",
  overflowY: "auto",
};
/* =========================================================
   MODAL
========================================================= */
const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "600px",
  position: "relative",
  marginBottom: "50px",
};
/* =========================================================
   CLOSE BUTTON
========================================================= */
const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "15px",
  border: "none",
  background: "transparent",
  fontSize: "18px",
  cursor: "pointer",
  zIndex: 10,
};