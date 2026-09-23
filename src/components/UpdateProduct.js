import { useState } from "react";
import styles from "../styles/module/UpdateProduct.module.css";
const API_URL = "http://localhost:4000";
export default function UpdateProduct() {
    const [productId, setProductId] = useState("");
    const [product, setProduct] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    // SEARCH PRODUCT BY ID
    const searchProduct = async () => {
        if (!productId) {
            setMessage("Please enter Product ID");
            return;
        }
        setLoading(true);
        setMessage("");
        setProduct(null);
        setNewImage(null);
        try {
            const response = await fetch(
                `${API_URL}/api/products/${productId}`
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || "Product not found");
            }
            console.log("Product found:", data);
            setProduct(data);
            setMessage("Product found successfully!");
        } catch (error) {
            console.error("Search product error:", error);
            setProduct(null);
            setMessage(error.message || "Product not found");
        } finally {
            setLoading(false);
        }
    };
    // HANDLE TEXT INPUT
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    // HANDLE NEW IMAGE
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        // Check image type
        if (!file.type.startsWith("image/")) {
            setMessage("Please select a valid image file");
            return;
        }
        // 5 MB limit
        if (file.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5 MB");
            return;
        }
        setNewImage(file);
        setMessage("New image selected");
    };
    // UPDATE PRODUCT
    const updateProductData = async (e) => {
        e.preventDefault();
        if (!product) {
            return;
        }
        setUpdating(true);
        setMessage("");
        try {
            const formData = new FormData();
            formData.append("name", product.name);
            formData.append("description", product.description);
            formData.append("price", Number(product.price));
            formData.append("category", product.category);
            // Only send image if user selected a new image
            if (newImage) {
                formData.append("image", newImage);
            }
            console.log("Updating product:", {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                newImage: newImage ? newImage.name : "Old image",
            });
            const response = await fetch(
                `${API_URL}/api/products/${product.id}`,
                {
                    method: "PUT",
                    body: formData,
                }
            );
            const data = await response.json();
            console.log("Update response:", data);
            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Failed to update product"
                );
            }
            setProduct(data.product);
            setNewImage(null);
            setMessage("Product updated successfully!");
            // Clear file input
            const fileInput = document.getElementById("product-image");
            if (fileInput) {
                fileInput.value = "";
            }
        } catch (error) {
            console.error("Update product error:", error);
            setMessage(
                error.message || "Failed to update product"
            );
        } finally {
            setUpdating(false);
        }
    };
    return (
        <div className={styles.container}>
            {/* Heading */}
            <h1 className={styles.title}>
                Update Product
            </h1>
            {/* =========================
          SEARCH SECTION
      ========================= */}
            <div className={styles.searchBox}>
                <input
                    type="number"
                    placeholder="Enter Product ID"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
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
            {product && (
                <form
                    onSubmit={updateProductData}
                    className={styles.form}
                >
                    {/* Product ID */}
                    <div className={styles.formGroup}>
                        <label>Product ID</label>
                        <input
                            value={product.id}
                            disabled
                        />
                    </div>
                    {/* Product Name */}
                    <div className={styles.formGroup}>
                        <label>Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={product.name || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* Description */}
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={product.description || ""}
                            onChange={handleChange}
                            rows="4"
                            required
                        />
                    </div>
                    {/* Price */}
                    <div className={styles.formGroup}>
                        <label>Price</label>
                        <input
                            type="number"
                            name="price"
                            value={product.price || ""}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>
                    {/* Current Image */}
                    <div className={styles.formGroup}>
                        <label>Current Image</label>
                        <img
                            src={product.image}
                            alt={product.name}
                            style={{
                                width: "200px",
                                height: "150px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                marginTop: "10px",
                            }}
                        />
                    </div>
                    {/* New Image */}
                    <div className={styles.formGroup}>
                        <label>
                            Change Product Image
                        </label>
                        <input
                            id="product-image"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageChange}
                        />
                        {newImage && (
                            <p>
                                Selected: {newImage.name}
                            </p>
                        )}
                    </div>
                    {/* Category */}
                    <div className={styles.formGroup}>
                        <label>Category</label>
                        <select
                            name="category"
                            value={product.category || ""}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Category
                            </option>
                            <option value="Grilled">
                                Grilled
                            </option>
                            <option value="Fried">
                                Fried
                            </option>
                            <option value="Tandoori">
                                Tandoori
                            </option>
                            <option value="Curry">
                                Curry
                            </option>
                            <option value="BBQ">
                                BBQ
                            </option>
                            <option value="Specialty">
                                Specialty
                            </option>
                            <option value="Combo">
                                Combo
                            </option>
                            <option value="Biryani">
                                Biryani
                            </option>
                            <option value="Veg">
                                Veg
                            </option>
                            <option value="Chicken Gravy">
                                Chicken Gravy
                            </option>
                        </select>
                    </div>
                    {/* New Image Preview */}
                    {newImage && (
                        <div className={styles.preview}>
                            <p>New Image Preview</p>
                            <img
                                src={URL.createObjectURL(newImage)}
                                alt="New product"
                                style={{
                                    width: "200px",
                                    height: "150px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                }}
                            />
                        </div>
                    )}
                    {/* Update Button */}
                    <button
                        type="submit"
                        className={styles.updateButton}
                        disabled={updating}
                    >
                        {updating
                            ? "Updating..."
                            : "Update Product"}
                    </button>
                </form>
            )}
        </div>
    );
}