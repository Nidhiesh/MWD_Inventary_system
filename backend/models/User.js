const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema(
    {
        // ==========================================
        // NAME
        // ==========================================

        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        // ==========================================
        // EMAIL
        // ==========================================

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [150, "Email cannot exceed 150 characters"],

            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address"
            ]
        },

        // ==========================================
        // PASSWORD
        // ==========================================

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false
        },

        // ==========================================
        // PHONE
        // ==========================================

        phone: {
            type: String,
            trim: true,
            default: "",
            maxlength: [20, "Phone number cannot exceed 20 characters"]
        },

        // ==========================================
        // ROLE
        // ==========================================

        role: {
            type: String,
            enum: {
                values: ["admin", "staff"],
                message: "Role must be either admin or staff"
            },
            default: "staff"
        },

        // ==========================================
        // ACCOUNT STATUS
        // ==========================================

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// HASH PASSWORD BEFORE SAVE
// ==========================================

userSchema.pre("save", async function (next) {

    try {

        // Don't hash password again
        if (!this.isModified("password")) {
            return next();
        }

        // Generate salt
        const salt = await bcrypt.genSalt(12);

        // Hash password
        this.password = await bcrypt.hash(
            this.password,
            salt
        );

        next();

    } catch (error) {

        next(error);

    }

});


// ==========================================
// COMPARE PASSWORD
// ==========================================

userSchema.methods.comparePassword = async function (password) {

    return bcrypt.compare(
        password,
        this.password
    );

};


// ==========================================
// REMOVE PASSWORD FROM JSON
// ==========================================

userSchema.methods.toJSON = function () {

    const user = this.toObject();

    delete user.password;

    return user;

};




// ==========================================
// EXPORT
// ==========================================

module.exports = mongoose.model(
    "User",
    userSchema
);