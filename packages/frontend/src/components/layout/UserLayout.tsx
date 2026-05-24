import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded text-sm transition-colors ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-blue-200 hover:bg-blue-800 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-blue-900 flex flex-col shrink-0">
        <div className="p-5 text-lg font-bold text-white border-b border-blue-700">
          My Account
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/user/statement" className={navClass}>
            Statement
          </NavLink>
          <NavLink to="/user/wallet" className={navClass}>
            Wallet
          </NavLink>
        </nav>
        <div className="p-4 border-t border-blue-700">
          <p className="text-sm text-blue-300 truncate">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
