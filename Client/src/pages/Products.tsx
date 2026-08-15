import { useEffect, useState } from "react";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import AddProductModal from "../Componnent/AddProductModal";

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

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iscostype, setIscostype] = useState("");
  const [isProductId, setProductId] = useState<string | undefined>("");

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [token] = useState(localStorage.getItem("token"));

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete/${productId}`, {
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

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId),
      );
    } catch (error) {
      console.error((error as Error).message);
      alert((error as Error).message);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ProductType[] = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Products</h1>
        <button
          className="text-2xl bg-blue-700 px-5 py-3 rounded-xl font-bold text-gray-300 hover:bg-blue-800 transition-all cursor-pointer"
          onClick={() => {
            setIsModalOpen(true);
            setIscostype("add Product");
            setProductId(undefined);
          }}
        >
          add Product
        </button>
      </div>

      <div className="mt-7">
        <input
          className="border-2 w-full h-15 rounded-lg border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] text-3xl pl-5 text-gray-800"
          type="text"
          placeholder="Search products..."
          value={searchQuery}
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
                  <th className="pb-6 font-bold">Product name</th>
                  <th className="pb-6 font-bold">Price Cost</th>
                  <th className="pb-6 font-bold">Selling Price</th>
                  <th className="pb-6 font-bold">Stock</th>
                  <th className="flex items-center justify-end gap-4 pr-2">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="text-gray-800 text-base font-semibold"
                    >
                      <td className="flex items-center gap-6 py-6">
                        <img
                          src={`${API_BASE_URL}${product.image}`}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                          alt={product.name}
                        />
                        {product.name}
                      </td>
                      <td className="py-6">${product.priceCost}</td>
                      <td className="py-6">${product.priceSelling}</td>
                      <td className="py-6">{product.stockQuantity}</td>
                      <td className="py-6">
                        <div className="flex items-center justify-end gap-4 pr-2">
                          <button
                            onClick={() => {
                              setIsModalOpen(true);
                              setIscostype("Edit Product");
                              setProductId(product._id);
                            }}
                            className="p-1 text-black hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <FiEdit3 className="w-6 h-6 stroke-[2.5]" />
                          </button>

                          <button
                            className="p-1 text-black hover:text-red-600 transition-colors"
                            title="Delete"
                            onClick={() => handleDelete(product._id)}
                          >
                            <FiTrash2 className="w-6 h-6 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No Products Found
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
        costype={iscostype}
        productid={isProductId}
        onProductAdded={fetchProducts}
      />
    </div>
  );
}
