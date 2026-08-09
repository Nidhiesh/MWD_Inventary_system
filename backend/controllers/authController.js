const User = require("../models/User");
const jwt = require("jsonwebtoken");


// ==========================================
// GENERATE JWT
// ==========================================

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
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

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }


        const user = await User.findOne({
            email: email.toLowerCase()
        });


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        if (!user.isActive) {

            return res.status(403).json({
                success: false,
                message: "Your account has been disabled"
            });
        }


        const passwordMatch =
            await user.comparePassword(password);


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        const token = generateToken(user);


        res.status(200).json({

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

        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
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


        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }


        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }


        const staff = await User.create({

            name,

            email: email.toLowerCase(),

            password,

            phone: phone || "",

            role: "staff",

            isActive: true

        });


        res.status(201).json({

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

        res.status(500).json({
            success: false,
            message: error.message
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


        res.status(200).json({

            success: true,

            count: staff.length,

            staff

        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// DISABLE STAFF
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


        staff.isActive = !staff.isActive;

        await staff.save();


        res.status(200).json({

            success: true,

            message:
                staff.isActive
                    ? "Staff account enabled"
                    : "Staff account disabled",

            isActive: staff.isActive

        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    login,
    createStaff,
    getStaff,
    toggleStaffStatus
};