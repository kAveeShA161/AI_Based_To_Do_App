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
    }
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;