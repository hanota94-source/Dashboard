import React, { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  FiX,
  FiTrash2,
  FiShoppingBag,
  FiUser,
  FiDollarSign,
} from "react-icons/fi";
import Select from "react-select";

export interface ICustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

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
  customer: ICustomer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export interface IOrderPayload {
  date: string;
  customer: ICustomer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  payment: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
}

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderAdded?: (newOrder: OrderDetails) => void;
}

interface ProductType {
  _id: string;
  name: string;
  priceCost: string | number;
  priceSelling: string | number;
  stockQuantity: string | number;
  description?: string;
  image?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderAdded,
}) => {
  const [customer, setCustomer] = useState<ICustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [items, setItems] = useState<OrderItem[]>([]);

  const [shippingFee, setShippingFee] = useState<number>(10);
  const [tax, setTax] = useState<number>(5);
  const [payment, setPayment] = useState<string>("Paid");
  const [status, setStatus] = useState<
    "Pending" | "Processing" | "Completed" | "Cancelled"
  >("Pending");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [products, setProducts] = useState<ProductType[]>([]);

  const [token] = useState(localStorage.getItem("token"));

  const handleItemChange = (
    id: string | number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "price" || field === "quantity"
                  ? Number(value)
                  : value,
            }
          : item,
      ),
    );
  };

  const hasFetched = useRef(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Network response was not ok");

      const data: ProductType[] = await response.json();

      const selectedNames = new Set(items.map((i) => i.name));
      setProducts(data.filter((prod) => !selectedNames.has(prod.name)));
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (isOpen && !hasFetched.current) {
      fetchProducts();
      hasFetched.current = true;
    }
  }, [isOpen]);

  const addItem = (item: ProductType) => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: item.name,
        price: Number(item.priceSelling) || 0,
        quantity: 1,
        image: item.image || "",
      },
    ]);

    setProducts((prev) => prev.filter((i) => i.name !== item.name));
  };

  const removeItem = (id: string | number) => {
    const removedItem = items.find((item) => item.id === id);

    setItems((prev) => prev.filter((item) => item.id !== id));

    if (removedItem) {
      setProducts((prev) => [
        ...prev,
        {
          name: removedItem.name,
          priceSelling: removedItem.price,
          image: removedItem.image,
        } as ProductType,
      ]);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + Number(shippingFee || 0) + Number(tax || 0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload: IOrderPayload = {
      date: new Date().toISOString().split("T")[0],
      customer,
      items,
      subtotal,
      shippingFee: Number(shippingFee || 0),
      tax: Number(tax || 0),
      total,
      payment,
      status,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const result = await response.json();
        const newCreatedOrder: OrderDetails = result.order || result;
        if (onOrderAdded) onOrderAdded(newCreatedOrder);
        onClose();
      } else {
        console.error("Error adding order");
      }
    } catch (error) {
      console.error("Error adding order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-100 text-left dir-ltr">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Add New Order
              </h2>
              <p className="text-sm text-slate-500">
                Fill in the details to create a new order in the system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiUser className="w-4 h-4" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={customer.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={customer.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+1 555 123 456"
                  value={customer.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="New York, USA"
                  value={customer.address}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCustomer({ ...customer, address: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <FiShoppingBag className="w-4 h-4" /> Order Items
              </h3>

              <Select<ProductType>
                options={products}
                getOptionValue={(option) => option._id}
                getOptionLabel={(option) => option.name}
                placeholder="Select product..."
                isSearchable
                onChange={(selectedProduct) => {
                  if (selectedProduct) {
                    addItem(selectedProduct);
                  }
                }}
              />
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-800">
                      {item.name || "Unnamed product"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-sm font-semibold text-indigo-600 min-w-[70px]">
                      ${item.price}
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleItemChange(item.id, "quantity", e.target.value)
                        }
                        className="w-20 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500"
                      />

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <FiDollarSign className="w-4 h-4" /> Status & Payment
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Order Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setStatus(e.target.value as any)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={payment}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setPayment(e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Shipping Fee:</span>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setShippingFee(Number(e.target.value))
                  }
                  className="w-20 px-2 py-1 text-left rounded border border-slate-200 bg-white"
                />
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Tax:</span>
                <input
                  type="number"
                  value={tax}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTax(Number(e.target.value))
                  }
                  className="w-20 px-2 py-1 text-left rounded border border-slate-200 bg-white"
                />
              </div>
              <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;
