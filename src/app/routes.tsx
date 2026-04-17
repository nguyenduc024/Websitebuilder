import { Navigate, createBrowserRouter } from "react-router";
import { AppLayout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { DoctorsDirectory } from "./pages/DoctorsDirectory";
import { PatientsHub } from "./pages/PatientsHub";
import { Appointments } from "./pages/Appointments";
import { DoctorWorkspace } from "./pages/DoctorWorkspace";
import { Billing } from "./pages/Billing";
import { Login } from "./pages/Login";
import { isAuthenticated } from "./lib/auth";

function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "doctors", Component: DoctorsDirectory },
      { path: "patients", Component: PatientsHub },
      { path: "appointments", Component: Appointments },
      { path: "workspace", Component: DoctorWorkspace },
      { path: "billing", Component: Billing },
      { path: "*", Component: () => <div>Page Not Found</div> },
    ],
  },
]);
