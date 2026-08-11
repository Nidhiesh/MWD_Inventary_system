const User = require("../models/User");
const jwt = require("jsonwebtoken");


// ==========================================
// GENERATE JWT
// ==========================================

const generateToken = (user) => {

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};


// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {

    try {

        const { email, password } = req.body;


        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (
            !email ||
            typeof email !== "string" ||
            !password ||
            typeof password !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }


        // ==========================================
        // NORMALIZE EMAIL
        // ==========================================

        const normalizedEmail =
            email.trim().toLowerCase();


        // ==========================================
        // FIND USER + INCLUDE PASSWORD
        // ==========================================

        const user = await User.findOne({
            email: normalizedEmail
        }).select("+password");


        // ==========================================
        // USER NOT FOUND
        // ==========================================

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // ==========================================
        // CHECK ACCOUNT STATUS
        // ==========================================

        if (user.isActive === false) {

            return res.status(403).json({
                success: false,
                message: "Your account has been disabled"
            });

        }


        // ==========================================
        // CHECK PASSWORD
        // ==========================================

        const passwordMatch =
            await user.comparePassword(password);


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // ==========================================
        // GENERATE TOKEN
        // ==========================================

        const token = generateToken(user);


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }

        });

    } catch (error) {

        console.error(
            "Login Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to process login"
        });

    }

};


// ==========================================
// CREATE STAFF
// ADMIN ONLY
// ==========================================

const createStaff = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            phone
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }


        // ==========================================
        // NORMALIZE EMAIL
        // ==========================================

        const normalizedEmail = email
            .trim()
            .toLowerCase();


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        const existingUser = await User.findOne({
            email: normalizedEmail
        });


        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }


        // ==========================================
        // CREATE STAFF
        // ==========================================

        const staff = await User.create({

            name: name.trim(),

            email: normalizedEmail,

            password,

            phone: phone || "",

            role: "staff",

            isActive: true

        });


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message: "Staff account created successfully",

            user: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                isActive: staff.isActive
            }

        });

    } catch (error) {

        console.error(
            "Create Staff Error:",
            error
        );


        // ==========================================
        // DUPLICATE EMAIL
        // ==========================================

        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }


        // ==========================================
        // MONGOOSE VALIDATION
        // ==========================================

        if (error.name === "ValidationError") {

            const messages = Object.values(
                error.errors
            ).map(err => err.message);

            return res.status(400).json({
                success: false,
                message: messages.join(", ")
            });
        }


        // ==========================================
        // SERVER ERROR
        // ==========================================

        return res.status(500).json({
            success: false,
            message:
                process.env.NODE_ENV === "production"
                    ? "Unable to create staff account"
                    : error.message
        });
    }
};


// ==========================================
// GET STAFF
// ==========================================

const getStaff = async (req, res) => {

    try {

        const staff = await User.find({
            role: "staff"
        })
            .select("-password")
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            count: staff.length,

            staff

        });

    } catch (error) {

        console.error(
            "Get Staff Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch staff"
        });

    }

};


// ==========================================
// TOGGLE STAFF STATUS
// ==========================================

const toggleStaffStatus = async (req, res) => {

    try {

        const staff =
            await User.findOne({
                _id: req.params.id,
                role: "staff"
            });


        if (!staff) {

            return res.status(404).json({
                success: false,
                message: "Staff member not found"
            });

        }


        staff.isActive =
            !staff.isActive;


        await staff.save();


        return res.status(200).json({

            success: true,

            message:
                staff.isActive
                    ? "Staff account enabled"
                    : "Staff account disabled",

            isActive: staff.isActive

        });

    } catch (error) {

        console.error(
            "Toggle Staff Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update staff status"
        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    login,
    createStaff,
    getStaff,
    toggleStaffStatus
};