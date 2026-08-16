const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const {
  findUserByUsername,
  createUser,
  comparePassword,
  updateUserPassword,
} = require("../helpers/user");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, password, role, batchId } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const newUser = await createUser(username, password, role, batchId);

    // Automatically log user in after registration
    req.login(newUser, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error logging in after registration." });
      }
      const userSafe = { ...newUser };
      delete userSafe.password;
      return res.status(201).json(userSafe);
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/auth/login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error." });
    }
    if (!user) {
      return res
        .status(400)
        .json({ error: info.message || "Invalid credentials." });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Login session establishment failed." });
      }
      try {
        const isDefaultPassword = await comparePassword("student123", user.password);
        const userSafe = { ...user, isDefaultPassword };
        delete userSafe.password;
        return res.json(userSafe);
      } catch (error) {
        console.error("Error checking default password on login:", error);
        return res.json(user);
      }
    });
  })(req, res, next);
});

// POST /api/auth/logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ message: "Logged out successfully." });
  });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const { getDB } = require("../config/db");
      const db = getDB();
      const user = await db.collection("users").findOne({ _id: req.user._id });
      if (user) {
        const isDefaultPassword = await comparePassword("student123", user.password);
        const userSafe = { ...user, isDefaultPassword };
        delete userSafe.password;
        res.json(userSafe);
      } else {
        res.status(404).json({ error: "User not found." });
      }
    } catch (error) {
      console.error("Error fetching authenticated user details:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  } else {
    res.status(401).json({ error: "Not authenticated." });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current password and new password are required." });
  }

  const passwordRegex = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: "New password must be at least 6 characters long, contain at least one number, and contain at least one special character."
    });
  }

  try {
    const { getDB } = require("../config/db");
    const user = req.user;

    const db = getDB();
    const dbUser = await db.collection("users").findOne({ _id: user._id });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await comparePassword(currentPassword, dbUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    await updateUserPassword(dbUser._id, newPassword);
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
