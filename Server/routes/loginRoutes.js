import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "24h";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "غير مصرح: لا يوجد Token" });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "The code is invalid or expired." });
    }

    req.user = decodedUser;
    next();
  });
};

router.post("/api/register", authenticateToken, async (req, res) => {
  try {
    const { username, pass } = req.body;

    if (!username || !pass) {
      return res
        .status(400)
        .json({ message: "يرجى تقديم اسم المستخدم وكلمة المرور" });
    }

    const finduser = await Users.findOne({ username });
    if (finduser) {
      return res.status(400).json({ message: "هذا المستخدم موجود بالفعل" });
    }

    const psshashed = await bcrypt.hash(pass, 10);

    const newUser = new Users({ username, pass: psshashed, role: "admin" });

    const savedUser = await newUser.save();

    return res.status(201).json({
      user: { id: savedUser._id, username: savedUser.username },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "حدث خطأ في السيرفر", error: error.message });
  }
});

router.put("/api/register/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, pass } = req.body;

    const existingUser = await Users.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const updateData = {};
    if (username) updateData.username = username;

    if (pass) {
      updateData.pass = await bcrypt.hash(pass, 10);
    }

    const updatedUser = await Users.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "تم تحديث بيانات المستخدم بنجاح",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ message: "حدث خطأ في السيرفر", error: error.message });
  }
});

router.delete("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Users.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Users.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
      deletedProductId: id,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const safeUser = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    return res.status(200).json(safeUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const user = await Users.find();

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const safeUser = user.map((user) => ({
      _id: user._id,
      username: user.username,
      role: user.role,
    }));

    return res.status(200).json(safeUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const { username, pass } = req.body;

    if (typeof username !== "string" || typeof pass !== "string") {
      return res.status(400).json({ message: "Invalid input types" });
    }

    if (!username || !pass) {
      return res
        .status(400)
        .json({ message: "Please enter your username and password." });
    }

    const user = await Users.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    const isPasswordValid = await bcrypt.compare(pass, user.pass);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/api/auth/check", authenticateToken, (req, res) => {
  return res.status(200).json({
    valid: true,
  });
});

export default router;
