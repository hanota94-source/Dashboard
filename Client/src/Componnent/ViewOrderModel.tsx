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

interface ViewOrderProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ViewOrderModal({
  isOpen,
  onClose,
  order,
}: ViewOrderProps) {
  if (!isOpen || !order) return null;

  const statusStyles = {
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Processing: "bg-blue-100 text-blue-800 border-blue-300",
    Pending: "bg-amber-100 text-amber-800 border-amber-300",
    Cancelled: "bg-rose-100 text-rose-800 border-rose-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 my-8">
        <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-2">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{order._id}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[order.status]}`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Placed on {order.date}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/60">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Customer Details
            </h3>
            <p className="font-semibold text-gray-800">{order.customer.name}</p>
            <p className="text-sm text-gray-600">{order.customer.email}</p>
            <p className="text-sm text-gray-600">{order.customer.phone}</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/60">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Shipping Address
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {order.customer.address}
            </p>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Items Ordered
          </h3>
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-y border-gray-100">
              <tr>
                <th className="py-3 px-2">Product</th>
                <th className="py-3 px-2 text-center">Price</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${API_BASE_URL}${item.image}`}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee</span>
              <span>${order.shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-blue-600">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition active:scale-95"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
