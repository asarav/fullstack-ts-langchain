import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = `${process.env.MONGODB_URI}:${process.env.MONGODB_PORT}/${process.env.MONGODB_COLLECTION}`;
console.log(uri);

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected...");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
