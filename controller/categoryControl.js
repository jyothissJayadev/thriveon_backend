import Category from "../model/CategorySchema.js";
import Task from "../model/TaskSchema.js"; // For referencing tasks
import mongoose from "mongoose";
export const createCategory = async (req, res, next) => {
  let { name, description, parent_task, children, color } = req.body; // Change `const` to `let` for `color`
  const userId = req.user.userId;

  try {
    // Validate required fields
    if (!name || !parent_task || !color) {
      return res.status(400).json({
        success: false,
        message: "Name, parent task, and color are required.",
      });
    }

    // Check if the parent task exists and belongs to the user
    const parentTask = await Task.findOne({ _id: parent_task, user: userId });
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: "Parent task not found or does not belong to the user.",
      });
    }

    // Stage 1: Check if the parent task is already assigned to another category
    const existingCategory = await Category.findOne({ parent_task });
    if (existingCategory) {
      // If the parent task is part of another category, use the color from that category
      return res.status(400).json({
        success: false,
        message:
          "This parent task is already assigned to an existing category. It belongs to another category with color: " +
          existingCategory.color,
      });
    }

    // Stage 2: Check if the parent task is a child of another category
    const parentCategory = await Category.findOne({ children: parent_task });
    if (parentCategory) {
      // If the parent task is a child in another category, use its color
      color = parentCategory.color;
    }

    // Check if the children tasks exist and belong to the user
    const childrenTasks = await Task.find({
      _id: { $in: children },
      user: userId,
    });
    if (childrenTasks.length !== children.length) {
      return res.status(404).json({
        success: false,
        message:
          "Some or all children tasks not found or do not belong to the user.",
      });
    }

    // Create a new category
    const newCategory = new Category({
      name,
      description,
      parent_task,
      children,
      color,
      user: userId, // Associate category with the user
    });

    // Save the category
    await newCategory.save();

    // Update the parent task with the new category and color
    parentTask.category = newCategory._id;
    parentTask.color = color; // Set the color from the category
    parentTask.completedUnits = 0; // Set completedUnits to 0
    parentTask.lock = 2; // Lock the task

    // Save the updated parent task
    await parentTask.save();

    res.status(201).json({
      success: true,
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return next(error);
  }
};

export const getCategories = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Fetch categories belonging to the user and populate the parent_task and children with task details
    const categories = await Category.find({ user: userId }) // Ensure categories belong to the user
      .populate({
        path: "parent_task",
        select: "taskName numberOfUnits completedUnits createdAt endDate", // Include the necessary task details
      })
      .populate({
        path: "children",
        select: "taskName numberOfUnits completedUnits createdAt endDate", // Include the necessary task details
      });

    // Check if categories are found
    if (!categories.length) {
      return res.status(404).json({
        success: false,
        message: "No categories found for this user.",
      });
    }

    // Return the populated categories
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
};

export const updateChildInCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { taskId, numberOfUnits } = req.body; // Only a single child task change

  try {
    if (numberOfUnits < 2) {
      return res.status(400).json({
        success: false,
        message: "The number of units must be at least 2.",
      });
    }
    // Find the category by ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // Check if the parent task exists and is not the same as the child
    const parentTask = await Task.findById(category.parent_task);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: "Parent task not found.",
      });
    }

    // Check if the child task exists
    const childTask = await Task.findById(taskId);
    if (!childTask) {
      return res.status(404).json({
        success: false,
        message: "Child task not found.",
      });
    }

    // Check if the child task is the parent task itself (you cannot add the parent task as a child)
    if (taskId === category.parent_task.toString()) {
      return res.status(400).json({
        success: false,
        message: "A category cannot contain its own parent task as a child.",
      });
    }

    // Check if the child task is already in the category's children array
    if (category.children.includes(taskId)) {
      return res.status(400).json({
        success: false,
        message: "This child task is already part of the same category.",
      });
    }

    // Check if the child task is already assigned to another category
    if (childTask.category && childTask.category.toString() !== categoryId) {
      return res.status(400).json({
        success: false,
        message:
          "This task is already assigned to another category and cannot be added.",
      });
    }

    // --- ADD THE CODE HERE ---
    // Calculate the total number of units for all child tasks, including the new child being added
    const totalChildUnits = await category.children.reduce(
      async (sum, childTaskId) => {
        const child = await Task.findById(childTaskId);
        return sum + (child ? child.numberOfUnits : 0);
      },
      0
    );

    // Add the new child task's units to the total
    const newTotalChildUnits = totalChildUnits + numberOfUnits;

    // Check if adding this new child task's units will exceed the parent task's units
    if (newTotalChildUnits > parentTask.numberOfUnits) {
      return res.status(400).json({
        success: false,
        message:
          "The total units of child tasks (including the new one) cannot exceed the parent's total units.",
      });
    }

    // Update the category's children array to include the new child task
    category.children.push(taskId);

    // Save the updated category
    await category.save();

    // Update the child task with the new details (completedUnits, lock)
    childTask.completedUnits = 0; // Reset completedUnits to 0
    childTask.numberOfUnits = numberOfUnits || childTask.numberOfUnits; // Update numberOfUnits
    childTask.lock = 1; // Lock set to 1
    childTask.category = category._id; // Assign the category to the child task
    childTask.color = category.color;
    // Save the updated child task
    await childTask.save();

    res.status(200).json({
      success: true,
      message: "Child updated successfully.",
      category,
    });
  } catch (error) {
    console.error("Error updating category child:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category child.",
    });
  }
};

// Delete a child task from the category
export const deleteChildTasks = async (req, res) => {
  const { categoryId } = req.params;
  const { taskId } = req.body; // Task ID to be deleted from category

  try {
    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // Check if the task is assigned as a child in this category
    const childIndex = category.children.indexOf(taskId);

    if (childIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Child task not found in this category.",
      });
    }

    // Remove the child task from the category's children array
    category.children.splice(childIndex, 1);

    // Save the updated category
    await category.save();

    // Remove the task's category reference
    const childTask = await Task.findById(taskId);
    if (childTask) {
      // Update the child task's details after removal
      childTask.lock = 0;
      childTask.category = null;
      childTask.color = "FFFFFF"; // Default color when removed from category
      await childTask.save();
    }

    res.status(200).json({
      success: true,
      message: "Child task deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting child task:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting child task.",
    });
  }
};

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);
    const parentTask = await Task.findById(category.parent_task);
    if (parentTask) {
      parentTask.category = null;
      parentTask.lock = 0;
      parentTask.color = "FFFFFF";
      await parentTask.save();
    }

    // Update child tasks
    const childrenTasks = await Task.find({ _id: { $in: category.children } });
    for (let child of childrenTasks) {
      child.category = null;
      child.lock = 0;
      child.color = "FFFFFF";
      await child.save();
    }
    // Send success response
    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category.",
    });
  }
};
