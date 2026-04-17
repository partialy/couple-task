import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AdminLayout from "@/layouts/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import UsersPage from "@/pages/UsersPage";
import TasksPage from "@/pages/TasksPage";
import ShopPage from "@/pages/ShopPage";
import TransactionsPage from "@/pages/TransactionsPage";
import ContentPage from "@/pages/ContentPage";
import SystemPage from "@/pages/SystemPage";
import FeedbackPage from "@/pages/FeedbackPage";
import CheckinPage from "@/pages/CheckinPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("admin-token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="checkin" element={<CheckinPage />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}
