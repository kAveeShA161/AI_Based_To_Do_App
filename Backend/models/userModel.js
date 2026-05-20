import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verifyOTP: {
        type: String,
        default: ""
    },
    verifyOTPExpiry: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetOTP: {
        type: String,
        default: ""
    },
    resetOTPExpiryAt: {
        type: Number,
        default: 0
    },
    focusStreak: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    moodHistory: [
        {
            date: {
                type: Date,
                required: true,
            },
            mood: {
                type: String,
                enum: ["motivated", "low-energy", "tired"],
                required: true,
            },
        },
    ],
    todayMood: {
        type: String,
        enum: ["motivated", "low-energy", "tired", ""],
        default: "",
    }
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
