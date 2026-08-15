import express from "express";
const router = express.Router();
import selesData from "../models/graphs/selesData.js";
import TopSeles from "../models/graphs/TopSelling.js";
import { authenticateToken } from "./loginRoutes.js";

router.get("/api/sales", authenticateToken, async (req, res) => {
  try {
    const sales = await selesData.find();

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/topsales", authenticateToken, async (req, res) => {
  try {
    const sales = await TopSeles.find();

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
