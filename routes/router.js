import { Router } from "express";
import * as taskController from "../controller/control.js"; // Task controller
import * as categoryController from "../controller/categoryControl.js"; // Category controller
import * as speedController from "../controller/speedController.js";
import {
  authenticateUser,
  authorizeTaskAccess,
} from "../middleware/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Task Routes
router.post("/tasks", taskController.createTask);
router.get("/tasks", taskController.getTasks);
router.get("/tasks/:timeframe", taskController.getTasksByTimeframe);
router.get("/tasks/id/:taskId", taskController.getTaskById);
router.put("/tasks/:taskId", taskController.updateTask);
router.delete("/tasks/:taskId", taskController.deleteTask);
router.delete(
  "/tasks/:timeframe/delete-completed",
  taskController.deleteCompletedTasksByTimeframe
);
router.put(
  "/tasks/:taskId/completed-units",
  taskController.updateCompletedUnits
);
// Add this route in the router.js
router.put("/tasks/:taskId/priority", taskController.updateTaskPriority);
// Add this route in the router.js
router.put("/tasks/:taskId/times", taskController.updateStartAndEndTimes);

// Category Routes
// Create a new category
router.post("/categories", categoryController.createCategory);

// Get all categories for the user
router.get("/categories", categoryController.getCategories);

// Update a category (e.g., color, children tasks)
router.put(
  "/categories/:categoryId/children/update",
  categoryController.updateChildInCategory
);

// Route for deleting a child task from a category
router.delete(
  "/categories/:categoryId/children/delete",
  categoryController.deleteChildTasks
);

// Delete a category
router.delete("/categories/:categoryId", categoryController.deleteCategory);
//speed
// Get all speed objects
router.get("/speeds", speedController.getAllSpeedWithoutUserId);
router.get("/speeds/today", speedController.getSpeedForTodayByUserId);
router.get("/speeds/user", speedController.getAllSpeedByUserId);
// Create a new speed object (POST)
router.post("/speeds", speedController.createSpeed);

// Update tasks in the speed object (PUT)
router.put("/speeds", speedController.updateSpeedTasks);
router.put("/speedsComplete", speedController.updateCompleteSpeed);
export default router;
