import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/module/ShowOrder.module.css";
import { getApiBaseUrl } from "../lib/apiUrl";

export default function ShowOrder() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${getApiBaseUrl()}/api/orders`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch orders");
            }
            setOrders(data);
        } catch (error) {
            console.error("Fetch orders error:", error);
            setError(error.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOrders();
    }, []);
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await axios.patch(
                `${getApiBaseUrl()}/api/orders/${orderId}/status`,
                {
                    orderStatus: newStatus,
                }
            );

            console.log("Order updated:", response.data);

            fetchOrders();
        } catch (error) {
            console.error("Update order status error:", error);
            console.error("Backend:", error.response?.data);
        }
    };
    if (loading) {
        return (
            <div className={styles.container}>
                <h1>Orders</h1>
                <p>Loading orders...</p>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>All Orders</h1>
                    <p>Total Orders: {orders.length}</p>
                </div>
                <button onClick={fetchOrders} className={styles.refreshButton}>
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
                    No orders found.
                </div>
            )}
            {orders.length > 0 && (
                <div className={styles.tableWrapper}>
                    <table className={styles.orderTable}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>City</th>
                                <th>Pincode</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Payment Status</th>
                                <th>Order Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.customer_name}</td>
                                    <td>{order.phone}</td>
                                    <td>{order.address}</td>
                                    <td>{order.city}</td>
                                    <td>{order.pincode}</td>
                                    <td>
                                        ₹{Number(order.total_amount).toFixed(2)}
                                    </td>
                                    <td>{order.payment_method}</td>
                                    <td>
                                        <span
                                            className={`${styles.badge} ${styles[order.payment_status]}`}
                                        >
                                            {order.payment_status === "paid"
                                                ? "Success"
                                                : order.payment_status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={order.order_status}
                                            onChange={(e) =>
                                                updateOrderStatus(
                                                    order.id,
                                                    e.target.value
                                                )
                                            }
                                            className={styles.statusSelect}
                                        >
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="confirmed">
                                                Confirmed
                                            </option>
                                            <option value="preparing">
                                                Preparing
                                            </option>
                                            <option value="out_for_delivery">
                                                Out for Delivery
                                            </option>
                                            <option value="delivered">
                                                Delivered
                                            </option>
                                            <option value="cancelled">
                                                Cancelled
                                            </option>
                                        </select>
                                    </td>
                                    <td>
                                        {new Date(
                                            order.created_at
                                        ).toLocaleString("en-IN")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}