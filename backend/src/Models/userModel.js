//user Schema
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter your name"],
            trim: true,
            maxLength: [50, "Your name cannot be longer than 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Please enter email ID"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, "Please enter a valid email"]
        },

        password: {
            type: String,
            required: [true, "Please enter password"],
            minlength: [6, "Your password must be longer than 6 characters"],
            select: false
        },

        passwordConfirm: {
            type: String,
            required: [true, "Please confirm your password"],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: "Passwords are not the same!"
            }
        },

        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        avatar: {
            url: {
                type: String
            },
            public_id: {
                type: String
            }
        },

        passwordChangeAt: {
            type: Date
        },

        passwordResetToken: {
            type: String,
            select: false,
            index: true
        },

        passwordResetExpires: {
            type: Date,
            select: false
        }
    },
    {
        timestamps: true
    }
);


// Remove sensitive fields when converting user to JSON
userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.passwordConfirm;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;

        return ret;
    }
});


// Hash password before saving
userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
});


// Check password during login
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};


// Check whether password was changed after JWT was created
userSchema.methods.passwordChangeAfter = function (JWTTimestamp) {

    if (this.passwordChangeAt) {

        const changedTimeStamp = parseInt(
            this.passwordChangeAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimeStamp;
    }

    return false;
};


// Create password reset token
userSchema.methods.correctPasswordResetToken = function () {

    const resetToken = crypto
        .randomBytes(32)
        .toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires =
        Date.now() + 10 * 60 * 1000;

    return resetToken;
};


const User = mongoose.model("User", userSchema);

export { User };