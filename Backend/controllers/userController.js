import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.json({ success: false, message: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            userData: {
                fullName: user.fullName,
                email: user.email,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
