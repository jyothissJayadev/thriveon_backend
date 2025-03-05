import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
    default: () => `task-${Date.now()}`,
  },
  taskName: {
    type: String,
    required: true,
  },
  numberOfUnits: {
    type: Number,
    required: true,
    min: 1,
  },
  completedUnits: {
    type: Number,
    required: true,
    min: 0,
  },
  timeframe: {
    type: String,
    enum: ["day", "week", "month", "none"],
    default: "none",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: mongoose.Schema.Types.Mixed, // Allows null or string
    required: false,
    default: null,
  },
  priority: {
    type: Number,
    default: 1,
  },
  color: {
    type: String,
    default: "#FFFFFF",
  },
  duration: {
    type: Number, // Duration in hours (e.g., 2, 3, 4 hours)
    required: true,
  },
  lock: {
    type: Number,
    default: 0, // lock field with default value 0
  },
});

TaskSchema.pre("save", function (next) {
  if (this.isNew) {
    const durationInHours = this.duration;
    this.endDate = new Date(
      this.createdAt.getTime() + durationInHours * 60 * 60 * 1000
    );
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Task", TaskSchema);
