import mongoose from "mongoose";

const SpeedSchema = new mongoose.Schema({
  speedId: {
    type: String,
    required: true,
    unique: true,
    default: () => `speed-${Date.now()}`,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  completeSpeed: {
    type: Number,
    required: true,
    min: 0,
  },
  tasks: [
    {
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task", // Reference to the Task schema
        required: true,
      },
      speed: {
        type: Number,
        min: 0, // Speed associated with the specific task
        required: true,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  day: {
    type: String,
    required: true,
    default: function () {
      return this.createdAt.toISOString().split("T")[0]; // Extracts the date in YYYY-MM-DD format
    },
  },
});

SpeedSchema.pre("save", function (next) {
  // Ensure the 'day' field is always updated based on the createdAt timestamp
  if (!this.day) {
    this.day = this.createdAt.toISOString().split("T")[0]; // Assign the date to 'day' in YYYY-MM-DD format
  }
  next();
});

export default mongoose.model("Speed", SpeedSchema);
