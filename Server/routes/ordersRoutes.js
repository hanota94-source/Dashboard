import express from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customers.js";
import { authenticateToken } from "./loginRoutes.js";

const router = express.Router();

router.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ في جلب البيانات",
      error: error.message,
    });
  }
});

router.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const {
      date,
      status,
      payment,
      customer,
      items,
      subtotal,
      shippingFee,
      tax,
      total,
    } = req.body;

    const formattedItems =
      items?.map((item) => ({
        name: item.name || "",
        image: item.image || "https://via.placeholder.com/100",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      })) || [];

    const newOrder = new Order({
      date,
      status: status || "Processing",
      payment: payment || "Paid",
      customer,
      items: formattedItems,
      subtotal,
      shippingFee,
      tax,
      total,
    });

    const savedOrder = await newOrder.save();

    const totalPrice = formattedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const updatedCustomer = await Customer.findOneAndUpdate(
      { email: customer.email ? customer.email.toLowerCase() : customer.name },
      {
        $set: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          lastOrder: new Date(),
        },
        $inc: {
          totalOrders: 1,
          totalPayed: totalPrice,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      },
    );

    res.status(201).json({
      message: "تم إنشاء الطلب بنجاح",
      order: savedOrder,
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "حدث خطأ في إنشاء الطلب",
      error: error.message,
    });
  }
});

router.delete("/api/deleteorder/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    res.status(200).json({
      message: "تم حذف الطلب بنجاح",
      deletedOrderId: id,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      message: "حدث خطأ في السيرفر أثناء الحذف",
      error: error.message,
    });
  }
});

export default router;
