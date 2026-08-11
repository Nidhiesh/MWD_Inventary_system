const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");

const {
    apiLimiter
} = require("./middleware/securityMiddleware");

require("dotenv").config();

const app = express();


// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// CORS
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

// Security headers
app.use(helmet());


// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json());


// ==========================================
// API RATE LIMITER
// ==========================================

// Apply API rate limiting only once
app.use("/api", apiLimiter);


// ==========================================
// ROUTES
// ==========================================

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const saleRoutes = require("./routes/saleRoutes");
const alertRoutes = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


// ==========================================
// API ROUTES
// ==========================================

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/suppliers", supplierRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/sales", saleRoutes);

app.use("/api/alerts", alertRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/notifications", notificationRoutes);


// ==========================================
// ROOT API TEST
// ==========================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "SmartStock Backend API is running"
    });

});


// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });

});


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

    console.error("Server Error:", err);

    res.status(err.status || 500).json({

        success: false,

        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : err.message

    });

});


// ==========================================
// PORT
// ==========================================

const PORT = process.env.PORT || 5000;


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log("MongoDB Connected");


        // ==========================================
        // DROP STALE PURCHASE INDEX
        // ==========================================

        mongoose.connection.db
            .collection("purchases")
            .dropIndex("purchaseNumber_1")

            .then(() => {

                console.log(
                    "Successfully dropped stale purchaseNumber_1 index"
                );

            })

            .catch(() => {

                console.log(
                    "Index purchaseNumber_1 not found or already dropped"
                );

            });


        // ==========================================
        // START SERVER
        // ==========================================

        app.listen(PORT, () => {

            console.log(
                `Server running on port ${PORT}`
            );

        });

    })

    .catch((error) => {

        console.error(
            "MongoDB Connection Error:",
            error.message
        );

        process.exit(1);

    });