import { useState } from "react";
import axios from "axios";

export default function CreateProduct() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        image: null,
        category: "",
    });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "image" ? files[0] : value,
        }));
    };
    const handleProductSubmit = async (event) => {
        event.preventDefault();
        if (!formData.image) {
            alert("Please select a product image");
            return;
        }
        try {
            setLoading(true);
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("category", formData.category);
            data.append("image", formData.image);
            console.log("Sending product:", {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                category: formData.category,
                image: formData.image.name,
            });
            const response = await axios.post(
                "https://shama-chicken-shop.vercel.app/api/products/create",
                data
            );
            console.log("Product created:", response.data);
            alert("Product created successfully!");
            // Reset form
            setFormData({
                name: "",
                description: "",
                price: "",
                image: null,
                category: "",
            });
            // Reset file input
            document.getElementById("product-image").value = "";
        } catch (error) {
            console.error("Create product failed:", error);
            console.error(
                "Backend error:",
                error.response?.data
            );
            alert(
                error.response?.data?.error ||
                "Failed to create product"
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <form
            className="create-product-form"
            onSubmit={handleProductSubmit}
        >
            <div className="create-product-header">
                <h2>Create Product</h2>
            </div>
            <div className="create-product-grid">
                <div className="form-field">
                    <label htmlFor="product-name">Product Name</label>
                    <input
                        id="product-name"
                        className="form-input"
                        type="text"
                        name="name"
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="product-description">Description</label>
                    <textarea
                        id="product-description"
                        className="form-textarea"
                        name="description"
                        placeholder="Write a short product description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                    />
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="product-price">Price</label>
                        <input
                            id="product-price"
                            className="form-input"
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="product-category">Category</label>
                        <select
                            id="product-category"
                            className="form-select"
                            name="category"
                            value={formData.category}
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
                </div>
                <div className="form-field">
                    <label htmlFor="product-image">Product Image</label>
                    <input
                        id="product-image"
                        className="form-file"
                        type="file"
                        name="image"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <div className="form-actions">
                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? "Uploading..." : "Create Product"}
                </button>
            </div>
        </form>
    );
}