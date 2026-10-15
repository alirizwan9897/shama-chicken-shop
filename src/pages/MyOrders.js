import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import styles from "../styles/module/MyOrders.module.css";
import { getApiBaseUrl } from "../lib/apiUrl";

export default function MyOrders() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/signin");
            return;
        }
        fetchMyOrders();
    }, [user, authLoading]);
    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(
                `${getApiBaseUrl()}/api/orders/user/${user.id}`
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to fetch your orders"
                );
            }
            setOrders(data);
        } catch (error) {
            console.error("My orders error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <h1>My Orders</h1>
                <p>Loading orders...</p>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>My Orders</h1>
                    <p>
                        Welcome, {user?.name}
                    </p>
                </div>
                <button
                    className={styles.refreshButton}
                    onClick={fetchMyOrders}
                >
                    Refresh
                </button>
            </div>
            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}
            {!error && orders.length === 0 && (
                <div className={styles.empty}>
                    <h3>No orders found</h3>
                    <p>You haven't placed any orders yet.</p>
                    <button
                        onClick={() => router.push("/products")}
                        className={styles.shopButton}
                    >
                        Start Shopping
                    </button>
                </div>
            )}
            {orders.length > 0 && (
                <div className={styles.ordersList}>
                    {orders.map((order) => (
                        <div
                            className={styles.orderCard}
                            key={order.id}
                        >
                            <div className={styles.orderTop}>
                                <div>
                                    <h3>Order #{order.id}</h3>
                                    <p>
                                        {new Date(
                                            order.created_at
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <span
                                    className={`${styles.status} ${styles[order.order_status]
                                        }`}
                                >
                                    {order.order_status
                                        .replaceAll("_", " ")
                                        .toUpperCase()}
                                </span>
                            </div>
                            <div className={styles.orderInfo}>
                                <div>
                                    <strong>Total</strong>
                                    <span>
                                        ₹
                                        {Number(
                                            order.total_amount
                                        ).toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <strong>Payment</strong>
                                    <span>
                                        {order.payment_method}
                                    </span>
                                </div>
                                <div>
                                    <strong>Payment Status</strong>
                                    <span>
                                        {order.payment_status}
                                    </span>
                                </div>
                                <div>
                                    <strong>City</strong>
                                    <span>
                                        {order.city}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.address}>
                                <strong>Delivery Address</strong>
                                <p>
                                    {order.address}, {order.city},{" "}
                                    {order.state}, {order.pincode}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}