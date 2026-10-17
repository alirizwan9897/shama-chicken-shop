import Link from "next/link";
import { useRouter } from "next/router";

export default function OrderSuccess() {
    const router = useRouter();
    const { orderId } = router.query;

    return (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 20px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    textAlign: "center",
                    background: "#fff",
                    padding: "40px 25px",
                    borderRadius: "15px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                }}
            >
                <div
                    style={{
                        width: "70px",
                        height: "70px",
                        margin: "0 auto 20px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "40px",
                    }}
                >
                    ✓
                </div>

                <h1 style={{ color: "#16a34a", marginBottom: "10px" }}>
                    Order Placed Successfully!
                </h1>

                <p style={{ fontSize: "17px", color: "#555" }}>
                    Thank you for ordering from Shama Chicken Shop.
                </p>

                {orderId && (
                    <p style={{ fontWeight: "600", marginTop: "20px" }}>
                        Order ID: #{orderId}
                    </p>
                )}

                <p style={{ color: "#666" }}>
                    Your order has been received and will be prepared soon.
                </p>

                <div style={{ marginTop: "25px" }}>
                    <Link
                        href="/"
                        style={{
                            display: "inline-block",
                            background: "#16a34a",
                            color: "#fff",
                            padding: "12px 22px",
                            borderRadius: "7px",
                            textDecoration: "none",
                            marginRight: "10px",
                        }}
                    >
                        Continue Shopping
                    </Link>

                    <Link
                        href="/MyOrders"
                        style={{
                            display: "inline-block",
                            background: "#2563eb",
                            color: "#fff",
                            padding: "12px 22px",
                            borderRadius: "7px",
                            textDecoration: "none",
                        }}
                    >
                        My Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}