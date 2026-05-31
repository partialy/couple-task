/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./Auth/AuthPage";
import DashboardPage from "./Dashboard/DashboardPage";
import UserPage from "./User/UserPage";
import TaskPage from "./Task/TaskPage";
import ShopPage from "./Shop/ShopPage";
import RewardCodePage from "./RewardCode/RewardCodePage";
import CheckinPage from "./Checkin/CheckinPage";
import TransactionPage from "./Transaction/TransactionPage";
import ContentPage from "./Content/ContentPage";
import NotificationPage from "./Notification/NotificationPage";
import SettingsPage from "./Settings/SettingsPage";
import FeedbackPage from "./Feedback/FeedbackPage";
import Layout from "./common/Layout";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UserPage />} />
          <Route path="tasks" element={<TaskPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="reward-codes" element={<RewardCodePage />} />
          <Route path="checkin" element={<CheckinPage />} />
          <Route path="transactions" element={<TransactionPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="feedbacks" element={<FeedbackPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}
