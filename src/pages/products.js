import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://shama-chicken-shop.vercel.app";
const CART_STORAGE_KEY = "crispy-chicken-cart";
const CATEGORY_FILTERS = {
  All: null,
  Grilled: ["Grilled"],
  Fried: ["Fried"],
  Tandoori: ["Tandoori"],
  Curry: ["Curry"],
  BBQ: ["BBQ"],
  Specialty: ["Specialty", "Asian"],
  Combo: ["Combo"],
  Biryani: ["Biryani"],
  Veg: ["Veg"],
  "Chicken Gravy": ["Chicken Gravy"],
};
const CATEGORY_LABELS = {
  All: "All Chicken Menu",
  Grilled: "Grilled Chicken",
  Fried: "Fried Chicken",
  Tandoori: "Tandoori",
  Curry: "Curries",
  BBQ: "BBQ",
  Specialty: "Specialty",
  Combo: "Combo Meals",
  "Chicken Gravy": "Chicken Gravy",
};
export default function Home() {
  const router = useRouter();
  const selectedCategory = router.query.category || "All";
  const searchQuery = router.query.search || "";
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      setCart(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products`);
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    loadProducts();
  }, []);
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, isLoaded]);
  // Add To Cart Function
  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    alert(`${product.name} added to cart! Go to cart to view or buy.`);
  };
  // Buy Now Function
  const buyNow = (product) => {
    alert(`Proceeding to buy ${product.name}`);
  };
  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };
  const filteredProducts = useMemo(() => {
    let result = products;
    // Filter by category
    const allowedCategories = CATEGORY_FILTERS[selectedCategory] || null;
    if (allowedCategories) {
      result = result.filter((product) => allowedCategories.includes(product.category));
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);
  const activeLabel = searchQuery ? `Search: "${searchQuery}"` : CATEGORY_LABELS[selectedCategory] || selectedCategory;
  return (
    <div className="products">
      <div className="products-headline">
        <h1>{activeLabel}</h1>
        <div className="cart-button-row">
          <span>Cart Items: {cart.length}</span>
          <Link href="/cart" className="goto-cart-btn">
            Go to Cart
          </Link>
        </div>
      </div>
      {products.length === 0 ? (
        <p>Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found. Try a different search or category.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <div className="card-body">
                <h3>{product.name}</h3>
                <p>₹{product.price}</p>
                {/* Buttons */}
                <div className="btn-group">
                  <button
                    className="cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="buy-btn"
                    onClick={() => buyNow(product)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}