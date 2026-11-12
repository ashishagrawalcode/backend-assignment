import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 4000;

// Start the Express server only after we have a database connection.
async function startServer() {
  if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET) {
    console.error("Please set MONGODB_URI and SESSION_SECRET in your .env file");
    process.exit(1);
  }

  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
