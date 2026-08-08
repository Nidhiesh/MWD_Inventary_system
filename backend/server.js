const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const saleRoutes = require("./routes/saleRoutes");
const alertRoutes = require("./routes/alertRoutes");

dotenv.config();

const app = express();


// DATABASE
connectDB();


// MIDDLEWARE
app.use(cors());
app.use(express.json());


// ROUTES
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/inventory", inventoryRoutes); 
app.use("/api/customers", customerRoutes);
app.use( "/api/sales", saleRoutes );
app.use( "/api/alerts", alertRoutes );

// ROOT API
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SmartStock Backend API is running"
    });
});


// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});