import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { AiFillDollarCircle, AiFillProduct } from "react-icons/ai";
import { FaShoppingBag } from "react-icons/fa";
import { HiIdentification } from "react-icons/hi2";
import { useEffect, useState } from "react";

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function Card({ title, value, icon }: CardProps) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>

      <div className="flex items-center gap-3 text-3xl font-bold mt-2 text-gray-800">
        <span className="text-emerald-500">{icon}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}

export interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  _id: string;
  date: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  payment: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [orders, setOredrs] = useState<OrderDetails[]>([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [topsales, setTopSales] = useState([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [token] = useState(localStorage.getItem("token"));

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setOredrs(data);

      const product = await (
        await fetch(`${API_BASE_URL}/api/products`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      ).json();

      setProducts(product);

      const customer = await (
        await fetch(`${API_BASE_URL}/api/customers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      ).json();

      setCustomers(customer);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setSales(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const fetchTopSales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/topsales`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setTopSales(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSales();
    fetchTopSales();
  }, []);

  return (
    <div className="min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-7">
        <Card
          title="Total Sales"
          value={orders.reduce((acc, order) => acc + order.total, 0) + "$"}
          icon={<AiFillDollarCircle className="text-4xl text-gray-800" />}
        />
        <Card
          title="Total Orders"
          value={orders.length}
          icon={<FaShoppingBag className="text-4xl text-gray-800" />}
        />
        <Card
          title="Total Products"
          value={products.length}
          icon={<AiFillProduct className="text-4xl text-gray-800" />}
        />
        <Card
          title="Total Customers"
          value={customers.length}
          icon={<HiIdentification className="text-4xl text-gray-800" />}
        />
      </div>

      <div className="flex gap-8 mt-11 flex-1">
        <div className="bg-white rounded-2xl p-6 shadow-sm w-full border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Sales Graph
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              Last 10 Months
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sales}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0066cc" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0066cc" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="#f0f0f0"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#666", fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#666", fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Sales",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0066cc"
                  strokeWidth={3}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-xl border border-gray-100">
          <h2 className="text-2xl font-normal text-gray-900 mb-6">
            Top Selling Products
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topsales}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                barSize={42}
              >
                <CartesianGrid
                  vertical={false}
                  horizontal={true}
                  stroke="#e5e5e5"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#111", fontSize: 13 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#333", fontSize: 13 }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar
                  dataKey="sales"
                  fill="#0052cc"
                  stroke="#002b80"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-full my-6">
        <h2 className="text-3xl font-bold text-black mb-8">last orders</h2>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-xl font-semibold text-gray-600">
              loading ...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-900 font-bold text-lg">
                  <th className="pb-6 font-bold">Order ID</th>
                  <th className="pb-6 font-bold">Customer</th>
                  <th className="pb-6 font-bold">Date</th>
                  <th className="pb-6 font-bold">Items</th>
                  <th className="pb-6 font-bold">Total</th>
                  <th className="pb-6 font-bold">Payment</th>
                  <th className="pb-6 font-bold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y-0">
                {orders && orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr
                      key={index}
                      className="text-gray-800 text-base font-medium"
                    >
                      <td className="py-4 font-semibold">{order._id}</td>
                      <td className="py-4">{order.customer.name}</td>
                      <td className="py-4">{order.date}</td>
                      <td className="py-4">{order.items.length}</td>
                      <td className="py-4 font-semibold">{order.total}</td>
                      <td className="py-4">{order.payment}</td>
                      <td className="py-4">{order.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      No Products Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
