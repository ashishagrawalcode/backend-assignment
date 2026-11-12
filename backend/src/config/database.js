import mongoose from "mongoose";

// Connect our Node.js app to the MongoDB Atlas database.
export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected successfully");
}
