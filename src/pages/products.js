import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import { getApiBaseUrl } from "../lib/apiUrl";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import styles from "../styles/module/Products.module.css";

const CART_STORAGE_KEY = "crispy-chicken-cart";

function normalizeProducts(items) {
  return items.map((product) => {
    const image = product.image?.trim();

    return {
      ...product,
      image:
        image && !/^(https?:|data:|\/)/i.test(image)
          ? `/${image.replace(/^\.\//, "")}`
          : image,
    };
  });
}

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const selectedCategory =
    typeof router.query.category === "string"
      ? router.query.category
      : "All";
  const searchQuery =
    typeof router.query.search === "string" ? router.query.search : "";

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [deliveryCity, setDeliveryCity] = useState("");

  /* =========================
     LOAD CART
  ========================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(CART_STORAGE_KEY);

    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (error) {
        console.error("Invalid cart data:", error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  /* =========================
     LOAD PRODUCTS
  ========================= */

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    try {
      const savedAddress = JSON.parse(
        localStorage.getItem("delivery-address") || "null"
      );
      setDeliveryCity(savedAddress?.city || "");
    } catch (error) {
      console.warn("Saved delivery address could not be read.", error);
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      let hasFallbackMenu = false;
      const fallbackRequest = axios
        .get("/data/products.json", { timeout: 4000 })
        .then((response) => {
          if (!Array.isArray(response.data)) return;
          hasFallbackMenu = true;
          setProducts(normalizeProducts(response.data));
          setIsLoadingProducts(false);
        })
        .catch((error) => {
          console.error("Failed to load the local menu:", error);
        });

      try {
        const response = await axios.get(
          `${getApiBaseUrl()}/api/products`,
          { timeout: 7000 }
        );

        if (!Array.isArray(response.data)) {
          throw new Error("The product API returned an invalid menu.");
        }
        setProducts(normalizeProducts(response.data));
      } catch (error) {
        console.warn("Using the local menu because the product API is unavailable.", error);
        await fallbackRequest;
        if (!hasFallbackMenu) {
          setProductsError("The menu could not load. Please try again.");
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  /* =========================
     SAVE CART
  ========================= */

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  }, [cart, isLoaded]);

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = (product) => {
    if (authLoading) return;
    const nextCart = [...cart, product];
    setCart(nextCart);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
    if (!user) {
      router.push({ pathname: "/mobile-signup", query: { next: "/cart" } });
      return;
    }
    alert(`${product.name} added to cart successfully!`);
  };

  /* =========================
     BUY NOW
  ========================= */

  /* =========================
    BUY NOW
 ========================= */

  const buyNow = (product) => {
    try {
      if (authLoading) return;
      const checkoutProduct = {
        id: product.id,
        name: product.name || product.title,
        price: Number(product.price) || 0,
        quantity: 1,
        image:
          typeof product.image === "string" &&
            !product.image.startsWith("data:")
            ? product.image
            : "",
      };

      localStorage.setItem(
        "buy-now-product",
        JSON.stringify(checkoutProduct)
      );
      localStorage.removeItem("checkout-cart");

      if (!user) {
        router.push({
          pathname: "/mobile-signup",
          query: { next: "/checkout?newAddress=1" },
        });
        return;
      }
      router.push("/checkout?newAddress=1");

    } catch (error) {
      console.error("Buy Now error:", error);
      alert("Unable to proceed. Please try again.");
    }
  };

  /* =========================
     FILTER PRODUCTS
  ========================= */

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter((product) =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
    searchQuery,
  ]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ],
    [products]
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const search = searchInput.trim();
    router.push({
      pathname: "/products",
      query: {
        ...(selectedCategory !== "All" && { category: selectedCategory }),
        ...(search && { search }),
      },
    });
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      // Keep your existing backend order API request here.
      const response = await axios.post(
        `${getApiBaseUrl()}/api/orders`,
        orderData
      );

      if (response.status === 200 || response.status === 201) {
        router.push("/order-success");
      }
    } catch (error) {
      console.error(
        "Place order error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Order could not be placed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.storefront}>
      <div className={styles.topline}>
        <div className={styles.deliveryLabel}>
          <span className={styles.locationMark} aria-hidden="true">⌖</span>
          <div>
            <span className={styles.eyebrow}>FRESH FROM OUR KITCHEN</span>
            <p>{deliveryCity ? `Delivering to ${deliveryCity}` : "Made to order, delivered hot"}</p>
          </div>
        </div>
        <Link href="/cart" className={styles.cartLink}>
          <span aria-hidden="true">◒</span>
          <span>Cart</span>
          <span className={styles.cartCount}>{cart.length}</span>
        </Link>
      </div>

      <section className={styles.intro}>
        <div>
          <p className={styles.kicker}>SHAMA CHICKEN SHOP</p>
          <h1>Find the <span>best chicken</span> around you.</h1>
          <p className={styles.introCopy}>Comfort food, cooked fresh and ready for your table.</p>
        </div>
        <form className={styles.searchForm} onSubmit={handleSearch} role="search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search the menu"
            type="search"
            placeholder="Search your favorite food"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" aria-label="Search menu">Search</button>
        </form>
      </section>

      <section className={styles.menuSection} aria-labelledby="menu-title">
        <div className={styles.menuHeading}>
          <div>
            <p className={styles.kicker}>MADE FOR YOUR CRAVINGS</p>
            <h2 id="menu-title">
              {selectedCategory === "All" ? "Popular on our menu" : selectedCategory}
            </h2>
          </div>
          <span className={styles.resultCount}>{filteredProducts.length} items</span>
        </div>

        <div className={styles.categories} aria-label="Menu categories">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={category === selectedCategory ? styles.activeCategory : styles.category}
              aria-pressed={category === selectedCategory}
              onClick={() => router.push({
                pathname: "/products",
                query: {
                  ...(category !== "All" && { category }),
                  ...(searchQuery && { search: searchQuery }),
                },
              })}
            >
              {category === "All" ? "Popular" : category}
            </button>
          ))}
        </div>

        {isLoadingProducts ? (
          <p className={styles.stateMessage}>Preparing the menu...</p>
        ) : productsError ? (
          <p className={styles.stateMessage} role="alert">{productsError}</p>
        ) : filteredProducts.length === 0 ? (
          <p className={styles.stateMessage}>No dishes match that search. Try another name or category.</p>
        ) : (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <article className={styles.productItem} key={product.id}>
                <ProductCard product={product} />
                <div className={styles.actions}>
                  <button
                    className={styles.addButton}
                    onClick={() => addToCart(product)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <span aria-hidden="true">+</span> Add to cart
                  </button>
                  <button
                    className={styles.buyButton}
                    onClick={() => buyNow(product)}
                  >
                    Buy now
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}