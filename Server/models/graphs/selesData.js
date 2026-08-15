import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    sales: {
      type: Number,
      required: true,
      min: [0, "Sales cannot be negative"],
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
  },
  { timestamps: true },
);

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
