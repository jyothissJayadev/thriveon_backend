import Speed from "../model/SpeedSchema.js";
// import Task from "../models/Task";
import mongoose from "mongoose";
import User from "../model/SpeedSchema.js";
// Create a new speed record for the day (first time creation)
import moment from "moment";
export const createSpeed = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming you're using middleware to authenticate and add userId

    // Get the current date
    const currentDate = new Date();

    // Array to hold the new Speed documents to be created
    const newSpeedDocuments = [];

    // Loop through the next 7 days, including today
    for (let i = 0; i < 7; i++) {
      // Get the date for the next day
      const currentDay = new Date(currentDate);
      currentDay.setDate(currentDate.getDate() + i);
      const formattedDay = currentDay.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'

      // Check if a Speed document already exists with the same userId and current day
      const existingSpeed = await Speed.findOne({ userId, day: formattedDay });

      if (!existingSpeed) {
        // If no existing Speed document for the current day, create a new one
        const newSpeed = new Speed({
          userId,
          completeSpeed: 0,
          tasks: [], // Initially set tasks as an empty array (can be populated later)
          day: formattedDay, // Set the day
        });

        // Add the new Speed document to the array
        newSpeedDocuments.push(newSpeed);
      }
    }

    // If there are any new Speed documents to be saved
    if (newSpeedDocuments.length > 0) {
      // Save all new Speed documents at once
      await Speed.insertMany(newSpeedDocuments);

      // Send response with the newly created Speed documents
      return res.status(201).json({
        message: "Speed records for the next 7 days created successfully.",
        data: newSpeedDocuments,
      });
    } else {
      // If no new Speed records were created because they already exist for the next 7 days
      return res.status(201).json({
        message:
          "Speed records for all the next 7 days already exist for this user.",
      });
    }
  } catch (error) {
    console.error("Error creating speed records:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// Get speed record for all users on the given day
export const getSpeedForTodayByUserId = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming userId is available in req.user from authentication middleware

    // Get current day in 'YYYY-MM-DD' format
    const currentDay = new Date().toISOString().split("T")[0];

    // Find the Speed document for the current day and the given userId
    const speed = await Speed.findOne({ userId, day: currentDay });

    if (!speed) {
      // If no Speed document is found, respond with an appropriate message
      return res.status(404).json({
        message: "No speed record found for today for this user.",
      });
    }

    // If found, return the Speed document
    return res.status(200).json({
      message: "Speed record found for today.",
      data: speed,
    });
  } catch (error) {
    console.error("Error fetching speed record:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const getAllSpeedByUserId = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming userId is available in req.user from authentication middleware

    // Get current date
    const today = new Date();

    // Get the day of the week (0 is Sunday, 1 is Monday, etc.)
    const dayOfWeek = today.getDay();

    // Calculate the difference in days from the current day to Monday
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If it's Sunday, go back 6 days to Monday
    const startOfWeek = moment()
      .startOf("week") // Start of the week (Sunday)
      .isoWeekday(7) // Set the day to Sunday (7)
      .startOf("day") // Start at 00:00
      .toDate(); // Convert to date object

    // Update the endOfWeek calculation to ensure it ends on Saturday at 23:59:59
    const endOfWeek = moment()
      .add(1, "week") // Move to the next week to make Saturday the end of the range
      .startOf("week") // Start of the week (Sunday)
      .isoWeekday(6) // Set the day to Saturday (6)
      .endOf("day") // End at 23:59:59
      .toDate();

    // Format the start and end of the week to "YYYY-MM-DD" format (to match 'day' field in your Speed model)
    const startDate = startOfWeek.toISOString().split("T")[0];
    const endDate = endOfWeek.toISOString().split("T")[0];
    console.log(startDate, endDate);
    // Find all Speed documents for the user within the current week (Monday to Sunday)
    const speeds = await Speed.find({
      userId,
      day: { $gte: startDate, $lte: endDate },
    });

    if (speeds.length === 0) {
      return res.status(404).json({
        message: "No speed records found for this user this week.",
      });
    }

    // If found, return the list of Speed documents
    return res.status(200).json({
      message: "Speed records for this week retrieved successfully.",
      data: speeds,
    });
  } catch (error) {
    console.error("Error fetching speed records:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAllSpeedWithoutUserId = async (req, res, next) => {
  try {
    // Get current date
    const today = new Date();

    // Get the day of the week (0 is Sunday, 1 is Monday, etc.)
    const dayOfWeek = today.getDay();

    // Calculate the difference in days from the current day to Monday
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If it's Sunday, go back 6 days to Monday
    const startOfWeek = moment()
      .startOf("week") // Start of the week (Sunday)
      .isoWeekday(7) // Set the day to Sunday (7)
      .startOf("day") // Start at 00:00
      .toDate(); // Convert to date object

    // Update the endOfWeek calculation to ensure it ends on Saturday at 23:59:59
    const endOfWeek = moment()
      .add(1, "week") // Move to the next week to make Saturday the end of the range
      .startOf("week") // Start of the week (Sunday)
      .isoWeekday(6) // Set the day to Saturday (6)
      .endOf("day") // End at 23:59:59
      .toDate();

    // Format the start and end of the week to "YYYY-MM-DD" format (to match 'day' field in your Speed model)
    const startDate = startOfWeek.toISOString().split("T")[0];
    const endDate = endOfWeek.toISOString().split("T")[0];
    console.log(startDate, endDate);

    // Find all Speed documents for the current week (Monday to Sunday)
    const speeds = await Speed.find({
      day: { $gte: startDate, $lte: endDate },
    }).populate("userId", "name"); // Populate the userId field with the name from User model

    if (speeds.length === 0) {
      return res.status(404).json({
        message: "No speed records found for this week.",
      });
    }
    console.log();
    // Group speeds by user name
    const groupedSpeeds = speeds.reduce((acc, speed) => {
      const userName = speed.userId.name; // Get the name from the populated userId

      // If the userName doesn't exist in the accumulator, create a new array for that userName
      if (!acc[userName]) {
        acc[userName] = [];
      }

      // Push the current speed document into the respective userName's array
      acc[userName].push(speed);

      return acc;
    }, {});

    // Convert the grouped speeds into an array of users
    const groupedSpeedsArray = Object.keys(groupedSpeeds).map((userName) => ({
      userName,
      speeds: groupedSpeeds[userName],
    }));

    // Return the grouped speeds for each user
    return res.status(200).json({
      message: "All speed records grouped by user name for this week.",
      data: groupedSpeedsArray,
    });
  } catch (error) {
    console.error("Error fetching speed records:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateSpeedTasks = async (req, res, next) => {
  try {
    const { taskId, speed } = req.body; // Extract taskId and speed from the request body
    const userId = req.user.userId; // Assuming userId is available in req.user from authentication middleware

    if (!taskId || speed === undefined) {
      return res.status(400).json({
        message: "Task ID and speed are required.",
      });
    }

    // Validate the taskId to check if it is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID format.",
      });
    }

    // Find the Speed document that matches the userId and day
    const currentDay = new Date().toISOString().split("T")[0]; // Get current day in 'YYYY-MM-DD' format

    // Find the Speed document for the current day and user
    const speedDoc = await Speed.findOne({ userId, day: currentDay });

    if (!speedDoc) {
      return res.status(404).json({
        message: "No speed record found for today for this user.",
      });
    }

    // Ensure tasks is initialized as an array if it is undefined
    if (!speedDoc.tasks) {
      speedDoc.tasks = [];
    }

    // Check if the task already exists in the tasks array
    const taskIndex = speedDoc.tasks.findIndex(
      (task) => task.taskId.toString() === taskId
    );

    if (taskIndex === -1) {
      // If the task doesn't exist, add it to the tasks array
      speedDoc.tasks.push({ taskId, speed });
    } else {
      // If the task exists, update its speed
      speedDoc.tasks[taskIndex].speed = speed;
    }
    speedDoc.completeSpeed = Math.round(
      speedDoc.tasks.reduce((total, task) => total + task.speed, 0) /
        speedDoc.tasks.length
    );
    // Save the updated Speed document
    await speedDoc.save();

    return res.status(200).json({
      message: "Task updated successfully.",
      data: speedDoc,
    });
  } catch (error) {
    console.error("Error updating speed tasks:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const updateCompleteSpeed = async (req, res, next) => {
  try {
    const { addSpeed } = req.body; // Extract addSpeed from the request body
    const userId = req.user.userId; // Assuming userId is available in req.user from authentication middleware

    if (addSpeed === undefined || addSpeed < 0) {
      return res.status(400).json({
        message:
          "Add speed is required and must be greater than or equal to 0.",
      });
    }

    // Get the current day in 'YYYY-MM-DD' format
    const currentDay = new Date().toISOString().split("T")[0];

    // Find the Speed document for the current day and user
    const speedDoc = await Speed.findOne({ userId, day: currentDay });

    if (!speedDoc) {
      return res.status(404).json({
        message: "No speed record found for today for this user.",
      });
    }

    // Calculate the new completeSpeed by adding addSpeed to the existing completeSpeed
    const newCompleteSpeed = speedDoc.completeSpeed + addSpeed;

    // Update the completeSpeed field
    speedDoc.completeSpeed = newCompleteSpeed;

    // Save the updated Speed document
    await speedDoc.save();

    return res.status(200).json({
      message: "Complete speed updated successfully.",
      data: speedDoc,
    });
  } catch (error) {
    console.error("Error updating complete speed:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const updateToRemoveCompleteSpeed = async (req, res, next) => {
  try {
    const { inputSpeedRemove } = req.body; // Extract inputSpeedRemove from the request body
    const userId = req.user.userId; // Assuming userId is available in req.user from authentication middleware

    if (inputSpeedRemove === undefined || inputSpeedRemove < 0) {
      return res.status(400).json({
        message:
          "Input speed to remove is required and must be greater than or equal to 0.",
      });
    }

    // Get the current day in 'YYYY-MM-DD' format
    const currentDay = new Date().toISOString().split("T")[0];

    // Find the Speed document for the current day and user
    const speedDoc = await Speed.findOne({ userId, day: currentDay });

    if (!speedDoc) {
      return res.status(404).json({
        message: "No speed record found for today for this user.",
      });
    }

    // Calculate the new completeSpeed by subtracting inputSpeedRemove from the existing completeSpeed
    const newCompleteSpeed = speedDoc.completeSpeed - inputSpeedRemove;

    // If the new completeSpeed would go below zero, prevent it
    if (newCompleteSpeed < 0) {
      return res.status(400).json({
        message: "Complete speed cannot be less than zero.",
      });
    }

    // Update the completeSpeed field
    speedDoc.completeSpeed = newCompleteSpeed;

    // Save the updated Speed document
    await speedDoc.save();

    return res.status(200).json({
      message: "Complete speed updated successfully.",
      data: speedDoc,
    });
  } catch (error) {
    console.error("Error removing speed:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
