import jwt from "jsonwebtoken";
import User from "../model/UserSchema.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      name: decoded.name,
      phoneNumber: decoded.phoneNumber,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Authentication invalid",
    });
  }
};

// Middleware to ensure user can only access their own tasks
export const authorizeTaskAccess = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    if (task.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this task",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error checking task authorization",
    });
  }
};
