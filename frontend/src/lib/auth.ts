import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  exp?: number;
};

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return true;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function clearSession(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("selected_organization_id");
  localStorage.removeItem("selected_organization_slug");
}
