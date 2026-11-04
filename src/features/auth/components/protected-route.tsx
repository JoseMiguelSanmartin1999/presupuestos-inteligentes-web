
import { Navigate, Outlet, useLocation } from "react-router";

import {
  getAccessToken,
  logout,
} from "@/services/auth.service";

import { isTokenLocallyValid } from "@/features/auth/utils/token.utils";

export function ProtectedRoute() {
  const location = useLocation();

  const token = getAccessToken();

  if (!isTokenLocallyValid(token)) {
    if (token) {
      logout();
    }

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  return <Outlet />;
}
