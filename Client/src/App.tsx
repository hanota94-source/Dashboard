import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Componnent/Sidebar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./Componnent/ProtectedRoute";

function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-[250px] flex-1 p-8">
        <Routes>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<MainLayout />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
