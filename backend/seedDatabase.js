require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./models/User");
const Category = require("./models/Category");
const Supplier = require("./models/Supplier");
const Customer = require("./models/Customer");
const Product = require("./models/Product");
const Purchase = require("./models/Purchase");
const Sale = require("./models/Sale");
const InventoryTransaction = require("./models/InventoryTransaction");
const Notification = require("./models/Notification");
const AuditLog = require("./models/AuditLog");


// ==========================================
// SEED DATABASE
// ==========================================

const seedDatabase = async () => {

    try {

        // ==========================================
        // CONNECT DATABASE
        // ==========================================

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");


        // ==========================================
        // CLEAR EXISTING DATA
        // ==========================================

        console.log("Clearing existing collections...");

        await AuditLog.deleteMany({});
        await Notification.deleteMany({});
        await InventoryTransaction.deleteMany({});
        await Sale.deleteMany({});
        await Purchase.deleteMany({});
        await Product.deleteMany({});
        await Customer.deleteMany({});
        await Supplier.deleteMany({});
        await Category.deleteMany({});

        // Keep users because Admin/Staff may already exist.


        // ==========================================
        // USERS
        // ==========================================

        let admin = await User.findOne({
            email: "admin@smartstock.com"
        }).select("+password");

        if (!admin) {

            admin = await User.create({
                name: "SmartStock Admin",
                email: "admin@smartstock.com",
                password: "Admin@123",
                phone: "9876543201",
                role: "admin",
                isActive: true
            });

            console.log("Admin created");
        } else {

            console.log("Admin already exists");
        }


        let staff = await User.findOne({
            email: "staff@smartstock.com"
        }).select("+password");

        if (!staff) {

            staff = await User.create({
                name: "SmartStock Staff",
                email: "staff@smartstock.com",
                password: "Sales@12345",
                phone: "9876543202",
                role: "staff",
                isActive: true
            });

            console.log("Staff created");
        } else {

            console.log("Staff already exists");
        }


        // ==========================================
        // CATEGORIES
        // ==========================================

        const categories = await Category.insertMany([

            {
                name: "Electronics",
                description: "Electronic devices and accessories",
                status: "ACTIVE"
            },

            {
                name: "Computer Accessories",
                description: "Computer peripherals and accessories",
                status: "ACTIVE"
            },

            {
                name: "Office Supplies",
                description: "Office and stationery products",
                status: "ACTIVE"
            },

            {
                name: "Networking",
                description: "Networking devices and equipment",
                status: "ACTIVE"
            },

            {
                name: "Storage Devices",
                description: "Hard drives, SSDs and storage products",
                status: "ACTIVE"
            }

        ]);

        console.log(`${categories.length} categories created`);


        // ==========================================
        // SUPPLIERS
        // ==========================================

        const suppliers = await Supplier.insertMany([

            {
                name: "Rajesh Kumar",
                companyName: "TechSource India",
                email: "sales@techsource.in",
                phone: "9876501001",
                address: "12 Nehru Street",
                city: "Coimbatore",
                state: "Tamil Nadu",
                country: "India",
                gstNumber: "33AABCT1234F1Z5",
                status: "ACTIVE"
            },

            {
                name: "Arun Kumar",
                companyName: "Digital World Supplies",
                email: "contact@digitalworld.in",
                phone: "9876501002",
                address: "45 Gandhi Road",
                city: "Chennai",
                state: "Tamil Nadu",
                country: "India",
                gstNumber: "33AABCD5678G1Z2",
                status: "ACTIVE"
            },

            {
                name: "Priya Sharma",
                companyName: "Smart Office Solutions",
                email: "sales@smartoffice.in",
                phone: "9876501003",
                address: "18 MG Road",
                city: "Bangalore",
                state: "Karnataka",
                country: "India",
                gstNumber: "29AABCS9012H1Z8",
                status: "ACTIVE"
            }

        ]);

        console.log(`${suppliers.length} suppliers created`);


        // ==========================================
        // CUSTOMERS
        // ==========================================

        const customers = await Customer.insertMany([

            {
                name: "Ravi Kumar",
                phone: "9000001001",
                email: "ravi@example.com",
                address: "RS Puram, Coimbatore",
                status: "ACTIVE"
            },

            {
                name: "Priya Raj",
                phone: "9000001002",
                email: "priya@example.com",
                address: "Peelamedu, Coimbatore",
                status: "ACTIVE"
            },

            {
                name: "Arun Kumar",
                phone: "9000001003",
                email: "arun@example.com",
                address: "Gandhipuram, Coimbatore",
                status: "ACTIVE"
            },

            {
                name: "Karthik S",
                phone: "9000001004",
                email: "karthik@example.com",
                address: "Saibaba Colony, Coimbatore",
                status: "ACTIVE"
            }

        ]);

        console.log(`${customers.length} customers created`);


        // ==========================================
        // PRODUCTS
        // ==========================================

        const products = await Product.insertMany([

            {
                name: "Wireless Mouse",
                sku: "WM-001",
                category: categories[1]._id,
                description: "2.4GHz wireless optical mouse",
                purchasePrice: 450,
                sellingPrice: 699,
                quantity: 35,
                minimumStock: 10,
                maximumStock: 100,
                warehouse: "Main Warehouse",
                status: "ACTIVE"
            },

            {
                name: "Mechanical Keyboard",
                sku: "MK-001",
                category: categories[1]._id,
                description: "RGB mechanical gaming keyboard",
                purchasePrice: 1800,
                sellingPrice: 2499,
                quantity: 25,
                minimumStock: 8,
                maximumStock: 60,
                warehouse: "Main Warehouse",
                status: "ACTIVE"
            },

            {
                name: "USB-C Hub",
                sku: "UCH-001",
                category: categories[0]._id,
                description: "Multi-port USB-C adapter",
                purchasePrice: 900,
                sellingPrice: 1399,
                quantity: 7,
                minimumStock: 10,
                maximumStock: 50,
                warehouse: "Main Warehouse",
                status: "ACTIVE"
            },

            {
                name: "SSD 512GB",
                sku: "SSD-512-001",
                category: categories[4]._id,
                description: "512GB NVMe SSD",
                purchasePrice: 3200,
                sellingPrice: 4299,
                quantity: 18,
                minimumStock: 5,
                maximumStock: 40,
                warehouse: "Main Warehouse",
                status: "ACTIVE"
            },

            {
                name: "WiFi Router",
                sku: "RTR-001",
                category: categories[3]._id,
                description: "Dual-band wireless router",
                purchasePrice: 1500,
                sellingPrice: 2199,
                quantity: 12,
                minimumStock: 5,
                maximumStock: 30,
                warehouse: "Main Warehouse",
                status: "ACTIVE"
            },

            {
                name: "Laser Printer",
                sku: "PRN-001",
                category: categories[2]._id,
                description: "Monochrome laser printer",
                purchasePrice: 8500,
                sellingPrice: 10999,
                quantity: 4,
                minimumStock: 5,
                maximumStock: 20,
                warehouse: "Main Warehouse",
                status: "ACTIVE"
            },

            {
                name: "USB Flash Drive 64GB",
                sku: "USB-64-001",
                category: categories[4]._id,
                description: "64GB USB 3.0 flash drive",
                purchasePrice: 400,
                sellingPrice: 649,
                quantity: 0,
                minimumStock: 10,
                maximumStock: 100,
                warehouse: "Main Warehouse",
                status: "ACTIVE"
            },

            {
                name: "HDMI Cable",
                sku: "HDMI-001",
                category: categories[0]._id,
                description: "High speed HDMI cable",
                purchasePrice: 250,
                sellingPrice: 449,
                quantity: 50,
                minimumStock: 15,
                maximumStock: 100,
                warehouse: "Main Warehouse",
                status: "ACTIVE"
            }

        ]);

        console.log(`${products.length} products created`);


        // ==========================================
        // PURCHASES
        // ==========================================

        const purchase1Items = [
            {
                product: products[0]._id,
                quantity: 50,
                costPrice: 450,
                total: 50 * 450
            },
            {
                product: products[1]._id,
                quantity: 30,
                costPrice: 1800,
                total: 30 * 1800
            }
        ];

        const purchase1 = await Purchase.create({
            supplier: suppliers[0]._id,
            items: purchase1Items,
            grandTotal: 50 * 450 + 30 * 1800,
            purchaseDate: new Date("2026-07-20"),
            status: "RECEIVED"
        });


        const purchase2Items = [
            {
                product: products[2]._id,
                quantity: 20,
                costPrice: 900,
                total: 20 * 900
            },
            {
                product: products[4]._id,
                quantity: 15,
                costPrice: 1500,
                total: 15 * 1500
            }
        ];

        const purchase2 = await Purchase.create({
            supplier: suppliers[1]._id,
            items: purchase2Items,
            grandTotal: 20 * 900 + 15 * 1500,
            purchaseDate: new Date("2026-07-25"),
            status: "RECEIVED"
        });


        const purchase3Items = [
            {
                product: products[3]._id,
                quantity: 25,
                costPrice: 3200,
                total: 25 * 3200
            },
            {
                product: products[5]._id,
                quantity: 10,
                costPrice: 8500,
                total: 10 * 8500
            }
        ];

        const purchase3 = await Purchase.create({
            supplier: suppliers[2]._id,
            items: purchase3Items,
            grandTotal: 25 * 3200 + 10 * 8500,
            purchaseDate: new Date("2026-08-01"),
            status: "RECEIVED"
        });


        console.log("3 purchases created");


        // ==========================================
        // SALES
        // ==========================================

        const sale1Items = [
            {
                product: products[0]._id,
                quantity: 5,
                sellingPrice: 699,
                total: 5 * 699
            },
            {
                product: products[1]._id,
                quantity: 2,
                sellingPrice: 2499,
                total: 2 * 2499
            }
        ];

        const sale1 = await Sale.create({
            customer: customers[0]._id,
            items: sale1Items,
            grandTotal: 5 * 699 + 2 * 2499,
            saleDate: new Date("2026-08-02"),
            status: "COMPLETED"
        });


        const sale2Items = [
            {
                product: products[2]._id,
                quantity: 3,
                sellingPrice: 1399,
                total: 3 * 1399
            },
            {
                product: products[4]._id,
                quantity: 2,
                sellingPrice: 2199,
                total: 2 * 2199
            }
        ];

        const sale2 = await Sale.create({
            customer: customers[1]._id,
            items: sale2Items,
            grandTotal: 3 * 1399 + 2 * 2199,
            saleDate: new Date("2026-08-05"),
            status: "COMPLETED"
        });


        const sale3Items = [
            {
                product: products[3]._id,
                quantity: 4,
                sellingPrice: 4299,
                total: 4 * 4299
            },
            {
                product: products[7]._id,
                quantity: 10,
                sellingPrice: 449,
                total: 10 * 449
            }
        ];

        const sale3 = await Sale.create({
            customer: customers[2]._id,
            items: sale3Items,
            grandTotal: 4 * 4299 + 10 * 449,
            saleDate: new Date("2026-08-08"),
            status: "COMPLETED"
        });


        console.log("3 sales created");


        // ==========================================
        // INVENTORY TRANSACTIONS
        // ==========================================

        await InventoryTransaction.insertMany([

            {
                product: products[0]._id,
                type: "IN",
                quantity: 50,
                previousQuantity: 0,
                newQuantity: 50,
                referenceType: "PURCHASE",
                referenceId: purchase1._id,
                note: "Initial stock purchase"
            },

            {
                product: products[0]._id,
                type: "OUT",
                quantity: 5,
                previousQuantity: 50,
                newQuantity: 45,
                referenceType: "SALE",
                referenceId: sale1._id,
                note: "Customer sale"
            },

            {
                product: products[1]._id,
                type: "IN",
                quantity: 30,
                previousQuantity: 0,
                newQuantity: 30,
                referenceType: "PURCHASE",
                referenceId: purchase1._id,
                note: "Initial stock purchase"
            },

            {
                product: products[1]._id,
                type: "OUT",
                quantity: 2,
                previousQuantity: 30,
                newQuantity: 28,
                referenceType: "SALE",
                referenceId: sale1._id,
                note: "Customer sale"
            },

            {
                product: products[2]._id,
                type: "IN",
                quantity: 20,
                previousQuantity: 0,
                newQuantity: 20,
                referenceType: "PURCHASE",
                referenceId: purchase2._id,
                note: "Stock received"
            },

            {
                product: products[2]._id,
                type: "OUT",
                quantity: 3,
                previousQuantity: 20,
                newQuantity: 17,
                referenceType: "SALE",
                referenceId: sale2._id,
                note: "Customer sale"
            },

            {
                product: products[4]._id,
                type: "IN",
                quantity: 15,
                previousQuantity: 0,
                newQuantity: 15,
                referenceType: "PURCHASE",
                referenceId: purchase2._id,
                note: "Stock received"
            },

            {
                product: products[4]._id,
                type: "OUT",
                quantity: 2,
                previousQuantity: 15,
                newQuantity: 13,
                referenceType: "SALE",
                referenceId: sale2._id,
                note: "Customer sale"
            },

            {
                product: products[3]._id,
                type: "IN",
                quantity: 25,
                previousQuantity: 0,
                newQuantity: 25,
                referenceType: "PURCHASE",
                referenceId: purchase3._id,
                note: "Stock received"
            },

            {
                product: products[3]._id,
                type: "OUT",
                quantity: 4,
                previousQuantity: 25,
                newQuantity: 21,
                referenceType: "SALE",
                referenceId: sale3._id,
                note: "Customer sale"
            },

            {
                product: products[7]._id,
                type: "OUT",
                quantity: 10,
                previousQuantity: 60,
                newQuantity: 50,
                referenceType: "SALE",
                referenceId: sale3._id,
                note: "Customer sale"
            },

            {
                product: products[5]._id,
                type: "IN",
                quantity: 10,
                previousQuantity: 0,
                newQuantity: 10,
                referenceType: "PURCHASE",
                referenceId: purchase3._id,
                note: "Stock received"
            }

        ]);

        console.log("Inventory transactions created");


        // ==========================================
        // NOTIFICATIONS
        // ==========================================

        await Notification.insertMany([

            {
                userId: staff._id,
                type: "LOW_STOCK",
                message: "USB-C Hub is running low on stock.",
                productId: products[2]._id,
                isRead: false
            },

            {
                userId: staff._id,
                type: "OUT_OF_STOCK",
                message: "USB Flash Drive 64GB is out of stock.",
                productId: products[6]._id,
                isRead: false
            },

            {
                userId: admin._id,
                type: "LOW_STOCK",
                message: "Laser Printer stock is below minimum level.",
                productId: products[5]._id,
                isRead: false
            },

            {
                userId: admin._id,
                type: "SYSTEM",
                message: "SmartStock database seed completed successfully.",
                isRead: true
            }

        ]);

        console.log("Notifications created");


        // ==========================================
        // AUDIT LOGS
        // ==========================================

        await AuditLog.insertMany([

            {
                userId: admin._id,
                action: "CREATE",
                module: "CATEGORY",
                recordId: categories[0]._id.toString(),
                description: "Created Electronics category"
            },

            {
                userId: admin._id,
                action: "CREATE",
                module: "PRODUCT",
                recordId: products[0]._id.toString(),
                description: "Created Wireless Mouse product"
            },

            {
                userId: staff._id,
                action: "CREATE",
                module: "SALE",
                recordId: sale1._id.toString(),
                description: "Created customer sale"
            },

            {
                userId: admin._id,
                action: "CREATE",
                module: "PURCHASE",
                recordId: purchase1._id.toString(),
                description: "Created supplier purchase"
            },

            {
                userId: staff._id,
                action: "READ",
                module: "REPORT",
                description: "Viewed sales report"
            }

        ]);

        console.log("Audit logs created");


        // ==========================================
        // COMPLETE
        // ==========================================

        console.log("");
        console.log("==========================================");
        console.log("DATABASE SEED COMPLETED SUCCESSFULLY");
        console.log("==========================================");

        console.log(`Users: ${await User.countDocuments()}`);
        console.log(`Categories: ${await Category.countDocuments()}`);
        console.log(`Suppliers: ${await Supplier.countDocuments()}`);
        console.log(`Customers: ${await Customer.countDocuments()}`);
        console.log(`Products: ${await Product.countDocuments()}`);
        console.log(`Purchases: ${await Purchase.countDocuments()}`);
        console.log(`Sales: ${await Sale.countDocuments()}`);
        console.log(
            `Inventory Transactions: ${await InventoryTransaction.countDocuments()}`
        );
        console.log(
            `Notifications: ${await Notification.countDocuments()}`
        );
        console.log(
            `Audit Logs: ${await AuditLog.countDocuments()}`
        );

        console.log("");
        console.log("Admin Login:");
        console.log("Email: admin@smartstock.com");
        console.log("Password: Admin@123");

        console.log("");
        console.log("Staff Login:");
        console.log("Email: staff@smartstock.com");
        console.log("Password: Sales@12345");

        console.log("");
        console.log("==========================================");


    } catch (error) {

        console.error("");
        console.error("DATABASE SEED ERROR:");
        console.error(error);
        console.error("");

    } finally {

        await mongoose.connection.close();

        console.log("MongoDB connection closed");

    }
};


// ==========================================
// RUN
// ==========================================

seedDatabase();