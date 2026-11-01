
import { Navigate, useNavigate } from "react-router";

import { LoginForm } from "@/components/auth/login-form";
import { getAccessToken } from "@/services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();

  if (getAccessToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <LoginForm
      onLoginSuccess={() => {
        navigate("/dashboard", { replace: true });
      }}
    />
  );
}
