
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DeliveryAddress from "../components/Delivery/Address";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/module/Checkout.module.css";

export default function Checkout() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [address, setAddress] = useState(null);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load Buy Now product or multiple cart items
    useEffect(() => {
        if (!router.isReady || authLoading) return;
        if (!user) {
            router.replace({ pathname: "/mobile-signup", query: { next: router.asPath } });
            return;
        }

        try {
            const buyNowProduct = localStorage.getItem("buy-now-product");
            const savedCart = localStorage.getItem("checkout-cart");

            const isNewAddress = router.query.newAddress === "1";

            if (buyNowProduct) {
                const item = JSON.parse(buyNowProduct);

                setCheckoutItems([
                    {
                        ...item,
                        quantity: Number(item.quantity) || 1,
                    },
                ]);
            } else if (savedCart) {
                const items = JSON.parse(savedCart);

                if (!Array.isArray(items) || items.length === 0) {
                    router.replace("/products");
                    return;
                }

                setCheckoutItems(
                    items.map((item) => ({
                        ...item,
                        quantity: Number(item.quantity) || 1,
                    }))
                );
            } else {
                router.replace("/products");
                return;
            }

            if (isNewAddress) {
                // New Buy Now: ask for a fresh address
                setAddress(null);
                localStorage.removeItem("checkout-address");
            } else {
                // Normal checkout: load previously saved address
                const savedAddress = localStorage.getItem("delivery-address");

                setAddress(
                    savedAddress ? JSON.parse(savedAddress) : null
                );
            }
        } catch (error) {
            console.error("Checkout loading error:", error);
            setAddress(null);
        } finally {
            setLoading(false);
        }
    }, [router.isReady, router.query.newAddress, router.asPath, user, authLoading]);
    // Calculate total for all products
    const checkoutTotal = checkoutItems.reduce(
        (sum, item) =>
            sum +
            (Number(item.price) || 0) *
            (Number(item.quantity) || 1),
        0
    );

    // Save address and continue to payment
    const handleAddressConfirmed = (deliveryAddress) => {
        try {
            localStorage.setItem(
                "delivery-address",
                JSON.stringify(deliveryAddress)
            );
            localStorage.setItem(
                "checkout-total",
                String(checkoutTotal)
            );
            setAddress(deliveryAddress);
            router.push("/payment");
        } catch (error) {
            console.error("Saving delivery address failed:", error);
            alert("Unable to save address. Please try again.");
        }
    };
    const goToPayment = () => {
        if (!address) {
            alert("Please confirm your delivery address.");
            return;
        }

        localStorage.setItem(
            "checkout-total",
            String(checkoutTotal)
        );

        router.push("/payment");
    };

    if (loading) {
        return <p className={styles.loading}>Loading checkout...</p>;
    }

    if (checkoutItems.length === 0) {
        return (
            <p className={styles.loading}>
                No items found. Returning to the menu...
            </p>
        );
    }

    return (
        <div className={styles.checkout}>
            <header className={styles.header}>
                <p className={styles.eyebrow}>ALMOST THERE</p>

                <h1 className={styles.title}>Checkout</h1>

                <p className={styles.subtitle}>
                    Confirm where you would like your order delivered.
                </p>

                <div
                    className={styles.steps}
                    aria-label="Checkout progress"
                >
                    <span className={styles.activeStep}>
                        <span className={styles.stepNumber}>1</span>
                        {" "}Delivery
                    </span>

                    <span
                        className={styles.stepDivider}
                        aria-hidden="true"
                    />

                    <span>2 Payment</span>
                </div>
            </header>

            <div className={styles.content}>
                <section
                    className={styles.deliverySection}
                    aria-labelledby="delivery-heading"
                >
                    {!address ? (
                        <DeliveryAddress
                            onAddressConfirmed={handleAddressConfirmed}
                        />
                    ) : (
                        <>
                            <div className={styles.sectionHeading}>
                                <span className={styles.sectionNumber}>
                                    1
                                </span>

                                <div>
                                    <h2 id="delivery-heading">
                                        Delivery address
                                    </h2>

                                    <p>
                                        Make sure your details are correct.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.addressPanel}>
                                <p className={styles.addressName}>
                                    {address.name}
                                </p>

                                <p className={styles.addressPhone}>
                                    {address.phone}
                                </p>

                                <p className={styles.addressText}>
                                    {[address.house, address.street]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>

                                <p className={styles.addressText}>
                                    {[address.city, address.state]
                                        .filter(Boolean)
                                        .join(", ")}
                                    {address.pincode
                                        ? ` - ${address.pincode}`
                                        : ""}
                                </p>

                                {address.landmark && (
                                    <p className={styles.addressNote}>
                                        Near {address.landmark}
                                    </p>
                                )}

                                <div className={styles.addressActions}>
                                    <button
                                        type="button"
                                        className={styles.changeButton}
                                        onClick={() => setAddress(null)}
                                    >
                                        Change address
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.continueButton}
                                        onClick={goToPayment}
                                    >
                                        Continue to payment
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                <aside
                    className={styles.summaryPanel}
                    aria-labelledby="summary-title"
                >
                    <h2
                        id="summary-title"
                        className={styles.summaryTitle}
                    >
                        Your order
                    </h2>

                    {checkoutItems.map((item, index) => (
                        <div
                            className={styles.productRow}
                            key={`${item.id || item.name}-${index}`}
                        >
                            {item.image &&
                                !item.image.startsWith("data:") && (
                                    <img
                                        className={styles.productImage}
                                        src={item.image}
                                        alt={item.name || "Product"}
                                        width="68"
                                        height="68"
                                    />
                                )}

                            <div>
                                <p className={styles.productName}>
                                    {item.name}
                                </p>

                                <p className={styles.productHint}>
                                    Quantity: {Number(item.quantity) || 1}
                                </p>

                                <p className={styles.productPrice}>
                                    ₹
                                    {(
                                        (Number(item.price) || 0) *
                                        (Number(item.quantity) || 1)
                                    ).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}

                    <div className={styles.totalRow}>
                        <span>Total</span>

                        <strong>
                            ₹
                            {checkoutTotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                    </div>

                    <p className={styles.secureNote}>
                        Delivery and payment details are confirmed in the
                        next step.
                    </p>
                </aside>
            </div>
        </div>
    );
}
