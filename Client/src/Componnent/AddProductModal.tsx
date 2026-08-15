import React, { useState, useRef, useEffect } from "react";

interface AddProductModalProps {
  isOpen?: boolean;
  onClose: () => void;
  costype?: string;
  productid?: string | null;
  onProductAdded: () => void;
}

interface ProductFormData {
  name: string;
  priceCost: string;
  stockQuantity: string;
  priceSelling: string;
  description: string;
  image: File | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AddProductModal({
  isOpen = true,
  onClose,
  costype = "Add Product",
  productid,
  onProductAdded,
}: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    priceCost: "",
    stockQuantity: "",
    priceSelling: "",
    description: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [token] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (productid && isOpen) {
      const fetchProductData = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/products/${productid}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (response.ok) {
            const data = await response.json();
            setFormData({
              name: data.name || "",
              priceCost: data.priceCost?.toString() || "",
              stockQuantity: data.stockQuantity?.toString() || "",
              priceSelling: data.priceSelling?.toString() || "",
              description: data.description || "",
              image: null,
            });
            if (data.image) {
              setImagePreview(`${API_BASE_URL}${data.image}`);
            }
          }
        } catch (error) {
          console.error("Failed to fetch product details:", error);
        }
      };
      fetchProductData();
    } else if (!productid && isOpen) {
      setFormData({
        name: "",
        priceCost: "",
        stockQuantity: "",
        priceSelling: "",
        description: "",
        image: null,
      });
      setImagePreview(null);
    }
  }, [productid, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("priceCost", Number(formData.priceCost).toString());
    data.append("stockQuantity", Number(formData.stockQuantity).toString());
    data.append("priceSelling", Number(formData.priceSelling).toString());
    data.append("description", formData.description);

    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    const isEdit = Boolean(productid);
    const url = isEdit
      ? `${API_BASE_URL}/api/productsedit/${productid}`
      : "${API_BASE_URL}/api/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        console.log(isEdit ? "Updated successfully!" : "Added successfully!");
        onClose();
        onProductAdded();
      } else {
        console.error("Failed to submit form");
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
          {costype}
        </h2>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-bold text-gray-900">
                Product name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Product name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-3 py-2 text-gray-700 shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-bold text-gray-900">
                Price Cost
              </label>
              <input
                type="number"
                name="priceCost"
                placeholder="0.00"
                value={formData.priceCost}
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-3 py-2 text-gray-700 shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-bold text-gray-900">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                placeholder="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-3 py-2 text-gray-700 shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-bold text-gray-900">
                Price Selling
              </label>
              <input
                type="number"
                name="priceSelling"
                placeholder="0.00"
                value={formData.priceSelling}
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-3 py-2 text-gray-700 shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-bold text-gray-900">
              Product Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Enter product description..."
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg bg-white px-3 py-2 text-gray-700 shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-bold text-gray-900">
              Product Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-28 rounded-lg bg-white shadow-inner border border-gray-300 cursor-pointer hover:bg-gray-50 transition overflow-hidden relative"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />

              {imagePreview ? (
                <div className="relative w-full h-full group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                    Click to Change Image
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg
                    className="w-8 h-8 text-gray-800 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">
                    Click or Drag to Upload Image
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition active:scale-95 capitalize cursor-pointer"
            >
              {costype}
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
