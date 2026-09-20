import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
const AUTH_KEY = 'shama-chicken-shop-auth';
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_KEY);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.log('Invalid user data');
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    router.push('/signin');
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchInput)}`);
    } else {
      router.push('/products');
    }
  };
  const handleClear = () => {
    setSearchInput('');
    router.push('/products');
  };
  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            Menu ☰
          </button>
          <div className="logo">🍗 CRISPY CHICKEN</div>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search the store"
            className="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Search
          </button>
          <button type="button" onClick={handleClear} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Clear
          </button>
        </form>
        <div className="nav-icons">

          {!user ? (
            <>
              <Link href="/signin">Sign in</Link>
              <Link href="/signup">Sign up</Link>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {user.name}
                </div>

                <div style={{ fontSize: '13px' }}>
                  {user.email}
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Logout
              </button>
            </div>
          )}

          <Link href="/enquiry">Enquiry</Link>
          <Link href="/cart">Cart</Link>

        </div>
      </header>
      <div className={`menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/">Home</Link>
        <Link href="/products">All foods</Link>
        <Link href="/products?category=Biryani">Biryani</Link>
        <Link href="/products?category=Veg">Veg </Link>
        <Link href="/products?category=Chicken Gravy">Chicken Gravy</Link>
        <Link href="/about">About Us</Link>
      </div>
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
