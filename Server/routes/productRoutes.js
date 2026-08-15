import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs";
import Product from "../models/Product.js";
import { authenticateToken } from "./loginRoutes.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post(
  "/api/products",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, priceCost, stockQuantity, priceSelling, description } =
        req.body;

      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      const newProduct = new Product({
        name,
        priceCost: Number(priceCost),
        stockQuantity: Number(stockQuantity),
        priceSelling: Number(priceSelling),
        description,
        image: imagePath,
      });

      await newProduct.save();

      res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

router.get("/api/products", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "غير موجود" });
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put(
  "/api/productsedit/:id",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, priceCost, stockQuantity, priceSelling, description } =
        req.body;

      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      const imagePath = req.file
        ? `/uploads/${req.file.filename}`
        : existingProduct.image;

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name,
          priceCost: Number(priceCost),
          stockQuantity: Number(stockQuantity),
          priceSelling: Number(priceSelling),
          description,
          image: imagePath,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

router.delete("/api/delete/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const imageRelativePath = product.image.startsWith("/")
        ? product.image.slice(1)
        : product.image;

      const imageAbsolutePath = path.join(__dirname, "..", imageRelativePath);

      fs.unlink(imageAbsolutePath, (err) => {
        if (err) {
          console.error(
            "Failed to delete image file from server:",
            err.message,
          );
        }
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProductId: id,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
