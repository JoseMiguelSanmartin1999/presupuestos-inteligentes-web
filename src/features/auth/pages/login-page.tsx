
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";

import { LoginForm } from "@/components/auth/login-form";

import {
  getAccessToken,
  logout,
} from "@/services/auth.service";

import { isTokenLocallyValid } from "@/features/auth/utils/token.utils";

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = getAccessToken();
  const isAuthenticated = isTokenLocallyValid(token);

  if (token && !isAuthenticated) {
    logout();
  }

  const state = location.state as LoginLocationState | null;

  const requestedPath = state?.from;

  const destination =
    typeof requestedPath === "string" &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !requestedPath.startsWith("/\\") &&
    requestedPath !== "/login"
      ? requestedPath
      : "/dashboard";

  if (isAuthenticated) {
    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  return (
    <LoginForm
      onLoginSuccess={() => {
        navigate(destination, {
          replace: true,
        });
      }}
    />
  );
}
