import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded text-sm transition-colors ${
      isActive
        ? "bg-gray-700 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-900 flex flex-col shrink-0">
        <div className="p-5 text-lg font-bold text-white border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin/upload" className={navClass}>
            Upload CSV
          </NavLink>
          <NavLink to="/admin/report" className={navClass}>
            Report
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 truncate">{user?.name}</p>
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
