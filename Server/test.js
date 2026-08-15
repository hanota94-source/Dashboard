import mongoose from "mongoose";
import Sale from "./models/graphs/selesData.js";
import TopSelling from "./models/graphs/TopSelling.js";
import Order from "./models/Order.js";

const monthNames = [
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
];

function getLastNMonths(n = 10) {
  const months = [];
  const currentDate = new Date();

  for (let i = 0; i < n; i++) {
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1,
    );
    months.push({
      monthIndex: d.getMonth(),
      month: monthNames[d.getMonth()],
      year: d.getFullYear(),
      sales: 0,
    });
  }

  return months.reverse();
}

export async function addLast10MonthsSales() {
  try {
    const past10Months = getLastNMonths(10);

    const aggregatedData = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: {
            month: {
              $month: {
                $cond: {
                  if: { $eq: [{ $type: "$date" }, "string"] },
                  then: { $dateFromString: { dateString: "$date" } },
                  else: { $ifNull: ["$date", "$createdAt"] },
                },
              },
            },
            year: {
              $year: {
                $cond: {
                  if: { $eq: [{ $type: "$date" }, "string"] },
                  then: { $dateFromString: { dateString: "$date" } },
                  else: { $ifNull: ["$date", "$createdAt"] },
                },
              },
            },
          },
          totalSales: { $sum: { $toDouble: "$total" } },
        },
      },
    ]);

    const salesMap = {};
    aggregatedData.forEach((item) => {
      const key = `${item._id.month - 1}-${item._id.year}`;
      salesMap[key] = item.totalSales;
    });

    const finalChartData = past10Months.map((m) => {
      const key = `${m.monthIndex}-${m.year}`;
      return {
        month: m.month,
        year: m.year,
        sales: salesMap[key] || 0,
      };
    });

    const operations = finalChartData.map((data) => ({
      updateOne: {
        filter: { month: data.month, year: data.year },
        update: { $set: { sales: data.sales } },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      const result = await Sale.bulkWrite(operations);
    }
  } catch (error) {
    console.error(error.message);
  }
}

export async function topsales() {
  try {
    const orders = await Order.find();

    const allItems = orders.flatMap((order) => order.items);

    const salesMap = {};
    allItems.forEach((item) => {
      const name = item.name;
      if (!salesMap[name]) {
        salesMap[name] = { ...item.toObject(), totalQuantity: 0 };
      }
      salesMap[name].totalQuantity += item.quantity;
    });

    const topSales = Object.values(salesMap).sort(
      (a, b) => b.totalQuantity - a.totalQuantity,
    );

    const formattedSales = topSales.map((sale) => ({
      name: sale.name,
      sales: sale.totalQuantity,
    }));

    await TopSelling.deleteMany({});

    const savedData = await TopSelling.insertMany(formattedSales);
  } catch (error) {
    console.error(error.message);
  }
}
