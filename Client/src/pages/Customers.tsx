import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalPayed: number;
  lastOrder: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [token] = useState(localStorage.getItem("token"));

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/deletecustomer/${customerId}`,
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

      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer._id !== customerId),
      );
    } catch (error) {
      console.error((error as Error).message);
      alert((error as Error).message);
    }
  };

  const filteredCustomrs = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex">
        <h1 className="text-4xl font-bold text-gray-800">Customers</h1>
      </div>
      <div className="mt-7">
        <input
          className="border-2 w-full h-15 rounded-lg border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] text-3xl pl-5"
          type="text"
          placeholder="Search"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-full my-8">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-xl font-semibold text-gray-600">
              loading ...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-900 font-bold text-lg">
                  <th className="pb-8 font-bold pr-4">name</th>
                  <th className="pb-8 font-bold pr-4">Email</th>
                  <th className="pb-8 font-bold pr-4">Phone</th>
                  <th className="pb-8 font-bold pr-4">Total orders</th>
                  <th className="pb-8 font-bold pr-4">Total payed</th>
                  <th className="pb-8 font-bold pr-4">Last order</th>
                  <th className="pb-8 font-bold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredCustomrs && filteredCustomrs.length > 0 ? (
                  filteredCustomrs.map((customer) => (
                    <tr
                      key={customer._id}
                      className="text-gray-800 text-base font-semibold"
                    >
                      <td className="py-6 pr-4">{customer.name}</td>
                      <td className="py-6 pr-4">{customer.email}</td>
                      <td className="py-6 pr-4">{customer.phone}</td>
                      <td className="py-6 pr-4 text-center">
                        {customer.totalOrders}
                      </td>
                      <td className="py-6 pr-4">{customer.totalPayed}</td>
                      <td className="py-6 pr-4">{customer.lastOrder}</td>
                      <td className="py-6 text-center">
                        <button
                          className="p-1 text-black hover:text-red-600 transition-colors"
                          title="Delete Customer"
                          onClick={() => handleDelete(customer._id)}
                        >
                          <FiTrash2 className="w-6 h-6 stroke-[2.2]" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
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
