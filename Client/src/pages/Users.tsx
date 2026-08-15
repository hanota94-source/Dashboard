import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { IoMdPersonAdd } from "react-icons/io";
import AddProductModal from "../Componnent/AddUserModal";

export interface User {
  _id: string;
  username: string;
  role: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductId, setProductId] = useState<string | undefined>("");

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [token] = useState(localStorage.getItem("token"));

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUsers(data);
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
      const currentUserId = localStorage.getItem("userid")?.trim();
      const targetId = customerId?.toString().trim();

      if (currentUserId == targetId) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${customerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== customerId),
      );
    } catch (error) {
      console.error((error as Error).message);
      alert((error as Error).message);
    }
  };

  const filteredCustomrs = users.filter((customer) =>
    customer.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Users</h1>
        <button
          className="text-2xl bg-blue-700 px-5 py-3 rounded-xl font-bold text-gray-300 hover:bg-blue-800 transition-all cursor-pointer"
          onClick={() => {
            setIsModalOpen(true);
            setProductId(undefined);
          }}
        >
          add User
        </button>
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
                  <th className="pb-8 font-bold pr-4">Name</th>
                  <th className="pb-8 font-bold pr-4">Role</th>
                  <th className="pb-8 font-bold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredCustomrs && filteredCustomrs.length > 0 ? (
                  filteredCustomrs.map((user) => (
                    <tr
                      key={user._id}
                      className="text-gray-800 text-base font-semibold transition-colors"
                    >
                      <td className="py-6 pr-4">{user.username}</td>
                      <td className="py-6 pr-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="flex justify-center gap-4 py-6 text-center">
                        <button
                          className="p-1 hover:text-blue-600 transition-colors"
                          title="Edit User"
                          onClick={() => {
                            setIsModalOpen(true);
                            setProductId(user._id);
                          }}
                        >
                          <IoMdPersonAdd className="w-5 h-5" />
                        </button>

                        <button
                          className="p-1 hover:text-red-600 transition-colors"
                          title="Delete User"
                          onClick={() => handleDelete(user._id)}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-gray-500 font-normal"
                    >
                      No Users Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={isProductId}
        onUserAdded={fetchProducts}
      />
    </div>
  );
}
