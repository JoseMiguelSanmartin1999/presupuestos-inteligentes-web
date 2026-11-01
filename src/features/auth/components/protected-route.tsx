
import { Navigate, Outlet, useLocation } from "react-router";

import { getAccessToken } from "@/services/auth.service";

export function ProtectedRoute() {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
