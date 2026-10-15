
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "../lib/apiUrl";
import styles from "../styles/module/UpdateProduct.module.css";

export default function UpdateProduct() {
    const [productId, setProductId] = useState("");
    const [product, setProduct] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const API_URL = getApiBaseUrl();

    // Search product by ID
    const searchProduct = async () => {
        if (!productId.trim() || !/^\d+$/.test(productId) ||
            Number(productId) <= 0) {
            setMessage("Please enter a valid Product ID");
            return;
        }

        setLoading(true);
        setMessage("");
        setProduct(null);
        setNewImage(null);

        const fileInput = document.getElementById("product-image");
        if (fileInput) fileInput.value = "";

        try {
            const response = await fetch(
                `${API_URL}/api/products/${productId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Product not found"
                );
            }

            // Support APIs returning either the product or { product: ... }
            const foundProduct = data.product || data;

            setProduct({
                ...foundProduct,
                price: foundProduct.price ?? "",
                original_price: foundProduct.original_price ?? "",
            });

            setMessage("Product found successfully!");
        } catch (error) {
            console.error("Search product error:", error);
            setMessage(error.message || "Failed to find product");
        } finally {
            setLoading(false);
        }
    };

    // Handle text and price inputs
    const handleChange = (event) => {
        const { name, value } = event.target;

        setProduct((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Validate and select a replacement image
    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setMessage("Choose a JPG, PNG or WebP image");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5 MB");
            event.target.value = "";
            return;
        }

        setNewImage(file);
        setMessage("New image selected");
    };

    // Update product
    const updateProductData = async (event) => {
        event.preventDefault();

        if (!product) return;

        const price = Number(product.price);
        const originalPrice =
            product.original_price === "" ||
                product.original_price === null
                ? null
                : Number(product.original_price);

        if (!Number.isFinite(price) || price < 0) {
            setMessage("Enter a valid selling price");
            return;
        }

        if (
            originalPrice !== null &&
            (!Number.isFinite(originalPrice) || originalPrice < 0)
        ) {
            setMessage("Enter a valid original price or leave it empty");
            return;
        }

        if (originalPrice !== null && originalPrice < price) {
            setMessage("Original price should be greater than or equal to selling price");
            return;
        }

        setUpdating(true);
        setMessage("");

        try {
            const formData = new FormData();

            formData.append("name", product.name.trim());
            formData.append("description", product.description.trim());
            formData.append("price", String(price));
            formData.append(
                "original_price",
                originalPrice === null ? "" : String(originalPrice)
            );
            formData.append("category", product.category);

            if (newImage) {
                formData.append("image", newImage);
            }

            const response = await fetch(
                `${API_URL}/api/products/${product.id}`,
                {
                    method: "PUT",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Failed to update product"
                );
            }

            const updatedProduct = data.product || data;

            setProduct({
                ...updatedProduct,
                price: updatedProduct.price ?? "",
                original_price: updatedProduct.original_price ?? "",
            });

            setNewImage(null);

            const fileInput = document.getElementById("product-image");
            if (fileInput) fileInput.value = "";

            setMessage("Product updated successfully!");
        } catch (error) {
            console.error("Update product error:", error);
            console.error("Backend response:", error.message);
            setMessage(error.message || "Failed to update product");
        } finally {
            setUpdating(false);
        }
    };

    // Clean up image preview URL
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (!newImage) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(newImage);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [newImage]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Update Product</h1>

            <div className={styles.searchBox}>
                <input
                    type="number"
                    min="1"
                    placeholder="Enter Product ID"
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    className={styles.searchInput}
                />

                <button
                    type="button"
                    onClick={searchProduct}
                    className={styles.searchButton}
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {message && (
                <p className={styles.message} role="status">
                    {message}
                </p>
            )}

            {product && (
                <form onSubmit={updateProductData} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="update-product-id">Product ID</label>
                        <input id="update-product-id" value={product.id} disabled />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="update-product-name">Product Name</label>
                        <input
                            id="update-product-name"
                            type="text"
                            name="name"
                            value={product.name || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="update-product-description">Description</label>
                        <textarea
                            id="update-product-description"
                            name="description"
                            value={product.description || ""}
                            onChange={handleChange}
                            rows={4}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="update-product-price">Selling Price (₹)</label>
                        <input
                            id="update-product-price"
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="update-original-price">
                            Original Price (₹)
                        </label>
                        <input
                            id="update-original-price"
                            type="number"
                            name="original_price"
                            value={product.original_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="Leave empty for no discount"
                        />
                        <small>
                            Original price should be equal to or higher than selling price.
                        </small>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Current Product Image</label>
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name || "Current product"}
                                className={styles.productImage}
                            />
                        ) : (
                            <p>No current image available.</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="product-image">Change Product Image</label>
                        <input
                            id="product-image"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageChange}
                        />

                        {newImage && <p>Selected: {newImage.name}</p>}

                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="New product preview"
                                className={styles.productImage}
                            />
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="update-product-category">Category</label>
                        <select
                            id="update-product-category"
                            name="category"
                            value={product.category || ""}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Grilled">Grilled</option>
                            <option value="Fried">Fried</option>
                            <option value="Tandoori">Tandoori</option>
                            <option value="Curry">Curry</option>
                            <option value="BBQ">BBQ</option>
                            <option value="Specialty">Specialty</option>
                            <option value="Combo">Combo</option>
                            <option value="Biryani">Biryani</option>
                            <option value="Veg">Veg</option>
                            <option value="Chicken Gravy">Chicken Gravy</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className={styles.updateButton}
                        disabled={updating}
                    >
                        {updating ? "Updating..." : "Update Product"}
                    </button>
                </form>
            )}
        </div>
    );
}