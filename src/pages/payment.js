import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/module/Payment.module.css";
import { getApiBaseUrl } from "../lib/apiUrl";

export default function Payment() {
    const router = useRouter();
    const [address, setAddress] = useState(null);
    const [product, setProduct] = useState(null);
    const { user, loading: authLoading } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // --------------------------------
    // Load address and product
    // --------------------------------
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace({ pathname: "/mobile-signup", query: { next: router.asPath } });
            return;
        }
        const savedAddress =
            localStorage.getItem("delivery-address");
        const savedProduct =
            localStorage.getItem("buy-now-product");
        if (savedAddress) {
            try {
                setAddress(JSON.parse(savedAddress));
            } catch (error) {
                console.error(
                    "Invalid delivery address:",
                    error
                );
            }
        }
        if (savedProduct) {
            try {
                setProduct(JSON.parse(savedProduct));
            } catch (error) {
                console.error(
                    "Invalid product data:",
                    error
                );
            }
        }
    }, [authLoading, user, router.asPath]);
    // --------------------------------
    // Place Order
    // --------------------------------
    const placeOrder = async () => {
        if (!user) {
            router.push({ pathname: "/mobile-signup", query: { next: router.asPath } });
            return;
        }
        if (!address) {
            alert("Delivery address not found");
            return;
        }
        if (!product) {
            alert("Product not found");
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const orderData = {
                userId: user?.id || null,
                customerName: address.name,
                phone: address.phone,
                address: `${address.house}, ${address.street}`,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                latitude: address.latitude || null,
                longitude: address.longitude || null,
                paymentMethod,
                items: [
                    {
                        productId: product.id,
                        quantity: 1,
                    },
                ],
            };
            const response = await fetch(
                `${getApiBaseUrl()}/api/orders`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        orderData
                    ),
                }
            );
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.details ||
                    data?.error ||
                    `Order service returned ${response.status}.`
                );
            }

            if (!data?.order?.id) {
                throw new Error("The order service returned no order confirmation.");
            }

            localStorage.setItem(
                "last-order",
                JSON.stringify(data.order)
            );
            await router.push(`/order-success?orderId=${data.order.id}`);
        } catch (error) {
            alert(
                error.message ||
                "Unable to place order"
            );
        } finally {
            setIsSubmitting(false);
        }
    };
    // --------------------------------
    // Calculate total
    // --------------------------------
    const total = product
        ? Number(product.price)
        : 0;
    // --------------------------------
    // UI
    // --------------------------------
    return (
        <div className={styles.paymentContainer}>
            <h1 className={styles.title}>
                Payment
            </h1>
            <div className={styles.content}>
                {/* =========================
                    PRODUCT
                ========================== */}
                <div className={styles.card}>
                    <h2>
                        Order Summary
                    </h2>
                    {product ? (
                        <>
                            <p
                                className={
                                    styles.productName
                                }
                            >
                                {product.name}
                            </p>
                            <p>
                                Quantity: 1
                            </p>
                            <p
                                className={
                                    styles.price
                                }
                            >
                                ₹{product.price}
                            </p>
                        </>
                    ) : (
                        <p>
                            Loading product...
                        </p>
                    )}
                </div>
                {/* =========================
                    DELIVERY ADDRESS
                ========================== */}
                <div className={styles.card}>
                    <h2>
                        Delivery Address
                    </h2>
                    {address ? (
                        <div
                            className={
                                styles.address
                            }
                        >
                            <p>
                                <strong>
                                    {address.name}
                                </strong>
                            </p>
                            <p>
                                Phone:{" "}
                                {address.phone}
                            </p>
                            <p>
                                {address.house}
                            </p>
                            <p>
                                {address.street}
                            </p>
                            <p>
                                {address.city},{" "}
                                {address.state}
                            </p>
                            <p>
                                Pincode:{" "}
                                {address.pincode}
                            </p>
                            {address.landmark && (
                                <p>
                                    Landmark:{" "}
                                    {address.landmark}
                                </p>
                            )}
                            {address.latitude &&
                                address.longitude && (
                                    <p>
                                        📍 Location
                                        selected
                                    </p>
                                )}
                        </div>
                    ) : (
                        <p>
                            Loading address...
                        </p>
                    )}
                </div>
                {/* =========================
                    PAYMENT
                ========================== */}
                <div
                    className={
                        styles.paymentCard
                    }
                >
                    <h2>
                        Payment Method
                    </h2>
                    {/* COD */}
                    <label
                        className={
                            styles.paymentOption
                        }
                    >
                        <input
                            type="radio"
                            name="payment"
                            value="COD"
                            checked={
                                paymentMethod ===
                                "COD"
                            }
                            onChange={(e) =>
                                setPaymentMethod(
                                    e.target.value
                                )
                            }
                        />
                        <span
                            className={
                                styles.paymentText
                            }
                        >
                            Cash on Delivery
                        </span>
                    </label>
                    {/* Online */}
                    <label
                        className={
                            styles.paymentOption
                        }
                    >
                        <input
                            type="radio"
                            name="payment"
                            value="ONLINE"
                            checked={
                                paymentMethod ===
                                "ONLINE"
                            }
                            onChange={(e) =>
                                setPaymentMethod(
                                    e.target.value
                                )
                            }
                        />
                        <span
                            className={
                                styles.paymentText
                            }
                        >
                            Online Payment
                        </span>
                    </label>
                    {/* =========================
                        TOTAL
                    ========================== */}
                    <div
                        className={
                            styles.totalBox
                        }
                    >
                        <span
                            className={
                                styles.totalLabel
                            }
                        >
                            Total
                        </span>
                        <span
                            className={
                                styles.totalAmount
                            }
                        >
                            ₹{total}
                        </span>
                    </div>
                    {/* =========================
                        BUTTON
                    ========================== */}
                    <button
                        type="button"
                        className={
                            styles.placeOrderButton
                        }
                        onClick={placeOrder}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Placing order..."
                            : paymentMethod === "COD"
                                ? "Place Order"
                                : "Pay Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}