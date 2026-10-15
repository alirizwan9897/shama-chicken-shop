
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import DeliveryAddress from "../components/Delivery/Address";
import styles from "../styles/module/Checkout.module.css";

export default function Checkout() {
    const router = useRouter();

    const [address, setAddress] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const buyNowProduct = localStorage.getItem("buy-now-product");
            const savedAddress = localStorage.getItem("delivery-address");

            if (!buyNowProduct) {
                router.replace("/products");
                return;
            }

            setProduct(JSON.parse(buyNowProduct));

            if (savedAddress) {
                setAddress(JSON.parse(savedAddress));
            }
        } catch (error) {
            console.error("Checkout loading error:", error);
            router.replace("/products");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const handleAddressConfirmed = (deliveryAddress) => {
        setAddress(deliveryAddress);

        localStorage.setItem(
            "delivery-address",
            JSON.stringify(deliveryAddress)
        );

        router.push("/payment");
    };

    const goToPayment = () => {
        if (!address) {
            alert("Please confirm your delivery address.");
            return;
        }

        router.push("/payment");
    };

    if (loading) {
        return <p className={styles.loading}>Loading checkout...</p>;
    }

    if (!product) {
        return <p className={styles.loading}>Returning to the menu...</p>;
    }

    return (
        <div className={styles.checkout}>
            <header className={styles.header}>
                <p className={styles.eyebrow}>ALMOST THERE</p>
                <h1 className={styles.title}>Checkout</h1>
                <p className={styles.subtitle}>Confirm where you would like your order delivered.</p>
                <div className={styles.steps} aria-label="Checkout progress">
                    <span className={styles.activeStep}>
                        <span className={styles.stepNumber}>1</span> Delivery
                    </span>
                    <span className={styles.stepDivider} aria-hidden="true" />
                    <span>2 Payment</span>
                </div>
            </header>

            <div className={styles.content}>
                <section className={styles.deliverySection} aria-labelledby="delivery-heading">
                    {!address ? (
                        <DeliveryAddress
                            onAddressConfirmed={handleAddressConfirmed}
                        />
                    ) : (
                        <>
                            <div className={styles.sectionHeading}>
                                <span className={styles.sectionNumber}>1</span>
                                <div>
                                    <h2 id="delivery-heading">Delivery address</h2>
                                    <p>Make sure your details are correct.</p>
                                </div>
                            </div>
                            <div className={styles.addressPanel}>
                                <p className={styles.addressName}>{address.name}</p>
                                <p className={styles.addressPhone}>{address.phone}</p>
                                {[address.house, address.street].filter(Boolean).length > 0 && (
                                    <p className={styles.addressText}>
                                        {[address.house, address.street].filter(Boolean).join(", ")}
                                    </p>
                                )}
                                <p className={styles.addressText}>
                                    {[address.city, address.state].filter(Boolean).join(", ")}
                                    {address.pincode ? ` - ${address.pincode}` : ""}
                                </p>
                                {address.landmark && (
                                    <p className={styles.addressNote}>Near {address.landmark}</p>
                                )}
                                <div className={styles.addressActions}>
                                    <button
                                        className={styles.changeButton}
                                        onClick={() => setAddress(null)}
                                    >
                                        Change address
                                    </button>
                                    <button
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

                <aside className={styles.summaryPanel} aria-labelledby="summary-title">
                    <h2 id="summary-title" className={styles.summaryTitle}>Your order</h2>
                    <div className={styles.productRow}>
                        <Image
                            className={styles.productImage}
                            src={product.image}
                            alt={product.name || "Your selected meal"}
                            width={68}
                            height={68}
                        />
                        <div>
                            <p className={styles.productName}>{product.name}</p>
                            <p className={styles.productHint}>Quantity: 1</p>
                            <p className={styles.productPrice}>
                                ₹{Number(product.price || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <strong>₹{Number(product.price || 0).toFixed(2)}</strong>
                    </div>
                    <p className={styles.secureNote}>Delivery and payment details are confirmed in the next step.</p>
                </aside>
            </div>
        </div>
    );
}