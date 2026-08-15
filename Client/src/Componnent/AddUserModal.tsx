import React, { useState, useEffect } from "react";

interface AddUserModalProps {
  isOpen?: boolean;
  onClose: () => void;
  userId?: string | null;
  onUserAdded: () => void;
}

interface UserFormData {
  UserName: string;
  Password: string;
  Role: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AddUserModal({
  isOpen = true,
  onClose,
  userId,
  onUserAdded,
}: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    UserName: "",
    Password: "",
    Role: "user",
  });

  const isEdit = Boolean(userId);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userId && isOpen) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setFormData({
              UserName: data.username || data.UserName || "",
              Password: "",
              Role: data.role || data.Role || "user",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      };
      fetchUserData();
    } else if (!userId && isOpen) {
      setFormData({
        UserName: "",
        Password: "",
        Role: "user",
      });
    }
  }, [userId, isOpen, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      username: formData.UserName,
      pass: formData.Password,
      role: formData.Role,
    };

    const url = isEdit
      ? `${API_BASE_URL}/api/register/${userId}`
      : `${API_BASE_URL}/api/register`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(isEdit ? "Updated successfully!" : "Added successfully!");
        onClose();
        onUserAdded();
      } else {
        const errorData = await response.json();
        console.error("Failed to submit form:", errorData.message);
      }
    } catch (error) {
      console.error("Form submit error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#dcdcdc] p-6 text-gray-900 shadow-2xl border border-gray-400">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-black capitalize">
          {isEdit ? "Edit User" : "Add User"}
        </h2>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex w-full">
            <div className="w-full">
              <label className="block mb-1 text-sm font-bold text-gray-900">
                UserName
              </label>
              <input
                type="text"
                name="UserName"
                placeholder="UserName"
                value={formData.UserName}
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-3 py-2 text-gray-700 shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex w-full">
            <div className="w-full">
              <label className="block mb-1 text-sm font-bold text-gray-900">
                Password
              </label>
              <input
                type="password"
                name="Password"
                placeholder={isEdit ? "Leave blank to keep same" : "Password"}
                value={formData.Password}
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-3 py-2 text-gray-700 shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isEdit}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="Role"
              className="block mb-1 text-sm font-bold text-gray-900"
            >
              Role
            </label>
            <select
              id="Role"
              name="Role"
              value={formData.Role}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition active:scale-95 capitalize cursor-pointer"
            >
              {isEdit ? "Save Changes" : "Add User"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#cccccc] border border-gray-400 px-6 py-2.5 text-sm font-bold text-black shadow-sm hover:bg-gray-300 transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
