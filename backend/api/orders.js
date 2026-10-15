const express = require("express");
const pool = require("../maindb");
const router = express.Router();
/*
========================================================
POST /api/orders
Create a new order
========================================================
*/
router.post("/", async (req, res) => {
    let client;
    let transactionStarted = false;
    try {
        const {
            userId,
            customerName,
            phone,
            address,
            city,
            state,
            pincode,
            latitude,
            longitude,
            paymentMethod = "COD",
            items,
        } = req.body;
        // ---------------------------------------------
        // Validation
        // ---------------------------------------------
        if (
            !customerName ||
            !phone ||
            !address ||
            !city ||
            !pincode
        ) {
            return res.status(400).json({
                error:
                    "Customer name, phone, address, city and pincode are required",
            });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: "At least one product is required",
            });
        }
        if (!["COD", "ONLINE"].includes(paymentMethod)) {
            return res.status(400).json({
                error: "Invalid payment method",
            });
        }
        // ---------------------------------------------
        // Get database client
        // ---------------------------------------------
        client = await pool.connect();
        // ---------------------------------------------
        // Start transaction
        // ---------------------------------------------
        await client.query("BEGIN");
        transactionStarted = true;
        // ---------------------------------------------
        // Calculate order total
        // ---------------------------------------------
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const productId = Number(item.productId);
            const quantity = Number(item.quantity);
            // Validate product ID
            if (!Number.isInteger(productId) || productId <= 0) {
                throw new Error(
                    `Invalid product ID: ${item.productId}`
                );
            }
            // Validate quantity
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error(
                    `Invalid quantity for product ${productId}`
                );
            }
            // -----------------------------------------
            // Get current product price from database
            // -----------------------------------------
            const productResult = await client.query(
                ` SELECT id, name, price FROM public.products WHERE id = $1`, [productId]
            );
            if (productResult.rows.length === 0) {
                throw new Error(
                    `Product ${productId} not found`
                );
            }
            const product = productResult.rows[0];
            const price = Number(product.price);
            if (!Number.isFinite(price) || price < 0) {
                throw new Error(
                    `Invalid price for product ${productId}`
                );
            }
            const subtotal = price * quantity;
            totalAmount += subtotal;
            orderItems.push({
                productId: product.id,
                productName: product.name,
                quantity,
                price,
                subtotal,
            });
        }
        // ---------------------------------------------
        // Create order
        // ---------------------------------------------
        const orderResult = await client.query(
            `
            INSERT INTO public.orders (
                user_id,
                customer_name,
                phone,
                address,
                city,
                state,
                pincode,
                latitude,
                longitude,
                total_amount,
                payment_method,
                payment_status,
                order_status
            )
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING * `,
            [
                userId ?? null,
                String(customerName).trim(),
                String(phone).trim(),
                String(address).trim(),
                String(city).trim(),
                state ? String(state).trim() : null,
                String(pincode).trim(),
                latitude ?? null,
                longitude ?? null,
                totalAmount,
                paymentMethod,
                "pending",
                "pending",
            ]
        );
        const order = orderResult.rows[0];
        // ---------------------------------------------
        // Create order items
        // ---------------------------------------------
        for (const item of orderItems) {
            await client.query(
                `
                INSERT INTO public.order_items ( order_id, product_id, product_name, quantity, price, subtotal )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
                `,
                [
                    order.id,
                    item.productId,
                    item.productName,
                    item.quantity,
                    item.price,
                    item.subtotal,
                ]
            );
        }
        // ---------------------------------------------
        // Commit transaction
        // ---------------------------------------------
        await client.query("COMMIT");
        transactionStarted = false;
        // ---------------------------------------------
        // Response
        // ---------------------------------------------
        return res.status(201).json({
            message: "Order created successfully",
            order: {
                id: order.id,
                userId: order.user_id,
                customerName: order.customer_name,
                phone: order.phone,
                address: order.address,
                city: order.city,
                state: order.state,
                pincode: order.pincode,
                latitude: order.latitude,
                longitude: order.longitude,
                totalAmount: order.total_amount,
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status,
                orderStatus: order.order_status,
                createdAt: order.created_at,
                updatedAt: order.updated_at,
            },
            items: orderItems,
        });
    } catch (error) {
        // ---------------------------------------------
        // Rollback transaction
        // ---------------------------------------------
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }
        }
        console.error("Create order error:", error);
        return res.status(500).json({
            error: "Failed to create order",
            details: error.message,
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});
/*
========================================================
GET /api/orders
Get all orders
========================================================
*/
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            ` SELECT * FROM public.orders ORDER BY created_at DESC`
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({
            error: "Failed to get orders",
            details: error.message,
        });
    }
});

/*
========================================================
GET /api/orders/:id
Get single order
========================================================
*/
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT id, user_id, customer_name, phone, address, city, state, pincode, latitude, longitude, total_amount, payment_method,payment_status, order_status, created_at,updated_at FROM public.orders
      WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Get user orders error:", error);
        return res.status(500).json({
            error: "Failed to get user orders",
            details: error.message,
        });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                error: "Invalid order ID",
            });
        }
        const orderResult = await pool.query(
            `SELECT *FROM public.ordersWHERE id = $1`, [orderId]
        );
        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                error: "Order not found",
            });
        }
        const itemsResult = await pool.query(
            `SELECT * FROM public.order_items WHERE order_id = $1 ORDER BY id `, [orderId]
        );
        return res.status(200).json({
            order: orderResult.rows[0],
            items: itemsResult.rows,
        });
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(500).json({
            error: "Failed to get order",
            details: error.message,
        });
    }
});
/*
========================================================
PATCH /api/orders/:id/status
Update order status
========================================================
*/
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;
        const allowedStatuses = [
            "pending",
            "confirmed",
            "preparing",
            "out_for_delivery",
            "delivered",
            "cancelled",
        ];
        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                error: "Invalid order status",
            });
        }
        const result = await pool.query(
            `UPDATE public.orders SET order_status = $1, payment_status = CASE WHEN $3 THEN 'paid' ELSE payment_status END, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING * `,
            [orderStatus, id, orderStatus === "delivered"]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order not found",
            });
        }
        return res.status(200).json({
            message: "Order status updated successfully",
            order: result.rows[0],
        });
    } catch (error) {
        console.error("Update order status error:", error);
        return res.status(500).json({
            error: "Failed to update order status",
            details: error.message,
        });
    }
});

/*
========================================================
PATCH /api/orders/:id/payment
Update payment status
========================================================
*/
router.patch("/:id/payment", async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { paymentStatus } = req.body;
        const allowedStatuses = [
            "pending",
            "paid",
            "failed",
            "refunded",
        ];
        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                error: "Invalid order ID",
            });
        }
        if (!allowedStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                error: "Invalid payment status",
            });
        }
        const result = await pool.query(
            `UPDATE public.orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING * `, [paymentStatus, orderId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order not found",
            });
        }
        return res.status(200).json({
            message: "Payment status updated successfully",
            order: result.rows[0],
        });
    } catch (error) {
        console.error(
            "Update payment error:",
            error
        );
        return res.status(500).json({
            error: "Failed to update payment status",
            details: error.message,
        });
    }
});
module.exports = router;