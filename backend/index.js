import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./db/connectDB.js";

// authentication routes
import authRouter from "./routes/auth.route.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  // methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser()) // allows us to parse cookies

app.use("/api/auth", authRouter);

// Function to start the server and connect to the database
const startServer = async () => {
  try {
    await connectDB(); // Establish database connection
    console.log("Connected to the database successfully");
    // Start the server after a successful DB connection
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  }
};

// start the application
startServer();
