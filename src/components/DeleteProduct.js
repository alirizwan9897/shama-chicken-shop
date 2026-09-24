import { useState } from "react";
import styles from "../styles/module/DeleteProduct.module.css";
const API_URL = "https://shama-chicken-shop.vercel.app";
export default function DeleteProduct() {
    const [productId, setProductId] = useState("");
    const [productData, setProduct] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    // SEARCH PRODUCT BY ID
    const searchProduct = async () => {
        if (!productId) {
            setMessage("Please enter Product ID");
            return;
        }
        setLoading(true);
        setMessage("");
        setProduct(null);
        try {
            const response = await fetch(
                `${API_URL}/api/products/${productId}`
            );
            const data = await response.json();
            console.log("Product response:", data);
            // Product does not exist / was already deleted
            if (response.status === 404) {
                setProduct(null);
                setMessage("Product not found. It may have already been deleted.");
                return;
            }
            // Other API errors
            if (!response.ok) {
                setProduct(null);
                setMessage(
                    data.error || data.message || "Failed to find product"
                );
                return;
            }

            setProduct(data);
            setMessage("Product found successfully!");
        } catch (error) {
            console.error("Search product error:", error);
            setProduct(null);
            setMessage(
                error.message || "Product not found"
            );
        } finally {
            setLoading(false);
        }
    };
    // DELETE PRODUCT
    const deleteProductData = async (e) => {
        e.preventDefault();
        if (!productData) {
            return;
        }
        const confirmed = window.confirm(
            `Are you sure you want to delete "${productData.name}"?`
        );
        if (!confirmed) {
            return;
        }
        setDeleting(true);
        setMessage("");
        try {
            console.log(
                "Deleting product ID:",
                productData.id
            );
            const response = await fetch(
                `${API_URL}/api/products/${productData.id}`,
                {
                    method: "DELETE",
                }
            );
            const data = await response.json();
            console.log("Delete response:", data);
            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Failed to delete product"
                );
            }
            setMessage(
                "Product deleted successfully!"
            );
            // Clear product after successful delete
            setProduct(null);
            // Clear ID
            setProductId("");
        } catch (error) {
            console.error(
                "Delete product error:",
                error
            );
            setMessage(
                error.message ||
                "Failed to delete product"
            );
        } finally {
            setDeleting(false);
        }
    };
    return (
        <div className={styles.container}>
            {/* Heading */}
            <h1 className={styles.title}>
                Delete Product
            </h1>

            {/* =========================
          SEARCH
      ========================= */}
            <div className={styles.searchBox}>
                <input
                    type="number"
                    placeholder="Enter Product ID"
                    value={productId}
                    onChange={(e) =>
                        setProductId(e.target.value)
                    }
                    className={styles.searchInput}
                />
                <button
                    onClick={searchProduct}
                    className={styles.searchButton}
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>
            {/* Message */}
            {message && (
                <p className={styles.message}>
                    {message}
                </p>
            )}
            {/* =========================
          PRODUCT DETAILS
      ========================= */}
            {productData && (
                <form
                    onSubmit={deleteProductData}
                    className={styles.form}
                >
                    {/* Product ID */}
                    <div className={styles.formGroup}>
                        <label>Product ID</label>
                        <input
                            value={productData.id}
                            disabled
                        />
                    </div>
                    {/* Product Name */}
                    <div className={styles.formGroup}>
                        <label>Product Name</label>
                        <input
                            type="text"
                            value={productData.name || ""}
                            disabled
                        />
                    </div>
                    {/* Description */}
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            value={productData.description || ""}
                            disabled
                            rows="4"
                        />
                    </div>
                    {/* Price */}
                    <div className={styles.formGroup}>
                        <label>Price</label>
                        <input
                            type="number"
                            value={productData.price || ""}
                            disabled
                        />
                    </div>
                    {/* Category */}
                    <div className={styles.formGroup}>
                        <label>Category</label>
                        <input
                            type="text"
                            value={productData.category || ""}
                            disabled
                        />
                    </div>
                    {/* Image Preview */}
                    <div className={styles.preview}>
                        <p>Image Preview</p>
                        <img
                            src={productData.image}
                            alt={productData.name}
                        />
                    </div>
                    {/* Delete Button */}
                    <button
                        type="submit"
                        className={styles.updateButton}
                        disabled={deleting}
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete Product"}
                    </button>
                </form>
            )}
        </div>
    );
}