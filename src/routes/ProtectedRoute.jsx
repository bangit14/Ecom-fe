import PropTypes from "prop-types";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentRole, hasPermission } from "../utils/authSession";

export default function ProtectedRoute({
  requiredRole,
  requiredRoles,
  allowedRoles,
  requiredPermission,
  redirectTo = "/login",
}) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  const role = getCurrentRole();

  if (requiredRole) {
    if (!role || role !== requiredRole.toUpperCase()) {
      return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
  }

  const roleList = requiredRoles || allowedRoles;
  if (Array.isArray(roleList) && roleList.length > 0) {
    const normalizedRoles = roleList.map((r) => r.toUpperCase());
    if (!role || !normalizedRoles.includes(role.toUpperCase())) {
      return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  requiredRole: PropTypes.string,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  requiredPermission: PropTypes.string,
  redirectTo: PropTypes.string,
};
