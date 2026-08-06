import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Courses from "../pages/dashboard/Courses";
import Calendar from "../pages/dashboard/Calendar";
import LiveClasses from "../pages/dashboard/LiveClasses";
import Assignments from "../pages/dashboard/Assignments";
import Settings from "../pages/dashboard/Settings";

import CreateMeeting from "../pages/CreateMeeting";
import JoinMeeting from "../pages/JoinMeeting";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import MeetingRoom from "../pages/MeetingRoom";
import Pricing from "../pages/Pricing";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import { JitsiRoomProvider } from "../contexts/JitsiRoomContext";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "pricing",
        element: <Pricing />,
      },
      {
        path: "/create-meeting",
        element: <CreateMeeting />,
      },
      {
        path: "/join-meeting",
        element: <JoinMeeting />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <ProtectedRoute>
        <VerifyEmail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/meeting/:id",
    element: (
      <ProtectedRoute>
        <JitsiRoomProvider>
          <MeetingRoom />
        </JitsiRoomProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
