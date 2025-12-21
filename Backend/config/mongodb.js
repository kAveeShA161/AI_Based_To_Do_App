import mongoose from "mongoose";    

const connectDB = async () => {

    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to DB');
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/AI_Based_To_Do_App`);
    
}

export default connectDB;
