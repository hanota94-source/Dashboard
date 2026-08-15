import express from "express";
const router = express.Router();
import Customers from "../models/Customers.js";
import { authenticateToken } from "./loginRoutes.js";

router.get("/api/customers", authenticateToken, async (req, res) => {
  try {
    const orders = await Customers.find();

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete(
  "/api/deletecustomer/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Customers.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await Customers.findByIdAndDelete(id);

      res.status(200).json({
        message: "Product deleted successfully",
        deletedProductId: id,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

export default router;
