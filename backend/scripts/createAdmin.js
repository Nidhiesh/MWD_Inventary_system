const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

require("dotenv").config();


// ==========================================
// ADMIN CONFIGURATION
// ==========================================

const ADMIN_NAME = "SmartStock Administrator";
const ADMIN_EMAIL = "admin@smartstock.com";
const ADMIN_PASSWORD = "Admin@12345";


// ==========================================
// CREATE ADMIN
// ==========================================

const createAdmin = async () => {

    try {

        console.log("Connecting to MongoDB...");

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB Connected");


        // ==========================================
        // CHECK EXISTING ADMIN
        // ==========================================

        const existingAdmin =
            await User.findOne({
                role: "admin"
            });


        if (existingAdmin) {

            console.log(
                "Admin account already exists."
            );

            console.log(
                `Admin email: ${existingAdmin.email}`
            );

            await mongoose.disconnect();

            process.exit(0);
        }


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        const existingUser =
            await User.findOne({
                email: ADMIN_EMAIL.toLowerCase()
            });


        if (existingUser) {

            console.error(
                "This email is already registered."
            );

            await mongoose.disconnect();

            process.exit(1);
        }


        // ==========================================
        // CREATE ADMIN
        // User model automatically hashes password
        // ==========================================

        const admin = await User.create({

            name: ADMIN_NAME,

            email: ADMIN_EMAIL.toLowerCase(),

            password: ADMIN_PASSWORD,

            phone: "",

            role: "admin",

            isActive: true

        });


        console.log("");
        console.log("======================================");
        console.log("ADMIN CREATED SUCCESSFULLY");
        console.log("======================================");
        console.log(`Email: ${admin.email}`);
        console.log(`Role: ${admin.role}`);
        console.log("======================================");
        console.log("");


        await mongoose.disconnect();

        process.exit(0);

    } catch (error) {

        console.error(
            "Admin creation failed:",
            error.message
        );

        await mongoose.disconnect();

        process.exit(1);

    }

};


createAdmin();