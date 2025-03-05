import { Router } from "express";
import * as stickyNoteController from "../controller/noteController.js"; // Sticky note controller
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Sticky Note Routes

// Create a new sticky note
router.post("/notes", stickyNoteController.createNote);

// Get all sticky notes
router.get("/notes", stickyNoteController.getNotes);

// Update an existing sticky note
router.put("/notes/:noteId", stickyNoteController.updateNote);

// Delete a sticky note
router.delete("/notes/:noteId", stickyNoteController.deleteNote);

export default router;
