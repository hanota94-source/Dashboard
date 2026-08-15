import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import productRoutes from "./routes/productRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import customersRoutes from "./routes/customersRoutes.js";
import graphRoutes from "./routes/graphRoutes.js";
import login from "./routes/loginRoutes.js";
import { addLast10MonthsSales, topsales } from "./test.js";

const app = express();

const port = process.env.Port;

const mongodb = process.env.mongodb;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads")),
);

app.use(productRoutes);
app.use(ordersRoutes);
app.use(customersRoutes);
app.use(graphRoutes);
app.use(login);

const runPeriodicUpdates = async () => {
  try {
    await addLast10MonthsSales();
    await topsales();
  } catch (error) {
    console.error(error);
  }
};

mongoose
  .connect(mongodb)
  .then(async () => {
    console.log("MongoDB Connected");

    await runPeriodicUpdates();

    const FIVE_MINUTES = 5 * 60 * 1000;
    setInterval(runPeriodicUpdates, FIVE_MINUTES);

    app.listen(port, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
