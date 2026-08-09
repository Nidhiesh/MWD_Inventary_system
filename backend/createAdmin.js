require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./models/User");


const createAdmin = async () => {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB connected");


        const adminEmail =
            "admin@smartstock.com";


        const existingAdmin =
            await User.findOne({
                role: "admin"
            });


        if (existingAdmin) {

            console.log(
                "Admin already exists:"
            );

            console.log(
                existingAdmin.email
            );

            process.exit(0);
        }


        const existingEmail =
            await User.findOne({
                email: adminEmail
            });


        if (existingEmail) {

            console.log(
                "This email already exists."
            );

            process.exit(0);
        }


        const admin = await User.create({

            name: "SmartStock Admin",

            email: adminEmail,

            password: "Admin@123",

            phone: "",

            role: "admin",

            isActive: true

        });


        console.log("");
        console.log(
            "=============================="
        );
        console.log(
            "ADMIN CREATED SUCCESSFULLY"
        );
        console.log(
            "=============================="
        );

        console.log(
            "Email: admin@smartstock.com"
        );

        console.log(
            "Password: Admin@123"
        );

        console.log(
            "Role: admin"
        );

        console.log(
            "=============================="
        );


        process.exit(0);


    } catch (error) {

        console.error(
            "Admin creation error:",
            error
        );

        process.exit(1);
    }
};


createAdmin();