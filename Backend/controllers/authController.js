import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

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
        })

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};