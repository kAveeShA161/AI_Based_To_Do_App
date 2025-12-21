import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const resgister = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password){
         return res.json({ success: false, message: "Missing details"});
    }

    try{
        const existingUser = await UserModel.findOne({ email });

        if (existingUser){
            return res.json({ success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign({ Id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Sending Welcome Email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to SmartDo",
            text:   `Hello ${name},\n\nWelcome to SmartDo. Your account has been successfully created with, \n\nEmail: ${email}
                    \nPassword: ${password}\n\nYou can login using the email id. \n\nBest regards,\nSmartDo Team`
        };

        await transporter.sendMail(mailOptions);

        // --------------

        return res.json({ success: true, message: "User registered successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required" });
    }

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ Id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: "Login successful" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const logout = async (req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({ success: true, message: "Logout successful" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}