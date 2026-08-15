import { FiTrash2 } from "react-icons/fi";
import { GrView } from "react-icons/gr";
import ViewOrderModal from "../Componnent/ViewOrderModel";
import AddOrderModal from "../Componnent/AddOrderModal";
import { useEffect, useState } from "react";

export interface OrderItem {
  id: string | number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderDetails {
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

export default function Orders() {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [token] = useState(localStorage.getItem("token"));

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleViewOrder = (id: string) => {
    const foundOrder = orders.find((u) => u._id === id);
    if (foundOrder) {
      setSelectedOrder(foundOrder);
      setIsViewModalOpen(true);
    }
  };

  const handleOrderAdded = (newOrder: OrderDetails) => {
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data: OrderDetails[] = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (orderId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/deleteorder/${orderId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId),
      );
    } catch (error) {
      console.error((error as Error).message);
      alert((error as Error).message);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">Orders</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="text-xl bg-blue-700 px-5 py-3 rounded-xl font-bold text-white hover:bg-blue-800 transition-all cursor-pointer shadow-md"
        >
          Add Order
        </button>
      </div>

      <div className="mt-7">
        <input
          className="border-2 w-full h-14 rounded-lg border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-xl pl-5 focus:outline-none"
          type="text"
          placeholder="Search by customer name..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-full my-8">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-xl font-semibold text-gray-600">
              Loading...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-900 font-bold text-lg">
                  <th className="pb-8 font-bold pr-4">Order ID</th>
                  <th className="pb-8 font-bold pr-4">Customer</th>
                  <th className="pb-8 font-bold pr-4">Date</th>
                  <th className="pb-8 font-bold pr-4 text-center">Items</th>
                  <th className="pb-8 font-bold pr-4">Total</th>
                  <th className="pb-8 font-bold pr-4">Payment</th>
                  <th className="pb-8 font-bold pr-4">Status</th>
                  <th className="pb-8 font-bold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="text-gray-800 text-base font-semibold hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-6 pr-4 font-mono text-sm">
                        {order._id}
                      </td>
                      <td className="py-6 pr-4">{order.customer.name}</td>
                      <td className="py-6 pr-4">{order.date}</td>
                      <td className="py-6 pr-4 text-center">
                        {order.items ? order.items.length : 0}
                      </td>
                      <td className="py-6 pr-4">${order.total}</td>
                      <td className="py-6 pr-4">{order.payment}</td>
                      <td className="py-6 pr-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Processing"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="flex justify-center gap-4 py-6 text-center">
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          className="p-1 text-black hover:text-blue-600 transition-colors"
                          title="View Order"
                        >
                          <GrView className="w-6 h-6 stroke-[2.2]" />
                        </button>
                        <button
                          className="p-1 text-black hover:text-red-600 transition-colors"
                          title="Delete Order"
                          onClick={() => handleDelete(order._id)}
                        >
                          <FiTrash2 className="w-6 h-6 stroke-[2.2]" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      No Orders Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ViewOrderModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        order={selectedOrder}
      />

      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onOrderAdded={handleOrderAdded}
      />
    </div>
  );
}
