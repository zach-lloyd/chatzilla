import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { MessengerContext } from './components/MessengerContext';
import RoomPage from './pages/RoomPage';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout'; 

// Pages
import SignInPage from './pages/SignInPage'; 
import SignUpPage from './pages/SignUpPage'; 
import HomePage from './pages/HomePage';     

// --- Guard Components ---
function RequireAuth({ children }) {
  const { isAuthenticated } = useContext(MessengerContext);
  console.log('RequireAuth Check:', isAuthenticated); 
  return isAuthenticated ? children : <Navigate to="/sign_in" replace />;
}

function RequireNoAuth({ children }) {
  const { isAuthenticated } = useContext(MessengerContext);
  console.log('RequireNoAuth Check:', isAuthenticated); 
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}
// ------------------------

const routes = [
  // --- Public routes (Sign In, Sign Up) ---
  {
    element: (
      <RequireNoAuth>
        <AuthLayout /> 
      </RequireNoAuth>
    ),
    children: [
      { path: 'sign_in', element: <SignInPage /> },
      { path: 'sign_up', element: <SignUpPage /> },
    ],
  },

  // --- Protected routes (Main Application) ---
  {
    element: (
      <RequireAuth>
        <MainLayout /> 
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <HomePage /> }, 
      { path: 'rooms/:roomId', element: <RoomPage /> },
    ],
  },
];

export default routes;