import { Router } from "express";
import * as authController from "../controller/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/update-profile", authenticateUser, authController.updateProfile);

export default router;
