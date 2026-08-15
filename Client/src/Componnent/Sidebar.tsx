import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";

interface NavItem {
  name: string;
  nav: string;
}

interface User {
  id: String;
  username: String;
  role: String;
}

const navs: NavItem[] = [
  { name: "Dashboard", nav: "/dashboard" },
  { name: "Products", nav: "/products" },
  { name: "Orders", nav: "/orders" },
  { name: "Customers", nav: "/customers" },
  { name: "Users", nav: "/users" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser) as User;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  function color(nav: String) {
    return location.pathname === nav;
  }
  return (
    <div className="fixed top-0 left-0 h-screen w-[250px] bg-white shadow-lg z-50 flex flex-col justify-between p-6">
      <div className="flex flex-col items-center h-full gap-12 pt-7">
        <h1 className="text-3xl font-bold">Shop</h1>
        <nav className="flex flex-col gap-14">
          {navs.map((nav) => (
            <Link
              key={nav.nav}
              to={nav.nav}
              className={`text-[25px] font-[500] rounded-xl px-7 py-2 transition-all duration-300 ${
                color(nav.nav)
                  ? "bg-gradient-to-r from-blue-700 to-blue-400 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {nav.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-between gap-3 w-full p-3 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
          {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-gray-800 text-sm truncate">
            {user?.username || "Guest"}
          </span>
          <span className="text-xs text-gray-400 truncate">
            {user?.role || "User"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shrink-0 justify-end"
        >
          <BiLogOut />
        </button>
      </div>
    </div>
  );
}
