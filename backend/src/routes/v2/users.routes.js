import { Router } from "express";
import { User } from "../../models/user.model.js";

export const router = Router();

// Read users
router.get("/", async (req, res, next) => {
  try {
    // 1. Get users data from database
    const users = await User.find();
    // 2. Send response object back to client
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

// Create user
router.post("/", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required." });
    }

    const newUser = await User.create({ username, email, password });

    const { password: _password, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// Update user
router.put("/:id", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required!" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, password },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.json(deletedUser);
  } catch (err) {
    next(err);
  }
});
