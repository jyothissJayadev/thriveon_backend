import User from "../model/UserSchema.js"; // Adjust the import based on your file structure

export const register = async (req, res) => {
  try {
    const { name, phoneNumber, pincode, jobRoles } = req.body;

    // Validate phone number format
    if (!phoneNumber.match(/^\d{10}$/)) {
      return res.status(400).json({
        success: false,
        error: "Phone number must be 10 digits",
      });
    }

    // Validate pincode format
    if (!pincode.match(/^\d{4}$/)) {
      return res.status(400).json({
        success: false,
        error: "Pincode must be 4 digits",
      });
    }

    // Check if phone number already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Phone number already registered",
      });
    }

    // Check if jobRoles is provided and is an array
    if (!jobRoles || !Array.isArray(jobRoles) || jobRoles.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide at least one job role",
      });
    }

    // Create user
    const user = await User.create({
      name,
      phoneNumber,
      pincode,
      jobRoles, // Include job roles when creating the user
    });

    const token = user.createToken();

    res.status(201).json({
      success: true,
      user: {
        name: user.name,
        phoneNumber: user.phoneNumber,
        jobRoles: user.jobRoles, // Return job roles in the response
      },
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Login user
// Login user (using only pincode)
// Login user (using only pincode)
// Login user (using only pincode)
// Login user (using only pincode)
export const login = async (req, res) => {
  try {
    const { pincode } = req.body;

    // Log the pincode to check if it's received correctly
    console.log("Received pincode:", pincode);

    // Validate input (only pincode should be provided)
    if (!pincode) {
      return res.status(400).json({
        success: false,
        error: "Please provide pincode",
      });
    }

    // Find user by pincode (not by phone number)
    const user = await User.findOne({ pincode }); // Search by pincode
    if (!user) {
      console.log("No user found for this pincode");
      return res.status(401).json({
        success: false,
        error: "Invalid pincode",
      });
    }

    // Log the user found and their pincode for debugging
    console.log("User found:", user);
    console.log("Stored pincode in DB:", user.pincode);

    // Compare the plain pincode directly (no hashing)
    if (user.pincode !== pincode) {
      return res.status(401).json({
        success: false,
        error: "Invalid pincode",
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    const token = user.createToken();

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        phoneNumber: user.phoneNumber,
        jobRoles: user.jobRoles, // Optionally send phone number or not
      },
      token,
    });
  } catch (error) {
    console.log("Error during login:", error); // Log the error for debugging
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, pincode } = req.body;
    const user = await User.findById(req.user.userId);

    if (name) user.name = name;
    if (pincode) {
      if (!pincode.match(/^\d{4}$/)) {
        return res.status(400).json({
          success: false,
          error: "Pincode must be 4 digits",
        });
      }
      user.pincode = pincode;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
