const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ==========================================
// REGISTER USER
// POST /api/auth/register
// ==========================================
const registerUser = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        // CHECK REQUIRED FIELDS
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }


        // CHECK EXISTING USER
        const existingUser =
            await User.findOne({
                email
            });


        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }


        // HASH PASSWORD
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // CREATE USER
        const user =
            await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || "STAFF"
            });


        // REMOVE PASSWORD FROM RESPONSE
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        };


        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: userResponse
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// LOGIN USER
// POST /api/auth/login
// ==========================================
const loginUser = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;


        // CHECK INPUT
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }


        // FIND USER
        const user =
            await User.findOne({
                email
            });


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        // CHECK STATUS
        if (user.status === "INACTIVE") {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }


        // COMPARE PASSWORD
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        // CREATE JWT
        const token =
            jwt.sign(
                {
                    id: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );


        // RESPONSE
        res.status(200).json({
            success: true,
            message: "Login successful",

            token,

            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    registerUser,
    loginUser
};