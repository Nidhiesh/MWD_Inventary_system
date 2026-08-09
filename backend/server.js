const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json());


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

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    })
    .catch((error) => {

        console.error(
            "MongoDB Connection Error:",
            error.message
        );

        process.exit(1);
    });