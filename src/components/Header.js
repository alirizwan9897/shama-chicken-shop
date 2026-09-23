import Link from "next/link";
import { useState } from "react";
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
  // Search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(
        `/products?search=${encodeURIComponent(searchInput)}`
      );
    } else {
      router.push("/products");
    }
  };
  // Clear search
  const handleClear = () => {
    setSearchInput("");
    router.push("/products");
  };
  // Create
  const handleCreateProduct = () => {
    setProfileOpen(false);
    setShowForm(true);
  };
  // Update
  const handleUpdateProduct = () => {
    setProfileOpen(false);
    setShowUpdate(true);
  };
  // Delete
  const handleDeleteProduct = () => {
    setProfileOpen(false);
    setShowDelete(true);
  };
  // Logout
  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/signin");
  };
  return (
    <>
      <header className="navbar">
        {/* LEFT */}
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
        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center"
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
              fontWeight: "600"
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
              fontWeight: "600"
            }}
          >
            Clear
          </button>
        </form>
        {/* RIGHT */}
        <div className="nav-icons">
          {user ? (
            <div style={{ position: "relative" }}>
              {/* PROFILE BUTTON */}
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
                  gap: "6px"
                }}
              >
                <span>
                  {user.name || "Profile"}
                </span>
                <span>
                  ▾
                </span>
              </button>
              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: "white",
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.12)",
                    padding: "10px",
                    minWidth: "220px",
                    zIndex: 2000
                  }}
                >
                  {/* USER INFORMATION */}
                  <div
                    style={{
                      padding: "8px",
                      borderBottom:
                        "1px solid #e5e7eb",
                      marginBottom: "8px"
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#111827"
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280"
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                  {/* CREATE */}
                  <button
                    onClick={handleCreateProduct}
                    style={menuButtonStyle}
                  >
                    Create Product
                  </button>
                  {/* UPDATE */}
                  <button
                    onClick={handleUpdateProduct}
                    style={menuButtonStyle}
                  >
                    Update Product
                  </button>
                  {/* DELETE */}
                  <button
                    onClick={handleDeleteProduct}
                    style={{
                      ...menuButtonStyle,
                      background: "#ef4444"
                    }}
                  >
                    Delete Product
                  </button>
                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    style={{
                      ...menuButtonStyle,
                      background: "#111827"
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin">
                Sign in
              </Link>
              <Link href="/signup">
                Sign up
              </Link>
            </>
          )}
          <Link href="/enquiry">
            Enquiry
          </Link>
          <Link href="/cart">
            Cart
          </Link>
        </div>
      </header>
      {/* MENU */}
      <div
        className={`menu ${menuOpen ? "open" : ""
          }`}
      >
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
      </div>
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {/* CREATE PRODUCT MODAL */}
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
      {/* UPDATE PRODUCT MODAL */}
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
      {/* DELETE PRODUCT MODAL */}
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
/* PROFILE MENU BUTTON */
const menuButtonStyle = {
  width: "100%",
  padding: "9px 10px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginBottom: "8px",
  fontWeight: "600"
};
/* MODAL OVERLAY */
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
  overflowY: "auto"
};
/* MODAL */
const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "600px",
  position: "relative",
  marginBottom: "50px"
};
/* CLOSE BUTTON */
const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "15px",
  border: "none",
  background: "transparent",
  fontSize: "18px",
  cursor: "pointer",
  zIndex: 10
};