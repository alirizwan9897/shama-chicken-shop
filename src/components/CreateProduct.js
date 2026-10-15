import { useState } from "react";
import axios from "axios";
import { getApiBaseUrl } from "../lib/apiUrl";

export default function CreateProduct() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        original_price: "",
        image: null,
        category: "",
    });

    const [loading, setLoading] = useState(false);

    /* =========================
       HANDLE INPUT CHANGE
    ========================= */

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "image" ? files?.[0] || null : value,
        }));
    };

    /* =========================
       CREATE PRODUCT
    ========================= */

    const handleProductSubmit = async (event) => {
        event.preventDefault();

        // Check image
        if (!formData.image) {
            alert("Please select a product image");
            return;
        }

        // Check price
        const price = Number(formData.price);

        if (Number.isNaN(price) || price < 0) {
            alert("Please enter a valid price");
            return;
        }

        // Check original price
        const originalPrice =
            formData.original_price === ""
                ? null
                : Number(formData.original_price);

        if (
            originalPrice !== null &&
            (Number.isNaN(originalPrice) || originalPrice < 0)
        ) {
            alert("Please enter a valid original price");
            return;
        }

        // Original price should be greater than selling price
        if (
            originalPrice !== null &&
            originalPrice < price
        ) {
            alert(
                "Original price must be greater than or equal to selling price"
            );
            return;
        }

        try {
            setLoading(true);

            /* =========================
               FORM DATA
            ========================= */

            const data = new FormData();

            data.append("name", formData.name.trim());

            data.append(
                "description",
                formData.description.trim()
            );

            data.append(
                "price",
                formData.price
            );

            // Original price
            if (formData.original_price !== "") {
                data.append(
                    "original_price",
                    formData.original_price
                );
            }

            data.append(
                "category",
                formData.category
            );

            // Actual image file
            data.append(
                "image",
                formData.image
            );

            /* =========================
               DEBUG LOG
            ========================= */

            console.log("Sending product:", {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                original_price: formData.original_price,
                category: formData.category,

                imageName: formData.image?.name,
                imageSize: formData.image?.size,
                imageType: formData.image?.type,
            });

            /* =========================
               API URL
            ========================= */

            const API_URL = getApiBaseUrl();

            console.log("API_URL:", API_URL);

            /* =========================
               API REQUEST
            ========================= */

            const response = await axios.post(
                `${API_URL}/api/products/create`,
                data
            );

            console.log(
                "Product created:",
                response.data
            );

            alert("Product created successfully!");

            /* =========================
               RESET FORM
            ========================= */

            setFormData({
                name: "",
                description: "",
                price: "",
                original_price: "",
                image: null,
                category: "",
            });

            // Reset file input
            const imageInput =
                document.getElementById("product-image");

            if (imageInput) {
                imageInput.value = "";
            }

        } catch (error) {
            console.error(
                "Create product failed:",
                error
            );

            console.error(
                "Backend error:",
                error.response?.data
            );

            alert(
                error.response?.data?.error ||
                error.response?.data?.details ||
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
            {/* =========================
          HEADER
      ========================= */}

            <div className="create-product-header">
                <h2>Create Product</h2>
            </div>

            <div className="create-product-grid">

                {/* =========================
            PRODUCT NAME
        ========================= */}

                <div className="form-field">
                    <label htmlFor="product-name">
                        Product Name
                    </label>

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

                {/* =========================
            DESCRIPTION
        ========================= */}

                <div className="form-field">
                    <label htmlFor="product-description">
                        Description
                    </label>

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

                {/* =========================
            PRICE ROW
        ========================= */}

                <div className="form-row">

                    {/* SELLING PRICE */}

                    <div className="form-field">
                        <label htmlFor="product-price">
                            Selling Price
                        </label>

                        <input
                            id="product-price"
                            className="form-input"
                            type="number"
                            name="price"
                            placeholder="Selling price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    {/* ORIGINAL PRICE */}

                    <div className="form-field">
                        <label htmlFor="product-original-price">
                            Original Price
                        </label>

                        <input
                            id="product-original-price"
                            className="form-input"
                            type="number"
                            name="original_price"
                            placeholder="Original price"
                            value={formData.original_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>

                </div>

                {/* =========================
            CATEGORY
        ========================= */}

                <div className="form-field">
                    <label htmlFor="product-category">
                        Category
                    </label>

                    <select
                        id="product-category"
                        className="form-select"
                        name="category"
                        value={formData.category}
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

                {/* =========================
            PRODUCT IMAGE
        ========================= */}

                <div className="form-field">
                    <label htmlFor="product-image">
                        Product Image
                    </label>

                    <input
                        id="product-image"
                        className="form-file"
                        type="file"
                        name="image"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleChange}
                        required
                    />

                    {formData.image && (
                        <small
                            style={{
                                display: "block",
                                marginTop: "8px",
                                color: "#666",
                            }}
                        >
                            Selected: {formData.image.name}
                        </small>
                    )}
                </div>

            </div>

            {/* =========================
          BUTTON
      ========================= */}

            <div className="form-actions">
                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading
                        ? "Uploading..."
                        : "Create Product"}
                </button>
            </div>

        </form>
    );
}