import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priceCost: { type: Number, required: true },
    stockQuantity: { type: Number, required: true },
    priceSelling: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
