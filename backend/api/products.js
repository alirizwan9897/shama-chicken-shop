const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const pool = require("../maindb");
const router = express.Router();
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
        // Upload image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "shama-chicken-shop/products",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            stream.end(req.file.buffer);
        });

        console.log("Cloudinary URL:", uploadResult.secure_url);

        // Save product + Cloudinary URL in PostgreSQL
        const result = await pool.query(
            `
      INSERT INTO products
      ( name, description, price, image,category) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, price,image, category,created_at`,
            [
                name.trim(),
                description.trim(),
                productPrice,
                uploadResult.secure_url,
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
// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `
      SELECT
        id,
        name,
        description,
        price,
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
        });
    }
});
router.get("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'id must be a positive integer' });
    try {
        const result = await pool.query(
            'SELECT id, name, description, price, image, category created_at FROM products WHERE id = $1',
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return handleDatabaseError(error, res);
    }
});
//updateApi
router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category } = req.body;

        // Check product exists
        const existingProduct = await pool.query(
            `SELECT * FROM products WHERE id = $1`,
            [id]
        );

        if (existingProduct.rows.length === 0) {
            return res.status(404).json({
                error: "Product not found",
            });
        }

        let imageUrl = existingProduct.rows[0].image;

        // If new image selected, upload to Cloudinary
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "shama-chicken-shop/products",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
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
           image = $4,
           category = $5
       WHERE id = $6
       RETURNING id, name, description, price, image, category, created_at`,
            [
                name.trim(),
                description.trim(),
                Number(price),
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