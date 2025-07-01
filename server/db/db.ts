import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
console.log(`${process.env.MONGODB_URI}${process.env.MONGODB_PORT}/${process.env.MONGODB_COLLECTION}`)

const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGODB_URI}${process.env.MONGODB_PORT}/${process.env.MONGODB_COLLECTION}`,
    );
    console.log("MongoDB Connected...");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
