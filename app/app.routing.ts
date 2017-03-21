import { AuthGuard } from "./auth-guard.service";

export const authProviders = [
  AuthGuard
];

export const appRoutes = [
  //Origin: try to go to groceries if passed anuth-guard.service or will go to back to here and direct to login.component
  { path: "", redirectTo: "/groceries", pathMatch: "full" }
];
