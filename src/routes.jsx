// Guard Components
import RequireAuth from "./guard_components/RequireAuth";
import RequireNoAuth from "./guard_components/RequireNoAuth";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Pages
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import UserPage from "./pages/UserPage";

const routes = [
  // Public routes (Sign In, Sign Up)
  {
    element: (
      <RequireNoAuth>
        <AuthLayout />
      </RequireNoAuth>
    ),
    children: [
      { path: "sign_in", element: <SignInPage /> },
      { path: "sign_up", element: <SignUpPage /> },
    ],
  },

  // Protected routes (Main Application)
  {
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <HomePage /> },
      { path: "rooms/:roomId", element: <RoomPage /> },
      { path: "users/:userId", element: <UserPage /> },
    ],
  },
];

export default routes;
