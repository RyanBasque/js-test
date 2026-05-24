import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute() {
  const { token, user } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
