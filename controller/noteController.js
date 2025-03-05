import Note from "../model/noteSchema.js"; // Update path to the correct schema

// Create a new note
export const createNote = async (req, res, next) => {
  const { title, content, color } = req.body;
  const userId = req.user.userId;

  try {
    if (!title || !content || !color) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if a note with the same title already exists for the user
    const existingNote = await Note.findOne({ title, user: userId });
    if (existingNote) {
      const error = new Error(
        `A note with this title already exists: ${title}. Please choose a different title.`
      );
      error.statusCode = 400;
      return next(error);
    }

    // Create a new note
    const newNote = new Note({
      title,
      content,
      color,
      user: userId,
    });

    // Save the note to the database
    await newNote.save();

    // Return the created note
    res.status(201).json({
      success: true,
      note: newNote,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return next(error); // Ensure any other error is passed to the error handling middleware
  }
};

// Get all notes for a user
export const getNotes = async (req, res) => {
  const userId = req.user.userId;

  try {
    const notes = await Note.find({ user: userId });

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ success: false, message: "Error fetching notes" });
  }
};

// Get a single note by its ID
export const getNoteById = async (req, res) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ _id: noteId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Error fetching note by ID:", error);
    res.status(500).json({ success: false, message: "Error fetching note" });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const { title, content, color } = req.body;

  try {
    // Find note by ID
    const note = await Note.findOne({ _id: noteId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    // Update note properties
    note.title = title || note.title;
    note.content = content || note.content;
    note.color = color || note.color;
    note.lastEdited = Date.now(); // Update lastEdited timestamp

    // Save the updated note
    await note.save();

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ success: false, message: "Error updating note" });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ _id: noteId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    // Use deleteOne or findByIdAndDelete
    await Note.findByIdAndDelete(noteId);

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ success: false, message: "Error deleting note" });
  }
};
