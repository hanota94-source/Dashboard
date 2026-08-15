import mongoose from "mongoose";

const productSaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true],
      trim: true,
    },
    sales: {
      type: Number,
      required: [true],
      min: [0],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const TopSelling = mongoose.model("topsales", productSaleSchema);

export default TopSelling;
