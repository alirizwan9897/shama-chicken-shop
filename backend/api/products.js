const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const pool = require("../maindb");
const router = express.Router();

const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80";

function hasCloudinaryConfig() {
    return Boolean(
        (process.env.CLOUDINARY_CLOUD_NAME || "").trim() &&
        (process.env.CLOUDINARY_API_KEY || "").trim() &&
        (process.env.CLOUDINARY_API_SECRET || "").trim()
    );
}

function fileToDataUrl(file) {
    const mimeType = file.mimetype || "image/jpeg";
    const base64 = file.buffer.toString("base64");
    return `data:${mimeType};base64,${base64}`;
}

async function uploadProductImage(file) {
    if (!file) {
        return FALLBACK_PRODUCT_IMAGE;
    }

    if (hasCloudinaryConfig()) {
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "shama-chicken-shop/products",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (!result || !result.secure_url) {
                            reject(new Error("Cloudinary returned no secure URL."));
                            return;
                        }

                        resolve(result);
                    }
                );

                stream.end(file.buffer);
            });

            return uploadResult.secure_url;
        } catch (error) {
            console.warn("Cloudinary upload failed; using the original uploaded image as a data URL.", error.message);
            return fileToDataUrl(file);
        }
    }

    console.warn("Cloudinary is not configured; using the uploaded image as a data URL.");
    return fileToDataUrl(file);
}

// Store uploaded image temporarily in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});
// CREATE PRODUCT
router.post("/create", upload.single("image"), async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            original_price,
            category,
        } = req.body;

        // Validation
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                error: "Name, description, price and category are required",
            });
        }

        // Check image
        if (!req.file) {
            return res.status(400).json({
                error: "Product image is required",
            });
        }

        const productPrice = Number(price);

        if (Number.isNaN(productPrice) || productPrice < 0) {
            return res.status(400).json({
                error: "Price must be a valid number",
            });
        }

        // Original price is optional
        const productOriginalPrice =
            original_price === undefined ||
                original_price === ""
                ? null
                : Number(original_price);

        if (
            productOriginalPrice !== null &&
            (Number.isNaN(productOriginalPrice) ||
                productOriginalPrice < 0)
        ) {
            return res.status(400).json({
                error: "Original price must be a valid number",
            });
        }

        // Original price should not be less than selling price
        if (
            productOriginalPrice !== null &&
            productOriginalPrice < productPrice
        ) {
            return res.status(400).json({
                error: "Original price must be greater than or equal to price",
            });
        }

        let imageUrl;

        try {
            imageUrl = await uploadProductImage(req.file);
        } catch (uploadError) {
            return res.status(500).json({
                error: "Unable to upload product image.",
                details: uploadError.message,
            });
        }

        console.log("Product image URL:", imageUrl);

        // Save product in PostgreSQL
        const result = await pool.query(
            `
      INSERT INTO products
      (
        name,
        description,
        price,
        original_price,
        image,
        category
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        name,
        description,
        price,
        original_price,
        image,
        category,
        created_at
      `,
            [
                name.trim(),
                description.trim(),
                productPrice,
                productOriginalPrice,
                imageUrl,
                category.trim(),
            ]
        );

        return res.status(201).json({
            message: "Product created successfully",
            product: result.rows[0],
        });

    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            error: "Failed to create product",
            details: error.message,
        });
    }
});
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `
      SELECT
        id,
        name,
        description,
        price,
        original_price,
        image,
        category,
        created_at
      FROM products
      ORDER BY id DESC
      `
        );

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            error: "Failed to fetch products",
            details: error.message,
        });
    }
});
//updateApi

router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                error: "Product ID must be a positive integer",
            });
        }

        const {
            name,
            description,
            price,
            original_price,
            category,
        } = req.body;

        if (
            !name?.trim() ||
            !description?.trim() ||
            price === undefined ||
            price === "" ||
            !category?.trim()
        ) {
            return res.status(400).json({
                error: "Name, description, price and category are required",
            });
        }

        const productPrice = Number(price);

        if (!Number.isFinite(productPrice) || productPrice < 0) {
            return res.status(400).json({
                error: "Selling price must be a valid non-negative number",
            });
        }

        let originalPrice = null;

        if (original_price !== undefined && original_price !== "") {
            originalPrice = Number(original_price);

            if (!Number.isFinite(originalPrice) || originalPrice < 0) {
                return res.status(400).json({
                    error: "Original price must be a valid non-negative number",
                });
            }

            if (originalPrice < productPrice) {
                return res.status(400).json({
                    error: "Original price cannot be less than selling price",
                });
            }
        }

        // Keep the existing image unless a replacement is uploaded.
        const existing = await pool.query(
            `SELECT id, image FROM products WHERE id = $1`,
            [id]
        );

        if (existing.rowCount === 0) {
            return res.status(404).json({
                error: "Product not found",
            });
        }

        let imageUrl = existing.rows[0].image;

        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "shama-chicken-shop/products",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                stream.end(req.file.buffer);
            });

            imageUrl = uploadResult.secure_url;
        }

        const result = await pool.query(
            `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           original_price = $4,
           image = $5,
           category = $6
       WHERE id = $7
       RETURNING id, name, description, price, original_price,
                 image, category, created_at`,
            [
                name.trim(),
                description.trim(),
                productPrice,
                originalPrice,
                imageUrl,
                category.trim(),
                id,
            ]
        );

        return res.status(200).json({
            message: "Product updated successfully",
            product: result.rows[0],
        });
    } catch (error) {
        console.error("Update product error:", error);

        return res.status(500).json({
            error: "Failed to update product",
            details: error.message,
        });
    }
});
//deleteApi
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Product find karo
        const productResult = await pool.query(
            `SELECT id, name, image
       FROM products
       WHERE id = $1`,
            [id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                error: "Product not found",
            });
        }

        const product = productResult.rows[0];

        // Database se delete
        const deleteResult = await pool.query(
            `DELETE FROM products
       WHERE id = $1
       RETURNING id, name, image`,
            [id]
        );

        return res.status(200).json({
            message: "Product deleted successfully",
            product: deleteResult.rows[0],
        });

    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            error: "Failed to delete product",
            details: error.message,
        });
    }
});
function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}
module.exports = router;