
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/module/Cart.module.css";
const CART_STORAGE_KEY = "crispy-chicken-cart";

export default function Cart() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);

      if (stored) {
        const parsedCart = JSON.parse(stored);
        setCart(Array.isArray(parsedCart) ? parsedCart : []);
      }
    } catch (error) {
      console.error("Load cart error:", error);
      setCart([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage

  useEffect(() => {
    if (!isLoaded) return;

    try {
      const safeCart = cart.map((item) => ({
        ...item,
        image:
          typeof item.image === "string" &&
            !item.image.startsWith("data:")
            ? item.image
            : "",
      }));

      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(safeCart)
      );
    } catch (error) {
      console.error("Saving cart failed:", error);
    }
  }, [cart, isLoaded]);


  // Remove product from cart
  const removeFromCart = (index) => {
    setCart((previousCart) =>
      previousCart.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // Buy individual product
  const buyNow = (product) => {
    localStorage.setItem(
      "buy-now-product",
      JSON.stringify(product)
    );

    router.push("/checkout");
  };

  // Calculate total correctly
  const total = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;

    return sum + price * quantity;
  }, 0);

  // Continue with all cart items

  const continueToPayment = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      // Save only required product details
      const checkoutItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image:
          typeof item.image === "string" &&
            !item.image.startsWith("data:")
            ? item.image
            : "",
      }));

      localStorage.setItem(
        "checkout-cart",
        JSON.stringify(checkoutItems)
      );

      localStorage.removeItem("buy-now-product");

      router.push("/checkout");
    } catch (error) {
      console.error("Checkout storage error:", error);
      alert(
        "Unable to continue. Please refresh your cart and try again."
      );
    }
  };

  return (
    <div className="products">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <section className="cart-grid">
            {cart.map((item, index) => (
              <div
                className="card"
                key={`${item.id}-${index}`}
              >
                <img
                  src={item.image}
                  alt={item.name || "Product"}
                />

                <div className="card-body">
                  <h3>{item.name}</h3>

                  <p>
                    ₹
                    {(Number(item.price) || 0).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>

                  <div className="btn-group">
                    <button
                      className="buy-btn"
                      onClick={() => buyNow(item)}
                    >
                      Buy Now
                    </button>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="cart-total">
            <strong>Total:</strong>{" "}
            ₹
            {total.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <button
            type="button"
            className={styles.continuePaymentButton}
            onClick={continueToPayment}
          >
            Continue to Payment
          </button>
        </>
      )}
    </div>
  );
}
