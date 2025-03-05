import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDb from "./database/conn.js";

// Route imports
import authRouter from "./routes/authrouter.js";
import taskRouter from "./routes/router.js";
import noteruoter from "./routes/noteRouter.js";
// Error handler middleware
import errorHandlerMiddleware from "./middleware/errorHandler.js";
import notFoundMiddleware from "./middleware/notFound.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("tiny")); // HTTP request logger
app.disable("x-powered-by"); // Disable X-Powered-By header

// API Routes
app.use("/api/auth", authRouter); // Authentication routes
app.use("/api/tasks", taskRouter); // Task routes
app.use("/api/notes", noteruoter);
// Error handling
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Port configuration
const port = process.env.PORT || 8081;

// Database connection and server startup
const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Server Error:", error);
    process.exit(1);
  }
};

start();

// Basic error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection:", error);
  process.exit(1);
});
