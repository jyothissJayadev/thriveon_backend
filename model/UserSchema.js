import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    minlength: 3,
    maxlength: 50,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
    match: [/^\d{10}$/, "Phone number must be 10 digits"],
  },
  pincode: {
    type: String,
    required: [true, "Please provide a 4-digit pincode"],
    unique: true, // Add unique constraint
  },
  jobRoles: {
    type: [String], // Array of strings representing job roles
    required: [true, "Please provide at least one job role"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
});

// Create session token
UserSchema.methods.createToken = function () {
  return jwt.sign(
    { userId: this._id, name: this.name, phoneNumber: this.phoneNumber },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
};

export default mongoose.model("User", UserSchema);
